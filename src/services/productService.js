import api from './api'

export const productService = {
  async getAll(params = {}) {
    const response = await api.get('/Products', { params })
    return response.data
  },
  async getById(id) {
    const response = await api.get(`/Products/${id}`)
    return response.data
  },
  async create(data) {
    const response = await api.post('/Products', data)
    return response.data
  },
  async update(id, data) {
    const response = await api.put(`/Products/${id}`, data)
    return response.data
  },
  async delete(id) {
    const response = await api.delete(`/Products/${id}`)
    return response.data
  },
  async toggleStatus(id) {
    const response = await api.patch(`/Products/${id}/toggle-status`)
    return response.data
  },
  async getCategories() {
    const response = await api.get('/Products/categories')
    return response.data
  }
}
