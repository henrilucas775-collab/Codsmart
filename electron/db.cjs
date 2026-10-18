const fs = require('node:fs');
const path = require('node:path');
const { app } = require('electron');

function getStorageFile() {
  return path.join(app.getPath('userData'), 'gestion-charges-data.json');
}

function readData() {
  const file = getStorageFile();

  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, '{}', 'utf8');
    return {};
  }

  try {
    const raw = fs.readFileSync(file, 'utf8');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeData(records) {
  const file = getStorageFile();
  fs.writeFileSync(file, JSON.stringify(records || {}, null, 2), 'utf8');
  return records;
}

function getExpenses() {
  return readData();
}

function saveExpenses(records) {
  return writeData(records);
}

module.exports = {
  getExpenses,
  saveExpenses
};
