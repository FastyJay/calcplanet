import React, { useState } from 'react';
import { Play, Star, Sparkles, ExternalLink, Flame } from 'lucide-react';
import { motion } from 'motion/react';
import { GameItem } from '../types';
import { sounds } from '../utils/sound';

interface GameCardProps {
  game: GameItem;
  onOpenGame: (game: GameItem) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  index: number;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  onOpenGame,
  isFavorite,
  onToggleFavorite,
  index,
}) => {
  const [imgErrorStep, setImgErrorStep] = useState<number>(0);
  const [isHovered, setIsHovered] = useState(false);

  const imgId = game.title.toLowerCase().replace(/\s+/g, '-').replace(/[!'’]/g, '');
  
  // Image fallback pipeline
  const getImgSrc = () => {
    if (game.iconUrl && imgErrorStep === 0) {
      return game.iconUrl;
    }
    if (imgErrorStep === 0) {
      return `https://234517.neocities.org/icons/${imgId}.gif`;
    } else if (imgErrorStep === 1) {
      return `https://234517.neocities.org/icons/${imgId}.png`;
    } else {
      return 'https://234517.neocities.org/calcplanet.jpg';
    }
  };

  const handleImgError = () => {
    if (imgErrorStep < 2) {
      setImgErrorStep(prev => prev + 1);
    }
  };

  // Card dimensions: featured/hot games are large (2x2), wide are 2x1, tall are 1x2, medium are 1x1
  const getSizeClasses = () => {
    switch (game.size) {
      case 'featured':
        return 'col-span-2 sm:col-span-2 row-span-2 h-full min-h-[250px] sm:min-h-[340px]';
      case 'wide':
        return 'col-span-2 sm:col-span-2 row-span-1 h-full min-h-[135px] sm:min-h-[160px]';
      case 'tall':
        return 'col-span-1 row-span-2 h-full min-h-[250px] sm:min-h-[340px]';
      case 'medium':
      default:
        return 'col-span-1 row-span-1 h-full min-h-[135px] sm:min-h-[160px]';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.015, 0.25) }}
      onMouseEnter={() => {
        setIsHovered(true);
        sounds.playHover();
      }}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        sounds.playClick();
        onOpenGame(game);
      }}
      className={`group relative rounded-2xl overflow-hidden cursor-pointer border border-slate-800/80 bg-[#121624] hover:border-indigo-500/50 glow-card-hover transition-all duration-300 flex flex-col justify-end ${getSizeClasses()}`}
    >
      {/* Background Image with smooth zoom */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-slate-900">
        <img
          src={getImgSrc()}
          onError={handleImgError}
          alt={game.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 group-hover:brightness-90 opacity-85 group-hover:opacity-100"
        />
        
        {/* Subtle Gradient Overlays for High Contrast Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090b10] via-[#090b10]/60 to-transparent opacity-90 group-hover:opacity-85 transition-opacity" />
        <div className="absolute inset-0 bg-indigo-950/20 mix-blend-overlay group-hover:opacity-0 transition-opacity" />
      </div>

      {/* Top Badges (New, Featured, Favorite) */}
      <div className="absolute top-2 inset-x-2 sm:top-2.5 sm:inset-x-2.5 flex items-center justify-between z-10 pointer-events-none">
        
        <div className="flex items-center gap-1 sm:gap-1.5 pointer-events-auto">
          {game.isNew && (
            <span className="px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30">
              NEW
            </span>
          )}
          {game.size === 'featured' && (
            <span className="px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md shadow-amber-500/30 flex items-center gap-1">
              <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              HOT
            </span>
          )}
          {game.category && game.category !== 'all' && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-black/50 text-slate-300 backdrop-blur-md border border-white/10 hidden sm:inline-block">
              {game.category}
            </span>
          )}
        </div>

        {/* Favorite Bookmark Star Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            sounds.playFavorite();
            onToggleFavorite(game.id);
          }}
          className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl backdrop-blur-md border pointer-events-auto transition-all cursor-pointer ${
            isFavorite
              ? 'bg-amber-500/25 text-amber-300 border-amber-500/60 shadow-md shadow-amber-500/20'
              : 'bg-black/50 text-slate-400 border-white/10 hover:text-amber-300 hover:bg-black/70 opacity-90 sm:opacity-0 group-hover:opacity-100'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
        </button>

      </div>

      {/* Floating Center Play Action on Hover */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <motion.div
          animate={isHovered ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
          transition={{ type: 'spring', damping: 18, stiffness: 280 }}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-[2px] shadow-xl shadow-indigo-600/50"
        >
          <div className="w-full h-full rounded-[10px] sm:rounded-[14px] bg-[#0d111c]/90 flex items-center justify-center">
            <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white ml-0.5" />
          </div>
        </motion.div>
      </div>

      {/* Bottom Content Card Info */}
      <div className="relative z-10 p-2.5 sm:p-3.5 space-y-0.5 sm:space-y-1">
        <h3 className="font-fredoka text-xs sm:text-base font-bold text-white tracking-wide drop-shadow-md group-hover:text-cyan-300 transition-colors line-clamp-1">
          {game.title}
        </h3>

        {game.description && (
          <p className="text-[11px] sm:text-xs text-slate-300/80 line-clamp-1 font-normal hidden sm:block">
            {game.description}
          </p>
        )}

        {/* Tags */}
        {game.tags && game.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
            {game.tags.slice(0, 2).map((tag, tIdx) => (
              <span 
                key={tIdx} 
                className="text-[9px] sm:text-[10px] font-medium text-slate-400 bg-slate-900/80 px-1.5 py-0.2 rounded border border-slate-700/50"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Glowing Bottom Accent Line */}
      <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
};
