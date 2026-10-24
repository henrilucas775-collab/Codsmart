import React from 'react';
import { computePayslip, money } from '../../utils/payroll';
import { formatDate } from '../../utils/date';

export default function PayslipSheet({ employer, employee, payslip, compact }) {
  const totals = computePayslip(payslip);
  const earnings = payslip.earnings || {};

  if (!employee) {
    return <div className="empty">Employé introuvable.</div>;
  }

  return (
    <div className={`payslip-sheet ${compact ? 'compact' : ''}`}>
      <div className="payslip-banner">
        <h3>BULLETIN DE PAIE</h3>
        <span>{payslip.periodLabel || payslip.period}</span>
      </div>

      <div className="payslip-grid two-col">
        <div>
          <h4>EMPLOYEUR</h4>
          <p><b>Raison sociale</b> {employer?.name || '—'}</p>
          <p><b>Adresse</b> {employer?.address || '—'}</p>
          <p><b>Contact</b> {employer?.contact || '—'}</p>
        </div>
        <div>
          <h4>SALARIÉ</h4>
          <p><b>Nom et prénom</b> {employee.name}</p>
          <p><b>Matricule</b> {employee.matricule || '—'}</p>
          <p><b>Fonction</b> {employee.function || '—'}</p>
        </div>
      </div>

      <div className="payslip-grid three-col payslip-meta">
        <p><b>Période</b> {payslip.periodLabel || payslip.period}</p>
        <p><b>Date de paiement</b> {formatDate(payslip.paymentDate) || '—'}</p>
        <p><b>Personnes à charge</b> {payslip.dependents ?? 0}</p>
        <p><b>Mode de paiement</b> {payslip.paymentMode || 'Virement'}</p>
      </div>

      <table className="payslip-table">
        <thead>
          <tr>
            <th>Éléments de rémunération</th>
            <th>Base / Qté</th>
            <th>Gains (Ar)</th>
            <th>Retenues (Ar)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Salaire de base</td>
            <td>{money(earnings.baseSalary)}</td>
            <td>{money(earnings.baseSalary)}</td>
            <td />
          </tr>
          <tr>
            <td>Heures supplémentaires taxables</td>
            <td>{money(earnings.overtimeTaxable)}</td>
            <td>{money(earnings.overtimeTaxable)}</td>
            <td />
          </tr>
          <tr>
            <td>Primes / indemnités taxables</td>
            <td>{money(earnings.taxableBonuses)}</td>
            <td>{money(earnings.taxableBonuses)}</td>
            <td />
          </tr>
          <tr>
            <td>Éléments exonérés</td>
            <td>{money(earnings.exemptReimbursements)}</td>
            <td>{money(earnings.exemptReimbursements)}</td>
            <td />
          </tr>
          <tr className="total-row">
            <td colSpan={2}>Salaire brut taxable</td>
            <td>{money(totals.grossTaxable)}</td>
            <td />
          </tr>
        </tbody>
      </table>

      <table className="payslip-table">
        <thead>
          <tr>
            <th>Retenues salariales</th>
            <th>Base (Ar)</th>
            <th>Taux</th>
            <th>Montant (Ar)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>CNaPS salarié</td>
            <td>{money(totals.grossTaxable)}</td>
            <td>1,00 %</td>
            <td>{money(totals.cnapsEmployee)}</td>
          </tr>
          <tr>
            <td>OSIE / santé salarié</td>
            <td>{money(totals.grossTaxable)}</td>
            <td>1,00 %</td>
            <td>{money(totals.osieEmployee)}</td>
          </tr>
          <tr>
            <td>Base imposable IRSA</td>
            <td colSpan={2}>{money(totals.irsaBase)}</td>
            <td />
          </tr>
          <tr>
            <td>IRSA</td>
            <td colSpan={2} />
            <td>{money(totals.irsa)}</td>
          </tr>
          <tr>
            <td>Avances / autres retenues</td>
            <td colSpan={2} />
            <td>{money(totals.advances + totals.otherDeductions)}</td>
          </tr>
          <tr className="total-row">
            <td>Total retenues</td>
            <td colSpan={2} />
            <td>{money(totals.totalDeductions)}</td>
          </tr>
        </tbody>
      </table>

      <div className="payslip-net">
        <span>Net à payer</span>
        <strong>{money(totals.netPay)}</strong>
      </div>

      {!compact && (
        <table className="payslip-table">
          <thead>
            <tr>
              <th>Charges employeur (informatif)</th>
              <th>Base (Ar)</th>
              <th>Taux</th>
              <th>Montant (Ar)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>CNaPS employeur</td>
              <td>{money(totals.grossTaxable)}</td>
              <td>13,00 %</td>
              <td>{money(totals.cnapsEmployer)}</td>
            </tr>
            <tr>
              <td>OSIE employeur</td>
              <td>{money(totals.grossTaxable)}</td>
              <td>5,00 %</td>
              <td>{money(totals.osieEmployer)}</td>
            </tr>
            <tr>
              <td>FMFP employeur</td>
              <td>{money(totals.grossTaxable)}</td>
              <td>1,00 %</td>
              <td>{money(totals.fmfpEmployer)}</td>
            </tr>
            <tr className="total-row">
              <td>Coût total employeur</td>
              <td colSpan={2} />
              <td>{money(totals.totalEmployerCost)}</td>
            </tr>
          </tbody>
        </table>
      )}

      {!compact && (
        <div className="payslip-signatures">
          <div className="signature-box">
            <h4>SIGNATURE DE L’EMPLOYEUR</h4>
            <p>{employer?.name || '—'}</p>
            <div className="signature-space"></div>
          </div>
          <div className="signature-box">
            <h4>SIGNATURE DE L’EMPLOYÉ(E)</h4>
            <p>{employee.name}</p>
            <div className="signature-space"></div>
          </div>
        </div>
      )}
    </div>
  );
}
