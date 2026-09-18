import React from 'react';
import { TopExpense } from '../../types/analytics';

interface TopExpensesTableProps {
  expenses: TopExpense[];
}

const CATEGORY_CHART_COLORS: Record<string, string> = {
  "Food": "#10b981",
  "Transport": "#3b82f6",
  "Bills": "#f43f5e",
  "Health": "#06b6d4",
  "Entertainment": "#a855f7",
  "Shopping": "#f59e0b",
  "Other": "#64748b"
};

const TopExpensesTable: React.FC<TopExpensesTableProps> = ({ expenses }) => {
  if (!expenses || expenses.length === 0) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <tbody>
            <tr>
              <td colSpan={4} className="py-4 text-center text-slate-400 italic">
                No transactions found for this range.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
            <th className="pb-3 font-medium">Date</th>
            <th className="pb-3 font-medium">Category</th>
            <th className="pb-3 font-medium">Description</th>
            <th className="pb-3 font-medium text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp, idx) => (
            <tr key={idx} className="border-b border-slate-50 dark:border-slate-800 last:border-0">
              <td className="py-3 text-slate-600 dark:text-slate-400">{exp.date}</td>
              <td className="py-3">
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                  style={{
                    backgroundColor: `${CATEGORY_CHART_COLORS[exp.category] || '#cbd5e1'}20`,
                    color: CATEGORY_CHART_COLORS[exp.category] || '#64748b',
                  }}
                >
                  {exp.category}
                </span>
              </td>
              <td className="py-3 text-slate-700 dark:text-slate-300">{exp.description || 'No description'}</td>
              <td className="py-3 text-right font-bold text-slate-900 dark:text-white">
                ₹{(exp.amount || 0).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopExpensesTable;
