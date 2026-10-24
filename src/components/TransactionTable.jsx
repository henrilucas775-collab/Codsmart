import React from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { money } from '../services/expenseService';
import Status from './Status';
import { formatDate } from '../utils/date';

export default function TransactionTable({ rows, onEdit, onDelete, compact, notify }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>DATE</th>
            <th>BÉNÉFICIAIRE</th>
            <th>CATÉGORIE</th>
            <th>DESCRIPTION</th>
            <th>MONTANT</th>
            <th>STATUT</th>
            {!compact && <th className="actions-head">ACTIONS</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((record) => (
            <tr key={record.id}>
              <td className="date-cell">{formatDate(record.date)}</td>
              <td>
                <div className="person-cell">
                  <span className="person-avatar">
                    {record.name
                      .split(' ')
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join('')}
                  </span>
                  <span>
                    <b>{record.name}</b>
                    <small>{record.user || 'Administrateur'}</small>
                  </span>
                </div>
              </td>
              <td>
                <span className="type-label">{record.type}</span>
              </td>
              <td className="desc-cell">{record.description}</td>
              <td className="amount-cell">{money(record.amount)}</td>
              <td>
                <Status label={record.status} />
              </td>
              {!compact && (
                <td>
                  <div className="row-actions">
                    <button title="Voir" onClick={() => notify?.(`${record.name} · ${money(record.amount)}`)}>
                      <Eye size={15} />
                    </button>
                    <button title="Modifier" onClick={() => onEdit?.(record)}>
                      <Pencil size={15} />
                    </button>
                    <button title="Supprimer" onClick={() => onDelete?.(record.id)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
