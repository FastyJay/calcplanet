import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Shuffle, Flame, Zap, Shield, Trophy, Gauge } from 'lucide-react';
import { sounds } from '../utils/sound';

interface HeroBannerProps {
  totalGames: number;
  onRandomGame: () => void;
  onSelectCategory: (cat: any) => void;
  onOpenSettings?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  totalGames,
  onRandomGame,
  onSelectCategory,
  onOpenSettings,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-indigo-500/20 bg-gradient-to-b from-[#13182e] via-[#0e1322] to-[#090b10] p-4 sm:p-8 lg:p-10 mb-6 sm:mb-8 shadow-2xl shadow-indigo-950/40">
      
      {/* Background Decorative Ambient Glows */}
      <div className="absolute -top-24 -left-20 w-72 sm:w-96 h-72 sm:h-96 bg-indigo-600/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-20 w-72 sm:w-96 h-72 sm:h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-40 bg-cyan-500/10 blur-3xl pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
        
        {/* Left Column: Heading & Badges */}
        <div className="text-center lg:text-left space-y-3 sm:space-y-4 max-w-2xl w-full">
          
          {/* Top Pill */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 text-[11px] sm:text-xs font-semibold backdrop-blur-md flex-wrap justify-center lg:justify-start">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span>CalcPlanet Learning Platform</span>
            <span className="text-slate-400">•</span>
            <span className="text-cyan-300 font-bold">{totalGames} Assignments Loaded</span>
          </div>

          {/* Eye-Candy Animated Rainbow Gradient Title */}
          <h1 className="font-fredoka text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 via-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent animate-cosmic-gradient">
              CalcPlanet
            </span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-xl font-normal leading-relaxed mx-auto lg:mx-0">
           Explore a collection of high-quality assignments and interactive studies. Scroll down to start your educational journey.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2.5 sm:gap-3 pt-1 w-full sm:w-auto">
            
            {/* Primary Random Game Gradient CTA */}
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(99, 102, 241, 0.45)' }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                sounds.playLaunch();
                onRandomGame();
              }}
              className="w-full sm:w-auto px-5 sm:px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 border border-white/15 cursor-pointer"
            >
              <Shuffle className="w-4 h-4 text-white animate-spin-slow" />
              <span>Surprise Me (Random Assignment)</span>
            </motion.button>

            {/* Trending Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                sounds.playClick();
                onSelectCategory('popular');
              }}
              className="w-full sm:w-auto px-4 sm:px-5 py-3 rounded-xl font-bold text-xs sm:text-sm text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Hot & Trending</span>
            </motion.button>

          </div>
        </div>

        {/* Right Column: Mini Feature Grid Badges */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full lg:w-auto shrink-0">
          
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#12172a]/80 border border-indigo-500/15 backdrop-blur-md flex flex-col gap-0.5 sm:gap-1">
            <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-[11px] sm:text-xs">
              <Zap className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
              <span>Instant Launch</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400">Zero install or signup needed.</p>
          </div>

          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#12172a]/80 border border-purple-500/15 backdrop-blur-md flex flex-col gap-0.5 sm:gap-1">
            <div className="flex items-center gap-1.5 text-purple-400 font-bold text-[11px] sm:text-xs">
              <Shield className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Panic Cloak</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400">Instant stealth disguise tabs.</p>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              if (onOpenSettings) onOpenSettings();
            }}
            className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#12172a]/80 hover:bg-[#161c33] border border-emerald-500/25 hover:border-emerald-400/50 backdrop-blur-md flex flex-col gap-0.5 sm:gap-1 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px] sm:text-xs">
              <Gauge className="w-3.5 h-3.5 text-emerald-400 shrink-0 group-hover:rotate-12 transition-transform" />
              <span>Lagging?</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-300 group-hover:text-white transition-colors">
              Go turn on Low-End Mode in the settings.
            </p>
          </button>

          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#12172a]/80 border border-emerald-500/15 backdrop-blur-md flex flex-col gap-0.5 sm:gap-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px] sm:text-xs">
              <Trophy className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Favorites</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400">Pin your daily top assignments.</p>
          </div>

        </div>

      </div>
    </div>
  );
};
