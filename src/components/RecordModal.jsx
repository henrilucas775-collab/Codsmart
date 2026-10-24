import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { buildDepositFormState, getDepositFormConfig } from '../data/depositForms';
import DepositFormFields from './DepositFormFields';
import ReceiptField from './ReceiptField';
import { ALLOCATION_PAGES, CAISSE_PAGE, flattenRecords, getChargeSafetyCheck, getTransferSafetyCheck } from '../utils/finance';
import { getFloatNumberForOperator } from '../utils/payroll';
import { todayIso, toIsoDate } from '../utils/date';

// Pages dont les charges portent le reçu du paiement (importé ou scanné)
const RECEIPT_PAGES = ['Forfait', 'Carburant', 'Frais d’expédition', 'Bonus', 'Autre'];
// Pages où le type de bénéficiaire n'est pas saisi : il vient de la fonction de l'employé choisi
const PAGES_WITHOUT_BENEFICIARY_TYPE = ['Forfait', 'Carburant', 'Bonus', 'Autre'];
const PAGES_WITHOUT_FLOAT_NUMBER = ['Carburant', 'Bonus', 'Autre'];

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
  const allocationPage = isAllocation ? activeInitial?.page || page : page;
  const depositFormConfig = isDeposit
    ? getDepositFormConfig({
        page: isAllocation ? allocationPage : page,
        isCaisseDeposit,
        isAllocation
      })
    : null;
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
  const isShippingCharge = isShippingPage && !isDeposit && !isBeneficiary;

  const depositDefaults = depositFormConfig ? buildDepositFormState(activeInitial, depositFormConfig) : {};

  // Bénéficiaire présélectionné : ses informations s'appliquent dès l'ouverture, comme lors d'un choix dans la liste
  const defaultBeneficiary =
    !isDeposit && !isBeneficiary
      ? beneficiaries.find((person) => person.name === (activeInitial?.name || defaultName))
      : undefined;
  // Forfait : le numéro float suit dès l'ouverture l'opérateur sélectionné par défaut
  const defaultOperator = activeInitial?.forfaitOperator || activeInitial?.operator || 'YAS';
  const defaultFloatNumber =
    page === 'Forfait' && defaultBeneficiary ? getFloatNumberForOperator(defaultBeneficiary, defaultOperator) : '';
  const hasReceiptField = RECEIPT_PAGES.includes(page) && !isDeposit && !isBeneficiary;
  const showBeneficiaryType = isBeneficiary || !PAGES_WITHOUT_BENEFICIARY_TYPE.includes(page);
  const showFloatNumber = !PAGES_WITHOUT_FLOAT_NUMBER.includes(page);

  const [form, setForm] = useState({
    name: activeInitial?.name || activeInitial?.senderName || (isDeposit ? 'Caisse / dépôt journalier' : isBeneficiary ? 'Nom du bénéficiaire' : defaultName),
    type: activeInitial?.type || (isDeposit ? 'Dépôt' : isBeneficiary ? 'Bénéficiaire' : page),
    description: activeInitial?.description || '',
    numero: activeInitial?.numero || defaultFloatNumber,
    telephone: activeInitial?.telephone || '',
    amount: activeInitial?.amount || '',
    date: toIsoDate(activeInitial?.date) || todayIso(),
    status: activeInitial?.status || (isBeneficiary ? 'Actif' : 'Validé'),
    beneficiaryType:
      activeInitial?.beneficiaryType || activeInitial?.role || defaultBeneficiary?.beneficiaryType || defaultBeneficiaryType,
    movementType: initialMovementType,
    forfaitOperator: defaultOperator,
    floatNumber: activeInitial?.floatNumber || defaultFloatNumber,
    floatNumberYas: activeInitial?.floatNumberYas || activeInitial?.floatNumber?.YAS || '',
    floatNumberOrange: activeInitial?.floatNumberOrange || activeInitial?.floatNumber?.ORANGE || '',
    departureLocation: activeInitial?.departureLocation || '',
    arrivalLocation: activeInitial?.arrivalLocation || '',
    ticketReference: activeInitial?.ticketReference || '',
    receipt: activeInitial?.receipt || null,
    senderName: activeInitial?.senderName || activeInitial?.name || '',
    recipientName: activeInitial?.recipientName || '',
    ...depositDefaults
  });
  const [formError, setFormError] = useState('');

  const showAmountInput =
    !depositFormConfig &&
    !isBeneficiary &&
    (isDeposit || form.movementType === 'Charge' || form.movementType === 'Dépôt' || page === 'Dépôt' || activeInitial?.recordKind === 'transfer' || activeInitial?.recordKind === 'deposit');

  const change = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value
    }));
    setFormError('');
  };

  const getSelectedBeneficiary = () => {
    if (!beneficiaries || beneficiaries.length === 0) return null;
    return beneficiaries.find((person) => person.name === form.name) || null;
  };

  const resolveFloatNumber = (operator = form.forfaitOperator || 'YAS') => {
    const selected = getSelectedBeneficiary();
    const selectedFloat = selected ? getFloatNumberForOperator(selected, operator) : '';
    const formFloat = operator === 'ORANGE'
      ? (form.floatNumberOrange || form.floatNumber || '')
      : (form.floatNumberYas || form.floatNumber || '');

    return selectedFloat || formFloat || '';
  };

  const modalTitle = depositFormConfig
    ? isEditing
      ? `Modifier · ${depositFormConfig.title}`
      : depositFormConfig.title
    : isEditing
      ? 'Modifier l’opération'
      : `Ajouter · ${page}`;

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="modal-head">
          <div>
            <span className="eyebrow">
              {depositFormConfig?.eyebrow || (isEditing ? 'MODIFICATION' : 'NOUVELLE OPÉRATION')}
            </span>
            <h2>{modalTitle}</h2>
            {depositFormConfig?.hint && <p className="modal-hint">{depositFormConfig.hint}</p>}
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
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

            const senderName = isShippingCharge ? form.senderName || form.name || 'Expéditeur' : form.name;
            const forfaitOperator = page === 'Forfait' ? (form.forfaitOperator || form.operator || 'YAS') : undefined;
            const selectedBeneficiary = getSelectedBeneficiary();
            const resolvedFloatNumber = page === 'Forfait' ? resolveFloatNumber(forfaitOperator) : '';
            const contactLine = [form.numero?.trim() && `N° ${form.numero.trim()}`, form.telephone?.trim() && `Tél. ${form.telephone.trim()}`]
              .filter(Boolean)
              .join(' • ');

            let description = isShippingCharge
              ? [
                  `Départ: ${form.departureLocation || '-'}`,
                  `Arrivée: ${form.arrivalLocation || '-'}`,
                  `Destinataire: ${form.recipientName || '-'}`,
                  form.ticketReference && `Ticket: ${form.ticketReference}`
                ]
                  .filter(Boolean)
                  .join(' • ')
              : contactLine || form.description || '';

            let depositExtras = {};
            if (depositFormConfig && (isTransferOperation || isCaisseDepositOperation)) {
              description = depositFormConfig.buildDescription(form);
              depositExtras = depositFormConfig.extraFields(form);
            }

            onSave({
              ...form,
              ...depositExtras,
              name: senderName,
              type: page === 'Forfait' && forfaitOperator
                ? `${forfaitOperator} · Crédit mobile`
                : isMemberCreation ? 'Bénéficiaire' : isTransferOperation ? 'Répartition' : isBeneficiary ? 'Bénéficiaire' : isCaisseDepositOperation ? 'Dépôt' : page,
              description: isMemberCreation ? 'Ajout d’un membre' : description,
              numero:
                page === 'Forfait'
                  ? resolvedFloatNumber || form.numero?.trim() || ''
                  : showFloatNumber
                    ? form.numero?.trim() || ''
                    : '',
              telephone: form.telephone?.trim() || '',
              recordKind: isMemberCreation ? 'beneficiary' : isTransferOperation ? 'transfer' : isCaisseDepositOperation ? 'deposit' : 'charge',
              amount: isMemberCreation ? 0 : isBeneficiary ? 0 : Number(form.amount) || 0,
              senderName,
              recipientName: isShippingCharge ? form.recipientName : undefined,
              departureLocation: isShippingCharge ? form.departureLocation : undefined,
              arrivalLocation: isShippingCharge ? form.arrivalLocation : undefined,
              ticketReference: isShippingCharge ? form.ticketReference : undefined,
              receipt: hasReceiptField ? form.receipt : undefined,
              user: 'Administrateur',
              beneficiaryType: form.beneficiaryType,
              role: form.beneficiaryType,
              forfaitOperator,
              operator: forfaitOperator,
              floatNumber: resolvedFloatNumber || form.floatNumber || '',
              floatNumberYas: selectedBeneficiary?.floatNumberYas || form.floatNumberYas || '',
              floatNumberOrange: selectedBeneficiary?.floatNumberOrange || form.floatNumberOrange || '',
              floatNumberByOperator: {
                YAS: selectedBeneficiary?.floatNumberYas || form.floatNumberYas || '',
                ORANGE: selectedBeneficiary?.floatNumberOrange || form.floatNumberOrange || ''
              }
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
                  Nom d’expéditeur
                  <input name="senderName" value={form.senderName} onChange={change} placeholder="Ex. Agence Fianarantsoa" required />
                </label>
                <label>
                  Nom du destinataire
                  <input name="recipientName" value={form.recipientName || ''} onChange={change} placeholder="Ex. Client ou agence destinataire" required />
                </label>
              </div>
              <div className="form-row">
                <label>
                  Montant du frais
                  <input type="number" min="0" name="amount" value={form.amount} onChange={change} placeholder="0" required />
                </label>
              </div>
            </>
          ) : depositFormConfig ? (
            <DepositFormFields config={depositFormConfig} form={form} change={change} />
          ) : !isDeposit && !isBeneficiary && beneficiaries.length > 0 ? (
            <label>
              Bénéficiaire
              <select
                name="name"
                value={form.name}
                onChange={(event) => {
                  const selected = beneficiaries.find((person) => person.name === event.target.value) || null;
                  const nextOperator = form.forfaitOperator || 'YAS';
                  const nextFloat = selected ? getFloatNumberForOperator(selected, nextOperator) : '';

                  setForm((previous) => ({
                    ...previous,
                    name: event.target.value,
                    beneficiaryType: selected?.beneficiaryType || selected?.role || selected?.function || previous.beneficiaryType,
                    telephone: selected?.telephone || previous.telephone || '',
                    status: selected?.status || previous.status || 'Actif',
                    floatNumberYas: selected?.floatNumberYas || selected?.floatNumber?.YAS || '',
                    floatNumberOrange: selected?.floatNumberOrange || selected?.floatNumber?.ORANGE || '',
                    floatNumber: nextFloat || previous.floatNumber || '',
                    numero: nextFloat || previous.numero || ''
                  }));
                }}
              >
                {beneficiaries.map((person) => (
                  <option key={person.id || person.name} value={person.name}>
                    {person.name} · {person.beneficiaryType || person.role || 'Bénéficiaire'}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label>
              Nom du bénéficiaire
              <input name="name" value={form.name} onChange={change} placeholder="Ex. Rakoto Jean" required />
            </label>
          )}

          {!isShippingCharge && !depositFormConfig && (
            <div className="form-row">
              {page === 'Forfait' && (
                <label>
                  Opérateur
                  <select
                    name="forfaitOperator"
                    value={form.forfaitOperator}
                    onChange={(event) => {
                      const nextOperator = event.target.value;
                      const nextFloat = resolveFloatNumber(nextOperator);
                      setForm((previous) => ({
                        ...previous,
                        forfaitOperator: nextOperator,
                        numero: nextFloat || previous.numero || '',
                        floatNumber: nextFloat || previous.floatNumber || ''
                      }));
                    }}
                  >
                    <option value="YAS">YAS</option>
                    <option value="ORANGE">Orange</option>
                  </select>
                </label>
              )}
              <label>
                Catégorie / type
                <input name="type" value={form.type} onChange={change} placeholder={isBeneficiary ? 'Bénéficiaire' : page} readOnly={isBeneficiary} />
              </label>
              {!isBeneficiary && (
                <label>
                  Type de mouvement
                  <input name="movementType" value="Charge" readOnly />
                </label>
              )}
              {showBeneficiaryType && (
                <label>
                  Type de bénéficiaire
                  <select name="beneficiaryType" value={form.beneficiaryType} onChange={change}>
                    {beneficiaryTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          )}

          {!isShippingCharge && !depositFormConfig && !isBeneficiary && (showAmountInput || showFloatNumber) && (
            <div className="form-row">
              {showAmountInput && (
                <label>
                  Montant (Ar)
                  <input type="number" min="0" name="amount" value={form.amount} onChange={change} placeholder="0" required />
                </label>
              )}
              {showFloatNumber && (
                <label>
                  Numéro float
                  <input
                    name="numero"
                    value={form.numero}
                    onChange={change}
                    placeholder="Ex. 032 00 000 00"
                    readOnly={page === 'Forfait' || form.beneficiaryType === 'Commercial' || form.beneficiaryType === 'Responsable stock'}
                  />
                </label>
              )}
            </div>
          )}

          {hasReceiptField && (
            <ReceiptField
              receipt={form.receipt}
              onReceiptChange={(receipt) => setForm((previous) => ({ ...previous, receipt }))}
            />
          )}

          {formError && (
            <div className="form-error" role="alert">
              {formError}
            </div>
          )}

          <div className="form-row">
            <label>
              Date
              <input type="date" name="date" value={form.date} onChange={change} required />
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
