import React, { useEffect, useState } from 'react';
import { ArrowRightLeft, Search, Loader2 } from 'lucide-react';
import { apiFetch } from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminTransfers() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      const data = await apiFetch('/admin/transfer-logs');
      setLogs(data);
    } catch (error) {
      toast.error('Error fetching logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(l => 
    l.globalProductId?.name?.toLowerCase().includes(search.toLowerCase()) || 
    l.branchId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Stock Transfers</h1>
          <p className="text-slate-500 text-sm">View log of stock transfers to branches.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by branch or product..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full sm:max-w-xs pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">To Branch</th>
                <th className="px-6 py-4">Quantity</th>
                <th className="px-6 py-4">Transfer Rate</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map(l => (
                <tr key={l._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(l.createdAt).toLocaleDateString()}
                    <div className="text-xs text-slate-400">{new Date(l.createdAt).toLocaleTimeString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{l.globalProductId?.name || 'Unknown'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{l.branchId?.name || 'Unknown'}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700">
                    {l.quantity} {l.globalProductId?.unitType || 'units'}
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-slate-600">
                    ₹{l.transferRate?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${l.status === 'accepted' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No transfer logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden divide-y divide-slate-100">
          {filteredLogs.map(l => (
            <div key={l._id} className="p-4 space-y-3">
               <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-slate-800">{l.globalProductId?.name || 'Unknown'}</div>
                    <div className="text-xs text-slate-500">To: {l.branchId?.name || 'Unknown'}</div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${l.status === 'accepted' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {l.status}
                  </span>
               </div>
               
               <div className="flex gap-4 text-sm bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="flex-1">
                     <p className="text-[10px] uppercase font-bold text-slate-400">Qty</p>
                     <p className="font-bold text-slate-700">{l.quantity} {l.globalProductId?.unitType || ''}</p>
                  </div>
                  <div className="flex-1">
                     <p className="text-[10px] uppercase font-bold text-slate-400">Rate</p>
                     <p className="font-mono text-slate-700">₹{l.transferRate?.toFixed(2)}</p>
                  </div>
                  <div className="flex-1 text-right">
                     <p className="text-[10px] uppercase font-bold text-slate-400">Date</p>
                     <p className="text-slate-600">{new Date(l.createdAt).toLocaleDateString()}</p>
                  </div>
               </div>
            </div>
          ))}
          {filteredLogs.length === 0 && (
             <div className="p-8 text-center text-slate-500">No transfer logs found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
