import React, { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import apiClient from '../api/client';

interface Category {
  id: number;
  name: string;
  color: string;
}

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    try {
      const data = await apiClient.get('/categories');
      setCategories(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await apiClient.post('/categories/add', { name: newCategoryName });
      setNewCategoryName('');
      await fetchCategories();
    } catch (err: any) {
      setError(err);
    }
  };

  const handleUpdateCategory = async (id: number) => {
    try {
      await apiClient.post(`/categories/edit/${id}`, { name: editName });
      setEditingId(null);
      await fetchCategories();
    } catch (err: any) {
      setError(err);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await apiClient.post(`/categories/delete/${id}`, {});
      await fetchCategories();
    } catch (err: any) {
      setError(err);
    }
  };

  if (isLoading) return <div className="text-center py-12">Loading categories...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-display font-bold mb-6">Manage Categories</h1>

        <form onSubmit={handleAddCategory} className="flex gap-3 mb-8">
          <Input
            label="New Category Name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="e.g. Groceries"
            className="flex-1"
            required
          />
          <Button type="submit" className="self-end h-10">Add</Button>
        </form>

        {error && (
          <div className="p-3 mb-6 rounded-lg bg-rose-50 text-rose-600 text-sm border border-rose-100">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              {editingId === cat.id ? (
                <div className="flex gap-3 flex-1">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="max-w-xs"
                  />
                  <Button onClick={() => handleUpdateCategory(cat.id)}>Save</Button>
                  <Button variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color || '#cbd5e1' }} />
                    <span className="font-medium text-slate-700">{cat.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}>Edit</Button>
                    <Button variant="ghost" onClick={() => handleDeleteCategory(cat.id)} className="text-rose-500 hover:bg-rose-50">Delete</Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
