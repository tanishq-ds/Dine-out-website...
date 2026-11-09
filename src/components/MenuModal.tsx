import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Filter, Sparkles, Check, DollarSign, Plus, RotateCcw } from 'lucide-react';
import { MenuItem } from '../types';
import { MENU_ITEMS } from '../data';

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MenuModal({ isOpen, onClose }: MenuModalProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [vegOnly, setVegOnly] = useState<boolean>(false);
  
  // Custom course state
  const [courseItems, setCourseItems] = useState<MenuItem[]>([]);

  // Filtering logic
  const filteredItems = MENU_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVeg = !vegOnly || item.isVeg;
    return matchesCategory && matchesSearch && matchesVeg;
  });

  const addToCourse = (item: MenuItem) => {
    if (courseItems.find((i) => i.id === item.id)) {
      setCourseItems(courseItems.filter((i) => i.id !== item.id));
    } else {
      setCourseItems([...courseItems, item]);
    }
  };

  const totalPrice = courseItems.reduce((acc, item) => acc + item.price, 0);

  const categories = [
    { value: 'all', label: 'Complete Vault' },
    { value: 'tandoor', label: 'The Earthly Tandoor' },
    { value: 'feast', label: 'The Midnight Feast' },
    { value: 'dessert', label: 'Desserts & Sweets' },
    { value: 'sides', label: 'Accents & Sides' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="relative w-full max-w-4xl h-[90vh] bg-zinc-900 border border-amber-400/20 text-zinc-100 flex flex-col overflow-hidden"
      >
        {/* Top styling line */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-800 shrink-0">
          <div>
            <span className="text-[10px] tracking-[0.3em] text-amber-500 uppercase font-bold">Gastronomic Archive</span>
            <h3 className="text-3xl font-serif text-white italic">The Evening Menu</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-amber-400 border border-transparent hover:border-zinc-800 transition-all rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters and Search Bar bar */}
        <div className="px-8 py-4 bg-zinc-950/60 border-b border-zinc-800/60 flex flex-col md:flex-row gap-4 justify-between items-center shrink-0">
          {/* Categories slider */}
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto custom-scrollbar pb-2 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-4 py-2 text-xs uppercase tracking-wider whitespace-nowrap border transition-all ${
                  activeCategory === cat.value
                    ? 'border-amber-400 bg-amber-400/10 text-amber-400 font-bold'
                    : 'border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex gap-3 w-full md:w-auto shrink-0">
            {/* Search Input */}
            <div className="relative w-full md:w-60">
              <Search className="absolute left-3 top-2.5 text-zinc-500" size={15} />
              <input
                type="text"
                placeholder="Search flavors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-400 text-xs text-white px-9 py-2.5 focus:outline-none focus:ring-0"
              />
            </div>

            {/* Veg toggle */}
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`px-3 py-2 border text-xs uppercase tracking-widest flex items-center gap-1.5 transition-all w-32 justify-center ${
                vegOnly
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
                  : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${vegOnly ? 'bg-emerald-400' : 'bg-zinc-600'}`}></div>
              {vegOnly ? 'Green Only' : 'All Plates'}
            </button>
          </div>
        </div>

        {/* Content Body: Left is menu list, Right is tasting experience builder */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Menu Selection list */}
          <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar space-y-8">
            {filteredItems.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-zinc-500 text-sm font-light">No corresponding archives discovered.</p>
                <button
                  type="button"
                  onClick={() => { setActiveCategory('all'); setSearchQuery(''); setVegOnly(false); }}
                  className="mt-4 px-6 py-2 border border-amber-400/30 text-amber-400 text-xs uppercase tracking-widest"
                >
                  Reset Archives
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredItems.map((item) => {
                  const isInTasting = courseItems.some((i) => i.id === item.id);
                  return (
                    <motion.div
                      layout
                      key={item.id}
                      onClick={() => addToCourse(item)}
                      className={`group p-5 border cursor-pointer transition-all relative overflow-hidden ${
                        isInTasting
                          ? 'border-amber-400/60 bg-amber-400/[0.02]'
                          : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-700 hover:bg-zinc-950/80'
                      }`}
                    >
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="flex items-center gap-2">
                          <h4 className="font-serif text-lg text-white group-hover:text-amber-400 transition-colors">
                            {item.name}
                          </h4>
                          {item.isVeg && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Vegetarian item" />
                          )}
                          {item.isChefSpecial && (
                            <Sparkles size={11} className="text-amber-400 shrink-0" title="Signature creation" />
                          )}
                        </span>
                        <span className="font-serif text-amber-400">${item.price}</span>
                      </div>
                      <p className="text-zinc-400 text-xs font-light leading-relaxed mb-3 line-clamp-2">
                        {item.description}
                      </p>

                      <div className="flex items-center justify-between text-[10px] uppercase tracking-widest">
                        <span className="text-zinc-600 font-mono">#{item.category}</span>
                        <span className={`flex items-center gap-1 transition-colors ${
                          isInTasting ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
                        }`}>
                          {isInTasting ? (
                            <>
                              <Check size={10} /> Saved to Tasting
                            </>
                          ) : (
                            <>
                              <Plus size={10} /> Add to Tasting
                            </>
                          )}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Tasting Builder Column */}
          <div className="w-full md:w-80 bg-zinc-950 border-t md:border-t-0 md:border-l border-zinc-800 flex flex-col overflow-hidden">
            <div className="p-6 bg-zinc-950/80 border-b border-zinc-800/80 shrink-0">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-serif uppercase tracking-widest text-amber-500 font-bold">Personal Encounter</span>
                {courseItems.length > 0 && (
                  <button
                    onClick={() => setCourseItems([])}
                    className="text-zinc-500 hover:text-zinc-300 text-[10px] uppercase tracking-widest flex items-center gap-1"
                  >
                    <RotateCcw size={10} /> Clear
                  </button>
                )}
              </div>
              <h5 className="text-sm font-serif italic text-white font-medium">Tasting Course Builder</h5>
              <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
                Select your favorite dishes to arrange a curated tasting sequence for your table.
              </p>
            </div>

            {/* Selected items list */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-3">
              {courseItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-10">
                  <FlameIcon />
                  <p className="text-xs text-zinc-400 font-light mt-2 max-w-[200px]">
                    Lodge dishes on the left to structure your fine dining itinerary.
                  </p>
                </div>
              ) : (
                <AnimatePresence>
                  {courseItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex justify-between items-center p-3 bg-zinc-900 border border-zinc-800 rounded text-xs group"
                    >
                      <div className="truncate pr-2">
                        <p className="text-zinc-200 font-medium truncate">{item.name}</p>
                        <p className="text-[10px] text-zinc-500 capitalize">{item.category}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-amber-400">${item.price}</span>
                        <button
                          onClick={() => setCourseItems(courseItems.filter((i) => i.id !== item.id))}
                          className="p-1 text-zinc-500 hover:text-red-400 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Total course projection */}
            <div className="p-6 bg-zinc-950 border-t border-zinc-800 shrink-0 space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-zinc-400 uppercase tracking-widest">Tasting Estimation</span>
                <span className="text-2xl font-serif text-amber-400 font-semibold">${totalPrice}</span>
              </div>

              <div className="text-[10px] text-zinc-500 leading-relaxed">
                *Prices exclude dynamic service levies. Curated sequence can be customized directly on the table with your Butler.
              </div>

              {courseItems.length > 0 ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 btn-gold-foil text-zinc-950 font-serif font-bold uppercase tracking-widest text-xs text-center block"
                >
                  Save to Reservation
                </button>
              ) : (
                <div className="w-full py-3 border border-zinc-800 text-zinc-600 text-center uppercase tracking-widest text-xs select-none">
                  Build Sequence
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function FlameIcon() {
  return (
    <svg className="w-8 h-8 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.467 5.99 5.99 0 0 0-1.925 3.546 5.974 5.974 0 0 1-2.133-1A3.75 3.75 0 0 0 12 18Z" />
    </svg>
  );
}
