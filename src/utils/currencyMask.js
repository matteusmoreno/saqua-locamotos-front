/** Formata dígitos digitados como moeda BRL (ex: "12345" → "123,45") */
export function maskCurrencyInput(rawValue) {
  const digits = String(rawValue ?? '').replace(/\D/g, '');
  if (!digits) return '';
  const cents = parseInt(digits, 10);
  return (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Converte string formatada ou número para valor decimal */
export function parseCurrencyInput(value) {
  if (value === '' || value === null || value === undefined) return 0;
  if (typeof value === 'number') return isNaN(value) ? 0 : value;

  const digits = String(value).replace(/\D/g, '');
  if (!digits) return 0;
  return parseInt(digits, 10) / 100;
}

/** Converte número para exibição no input (ex: 300 → "300,00") */
export function numberToCurrencyInput(value) {
  if (value === '' || value === null || value === undefined) return '';
  const num = Number(value);
  if (isNaN(num)) return '';
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
