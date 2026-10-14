import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Wallet, 
  CheckCircle2, 
  Clock, 
  Star, 
  RefreshCw, 
  Printer, 
  Building2, 
  Sparkles, 
  MessageSquare, 
  HelpCircle,
  Users,
  ShieldCheck,
  Award
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { fadeUp, staggerContainer, TRANSITION_EASE_LUXURY } from '../../utils/motion';
import { syncFromAnalytics } from '../../utils/metricsService';

export default function ManagerDashboard() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSummary = () => {
    setLoading(true);
    setError('');
    api.get('/analytics/summary')
      .then(r => {
        setData(r.data);
        if (r.data) {
          syncFromAnalytics(r.data);
        }
      })
      .catch(err => {
        const msg = err.response?.data?.error || 'Failed to fetch executive analytics.';
        setError(msg);
        toast.error(msg, 'Analytics Error');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#FDFDFB] dark:bg-dark text-stone-900 dark:text-slate-100 pb-20 print:bg-white print:text-black print:pb-0 transition-colors">
      <div className="print:hidden">
        <Navbar />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 print:py-4 print:px-0">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 print:border-b print:pb-4">
          <div>
            <div className="flex items-center gap-2 mb-2 print:hidden">
              <span className="badge-gold inline-flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-gold-400" />
                <span>Executive Intelligence</span>
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-stone-900 dark:text-white font-normal print:text-black">
              Executive Analytics & Revenue Report
            </h1>
            <p className="text-stone-600 dark:text-gray-400 text-xs mt-1 print:text-gray-700">
              High-level operational overview, pipeline distributions, and customer satisfaction metrics.
            </p>
          </div>
          
          <div className="flex gap-3 print:hidden">
            <button
              onClick={fetchSummary}
              className="btn-glass text-xs py-2 px-4 flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Data</span>
            </button>
            <button
              onClick={handlePrint}
              className="btn-primary text-xs py-2 px-5 flex items-center gap-2"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export / Print Report</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-red-900/40 border border-rose-300 dark:border-red-700 text-rose-800 dark:text-red-300 text-sm px-6 py-4 rounded-xl mb-6 text-center shadow-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-24 text-stone-500 dark:text-gray-500">
            <div className="w-10 h-10 border-2 border-amber-600 dark:border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="font-serif text-lg text-stone-600 dark:text-gray-400">Compiling executive report...</p>
          </div>
        ) : data && (
          <motion.div 
            variants={staggerContainer(0.08)}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Top Financial KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Total Billed */}
              <motion.div 
                variants={fadeUp(20, 0.4)}
                className="card bg-white dark:bg-dark-900/90 border border-stone-200 dark:border-gold-500/30 p-6 relative overflow-hidden shadow-sm dark:shadow-none print:border-stone-300"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 rounded-full blur-xl pointer-events-none print:hidden" />
                <span className="text-stone-500 dark:text-gray-400 text-[11px] uppercase tracking-wider block mb-1 font-semibold flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-amber-700 dark:text-gold-400" />
                  <span>Total Billed Value</span>
                </span>
                <p className="font-serif text-3xl text-stone-900 dark:text-white font-medium tabular-nums print:text-black">
                  LKR {data.totalBilledRevenue?.toLocaleString()}
                </p>
                <p className="text-[11px] text-stone-500 dark:text-gray-500 mt-2">Cumulative invoiced total</p>
              </motion.div>

              {/* Verified Collections */}
              <motion.div 
                variants={fadeUp(20, 0.4)}
                className="card bg-white dark:bg-dark-900/90 border border-emerald-200 dark:border-emerald-500/30 p-6 relative overflow-hidden shadow-sm dark:shadow-none print:border-stone-300"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none print:hidden" />
                <span className="text-emerald-800 dark:text-emerald-400 text-[11px] uppercase tracking-wider block mb-1 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Collections</span>
                </span>
                <p className="font-serif text-3xl text-emerald-700 dark:text-emerald-300 font-medium tabular-nums">
                  LKR {data.verifiedCollections?.toLocaleString()}
                </p>
                <p className="text-[11px] text-stone-500 dark:text-gray-500 mt-2">Verified deposits & settlements</p>
              </motion.div>

              {/* Outstanding Receivables */}
              <motion.div 
                variants={fadeUp(20, 0.4)}
                className="card bg-white dark:bg-dark-900/90 border border-amber-200 dark:border-amber-500/30 p-6 relative overflow-hidden shadow-sm dark:shadow-none print:border-stone-300"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none print:hidden" />
                <span className="text-amber-800 dark:text-amber-400 text-[11px] uppercase tracking-wider block mb-1 font-semibold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Outstanding Receivables</span>
                </span>
                <p className="font-serif text-3xl text-amber-700 dark:text-amber-300 font-medium tabular-nums">
                  LKR {data.pendingBalance?.toLocaleString()}
                </p>
                <p className="text-[11px] text-stone-500 dark:text-gray-500 mt-2">Pending balance dues on invoices</p>
              </motion.div>

              {/* Customer Satisfaction */}
              <motion.div 
                variants={fadeUp(20, 0.4)}
                className="card bg-white dark:bg-dark-900/90 border border-stone-200 dark:border-gold-500/30 p-6 relative overflow-hidden shadow-sm dark:shadow-none print:border-stone-300"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 rounded-full blur-xl pointer-events-none print:hidden" />
                <span className="text-amber-800 dark:text-gold-400 text-[11px] uppercase tracking-wider block mb-1 font-semibold flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  <span>Customer Satisfaction</span>
                </span>
                <div className="flex items-baseline gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-6 h-6 fill-amber-500 text-amber-500 dark:fill-gold-400 dark:text-gold-400" />
                    <p className="font-serif text-3xl text-stone-900 dark:text-white font-medium print:text-black">
                      {data.averageRating > 0 ? data.averageRating : 'N/A'}
                    </p>
                  </div>
                  <span className="text-xs text-stone-500 dark:text-gray-400">/ 5.0</span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-gray-500 mt-2">Based on {data.totalFeedbacks} verified reviews</p>
              </motion.div>
            </div>

            {/* Operational Metrics & Pipeline */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Reservation Breakdown Card */}
              <motion.div 
                variants={fadeUp(20, 0.5)}
                className="card bg-white dark:bg-dark-900/90 border border-stone-200 dark:border-dark-700/80 p-6 shadow-sm dark:shadow-none print:border-stone-300"
              >
                <h3 className="font-serif text-xl text-stone-900 dark:text-white mb-4 pb-2 border-b border-stone-200 dark:border-dark-800 flex items-center justify-between print:text-black">
                  <span>Reservation Pipeline</span>
                  <span className="font-mono text-xs text-amber-800 dark:text-gold-400 bg-amber-50 dark:bg-dark-950 px-2.5 py-1 rounded border border-amber-200 dark:border-transparent font-medium">Total: {data.totalReservations}</span>
                </h3>
                
                <div className="space-y-4 text-xs">
                  <div>
                    <div className="flex justify-between text-stone-600 dark:text-gray-400 mb-1">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                        <span>Approved / Confirmed</span>
                      </span>
                      <span className="font-bold text-stone-900 dark:text-white font-mono">{data.approvedReservations}</span>
                    </div>
                    <div className="w-full bg-stone-200 dark:bg-dark-950 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-700 ease-out" 
                        style={{ width: `${data.totalReservations ? (data.approvedReservations / data.totalReservations) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-stone-600 dark:text-gray-400 mb-1">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                        <span>Pending Review</span>
                      </span>
                      <span className="font-bold text-stone-900 dark:text-white font-mono">{data.pendingReservations}</span>
                    </div>
                    <div className="w-full bg-stone-200 dark:bg-dark-950 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-amber-400 h-full rounded-full transition-all duration-700 ease-out" 
                        style={{ width: `${data.totalReservations ? (data.pendingReservations / data.totalReservations) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-stone-600 dark:text-gray-400 mb-1">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                        <span>Cancelled / Rejected</span>
                      </span>
                      <span className="font-bold text-stone-900 dark:text-white font-mono">{data.cancelledReservations}</span>
                    </div>
                    <div className="w-full bg-stone-200 dark:bg-dark-950 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-rose-500 h-full rounded-full transition-all duration-700 ease-out" 
                        style={{ width: `${data.totalReservations ? (data.cancelledReservations / data.totalReservations) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-200 dark:border-dark-800 grid grid-cols-2 gap-3 text-center">
                  <div className="bg-[#FDFDFB] dark:bg-dark-950 p-3 rounded-xl border border-stone-200 dark:border-transparent">
                    <span className="text-[10px] text-stone-500 dark:text-gray-500 uppercase tracking-wider block font-semibold">Active Spaces</span>
                    <span className="font-serif text-lg text-amber-800 dark:text-gold-400 font-bold">{data.totalVenues}</span>
                  </div>
                  <div className="bg-[#FDFDFB] dark:bg-dark-950 p-3 rounded-xl border border-stone-200 dark:border-transparent">
                    <span className="text-[10px] text-stone-500 dark:text-gray-500 uppercase tracking-wider block font-semibold">Package Tiers</span>
                    <span className="font-serif text-lg text-amber-800 dark:text-gold-400 font-bold">{data.totalPackages}</span>
                  </div>
                </div>
              </motion.div>

              {/* Venue Popularity */}
              <motion.div 
                variants={fadeUp(20, 0.5)}
                className="card bg-white dark:bg-dark-900/90 border border-stone-200 dark:border-dark-700/80 p-6 shadow-sm dark:shadow-none print:border-stone-300"
              >
                <h3 className="font-serif text-xl text-stone-900 dark:text-white mb-4 pb-2 border-b border-stone-200 dark:border-dark-800 print:text-black">
                  Venue Demand & Utilization
                </h3>
                {data.reservationsByVenue && Object.keys(data.reservationsByVenue).length > 0 ? (
                  <div className="space-y-4 text-xs">
                    {Object.entries(data.reservationsByVenue).map(([venueName, count]) => (
                      <div key={venueName}>
                        <div className="flex justify-between text-stone-700 dark:text-gray-300 mb-1">
                          <span className="truncate pr-2 font-medium">{venueName}</span>
                          <span className="font-mono text-amber-800 dark:text-gold-400 font-bold">{count} bookings</span>
                        </div>
                        <div className="w-full bg-stone-200 dark:bg-dark-950 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-amber-600 to-yellow-500 dark:from-gold-600 dark:to-gold-400 h-full rounded-full transition-all duration-700 ease-out" 
                            style={{ width: `${data.totalReservations ? (count / data.totalReservations) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-stone-500 dark:text-gray-500 text-xs py-8 text-center">No venue booking data available yet.</p>
                )}
              </motion.div>

              {/* Inquiry & Customer Communication Status */}
              <motion.div 
                variants={fadeUp(20, 0.5)}
                className="card bg-white dark:bg-dark-900/90 border border-stone-200 dark:border-dark-700/80 p-6 shadow-sm dark:shadow-none print:border-stone-300"
              >
                <h3 className="font-serif text-xl text-stone-900 dark:text-white mb-4 pb-2 border-b border-stone-200 dark:border-dark-800 flex items-center justify-between print:text-black">
                  <span>Inquiries & Concierge</span>
                  <span className="font-mono text-xs text-amber-800 dark:text-gold-400 bg-amber-50 dark:bg-dark-950 px-2.5 py-1 rounded border border-amber-200 dark:border-transparent font-medium">Total: {data.totalInquiries}</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 bg-[#FDFDFB] dark:bg-dark-950 rounded-xl text-xs border border-stone-200 dark:border-transparent">
                    <span className="text-stone-700 dark:text-gray-300 font-medium">Open Inquiries Pending Reply</span>
                    <span className={`font-mono font-bold px-2 py-0.5 rounded ${data.pendingInquiries > 0 ? 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800' : 'text-stone-400 dark:text-gray-500'}`}>
                      {data.pendingInquiries}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3.5 bg-[#FDFDFB] dark:bg-dark-950 rounded-xl text-xs border border-stone-200 dark:border-transparent">
                    <span className="text-stone-700 dark:text-gray-300 font-medium">Resolved Customer Inquiries</span>
                    <span className="font-mono font-bold text-emerald-800 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800">
                      {data.resolvedInquiries}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3.5 bg-[#FDFDFB] dark:bg-dark-950 rounded-xl text-xs border border-stone-200 dark:border-transparent">
                    <span className="text-stone-700 dark:text-gray-300 font-medium">Total Customer Reviews</span>
                    <span className="font-mono font-bold text-amber-800 dark:text-gold-400 px-2 py-0.5 rounded bg-amber-100 dark:bg-gold-950/50 border border-amber-300 dark:border-gold-800">
                      {data.totalFeedbacks}
                    </span>
                  </div>
                </div>
              </motion.div>

            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
