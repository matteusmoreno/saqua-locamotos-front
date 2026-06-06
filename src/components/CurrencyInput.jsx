import { useState, useEffect } from 'react';
import { maskCurrencyInput, parseCurrencyInput, numberToCurrencyInput } from '../utils/currencyMask';

const VARIANTS = {
  financial: {
    wrapper: 'financial-input flex items-stretch p-0 gap-0 overflow-hidden',
    prefix: 'flex items-center pl-4 pr-3 text-brand-gold font-bold text-sm border-r border-gray-mid/60 bg-gray-darker/50 shrink-0 select-none',
    input: 'flex-1 min-w-0 bg-transparent border-none outline-none py-[0.875rem] pr-4 text-white text-sm placeholder:text-gray-600',
  },
  dark: {
    wrapper: 'input-dark flex items-stretch p-0 gap-0 overflow-hidden',
    prefix: 'flex items-center pl-4 pr-3 text-brand-gold font-bold text-sm border-r border-gray-mid/60 bg-black-pure/40 shrink-0 select-none',
    input: 'flex-1 min-w-0 bg-transparent border-none outline-none py-[0.875rem] pr-4 text-white text-sm placeholder:text-gray-600',
  },
};

export function CurrencyInput({
  value,
  onChange,
  variant = 'financial',
  disabled = false,
  placeholder = '0,00',
  className = '',
  ...props
}) {
  const [display, setDisplay] = useState(() => numberToCurrencyInput(value));
  const styles = VARIANTS[variant] || VARIANTS.financial;

  useEffect(() => {
    const formatted = numberToCurrencyInput(value);
    setDisplay((prev) => {
      const prevNumeric = parseCurrencyInput(prev);
      const nextNumeric = parseCurrencyInput(formatted);
      if (prevNumeric === nextNumeric) return prev;
      return formatted;
    });
  }, [value]);

  const handleChange = (e) => {
    const masked = maskCurrencyInput(e.target.value);
    setDisplay(masked);
    onChange?.(parseCurrencyInput(masked));
  };

  return (
    <div className={`${styles.wrapper} ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}>
      <span className={styles.prefix} aria-hidden="true">R$</span>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={display}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        className={styles.input}
        {...props}
      />
    </div>
  );
}
