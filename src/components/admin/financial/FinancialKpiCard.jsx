import { motion } from 'framer-motion';
import { cloneElement, isValidElement } from 'react';

const COLORS = {
  gold: { icon: 'text-brand-gold bg-brand-gold/10 border-brand-gold/20', accent: 'text-brand-gold' },
  green: { icon: 'text-green-500 bg-green-500/10 border-green-500/20', accent: 'text-green-500' },
  red: { icon: 'text-brand-red bg-brand-red/10 border-brand-red/20', accent: 'text-brand-red' },
  yellow: { icon: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20', accent: 'text-yellow-500' },
  blue: { icon: 'text-blue-400 bg-blue-500/10 border-blue-500/20', accent: 'text-blue-400' },
};

export function FinancialKpiCard({ icon, label, value, sub, hint, trend, color = 'gold', delay = 0, highlight }) {
  const palette = COLORS[color] || COLORS.gold;
  const watermarkIcon = isValidElement(icon)
    ? cloneElement(icon, {
        size: 108,
        className: `absolute -bottom-5 -right-5 opacity-5 ${palette.accent} pointer-events-none transform transition-transform duration-500 group-hover:scale-110`,
      })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`group relative bg-black-rich border rounded-2xl p-5 overflow-hidden transition-colors ${
        highlight ? 'border-brand-gold/40 shadow-[0_0_20px_rgba(250,204,21,0.08)]' : 'border-gray-mid hover:border-gray-mid/80'
      }`}
    >
      {watermarkIcon}
      {highlight && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
      )}
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${palette.icon}`}>
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
            trend >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-brand-red/10 text-brand-red'
          }`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-[clamp(0.95rem,2.2vw,1.5rem)] leading-tight whitespace-nowrap font-black tracking-tight [font-variant-numeric:tabular-nums] ${palette.accent === 'text-brand-gold' && !highlight ? 'text-white' : palette.accent}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-gray-500 mt-1.5">{sub}</p>}
      {hint && <p className="text-[10px] text-gray-600 mt-2 leading-relaxed">{hint}</p>}
    </motion.div>
  );
}
