import React from 'react';
import { HandCoins } from 'lucide-react';
import { calculateMonthlyGrossSalary, hasPresenceData, money } from '../../utils/payroll';
import { formatMonth } from '../../utils/date';
import { defaultPeriodLabel } from '../../data/payrollSeed';

// Les avances sont rangées avec la feuille de présence du mois (advanceAmount) :
// le brouillon de bulletin les reprend ensuite en retenue.
export default function AdvancePage({ employees, attendance, period, setPeriod, onSave }) {
  const getRow = (employeeId) =>
    attendance.find((row) => row.employeeId === employeeId) || {
      employeeId,
      period,
      dayStatus: {},
      presentDays: 0,
      absentDays: 0,
      overtimeHours: 0,
      overtimeAmount: 0,
      advanceAmount: 0,
      notes: ''
    };

  const updateField = (employeeId, field, value) => {
    const current = getRow(employeeId);
    onSave({
      ...current,
      id: current.id ?? Date.now() + employeeId,
      period,
      [field]: value
    });
  };

  const rows = employees.map((employee) => {
    const row = getRow(employee.id);
    const hasPresence = hasPresenceData(row);
    // Même règle que le bulletin : sans présence saisie, on part du salaire de base complet
    const gross = hasPresence ? calculateMonthlyGrossSalary(employee, row, period) : Number(employee.baseSalary) || 0;
    const advance = Number(row.advanceAmount) || 0;
    return { employee, row, hasPresence, gross, advance, remaining: gross - advance };
  });
  const totals = rows.reduce(
    (sum, row) => ({
      gross: sum.gross + row.gross,
      advance: sum.advance + row.advance,
      remaining: sum.remaining + row.remaining
    }),
    { gross: 0, advance: 0, remaining: 0 }
  );
  const employeesWithAdvance = rows.filter((row) => row.advance > 0).length;

  return (
    <>
      <div className="module-title-row">
        <div>
          <div className="eyebrow">PAIE / AVANCES</div>
          <h1>
            <span className="title-icon">
              <HandCoins size={21} />
            </span>
            Suivi des avances
          </h1>
          <p>Saisie mensuelle : enregistre les avances accordées et leur impact sur le net à payer.</p>
        </div>
        <label className="filter-select-wrap">
          Période
          <input type="month" value={period} onChange={(event) => setPeriod(event.target.value)} />
        </label>
      </div>

      <div className="module-stats">
        <div className="mini-stat">
          <span>Mois</span>
          <b>{formatMonth(period) || defaultPeriodLabel}</b>
          <small>Période de paie</small>
        </div>
        <div className="mini-stat">
          <span>Total des avances</span>
          <b>{money(totals.advance)}</b>
          <small>Retenu sur les bulletins du mois</small>
        </div>
        <div className="mini-stat">
          <span>Employés avec avance</span>
          <b>
            {employeesWithAdvance} / {employees.length}
          </b>
          <small>Sur la période</small>
        </div>
      </div>

      <div className="panel table-panel">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>MATRICULE</th>
                <th>SAL. BRUT DU MOIS</th>
                <th>AVANCE (AR)</th>
                <th>MOTIF / NOTE</th>
                <th>RESTE APRÈS AVANCE</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ employee, row, hasPresence, gross, advance, remaining }) => (
                <tr key={employee.id}>
                  <td title={employee.name}>
                    <b>{employee.matricule}</b>
                  </td>
                  <td>
                    {money(gross)}
                    {!hasPresence && <small className="cell-note">Salaire de base : présence non saisie</small>}
                  </td>
                  <td>
                    <input
                      className="inline-input amount"
                      type="number"
                      min="0"
                      value={advance || ''}
                      placeholder="0"
                      aria-label={`Avance de ${employee.matricule}`}
                      onChange={(event) =>
                        updateField(employee.id, 'advanceAmount', Math.max(0, Number(event.target.value) || 0))
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="inline-input wide"
                      value={row.advanceNote || ''}
                      placeholder="Ex. avance sur salaire"
                      aria-label={`Motif de l’avance de ${employee.matricule}`}
                      onChange={(event) => updateField(employee.id, 'advanceNote', event.target.value)}
                    />
                  </td>
                  <td className={remaining < 0 ? 'amount-cell negative' : 'amount-cell'}>
                    {money(remaining)}
                    {remaining < 0 && <small className="cell-note">Avance supérieure au brut</small>}
                  </td>
                </tr>
              ))}
            </tbody>
            {rows.length > 0 && (
              <tfoot>
                <tr>
                  <td>TOTAL</td>
                  <td>{money(totals.gross)}</td>
                  <td>{money(totals.advance)}</td>
                  <td />
                  <td>{money(totals.remaining)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        {rows.length === 0 && <div className="empty">Aucun employé : ajoutez-en d’abord dans le menu Employés.</div>}
      </div>
    </>
  );
}
