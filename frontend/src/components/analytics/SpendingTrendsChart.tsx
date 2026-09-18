import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { SpendingTrend } from '../../types/analytics';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SpendingTrendsChartProps {
  data: SpendingTrend[];
}

const SpendingTrendsChart: React.FC<SpendingTrendsChartProps> = ({ data }) => {
  const [isCumulative, setIsCumulative] = useState(false);

  const labels = data.map(d => d.period);
  let expenseData = data.map(d => d.expense);
  let incomeData = data.map(d => d.income);

  if (isCumulative) {
    let cumExp = 0, cumInc = 0;
    expenseData = expenseData.map(v => cumExp += v);
    incomeData = incomeData.map(v => cumInc += v);
  }

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Expenses',
        data: expenseData,
        borderColor: '#f43f5e',
        backgroundColor: 'rgba(244, 63, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Income',
        data: incomeData,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          font: { family: 'Inter' },
          color: 'rgba(148, 163, 184, 1)', // slate-400
        },
      },
    },
    scales: {
      y: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: {
          font: { family: 'Inter' },
          color: 'rgba(148, 163, 184, 1)',
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          font: { family: 'Inter' },
          color: 'rgba(148, 163, 184, 1)',
        },
      },
    },
  };

  return (
    <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Spending vs Income</h2>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setIsCumulative(false)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              !isCumulative
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Per Period
          </button>
          <button
            onClick={() => setIsCumulative(true)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              isCumulative
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Cumulative
          </button>
        </div}
      </div}
      <div className="h-[300px] w-full">
        <Line data={chartData} options={options} />
      </div}
    </div>
  );
};

export default SpendingTrendsChart;
