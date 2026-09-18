import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { CategoryTrend } from '../../types/analytics';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CATEGORY_CHART_COLORS: Record<string, string> = {
  "Food": "#10b981",
  "Transport": "#3b82f6",
  "Bills": "#f43f5e",
  "Health": "#06b6d4",
  "Entertainment": "#a855f7",
  "Shopping": "#f59e0b",
  "Other": "#64748b"
};

interface CategoryTrendsChartProps {
  data: CategoryTrend[];
}

const CategoryTrendsChart: React.FC<CategoryTrendsChartProps> = ({ data }) => {
  const months = [...new Set(data.map(d => d.month))].sort();
  const categories = [...new Set(data.map(d => d.category))];

  const datasets = categories.map(cat => {
    const values = months.map(m => {
      const found = data.find(d => d.month === m && d.category === cat);
      return found ? found.total : 0;
    });
    return {
      label: cat,
      data: values,
      backgroundColor: CATEGORY_CHART_COLORS[cat] || '#cbd5e1',
      borderRadius: 4,
    };
  });

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { stacked: true, grid: { display: false } },
      y: { stacked: true, grid: { color: 'rgba(0,0,0,0.05)' } },
    },
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Monthly Category Trends</h2>
      <div className="h-[300px] w-full">
        <Bar data={{ labels: months, datasets }} options={options} />
      </div>
    </div>
  );
};

export default CategoryTrendsChart;
