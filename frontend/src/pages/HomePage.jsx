import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  Calculator, 
  Users, 
  Calendar, 
  Star, 
  Plus, 
  Check, 
  Building2, 
  Send,
  Award,
  ShieldCheck,
  Clock,
  ChevronRight,
  Eye,
  Play,
  Pause
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { 
  getLiveMetrics, 
  updateLiveMetrics, 
  syncFromAnalytics, 
  subscribeToMetrics 
} from '../utils/metricsService';
import { parseVenueData } from '../utils/venueImageHelper';
import { 
  fadeIn, 
  fadeUp, 
  staggerContainer, 
  heroStagger, 
  buttonInteraction,
  TRANSITION_EASE_LUXURY 
} from '../utils/motion';
import MouseSpotlight from '../components/MouseSpotlight';
import MagneticButton from '../components/MagneticButton';
import CountUpNumber from '../components/CountUpNumber';
import VenueSpecificationModal from '../components/VenueSpecificationModal';

export default function HomePage() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  
  // Data states
  const [venues, setVenues] = useState([]);
  const [packages, setPackages] = useState([]);
  const [metrics, setMetrics] = useState(getLiveMetrics);
  const [loading, setLoading] = useState(true);

  // Interactive Estimator state
  const [eventType, setEventType] = useState('wedding');
  const [guestCount, setGuestCount] = useState(250);
  const [selectedVenueId, setSelectedVenueId] = useState(null);
  const [selectedPackageCategory, setSelectedPackageCategory] = useState('ALL');

  // Interactive Quick View Modal
  const [quickViewVenue, setQuickViewVenue] = useState(null);

  // Interactive FAQ state
  const [openFaq, setOpenFaq] = useState(null);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Background Video Atmosphere state
  const videoRef = useRef(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);

  const toggleVideoPlayback = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  // Map venue IDs to template photos
  const venueImages = [
    '/images/otheu92Jc5IozZNuTf3fCy7Vuw.jpg',
    '/images/vWlGGLjrgzzuaKI8l7MaYdycBjw.jpg',
    '/images/7XSFnDdyalIKrmybn08imC7wVM.jpg',
    '/images/1THqxCvzczAoxUo3stl2WHdh2J8.jpg',
    '/images/DAQgxCoS0XtGtOP1VssAJEcrMmg.jpg',
    '/images/clZkgAuVCvp7qzePBQr7fuFgc.jpg'
  ];

  useEffect(() => {
    const unsubscribe = subscribeToMetrics((newMetrics) => {
      setMetrics(prev => ({ ...prev, ...newMetrics }));
    });

    Promise.all([
      api.get('/venues').catch(() => api.get('/venues/available')).catch(() => ({ data: [] })),
      api.get('/packages').catch(() => ({ data: [] })),
      api.get('/analytics/summary').catch(() => ({ data: null }))
    ]).then(([venueRes, pkgRes, summaryRes]) => {
      const fetchedVenues = venueRes.data || [];
      const fetchedPackages = pkgRes.data || [];
      setVenues(fetchedVenues);
      setPackages(fetchedPackages);
      if (fetchedVenues.length > 0) {
        setSelectedVenueId(fetchedVenues[0].id);
      }

      const totalCap = fetchedVenues.reduce((sum, v) => sum + (v.capacity || 0), 0);
      const partial = {
        venueCount: fetchedVenues.length,
        packageCount: fetchedPackages.length,
        guestCapacity: totalCap
      };

      if (summaryRes?.data) {
        syncFromAnalytics(summaryRes.data);
      } else {
        updateLiveMetrics(partial);
      }
      setMetrics(getLiveMetrics());
    }).finally(() => setLoading(false));

    return () => unsubscribe();
  }, []);

  // Calculate live estimate
  const currentVenue = venues.find(v => v.id === Number(selectedVenueId)) || venues[0];
  const venueBase = currentVenue ? currentVenue.basePrice : 150000;
  const matchedPackage = packages.find(p => {
    const n = (p.name || '').toLowerCase();
    if (eventType === 'wedding') return n.includes('wedding');
    if (eventType === 'birthday') return n.includes('birthday');
    if (eventType === 'corporate') return n.includes('corporate') || n.includes('summit') || n.includes('executive');
    if (eventType === 'gala') return n.includes('gala') || n.includes('soirée') || n.includes('soiree');
    return false;
  }) || packages[0];
  const packageBase = matchedPackage ? matchedPackage.basePrice : (packages.length > 0 ? packages[0].basePrice : 120000);
  const perGuestCost = 
    eventType === 'wedding' ? 3500 : 
    eventType === 'gala' ? 2800 : 
    eventType === 'birthday' ? 2200 : 
    eventType === 'corporate' ? 2500 : 2000;
  const estimatedTotal = venueBase + packageBase + (guestCount * perGuestCost);

  const getPackageHighlights = (pkg) => {
    const name = (pkg.name || '').toLowerCase();
    if (name.includes('birthday')) {
      return [
        'Signature Celebratory Buffet & Mocktail Bar',
        'Custom Multi-Tier Birthday Cake & Presentation',
        'Live DJ Soundscape & Dance Floor Mood Lighting',
        'Themed Balloon Styling & Commemorative Photo Backdrop'
      ];
    }
    if (name.includes('wedding')) {
      return [
        '5-Star Gourmet Multi-Course Banquet Feast',
        'Dedicated Head Butler & Event Concierge',
        'Full Atmospheric Mood Lighting & Audio Production',
        'Complimentary Bridal Suite & Champagne Toast'
      ];
    }
    if (name.includes('corporate') || name.includes('summit') || name.includes('executive')) {
      return [
        'Executive Business Luncheon & Barista Coffee Station',
        'Full HD Projection & Hybrid Audio-Visual Tech Suite',
        'Dedicated Event Concierge & Private Breakout Lounge',
        'High-Speed Delegate Wi-Fi & Executive Stationery Kits'
      ];
    }
    return [
      'Gourmet Multi-Course Catering & Signature Canapés',
      'Dedicated Head Butler & Event Concierge',
      'Full Atmospheric Mood Lighting & Live Acoustics Setup',
      'Exclusive VIP Lounge Access & Red Carpet Welcome'
    ];
  };

  const filteredPackages = packages.filter(pkg => {
    if (selectedPackageCategory === 'ALL') return true;
    const name = (pkg.name || '').toLowerCase();
    if (selectedPackageCategory === 'BIRTHDAY') return name.includes('birthday');
    if (selectedPackageCategory === 'WEDDING') return name.includes('wedding');
    if (selectedPackageCategory === 'CORPORATE') return name.includes('corporate') || name.includes('summit') || name.includes('executive');
    if (selectedPackageCategory === 'GALA') return name.includes('gala') || name.includes('soirée') || name.includes('soiree') || name.includes('heritage');
    return true;
  });

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
      toast.success("Thank you for joining our Privé Registry. Exclusive banquet releases will be sent to your email.", "Subscription Confirmed");
    }
  };

  const faqs = [
    {
      q: "How far in advance should I reserve a venue?",
      a: "For weddings, milestone birthdays, and high-season galas (November - April), we recommend reserving 6 to 12 months in advance. Corporate conferences can typically be accommodated within 1 to 3 months notice."
    },
    {
      q: "What are the payment milestones and deposit requirements?",
      a: "A 30% initial deposit is required upon reservation approval to lock in your date. The remaining balance can be settled in installments, with the final payment due 14 days prior to your event."
    },
    {
      q: "Can we bring our own external decorators or caterers?",
      a: "While our in-house culinary and floral design team is world-class, we warmly welcome certified external decorators upon prior review and coordination with our Event Concierge."
    },
    {
      q: "What is the policy for event date rescheduling or cancellation?",
      a: "Reservations may be rescheduled without penalty up to 60 days before the event date, subject to venue availability. Cancellations are handled transparently per our formal quotation agreement."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFB] dark:bg-dark text-stone-900 dark:text-slate-100 selection:bg-amber-600 dark:selection:bg-gold-500 selection:text-white dark:selection:text-dark-950 transition-colors overflow-x-hidden">
      <Navbar isHero={true} />

      {/* Hero Section with Cinematic Background Video */}
      <section data-theme-preserve="dark" className="hero-dark-banner relative w-full h-screen min-h-[500px] max-h-[100vh] flex flex-col justify-center items-center overflow-hidden px-4 sm:px-6 pt-16 sm:pt-20 pb-3 sm:pb-6 m-0">
        {/* Cinematic Video Background with Poster Fallback */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          poster="/images/otheu92Jc5IozZNuTf3fCy7Vuw.jpg"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        >
          <source src="/videos/wshbtaj.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-dark/95 via-dark/70 to-dark/45 pointer-events-none" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-dark/40 to-dark/80 pointer-events-none" />

        {/* Content with Staggered Entrance */}
        <motion.div 
          variants={heroStagger}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-4xl mx-auto text-center my-auto flex flex-col items-center justify-center py-0.5 sm:py-1"
        >
          {/* Luxury Destination Badge */}
          <motion.div variants={fadeUp(15, 0.5)}>
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-1 rounded-full bg-black/40 hover:bg-black/50 border border-white/20 dark:border-gold-500/40 text-gold-300 text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase mb-2 sm:mb-3 backdrop-blur-xl shadow-lg shadow-black/40 transition-all">
              <Sparkles className="w-3.5 h-3.5 text-gold-400 stroke-[2.2]" />
              <span>Luxury Event & Banquet Destination</span>
            </div>
          </motion.div>

          {/* Editorial Main Headline */}
          <motion.h1 
            variants={fadeUp(20, 0.7)}
            className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-normal leading-[1.12] tracking-tight mb-2 sm:mb-3 drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)] max-w-4xl"
          >
            Where Grand Visions <br className="hidden sm:inline" />
            <span className="font-serif italic font-normal bg-gradient-to-r from-[#FFF5DA] via-[#E5BF62] to-[#F3D78F] bg-clip-text text-transparent drop-shadow-sm">
              Become Unforgettable Reality
            </span>
          </motion.h1>

          {/* Refined Description */}
          <motion.p 
            variants={fadeUp(20, 0.6)}
            className="text-stone-200/90 text-xs sm:text-sm md:text-base font-light leading-relaxed max-w-xl mx-auto mb-3 sm:mb-5 text-balance drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]"
          >
            Host prestigious weddings, milestone birthdays, executive corporate summits, and glamorous galas in our architectural ballrooms and scenic garden pavilions.
          </motion.p>

          {/* Call to Actions with Magnetic Attraction */}
          <motion.div 
            variants={fadeUp(20, 0.6)}
            className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-4 max-w-md mx-auto w-full mb-3 sm:mb-5"
          >
            <MagneticButton className="w-full sm:w-auto">
              <Link 
                to="/venues" 
                className="btn-primary w-full sm:w-auto text-xs sm:text-sm px-6 py-2.5 sm:py-3 rounded-full shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 group transition-all"
              >
                <span className="font-semibold tracking-wide">Explore Our Venues</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </MagneticButton>
            <MagneticButton className="w-full sm:w-auto">
              <a 
                href="#cost-estimator" 
                className="group w-full sm:w-auto text-xs sm:text-sm px-6 py-2.5 sm:py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 hover:border-gold-400/70 text-white font-semibold backdrop-blur-xl flex items-center justify-center gap-2 shadow-xl transition-all duration-300"
              >
                <Calculator className="w-3.5 h-3.5 text-gold-300 transition-colors" />
                <span>Estimate Event Cost</span>
              </a>
            </MagneticButton>
          </motion.div>

          {/* Executive Statistics Frosted Glass Ribbon with Animated Counting */}
          <motion.div 
            variants={fadeUp(20, 0.6)}
            className="w-full max-w-2xl mx-auto rounded-2xl bg-black/40 backdrop-blur-xl border border-white/15 p-3 sm:p-4 shadow-2xl"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 divide-y md:divide-y-0 md:divide-x divide-white/10 text-center">
              <div className="pt-2 md:pt-0">
                <p className="font-serif text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-200 via-gold-300 to-yellow-200 bg-clip-text text-transparent">
                  <CountUpNumber
                    value={metrics.venueCount}
                    suffix="+"
                    duration={1400}
                  />
                </p>
                <p className="text-[9px] sm:text-[10px] text-stone-300/80 uppercase tracking-[0.18em] font-medium mt-0.5">
                  Opulent Venues
                </p>
              </div>
              <div className="pt-2 md:pt-0">
                <p className="font-serif text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-200 via-gold-300 to-yellow-200 bg-clip-text text-transparent">
                  <CountUpNumber
                    value={metrics.eventsCelebrated}
                    suffix="+"
                    duration={1800}
                  />
                </p>
                <p className="text-[9px] sm:text-[10px] text-stone-300/80 uppercase tracking-[0.18em] font-medium mt-0.5">
                  Events Celebrated
                </p>
              </div>
              <div className="pt-2 md:pt-0">
                <p className="font-serif text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-200 via-gold-300 to-yellow-200 bg-clip-text text-transparent">
                  <CountUpNumber
                    value={metrics.clientSatisfaction}
                    decimals={1}
                    suffix="%"
                    duration={1600}
                  />
                </p>
                <p className="text-[9px] sm:text-[10px] text-stone-300/80 uppercase tracking-[0.18em] font-medium mt-0.5">
                  Satisfaction
                </p>
              </div>
              <div className="pt-2 md:pt-0">
                <p className="font-serif text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-200 via-gold-300 to-yellow-200 bg-clip-text text-transparent">
                  <CountUpNumber
                    value={metrics.guestCapacity}
                    formatThousands={true}
                    suffix="+"
                    duration={2000}
                  />
                </p>
                <p className="text-[9px] sm:text-[10px] text-stone-300/80 uppercase tracking-[0.18em] font-medium mt-0.5">
                  Guest Capacity
                </p>
              </div>
            </div>
          </motion.div>

          {/* Ambient Scroll Indicator */}
          <motion.div
            variants={fadeIn(0.8, 0.6)}
            className="hidden lg:flex flex-col items-center gap-1 mt-2 sm:mt-3 text-gold-400/80 cursor-pointer select-none"
            onClick={() => {
              const nextSection = document.querySelector('.hero-dark-banner')?.nextElementSibling;
              nextSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span className="text-[8px] uppercase tracking-[0.25em] font-mono text-stone-300/80">Scroll to Explore</span>
            <div className="w-3.5 h-5 rounded-full border border-gold-400/40 flex items-start justify-center p-0.5 bg-black/30 backdrop-blur-sm">
              <motion.div 
                animate={{ y: [0, 6, 0], opacity: [1, 0.3, 1] }} 
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} 
                className="w-1 h-1 rounded-full bg-gold-400" 
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Ambient Atmosphere Video Toggle */}
        <div className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5 z-20 hidden sm:block">
          <button
            type="button"
            onClick={toggleVideoPlayback}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white/80 hover:text-white text-xs backdrop-blur-md transition-all shadow-lg focus:outline-none"
            title={isVideoPlaying ? "Pause ambient video" : "Play ambient video"}
          >
            {isVideoPlaying ? (
              <Pause className="w-3 h-3 text-gold-400" />
            ) : (
              <Play className="w-3 h-3 text-gold-400 fill-gold-400" />
            )}
            <span className="text-[10px] tracking-widest uppercase font-mono font-medium">
              {isVideoPlaying ? "Atmosphere" : "Paused"}
            </span>
          </button>
        </div>
      </section>

      {/* Interactive Event Cost Estimator Widget */}
      <section id="cost-estimator" className="py-24 px-6 relative bg-gradient-to-b from-[#F5EFE6] via-[#FDFDFB] to-[#F5EFE6] dark:from-dark dark:via-dark-900 dark:to-dark transition-colors">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={fadeUp(30, 0.7)}
          className="max-w-5xl mx-auto"
        >
          <div className="text-center mb-16">
            <span className="badge-gold mb-3">Interactive Planning Tool</span>
            <h2 className="font-serif text-4xl sm:text-5xl text-stone-900 dark:text-white font-normal tracking-tight">
              Instant Event Budget Estimator
            </h2>
            <p className="text-stone-600 dark:text-gray-400 text-sm sm:text-base max-w-xl mx-auto mt-3">
              Customize your event parameters to receive an instant, accurate quotation projection for your special occasion.
            </p>
          </div>

          <MouseSpotlight className="card-glass border border-amber-600/20 dark:border-gold-500/30 p-8 sm:p-10 relative shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 dark:bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Left Column: Interactive Controls */}
              <div className="lg:col-span-7 space-y-8">
                
                {/* Event Type Buttons */}
                <div>
                  <label className="block text-xs font-semibold text-amber-800 dark:text-gold-400 uppercase tracking-wider mb-3">
                    1. Select Event Type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                    {[
                      { id: 'wedding', label: 'Wedding' },
                      { id: 'birthday', label: 'Birthdays' },
                      { id: 'corporate', label: 'Corporate' },
                      { id: 'gala', label: 'Gala Banquet' },
                      { id: 'private', label: 'Private Party' },
                    ].map((type) => (
                      <motion.button
                        key={type.id}
                        type="button"
                        whileHover={{ scale: 1.04, y: -2 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setEventType(type.id)}
                        className={`py-3 px-3 rounded-xl text-xs font-medium border transition-all duration-200 cursor-pointer ${
                          eventType === type.id
                            ? 'bg-amber-600 dark:bg-gold-500 text-white dark:text-dark-950 border-amber-700 dark:border-gold-400 font-semibold shadow-md dark:shadow-glow-gold'
                            : 'bg-white dark:bg-dark-950/60 text-stone-700 dark:text-gray-300 border-stone-200 dark:border-dark-700 hover:border-amber-600/40 dark:hover:border-gold-500/40'
                        }`}
                      >
                        {type.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Venue Selector */}
                <div>
                  <label className="block text-xs font-semibold text-amber-800 dark:text-gold-400 uppercase tracking-wider mb-3">
                    2. Choose Venue Space
                  </label>
                  <select 
                    className="input-field cursor-pointer"
                    value={selectedVenueId || ''}
                    onChange={(e) => setSelectedVenueId(e.target.value)}
                  >
                    {venues.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name} (Capacity: {v.capacity} guests) — Base: LKR {v.basePrice.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Guests Slider with Dynamic Fill */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-semibold text-amber-800 dark:text-gold-400 uppercase tracking-wider">
                      3. Expected Guest Count
                    </label>
                    <motion.span 
                      key={guestCount}
                      initial={{ scale: 0.9, opacity: 0.8 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.15 }}
                      className="font-serif text-2xl font-bold text-stone-900 dark:text-white tabular-nums"
                    >
                      {guestCount} <span className="text-xs font-sans text-stone-500 dark:text-gray-400 font-normal">Guests</span>
                    </motion.span>
                  </div>
                  {(() => {
                    const sliderPercent = Math.round(((guestCount - 50) / 550) * 100);
                    return (
                      <input 
                        type="range" 
                        min="50" 
                        max="600" 
                        step="10"
                        value={guestCount}
                        onChange={(e) => setGuestCount(Number(e.target.value))}
                        style={{
                          background: `linear-gradient(to right, #D4AF37 0%, #B8860B ${sliderPercent}%, rgba(160, 150, 140, 0.25) ${sliderPercent}%, rgba(160, 150, 140, 0.25) 100%)`
                        }}
                        className="w-full h-2.5 rounded-lg appearance-none cursor-pointer"
                      />
                    );
                  })()}
                  <div className="flex justify-between text-[11px] text-stone-500 dark:text-gray-500 mt-2 font-mono">
                    <span>50 Intimate</span>
                    <span>250 Medium</span>
                    <span>600+ Grand</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Calculated Estimate Card */}
              <div className="lg:col-span-5 bg-white/95 dark:bg-dark-950/90 rounded-2xl p-6 sm:p-8 border border-stone-200 dark:border-gold-500/20 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-dark-800">
                    <span className="text-xs uppercase tracking-widest text-stone-500 dark:text-gray-400 font-semibold">Projection Summary</span>
                    <span className="text-xs text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Live Estimate
                    </span>
                  </div>

                  <div className="space-y-3 py-5 text-sm">
                    <div className="flex justify-between text-stone-600 dark:text-gray-400 items-center">
                      <span className="flex items-center gap-1.5 text-xs">
                        <Building2 className="w-3.5 h-3.5 text-amber-700 dark:text-gold-400" />
                        <span>Venue Base ({currentVenue?.name || 'Selected'})</span>
                      </span>
                      <span className="text-stone-900 dark:text-white font-mono font-medium">LKR {venueBase.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-stone-600 dark:text-gray-400 items-center">
                      <span className="flex items-center gap-1.5 text-xs">
                        <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-gold-400" />
                        <span>Package ({matchedPackage?.name || 'Curated Inclusions'})</span>
                      </span>
                      <span className="text-stone-900 dark:text-white font-mono font-medium">LKR {packageBase.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-stone-600 dark:text-gray-400 items-center">
                      <span className="flex items-center gap-1.5 text-xs">
                        <Users className="w-3.5 h-3.5 text-amber-700 dark:text-gold-400" />
                        <span>Hospitality ({guestCount} guests · {eventType === 'birthday' ? 'Birthday' : eventType.charAt(0).toUpperCase() + eventType.slice(1)})</span>
                      </span>
                      <span className="text-stone-900 dark:text-white font-mono font-medium">LKR {(guestCount * perGuestCost).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-amber-600/30 dark:border-gold-500/30">
                    <p className="text-xs text-amber-800 dark:text-gold-400 uppercase tracking-widest mb-1 font-semibold">Estimated Total Budget</p>
                    <motion.p 
                      key={estimatedTotal}
                      initial={{ scale: 0.95, opacity: 0.6 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.25, ease: TRANSITION_EASE_LUXURY }}
                      className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white tabular-nums tracking-tight"
                    >
                      LKR {estimatedTotal.toLocaleString()}
                    </motion.p>
                    <p className="text-[11px] text-stone-500 dark:text-gray-500 mt-1 italic leading-relaxed">
                      *Includes venue space hire, basic catering, staff, and standard luxury furnishings.
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-4">
                  <MagneticButton className="w-full">
                    <Link 
                      to={user ? `/book?packageId=${matchedPackage?.id || ''}&venueId=${currentVenue?.id || ''}` : "/register"} 
                      className="btn-primary w-full text-center text-sm py-3.5 flex items-center justify-center gap-2"
                    >
                      <span>Lock In This Plan & Reserve</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </MagneticButton>
                </div>
              </div>

            </div>
          </MouseSpotlight>
        </motion.div>
      </section>

      {/* Curated Venues Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp(20, 0.6)}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
        >
          <div>
            <span className="badge-gold mb-3">Architectural Grandeur</span>
            <h2 className="font-serif text-4xl sm:text-5xl text-stone-900 dark:text-white font-normal tracking-tight">
              Our Signature Venues
            </h2>
          </div>
          <MagneticButton>
            <Link to="/venues" className="text-sm font-semibold text-amber-800 dark:text-gold-400 hover:text-amber-900 dark:hover:text-gold-300 flex items-center gap-2 group">
              <span>Browse All Spaces</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </MagneticButton>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={staggerContainer(0.12)}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {venues.slice(0, 3).map((venue, idx) => (
            <motion.div 
              key={venue.id}
              variants={fadeUp(30, 0.6)}
              whileHover={{ y: -8, scale: 1.01 }}
              transition={{ duration: 0.35, ease: TRANSITION_EASE_LUXURY }}
              className="h-full"
            >
              <MouseSpotlight className="card p-0 overflow-hidden group hover:border-amber-600/50 dark:hover:border-gold-500/50 hover:shadow-2xl dark:hover:shadow-glow-card transition-all duration-500 flex flex-col justify-between h-full">
              {/* Venue Image */}
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={parseVenueData(venue, idx).imageUrl} 
                  alt={venue.name}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Glassy Availability Indicator */}
                <div className="absolute top-4 left-4">
                  <span className={`text-[11px] px-3.5 py-1.5 rounded-full backdrop-blur-xl font-medium tracking-wide flex items-center gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.3)] ring-1 ring-inset ring-white/15 transition-all ${
                    (venue.isAvailable ?? venue.available ?? true)
                      ? 'bg-emerald-950/40 text-emerald-200 border border-emerald-400/30' 
                      : 'bg-rose-950/40 text-rose-200 border border-rose-400/30'
                  }`}>
                    {(venue.isAvailable ?? venue.available ?? true) ? (
                      <>
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                        </span>
                        <span className="drop-shadow-sm font-sans font-semibold">Available</span>
                      </>
                    ) : (
                      <>
                        <span className="relative flex h-2 w-2">
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-400 shadow-[0_0_8px_#f43f5e]" />
                        </span>
                        <span className="drop-shadow-sm font-sans font-semibold">Booked Out</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Venue Info */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-yellow-500 dark:text-yellow-400 bg-yellow-500/10 px-2.5 py-0.5 rounded-full font-mono border border-yellow-500/30">
                      <Users className="w-3.5 h-3.5 text-yellow-500 dark:text-yellow-400" />
                      <span>Up to {venue.capacity} Guests</span>
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl text-stone-900 dark:text-white group-hover:text-amber-800 dark:group-hover:text-gold-300 transition-colors mb-2">
                    {venue.name}
                  </h3>
                  <p className="text-stone-600 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed mb-4">
                    {parseVenueData(venue, idx).cleanDescription}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between border-t border-stone-200/70 dark:border-white/10 pt-4 mb-4">
                    <span className="text-xs text-stone-500 dark:text-gray-500 uppercase tracking-wider font-medium">Base Rate</span>
                    <span className="font-serif text-xl font-bold text-amber-800 dark:text-gold-400 tabular-nums">
                      LKR {venue.basePrice.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setQuickViewVenue(venue)}
                      className="btn-glass flex-1 text-xs py-2.5 rounded-full flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Quick View</span>
                    </button>
                    <Link
                      to={user ? `/book?venueId=${venue.id}` : "/register"}
                      className="btn-primary flex-1 text-xs py-2.5 rounded-full flex items-center justify-center gap-1"
                    >
                      <span>Reserve</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
              </MouseSpotlight>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Signature Packages Tier Section */}
      <section className="py-24 px-6 bg-[#F5EFE6] dark:bg-dark-950/60 border-y border-stone-200 dark:border-white/5 transition-colors">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={fadeUp(20, 0.6)}
          className="max-w-7xl mx-auto"
        >
          <div className="text-center mb-10">
            <span className="badge-gold mb-3">Curated Hospitality</span>
            <h2 className="font-serif text-4xl sm:text-5xl text-stone-900 dark:text-white font-normal tracking-tight">
              Bespoke Event Packages
            </h2>
            <p className="text-stone-600 dark:text-gray-400 text-sm max-w-lg mx-auto mt-3">
              Comprehensive event styling, gourmet cuisine, and state-of-the-art staging crafted to perfection.
            </p>
          </div>

          {/* Package Category Filter Tabs */}
          <div className="flex items-center justify-center gap-2 mb-12 flex-wrap">
            {[
              { id: 'ALL', label: 'All Experiences' },
              { id: 'BIRTHDAY', label: '🎂 Birthdays' },
              { id: 'WEDDING', label: '💍 Weddings' },
              { id: 'CORPORATE', label: '🏢 Corporate & Summits' },
              { id: 'GALA', label: '✨ Galas & Soirées' },
            ].map(cat => (
              <motion.button
                key={cat.id}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedPackageCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-200 cursor-pointer ${
                  selectedPackageCategory === cat.id
                    ? 'bg-amber-600 dark:bg-gold-500 text-white dark:text-dark-950 shadow-md font-bold'
                    : 'bg-white/80 dark:bg-dark-900/80 text-stone-600 dark:text-gray-400 hover:text-amber-800 dark:hover:text-gold-300 border border-stone-200 dark:border-dark-800'
                }`}
              >
                {cat.label}
              </motion.button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPackages.map((pkg, index) => {
              const isBirthday = pkg.name?.toLowerCase().includes('birthday');
              const highlights = getPackageHighlights(pkg);

              return (
                <motion.div 
                  key={pkg.id}
                  whileHover={{ y: -8, scale: 1.01 }}
                  transition={{ duration: 0.35, ease: TRANSITION_EASE_LUXURY }}
                  className="h-full"
                >
                  <MouseSpotlight
                    className={`card relative flex flex-col justify-between transition-all duration-500 h-full ${
                      isBirthday
                        ? 'border-rose-400 dark:border-rose-500/60 shadow-xl dark:shadow-rose-950/40 ring-1 ring-rose-400/30'
                        : index === 0 
                          ? 'border-amber-600/70 dark:border-gold-500/70 shadow-xl dark:shadow-glow-gold' 
                          : ''
                    }`}
                  >
                    <div>
                      <div className="mb-6">
                        <h3 className="font-serif text-2xl text-stone-900 dark:text-white mb-2">{pkg.name}</h3>
                        <p className="text-stone-600 dark:text-gray-400 text-xs leading-relaxed min-h-[40px]">{pkg.description}</p>
                      </div>

                      <div className="py-4 border-y border-stone-200 dark:border-dark-800 mb-6">
                        <span className="text-xs text-stone-500 dark:text-gray-500 uppercase tracking-widest block mb-1 font-medium">Package Starting At</span>
                        <span className="font-serif text-3xl font-bold text-amber-800 dark:text-gold-300 tabular-nums">
                          LKR {pkg.basePrice.toLocaleString()}
                        </span>
                      </div>

                      {/* Included Highlights */}
                      <ul className="space-y-3 text-xs text-stone-700 dark:text-gray-300 mb-8">
                        {highlights.map((h, i) => (
                          <li key={i} className="flex items-center gap-2.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-gold-400 shrink-0" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Link
                      to={user ? `/book?packageId=${pkg.id}` : "/register"}
                      className={`w-full text-center text-xs py-3 rounded-full font-semibold transition-all flex items-center justify-center gap-1.5 ${
                        isBirthday ? 'btn-primary bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white' : index === 0 ? 'btn-primary' : 'btn-outline'
                      }`}
                    >
                      <span>Select This Package</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </MouseSpotlight>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Client Testimonials Section */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp(20, 0.6)}
          className="text-center mb-16"
        >
          <span className="badge-gold mb-3">Distinguished Praise</span>
          <h2 className="font-serif text-4xl sm:text-5xl text-stone-900 dark:text-white font-normal tracking-tight">
            Voices of Elegance
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              quote: "The Grand Crystal Ballroom exceeded every dream we had for our wedding. The attention to detail and personalized service was regal.",
              author: "Elena & Marcus Sterling",
              event: "Luxury Wedding Gala",
              avatar: "/images/HaGqJemmb0owcHOnqaSMQJxqudw.jpg"
            },
            {
              quote: "Celebrating my 50th birthday at the Celestial Rooftop was unforgettable. The customized styling, cake station, and acoustics were pure magic.",
              author: "Dr. Julianne Hayes",
              event: "Milestone Birthday Gala",
              avatar: "/images/clZkgAuVCvp7qzePBQr7fuFgc.jpg"
            },
            {
              quote: "Our annual Global Tech Summit was executed with absolute technical and culinary precision. The finance and reservation team were impeccable.",
              author: "David V. Chen",
              event: "Corporate Summit 2026",
              avatar: "/images/lQPrddXvlAInLGwdbLneIh8QrQ.jpg"
            },
            {
              quote: "From the first quotation to the final toast under the garden fairy lights, the GrandStay team delivered pure enchantment.",
              author: "Sophia R. Al-Mansoor",
              event: "Charity Banquet",
              avatar: "/images/mXS1xRatPGBZGMvsGbBW1gUKd8.jpg"
            }
          ].map((t, idx) => (
            <motion.div 
              key={idx} 
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ duration: 0.35, ease: TRANSITION_EASE_LUXURY }}
              className="h-full"
            >
              <MouseSpotlight className="card bg-white dark:bg-dark-900/70 flex flex-col justify-between border-stone-200 dark:border-dark-800 hover:border-amber-600/40 dark:hover:border-gold-500/40 shadow-sm h-full">
                <div>
                  <div className="flex gap-1 text-amber-500 dark:text-gold-400 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current stroke-none transition-transform hover:scale-125 duration-200" />
                    ))}
                  </div>
                  <p className="font-serif text-lg text-stone-700 dark:text-gray-200 italic leading-relaxed mb-6">
                    "{t.quote}"
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-stone-200 dark:border-dark-800">
                  <img src={t.avatar} alt={t.author} className="w-10 h-10 rounded-full object-cover border border-amber-600/40 dark:border-gold-500/40" />
                  <div>
                    <p className="text-sm font-semibold text-stone-900 dark:text-white">{t.author}</p>
                    <p className="text-[11px] text-amber-800 dark:text-gold-400/80 font-medium">{t.event}</p>
                  </div>
                </div>
              </MouseSpotlight>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Interactive FAQ Accordion with Framer Motion Spring */}
      <section className="py-20 px-6 max-w-4xl mx-auto border-t border-stone-200 dark:border-white/5">
        <div className="text-center mb-12">
          <span className="badge-gold mb-3">Frequently Asked Questions</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 dark:text-white font-normal tracking-tight">
            Planning Your Event
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="card bg-white dark:bg-dark-900/60 p-0 overflow-hidden border-stone-200 dark:border-dark-800 hover:border-amber-600/40 dark:hover:border-gold-500/30 transition-all shadow-sm"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 text-stone-900 dark:text-white hover:text-amber-800 dark:hover:text-gold-300 transition-colors focus:outline-none cursor-pointer"
              >
                <span className="font-medium text-base sm:text-lg">{faq.q}</span>
                <motion.span 
                  animate={{ rotate: openFaq === index ? 45 : 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                  className="p-1 rounded-full text-amber-800 dark:text-gold-400"
                >
                  <Plus className="w-5 h-5" />
                </motion.span>
              </button>

              <AnimatePresence>
                {openFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: TRANSITION_EASE_LUXURY }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 text-sm text-stone-600 dark:text-gray-400 leading-relaxed border-t border-stone-200 dark:border-dark-800/60 pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Comprehensive Architectural Specifications Modal */}
      <VenueSpecificationModal
        venue={quickViewVenue}
        open={!!quickViewVenue}
        onClose={() => setQuickViewVenue(null)}
        user={user}
      />

      {/* Luxury Footer */}
      <footer className="bg-[#FDFDFB] dark:bg-dark-950 border-t border-stone-200 dark:border-dark-800 pt-16 pb-12 px-6 transition-colors">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="space-y-4">
            <Link to="/" className="inline-block group">
              <img
                src="/images/grandstay-logo-dark.png"
                alt="GrandStay Events & Grand Banquets"
                className="h-10 w-auto object-contain dark:block hidden transition-transform group-hover:scale-105"
              />
              <img
                src="/images/grandstay-logo-light.png"
                alt="GrandStay Events & Grand Banquets"
                className="h-10 w-auto object-contain dark:hidden block transition-transform group-hover:scale-105"
              />
            </Link>
            <p className="text-stone-600 dark:text-gray-400 text-xs leading-relaxed">
              Curating exceptional hotel venue reservations, conferences, and milestone weddings with peerless luxury standards.
            </p>
            <p className="text-xs text-stone-500 dark:text-gray-500 font-mono">
              Colombo · Sri Lanka
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-stone-900 dark:text-white uppercase tracking-widest mb-4">Navigation</h4>
            <ul className="space-y-2 text-xs text-stone-600 dark:text-gray-400">
              <li><Link to="/" className="hover:text-amber-800 dark:hover:text-gold-400 transition-colors">Home Experience</Link></li>
              <li><Link to="/venues" className="hover:text-amber-800 dark:hover:text-gold-400 transition-colors">Our Venues</Link></li>
              <li><Link to="/login" className="hover:text-amber-800 dark:hover:text-gold-400 transition-colors">Client Sign In</Link></li>
              <li><Link to="/register" className="hover:text-amber-800 dark:hover:text-gold-400 transition-colors">Reserve Your Date</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-stone-900 dark:text-white uppercase tracking-widest mb-4">Staff Portals</h4>
            <ul className="space-y-2 text-xs text-stone-600 dark:text-gray-400">
              <li><Link to="/login" className="hover:text-amber-800 dark:hover:text-gold-400 transition-colors">Reservation Officer</Link></li>
              <li><Link to="/login" className="hover:text-amber-800 dark:hover:text-gold-400 transition-colors">Finance & Billing</Link></li>
              <li><Link to="/login" className="hover:text-amber-800 dark:hover:text-gold-400 transition-colors">Hotel Administration</Link></li>
              <li><Link to="/login" className="hover:text-amber-800 dark:hover:text-gold-400 transition-colors">Management Intelligence</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-stone-900 dark:text-white uppercase tracking-widest mb-4">Privé Newsletter</h4>
            <p className="text-xs text-stone-600 dark:text-gray-400 mb-3">Subscribe for seasonal promotion announcements and banquet releases.</p>
            {newsletterSubscribed ? (
              <div className="text-xs text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 p-2.5 rounded-lg border border-emerald-300 dark:border-emerald-800 font-medium flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Thank you for subscribing to our Privé registry.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  value={newsletterEmail} 
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="input-field text-xs py-2"
                  required
                />
                <button type="submit" className="btn-primary text-xs px-4 py-2 shrink-0 flex items-center gap-1">
                  <span>Join</span>
                  <Send className="w-3 h-3" />
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-stone-200 dark:border-dark-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 dark:text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} GrandStay Luxury Events & Hotel Banquets. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-stone-800 dark:hover:text-gray-400 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-stone-800 dark:hover:text-gray-400 cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-stone-800 dark:hover:text-gray-400 cursor-pointer transition-colors">Reservation Ethics</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
