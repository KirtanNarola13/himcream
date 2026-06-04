import React, { useEffect, useState } from 'react';
import { Package, Plus, Search, Edit2, Loader2, Trash2, ArrowRightLeft } from 'lucide-react';
import { apiFetch } from '../../utils/api';
import { GlobalProduct, Branch } from '../../types';
import toast from 'react-hot-toast';
import { generateTransferReceiptPDF } from '../../utils/pdfGenerator';
import { useAuthStore } from '../../context/store';

export default function AdminGlobalProducts() {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<GlobalProduct[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '', sku: '', category: '', unitType: 'pcs', unitSize: 1, purchaseRate: 0, sellRate: 0, imageUrl: ''
  });

  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockAddId, setStockAddId] = useState<string | null>(null);
  const [addStockAmount, setAddStockAmount] = useState<number>(0);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferData, setTransferData] = useState({
    globalProductId: '', branchId: '', quantity: 0, transferRate: 0
  });

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [pData, bData] = await Promise.all([
        apiFetch('/admin/products'),
        apiFetch('/admin/branches')
      ]);
      setProducts(pData);
      setBranches(bData);
    } catch (error) {
      toast.error('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiFetch(`/admin/products/${editingId}`, { method: 'PUT', body: JSON.stringify(formData) });
        toast.success('Product updated');
      } else {
        await apiFetch('/admin/products', { method: 'POST', body: JSON.stringify(formData) });
        toast.success('Product created');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Error saving product');
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await apiFetch(`/admin/products/${deleteConfirmId}`, { method: 'DELETE' });
      toast.success('Product deleted');
      fetchData();
      setDeleteConfirmId(null);
    } catch (error) {
      toast.error('Error deleting product');
    }
  };

  const handleAddStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch(`/admin/products/${stockAddId}`, { method: 'PUT', body: JSON.stringify({ addStock: addStockAmount }) });
      toast.success('Stock added successfully');
      setIsStockModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error('Error adding stock');
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch(`/admin/transfer`, { method: 'POST', body: JSON.stringify(transferData) });
      toast.success('Stock transferred successfully');
      setIsTransferModalOpen(false);
      fetchData();

      try {
        const product = products.find(p => p._id === transferData.globalProductId);
        const branch = branches.find(b => b._id === transferData.branchId);
        if (product && branch) {
           const items = [{
             name: product.name,
             unit: `${product.unitSize}${product.unitType}`,
             quantity: transferData.quantity,
             price: transferData.transferRate
           }];
           const total = transferData.quantity * transferData.transferRate;
           generateTransferReceiptPDF(branch.name, user?.role === 'super_admin' || user?.role === 'admin' ? 'HIMCREAM' : (user?.name || 'HIMCREAM'), items, total, true);
        }
      } catch (pdfError) {
        console.error('PDF Generation failed', pdfError);
      }
    } catch (error: any) {
      toast.error(error.message || 'Error transferring stock');
    }
  };

  const openNew = () => {
    setFormData({ name: '', sku: '', category: '', unitType: 'pcs', unitSize: 1, purchaseRate: 0, sellRate: 0, imageUrl: '' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEdit = (p: GlobalProduct) => {
    setFormData({ ...p });
    setEditingId(p._id);
    setIsModalOpen(true);
  };

  const openStockAdd = (p: GlobalProduct) => {
    setStockAddId(p._id);
    setAddStockAmount(0);
    setIsStockModalOpen(true);
  };

  const openTransfer = (p: GlobalProduct) => {
    setTransferData({
      globalProductId: p._id,
      branchId: branches[0]?._id || '',
      quantity: 1,
      transferRate: p.sellRate
    });
    setIsTransferModalOpen(true);
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Global Products</h1>
          <p className="text-slate-500 text-sm">Manage products, pricing, and global stock.</p>
        </div>
        <button onClick={openNew} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
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
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">SKU / Cat</th>
                <th className="px-6 py-4">Buy | Sell Rate</th>
                <th className="px-6 py-4">Global Stock</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(p => (
                <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                        {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" /> : <Package className="text-slate-400 w-5 h-5" />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{p.name}</div>
                        <div className="text-xs text-slate-500">{p.unitSize} {p.unitType}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div className="font-mono text-xs mb-1">{p.sku}</div>
                    <div className="text-xs">{p.category}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-700">Buy: ₹{p.purchaseRate}</div>
                    <div className="text-sm font-bold text-emerald-600">Sell: ₹{p.sellRate}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${p.globalStock > 0 ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
                      {p.globalStock} {p.unitType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-2 items-center">
                      <button onClick={() => openStockAdd(p)} className="text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md text-xs hover:bg-blue-100 font-bold flex items-center transition-colors"><Plus className="w-3 h-3 mr-1" /> Stock</button>
                      <button onClick={() => openTransfer(p)} className="text-purple-600 bg-purple-50 px-3 py-1.5 rounded-md text-xs hover:bg-purple-100 font-bold flex items-center transition-colors"><ArrowRightLeft className="w-3 h-3 mr-1"/> Transfer</button>
                      <button onClick={() => openEdit(p)} className="text-slate-400 hover:text-blue-600 p-1.5 transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteConfirmId(p._id)} className="text-slate-400 hover:text-red-600 p-1.5 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden divide-y divide-slate-100">
          {filteredProducts.map(p => (
            <div key={p._id} className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                    {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" /> : <Package className="text-slate-400 w-6 h-6" />}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">{p.name}</div>
                    <div className="text-xs text-slate-500">{p.unitSize} {p.unitType} • {p.category}</div>
                    <div className="font-mono text-xs text-slate-400 mt-0.5">{p.sku}</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(p)} className="text-slate-400 hover:text-blue-600 p-2 bg-slate-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteConfirmId(p._id)} className="text-slate-400 hover:text-red-600 p-2 bg-slate-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Buy | Sell</p>
                    <div className="text-sm font-medium text-slate-700">₹{p.purchaseRate} | <span className="text-emerald-600 font-bold">₹{p.sellRate}</span></div>
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Global Stock</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${p.globalStock > 0 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                      {p.globalStock} {p.unitType}
                    </span>
                 </div>
              </div>
              
              <div className="flex gap-2">
                 <button onClick={() => openStockAdd(p)} className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold flex justify-center items-center"><Plus className="w-4 h-4 mr-1"/> Stock</button>
                 <button onClick={() => openTransfer(p)} className="flex-1 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-bold flex justify-center items-center"><ArrowRightLeft className="w-4 h-4 mr-1"/> Transfer</button>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
             <div className="p-8 text-center text-slate-500">No products found.</div>
          )}
        </div>
      </div>

      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setIsTransferModalOpen(false)}></div>
          <div className="bg-white rounded-2xl w-full max-w-sm relative z-10 overflow-hidden shadow-xl">
             <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">Transfer to Branch</h3>
             </div>
             <form onSubmit={handleTransferSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold tracking-tight text-slate-700 mb-1">Select Branch</label>
                  <select required value={transferData.branchId} onChange={e => setTransferData({...transferData, branchId: e.target.value})} className="w-full border-slate-200 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-blue-500">
                    <option value="">-- Choose Branch --</option>
                    {branches.map(b => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold tracking-tight text-slate-700 mb-1">Quantity</label>
                  <input required type="number" min="1" value={transferData.quantity || ''} onChange={e => setTransferData({...transferData, quantity: parseInt(e.target.value)})} className="w-full border-slate-200 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold tracking-tight text-slate-700 mb-1">Transfer Rate / sell price</label>
                  <input required type="number" step="any" value={transferData.transferRate || ''} onChange={e => setTransferData({...transferData, transferRate: parseFloat(e.target.value)})} className="w-full border-slate-200 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-blue-500" />
                  {transferData.transferRate < (products.find(p => p._id === transferData.globalProductId)?.purchaseRate || 0) && (
                    <p className="text-xs text-red-500 mt-1 font-medium bg-red-50 p-1 rounded">Warning: Lower than original purchase rate!</p>
                  )}
                  {transferData.transferRate < (products.find(p => p._id === transferData.globalProductId)?.sellRate || 0) && transferData.transferRate >= (products.find(p => p._id === transferData.globalProductId)?.purchaseRate || 0) && (
                    <p className="text-xs text-amber-500 mt-1 font-medium bg-amber-50 p-1 rounded">Note: Lower than default sell rate.</p>
                  )}
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsTransferModalOpen(false)} className="flex-1 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" disabled={!transferData.branchId || !transferData.quantity || !transferData.transferRate} className="flex-1 py-2 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50">Transfer</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {isStockModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setIsStockModalOpen(false)}></div>
          <div className="bg-white rounded-2xl w-full max-w-sm relative z-10 overflow-hidden shadow-xl">
             <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">Add Stock</h3>
             </div>
             <form onSubmit={handleAddStockSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold tracking-tight text-slate-700 mb-1">Quantity to add</label>
                  <input required type="number" value={addStockAmount} onChange={e => setAddStockAmount(parseInt(e.target.value))} className="w-full border-slate-200 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsStockModalOpen(false)} className="flex-1 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">Add</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-2xl w-full max-w-md relative z-10 overflow-hidden shadow-xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold tracking-tight text-slate-800">{editingId ? 'Edit Product' : 'New Product'}</h3>
            </div>
            
            <div className="p-6 overflow-y-auto w-full">
              <form id="productForm" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold tracking-tight text-slate-700 mb-1">Product Name *</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border-slate-200 rounded-lg px-3 py-2 border focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold tracking-tight text-slate-700 mb-1">SKU *</label>
                    <input required type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full border-slate-200 rounded-lg px-3 py-2 border focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-mono text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold tracking-tight text-slate-700 mb-1">Category *</label>
                    <input required type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border-slate-200 rounded-lg px-3 py-2 border focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold tracking-tight text-slate-700 mb-1">Unit Size *</label>
                    <input required type="number" step="any" value={formData.unitSize} onChange={e => setFormData({...formData, unitSize: parseFloat(e.target.value)})} className="w-full border-slate-200 rounded-lg px-3 py-2 border focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold tracking-tight text-slate-700 mb-1">Unit Type *</label>
                    <select value={formData.unitType} onChange={e => setFormData({...formData, unitType: e.target.value as any})} className="w-full border-slate-200 rounded-lg px-3 py-2 border focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                      <option value="pcs">Pieces (pcs)</option>
                      <option value="L">Liters (L)</option>
                      <option value="mL">Milliliters (mL)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold tracking-tight text-slate-700 mb-1">Purchase Rate (Cost) *</label>
                    <input required type="number" value={formData.purchaseRate} onChange={e => setFormData({...formData, purchaseRate: parseFloat(e.target.value)})} className="w-full border-slate-200 rounded-lg px-3 py-2 border focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold tracking-tight text-slate-700 mb-1">Default Sell Rate</label>
                    <input required type="number" value={formData.sellRate} onChange={e => setFormData({...formData, sellRate: parseFloat(e.target.value)})} className="w-full border-slate-200 rounded-lg px-3 py-2 border focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold tracking-tight text-slate-700 mb-1">Image URL</label>
                  <input type="url" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full border-slate-200 rounded-lg px-3 py-2 border focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
              <button type="submit" form="productForm" className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                Save Product
              </button>
            </div>
          </div>
        </div>
      )}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setDeleteConfirmId(null)}></div>
          <div className="bg-white rounded-2xl w-full max-w-sm relative z-10 overflow-hidden shadow-xl p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Product</h3>
            <p className="text-slate-600 text-sm mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteConfirmId(null)} 
                className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-bold bg-white hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
