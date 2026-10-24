import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import PayslipSheet from './PayslipSheet';
import { toIsoDate } from '../../utils/date';

export default function PayslipModal({ initial, employer, employee, onClose, onSave }) {
  const [form, setForm] = useState({
    ...initial,
    earnings: { ...initial?.earnings },
    deductions: { ...initial?.deductions }
  });

  const change = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const changeNested = (section, field, value) => {
    setForm((previous) => ({
      ...previous,
      [section]: { ...previous[section], [field]: Number(value) || 0 }
    }));
  };

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="modal modal-wide">
        <div className="modal-head">
          <div>
            <span className="eyebrow">BULLETIN DE PAIE</span>
            <h2>{employee?.name || 'Salarié'}</h2>
            {form.missingAttendance && (
              <p className="modal-hint" role="alert">
                Aucune présence saisie pour {form.periodLabel || form.period} : le salaire de base complet est appliqué.
                Vérifiez-le avant d’enregistrer.
              </p>
            )}
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
            <X size={19} />
          </button>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSave(form);
          }}
        >
          <div className="form-row">
            <label>
              Date de paiement
              <input type="date" name="paymentDate" value={toIsoDate(form.paymentDate)} onChange={change} />
            </label>
            <label>
              Salaire de base (Ar)
              <input
                type="number"
                min="0"
                value={form.earnings?.baseSalary ?? 0}
                onChange={(event) => changeNested('earnings', 'baseSalary', event.target.value)}
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Heures sup. taxables (Ar)
              <input
                type="number"
                min="0"
                value={form.earnings?.overtimeTaxable ?? 0}
                onChange={(event) => changeNested('earnings', 'overtimeTaxable', event.target.value)}
              />
            </label>
            <label>
              Primes taxables (Ar)
              <input
                type="number"
                min="0"
                value={form.earnings?.taxableBonuses ?? 0}
                onChange={(event) => changeNested('earnings', 'taxableBonuses', event.target.value)}
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              IRSA (Ar)
              <input
                type="number"
                min="0"
                value={form.deductions?.irsa ?? 0}
                onChange={(event) => changeNested('deductions', 'irsa', event.target.value)}
              />
            </label>
            <label>
              Avances retenues (Ar)
              <input
                type="number"
                min="0"
                value={form.deductions?.advances ?? 0}
                onChange={(event) => changeNested('deductions', 'advances', event.target.value)}
              />
            </label>
          </div>

          <PayslipSheet employer={employer} employee={employee} payslip={form} compact />

          <div className="modal-foot">
            <button type="button" className="outline-btn" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="primary-btn">
              <Check size={16} />
              Enregistrer le bulletin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
