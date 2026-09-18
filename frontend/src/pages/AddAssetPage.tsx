import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import apiClient from '../api/client';

export const AddAssetPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    maturity_date: '',
    interest_rate: '',
    maturity_amount: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await apiClient.post('/assets/add', formData);
      navigate('/assets');
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-display font-bold mb-6">Add New Asset</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Asset Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            placeholder="e.g. Mutual Fund, FD"
            required
          />
          <Input
            label="Amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0.00"
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
            placeholder="Optional details"
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
            <Button type="submit" isLoading={isLoading}>Save Asset</Button>
          </div>
        </form>
        {error && <div className="mt-4 p-3 rounded-lg bg-rose-50 text-rose-600 text-sm border border-rose-100">{error}</div>}
      </div>
    </div>
  );
};
