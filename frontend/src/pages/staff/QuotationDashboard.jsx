import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Send, Edit3, Calculator, Tag, Sparkles, Plus, X, 
  CheckCircle2, AlertCircle, MessageSquare, DollarSign, Calendar, Sliders, MapPin
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { fadeUp, TRANSITION_EASE_LUXURY } from '../../utils/motion';
import api from '../../services/api';

export default function QuotationDashboard() {
  const [searchParams] = useSearchParams();
  const queryReservationId = searchParams.get('reservationId');
  const toast = useToast();

  const [quotations, setQuotations] = useState([]);
  const [approvedReservations, setApprovedReservations] = useState([]);
  const [venues, setVenues] = useState([]);
  const [packages, setPackages] = useState([]);

  const [form, setForm] = useState({
    reservationId: '',
    customCharges: 0,
    promoCode: '',
    discountAmount: 0,
    notes: ''
  });
  const [editingQuoteId, setEditingQuoteId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [validatingPromo, setValidatingPromo] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get('/quotations'),
      api.get('/reservations'),
      api.get('/venues'),
      api.get('/packages')
    ]).then(([qRes, rRes, vRes, pRes]) => {
      setQuotations(qRes.data || []);
      const allRes = rRes.data || [];
      const approved = allRes.filter(r => r.status === 'APPROVED');
      setApprovedReservations(approved);
      setVenues(vRes.data || []);
      setPackages(pRes.data || []);

      if (queryReservationId) {
        setForm(prev => ({ ...prev, reservationId: queryReservationId }));
        setShowForm(true);
      }
    }).catch(err => {
      console.error('Failed to load dashboard data:', err);
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to load quotation data.';
      setError(errMsg);
      toast.error(errMsg);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [queryReservationId]);

  // Find currently selected reservation
  const selectedRes = approvedReservations.find(r => String(r.id) === String(form.reservationId));
  const editQuote = quotations.find(q => q.id === editingQuoteId);

  // Calculate baseline rates
  const getBaselineRate = () => {
    if (editQuote) return editQuote.basePrice || 0;
    if (selectedRes) {
      const v = venues.find(venue => venue.id === selectedRes.venueId);
      const p = packages.find(pkg => pkg.id === selectedRes.packageId);
      return (v?.basePrice || 0) + (p?.basePrice || 0);
    }
    return 0;
  };

  const currentBasePrice = getBaselineRate();
  const currentCustomCharges = Math.max(0, Number(form.customCharges) || 0);
  const subtotalBeforeDiscount = currentBasePrice + currentCustomCharges;
  const currentDiscount = Math.max(0, Number(form.discountAmount) || 0);
  const estimatedGrandTotal = Math.max(0, subtotalBeforeDiscount - currentDiscount);

  const handleValidatePromo = async () => {
    if (!form.promoCode.trim()) return;
    setValidatingPromo(true);
    setPromoMessage('');
    try {
      const res = await api.post('/promotions/validate', {
        code: form.promoCode.trim().toUpperCase(),
        originalAmount: subtotalBeforeDiscount > 0 ? subtotalBeforeDiscount : 100000
      });
      if (res.data.valid) {
        const disc = res.data.discountApplied || 0;
        setPromoMessage(`✓ Active Promo (${res.data.code}): - LKR ${disc.toLocaleString()}`);
        setForm(prev => ({ ...prev, discountAmount: disc }));
        toast.success(`Promo code applied: -LKR ${disc.toLocaleString()}`);
      } else {
        setPromoMessage(`⚠ ${res.data.message}`);
        toast.error(res.data.message || 'Invalid promotion code');
      }
    } catch (err) {
      setPromoMessage('Could not validate promotion code.');
      toast.error('Could not validate promotion code.');
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.reservationId) {
      setError('Please select an approved reservation.');
      toast.error('Please select an approved reservation.');
      return;
    }

    try {
      await api.post('/quotations', {
        reservationId: +form.reservationId,
        customCharges: +form.customCharges || 0,
        promoCode: form.promoCode ? form.promoCode.trim().toUpperCase() : null,
        discountAmount: +form.discountAmount || 0,
        notes: form.notes ? form.notes.trim() : null
      });
      setShowForm(false);
      setEditingQuoteId(null);
      setForm({ reservationId: '', customCharges: 0, promoCode: '', discountAmount: 0, notes: '' });
      setPromoMessage('');
      toast.success(editingQuoteId ? 'Quotation revised and updated.' : 'Quotation formulated successfully.');
      fetchData();
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to save quotation.';
      setError(errMsg);
      toast.error(errMsg);
    }
  };

  const handleEdit = (q) => {
    setEditingQuoteId(q.id);
    setForm({
      reservationId: q.reservationId,
      customCharges: q.customCharges,
      promoCode: q.promoCode || '',
      discountAmount: q.discountAmount || 0,
      notes: q.notes || ''
    });
    setPromoMessage('');
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sendQuotation = async (id) => {
    try {
      await api.put(`/quotations/${id}/send`);
      toast.success(`Quotation #${id} dispatched to client.`);
      fetchData();
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to send quotation.';
      setError(errMsg);
      toast.error(errMsg);
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
              Event Concierge Portal
            </span>
            <h1 className="font-serif text-4xl text-stone-900 dark:text-white font-normal">Quotation Management</h1>
            <p className="text-xs text-stone-600 dark:text-gray-400 mt-1">Formulate itemized quotes, apply promotions, and review customer responses.</p>
          </div>
          <button
            onClick={() => {
              setEditingQuoteId(null);
              setForm({ reservationId: '', customCharges: 0, promoCode: '', discountAmount: 0, notes: '' });
              setShowForm(!showForm);
            }}
            className="btn-primary text-xs self-start sm:self-auto flex items-center gap-1.5 shadow-glow-gold hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {showForm ? (
              <>
                <X className="w-3.5 h-3.5" />
                Close Form
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                Create / Revise Quotation
              </>
            )}
          </button>
        </div>

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
                  <Calculator className="w-5 h-5 text-gold-600 dark:text-gold-400" />
                  {editingQuoteId ? `Revise Quotation #${editingQuoteId}` : 'Formulate New Quotation'}
                </h2>
                <button 
                  onClick={() => setShowForm(false)}
                  className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-stone-600 dark:text-gray-400 mb-6">
                Itemize custom decor, staging, audiovisual setups, and apply promotional discounts.
              </p>

              {error && (
                <div className="bg-rose-50 dark:bg-red-900/40 border border-rose-300 dark:border-red-700 text-rose-800 dark:text-red-300 text-xs px-4 py-3 rounded-lg mb-4 shadow-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCreateOrUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                <div>
                  <label className="block text-gold-700 dark:text-gold-400 font-semibold uppercase tracking-wider mb-1">
                    Approved Reservation *
                  </label>
                  {editingQuoteId ? (
                    <input
                      type="text"
                      className="input-field bg-stone-100 dark:bg-dark-950/60 font-mono text-stone-700 dark:text-gray-300"
                      value={`Reservation #${form.reservationId}`}
                      disabled
                    />
                  ) : (
                    <select
                      className="input-field"
                      value={form.reservationId}
                      onChange={e => {
                        const rId = e.target.value;
                        const resObj = approvedReservations.find(ar => String(ar.id) === String(rId));
                        const addonTotal = resObj?.selectedAddons ? resObj.selectedAddons.reduce((sum, a) => sum + (a.price || 0), 0) : 0;
                        setForm({ ...form, reservationId: rId, customCharges: addonTotal });
                        setPromoMessage('');
                      }}
                      required
                    >
                      <option value="">-- Select Approved Reservation --</option>
                      {approvedReservations.map(ar => (
                        <option key={ar.id} value={ar.id}>
                          #{ar.id} &bull; {ar.customerName} — {ar.venueName} ({ar.packageName}) &bull; {new Date(ar.eventDate).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  )}
                  {approvedReservations.length === 0 && !editingQuoteId && (
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      No approved reservations pending quotation. Approve reservations in the Reservation Management portal first.
                    </p>
                  )}
                </div>

                {selectedRes && (selectedRes.selectedAddons?.length > 0 || selectedRes.specialRequest) && (
                  <div className="md:col-span-2 p-3.5 rounded-xl bg-amber-500/10 dark:bg-gold-500/10 border border-amber-500/25 dark:border-gold-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-gold-400 flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Customer Requested Enhancements ({selectedRes.selectedAddons?.length || 0})</span>
                      </span>
                      {selectedRes.selectedAddons?.length > 0 && (
                        <span className="text-xs font-mono font-bold text-amber-800 dark:text-gold-300">
                          Add-ons Total: LKR {selectedRes.selectedAddons.reduce((sum, a) => sum + (a.price || 0), 0).toLocaleString()}
                        </span>
                      )}
                    </div>
                    {selectedRes.selectedAddons?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {selectedRes.selectedAddons.map(a => (
                          <span key={a.id} className="text-[10px] px-2 py-0.5 rounded-md bg-white/80 dark:bg-dark-900 text-stone-800 dark:text-gray-200 border border-amber-200 dark:border-dark-700 font-medium">
                            ✓ {a.name} <span className="text-amber-800 dark:text-gold-400 font-mono">(LKR {a.price?.toLocaleString()})</span>
                          </span>
                        ))}
                      </div>
                    )}
                    {selectedRes.specialRequest && (
                      <p className="text-[11px] text-stone-600 dark:text-gray-300 italic pt-1 border-t border-amber-500/20">
                        <strong>Customer Special Request:</strong> "{selectedRes.specialRequest}"
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-gold-700 dark:text-gold-400 font-semibold uppercase tracking-wider mb-1">
                    Custom Requirements & Extras (LKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="input-field font-mono"
                    value={form.customCharges}
                    onChange={e => setForm({ ...form, customCharges: e.target.value })}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-gold-700 dark:text-gold-400 font-semibold uppercase tracking-wider mb-1">
                    Promotion / Discount Code (Optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="input-field uppercase"
                      value={form.promoCode}
                      onChange={e => setForm({ ...form, promoCode: e.target.value.toUpperCase() })}
                      placeholder="e.g. ROYAL20"
                    />
                    <button
                      type="button"
                      onClick={handleValidatePromo}
                      disabled={validatingPromo || !form.promoCode.trim()}
                      className="btn-glass text-[11px] px-3 whitespace-nowrap disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Tag className="w-3 h-3 text-gold-600 dark:text-gold-400" />
                      {validatingPromo ? 'Checking...' : 'Check Promo'}
                    </button>
                  </div>
                  {promoMessage && (
                    <p className="text-[11px] mt-1 text-gold-700 dark:text-gold-300 font-mono font-medium">{promoMessage}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gold-700 dark:text-gold-400 font-semibold uppercase tracking-wider mb-1">
                    Manual Discount Override (LKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="input-field font-mono"
                    value={form.discountAmount}
                    onChange={e => setForm({ ...form, discountAmount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>

                {/* Real-time Pricing Preview Card */}
                {(selectedRes || editQuote) && (
                  <motion.div 
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:col-span-2 bg-[#FDFDFB] dark:bg-dark-950/80 border border-gold-500/30 rounded-xl p-4 my-1 shadow-inner"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 border-b border-stone-200 dark:border-dark-800 pb-2">
                      <span className="text-xs uppercase tracking-wider font-semibold text-gold-700 dark:text-gold-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400 animate-pulse" />
                        Live Financial Formulation
                      </span>
                      <span className="text-[11px] text-stone-700 dark:text-gray-300 font-medium">
                        {selectedRes?.customerName || editQuote?.customerName} &bull; {selectedRes?.venueName || editQuote?.venueName} ({selectedRes?.packageName || editQuote?.packageName})
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div className="bg-white dark:bg-dark-900/60 p-2.5 rounded-lg border border-stone-200 dark:border-dark-800">
                        <span className="text-[10px] text-stone-500 dark:text-gray-500 uppercase tracking-widest block mb-0.5 font-semibold">Base Rate</span>
                        <span className="font-mono text-stone-900 dark:text-white font-medium">LKR {currentBasePrice.toLocaleString()}</span>
                      </div>
                      <div className="bg-white dark:bg-dark-900/60 p-2.5 rounded-lg border border-stone-200 dark:border-dark-800">
                        <span className="text-[10px] text-stone-500 dark:text-gray-500 uppercase tracking-widest block mb-0.5 font-semibold">Custom Extras</span>
                        <span className="font-mono text-gold-700 dark:text-gold-400 font-medium">+ LKR {currentCustomCharges.toLocaleString()}</span>
                      </div>
                      <div className="bg-white dark:bg-dark-900/60 p-2.5 rounded-lg border border-stone-200 dark:border-dark-800">
                        <span className="text-[10px] text-stone-500 dark:text-gray-500 uppercase tracking-widest block mb-0.5 font-semibold">Discount</span>
                        <span className="font-mono text-rose-600 dark:text-rose-400 font-medium">
                          {currentDiscount > 0 ? `- LKR ${currentDiscount.toLocaleString()}` : 'LKR 0'}
                        </span>
                      </div>
                      <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-300 dark:border-emerald-800/60">
                        <span className="text-[10px] text-emerald-800 dark:text-emerald-400 uppercase tracking-widest block font-semibold mb-0.5">Quotation Total</span>
                        <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                          LKR {estimatedGrandTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-gold-700 dark:text-gold-400 font-semibold uppercase tracking-wider mb-1">
                    Quotation Notes / Terms
                  </label>
                  <textarea
                    rows="2"
                    className="input-field"
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    placeholder="Include custom catering choices, floral package notes, lighting setups..."
                  />
                </div>

                <div className="md:col-span-2 flex gap-3 pt-2">
                  <button type="submit" className="btn-primary text-xs py-3 px-6 shadow-glow-gold flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    <FileText className="w-3.5 h-3.5" />
                    {editingQuoteId ? 'Save Revised Quotation' : 'Issue Quotation'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="btn-outline text-xs px-6"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Non-form error banner */}
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
            <p className="font-serif text-stone-600 dark:text-gray-400">Loading quotations...</p>
          </div>
        ) : (
          <div className="card overflow-x-auto p-0 border border-stone-200 dark:border-dark-700/80 bg-white dark:bg-dark-900/90 shadow-sm dark:shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FDFBF7] dark:bg-dark-950 border-b border-stone-200 dark:border-dark-700 text-stone-600 dark:text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="px-3.5 py-3 font-semibold whitespace-nowrap">Quote / Res</th>
                  <th className="px-3.5 py-3 font-semibold">Customer & Venue</th>
                  <th className="px-3.5 py-3 font-semibold whitespace-nowrap">Financial Breakdown</th>
                  <th className="px-3.5 py-3 font-semibold whitespace-nowrap">Grand Total</th>
                  <th className="px-3.5 py-3 font-semibold min-w-[200px]">Status & Requirements</th>
                  <th className="px-3.5 py-3 font-semibold text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-dark-800">
                {quotations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-stone-500 dark:text-gray-500">
                      No quotations generated yet.
                    </td>
                  </tr>
                ) : (
                  quotations.map(q => (
                    <tr key={q.id} className="hover:bg-[#F6F4EE] dark:hover:bg-dark-800/50 transition-colors">
                      <td className="px-3.5 py-3.5 align-top whitespace-nowrap">
                        <span className="font-mono text-gold-700 dark:text-gold-400 font-bold block text-sm">#{q.id}</span>
                        <span className="text-[11px] text-stone-500 dark:text-gray-400 font-mono">Res #{q.reservationId}</span>
                      </td>

                      <td className="px-3.5 py-3.5 align-top">
                        <div className="text-stone-900 dark:text-white font-medium">{q.customerName}</div>
                        <div className="text-[11px] text-stone-600 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-gold-600 shrink-0" />
                          <span>{q.venueName}</span>
                        </div>
                      </td>

                      <td className="px-3.5 py-3.5 align-top font-mono text-[11px] text-stone-600 dark:text-gray-400 leading-relaxed whitespace-nowrap">
                        <div>Base: LKR {q.basePrice?.toLocaleString()}</div>
                        {q.customCharges > 0 && (
                          <div className="text-gold-700 dark:text-gold-400 font-medium">
                            + Extras: LKR {q.customCharges?.toLocaleString()}
                          </div>
                        )}
                        {q.discountAmount > 0 && (
                          <div className="text-rose-600 dark:text-rose-400 font-medium">
                            - Disc: LKR {q.discountAmount?.toLocaleString()}
                            {q.promoCode && <span className="ml-1 text-[10px] text-stone-500 dark:text-gray-500 font-sans font-normal">({q.promoCode})</span>}
                          </div>
                        )}
                      </td>

                      <td className="px-3.5 py-3.5 align-top whitespace-nowrap">
                        <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold text-sm block">
                          LKR {q.totalAmount?.toLocaleString()}
                        </span>
                      </td>

                      <td className="px-3.5 py-3.5 align-top space-y-1.5">
                        <StatusBadge status={q.status} />
                        {q.customerRemarks && (
                          <div className="p-2 rounded-lg bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/25 dark:border-amber-400/20 text-stone-800 dark:text-stone-200">
                            <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400 mb-0.5">
                              <MessageSquare className="w-3 h-3 shrink-0" />
                              Customer Requirement
                            </span>
                            <p className="text-[11px] whitespace-normal break-words leading-relaxed italic">
                              "{q.customerRemarks}"
                            </p>
                          </div>
                        )}
                        {q.notes && (
                          <div className="text-[10px] text-stone-500 dark:text-gray-400 whitespace-normal break-words">
                            <span className="font-semibold text-stone-600 dark:text-stone-300">Staff Terms:</span> {q.notes}
                          </div>
                        )}
                      </td>

                      <td className="px-3.5 py-3.5 align-top text-right">
                        <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-1.5 whitespace-nowrap">
                          {['DRAFT', 'REVISION_REQUESTED'].includes(q.status) && (
                            <button
                              onClick={() => sendQuotation(q.id)}
                              className="inline-flex items-center gap-1 text-[11px] bg-sky-50 text-sky-800 border border-sky-300 hover:bg-sky-100 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700 px-2.5 py-1 rounded transition-colors font-medium shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                            >
                              <Send className="w-3 h-3" />
                              {q.status === 'REVISION_REQUESTED' ? 'Send Revised' : 'Send'}
                            </button>
                          )}
                          {['DRAFT', 'REVISION_REQUESTED', 'SENT'].includes(q.status) && (
                            <button
                              onClick={() => handleEdit(q)}
                              className="inline-flex items-center gap-1 text-[11px] bg-gold-50 text-gold-800 border border-gold-300 hover:bg-gold-100 dark:bg-gold-900/40 dark:text-gold-300 dark:border-gold-700/60 px-2.5 py-1 rounded transition-colors font-medium shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                            >
                              <Edit3 className="w-3 h-3" />
                              Revise
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
