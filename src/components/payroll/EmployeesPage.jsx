import React from 'react';
import { Pencil, Plus, Trash2, Users } from 'lucide-react';
import { money } from '../../utils/payroll';

export default function EmployeesPage({ employees, query, setQuery, onAdd, onEdit, onDelete }) {
  return (
    <>
      <div className="module-title-row">
        <div>
          <div className="eyebrow">PAIE / RÉFÉRENTIEL</div>
          <h1>
            <span className="title-icon">
              <Users size={21} />
            </span>
            Employés
          </h1>
          <p>Matricules, fonctions et salaires de base pour les bulletins.</p>
        </div>
        <button className="primary-btn" onClick={onAdd}>
          <Plus size={17} />
          Nouvel employé
        </button>
      </div>

      <div className="panel table-panel">
        <div className="table-toolbar">
          <div>
            <h3>Liste du personnel</h3>
            <p>{employees.length} employé{employees.length > 1 ? 's' : ''}</p>
          </div>
          <label className="table-search">
            <input placeholder="Rechercher..." value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>MATRICULE</th>
                <th>NOM</th>
                <th>FONCTION</th>
                <th>SALAIRE DE BASE</th>
                <th>NUMÉRO</th>
                <th>STATUT</th>
                <th className="actions-head">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.matricule}</td>
                  <td><b>{employee.name}</b></td>
                  <td>{employee.function}</td>
                  <td>{money(employee.baseSalary)}</td>
                  <td>{employee.numero || employee.floatNumberYas || employee.floatNumber?.YAS || employee.floatNumberOrange || employee.floatNumber?.ORANGE || employee.floatNumber || '—'}</td>
                  <td>{employee.status}</td>
                  <td>
                    <div className="row-actions">
                      <button type="button" title="Modifier" onClick={() => onEdit(employee)}>
                        <Pencil size={15} />
                      </button>
                      <button type="button" title="Supprimer" onClick={() => onDelete(employee.id)}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {employees.length === 0 && <div className="empty">Aucun employé enregistré.</div>}
      </div>
    </>
  );
}
