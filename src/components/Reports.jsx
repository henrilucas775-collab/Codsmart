import React from 'react';
import { ChartNoAxesCombined, Download, FileSpreadsheet, Filter, Printer } from 'lucide-react';
import { exportCsv, money } from '../services/expenseService';
import { ALLOCATION_PAGES, CAISSE_PAGE, getGlobalSnapshot, getMovementKind, isCounted } from '../utils/finance';
import { compareIsoDesc, formatDate, formatMonth, lastMonthKeys, monthKey } from '../utils/date';

const ALL_PERIODS = 'all';
const LAST_12_MONTHS = 'last12';
const ALL_CATEGORIES = 'Toutes les catégories';
const ALL_EMPLOYEES = 'Tous les employés';
const CATEGORY_OPTIONS = [CAISSE_PAGE, ...ALLOCATION_PAGES];

export default function Reports({ all, notify }) {
  const [period, setPeriod] = React.useState(ALL_PERIODS);
  const [category, setCategory] = React.useState(ALL_CATEGORIES);
  const [employee, setEmployee] = React.useState(ALL_EMPLOYEES);

  // Les options sont tirées des données plutôt que codées en dur.
  const monthOptions = React.useMemo(
    () => [...new Set(all.map((record) => monthKey(record.date)).filter(Boolean))].sort().reverse(),
    [all]
  );
  const employeeOptions = React.useMemo(
    () =>
      [...new Set(all.filter((record) => getMovementKind(record) === 'charge').map((record) => record.name))]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, 'fr')),
    [all]
  );

  const filteredRecords = React.useMemo(() => {
    const recentMonths = new Set(lastMonthKeys(12));
    return all.filter((record) => {
      const matchesCategory =
        category === ALL_CATEGORIES ||
        record.page === category ||
        record.type === category ||
        (record.category && record.category === category);
      const matchesEmployee = employee === ALL_EMPLOYEES || record.name === employee || record.senderName === employee;
      const recordMonth = monthKey(record.date);
      const matchesPeriod =
        period === ALL_PERIODS || (period === LAST_12_MONTHS ? recentMonths.has(recordMonth) : recordMonth === period);

      return matchesCategory && matchesEmployee && matchesPeriod;
    });
  }, [all, category, employee, period]);

  const globalSnapshot = getGlobalSnapshot(filteredRecords);
  const totalDeposits = globalSnapshot.deposits;
  const totalAllocations = globalSnapshot.transfers;
  const balance = globalSnapshot.balance;

  const charges = filteredRecords.filter((record) => getMovementKind(record) === 'charge' && isCounted(record));
  const chargeTotal = globalSnapshot.charges;

  const categorySummary = Object.entries(
    charges.reduce((acc, record) => {
      const key = record.page || record.type || 'Autre';
      acc[key] = (acc[key] || 0) + Number(record.amount || 0);
      return acc;
    }, {})
  )
    .map(([categoryName, amount]) => ({
      category: categoryName,
      amount,
      share: chargeTotal > 0 ? Math.round((amount / chargeTotal) * 100) : 0
    }))
    .sort((a, b) => b.amount - a.amount);

  const movements = [...filteredRecords]
    .sort((a, b) => compareIsoDesc(a.date, b.date))
    .map((record) => ({
      ...record,
      direction:
        getMovementKind(record) === 'deposit'
          ? 'deposit'
          : getMovementKind(record) === 'transfer'
            ? 'transfer'
            : 'charge'
    }));

  const exportReport = () => {
    const suffix = period === ALL_PERIODS ? 'complet' : period === LAST_12_MONTHS ? '12-derniers-mois' : period;
    exportCsv(movements, `rapport-${suffix}.csv`);
    notify('Export CSV téléchargé');
  };

  return (
    <>
      <div className="module-title-row">
        <div>
          <div className="eyebrow">GESTION FINANCIÈRE / ANALYSE</div>
          <h1>
            <span className="title-icon">
              <ChartNoAxesCombined size={21} />
            </span>
            Rapports & analyses
          </h1>
          <p>Explorez et exportez les données de dépenses de votre entreprise.</p>
        </div>
        <button className="primary-btn" onClick={exportReport}>
          <Download size={16} />
          Exporter le rapport
        </button>
      </div>

      <div className="report-filters panel">
        <div className="filter-heading">
          <Filter size={17} />
          <b>Filtres du rapport</b>
        </div>
        <label>
          Période
          <select value={period} onChange={(event) => setPeriod(event.target.value)}>
            <option value={ALL_PERIODS}>Toutes les périodes</option>
            <option value={LAST_12_MONTHS}>12 derniers mois</option>
            {monthOptions.map((key) => (
              <option key={key} value={key}>
                {formatMonth(key)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Catégorie
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option>{ALL_CATEGORIES}</option>
            {CATEGORY_OPTIONS.map((label) => (
              <option key={label}>{label}</option>
            ))}
          </select>
        </label>
        <label>
          Employé
          <select value={employee} onChange={(event) => setEmployee(event.target.value)}>
            <option>{ALL_EMPLOYEES}</option>
            {employeeOptions.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="module-stats">
        <div className="mini-stat">
          <span>Solde disponible</span>
          <b>{money(balance)}</b>
          <small>Dépôts caisse − répartitions</small>
        </div>
        <div className="mini-stat">
          <span>Charges totales</span>
          <b>{money(chargeTotal)}</b>
          <small>Sur toutes catégories</small>
        </div>
        <div className="mini-stat">
          <span>Dépôts</span>
          <b>{money(totalDeposits)}</b>
          <small>Menu Dépôt uniquement</small>
        </div>
        <div className="mini-stat">
          <span>Répartitions</span>
          <b>{money(totalAllocations)}</b>
          <small>Vers Forfait, Carburant, etc.</small>
        </div>
      </div>

      <div className="panel">
        <div className="panel-heading">
          <div>
            <h3>Solde par catégorie</h3>
            <p>Répartition détaillée des charges</p>
          </div>
        </div>
        <div className="category-legend" style={{ padding: '0 0 10px' }}>
          {categorySummary.map((item) => (
            <div key={item.category}>
              <i
                style={{
                  background:
                    item.category === 'Carburant'
                      ? '#5669e8'
                      : item.category === 'Forfait'
                        ? '#30b994'
                        : item.category === 'Avance'
                          ? '#f2aa45'
                          : item.category === 'Frais d’expédition'
                            ? '#9672e8'
                            : item.category === 'Bonus'
                              ? '#ef7892'
                              : '#48a9e2'
                }}
              />
              {item.category}
              <b>
                {money(item.amount)} · {item.share}%
              </b>
            </div>
          ))}
        </div>
      </div>

      <div className="panel table-panel">
        <div className="table-toolbar">
          <div>
            <h3>Historique des mouvements</h3>
            <p>Dépôts et charges classés par date</p>
          </div>
          <div className="table-tools">
            <button className="outline-btn" onClick={exportReport}>
              <FileSpreadsheet size={15} /> Excel / CSV
            </button>
            <button className="outline-btn" onClick={() => window.print()}>
              <Printer size={15} /> Imprimer
            </button>
          </div>
        </div>

        <div className="movement-list" style={{ display: 'grid', gap: '12px', padding: '16px 0 8px' }}>
          {movements.map((record) => {
            const isBeneficiaryEntry = record.type === 'Bénéficiaire';
            const title = isBeneficiaryEntry ? 'Ajout d’un membre' : record.name;
            const amountText = isBeneficiaryEntry
              ? 'Membre ajouté'
              : record.direction === 'deposit'
                ? `+${money(record.amount)}`
                : record.direction === 'transfer'
                  ? `→ ${money(record.amount)}`
                  : `−${money(record.amount)}`;
            const amountColor = isBeneficiaryEntry
              ? '#0f766e'
              : record.direction === 'deposit'
                ? '#0f766e'
                : record.direction === 'transfer'
                  ? '#0369a1'
                  : '#b45309';

            return (
              <div
                key={record.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  background:
                    record.direction === 'deposit' ? 'var(--color-success-soft)' : 'var(--color-surface-muted)'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <strong>{title}</strong>
                  <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-muted)' }}>
                    {formatDate(record.date)} · {record.type}
                  </span>
                  <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-secondary)' }}>
                    {record.description || (isBeneficiaryEntry ? 'Nouveau membre ajouté à la liste' : '—')}
                  </span>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <b style={{ color: amountColor }}>{amountText}</b>
                  <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-muted)' }}>
                    {isBeneficiaryEntry ? 'Membre ajouté' : record.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
