import { formatMonth, todayIso } from './date.js';

export const money = (value) => `${new Intl.NumberFormat('fr-FR').format(Math.round(Number(value) || 0))} Ar`;

export function getMonthDays(periodKey) {
  if (!periodKey || !/^\d{4}-\d{2}$/.test(periodKey)) {
    return 30;
  }
  const [year, month] = periodKey.split('-').map(Number);
  return new Date(year, month, 0).getDate();
}

export function getMonthScheduledWorkdays(periodKey) {
  if (!periodKey || !/^\d{4}-\d{2}$/.test(periodKey)) {
    return 0;
  }
  const [year, month] = periodKey.split('-').map(Number);
  let count = 0;
  const totalDays = new Date(year, month, 0).getDate();

  for (let day = 1; day <= totalDays; day += 1) {
    const date = new Date(year, month - 1, day);
    const weekday = date.getDay();
    if (weekday >= 1 && weekday <= 6) {
      count += 1;
    }
  }

  return count;
}

export function summarizePresence(row = {}) {
  const period = row.period || new Date().toISOString().slice(0, 7);
  const dayStatus = row.dayStatus && typeof row.dayStatus === 'object' ? row.dayStatus : {};
  const numericPresent = Number(row.presentDays) || 0;
  const numericAbsent = Number(row.absentDays) || 0;

  if (Object.keys(dayStatus).length > 0) {
    let presentDays = 0;
    let absentDays = 0;

    Object.entries(dayStatus).forEach(([dayKey, status]) => {
      const day = Number(dayKey);
      if (!Number.isFinite(day)) {
        return;
      }

      if (!/^\d{4}-\d{2}$/.test(period)) {
        if (status === 'P') presentDays += 1;
        if (status === 'A') absentDays += 1;
        return;
      }

      const [year, month] = period.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      const weekday = date.getDay();
      const isScheduledWorkday = weekday >= 1 && weekday <= 6;

      if (!isScheduledWorkday) {
        return;
      }

      if (status === 'P') presentDays += 1;
      if (status === 'A') absentDays += 1;
    });

    return {
      presentDays,
      absentDays,
      workdaysInMonth: getMonthScheduledWorkdays(period)
    };
  }

  return {
    presentDays: numericPresent,
    absentDays: numericAbsent,
    workdaysInMonth: getMonthScheduledWorkdays(period)
  };
}

export function calculateMonthlyGrossSalary(employee = {}, attendance = {}, period = '') {
  const baseSalary = Number(employee.baseSalary) || 0;
  const summary = summarizePresence({ ...attendance, period });
  const scheduledWorkdays = summary.workdaysInMonth || getMonthScheduledWorkdays(period) || 1;
  const workedDays = summary.presentDays || 0;

  if (!baseSalary) {
    return 0;
  }

  return Math.round(baseSalary * (workedDays / scheduledWorkdays));
}

export function computePayslip(payslip = {}) {
  const earnings = payslip.earnings || {};
  const baseSalary = Number(earnings.baseSalary) || 0;
  const overtimeTaxable = Number(earnings.overtimeTaxable) || 0;
  const taxableBonuses = Number(earnings.taxableBonuses) || 0;
  const taxableBenefits = Number(earnings.taxableBenefits) || 0;
  const otherTaxable = Number(earnings.otherTaxable) || 0;
  const exemptReimbursements = Number(earnings.exemptReimbursements) || 0;

  const grossTaxable = baseSalary + overtimeTaxable + taxableBonuses + taxableBenefits + otherTaxable;
  const totalGross = grossTaxable + exemptReimbursements;

  const cnapsEmployee = Math.round(grossTaxable * 0.01);
  const osieEmployee = Math.round(grossTaxable * 0.01);
  const irsaBase = grossTaxable - cnapsEmployee - osieEmployee;
  const irsa = Number(payslip.deductions?.irsa) || 0;
  const advances = Number(payslip.deductions?.advances) || 0;
  const otherDeductions = Number(payslip.deductions?.other) || 0;
  const totalDeductions = cnapsEmployee + osieEmployee + irsa + advances + otherDeductions;
  const netPay = grossTaxable + exemptReimbursements - totalDeductions;

  const cnapsEmployer = Math.round(grossTaxable * 0.13);
  const osieEmployer = Math.round(grossTaxable * 0.05);
  const fmfpEmployer = Math.round(grossTaxable * 0.01);
  const totalEmployerCharges = cnapsEmployer + osieEmployer + fmfpEmployer;
  const totalEmployerCost = grossTaxable + exemptReimbursements + totalEmployerCharges;

  return {
    grossTaxable,
    totalGross,
    cnapsEmployee,
    osieEmployee,
    irsaBase,
    irsa,
    advances,
    otherDeductions,
    totalDeductions,
    netPay,
    cnapsEmployer,
    osieEmployer,
    fmfpEmployer,
    totalEmployerCharges,
    totalEmployerCost
  };
}

export function getFloatNumberForOperator(employee = {}, operator = 'YAS') {
  const normalizedOperator = String(operator || 'YAS').trim().toUpperCase();
  // floatNumber peut aussi être l'objet { YAS, ORANGE } : seul un numéro texte sert de valeur commune
  const genericFloat = typeof employee.floatNumber === 'string' ? employee.floatNumber : '';
  const values = {
    YAS: employee.floatNumberYas || employee.floatNumber?.YAS || genericFloat || '',
    ORANGE: employee.floatNumberOrange || employee.floatNumber?.ORANGE || genericFloat || ''
  };

  return normalizedOperator === 'ORANGE' ? (values.ORANGE || '') : (values.YAS || '');
}

// Une ligne ne contenant qu'une avance (saisie avant la présence) ne compte pas comme feuille de présence
export function hasPresenceData(attendance) {
  if (!attendance) {
    return false;
  }
  const dayStatus = attendance.dayStatus && typeof attendance.dayStatus === 'object' ? attendance.dayStatus : {};
  return Object.keys(dayStatus).length > 0 || Number(attendance.presentDays) > 0 || Number(attendance.absentDays) > 0;
}

export function buildPayslipDraft(employee, attendance, period) {
  const periodLabel = formatMonth(period);
  const advanceAmount = Number(attendance?.advanceAmount ?? attendance?.advance ?? 0) || 0;
  const grossSalary = calculateMonthlyGrossSalary(employee, attendance, period);
  const hasPresence = hasPresenceData(attendance);

  return {
    employeeId: employee.id,
    period,
    periodLabel,
    paymentDate: todayIso(),
    paymentMode: employee.paymentMode || 'Virement',
    dependents: employee.dependents || 0,
    // Sans feuille de présence, on part du salaire complet et le bulletin le signale.
    // Avec une feuille de présence, le brut calculé fait foi, même s'il vaut 0.
    missingAttendance: !hasPresence,
    earnings: {
      baseSalary: hasPresence ? grossSalary : Number(employee.baseSalary) || 0,
      overtimeTaxable: Number(attendance?.overtimeAmount) || 0,
      taxableBonuses: 0,
      taxableBenefits: 0,
      otherTaxable: 0,
      exemptReimbursements: 0
    },
    deductions: {
      advances: advanceAmount,
      other: 0,
      irsa: 0
    },
    status: 'Brouillon'
  };
}
