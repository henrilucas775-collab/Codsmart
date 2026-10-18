import assert from 'node:assert/strict';
import {
  getCategorySnapshot,
  getChargeSafetyCheck,
  getGlobalSnapshot,
  getMovementKind,
  getTransferSafetyCheck
} from './finance.js';

const forfaitRecords = [
  { page: 'Forfait', type: 'Répartition', amount: 40000, description: 'Dépôt forfait', recordKind: 'transfer', status: 'Validé' },
  { page: 'Forfait', type: 'Forfait', amount: 15000, description: 'Recharge', status: 'Validé' },
  { page: 'Forfait', type: 'Forfait', amount: 5000, description: 'Autre charge', status: 'Validé' }
];

const snapshot = getCategorySnapshot(forfaitRecords, 'Forfait');
assert.equal(snapshot.deposits, 40000);
assert.equal(snapshot.charges, 20000);
assert.equal(snapshot.balance, 20000);

assert.equal(getMovementKind({ page: 'Forfait', type: 'Dépôt', amount: 1000 }), 'transfer');
assert.equal(getMovementKind({ page: 'Dépôt', type: 'Dépôt', amount: 1000, recordKind: 'deposit' }), 'deposit');

const memberRecord = { page: 'Forfait', type: 'Bénéficiaire', recordKind: 'beneficiary', amount: 0, status: 'Actif' };
assert.equal(getCategorySnapshot([...forfaitRecords, memberRecord], 'Forfait').charges, 20000);

const safety = getChargeSafetyCheck(forfaitRecords, 'Forfait', 30000);
assert.equal(safety.available, 20000);
assert.equal(safety.isInsufficient, true);

const caisse = [
  { page: 'Dépôt', type: 'Dépôt', amount: 500000, recordKind: 'deposit' },
  ...forfaitRecords
];

const global = getGlobalSnapshot(caisse);
assert.equal(global.deposits, 500000);
assert.equal(global.transfers, 40000);
assert.equal(global.charges, 20000);
assert.equal(global.balance, 460000);

const transferSafety = getTransferSafetyCheck(caisse, 500000);
assert.equal(transferSafety.isInsufficient, true);

console.log('finance snapshot test: ok');
