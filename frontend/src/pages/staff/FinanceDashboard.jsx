import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, XCircle, Receipt, Printer, Wallet, Clock, 
  ArrowUpRight, FileText, Plus, X, ShieldCheck, Sparkles, AlertCircle, Eye, User, Check, RotateCcw 
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export default function FinanceDashboard() {
  const [tab, setTab] = useState('payments');
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genResId, setGenResId] = useState('');
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [activeSlip, setActiveSlip] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'verify'|'reject'|'refund', id, customerName, amount }
  const toast = useToast();

  const fetchPayments = () => api.get('/payments').then(r => setPayments(r.data));
  const fetchInvoices = () => api.get('/invoices').then(r => setInvoices(r.data));
  const fetchRefunds = () => api.get('/payments/refunds/eligible').then(r => setRefunds(r.data)).catch(() => setRefunds([]));

  const loadAll = () => {
    setLoading(true);
    Promise.all([fetchPayments(), fetchInvoices(), fetchRefunds()]).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    const { type, id } = confirmAction;
    try {
      if (type === 'verify') {
        await api.put(`/payments/${id}/verify`);
        toast.success(`Payment slip #${id} verified and reservation balance updated.`);
      } else if (type === 'refund') {
        await api.post(`/payments/refund/${id}`);
        toast.success(`Refund of LKR ${confirmAction.amount?.toLocaleString()} successfully disbursed for Reservation #${id}.`);
      } else {
        await api.put(`/payments/${id}/reject`);
        toast.success(`Payment slip #${id} marked as rejected.`);
      }
      loadAll();
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || `Payment ${type} failed. Please try again.`;
      toast.error(errMsg);
    } finally {
      setConfirmAction(null);
    }
  };

  const handleVerifyFromSlip = async (id) => {
    setActionLoading(true);
    try {
      await api.put(`/payments/${id}/verify`);
      toast.success(`Payment slip #${id} verified and reservation balance updated.`);
      setActiveSlip(null);
      loadAll();
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Verification failed.';
      toast.error(errMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectFromSlip = async (id) => {
    setActionLoading(true);
    try {
      await api.put(`/payments/${id}/reject`);
      toast.success(`Payment slip #${id} marked as rejected.`);
      setActiveSlip(null);
      loadAll();
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Rejection failed.';
      toast.error(errMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const generateInvoice = async (e) => {
    e.preventDefault();
    if (!genResId) return;
    try {
      await api.post(`/invoices/generate/${genResId}`);
      setGenResId('');
      fetchInvoices();
      toast.success(`Official invoice generated for Reservation #${genResId}`);
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to generate invoice.';
      toast.error(errMsg);
    }
  };

  const totalCollected = payments
    .filter(p => p.status === 'VERIFIED' && p.type !== 'REFUND')
    .reduce((acc, p) => acc + (p.amount || 0), 0);

  const totalRefunded = payments
    .filter(p => p.status === 'VERIFIED' && p.type === 'REFUND')
    .reduce((acc, p) => acc + (p.amount || 0), 0);

  const totalOutstanding = invoices
    .reduce((acc, i) => acc + (i.balanceDue || 0), 0);

  return (
    <div className="min-h-screen bg-[#FDFDFB] dark:bg-dark text-stone-900 dark:text-slate-100 pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Header & Financial Highlights */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <span className="badge-gold mb-2 inline-flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-gold-600 dark:text-gold-400" />
              Finance & Billing Portal
            </span>
            <h1 className="font-serif text-4xl text-stone-900 dark:text-white font-normal">Finance & Billing Management</h1>
            <p className="text-xs text-stone-600 dark:text-gray-400 mt-1">Verify payment slips, track invoice balances, issue statements, and disburse refunds.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="bg-emerald-50 dark:bg-dark-900 border border-emerald-300 dark:border-emerald-500/30 px-4 py-2.5 rounded-xl text-right shadow-sm flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block font-semibold">Verified Collections</span>
                <span className="font-mono text-lg text-emerald-700 dark:text-emerald-300 font-bold">LKR {totalCollected.toLocaleString()}</span>
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-dark-900 border border-purple-300 dark:border-purple-500/30 px-4 py-2.5 rounded-xl text-right shadow-sm flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-purple-800 dark:text-purple-400 uppercase tracking-wider block font-semibold">Disbursed Refunds</span>
                <span className="font-mono text-lg text-purple-700 dark:text-purple-300 font-bold">LKR {totalRefunded.toLocaleString()}</span>
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-dark-900 border border-amber-300 dark:border-amber-500/30 px-4 py-2.5 rounded-xl text-right shadow-sm flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-amber-800 dark:text-amber-400 uppercase tracking-wider block font-semibold">Total Outstanding</span>
                <span className="font-mono text-lg text-amber-700 dark:text-amber-300 font-bold">LKR {totalOutstanding.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('payments')}
            className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all inline-flex items-center gap-2 ${
              tab === 'payments'
                ? 'bg-gold-500 text-dark-950 shadow-glow-gold'
                : 'bg-white dark:bg-dark-900 text-stone-700 dark:text-gray-400 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-dark-700 shadow-sm'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            Payments ({payments.length})
          </button>
          <button
            onClick={() => setTab('invoices')}
            className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all inline-flex items-center gap-2 ${
              tab === 'invoices'
                ? 'bg-gold-500 text-dark-950 shadow-glow-gold'
                : 'bg-white dark:bg-dark-900 text-stone-700 dark:text-gray-400 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-dark-700 shadow-sm'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Invoices ({invoices.length})
          </button>
          <button
            onClick={() => setTab('refunds')}
            className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all inline-flex items-center gap-2 ${
              tab === 'refunds'
                ? 'bg-gold-500 text-dark-950 shadow-glow-gold'
                : 'bg-white dark:bg-dark-900 text-stone-700 dark:text-gray-400 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-dark-700 shadow-sm'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Refunds ({refunds.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-stone-500 dark:text-gray-500">
            <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="font-serif text-stone-600 dark:text-gray-400">Loading records...</p>
          </div>
        ) : tab === 'payments' ? (
          <div className="card overflow-x-auto p-0 border border-stone-200 dark:border-dark-700/80 bg-white dark:bg-dark-900/90 shadow-sm dark:shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FDFBF7] dark:bg-dark-950 border-b border-stone-200 dark:border-dark-700 text-stone-600 dark:text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 font-semibold">Slip #</th>
                  <th className="px-4 py-3 font-semibold">Res ID</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Method</th>
                  <th className="px-4 py-3 font-semibold">Submitted At</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Verified By / At</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-dark-800">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-stone-500 dark:text-gray-500">
                      No payment slips submitted yet.
                    </td>
                  </tr>
                ) : (
                  payments.map(p => (
                    <tr key={p.id} className="hover:bg-[#F6F4EE] dark:hover:bg-dark-800/50 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-gold-700 dark:text-gold-400 font-bold">#{p.id}</td>
                      <td className="px-4 py-3.5 text-stone-600 dark:text-gray-400 font-mono">#{p.reservationId}</td>
                      <td className="px-4 py-3.5 text-stone-900 dark:text-white font-medium">{p.customerName}</td>
                      <td className="px-4 py-3.5 font-mono font-bold">
                        {p.type === 'REFUND' ? (
                          <span className="text-purple-700 dark:text-purple-400">− LKR {p.amount?.toLocaleString()}</span>
                        ) : (
                          <span className="text-emerald-700 dark:text-emerald-400">LKR {p.amount?.toLocaleString()}</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {p.type === 'REFUND' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-300 dark:border-purple-700">REFUND</span>
                        ) : (
                          <span className="text-stone-700 dark:text-gray-300">{p.type}</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-stone-600 dark:text-gray-400">{p.method}</td>
                      <td className="px-4 py-3.5 text-stone-500 dark:text-gray-500 font-mono text-[11px]">
                        {p.paidAt ? new Date(p.paidAt).toLocaleString() : '-'}
                      </td>
                      <td className="px-4 py-3.5"><StatusBadge status={p.status} /></td>
                      <td className="px-4 py-3.5 text-stone-600 dark:text-gray-400 font-mono text-[11px]">
                        {p.status === 'VERIFIED' && p.verifiedBy ? (
                          <div>
                            <span className="text-emerald-700 dark:text-emerald-400 block font-sans font-medium">{p.verifiedBy}</span>
                            <span className="text-stone-500 dark:text-gray-500 text-[10px]">{p.verifiedAt ? new Date(p.verifiedAt).toLocaleString() : ''}</span>
                          </div>
                        ) : (
                          <span className="text-stone-400 dark:text-gray-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        {p.status === 'PENDING' ? (
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => setActiveSlip(p)}
                              className="inline-flex items-center gap-1.5 text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700 px-3.5 py-1.5 rounded-full transition-colors font-medium shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>Verify Slip</span>
                            </button>
                            <button
                              onClick={() => setConfirmAction({ type: 'reject', id: p.id, customerName: p.customerName, amount: p.amount })}
                              className="inline-flex items-center gap-1 text-[11px] bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100 dark:bg-rose-900/50 dark:text-rose-300 dark:border-rose-700 px-3 py-1.5 rounded-full transition-colors font-medium shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setActiveSlip(p)}
                            className="inline-flex items-center gap-1 text-[11px] bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 dark:bg-dark-800 dark:text-gray-300 dark:border-dark-700 px-3.5 py-1.5 rounded-full transition-colors font-medium shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-600 dark:text-gold-400" />
                            <span>View Slip</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : tab === 'invoices' ? (
          <div className="space-y-6">
            {/* Quick Generator Box */}
            <form onSubmit={generateInvoice} className="card bg-white dark:bg-dark-900 border border-gold-500/30 p-5 flex flex-col sm:flex-row items-center gap-4 shadow-sm">
              <div className="flex-1 w-full">
                <label className="block text-[11px] uppercase tracking-wider text-gold-700 dark:text-gold-400 font-semibold mb-1">
                  Generate / Synchronize Invoice by Reservation ID:
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1"
                  className="input-field text-xs font-mono"
                  value={genResId}
                  onChange={e => setGenResId(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-primary text-xs py-3 px-6 whitespace-nowrap self-end sm:self-auto inline-flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all">
                <Plus className="w-3.5 h-3.5" />
                Generate Invoice
              </button>
            </form>

            <div className="card overflow-x-auto p-0 border border-stone-200 dark:border-dark-700/80 bg-white dark:bg-dark-900/90 shadow-sm dark:shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FDFBF7] dark:bg-dark-950 border-b border-stone-200 dark:border-dark-700 text-stone-600 dark:text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Invoice #</th>
                    <th className="px-4 py-3 font-semibold">Res ID</th>
                    <th className="px-4 py-3 font-semibold">Total Amount</th>
                    <th className="px-4 py-3 font-semibold">Verified Paid</th>
                    <th className="px-4 py-3 font-semibold">Balance Due</th>
                    <th className="px-4 py-3 font-semibold">Issued Date</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-dark-800">
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-stone-500 dark:text-gray-500">
                        No invoices generated yet.
                      </td>
                    </tr>
                  ) : (
                    invoices.map(i => (
                      <tr key={i.id} className="hover:bg-[#F6F4EE] dark:hover:bg-dark-800/50 transition-colors">
                        <td className="px-4 py-3.5 font-mono text-gold-700 dark:text-gold-400 font-bold">{i.invoiceNumber}</td>
                        <td className="px-4 py-3.5 text-stone-600 dark:text-gray-400 font-mono">#{i.reservationId}</td>
                        <td className="px-4 py-3.5 font-mono text-stone-900 dark:text-white font-bold">LKR {i.totalAmount?.toLocaleString()}</td>
                        <td className="px-4 py-3.5 font-mono text-emerald-700 dark:text-emerald-400 font-medium">LKR {i.amountPaid?.toLocaleString()}</td>
                        <td className="px-4 py-3.5 font-mono text-amber-700 dark:text-amber-400 font-medium">LKR {i.balanceDue?.toLocaleString()}</td>
                        <td className="px-4 py-3.5 text-stone-500 dark:text-gray-500 font-mono text-[11px]">
                          {i.issuedAt ? new Date(i.issuedAt).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-4 py-3.5"><StatusBadge status={i.status} /></td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => setActiveInvoice(i)}
                            className="btn-glass text-[11px] py-1 px-3 inline-flex items-center gap-1 hover:scale-[1.02] active:scale-[0.98] transition-all"
                          >
                            <FileText className="w-3 h-3 text-gold-600 dark:text-gold-400" />
                            Statement
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Policy Explainer Card */}
            <div className="card bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/30 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-lg text-stone-900 dark:text-white font-medium flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-amber-600 dark:text-gold-400" />
                  Cancellation Refund Policy & Settlement Engine
                </h3>
                <p className="text-xs text-stone-600 dark:text-gray-400 mt-1">
                  Automated policy tiers: ≥ 14 days before event: <strong className="text-emerald-700 dark:text-emerald-400">95% refund</strong> (5% administrative fee) · 7–13 days: <strong className="text-amber-700 dark:text-amber-400">50% refund</strong> · &lt; 7 days: <strong className="text-rose-700 dark:text-rose-400">0% refund (forfeited)</strong>.
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-gray-400 font-semibold block">Total Disbursed Refunds</span>
                <span className="font-mono text-lg text-purple-700 dark:text-purple-300 font-bold">LKR {totalRefunded.toLocaleString()}</span>
              </div>
            </div>

            <div className="card overflow-x-auto p-0 border border-stone-200 dark:border-dark-700/80 bg-white dark:bg-dark-900/90 shadow-sm dark:shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FDFBF7] dark:bg-dark-950 border-b border-stone-200 dark:border-dark-700 text-stone-600 dark:text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Res #</th>
                    <th className="px-4 py-3 font-semibold">Customer</th>
                    <th className="px-4 py-3 font-semibold">Days to Event</th>
                    <th className="px-4 py-3 font-semibold">Total Paid</th>
                    <th className="px-4 py-3 font-semibold">Policy Tier</th>
                    <th className="px-4 py-3 font-semibold">Eligible Refund</th>
                    <th className="px-4 py-3 font-semibold">Policy Details</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-dark-800">
                  {refunds.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-stone-500 dark:text-gray-500">
                        No cancelled reservations with refundable payments.
                      </td>
                    </tr>
                  ) : (
                    refunds.map(r => (
                      <tr key={r.reservationId} className="hover:bg-[#F6F4EE] dark:hover:bg-dark-800/50 transition-colors">
                        <td className="px-4 py-3.5 font-mono text-gold-700 dark:text-gold-400 font-bold">#{r.reservationId}</td>
                        <td className="px-4 py-3.5 text-stone-900 dark:text-white font-medium">{r.customerName}</td>
                        <td className="px-4 py-3.5 font-mono text-stone-600 dark:text-gray-400">{r.daysBeforeEvent} days</td>
                        <td className="px-4 py-3.5 font-mono text-stone-900 dark:text-white">LKR {r.totalPaid?.toLocaleString()}</td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            r.refundPercentage === 95 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700'
                              : r.refundPercentage === 50
                                ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700'
                                : 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700'
                          }`}>
                            {r.refundPercentage}% Refund
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-purple-700 dark:text-purple-400 font-bold">
                          LKR {r.eligibleRefundAmount?.toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 text-stone-600 dark:text-gray-400 text-[11px] max-w-xs truncate">
                          {r.policyExplanation}
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          {r.refunded ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 px-3 py-1 rounded-full border border-purple-300 dark:border-purple-800">
                              <Check className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                              Disbursed
                            </span>
                          ) : r.eligibleRefundAmount > 0 ? (
                            <button
                              onClick={() => setConfirmAction({
                                type: 'refund',
                                id: r.reservationId,
                                customerName: r.customerName,
                                amount: r.eligibleRefundAmount
                              })}
                              className="inline-flex items-center gap-1.5 text-[11px] bg-purple-50 text-purple-800 border border-purple-300 hover:bg-purple-100 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-700 px-3.5 py-1.5 rounded-full transition-colors font-medium shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                              <span>Process Refund</span>
                            </button>
                          ) : (
                            <span className="text-stone-400 dark:text-gray-600 text-[11px] italic">Non-refundable</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payment Slip Inspection & Verification Modal */}
        <Modal
          open={!!activeSlip}
          onClose={() => setActiveSlip(null)}
          badge="Payment Slip Audit"
          title={`Payment Slip #${activeSlip?.id}`}
          subtitle={`Reservation #${activeSlip?.reservationId} · Submitted by ${activeSlip?.customerName}`}
          maxWidth="max-w-xl"
        >
          {activeSlip && (
            <div className="space-y-6">
              {/* Slip Header & Status */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#FDFDFB] dark:bg-dark-950 border border-stone-200 dark:border-dark-800">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-amber-700 dark:text-gold-400" />
                  <span className="text-xs font-mono font-bold text-stone-900 dark:text-white">
                    SLIP-{activeSlip.id.toString().padStart(6, '0')}
                  </span>
                </div>
                <StatusBadge status={activeSlip.status} />
              </div>

              {/* Amount Display */}
              <div className="text-center py-5 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent rounded-2xl border border-amber-500/25 shadow-inner">
                <span className="text-[10px] uppercase tracking-widest text-amber-800 dark:text-gold-400 font-semibold block mb-1">
                  Submitted Remittance Amount
                </span>
                <span className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white font-mono">
                  LKR {activeSlip.amount?.toLocaleString()}
                </span>
                <div className="mt-2.5 flex items-center justify-center gap-2">
                  <span className="text-[11px] px-3 py-0.5 rounded-full font-semibold bg-amber-100 dark:bg-gold-500/20 text-amber-900 dark:text-gold-300 border border-amber-300 dark:border-gold-500/40">
                    {activeSlip.type === 'DEPOSIT' ? '30% Initial Reservation Advance' : 'Final Settlement / Full Payment'}
                  </span>
                </div>
              </div>

              {/* Transaction Key Details */}
              <div className="space-y-3 bg-white dark:bg-dark-900 p-5 rounded-xl border border-stone-200 dark:border-dark-800 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-stone-100 dark:border-dark-800">
                  <span className="text-stone-500 dark:text-gray-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-stone-400" />
                    <span>Customer Name:</span>
                  </span>
                  <span className="font-semibold text-stone-900 dark:text-white">{activeSlip.customerName}</span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-stone-100 dark:border-dark-800">
                  <span className="text-stone-500 dark:text-gray-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-stone-400" />
                    <span>Linked Reservation:</span>
                  </span>
                  <span className="font-mono font-semibold text-amber-800 dark:text-gold-400">#{activeSlip.reservationId}</span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-stone-100 dark:border-dark-800">
                  <span className="text-stone-500 dark:text-gray-400 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-stone-400" />
                    <span>Payment Channel:</span>
                  </span>
                  <span className="font-semibold px-2 py-0.5 rounded text-[11px] bg-stone-100 dark:bg-dark-800 text-stone-800 dark:text-gray-200">
                    {activeSlip.method === 'BANK_TRANSFER' ? '🏦 Bank Transfer / Direct Remittance' : activeSlip.method === 'CARD' ? '💳 Credit / Debit Card' : activeSlip.method === 'CHEQUE' ? '📝 Bank Cheque' : '💵 Cash Counter'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-stone-100 dark:border-dark-800">
                  <span className="text-stone-500 dark:text-gray-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>Submitted At:</span>
                  </span>
                  <span className="font-mono text-stone-700 dark:text-gray-300">
                    {activeSlip.paidAt ? new Date(activeSlip.paidAt).toLocaleString() : 'N/A'}
                  </span>
                </div>

                {activeSlip.status === 'VERIFIED' && activeSlip.verifiedBy && (
                  <div className="flex justify-between items-center py-1.5 border-b border-stone-100 dark:border-dark-800 text-emerald-700 dark:text-emerald-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified By Officer:</span>
                    </span>
                    <span className="font-mono font-semibold">{activeSlip.verifiedBy} ({activeSlip.verifiedAt ? new Date(activeSlip.verifiedAt).toLocaleDateString() : ''})</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                {activeSlip.status === 'PENDING' ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => handleVerifyFromSlip(activeSlip.id)}
                      disabled={actionLoading}
                      className="btn-primary flex-1 text-xs py-3 inline-flex items-center justify-center gap-2 shadow-glow-gold hover:scale-[1.02] active:scale-[0.98] transition-all bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{actionLoading ? 'Processing Verification...' : 'Verify & Approve Payment'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRejectFromSlip(activeSlip.id)}
                      disabled={actionLoading}
                      className="inline-flex items-center justify-center gap-1.5 text-xs py-3 px-5 rounded-full border border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors font-semibold"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Slip</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSlip(null)}
                      disabled={actionLoading}
                      className="btn-outline text-xs px-5 py-3"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="btn-primary flex-1 text-xs py-3 inline-flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print Slip Voucher</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSlip(null)}
                      className="btn-outline flex-1 text-xs py-3"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal>

        {/* Invoice Statement Modal */}
        <Modal
          open={!!activeInvoice}
          onClose={() => setActiveInvoice(null)}
          badge="Finance Audit Statement"
          title={activeInvoice?.invoiceNumber}
          subtitle={`Reservation #${activeInvoice?.reservationId}`}
          maxWidth="max-w-lg"
        >
          {activeInvoice && (
            <div className="print:p-6 print:bg-white print:text-black">
              <div className="mb-3 flex items-center justify-between">
                <StatusBadge status={activeInvoice.status} />
                <span className="text-[11px] text-stone-500 dark:text-gray-400 font-mono">
                  Issued: {activeInvoice.issuedAt ? new Date(activeInvoice.issuedAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="space-y-3 bg-[#FDFDFB] dark:bg-dark-900 print:bg-stone-50 p-5 rounded-xl text-xs mb-6 border border-stone-200 dark:border-dark-800 print:border-stone-300">
                <div className="flex justify-between text-stone-600 dark:text-gray-400 print:text-black">
                  <span>Gross Invoice Total</span>
                  <span className="font-mono text-stone-900 dark:text-white print:text-black font-medium">LKR {activeInvoice.totalAmount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-700 dark:text-emerald-400 print:text-emerald-700">
                  <span>Verified Collections Received</span>
                  <span className="font-mono font-bold">LKR {activeInvoice.amountPaid?.toLocaleString()}</span>
                </div>
                <div className="pt-3 border-t border-stone-200 dark:border-dark-800 print:border-stone-300 flex justify-between font-bold text-sm">
                  <span className="text-amber-700 dark:text-amber-400 print:text-amber-700">Outstanding Receivable</span>
                  <span className="font-serif text-xl text-amber-800 dark:text-amber-300 print:text-amber-800 font-mono">LKR {activeInvoice.balanceDue?.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-3 print:hidden">
                <button
                  onClick={() => window.print()}
                  className="btn-primary flex-1 text-xs py-3 inline-flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Printer className="w-4 h-4" />
                  Print Statement
                </button>
                <button 
                  onClick={() => setActiveInvoice(null)}
                  className="btn-outline flex-1 text-xs py-3"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Action Confirmation Modal */}
        <ConfirmModal
          open={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          onConfirm={handleConfirmAction}
          title={
            confirmAction?.type === 'refund'
              ? 'Process & Disburse Refund'
              : confirmAction?.type === 'verify'
                ? 'Verify Payment Slip'
                : 'Reject Payment Slip'
          }
          message={
            confirmAction?.type === 'refund'
              ? `Are you sure you want to process and disburse an authorized refund of LKR ${confirmAction?.amount?.toLocaleString()} to ${confirmAction?.customerName} for Reservation #${confirmAction?.id}?\n\nThis will record a verified REFUND transaction in the ledger under the cancellation policy.`
              : `Are you sure you want to ${confirmAction?.type === 'verify' ? 'verify' : 'reject'} payment slip #${confirmAction?.id} for ${confirmAction?.customerName} (LKR ${confirmAction?.amount?.toLocaleString()})?`
          }
          confirmLabel={
            confirmAction?.type === 'refund'
              ? 'Authorize & Disburse Refund'
              : confirmAction?.type === 'verify'
                ? 'Verify & Update'
                : 'Reject Slip'
          }
          variant={confirmAction?.type === 'refund' ? 'warning' : confirmAction?.type === 'verify' ? 'primary' : 'danger'}
        />

      </div>
    </div>
  );
}
