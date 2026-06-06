import { CheckCircle } from 'lucide-react';

export function SelectableCard({ selected, onClick, title, subtitle, meta, badge, icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
        selected
          ? 'bg-brand-gold/10 border-brand-gold shadow-[0_0_12px_rgba(250,204,21,0.1)]'
          : 'bg-gray-darker border-gray-mid hover:border-gray-mid/80 hover:bg-gray-dark'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
          selected ? 'bg-brand-gold text-black-pure border-brand-gold' : 'bg-gray-dark text-gray-400 border-gray-mid'
        }`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`font-bold truncate ${selected ? 'text-brand-gold' : 'text-white'}`}>{title}</p>
            {selected && <CheckCircle size={18} className="text-brand-gold shrink-0" />}
          </div>
          {subtitle && <p className="text-gray-500 text-xs mt-0.5 truncate">{subtitle}</p>}
          {meta && <p className="text-gray-400 text-xs mt-1">{meta}</p>}
          {badge && <div className="mt-2">{badge}</div>}
        </div>
      </div>
    </button>
  );
}
