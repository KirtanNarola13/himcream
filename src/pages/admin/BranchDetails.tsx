import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Box, Calendar, ShoppingBag, Loader2, Download } from 'lucide-react';
import { Branch, Sale } from '../../types';
import { format } from 'date-fns';
import { generateReportPDF } from '../../utils/pdfGenerator';

export default function AdminBranchDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ branch: Branch, products: any[], sales: Sale[] } | null>(null);
  const [dateRange, setDateRange] = useState({
    from: format(new Date(new Date().setDate(1)), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    fetchDetails();
  }, [id, dateRange]);

  const fetchDetails = async () => {
    try {
      const response = await apiFetch(`/admin/branches/${id}/details?from=${dateRange.from}&to=${dateRange.to}`);
      setData(response);
    } catch (error) {
      toast.error('Failed to load branch details');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) return <div className="flex justify-center p-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>;

  const totalSales = data.sales.reduce((sum, s) => sum + s.totalAmount, 0);

  const handleExportPDF = () => {
    generateReportPDF(data.branch.name, dateRange, data.sales, totalSales);
    toast.success('Report exported as PDF');
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/branches')} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{data.branch.name}</h1>
            <p className="text-slate-500 text-xs mt-0.5">{data.branch.location} • Manager: {data.branch.managerName}</p>
          </div>
        </div>
        <button 
          onClick={handleExportPDF}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg flex items-center text-sm font-medium transition-colors shadow-sm"
        >
          <Download className="w-4 h-4 mr-1.5" /> Export PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Left Column: Sales */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
           <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-1.5"><ShoppingBag className="w-4 h-4 text-blue-500" /> Sales Overview</h3>
           
           <div className="flex gap-3 mb-4">
              <div className="flex-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">From</label>
                <input type="date" value={dateRange.from} onChange={e => setDateRange({...dateRange, from: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-500 text-sm" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">To</label>
                <input type="date" value={dateRange.to} onChange={e => setDateRange({...dateRange, to: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-500 text-sm" />
              </div>
           </div>

           <div className="bg-blue-50 rounded-lg p-4 flex justify-between items-center mb-4 border border-blue-100">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Period Revenue</p>
              <p className="text-2xl font-black text-blue-900 mt-0.5">₹{totalSales.toFixed(2)}</p>
            </div>
            <div className="w-10 h-10 bg-white text-blue-600 rounded-lg flex justify-center items-center shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          
          <div className="space-y-2">
             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">Transactions</h4>
             {data.sales.length > 0 ? data.sales.map(sale => {
               const gp: any = sale.globalProductId;
               return (
                <div key={sale._id} className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex justify-between items-center hover:bg-slate-100 transition-colors">
                  <div className="min-w-0 pr-3">
                    <p className="font-semibold text-slate-900 text-sm truncate">{gp?.name || 'Unknown Item'}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{format(new Date(sale.createdAt), 'dd MMM yyyy, p')}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-slate-900 text-sm">₹{sale.totalAmount.toFixed(2)}</p>
                    <p className="text-[10px] font-medium text-slate-500 mt-0.5 bg-slate-200/50 inline-block px-1.5 py-0.5 rounded">Qty: {sale.quantity}</p>
                  </div>
                </div>
               );
             }) : (
               <div className="text-center py-6 bg-slate-50 rounded-lg border border-slate-100 border-dashed">
                  <p className="text-sm font-medium text-slate-600">No Sales Found</p>
               </div>
             )}
          </div>
        </div>
        
        {/* Right Column: Catalog */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
           <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-1.5"><Box className="w-4 h-4 text-blue-500" /> Branch Inventory</h3>
           <div className="space-y-2">
              {data.products.length > 0 ? data.products.map(p => {
                const gp = p.globalProductId;
                const isLow = p.currentStock <= p.lowStockThreshold;
                return (
                  <div key={p._id} className={`flex gap-3 p-2.5 rounded-lg border items-center ${isLow ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                      {gp?.imageUrl ? (
                        <img src={gp.imageUrl} alt={gp.name} className="w-full h-full object-cover" />
                      ) : (
                        <Box className="w-4 h-4 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-900 truncate">{gp?.name || 'Unknown'}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                         <span className="text-[9px] font-bold text-slate-500 bg-white px-1 py-0.5 rounded border border-slate-200">{gp?.sku}</span>
                         <span className="text-[10px] text-slate-500">{gp?.category}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                       <p className="font-bold text-sm text-slate-900">₹{p.sellingPrice.toFixed(2)}</p>
                       <p className={`text-[10px] font-semibold mt-0.5 ${isLow ? 'text-red-600' : 'text-emerald-600'}`}>{p.currentStock} {gp?.unitType}</p>
                    </div>
                  </div>
                );
              }) : (
                 <div className="text-center py-6 bg-slate-50 rounded-lg border border-slate-100 border-dashed">
                    <p className="text-sm font-medium text-slate-600">No Products</p>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
