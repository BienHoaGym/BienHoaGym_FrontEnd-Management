import api from './api';

const CATEGORY_API = '/EquipmentCategories';

export const equipmentCategoryService = {
  getAll(params) {
     return api.get(CATEGORY_API, { params }).then(r => r.data);
  },
  getById(id) {
    return api.get(`${CATEGORY_API}/${id}`).then(r => r.data);
  },
  create(data) {
    return api.post(CATEGORY_API, data).then(r => r.data);
  },
  update(id, data) {
    return api.put(`${CATEGORY_API}/${id}`, data).then(r => r.data);
  },
  delete(id) {
    return api.delete(`${CATEGORY_API}/${id}`).then(r => r.data);
  }
};

export default equipmentCategoryService;
