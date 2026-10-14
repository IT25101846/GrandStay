import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  MessageSquare, 
  Send, 
  Edit3, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle,
  Building2,
  Calendar
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { tabContent, TRANSITION_EASE_LUXURY } from '../../utils/motion';

export default function FeedbackPage() {
  const toast = useToast();
  const [tab, setTab] = useState('feedback'); // 'feedback' | 'inquiry'
  const [completedReservations, setCompletedReservations] = useState([]);
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [myInquiries, setMyInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Forms
  const [feedbackForm, setFeedbackForm] = useState({ reservationId: '', rating: 5, comment: '' });
  const [editingFeedbackId, setEditingFeedbackId] = useState(null); // id if in edit mode
  const [inquiryForm, setInquiryForm] = useState({ message: '' });

  // Alerts
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const loadData = async (preserveAlerts = false) => {
    setLoading(true);
    try {
      const [resRes, fbRes, inqRes] = await Promise.all([
        api.get('/reservations/my'),
        api.get('/feedbacks/my'),
        api.get('/inquiries/my'),
      ]);
      const completed = (resRes.data || []).filter(r => r.status === 'COMPLETED');
      setCompletedReservations(completed);
      setMyFeedbacks(fbRes.data || []);
      setMyInquiries(inqRes.data || []);

      if (completed.length > 0 && !feedbackForm.reservationId) {
        setFeedbackForm(prev => ({ ...prev, reservationId: completed[0].id }));
      }
    } catch (err) {
      if (!preserveAlerts) {
        setError(err.response?.data?.error || err.response?.data?.message || 'Failed to load feedback records.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // 14-day edit eligibility check
  const isWithin14Days = (dateStr) => {
    if (!dateStr) return false;
    const diffDays = (new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24);
    return diffDays <= 14;
  };

  // Submit or Update Feedback
  const submitFeedback = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      if (editingFeedbackId) {
        await api.put(`/feedbacks/${editingFeedbackId}`, {
          reservationId: Number(feedbackForm.reservationId),
          rating: Number(feedbackForm.rating),
          comment: feedbackForm.comment,
        });
        const msg = 'Review updated successfully.';
        setSuccess(msg);
        toast.success(msg, 'Review Updated');
        setEditingFeedbackId(null);
      } else {
        await api.post('/feedbacks', {
          reservationId: Number(feedbackForm.reservationId),
          rating: Number(feedbackForm.rating),
          comment: feedbackForm.comment,
        });
        const msg = 'Thank you! Your event review has been recorded.';
        setSuccess(msg);
        toast.success(msg, 'Feedback Submitted');
      }
      setFeedbackForm({ reservationId: completedReservations[0]?.id || '', rating: 5, comment: '' });
      await loadData(true);
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to submit feedback.';
      setError(errMsg);
      toast.error(errMsg, 'Submission Failed');
    }
  };

  // Start editing a review
  const handleStartEdit = (fb) => {
    setEditingFeedbackId(fb.id);
    setFeedbackForm({ reservationId: fb.reservationId, rating: fb.rating, comment: fb.comment || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingFeedbackId(null);
    setFeedbackForm({ reservationId: completedReservations[0]?.id || '', rating: 5, comment: '' });
  };

  // Submit Inquiry
  const submitInquiry = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await api.post('/inquiries', { message: inquiryForm.message });
      const msg = 'Your inquiry has been submitted to the concierge team.';
      setSuccess(msg);
      toast.success(msg, 'Inquiry Sent');
      setInquiryForm({ message: '' });
      loadData();
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to submit inquiry.';
      setError(errMsg);
      toast.error(errMsg, 'Inquiry Failed');
    }
  };

  // Star selector component with Lucide icons
  const StarSelector = ({ value, onChange }) => (
    <div className="flex items-center gap-2">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`p-1 transition-transform hover:scale-125 focus:outline-none ${
              star <= value ? 'text-amber-500 dark:text-gold-400' : 'text-stone-300 dark:text-gray-700'
            }`}
          >
            <Star className={`w-6 h-6 ${star <= value ? 'fill-current' : ''}`} />
          </button>
        ))}
      </div>
      <span className="text-xs text-amber-800 dark:text-gold-400 self-center ml-2 font-mono font-medium">
        {value === 5 ? '5 - Exceptional' : value === 4 ? '4 - Very Good' : value === 3 ? '3 - Satisfactory' : value === 2 ? '2 - Needs Improvement' : '1 - Unsatisfactory'}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFB] dark:bg-dark text-stone-900 dark:text-slate-100 selection:bg-amber-600 dark:selection:bg-gold-500 selection:text-white dark:selection:text-dark-950 pb-20 transition-colors">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="mb-8">
          <span className="badge-gold mb-2 inline-flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-gold-400" />
            <span>Guest Relations</span>
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-stone-900 dark:text-white font-normal tracking-tight">
            Feedback & Inquiries
          </h1>
          <p className="text-xs text-stone-600 dark:text-gray-400 mt-1 leading-relaxed">
            Review completed events, request modifications within 14 days, or submit special inquiries to our concierge team.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 mb-8 bg-stone-100 dark:bg-dark-900/60 p-1 rounded-full border border-stone-200 dark:border-dark-800 max-w-sm">
          <button
            type="button"
            onClick={() => { setTab('feedback'); setError(''); setSuccess(''); }}
            className={`flex-1 py-2 px-4 rounded-full text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              tab === 'feedback'
                ? 'bg-amber-600 dark:bg-gold-500 text-white dark:text-dark-950 shadow-sm dark:shadow-glow-gold'
                : 'text-stone-600 dark:text-gray-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Reviews ({myFeedbacks.length})</span>
          </button>
          <button
            type="button"
            onClick={() => { setTab('inquiry'); setError(''); setSuccess(''); }}
            className={`flex-1 py-2 px-4 rounded-full text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              tab === 'inquiry'
                ? 'bg-amber-600 dark:bg-gold-500 text-white dark:text-dark-950 shadow-sm dark:shadow-glow-gold'
                : 'text-stone-600 dark:text-gray-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Inquiries ({myInquiries.length})</span>
          </button>
        </div>

        {/* Alerts */}
        {success && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs px-4 py-3 rounded-xl mb-6 flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}
        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-red-300 text-xs px-4 py-3 rounded-xl mb-6 flex items-center gap-2 shadow-sm">
            <span>⚠️ {error}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {tab === 'feedback' ? (
            <motion.div
              key="tab-feedback"
              variants={tabContent}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-8"
            >
              {/* Feedback Form Card */}
              <div className="card shadow-xl p-6 sm:p-8">
                <div className="flex items-center justify-between mb-4 border-b border-stone-200 dark:border-dark-800 pb-3">
                  <h3 className="font-serif text-xl sm:text-2xl text-stone-900 dark:text-white">
                    {editingFeedbackId ? 'Edit Event Review' : 'Submit Event Feedback'}
                  </h3>
                  {editingFeedbackId && (
                    <span className="text-[10px] uppercase font-semibold text-amber-800 dark:text-gold-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 px-2.5 py-1 rounded-full">
                      14-Day Revision Active
                    </span>
                  )}
                </div>

                {completedReservations.length === 0 && !editingFeedbackId ? (
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 p-4 rounded-xl text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                    <p className="font-semibold mb-1">🏛️ Post-Event Reviews Only</p>
                    <p>Formal feedback can only be recorded for reservations that have reached <strong>COMPLETED</strong> status. Completed events will automatically appear in this dropdown.</p>
                  </div>
                ) : (
                  <form onSubmit={submitFeedback} className="space-y-5">
                    {!editingFeedbackId && (
                      <div>
                        <label className="block text-xs font-semibold text-amber-800 dark:text-gold-400 uppercase tracking-wider mb-1">
                          Completed Reservation
                        </label>
                        <select
                          className="input-field cursor-pointer text-xs"
                          value={feedbackForm.reservationId}
                          onChange={(e) => setFeedbackForm({ ...feedbackForm, reservationId: e.target.value })}
                          required
                        >
                          {completedReservations.map(r => (
                            <option key={r.id} value={r.id}>
                              Booking #{r.id} · {r.venueName} · {new Date(r.eventDate).toLocaleDateString()}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-amber-800 dark:text-gold-400 uppercase tracking-wider mb-2">
                        Event Satisfaction Rating
                      </label>
                      <StarSelector
                        value={feedbackForm.rating}
                        onChange={(val) => setFeedbackForm({ ...feedbackForm, rating: val })}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-amber-800 dark:text-gold-400 uppercase tracking-wider mb-1">
                        Detailed Commentary & Impressions
                      </label>
                      <textarea
                        rows={4}
                        className="input-field text-xs resize-none"
                        placeholder="Describe your dining, concierge service, staging, and banquet atmosphere..."
                        value={feedbackForm.comment}
                        onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                        required
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button type="submit" className="btn-primary text-xs py-3 px-6 flex items-center gap-1.5">
                        <Send className="w-3.5 h-3.5" />
                        <span>{editingFeedbackId ? 'Save Changes' : 'Submit Review'}</span>
                      </button>
                      {editingFeedbackId && (
                        <button type="button" onClick={handleCancelEdit} className="btn-outline text-xs px-5 py-3">
                          Cancel Edit
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>

              {/* Past Reviews List */}
              <div className="space-y-4">
                <h3 className="font-serif text-xl text-stone-900 dark:text-white border-b border-stone-200 dark:border-dark-800 pb-2">
                  My Past Event Reviews
                </h3>
                {myFeedbacks.length === 0 ? (
                  <p className="text-xs text-stone-500 dark:text-gray-500 italic">You have not submitted any event reviews yet.</p>
                ) : (
                  myFeedbacks.map(fb => (
                    <div key={fb.id} className="card p-5 space-y-3 border-stone-200 dark:border-dark-800 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex gap-1 text-amber-500 dark:text-gold-400 mb-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < fb.rating ? 'fill-current' : 'text-stone-300 dark:text-gray-700'}`} />
                            ))}
                          </div>
                          <span className="text-xs text-stone-500 dark:text-gray-400 font-mono">
                            Reservation #{fb.reservationId} · Submitted on {new Date(fb.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                        {isWithin14Days(fb.submittedAt) ? (
                          <button
                            onClick={() => handleStartEdit(fb)}
                            className="btn-glass text-[11px] py-1 px-3 rounded-full flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit Review</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-stone-400 dark:text-gray-600 italic">Review Locked (&gt;14 days)</span>
                        )}
                      </div>
                      <p className="text-xs text-stone-700 dark:text-gray-300 leading-relaxed italic">
                        "{fb.comment}"
                      </p>
                      {fb.conciergeReply && (
                        <div className="bg-[#F6F4EE] dark:bg-dark-950 p-3 rounded-lg border-l-4 border-amber-600 dark:border-gold-500 text-xs space-y-1">
                          <span className="font-semibold text-amber-800 dark:text-gold-400 text-[10px] uppercase block">
                            GrandStay Concierge Response:
                          </span>
                          <p className="text-stone-600 dark:text-gray-400">{fb.conciergeReply}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="tab-inquiry"
              variants={tabContent}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-8"
            >
              {/* Inquiry Form Card */}
              <div className="card shadow-xl p-6 sm:p-8">
                <h3 className="font-serif text-xl sm:text-2xl text-stone-900 dark:text-white mb-2">
                  Submit a Concierge Inquiry
                </h3>
                <p className="text-xs text-stone-600 dark:text-gray-400 mb-6 leading-relaxed">
                  Have questions regarding date rescheduling, custom culinary menus, or decor specifications? Send a direct inquiry to our staff.
                </p>

                <form onSubmit={submitInquiry} className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-amber-800 dark:text-gold-400 uppercase tracking-wider">
                        Inquiry Message
                      </label>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {inquiryForm.message.length} / 1000
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      maxLength={1000}
                      className="input-field text-xs resize-none"
                      placeholder="Please specify your reservation reference (if applicable) and your inquiry details..."
                      value={inquiryForm.message}
                      onChange={(e) => setInquiryForm({ message: e.target.value })}
                      required
                    />
                  </div>

                  <button type="submit" className="btn-primary text-xs py-3 px-6 flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message to Concierge</span>
                  </button>
                </form>
              </div>

              {/* Past Inquiries List */}
              <div className="space-y-4">
                <h3 className="font-serif text-xl text-stone-900 dark:text-white border-b border-stone-200 dark:border-dark-800 pb-2">
                  My Inquiries & Replies
                </h3>
                {myInquiries.length === 0 ? (
                  <p className="text-xs text-stone-500 dark:text-gray-500 italic">No inquiries recorded yet.</p>
                ) : (
                  myInquiries.map(inq => (
                    <div key={inq.id} className="card p-5 space-y-3 border-stone-200 dark:border-dark-800 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-stone-500 dark:text-gray-400 font-mono">
                          Submitted on {new Date(inq.createdAt).toLocaleDateString()}
                        </span>
                        <StatusBadge status={inq.status} />
                      </div>
                      <p className="text-xs text-stone-700 dark:text-gray-300 leading-relaxed">
                        {inq.message}
                      </p>
                      {inq.adminResponse && (
                        <div className="bg-[#F6F4EE] dark:bg-dark-950 p-3.5 rounded-lg border-l-4 border-amber-600 dark:border-gold-500 text-xs space-y-1">
                          <span className="font-semibold text-amber-800 dark:text-gold-400 text-[10px] uppercase block">
                            Staff Response:
                          </span>
                          <p className="text-stone-600 dark:text-gray-400 leading-relaxed">{inq.adminResponse}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
