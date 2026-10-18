import React from 'react';
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  ChartNoAxesCombined,
  Fuel,
  HandCoins,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  Package,
  PanelLeftClose,
  Search,
  Settings,
  Smartphone,
  Trophy,
  Users,
  Wallet
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import ModulePage from './components/ModulePage';
import RecordModal from './components/RecordModal';
import Reports from './components/Reports';
import { nav } from './data/seed';
import { useExpenseStore } from './store/expenseStore';

const iconMap = {
  'Tableau de bord': LayoutDashboard,
  Dépôt: Wallet,
  Bénéficiaires: Users,
  Forfait: Smartphone,
  Carburant: Fuel,
  Avance: HandCoins,
  'Frais d’expédition': Package,
  Bonus: Trophy,
  Autre: MoreHorizontal,
  Rapports: ChartNoAxesCombined
};

export default function App() {
  const {
    page,
    setPage,
    collapsed,
    setCollapsed,
    mobile,
    setMobile,
    query,
    setQuery,
    filter,
    setFilter,
    total,
    all,
    filtered,
    modal,
    edit,
    setEdit,
    setModal,
    toast,
    notify,
    records,
    pageRecords,
    saveRecord,
    removeRecord,
    exportCSV
  } = useExpenseStore();
  const [modalPreset, setModalPreset] = React.useState(null);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobile ? 'mobile-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">
            <Wallet size={20} />
          </div>
          {!collapsed && (
            <div>
              <b>Charge Smart</b>
              <small>GESTION FINANCIÈRE</small>
            </div>
          )}
          <button className="side-toggle" onClick={() => setCollapsed(!collapsed)} title="Réduire le menu">
            <PanelLeftClose size={17} />
          </button>
        </div>

        <div className="workspace">
          <div className="workspace-logo">C</div>
          {!collapsed && (
            <div>
              <b>Entreprise Mada</b>
              <small>Espace de travail</small>
            </div>
          )}
          <ChevronDown size={15} />
        </div>

        {!collapsed && <div className="nav-caption">ESPACE DE TRAVAIL</div>}

        <nav>
          {nav.map(([label]) => {
            const Icon = iconMap[label];
            return (
              <button
                key={label}
                className={`nav-item ${page === label ? 'active' : ''}`}
                onClick={() => {
                  setPage(label);
                  setMobile(false);
                  setQuery('');
                }}
                title={label}
              >
                <Icon size={18} />
                {!collapsed && <span>{label}</span>}
                {label === 'Bonus' && !collapsed && <i className="nav-count">2</i>}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="nav-caption">PRÉFÉRENCES</div>
          <button className="nav-item" onClick={() => notify('Paramètres bientôt disponibles')}>
            <Settings size={18} />
            {!collapsed && <span>Paramètres</span>}
          </button>

          <div className="user-card">
            <div className="avatar">AM</div>
            {!collapsed && (
              <div className="user-info">
                <b>Administrateur</b>
                <small>admin@entreprise.mg</small>
              </div>
            )}
            <button className="logout" onClick={() => notify('Session de démonstration active')}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {mobile && <div className="scrim" onClick={() => setMobile(false)} />}

      <main className="main-area">
        <header className="topbar">
          <div className="top-left">
            <button className="icon-button mobile-menu" onClick={() => setMobile(true)}>
              <Menu size={20} />
            </button>
            <div className="breadcrumb">
              Entreprise Mada <span>/</span> <b>{page}</b>
            </div>
          </div>

          <div className="top-actions">
            <label className="global-search">
              <Search size={16} />
              <input placeholder="Rechercher..." value={query} onChange={(event) => setQuery(event.target.value)} />
              <kbd>⌘ K</kbd>
            </label>
            <button className="icon-button notification" onClick={() => notify('Vous êtes à jour')}>
              <Bell size={18} />
              <i />
            </button>
            <div className="top-avatar">AM</div>
          </div>
        </header>

        <section className="content">
          {page === 'Tableau de bord' ? (
            <Dashboard
              total={total}
              all={all}
              onNavigate={setPage}
              notify={notify}
              onQuickDeposit={() => {
                setPage('Dépôt');
                setEdit(null);
                setModal(true);
              }}
            />
          ) : page === 'Rapports' ? (
            <Reports all={all} notify={notify} onExport={exportCSV} />
          ) : (
            <ModulePage
              page={page}
              data={filtered}
              pageRecords={pageRecords}
              allRecords={all}
              total={pageRecords.reduce((sum, item) => sum + item.amount, 0)}
              query={query}
              setQuery={setQuery}
              filter={filter}
              setFilter={setFilter}
              onAdd={() => {
                setEdit(null);
                setModalPreset(null);
                setModal(true);
              }}
              onAddDeposit={() => {
                const isInitialDeposit = page === 'Dépôt';
                const depositLabel = isInitialDeposit
                  ? 'Dépôt caisse'
                  : page === 'Forfait'
                    ? 'Dépôt forfait'
                    : `Dépôt ${page.toLowerCase()}`;
                const depositDescription = isInitialDeposit
                  ? 'Versement de solde initial'
                  : page === 'Forfait'
                    ? 'Versement pour le forfait'
                    : `Répartition du solde initial pour ${page.toLowerCase()}`;

                setEdit(null);
                setModalPreset({
                  name: depositLabel,
                  type: isInitialDeposit ? 'Dépôt' : 'Répartition',
                  recordKind: isInitialDeposit ? 'deposit' : 'transfer',
                  page: isInitialDeposit ? 'Dépôt' : page,
                  description: depositDescription,
                  amount: '',
                  date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
                  status: 'Validé',
                  beneficiaryType: 'Commercial'
                });
                setModal(true);
              }}
              onEdit={(record) => {
                setEdit(record);
                setModalPreset(null);
                setModal(true);
              }}
              onDelete={removeRecord}
              onExport={exportCSV}
              notify={notify}
            />
          )}
        </section>
      </main>

      {modal && (
        <RecordModal
          page={page}
          initial={edit}
          preset={modalPreset}
          beneficiaries={records.Bénéficiaires || []}
          records={records}
          onClose={() => {
            setModal(false);
            setEdit(null);
            setModalPreset(null);
          }}
          onSave={(record) => {
            setModalPreset(null);
            saveRecord(record);
          }}
        />
      )}

      {toast && (
        <div className="toast">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}
    </div>
  );
}
