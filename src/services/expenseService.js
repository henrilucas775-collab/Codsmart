import { seed } from '../data/seed';

export const money = (value) => `${new Intl.NumberFormat('fr-FR').format(value)} Ar`;

const hasElectronBridge = () => typeof window !== 'undefined' && !!window.electronAPI;

export class ExpenseRepository {
  constructor(storage = undefined, key = 'gc-records') {
    this.storage = storage || (typeof localStorage !== 'undefined' ? localStorage : undefined);
    this.key = key;
  }

  async load() {
    if (hasElectronBridge()) {
      return await window.electronAPI.getExpenses();
    }

    try {
      const saved = this.storage?.getItem(this.key);
      return saved ? JSON.parse(saved) : seed;
    } catch {
      return seed;
    }
  }

  async save(records) {
    if (hasElectronBridge()) {
      await window.electronAPI.saveExpenses(records);
      return records;
    }

    this.storage?.setItem(this.key, JSON.stringify(records));
    return records;
  }

  async update(records) {
    return this.save(records);
  }
}

export const expenseRepository = new ExpenseRepository();

export const loadRecords = () => expenseRepository.load();

export const saveRecords = (records) => expenseRepository.save(records);

export const exportCsv = (rows, filename) => {
  const csvRows = [
    ['Date', 'Bénéficiaire', 'Type', 'Description', 'Montant', 'Statut'],
    ...rows.map((row) => [row.date, row.name, row.type, row.description, row.amount, row.status])
  ];

  const csv = csvRows
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(';'))
    .join('\n');

  const link = document.createElement('a');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
