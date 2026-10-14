import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  X, 
  FileText, 
  Sparkles, 
  Clock, 
  Users, 
  Building2, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import ConfirmModal from '../../components/ConfirmModal';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const TABS = ['ALL', 'PENDING', 'APPROVED', 'CONFIRMED', 'COMPLETED', 'REJECTED', 'CANCELLED'];

export default function ReservationDashboard() {
  const toast = useToast();
  const [reservations, setReservations] = useState([]);
  const [tab, setTab] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Confirm modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // { id, status }

  const fetchData = () => {
    setLoading(true);
    api.get('/reservations')
      .then(r => setReservations(r.data || []))
      .catch(() => toast.error('Failed to load reservations list.', 'Network Error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusClick = (id, status) => {
    setConfirmAction({ id, status });
    setConfirmOpen(true);
  };

  const executeStatusUpdate = async (remarks) => {
    const { id, status } = confirmAction;
    try {
      await api.put(`/reservations/${id}/status`, { status, remarks: remarks || null });
      toast.success(
        status === 'APPROVED' 
          ? `Reservation #${id} approved! You can now generate an official quotation.` 
          : `Reservation #${id} rejected.`,
        'Status Updated'
      );
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update reservation status', 'Update Error');
    } finally {
      setConfirmOpen(false);
      setConfirmAction(null);
    }
  };

  const filtered = tab === 'ALL' ? reservations : reservations.filter(r => r.status === tab);

  return (
    <div className="min-h-screen bg-[#FDFDFB] dark:bg-dark text-stone-900 dark:text-slate-100 pb-20 transition-colors">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <span className="badge-gold mb-2 inline-flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-gold-400" />
            <span>Reservation Officer Portal</span>
          </span>
          <h1 className="font-serif text-4xl text-stone-900 dark:text-white font-normal tracking-tight">
            Reservation Management
          </h1>
          <p className="text-xs text-stone-600 dark:text-gray-400 mt-1 leading-relaxed">
            Review incoming requests, approve or reject reservations, and manage the booking pipeline.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 mb-6 select-none">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                tab === t
                  ? 'bg-amber-600 dark:bg-gold-500 text-white dark:text-dark-950 shadow-sm dark:shadow-glow-gold'
                  : 'bg-white dark:bg-dark-900 text-stone-700 dark:text-gray-400 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-dark-700 shadow-sm'
              }`}
            >
              {t} ({t === 'ALL' ? reservations.length : reservations.filter(r => r.status === t).length})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-stone-500 dark:text-gray-500">
            <div className="w-10 h-10 border-2 border-amber-600 dark:border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="font-serif text-stone-600 dark:text-gray-400">Loading reservations...</p>
          </div>
        ) : (
          <div className="card overflow-x-auto p-0 border border-stone-200 dark:border-dark-700/80 bg-white dark:bg-dark-900/90 shadow-sm dark:shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FDFBF7] dark:bg-dark-950 border-b border-stone-200 dark:border-dark-700 text-stone-600 dark:text-gray-400 uppercase tracking-wider">
                <tr>
                  {['#', 'Customer', 'Venue Space', 'Package Tier', 'Event Date', 'Attendees', 'Status', 'Actions / Remarks'].map(h => (
                    <th key={h} className="px-4 py-3.5 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-dark-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-stone-500 dark:text-gray-500">
                      No reservations found in category '{tab}'
                    </td>
                  </tr>
                ) : filtered.map(r => (
                  <tr key={r.id} className="hover:bg-[#F6F4EE] dark:hover:bg-dark-800/50 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-amber-800 dark:text-gold-400 font-bold">#{r.id}</td>
                    <td className="px-4 py-3.5 text-stone-900 dark:text-white font-medium">{r.customerName}</td>
                    <td className="px-4 py-3.5 text-stone-700 dark:text-gray-300">{r.venueName}</td>
                    <td className="px-4 py-3.5 text-stone-700 dark:text-gray-300">
                      <div className="font-medium text-stone-900 dark:text-white">{r.packageName}</div>
                      {r.selectedAddons && r.selectedAddons.length > 0 && (
                        <div className="text-[10px] text-amber-700 dark:text-gold-400 font-semibold mt-0.5">
                          +{r.selectedAddons.length} add-on{r.selectedAddons.length > 1 ? 's' : ''} included
                        </div>
                      )}
                      {r.specialRequest && (
                        <div className="text-[10px] text-stone-400 dark:text-gray-500 italic max-w-xs truncate" title={r.specialRequest}>
                          Note: "{r.specialRequest}"
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-stone-600 dark:text-gray-400 font-mono">{new Date(r.eventDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3.5 text-stone-600 dark:text-gray-400 font-mono">👥 {r.guestCount}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      {r.status === 'PENDING' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStatusClick(r.id, 'APPROVED')}
                            className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700 px-3 py-1 rounded-full dark:hover:bg-emerald-900 transition-colors font-medium shadow-sm inline-flex items-center gap-1"
                          >
                            <Check className="w-3 h-3 stroke-[2.5]" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleStatusClick(r.id, 'REJECTED')}
                            className="text-[11px] bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100 dark:bg-rose-900/50 dark:text-rose-300 dark:border-rose-700 px-3 py-1 rounded-full dark:hover:bg-rose-900 transition-colors font-medium shadow-sm inline-flex items-center gap-1"
                          >
                            <X className="w-3 h-3 stroke-[2.5]" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : r.status === 'APPROVED' ? (
                        <Link
                          to={`/dashboard/quotations?reservationId=${r.id}`}
                          className="text-[11px] bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 dark:bg-gold-500/20 dark:text-gold-300 dark:border-gold-500/40 px-3 py-1 rounded-full dark:hover:bg-gold-500/30 transition-colors font-medium inline-flex items-center gap-1 shadow-sm"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Manage Quotation &rarr;</span>
                        </Link>
                      ) : r.status === 'REJECTED' && r.rejectionReason ? (
                        <span className="text-xs text-rose-700 dark:text-rose-400 italic" title={r.rejectionReason}>
                          Reason: {r.rejectionReason}
                        </span>
                      ) : (
                        <span className="text-xs text-stone-400 dark:text-gray-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm / Reject Modal */}
      <ConfirmModal
        open={confirmOpen}
        onClose={() => { setConfirmOpen(false); setConfirmAction(null); }}
        onConfirm={executeStatusUpdate}
        title={confirmAction?.status === 'REJECTED' ? 'Reject Reservation Request' : 'Approve Reservation Request'}
        message={
          confirmAction?.status === 'REJECTED'
            ? 'Please provide an explanatory reason for rejecting this reservation. The customer will review this feedback in their portal.'
            : `Are you sure you want to approve reservation #${confirmAction?.id}? This will enable quotation creation.`
        }
        confirmLabel={confirmAction?.status === 'REJECTED' ? 'Confirm Rejection' : 'Approve Reservation'}
        variant={confirmAction?.status === 'REJECTED' ? 'danger' : 'default'}
        prompt={confirmAction?.status === 'REJECTED' ? 'e.g. Space reserved for hotel gala or under scheduled maintenance...' : null}
        promptRequired={confirmAction?.status === 'REJECTED'}
      />
    </div>
  );
}
