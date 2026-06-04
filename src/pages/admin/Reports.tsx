import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
import { Sale, Branch } from '../../types';
import toast from 'react-hot-toast';
import { Loader2, Calendar, FileText, Download, Building } from 'lucide-react';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';
import { generateReportPDF } from '../../utils/pdfGenerator';

export default function AdminReports() {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  
  const [dateRange, setDateRange] = useState({
    from: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [selectedBranch]);

  const fetchBranches = async () => {
    try {
      const data = await apiFetch('/admin/branches');
      setBranches(data);
    } catch (error) {
      toast.error('Failed to load branches');
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      // Need to include end of day for the 'to' date
      const toDate = endOfDay(new Date(dateRange.to)).toISOString();
      let url = `/admin/reports/transfers?from=${dateRange.from}&to=${toDate}`;
      if (selectedBranch) {
        url += `&branchId=${selectedBranch}`;
      }
      const data = await apiFetch(url);
      setTransfers(data);
    } catch (error) {
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReport();
  };

  const totalSalesAmount = transfers.reduce((sum, transfer: any) => sum + (transfer.quantity * transfer.transferRate), 0);
  const totalProfit = transfers.reduce((sum, transfer: any) => sum + (transfer.quantity * (transfer.transferRate - (transfer.globalProductId?.purchaseRate || 0))), 0);
  const totalUnits = transfers.reduce((sum, transfer: any) => sum + transfer.quantity, 0);

  const handleExportPDF = () => {
    const branchName = selectedBranch ? branches.find(b => b._id === selectedBranch)?.name || 'Branch' : 'All Branches';
    // Mapping transfers to a format generateReportPDF can use if needed, but it might expect totalAmount inside the object.
    const mappedSales = transfers.map((t: any) => ({
      ...t,
      totalAmount: t.quantity * t.transferRate,
      totalProfit: t.quantity * (t.transferRate - (t.globalProductId?.purchaseRate || 0))
    }));
    generateReportPDF(branchName, {from: dateRange.from, to: dateRange.to}, mappedSales as any, totalSalesAmount);
    toast.success('Report exported as PDF');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Stock Transfer & Profit Reports</h1>
          <p className="text-slate-500 text-sm mt-1">View and download reports across all branches</p>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
        <form onSubmit={handleFilter} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full relative">
             <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Branch</label>
             <div className="relative">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <Building className="h-5 w-5 text-slate-400" />
               </div>
               <select 
                 value={selectedBranch} 
                 onChange={e => setSelectedBranch(e.target.value)}
                 className="block w-full pl-10 border border-slate-300 rounded-lg shadow-sm py-2.5 px-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
               >
                 <option value="">All Branches</option>
                 {branches.map(b => (
                   <option key={b._id} value={b._id}>{b.name} ({b.location})</option>
                 ))}
               </select>
             </div>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">From Date</label>
            <input 
              type="date" 
              required
              value={dateRange.from} 
              onChange={e => setDateRange({...dateRange, from: e.target.value})}
              className="block w-full border border-slate-300 rounded-lg shadow-sm py-2.5 px-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors" 
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">To Date</label>
            <input 
              type="date" 
              required
              value={dateRange.to} 
              onChange={e => setDateRange({...dateRange, to: e.target.value})}
              className="block w-full border border-slate-300 rounded-lg shadow-sm py-2.5 px-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors" 
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button type="submit" disabled={loading} className="flex-1 md:flex-none bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-70">
              {loading ? 'Loading...' : 'Filter'}
            </button>
            <button type="button" onClick={handleExportPDF} className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center">
               <Download className="w-5 h-5 md:mr-2" />
               <span className="hidden md:inline">Export PDF</span>
            </button>
          </div>
        </form>
      </div>

      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-6 border border-slate-200 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Revenue</p>
                <p className="text-3xl font-black text-slate-900 mt-1">₹{totalSalesAmount.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex justify-center items-center">
                <Calendar className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Profit</p>
                <p className="text-3xl font-black text-emerald-600 mt-1">₹{totalProfit.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex justify-center items-center">
                <FileText className="w-6 h-6" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-slate-200 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Items Sold</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{totalUnits} units</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex justify-center items-center">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center"><FileText className="w-5 h-5 mr-2 text-slate-400" /> Stock Transfers</h3>
            </div>
            {transfers.length > 0 ? (
               <>
                 <div className="hidden lg:block overflow-x-auto">
                   <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                          {!selectedBranch && <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Branch</th>}
                          <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                          <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Qty</th>
                          <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Revenue</th>
                          <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Net Profit</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {transfers.map((transfer: any) => (
                          <tr key={transfer._id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                              {format(new Date(transfer.createdAt), 'dd MMM yyyy, p')}
                            </td>
                            {!selectedBranch && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                                {/* @ts-ignore */}
                                {transfer.branchId?.name || 'Unknown'}
                              </td>
                            )}
                            <td className="px-6 py-4 text-sm font-bold text-slate-900">
                              {transfer.globalProductId?.name || 'Unknown Product'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 text-center font-bold">
                              {transfer.quantity} {transfer.globalProductId?.unitType || ''}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-slate-900 text-right">
                              ₹{(transfer.quantity * transfer.transferRate).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-emerald-600 text-right">
                              ₹{(transfer.quantity * (transfer.transferRate - (transfer.globalProductId?.purchaseRate || 0))).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                 </div>

                 {/* Mobile View */}
                 <div className="lg:hidden divide-y divide-slate-100">
                    {transfers.map((transfer: any) => (
                      <div key={transfer._id} className="p-4 space-y-3">
                         <div className="flex justify-between items-start">
                            <div>
                               <p className="font-bold text-slate-900">{transfer.globalProductId?.name || 'Unknown Product'}</p>
                               <p className="text-xs text-slate-500">{format(new Date(transfer.createdAt), 'dd MMM yyyy, HH:mm')}</p>
                            </div>
                            <p className="font-black text-slate-900">₹{(transfer.quantity * transfer.transferRate).toFixed(2)}</p>
                         </div>
                         {!selectedBranch && (
                            <p className="text-xs font-bold text-slate-600 bg-slate-100 uppercase tracking-widest px-2 py-1 rounded w-max">
                              {transfer.branchId?.name || 'Unknown'}
                            </p>
                         )}
                         <div className="flex justify-between items-center text-sm bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            <div>
                               <span className="text-[10px] text-slate-400 font-bold uppercase block">Qty</span>
                               <span className="font-bold text-blue-600">{transfer.quantity} {transfer.globalProductId?.unitType || ''}</span>
                            </div>
                            <div className="text-right">
                               <span className="text-[10px] text-slate-400 font-bold uppercase block">Net Profit</span>
                               <span className="font-black text-emerald-600">₹{(transfer.quantity * (transfer.transferRate - (transfer.globalProductId?.purchaseRate || 0))).toFixed(2)}</span>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
               </>
            ) : (
               <div className="p-12 text-center text-slate-500">
                 <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                 <p className="font-medium text-slate-900">No transfer records found</p>
                 <p className="text-sm mt-1">Try adjusting your date filters</p>
               </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
