import React from 'react';

export default function Status({ label }) {
  const cls =
    label === 'Validé' || label === 'Livré' || label === 'Actif'
      ? 'success'
      : label === 'En attente' || label === 'À valider' || label === 'À vérifier' || label === 'En transit'
        ? 'warning'
        : label === 'Rejeté'
          ? 'danger'
          : 'info';

  return (
    <span className={`status ${cls}`}>
      <i />
      {label}
    </span>
  );
}
