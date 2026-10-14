import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, MessageSquare, Send, CheckCircle2, Filter, Clock, 
  Sparkles, AlertCircle, Calendar, User, X, ChevronRight 
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { fadeUp } from '../../utils/motion';
import api from '../../services/api';

export default function FeedbackInquiryDashboard() {
  const [tab, setTab] = useState('feedbacks');
  const [feedbacks, setFeedbacks] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [respondId, setRespondId] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get('/feedbacks').then(r => setFeedbacks(r.data)),
      api.get('/feedbacks/average-rating').then(r => setAvgRating(r.data)),
      api.get('/inquiries').then(r => setInquiries(r.data)),
    ])
      .catch(err => {
        console.error('Failed to load feedback/inquiries:', err);
        toast.error('Failed to load dashboard data.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const submitResponse = async (id) => {
    if (!responseText.trim()) return;
    setSubmitting(true);
    try { 
      await api.put(`/inquiries/${id}/respond`, { response: responseText.trim() });
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: 'RESOLVED', adminResponse: responseText.trim() } : i));
      setRespondId(null); 
      setResponseText('');
      toast.success('Response dispatched to customer successfully!');
    } catch { 
      toast.error('Failed to submit response. Please try again.'); 
    } finally {
      setSubmitting(false);
    }
  };

  const Stars = ({ rating }) => (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < rating 
              ? 'fill-amber-400 text-amber-400' 
              : 'fill-transparent text-stone-300 dark:text-stone-700'
          }`}
        />
      ))}
    </div>
  );
  const filteredInquiries = filter === 'ALL' ? inquiries : inquiries.filter(i => i.status === filter);

  return (
    <div className="min-h-screen bg-[#FDFDFB] dark:bg-dark text-stone-900 dark:text-slate-100 pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <span className="badge-gold mb-2 inline-flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-gold-600 dark:text-gold-400" />
            Administration
          </span>
          <h1 className="font-serif text-4xl text-stone-900 dark:text-white font-normal">Feedback & Inquiry Management</h1>
          <p className="text-xs text-stone-600 dark:text-gray-400 mt-1">Monitor guest reviews, respond to customer inquiries, and manage service quality.</p>
        </div>

        {/* Tab Pills */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('feedbacks')}
            className={`px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all inline-flex items-center gap-2 ${
              tab === 'feedbacks'
                ? 'bg-gold-500 text-dark-950 shadow-glow-gold'
                : 'bg-white dark:bg-dark-900 text-stone-700 dark:text-gray-400 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-dark-700 shadow-sm'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            Reviews ({feedbacks.length})
          </button>
          <button
            onClick={() => setTab('inquiries')}
            className={`px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all inline-flex items-center gap-2 ${
              tab === 'inquiries'
                ? 'bg-gold-500 text-dark-950 shadow-glow-gold'
                : 'bg-white dark:bg-dark-900 text-stone-700 dark:text-gray-400 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-dark-700 shadow-sm'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Inquiries ({inquiries.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-stone-500 dark:text-gray-500">
            <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="font-serif text-stone-600 dark:text-gray-400">Loading dashboard...</p>
          </div>
        ) : tab === 'feedbacks' ? (
          <div>
            {/* Average Rating Card */}
            {avgRating !== null && (
              <div className="card bg-white dark:bg-dark-900 border border-gold-500/30 mb-6 inline-flex items-center gap-5 p-5 shadow-sm dark:shadow-glow-card">
                <div>
                  <p className="text-gold-700 dark:text-gold-400 text-[10px] font-semibold uppercase tracking-widest mb-1">Average Guest Rating</p>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-4xl text-amber-600 dark:text-yellow-400 font-bold">{avgRating}</span>
                    <span className="text-stone-400 dark:text-gray-500 text-xs">/ 5.0</span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-gray-500 mt-1">Based on {feedbacks.length} guest reviews</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-500 dark:text-yellow-400">
                  <Star className="w-6 h-6 fill-current" />
                </div>
              </div>
            )}

            {/* Feedbacks Table */}
            <div className="card overflow-x-auto p-0 border border-stone-200 dark:border-dark-700/80 bg-white dark:bg-dark-900/90 shadow-sm dark:shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FDFBF7] dark:bg-dark-950 border-b border-stone-200 dark:border-dark-700 text-stone-600 dark:text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Customer</th>
                    <th className="px-4 py-3 font-semibold">Reservation</th>
                    <th className="px-4 py-3 font-semibold">Rating</th>
                    <th className="px-4 py-3 font-semibold">Comment</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-dark-800">
                  {feedbacks.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-12 text-stone-500 dark:text-gray-500">No feedback submitted yet.</td></tr>
                  ) : feedbacks.map(f => (
                    <tr key={f.id} className="hover:bg-[#F6F4EE] dark:hover:bg-dark-800/50 transition-colors">
                      <td className="px-4 py-3.5 text-stone-900 dark:text-white font-medium">{f.customerName}</td>
                      <td className="px-4 py-3.5 font-mono text-gold-700 dark:text-gold-400 font-bold">#{f.reservationId}</td>
                      <td className="px-4 py-3.5"><Stars rating={f.rating} /></td>
                      <td className="px-4 py-3.5 text-stone-700 dark:text-gray-300 max-w-md">{f.comment || '—'}</td>
                      <td className="px-4 py-3.5 text-stone-500 dark:text-gray-500 font-mono text-[11px]">{new Date(f.submittedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div>
            {/* Inquiry Status Filters */}
            <div className="flex gap-2 mb-6 flex-wrap items-center">
              <span className="text-xs text-stone-500 dark:text-gray-400 font-semibold uppercase tracking-wider mr-1 inline-flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Filter:
              </span>
              {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                    filter === f
                      ? 'bg-gold-500 text-dark-950 shadow-glow-gold'
                      : 'bg-white dark:bg-dark-900 text-stone-700 dark:text-gray-400 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-dark-700 shadow-sm'
                  }`}
                >
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Inquiry Cards */}
            <div className="space-y-4">
              {filteredInquiries.length === 0 ? (
                <div className="text-center py-16 card bg-white dark:bg-dark-900/60 border border-stone-200 dark:border-dark-800">
                  <MessageSquare className="w-8 h-8 text-stone-300 dark:text-stone-700 mx-auto mb-2" />
                  <p className="text-stone-500 dark:text-gray-500 text-sm">No inquiries match the current filter.</p>
                </div>
              ) : filteredInquiries.map(i => (
                <div key={i.id} className="card bg-white dark:bg-dark-900 border border-stone-200 dark:border-dark-700/80 shadow-sm dark:shadow-none p-5">
                  <div className="flex flex-col sm:flex-row items-start justify-between mb-3 gap-2">
                    <div>
                      <p className="text-stone-900 dark:text-white font-medium flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400" />
                        {i.customerName}
                      </p>
                      <p className="text-xs text-stone-500 dark:text-gray-500 font-mono mt-0.5">{new Date(i.submittedAt).toLocaleString()}</p>
                    </div>
                    <StatusBadge status={i.status} />
                  </div>
                  <p className="text-stone-700 dark:text-gray-300 text-sm mb-3 leading-relaxed bg-[#FDFDFB] dark:bg-dark-950/60 p-3.5 rounded-lg border border-stone-100 dark:border-dark-800">
                    {i.message}
                  </p>

                  {i.adminResponse && (
                    <div className="bg-gold-50/50 dark:bg-dark-950 rounded-lg p-4 mb-3 border border-gold-200/50 dark:border-gold-900/40">
                      <p className="text-xs text-gold-700 dark:text-gold-400 font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400" />
                        Concierge Response
                      </p>
                      <p className="text-stone-700 dark:text-gray-300 text-sm leading-relaxed">{i.adminResponse}</p>
                    </div>
                  )}

                  {i.status !== 'RESOLVED' && i.status !== 'CLOSED' && (
                    <AnimatePresence>
                      {respondId === i.id ? (
                        <motion.div
                          variants={fadeUp}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          className="space-y-3 pt-2"
                        >
                          <textarea 
                            className="input-field text-xs" 
                            rows={3} 
                            placeholder="Type your official response to the customer..." 
                            value={responseText} 
                            onChange={e => setResponseText(e.target.value)} 
                            autoFocus 
                          />
                          <div className="flex gap-3">
                            <button 
                              onClick={() => submitResponse(i.id)} 
                              disabled={submitting || !responseText.trim()}
                              className="btn-primary text-xs py-2.5 px-5 shadow-glow-gold inline-flex items-center gap-1.5 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                              <Send className="w-3.5 h-3.5" />
                              {submitting ? 'Sending...' : 'Send Response'}
                            </button>
                            <button 
                              onClick={() => { setRespondId(null); setResponseText(''); }} 
                              className="btn-outline text-xs py-2.5 px-5"
                            >
                              Cancel
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        <button 
                          onClick={() => { setRespondId(i.id); setResponseText(''); }} 
                          className="text-xs text-gold-700 dark:text-gold-400 hover:text-gold-800 dark:hover:text-gold-300 transition-colors font-medium inline-flex items-center gap-1 mt-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Respond to inquiry
                        </button>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
