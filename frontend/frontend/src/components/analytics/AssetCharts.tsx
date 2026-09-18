import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { AssetMetrics } from '../../types/analytics';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Title);

interface AssetChartsProps {
  data: AssetMetrics;
}

const AssetCharts: React.FC<AssetChartsProps> = ({ data }) => {
  const growthData = {
    labels: (data.growth || []).map(d => d.date),
    datasets: [{
      label: 'Total Assets',
      data: (data.growth || []).map(d => d.total),
      borderColor: '#10b981',
      fill: false,
      tension: 0.4,
    }],
  };

  const allocationData = {
    labels: (data.allocation || []).map(d => d.type),
    datasets: [{
      data: (data.allocation || []).map(d => d.total),
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#a855f7'],
      borderWidth: 0,
    }],
  };

  const optionsLine = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { grid: { display: false } },
    },
    plugins: {
      legend: { display: false },
    },
  };

  const optionsDoughnut = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { boxWidth: 12 },
      },
    },
  };

  return (
    <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Asset Growth</h2>
      <div className="h-[200px] w-full mb-6">
        <Line data={growthData} options={optionsLine} />
      </div>
      <div className="h-[200px] w-full">
        <Doughnut data={allocationData} options={optionsDoughnut} />
      </div>
    </div>
  );
};

export default AssetCharts;
