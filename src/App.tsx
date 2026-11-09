import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wine, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Sparkles, 
  ChevronRight, 
  Instagram, 
  MessageSquare, 
  PhoneCall, 
  Plus, 
  Send,
  HelpCircle,
  FileText,
  Flame,
  Award,
  CheckCircle,
  Volume2,
  Compass
} from 'lucide-react';
import { Reservation, GalleryItem } from './types';
import { GALLERY_ITEMS, TESTIMONIALS } from './data';
import ReservationModal from './components/ReservationModal';
import MenuModal from './components/MenuModal';
import GalleryModal from './components/GalleryModal';
import DrinkShowcase from './components/DrinkShowcase';
import WebGLScene from './components/WebGLScene';
import TandoorHero from './components/TandoorHero';

export default function App() {
  // Modal states
  const [isResModalOpen, setIsResModalOpen] = useState(false);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<GalleryItem | null>(null);

  // Active section track (0: Home, 1: About, 2: Drinks, 3: Guestbook Ledger)
  const [activeSection, setActiveSection] = useState(0);
  const [isLedgerFacing, setIsLedgerFacing] = useState(false);

  // Scroll Position and Velocity Engine
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollVelocity, setScrollVelocity] = useState(0);

  // Local Storage reservations persistence
  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem('dine_out_reservations');
    return saved ? JSON.parse(saved) : [];
  });

  const [showResDrawer, setShowResDrawer] = useState(false);

  // Save to local storage
  const handleAddReservation = (res: Reservation) => {
    const updated = [res, ...reservations];
    setReservations(updated);
    localStorage.setItem('dine_out_reservations', JSON.stringify(updated));
  };

  // Inline Guestbook reservation state
  const [inlineDate, setInlineDate] = useState('');
  const [inlineTime, setInlineTime] = useState('20:00');
  const [inlineGuests, setInlineGuests] = useState(2);
  const [inlineTableType, setInlineTableType] = useState<'standard' | 'tandoor_counter' | 'obsidian_vault' | 'window_seat'>('standard');
  const [inlineName, setInlineName] = useState('');
  const [inlineEmail, setInlineEmail] = useState('');
  const [inlinePhone, setInlinePhone] = useState('');
  const [inlineSuccess, setInlineSuccess] = useState<Reservation | null>(null);
  const [ledgerTab, setLedgerTab] = useState<'booking' | 'inquiry'>('booking');

  // Contact/Encounter inquiry state
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryType, setInquiryType] = useState('Private Soiree');
  const [inquiryDetails, setInquiryDetails] = useState('');
  const [inquirySuccess, setInquirySuccess] = useState(false);

  // Active testimonial slider
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Monitor scrolling to calculate progress and smoothed velocity
  useEffect(() => {
    let lastY = window.scrollY;
    let velocity = 0;
    
    const handleScroll = () => {
      const currentY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? currentY / maxScroll : 0;
      
      const v = Math.abs(currentY - lastY);
      velocity += (v - velocity) * 0.12; // smooth out velocity using interpolation
      lastY = currentY;

      setScrollProgress(progress);
      setScrollVelocity(velocity * 0.05); // scale down for shader inputs
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Timeline navigations to heights: Home (0), About (1.6), Drinks (3.4), Ledger (5.2)
  const navigateToSection = (sectionIndex: number) => {
    const scrollHeights = [
      0,
      window.innerHeight * 1.6,
      window.innerHeight * 3.4,
      window.innerHeight * 5.2
    ];
    window.scrollTo({
      top: scrollHeights[sectionIndex],
      behavior: 'smooth'
    });
  };

  // Submit hander for inline Guestbook
  const handleInlineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineName || !inlineEmail || !inlinePhone || !inlineDate) return;

    const newRes: Reservation = {
      id: 'res-' + Math.random().toString(36).substr(2, 9),
      name: inlineName,
      email: inlineEmail,
      phone: inlinePhone,
      date: inlineDate,
      time: inlineTime,
      guests: inlineGuests,
      tableType: inlineTableType,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    handleAddReservation(newRes);
    setInlineSuccess(newRes);
  };

  const resetInlineForm = () => {
    setInlineName('');
    setInlineEmail('');
    setInlinePhone('');
    setInlineDate('');
    setInlineSuccess(null);
  };

  // Submit handler for inline Private Enquiry
  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName || !inquiryEmail) return;

    setInquirySuccess(true);
    setTimeout(() => {
      setInquiryName('');
      setInquiryEmail('');
      setInquiryDetails('');
      setInquirySuccess(false);
    }, 6000);
  };

  // Drawer status badge helper
  const getTableTypeLabel = (type: string) => {
    switch (type) {
      case 'tandoor_counter': return 'Hearth-Fire Counter';
      case 'obsidian_vault': return 'The Obsidian Crypt';
      case 'window_seat': return 'Starlit Window Cove';
      default: return 'Crystal Salon Stall';
    }
  };

  return (
    <div className="bg-[#0b0b0b] text-[#e5e2e1] min-h-screen relative selection:bg-amber-400 selection:text-zinc-950">
      
      {/* 1. CINEMATIC BACKGROUND WEBGL CANVAS */}
      <div className="fixed inset-0 w-full h-screen z-0 overflow-hidden pointer-events-none">
        <WebGLScene 
          scrollProgress={scrollProgress}
          scrollVelocity={scrollVelocity}
          onSectionActive={setActiveSection}
          onEnterReservationLedger={setIsLedgerFacing}
        />
      </div>

      {/* 2. DUMMY HEIGHT CONTAINER (Native Scroll Capture Layer) */}
      {/* 650vh total, giving plenty of cinematic scroll pacing */}
      <div className="relative z-0 h-[650vh] w-full pointer-events-none" />

      {/* 3. INTERACTIVE HUD OVERLAY VIEWPORT (Fixed position) */}
      <div className="fixed inset-0 w-full h-screen z-10 flex flex-col justify-between pointer-events-none">
        
        {/* Top Navigation Bar */}
        <header className="w-full pointer-events-auto z-40 bg-zinc-950/20 backdrop-blur-md border-b border-zinc-900/30">
          <nav className="flex justify-between items-center px-6 md:px-12 py-5 max-w-[1920px] mx-auto">
            {/* Brand Logo */}
            <div 
              onClick={() => navigateToSection(0)}
              className="font-serif italic text-2xl tracking-tighter text-amber-200 hover:text-amber-300 transition-colors cursor-pointer select-none"
            >
              Dine-Out
            </div>

            {/* Timeline segment links */}
            <div className="hidden md:flex gap-8 lg:gap-12 items-center text-[10px] uppercase tracking-widest text-zinc-400 font-light select-none">
              <button 
                onClick={() => navigateToSection(0)} 
                className={`hover:text-amber-100 transition-all ${activeSection === 0 ? 'text-amber-400 font-medium' : ''}`}
              >
                01. Home
              </button>
              <button 
                onClick={() => navigateToSection(1)} 
                className={`hover:text-amber-100 transition-all ${activeSection === 1 ? 'text-amber-400 font-medium' : ''}`}
              >
                02. Beyond the Plate
              </button>
              <button 
                onClick={() => navigateToSection(2)} 
                className={`hover:text-amber-100 transition-all ${activeSection === 2 ? 'text-amber-400 font-medium' : ''}`}
              >
                03. Crystalline stories
              </button>
              <button 
                onClick={() => navigateToSection(3)} 
                className={`hover:text-amber-100 transition-all ${activeSection === 3 ? 'text-amber-400 font-medium' : ''}`}
              >
                04. Nocturnal ledger
              </button>
              
              {/* Active Reservations badge */}
              {reservations.length > 0 && (
                <button 
                  onClick={() => setShowResDrawer(true)}
                  className="flex items-center gap-1.5 text-amber-400 font-bold border-b border-amber-400/30 hover:border-amber-400 pb-0.5 transition-all text-[9px] uppercase tracking-[0.15em]"
                >
                  My Passes ({reservations.length})
                </button>
              )}
            </div>

            {/* Direct Reservation Call Action */}
            <button 
              onClick={() => navigateToSection(3)}
              className="bg-amber-400/90 hover:bg-amber-400 text-zinc-950 px-6 py-2.5 font-serif uppercase tracking-widest text-xs font-bold hover:shadow-[0_0_15px_rgba(242,202,80,0.3)] duration-300 active:scale-95 transition-transform"
            >
              Lodge Table
            </button>
          </nav>
        </header>

        {/* Dynamic Vertical Scroll Timeline Rail (Right Margin) */}
        <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 z-30 hidden sm:flex flex-col items-center gap-6 pointer-events-auto select-none">
          <span className="text-[9px] font-mono font-bold text-zinc-600 tracking-wider">TIMELINE</span>
          <div className="flex flex-col gap-3 relative">
            {[0, 1, 2, 3].map((idx) => (
              <button
                key={idx}
                onClick={() => navigateToSection(idx)}
                className="group flex items-center justify-end gap-3 focus:outline-none"
              >
                <span className={`text-[9px] font-mono transition-opacity duration-300 ${
                  activeSection === idx ? 'opacity-100 text-amber-400 font-bold' : 'opacity-0 group-hover:opacity-60 text-zinc-500'
                }`}>
                  {['INTRO', 'CRAFT', 'BAR', 'LEDGER'][idx]}
                </span>
                <div className={`w-2 h-2 rounded-full border transition-all ${
                  activeSection === idx 
                    ? 'bg-amber-400 border-amber-400 scale-125' 
                    : 'bg-transparent border-zinc-700 group-hover:border-zinc-500'
                }`} />
              </button>
            ))}
          </div>
          <span className="text-[10px] font-mono text-amber-400 font-bold">
            0{activeSection + 1} / 04
          </span>
        </div>

        {/* MAIN NARRATIVE DECK FRAME */}
        <main className="flex-1 w-full relative flex items-center justify-center">
          <AnimatePresence mode="wait">
            
            {/* ZONE 0: THE PORTAL / INTRODUCTION */}
            {activeSection === 0 && (
              <motion.div 
                key="zone-0"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 flex items-center px-6 md:px-12 lg:px-20 pointer-events-auto"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center max-w-7xl w-full mx-auto">

                  {/* Left Column: Narrative Content */}
                  <div className="md:col-span-6 space-y-6 text-center md:text-left">
                    <span className="font-mono text-xs md:text-sm uppercase tracking-[0.4em] text-amber-400/60 font-semibold block animate-pulse">
                      * Slide Down to Enter Senses
                    </span>
                    <h1 className="font-serif text-5xl sm:text-6xl md:text-6xl lg:text-7xl text-gold-gradient font-light leading-[1.05] tracking-tight">
                      The night tastes <br />
                      <span className="italic">better here.</span>
                    </h1>
                    <p className="max-w-md mx-auto md:mx-0 text-xs sm:text-sm text-zinc-500 leading-relaxed font-light tracking-wide">
                      Indian heritage refined through modern culinary alchemy. An unbroken 3D narrative through space, crystal, and live coals.
                    </p>
                  </div>

                  {/* Right Column: The Tandoor — live, mouse-reactive fire */}
                  <div className="md:col-span-6 flex items-center justify-center">
                    <TandoorHero />
                  </div>

                </div>
              </motion.div>
            )}

            {/* ZONE 1: BEYOND THE PLATE / THE HERITAGE CRAFT */}
            {activeSection === 1 && (
              <motion.div 
                key="zone-1"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 flex items-center justify-center px-6 md:px-12 lg:px-24 pointer-events-auto"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-16 items-center max-w-7xl w-full">
                  
                  {/* Left Column: Narrative Content */}
                  <div className="md:col-span-7 space-y-8 text-left">
                    <div className="space-y-3">
                      <span className="text-[10px] uppercase tracking-[0.3em] text-amber-500 font-bold block">
                        Behind the velvet curtain
                      </span>
                      <h2 className="text-4xl md:text-6xl font-serif font-light text-white leading-tight">
                        Beyond the <br />
                        <span className="text-amber-400 italic">Plate.</span>
                      </h2>
                    </div>

                    <div className="max-w-xl space-y-5 text-zinc-400 text-xs sm:text-sm font-light leading-relaxed">
                      <p className="text-base text-zinc-300">
                        In the heart of the city, Dine-Out emerges as a sanctuary for the senses. We believe that dining is not merely a transaction of sustenance, but a cinematic performance played out under the amber glow of crystal and the rhythm of the night.
                      </p>
                      <p>
                        Our tandoors burn with ancient heat, our spices are whispered from generations past, and our atmosphere is tailored for those who find their true selves after the sun retreats.
                      </p>

                      {/* Michelin & Awards */}
                      <div className="pt-6 flex gap-8 border-t border-zinc-900">
                        <div>
                          <span className="block text-xl font-serif text-amber-400">Michelin</span>
                          <span className="text-[9px] text-zinc-500 uppercase tracking-widest">Recommended 2023</span>
                        </div>
                        <div className="h-8 w-[1px] bg-zinc-900" />
                        <div>
                          <span className="block text-xl font-serif text-amber-400">5-Star</span>
                          <span className="text-[9px] text-zinc-500 uppercase tracking-widest">Wine Cellar Award</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Mini Interactive Visual snapshots */}
                  <div className="md:col-span-5 bg-zinc-950/40 p-6 border border-zinc-900/50 rounded backdrop-blur-sm space-y-4">
                    <span className="text-[9px] font-mono text-amber-400/80 uppercase block tracking-wider">
                      // Culinary Artifacts (Click to inspect)
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      {GALLERY_ITEMS.slice(0, 4).map((item) => (
                        <div 
                          key={item.id}
                          onClick={() => setSelectedGalleryItem(item)}
                          className="group relative aspect-square overflow-hidden cursor-pointer border border-zinc-850 rounded"
                        >
                          <img 
                            src={item.url} 
                            alt={item.caption} 
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 scale-105 group-hover:scale-100 transition-all duration-700" 
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-100 group-hover:opacity-0 transition-opacity" />
                          <div className="absolute bottom-2 left-2 right-2 text-[9px] font-serif text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity line-clamp-1">
                            {item.caption}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => setIsMenuModalOpen(true)}
                      className="w-full py-2.5 bg-zinc-900 border border-zinc-800 hover:border-amber-400/30 text-zinc-300 hover:text-white transition-all text-[10px] uppercase tracking-widest"
                    >
                      Browse full evening menu
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ZONE 2: MIXOLOGY ARCHIVE / LIQUID MIDNIGHT */}
            {activeSection === 2 && (
              <motion.div 
                key="zone-2"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 flex flex-col justify-center px-6 md:px-12 lg:px-24 max-w-6xl mx-auto pointer-events-auto"
              >
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-900/60 pb-5">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.3em] text-amber-500 font-bold block mb-1">Crystalline Stories</span>
                      <h2 className="text-4xl font-serif text-white italic">Liquid Midnight</h2>
                    </div>
                    <p className="max-w-sm text-[11px] sm:text-xs text-zinc-500 leading-relaxed font-light">
                      Mixologists engineering structural stories inside crystal glass. Traverse the profiles from crisp early botanical tones to rare smoky vintage cask aging.
                    </p>
                  </div>

                  {/* Fully interactive multi-sensory cocktail sliders */}
                  <DrinkShowcase />
                </div>
              </motion.div>
            )}

            {/* ZONE 3: NOCTURNAL GUESTBOOK LEDGER (Climax of Narrative) */}
            {activeSection === 3 && (
              <motion.div 
                key="zone-3"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 flex items-center justify-center px-6 md:px-12 lg:px-20 pointer-events-auto"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch max-w-6xl w-full">
                  
                  {/* Left Column: Testimonial & Atmosphere details */}
                  <div className="lg:col-span-5 flex flex-col justify-between py-2 text-left">
                    <div className="space-y-4">
                      <span className="text-[10px] uppercase tracking-[0.3em] text-amber-500 font-extrabold block">
                        Nocturnal Connoisseurs
                      </span>
                      <h3 className="text-3xl font-serif text-white leading-tight">
                        Lodged in the <br />
                        <span className="italic text-amber-400">Sanctuary Ledger.</span>
                      </h3>
                      
                      {/* Animated testimonial carousel with typewriter vibe */}
                      <div className="bg-zinc-950/40 p-5 border border-zinc-900 rounded backdrop-blur-sm relative overflow-hidden min-h-[160px] flex flex-col justify-between">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={activeTestimonial}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="space-y-4"
                          >
                            <p className="text-xs sm:text-sm italic font-serif text-zinc-300 leading-relaxed">
                              {TESTIMONIALS[activeTestimonial].quote}
                            </p>
                            <div>
                              <span className="block text-[11px] font-bold text-white uppercase tracking-wider">
                                {TESTIMONIALS[activeTestimonial].author}
                              </span>
                              <span className="block text-[9px] font-mono text-amber-500 uppercase">
                                {TESTIMONIALS[activeTestimonial].role}
                              </span>
                            </div>
                          </motion.div>
                        </AnimatePresence>
                        <div className="flex gap-1.5 mt-4">
                          {TESTIMONIALS.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setActiveTestimonial(idx)}
                              className={`h-1 rounded-full transition-all ${
                                activeTestimonial === idx ? 'w-4 bg-amber-400' : 'w-1 bg-zinc-800'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Quick Hotlines for offline reservations */}
                    <div className="hidden lg:grid grid-cols-2 gap-3 text-[10px] border-t border-zinc-900/60 pt-4">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <PhoneCall size={12} className="text-amber-500" />
                        <span>Hotline: +91 1124509000</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-400">
                        <MessageSquare size={12} className="text-amber-500" />
                        <span>Concierge: Chat Live</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Interactive Ledger Unfolded Book Form (Overlaid on top of WebGL paper mesh) */}
                  <div className="lg:col-span-7 bg-zinc-950/70 border border-amber-400/20 shadow-2xl p-6 sm:p-8 rounded flex flex-col justify-between backdrop-blur-md relative overflow-hidden">
                    {/* Top border accent line */}
                    <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                    
                    {/* Tabs Selection: Booking vs Inquiry */}
                    <div className="flex border-b border-zinc-900 mb-6 text-[10px] uppercase tracking-widest font-bold font-mono">
                      <button 
                        onClick={() => setLedgerTab('booking')}
                        className={`flex-1 pb-3 text-center transition-colors border-b ${
                          ledgerTab === 'booking' ? 'text-amber-400 border-amber-400' : 'text-zinc-500 border-transparent hover:text-zinc-300'
                        }`}
                      >
                        Book Sanctuary Table
                      </button>
                      <button 
                        onClick={() => setLedgerTab('inquiry')}
                        className={`flex-1 pb-3 text-center transition-colors border-b ${
                          ledgerTab === 'inquiry' ? 'text-amber-400 border-amber-400' : 'text-zinc-500 border-transparent hover:text-zinc-300'
                        }`}
                      >
                        Request Private Encounter
                      </button>
                    </div>

                    {ledgerTab === 'booking' ? (
                      <div>
                        {inlineSuccess ? (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-4 space-y-4"
                          >
                            <div className="inline-flex items-center justify-center p-2 bg-amber-400/10 rounded-full border border-amber-400/30 text-amber-400">
                              <CheckCircle size={24} />
                            </div>
                            <div>
                              <h4 className="text-xl font-serif text-white">Guestbook Signed</h4>
                              <p className="text-[9px] uppercase tracking-widest text-amber-500 font-bold">Table is Secured</p>
                            </div>
                            
                            {/* Pass Card mockup */}
                            <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded text-left text-xs space-y-2 max-w-sm mx-auto">
                              <div className="flex justify-between pb-2 border-b border-zinc-800 text-[9px] uppercase tracking-wider text-amber-400">
                                <span>Nocturnal Ledger Pass</span>
                                <span className="font-mono text-zinc-500">ID: {inlineSuccess.id}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-300">
                                <div><span className="text-[8px] text-zinc-500 uppercase block">Host</span>{inlineSuccess.name}</div>
                                <div><span className="text-[8px] text-zinc-500 uppercase block">Atmosphere</span>{getTableTypeLabel(inlineSuccess.tableType)}</div>
                                <div><span className="text-[8px] text-zinc-500 uppercase block">Timing</span>{inlineSuccess.date} @ {inlineSuccess.time}</div>
                                <div><span className="text-[8px] text-zinc-500 uppercase block">Souls count</span>{inlineSuccess.guests} persons</div>
                              </div>
                            </div>
                            <button 
                              onClick={resetInlineForm}
                              className="px-6 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[10px] uppercase tracking-widest border border-zinc-800 transition-colors"
                            >
                              Add Another Table
                            </button>
                          </motion.div>
                        ) : (
                          <form onSubmit={handleInlineSubmit} className="space-y-4 text-left">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[9px] uppercase tracking-widest text-zinc-500 mb-1">Your Noble Name</label>
                                <input 
                                  type="text" 
                                  required 
                                  value={inlineName}
                                  onChange={(e) => setInlineName(e.target.value)}
                                  placeholder="Julian V."
                                  className="w-full bg-zinc-900 border border-zinc-800/80 focus:border-amber-400 px-3 py-2 text-xs focus:outline-none focus:ring-0 text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] uppercase tracking-widest text-zinc-500 mb-1">Electronic Mail</label>
                                <input 
                                  type="email" 
                                  required 
                                  value={inlineEmail}
                                  onChange={(e) => setInlineEmail(e.target.value)}
                                  placeholder="julian@weekly.com"
                                  className="w-full bg-zinc-900 border border-zinc-800/80 focus:border-amber-400 px-3 py-2 text-xs focus:outline-none focus:ring-0 text-white"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[9px] uppercase tracking-widest text-zinc-500 mb-1">Secure Hotline</label>
                                <input 
                                  type="tel" 
                                  required 
                                  value={inlinePhone}
                                  onChange={(e) => setInlinePhone(e.target.value)}
                                  placeholder="+91 999 999 000"
                                  className="w-full bg-zinc-900 border border-zinc-800/80 focus:border-amber-400 px-3 py-2 text-xs focus:outline-none focus:ring-0 text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] uppercase tracking-widest text-zinc-500 mb-1">Sphere Atmosphere</label>
                                <select 
                                  value={inlineTableType}
                                  onChange={(e) => setInlineTableType(e.target.value as any)}
                                  className="w-full bg-zinc-900 border border-zinc-800/80 focus:border-amber-400 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400/10 text-white"
                                >
                                  <option value="standard">Crystal Salon Stall</option>
                                  <option value="tandoor_counter">Hearth-Fire Counter</option>
                                  <option value="obsidian_vault">The Obsidian Crypt</option>
                                  <option value="window_seat">Starlit Window Cove</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="sm:col-span-2">
                                <label className="block text-[9px] uppercase tracking-widest text-zinc-500 mb-1">Twilight Date</label>
                                <input 
                                  type="date" 
                                  required 
                                  value={inlineDate}
                                  onChange={(e) => setInlineDate(e.target.value)}
                                  min={new Date().toISOString().split('T')[0]}
                                  className="w-full bg-zinc-900 border border-zinc-800/80 focus:border-amber-400 px-3 py-2 text-xs focus:outline-none focus:ring-0 text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] uppercase tracking-widest text-zinc-500 mb-1">Hour Slot</label>
                                <select 
                                  value={inlineTime}
                                  onChange={(e) => setInlineTime(e.target.value)}
                                  className="w-full bg-zinc-900 border border-zinc-800/80 focus:border-amber-400 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400/10 text-white"
                                >
                                  <option value="19:00">19:00 - Dusk</option>
                                  <option value="20:00">20:00 - Peak</option>
                                  <option value="21:00">21:00 - Midnight</option>
                                  <option value="22:00">22:00 - Late</option>
                                </select>
                              </div>
                            </div>

                            {/* Headcount selector */}
                            <div>
                              <label className="block text-[9px] uppercase tracking-widest text-zinc-500 mb-2">Gathered Souls</label>
                              <div className="flex gap-1.5">
                                {[2, 3, 4, 6, 8].map((num) => (
                                  <button
                                    key={num}
                                    type="button"
                                    onClick={() => setInlineGuests(num)}
                                    className={`flex-1 py-1.5 text-xs border transition-all ${
                                      inlineGuests === num
                                        ? 'bg-amber-400 text-zinc-950 border-amber-400 font-bold'
                                        : 'bg-zinc-900 text-zinc-400 border-zinc-850 hover:border-zinc-700'
                                    }`}
                                  >
                                    {num}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <button 
                              type="submit"
                              className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-600 text-zinc-950 font-serif font-bold uppercase tracking-[0.2em] text-[10px] hover:opacity-95 transition-opacity pt-3.5"
                            >
                              Lock Table Pass
                            </button>
                          </form>
                        )}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col justify-center">
                        {inquirySuccess ? (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-8 space-y-3"
                          >
                            <div className="inline-flex items-center justify-center p-2 bg-amber-400/10 rounded-full border border-amber-400/30 text-amber-400">
                              <CheckCircle size={24} />
                            </div>
                            <h4 className="text-xl font-serif text-white">Encounter Request Lodged</h4>
                            <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                              Our private concierge will establish contact via electronic mail within 3 twilight cycles.
                            </p>
                          </motion.div>
                        ) : (
                          <form onSubmit={handleInquirySubmit} className="space-y-4 text-left">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[9px] uppercase tracking-widest text-zinc-500 mb-1">Your Name</label>
                                <input 
                                  type="text" 
                                  required 
                                  value={inquiryName}
                                  onChange={(e) => setInquiryName(e.target.value)}
                                  placeholder="Julian V."
                                  className="w-full bg-zinc-900 border border-zinc-800/80 focus:border-amber-400 px-3 py-2 text-xs focus:outline-none focus:ring-0 text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] uppercase tracking-widest text-zinc-500 mb-1">Electronic Mail</label>
                                <input 
                                  type="email" 
                                  required 
                                  value={inquiryEmail}
                                  onChange={(e) => setInquiryEmail(e.target.value)}
                                  placeholder="julian@weekly.com"
                                  className="w-full bg-zinc-900 border border-zinc-800/80 focus:border-amber-400 px-3 py-2 text-xs focus:outline-none focus:ring-0 text-white"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[9px] uppercase tracking-widest text-zinc-500 mb-1">Encounter Type</label>
                              <select 
                                value={inquiryType}
                                onChange={(e) => setInquiryType(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800/80 focus:border-amber-400 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400/10 text-white"
                              >
                                <option>Private Soiree</option>
                                  <option>Media Conclave</option>
                                  <option>Corporate Dinner</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[9px] uppercase tracking-widest text-zinc-500 mb-1">Detailed Desires</label>
                              <textarea 
                                value={inquiryDetails}
                                onChange={(e) => setInquiryDetails(e.target.value)}
                                placeholder="Allergies, high privacy levels or sommelier guidelines..."
                                rows={3}
                                className="w-full bg-zinc-900 border border-zinc-800/80 focus:border-amber-400 px-3 py-2 text-xs focus:outline-none focus:ring-0 text-white resize-none"
                              />
                            </div>

                            <button 
                              type="submit"
                              className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-600 text-zinc-950 font-serif font-bold uppercase tracking-[0.2em] text-[10px] hover:opacity-95 transition-opacity"
                            >
                              Lodge Enquiry
                            </button>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* Bottom Social Concierge Overlays */}
        <footer className="w-full py-5 border-t border-zinc-900/40 bg-zinc-950/20 backdrop-blur-md select-none text-[10px] pointer-events-auto">
          <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-zinc-500">
            <div className="flex gap-6 sm:gap-8 justify-center uppercase tracking-wider">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                <Instagram size={11} /> Instagram
              </a>
              <a href="https://wa.me/911124509000" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                <MessageSquare size={11} /> WhatsApp Concierge
              </a>
              <button onClick={() => navigateToSection(3)} className="hover:text-amber-400 transition-colors flex items-center gap-1.5 text-left font-semibold">
                <Calendar size={11} /> Ledger Booking
              </button>
            </div>
            <div className="uppercase tracking-[0.3em] text-[#ffd13b]/60 font-semibold font-mono">
              #DineOutTheNight
            </div>
          </div>
        </footer>

      </div>

      {/* 4. RESERVATIONS DRAWER (DISPLAYS PREVIOUS SUCCESSES FROM STORAGE) */}
      <AnimatePresence>
        {showResDrawer && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowResDrawer(false)} />
            <div className="absolute inset-y-0 right-0 max-w-full flex">
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 26, stiffness: 180 }}
                className="w-screen max-w-md bg-zinc-950 border-l border-zinc-900 p-6 md:p-8 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center pb-4 border-b border-zinc-900 mb-6">
                    <h3 className="font-serif italic text-xl text-white font-medium">Your Sanctuary Passes</h3>
                    <button 
                      onClick={() => setShowResDrawer(false)}
                      className="p-1 px-2.5 text-xs text-zinc-500 hover:text-zinc-300 border border-zinc-900 rounded"
                    >
                      Close
                    </button>
                  </div>

                  <div className="space-y-4 overflow-y-auto max-h-[70vh] custom-scrollbar pr-2">
                    {reservations.map((res) => (
                      <div 
                        key={res.id}
                        className="bg-zinc-900 border border-amber-400/20 p-4 rounded text-xs space-y-3 relative group"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] uppercase tracking-widest text-amber-400 font-mono">Locked ID: {res.id}</span>
                            <p className="font-serif text-sm text-white font-bold mt-0.5">{res.name}</p>
                          </div>
                          
                          <button
                            onClick={() => {
                              const updated = reservations.filter((i) => i.id !== res.id);
                              setReservations(updated);
                              localStorage.setItem('dine_out_reservations', JSON.stringify(updated));
                            }}
                            className="bg-transparent border border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-500/20 px-2.5 py-1 uppercase tracking-widest text-[9px] duration-150 rounded"
                          >
                            Release
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-zinc-400">
                          <div>
                            <span className="text-[8px] text-zinc-600 uppercase block">Timing</span>
                            {res.date} @ {res.time}
                          </div>
                          <div>
                            <span className="text-[8px] text-zinc-600 uppercase block">Atmosphere Sphere</span>
                            <span className="text-amber-400 font-serif italic text-[10px] block">{getTableTypeLabel(res.tableType)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-900 space-y-3">
                  <button 
                    onClick={() => { setShowResDrawer(false); navigateToSection(3); }}
                    className="w-full py-3 bg-amber-400 text-zinc-950 font-serif font-bold uppercase tracking-widest text-xs text-center"
                  >
                    Lock Another Table
                  </button>
                  <p className="text-[10px] text-zinc-600 text-center leading-relaxed">
                    Passes are backed up locally in your browser storage.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. MODAL OVERLAYS */}
      <MenuModal 
        isOpen={isMenuModalOpen}
        onClose={() => setIsMenuModalOpen(false)}
      />

      <GalleryModal 
        item={selectedGalleryItem}
        items={GALLERY_ITEMS}
        onClose={() => setSelectedGalleryItem(null)}
        onNavigate={(newItem) => setSelectedGalleryItem(newItem)}
      />

    </div>
  );
}
