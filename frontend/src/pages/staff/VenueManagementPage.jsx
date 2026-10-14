import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Users, Edit3, Trash2, Plus, X, 
  Sparkles, AlertCircle, CheckCircle2, DollarSign,
  Image as ImageIcon, Upload, Link2, Check
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import ConfirmModal from '../../components/ConfirmModal';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { fadeUp } from '../../utils/motion';
import api from '../../services/api';
import { updateLiveMetrics } from '../../utils/metricsService';
import { 
  VENUE_IMAGE_PRESETS, 
  parseVenueData, 
  formatVenueDescription, 
  saveLocalVenueImage 
} from '../../utils/venueImageHelper';

export default function VenueManagementPage() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editVenue, setEditVenue] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [imageTab, setImageTab] = useState('upload'); // 'upload' | 'url'
  const toast = useToast();

  const [form, setForm] = useState({
    name: '',
    capacity: '',
    description: '',
    basePrice: '',
    isAvailable: true,
    imageUrl: '',
  });

  const loadVenues = () => {
    setLoading(true);
    api.get('/venues')
      .then(res => {
        const list = res.data || [];
        setVenues(list);
        const totalCap = list.reduce((sum, v) => sum + (v.capacity || 0), 0);
        updateLiveMetrics({
          venueCount: list.length,
          guestCapacity: totalCap
        });
      })
      .catch(err => {
        const detail = err.response?.data?.message || err.response?.data?.error || err.message || 'Unknown network error';
        const status = err.response?.status ? `[HTTP ${err.response.status}] ` : '';
        const errMsg = `Failed to load venues: ${status}${detail}`;
        setError(errMsg);
        toast.error(errMsg);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadVenues(); }, []);

  const openCreate = () => {
    setEditVenue(null);
    setForm({ 
      name: '', 
      capacity: '', 
      description: '', 
      basePrice: '', 
      isAvailable: true,
      imageUrl: ''
    });
    setImageTab('upload');
    setShowForm(true);
    setError('');
  };

  const openEdit = (v) => {
    setEditVenue(v);
    const parsed = parseVenueData(v);
    setForm({
      name: v.name,
      capacity: v.capacity,
      description: parsed.cleanDescription,
      basePrice: v.basePrice,
      isAvailable: v.isAvailable ?? v.available ?? true,
      imageUrl: parsed.imageUrl || '',
    });
    setImageTab(parsed.imageUrl?.startsWith('data:') ? 'upload' : 'url');
    setShowForm(true);
    setError('');
  };

  const closeForm = () => {
    setShowForm(false);
    setEditVenue(null);
    setError('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image file size must be less than 2MB', 'File Too Large');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setForm(prev => ({ ...prev, imageUrl: event.target.result }));
      toast.success('Custom venue photo loaded successfully!', 'Image Ready');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const finalDescription = formatVenueDescription(form.description, form.imageUrl);
    const payload = {
      name: form.name.trim(),
      capacity: Number(form.capacity),
      description: finalDescription,
      basePrice: Number(form.basePrice),
      isAvailable: form.isAvailable,
      available: form.isAvailable,
    };
    try {
      let savedVenueId = editVenue?.id;
      if (editVenue) {
        await api.put(`/venues/${editVenue.id}`, payload);
        toast.success(`Venue "${form.name}" updated successfully!`);
      } else {
        const res = await api.post('/venues', payload);
        savedVenueId = res.data?.id;
        toast.success(`Venue "${form.name}" created successfully!`);
      }
      if (savedVenueId) {
        saveLocalVenueImage(savedVenueId, form.imageUrl);
      }
      closeForm();
      loadVenues();
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Save failed. Please try again.';
      setError(errMsg);
      toast.error(errMsg);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/venues/${deleteTarget.id}`);
      toast.success(`Venue "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      loadVenues();
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Delete failed.';
      setError(errMsg);
      toast.error(errMsg);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFB] dark:bg-dark text-stone-900 dark:text-slate-100 pb-20 transition-colors">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-gold inline-flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-gold-600 dark:text-gold-400" />
                Administration
              </span>
              <span className="text-xs text-stone-500 dark:text-gray-400">
                · {venues.length} Active Venues
              </span>
            </div>
            <h1 className="font-serif text-4xl text-stone-900 dark:text-white font-normal">Venue Management</h1>
            <p className="text-xs text-stone-600 dark:text-gray-400 mt-1">Add, edit, and manage all venue spaces and showcase photography.</p>
          </div>
          <button 
            onClick={openCreate} 
            className="btn-primary text-xs self-start sm:self-auto inline-flex items-center gap-1.5 shadow-glow-gold hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Venue
          </button>
        </div>

        {/* Inline Form */}
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
                  <Building2 className="w-5 h-5 text-gold-600 dark:text-gold-400" />
                  {editVenue ? `Edit Venue: ${editVenue.name}` : 'Create New Venue'}
                </h2>
                <button 
                  onClick={closeForm}
                  className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-stone-600 dark:text-gray-400 mb-6">Configure capacity, base pricing, and booking availability.</p>

              {error && (
                <div className="bg-rose-50 dark:bg-red-900/40 border border-rose-300 dark:border-red-700 text-rose-800 dark:text-red-300 text-xs px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                <div>
                  <label className="block text-gold-700 dark:text-gold-400 font-semibold uppercase tracking-wider mb-1">Venue Name *</label>
                  <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. The Grand Ballroom" required />
                </div>
                <div>
                  <label className="block text-gold-700 dark:text-gold-400 font-semibold uppercase tracking-wider mb-1">Capacity (Guests) *</label>
                  <input type="number" min="1" className="input-field font-mono" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} placeholder="500" required />
                </div>

                {/* Venue Image Selector */}
                <div className="md:col-span-2 border border-stone-200 dark:border-dark-750 rounded-xl p-4 bg-stone-50/70 dark:bg-dark-800/40">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <label className="text-gold-700 dark:text-gold-400 font-semibold uppercase tracking-wider text-xs flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-gold-500" />
                        Venue Image & Showcase Photo
                      </label>
                      <p className="text-[11px] text-stone-500 dark:text-gray-400 mt-0.5">
                        Upload a custom venue photograph or provide an image URL.
                      </p>
                    </div>

                    {/* Source Tab Toggle */}
                    <div className="flex bg-stone-200/80 dark:bg-dark-700 p-0.5 rounded-lg text-[11px] shrink-0">
                      <button
                        type="button"
                        onClick={() => setImageTab('upload')}
                        className={`px-3 py-1 rounded-md transition-all font-medium flex items-center gap-1 ${
                          imageTab === 'upload'
                            ? 'bg-white dark:bg-dark-900 text-stone-900 dark:text-gold-300 shadow-sm'
                            : 'text-stone-600 dark:text-gray-400 hover:text-stone-900 dark:hover:text-white'
                        }`}
                      >
                        <Upload className="w-3 h-3 text-gold-500" />
                        Upload File
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageTab('url')}
                        className={`px-3 py-1 rounded-md transition-all font-medium flex items-center gap-1 ${
                          imageTab === 'url'
                            ? 'bg-white dark:bg-dark-900 text-stone-900 dark:text-gold-300 shadow-sm'
                            : 'text-stone-600 dark:text-gray-400 hover:text-stone-900 dark:hover:text-white'
                        }`}
                      >
                        <Link2 className="w-3 h-3 text-gold-500" />
                        Image URL
                      </button>
                    </div>
                  </div>

                  {/* Tab: Image URL */}
                  {imageTab === 'url' && (
                    <div className="space-y-2 pt-1">
                      <div className="flex gap-2">
                        <input
                          type="url"
                          className="input-field"
                          placeholder="https://images.unsplash.com/... or /images/..."
                          value={form.imageUrl}
                          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                        />
                        {form.imageUrl && (
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, imageUrl: '' })}
                            className="btn-outline text-xs px-3"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-gray-400">
                        Paste a direct URL to any JPEG, PNG, or WebP photo.
                      </p>
                    </div>
                  )}

                  {/* Tab 3: Upload Local File */}
                  {imageTab === 'upload' && (
                    <div className="space-y-2 pt-1">
                      <label className="border-2 border-dashed border-stone-300 dark:border-dark-700 hover:border-gold-500/70 dark:hover:border-gold-400/70 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white/50 dark:bg-dark-900/50">
                        <Upload className="w-6 h-6 text-gold-600 dark:text-gold-400 mb-2" />
                        <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                          Click to select image or drag & drop photo here
                        </span>
                        <span className="text-[11px] text-stone-500 dark:text-gray-400 mt-0.5">
                          PNG, JPG, WebP up to 2MB
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}

                  {/* Active Preview Strip */}
                  {form.imageUrl && (
                    <div className="mt-3 pt-3 border-t border-stone-200 dark:border-dark-750 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-11 rounded-md overflow-hidden border border-stone-300 dark:border-dark-700 shrink-0 shadow-sm">
                          <img 
                            src={form.imageUrl} 
                            alt="Venue Preview" 
                            className="w-full h-full object-cover" 
                            onError={(e) => { e.target.src = VENUE_IMAGE_PRESETS[0].url; }}
                          />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-stone-800 dark:text-white">Active Venue Showcase Image</p>
                          <p className="text-[10px] text-stone-500 dark:text-gray-400 truncate max-w-xs sm:max-w-md">
                            {form.imageUrl}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, imageUrl: '' })}
                        className="text-[11px] text-rose-600 hover:text-rose-700 dark:text-rose-400 font-medium px-2 py-1"
                      >
                        Remove Image
                      </button>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gold-700 dark:text-gold-400 font-semibold uppercase tracking-wider mb-1">Description</label>
                  <textarea className="input-field" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Architectural features, views, and ambience..." />
                </div>
                <div>
                  <label className="block text-gold-700 dark:text-gold-400 font-semibold uppercase tracking-wider mb-1">Base Price (LKR) *</label>
                  <input type="number" min="0" className="input-field font-mono" value={form.basePrice} onChange={e => setForm({ ...form, basePrice: e.target.value })} placeholder="750000" required />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <input type="checkbox" id="avail" checked={form.isAvailable} onChange={e => setForm({ ...form, isAvailable: e.target.checked })} className="accent-gold-500 w-4 h-4 cursor-pointer" />
                  <label htmlFor="avail" className="text-stone-700 dark:text-gray-300 text-xs font-medium cursor-pointer">Available for live customer booking</label>
                </div>
                <div className="md:col-span-2 flex gap-3 pt-2">
                  <button type="submit" className="btn-primary text-xs py-3 px-6 shadow-glow-gold flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    {editVenue ? 'Update Venue' : 'Create Venue'}
                  </button>
                  <button type="button" onClick={closeForm} className="btn-outline text-xs px-6">Cancel</button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Banner (for non-form errors) */}
        {error && !showForm && (
          <div className="bg-rose-50 dark:bg-red-900/40 border border-rose-300 dark:border-red-700 text-rose-800 dark:text-red-300 text-sm px-6 py-4 rounded-xl mb-6 flex items-center justify-between shadow-sm">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              {error}
            </span>
            <button onClick={() => setError('')} className="text-rose-600 dark:text-red-300 hover:text-rose-900 dark:hover:text-white ml-4 text-lg">✕</button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-stone-500 dark:text-gray-500">
            <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="font-serif text-stone-600 dark:text-gray-400">Loading venues...</p>
          </div>
        ) : (
          <div className="card overflow-x-auto p-0 border border-stone-200 dark:border-dark-700/80 bg-white dark:bg-dark-900/90 shadow-xl">
            <table className="w-full text-left text-xs bg-white dark:bg-transparent">
              <thead className="bg-[#F5EFE6] dark:bg-dark-950 border-b border-stone-200 dark:border-dark-700 text-stone-600 dark:text-gray-400 uppercase tracking-wider font-semibold">
                <tr>
                  {['#', 'Photo', 'Name', 'Capacity', 'Base Price', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3.5">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-dark-800 bg-white dark:bg-transparent">
                {venues.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-stone-500 dark:text-gray-500">No venues added yet.</td></tr>
                ) : venues.map((v, idx) => {
                  const isAvail = v.isAvailable ?? v.available ?? true;
                  const venueData = parseVenueData(v, idx);
                  return (
                    <tr key={v.id} className="hover:bg-[#F6F4EE] dark:hover:bg-dark-800/50 transition-colors bg-white dark:bg-transparent">
                      <td className="px-4 py-4 font-mono text-gold-700 dark:text-gold-400 font-bold">#{v.id}</td>
                      <td className="px-4 py-4">
                        <div className="w-14 h-10 rounded-lg overflow-hidden border border-stone-200 dark:border-dark-700 shadow-sm relative group bg-stone-100 dark:bg-dark-800">
                          <img
                            src={venueData.imageUrl}
                            alt={v.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => { e.target.src = VENUE_IMAGE_PRESETS[0].url; }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-4 text-stone-900 dark:text-white font-medium">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gold-600 dark:text-gold-400 shrink-0" />
                          <span className="font-semibold">{v.name}</span>
                        </div>
                        {venueData.cleanDescription && (
                          <p className="text-[11px] text-stone-500 dark:text-gray-400 line-clamp-1 mt-0.5 max-w-xs">{venueData.cleanDescription}</p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-stone-600 dark:text-gray-400">
                        <span className="inline-flex items-center gap-1 font-mono">
                          <Users className="w-3.5 h-3.5 text-stone-400 dark:text-gray-500" />
                          {v.capacity} guests
                        </span>
                      </td>
                      <td className="px-4 py-4 text-stone-900 dark:text-white font-mono font-medium">LKR {v.basePrice?.toLocaleString()}</td>
                      <td className="px-4 py-4">
                        <StatusBadge status={isAvail ? 'ACTIVE' : 'INACTIVE'} />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap space-x-2">
                        <button 
                          onClick={() => openEdit(v)} 
                          className="inline-flex items-center gap-1 text-[11px] bg-gold-50 hover:bg-gold-100 text-gold-900 border border-gold-300 dark:bg-gold-900/40 dark:text-gold-300 dark:border-gold-700/60 dark:hover:bg-gold-900/70 px-3.5 py-1.5 rounded-full transition-colors font-medium shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <Edit3 className="w-3 h-3" />
                          Edit
                        </button>
                        <button 
                          onClick={() => setDeleteTarget(v)} 
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
        title="Delete Venue"
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Venue"
        cancelLabel="Keep Venue"
        variant="danger"
      />
    </div>
  );
}
