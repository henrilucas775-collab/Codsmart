import assert from 'node:assert/strict';
import test from 'node:test';
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

const caisse = [{ page: 'Dépôt', type: 'Dépôt', amount: 500000, recordKind: 'deposit' }, ...forfaitRecords];

test('solde d’une catégorie : répartitions − charges', () => {
  const snapshot = getCategorySnapshot(forfaitRecords, 'Forfait');
  assert.equal(snapshot.deposits, 40000);
  assert.equal(snapshot.charges, 20000);
  assert.equal(snapshot.balance, 20000);
});

test('type de mouvement', () => {
  assert.equal(getMovementKind({ page: 'Forfait', type: 'Dépôt', amount: 1000 }), 'transfer');
  assert.equal(getMovementKind({ page: 'Dépôt', type: 'Dépôt', amount: 1000, recordKind: 'deposit' }), 'deposit');
});

test('un ajout de membre ne compte pas comme charge', () => {
  const memberRecord = { page: 'Forfait', type: 'Bénéficiaire', recordKind: 'beneficiary', amount: 0, status: 'Actif' };
  assert.equal(getCategorySnapshot([...forfaitRecords, memberRecord], 'Forfait').charges, 20000);
});

test('contrôle de solde sur une charge', () => {
  const safety = getChargeSafetyCheck(forfaitRecords, 'Forfait', 30000);
  assert.equal(safety.available, 20000);
  assert.equal(safety.isInsufficient, true);
});

test('solde caisse : dépôts − répartitions', () => {
  const global = getGlobalSnapshot(caisse);
  assert.equal(global.deposits, 500000);
  assert.equal(global.transfers, 40000);
  assert.equal(global.charges, 20000);
  assert.equal(global.balance, 460000);

  assert.equal(getTransferSafetyCheck(caisse, 500000).isInsufficient, true);
});

test('les opérations rejetées n’entrent dans aucun solde', () => {
  const rejected = [
    { page: 'Forfait', type: 'Forfait', amount: 10000, status: 'Rejeté' },
    { page: 'Forfait', type: 'Répartition', amount: 90000, recordKind: 'transfer', status: 'Rejeté' }
  ];
  const snapshot = getCategorySnapshot([...forfaitRecords, ...rejected], 'Forfait');
  assert.equal(snapshot.deposits, 40000);
  assert.equal(snapshot.charges, 20000);

  const global = getGlobalSnapshot([...caisse, ...rejected]);
  assert.equal(global.transfers, 40000);
  assert.equal(global.balance, 460000);
});

test('modifier une répartition ne compte pas son montant deux fois', () => {
  const records = [
    { id: 'd', page: 'Dépôt', type: 'Dépôt', amount: 500000, recordKind: 'deposit' },
    { id: 't', page: 'Forfait', type: 'Répartition', amount: 100000, recordKind: 'transfer' }
  ];
  assert.equal(getTransferSafetyCheck(records, 500000, 't').available, 500000);
  assert.equal(getTransferSafetyCheck(records, 500000, 't').isInsufficient, false);
  assert.equal(getTransferSafetyCheck(records, 550000, 't').isInsufficient, true);
});
