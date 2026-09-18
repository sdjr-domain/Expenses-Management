import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import apiClient from '../api/client';

export const EditAssetPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: '',
    amount: '',
    date: '',
    description: '',
    maturity_date: '',
    interest_rate: '',
    maturity_amount: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const asset = await apiClient.get(`/assets/${id}/edit`);
        setFormData({
          type: asset.type,
          amount: asset.amount.toString(),
          date: asset.date,
          description: asset.description || '',
          maturity_date: asset.maturity_date || '',
          interest_rate: asset.interest_rate?.toString() || '',
          maturity_amount: asset.maturity_amount?.toString() || '',
        });
      } catch (err: any) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAsset();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setError('');
    try {
      await apiClient.post(`/assets/${id}/edit`, formData);
      navigate('/assets');
    } catch (err: any) {
      setError(err);
    } finally {
      setSaveLoading(false);
    }
  };

  if (isLoading) return <div className="text-center py-12">Loading asset...</div>;
  if (error) return <div className="text-center py-12 text-rose-500">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-display font-bold mb-6">Edit Asset</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Asset Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            required
          />
          <Input
            label="Amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />
          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <Input
            label="Maturity Date"
            type="date"
            value={formData.maturity_date}
            onChange={(e) => setFormData({ ...formData, maturity_date: e.target.value })}
          />
          <Input
            label="Interest Rate (%)"
            type="number"
            step="0.1"
            value={formData.interest_rate}
            onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
          />
          <Input
            label="Maturity Amount"
            type="number"
            value={formData.maturity_amount}
            onChange={(e) => setFormData({ ...formData, maturity_amount: e.target.value })}
          />
          <div className="md:col-span-2 flex gap-3 justify-end pt-4">
            <Button variant="ghost" onClick={() => navigate('/assets')}>Cancel</Button>
            <Button type="submit" isLoading={saveLoading}>Update Asset</Button>
          </div>
        </form>
        {error && <div className="mt-4 p-3 rounded-lg bg-rose-50 text-rose-600 text-sm border border-rose-100">{error}</div>}
      </div>
    </div>
  );
};
