import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, Users, Sparkles, CheckCircle, Award, Flame, Wine, ChevronRight } from 'lucide-react';
import { Reservation } from '../types';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddReservation: (res: Reservation) => void;
}

export default function ReservationModal({ isOpen, onClose, onAddReservation }: ReservationModalProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('20:00');
  const [guests, setGuests] = useState(2);
  const [tableType, setTableType] = useState<'standard' | 'tandoor_counter' | 'obsidian_vault' | 'window_seat'>('standard');
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [occasion, setOccasion] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [ticketData, setTicketData] = useState<Reservation | null>(null);

  const tableDetails = {
    standard: {
      name: 'Crystal Salon Stall',
      desc: 'Sumptuous leather booths placed elegantly under our vintage crystal chandeliers.',
      premium: 'Complementary Welcome Sparkle',
      icon: Wine
    },
    tandoor_counter: {
      name: 'Hearth-Fire Counter',
      desc: 'The front-row sensory seat. Engage directly with our tandoor masters over blazing coal layers.',
      premium: 'Chef-Direct Amuse Bouche',
      icon: Flame
    },
    obsidian_vault: {
      name: 'The Obsidian Crypt',
      desc: 'An ultra-private stone alcove framed by soft beeswax candelabras and a personal sommelier.',
      premium: 'Exclusive Vintage Access + High Privacy',
      icon: Award
    },
    window_seat: {
      name: 'Starlit Window Cove',
      desc: 'A floating double-seat overlooking the amber embassy skyline of New Delhi.',
      premium: 'Window Seat Guarantee',
      icon: Sparkles
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!date) {
        setErrorMsg('Please select a magnificent date.');
        return;
      }
      setErrorMsg('');
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      setErrorMsg('Please complete your contact credentials for verification.');
      return;
    }

    const newRes: Reservation = {
      id: 'res-' + Math.random().toString(36).substr(2, 9),
      name,
      email,
      phone,
      date,
      time,
      guests,
      tableType,
      dietaryNotes,
      occasion,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    onAddReservation(newRes);
    setTicketData(newRes);
    setStep(4);
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setPhone('');
    setDate('');
    setTime('20:00');
    setGuests(2);
    setTableType('standard');
    setDietaryNotes('');
    setOccasion('');
    setStep(1);
    setTicketData(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-zinc-900 border border-amber-400/20 text-zinc-100 overflow-hidden"
      >
        {/* Border Accent Lines */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
        <div className="absolute bottom-0 inset-x-0 h-[1px] bg-zinc-800"></div>

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-800">
          <div>
            <span className="text-[10px] tracking-[0.3em] text-amber-400 uppercase font-bold">Encounters & Desires</span>
            <h3 className="text-2xl font-serif text-white italic">Reserve a Sanctuary</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-amber-400 border border-transparent hover:border-zinc-800 transition-all rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Steps Breadcrumbs */}
        {step < 4 && (
          <div className="flex bg-zinc-950/80 px-8 py-3 border-b border-zinc-800/40 text-xs text-zinc-400 gap-4">
            <span className={step === 1 ? 'text-amber-400 font-medium' : ''}>1. Sphere & Timing</span>
            <ChevronRight size={14} className="text-zinc-600" />
            <span className={step === 2 ? 'text-amber-400 font-medium' : ''}>2. Table Atmosphere</span>
            <ChevronRight size={14} className="text-zinc-600" />
            <span className={step === 3 ? 'text-amber-400 font-medium' : ''}>3. Personal Details</span>
          </div>
        )}

        {/* Modal body */}
        <div className="px-8 py-8 min-h-[380px] max-h-[500px] overflow-y-auto custom-scrollbar">
          {errorMsg && (
            <div className="mb-4 text-xs text-red-400 border border-red-500/10 bg-red-500/5 p-3 rounded">
              {errorMsg}
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date selection */}
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Select Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3.5 text-amber-400/60" size={16} />
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-400 px-10 py-3 text-sm focus:outline-none focus:ring-0 text-white"
                      />
                    </div>
                  </div>

                  {/* Hour slots selection */}
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Hour of Twilight</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3.5 text-amber-400/60" size={16} />
                      <select
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-400 px-10 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400/20 text-white"
                      >
                        <option value="19:00">19:00 - Early Dusk</option>
                        <option value="19:30">19:30 - Crimson Shadow</option>
                        <option value="20:00">20:00 - The Peak Dinner</option>
                        <option value="20:30">20:30 - Amber Glow Hour</option>
                        <option value="21:00">21:00 - Golden Midnight</option>
                        <option value="21:30">21:30 - Whispers of Tandoor</option>
                        <option value="22:00">22:00 - Late Solitaire</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Headcount */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-3">Headcount (Guests)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6, 8].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setGuests(num)}
                        className={`flex-1 py-3 text-sm font-semibold border transition-all ${
                          guests === num
                            ? 'bg-amber-400 text-black border-amber-400'
                            : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                        }`}
                      >
                        {num} {num === 1 ? 'Soul' : 'Souls'}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2">
                    *For large conclaves exceeding 8 members, kindly lodge a Direct Media Inquiry.
                  </p>
                </div>

                {/* Next button */}
                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-10 py-3 bg-white text-zinc-950 font-serif uppercase tracking-widest text-xs font-bold hover:bg-amber-400 transition-colors"
                  >
                    Select Atmosphere
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(Object.keys(tableDetails) as Array<keyof typeof tableDetails>).map((key) => {
                    const entry = tableDetails[key];
                    const IconComp = entry.icon;
                    const isSelected = tableType === key;
                    return (
                      <div
                        key={key}
                        onClick={() => setTableType(key)}
                        className={`p-4 border cursor-pointer transition-all flex flex-col justify-between h-44 ${
                          isSelected
                            ? 'border-amber-400 bg-amber-400/5'
                            : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className={`font-serif font-medium text-base ${isSelected ? 'text-amber-400' : 'text-white'}`}>
                              {entry.name}
                            </h4>
                            <IconComp className={isSelected ? 'text-amber-400' : 'text-zinc-600'} size={18} />
                          </div>
                          <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                            {entry.desc}
                          </p>
                        </div>
                        <div className="mt-2 text-[10px] uppercase tracking-wider text-amber-500 bg-zinc-900 border border-zinc-800/80 px-2 py-1 inline-block self-start">
                          ✨ {entry.premium}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 px-6 py-3 uppercase tracking-widest text-xs"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-10 py-3 bg-amber-400 text-black font-serif uppercase tracking-widest text-xs font-bold hover:bg-amber-300 transition-colors"
                  >
                    Provide Credentials
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.form
                key="step3"
                onSubmit={handleSubmit}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Your Noble Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Julian Vandeveer"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-400 px-4 py-3 text-sm focus:outline-none focus:ring-0 text-white placeholder:text-zinc-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Electronic Mail</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. julian@gastronomy.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-400 px-4 py-3 text-sm focus:outline-none focus:ring-0 text-white placeholder:text-zinc-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Secure Hotline (Phone)</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 99999 00000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-400 px-4 py-3 text-sm focus:outline-none focus:ring-0 text-white placeholder:text-zinc-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Aesthetic Occasion</label>
                    <input
                      type="text"
                      placeholder="e.g. Gastronomic Review, Saffron Anniversary"
                      value={occasion}
                      onChange={(e) => setOccasion(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-400 px-4 py-3 text-sm focus:outline-none focus:ring-0 text-white placeholder:text-zinc-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Special Diet / Seclusion Preferences</label>
                  <textarea
                    placeholder="Describe any food allergies, black winter truffle focus, or table seclusion requirements."
                    value={dietaryNotes}
                    onChange={(e) => setDietaryNotes(e.target.value)}
                    rows={2}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-400 px-4 py-3 text-sm focus:outline-none focus:ring-0 text-white placeholder:text-zinc-600 resize-none"
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="border border-zinc-800 text-zinc-400 hover:text-white px-6 py-3 uppercase tracking-widest text-xs"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-10 py-3 bg-gradient-to-r from-amber-400 to-yellow-600 text-black font-serif uppercase tracking-[0.2em] text-xs font-bold hover:opacity-90 transition-all shadow-[0_0_20px_rgba(242,202,80,0.2)]"
                  >
                    Confirm Reservation
                  </button>
                </div>
              </motion.form>
            )}

            {step === 4 && ticketData && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-6 space-y-6"
              >
                <div className="inline-flex items-center justify-center p-3 bg-amber-400/10 rounded-full border border-amber-400/40 text-amber-400 mb-2">
                  <CheckCircle size={36} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-3xl font-serif italic text-white font-medium">Sacred Concord Granted</h4>
                  <p className="text-sm text-zinc-400 text-gold-gradient font-bold uppercase tracking-widest">
                    Your Evening Sanctuary is Locked
                  </p>
                </div>

                {/* Elegant Ticket card */}
                <div className="mx-auto max-w-md bg-zinc-950 border border-amber-400/40 p-6 text-left relative overflow-hidden shadow-2xl">
                  {/* Watermark */}
                  <div className="absolute right-[-40px] bottom-[-40px] text-[10rem] text-zinc-900/40 font-serif pointer-events-none select-none">
                    D-O
                  </div>

                  <div className="flex justify-between items-start border-b border-zinc-800 pb-4 mb-4">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-amber-400">Golden Slate Pass</span>
                      <h5 className="font-serif text-lg text-white font-semibold">Dine-Out Encounter</h5>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-zinc-500">ID: {ticketData.id}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-zinc-500">Aesthetic Host</span>
                      <p className="text-white font-medium">{ticketData.name}</p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-zinc-500">Sanctuary Type</span>
                      <p className="text-amber-400 font-serif italic">{tableDetails[ticketData.tableType].name}</p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-zinc-500">Celestial Timing</span>
                      <p className="text-white font-medium">{ticketData.date} @ {ticketData.time}</p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-zinc-500">Gathered Souls</span>
                      <p className="text-white font-medium">{ticketData.guests} {ticketData.guests === 1 ? 'Person' : 'People'}</p>
                    </div>
                    {ticketData.occasion && (
                      <div className="col-span-2">
                        <span className="text-[9px] uppercase tracking-widest text-zinc-500">Custom Occasion</span>
                        <p className="text-white font-light">{ticketData.occasion}</p>
                      </div>
                    )}
                  </div>

                  {/* QR Core Mock representation */}
                  <div className="flex items-center justify-between border-t border-zinc-800/80 pt-4 mt-4 text-[10px] text-zinc-500 gap-4">
                    <p className="leading-relaxed">
                      Present this card at Level 4, The Obsidian Plaza. Your table stays active for 15 minutes post twilight schedule.
                    </p>
                    {/* Fake golden QR Code */}
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-yellow-600 flex flex-wrap p-1.5 shrink-0 rounded">
                      <div className="w-full h-full border border-black/20 flex flex-col justify-between">
                        <div className="flex justify-between">
                          <div className="w-3.5 h-3.5 bg-black"></div>
                          <div className="w-3.5 h-3.5 bg-black"></div>
                        </div>
                        <div className="flex justify-between">
                          <div className="w-3.5 h-3.5 bg-black"></div>
                          <div className="w-2.5 h-2.5 bg-black self-end"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="btn-gold-foil text-zinc-950 font-serif font-bold uppercase tracking-widest text-xs px-10 py-3"
                  >
                    Exquisite, Thank You
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
