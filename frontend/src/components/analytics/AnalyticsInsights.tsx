import React from 'react';
import { AnalyticsSummary, CategoryDistribution } from '../../types/analytics';

interface AnalyticsInsightsProps {
  summary: AnalyticsSummary;
  distribution: CategoryDistribution[];
}

const AnalyticsInsights: React.FC<AnalyticsInsightsProps> = ({ summary, distribution }) => {
  const insights: string[] = [];

  if (summary.net_savings < 0) {
    insights.push(`You've spent ₹${Math.abs(summary.net_savings).toLocaleString()} more than you earned this month.`);
  } else {
    insights.push(`Great job! You saved ₹${summary.net_savings.toLocaleString()} this period.`);
  }

  if (distribution && distribution.length > 0) {
    const top = distribution[0];
    const total = distribution.reduce((a, b) => a + (b.total || 0), 0);
    insights.push(`Your highest spend is in ${top.category}, accounting for ${total > 0 ? ((top.total / total) * 100).toFixed(1) : '0'}% of expenses.`);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {insights.map((text, idx) => (
        <div
          key={idx}
          className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 text-sm font-medium"
        >
          <span className="font-bold">💡 Insight:</span> {text}
        </div>
      ))}
    </div>
  );
};

export default AnalyticsInsights;
