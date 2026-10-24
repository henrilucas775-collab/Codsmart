const fs = require('node:fs');
const path = require('node:path');
const { app } = require('electron');

const EXPENSES_FILE = 'gestion-charges-data.json';
const PAYROLL_FILE = 'gestion-paie-data.json';

const dataPath = (name) => path.join(app.getPath('userData'), name);

function readJson(name) {
  const file = dataPath(name);
  if (!fs.existsSync(file)) {
    return {};
  }

  const raw = fs.readFileSync(file, 'utf8');
  if (!raw.trim()) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    // Fichier illisible : on en garde une copie et on remonte l'erreur pour que l'interface
    // suspende la sauvegarde automatique au lieu d'écraser les données.
    fs.copyFileSync(file, `${file}.corrupt-${Date.now()}`);
    throw error;
  }
}

function writeJson(name, data) {
  const file = dataPath(name);
  const tmp = `${file}.tmp`;
  // Écriture dans un fichier temporaire puis renommage : une coupure ne laisse jamais un fichier tronqué.
  fs.writeFileSync(tmp, JSON.stringify(data || {}, null, 2), 'utf8');
  fs.renameSync(tmp, file);
}

module.exports = {
  getExpenses: () => readJson(EXPENSES_FILE),
  saveExpenses: (records) => writeJson(EXPENSES_FILE, records),
  getPayroll: () => readJson(PAYROLL_FILE),
  savePayroll: (data) => writeJson(PAYROLL_FILE, data)
};
