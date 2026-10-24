const fs = require('node:fs');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { app, dialog, shell } = require('electron');

const RECEIPTS_DIR = 'recus';
const SCAN_TIMEOUT_MS = 3 * 60 * 1000;
const MIME_TYPES = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp'
};
const NO_SCANNER_MESSAGE = 'Aucun scanner détecté. Vérifiez que l’imprimante est allumée et connectée.';

// Numérisation Windows : boîte de dialogue WIA du scanner, acquisition en BMP (format pris en charge par
// tous les pilotes) puis conversion en JPEG. Code de sortie 2 = numérisation annulée.
const WIA_SCRIPT = `
$ErrorActionPreference = 'Stop'
$bmp = '{B96B3CAB-0728-11D3-9D7B-0000F81EF32E}'
$jpeg = '{B96B3CAE-0728-11D3-9D7B-0000F81EF32E}'
try {
  $dialog = New-Object -ComObject WIA.CommonDialog
  $image = $dialog.ShowAcquireImage(1, 1, 131072, $bmp, $false, $true, $false)
  if ($null -eq $image) { exit 2 }
  $process = New-Object -ComObject WIA.ImageProcess
  $process.Filters.Add($process.FilterInfos.Item('Convert').FilterID)
  $process.Filters.Item(1).Properties.Item('FormatID').Value = $jpeg
  $process.Filters.Item(1).Properties.Item('Quality').Value = 90
  $process.Apply($image).SaveFile($env:RECEIPT_PATH)
} catch {
  [Console]::Error.Write($_.Exception.Message)
  exit 3
}
`;

const receiptsDir = () => {
  const dir = path.join(app.getPath('userData'), RECEIPTS_DIR);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
};

// Nom unique : un reçu n'écrase jamais un autre et le fichier d'origine reste intact
const newReceiptFile = (extension) => `recu-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${extension}`;

const describeReceipt = (file, name, source) => ({
  file,
  name,
  type: MIME_TYPES[path.extname(file).toLowerCase()],
  source,
  addedAt: new Date().toISOString()
});

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    execFile(command, args, { timeout: SCAN_TIMEOUT_MS, ...options }, (error, stdout, stderr) => {
      if (error) {
        error.stderr = String(stderr || '').trim();
        reject(error);
        return;
      }
      resolve(String(stdout || ''));
    });
  });
}

async function importReceipt(win) {
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    title: 'Importer le reçu du paiement',
    properties: ['openFile'],
    filters: [{ name: 'Reçu (image ou PDF)', extensions: ['pdf', 'png', 'jpg', 'jpeg', 'webp'] }]
  });
  if (canceled || filePaths.length === 0) {
    return null;
  }

  const source = filePaths[0];
  const extension = path.extname(source).toLowerCase();
  if (!MIME_TYPES[extension]) {
    throw new Error('Format non pris en charge : choisissez une image (PNG, JPG, WEBP) ou un PDF.');
  }
  const file = newReceiptFile(extension);
  fs.copyFileSync(source, path.join(receiptsDir(), file));
  return describeReceipt(file, path.basename(source), 'import');
}

async function scanOnWindows(target) {
  const encoded = Buffer.from(WIA_SCRIPT, 'utf16le').toString('base64');
  try {
    // Fenêtre console masquée par PowerShell lui-même : windowsHide masquerait aussi la boîte de dialogue WIA
    await run(
      'powershell.exe',
      ['-NoProfile', '-Sta', '-WindowStyle', 'Hidden', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', encoded],
      {
        env: { ...process.env, RECEIPT_PATH: target }
      }
    );
    return true;
  } catch (error) {
    if (error.code === 2) return false;
    if (/0x80210015/i.test(error.stderr)) throw new Error(NO_SCANNER_MESSAGE);
    throw new Error(`Numérisation impossible : ${error.stderr || error.message}`);
  }
}

async function scanOnLinux(target) {
  let devices;
  try {
    devices = await run('scanimage', ['-L']);
  } catch (error) {
    if (error.code === 'ENOENT') throw new Error('Logiciel de numérisation introuvable (SANE / scanimage).');
    throw new Error(`Numérisation impossible : ${error.stderr || error.message}`);
  }
  // Les webcams (v4l) sont aussi listées par SANE : seul un vrai scanner est retenu
  const device = devices
    .split('\n')
    .map((line) => line.match(/^device `([^']+)'/)?.[1])
    .find((name) => name && !name.startsWith('v4l:'));
  if (!device) throw new Error(NO_SCANNER_MESSAGE);

  try {
    await run('scanimage', ['-d', device, '--format=png', '-o', target]);
    return true;
  } catch (error) {
    throw new Error(`Numérisation impossible : ${error.stderr || error.message}`);
  }
}

async function scanReceipt() {
  const extension = process.platform === 'win32' ? '.jpg' : '.png';
  const file = newReceiptFile(extension);
  const target = path.join(receiptsDir(), file);

  let scanned;
  if (process.platform === 'win32') {
    scanned = await scanOnWindows(target);
  } else if (process.platform === 'linux') {
    scanned = await scanOnLinux(target);
  } else {
    throw new Error('La numérisation n’est pas disponible sur ce système : importez le reçu.');
  }
  if (!scanned || !fs.existsSync(target)) {
    return null;
  }
  return describeReceipt(file, `Reçu scanné du ${new Date().toLocaleDateString('fr-FR')}${extension}`, 'scan');
}

async function openReceipt(file) {
  // Seul le nom du fichier est retenu : impossible d'ouvrir un fichier hors du dossier des reçus
  const target = path.join(receiptsDir(), path.basename(String(file || '')));
  if (!fs.existsSync(target)) {
    throw new Error('Fichier du reçu introuvable.');
  }
  const error = await shell.openPath(target);
  if (error) {
    throw new Error(error);
  }
  return true;
}

// Les erreurs reviennent sous forme de message lisible plutôt que levées à travers l'IPC
const withResult =
  (task) =>
  async (...args) => {
    try {
      const value = await task(...args);
      return value ? { value } : { canceled: true };
    } catch (error) {
      return { error: error.message };
    }
  };

module.exports = {
  importReceipt: withResult(importReceipt),
  scanReceipt: withResult(scanReceipt),
  openReceipt: withResult(openReceipt)
};
