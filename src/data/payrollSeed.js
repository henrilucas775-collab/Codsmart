export const payrollNav = [
  'Tableau de bord RH',
  'Employés',
  'Présence',
  'Avance',
  'Bulletins de paie',
  'Rapports RH'
];

export const defaultPeriod = '2026-10';
export const defaultPeriodLabel = 'Octobre 2026';

export const payrollSeed = {
  employer: {
    name: 'Entreprise Mada',
    address: '---',
    contact: ''
  },
  employees: [
    {
      id: 1,
      matricule: 'EMP-001',
      name: 'Ny Fanomezantsoa Mahasedra Herimpitso',
      function: 'Commercial',
      dependents: 0,
      paymentMode: 'Virement',
      baseSalary: 400_000,
      telephone: '',
      floatNumberYas: '032 00 000 00',
      floatNumberOrange: '033 00 000 00',
      floatNumber: { YAS: '032 00 000 00', ORANGE: '033 00 000 00' },
      status: 'Actif'
    },
    {
      id: 2,
      matricule: 'EMP-002',
      name: 'Rakoto Jean',
      function: 'Livreur',
      dependents: 1,
      paymentMode: 'Virement',
      baseSalary: 350_000,
      telephone: '034 12 345 67',
      status: 'Actif'
    }
  ],
  attendance: [
    {
      id: 101,
      employeeId: 1,
      period: defaultPeriod,
      presentDays: 22,
      absentDays: 0,
      overtimeHours: 10,
      overtimeAmount: 50_000,
      advanceAmount: 0,
      notes: ''
    },
    {
      id: 102,
      employeeId: 2,
      period: defaultPeriod,
      presentDays: 20,
      absentDays: 2,
      overtimeHours: 4,
      overtimeAmount: 15_000,
      advanceAmount: 30_000,
      notes: '2 absences justifiées'
    }
  ],
  payslips: [
    {
      id: 201,
      employeeId: 1,
      period: defaultPeriod,
      periodLabel: defaultPeriodLabel,
      paymentDate: '2026-10-31',
      paymentMode: 'Virement',
      dependents: 0,
      earnings: {
        baseSalary: 400_000,
        overtimeTaxable: 50_000,
        taxableBonuses: 0,
        taxableBenefits: 0,
        otherTaxable: 0,
        exemptReimbursements: 0
      },
      deductions: {
        advances: 0,
        other: 0,
        irsa: 6_600
      },
      status: 'Validé'
    }
  ]
};
