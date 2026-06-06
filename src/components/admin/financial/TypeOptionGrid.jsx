export function TypeOptionGrid({ options, value, onChange, columns = 2 }) {
  const gridCols = columns === 3 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2';

  return (
    <div className={`grid ${gridCols} gap-2`}>
      {options.map((opt) => {
        const selected = value === opt.value;
        const Icon = opt.icon;

        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex flex-col items-start gap-2 p-3 rounded-xl border text-left transition-all cursor-pointer ${
              selected
                ? 'bg-brand-gold/10 border-brand-gold text-white shadow-[0_0_12px_rgba(250,204,21,0.12)]'
                : 'bg-gray-darker border-gray-mid text-gray-400 hover:border-gray-mid/80 hover:text-gray-200 hover:bg-gray-dark'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              selected ? 'bg-brand-gold text-black-pure' : 'bg-gray-dark text-gray-500'
            }`}>
              {Icon && <Icon size={16} />}
            </div>
            <div>
              <p className={`text-xs font-bold ${selected ? 'text-brand-gold' : 'text-gray-300'}`}>{opt.label}</p>
              {opt.hint && <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">{opt.hint}</p>}
            </div>
          </button>
        );
      })}
    </div>
  );
}
