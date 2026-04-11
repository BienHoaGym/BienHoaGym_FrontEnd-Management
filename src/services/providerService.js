import api from './api';

const PROVIDER_API = '/Providers';

export const providerService = {
  getAll(params) {
    return api.get(PROVIDER_API, { params }).then(r => r.data);
  },
  getById(id) {
    return api.get(`${PROVIDER_API}/${id}`).then(r => r.data);
  },
  getHistory(id) {
    return api.get(`${PROVIDER_API}/${id}/history`).then(r => r.data);
  },
  getProducts(id) {
    return api.get(`${PROVIDER_API}/${id}/products`).then(r => r.data);
  },
  getEquipments(id) {
    return api.get(`${PROVIDER_API}/${id}/equipments`).then(r => r.data);
  },
  create(data) {
    return api.post(PROVIDER_API, data).then(r => r.data);
  },
  update(id, data) {
    return api.put(`${PROVIDER_API}/${id}`, data).then(r => r.data);
  },
  delete(id) {
    return api.delete(`${PROVIDER_API}/${id}`).then(r => r.data);
  },
  payDebt(data) {
    return api.post(`${PROVIDER_API}/pay-debt`, data).then(r => r.data);
  }
};

export default providerService;
