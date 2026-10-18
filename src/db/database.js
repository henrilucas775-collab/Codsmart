import fs from 'node:fs';
import path from 'node:path';

const isElectron = typeof window !== 'undefined' && !!window.process && !!window.process.versions && !!window.process.versions.electron;

function getStoragePath() {
  if (isElectron) {
    return path.join(window.process.cwd(), 'gestion-charges-data.json');
  }

  return path.resolve(process.cwd(), 'gestion-charges-data.json');
}

function ensureStorage() {
  const storagePath = getStoragePath();
  if (!fs.existsSync(storagePath)) {
    fs.writeFileSync(storagePath, '{}', 'utf8');
  }
  return storagePath;
}

export function readLocalData() {
  try {
    const storagePath = ensureStorage();
    const raw = fs.readFileSync(storagePath, 'utf8');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function writeLocalData(records) {
  const storagePath = ensureStorage();
  fs.writeFileSync(storagePath, JSON.stringify(records || {}, null, 2), 'utf8');
  return records;
}

export default {
  readLocalData,
  writeLocalData
};
