import React from 'react';
import { AnalyticsSummary } from '../../types/analytics';

interface SummaryStatsProps {
  summary: AnalyticsSummary;
}

const SummaryStats: React.FC<SummaryStatsProps> = ({ summary }) => {
  const currency = '₹';

  const cards = [
    { label: 'Total Expenses', value: `${currency}${(summary.total_expenses || 0).toLocaleString()}`, color: 'text-rose-600' },
    { label: 'Total Income', value: `${currency}${(summary.total_income || 0).toLocaleString()}`, color: 'text-emerald-600' },
    { label: 'Net Savings', value: `${currency}${(summary.net_savings || 0).toLocaleString()}`, color: 'text-blue-600' },
    { label: 'Savings Rate', value: `${(summary.savings_rate || 0)}%`, color: 'text-indigo-600' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div key={idx} className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
          <p className={`text-2xl font-bold ${card.color} dark:text-white mt-1`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
};

export default SummaryStats;
