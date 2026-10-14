import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Users, 
  ArrowUpDown, 
  ArrowRight, 
  Sparkles, 
  Eye, 
  RotateCcw, 
  SearchX, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Layers
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { parseVenueData } from '../../utils/venueImageHelper';
import { 
  fadeIn, 
  fadeUp, 
  staggerContainer, 
  TRANSITION_EASE_LUXURY 
} from '../../utils/motion';
import MouseSpotlight from '../../components/MouseSpotlight';
import VenueSpecificationModal from '../../components/VenueSpecificationModal';

export default function VenuesPage() {
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [minCapacity, setMinCapacity] = useState(0);
  const [sortBy, setSortBy] = useState('price-asc');
  const [quickViewVenue, setQuickViewVenue] = useState(null);

  const venueImages = [
    '/images/1THqxCvzczAoxUo3stl2WHdh2J8.jpg',
    '/images/7XSFnDdyalIKrmybn08imC7wVM.jpg',
    '/images/vWlGGLjrgzzuaKI8l7MaYdycBjw.jpg',
    '/images/DAQgxCoS0XtGtOP1VssAJEcrMmg.jpg',
    '/images/clZkgAuVCvp7qzePBQr7fuFgc.jpg',
    '/images/otheu92Jc5IozZNuTf3fCy7Vuw.jpg'
  ];

  useEffect(() => {
    api.get('/venues')
      .then(res => {
        setVenues(res.data || []);
        setFilteredVenues(res.data || []);
      })
      .catch(err => {
        console.error('Failed to load venues:', err);
        const detail = err.response?.data?.message || err.response?.data?.error || err.message || 'Unknown network error';
        const status = err.response?.status ? `[HTTP ${err.response.status}] ` : '';
        setError(`Could not load venues: ${status}${detail}`);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = [...venues];

    if (searchQuery.trim()) {
      result = result.filter(v => 
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (minCapacity > 0) {
      result = result.filter(v => v.capacity >= minCapacity);
    }

    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.basePrice - b.basePrice);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.basePrice - a.basePrice);
    } else if (sortBy === 'capacity-desc') {
      result.sort((a, b) => b.capacity - a.capacity);
    }

    setFilteredVenues(result);
  }, [searchQuery, minCapacity, sortBy, venues]);

  return (
    <div className="min-h-screen bg-[#FDFDFB] dark:bg-dark text-stone-900 dark:text-slate-100 selection:bg-amber-600 dark:selection:bg-gold-500 selection:text-white dark:selection:text-dark-950 transition-colors">
      <Navbar />

      {/* Header Banner with Ambient Zoom */}
      <div data-theme-preserve="dark" className="hero-dark-banner relative pt-28 sm:pt-32 pb-20 px-6 text-center border-b border-stone-200 dark:border-white/5 overflow-hidden">
        <motion.div 
          initial={{ scale: 1 }}
          animate={{ scale: 1.08 }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          className="absolute inset-0 bg-cover bg-center opacity-25" 
          style={{ backgroundImage: `url('/images/7XSFnDdyalIKrmybn08imC7wVM.jpg')` }} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/95 via-dark/80 to-dark/50" />
        
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: TRANSITION_EASE_LUXURY }}
          className="relative z-10 max-w-3xl mx-auto"
        >
          <span className="badge-gold mb-3 inline-flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-gold-400" />
            <span>Opulent Spaces</span>
          </span>
          <h1 className="font-serif text-5xl sm:text-6xl text-white font-normal mb-4 tracking-tight">
            Our Venue Collection
          </h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Discover our curated portfolio of architectural spaces, designed for distinguished celebrations and corporate prestige.
          </p>
          {user && user.role === 'HOTEL_ADMIN' && (
            <div className="mt-6 flex justify-center">
              <Link to="/dashboard/admin" className="btn-primary text-xs px-6 py-3 shadow-md flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                <span>Add / Manage Venues (Admin Portal)</span>
              </Link>
            </div>
          )}
        </motion.div>
      </div>

      {/* Floating Filter Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: TRANSITION_EASE_LUXURY }}
        className="max-w-7xl mx-auto px-6 -mt-8 relative z-20"
      >
        <div className="card-glass border border-amber-600/30 dark:border-gold-500/30 p-5 sm:p-6 flex flex-col md:flex-row items-center gap-4 shadow-xl">
          
          {/* Search Box */}
          <div className="flex-1 w-full relative">
            <Search className="w-4 h-4 text-stone-400 dark:text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search by venue name, ambiance, or capacity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-11"
            />
          </div>

          {/* Min Capacity Filter */}
          <div className="w-full md:w-52 relative">
            <Users className="w-4 h-4 text-stone-400 dark:text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select 
              value={minCapacity}
              onChange={(e) => setMinCapacity(Number(e.target.value))}
              className="input-field pl-11 cursor-pointer"
            >
              <option value="0">All Capacities</option>
              <option value="100">100+ Guests</option>
              <option value="250">250+ Guests</option>
              <option value="500">500+ Guests</option>
            </select>
          </div>

          {/* Sorting */}
          <div className="w-full md:w-56 relative">
            <ArrowUpDown className="w-4 h-4 text-stone-400 dark:text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field pl-11 cursor-pointer"
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="capacity-desc">Capacity: High to Low</option>
            </select>
          </div>

        </div>
      </motion.div>

      {/* Venues Grid */}
      <div className="max-w-7xl mx-auto px-6 py-14">
        {loading && (
          <div className="text-center py-24 text-stone-500 dark:text-gray-500">
            <div className="w-10 h-10 border-2 border-amber-600 dark:border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-serif text-lg text-stone-600 dark:text-gray-400">Loading exquisite venues...</p>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 dark:bg-red-900/40 border border-rose-300 dark:border-red-700 text-rose-800 dark:text-red-300 text-sm px-6 py-4 rounded-xl text-center max-w-xl mx-auto shadow-sm">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredVenues.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 text-stone-500 dark:text-gray-500 card max-w-lg mx-auto shadow-xl"
          >
            <div className="w-12 h-12 rounded-full bg-amber-500/10 dark:bg-gold-500/10 border border-amber-600/20 dark:border-gold-500/20 flex items-center justify-center text-amber-800 dark:text-gold-400 mx-auto mb-4">
              <SearchX className="w-6 h-6 stroke-[2]" />
            </div>
            <p className="font-serif text-2xl text-stone-900 dark:text-white mb-2">No venues match your criteria</p>
            <p className="text-xs text-stone-500 dark:text-gray-400 mb-6 leading-relaxed max-w-sm mx-auto">
              We couldn't find any event spaces matching your search or capacity filter.
            </p>
            <button 
              onClick={() => { setSearchQuery(''); setMinCapacity(0); }} 
              className="btn-outline text-xs inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </motion.div>
        )}

        {/* Cards Grid with Layout Animations */}
        {!loading && filteredVenues.length > 0 && (
          <motion.div 
            layout
            variants={staggerContainer(0.08)}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence>
              {filteredVenues.map((venue, idx) => {
                const isAvail = venue.isAvailable ?? venue.available ?? true;
                const venueData = parseVenueData(venue, idx);
                return (
                  <motion.div 
                    layout
                    key={venue.id}
                    variants={fadeUp(30, 0.5)}
                    whileHover={{ y: -8, scale: 1.01 }}
                    transition={{ duration: 0.35, ease: TRANSITION_EASE_LUXURY }}
                    className="h-full"
                  >
                    <MouseSpotlight className="card p-0 overflow-hidden group hover:border-amber-600/50 dark:hover:border-gold-500/50 hover:shadow-2xl dark:hover:shadow-glow-card transition-all duration-500 flex flex-col justify-between h-full">
                      <div>
                        {/* Venue Image */}
                        <div className="relative h-64 overflow-hidden">
                          <img 
                            src={venueData.imageUrl} 
                            alt={venue.name}
                            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          
                          <div className="absolute top-4 left-4">
                            <span className={`text-[11px] px-3.5 py-1.5 rounded-full backdrop-blur-xl font-medium tracking-wide flex items-center gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.3)] ring-1 ring-inset ring-white/15 transition-all ${
                              isAvail 
                                ? 'bg-emerald-950/40 text-emerald-200 border border-emerald-400/30' 
                                : 'bg-rose-950/40 text-rose-200 border border-rose-400/30'
                            }`}>
                              {isAvail ? (
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

                        {/* Body Content */}
                        <div className="p-6">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-yellow-500 dark:text-yellow-400 bg-yellow-500/10 px-2.5 py-0.5 rounded-full font-mono border border-yellow-500/30">
                              <Users className="w-3.5 h-3.5 text-yellow-500 dark:text-yellow-400" />
                              <span>{venue.capacity} Guests</span>
                            </span>
                          </div>
                          <h3 className="font-serif text-2xl text-stone-900 dark:text-white group-hover:text-amber-800 dark:group-hover:text-gold-300 transition-colors mb-2">
                            {venue.name}
                          </h3>
                          <p className="text-stone-600 dark:text-gray-400 text-sm line-clamp-3 leading-relaxed mb-6">
                            {venueData.cleanDescription}
                          </p>

                          {/* Features checklist with micro-icons */}
                          <div className="grid grid-cols-2 gap-2.5 text-[11px] text-stone-500 dark:text-gray-400 border-t border-stone-200/70 dark:border-white/10 pt-4 mb-2">
                            <span className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-gold-400 shrink-0" />
                              <span>Mood Lighting</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-gold-400 shrink-0" />
                              <span>Acoustic Audio</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-gold-400 shrink-0" />
                              <span>Banquet Catering</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-gold-400 shrink-0" />
                              <span>Bridal Suite</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Price & CTAs */}
                      <div className="p-6 pt-0">
                        <div className="flex items-center justify-between border-t border-stone-200/70 dark:border-white/10 pt-4 mb-4">
                          <span className="text-xs text-stone-500 dark:text-gray-500 uppercase tracking-wider font-semibold">Base Space Rate</span>
                          <span className="font-serif text-2xl font-bold text-amber-800 dark:text-gold-400 tabular-nums">
                            LKR {venue.basePrice?.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setQuickViewVenue(venue)}
                            className="btn-glass flex-1 text-xs py-2.5 rounded-full flex items-center justify-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Specifications</span>
                          </button>
                          <Link
                            to={user ? `/book?venueId=${venue.id}` : "/register"}
                            className="btn-primary flex-1 text-xs py-2.5 rounded-full flex items-center justify-center gap-1.5"
                          >
                            <span>Reserve Date</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </MouseSpotlight>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Comprehensive Architectural Specifications Modal */}
      <VenueSpecificationModal
        venue={quickViewVenue}
        open={!!quickViewVenue}
        onClose={() => setQuickViewVenue(null)}
        user={user}
      />
    </div>
  );
}
