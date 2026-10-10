import React, { useState, useEffect, useMemo } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  Sidebar 
} from './components/Sidebar';
import { 
  HeroBanner 
} from './components/HeroBanner';
import { 
  GameCard 
} from './components/GameCard';
import { 
  GamePlayerModal 
} from './components/GamePlayerModal';
import { 
  SettingsModal 
} from './components/SettingsModal';
import { 
  PanicCloakModal 
} from './components/PanicCloakModal';
import { 
  ParticleBackground 
} from './components/ParticleBackground';
import { 
  GAMES_DATA, 
  CATEGORIES_CONFIG, 
  CLOAK_PRESETS 
} from './data/games';
import { 
  GameItem, 
  GameCategory, 
  ThemeMode 
} from './types';
import { sounds } from './utils/sound';
import { audioBroadcast, BroadcastSoundEvent } from './utils/audioBroadcast';
import { 
  Sparkles, 
  Flame, 
  Star, 
  Search, 
  Layers, 
  RotateCcw,
  Compass,
  Zap,
  Volume2,
  VolumeX,
  Play,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // State
  const [games] = useState<GameItem[]>(GAMES_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [activeGame, setActiveGame] = useState<GameItem | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPanicOpen, setIsPanicOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('cosmic-dark');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [performanceMode, setPerformanceMode] = useState(false);
  const [incomingBroadcast, setIncomingBroadcast] = useState<BroadcastSoundEvent | null>(null);
  const [isPlayingBroadcast, setIsPlayingBroadcast] = useState(false);
  const [isAutoplayBlocked, setIsAutoplayBlocked] = useState(false);

  // Subscribe to real-time audio broadcast events and playback state
  useEffect(() => {
    const unsubBroadcast = audioBroadcast.subscribe((event) => {
      setIncomingBroadcast(event);
    });

    const unsubState = audioBroadcast.subscribeState((isPlaying, currentEvent, isBlocked) => {
      setIsPlayingBroadcast(isPlaying);
      setIsAutoplayBlocked(isBlocked);
      if (currentEvent) {
        setIncomingBroadcast(currentEvent);
      }
    });

    return () => {
      unsubBroadcast();
      unsubState();
    };
  }, []);

  // Auto-dismiss broadcast notification 7s after it finishes playing
  useEffect(() => {
    if (incomingBroadcast && !isPlayingBroadcast && !isAutoplayBlocked) {
      const timer = setTimeout(() => {
        setIncomingBroadcast(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [incomingBroadcast, isPlayingBroadcast, isAutoplayBlocked]);

  // Load persistence settings on mount
  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem('calcplanet_favs');
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      }

      const savedTheme = localStorage.getItem('calcplanet_theme_mode') as ThemeMode;
      if (savedTheme) {
        setCurrentTheme(savedTheme);
      }

      const savedSound = localStorage.getItem('calcplanet-sound');
      if (savedSound !== null) {
        setSoundEnabled(savedSound === 'true');
      }

      const savedPerf = localStorage.getItem('calcplanet_performance_mode');
      if (savedPerf !== null) {
        setPerformanceMode(savedPerf === 'true');
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Toggle Low-End Device / Performance Boost Mode
  const handleTogglePerformanceMode = () => {
    const next = !performanceMode;
    setPerformanceMode(next);
    localStorage.setItem('calcplanet_performance_mode', String(next));
  };

  // Sync favorites
  const toggleFavorite = (id: number) => {
    setFavorites((prev) => {
      let next: number[];
      if (prev.includes(id)) {
        next = prev.filter(item => item !== id);
      } else {
        next = [...prev, id];
      }
      localStorage.setItem('calcplanet_favs', JSON.stringify(next));
      return next;
    });
  };

  const resetFavorites = () => {
    setFavorites([]);
    localStorage.removeItem('calcplanet_favs');
  };

  // Sync theme
  const handleSelectTheme = (theme: ThemeMode) => {
    setCurrentTheme(theme);
    localStorage.setItem('calcplanet_theme_mode', theme);
  };

  // Toggle sound
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.setEnabled(next);
  };

  // Random game trigger
  const handleRandomGame = () => {
    sounds.playLaunch();
    const randomIndex = Math.floor(Math.random() * games.length);
    const chosen = games[randomIndex];
    setActiveGame(chosen);
  };

  // Panic Cloak Tab Launcher
  const handleLaunchPanic = (presetId?: string) => {
    const preset = CLOAK_PRESETS.find(p => p.id === (presetId || 'classroom')) || CLOAK_PRESETS[0];
    const win = window.open('about:blank', '_blank');
    if (!win) {
      alert("Please allow popups for Panic Mode to work!");
      return;
    }

    win.document.title = preset.title;
    
    // Set disguised favicon
    const link = win.document.createElement('link');
    link.rel = 'icon';
    link.href = preset.favicon;
    win.document.head.appendChild(link);

    win.document.body.style.margin = '0';
    win.document.body.style.height = '100vh';
    win.document.body.style.overflow = 'hidden';

    const iframe = win.document.createElement('iframe');
    iframe.style.border = 'none';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.src = window.location.href;
    iframe.allowFullscreen = true;
    win.document.body.appendChild(iframe);

    // Optional safe redirect on current page
    window.location.replace('https://www.google.com');
  };

  // Filtered games collection
  const filteredGames = useMemo(() => {
    const list = games.filter((game) => {
      // Search filter
      const matchesSearch = 
        searchQuery.trim() === '' ||
        game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        game.category?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Favorites only toggle
      if (showFavoritesOnly && !favorites.includes(game.id)) {
        return false;
      }

      // Category filter: Give Suggestions is strictly in 'all' games, not inside action/driving/puzzle/etc. genres
      if (selectedCategory === 'all') {
        return true;
      } else if (selectedCategory === 'popular') {
        return game.size === 'featured';
      } else if (selectedCategory === 'favorites') {
        return favorites.includes(game.id);
      } else {
        return game.category === selectedCategory;
      }
    });

    // Ensure Give Suggestions (id: 1) is #1 at index 0 only when on 'all' view with no search
    if (selectedCategory === 'all' && searchQuery.trim() === '' && !showFavoritesOnly) {
      const suggestionIdx = list.findIndex(g => g.id === 1 || g.title.toLowerCase().includes('give suggestion'));
      if (suggestionIdx > 0) {
        const [suggestionItem] = list.splice(suggestionIdx, 1);
        list.unshift(suggestionItem);
      }
    }

    return list;
  }, [games, searchQuery, selectedCategory, showFavoritesOnly, favorites]);

  // Theme styling classes mapping
  const getThemeWrapperClass = () => {
    switch (currentTheme) {
      case 'cyber-neon':
        return 'theme-cyber-neon bg-[#030712] text-cyan-50 selection:bg-cyan-500 selection:text-black';
      case 'midnight-blue':
        return 'theme-midnight-blue bg-[#050b18] text-sky-50 selection:bg-blue-500 selection:text-white';
      case 'sunset-amber':
        return 'theme-sunset-amber bg-[#0f0705] text-amber-50 selection:bg-orange-500 selection:text-white';
      case 'clean-light':
        return 'theme-clean-light bg-[#f3f5fa] text-slate-900 selection:bg-indigo-500 selection:text-white';
      case 'cosmic-dark':
      default:
        return 'theme-cosmic-dark bg-[#090b10] text-slate-100 selection:bg-indigo-500 selection:text-white';
    }
  };

  return (
    <div 
      data-theme={currentTheme}
      className={`min-h-screen flex flex-col font-sans antialiased transition-colors duration-300 relative ${getThemeWrapperClass()}`}
    >
      
      {/* Dynamic Animated Particles Effect Canvas (Disabled in Performance Mode or when game is active) */}
      <ParticleBackground theme={currentTheme} disabled={performanceMode || !!activeGame} />

      {/* Performance Mode: When active and a game is opened, unload heavy background cards & navigation */}
      {performanceMode && activeGame ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[65vh] text-center p-6 select-none pointer-events-none">
          <div className="max-w-md space-y-2.5 p-6 sm:p-8 rounded-3xl bg-emerald-950/20 border border-emerald-500/20 shadow-xl">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shadow-md shadow-emerald-500/10">
              <Zap className="w-6 h-6 text-emerald-400 fill-emerald-400" />
            </div>
            <h3 className="font-fredoka text-base font-bold text-emerald-300">
              Low-End Device Mode Active
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Background cards, thumbnails, animations, and sound listeners have been unloaded to maximize system memory and FPS for <span className="text-white font-semibold">{activeGame.title}</span>.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Top Navigation Bar */}
          <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPanic={() => setIsPanicOpen(true)}
        onRandomGame={handleRandomGame}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        favoritesCount={favorites.length}
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavoritesOnly={() => {
          setShowFavoritesOnly(prev => !prev);
          if (!showFavoritesOnly) setSelectedCategory('all');
        }}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        totalGames={games.length}
      />

      {/* Main Content Layout with Responsive Sidebar */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto relative z-10">
        
        {/* Left Navigation Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setShowFavoritesOnly(false);
            if (window.innerWidth < 1024) {
              setIsSidebarOpen(false);
            }
          }}
          games={games}
          onOpenGame={(g) => {
            setActiveGame(g);
            if (window.innerWidth < 1024) {
              setIsSidebarOpen(false);
            }
          }}
          favorites={favorites}
          activeGameId={activeGame?.id}
        />

        {/* Center Game Showcase Canvas */}
        <main className="flex-1 lg:pl-72 p-3.5 sm:p-6 lg:p-8 w-full overflow-hidden">
          
          {/* Hero Banner Area */}
          {!searchQuery && selectedCategory === 'all' && !showFavoritesOnly && (
            <HeroBanner
              totalGames={games.length}
              onRandomGame={handleRandomGame}
              onSelectCategory={setSelectedCategory}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          )}

          {/* Category Chips & Filter Controls Row */}
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            
            {/* Category Scrollable Pills with edge-to-edge mobile scroll */}
            <div className="-mx-3.5 px-3.5 sm:mx-0 sm:px-0 flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 sm:pb-0 scrollbar-none">
              {CATEGORIES_CONFIG.slice(0, 7).map((cat) => {
                const isSelected = selectedCategory === cat.id && !showFavoritesOnly;
                return (
                  <motion.button
                    key={cat.id}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedCategory(cat.id);
                      setShowFavoritesOnly(false);
                    }}
                    className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                        : 'bg-[#121624]/80 text-slate-300 hover:text-white hover:bg-[#191f33] border border-slate-800'
                    }`}
                  >
                    <span>{cat.label}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Assignments Count Display */}
            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
              <span className="text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-[#121624] border border-slate-800 text-slate-300">
                {filteredGames.length} {filteredGames.length === 1 ? 'Assignment' : 'Assignments'}
              </span>
            </div>

          </div>

          {/* Assignments Grid Container with Dynamic Responsive Spans */}
          {filteredGames.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 auto-rows-[140px] sm:auto-rows-[160px] md:auto-rows-[170px] grid-flow-dense"
            >
              {filteredGames.map((game, index) => (
                <GameCard
                  key={game.id}
                  game={game}
                  index={index}
                  onOpenGame={setActiveGame}
                  isFavorite={favorites.includes(game.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </motion.div>
          ) : (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto my-12"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-fredoka text-xl font-bold text-white">No Assignments Found</h3>
              <p className="text-xs text-slate-400">
                We couldn't find any assignments matching "{searchQuery || selectedCategory}". Try searching for another topic or clearing filters.
              </p>
              <button
                onClick={() => {
                  sounds.playClick();
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setShowFavoritesOnly(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </motion.div>
          )}

          {/* Footer Branding */}
          <footer className="mt-16 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2 font-medium">
              <span className="font-fredoka text-base text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text font-bold">
                CalcPlanet
              </span>
              <span>•</span>
              <span>Interactive Mathematics & Study Tools</span>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="https://234517.neocities.org/math"
                target="_blank"
                rel="noreferrer"
                className="hover:text-indigo-400 transition-colors"
              >
                Math Universe
              </a>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSfqsEK-_QQYWD2fCdu-NkCz2UfSkopL62MjJCXz9O7UK7IFyg/viewform"
                target="_blank"
                rel="noreferrer"
                className="hover:text-indigo-400 transition-colors"
              >
                Submit Suggestion
              </a>
              <button
                onClick={() => setIsPanicOpen(true)}
                className="text-red-400 hover:text-red-300 transition-colors cursor-pointer"
              >
                Panic Cloak
              </button>
            </div>
          </footer>

        </main>

      </div>
    </>
  )}

      {/* Floating Real-Time Audio Broadcast Notification Toast */}
      <AnimatePresence>
        {incomingBroadcast && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            onClick={() => {
              if (isAutoplayBlocked) {
                audioBroadcast.forcePlayPending();
              }
            }}
            className={`fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-full p-4 rounded-2xl bg-gradient-to-r from-[#171c33] to-[#121629] border shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 pointer-events-auto transition-all ${
              isAutoplayBlocked
                ? 'border-amber-500/60 shadow-amber-900/30 cursor-pointer animate-pulse'
                : 'border-rose-500/40 shadow-rose-900/30'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 p-[1.5px] shrink-0">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                  {isPlayingBroadcast ? (
                    <div className="flex items-end gap-0.5 h-4">
                      <span className="w-1 bg-rose-400 rounded-full animate-bounce [animation-delay:-0.3s] h-full" />
                      <span className="w-1 bg-pink-400 rounded-full animate-bounce [animation-delay:-0.15s] h-2/3" />
                      <span className="w-1 bg-indigo-400 rounded-full animate-bounce h-5/6" />
                    </div>
                  ) : (
                    <Volume2 className="w-5 h-5 text-rose-400 animate-pulse" />
                  )}
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400">
                    {isPlayingBroadcast ? '🔊 Now Playing Live' : isAutoplayBlocked ? '⚠️ Sound Waiting' : 'Live Broadcast'}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">• {incomingBroadcast.sender}</span>
                </div>
                <h4 className="font-fredoka text-sm font-bold text-white truncate">{incomingBroadcast.title}</h4>
                {isAutoplayBlocked && (
                  <span className="text-[10px] text-amber-300 font-semibold flex items-center gap-1 mt-0.5">
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>Click anywhere to hear sound</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {isAutoplayBlocked && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    audioBroadcast.forcePlayPending();
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Play</span>
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIncomingBroadcast(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Stage Modal Overlay */}
      <GamePlayerModal
        game={activeGame}
        onClose={() => setActiveGame(null)}
        isFavorite={activeGame ? favorites.includes(activeGame.id) : false}
        onToggleFavorite={toggleFavorite}
        onOpenPanic={() => {
          setIsPanicOpen(true);
        }}
        performanceMode={performanceMode}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentTheme={currentTheme}
        onSelectTheme={handleSelectTheme}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        performanceMode={performanceMode}
        onTogglePerformanceMode={handleTogglePerformanceMode}
        onLaunchPanic={handleLaunchPanic}
        onResetFavorites={resetFavorites}
        favoritesCount={favorites.length}
      />

      {/* Panic Cloak Modal */}
      <PanicCloakModal
        isOpen={isPanicOpen}
        onClose={() => setIsPanicOpen(false)}
        onLaunchPanic={handleLaunchPanic}
      />

    </div>
  );
}
