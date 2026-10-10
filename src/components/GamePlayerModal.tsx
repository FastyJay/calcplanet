import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Maximize2, 
  ExternalLink, 
  RotateCcw, 
  Star, 
  ShieldAlert, 
  Play, 
  Sparkles,
  Gamepad2,
  Tv,
  HelpCircle,
  Share2,
  Check,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GameItem } from '../types';
import { sounds } from '../utils/sound';

interface GamePlayerModalProps {
  game: GameItem | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  onOpenPanic: () => void;
  performanceMode?: boolean;
}

export const GamePlayerModal: React.FC<GamePlayerModalProps> = ({
  game,
  onClose,
  isFavorite,
  onToggleFavorite,
  onOpenPanic,
  performanceMode = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset play state when game changes
  useEffect(() => {
    if (game) {
      setIsPlaying(false);
      setIframeKey(prev => prev + 1);
    }
  }, [game]);

  // Handle ESC key to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && game) {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [game, onClose]);

  if (!game) return null;

  const imgId = game.title.toLowerCase().replace(/\s+/g, '-').replace(/[!'’]/g, '');

  const handleStartPlay = () => {
    sounds.playLaunch();
    setIsPlaying(true);
  };

  const handleReload = () => {
    sounds.playClick();
    setIframeKey(prev => prev + 1);
  };

  const handleToggleFullscreen = () => {
    sounds.playClick();
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error("Fullscreen error:", err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(() => {});
    }
  };

  // Launch About Blank Stealth Pop-out (Original CalcPlanet Feature)
  const handleLaunchAboutBlank = () => {
    sounds.playClick();
    const win = window.open('about:blank', '_blank');
    if (!win) {
      alert("Please allow popups for Stealth Mode to work!");
      return;
    }

    win.document.title = game.title;
    win.document.body.style.margin = '0';
    win.document.body.style.height = '100vh';
    win.document.body.style.overflow = 'hidden';
    win.document.body.style.background = '#090b10';

    const iframe = win.document.createElement('iframe');
    iframe.style.border = 'none';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.src = game.url;
    iframe.allowFullscreen = true;
    win.document.body.appendChild(iframe);

    onClose();
  };

  const handleShare = () => {
    sounds.playClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 ${
          performanceMode ? 'bg-[#090b10]' : 'bg-black/90 backdrop-blur-xl'
        } overflow-hidden`}
      >
        
        {/* Main Stage Modal Container */}
        <motion.div
          ref={containerRef}
          initial={{ scale: 0.94, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full h-full sm:max-w-6xl sm:h-[92vh] sm:max-h-[900px] flex flex-col bg-[#0f1322] border-0 sm:border sm:border-indigo-500/25 rounded-none sm:rounded-3xl shadow-2xl overflow-hidden"
        >
          
          {/* Header Bar */}
          <div className={`flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3.5 ${
            performanceMode ? 'bg-[#0a0d17]' : 'bg-[#0a0d17]/95 backdrop-blur-md'
          } border-b border-indigo-500/15 shrink-0`}>
            
            {/* Left: Game Title & Badge */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-[1.5px] shrink-0">
                <img
                  src={game.iconUrl || `https://234517.neocities.org/icons/${imgId}.gif`}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (game.iconUrl && target.src === game.iconUrl) {
                      target.src = 'https://234517.neocities.org/calcplanet.jpg';
                    } else if (target.src.endsWith('.gif')) {
                      target.src = `https://234517.neocities.org/icons/${imgId}.png`;
                    } else {
                      target.src = 'https://234517.neocities.org/calcplanet.jpg';
                    }
                  }}
                  alt=""
                  className="w-full h-full rounded-[10px] object-cover"
                />
              </div>

              <div className="min-w-0">
                <h2 className="font-fredoka text-sm sm:text-lg md:text-xl font-bold text-white tracking-wide flex items-center gap-1.5 truncate">
                  <span className="truncate">{game.title}</span>
                  {game.category && (
                    <span className="text-[10px] font-sans font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hidden sm:inline-block shrink-0">
                      {game.category}
                    </span>
                  )}
                </h2>
              </div>

              {/* Performance Mode Indicator Badge */}
              {performanceMode && (
                <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-500/30 text-[10px] font-bold text-emerald-300 shrink-0">
                  <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                  <span>Low-End Mode: Background Unloaded</span>
                </div>
              )}
            </div>

            {/* Right: Controls & Actions */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              
              {/* Favorite Button */}
              <button
                onClick={() => {
                  sounds.playFavorite();
                  onToggleFavorite(game.id);
                }}
                className={`p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer ${
                  isFavorite 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20' 
                    : 'bg-slate-800/80 text-slate-300 hover:text-white border-slate-700/60'
                }`}
                title={isFavorite ? 'Saved to Favorites' : 'Add to Favorites'}
              >
                <Star className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>

              {/* Share button */}
              <button
                onClick={handleShare}
                className="p-1.5 sm:p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 transition-all hidden sm:flex cursor-pointer"
                title="Copy Link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>

              {/* Reload Button */}
              {isPlaying && (
                <button
                  onClick={handleReload}
                  className="p-1.5 sm:p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 transition-all cursor-pointer"
                  title="Reload Game"
                >
                  <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}

              {/* Fullscreen About:Blank Tab Button */}
              <button
                onClick={handleLaunchAboutBlank}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs border border-cyan-400/30 transition-all shadow-sm hidden md:flex cursor-pointer"
                title="Launch in a new fullscreen window"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Stealth Fullscreen</span>
              </button>

              {/* Fullscreen Button */}
              <button
                onClick={handleToggleFullscreen}
                className="p-1.5 sm:p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 transition-all cursor-pointer"
                title="Toggle Fullscreen"
              >
                <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Panic Cloak Button */}
              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenPanic();
                }}
                className="p-1.5 sm:p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 transition-all cursor-pointer"
                title="Panic Mode"
              >
                <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Close Button */}
              <button
                onClick={() => {
                  sounds.playClick();
                  onClose();
                }}
                className="p-1.5 sm:p-2 rounded-xl bg-slate-800/80 hover:bg-red-600 text-slate-300 hover:text-white border border-slate-700/60 transition-all cursor-pointer"
                title="Close (Esc)"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

            </div>
          </div>

          {/* Body Stage Area */}
          <div className="relative flex-1 w-full h-full bg-[#07090e] overflow-hidden flex items-center justify-center">
            
            {isPlaying ? (
              /* Live Game Iframe */
              <iframe
                key={iframeKey}
                src={game.url}
                title={game.title}
                className="w-full h-full border-0 bg-black"
                allow="autoplay; fullscreen; keyboard; gamepad; microphone; camera"
                allowFullScreen
              />
            ) : (
              /* Pre-Play Splash Canvas */
              <div className="relative w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 text-center overflow-y-auto">
                
                {/* Background Artwork Banner (Omitted in Low-End Device Mode to save GPU) */}
                {!performanceMode && (
                  <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <img
                      src={game.iconUrl || `https://234517.neocities.org/icons/${imgId}.gif`}
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (game.iconUrl && target.src === game.iconUrl) {
                          target.src = `https://234517.neocities.org/icons/${imgId}.png`;
                        } else if (target.src.endsWith('.gif')) {
                          target.src = `https://234517.neocities.org/icons/${imgId}.png`;
                        } else {
                          target.src = 'https://234517.neocities.org/calcplanet.jpg';
                        }
                      }}
                      alt=""
                      className="w-full h-full object-cover blur-md scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f1322] via-[#0f1322]/80 to-transparent" />
                  </div>
                )}

                {/* Pre-Play Action Card */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className={`relative z-10 max-w-sm sm:max-w-lg w-full ${
                    performanceMode ? 'bg-[#101424]' : 'glass-panel'
                  } p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl border border-indigo-500/20 shadow-2xl flex flex-col items-center space-y-4 sm:space-y-6 my-auto`}
                >
                  {/* Game Icon Logo */}
                  <div className="relative group">
                    {!performanceMode && (
                      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 rounded-3xl blur opacity-70 group-hover:opacity-100 transition duration-500" />
                    )}
                    <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-900 border-2 border-white/20 shadow-xl">
                      <img
                        src={game.iconUrl || `https://234517.neocities.org/icons/${imgId}.gif`}
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (game.iconUrl && target.src === game.iconUrl) {
                            target.src = 'https://234517.neocities.org/calcplanet.jpg';
                          } else if (target.src.endsWith('.gif')) {
                            target.src = `https://234517.neocities.org/icons/${imgId}.png`;
                          } else {
                            target.src = 'https://234517.neocities.org/calcplanet.jpg';
                          }
                        }}
                        alt={game.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1 sm:space-y-2">
                    <h1 className="font-fredoka text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-wide">
                      {game.title}
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-300/90 max-w-md font-normal leading-relaxed">
                      {game.description || 'Ready to dive into the adventure? Click play below to launch directly inside CalcPlanet.'}
                    </p>
                  </div>

                  {/* Tags */}
                  {game.tags && (
                    <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
                      {game.tags.map((tag, idx) => (
                        <span 
                          key={idx}
                          className="text-[10px] sm:text-[11px] font-medium px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-slate-800/80 border border-slate-700 text-indigo-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Main Play Gradient CTA */}
                  <motion.button
                    whileHover={{ scale: 1.04, boxShadow: '0 0 35px rgba(99, 102, 241, 0.6)' }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleStartPlay}
                    className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-fredoka text-base sm:text-lg font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 shadow-xl shadow-indigo-600/40 flex items-center justify-center gap-2.5 border border-white/20 transition-all cursor-pointer"
                  >
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white text-white ml-0.5" />
                    <span>LAUNCH ASSIGNMENT</span>
                  </motion.button>

                  {/* Alternate Options */}
                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-0.5">
                    <button
                      onClick={handleLaunchAboutBlank}
                      className="hover:text-cyan-400 underline underline-offset-4 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Stealth Window</span>
                    </button>
                    <span>•</span>
                    <a
                      href={game.url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-cyan-400 underline underline-offset-4 flex items-center gap-1 transition-colors"
                    >
                      <span>Direct URL</span>
                    </a>
                  </div>
                </motion.div>

              </div>
            )}

          </div>

          {/* Footer Status Bar */}
          <div className="px-3 sm:px-6 py-2 bg-[#090b10] border-t border-slate-800 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 shrink-0">
            <div className="flex items-center gap-2 truncate">
              <span className="text-slate-400 font-medium truncate">{game.title}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[9px] sm:text-[10px]">Esc</kbd> to exit</span>
            </div>
          </div>

        </motion.div>

      </motion.div>
    </AnimatePresence>
  );
};
