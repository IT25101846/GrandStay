import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Sparkles, 
  Calendar as CalendarIcon, 
  Users, 
  CheckCircle2, 
  Clock, 
  Printer, 
  CreditCard, 
  FileText, 
  AlertTriangle, 
  ChevronRight, 
  Check, 
  Plus,
  ShieldCheck,
  Receipt,
  FileCheck,
  Copy
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { fadeUp, staggerContainer, TRANSITION_EASE_LUXURY } from '../../utils/motion';

export default function MyReservationsPage() {
  const toast = useToast();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');

  // Cancel Confirmation Modal State
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelPolicyInfo, setCancelPolicyInfo] = useState('');

  // Quotation viewing state
  const [viewingQuotation, setViewingQuotation] = useState(null);
  const [quotationLoading, setQuotationLoading] = useState(false);
  const [revisionRemarks, setRevisionRemarks] = useState('');
  const [showRevisionInput, setShowRevisionInput] = useState(false);

  // Invoice / Receipt viewing state
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [invoicePayments, setInvoicePayments] = useState([]);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  // Payment Recording State
  const [payingReservation, setPayingReservation] = useState(null);
  const [payingQuotation, setPayingQuotation] = useState(null);
  const [payingPayments, setPayingPayments] = useState([]);
  const [paymentModalLoading, setPaymentModalLoading] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentType, setPaymentType] = useState('DEPOSIT');
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [paymentSuccess, setPaymentSuccess] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

  // Card payment detail state
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [cardType, setCardType] = useState('');
  const [copiedAccount, setCopiedAccount] = useState(false);

  const copyAccountNumber = () => {
    navigator.clipboard.writeText('8001234567');
    setCopiedAccount(true);
    toast.success('Hotel Account Number 8001234567 copied to clipboard!', 'Account Copied');
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  /** Format raw digits → spaced groups of 4 */
  const formatCardNumber = (raw) => {
    const digits = raw.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  /** Format MM/YY */
  const formatExpiry = (raw) => {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  /** Detect card network from first digits */
  const detectCardType = (digits) => {
    if (/^4/.test(digits))        return 'visa';
    if (/^5[1-5]/.test(digits))   return 'mastercard';
    if (/^2[2-7]/.test(digits))   return 'mastercard';
    if (/^3[47]/.test(digits))    return 'amex';
    return '';
  };

  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    setCardNumber(formatCardNumber(raw));
    setCardType(detectCardType(raw));
  };

  const handleExpiryChange = (e) => setCardExpiry(formatExpiry(e.target.value));

  const handleMethodChange = (e) => {
    setPaymentMethod(e.target.value);
    setCardHolder(''); setCardNumber(''); setCardExpiry(''); setCardCVV(''); setCardType('');
  };

  const fetchReservations = () => {
    setLoading(true);
    api.get('/reservations/my')
      .then(r => setReservations(r.data || []))
      .catch(() => setError('Failed to load your reservations.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancelClick = async (reservation) => {
    let policyText = 'Are you sure you wish to cancel this reservation request?';
    try {
      const est = await api.get(`/payments/refund-estimate/${reservation.id}`);
      if (est.data && est.data.totalPaid > 0) {
        policyText += `\n\nRefund Policy Assessment:\n• Days Before Event: ${est.data.daysBeforeEvent} days\n• Total Paid: LKR ${est.data.totalPaid?.toLocaleString()}\n• Eligible Refund: LKR ${est.data.eligibleRefundAmount?.toLocaleString()} (${est.data.refundPercentage}%)\n• Policy: ${est.data.policyExplanation}`;
      }
    } catch (ignored) {}

    setCancelPolicyInfo(policyText);
    setCancelTarget(reservation);
  };

  const executeCancel = async () => {
    if (!cancelTarget) return;
    try {
      await api.put(`/reservations/${cancelTarget.id}/cancel`);
      toast.success('Reservation has been cancelled.', 'Cancelled');
      setCancelTarget(null);
      fetchReservations();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cancellation failed.', 'Error');
    }
  };

  const handleViewQuotation = async (reservationId) => {
    setQuotationLoading(true);
    setViewingQuotation(null);
    setShowRevisionInput(false);
    setRevisionRemarks('');
    try {
      const res = await api.get(`/quotations/reservation/${reservationId}`);
      setViewingQuotation(res.data);
    } catch (err) {
      toast.info('Quotation has not yet been issued by the reservation officer.', 'Quotation Pending');
    } finally {
      setQuotationLoading(false);
    }
  };

  const handleAcceptQuotation = async (quotationId) => {
    try {
      await api.put(`/quotations/${quotationId}/status`, { status: 'ACCEPTED' });
      toast.success('Quotation accepted! Please proceed to submit the 30% deposit for verification.', 'Quotation Accepted');
      setViewingQuotation(prev => ({ ...prev, status: 'ACCEPTED' }));
      fetchReservations();
    } catch (err) {
      toast.error('Could not accept quotation.', 'Error');
    }
  };

  const handleRejectOrReviseQuotation = async (quotationId) => {
    if (!revisionRemarks.trim()) {
      toast.error('Please enter a brief note explaining your revision request.', 'Note Required');
      return;
    }
    try {
      await api.put(`/quotations/${quotationId}/status`, {
        status: 'REVISION_REQUESTED',
        remarks: revisionRemarks
      });
      toast.success('Revision request submitted to the reservation officer.', 'Request Submitted');
      setViewingQuotation(prev => ({ ...prev, status: 'REVISION_REQUESTED', customerRemarks: revisionRemarks }));
      setShowRevisionInput(false);
      fetchReservations();
    } catch (err) {
      toast.error('Could not submit revision request.', 'Error');
    }
  };

  const handleViewInvoice = async (reservationId) => {
    setInvoiceLoading(true);
    setViewingInvoice(null);
    try {
      const [invRes, payRes] = await Promise.all([
        api.get(`/invoices/reservation/${reservationId}`),
        api.get(`/payments/reservation/${reservationId}`)
      ]);
      setViewingInvoice(invRes.data);
      setInvoicePayments(payRes.data || []);
    } catch (err) {
      toast.info('Official invoice has not yet been generated by Finance.', 'Invoice Pending');
    } finally {
      setInvoiceLoading(false);
    }
  };

  const openPaymentModal = async (reservation) => {
    setPayingReservation(reservation);
    setPayingQuotation(null);
    setPayingPayments([]);
    setPaymentModalLoading(true);
    setPaymentError('');
    setPaymentSuccess('');
    setPaymentAmount('');

    try {
      const [quoteRes, payRes] = await Promise.allSettled([
        api.get(`/quotations/reservation/${reservation.id}`),
        api.get(`/payments/reservation/${reservation.id}`)
      ]);

      const quote = quoteRes.status === 'fulfilled' ? quoteRes.value.data : null;
      const pays = payRes.status === 'fulfilled' ? (payRes.value.data || []) : [];

      setPayingQuotation(quote);
      setPayingPayments(pays);

      if (quote && quote.status === 'ACCEPTED') {
        const verifiedPaid = pays
          .filter(p => p.status === 'VERIFIED')
          .reduce((sum, p) => sum + Number(p.amount), 0);

        if (reservation.status === 'APPROVED') {
          setPaymentType('DEPOSIT');
          const depositAmt = Number((quote.totalAmount * 0.30).toFixed(2));
          setPaymentAmount(depositAmt);
        } else if (reservation.status === 'CONFIRMED') {
          setPaymentType('FULL');
          const remaining = Math.max(0, Number((quote.totalAmount - verifiedPaid).toFixed(2)));
          setPaymentAmount(remaining);
        }
      }
    } catch (err) {
      console.error('Failed to load quotation/payment info:', err);
    } finally {
      setPaymentModalLoading(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      setPaymentError('Please enter or verify a valid payment amount.');
      return;
    }
    setPaymentSubmitting(true);
    setPaymentError('');
    setPaymentSuccess('');
    try {
      await api.post('/payments', {
        reservationId: payingReservation.id,
        amount: Number(paymentAmount),
        type: paymentType,
        method: paymentMethod
      });
      setPaymentSuccess(`Payment slip of LKR ${Number(paymentAmount).toLocaleString()} submitted successfully! Pending verification by Finance.`);
      toast.success('Payment slip recorded! Finance will review and verify.', 'Payment Submitted');
      setTimeout(() => {
        setPayingReservation(null);
        setPaymentSuccess('');
        fetchReservations();
      }, 2500);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Could not submit payment record. Please check the quotation and reservation status.';
      setPaymentError(errorMsg);
      toast.error(errorMsg, 'Payment Failed');
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const filtered = activeTab === 'ALL' 
    ? reservations 
    : reservations.filter(r => r.status === activeTab);

  // Timeline stage helper
  const getTimelineStage = (status) => {
    switch (status) {
      case 'PENDING': return 1;
      case 'APPROVED': return 2;
      case 'CONFIRMED': return 4;
      case 'COMPLETED': return 5;
      case 'CANCELLED':
      case 'CANCELLED_LC':
      case 'REJECTED': return 0;
      default: return 1;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFB] dark:bg-dark text-stone-900 dark:text-slate-100 selection:bg-amber-600 dark:selection:bg-gold-500 selection:text-white dark:selection:text-dark-950 pb-20 transition-colors">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="badge-gold mb-2 inline-flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-gold-400" />
              <span>Customer Portal</span>
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl text-stone-900 dark:text-white font-normal tracking-tight">
              My Event Reservations
            </h1>
            <p className="text-xs text-stone-600 dark:text-gray-400 mt-1 leading-relaxed">
              Track real-time progress, review bespoke quotations, and download official receipts.
            </p>
          </div>
          <Link to="/book" className="btn-primary text-xs px-6 py-3 self-start sm:self-auto flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            <span>New Reservation</span>
          </Link>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 select-none">
          {['ALL', 'PENDING', 'APPROVED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-amber-600 dark:bg-gold-500 text-white dark:text-dark-950 shadow-sm dark:shadow-glow-gold'
                  : 'bg-white dark:bg-dark-900 text-stone-700 dark:text-gray-400 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-dark-700 shadow-sm'
              }`}
            >
              {tab} ({tab === 'ALL' ? reservations.length : reservations.filter(r => r.status === tab).length})
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-red-900/40 border border-rose-300 dark:border-red-700 text-rose-800 dark:text-red-300 text-sm px-6 py-4 rounded-xl mb-6 text-center shadow-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-stone-500 dark:text-gray-500">
            <div className="w-10 h-10 border-2 border-amber-600 dark:border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="font-serif text-lg text-stone-600 dark:text-gray-400">Loading your reservations...</p>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card bg-white dark:bg-dark-900 border border-stone-200 dark:border-dark-700 text-center py-20 max-w-lg mx-auto shadow-xl"
          >
            <div className="w-12 h-12 rounded-full bg-amber-500/10 dark:bg-gold-500/10 border border-amber-600/20 dark:border-gold-500/20 flex items-center justify-center text-amber-800 dark:text-gold-400 mx-auto mb-4">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <p className="font-serif text-2xl text-stone-800 dark:text-gray-300 mb-2">No {activeTab.toLowerCase()} reservations found</p>
            <p className="text-stone-500 dark:text-gray-500 text-xs mb-6 max-w-xs mx-auto">
              Begin planning your celebration today by selecting an architectural venue and package.
            </p>
            <Link to="/book" className="btn-primary text-xs inline-flex items-center gap-1.5">
              <span>Explore Spaces & Book Now</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            variants={staggerContainer(0.08)}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {filtered.map((r) => {
              const currentStage = getTimelineStage(r.status);

              return (
                <motion.div 
                  key={r.id}
                  variants={fadeUp(20, 0.4)}
                  className="card bg-white dark:bg-dark-900/90 border border-stone-200 dark:border-dark-700/80 hover:border-amber-600/40 dark:hover:border-gold-500/40 p-6 sm:p-8 flex flex-col justify-between gap-6 transition-all duration-300 shadow-sm"
                >
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-amber-800 dark:text-gold-400 font-bold bg-amber-500/10 dark:bg-dark-950 px-3 py-1 rounded-md border border-amber-500/20 dark:border-dark-800">
                          #{r.id}
                        </span>
                        <h3 className="font-serif text-2xl text-stone-900 dark:text-white font-medium">{r.venueName}</h3>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>

                    {/* 5-Stage Visual Booking Timeline Stepper */}
                    {r.status !== 'CANCELLED' && r.status !== 'CANCELLED_LC' && r.status !== 'REJECTED' && (
                      <div className="py-2 px-1">
                        <div className="flex items-center justify-between max-w-2xl text-[10px] uppercase font-semibold text-stone-400 dark:text-gray-500 relative">
                          {/* Background connecting bar */}
                          <div className="absolute left-3 right-3 top-2.5 h-0.5 bg-stone-200 dark:bg-dark-800 -z-0" />
                          
                          {[
                            { label: 'Submitted', stage: 1 },
                            { label: 'Approved', stage: 2 },
                            { label: 'Deposit Due', stage: 3 },
                            { label: 'Confirmed', stage: 4 },
                            { label: 'Completed', stage: 5 },
                          ].map((s) => {
                            const isPast = currentStage >= s.stage;
                            const isNow = currentStage === s.stage;

                            return (
                              <div key={s.stage} className="flex flex-col items-center gap-1.5 z-10">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                                  isPast 
                                    ? 'bg-amber-600 dark:bg-gold-500 text-white dark:text-dark-950 shadow-sm' 
                                    : 'bg-stone-200 dark:bg-dark-800 text-stone-500 dark:text-gray-500'
                                } ${isNow ? 'ring-2 ring-amber-500/40 dark:ring-gold-500/50 scale-110' : ''}`}>
                                  {isPast ? <Check className="w-3 h-3 stroke-[3]" /> : s.stage}
                                </div>
                                <span className={isPast ? 'text-amber-800 dark:text-gold-300 font-bold' : ''}>
                                  {s.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-stone-600 dark:text-gray-400 pt-2 border-t border-stone-100 dark:border-dark-800/80">
                      <div>
                        <span className="text-stone-400 dark:text-gray-500 block uppercase text-[10px] tracking-wider font-semibold">Package Tier</span>
                        <span className="text-stone-900 dark:text-white font-medium">{r.packageName}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 dark:text-gray-500 block uppercase text-[10px] tracking-wider font-semibold">Event Timing</span>
                        <span className="text-amber-800 dark:text-gold-300 font-mono font-medium">
                          {new Date(r.eventDate).toLocaleDateString('en-US', { dateStyle: 'medium' })} at {new Date(r.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-400 dark:text-gray-500 block uppercase text-[10px] tracking-wider font-semibold">Capacity</span>
                        <span className="text-stone-900 dark:text-white font-medium flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-amber-700 dark:text-gold-400" />
                          <span>{r.guestCount} Guests</span>
                        </span>
                      </div>
                    </div>

                    {r.selectedAddons && r.selectedAddons.length > 0 && (
                      <div className="pt-2 border-t border-stone-100 dark:border-dark-800/80">
                        <span className="text-stone-400 dark:text-gray-500 block uppercase text-[10px] tracking-wider font-semibold mb-1">
                          Custom Enhancements ({r.selectedAddons.length})
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {r.selectedAddons.map(a => (
                            <span
                              key={a.id}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 dark:bg-gold-500/10 text-amber-900 dark:text-gold-300 border border-amber-200 dark:border-gold-500/25 font-medium"
                            >
                              + {a.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {r.specialRequest && (
                      <div className="text-[11px] text-stone-600 dark:text-gray-400 italic bg-amber-500/5 p-2 rounded-lg border border-amber-500/15">
                        <span className="font-semibold text-stone-700 dark:text-gray-300 not-italic">Special Request: </span>
                        "{r.specialRequest}"
                      </div>
                    )}

                    {r.status === 'REJECTED' && r.rejectionReason && (
                      <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 rounded-xl p-3 text-xs text-rose-800 dark:text-rose-300 mt-2">
                        <span className="font-semibold text-rose-700 dark:text-rose-400">Reason for Rejection:</span> {r.rejectionReason}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-stone-200 dark:border-dark-800">
                    {(r.status === 'APPROVED' || r.status === 'CONFIRMED' || r.status === 'COMPLETED') && (
                      <button
                        onClick={() => handleViewQuotation(r.id)}
                        className="btn-glass text-xs py-2 px-4 flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Quotation</span>
                      </button>
                    )}

                    {(r.status === 'CONFIRMED' || r.status === 'COMPLETED') && (
                      <button
                        onClick={() => handleViewInvoice(r.id)}
                        className="btn-glass text-xs py-2 px-4 flex items-center gap-1.5"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Invoice / Receipt</span>
                      </button>
                    )}

                    {(r.status === 'APPROVED' || r.status === 'CONFIRMED') && (
                      <button
                        onClick={() => openPaymentModal(r)}
                        className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Make Payment</span>
                      </button>
                    )}

                    {r.status === 'COMPLETED' && (
                      <Link
                        to="/feedback"
                        className="btn-outline text-xs py-2 px-4 flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Review Event</span>
                      </Link>
                    )}

                    {(r.status === 'PENDING' || r.status === 'APPROVED' || r.status === 'CONFIRMED') && (
                      <button
                        onClick={() => handleCancelClick(r)}
                        className="text-xs text-rose-700 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 px-4 py-2 rounded-full transition-colors font-medium ml-auto"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

      </div>

      {/* Upgraded Quotation Modal using Reusable Modal Component */}
      <Modal
        open={!!viewingQuotation}
        onClose={() => setViewingQuotation(null)}
        badge="Formal Event Quotation"
        title={`Quotation #${viewingQuotation?.id}`}
        subtitle={`Reservation #${viewingQuotation?.reservationId}`}
        maxWidth="max-w-xl"
      >
        {viewingQuotation && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-dark-800">
              <span className="text-xs text-stone-500 dark:text-gray-400">Current Status:</span>
              <StatusBadge status={viewingQuotation.status} />
            </div>

            <div className="space-y-3 bg-[#FDFDFB] dark:bg-dark-900 p-5 rounded-2xl text-xs border border-stone-200 dark:border-dark-800">
              <div className="flex justify-between text-stone-600 dark:text-gray-400">
                <span>Base Space & Experience Package Rate</span>
                <span className="font-mono text-stone-900 dark:text-white font-medium">LKR {viewingQuotation.basePrice?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-stone-600 dark:text-gray-400">
                <span>Custom Decor, Lighting & Staging</span>
                <span className="font-mono text-stone-900 dark:text-white font-medium">LKR {viewingQuotation.customCharges?.toLocaleString()}</span>
              </div>
              {viewingQuotation.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Promotional Discount {viewingQuotation.promoCode && `(${viewingQuotation.promoCode})`}</span>
                  <span className="font-mono font-bold">- LKR {viewingQuotation.discountAmount?.toLocaleString()}</span>
                </div>
              )}
              {viewingQuotation.validUntil && (
                <div className="flex justify-between text-stone-600 dark:text-gray-400">
                  <span>Validity Window (7 Days)</span>
                  <span className={`font-mono ${new Date(viewingQuotation.validUntil) < new Date() ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-amber-800 dark:text-gold-300 font-medium'}`}>
                    Valid Until: {new Date(viewingQuotation.validUntil).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                    {new Date(viewingQuotation.validUntil) < new Date() ? ' (EXPIRED)' : ''}
                  </span>
                </div>
              )}
              {viewingQuotation.notes && (
                <div className="pt-2 border-t border-stone-200 dark:border-dark-800 text-stone-600 dark:text-gray-400 italic">
                  <span className="text-amber-800 dark:text-gold-400 not-italic font-semibold block text-[10px] uppercase">Officer Notes:</span>
                  {viewingQuotation.notes}
                </div>
              )}
              <div className="pt-3 border-t border-stone-200 dark:border-dark-800 flex justify-between font-bold text-sm">
                <span className="text-amber-800 dark:text-gold-400">Net Quotation Amount</span>
                <span className="font-serif text-2xl text-stone-900 dark:text-white font-mono tabular-nums">LKR {viewingQuotation.totalAmount?.toLocaleString()}</span>
              </div>
            </div>

            {viewingQuotation.customerRemarks && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 p-3 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                <strong>Your Notes / Revision Request:</strong> {viewingQuotation.customerRemarks}
              </div>
            )}

            {/* Decision Controls */}
            {viewingQuotation.status === 'SENT' && !showRevisionInput && (
              (() => {
                const isExpired = viewingQuotation.validUntil && new Date(viewingQuotation.validUntil) < new Date();
                return (
                  <div>
                    {isExpired && (
                      <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs p-3 rounded-xl mb-3">
                        ⚠️ This quotation has expired (7-day validity limit). Acceptance is disabled. Please request a revision or contact an event officer.
                      </div>
                    )}
                    <div className="flex gap-3 mb-3">
                      <button
                        onClick={() => handleAcceptQuotation(viewingQuotation.id)}
                        disabled={isExpired}
                        className={`btn-primary flex-1 text-xs py-3 ${isExpired ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        ✓ Accept Quotation &rarr;
                      </button>
                      <button
                        onClick={() => setShowRevisionInput(true)}
                        className="btn-outline flex-1 text-xs py-3 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        Request Revision / Adjustments
                      </button>
                    </div>
                  </div>
                );
              })()
            )}

            {showRevisionInput && (
              <div className="space-y-3 mb-4 bg-[#FDFDFB] dark:bg-dark-900 p-4 rounded-xl border border-stone-200 dark:border-dark-700">
                <label className="block text-xs text-amber-800 dark:text-gold-400 font-semibold uppercase">
                  Describe Requested Changes or Adjustments:
                </label>
                <textarea
                  rows="3"
                  className="input-field text-xs resize-none"
                  placeholder="e.g. Please adjust custom decor lighting package or revise attendee capacity..."
                  value={revisionRemarks}
                  onChange={(e) => setRevisionRemarks(e.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRejectOrReviseQuotation(viewingQuotation.id)}
                    className="btn-primary text-xs py-2 px-4"
                  >
                    Submit Revision Request
                  </button>
                  <button
                    onClick={() => setShowRevisionInput(false)}
                    className="btn-outline text-xs py-2 px-4"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <button 
              onClick={() => setViewingQuotation(null)}
              className="btn-outline w-full text-xs py-2.5"
            >
              Close
            </button>
          </div>
        )}
      </Modal>

      {/* Upgraded Official Invoice / Receipt Modal */}
      <Modal
        open={!!viewingInvoice}
        onClose={() => setViewingInvoice(null)}
        badge="Official Statement"
        title={viewingInvoice?.invoiceNumber}
        subtitle={`Issued on: ${viewingInvoice?.issuedAt ? new Date(viewingInvoice.issuedAt).toLocaleDateString() : ''}`}
        maxWidth="max-w-2xl"
      >
        {viewingInvoice && (
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-stone-100 dark:border-dark-800">
              <span className="text-xs text-stone-500 dark:text-gray-400">Statement Settlement Status:</span>
              <StatusBadge status={viewingInvoice.status} />
            </div>

            <div className="grid grid-cols-3 gap-4 bg-[#FDFDFB] dark:bg-dark-900 p-4 rounded-2xl text-xs text-center border border-stone-200 dark:border-dark-800">
              <div>
                <span className="text-stone-400 dark:text-gray-500 uppercase text-[10px] block mb-1 font-semibold">Total Billed</span>
                <span className="font-serif text-lg text-stone-900 dark:text-white font-mono font-bold tabular-nums">LKR {viewingInvoice.totalAmount?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-stone-400 dark:text-gray-500 uppercase text-[10px] block mb-1 font-semibold">Verified Paid</span>
                <span className="font-serif text-lg text-emerald-700 dark:text-emerald-400 font-mono font-bold tabular-nums">LKR {viewingInvoice.amountPaid?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-stone-400 dark:text-gray-500 uppercase text-[10px] block mb-1 font-semibold">Balance Due</span>
                <span className="font-serif text-lg text-amber-700 dark:text-gold-400 font-mono font-bold tabular-nums">LKR {viewingInvoice.balanceDue?.toLocaleString()}</span>
              </div>
            </div>

            <div>
              <h3 className="font-serif text-lg text-stone-900 dark:text-white mb-3 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-amber-800 dark:text-gold-400" />
                <span>Verified Payment Slips & Slips</span>
              </h3>
              <div className="space-y-2">
                {invoicePayments.length === 0 ? (
                  <p className="text-xs text-stone-500 dark:text-gray-500 italic p-4 text-center">No payment slips recorded for this reservation yet.</p>
                ) : (
                  invoicePayments.map(p => (
                    <div key={p.id} className="flex justify-between items-center bg-[#FDFDFB] dark:bg-dark-900 p-3 rounded-xl text-xs border border-stone-200 dark:border-dark-800">
                      <div>
                        <span className="font-mono text-amber-800 dark:text-gold-400 font-bold">
                          {p.type === 'REFUND' ? `Refund #${p.id}` : `Slip #${p.id}`}
                        </span>
                        <span className="text-stone-700 dark:text-gray-300 ml-2 font-medium">
                          {p.type === 'REFUND' ? 'Settlement Disbursement' : p.type} via {p.method}
                        </span>
                        <span className="text-stone-400 dark:text-gray-500 text-[10px] block font-mono">{new Date(p.paidAt).toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                        <span className={`font-mono font-bold block ${p.type === 'REFUND' ? 'text-purple-600 dark:text-purple-400' : 'text-stone-900 dark:text-white'}`}>
                          {p.type === 'REFUND' ? '− ' : ''}LKR {p.amount?.toLocaleString()}
                        </span>
                        <StatusBadge status={p.type === 'REFUND' ? 'REFUNDED' : p.status} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => window.print()}
                className="btn-primary flex-1 text-xs py-3 flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Receipt</span>
              </button>
              <button 
                onClick={() => setViewingInvoice(null)}
                className="btn-outline px-6 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Upgraded Payment Recording Modal */}
      <Modal
        open={!!payingReservation}
        onClose={() => setPayingReservation(null)}
        badge="Payment Submission"
        title="Submit Payment Slip"
        subtitle={`Reservation #${payingReservation?.id} · ${payingReservation?.venueName}`}
        maxWidth="max-w-lg"
      >
        {payingReservation && (() => {
          const verifiedPaid = (payingPayments || [])
            .filter(p => p.status === 'VERIFIED')
            .reduce((sum, p) => sum + Number(p.amount), 0);
          const pendingDeposit = (payingPayments || []).find(p => p.type === 'DEPOSIT' && p.status === 'PENDING');
          const pendingFull = (payingPayments || []).find(p => p.type === 'FULL' && p.status === 'PENDING');
          const isQuotationAccepted = payingQuotation && payingQuotation.status === 'ACCEPTED';
          const depositRequired = payingQuotation ? Number((payingQuotation.totalAmount * 0.30).toFixed(2)) : 0;
          const remainingBalance = payingQuotation ? Math.max(0, Number((payingQuotation.totalAmount - verifiedPaid).toFixed(2))) : 0;

          return (
            <div className="space-y-4">
              {paymentModalLoading ? (
                <div className="py-12 text-center text-stone-500 dark:text-gray-400 space-y-3">
                  <div className="w-8 h-8 border-2 border-amber-600 dark:border-gold-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs tracking-wider">Verifying quotation and payment records...</p>
                </div>
              ) : paymentSuccess ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 p-6 rounded-2xl text-center space-y-3 shadow-inner">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500 flex items-center justify-center mx-auto text-xl font-bold">
                    ✓
                  </div>
                  <h3 className="font-serif text-lg text-stone-900 dark:text-white font-medium">Payment Slip Submitted</h3>
                  <p className="text-xs text-emerald-800 dark:text-emerald-200">{paymentSuccess}</p>
                  <p className="text-[11px] text-stone-500 dark:text-gray-400 pt-1">Dialog will close automatically...</p>
                </div>
              ) : !payingQuotation ? (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 p-6 rounded-2xl text-center space-y-3">
                  <div className="text-2xl">📋</div>
                  <h3 className="font-serif text-lg text-amber-800 dark:text-amber-300">No Quotation Issued Yet</h3>
                  <p className="text-xs text-stone-600 dark:text-gray-400 leading-relaxed">
                    Our Reservation Officer is currently preparing your custom quotation. Payments can only be recorded once the official quotation has been issued and accepted by you.
                  </p>
                  <button 
                    onClick={() => setPayingReservation(null)}
                    className="btn-outline text-xs px-6 py-2.5 mt-2"
                  >
                    Close
                  </button>
                </div>
              ) : !isQuotationAccepted ? (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 p-6 rounded-2xl text-center space-y-4">
                  <div className="text-2xl">⚠️</div>
                  <div>
                    <h3 className="font-serif text-lg text-amber-800 dark:text-amber-300">Quotation Acceptance Required</h3>
                    <p className="text-xs text-stone-600 dark:text-gray-400 leading-relaxed mt-1">
                      Quotation #{payingQuotation.id} has not been accepted yet (Current Status: <strong className="text-amber-800 dark:text-gold-400">{payingQuotation.status}</strong>).
                      Hotel financial regulations require you to accept the formal quote before submitting a payment.
                    </p>
                  </div>
                  <div className="flex gap-3 justify-center pt-2">
                    <button
                      onClick={() => {
                        const resId = payingReservation.id;
                        setPayingReservation(null);
                        handleViewQuotation(resId);
                      }}
                      className="btn-primary text-xs py-2.5 px-5"
                    >
                      Review & Accept Quotation
                    </button>
                    <button 
                      onClick={() => setPayingReservation(null)}
                      className="btn-outline text-xs px-5 py-2.5"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : payingReservation.status === 'APPROVED' && pendingDeposit ? (
                <div className="bg-sky-50 dark:bg-blue-950/40 border border-sky-200 dark:border-blue-800/60 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 text-sky-800 dark:text-blue-300 font-medium text-sm">
                    <span className="text-lg">⏳</span>
                    <span>Deposit Slip Awaiting Verification</span>
                  </div>
                  <p className="text-xs text-stone-700 dark:text-gray-300 leading-relaxed">
                    You have already submitted a 30% deposit payment of{' '}
                    <strong className="text-stone-900 dark:text-white font-mono font-bold">LKR {pendingDeposit.amount?.toLocaleString()}</strong> via {pendingDeposit.method}.
                  </p>
                  <p className="text-xs text-stone-600 dark:text-gray-400 leading-relaxed">
                    Our Finance Officer is currently reviewing the slip. Once verified, your reservation will be marked as <span className="text-amber-800 dark:text-gold-400 font-semibold">CONFIRMED</span> and you can make the final settlement payment.
                  </p>
                  <button 
                    onClick={() => setPayingReservation(null)}
                    className="btn-outline text-xs w-full py-2.5"
                  >
                    Close
                  </button>
                </div>
              ) : payingReservation.status === 'CONFIRMED' && pendingFull ? (
                <div className="bg-sky-50 dark:bg-blue-950/40 border border-sky-200 dark:border-blue-800/60 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 text-sky-800 dark:text-blue-300 font-medium text-sm">
                    <span className="text-lg">⏳</span>
                    <span>Final Payment Awaiting Verification</span>
                  </div>
                  <p className="text-xs text-stone-700 dark:text-gray-300 leading-relaxed">
                    You have already submitted a final settlement slip of{' '}
                    <strong className="text-stone-900 dark:text-white font-mono font-bold">LKR {pendingFull.amount?.toLocaleString()}</strong> via {pendingFull.method}.
                  </p>
                  <p className="text-xs text-stone-600 dark:text-gray-400 leading-relaxed">
                    Finance verification is in progress. Once confirmed, your official invoice and receipt will be fully settled.
                  </p>
                  <button 
                    onClick={() => setPayingReservation(null)}
                    className="btn-outline text-xs w-full py-2.5"
                  >
                    Close
                  </button>
                </div>
              ) : payingReservation.status === 'CONFIRMED' && remainingBalance <= 0 ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-6 rounded-2xl text-center space-y-3">
                  <div className="text-3xl text-emerald-600 dark:text-emerald-400">✓</div>
                  <h3 className="font-serif text-lg text-stone-900 dark:text-white">Reservation Fully Settled</h3>
                  <p className="text-xs text-stone-700 dark:text-gray-300">
                    All quotation charges have been completely paid and verified (Total Paid: <strong className="text-stone-900 dark:text-white font-mono">LKR {verifiedPaid?.toLocaleString()}</strong>).
                  </p>
                  <div className="pt-2 flex gap-3">
                    <button 
                      onClick={() => {
                        const resId = payingReservation.id;
                        setPayingReservation(null);
                        handleViewInvoice(resId);
                      }}
                      className="btn-primary flex-1 text-xs py-2.5"
                    >
                      View Invoice / Receipt
                    </button>
                    <button 
                      onClick={() => setPayingReservation(null)}
                      className="btn-outline text-xs px-5 py-2.5"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                /* Payment Submission Form */
                <form onSubmit={handleRecordPayment} className="space-y-4">
                  {/* Financial Summary Card */}
                  <div className="bg-[#FDFDFB] dark:bg-dark-900 border border-stone-200 dark:border-dark-800 p-4 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between text-stone-600 dark:text-gray-400">
                      <span>Accepted Quotation Total:</span>
                      <span className="font-mono text-stone-900 dark:text-white font-medium">LKR {payingQuotation.totalAmount?.toLocaleString()}</span>
                    </div>
                    {payingReservation.status === 'CONFIRMED' && (
                      <div className="flex justify-between text-stone-600 dark:text-gray-400">
                        <span>Verified Deposit Paid:</span>
                        <span className="font-mono text-emerald-700 dark:text-emerald-400 font-medium">LKR {verifiedPaid?.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-stone-200 dark:border-dark-800 flex justify-between font-bold">
                      <span className="text-amber-800 dark:text-gold-400">
                        {payingReservation.status === 'APPROVED' ? '30% Initial Deposit Due:' : 'Remaining Balance Due:'}
                      </span>
                      <span className="font-mono text-stone-900 dark:text-white text-sm">
                        LKR {payingReservation.status === 'APPROVED' ? depositRequired?.toLocaleString() : remainingBalance?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {paymentError && (
                    <div className="bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 p-3.5 rounded-xl text-xs font-medium leading-relaxed">
                      ⚠️ {paymentError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-amber-800 dark:text-gold-400 uppercase tracking-wider mb-1">
                      Payment Category
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={paymentType === 'DEPOSIT' ? '30% Initial Deposit (Policy Required)' : 'Full Settlement (Remaining Balance)'}
                      className="input-field bg-stone-100 dark:bg-dark-900 text-stone-700 dark:text-gray-300 cursor-not-allowed text-xs font-medium"
                    />
                  </div>

                  {paymentMethod === 'BANK_TRANSFER' ? (
                    <div className="bg-[#FDFDFB] dark:bg-dark-900 border border-stone-200 dark:border-dark-800 p-3.5 rounded-xl flex items-center justify-between">
                      <div>
                        <label className="block text-[10px] font-bold text-amber-800 dark:text-gold-400 uppercase tracking-wider mb-0.5">
                          Amount Due (Pre-Calculated)
                        </label>
                        <span className="font-mono text-base font-bold text-stone-900 dark:text-white">
                          LKR {Number(paymentAmount || 0).toLocaleString()}
                        </span>
                      </div>
                      <span className="badge-gold text-[10px] py-1 px-2.5">
                        {paymentType === 'DEPOSIT' ? '30% Advance Deposit' : 'Full Settlement'}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-amber-800 dark:text-gold-400 uppercase tracking-wider mb-1">
                        Amount to Pay (LKR)
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className="input-field font-mono font-semibold"
                        required
                      />
                      <p className="text-[11px] text-stone-500 dark:text-gray-500 mt-1">
                        {paymentType === 'DEPOSIT' 
                          ? '• Hotel policy requires exactly 30% of accepted quotation as initial deposit.' 
                          : '• Exact amount settles the remaining outstanding quotation balance.'}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-amber-800 dark:text-gold-400 uppercase tracking-wider mb-1">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={handleMethodChange}
                      className="input-field cursor-pointer text-xs"
                    >
                      <option value="BANK_TRANSFER">🏦 Direct Bank Transfer (No details needed)</option>
                      <option value="CARD">💳 Debit / Credit Card</option>
                      <option value="CASH">💵 Cash Over Hotel Counter</option>
                      <option value="CHEQUE">📄 Corporate Cheque</option>
                    </select>
                  </div>

                  {/* Bank Details */}
                  {paymentMethod === 'BANK_TRANSFER' && (
                    <div className="space-y-3">
                      <div className="bg-[#FDFDFB] dark:bg-dark-900 border border-stone-200 dark:border-dark-800 p-4 rounded-xl text-xs space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-amber-800 dark:text-gold-400 font-semibold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Hotel Transfer Account</span>
                          </span>
                          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                            Verified Beneficiary
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-stone-400 dark:text-gray-500 text-[10px] uppercase block">Bank</span>
                            <strong className="text-stone-800 dark:text-gray-200">Commercial Bank of Ceylon</strong>
                          </div>
                          <div>
                            <span className="text-stone-400 dark:text-gray-500 text-[10px] uppercase block">Branch</span>
                            <strong className="text-stone-800 dark:text-gray-200">Colombo Fort Branch</strong>
                          </div>
                          <div className="col-span-2">
                            <span className="text-stone-400 dark:text-gray-500 text-[10px] uppercase block">Beneficiary Name</span>
                            <strong className="text-stone-800 dark:text-gray-200">GrandStay Luxury Events (Pvt) Ltd</strong>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-stone-200 dark:border-dark-800 flex items-center justify-between bg-white dark:bg-dark-950 p-2.5 rounded-lg border border-stone-100 dark:border-dark-800/80">
                          <div>
                            <span className="text-[9px] uppercase font-bold text-stone-400 dark:text-gray-500 tracking-wider block">Account Number</span>
                            <span className="font-mono text-sm font-bold text-stone-900 dark:text-white tracking-widest">8001234567</span>
                          </div>
                          <button
                            type="button"
                            onClick={copyAccountNumber}
                            className="btn-outline text-[11px] py-1.5 px-3 flex items-center gap-1.5 hover:border-amber-500/60"
                          >
                            {copiedAccount ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500 stroke-[2.5]" />
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-stone-500 dark:text-gray-400" />
                                <span>Copy No.</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Zero details reassurance banner */}
                      <div className="flex items-start gap-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 p-3 rounded-xl text-[11px] text-emerald-800 dark:text-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <p className="font-semibold text-emerald-900 dark:text-emerald-200">No Details Required</p>
                          <p className="text-[10.5px] leading-relaxed text-emerald-800/90 dark:text-emerald-300/90">
                            Perform the transfer from your bank app or branch. You do not need to enter card details or reference numbers here. Simply click the submit button below to lodge your payment record for Finance Officer audit.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cash reminder */}
                  {paymentMethod === 'CASH' && (
                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 p-3 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
                      <p className="font-semibold uppercase text-[10px] tracking-wider">Cash Payment Instructions:</p>
                      <p>Please visit the <strong>GrandStay Finance Counter</strong> (Ground Floor, Lobby) with the exact amount. A receipt will be issued on the spot and verified shortly.</p>
                    </div>
                  )}

                  {/* Cheque reminder */}
                  {paymentMethod === 'CHEQUE' && (
                    <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/50 p-3 rounded-xl text-[11px] text-sky-800 dark:text-sky-300 space-y-1">
                      <p className="font-semibold uppercase text-[10px] tracking-wider">Cheque Payment Instructions:</p>
                      <p>Make cheque payable to <strong>GrandStay Luxury Events (Pvt) Ltd</strong> and hand to Finance Counter. Allow 2–3 business days for clearance.</p>
                    </div>
                  )}

                  {/* ── Card Payment UI with 3D Preview ──────────────────── */}
                  {paymentMethod === 'CARD' && (
                    <div className="space-y-4 pt-2">
                      <div className={`relative rounded-2xl p-5 text-white overflow-hidden shadow-xl select-none transition-all duration-500
                        ${cardType === 'visa'       ? 'bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800' :
                          cardType === 'mastercard' ? 'bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950'  :
                          cardType === 'amex'       ? 'bg-gradient-to-br from-teal-800 via-teal-700 to-cyan-800'  :
                                                      'bg-gradient-to-br from-stone-800 via-stone-700 to-stone-900'}`}>

                        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
                        <div className="absolute -bottom-8 -right-2 w-24 h-24 rounded-full bg-white/5 blur-lg pointer-events-none" />

                        <div className="flex justify-between items-start mb-6">
                          <div className="w-10 h-7 rounded bg-amber-400/80 flex items-center justify-center shadow-inner">
                            <div className="w-5 h-5 rounded-sm bg-amber-300/90" />
                          </div>
                          <span className="text-xs font-bold tracking-widest uppercase opacity-90 font-mono">
                            {cardType === 'visa'       ? 'VISA'        :
                             cardType === 'mastercard' ? 'MASTERCARD'  :
                             cardType === 'amex'       ? 'AMEX'        : 'CARD'}
                          </span>
                        </div>

                        <p className="font-mono text-lg tracking-widest mb-4 opacity-90">
                          {cardNumber || '•••• •••• •••• ••••'}
                        </p>

                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[9px] uppercase opacity-60 tracking-wider mb-0.5 font-semibold">Card Holder</p>
                            <p className="text-sm font-semibold uppercase tracking-wide opacity-95">
                              {cardHolder || 'YOUR NAME'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] uppercase opacity-60 tracking-wider mb-0.5 font-semibold">Expires</p>
                            <p className="text-sm font-mono opacity-95">{cardExpiry || 'MM/YY'}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-amber-800 dark:text-gold-400 uppercase tracking-wider mb-1">
                          Card Number
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          maxLength={19}
                          className="input-field font-mono tracking-widest text-sm"
                          required={paymentMethod === 'CARD'}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-amber-800 dark:text-gold-400 uppercase tracking-wider mb-1">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={handleExpiryChange}
                            maxLength={5}
                            className="input-field font-mono text-sm"
                            required={paymentMethod === 'CARD'}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-amber-800 dark:text-gold-400 uppercase tracking-wider mb-1">
                            CVV / CVC
                          </label>
                          <input
                            type="password"
                            inputMode="numeric"
                            placeholder="•••"
                            value={cardCVV}
                            onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            maxLength={4}
                            className="input-field font-mono text-sm"
                            required={paymentMethod === 'CARD'}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-amber-800 dark:text-gold-400 uppercase tracking-wider mb-1">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          placeholder="Name as printed on card"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                          className="input-field text-sm uppercase tracking-wide"
                          required={paymentMethod === 'CARD'}
                        />
                      </div>

                      <div className="flex items-start gap-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 p-3 rounded-xl text-[11px] text-emerald-800 dark:text-emerald-300">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <p>Your transaction is encrypted with 256-bit TLS security. We accept Visa, Mastercard, and American Express.</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-3">
                    <button 
                      type="submit" 
                      disabled={paymentSubmitting} 
                      className="btn-primary flex-1 text-xs py-3.5 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {paymentSubmitting 
                        ? 'Submitting Record...' 
                        : paymentMethod === 'BANK_TRANSFER'
                          ? `Submit Direct Bank Transfer Slip (LKR ${Number(paymentAmount || 0).toLocaleString()})`
                          : `Submit Payment Slip (LKR ${Number(paymentAmount || 0).toLocaleString()})`}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setPayingReservation(null)}
                      className="btn-outline px-6 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          );
        })()}
      </Modal>

      {/* Cancellation Confirmation Modal */}
      <ConfirmModal
        open={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
        onConfirm={executeCancel}
        title="Cancel Reservation Request"
        message={cancelPolicyInfo}
        confirmLabel="Confirm Cancellation"
        cancelLabel="Keep Reservation"
        variant="danger"
      />
    </div>
  );
}
