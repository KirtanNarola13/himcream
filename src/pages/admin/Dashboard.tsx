import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
import { Store, CircleDollarSign, AlertTriangle, Box, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const result = await apiFetch('/admin/reports/all-branches');
      setData(result);
    } catch (error: any) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  if (!data) return null;

  const statCards = [
    { label: 'Total Branches', value: data.totalBranches, icon: <Store className="w-6 h-6 text-indigo-500" />, bg: 'bg-indigo-50' },
    { label: "Today's Sales", value: `₹${data.todaySales.toFixed(2)}`, icon: <CircleDollarSign className="w-6 h-6 text-emerald-500" />, bg: 'bg-emerald-50' },
    { label: 'Total Stock Value', value: `₹${data.totalStockValue.toFixed(2)}`, icon: <Box className="w-6 h-6 text-blue-500" />, bg: 'bg-blue-50' },
    { label: 'Low Stock Alerts', value: data.lowStockAlerts, icon: <AlertTriangle className="w-6 h-6 text-rose-500" />, bg: 'bg-rose-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Real-time pulse of your ice cream empire.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center">
            <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center mr-4`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
