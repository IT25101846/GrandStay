import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Tag, Percent, Trash2, Plus, Edit3, CheckCircle2, X, Sparkles, 
  AlertCircle, Calendar, ShieldCheck, DollarSign, SearchCheck, Clock 
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../context/ToastContext';
import { fadeUp } from '../../utils/motion';
import api from '../../services/api';

const getTodayStr = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateOnly = (dateVal) => {
  if (!dateVal) return '';
  if (typeof dateVal === 'string') {
    return dateVal.split('T')[0].split(' ')[0].trim();
  }
  if (Array.isArray(dateVal)) {
    const [y, m, d] = dateVal;
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  if (dateVal instanceof Date) {
    const y = dateVal.getFullYear();
    const m = String(dateVal.getMonth() + 1).padStart(2, '0');
    const d = String(dateVal.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return String(dateVal);
};

export default function PromotionManagementPage() {
  const [promotions, setPromotions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [form, setForm] = useState({ 
    code: '', 
    discountType: 'PERCENTAGE', 
    discountValue: 10, 
    validFrom: '', 
    validUntil: '', 
    maxUsageCount: '', 
    isActive: true 
  });
  const [validateForm, setValidateForm] = useState({ code: '', originalAmount: '' });
  const [validateResult, setValidateResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const toast = useToast();

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchData = () => { 
    setLoading(true); 
    api.get('/promotions')
      .then(r => setPromotions(r.data))
      .catch(err => {
        const errMsg = err.response?.data?.error || 'Failed to load promotions';
        setError(errMsg);
        toast.error(errMsg);
      })
      .finally(() => setLoading(false)); 
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditingPromo(null);
    setForm({ 
      code: '', 
      discountType: 'PERCENTAGE', 
      discountValue: 10, 
      validFrom: '', 
      validUntil: '', 
      maxUsageCount: '', 
      isActive: true 
    });
    setError('');
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditingPromo(p);
    const isAct = p.isActive !== undefined ? Boolean(p.isActive) : (p.active !== undefined ? Boolean(p.active) : true);
    setForm({
      code: p.code || '',
      discountType: p.discountType || 'PERCENTAGE',
      discountValue: p.discountValue !== undefined ? p.discountValue : 10,
      validFrom: p.validFrom || '',
      validUntil: p.validUntil || '',
      maxUsageCount: p.maxUsageCount !== undefined && p.maxUsageCount !== null ? p.maxUsageCount : '',
      isActive: isAct
    });
    setError('');
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async (e) => {
    e.preventDefault(); 
    setError('');

    const todayStr = getTodayStr();
    const untilStr = parseDateOnly(form.validUntil);
    const isPastExpiry = Boolean(untilStr && untilStr <= todayStr);
    const effectiveActive = isPastExpiry ? false : Boolean(form.isActive);

    const payload = { 
      code: form.code.trim().toUpperCase(),
      discountType: form.discountType,
      discountValue: +form.discountValue, 
      validFrom: form.validFrom ? form.validFrom : null,
      validUntil: form.validUntil ? form.validUntil : null,
      maxUsageCount: form.maxUsageCount ? +form.maxUsageCount : null,
      isActive: effectiveActive,
      active: effectiveActive
    };

    try {
      if (editingPromo) {
        await api.put(`/promotions/${editingPromo.id}`, payload);
        toast.success(`Promotion code #${payload.code} updated successfully!`);
      } else {
        await api.post('/promotions', payload);
        toast.success(`Promotion code #${payload.code} created successfully!`);
      }
      setShowForm(false); 
      setEditingPromo(null);
      setForm({ code: '', discountType: 'PERCENTAGE', discountValue: 10, validFrom: '', validUntil: '', maxUsageCount: '', isActive: true }); 
      fetchData();
    } catch (err) { 
      const errMsg = err.response?.data?.error || err.response?.data?.message || (editingPromo ? 'Failed to update promotion.' : 'Failed to create promotion.');
      setError(errMsg); 
      toast.error(errMsg);
    }
  };

  const toggleStatus = async (p) => {
    const todayStr = getTodayStr();
    const untilStr = parseDateOnly(p.validUntil);
    const isPastExpiry = Boolean(untilStr && untilStr <= todayStr);

    const currentActive = p.isActive !== undefined ? Boolean(p.isActive) : (p.active !== undefined ? Boolean(p.active) : true);
    const newActive = !currentActive;

    if (newActive && isPastExpiry) {
      toast.error(`Cannot activate expired promotion #${p.code} (Valid Until: ${untilStr || 'past'}). Click "Renew / Edit" to extend the date.`);
      return;
    }

    try {
      await api.put(`/promotions/${p.id}`, {
        code: p.code,
        discountType: p.discountType,
        discountValue: p.discountValue,
        validFrom: p.validFrom || null,
        validUntil: p.validUntil || null,
        maxUsageCount: p.maxUsageCount || null,
        isActive: newActive,
        active: newActive
      });
      toast.success(`Promo #${p.code} marked as ${newActive ? 'Active' : 'Inactive'}`);
      fetchData();
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to update status.';
      toast.error(errMsg);
    }
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    try { 
      await api.delete(`/promotions/${deleteTarget.id}`); 
      toast.success(`Promotion code #${deleteTarget.code} deleted.`);
      fetchData(); 
    } catch (err) { 
      const errMsg = err.response?.data?.error || 'Failed to delete promotion';
      setError(errMsg);
      toast.error(errMsg); 
    }
    setDeleteTarget(null);
  };

  const handleValidate = async (e) => {
    e.preventDefault();
    try { 
      const r = await api.post('/promotions/validate', { code: validateForm.code, originalAmount: +validateForm.originalAmount }); 
      setValidateResult(r.data); 
      if (r.data.valid) {
        toast.success(`Promo code is valid: -LKR ${r.data.discountApplied?.toLocaleString()}`);
      } else {
        toast.error(r.data.message || 'Promo code not eligible');
      }
    } catch (err) { 
      setValidateResult({ valid: false, message: 'Could not validate promotion code.' }); 
      toast.error('Could not validate promotion code.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFB] dark:bg-dark text-stone-900 dark:text-slate-100 pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="badge-gold mb-2 inline-flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-gold-600 dark:text-gold-400" />
              Administration
            </span>
            <h1 className="font-serif text-4xl text-stone-900 dark:text-white font-normal">Promotion Management</h1>
            <p className="text-xs text-stone-600 dark:text-gray-400 mt-1">Create promo codes, manage discounts, and validate coupon eligibility.</p>
          </div>
          <button 
            onClick={() => {
              if (showForm) {
                setShowForm(false);
                setEditingPromo(null);
              } else {
                openCreate();
              }
            }} 
            className="btn-primary text-xs self-start sm:self-auto inline-flex items-center gap-1.5 shadow-glow-gold hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {showForm ? (
              <>
                <X className="w-3.5 h-3.5" />
                Close Form
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                Add Promotion
              </>
            )}
          </button>
        </div>

        {/* Create / Edit Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div 
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="card bg-white dark:bg-dark-900 border border-gold-500/30 dark:border-gold-500/40 mb-8 p-6 shadow-xl dark:shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-serif text-2xl text-stone-900 dark:text-white flex items-center gap-2">
                  <Tag className="w-5 h-5 text-gold-600 dark:text-gold-400" />
                  {editingPromo ? `Revise Promotion #${editingPromo.code}` : 'New Promotion'}
                </h2>
                <button 
                  onClick={() => {
                    setShowForm(false);
                    setEditingPromo(null);
                  }}
                  className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-stone-600 dark:text-gray-400 mb-6">
                {editingPromo 
                  ? 'Update discount rate, redemption dates, quota usage, and active status.' 
                  : 'Set up a new discount code for customers.'}
              </p>
              
              {error && (
                <div className="bg-rose-50 dark:bg-red-900/40 border border-rose-300 dark:border-red-700 text-rose-800 dark:text-red-300 text-xs px-4 py-3 rounded-lg mb-4 shadow-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                <div>
                  <label className="block text-gold-700 dark:text-gold-400 font-semibold uppercase tracking-wider mb-1">
                    Promo Code *
                  </label>
                  <input 
                    className="input-field uppercase font-mono" 
                    value={form.code} 
                    onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} 
                    placeholder="e.g. ROYAL25" 
                    required 
                  />
                  {editingPromo && (
                    <span className="text-[10px] text-stone-500 dark:text-gray-400 mt-1 block font-mono">
                      Editing code will update the promo identifier for new quotations.
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-gold-700 dark:text-gold-400 font-semibold uppercase tracking-wider mb-1">Discount Type</label>
                  <select className="input-field cursor-pointer" value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value })}>
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount (LKR)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gold-700 dark:text-gold-400 font-semibold uppercase tracking-wider mb-1">Value *</label>
                  <input type="number" min="0" step="0.01" className="input-field font-mono" value={form.discountValue} onChange={e => setForm({ ...form, discountValue: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-gold-700 dark:text-gold-400 font-semibold uppercase tracking-wider mb-1">Max Uses (optional)</label>
                  <input type="number" min="1" className="input-field font-mono" value={form.maxUsageCount} onChange={e => setForm({ ...form, maxUsageCount: e.target.value })} placeholder="Unlimited if blank" />
                </div>
                <div>
                  <label className="block text-gold-700 dark:text-gold-400 font-semibold uppercase tracking-wider mb-1">Valid From</label>
                  <input type="date" className="input-field" value={form.validFrom} onChange={e => setForm({ ...form, validFrom: e.target.value })} />
                </div>
                <div>
                  <label className="block text-gold-700 dark:text-gold-400 font-semibold uppercase tracking-wider mb-1">Valid Until</label>
                  <input type="date" className="input-field" value={form.validUntil} onChange={e => setForm({ ...form, validUntil: e.target.value })} />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <input type="checkbox" id="active" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="accent-gold-500 w-4 h-4 cursor-pointer" />
                  <label htmlFor="active" className="text-stone-700 dark:text-gray-300 text-xs font-medium cursor-pointer">Active and Redeemable</label>
                </div>
                <div className="md:col-span-2 flex gap-3 pt-2">
                  <button type="submit" className="btn-primary text-xs py-3 px-6 shadow-glow-gold flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    {editingPromo ? <Edit3 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    {editingPromo ? 'Save Changes' : 'Create Promotion'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowForm(false);
                      setEditingPromo(null);
                    }} 
                    className="btn-outline text-xs px-6"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Banner */}
        {error && !showForm && (
          <div className="bg-rose-50 dark:bg-red-900/40 border border-rose-300 dark:border-red-700 text-rose-800 dark:text-red-300 text-sm px-6 py-4 rounded-xl mb-6 flex items-center justify-between shadow-sm">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              {error}
            </span>
            <button onClick={() => setError('')} className="text-rose-600 dark:text-red-300 hover:text-rose-900 dark:hover:text-white ml-4 text-lg">✕</button>
          </div>
        )}

        {/* Promotions Table */}
        {loading ? (
          <div className="text-center py-20 text-stone-500 dark:text-gray-500">
            <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="font-serif text-stone-600 dark:text-gray-400">Loading promotions...</p>
          </div>
        ) : (
          <div className="card overflow-x-auto p-0 border border-stone-200 dark:border-dark-700/80 bg-white dark:bg-dark-900/90 shadow-sm dark:shadow-xl mb-8">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FDFBF7] dark:bg-dark-950 border-b border-stone-200 dark:border-dark-700 text-stone-600 dark:text-gray-400 uppercase tracking-wider">
                <tr>
                  {['Code', 'Type', 'Value', 'Valid From', 'Valid Until', 'Uses', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-dark-800">
                {promotions.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-stone-500 dark:text-gray-500">No promotions registered yet</td></tr>
                ) : promotions.map(p => {
                  const todayStr = getTodayStr();
                  const fromStr = parseDateOnly(p.validFrom);
                  const untilStr = parseDateOnly(p.validUntil);
                  const isExplicitlyActive = p.isActive !== undefined ? Boolean(p.isActive) : (p.active !== undefined ? Boolean(p.active) : true);
                  const isPastExpiry = Boolean(untilStr && untilStr <= todayStr);
                  const isUpcoming = Boolean(fromStr && fromStr > todayStr);
                  const isUsageMaxed = Boolean(p.maxUsageCount !== null && p.maxUsageCount !== undefined && p.maxUsageCount > 0 && p.usageCount >= p.maxUsageCount);

                  // STRICT REQUIREMENT: Only active in between validFrom and validUntil period
                  const isLiveActive = isExplicitlyActive && !isPastExpiry && !isUpcoming && !isUsageMaxed;

                  return (
                    <tr key={p.id} className="hover:bg-[#F6F4EE] dark:hover:bg-dark-800/50 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-gold-700 dark:text-gold-400 font-bold">#{p.code}</td>
                      <td className="px-4 py-3.5 text-stone-600 dark:text-gray-400">{p.discountType}</td>
                      <td className="px-4 py-3.5 text-stone-900 dark:text-white font-medium font-mono">
                        {p.discountType === 'PERCENTAGE' ? `${p.discountValue}%` : `LKR ${p.discountValue.toLocaleString()}`}
                      </td>
                      <td className="px-4 py-3.5 text-stone-600 dark:text-gray-400 font-mono">
                        {fromStr || '—'}
                        {isUpcoming && <span className="block text-[10px] text-amber-600 dark:text-amber-400 font-medium">Upcoming</span>}
                      </td>
                      <td className="px-4 py-3.5 text-stone-600 dark:text-gray-400 font-mono">
                        {untilStr || '—'}
                        {isPastExpiry && <span className="block text-[10px] text-rose-600 dark:text-rose-400 font-medium">Expired</span>}
                      </td>
                      <td className="px-4 py-3.5 text-stone-600 dark:text-gray-400 font-mono">
                        {p.usageCount}{p.maxUsageCount ? `/${p.maxUsageCount}` : ''}
                        {isUsageMaxed && <span className="block text-[10px] text-rose-600 dark:text-rose-400 font-medium">Maxed Out</span>}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          <StatusBadge status={isLiveActive ? 'ACTIVE' : 'INACTIVE'} />
                          
                          {/* Descriptive status subtitle */}
                          {isLiveActive ? (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                              Active in date window
                            </span>
                          ) : isPastExpiry ? (
                            <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                              <AlertCircle className="w-2.5 h-2.5 inline shrink-0" />
                              Auto-Expired
                            </span>
                          ) : isUpcoming ? (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5 inline shrink-0" />
                              Starts on {fromStr}
                            </span>
                          ) : isUsageMaxed ? (
                            <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                              Usage limit reached
                            </span>
                          ) : (
                            <span className="text-[10px] text-stone-500 dark:text-gray-500 font-medium">
                              Disabled by Admin
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap space-x-2">
                        <button 
                          onClick={() => openEdit(p)} 
                          className="inline-flex items-center gap-1 text-[11px] bg-gold-50 text-gold-900 border border-gold-300 hover:bg-gold-100 dark:bg-gold-900/40 dark:text-gold-300 dark:border-gold-700/60 px-3 py-1.5 rounded-full transition-colors font-medium shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <Edit3 className="w-3 h-3" />
                          {isPastExpiry ? 'Renew / Edit' : 'Edit'}
                        </button>
                        <button 
                          onClick={() => setDeleteTarget(p)} 
                          className="inline-flex items-center gap-1 text-[11px] bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100 dark:bg-rose-900/50 dark:text-rose-300 dark:border-rose-700 px-3 py-1.5 rounded-full transition-colors font-medium shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Validate Section */}
        <div className="card bg-white dark:bg-dark-900 border border-stone-200 dark:border-dark-700/80 shadow-sm dark:shadow-none p-6">
          <div className="flex items-center gap-2 mb-4">
            <SearchCheck className="w-5 h-5 text-gold-600 dark:text-gold-400" />
            <h2 className="font-serif text-xl text-stone-900 dark:text-white">Live Coupon Validator</h2>
          </div>
          <p className="text-xs text-stone-600 dark:text-gray-400 mb-4">
            Simulate promo code eligibility and test real-time discount calculation before quoting.
          </p>
          <form onSubmit={handleValidate} className="flex gap-3 flex-wrap items-end">
            <div>
              <label className="block text-gold-700 dark:text-gold-400 font-semibold uppercase tracking-wider text-xs mb-1">Promo Code</label>
              <input className="input-field max-w-xs font-mono uppercase" placeholder="e.g. ROYAL20" value={validateForm.code} onChange={e => setValidateForm({ ...validateForm, code: e.target.value.toUpperCase() })} required />
            </div>
            <div>
              <label className="block text-gold-700 dark:text-gold-400 font-semibold uppercase tracking-wider text-xs mb-1">Amount (LKR)</label>
              <input type="number" min="1" className="input-field max-w-xs font-mono" placeholder="250000" value={validateForm.originalAmount} onChange={e => setValidateForm({ ...validateForm, originalAmount: e.target.value })} required />
            </div>
            <button type="submit" className="btn-primary text-xs py-3 px-6 shadow-glow-gold hover:scale-[1.02] active:scale-[0.98] transition-all">
              Validate Code
            </button>
          </form>
          {validateResult && (
            <motion.div 
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 px-4 py-3 rounded-lg text-xs font-medium shadow-sm flex items-center gap-2 ${
                validateResult.valid 
                  ? 'bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300' 
                  : 'bg-rose-50 dark:bg-red-900/40 border border-rose-300 dark:border-red-700 text-rose-800 dark:text-red-300'
              }`}
            >
              {validateResult.valid ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />}
              <span>
                {validateResult.message} 
                {validateResult.valid && ` — Discount Applied: LKR ${validateResult.discountApplied?.toLocaleString()} | New Total: LKR ${validateResult.discountedAmount?.toLocaleString()}`}
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={executeDelete}
        title="Delete Promotion"
        message={`Are you sure you want to delete promo code "${deleteTarget?.code}"? This will immediately prevent future redemptions.`}
        confirmLabel="Delete Promotion"
        variant="danger"
      />
    </div>
  );
}
