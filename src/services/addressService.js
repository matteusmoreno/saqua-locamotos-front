import { api } from './api';

export const AddressService = {
  getAddressByZipCode: (zipCode) => api.get('/addresses', { params: { zipCode } }),
};