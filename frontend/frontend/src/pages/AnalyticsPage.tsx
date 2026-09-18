import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  SummaryStats,
  SpendingTrendsChart,
  CategoryMixChart,
  CategoryTrendsChart,
  DayOfWeekChart,
  AssetCharts,
  TopExpensesTable,
  AnalyticsInsights
} from '../components/analytics';
import { AnalyticsData } from '../types/analytics';

const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState('this_month');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [customRange, setCustomRange] = useState({
    start: '',
    end: '',
  });

  const fetchAnalytics = async (currentRange: string, currentCategory: string) => {
    setLoading(true);
    setError(null);
    try {
      let startDate = '';
      let endDate = '';
      const now = new Date();

      switch (currentRange) {
        case 'this_month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
          endDate = now.toISOString().split('T')[0];
          break;
        case 'last_month':
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          startDate = lastMonth.toISOString().split('T')[0];
          endDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
          break;
        case 'last_3_months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().split('T')[0];
          endDate = now.toISOString().split('T')[0];
          break;
        case 'this_year':
          startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
          endDate = now.toISOString().split('T')[0];
          break;
        case 'all_time':
          startDate = '1970-01-01';
          endDate = now.toISOString().split('T')[0];
          break;
        case 'custom':
          startDate = customRange.start;
          endDate = customRange.end;
          break;
      }

      const response = await axios.get('/api/v1/analytics', {
        params: {
          start_date: startDate,
          end_date: endDate,
          category: currentCategory,
        },
      });
      setData(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(range, categoryFilter);
  }, [range, categoryFilter]);

  const handleApplyCustom = () => {
    if (!customRange.start || !customRange.end) {
      alert('Please select both start and end dates');
      return;
    }
    setRange('custom');
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="size-20 bg-rose-100 dark:bg-rose-900/20 rounded-full flex items-center justify-center mb-4">
          <svg className="size-10 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Something went wrong</h2>
        <p className="text-slate-500 dark:text-slate-400">{error}</p>
        <button
          onClick={() => fetchAnalytics(range, categoryFilter)}
          className="mt-6 px-6 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="size-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <svg className="size-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">No data for this range</h2>
        <p className="text-slate-500 dark:text-slate-400">Try selecting a different time range or adding some transactions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Your Spending Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Analyze your finances and find ways to save.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-full overflow-x-auto no-scrollbar">
            {['this_month', 'last_month', 'last_3_months', 'this_year', 'all_time'].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  range === r
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {r.replace('_', ' ').replace('this', 'This').replace('last', 'Last').replace('all', 'All')}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customRange.start}
              onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
              className="text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <span className="text-slate-400 dark:text-slate-600">to</span>
            <input
              type="date"
              value={customRange.end}
              onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
              className="text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <button
              onClick={handleApplyCustom}
              className="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-3 py-2 rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 animate-pulse rounded"></div>
                <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 animate-pulse rounded"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-[350px] bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />
            <div className="h-[350px] bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <SummaryStats summary={data!.summary} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SpendingTrendsChart data={data!.trends} />
            <CategoryMixChart data={data!.distribution} onCategorySelect={setCategoryFilter} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CategoryTrendsChart data={data!.category_trends} />
            <DayOfWeekChart data={data!.dow_spend} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <AssetCharts data={data!.assets} />
            <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Largest Expenses</h2>
              <TopExpensesTable expenses={data!.top_expenses} />
            </div>
          </div>

          <AnalyticsInsights summary={data!.summary} distribution={data!.distribution} />
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
