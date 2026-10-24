import React from 'react';
import { ChartNoAxesCombined } from 'lucide-react';
import { computePayslip, money } from '../../utils/payroll';
import { formatMonth } from '../../utils/date';

export default function PayrollReports({ employees, payslips, period, attendance }) {
  const rows = payslips.map((slip) => ({
    slip,
    employee: employees.find((item) => item.id === slip.employeeId),
    totals: computePayslip(slip)
  }));

  const massNet = rows.reduce((sum, row) => sum + row.totals.netPay, 0);
  const massEmployer = rows.reduce((sum, row) => sum + row.totals.totalEmployerCost, 0);
  const absences = attendance.reduce((sum, row) => sum + (row.absentDays || 0), 0);

  return (
    <>
      <div className="module-title-row">
        <div>
          <div className="eyebrow">PAIE / ANALYSE</div>
          <h1>
            <span className="title-icon">
              <ChartNoAxesCombined size={21} />
            </span>
            Rapports RH
          </h1>
          <p>Synthèse de la période {formatMonth(period)}.</p>
        </div>
      </div>

      <div className="module-stats">
        <div className="mini-stat">
          <span>Masse nette</span>
          <b>{money(massNet)}</b>
        </div>
        <div className="mini-stat">
          <span>Coût employeur</span>
          <b>{money(massEmployer)}</b>
        </div>
        <div className="mini-stat">
          <span>Absences totales</span>
          <b>{absences}</b>
        </div>
      </div>

      <div className="panel table-panel">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>EMPLOYÉ</th>
                <th>BRUT</th>
                <th>RETENUES</th>
                <th>NET</th>
                <th>COÛT EMPLOYEUR</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ employee, totals, slip }) => (
                <tr key={slip.id}>
                  <td>{employee?.name || '—'}</td>
                  <td>{money(totals.grossTaxable)}</td>
                  <td>{money(totals.totalDeductions)}</td>
                  <td>{money(totals.netPay)}</td>
                  <td>{money(totals.totalEmployerCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
