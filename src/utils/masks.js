// Máscara para CPF: 000.000.000-00
export const maskCpf = (value) => {
  if (!value) return '';
  return value
    .replace(/\D/g, '') // Remove tudo o que não é dígito
    .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto entre o terceiro e o quarto dígitos
    .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto entre o sexto e o sétimo dígitos
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2') // Coloca traço entre o nono e o décimo dígitos
    .slice(0, 14); // Limita o tamanho
};

// Máscara para Telefone: (00)00000-0000
export const maskPhone = (value) => {
  if (!value) return '';
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1)$2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 14);
};

// Máscara para CEP: 00000-000
export const maskCep = (value) => {
  if (!value) return '';
  return value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 9);
};