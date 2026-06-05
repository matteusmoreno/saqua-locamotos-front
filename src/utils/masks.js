// Máscara para CPF: 000.000.000-00
export const maskCpf = (value) => {
  if (!value) return '';
  return value
    .replace(/\D/g, '') // Remove tudo o que não é dígito
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
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

// Nova Máscara para Ano da Moto: 0000/0000
export const maskYear = (value) => {
  if (!value) return '';
  return value
    .replace(/\D/g, '') // Remove letras
    .replace(/(\d{4})(\d)/, '$1/$2') // Coloca a barra após os primeiros 4 dígitos
    .slice(0, 9); // Limita ao tamanho YYYY/YYYY (9 caracteres)
};