import React, { useState } from 'react';
import { Check, X } from 'lucide-react';

export default function EmployeeModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState({
    matricule: initial?.matricule || '',
    name: initial?.name || '',
    function: initial?.function || '',
    dependents: initial?.dependents ?? 0,
    paymentMode: initial?.paymentMode || 'Virement',
    baseSalary: initial?.baseSalary ?? '',
    telephone: initial?.telephone || '',
    floatNumberYas: initial?.floatNumberYas || initial?.floatNumber?.YAS || initial?.numero || '',
    floatNumberOrange: initial?.floatNumberOrange || initial?.floatNumber?.ORANGE || initial?.numero || '',
    status: initial?.status || 'Actif'
  });

  const change = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div>
            <span className="eyebrow">{initial?.id ? 'MODIFICATION' : 'NOUVEL EMPLOYÉ'}</span>
            <h2>{initial?.id ? 'Modifier l’employé' : 'Ajouter un employé'}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
            <X size={19} />
          </button>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSave({
              ...initial,
              ...form,
              dependents: Number(form.dependents) || 0,
              baseSalary: Number(form.baseSalary) || 0,
              numero: form.floatNumberYas || form.floatNumberOrange || '',
              floatNumber: {
                YAS: form.floatNumberYas || '',
                ORANGE: form.floatNumberOrange || ''
              },
              floatNumberYas: form.floatNumberYas || '',
              floatNumberOrange: form.floatNumberOrange || ''
            });
          }}
        >
          <div className="form-row">
            <label>
              Matricule
              <input name="matricule" value={form.matricule} onChange={change} required />
            </label>
            <label>
              Nom et prénom
              <input name="name" value={form.name} onChange={change} required />
            </label>
          </div>
          <div className="form-row">
            <label>
              Fonction
              <input name="function" value={form.function} onChange={change} required />
            </label>
            <label>
              Tél.
              <input name="telephone" value={form.telephone} onChange={change} inputMode="tel" />
            </label>
          </div>
          <div className="form-row">
            <label>
              Salaire de base (Ar)
              <input type="number" min="0" name="baseSalary" value={form.baseSalary} onChange={change} required />
            </label>
            <label>
              Personnes à charge
              <input type="number" min="0" name="dependents" value={form.dependents} onChange={change} />
            </label>
          </div>
          <div className="form-row">
            <label>
              Mode de paiement
              <select name="paymentMode" value={form.paymentMode} onChange={change}>
                <option>Virement</option>
                <option>Espèces</option>
                <option>Chèque</option>
              </select>
            </label>
            <label>
              Statut
              <select name="status" value={form.status} onChange={change}>
                <option>Actif</option>
                <option>Inactif</option>
                <option>En probation</option>
              </select>
            </label>
          </div>
          <div className="form-row">
            <label>
              Numéro float YAS
              <input
                name="floatNumberYas"
                value={form.floatNumberYas}
                onChange={change}
                placeholder="Ex. 034 11 111 11"
              />
            </label>
            <label>
              Numéro float Orange
              <input
                name="floatNumberOrange"
                value={form.floatNumberOrange}
                onChange={change}
                placeholder="Ex. 032 11 111 11"
              />
            </label>
          </div>
          <div className="modal-foot">
            <button type="button" className="outline-btn" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="primary-btn">
              <Check size={16} />
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
