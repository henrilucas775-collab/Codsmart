import React, { useState } from 'react';
import { Eye, FileText, Plus, Printer, Trash2 } from 'lucide-react';
import PayslipSheet from './PayslipSheet';
import { computePayslip, money } from '../../utils/payroll';
import { formatMonth } from '../../utils/date';

export default function PayslipsPage({
  employer,
  employees,
  payslips,
  period,
  setPeriod,
  onCreate,
  onEdit,
  onDelete
}) {
  const [preview, setPreview] = useState(null);

  const resolveEmployee = (id) => employees.find((item) => item.id === id);

  return (
    <>
      <div className="module-title-row">
        <div>
          <div className="eyebrow">PAIE / BULLETINS</div>
          <h1>
            <span className="title-icon">
              <FileText size={21} />
            </span>
            Bulletins de paie
          </h1>
          <p>Fiches calquées sur votre modèle — CNaPS, OSIE, IRSA, net à payer.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input type="month" value={period} onChange={(event) => setPeriod(event.target.value)} />
          <button className="primary-btn" onClick={() => onCreate(employees[0]?.id)}>
            <Plus size={17} />
            Nouveau bulletin
          </button>
        </div>
      </div>

      <div className="panel table-panel">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>EMPLOYÉ</th>
                <th>PÉRIODE</th>
                <th>BRUT TAXABLE</th>
                <th>NET À PAYER</th>
                <th>STATUT</th>
                <th className="actions-head">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {payslips.map((slip) => {
                const employee = resolveEmployee(slip.employeeId);
                const totals = computePayslip(slip);
                return (
                  <tr key={slip.id}>
                    <td><b>{employee?.name || '—'}</b></td>
                    <td>{slip.periodLabel || formatMonth(slip.period)}</td>
                    <td>{money(totals.grossTaxable)}</td>
                    <td>{money(totals.netPay)}</td>
                    <td>{slip.status || 'Brouillon'}</td>
                    <td>
                      <div className="row-actions">
                        <button type="button" title="Voir" onClick={() => setPreview(slip)}>
                          <Eye size={15} />
                        </button>
                        <button type="button" title="Modifier" onClick={() => onEdit(slip)}>
                          <FileText size={15} />
                        </button>
                        <button type="button" title="Supprimer" onClick={() => onDelete(slip.id)}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {payslips.length === 0 && <div className="empty">Aucun bulletin pour cette période.</div>}
      </div>

      {employees.length > 1 && (
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h3>Générer un bulletin</h3>
              <p>Choisissez le matricule : création à partir du salaire de base et de la présence du mois</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingBottom: 12 }}>
            {employees.map((employee) => (
              <button
                key={employee.id}
                type="button"
                className="outline-btn"
                title={employee.name}
                onClick={() => onCreate(employee.id)}
              >
                {employee.matricule || employee.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {preview && (
        <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setPreview(null)}>
          <div className="modal modal-wide payslip-preview">
            <div className="modal-head">
              <div>
                <span className="eyebrow">APERÇU</span>
                <h2>Bulletin de paie</h2>
              </div>
              <div className="modal-actions">
                <button type="button" className="outline-btn" onClick={() => window.print()}>
                  <Printer size={15} />
                  Imprimer
                </button>
                <button type="button" className="outline-btn" onClick={() => setPreview(null)}>
                  Fermer
                </button>
              </div>
            </div>
            <PayslipSheet employer={employer} employee={resolveEmployee(preview.employeeId)} payslip={preview} />
          </div>
        </div>
      )}
    </>
  );
}
