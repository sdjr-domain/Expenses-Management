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
import { DayOfWeekSpend } from '../../types/analytics';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface DayOfWeekChartProps {
  data: DayOfWeekSpend[];
}

const DayOfWeekChart: React.FC<DayOfWeekChartProps> = ({ data }) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const values = new Array(7).fill(0);
  data.forEach(d => {
    const index = parseInt(d.dow);
    if (index >= 0 && index < 7) {
      values[index] = d.total;
    }
  });

  const chartData = {
    labels: days,
    datasets: [{
      label: 'Spending',
      data: values,
      backgroundColor: '#6366f1',
      borderRadius: 6,
    }],
  };

  const options = {
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

  return (
    <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Spend by Day of Week</h2>
      <div className="h-[300px] w-full">
        <Bar data={chartData} options={options} />
      </div}
    </div>
  );
};

export default DayOfWeekChart;
