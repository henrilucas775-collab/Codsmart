export const CAISSE_PAGE = 'Dépôt';

export const ALLOCATION_PAGES = [
  'Forfait',
  'Carburant',
  'Avance',
  'Frais d’expédition',
  'Bonus',
  'Autre'
];

export function flattenRecords(records) {
  if (Array.isArray(records)) {
    return records;
  }
  if (records && typeof records === 'object') {
    return Object.entries(records).flatMap(([bucket, items]) =>
      (items || []).map((item) => ({
        ...item,
        page: getRecordPage(item) || bucket
      }))
    );
  }
  return [];
}

export function getRecordPage(record = {}) {
  return record.page || record.category || null;
}

export function getMovementKind(record = {}) {
  if (record.recordKind === 'transfer' || record.type === 'Répartition') {
    return 'transfer';
  }

  if (record.recordKind === 'beneficiary' || record.type === 'Bénéficiaire') {
    return 'beneficiary';
  }

  if (record.recordKind === 'charge') {
    return 'charge';
  }

  if (record.recordKind === 'deposit' || record.name === 'Solde initial') {
    return 'deposit';
  }

  const page = getRecordPage(record);

  if (record.type === 'Dépôt' && page && ALLOCATION_PAGES.includes(page)) {
    return 'transfer';
  }

  if (record.type === 'Dépôt' && page === CAISSE_PAGE) {
    return 'deposit';
  }

  if (record.type === 'Dépôt' && !page) {
    const description = (record.description || '').toLowerCase();
    if (description.includes('répartition') || description.includes('repartition') || description.includes('versement pour')) {
      return 'transfer';
    }
    return 'deposit';
  }

  return 'charge';
}

export function getCategorySnapshot(records = [], page = null) {
  const items = Array.isArray(records) ? records : [];
  const effectivePage = page || null;

  const hasPageMeta = items.some((record) => getRecordPage(record));
  const entries =
    effectivePage && hasPageMeta
      ? items.filter((record) => getRecordPage(record) === effectivePage)
      : items;

  const inflows =
    effectivePage === CAISSE_PAGE
      ? entries.filter((record) => getMovementKind(record) === 'deposit')
      : entries.filter((record) => getMovementKind(record) === 'transfer');

  const charges = entries.filter((record) => getMovementKind(record) === 'charge');

  const inflowsTotal = inflows.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const chargesTotal = charges.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return {
    page: effectivePage,
    deposits: inflowsTotal,
    charges: chargesTotal,
    balance: Math.max(0, inflowsTotal - chargesTotal)
  };
}

/** Solde caisse : dépôts menu Dépôt − répartitions vers les modules (les charges ne réduisent pas la caisse). */
export function getGlobalSnapshot(records = []) {
  const items = flattenRecords(records);
  const deposits = items.filter((record) => getMovementKind(record) === 'deposit');
  const transfers = items.filter((record) => getMovementKind(record) === 'transfer');
  const charges = items.filter((record) => getMovementKind(record) === 'charge');

  const depositsTotal = deposits.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const transfersTotal = transfers.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const chargesTotal = charges.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return {
    deposits: depositsTotal,
    transfers: transfersTotal,
    charges: chargesTotal,
    balance: Math.max(0, depositsTotal - transfersTotal)
  };
}

export function getChargeSafetyCheck(records = [], page = null, amount = 0, excludedId = null) {
  const requested = Number(amount) || 0;
  const safeRecords = Array.isArray(records)
    ? records.filter((record) => record.id !== excludedId)
    : [];

  const snapshot = getCategorySnapshot(safeRecords, page);
  const available = Math.max(0, snapshot.balance);
  const isInsufficient = requested > 0 && requested > available;

  return {
    available,
    requested,
    isInsufficient,
    remaining: Math.max(0, available - requested),
    message: isInsufficient
      ? `Solde insuffisant : ${new Intl.NumberFormat('fr-FR').format(available)} Ar disponibles pour ${page || 'cette catégorie'}, alors que vous essayez d’enregistrer ${new Intl.NumberFormat('fr-FR').format(requested)} Ar.`
      : ''
  };
}

export function getTransferSafetyCheck(records = [], amount = 0, excludedId = null) {
  const requested = Number(amount) || 0;
  const items = flattenRecords(records).filter((record) => record.id !== excludedId);
  const snapshot = getGlobalSnapshot(items);
  let available = Math.max(0, snapshot.balance);

  if (excludedId != null) {
    const original = flattenRecords(records).find((record) => record.id === excludedId);
    if (original && getMovementKind(original) === 'transfer') {
      available += Number(original.amount || 0);
    }
  }

  const isInsufficient = requested > 0 && requested > available;

  return {
    available,
    requested,
    isInsufficient,
    remaining: Math.max(0, available - requested),
    message: isInsufficient
      ? `Solde caisse insuffisant : ${new Intl.NumberFormat('fr-FR').format(available)} Ar disponibles à répartir, alors que vous essayez d’allouer ${new Intl.NumberFormat('fr-FR').format(requested)} Ar.`
      : ''
  };
}
