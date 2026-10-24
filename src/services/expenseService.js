import { seed } from '../data/seed';
import { migrateExpenseRecords } from '../utils/migrations';

export const money = (value) => `${new Intl.NumberFormat('fr-FR').format(value)} Ar`;

const hasElectronBridge = () => typeof window !== 'undefined' && !!window.electronAPI;

export class ExpenseRepository {
  constructor(storage = undefined, key = 'gc-records') {
    this.storage = storage || (typeof localStorage !== 'undefined' ? localStorage : undefined);
    this.key = key;
  }

  // Une donnée illisible fait échouer le chargement (pas de repli sur le seed) :
  // le store suspend alors la sauvegarde pour ne pas écraser l'existant.
  async load() {
    if (hasElectronBridge()) {
      return migrateExpenseRecords(await window.electronAPI.getExpenses());
    }

    const saved = this.storage?.getItem(this.key);
    return saved ? migrateExpenseRecords(JSON.parse(saved)) : seed;
  }

  async save(records) {
    if (hasElectronBridge()) {
      await window.electronAPI.saveExpenses(records);
      return records;
    }

    this.storage?.setItem(this.key, JSON.stringify(records));
    return records;
  }
}

export const expenseRepository = new ExpenseRepository();

export const exportCsv = (rows, filename) => {
  const csvRows = [
    ['Date', 'Bénéficiaire', 'Type', 'Description', 'Montant', 'Statut'],
    ...rows.map((row) => [row.date, row.name, row.type, row.description, row.amount, row.status])
  ];

  const csv = csvRows
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(';'))
    .join('\n');

  const link = document.createElement('a');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
