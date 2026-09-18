import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

interface Asset {
  id: number;
  type: string;
  amount: number;
  date: string;
  description: string;
  maturity_date?: string;
  interest_rate?: number;
  maturity_amount?: number;
}

export const AssetsPage: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filterType, setFilterType] = useState<string>('');
  const [assetTypes, setAssetTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchAssets = async () => {
    try {
      const data = await apiClient.get(`/assets?type=${filterType}`);
      setAssets(data.assets);
      setAssetTypes(data.asset_types);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [filterType]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    try {
      await apiClient.post(`/assets/${id}/delete`, {});
      await fetchAssets();
    } catch (err: any) {
      setError(err);
    }
  };

  if (isLoading) return <div className="text-center py-12">Loading assets...</div>;
  if (error) return <div className="text-center py-12 text-rose-500">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">My Assets</h1>
        <Button onClick={() => navigate('/assets/add')}>Add Asset</Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={filterType === '' ? 'primary' : 'ghost'}
          onClick={() => setFilterType('')}
          className="whitespace-nowrap"
        >
          All
        </Button>
        {assetTypes.map(type => (
          <Button
            key={type}
            variant={filterType === type ? 'primary' : 'ghost'}
            onClick={() => setFilterType(type)}
            className="whitespace-nowrap"
          >
            {type}
          </Button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Asset</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Amount</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Date</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {assets.length > 0 ? assets.map(asset => (
              <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{asset.description || asset.type}</div>
                  <div className="text-xs text-slate-500">{asset.type}</div>
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">
                  ₹{asset.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{asset.date}</td>
                <td className="px-6 py-4 flex gap-2">
                  <Button variant="ghost" onClick={() => navigate(`/assets/${asset.id}/edit`)} className="p-2">Edit</Button>
                  <Button variant="ghost" onClick={() => handleDelete(asset.id)} className="p-2 text-rose-500 hover:bg-rose-50">Delete</Button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">No assets found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
