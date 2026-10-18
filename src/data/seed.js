export const nav = [
  ['Tableau de bord', 'LayoutDashboard'],
  ['Dépôt', 'Wallet'],
  ['Bénéficiaires', 'Users'],
  ['Forfait', 'Smartphone'],
  ['Carburant', 'Fuel'],
  ['Avance', 'HandCoins'],
  ['Frais d’expédition', 'Package'],
  ['Bonus', 'Trophy'],
  ['Autre', 'MoreHorizontal'],
  ['Rapports', 'ChartNoAxesCombined']
];

export const initialBalance = 5_800_000;

export const seed = {
  Dépôt: [
    { id: 0, date: '01 oct. 2026', name: 'Solde initial', type: 'Dépôt', description: 'Dépôt initial du compte de caisse', amount: initialBalance, status: 'Validé', user: 'Administrateur', recordKind: 'deposit', page: 'Dépôt' }
  ],
  Bénéficiaires: [
    { id: 15, date: '12 oct. 2026', name: 'Rakoto Jean', type: 'Bénéficiaire', beneficiaryType: 'Livreur', description: 'Livreur principal · Zone Analamanga', amount: 0, status: 'Actif', user: 'Administrateur' },
    { id: 16, date: '11 oct. 2026', name: 'Randria Marie', type: 'Bénéficiaire', beneficiaryType: 'Commercial', description: 'Agent commercial · Ventes', amount: 0, status: 'Actif', user: 'Administrateur' },
    { id: 17, date: '10 oct. 2026', name: 'Toto Kevin', type: 'Bénéficiaire', beneficiaryType: 'Responsable stock', description: 'Responsable stock · Zone Ivandry', amount: 0, status: 'À vérifier', user: 'Administrateur' }
  ],
  Forfait: [
    { id: 1, date: '12 oct. 2026', name: 'Rakoto Jean', type: 'YAS · Crédit mobile', description: 'Forfait commercial — octobre', amount: 25000, status: 'Validé', user: 'Rabe Marc' },
    { id: 2, date: '11 oct. 2026', name: 'Randria Marie', type: 'ORANGE · Crédit mobile', description: 'Crédit mensuel', amount: 20000, status: 'Validé', user: 'Noro Sarah' },
    { id: 3, date: '10 oct. 2026', name: 'Toto Kevin', type: 'YAS · Crédit mobile', description: 'Recharge livraison', amount: 15000, status: 'En attente', user: 'Rabe Marc' }
  ],
  Carburant: [
    { id: 4, date: '12 oct. 2026', name: 'Toto Kevin', type: 'Carburant · Essence', description: 'Livraison centre-ville · 18 L', amount: 99000, status: 'Validé', user: 'Rabe Marc' },
    { id: 5, date: '11 oct. 2026', name: 'Hery Michel', type: 'Carburant · Gasoil', description: 'Tournée Mahamasina · 22 L', amount: 121000, status: 'Validé', user: 'Noro Sarah' },
    { id: 6, date: '10 oct. 2026', name: 'Faly Steven', type: 'Carburant · Essence', description: 'Livraison Ivandry', amount: 77000, status: 'En attente', user: 'Rabe Marc' }
  ],
  Avance: [
    { id: 7, date: '08 oct. 2026', name: 'Andry Paul', type: 'Avance employé', description: 'Avance personnelle · reste 150 000 Ar', amount: 300000, status: 'En cours', user: 'Noro Sarah' },
    { id: 8, date: '05 oct. 2026', name: 'Toto Kevin', type: 'Avance employé', description: 'Frais de santé · remboursée 50 %', amount: 120000, status: 'Partiellement remboursée', user: 'Rabe Marc' }
  ],
  'Frais d’expédition': [
    { id: 9, date: '12 oct. 2026', name: 'Agence Fianarantsoa', type: 'Expédition · Colis #EXP-2418', description: 'Transport Cotisse · 2 colis', amount: 45000, status: 'En transit', user: 'Rabe Marc' },
    { id: 10, date: '11 oct. 2026', name: 'Agence Toamasina', type: 'Expédition · Colis #EXP-2417', description: 'Transport Maki · 1 colis', amount: 28000, status: 'Livré', user: 'Noro Sarah' }
  ],
  Bonus: [
    { id: 11, date: '10 oct. 2026', name: 'Toto Kevin', type: 'Bonus livraison', description: '75 / 100 livraisons · 75 %', amount: 7000, status: 'À valider', user: 'Rabe Marc' },
    { id: 12, date: '10 oct. 2026', name: 'Hery Michel', type: 'Bonus livraison', description: '82 / 100 livraisons · 82 %', amount: 7000, status: 'Validé', user: 'Noro Sarah' }
  ],
  Autre: [
    { id: 13, date: '09 oct. 2026', name: 'Bureau Analamahitsy', type: 'Fournitures', description: 'Papier A4 et stylos', amount: 68000, status: 'Validé', user: 'Rabe Marc' },
    { id: 14, date: '08 oct. 2026', name: 'Laza Services', type: 'Entretien', description: 'Réparation imprimante', amount: 95000, status: 'En attente', user: 'Noro Sarah' }
  ]
};

export const monthly = [
  { m: 'Nov', v: 2.8 },
  { m: 'Déc', v: 3.4 },
  { m: 'Jan', v: 3.1 },
  { m: 'Fév', v: 4.2 },
  { m: 'Mar', v: 3.8 },
  { m: 'Avr', v: 4.8 },
  { m: 'Mai', v: 4.1 },
  { m: 'Juin', v: 5.3 },
  { m: 'Juil', v: 4.7 },
  { m: 'Août', v: 5.6 },
  { m: 'Sept', v: 4.9 },
  { m: 'Oct', v: 5.8 }
];

export const categories = [
  { name: 'Carburant', value: 36, color: '#5669e8' },
  { name: 'Forfait', value: 22, color: '#30b994' },
  { name: 'Avance', value: 18, color: '#f2aa45' },
  { name: 'Expédition', value: 13, color: '#9672e8' },
  { name: 'Autre', value: 7, color: '#48a9e2' },
  { name: 'Bonus', value: 4, color: '#ef7892' }
];
