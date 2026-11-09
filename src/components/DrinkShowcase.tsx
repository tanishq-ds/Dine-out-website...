import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wine, Info, Compass, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { DrinkItem } from '../types';
import { DRINK_ITEMS } from '../data';

export default function DrinkShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const activeDrink = DRINK_ITEMS[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + DRINK_ITEMS.length) % DRINK_ITEMS.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % DRINK_ITEMS.length);
  };

  // Suggesting dish companion
  const signaturePairs: Record<string, string> = {
    d1: 'Smoked Beetroot Galouti (Hearth flavor pairing)',
    d2: 'Gold Leaf Chocolate Mousse (Espresso bitterness contrast)',
    d3: 'Truffle Saffron Paneer (Botanical saffron continuation)'
  };

  return (
    <div className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row gap-8 items-center">
      {/* Absolute decorative gradient */}
      <div className="absolute right-0 top-0 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Interaction visual left */}
      <div className="flex-1 space-y-6 w-full">
        <div className="flex justify-between items-center">
          <span className="text-[10px] uppercase tracking-[0.3em] text-amber-500 font-extrabold flex items-center gap-1.5 ">
            <Wine size={12} /> Liquid Midnight Experience
          </span>
          {/* Simple slide selector indicator */}
          <div className="flex gap-1.5">
            {DRINK_ITEMS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  currentIndex === idx ? 'w-4 bg-amber-400' : 'w-1.5 bg-zinc-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Dynamic header and slide details */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDrink.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-4"
          >
            <h3 className="text-3xl font-serif text-white italic font-normal">
              {activeDrink.name}
            </h3>
            <p className="text-zinc-400 text-sm font-light leading-relaxed">
              {activeDrink.description}
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {activeDrink.notes.map((note) => (
                <span
                  key={note}
                  className="text-[9px] uppercase tracking-wider font-mono bg-zinc-900/80 border border-zinc-800/80 px-2.5 py-1 rounded text-zinc-400"
                >
                  {note}
                </span>
              ))}
            </div>

            {/* Companion Pairing Box */}
            <div className="bg-amber-400/5 border border-amber-400/20 p-4 rounded-lg flex items-center gap-3">
              <Sparkles size={16} className="text-amber-500 shrink-0" />
              <div className="text-xs">
                <span className="text-amber-400 uppercase tracking-wider text-[9px] block mb-0.5">Recommended Plate Match</span>
                <span className="text-white font-medium italic">{signaturePairs[activeDrink.id]}</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handlePrev}
            className="p-2 border border-zinc-800 hover:border-zinc-700 hover:text-amber-400 text-zinc-400 transition-all rounded"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={handleNext}
            className="p-2 border border-zinc-800 hover:border-zinc-700 hover:text-amber-400 text-zinc-400 transition-all rounded"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Interactive flavor profile right */}
      <div className="w-full md:w-80 bg-zinc-950 p-6 border border-zinc-900 flex flex-col gap-5 shrink-0 rounded-lg">
        <span className="text-[10px] uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
          <Compass size={11} /> Molecular Dimensions
        </span>

        {/* Multi-sensory bars */}
        <div className="space-y-4 text-xs font-light">
          {/* Sweet profile */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-zinc-400 font-serif">Saccharine (Sweet)</span>
              <span className="text-amber-400 font-mono font-bold">{activeDrink.sweet}%</span>
            </div>
            <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${activeDrink.sweet}%` }}
                transition={{ duration: 0.6 }}
                className="h-full bg-gradient-to-r from-amber-400/60 to-amber-400"
              />
            </div>
          </div>

          {/* Bitter profile */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-zinc-400 font-serif">Alkaloid (Bitter)</span>
              <span className="text-amber-400 font-mono font-bold">{activeDrink.bitter}%</span>
            </div>
            <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${activeDrink.bitter}%` }}
                transition={{ duration: 0.6 }}
                className="h-full bg-gradient-to-r from-amber-400/60 to-amber-400"
              />
            </div>
          </div>

          {/* Woody profile */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-zinc-400 font-serif">Ligneous (Woody)</span>
              <span className="text-amber-400 font-mono font-bold">{activeDrink.woody}%</span>
            </div>
            <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${activeDrink.woody}%` }}
                transition={{ duration: 0.6 }}
                className="h-full bg-gradient-to-r from-amber-400/60 to-amber-400"
              />
            </div>
          </div>

          {/* Smoky profile */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-zinc-400 font-serif">Pyrogenic (Smoky)</span>
              <span className="text-amber-400 font-mono font-bold">{activeDrink.smoky}%</span>
            </div>
            <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${activeDrink.smoky}%` }}
                transition={{ duration: 0.6 }}
                className="h-full bg-gradient-to-r from-amber-400/60 to-amber-400"
              />
            </div>
          </div>
        </div>

        <p className="text-[10px] text-zinc-600 italic leading-relaxed pt-2 border-t border-zinc-900">
          *Gauged dynamically via high-performance charcoal infusion and wood cask fermentation.
        </p>
      </div>
    </div>
  );
}
