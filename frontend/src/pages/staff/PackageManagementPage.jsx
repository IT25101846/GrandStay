import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, Building2, Plus, Edit3, Trash2, X, Sparkles, 
  AlertCircle, CheckCircle2, DollarSign, Check, Users, ArrowRight 
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../context/ToastContext';
import { fadeUp } from '../../utils/motion';
import api from '../../services/api';
import { updateLiveMetrics } from '../../utils/metricsService';

export default function PackageManagementPage() {
  const [packages, setPackages] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editPackage, setEditPackage] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const toast = useToast();

  const [form, setForm] = useState({
    name: '',
    description: '',
    basePrice: '',
    linkedVenueIds: []
  });

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [pkgRes, venueRes] = await Promise.all([
        api.get('/packages'),
        api.get('/venues')
      ]);
      const pkgList = pkgRes.data || [];
      setPackages(pkgList);
      setVenues(venueRes.data || []);
      updateLiveMetrics({ packageCount: pkgList.length });
    } catch (err) {
      const detail = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to load packages';
      const status = err.response?.status ? `[HTTP ${err.response.status}] ` : '';
      const errMsg = `Error loading data: ${status}${detail}`;
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditPackage(null);
    setForm({
      name: '',
      description: '',
      basePrice: '',
      linkedVenueIds: venues.map(v => v.id) // Default link to all venues
    });
    setShowForm(true);
    setError('');
  };

  const openEdit = (pkg) => {
    setEditPackage(pkg);
    const linkedIds = pkg.linkedVenues ? pkg.linkedVenues.map(v => v.id) : [];
    setForm({
      name: pkg.name || '',
      description: pkg.description || '',
      basePrice: pkg.basePrice || '',
      linkedVenueIds: linkedIds
    });
    setShowForm(true);
    setError('');
  };

  const closeForm = () => {
    setShowForm(false);
    setEditPackage(null);
    setError('');
  };

  const toggleVenueSelection = (venueId) => {
    setForm(prev => {
      const exists = prev.linkedVenueIds.includes(venueId);
      const updated = exists 
        ? prev.linkedVenueIds.filter(id => id !== venueId)
        : [...prev.linkedVenueIds, venueId];
      return { ...prev, linkedVenueIds: updated };
    });
  };

  const selectAllVenues = () => {
    setForm(prev => ({ ...prev, linkedVenueIds: venues.map(v => v.id) }));
  };

  const deselectAllVenues = () => {
    setForm(prev => ({ ...prev, linkedVenueIds: [] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Package name is required.');
      toast.error('Package name is required.');
      return;
    }

    if (Number(form.basePrice) <= 0) {
      setError('Base price must be a positive amount.');
      toast.error('Base price must be a positive amount.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      basePrice: Number(form.basePrice),
      linkedVenueIds: form.linkedVenueIds
    };

    try {
      if (editPackage) {
        await api.put(`/packages/${editPackage.id}`, payload);
        toast.success(`Package "${form.name}" updated successfully!`, 'Package Updated');
      } else {
        await api.post('/packages', payload);
        toast.success(`Package "${form.name}" created successfully!`, 'Package Created');
      }
      closeForm();
      loadData();
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Save failed. Please check inputs.';
      setError(errMsg);
      toast.error(errMsg, 'Operation Failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/packages/${deleteTarget.id}`);
      toast.success(`Package "${deleteTarget.name}" deleted.`, 'Package Deleted');
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to delete package.';
      setError(errMsg);
      toast.error(errMsg, 'Delete Failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFB] dark:bg-dark text-stone-900 dark:text-slate-100 pb-20 transition-colors">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-700 dark:text-gold-400 font-semibold bg-amber-600/10 dark:bg-gold-500/10 px-2.5 py-0.5 rounded-full border border-amber-600/20 dark:border-gold-500/20">
                Administration Portal
              </span>
              <span className="text-xs text-stone-500 dark:text-gray-400">
                · {packages.length} Active Packages
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 dark:text-white font-normal">
              Event Package Management
            </h1>
            <p className="text-stone-600 dark:text-gray-400 text-xs mt-1">
              Create, edit, and configure curated banquet packages and their compatible venue pairings.
            </p>
          </div>

          <button
            onClick={openCreate}
            className="btn-primary text-xs py-2.5 px-5 shadow-glow-gold flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Package</span>
          </button>
        </div>

        {/* Create / Edit Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div 
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="card bg-white dark:bg-dark-900 border border-gold-500/30 dark:border-gold-500/40 mb-8 p-6 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-serif text-2xl text-stone-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-gold-600 dark:text-gold-400" />
                  {editPackage ? `Edit Package: ${editPackage.name}` : 'Create New Event Package'}
                </h2>
                <button 
                  onClick={closeForm}
                  className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-stone-600 dark:text-gray-400 mb-6">
                Configure package pricing, provisions description, and linked venue capabilities.
              </p>

              {error && (
                <div className="bg-rose-50 dark:bg-red-900/40 border border-rose-300 dark:border-red-700 text-rose-800 dark:text-red-300 text-xs px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                <div>
                  <label className="block text-gold-700 dark:text-gold-400 font-semibold uppercase tracking-wider mb-1">
                    Package Name *
                  </label>
                  <input 
                    className="input-field" 
                    value={form.name} 
                    onChange={e => setForm({ ...form, name: e.target.value })} 
                    placeholder="e.g. Royal Wedding Experience" 
                    required 
                  />
                </div>

                <div>
                  <label className="block text-gold-700 dark:text-gold-400 font-semibold uppercase tracking-wider mb-1">
                    Base Package Price (LKR) *
                  </label>
                  <input 
                    type="number" 
                    min="1" 
                    className="input-field font-mono" 
                    value={form.basePrice} 
                    onChange={e => setForm({ ...form, basePrice: e.target.value })} 
                    placeholder="350000" 
                    required 
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gold-700 dark:text-gold-400 font-semibold uppercase tracking-wider mb-1">
                    Package Description & Included Inclusions
                  </label>
                  <textarea 
                    className="input-field" 
                    rows={3} 
                    value={form.description} 
                    onChange={e => setForm({ ...form, description: e.target.value })} 
                    placeholder="Describe floral decor, multi-course dining, audiovisual facilities, welcome reception..." 
                  />
                </div>

                {/* Linked Venues Multi-Selector */}
                <div className="md:col-span-2 border border-stone-200 dark:border-dark-750 rounded-xl p-4 bg-stone-50/70 dark:bg-dark-800/40">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <label className="text-gold-700 dark:text-gold-400 font-semibold uppercase tracking-wider text-xs flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-gold-500" />
                        Compatible Linked Venues ({form.linkedVenueIds.length} Selected)
                      </label>
                      <p className="text-[11px] text-stone-500 dark:text-gray-400 mt-0.5">
                        Select which hotel venues are eligible to host and bundle this package.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={selectAllVenues}
                        className="text-[11px] text-amber-700 hover:text-amber-800 dark:text-gold-400 font-medium underline"
                      >
                        Select All
                      </button>
                      <span className="text-stone-300 dark:text-dark-600">|</span>
                      <button
                        type="button"
                        onClick={deselectAllVenues}
                        className="text-[11px] text-stone-500 hover:text-stone-700 dark:text-gray-400 font-medium underline"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                    {venues.map((v) => {
                      const isLinked = form.linkedVenueIds.includes(v.id);
                      return (
                        <div
                          key={v.id}
                          onClick={() => toggleVenueSelection(v.id)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 flex items-center justify-between ${
                            isLinked
                              ? 'bg-amber-500/10 border-amber-500 dark:border-gold-400 text-stone-900 dark:text-white shadow-sm'
                              : 'bg-white dark:bg-dark-900 border-stone-200 dark:border-dark-700 opacity-70 hover:opacity-100 hover:border-stone-300'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <p className="font-semibold text-xs truncate">{v.name}</p>
                            <p className="text-[10px] text-stone-500 dark:text-gray-400 flex items-center gap-1 font-mono">
                              <Users className="w-3 h-3" />
                              <span>{v.capacity} guests</span>
                            </p>
                          </div>
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                            isLinked
                              ? 'bg-yellow-500 dark:bg-yellow-400 text-dark-950 shadow'
                              : 'border border-stone-300 dark:border-dark-600'
                          }`}>
                            {isLinked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="md:col-span-2 flex gap-3 pt-2">
                  <button 
                    type="submit" 
                    className="btn-primary text-xs py-3 px-6 shadow-glow-gold flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    {editPackage ? 'Update Package' : 'Create Package'}
                  </button>
                  <button 
                    type="button" 
                    onClick={closeForm} 
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

        {/* Loading Spinner */}
        {loading ? (
          <div className="text-center py-20 text-stone-500 dark:text-gray-500">
            <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="font-serif text-stone-600 dark:text-gray-400">Loading package catalog...</p>
          </div>
        ) : (
          <div className="card overflow-x-auto p-0 border border-stone-200 dark:border-dark-700/80 bg-white dark:bg-dark-900/90 shadow-xl">
            <table className="w-full text-left text-xs bg-white dark:bg-transparent">
              <thead className="bg-[#F5EFE6] dark:bg-dark-950 border-b border-stone-200 dark:border-dark-700 text-stone-600 dark:text-gray-400 uppercase tracking-wider font-semibold">
                <tr>
                  {['#', 'Package Name', 'Description', 'Base Price', 'Compatible Venues', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-dark-800 bg-white dark:bg-transparent">
                {packages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-stone-500 dark:text-gray-500">
                      No packages added yet. Click "Create New Package" to get started.
                    </td>
                  </tr>
                ) : packages.map((pkg) => {
                  const linkedList = pkg.linkedVenues || [];
                  return (
                    <tr 
                      key={pkg.id} 
                      className="hover:bg-[#F6F4EE] dark:hover:bg-dark-800/50 transition-colors bg-white dark:bg-transparent"
                    >
                      <td className="px-4 py-4 font-mono text-gold-700 dark:text-gold-400 font-bold">
                        #{pkg.id}
                      </td>
                      <td className="px-4 py-4 text-stone-900 dark:text-white font-medium">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-amber-700 dark:text-gold-400 shrink-0" />
                          <span className="font-semibold text-sm">{pkg.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-stone-600 dark:text-gray-400 max-w-xs">
                        <p className="line-clamp-2 leading-relaxed">
                          {pkg.description || 'No description provided.'}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-stone-900 dark:text-white font-mono font-medium whitespace-nowrap">
                        LKR {pkg.basePrice?.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 max-w-sm">
                        <div className="flex flex-wrap gap-1.5">
                          {linkedList.length === 0 ? (
                            <span className="text-[11px] text-stone-400 italic">None linked</span>
                          ) : linkedList.map((v) => (
                            <span 
                              key={v.id} 
                              className="text-[10px] font-medium bg-amber-600/10 dark:bg-gold-500/15 text-amber-800 dark:text-gold-300 border border-amber-600/25 dark:border-gold-500/30 px-2 py-0.5 rounded-md"
                            >
                              {v.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap space-x-2">
                        <button 
                          onClick={() => openEdit(pkg)} 
                          className="inline-flex items-center gap-1 text-[11px] bg-gold-50 hover:bg-gold-100 text-gold-900 border border-gold-300 dark:bg-gold-900/40 dark:text-gold-300 dark:border-gold-700/60 dark:hover:bg-gold-900/70 px-3.5 py-1.5 rounded-full transition-colors font-medium shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <Edit3 className="w-3 h-3" />
                          Edit
                        </button>
                        <button 
                          onClick={() => setDeleteTarget(pkg)} 
                          className="inline-flex items-center gap-1 text-[11px] bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-900/50 dark:text-rose-300 dark:border-rose-700 dark:hover:bg-rose-900 px-3.5 py-1.5 rounded-full transition-colors font-medium shadow-sm hover:scale-[1.02] active:scale-[0.98]"
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
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Event Package"
        message={`Are you sure you want to delete package "${deleteTarget?.name}"? Customers will no longer be able to select or book this package.`}
        confirmText="Delete Package"
        danger
      />
    </div>
  );
}
