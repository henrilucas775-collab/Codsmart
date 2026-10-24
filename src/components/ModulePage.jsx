import React from 'react';
import {
  ArrowUpRight,
  ChevronDown,
  Download,
  Fuel,
  HandCoins,
  MapPin,
  MoreHorizontal,
  Package,
  Plus,
  Printer,
  Search,
  Smartphone,
  Trophy,
  Users,
  Wallet
} from 'lucide-react';
import TransactionTable from './TransactionTable';
import { CAISSE_PAGE, getCategorySnapshot, getGlobalSnapshot, getMovementKind, isCounted } from '../utils/finance';

export default function ModulePage({
  page,
  data,
  pageRecords = data,
  allRecords = [],
  query,
  setQuery,
  filter,
  setFilter,
  onAdd,
  onAddDeposit,
  onEdit,
  onDelete,
  onExport,
  notify
}) {
  const money = (value) => `${new Intl.NumberFormat('fr-FR').format(value)} Ar`;
  const categorySnapshot =
    page === CAISSE_PAGE
      ? (() => {
          const global = getGlobalSnapshot(allRecords);
          return {
            deposits: global.deposits,
            charges: global.transfers,
            balance: global.balance
          };
        })()
      : getCategorySnapshot(pageRecords, page);
  const moduleTotal = categorySnapshot.balance;
  const pendingCount = data.filter((row) => ['En attente', 'À valider', 'En cours', 'En transit'].includes(row.status)).length;

  const config = {
    Dépôt: {
      icon: Wallet,
      desc: 'Enregistrez les versements journaliers et le solde initial. Les répartitions vers les modules retirent ce solde sans le réaugmenter.',
      stats: () => [
        ['Solde caisse disponible', money(moduleTotal)],
        ['Total versé (caisse)', money(categorySnapshot.deposits)],
        ['Répartis aux modules', money(categorySnapshot.charges)]
      ],
      actions: ['Nouvel apport', 'Enregistrer un dépôt', 'Voir l’historique']
    },
    Bénéficiaires: {
      icon: Users,
      desc: 'Enregistrez et consultez les bénéficiaires, leurs rôles et leur statut de suivi.',
      stats: () => [
        ['Bénéficiaires actifs', String(data.filter((row) => row.status === 'Actif').length)],
        ['À vérifier', String(data.filter((row) => row.status === 'À vérifier').length)],
        ['Total suivis', String(data.length)]
      ],
      actions: ['Ajouter un bénéficiaire', 'Mettre à jour les infos', 'Voir le détail']
    },
    Forfait: {
      icon: Smartphone,
      desc: 'Gérez les crédits mobiles et les bénéficiaires de votre entreprise.',
      stats: () => [
        ['Solde alloué restant', money(categorySnapshot.balance)],
        ['Montant réparti', money(categorySnapshot.deposits)],
        ['Consommations', money(categorySnapshot.charges)]
      ],
      actions: ['Ajouter bénéficiaire', 'Enregistrer un dépôt', 'Envoyer un crédit']
    },
    Carburant: {
      icon: Fuel,
      desc: 'Suivez les dépenses carburant, les fonds de caisse et les trajets.',
      stats: () => [
        ['Solde alloué restant', money(categorySnapshot.balance)],
        ['Montant réparti', money(categorySnapshot.deposits)],
        ['Consommations', money(categorySnapshot.charges)]
      ],
      actions: ['Dépôt de caisse', 'Enregistrer carburant', 'Voir les trajets']
    },
    Avance: {
      icon: HandCoins,
      desc: 'Suivez les avances accordées et les remboursements des employés.',
      stats: () => [
        ['Solde alloué restant', money(categorySnapshot.balance)],
        ['Montant réparti', money(categorySnapshot.deposits)],
        ['Consommations', money(categorySnapshot.charges)]
      ],
      actions: ['Nouvelle avance']
    },
    'Frais d’expédition': {
      icon: Package,
      desc: 'Suivez les colis, les transporteurs et les frais par destination.',
      stats: () => [
        ['Solde alloué restant', money(categorySnapshot.balance)],
        ['Montant réparti', money(categorySnapshot.deposits)],
        ['Consommations', money(categorySnapshot.charges)]
      ],
      actions: ['Nouvelle expédition']
    },
    Bonus: {
      icon: Trophy,
      desc: 'Calculez et validez les bonus de livraison de vos équipes.',
      stats: () => [
        ['Solde alloué restant', money(categorySnapshot.balance)],
        ['Montant réparti', money(categorySnapshot.deposits)],
        ['Consommations', money(categorySnapshot.charges)]
      ],
      actions: ['Calculer les bonus']
    },
    Autre: {
      icon: MoreHorizontal,
      desc: 'Enregistrez les achats courants, fournitures et frais divers.',
      stats: () => [
        ['Solde alloué restant', money(categorySnapshot.balance)],
        ['Montant réparti', money(categorySnapshot.deposits)],
        ['Consommations', money(categorySnapshot.charges)]
      ],
      actions: ['Nouvelle dépense']
    }
  }[page] || {};

  const Icon = config.icon || Wallet;
  const titleDesc = page === 'Dépôt'
    ? 'Suivi des dépôts journaliers'
    : page === 'Bénéficiaires'
      ? 'Gestion des bénéficiaires'
      : page === 'Forfait'
        ? 'Bénéficiaires, crédits mobiles et dépôts'
        : page === 'Carburant'
          ? 'Carburant, caisse et suivi des livreurs'
          : page;
  const stats = config.stats ? config.stats() : [
    ['Total dépensé', money(moduleTotal)],
    ['Opérations', String(data.length)],
    ['En attente', String(pendingCount)]
  ];
  const operatorTotals = React.useMemo(() => {
    const totals = { YAS: 0, ORANGE: 0 };
    data.forEach((row) => {
      const movementKind = getMovementKind(row);
      if (movementKind === 'deposit' || movementKind === 'transfer' || !isCounted(row)) {
        return;
      }

      const rawOperator = row.forfaitOperator || row.operator || row.type || '';
      const operatorName = String(rawOperator).toUpperCase();
      if (!operatorName.includes('YAS') && !operatorName.includes('ORANGE')) {
        return;
      }
      const normalized = operatorName.includes('ORANGE') ? 'ORANGE' : 'YAS';
      totals[normalized] += Number(row.amount) || 0;
    });
    return totals;
  }, [data]);

  return (
    <>
      <div className="module-title-row">
        <div>
          <div className="eyebrow">GESTION FINANCIÈRE / {page.toUpperCase()}</div>
          <h1>
            <span className="title-icon">
              <Icon size={21} />
            </span>
            {titleDesc}
          </h1>
          <p>{config.desc}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {['Forfait', 'Carburant', 'Avance', 'Frais d’expédition', 'Bonus', 'Autre'].includes(page) && (
            <>
              <button className="outline-btn" onClick={onAddDeposit}>
                <Wallet size={17} />
                Dépôt
              </button>
              <button className="primary-btn" onClick={onAdd}>
                <Plus size={17} />
                Ajouter bénéficiaire
              </button>
            </>
          )}
          {!['Forfait', 'Carburant', 'Avance', 'Frais d’expédition', 'Bonus', 'Autre'].includes(page) && (
            <button className="primary-btn" onClick={onAdd}>
              <Plus size={17} />
              {config.actions?.[0] || 'Ajouter une opération'}
            </button>
          )}
        </div>
      </div>

      <div className="module-stats">
        {stats.map(([label, value], index) => (
          <div className="mini-stat" key={`${page}-${label}`}>
            <span>{label}</span>
            <b>{value}</b>
            <small>{index === 0 ? '↗ données en temps réel' : 'Mise à jour aujourd’hui'}</small>
          </div>
        ))}
      </div>

      {page === 'Bonus' && (
        <div className="bonus-rule">
          <Trophy size={19} />
          <div>
            <b>Règle de calcul du bonus</b>
            <span>7 000 Ar sont attribués lorsque le livreur réalise au moins 70 % de ses livraisons prévues.</span>
          </div>
          <button onClick={() => notify('Bonus éligibles validés')}>Valider les bonus</button>
        </div>
      )}

      {page === 'Carburant' && (
        <div className="feature-strip">
          <div className="feature-icon">
            <MapPin size={20} />
          </div>
          <div>
            <b>Trajets des livreurs</b>
            <span>Consultez les tournées et les kilomètres parcourus par votre équipe.</span>
          </div>
          <button className="outline-btn" onClick={() => notify('Carte de démonstration : 3 trajets disponibles')}>
            Ouvrir la carte <ArrowUpRight size={15} />
          </button>
        </div>
      )}

      {page === 'Forfait' && (
        <div className="operator-strip">
          <span>Solde par opérateur</span>
          <b>
            <i className="operator-dot yas" /> YAS <strong>{money(operatorTotals.YAS)}</strong>
          </b>
          <b>
            <i className="operator-dot orange-op" /> ORANGE <strong>{money(operatorTotals.ORANGE)}</strong>
            <ChevronDown size={14} />
          </b>
        </div>
      )}

      <div className="panel table-panel">
        <div className="table-toolbar">
          <div>
            <h3>Historique des opérations</h3>
            <p>
              {data.length} enregistrement{data.length > 1 ? 's' : ''} au total
            </p>
          </div>
          <div className="table-tools">
            <label className="table-search">
              <Search size={15} />
              <input placeholder="Rechercher..." value={query} onChange={(event) => setQuery(event.target.value)} />
            </label>
            <select className="filter-select" value={filter} onChange={(event) => setFilter(event.target.value)}>
              <option>Tous</option>
              <option>Actif</option>
              <option>Validé</option>
              <option>Livré</option>
            </select>
            <button className="outline-btn export-btn" onClick={onExport}>
              <Download size={15} /> Exporter
            </button>
            <button className="outline-btn" onClick={() => window.print()}>
              <Printer size={15} /> Imprimer
            </button>
          </div>
        </div>

        <TransactionTable rows={data} onEdit={onEdit} onDelete={onDelete} notify={notify} />

        {data.length === 0 && <div className="empty">Aucune opération trouvée.</div>}

        <div className="table-footer">
          <span>
            Affichage de <b>{data.length ? 1 : 0}–{data.length}</b> sur <b>{data.length}</b> résultats
          </span>
          <div className="pagination">
            <button disabled>‹</button>
            <button className="current-page">1</button>
            <button disabled>›</button>
          </div>
        </div>
      </div>
    </>
  );
}
