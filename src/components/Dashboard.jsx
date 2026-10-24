import React from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import {
    ArrowUpRight,
    ChevronDown,
    CircleAlert,
    Ellipsis,
    Fuel,
    HandCoins,
    Plus,
    Smartphone,
    Wallet
} from 'lucide-react';
import { money } from '../services/expenseService';
import { getGlobalSnapshot, getMovementKind, isCounted, sumAmounts } from '../utils/finance';
import { compareIsoDesc, formatMonthShort, lastMonthKeys, monthKey } from '../utils/date';

const compactAmount = new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 1 });
import Stat from './Stat';
import TransactionTable from './TransactionTable';

export default function Dashboard({ total, all, onNavigate, notify, onQuickDeposit }) {
    const normalizeCategory = (item) => {
        const label = `${item.type || ''} ${item.description || ''} ${item.name || ''}`.toLowerCase();

        if (getMovementKind(item) === 'deposit' || getMovementKind(item) === 'transfer') return null;
        if (label.includes('carburant') || label.includes('gasoil') || label.includes('essence')) return 'Carburant';
        if (label.includes('avanc') || label.includes('rembours')) return 'Avance';
        if (label.includes('bonus')) return 'Bonus';
        if (label.includes('expédition') || label.includes('colis') || label.includes('transport')) return 'Frais d’expédition';
        if (label.includes('forfait') || label.includes('crédit') || label.includes('orange') || label.includes('yas')) return 'Forfait';
        return 'Autre';
    };

    const palette = {
        Carburant: '#5669e8',
        Forfait: '#30b994',
        Avance: '#f2aa45',
        'Frais d’expédition': '#9672e8',
        Autre: '#48a9e2',
        Bonus: '#ef7892',
        Dépôt: '#14b8a6'
    };

    const globalSnapshot = getGlobalSnapshot(all);

    const charges = all.filter((item) => getMovementKind(item) === 'charge' && isCounted(item));
    const chargeTotal = sumAmounts(charges);

    const categoryTotals = charges.reduce((acc, item) => {
        const category = normalizeCategory(item);
        if (!category) return acc;
        acc[category] = (acc[category] || 0) + Number(item.amount || 0);
        return acc;
    }, { Forfait: 0, Carburant: 0, Avance: 0, 'Frais d’expédition': 0, Bonus: 0, Autre: 0 });

    const remainingBalance = globalSnapshot.balance;
    const distribution = Object.entries(categoryTotals)
        .map(([name, value]) => ({
            name,
            value: chargeTotal > 0 ? Math.round((value / chargeTotal) * 100) : 0,
            color: palette[name] || '#94a3b8'
        }))
        .filter((item) => item.value > 0);

    const pendingCount = all.filter((item) => ['En attente', 'À valider', 'En cours', 'En transit', 'Partiellement remboursée'].includes(item.status)).length;
    const validatedCount = all.filter((item) => ['Validé', 'Livré'].includes(item.status)).length;

    const alerts = [
        ['Solde disponible', `${money(remainingBalance)} restant après charges`, 'amber'],
        ['Forfaits actifs', `${money(categoryTotals.Forfait || 0)} de crédits mobiles`, 'blue'],
        ['Mouvements à traiter', `${pendingCount} éléments en attente de validation`, 'red'],
        ['Opérations validées', `${validatedCount} dépôts ou livraisons validés`, 'green']
    ];

    const monthlyTotals = charges.reduce((acc, item) => {
        const key = monthKey(item.date);
        if (key) acc[key] = (acc[key] || 0) + Number(item.amount || 0);
        return acc;
    }, {});
    const chartData = lastMonthKeys(12).map((key) => ({ m: formatMonthShort(key), v: monthlyTotals[key] || 0 }));
    const chartTotal = chartData.reduce((sum, entry) => sum + entry.v, 0);
    const currentMonthTotal = chartData[chartData.length - 1].v;
    const previousMonthTotal = chartData[chartData.length - 2].v;
    const monthTrend =
        previousMonthTotal > 0 ? Math.round(((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100) : null;

    const recentRows = [...all].sort((a, b) => compareIsoDesc(a.date, b.date)).slice(0, 5);
    const todayLabel = new Date()
        .toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
        .toUpperCase();

    const statCards = [
        { title: 'Solde caisse', value: money(total), change: 'En temps réel', up: true, icon: Wallet, color: 'indigo', sub: 'Dépôts caisse − répartitions' },
        { title: 'Forfaits', value: money(categoryTotals.Forfait || 0), change: `${distribution.find((item) => item.name === 'Forfait')?.value || 0}%`, up: true, icon: Smartphone, color: 'teal', sub: 'Dépenses ce mois' },
        { title: 'Carburant', value: money(categoryTotals.Carburant || 0), change: `${distribution.find((item) => item.name === 'Carburant')?.value || 0}%`, up: true, icon: Fuel, color: 'orange', sub: 'Dépenses ce mois' },
        { title: 'Avances en cours', value: money(categoryTotals.Avance || 0), change: `${pendingCount} dossiers`, icon: HandCoins, color: 'purple', sub: 'À rembourser' }
    ];

  return (
    <>
      <div className="welcome-row">
        <div>
          <div className="eyebrow">{todayLabel}</div>
          <h1>
            Bonjour, Administrateur <span className="wave">✦</span>
          </h1>
          <p>Voici la vue d’ensemble de vos dépenses et opérations.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="outline-btn" onClick={onQuickDeposit}>
            <Wallet size={17} /> Dépôt rapide
          </button>
          <button className="primary-btn" onClick={() => onNavigate('Autre')}>
            <Plus size={17} /> Nouvelle dépense
          </button>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map((stat) => (
          <Stat
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            up={stat.up}
            icon={stat.icon}
            color={stat.color}
            sub={stat.sub}
          />
        ))}
      </div>

      <div className="chart-grid">
        <div className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <h3>Évolution des charges</h3>
              <p>Suivi mensuel de vos dépenses</p>
            </div>
            <button className="select-button">
              12 derniers mois <ChevronDown size={14} />
            </button>
          </div>
          <div className="chart-legend">
            <span>
              <i className="legend-dot indigo-dot" /> Charges totales
            </span>
            <strong>
              {money(chartTotal)}{' '}
              {monthTrend !== null && (
                <em title="Mois en cours par rapport au mois précédent">
                  {monthTrend > 0 ? '+' : ''}
                  {monthTrend}%
                </em>
              )}
            </strong>
          </div>
          <div className="area-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 8, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5e6dea" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#5e6dea" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#edf0f5" vertical={false} />
                <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#99a1b1' }} />
                <YAxis tickFormatter={(value) => compactAmount.format(value)} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#99a1b1' }} />
                <Tooltip formatter={(value) => [money(value), 'Charges']} contentStyle={{ border: '1px solid #edf0f5', borderRadius: 10, fontSize: 12 }} />
                <Area type="monotone" dataKey="v" stroke="#5969e7" strokeWidth={2.5} fill="url(#fill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel chart-panel distribution">
          <div className="panel-heading">
            <div>
              <h3>Répartition des dépenses</h3>
              <p>Par catégorie · {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
            </div>
            <button className="dots-btn">
              <Ellipsis size={19} />
            </button>
          </div>
          <div className="donut-area">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={63} outerRadius={87} paddingAngle={3} stroke="none">
                  {distribution.map((item, index) => (
                    <Cell key={`${item.name}-${index}`} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Part']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-center">
              <b>{money(chargeTotal)}</b>
              <span>Total charges</span>
            </div>
          </div>
          <div className="category-legend">
            {distribution.map((item) => (
              <div key={item.name}>
                <i style={{ background: item.color }} />
                {item.name}
                <b>{item.value}%</b>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lower-grid">
        <div className="panel transactions">
          <div className="panel-heading">
            <div>
              <h3>Dernières opérations</h3>
              <p>Les mouvements récents de votre entreprise</p>
            </div>
            <button className="text-link" onClick={() => onNavigate('Autre')}>
              Voir tout <ArrowUpRight size={15} />
            </button>
          </div>
          <TransactionTable rows={recentRows} compact />
        </div>

        <div className="panel alerts-panel">
          <div className="panel-heading">
            <div>
              <h3>Alertes & rappels</h3>
              <p>Points nécessitant votre attention</p>
            </div>
            <span className="alert-count">{alerts.length}</span>
          </div>
          <div className="alerts-list">
            {alerts.map(([title, description, color]) => (
              <div className="alert-row" key={title}>
                <div className={`alert-icon ${color}`}>
                  <CircleAlert size={16} />
                </div>
                <div className="alert-copy">
                  <b>{title}</b>
                  <span>{description}</span>
                </div>
                <button onClick={() => notify('Alerte consultée')}>
                  <ArrowUpRight size={15} />
                </button>
              </div>
            ))}
          </div>
          <button className="all-alerts" onClick={() => notify('Aucune autre alerte')}>
            Voir toutes les alertes <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </>
  );
}
