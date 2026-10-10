import React, { useRef, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  Settings, 
  ShieldAlert, 
  Star, 
  Menu, 
  X,
  Shuffle,
  Volume2,
  VolumeX,
  Compass
} from 'lucide-react';
import { motion } from 'motion/react';
import { sounds } from '../utils/sound';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenSettings: () => void;
  onOpenPanic: () => void;
  onRandomGame: () => void;
  onToggleSidebar: () => void;
  favoritesCount: number;
  showFavoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  totalGames: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenSettings,
  onOpenPanic,
  onRandomGame,
  onToggleSidebar,
  favoritesCount,
  showFavoritesOnly,
  onToggleFavoritesOnly,
  soundEnabled,
  onToggleSound,
  totalGames,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener ('/' or 'Cmd/Ctrl + K')
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b backdrop-blur-xl transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Mobile Menu Toggle & Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              sounds.playClick();
              onToggleSidebar();
            }}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white transition-all border border-slate-700/50 lg:hidden cursor-pointer"
            title="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </motion.button>

          <motion.div 
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group"
            onClick={() => {
              sounds.playClick();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-[2px] shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow shrink-0">
              <div className="w-full h-full bg-[#0d111c] rounded-[14px] flex items-center justify-center overflow-hidden">
                <img
                  src="https://234517.neocities.org/calcplanet.jpg"
                  alt="CalcPlanet Logo"
                  className="w-full h-full object-cover rounded-[14px] group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-fredoka text-xl sm:text-2xl tracking-wide bg-gradient-to-r from-cyan-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">
                  CalcPlanet
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-400 -mt-1 hidden sm:block">
                {totalGames}+ Assignments Available
              </span>
            </div>
          </motion.div>
        </div>

        {/* Center: Search Bar with Eye-Candy Glow (Desktop) */}
        <div className="flex-1 max-w-lg mx-2 hidden md:block">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-focus-within:opacity-60 transition duration-300" />
            <div className="relative flex items-center bg-[#101423]/90 border border-slate-700/60 rounded-xl px-3.5 py-2 group-focus-within:border-indigo-500/80 transition-all shadow-inner">
              <Search className="w-4 h-4 text-indigo-400 mr-2.5 shrink-0 group-focus-within:text-cyan-400 transition-colors" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search assignments, topics, tags... (Press '/' to focus)"
                className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-400/70 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {!searchQuery && (
                <kbd className="hidden lg:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-bold text-slate-400 bg-slate-800/80 rounded border border-slate-700">
                  /
                </kbd>
              )}
            </div>
          </div>
        </div>

        {/* Right: Gradient Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Favorites Filter Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              sounds.playClick();
              onToggleFavoritesOnly();
            }}
            className={`relative flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              showFavoritesOnly 
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/25' 
                : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/50'
            }`}
            title="Toggle Saved Assignments Filter"
          >
            <Star className={`w-4 h-4 sm:w-3.5 sm:h-3.5 ${showFavoritesOnly ? 'fill-slate-950 text-slate-950' : 'text-amber-400'}`} />
            <span className="hidden sm:inline">Favorites</span>
            {favoritesCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                showFavoritesOnly ? 'bg-slate-950 text-amber-300' : 'bg-amber-400/20 text-amber-300'
              }`}>
                {favoritesCount}
              </span>
            )}
          </motion.button>

          {/* Random / Surprise Game Gradient Button */}
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              sounds.playClick();
              onRandomGame();
            }}
            className="flex items-center gap-1.5 p-2 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 shadow-md shadow-indigo-600/30 hover:brightness-110 transition-all border border-white/10 cursor-pointer"
            title="Pick a Random Assignment"
          >
            <Shuffle className="w-4 h-4 sm:w-3.5 sm:h-3.5 animate-spin-slow" />
            <span className="hidden sm:inline">Surprise Me</span>
          </motion.button>

          {/* Panic Cloak Emergency Button */}
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(239, 68, 68, 0.35)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              sounds.playClick();
              onOpenPanic();
            }}
            className="flex items-center gap-1 p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-500 shadow-md shadow-red-600/20 hover:brightness-110 transition-all border border-red-400/20 cursor-pointer"
            title="Panic Cloak Mode (Instant Tab Disguise)"
          >
            <ShieldAlert className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            <span className="hidden md:inline">Panic</span>
          </motion.button>

          {/* Sound Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              onToggleSound();
            }}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white transition-all border border-slate-700/50 hidden sm:flex items-center justify-center cursor-pointer"
            title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </motion.button>

          {/* Settings Button */}
          <motion.button
            whileHover={{ scale: 1.08, rotate: 45 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              sounds.playClick();
              onOpenSettings();
            }}
            className="p-2 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 text-slate-200 hover:text-white transition-all border border-slate-600/50 shadow-sm cursor-pointer"
            title="Open Settings"
          >
            <Settings className="w-4 h-4" />
          </motion.button>

        </div>
      </div>

      {/* Mobile Search input row */}
      <div className="px-3 pb-2.5 md:hidden">
        <div className="relative flex items-center bg-[#101423] border border-slate-700/60 rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-indigo-400 mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search all 70+ assignments..."
            className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-400 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="p-1 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
