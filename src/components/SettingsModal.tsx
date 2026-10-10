import React, { useState } from 'react';
import { 
  X, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  Sparkles, 
  Palette, 
  Layers, 
  Trash2, 
  ExternalLink,
  Check,
  Zap,
  Globe,
  Gauge
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CLOAK_PRESETS } from '../data/games';
import { ThemeMode } from '../types';
import { sounds } from '../utils/sound';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  performanceMode: boolean;
  onTogglePerformanceMode: () => void;
  onLaunchPanic: (presetId?: string) => void;
  onResetFavorites: () => void;
  favoritesCount: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  soundEnabled,
  onToggleSound,
  performanceMode,
  onTogglePerformanceMode,
  onLaunchPanic,
  onResetFavorites,
  favoritesCount,
}) => {
  const [selectedCloak, setSelectedCloak] = useState('classroom');
  const [resetConfirm, setResetConfirm] = useState(false);

  if (!isOpen) return null;

  const themes: { id: ThemeMode; name: string; desc: string; colors: string[] }[] = [
    {
      id: 'cosmic-dark',
      name: 'Cosmic Dark',
      desc: 'Obsidian blacks with vibrant indigo and purple nebulas',
      colors: ['#090b10', '#4f46e5', '#a855f7']
    },
    {
      id: 'cyber-neon',
      name: 'Cyber Neon',
      desc: 'Electric blues, magenta highlights, and neon glow',
      colors: ['#060814', '#06b6d4', '#ec4899']
    },
    {
      id: 'midnight-blue',
      name: 'Midnight Sapphire',
      desc: 'Deep oceanic navy with ice blue illumination',
      colors: ['#0b1329', '#2563eb', '#38bdf8']
    },
    {
      id: 'sunset-amber',
      name: 'Sunset Flare',
      desc: 'Warm dark tones with golden amber and coral accents',
      colors: ['#140c0b', '#f97316', '#f59e0b']
    },
    {
      id: 'clean-light',
      name: 'Clean Light',
      desc: 'Crisp bright palette with high-contrast text',
      colors: ['#f8fafc', '#3b82f6', '#6366f1']
    }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-[#0f1322] border border-indigo-500/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          
          {/* Modal Header */}
          <div className="relative px-6 py-5 bg-gradient-to-r from-indigo-900/60 via-purple-900/60 to-[#0f1322] border-b border-indigo-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-indigo-600 p-[2px] shadow-lg shadow-cyan-500/20">
                <div className="w-full h-full bg-[#0a0d17] rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div>
                <h2 className="font-fredoka text-xl font-bold text-white">CalcPlanet Settings</h2>
                <p className="text-xs text-slate-300">Customize themes, cloaks, audio and performance</p>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Theme Selector */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                <Palette className="w-4 h-4 text-indigo-400" />
                <span>Visual Theme</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {themes.map((t) => {
                  const isSelected = currentTheme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        sounds.playClick();
                        onSelectTheme(t.id);
                      }}
                      className={`p-3.5 rounded-2xl border text-left flex items-start justify-between gap-3 transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-indigo-400 bg-indigo-600/25 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400' 
                          : 'bg-[#141829]/90 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700 hover:bg-[#1a1f36]'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-200">{t.name}</span>
                          {isSelected && (
                            <span className="px-1.5 py-0.2 rounded-md bg-indigo-500 text-[10px] font-extrabold text-white uppercase tracking-wider">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{t.desc}</p>
                      </div>

                      {/* Theme preview swatch dots with gradient ring */}
                      <div className="flex items-center gap-1.5 shrink-0 mt-0.5 p-1 rounded-lg bg-black/40 border border-white/10">
                        {t.colors.map((c, i) => (
                          <span 
                            key={i} 
                            className="w-3.5 h-3.5 rounded-full border border-white/30 shadow-sm"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Audio Effects Toggle */}
            <div className="p-4 rounded-2xl bg-[#141829] border border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                  <span>Synthesized UI Sound Effects</span>
                </div>
                <p className="text-[11px] text-slate-400">Pleasant micro-tones for clicks, hovers, and launches.</p>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  onToggleSound();
                  if (!soundEnabled) sounds.playClick();
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  soundEnabled 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25' 
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {soundEnabled ? 'Enabled' : 'Muted'}
              </motion.button>
            </div>

            {/* Low-End Device Mode (Performance Boost) */}
            <div className="p-4 rounded-2xl bg-[#141829] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1 pr-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                    <Gauge className="w-4 h-4 text-emerald-400" />
                    <span>Low-End Device Mode</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Performance Boost
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    When you click on any game, automatically unloads background game cards, heavy thumbnails, particle canvas, and GPU blurs so games run smoothly on Chromebooks and slower computers.
                  </p>
                </div>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    sounds.playClick();
                    onTogglePerformanceMode();
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                    performanceMode
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {performanceMode ? 'Enabled' : 'Disabled'}
                </motion.button>
              </div>

              {performanceMode && (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/25 text-[11px] text-emerald-300/90 flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Active: Clicking a game will unload the entire background catalog to free RAM and maximize game FPS.</span>
                </div>
              )}
            </div>

            {/* Panic Tab Cloak System */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-red-950/20 via-[#141829] to-[#141829] border border-red-500/20 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-300">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    <span>Panic Cloak Tab Generator</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Launches CalcPlanet masked under an educational tab disguise with about:blank protection.
                  </p>
                </div>
              </div>

              {/* Cloak Presets */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CLOAK_PRESETS.map((p) => {
                  const isCur = selectedCloak === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        sounds.playClick();
                        setSelectedCloak(p.id);
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                        isCur 
                          ? 'bg-red-500/20 border-red-500/60 text-white' 
                          : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <img src={p.favicon} alt="" className="w-4 h-4 shrink-0 rounded-sm" />
                      <span className="truncate">{p.name}</span>
                    </button>
                  );
                })}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  sounds.playLaunch();
                  onLaunchPanic(selectedCloak);
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Launch Disguised Tab Now</span>
              </motion.button>
            </div>

            {/* Classic Portal & External Links */}
            <div className="p-4 rounded-2xl bg-[#141829] border border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Globe className="w-4 h-4 text-purple-400" />
                  <span>Math Universe Classic</span>
                </div>
                <p className="text-[11px] text-slate-400">Explore the nostalgic legacy edition of CalcPlanet.</p>
              </div>

              <a
                href="https://234517.neocities.org/math"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <span>Visit</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Clear Favorites Storage */}
            <div className="p-4 rounded-2xl bg-[#141829] border border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Trash2 className="w-4 h-4 text-slate-400" />
                  <span>Pinned Favorites ({favoritesCount})</span>
                </div>
                <p className="text-[11px] text-slate-400">Reset saved bookmarked games on this browser.</p>
              </div>

              {resetConfirm ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      sounds.playClick();
                      onResetFavorites();
                      setResetConfirm(false);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-500"
                  >
                    Confirm Clear
                  </button>
                  <button
                    onClick={() => setResetConfirm(false)}
                    className="px-2 py-1.5 rounded-xl bg-slate-800 text-slate-400 text-xs hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setResetConfirm(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-red-500/20 hover:text-red-300 border border-slate-700 text-xs font-semibold text-slate-400 transition-all"
                >
                  Clear
                </button>
              )}
            </div>

          </div>

          {/* Modal Footer */}
          <div className="px-6 py-3.5 bg-[#0a0d17] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>CalcPlanet 2.0 • Ultra Edition</span>
            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all"
            >
              Done
            </button>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
