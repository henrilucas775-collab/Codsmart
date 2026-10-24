import React from 'react';
import {
  Bell,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  ChartNoAxesCombined,
  FileText,
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
import AttendancePage from './components/payroll/AttendancePage';
import AdvancePage from './components/payroll/AdvancePage';
import EmployeeModal from './components/payroll/EmployeeModal';
import EmployeesPage from './components/payroll/EmployeesPage';
import PayrollDashboard from './components/payroll/PayrollDashboard';
import PayrollReports from './components/payroll/PayrollReports';
import PayslipModal from './components/payroll/PayslipModal';
import PayslipsPage from './components/payroll/PayslipsPage';
import { nav } from './data/seed';
import { payrollNav } from './data/payrollSeed';
import { useExpenseStore } from './store/expenseStore';
import { usePayrollStore } from './store/payrollStore';
import { todayIso } from './utils/date';

const chargeIconMap = {
  'Tableau de bord': LayoutDashboard,
  Dépôt: Wallet,
  Forfait: Smartphone,
  Carburant: Fuel,
  'Frais d’expédition': Package,
  Bonus: Trophy,
  Autre: MoreHorizontal,
  Rapports: ChartNoAxesCombined
};

const payrollIconMap = {
  'Tableau de bord RH': LayoutDashboard,
  Employés: Users,
  Présence: CalendarCheck,
  Avance: HandCoins,
  'Bulletins de paie': FileText,
  'Rapports RH': ChartNoAxesCombined
};

const workspaces = [
  {
    id: 'charges',
    logo: 'C',
    name: 'Gestion des charges',
    hint: 'Caisse, répartitions, dépenses',
    brandSub: 'GESTION FINANCIÈRE',
    BrandIcon: Wallet
  },
  {
    id: 'paie',
    logo: 'P',
    name: 'Paie & présence',
    hint: 'Employés, présence, bulletins',
    brandSub: 'PAIE & PRÉSENCE',
    BrandIcon: FileText
  }
];

export default function App() {
  const expense = useExpenseStore();
  const payroll = usePayrollStore();
  const [workspaceId, setWorkspaceId] = React.useState('charges');
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = React.useState(false);
  const [modalPreset, setModalPreset] = React.useState(null);
  const workspaceRef = React.useRef(null);

  const workspace = workspaces.find((item) => item.id === workspaceId) || workspaces[0];
  const isCharges = workspaceId === 'charges';

  const page = isCharges ? expense.page : payroll.page;
  const setPage = isCharges ? expense.setPage : payroll.setPage;
  const query = isCharges ? expense.query : payroll.query;
  const setQuery = isCharges ? expense.setQuery : payroll.setQuery;
  const toast = isCharges ? expense.toast : payroll.toast;
  const notify = isCharges ? expense.notify : payroll.notify;
  const collapsed = expense.collapsed;
  const setCollapsed = expense.setCollapsed;
  const mobile = expense.mobile;
  const setMobile = expense.setMobile;

  React.useEffect(() => {
    const onDocClick = (event) => {
      if (workspaceRef.current && !workspaceRef.current.contains(event.target)) {
        setWorkspaceMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const switchWorkspace = (id) => {
    setWorkspaceId(id);
    setWorkspaceMenuOpen(false);
    setMobile(false);
    setQuery('');
    if (id === 'charges') {
      expense.setPage('Tableau de bord');
    } else {
      payroll.setPage(payrollNav[0]);
    }
  };

  const navItems = isCharges ? nav : payrollNav;
  const loadErrors = [expense.loadError, payroll.loadError].filter(Boolean);
  const iconMap = isCharges ? chargeIconMap : payrollIconMap;

  const renderPayrollContent = () => {
    switch (payroll.page) {
      case 'Tableau de bord RH':
        return (
          <PayrollDashboard
            stats={payroll.stats}
            period={payroll.period}
            onNavigate={payroll.setPage}
            notify={payroll.notify}
          />
        );
      case 'Employés':
        return (
          <EmployeesPage
            employees={payroll.filteredEmployees}
            query={payroll.query}
            setQuery={payroll.setQuery}
            onAdd={() => payroll.setEmployeeModal({})}
            onEdit={(employee) => payroll.setEmployeeModal(employee)}
            onDelete={payroll.removeEmployee}
          />
        );
      case 'Présence':
        return (
          <AttendancePage
            employees={payroll.employees}
            attendance={payroll.periodAttendance}
            period={payroll.period}
            setPeriod={payroll.setPeriod}
            onSave={payroll.saveAttendance}
          />
        );
      case 'Avance':
        return (
          <AdvancePage
            employees={payroll.employees}
            attendance={payroll.periodAttendance}
            period={payroll.period}
            setPeriod={payroll.setPeriod}
            onSave={payroll.saveAttendance}
          />
        );
      case 'Bulletins de paie':
        return (
          <PayslipsPage
            employer={payroll.data.employer}
            employees={payroll.employees}
            payslips={payroll.periodPayslips}
            period={payroll.period}
            setPeriod={payroll.setPeriod}
            onCreate={payroll.createPayslipForEmployee}
            onEdit={(slip) => payroll.setPayslipModal(slip)}
            onDelete={payroll.removePayslip}
          />
        );
      case 'Rapports RH':
        return (
          <PayrollReports
            employees={payroll.employees}
            payslips={payroll.periodPayslips}
            period={payroll.period}
            attendance={payroll.periodAttendance}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobile ? 'mobile-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">
            <workspace.BrandIcon size={20} />
          </div>
          {!collapsed && (
            <div>
              <b>Charge Smart</b>
              <small>{workspace.brandSub}</small>
            </div>
          )}
          <button className="side-toggle" type="button" onClick={() => setCollapsed(!collapsed)} title="Réduire le menu">
            <PanelLeftClose size={17} />
          </button>
        </div>

        <div className="workspace-wrap" ref={workspaceRef}>
          <button
            type="button"
            className="workspace workspace-button"
            onClick={() => {
              if (collapsed) {
                switchWorkspace(workspaceId === 'charges' ? 'paie' : 'charges');
                return;
              }
              setWorkspaceMenuOpen((open) => !open);
            }}
            aria-expanded={workspaceMenuOpen}
            title="Changer d’espace de travail"
          >
            <div className="workspace-logo">{workspace.logo}</div>
            {!collapsed && (
              <div>
                <b>{workspace.name}</b>
                <small>{workspace.hint}</small>
              </div>
            )}
            <ChevronDown size={15} />
          </button>
          {workspaceMenuOpen && !collapsed && (
            <div className="workspace-menu">
              {workspaces.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`workspace-option ${item.id === workspaceId ? 'active' : ''}`}
                  onClick={() => switchWorkspace(item.id)}
                >
                  <span className="workspace-logo">{item.logo}</span>
                  <span>
                    <b>{item.name}</b>
                    <small>{item.hint}</small>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {!collapsed && <div className="nav-caption">ESPACE DE TRAVAIL</div>}

        <nav>
          {navItems.map((label) => {
            const Icon = iconMap[label];
            return (
              <button
                key={label}
                type="button"
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
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="nav-caption">PRÉFÉRENCES</div>
          <button type="button" className="nav-item" onClick={() => notify('Paramètres bientôt disponibles')}>
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
            <button type="button" className="logout" onClick={() => notify('Session de démonstration active')}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {mobile && <div className="scrim" onClick={() => setMobile(false)} />}

      <main className="main-area">
        <header className="topbar">
          <div className="top-left">
            <button type="button" className="icon-button mobile-menu" onClick={() => setMobile(true)}>
              <Menu size={20} />
            </button>
            <div className="breadcrumb">
              Entreprise Mada <span>/</span> <b>{page}</b>
            </div>
          </div>

          <div className="top-actions">
            <label className="global-search">
              <Search size={16} />
              <input
                placeholder="Rechercher..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <kbd>⌘ K</kbd>
            </label>
            <button type="button" className="icon-button notification" onClick={() => notify('Vous êtes à jour')}>
              <Bell size={18} />
              <i />
            </button>
            <div className="top-avatar">AM</div>
          </div>
        </header>

        <section className="content">
          {loadErrors.map((message) => (
            <div className="load-error" role="alert" key={message}>
              {message}
            </div>
          ))}
          {isCharges ? (
            expense.page === 'Tableau de bord' ? (
              <Dashboard
                total={expense.total}
                all={expense.all}
                onNavigate={expense.setPage}
                notify={expense.notify}
                onQuickDeposit={() => {
                  expense.setPage('Dépôt');
                  expense.setEdit(null);
                  expense.setModal(true);
                }}
              />
            ) : expense.page === 'Rapports' ? (
              <Reports all={expense.all} notify={expense.notify} />
            ) : (
              <ModulePage
                page={expense.page}
                data={expense.filtered}
                pageRecords={expense.pageRecords}
                allRecords={expense.all}
                query={expense.query}
                setQuery={expense.setQuery}
                filter={expense.filter}
                setFilter={expense.setFilter}
                onAdd={() => {
                  expense.setEdit(null);
                  setModalPreset(null);
                  expense.setModal(true);
                }}
                onAddDeposit={() => {
                  const isInitialDeposit = expense.page === 'Dépôt';
                  expense.setEdit(null);
                  setModalPreset({
                    type: isInitialDeposit ? 'Dépôt' : 'Répartition',
                    recordKind: isInitialDeposit ? 'deposit' : 'transfer',
                    page: isInitialDeposit ? 'Dépôt' : expense.page,
                    date: todayIso(),
                    status: 'Validé'
                  });
                  expense.setModal(true);
                }}
                onEdit={(record) => {
                  expense.setEdit(record);
                  setModalPreset(null);
                  expense.setModal(true);
                }}
                onDelete={expense.removeRecord}
                onExport={expense.exportCSV}
                notify={expense.notify}
              />
            )
          ) : (
            renderPayrollContent()
          )}
        </section>
      </main>

      {isCharges && expense.modal && (
        <RecordModal
          page={expense.page}
          initial={expense.edit}
          preset={modalPreset}
          beneficiaries={payroll.employees.map((employee) => ({
            ...employee,
            id: employee.id,
            name: employee.name,
            beneficiaryType: employee.function || 'Commercial',
            role: employee.function || 'Commercial',
            floatNumberYas: employee.floatNumberYas || employee.floatNumber?.YAS || '',
            floatNumberOrange: employee.floatNumberOrange || employee.floatNumber?.ORANGE || '',
            floatNumber: employee.floatNumber || {
              YAS: employee.floatNumberYas || employee.floatNumber?.YAS || '',
              ORANGE: employee.floatNumberOrange || employee.floatNumber?.ORANGE || ''
            }
          }))}
          records={expense.records}
          onClose={() => {
            expense.setModal(false);
            expense.setEdit(null);
            setModalPreset(null);
          }}
          onSave={(record) => {
            setModalPreset(null);
            expense.saveRecord(record);
          }}
        />
      )}

      {payroll.employeeModal && (
        <EmployeeModal
          initial={payroll.employeeModal}
          onClose={() => payroll.setEmployeeModal(null)}
          onSave={payroll.saveEmployee}
        />
      )}

      {payroll.payslipModal && (
        <PayslipModal
          initial={payroll.payslipModal}
          employer={payroll.data.employer}
          employee={payroll.employees.find((item) => item.id === payroll.payslipModal.employeeId)}
          onClose={() => payroll.setPayslipModal(null)}
          onSave={payroll.savePayslip}
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
