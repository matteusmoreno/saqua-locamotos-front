import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const ACCENTS = {
  gold: {
    glow: 'from-brand-gold/20 via-brand-gold/5 to-transparent',
    icon: 'bg-brand-gold/15 text-brand-gold border-brand-gold/30',
    border: 'border-brand-gold/20',
  },
  red: {
    glow: 'from-brand-red/20 via-brand-red/5 to-transparent',
    icon: 'bg-brand-red/15 text-brand-red border-brand-red/30',
    border: 'border-brand-red/20',
  },
};

export function FinancialModalShell({ isOpen, onClose, title, subtitle, icon, accent = 'gold', children, footer }) {
  if (!isOpen) return null;
  const palette = ACCENTS[accent] || ACCENTS.gold;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black-pure/85 backdrop-blur-md cursor-pointer"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 24 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          className={`relative w-full max-w-xl bg-black-rich border ${palette.border} rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col`}
        >
          <div className={`relative px-6 pt-6 pb-5 bg-gradient-to-br ${palette.glow}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${palette.icon}`}>
                  {icon}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">{title}</h3>
                  <p className="text-gray-400 text-sm mt-0.5 leading-relaxed">{subtitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-gray-darker border border-transparent hover:border-gray-mid transition-all cursor-pointer"
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {children}
          </div>

          {footer && (
            <div className="px-6 py-4 border-t border-gray-mid bg-gray-darker/40 shrink-0">
              {footer}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
