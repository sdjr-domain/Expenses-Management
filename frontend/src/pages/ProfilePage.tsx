import React from 'react';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import apiClient from '../api/client';
import { Button } from '../components/Button';

interface ProfileData {
  user: {
    name: string;
    email: string;
  };
  categories: any[];
}

export const ProfilePage: React.FC = () => {
  const { user: authUser } = useAuthStore();
  const [data, setData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.get('/profile');
        setData(res);
      } catch (err: any) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (isLoading) return <div className="text-center py-12">Loading profile...</div>;
  if (error) return <div className="text-center py-12 text-rose-500">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-display font-bold mb-6">User Profile</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-slate-500 block mb-1">Full Name</label>
            <p className="text-lg font-medium text-slate-900">{data?.user.name}</p>
          </div>
          <div>
            <label className="text-sm text-slate-500 block mb-1">Email Address</label>
            <p className="text-lg font-medium text-slate-900">{data?.user.email}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-display font-bold mb-4">Your Categories</h2>
        <div className="flex flex-wrap gap-2">
          {data?.categories.map((cat: any) => (
            <span
              key={cat.id}
              className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200"
            >
              {cat.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
