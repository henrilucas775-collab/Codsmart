import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { ALLOCATION_PAGES, CAISSE_PAGE, flattenRecords, getChargeSafetyCheck, getTransferSafetyCheck } from '../utils/finance';

export default function RecordModal({ page, initial, preset, beneficiaries = [], onClose, onSave, records = {} }) {
  const isEditing = Boolean(initial);
  const activeInitial = initial || preset;
  const isAllocation =
    activeInitial?.recordKind === 'transfer' ||
    activeInitial?.type === 'Répartition' ||
    (ALLOCATION_PAGES.includes(page) && activeInitial?.type === 'Dépôt');
  const isCaisseDeposit =
    page === CAISSE_PAGE ||
    activeInitial?.recordKind === 'deposit' ||
    activeInitial?.name === 'Solde initial';
  const isDeposit = isCaisseDeposit || isAllocation;
  const isBeneficiary = page === 'Bénéficiaires' || activeInitial?.type === 'Bénéficiaire';
  const beneficiaryTypes = ['Commercial', 'Livreur', 'Responsable stock', 'Responsable admin'];
  const defaultBeneficiaryType = activeInitial?.beneficiaryType || activeInitial?.role || beneficiaryTypes[0];
  const defaultName = !isDeposit && !isBeneficiary && beneficiaries.length > 0 ? beneficiaries[0].name : '';
  const initialMovementType = activeInitial?.recordKind === 'transfer' || activeInitial?.recordKind === 'deposit' || activeInitial?.type === 'Dépôt' ? 'Dépôt' : 'Charge';
  const currentPageRecords = records?.[page] || records?.[activeInitial?.page] || records?.[activeInitial?.category] || [];
  const isShippingPage =
    page === 'Frais d’expédition' ||
    activeInitial?.page === 'Frais d’expédition' ||
    activeInitial?.type === 'Frais d’expédition';
  /** Formulaire colis / ticket : uniquement pour une charge expédition, pas pour répartition ni caisse. */
  const isShippingCharge = isShippingPage && !isDeposit && !isBeneficiary;

  const [form, setForm] = useState({
    name: activeInitial?.name || activeInitial?.senderName || (isDeposit ? 'Caisse / dépôt journalier' : isBeneficiary ? 'Nom du bénéficiaire' : defaultName),
    type: activeInitial?.type || (isDeposit ? 'Dépôt' : isBeneficiary ? 'Bénéficiaire' : page),
    description: activeInitial?.description || '',
    numero: activeInitial?.numero || '',
    telephone: activeInitial?.telephone || '',
    amount: activeInitial?.amount || '',
    date: activeInitial?.date || new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
    status: activeInitial?.status || (isBeneficiary ? 'Actif' : 'Validé'),
    beneficiaryType: activeInitial?.beneficiaryType || activeInitial?.role || defaultBeneficiaryType,
    movementType: initialMovementType,
    departureLocation: activeInitial?.departureLocation || '',
    arrivalLocation: activeInitial?.arrivalLocation || '',
    ticketReference: activeInitial?.ticketReference || '',
    senderName: activeInitial?.senderName || activeInitial?.name || '',
    recipientName: activeInitial?.recipientName || ''
  });
  const [formError, setFormError] = useState('');

  const showAmountInput = !isBeneficiary && (isDeposit || form.movementType === 'Charge' || form.movementType === 'Dépôt' || page === 'Dépôt' || activeInitial?.recordKind === 'transfer' || activeInitial?.recordKind === 'deposit');

  const change = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value
    }));
    setFormError('');
  };

  return (
    <div className="modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div className="modal">
        <div className="modal-head">
          <div>
            <span className="eyebrow">{isEditing ? 'MODIFICATION' : 'NOUVELLE OPÉRATION'}</span>
            <h2>{isEditing ? 'Modifier l’opération' : `Ajouter · ${page}`}</h2>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X size={19} />
          </button>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            const movementType = isDeposit ? 'Dépôt' : form.movementType || 'Charge';
            const isMemberCreation = !isDeposit && !isShippingCharge && !isBeneficiary && beneficiaries.length > 0 && !showAmountInput;
            const isTransferOperation =
              isAllocation ||
              (ALLOCATION_PAGES.includes(page) &&
                !isBeneficiary &&
                (activeInitial?.type === 'Répartition' || activeInitial?.type === 'Dépôt' || movementType === 'Dépôt'));
            const isCaisseDepositOperation = isCaisseDeposit && !isTransferOperation;
            const chargeAmount = Number(form.amount) || 0;
            const isChargeOperation = !isCaisseDepositOperation && !isTransferOperation && !isBeneficiary && !isMemberCreation;

            if (isTransferOperation && chargeAmount > 0) {
              const safety = getTransferSafetyCheck(flattenRecords(records), chargeAmount, initial?.id);
              if (safety.isInsufficient) {
                setFormError(safety.message);
                return;
              }
            }

            if (isChargeOperation && chargeAmount > 0) {
              const safety = getChargeSafetyCheck(currentPageRecords, page, chargeAmount, initial?.id);
              if (safety.isInsufficient) {
                setFormError(safety.message);
                return;
              }
            }

            setFormError('');

            const senderName = isShippingCharge ? (form.senderName || form.name || 'Expéditeur') : form.name;
            const contactLine = [form.numero?.trim() && `N° ${form.numero.trim()}`, form.telephone?.trim() && `Tél. ${form.telephone.trim()}`]
              .filter(Boolean)
              .join(' • ');
            const description = isShippingCharge
              ? `Départ: ${form.departureLocation || '-'} • Arrivée: ${form.arrivalLocation || '-'} • Destinataire: ${form.recipientName || '-'} • Ticket: ${form.ticketReference || '-'}`
              : contactLine || form.description || (isTransferOperation ? activeInitial?.description : '') || (isCaisseDepositOperation ? 'Versement de caisse' : '');

            onSave({
              ...form,
              name: senderName,
              type: isMemberCreation ? 'Bénéficiaire' : isTransferOperation ? 'Répartition' : isBeneficiary ? 'Bénéficiaire' : isCaisseDepositOperation ? 'Dépôt' : page,
              description: isMemberCreation ? 'Ajout d’un membre' : description,
              numero: form.numero?.trim() || '',
              telephone: form.telephone?.trim() || '',
              recordKind: isMemberCreation ? 'beneficiary' : isTransferOperation ? 'transfer' : isCaisseDepositOperation ? 'deposit' : 'charge',
              amount: isMemberCreation ? 0 : isBeneficiary ? 0 : Number(form.amount) || 0,
              senderName,
              recipientName: isShippingCharge ? form.recipientName : undefined,
              departureLocation: isShippingCharge ? form.departureLocation : undefined,
              arrivalLocation: isShippingCharge ? form.arrivalLocation : undefined,
              ticketReference: isShippingCharge ? form.ticketReference : undefined,
              user: 'Administrateur',
              beneficiaryType: form.beneficiaryType,
              role: form.beneficiaryType
            });
          }}
        >
          {isShippingCharge ? (
            <>
              <div className="form-row">
                <label>
                  Lieux de départ
                  <input name="departureLocation" value={form.departureLocation} onChange={change} placeholder="Ex. Antananarivo" required />
                </label>
                <label>
                  Lieux d’arrivée
                  <input name="arrivalLocation" value={form.arrivalLocation} onChange={change} placeholder="Ex. Toamasina" required />
                </label>
              </div>

              <div className="form-row">
                <label>
                  ID référence du ticket
                  <input name="ticketReference" value={form.ticketReference} onChange={change} placeholder="Ex. EXP-2418" required />
                </label>
                <label>
                  Nom d’expéditeur
                  <input name="senderName" value={form.senderName} onChange={change} placeholder="Ex. Agence Fianarantsoa" required />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Nom du destinataire
                  <input name="recipientName" value={form.recipientName || ''} onChange={change} placeholder="Ex. Client ou agence destinataire" required />
                </label>
                <label>
                  Montant du frais
                  <input type="number" min="0" name="amount" value={form.amount} onChange={change} placeholder="0" required />
                </label>
              </div>
            </>
          ) : !isDeposit && !isBeneficiary && beneficiaries.length > 0 ? (
            <label>
              Bénéficiaire
              <select name="name" value={form.name} onChange={(event) => {
                const selected = beneficiaries.find((person) => person.name === event.target.value);
                setForm((previous) => ({
                  ...previous,
                  name: event.target.value,
                  beneficiaryType: selected?.beneficiaryType || selected?.role || previous.beneficiaryType
                }));
              }}>
                {beneficiaries.map((person) => (
                  <option key={person.id || person.name} value={person.name}>
                    {person.name} · {person.beneficiaryType || person.role || 'Bénéficiaire'}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label>
              {isDeposit ? 'Source du dépôt' : 'Nom du bénéficiaire'}
              <input name="name" value={form.name} onChange={change} placeholder={isDeposit ? 'Ex. Caisse centrale / dépôt journalier' : 'Ex. Rakoto Jean'} required />
            </label>
          )}

          {!isShippingCharge && (
            <div className="form-row">
              <label>
                {isDeposit ? (isAllocation ? 'Type de répartition' : 'Type de mouvement') : 'Catégorie / type'}
                <input name="type" value={form.type} onChange={change} placeholder={isDeposit ? 'Dépôt' : isBeneficiary ? 'Bénéficiaire' : page} readOnly={isDeposit || isBeneficiary} />
              </label>
              {!isBeneficiary && !isDeposit && (
                <label>
                  Type de mouvement
                  <input name="movementType" value="Charge" readOnly />
                </label>
              )}
              {!isBeneficiary && !isDeposit && (
                <label>
                  Type de bénéficiaire
                  <select name="beneficiaryType" value={form.beneficiaryType} onChange={change}>
                    {beneficiaryTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </label>
              )}
              {showAmountInput && (
                <label>
                  Montant (Ar)
                  <input type="number" min="0" name="amount" value={form.amount} onChange={change} placeholder="0" required />
                </label>
              )}
            </div>
          )}

          {isBeneficiary && (
            <div className="form-row">
              <label>
                Type de bénéficiaire
                <select name="beneficiaryType" value={form.beneficiaryType} onChange={change}>
                  {beneficiaryTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {!isShippingCharge && (
            <div className="form-row">
              <label>
                Numéro
                <input name="numero" value={form.numero} onChange={change} placeholder="Ex. REF-2026-014" />
              </label>
              <label>
                Tél.
                <input name="telephone" value={form.telephone} onChange={change} placeholder="Ex. 034 12 345 67" inputMode="tel" />
              </label>
            </div>
          )}

          {formError && (
            <div role="alert" style={{ marginTop: 10, padding: '10px 12px', borderRadius: 10, background: '#fff4ed', border: '1px solid #f3b482', color: '#9c4f16', fontWeight: 600, lineHeight: 1.5 }}>
              {formError}
            </div>
          )}

          <div className="form-row">
            <label>
              Date
              <input name="date" value={form.date} onChange={change} />
            </label>
            <label>
              Statut
              <select name="status" value={form.status} onChange={change}>
                <option>Actif</option>
                <option>À vérifier</option>
                <option>En attente</option>
                <option>Validé</option>
                <option>En cours</option>
                <option>À valider</option>
                <option>Livré</option>
                <option>Rejeté</option>
              </select>
            </label>
          </div>

          <div className="modal-foot">
            <button type="button" className="outline-btn" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="primary-btn">
              <Check size={16} />
              {isEditing ? 'Enregistrer les modifications' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
