import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { CategoryDistribution } from '../../types/analytics';

ChartJS.register(ArcElement, Tooltip, Legend);

const CATEGORY_CHART_COLORS: Record<string, string> = {
  "Food": "#10b981",
  "Transport": "#3b82f6",
  "Bills": "#f43f5e",
  "Health": "#06b6d4",
  "Entertainment": "#a855f7",
  "Shopping": "#f59e0b",
  "Other": "#64748b"
};

interface CategoryMixChartProps {
  data: CategoryDistribution[];
  onCategorySelect: (category: string) => void;
}

const CategoryMixChart: React.FC<CategoryMixChartProps> = ({ data, onCategorySelect }) => {
  const labels = data.map(d => d.category);
  const values = data.map(d => d.total);
  const colors = labels.map(l => CATEGORY_CHART_COLORS[l] || '#cbd5e1');

  const chartData = {
    labels,
    datasets: [{
      data: values,
      backgroundColor: colors,
      borderWidth: 0,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    onClick: (_: any, elements: any) => {
      if (elements && elements.length > 0) {
        const index = elements[0].index;
        onCategorySelect(labels[index]);
      }
    },
  };

  const total = values.reduce((a, b) => a + b, 0);

  return (
    <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Category Mix</h2>
      <div className="h-[300px] w-full mb-6">
        <Doughnut data={chartData} options={options} />
      </div>
      <div className="space-y-3">
        {data.map((d, idx) => (
          <div
            key={idx}
            onClick={() => onCategorySelect(d.category)}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div
                className="size-3 rounded-full"
                style={{ backgroundColor: CATEGORY_CHART_COLORS[d.category] || '#cbd5e1' }}
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{d.category}</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900 dark:text-white">₹{(d.total || 0).toLocaleString()}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {total > 0 ? ((d.total / total) * 100).toFixed(1) : '0'}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryMixChart;
