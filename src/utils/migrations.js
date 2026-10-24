import { toIsoDate } from './date.js';

// Les données enregistrées avant le passage en ISO contiennent des dates du type « 12 oct. 2026 ».
// Une date illisible est conservée telle quelle plutôt que perdue.
const migrateDate = (value) => toIsoDate(value) || value;

const migrateRecord = (record) => (record?.date ? { ...record, date: migrateDate(record.date) } : record);

export function migrateExpenseRecords(records) {
  if (Array.isArray(records)) {
    return records.map(migrateRecord);
  }
  if (!records || typeof records !== 'object') {
    return records;
  }
  return Object.fromEntries(
    Object.entries(records).map(([page, items]) => [page, Array.isArray(items) ? items.map(migrateRecord) : items])
  );
}

export function migratePayrollData(data) {
  if (!Array.isArray(data?.payslips)) {
    return data;
  }
  return {
    ...data,
    payslips: data.payslips.map((slip) =>
      slip?.paymentDate ? { ...slip, paymentDate: migrateDate(slip.paymentDate) } : slip
    )
  };
}
