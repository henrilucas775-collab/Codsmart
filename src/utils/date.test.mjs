import assert from 'node:assert/strict';
import test from 'node:test';
import { compareIsoDesc, formatDate, formatMonth, formatMonthShort, lastMonthKeys, monthKey, toIsoDate } from './date.js';
import { migrateExpenseRecords, migratePayrollData } from './migrations.js';

test('lecture des anciens formats de date', () => {
  assert.equal(toIsoDate('2026-10-12'), '2026-10-12');
  assert.equal(toIsoDate('12 oct. 2026'), '2026-10-12');
  assert.equal(toIsoDate('01 sept. 2026'), '2026-09-01');
  assert.equal(toIsoDate('5 févr. 2026'), '2026-02-05');
  assert.equal(toIsoDate('3 juin 2026'), '2026-06-03');
  assert.equal(toIsoDate('3 juil. 2026'), '2026-07-03');
  assert.equal(toIsoDate('15 août 2026'), '2026-08-15');
  assert.equal(toIsoDate('2 déc. 2026'), '2026-12-02');
  assert.equal(toIsoDate('12 octobre 2026'), '2026-10-12');
  assert.equal(toIsoDate('12/10/2026'), '2026-10-12');
});

test('dates illisibles ou impossibles', () => {
  assert.equal(toIsoDate(''), '');
  assert.equal(toIsoDate(undefined), '');
  assert.equal(toIsoDate('hier'), '');
  assert.equal(toIsoDate('31 févr. 2026'), '');
  assert.equal(toIsoDate('2026-13-01'), '');
});

test('affichage en français', () => {
  assert.equal(formatDate('2026-10-12'), '12 oct. 2026');
  assert.equal(formatDate('texte libre'), 'texte libre');
  assert.equal(formatMonth('2026-10'), 'Octobre 2026');
  assert.equal(formatMonthShort('2026-10'), 'Oct');
  assert.equal(monthKey('12 oct. 2026'), '2026-10');
});

test('12 derniers mois, du plus ancien au plus récent', () => {
  const keys = lastMonthKeys(12, new Date(2026, 1, 15));
  assert.equal(keys.length, 12);
  assert.equal(keys[0], '2025-03');
  assert.equal(keys[11], '2026-02');
});

test('tri du plus récent au plus ancien', () => {
  const sorted = ['2026-09-30', '12 oct. 2026', '', '2026-10-01'].sort(compareIsoDesc);
  assert.deepEqual(sorted, ['12 oct. 2026', '2026-10-01', '2026-09-30', '']);
});

test('migration des données enregistrées', () => {
  const records = migrateExpenseRecords({
    Forfait: [{ id: 1, date: '12 oct. 2026' }, { id: 2, date: 'date inconnue' }, { id: 3 }]
  });
  assert.deepEqual(records.Forfait, [{ id: 1, date: '2026-10-12' }, { id: 2, date: 'date inconnue' }, { id: 3 }]);

  const payroll = migratePayrollData({ employees: [], payslips: [{ id: 1, paymentDate: '31 oct. 2026' }] });
  assert.equal(payroll.payslips[0].paymentDate, '2026-10-31');
});
