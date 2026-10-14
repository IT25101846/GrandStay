import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Users, 
  Sparkles, 
  Music, 
  Maximize2, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Sliders, 
  Wifi, 
  Car, 
  Coffee, 
  Tv, 
  Layers, 
  Wine,
  X
} from 'lucide-react';
import Modal from './Modal';
import { parseVenueData } from '../utils/venueImageHelper';

export default function VenueSpecificationModal({ 
  venue, 
  open, 
  onClose, 
  user 
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'layouts' | 'tech' | 'amenities'

  if (!venue) return null;

  const venueData = parseVenueData(venue);
  const cap = Number(venue.capacity) || 200;
  
  // Calculate dynamic floor metrics based on capacity
  const sqft = Math.round(cap * 18.5);
  const banquetRoundCap = Math.round(cap * 0.75);
  const cocktailCap = Math.round(cap * 1.15);
  const theaterCap = cap;
  const classroomCap = Math.round(cap * 0.55);

  const tabs = [
    { id: 'overview', label: 'Architectural Specs' },
    { id: 'layouts', label: 'Seating Layouts' },
    { id: 'tech', label: 'AV & Staging Tech' },
    { id: 'amenities', label: 'Hospitality Amenities' },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      badge="Architectural Blueprint"
      title={venue.name}
      subtitle="Complete Technical Specifications, Capacities & Amenities"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        
        {/* Banner with Ambient Image & Quick Badges */}
        <div className="relative h-56 sm:h-64 w-full rounded-2xl overflow-hidden border border-stone-200 dark:border-dark-800 shadow-md">
          <img 
            src={venueData.imageUrl} 
            alt={venue.name} 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          
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
                  <span className="drop-shadow-sm font-sans font-semibold">Available for Booking</span>
                </>
              ) : (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-400 shadow-[0_0_8px_#f43f5e]" />
                  </span>
                  <span className="drop-shadow-sm font-sans font-semibold">Currently Booked Out</span>
                </>
              )}
            </span>
          </div>
          
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="text-[10px] tracking-widest uppercase font-mono text-gold-300 font-semibold block mb-0.5">
                Official Venue Space
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white drop-shadow-md">
                {venue.name}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="bg-black/80 backdrop-blur-md border border-gold-400/50 text-gold-300 px-3 py-1.5 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 shadow-lg">
                <Maximize2 className="w-3.5 h-3.5 text-gold-400" />
                <span>{sqft.toLocaleString()} Sq.Ft</span>
              </span>
              <span className="bg-black/80 backdrop-blur-md border border-emerald-400/50 text-emerald-300 px-3 py-1.5 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 shadow-lg">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>Up to {cap} Guests</span>
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Specification Tabs */}
        <div className="flex items-center gap-2 border-b border-stone-200 dark:border-dark-800 pb-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-amber-600 dark:bg-gold-500 text-white dark:text-dark-950 shadow-sm'
                  : 'text-stone-600 dark:text-gray-400 hover:text-amber-800 dark:hover:text-gold-300 hover:bg-stone-100 dark:hover:bg-dark-900/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Display */}
        <div className="min-h-[220px]">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <p className="text-stone-700 dark:text-gray-300 text-sm leading-relaxed">
                {venueData.cleanDescription}
              </p>

              {/* Architectural Key Figures Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-stone-50 dark:bg-dark-900/80 p-3.5 rounded-xl border border-stone-200 dark:border-dark-800">
                  <span className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-gray-400 block font-medium">Floor Area</span>
                  <span className="font-serif text-lg font-bold text-stone-900 dark:text-white tabular-nums mt-0.5 block">
                    {sqft.toLocaleString()} <span className="text-xs font-sans font-normal text-stone-500 dark:text-gray-400">sq.ft</span>
                  </span>
                </div>
                <div className="bg-stone-50 dark:bg-dark-900/80 p-3.5 rounded-xl border border-stone-200 dark:border-dark-800">
                  <span className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-gray-400 block font-medium">Ceiling Clearance</span>
                  <span className="font-serif text-lg font-bold text-stone-900 dark:text-white tabular-nums mt-0.5 block">
                    6.5 m <span className="text-xs font-sans font-normal text-stone-500 dark:text-gray-400">(21.3 ft)</span>
                  </span>
                </div>
                <div className="bg-stone-50 dark:bg-dark-900/80 p-3.5 rounded-xl border border-stone-200 dark:border-dark-800">
                  <span className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-gray-400 block font-medium">Base Hire Rate</span>
                  <span className="font-serif text-lg font-bold text-amber-800 dark:text-gold-400 tabular-nums mt-0.5 block">
                    LKR {venue.basePrice?.toLocaleString()}
                  </span>
                </div>
                <div className="bg-stone-50 dark:bg-dark-900/80 p-3.5 rounded-xl border border-stone-200 dark:border-dark-800">
                  <span className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-gray-400 block font-medium">Acoustic Rating</span>
                  <span className="font-serif text-lg font-bold text-emerald-700 dark:text-emerald-400 mt-0.5 block">
                    Class A Isolation
                  </span>
                </div>
              </div>

              {/* Architectural Highlights */}
              <div className="bg-amber-500/5 dark:bg-gold-500/5 border border-amber-600/20 dark:border-gold-500/20 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-amber-900 dark:text-gold-300 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-600 dark:text-gold-400" />
                  <span>Structural Inclusions</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700 dark:text-gray-300">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-gold-400 shrink-0" />
                    <span>Pillar-free architectural sightlines for unhindered guest visibility</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-gold-400 shrink-0" />
                    <span>Heavy-duty Italian marble flooring suitable for high-load dance setups</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-gold-400 shrink-0" />
                    <span>Dual grand double-door entrances for VIP arrival & guest flow</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-gold-400 shrink-0" />
                    <span>2 hours complimentary pre-event styling setup grace period</span>
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'layouts' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <p className="text-xs text-stone-600 dark:text-gray-400">
                Recommended seating capacities based on standard hotel luxury banquet spacing guidelines (5-foot clearance between dining tables):
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-xl border border-stone-200 dark:border-dark-800 bg-stone-50/50 dark:bg-dark-900/60 flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold text-stone-900 dark:text-white text-sm">Banquet Round Style</h5>
                    <p className="text-xs text-stone-500 dark:text-gray-400 mt-0.5">10-guest round tables with standard dance floor</p>
                  </div>
                  <span className="font-serif text-xl font-bold text-amber-800 dark:text-gold-400 tabular-nums">
                    {banquetRoundCap} <span className="text-xs font-sans font-normal text-stone-500">pax</span>
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-stone-200 dark:border-dark-800 bg-stone-50/50 dark:bg-dark-900/60 flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold text-stone-900 dark:text-white text-sm">Cocktail & Standing Soirée</h5>
                    <p className="text-xs text-stone-500 dark:text-gray-400 mt-0.5">High cocktail tables, lounge pods & grazing stations</p>
                  </div>
                  <span className="font-serif text-xl font-bold text-amber-800 dark:text-gold-400 tabular-nums">
                    {cocktailCap} <span className="text-xs font-sans font-normal text-stone-500">pax</span>
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-stone-200 dark:border-dark-800 bg-stone-50/50 dark:bg-dark-900/60 flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold text-stone-900 dark:text-white text-sm">Theater / Keynote Auditorium</h5>
                    <p className="text-xs text-stone-500 dark:text-gray-400 mt-0.5">Tiered row seating facing elevated keynote stage</p>
                  </div>
                  <span className="font-serif text-xl font-bold text-amber-800 dark:text-gold-400 tabular-nums">
                    {theaterCap} <span className="text-xs font-sans font-normal text-stone-500">pax</span>
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-stone-200 dark:border-dark-800 bg-stone-50/50 dark:bg-dark-900/60 flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold text-stone-900 dark:text-white text-sm">Classroom / Corporate Training</h5>
                    <p className="text-xs text-stone-500 dark:text-gray-400 mt-0.5">Delegate tables with stationery and power access</p>
                  </div>
                  <span className="font-serif text-xl font-bold text-amber-800 dark:text-gold-400 tabular-nums">
                    {classroomCap} <span className="text-xs font-sans font-normal text-stone-500">pax</span>
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'tech' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-xl border border-stone-200 dark:border-dark-800 bg-stone-50/50 dark:bg-dark-900/60">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600 dark:text-gold-400" />
                    <h5 className="font-semibold text-stone-900 dark:text-white text-sm">DMX Architectural Mood Lighting</h5>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-gray-400 leading-relaxed">
                    Custom programmable RGBW scene moods, dimmable Bohemian crystal chandeliers, and pin-spot table lighting presets.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-stone-200 dark:border-dark-800 bg-stone-50/50 dark:bg-dark-900/60">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Music className="w-4 h-4 text-amber-600 dark:text-gold-400" />
                    <h5 className="font-semibold text-stone-900 dark:text-white text-sm">Acoustic Audio Production</h5>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-gray-400 leading-relaxed">
                    JBL/Bose concert line array speaker distribution, 4 wireless handheld Shure vocal mics, and dedicated master soundboard.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-stone-200 dark:border-dark-800 bg-stone-50/50 dark:bg-dark-900/60">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Tv className="w-4 h-4 text-amber-600 dark:text-gold-400" />
                    <h5 className="font-semibold text-stone-900 dark:text-white text-sm">4K Laser Video & Projection</h5>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-gray-400 leading-relaxed">
                    Motorized ceiling-recessed 180" tensioned projection screens, HDMI/Type-C hybrid patch points, and delegate livestream support.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-stone-200 dark:border-dark-800 bg-stone-50/50 dark:bg-dark-900/60">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Sliders className="w-4 h-4 text-amber-600 dark:text-gold-400" />
                    <h5 className="font-semibold text-stone-900 dark:text-white text-sm">High-Amperage 3-Phase Stage Power</h5>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-gray-400 leading-relaxed">
                    Dedicated 63A and 32A CEE industrial power inlets ready for live musical bands, heavy lighting rigs, and professional DJ consoles.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'amenities' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-xl border border-stone-200 dark:border-dark-800 bg-stone-50/50 dark:bg-dark-900/60">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600 dark:text-gold-400" />
                    <h5 className="font-semibold text-stone-900 dark:text-white text-sm">Complimentary Bridal Suite</h5>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-gray-400 leading-relaxed">
                    Private air-conditioned dressing room with full-length Hollywood vanity mirror, ensuite marble bath, and champagne bar.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-stone-200 dark:border-dark-800 bg-stone-50/50 dark:bg-dark-900/60">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Car className="w-4 h-4 text-amber-600 dark:text-gold-400" />
                    <h5 className="font-semibold text-stone-900 dark:text-white text-sm">Valet & Executive Parking</h5>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-gray-400 leading-relaxed">
                    Dedicated red-carpet driveway portico with professional uniform valet service and secure basement parking for up to 250 cars.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-stone-200 dark:border-dark-800 bg-stone-50/50 dark:bg-dark-900/60">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Coffee className="w-4 h-4 text-amber-600 dark:text-gold-400" />
                    <h5 className="font-semibold text-stone-900 dark:text-white text-sm">Satellite Culinary Pantry</h5>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-gray-400 leading-relaxed">
                    Adjacent commercial hot-holding pantry with direct butler access corridors, ensuring synchronized 5-star course delivery.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-stone-200 dark:border-dark-800 bg-stone-50/50 dark:bg-dark-900/60">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Wifi className="w-4 h-4 text-amber-600 dark:text-gold-400" />
                    <h5 className="font-semibold text-stone-900 dark:text-white text-sm">High-Density Wi-Fi 6</h5>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-gray-400 leading-relaxed">
                    Dedicated 1 Gbps fiber uplink designed for simultaneous conference delegate access, voting polls, and real-time 4K media broadcasts.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-200 dark:border-dark-800">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-gray-400 font-semibold block">
              Venue Space Rate
            </span>
            <span className="font-serif text-2xl font-bold text-amber-800 dark:text-gold-400 tabular-nums">
              LKR {venue.basePrice?.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              type="button"
              onClick={onClose} 
              className="btn-outline px-6 text-xs sm:text-sm py-2.5 rounded-full flex-1 sm:flex-initial"
            >
              Close Blueprint
            </button>
            <Link 
              to={user ? `/book?venueId=${venue.id}` : "/register"} 
              className="btn-primary text-xs sm:text-sm px-6 py-2.5 rounded-full flex items-center justify-center gap-2 flex-1 sm:flex-initial shadow-lg"
              onClick={onClose}
            >
              <span>Reserve This Space</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </Modal>
  );
}
