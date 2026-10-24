const monthYear = () => {
  const label = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

export const CAISSE_DEPOSIT_FORM = {
  eyebrow: 'CAISSE PRINCIPALE',
  title: 'Versement sur le solde initial',
  hint: 'Alimente uniquement le menu Dépôt (caisse centrale).',
  fields: [
    {
      name: 'name',
      label: 'Source du versement',
      placeholder: 'Ex. Banque BMOI · virement interne',
      required: true,
      full: true
    },
    {
      name: 'paymentMethod',
      label: 'Mode de versement',
      type: 'select',
      options: ['Espèces', 'Virement', 'Chèque', 'Mobile money'],
      required: true
    },
    {
      name: 'numero',
      label: 'N° pièce / reçu bancaire',
      placeholder: 'Ex. VIR-2026-1042',
      required: true
    },
    {
      name: 'telephone',
      label: 'Contact / validateur',
      placeholder: 'Ex. 034 00 000 00',
      inputMode: 'tel'
    },
    {
      name: 'motif',
      label: 'Motif du versement',
      placeholder: 'Ex. Apport mensuel octobre',
      full: true
    },
    {
      name: 'amount',
      label: 'Montant versé (Ar)',
      type: 'number',
      min: 0,
      required: true
    }
  ],
  defaults: (initial = {}) => ({
    name: initial.name || 'Caisse / dépôt journalier',
    paymentMethod: initial.paymentMethod || 'Virement',
    numero: initial.numero || '',
    telephone: initial.telephone || '',
    motif: initial.motif || initial.description || '',
    amount: initial.amount ?? ''
  }),
  buildDescription(form) {
    const parts = [
      form.paymentMethod && `Mode: ${form.paymentMethod}`,
      form.motif?.trim(),
      form.numero?.trim() && `Pièce ${form.numero.trim()}`,
      form.telephone?.trim() && `Contact ${form.telephone.trim()}`
    ].filter(Boolean);
    return parts.join(' • ') || 'Versement de caisse';
  },
  extraFields(form) {
    return {
      paymentMethod: form.paymentMethod || '',
      motif: form.motif || ''
    };
  }
};

export const ALLOCATION_DEPOSIT_FORMS = {
  Forfait: {
    eyebrow: 'RÉPARTITION · FORFAIT',
    title: 'Budget crédits mobiles',
    hint: 'Prélève la caisse et crédite l’enveloppe Forfait (YAS / Orange…).',
    fields: [
      {
        name: 'name',
        label: 'Intitulé du budget',
        placeholder: 'Ex. Crédits commerciaux octobre',
        required: true,
        full: true
      },
      {
        name: 'forfaitOperator',
        label: 'Opérateur',
        type: 'select',
        options: ['YAS', 'ORANGE', 'Telma', 'Mixte'],
        required: true
      },
      {
        name: 'forfaitPeriod',
        label: 'Période couverte',
        placeholder: 'Ex. Octobre 2026',
        required: true
      },
      {
        name: 'numero',
        label: 'N° ordre de répartition',
        placeholder: 'Ex. REP-FOR-2410'
      },
      {
        name: 'telephone',
        label: 'Responsable forfait',
        placeholder: 'Ex. 032 00 000 00',
        inputMode: 'tel'
      },
      {
        name: 'amount',
        label: 'Montant réparti (Ar)',
        type: 'number',
        min: 0,
        required: true
      }
    ],
    defaults: (initial = {}) => ({
      name: initial.name || 'Versement forfait',
      forfaitOperator: initial.forfaitOperator || 'YAS',
      forfaitPeriod: initial.forfaitPeriod || monthYear(),
      numero: initial.numero || '',
      telephone: initial.telephone || '',
      amount: initial.amount ?? ''
    }),
    buildDescription(form) {
      return [
        `Opérateur ${form.forfaitOperator}`,
        `Période ${form.forfaitPeriod}`,
        form.numero?.trim() && `Réf. ${form.numero.trim()}`
      ]
        .filter(Boolean)
        .join(' • ');
    },
    extraFields(form) {
      return {
        forfaitOperator: form.forfaitOperator || '',
        forfaitPeriod: form.forfaitPeriod || ''
      };
    }
  },
  Carburant: {
    eyebrow: 'RÉPARTITION · CARBURANT',
    title: 'Fonds carburant & tournées',
    hint: 'Budget réservé aux pleins et trajets livreurs.',
    fields: [
      {
        name: 'name',
        label: 'Libellé du fonds',
        placeholder: 'Ex. Caisse carburant S2',
        required: true,
        full: true
      },
      {
        name: 'fuelType',
        label: 'Type de carburant',
        type: 'select',
        options: ['Essence', 'Gasoil', 'Mixte'],
        required: true
      },
      {
        name: 'fuelStation',
        label: 'Station / partenaire',
        placeholder: 'Ex. Total Ankorondrano',
        required: true
      },
      {
        name: 'vehicleScope',
        label: 'Parc / zone couverte',
        placeholder: 'Ex. Livreurs zone Ivandry',
        required: true
      },
      {
        name: 'numero',
        label: 'N° bon carburant',
        placeholder: 'Ex. CARB-2026-18'
      },
      {
        name: 'telephone',
        label: 'Contact logistique',
        inputMode: 'tel'
      },
      {
        name: 'amount',
        label: 'Montant réparti (Ar)',
        type: 'number',
        min: 0,
        required: true
      }
    ],
    defaults: (initial = {}) => ({
      name: initial.name || 'Répartition carburant',
      fuelType: initial.fuelType || 'Essence',
      fuelStation: initial.fuelStation || '',
      vehicleScope: initial.vehicleScope || '',
      numero: initial.numero || '',
      telephone: initial.telephone || '',
      amount: initial.amount ?? ''
    }),
    buildDescription(form) {
      return [
        `${form.fuelType} · ${form.fuelStation}`,
        form.vehicleScope && `Zone: ${form.vehicleScope}`,
        form.numero?.trim() && `Bon ${form.numero.trim()}`
      ]
        .filter(Boolean)
        .join(' • ');
    },
    extraFields(form) {
      return {
        fuelType: form.fuelType || '',
        fuelStation: form.fuelStation || '',
        vehicleScope: form.vehicleScope || ''
      };
    }
  },
  Avance: {
    eyebrow: 'RÉPARTITION · AVANCES',
    title: 'Enveloppe avances personnel',
    hint: 'Montant disponible pour accorder des avances salariés.',
    fields: [
      {
        name: 'name',
        label: 'Objet de l’enveloppe',
        placeholder: 'Ex. Avances octobre — équipe terrain',
        required: true,
        full: true
      },
      {
        name: 'advanceScope',
        label: 'Public concerné',
        type: 'select',
        options: ['Tous les employés', 'Livreurs', 'Commerciaux', 'Administration'],
        required: true
      },
      {
        name: 'repaymentRule',
        label: 'Règle de remboursement',
        placeholder: 'Ex. Retenue sur paie du mois suivant',
        required: true
      },
      {
        name: 'numero',
        label: 'N° décision / note',
        placeholder: 'Ex. NAV-2026-07'
      },
      {
        name: 'telephone',
        label: 'Contact RH',
        inputMode: 'tel'
      },
      {
        name: 'amount',
        label: 'Montant réparti (Ar)',
        type: 'number',
        min: 0,
        required: true
      }
    ],
    defaults: (initial = {}) => ({
      name: initial.name || 'Enveloppe avances',
      advanceScope: initial.advanceScope || 'Tous les employés',
      repaymentRule: initial.repaymentRule || 'Retenue sur paie',
      numero: initial.numero || '',
      telephone: initial.telephone || '',
      amount: initial.amount ?? ''
    }),
    buildDescription(form) {
      return [
        form.advanceScope && `Portée: ${form.advanceScope}`,
        form.repaymentRule && `Remboursement: ${form.repaymentRule}`,
        form.numero?.trim() && `Note ${form.numero.trim()}`
      ]
        .filter(Boolean)
        .join(' • ');
    },
    extraFields(form) {
      return {
        advanceScope: form.advanceScope || '',
        repaymentRule: form.repaymentRule || ''
      };
    }
  },
  'Frais d’expédition': {
    eyebrow: 'RÉPARTITION · EXPÉDITION',
    title: 'Budget transport & colis',
    hint: 'Couvre les frais Cotisse, Maki et envois inter-villes.',
    fields: [
      {
        name: 'name',
        label: 'Intitulé du budget',
        placeholder: 'Ex. Expéditions octobre — provinces',
        required: true,
        full: true
      },
      {
        name: 'shippingCorridor',
        label: 'Corridor principal',
        placeholder: 'Ex. Tana → Tamatave / Fianarantsoa',
        required: true
      },
      {
        name: 'carrierFocus',
        label: 'Transporteur principal',
        type: 'select',
        options: ['Cotisse', 'Maki', 'Indépendant', 'Mixte'],
        required: true
      },
      {
        name: 'numero',
        label: 'N° contrat / bon budget',
        placeholder: 'Ex. EXP-BUD-2410'
      },
      {
        name: 'telephone',
        label: 'Contact expédition',
        inputMode: 'tel'
      },
      {
        name: 'amount',
        label: 'Montant réparti (Ar)',
        type: 'number',
        min: 0,
        required: true
      }
    ],
    defaults: (initial = {}) => ({
      name: initial.name || 'Budget expédition',
      shippingCorridor: initial.shippingCorridor || '',
      carrierFocus: initial.carrierFocus || 'Cotisse',
      numero: initial.numero || '',
      telephone: initial.telephone || '',
      amount: initial.amount ?? ''
    }),
    buildDescription(form) {
      return [
        form.shippingCorridor && `Corridor: ${form.shippingCorridor}`,
        form.carrierFocus && `Transporteur: ${form.carrierFocus}`,
        form.numero?.trim() && `Réf. ${form.numero.trim()}`
      ]
        .filter(Boolean)
        .join(' • ');
    },
    extraFields(form) {
      return {
        shippingCorridor: form.shippingCorridor || '',
        carrierFocus: form.carrierFocus || ''
      };
    }
  },
  Bonus: {
    eyebrow: 'RÉPARTITION · BONUS',
    title: 'Fonds bonus livraison',
    hint: 'Réserve pour les primes liées aux objectifs de tournée.',
    fields: [
      {
        name: 'name',
        label: 'Campagne bonus',
        placeholder: 'Ex. Bonus livraisons octobre',
        required: true,
        full: true
      },
      {
        name: 'bonusThreshold',
        label: 'Seuil d’éligibilité (%)',
        type: 'number',
        min: 0,
        max: 100,
        placeholder: '70',
        required: true
      },
      {
        name: 'bonusUnitAmount',
        label: 'Montant unitaire (Ar)',
        type: 'number',
        min: 0,
        placeholder: '7000',
        required: true
      },
      {
        name: 'numero',
        label: 'N° campagne',
        placeholder: 'Ex. BON-2026-10'
      },
      {
        name: 'telephone',
        label: 'Responsable équipe',
        inputMode: 'tel'
      },
      {
        name: 'amount',
        label: 'Montant total réparti (Ar)',
        type: 'number',
        min: 0,
        required: true
      }
    ],
    defaults: (initial = {}) => ({
      name: initial.name || 'Campagne bonus livraison',
      bonusThreshold: initial.bonusThreshold ?? '70',
      bonusUnitAmount: initial.bonusUnitAmount ?? '7000',
      numero: initial.numero || '',
      telephone: initial.telephone || '',
      amount: initial.amount ?? ''
    }),
    buildDescription(form) {
      return [
        `Seuil ${form.bonusThreshold}%`,
        form.bonusUnitAmount && `Prime ${Number(form.bonusUnitAmount).toLocaleString('fr-FR')} Ar`,
        form.numero?.trim() && `Campagne ${form.numero.trim()}`
      ]
        .filter(Boolean)
        .join(' • ');
    },
    extraFields(form) {
      return {
        bonusThreshold: form.bonusThreshold || '',
        bonusUnitAmount: form.bonusUnitAmount || ''
      };
    }
  },
  Autre: {
    eyebrow: 'RÉPARTITION · AUTRES CHARGES',
    title: 'Budget frais divers',
    hint: 'Fournitures, entretien et dépenses hors catégories dédiées.',
    fields: [
      {
        name: 'name',
        label: 'Nom du budget',
        placeholder: 'Ex. Fournitures bureau Q4',
        required: true,
        full: true
      },
      {
        name: 'otherCategory',
        label: 'Nature de la dépense',
        type: 'select',
        options: ['Fournitures', 'Entretien', 'Services', 'Marketing', 'Autre'],
        required: true
      },
      {
        name: 'motif',
        label: 'Usage prévu',
        placeholder: 'Ex. Papeterie, maintenance imprimante…',
        required: true,
        full: true
      },
      {
        name: 'numero',
        label: 'N° demande / devis',
        placeholder: 'Ex. DEV-2026-55'
      },
      {
        name: 'telephone',
        label: 'Demandeur',
        inputMode: 'tel'
      },
      {
        name: 'amount',
        label: 'Montant réparti (Ar)',
        type: 'number',
        min: 0,
        required: true
      }
    ],
    defaults: (initial = {}) => ({
      name: initial.name || 'Budget charges diverses',
      otherCategory: initial.otherCategory || 'Fournitures',
      motif: initial.motif || '',
      numero: initial.numero || '',
      telephone: initial.telephone || '',
      amount: initial.amount ?? ''
    }),
    buildDescription(form) {
      return [
        form.otherCategory && `Catégorie: ${form.otherCategory}`,
        form.motif?.trim(),
        form.numero?.trim() && `Devis ${form.numero.trim()}`
      ]
        .filter(Boolean)
        .join(' • ');
    },
    extraFields(form) {
      return {
        otherCategory: form.otherCategory || '',
        motif: form.motif || ''
      };
    }
  }
};

export function getAllocationDepositForm(page) {
  return ALLOCATION_DEPOSIT_FORMS[page] || null;
}

export function getDepositFormConfig({ page, isCaisseDeposit, isAllocation }) {
  if (isCaisseDeposit && !isAllocation) {
    return CAISSE_DEPOSIT_FORM;
  }
  if (isAllocation) {
    return getAllocationDepositForm(page) || ALLOCATION_DEPOSIT_FORMS.Autre;
  }
  return null;
}

export function buildDepositFormState(activeInitial, config) {
  if (!config) {
    return {};
  }
  return config.defaults(activeInitial || {});
}
