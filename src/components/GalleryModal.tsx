import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Camera, Info } from 'lucide-react';
import { GalleryItem } from '../types';
import ProgressiveImage from './ProgressiveImage';

interface GalleryModalProps {
  item: GalleryItem | null;
  items: GalleryItem[];
  onClose: () => void;
  onNavigate: (newItem: GalleryItem) => void;
}

export default function GalleryModal({ item, items, onClose, onNavigate }: GalleryModalProps) {
  if (!item) return null;

  const currentIndex = items.findIndex((i) => i.id === item.id);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    const prevIndex = (currentIndex - 1 + items.length) % items.length;
    onNavigate(items[prevIndex]);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIndex = (currentIndex + 1) % items.length;
    onNavigate(items[nextIndex]);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/98 p-4 md:p-8"
      onClick={onClose}
    >
      {/* Background close indicator */}
      <div className="absolute top-6 left-6 text-zinc-500 uppercase tracking-widest text-[10px] hidden md:block">
        Click anywhere to close the frame
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-50 p-2 border border-zinc-800 bg-zinc-950/80 text-zinc-400 hover:text-white transition-all rounded-full hover:border-zinc-700"
      >
        <X size={20} />
      </button>

      {/* Desktop arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-6 z-10 p-4 border border-zinc-900 bg-zinc-950/40 text-zinc-400 hover:text-amber-400 hover:bg-zinc-950/80 transition-all rounded-full shrink-0"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-6 z-10 p-4 border border-zinc-900 bg-zinc-950/40 text-zinc-400 hover:text-amber-400 hover:bg-zinc-950/80 transition-all rounded-full shrink-0"
      >
        <ChevronRight size={24} />
      </button>

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="relative max-w-5xl w-full flex flex-col md:flex-row bg-zinc-950 border border-zinc-800 max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side: Dynamic Image */}
        <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden select-none min-h-[300px] md:min-h-0">
          <ProgressiveImage
            referrerPolicy="no-referrer"
            src={item.url}
            alt={item.caption}
            className="max-h-[60vh] md:max-h-[80vh] w-full object-contain"
          />
          {/* Visual gradient at top/bottom of image for overlay */}
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-zinc-950 to-transparent"></div>
        </div>

        {/* Right Side: Narrative Details */}
        <div className="w-full md:w-80 p-8 flex flex-col justify-between shrink-0 bg-zinc-950 border-t md:border-t-0 md:border-l border-zinc-800">
          <div className="space-y-6">
            <div>
              <span className="text-[9px] uppercase tracking-widest text-amber-500 font-bold bg-amber-400/5 px-2 py-1 rounded inline-block">
                #{item.category}
              </span>
              <h4 className="text-2xl font-serif italic text-white mt-3 font-semibold">{item.caption}</h4>
            </div>

            <div className="h-px bg-zinc-800 w-12"></div>

            <div className="space-y-3">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium flex items-center gap-1.5">
                <Info size={11} /> Inside the Narrative
              </span>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>

          {/* Camera craft metadata details (adds visual premium quality) */}
          <div className="mt-8 pt-6 border-t border-zinc-900/60 text-[9px] text-zinc-500 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-[10px] text-zinc-400 mb-1">
              <Camera size={11} /> Optical Signature
            </div>
            <div className="flex justify-between font-mono">
              <span>Lighting:</span>
              <span className="text-zinc-400">Cinematic side-ambient</span>
            </div>
            <div className="flex justify-between font-mono">
              <span>Focus:</span>
              <span className="text-zinc-400">Tandoor Amber Shallow Depth</span>
            </div>
            <div className="flex justify-between font-mono">
              <span>Refraction:</span>
              <span className="text-zinc-400">Beeswax Flare</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
