import { CurrencyInput } from '../../CurrencyInput';

export function FinancialFormField({ label, required, hint, children, error }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-300">
          {label}
          {required && <span className="text-brand-gold ml-1">*</span>}
        </label>
        {hint && <span className="text-[10px] text-gray-600">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-xs text-brand-red">{error}</p>}
    </div>
  );
}

export function FinancialSelect({ value, onChange, children, placeholder, ...props }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="financial-input cursor-pointer"
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {children}
    </select>
  );
}

export function FinancialCurrencyInput({ value, onChange, disabled, ...props }) {
  return (
    <CurrencyInput
      value={value}
      onChange={onChange}
      variant="financial"
      disabled={disabled}
      {...props}
    />
  );
}

export function FinancialInput({ className = '', ...props }) {
  return <input className={`financial-input ${className}`} {...props} />;
}

export const FINANCIAL_INPUT_STYLES = `
  .financial-input {
    width: 100%;
    background-color: #0a0a0a;
    border: 1px solid #1f1f1f;
    border-radius: 0.75rem;
    padding: 0.875rem 1rem;
    color: white;
    font-size: 0.875rem;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .financial-input.flex { padding: 0; }
  .financial-input::placeholder { color: #4b5563; }
  .financial-input:hover:not(:disabled):not(.opacity-50) { border-color: #2a2a2a; }
  .financial-input:focus-within {
    outline: none;
    border-color: #FACC15;
    box-shadow: 0 0 0 3px rgba(250, 204, 21, 0.1);
  }
  .financial-input:disabled { opacity: 0.5; cursor: not-allowed; }
  input[type="date"].financial-input { cursor: pointer; }
  input[type="date"].financial-input::-webkit-calendar-picker-indicator {
    filter: invert(0.7);
    cursor: pointer;
  }
`;
