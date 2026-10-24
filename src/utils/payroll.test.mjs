import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateMonthlyGrossSalary,
  getMonthScheduledWorkdays,
  summarizePresence,
  buildPayslipDraft,
  getFloatNumberForOperator
} from './payroll.js';

const period = '2026-10';
const employee = { id: 9, name: 'Test', baseSalary: 500000, paymentMode: 'Virement' };

test('jours ouvrés du lundi au samedi', () => {
  assert.equal(getMonthScheduledWorkdays(period), 27);
});

test('résumé de présence à partir des jours cochés', () => {
  const summary = summarizePresence({
    dayStatus: { 1: 'P', 2: 'P', 3: 'A', 4: 'P', 5: 'P', 6: 'P', 7: 'A' }
  });
  assert.equal(summary.presentDays, 4);
  assert.equal(summary.absentDays, 2);
  assert.equal(summary.workdaysInMonth, 27);
});

test('salaire brut au prorata des jours travaillés', () => {
  assert.equal(calculateMonthlyGrossSalary({ baseSalary: 500000 }, { presentDays: 27 }, period), 500000);
  assert.equal(buildPayslipDraft(employee, { presentDays: 26, absentDays: 0 }, period).earnings.baseSalary, 481481);
});

test('présence saisie à 0 jour : brut à 0, pas de salaire complet', () => {
  const draft = buildPayslipDraft(employee, { presentDays: 0, absentDays: 27 }, period);
  assert.equal(draft.earnings.baseSalary, 0);
  assert.equal(draft.missingAttendance, false);
});

test('sans feuille de présence : salaire complet signalé', () => {
  const draft = buildPayslipDraft(employee, undefined, period);
  assert.equal(draft.earnings.baseSalary, 500000);
  assert.equal(draft.missingAttendance, true);
});

test('avance saisie avant la présence : salaire complet signalé, avance déduite', () => {
  const draft = buildPayslipDraft(employee, { advanceAmount: 40000, dayStatus: {}, presentDays: 0, absentDays: 0 }, period);
  assert.equal(draft.earnings.baseSalary, 500000);
  assert.equal(draft.missingAttendance, true);
  assert.equal(draft.deductions.advances, 40000);
});

test('date de paiement au format ISO', () => {
  assert.match(buildPayslipDraft(employee, undefined, period).paymentDate, /^\d{4}-\d{2}-\d{2}$/);
});

test('numéro float par opérateur', () => {
  const commercial = { floatNumberYas: '032 00 000 00', floatNumberOrange: '033 00 000 00' };
  assert.equal(getFloatNumberForOperator(commercial, 'YAS'), '032 00 000 00');
  assert.equal(getFloatNumberForOperator(commercial, 'ORANGE'), '033 00 000 00');

  const employeeWithMatricule = {
    matricule: 'POSTE-01',
    numero: 'POSTE-01',
    floatNumberYas: '03411111',
    floatNumberOrange: '03211111'
  };
  assert.equal(getFloatNumberForOperator(employeeWithMatricule, 'YAS'), '03411111');
  assert.equal(getFloatNumberForOperator(employeeWithMatricule, 'ORANGE'), '03211111');
  assert.equal(getFloatNumberForOperator({ matricule: 'POSTE-01', numero: 'POSTE-01' }, 'YAS'), '');
  assert.equal(getFloatNumberForOperator({ floatNumber: { YAS: '', ORANGE: '' } }, 'YAS'), '');
  assert.equal(getFloatNumberForOperator({ floatNumber: '034 22 222 22' }, 'ORANGE'), '034 22 222 22');
});
