import React from 'react';
import { CalendarCheck } from 'lucide-react';
import {
  calculateMonthlyGrossSalary,
  getMonthDays,
  money,
  summarizePresence
} from '../../utils/payroll';
import { formatMonth } from '../../utils/date';
import { defaultPeriodLabel } from '../../data/payrollSeed';

export default function AttendancePage({ employees, attendance, period, setPeriod, onSave }) {
  const monthDays = Array.from({ length: getMonthDays(period) }, (_, index) => index + 1);

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

  const updateDayStatus = (employeeId, day, status) => {
    const current = getRow(employeeId);
    const nextStatus = { ...(current.dayStatus || {}) };

    if (status === 'P' || status === 'A') {
      nextStatus[String(day)] = status;
    } else {
      delete nextStatus[String(day)];
    }

    const nextRow = {
      ...current,
      id: current.id ?? Date.now() + employeeId,
      period,
      dayStatus: nextStatus,
      notes: current.notes || ''
    };
    const summary = summarizePresence(nextRow);

    onSave({
      ...nextRow,
      presentDays: summary.presentDays,
      absentDays: summary.absentDays
    });
  };

  return (
    <>
      <div className="module-title-row">
        <div>
          <div className="eyebrow">PAIE / PRÉSENCE</div>
          <h1>
            <span className="title-icon">
              <CalendarCheck size={21} />
            </span>
            Feuille de présence
          </h1>
          <p>
            Saisie mensuelle — sélectionnez P ou A pour chaque jour travaillé et le salaire brut est recalculé
            automatiquement.
          </p>
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
          <span>Employés</span>
          <b>{employees.length}</b>
          <small>À renseigner</small>
        </div>
      </div>

      <div className="panel table-panel">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>MATRICULE</th>
                {monthDays.map((day) => (
                  <th key={day}>{day}</th>
                ))}
                <th>PRÉSENT</th>
                <th>ABSENT</th>
                <th>SAL. BRUT</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => {
                const row = getRow(employee.id);
                const summary = summarizePresence({ ...row, period });
                const monthlyGross = calculateMonthlyGrossSalary(employee, row, period);

                return (
                  <tr key={employee.id}>
                    <td title={employee.name}>
                      <b>{employee.matricule}</b>
                    </td>
                    {monthDays.map((day) => {
                      const status = row.dayStatus?.[String(day)] || '';
                      // Date locale (et non `new Date('YYYY-MM-01')`, lue en UTC) comme dans summarizePresence
                      const [year, month] = period.split('-').map(Number);
                      const weekday = new Date(year, month - 1, day).getDay();
                      const isWorkday = weekday >= 1 && weekday <= 6;

                      return (
                        <td key={`${employee.id}-${day}`}>
                          <div style={{ display: 'flex', gap: 4, justifyContent: 'center', whiteSpace: 'nowrap' }}>
                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11, opacity: isWorkday ? 1 : 0.45 }}>
                              <input
                                type="checkbox"
                                checked={status === 'P'}
                                disabled={!isWorkday}
                                onChange={() => updateDayStatus(employee.id, day, 'P')}
                              />
                              P
                            </label>
                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11, opacity: isWorkday ? 1 : 0.45 }}>
                              <input
                                type="checkbox"
                                checked={status === 'A'}
                                disabled={!isWorkday}
                                onChange={() => updateDayStatus(employee.id, day, 'A')}
                              />
                              A
                            </label>
                          </div>
                        </td>
                      );
                    })}
                    <td>{summary.presentDays}</td>
                    <td>{summary.absentDays}</td>
                    <td>{money(monthlyGross)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
