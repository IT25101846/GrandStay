import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Sparkles, 
  Calendar as CalendarIcon, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Clock, 
  CreditCard, 
  Tag, 
  ShieldCheck, 
  AlertCircle, 
  Check,
  ChevronRight,
  Printer,
  Sliders,
  Plus,
  Music,
  Utensils,
  Lightbulb,
  Palette
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import api from '../../services/api';
import DatePicker from '../../components/DatePicker';
import { useToast } from '../../context/ToastContext';
import { 
  fadeIn, 
  fadeUp, 
  wizardSlide, 
  TRANSITION_EASE_LUXURY 
} from '../../utils/motion';
import { parseVenueData } from '../../utils/venueImageHelper';

export default function BookingPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const queryVenueId = searchParams.get('venueId');
  const queryPackageId = searchParams.get('packageId');

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [venues, setVenues] = useState([]);
  const [packages, setPackages] = useState([]);
  const [addons, setAddons] = useState([]);
  const [selectedAddonIds, setSelectedAddonIds] = useState([]);
  const [addonCategoryFilter, setAddonCategoryFilter] = useState('ALL');
  const [venueFilter, setVenueFilter] = useState('compatible'); // 'compatible' | 'all'
  const [packageFilter, setPackageFilter] = useState('ALL'); // 'ALL' | 'BIRTHDAY' | 'WEDDING' | 'CORPORATE' | 'GALA'
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  // Form State
  const [form, setForm] = useState({
    venueId: '',
    packageId: '',
    eventDate: '',
    guestCount: 150,
    specialRequests: ''
  });

  // Promo Code Validation State
  const [promoCode, setPromoCode] = useState('');
  const [promoResult, setPromoResult] = useState(null);
  const [validatingPromo, setValidatingPromo] = useState(false);

  // Date availability state
  const [unavailableDates, setUnavailableDates] = useState([]);  // "yyyy-MM-dd" strings
  const [loadingDates, setLoadingDates] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');  // "yyyy-MM-dd"
  const [selectedTime, setSelectedTime] = useState('18:00');  // "HH:mm"

  const venuePhotos = [
    '/images/1THqxCvzczAoxUo3stl2WHdh2J8.jpg',
    '/images/7XSFnDdyalIKrmybn08imC7wVM.jpg',
    '/images/vWlGGLjrgzzuaKI8l7MaYdycBjw.jpg',
    '/images/DAQgxCoS0XtGtOP1VssAJEcrMmg.jpg'
  ];

  const goToStep = (newStep) => {
    setDirection(newStep > step ? 1 : -1);
    setStep(newStep);
  };

  // Helper to test if a venue can host a given package
  const isVenueCompatible = (venue, packageId) => {
    if (!venue || !packageId) return false;
    const pkg = packages.find(p => Number(p.id) === Number(packageId));
    if (!pkg) return false;
    if (!pkg.linkedVenues || pkg.linkedVenues.length === 0) return true;
    return pkg.linkedVenues.some(v => Number(v.id) === Number(venue.id));
  };

  // Helper to test if a package can be booked for a given venue
  const isPackageCompatible = (pkg, venueId) => {
    if (!pkg || !venueId) return false;
    if (!pkg.linkedVenues || pkg.linkedVenues.length === 0) return true;
    return pkg.linkedVenues.some(v => Number(v.id) === Number(venueId));
  };

  useEffect(() => {
    Promise.all([
      api.get('/venues/available'),
      api.get('/packages'),
      api.get('/addons')
    ]).then(([vRes, pRes, aRes]) => {
      const vData = vRes.data || [];
      const pData = pRes.data || [];
      const aData = aRes.data || [];
      setVenues(vData);
      setPackages(pData);
      setAddons(aData);

      // Determine initial package
      let initialPackageId = '';
      if (queryPackageId && pData.some(p => String(p.id) === String(queryPackageId))) {
        initialPackageId = Number(queryPackageId);
      } else if (queryVenueId) {
        // If coming with a venueId, select the first compatible package
        const venueCompatible = pData.filter(pkg =>
          !pkg.linkedVenues || pkg.linkedVenues.length === 0 ||
          pkg.linkedVenues.some(v => Number(v.id) === Number(queryVenueId))
        );
        initialPackageId = venueCompatible.length > 0 ? venueCompatible[0].id : (pData[0]?.id || '');
      } else if (pData.length > 0) {
        initialPackageId = pData[0].id;
      }

      // Determine initial venue compatible with initialPackageId
      const compatibleVenues = vData.filter(v => {
        const pkg = pData.find(p => Number(p.id) === Number(initialPackageId));
        if (!pkg || !pkg.linkedVenues || pkg.linkedVenues.length === 0) return true;
        return pkg.linkedVenues.some(lv => Number(lv.id) === Number(v.id));
      });

      let initialVenueId = '';
      if (queryVenueId && vData.some(v => String(v.id) === String(queryVenueId))) {
        initialVenueId = Number(queryVenueId);
      } else if (compatibleVenues.length > 0) {
        initialVenueId = compatibleVenues[0].id;
      } else if (vData.length > 0) {
        initialVenueId = vData[0].id;
      }

      setForm(prev => ({
        ...prev,
        packageId: initialPackageId,
        venueId: initialVenueId
      }));
    }).catch(err => {
      console.error('Failed to load reservation data:', err);
      const detail = err.response?.data?.message || err.response?.data?.error || err.message || 'Unknown network error';
      const status = err.response?.status ? `[HTTP ${err.response.status}] ` : '';
      setError(`Could not load reservation data from backend: ${status}${detail}`);
    }).finally(() => setLoading(false));
  }, [queryVenueId, queryPackageId]);

  // When venueId changes, fetch unavailable dates
  useEffect(() => {
    if (!form.venueId) return;
    setLoadingDates(true);
    setUnavailableDates([]);
    setSelectedDate('');
    api.get(`/reservations/unavailable-dates?venueId=${form.venueId}`)
      .then(res => setUnavailableDates(res.data || []))
      .catch(() => setUnavailableDates([]))
      .finally(() => setLoadingDates(false));
  }, [form.venueId]);

  // When packageId changes, ensure selected venue remains compatible
  useEffect(() => {
    if (!form.packageId || packages.length === 0 || venues.length === 0) return;
    const compatible = venues.filter(v => isVenueCompatible(v, form.packageId));
    const isCurrentVenueValid = compatible.some(v => Number(v.id) === Number(form.venueId));
    if (!isCurrentVenueValid && compatible.length > 0) {
      setForm(prev => ({
        ...prev,
        venueId: compatible[0].id
      }));
    }
  }, [form.packageId, packages, venues]);

  const eventDateTime = selectedDate && selectedTime
    ? `${selectedDate}T${selectedTime}`
    : '';

  const todayDateStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();
  const maxDateStr = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  const toggleAddon = (addonId) => {
    setSelectedAddonIds(prev => 
      prev.includes(addonId) 
        ? prev.filter(id => id !== addonId) 
        : [...prev, addonId]
    );
  };

  const selectedVenue = venues.find(v => Number(v.id) === Number(form.venueId));
  const selectedPackage = packages.find(p => Number(p.id) === Number(form.packageId));
  const selectedAddonsList = addons.filter(a => selectedAddonIds.includes(a.id));
  const addonsTotal = selectedAddonsList.reduce((sum, a) => sum + (Number(a.price) || 0), 0);

  const compatibleVenues = venues.filter(v => isVenueCompatible(v, form.packageId));
  const displayedVenues = venueFilter === 'compatible' ? compatibleVenues : venues;

  // Dynamic cost calculation
  const venueBase = selectedVenue ? selectedVenue.basePrice : 0;
  const packageBase = selectedPackage ? selectedPackage.basePrice : 0;
  const subtotal = venueBase + packageBase + addonsTotal;
  const discountAmount = promoResult && promoResult.valid ? promoResult.discountApplied : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleValidatePromo = async (e) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    setValidatingPromo(true);
    setPromoResult(null);
    try {
      const res = await api.post('/promotions/validate', {
        code: promoCode.trim().toUpperCase(),
        originalAmount: subtotal
      });
      setPromoResult(res.data);
      if (res.data.valid) {
        toast.success(`Promotion applied: -LKR ${res.data.discountApplied?.toLocaleString()}`, 'Promo Applied');
      } else {
        toast.error(res.data.message || 'Invalid promotion code', 'Validation Failed');
      }
    } catch (err) {
      setPromoResult({ valid: false, message: 'Could not validate promotion code.' });
      toast.error('Could not validate promotion code.', 'Validation Error');
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.packageId) {
      setError('Please select an event package.');
      goToStep(1);
      return;
    }
    if (!form.venueId || !isVenueCompatible(selectedVenue, form.packageId)) {
      setError(`The selected venue (${selectedVenue?.name || 'None'}) is not available for ${selectedPackage?.name || 'this package'}. Please select a compatible venue.`);
      goToStep(2);
      return;
    }
    if (!selectedDate) {
      setError('Please select an event date.');
      goToStep(3);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        venueId: Number(form.venueId),
        packageId: Number(form.packageId),
        eventDate: eventDateTime,
        guestCount: Number(form.guestCount),
        selectedAddonIds: selectedAddonIds,
        specialRequest: form.specialRequests || ''
      };
      const res = await api.post('/reservations', payload);
      setSuccess(res.data);
      toast.success(`Booking reference #${res.data.id} has been submitted for officer review.`, 'Reservation Created');
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error || err.response?.data?.message;

      if (status === 409) {
        setSelectedDate('');
        if (form.venueId) {
          api.get(`/reservations/unavailable-dates?venueId=${form.venueId}`)
            .then(res => setUnavailableDates(res.data || []))
            .catch(() => {});
        }
        goToStep(3);
        setError(msg || 'The selected date is no longer available. Please select another date.');
        toast.error('The selected date was booked by someone else. Please choose another date.', 'Conflict');
      } else {
        setError(msg || 'Booking submission failed. Please verify dates and availability.');
        toast.error(msg || 'Submission failed. Please verify dates and try again.', 'Error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFB] dark:bg-dark text-stone-900 dark:text-slate-100 selection:bg-amber-600 dark:selection:bg-gold-500 selection:text-white dark:selection:text-dark-950 pb-20 transition-colors">
      <Navbar />

      {/* Header Banner */}
      <div data-theme-preserve="dark" className="hero-dark-banner relative py-16 px-6 text-center border-b border-stone-200 dark:border-white/5 overflow-hidden">
        <motion.div 
          initial={{ scale: 1 }}
          animate={{ scale: 1.06 }}
          transition={{ duration: 18, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          className="absolute inset-0 bg-cover bg-center opacity-30" 
          style={{ backgroundImage: `url('/images/7XSFnDdyalIKrmybn08imC7wVM.jpg')` }} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/95 via-dark/85 to-dark/60" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="badge-gold mb-3 inline-flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-gold-400" />
            <span>Concierge Reservation</span>
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white font-normal mb-3 tracking-tight">
            Reserve Your Special Event
          </h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Complete your reservation in 5 seamless steps with custom event enhancements.
          </p>

          {/* Stepper with Animated Progress */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-5 mt-8 max-w-2xl mx-auto px-4">
            {[
              { num: 1, label: 'Package', icon: Sparkles },
              { num: 2, label: 'Space', icon: Building2 },
              { num: 3, label: 'Schedule', icon: CalendarIcon },
              { num: 4, label: 'Enhance', icon: Sliders },
              { num: 5, label: 'Confirm', icon: ShieldCheck },
            ].map((s, idx) => {
              const Icon = s.icon;
              const isCurrent = step === s.num;
              const isDone = step > s.num;

              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => goToStep(s.num)}
                  className={`flex items-center gap-1.5 sm:gap-2 text-xs font-semibold uppercase tracking-wider transition-all select-none focus:outline-none ${
                    isCurrent
                      ? 'text-gold-300 font-bold'
                      : isDone
                      ? 'text-emerald-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono transition-all duration-300 ${
                    isCurrent
                      ? 'bg-amber-600 dark:bg-gold-500 text-white dark:text-dark-950 font-bold shadow-glow-gold scale-110'
                      : isDone
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      : 'bg-white/10 text-gray-300 border border-white/20'
                  }`}>
                    {isDone ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : s.num}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-10">
        
        {/* Redesigned Luxury Reservation Submitted Pop-up Modal */}
        <Modal
          open={!!success}
          onClose={() => navigate('/my-reservations')}
          maxWidth="max-w-2xl"
        >
          {success && (
            <div className="space-y-6 pt-2">
              {/* Golden Seal & Header */}
              <div className="text-center relative">
                <div className="relative inline-flex items-center justify-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-stone-950 flex items-center justify-center shadow-xl shadow-amber-500/20 ring-4 ring-amber-400/30">
                    <Check className="w-10 h-10 stroke-[3] text-stone-950" />
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="badge-gold inline-flex items-center gap-1.5 px-3 py-1">
                    <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                    <span>Reservation Request Lodged</span>
                  </span>
                  <StatusBadge status={success.status || 'PENDING'} />
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl font-medium text-stone-900 dark:text-white tracking-tight">
                  Booking #{success.id} Created
                </h2>
                <p className="text-xs text-stone-600 dark:text-gray-300 max-w-md mx-auto mt-1 leading-relaxed">
                  Your reservation request has been officially recorded and queued for priority review by our Concierge & Event Management Office.
                </p>
              </div>

              {/* Reservation Blueprint Voucher */}
              <div className="bg-[#FDFDFB] dark:bg-dark-900/90 border border-stone-200 dark:border-dark-800 rounded-2xl p-5 sm:p-6 shadow-inner relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-200 dark:border-dark-800">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-amber-800 dark:text-gold-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Event Blueprint & Logistics Summary</span>
                  </span>
                  <span className="font-mono text-[11px] text-stone-500 dark:text-gray-400 font-semibold">
                    REF: #RES-{success.id}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex items-start gap-3 bg-white dark:bg-dark-950/70 p-3.5 rounded-xl border border-stone-100 dark:border-dark-800/80">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-700 dark:text-gold-400 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-gray-500 tracking-wider block">Package</span>
                      <span className="text-xs font-semibold text-stone-900 dark:text-white block">
                        {success.packageName || selectedPackage?.name || 'Selected Package'}
                      </span>
                      {selectedPackage?.price && (
                        <span className="text-[10px] text-amber-800 dark:text-gold-400 font-mono">
                          Base LKR {Number(selectedPackage.price).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white dark:bg-dark-950/70 p-3.5 rounded-xl border border-stone-100 dark:border-dark-800/80">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-gray-500 tracking-wider block">Reserved Venue</span>
                      <span className="text-xs font-semibold text-stone-900 dark:text-white block">
                        {success.venueName || selectedVenue?.name || 'Selected Space'}
                      </span>
                      <span className="text-[10px] text-stone-500 dark:text-gray-400">
                        {selectedVenue?.location || 'GrandStay Hotel'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white dark:bg-dark-950/70 p-3.5 rounded-xl border border-stone-100 dark:border-dark-800/80">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <CalendarIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-gray-500 tracking-wider block">Event Date</span>
                      <span className="text-xs font-semibold text-stone-900 dark:text-white block">
                        {new Date(success.eventDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="text-[10px] text-stone-500 dark:text-gray-400">
                        {selectedTime ? `Scheduled at ${selectedTime}` : 'Full Day Reservation'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white dark:bg-dark-950/70 p-3.5 rounded-xl border border-stone-100 dark:border-dark-800/80">
                    <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-400 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-gray-500 tracking-wider block">Guest Attendance</span>
                      <span className="text-xs font-semibold text-stone-900 dark:text-white block">
                        {success.guestCount || form.guestCount} Attendees
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        Capacity Verified
                      </span>
                    </div>
                  </div>

                  {selectedAddonsList.length > 0 && (
                    <div className="sm:col-span-2 bg-white dark:bg-dark-950/70 p-3.5 rounded-xl border border-stone-100 dark:border-dark-800/80">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-gray-500 tracking-wider flex items-center gap-1.5">
                          <Sliders className="w-3 h-3 text-amber-600 dark:text-gold-400" />
                          <span>Custom Event Enhancements ({selectedAddonsList.length})</span>
                        </span>
                        <span className="text-xs font-mono font-semibold text-amber-800 dark:text-gold-400">
                          + LKR {addonsTotal.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedAddonsList.map(a => (
                          <span key={a.id} className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-900 dark:text-gold-300 border border-amber-500/25 font-medium">
                            {a.name}
                          </span>
                        ))}
                      </div>
                      {form.specialRequests && (
                        <p className="text-[10px] text-stone-500 dark:text-gray-400 italic mt-2 border-t border-stone-100 dark:border-dark-800/60 pt-1.5">
                          Special Note: "{form.specialRequests}"
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 3-Stage Next Steps Roadmap */}
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 sm:p-5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-gold-400 mb-3 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Next Steps Roadmap</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                  <div className="bg-white dark:bg-dark-950 p-3 rounded-xl border border-amber-500/30 dark:border-gold-500/30">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center">1</span>
                      <span className="text-xs font-semibold text-stone-900 dark:text-white">Officer Review</span>
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-gray-400 leading-tight">
                      Concierge staff confirms logistics and reviews custom requests.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-dark-950 p-3 rounded-xl border border-stone-200 dark:border-dark-800">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-stone-200 dark:bg-dark-800 text-stone-700 dark:text-gray-300 font-bold text-[10px] flex items-center justify-center">2</span>
                      <span className="text-xs font-semibold text-stone-900 dark:text-white">Quotation Issuance</span>
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-gray-400 leading-tight">
                      An itemized quotation will be issued directly to your portal.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-dark-950 p-3 rounded-xl border border-stone-200 dark:border-dark-800">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-stone-200 dark:bg-dark-800 text-stone-700 dark:text-gray-300 font-bold text-[10px] flex items-center justify-center">3</span>
                      <span className="text-xs font-semibold text-stone-900 dark:text-white">Zero-Friction Advance</span>
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-gray-400 leading-tight">
                      Settle 30% advance via 1-click Direct Bank Transfer to confirm.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-outline w-full sm:w-auto text-xs px-5 py-3 flex items-center justify-center gap-2"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Blueprint</span>
                </button>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSuccess(null);
                      goToStep(1);
                    }}
                    className="btn-outline text-xs px-4 py-3 flex-1 sm:flex-initial"
                  >
                    Book Another
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/my-reservations')}
                    className="btn-primary text-xs px-6 py-3 flex-1 sm:flex-initial flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
                  >
                    <span>Go to My Reservations</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Success Screen Placeholder Behind Modal */}
        {success && (
          <div className="card border border-emerald-500/40 p-8 sm:p-12 text-center max-w-2xl mx-auto my-12 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-500/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
            </div>
            <span className="badge-gold mb-2 inline-flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-gold-400" />
              <span>Reservation Submitted</span>
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 dark:text-white mb-2">Booking #{success.id} Created!</h2>
            <p className="text-xs text-stone-500 dark:text-gray-400 max-w-md mx-auto mb-6">
              Your reservation has been recorded. Review your details in the pop-up or open your reservations dashboard.
            </p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => navigate('/my-reservations')}
                className="btn-primary text-xs px-6 py-3 flex items-center gap-2"
              >
                <span>Go to My Reservations</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="bg-rose-50 dark:bg-red-950/60 border border-rose-300 dark:border-red-800 text-rose-800 dark:text-red-300 text-sm px-6 py-4 rounded-xl mb-8 max-w-2xl mx-auto text-center shadow-sm flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!success && !loading && (
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait" custom={direction}>
              
              {/* STEP 1: Choose Event Package */}
              {step === 1 && (
                <motion.div 
                  key="step-1"
                  custom={direction}
                  variants={wizardSlide}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <h2 className="font-serif text-3xl text-stone-900 dark:text-white">Step 1: Choose Your Event Package</h2>
                    <p className="text-stone-500 dark:text-gray-400 text-xs mt-1">Select the catering, styling, and coordination provisions tailored to your occasion.</p>
                  </div>

                  {/* Package Category Filter Tabs */}
                  <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
                    {[
                      { id: 'ALL', label: 'All Packages' },
                      { id: 'BIRTHDAY', label: '🎂 Birthdays' },
                      { id: 'WEDDING', label: '💍 Weddings' },
                      { id: 'CORPORATE', label: '🏢 Corporate' },
                      { id: 'GALA', label: '✨ Galas' },
                    ].map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setPackageFilter(cat.id)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                          packageFilter === cat.id
                            ? 'bg-amber-600 dark:bg-gold-500 text-white dark:text-dark-950 shadow-md font-bold'
                            : 'bg-white/80 dark:bg-dark-900/80 text-stone-600 dark:text-gray-400 hover:text-amber-800 dark:hover:text-gold-300 border border-stone-200 dark:border-dark-800'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {packages
                      .filter(pkg => {
                        if (packageFilter === 'ALL') return true;
                        const name = (pkg.name || '').toLowerCase();
                        if (packageFilter === 'BIRTHDAY') return name.includes('birthday');
                        if (packageFilter === 'WEDDING') return name.includes('wedding');
                        if (packageFilter === 'CORPORATE') return name.includes('corporate') || name.includes('summit') || name.includes('executive');
                        if (packageFilter === 'GALA') return name.includes('gala') || name.includes('soirée') || name.includes('soiree') || name.includes('heritage');
                        return true;
                      })
                      .map((pkg) => {
                        const isSelected = Number(form.packageId) === Number(pkg.id);
                        const isBirthday = pkg.name?.toLowerCase().includes('birthday');

                        return (
                          <div
                            key={pkg.id}
                            onClick={() => {
                              const compatibleVenues = venues.filter(v => isVenueCompatible(v, pkg.id));
                              setForm(prev => {
                                const isCurrentVenueStillCompatible = compatibleVenues.some(v => Number(v.id) === Number(prev.venueId));
                                return {
                                  ...prev,
                                  packageId: pkg.id,
                                  venueId: isCurrentVenueStillCompatible ? prev.venueId : (compatibleVenues[0]?.id || '')
                                };
                              });
                              setError('');
                            }}
                            className={`card transition-all duration-500 flex flex-col justify-between group cursor-pointer ${
                              isSelected
                                ? 'border-amber-600 dark:border-gold-500 shadow-xl dark:shadow-glow-gold ring-2 ring-amber-600/30 dark:ring-gold-500/40 -translate-y-1'
                                : 'border-[#E7DEC8]/80 dark:border-white/10 hover:border-amber-600/40 dark:hover:border-gold-500/40 hover:-translate-y-1.5 hover:shadow-xl'
                            }`}
                          >
                            <div>
                              <div className="flex justify-between items-start mb-2 gap-2">
                                <h3 className="font-serif text-xl text-stone-900 dark:text-white">
                                  {pkg.name}
                                </h3>
                                {isSelected && (
                                  <span className="bg-amber-600 dark:bg-gold-500 text-white dark:text-dark-950 font-bold text-xs px-2.5 py-0.5 rounded-full shrink-0 flex items-center gap-1 shadow-sm">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                    <span>Selected</span>
                                  </span>
                                )}
                              </div>

                              {isBirthday && (
                                <div className="mb-2.5">
                                  <span className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                    <Sparkles className="w-2.5 h-2.5" />
                                    <span>Milestone Birthday</span>
                                  </span>
                                </div>
                              )}

                            <p className="text-xs text-stone-600 dark:text-gray-400 mb-4 leading-relaxed min-h-[36px]">
                              {pkg.description}
                            </p>

                            {/* Linked Venues Chips */}
                            <div className="mb-4">
                              <span className="text-[10px] text-stone-400 dark:text-gray-500 uppercase tracking-widest block mb-1 font-semibold">
                                Compatible Spaces
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {pkg.linkedVenues && pkg.linkedVenues.length > 0 ? (
                                  pkg.linkedVenues.map((lv) => (
                                    <span
                                      key={lv.id}
                                      className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-gold-500/10 text-amber-800 dark:text-gold-300 border border-amber-200 dark:border-gold-500/30 font-medium"
                                    >
                                      {lv.name}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                                    All GrandStay Venues
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="py-3 border-t border-stone-100 dark:border-dark-800 mb-4">
                              <span className="text-[10px] text-stone-400 dark:text-gray-500 uppercase tracking-widest block font-medium">Package Base</span>
                              <span className="font-serif text-2xl font-bold text-amber-800 dark:text-gold-400">
                                LKR {pkg.basePrice?.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-stone-100 dark:border-dark-800 text-center">
                            <span className={`text-xs font-semibold ${
                              isSelected
                                ? 'text-amber-700 dark:text-gold-400'
                                : 'text-stone-400 dark:text-gray-500 group-hover:text-stone-700 dark:group-hover:text-gray-300'
                            }`}>
                              {isSelected ? '● Selected Package' : 'Click to Select'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end pt-6">
                    <button
                      type="button"
                      onClick={() => {
                        if (!form.packageId) {
                          setError('Please select an event package to continue.');
                          toast.error('Please select an event package to continue.', 'Selection Required');
                          return;
                        }
                        setError('');
                        goToStep(2);
                      }}
                      className="btn-primary text-sm px-8 py-3.5 flex items-center gap-2"
                    >
                      <span>Continue to Venues</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Choose Venue */}
              {step === 2 && (
                <motion.div 
                  key="step-2"
                  custom={direction}
                  variants={wizardSlide}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <h2 className="font-serif text-3xl text-stone-900 dark:text-white">Step 2: Select Your Preferred Venue</h2>
                    <p className="text-stone-500 dark:text-gray-400 text-xs mt-1">
                      Choose the ballroom or outdoor space tailored for your selected package:{' '}
                      <span className="text-amber-700 dark:text-gold-400 font-semibold">{selectedPackage?.name || 'Selected Package'}</span>.
                    </p>
                  </div>

                  {/* Compatibility Filter Tabs */}
                  <div className="flex flex-wrap justify-center items-center gap-3 mb-6">
                    <button
                      type="button"
                      onClick={() => setVenueFilter('compatible')}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                        venueFilter === 'compatible'
                          ? 'bg-amber-600 dark:bg-gold-500 text-white dark:text-dark-950 font-bold shadow-md dark:shadow-glow-gold'
                          : 'bg-white dark:bg-dark-900 text-stone-600 dark:text-gray-400 border border-stone-200 dark:border-dark-800 hover:text-stone-900 dark:hover:text-white'
                      }`}
                    >
                      ✓ Compatible with {selectedPackage?.name || 'Package'} ({compatibleVenues.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setVenueFilter('all')}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                        venueFilter === 'all'
                          ? 'bg-amber-600 dark:bg-gold-500 text-white dark:text-dark-950 font-bold shadow-md dark:shadow-glow-gold'
                          : 'bg-white dark:bg-dark-900 text-stone-600 dark:text-gray-400 border border-stone-200 dark:border-dark-800 hover:text-stone-900 dark:hover:text-white'
                      }`}
                    >
                      All Venues ({venues.length})
                    </button>
                  </div>

                  {displayedVenues.length === 0 ? (
                    <div className="card text-center py-12 border-dashed border-stone-200 dark:border-dark-800">
                      <p className="text-stone-600 dark:text-gray-300 font-medium text-sm">No venues are currently compatible with this package.</p>
                      <p className="text-xs text-stone-400 dark:text-gray-500 mt-1">
                        Please return to Step 1 to choose another event package.
                      </p>
                      <button
                        type="button"
                        onClick={() => goToStep(1)}
                        className="btn-outline text-xs mt-4"
                      >
                        &larr; Choose Different Package
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {displayedVenues.map((v, i) => {
                        const isCompatible = isVenueCompatible(v, form.packageId);
                        const isSelected = Number(form.venueId) === Number(v.id);

                        return (
                          <div
                            key={v.id}
                            onClick={() => {
                              if (!isCompatible) {
                                setError(`"${v.name}" is not compatible with "${selectedPackage?.name}". Please choose a compatible venue or modify your package in Step 1.`);
                                toast.error(`"${v.name}" is not compatible with "${selectedPackage?.name}".`, 'Incompatible Venue');
                                return;
                              }
                              setError('');
                              setForm(prev => ({
                                ...prev,
                                venueId: v.id
                              }));
                            }}
                            className={`card p-0 overflow-hidden transition-all duration-500 flex flex-col justify-between group ${
                              !isCompatible
                                ? 'opacity-40 bg-stone-100/40 dark:bg-dark-950/40 border-stone-200/50 dark:border-dark-800/50 cursor-not-allowed'
                                : isSelected
                                  ? 'border-amber-600 dark:border-gold-500 shadow-xl dark:shadow-glow-gold ring-2 ring-amber-600/30 dark:ring-gold-500/40 cursor-pointer -translate-y-1'
                                  : 'border-[#E7DEC8]/80 dark:border-white/10 hover:border-amber-600/40 dark:hover:border-gold-500/40 hover:-translate-y-1.5 hover:shadow-2xl cursor-pointer'
                            }`}
                          >
                            <div className="relative h-48 overflow-hidden">
                              <img 
                                src={parseVenueData(v, i).imageUrl} 
                                alt={v.name} 
                                className={`w-full h-full object-cover transition-transform duration-700 ${isCompatible ? 'group-hover:scale-105' : 'grayscale'}`} 
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                                {isSelected && isCompatible && (
                                  <span className="bg-amber-600 dark:bg-gold-500 text-white dark:text-dark-950 font-bold text-xs px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                    <span>Selected</span>
                                  </span>
                                )}
                                {!isCompatible && (
                                  <span className="bg-rose-600/90 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow">
                                    Incompatible
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="p-6">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className={`font-serif text-xl ${!isCompatible ? 'text-gray-400' : 'text-stone-900 dark:text-white'}`}>{v.name}</h3>
                                <span className={`text-xs font-mono font-bold ${!isCompatible ? 'text-gray-400' : 'text-amber-700 dark:text-gold-400'}`}>LKR {v.basePrice?.toLocaleString()}</span>
                              </div>
                              <p className="text-xs text-stone-600 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                                {parseVenueData(v, i).cleanDescription}
                              </p>
                              <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-dark-800">
                                <p className="text-[11px] text-stone-500 dark:text-gray-400 font-mono flex items-center gap-1.5">
                                  <Users className="w-3.5 h-3.5 text-amber-700 dark:text-gold-400" />
                                  <span>Up to {v.capacity} Guests</span>
                                </p>
                                <span className={`text-[11px] font-semibold ${
                                  !isCompatible
                                    ? 'text-rose-500 dark:text-rose-400'
                                    : isSelected
                                      ? 'text-amber-700 dark:text-gold-400 font-bold'
                                      : 'text-stone-400 dark:text-gray-500'
                                }`}>
                                  {!isCompatible ? 'Not suitable for package' : isSelected ? '● Selected Space' : 'Click to select'}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex justify-between pt-6">
                    <button 
                      type="button" 
                      onClick={() => goToStep(1)} 
                      className="btn-outline text-sm flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Packages</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!form.venueId) {
                          setError('Please select a venue to continue.');
                          toast.error('Please select a venue to continue.', 'Selection Required');
                          return;
                        }
                        if (!isVenueCompatible(selectedVenue, form.packageId)) {
                          setError(`The venue "${selectedVenue?.name}" is not compatible with ${selectedPackage?.name}. Please select a compatible venue.`);
                          toast.error('Please choose a venue compatible with your package.', 'Incompatible Venue');
                          return;
                        }
                        setError('');
                        goToStep(3);
                      }}
                      disabled={!form.venueId || !isVenueCompatible(selectedVenue, form.packageId)}
                      className="btn-primary text-sm px-8 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <span>Continue to Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Date, Guests & Details */}
              {step === 3 && (
                <motion.div 
                  key="step-3"
                  custom={direction}
                  variants={wizardSlide}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="max-w-2xl mx-auto space-y-6"
                >
                  <div className="text-center mb-8">
                    <h2 className="font-serif text-3xl text-stone-900 dark:text-white">Step 3: Event Timing & Guest Count</h2>
                    <p className="text-stone-500 dark:text-gray-400 text-xs mt-1">Specify your desired event date and expected attendees.</p>
                  </div>

                  <div className="card space-y-6 shadow-xl">

                    {/* Event Date */}
                    <div>
                      <label className="block text-xs font-semibold text-amber-800 dark:text-gold-400 uppercase tracking-wider mb-2">
                        Event Date
                      </label>

                      {loadingDates ? (
                        <div className="flex items-center gap-2 text-stone-500 dark:text-gray-400 text-xs py-8 justify-center">
                          <div className="w-5 h-5 border-2 border-amber-600 dark:border-gold-500 border-t-transparent rounded-full animate-spin shrink-0" />
                          <span>Checking real-time calendar availability…</span>
                        </div>
                      ) : (
                        <DatePicker
                          value={selectedDate}
                          onChange={(dateStr) => { setSelectedDate(dateStr); setError(''); }}
                          unavailableDates={unavailableDates}
                          minDate={todayDateStr}
                          maxDate={maxDateStr}
                        />
                      )}

                      <p className="text-[11px] text-stone-400 dark:text-gray-500 mt-2">
                        Red dates are already booked. Select an available date within 12 months.
                      </p>
                    </div>

                    {/* Event Time */}
                    <div>
                      <label className="block text-xs font-semibold text-amber-800 dark:text-gold-400 uppercase tracking-wider mb-2">
                        Event Start Time
                      </label>
                      <div className="relative">
                        <input
                          type="time"
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          className="input-field cursor-pointer font-mono"
                          required
                        />
                      </div>
                      <p className="text-[11px] text-stone-400 dark:text-gray-500 mt-1">
                        Select the starting time for your event. Confirmation is subject to officer review.
                      </p>
                    </div>

                    {/* Guest Count */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-semibold text-amber-800 dark:text-gold-400 uppercase tracking-wider">
                          Expected Guests
                        </label>
                        <span className="font-serif text-xl font-bold text-stone-900 dark:text-white tabular-nums">{form.guestCount} Guests</span>
                      </div>
                      <input
                        type="number"
                        min="1"
                        max={selectedVenue?.capacity || 1000}
                        value={form.guestCount}
                        onChange={(e) => setForm({ ...form, guestCount: e.target.value })}
                        className="input-field font-mono"
                        required
                      />
                      {selectedVenue && (
                        <p className="text-[11px] text-gray-500 mt-1">
                          Maximum capacity for {selectedVenue.name}: {selectedVenue.capacity} guests.
                        </p>
                      )}
                    </div>
                  </div>

                    <div className="flex justify-between pt-4">
                    <button 
                      type="button" 
                      onClick={() => goToStep(2)} 
                      className="btn-outline text-sm flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Venues</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!selectedDate) {
                          setError('Please select an event date.');
                          toast.error('Please select an event date.', 'Date Required');
                          return;
                        }
                        if (!selectedTime) {
                          setError('Please select an event start time.');
                          toast.error('Please select an event start time.', 'Time Required');
                          return;
                        }
                        const eventTime = new Date(eventDateTime).getTime();
                        if (eventTime <= Date.now()) {
                          setError('Event date must be in the future.');
                          toast.error('Event date must be in the future.', 'Invalid Date');
                          return;
                        }
                        if (eventTime > Date.now() + 366 * 86400000) {
                          setError('Event date cannot be more than 12 months in advance.');
                          return;
                        }
                        if (selectedVenue && Number(form.guestCount) > selectedVenue.capacity) {
                          setError(`Guest count exceeds venue capacity (${selectedVenue.capacity} max).`);
                          toast.error(`Guest count exceeds venue capacity (${selectedVenue.capacity} max).`, 'Exceeds Capacity');
                          return;
                        }
                        setError('');
                        goToStep(4);
                      }}
                      className="btn-primary text-sm px-8 py-3.5 flex items-center gap-2"
                    >
                      <span>Continue to Add-ons</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: Event Customizations & Add-ons */}
              {step === 4 && (
                <motion.div 
                  key="step-4"
                  custom={direction}
                  variants={wizardSlide}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <h2 className="font-serif text-3xl text-stone-900 dark:text-white">Step 4: Enhance Your Event</h2>
                    <p className="text-stone-500 dark:text-gray-400 text-xs mt-1">Select optional ambient lighting, audio setups, floral decor, or culinary stations tailored to your occasion.</p>
                  </div>

                  {/* Addon Category Filter Tabs */}
                  <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
                    {[
                      { id: 'ALL', label: 'All Enhancements' },
                      { id: 'LIGHTING', label: '💡 Lighting & Ambiance' },
                      { id: 'AUDIO_TECH', label: '🔊 Audio & Tech' },
                      { id: 'DECOR', label: '🎨 Decor & Florals' },
                      { id: 'CATERING', label: '🍽️ Culinary Stations' },
                    ].map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setAddonCategoryFilter(cat.id)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                          addonCategoryFilter === cat.id
                            ? 'bg-amber-600 dark:bg-gold-500 text-white dark:text-dark-950 shadow-md font-bold'
                            : 'bg-white/80 dark:bg-dark-900/80 text-stone-600 dark:text-gray-400 hover:text-amber-800 dark:hover:text-gold-300 border border-stone-200 dark:border-dark-800'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Add-ons Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {addons
                      .filter(addon => addonCategoryFilter === 'ALL' || addon.category === addonCategoryFilter)
                      .map(addon => {
                        const isSelected = selectedAddonIds.includes(addon.id);

                        const getCategoryBadge = (cat) => {
                          switch (cat) {
                            case 'LIGHTING':
                              return { icon: Lightbulb, label: 'Lighting', cls: 'bg-amber-500/10 text-amber-800 dark:text-gold-300 border-amber-500/25' };
                            case 'AUDIO_TECH':
                              return { icon: Music, label: 'Audio & Tech', cls: 'bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 border-indigo-500/25' };
                            case 'DECOR':
                              return { icon: Palette, label: 'Decor & Florals', cls: 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-500/25' };
                            case 'CATERING':
                              return { icon: Utensils, label: 'Culinary Station', cls: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/25' };
                            default:
                              return { icon: Sparkles, label: 'Enhancement', cls: 'bg-stone-500/10 text-stone-800 dark:text-stone-300 border-stone-500/25' };
                          }
                        };
                        const catMeta = getCategoryBadge(addon.category);
                        const CatIcon = catMeta.icon;

                        return (
                          <div
                            key={addon.id}
                            onClick={() => toggleAddon(addon.id)}
                            className={`card transition-all duration-300 flex flex-col justify-between group cursor-pointer relative ${
                              isSelected
                                ? 'border-amber-600 dark:border-gold-500 shadow-xl dark:shadow-glow-gold ring-2 ring-amber-600/30 dark:ring-gold-500/40 -translate-y-1 bg-amber-500/[0.03] dark:bg-gold-500/[0.04]'
                                : 'border-[#E7DEC8]/80 dark:border-white/10 hover:border-amber-600/40 dark:hover:border-gold-500/40 hover:-translate-y-1 hover:shadow-xl'
                            }`}
                          >
                            <div>
                              <div className="flex justify-between items-start mb-3 gap-2">
                                <span className={`text-[10px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1.5 ${catMeta.cls}`}>
                                  <CatIcon className="w-3 h-3" />
                                  <span>{catMeta.label}</span>
                                </span>

                                {isSelected ? (
                                  <span className="bg-amber-600 dark:bg-gold-500 text-white dark:text-dark-950 font-bold text-xs px-2.5 py-0.5 rounded-full shrink-0 flex items-center gap-1 shadow-sm">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                    <span>Included</span>
                                  </span>
                                ) : (
                                  <span className="text-xs font-semibold text-stone-400 dark:text-gray-500 group-hover:text-amber-700 dark:group-hover:text-gold-300 flex items-center gap-1 transition-colors">
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Add</span>
                                  </span>
                                )}
                              </div>

                              <h3 className="font-serif text-lg text-stone-900 dark:text-white group-hover:text-amber-800 dark:group-hover:text-gold-400 transition-colors mb-1.5">
                                {addon.name}
                              </h3>
                              <p className="text-xs text-stone-600 dark:text-gray-400 leading-relaxed min-h-[38px]">
                                {addon.description}
                              </p>
                            </div>

                            <div className="pt-3 border-t border-stone-100 dark:border-dark-800 flex items-baseline justify-between mt-4">
                              <div>
                                <span className="text-[10px] text-stone-400 dark:text-gray-500 uppercase tracking-widest block font-medium">Add-on Cost</span>
                                <span className="font-serif text-xl font-bold text-amber-800 dark:text-gold-400 tabular-nums">
                                  + LKR {addon.price?.toLocaleString()}
                                </span>
                              </div>
                              <span className="text-[11px] text-stone-500 dark:text-gray-400 font-medium">
                                {addon.unit}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Special Requests & Custom Inquiries Box */}
                  <div className="card p-6 border-stone-200 dark:border-dark-800 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Sliders className="w-4 h-4 text-amber-700 dark:text-gold-400" />
                      <h3 className="font-serif text-lg text-stone-900 dark:text-white">Special Requests & Custom Inquiries (Optional)</h3>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-gray-400 mb-3 leading-relaxed">
                      Need custom lighting color wash, tailored staging configurations, cake dietary specifications, or bespoke floral tones? Describe your requests here for our Concierge and Event Officers to incorporate into your review.
                    </p>
                    <textarea
                      rows={3}
                      value={form.specialRequests}
                      onChange={(e) => setForm({ ...form, specialRequests: e.target.value })}
                      placeholder="e.g. Please provide warm amber fairy lighting, arrange cake table near the entrance, and accommodate 10 vegetarian guests..."
                      className="input-field text-xs resize-y"
                    />
                  </div>

                  {/* Live Price Ticker Banner */}
                  <div className="bg-amber-500/10 dark:bg-gold-500/10 border border-amber-500/25 dark:border-gold-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-600/15 dark:bg-gold-500/20 text-amber-700 dark:text-gold-400 flex items-center justify-center shrink-0">
                        <Sliders className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-stone-900 dark:text-white block">
                          {selectedAddonIds.length === 0
                            ? 'No optional add-ons selected'
                            : `${selectedAddonIds.length} event enhancement${selectedAddonIds.length === 1 ? '' : 's'} selected`}
                        </span>
                        <span className="text-[11px] text-stone-500 dark:text-gray-400">
                          Add-ons Subtotal: <strong className="text-amber-800 dark:text-gold-400 font-mono font-bold">+ LKR {addonsTotal.toLocaleString()}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="text-right sm:text-right w-full sm:w-auto">
                      <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-gray-500 tracking-wider block">Live Running Total</span>
                      <span className="font-serif text-2xl font-bold text-stone-900 dark:text-white tabular-nums">
                        LKR {subtotal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Step 4 Navigation */}
                  <div className="flex justify-between pt-4">
                    <button 
                      type="button" 
                      onClick={() => goToStep(3)} 
                      className="btn-outline text-sm flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Schedule</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => goToStep(5)}
                      className="btn-primary text-sm px-8 py-3.5 flex items-center gap-2"
                    >
                      <span>Review & Reserve</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 5: Review, Promo Code & Submit */}
              {step === 5 && (
                <motion.div 
                  key="step-5"
                  custom={direction}
                  variants={wizardSlide}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="max-w-3xl mx-auto space-y-8"
                >
                  <div className="text-center mb-8">
                    <h2 className="font-serif text-3xl text-stone-900 dark:text-white">Step 5: Review & Reserve</h2>
                    <p className="text-stone-500 dark:text-gray-400 text-xs mt-1">Confirm your booking details, chosen enhancements, and apply promotional codes.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    
                    {/* Left: Summary */}
                    <div className="md:col-span-7 card space-y-4 shadow-xl">
                      <h3 className="font-serif text-xl text-stone-900 dark:text-white border-b border-stone-200 dark:border-dark-800 pb-3 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-amber-700 dark:text-gold-400" />
                        <span>Reservation Details</span>
                      </h3>
                      
                      <div className="space-y-3 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-stone-500 dark:text-gray-400 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-gold-400" />
                            <span>Package:</span>
                          </span>
                          <span className="text-stone-900 dark:text-white font-medium">{selectedPackage?.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-stone-500 dark:text-gray-400 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-amber-700 dark:text-gold-400" />
                            <span>Venue:</span>
                          </span>
                          <div className="text-right">
                            <span className="text-stone-900 dark:text-white font-medium block">{selectedVenue?.name}</span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans font-medium">
                              ✓ Compatible with {selectedPackage?.name}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-stone-500 dark:text-gray-400 flex items-center gap-1.5">
                            <CalendarIcon className="w-3.5 h-3.5 text-amber-700 dark:text-gold-400" />
                            <span>Event Date:</span>
                          </span>
                          <span className="text-amber-700 dark:text-gold-400 font-mono font-medium">{eventDateTime ? new Date(eventDateTime).toLocaleString() : 'Not Set'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-stone-500 dark:text-gray-400 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-amber-700 dark:text-gold-400" />
                            <span>Guest Count:</span>
                          </span>
                          <span className="text-stone-900 dark:text-white font-mono font-medium">{form.guestCount} Attendees</span>
                        </div>

                        {/* Selected Enhancements */}
                        <div className="pt-3 border-t border-stone-200 dark:border-dark-800">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-stone-500 dark:text-gray-400 flex items-center gap-1.5">
                              <Sliders className="w-3.5 h-3.5 text-amber-700 dark:text-gold-400" />
                              <span>Enhancements:</span>
                            </span>
                            <span className="text-amber-800 dark:text-gold-400 font-mono font-semibold">
                              {selectedAddonsList.length > 0 ? `+ LKR ${addonsTotal.toLocaleString()}` : 'Base Only'}
                            </span>
                          </div>
                          {selectedAddonsList.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {selectedAddonsList.map(a => (
                                <span
                                  key={a.id}
                                  className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-gold-500/10 text-amber-900 dark:text-gold-300 border border-amber-200 dark:border-gold-500/25 font-medium flex items-center gap-1"
                                >
                                  <Check className="w-3 h-3 text-amber-600 dark:text-gold-400 stroke-[2.5]" />
                                  <span>{a.name}</span>
                                  <span className="text-[10px] text-stone-400 dark:text-gray-400 font-mono">
                                    (LKR {a.price?.toLocaleString()})
                                  </span>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-stone-400 dark:text-gray-500 italic">
                              Standard package provision without optional add-ons.
                            </p>
                          )}
                          {form.specialRequests && (
                            <div className="mt-3 p-3 rounded-xl bg-amber-500/5 dark:bg-dark-950/60 border border-amber-500/20 text-[11px] text-stone-600 dark:text-gray-300">
                              <span className="font-semibold text-amber-800 dark:text-gold-400 block mb-0.5">Special Customization Note:</span>
                              <span className="italic">"{form.specialRequests}"</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Interactive Promo Code Form */}
                      <div className="pt-4 border-t border-stone-200 dark:border-dark-800">
                        <label className="block text-[11px] uppercase tracking-wider text-stone-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-amber-700 dark:text-gold-400" />
                          <span>Have a Promotional Code?</span>
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. LUXURY2026"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            className="input-field text-xs uppercase font-mono"
                          />
                          <button
                            type="button"
                            onClick={handleValidatePromo}
                            disabled={validatingPromo || !promoCode.trim()}
                            className="btn-outline text-xs px-4 whitespace-nowrap disabled:opacity-50"
                          >
                            {validatingPromo ? 'Checking...' : 'Apply Code'}
                          </button>
                        </div>

                        {promoResult && (
                          <div className={`mt-3 p-3 rounded-xl text-xs ${
                            promoResult.valid ? 'bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300'
                          }`}>
                            {promoResult.message}
                            {promoResult.valid && (
                              <div className="font-semibold mt-1 font-mono">
                                Discount: - LKR {promoResult.discountApplied?.toLocaleString()}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Cost Breakdown & Submit Button */}
                    <div className="card md:col-span-5 p-6 sm:p-8 flex flex-col justify-between border-amber-600/30 dark:border-gold-500/35 relative overflow-hidden shadow-2xl">
                      <div>
                        <span className="text-xs text-amber-700 dark:text-gold-400 font-semibold uppercase tracking-wider block mb-4">Estimated Total</span>
                        
                        <div className="space-y-2 text-xs text-stone-500 dark:text-gray-400 border-b border-stone-200 dark:border-dark-800 pb-4 mb-4">
                          <div className="flex justify-between">
                            <span>Package Provision</span>
                            <span className="font-mono text-stone-900 dark:text-white">LKR {packageBase.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Venue Hire</span>
                            <span className="font-mono text-stone-900 dark:text-white">LKR {venueBase.toLocaleString()}</span>
                          </div>
                          {addonsTotal > 0 && (
                            <div className="flex justify-between text-amber-800 dark:text-gold-400 font-medium">
                              <span>Event Add-ons ({selectedAddonsList.length})</span>
                              <span className="font-mono">+ LKR {addonsTotal.toLocaleString()}</span>
                            </div>
                          )}
                          {discountAmount > 0 && (
                            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                              <span>Promo Discount</span>
                              <span className="font-mono">- LKR {discountAmount.toLocaleString()}</span>
                            </div>
                          )}
                        </div>

                        <div>
                          <p className="text-[10px] text-stone-400 dark:text-gray-500 uppercase tracking-widest font-semibold">Payable Estimate</p>
                          <p className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white mt-1 tabular-nums">
                            LKR {finalTotal.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-stone-400 dark:text-gray-400 mt-1 italic leading-relaxed">
                            *A 30% initial deposit will be required after officer quotation confirmation.
                          </p>
                        </div>
                      </div>

                      <div className="mt-8 space-y-3">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="btn-primary w-full text-sm py-3.5 shadow-glow-gold disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <span>{submitting ? 'Submitting Reservation...' : 'Confirm & Reserve Space'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => goToStep(4)}
                          className="btn-outline w-full text-xs py-2.5 flex items-center justify-center gap-1.5"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Modify Enhancements</span>
                        </button>
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </form>
        )}

      </div>
    </div>
  );
}
