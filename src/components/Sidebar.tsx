import React, { useState } from 'react';
import { 
  Gamepad2, 
  Flame, 
  Star, 
  Swords, 
  Car, 
  Zap, 
  Brain, 
  Tv, 
  Trophy, 
  Users, 
  ChevronRight, 
  ExternalLink,
  HelpCircle,
  MessageSquare,
  Sparkles,
  Compass,
  X,
  Layers,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GameCategory, GameItem } from '../types';
import { CATEGORIES_CONFIG } from '../data/games';
import { sounds } from '../utils/sound';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: GameCategory;
  onSelectCategory: (cat: GameCategory) => void;
  games: GameItem[];
  onOpenGame: (game: GameItem) => void;
  favorites: number[];
  activeGameId?: number;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Gamepad2: <Gamepad2 className="w-4 h-4" />,
  Flame: <Flame className="w-4 h-4" />,
  Star: <Star className="w-4 h-4" />,
  Swords: <Swords className="w-4 h-4" />,
  Car: <Car className="w-4 h-4" />,
  Zap: <Zap className="w-4 h-4" />,
  Brain: <Brain className="w-4 h-4" />,
  Tv: <Tv className="w-4 h-4" />,
  Trophy: <Trophy className="w-4 h-4" />,
  Users: <Users className="w-4 h-4" />,
};

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  selectedCategory,
  onSelectCategory,
  games,
  onOpenGame,
  favorites,
  activeGameId,
}) => {
  const [quickFilter, setQuickFilter] = useState('');

  const filteredGames = React.useMemo(() => {
    const list = games.filter(g => 
      quickFilter.trim() === '' || g.title.toLowerCase().includes(quickFilter.toLowerCase())
    );
    const suggestionIdx = list.findIndex(g => g.id === 1 || g.title.toLowerCase().includes('give suggestion'));
    if (suggestionIdx > 0) {
      const [item] = list.splice(suggestionIdx, 1);
      list.unshift(item);
    }
    return list;
  }, [games, quickFilter]);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 lg:top-18 bottom-0 left-0 z-50 lg:z-20 w-72 sm:w-80 border-r backdrop-blur-2xl transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl shadow-black/80' : '-translate-x-full'
        } flex flex-col h-full lg:h-[calc(100vh-72px)]`}
      >
        {/* Mobile Header in Drawer */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/80 lg:hidden shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 p-[1.5px]">
              <img
                src="https://234517.neocities.org/calcplanet.jpg"
                alt="CalcPlanet Logo"
                className="w-full h-full object-cover rounded-[6px]"
              />
            </div>
            <span className="font-fredoka text-lg font-bold text-white tracking-wide">
              CalcPlanet
            </span>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Nav Content */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          
          {/* Main Categories Section */}
          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Categories
              </span>
              <span className="text-[10px] text-slate-500">{CATEGORIES_CONFIG.length} genres</span>
            </div>

            <div className="space-y-1">
              {CATEGORIES_CONFIG.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                let count = games.length;
                if (cat.id === 'favorites') {
                  count = favorites.length;
                } else if (cat.id === 'popular') {
                  count = games.filter(g => g.size === 'featured').length;
                } else if (cat.id !== 'all') {
                  count = games.filter(g => g.category === cat.id).length;
                }

                return (
                  <motion.button
                    key={cat.id}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      sounds.playClick();
                      onSelectCategory(cat.id);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1 rounded-lg ${isSelected ? 'bg-white/20' : 'bg-slate-800 text-slate-400'}`}>
                        {ICON_MAP[cat.icon] || <Gamepad2 className="w-4 h-4" />}
                      </div>
                      <span>{cat.label}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-800/80 text-slate-400'
                    }`}>
                      {count}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Quick Jump Directory */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="px-2 mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Quick Jump ({games.length})
              </span>
            </div>

            {/* Mini search inside sidebar */}
            <div className="px-1 mb-2">
              <input
                type="text"
                value={quickFilter}
                onChange={(e) => setQuickFilter(e.target.value)}
                placeholder="Filter quick list..."
                className="w-full bg-slate-900/40 border border-slate-700/60 rounded-lg px-2.5 py-1.5 text-xs text-inherit placeholder-slate-500 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-0.5 pr-1">
              {filteredGames.slice(0, 40).map((game) => {
                const imgId = game.title.toLowerCase().replace(/\s+/g, '-').replace(/[!'’]/g, '');
                const isCurrent = activeGameId === game.id;
                return (
                  <button
                    key={game.id}
                    onClick={() => {
                      sounds.playClick();
                      onOpenGame(game);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left group ${
                      isCurrent
                        ? 'bg-indigo-600/30 text-indigo-300 font-bold border border-indigo-500/40'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <img
                      src={game.iconUrl || `https://234517.neocities.org/icons/${imgId}.gif`}
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (game.iconUrl && target.src === game.iconUrl) {
                          target.src = 'https://234517.neocities.org/calcplanet.jpg';
                        } else if (target.src.endsWith('.gif')) {
                          target.src = `https://234517.neocities.org/icons/${imgId}.png`;
                        } else if (target.src.endsWith('.png')) {
                          target.src = 'https://234517.neocities.org/calcplanet.jpg';
                        }
                      }}
                      alt=""
                      className="w-4 h-4 rounded object-cover shrink-0 opacity-80 group-hover:opacity-100"
                    />
                    <span className="truncate flex-1">{game.title}</span>
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Links & Classic Portals */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <a
              href="/soundboard.html"
              onClick={() => sounds.playClick()}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-slate-900/50 border border-purple-500/30 text-xs font-semibold text-purple-200 hover:text-white hover:border-purple-400/60 hover:shadow-lg hover:shadow-purple-500/20 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-purple-500/40">
                  <Volume2 className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-fredoka text-[13px] font-bold text-white tracking-wide">Soundboard</span>
                  <span className="text-[10px] text-purple-300/80 -mt-0.5">SFX &amp; Text-to-Speech</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/30 text-purple-300 border border-purple-400/30 uppercase tracking-wider">NEW</span>
                <ChevronRight className="w-3.5 h-3.5 text-purple-400 group-hover:text-purple-200 group-hover:translate-x-0.5 transition-all" />
              </div>
            </a>

            <a
              href="https://234517.neocities.org/math"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/20 text-xs font-semibold text-blue-300 hover:text-blue-200 hover:border-blue-400/40 transition-all group"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Math Universe</span>
              </div>
              <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100" />
            </a>

            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSfqsEK-_QQYWD2fCdu-NkCz2UfSkopL62MjJCXz9O7UK7IFyg/viewform"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/40 text-xs font-medium text-slate-300 transition-all group"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                <span>Submit a Suggestion</span>
              </div>
              <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100" />
            </a>
          </div>

        </div>
      </aside>
    </>
  );
};
