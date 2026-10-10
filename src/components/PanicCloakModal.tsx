import React from 'react';
import { ShieldAlert, X, Zap, ExternalLink, GraduationCap, HardDrive, FileText, Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CLOAK_PRESETS } from '../data/games';
import { sounds } from '../utils/sound';

interface PanicCloakModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchPanic: (presetId: string) => void;
}

export const PanicCloakModal: React.FC<PanicCloakModalProps> = ({
  isOpen,
  onClose,
  onLaunchPanic,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg bg-[#0f121d] border border-red-500/30 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5"
        >
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-lg shadow-red-600/30">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-fredoka text-xl font-bold text-white">Panic Cloak System</h2>
                <p className="text-xs text-slate-400">Launch site into a stealth tab disguise</p>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Choose a disguise preset to open an unclosable sandboxed window masquerading under an innocent school/work title and favicon.
          </p>

          {/* Presets List */}
          <div className="space-y-2">
            {CLOAK_PRESETS.map((preset) => (
              <motion.button
                key={preset.id}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  sounds.playLaunch();
                  onLaunchPanic(preset.id);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#141829] hover:bg-gradient-to-r hover:from-slate-800 hover:to-indigo-900/40 border border-slate-800 hover:border-red-500/40 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <img src={preset.favicon} alt="" className="w-5 h-5 rounded-sm object-contain" />
                  <div>
                    <div className="font-bold text-xs text-slate-200 group-hover:text-white">{preset.name}</div>
                    <div className="text-[10px] text-slate-500 group-hover:text-slate-400 font-mono truncate max-w-[240px]">
                      {preset.title}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-[11px] font-bold group-hover:bg-red-500 group-hover:text-white transition-colors">
                  <Zap className="w-3 h-3" />
                  <span>Cloak</span>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="pt-2 text-center">
            <span className="text-[11px] text-slate-500">
              Note: Allow popups if your browser blocks the stealth new window.
            </span>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
