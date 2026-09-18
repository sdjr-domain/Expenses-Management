import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuthStore } from '../store/useAuthStore';

interface Expense {
  id: number;
  amount: number;
  category: string;
  date: string;
  description: string;
}

interface DashboardData {
  summary: {
    total_income: number;
    total_expenses: number;
    balance: number;
  };
  categories: { category: string; total: number }[];
  expenses: Expense[];
  category_colors: Record<string, string>;
  user_categories: { id: number; name: string; color: string }[];
  total_assets: number;
  total_count: number;
  limit: number;
  offset: number;
  total_transactions: number;
}

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sort, setSort] = useState('date_desc');
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const limit = 10;

  const fetchDashboard = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await apiClient.get(`/dashboard?category=${filterCategory}&start_date=${startDate}&end_date=${endDate}&sort=${sort}&limit=${limit}&offset=${offset}`);
      setData(res);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [filterCategory, startDate, endDate, sort, offset]);

  const handleNextPage = () => setOffset(prev => prev + limit);
  const handlePrevPage = () => setOffset(prev => Math.max(0, prev - limit));

  if (isLoading && !data) return <div className="text-center py-12">Loading dashboard...</div>;
  if (error) return <div className="text-center py-12 text-rose-500">{error}</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Financial Overview</h1>
        <Button onClick={() => navigate('/transactions/add')}>Add Transaction</Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">Total Balance</p>
          <p className="text-3xl font-bold text-slate-900">₹{data?.summary.balance.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">Total Income</p>
          <p className="text-3xl font-bold text-emerald-600">₹{data?.summary.total_income.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">Total Expenses</p>
          <p className="text-3xl font-bold text-rose-600">₹{data?.summary.total_expenses.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
          <h2 className="text-lg font-semibold mb-4">Spending by Category</h2>
          <div className="space-y-3">
            {data?.categories.map((cat: any) => (
              <div key={cat.category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${data?.category_colors[cat.category] || 'bg-slate-400'}`} />
                  <span className="text-sm text-slate-600">{cat.category}</span>
                </div>
                <span className="text-sm font-medium text-slate-900">₹{cat.total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            <Input
              label="Category"
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setOffset(0); }}
              placeholder="Filter by category..."
              className="max-w-xs"
            />
            <Input
              label="From"
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setOffset(0); }}
            />
            <Input
              label="To"
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setOffset(0); }}
            />
            <Button variant="ghost" onClick={() => { setFilterCategory(''); setStartDate(''); setEndDate(''); setOffset(0); }}>
              Reset
            </Button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Date</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Category</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Description</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.expenses.length > 0 ? data.expenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-500">{exp.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${data?.category_colors[exp.category] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{exp.description}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 text-right">
                      -₹{exp.amount.toLocaleString()}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">No expenses found.</td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">Showing {offset + 1} - {Math.min(offset + limit, data?.total_count || 0)} of {data?.total_count || 0}</span>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={handlePrevPage} disabled={offset === 0} className="px-3 py-1 text-sm">Prev</Button>
                <Button variant="ghost" onClick={handleNextPage} disabled={offset + limit >= (data?.total_count || 0)} className="px-3 py-1 text-sm">Next</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
