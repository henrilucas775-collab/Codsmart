import React from 'react';
import { CalendarCheck, FileText, Users, Wallet } from 'lucide-react';
import { money } from '../../utils/payroll';
import Stat from '../Stat';

export default function PayrollDashboard({ stats, period, onNavigate, notify }) {
  const cards = [
    {
      title: 'Employés actifs',
      value: String(stats.activeEmployees),
      change: 'Effectif',
      icon: Users,
      color: 'indigo',
      sub: 'Référentiel RH'
    },
    {
      title: 'Masse nette du mois',
      value: money(stats.payrollMass),
      change: period,
      icon: Wallet,
      color: 'teal',
      sub: 'Bulletins validés / brouillon'
    },
    {
      title: 'Jours de présence',
      value: String(stats.presentTotal),
      change: 'Total saisi',
      icon: CalendarCheck,
      color: 'orange',
      sub: 'Sur la période'
    },
    {
      title: 'Bulletins',
      value: String(stats.payslipCount),
      change: 'Période en cours',
      icon: FileText,
      color: 'purple',
      sub: 'Fiches de paie'
    }
  ];

  return (
    <>
      <div className="welcome-row">
        <div>
          <div className="eyebrow">PAIE & PRÉSENCE</div>
          <h1>
            Espace RH <span className="wave">✦</span>
          </h1>
          <p>Suivez les employés, la présence mensuelle et les bulletins de paie.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="outline-btn" onClick={() => onNavigate('Présence')}>
            Saisir la présence
          </button>
          <button className="primary-btn" onClick={() => onNavigate('Bulletins de paie')}>
            Ouvrir les bulletins
          </button>
        </div>
      </div>

      <div className="stats-grid">
        {cards.map((stat) => (
          <Stat key={stat.title} {...stat} up />
        ))}
      </div>

      <div className="panel">
        <div className="panel-heading">
          <div>
            <h3>Parcours recommandé</h3>
            <p>Ordre de saisie pour clôturer un mois</p>
          </div>
        </div>
        <div className="movement-list" style={{ display: 'grid', gap: 12, padding: '8px 0 16px' }}>
          {[
            ['1', 'Employés', 'Créez ou mettez à jour le référentiel (matricule, salaire de base).'],
            ['2', 'Présence', 'Saisissez jours présents, absences et montant des heures supplémentaires.'],
            ['3', 'Bulletins', 'Générez la fiche à partir de la présence, ajustez IRSA et avances, puis validez.']
          ].map(([step, title, text]) => (
            <button
              key={step}
              type="button"
              className="alert-row"
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--color-surface)',
                padding: '10px 12px',
                textAlign: 'left'
              }}
              onClick={() =>
                onNavigate(title === 'Employés' ? 'Employés' : title === 'Présence' ? 'Présence' : 'Bulletins de paie')
              }
            >
              <div className="alert-icon blue">
                <span>{step}</span>
              </div>
              <div className="alert-copy">
                <b>{title}</b>
                <span>{text}</span>
              </div>
            </button>
          ))}
        </div>
        <button className="text-link" type="button" onClick={() => notify('Export RH bientôt disponible')}>
          Exporter le récapitulatif du mois
        </button>
      </div>
    </>
  );
}
