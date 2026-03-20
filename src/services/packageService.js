// src/services/packageService.js
import api from './api'

export const packageService = {
  async getAll() {
    const response = await api.get('/Packages')
    return response.data
  },
  async getById(id) {
    const response = await api.get(`/Packages/${id}`)
    return response.data
  },
  async getActive() {
    const response = await api.get('/Packages/active')
    return response.data
  },
  async create(data) {
    const response = await api.post('/Packages', data)
    return response.data
  },
  async update(id, data) {
    const response = await api.put(`/Packages/${id}`, data)
    return response.data
  },
  async delete(id) {
    const response = await api.delete(`/Packages/${id}`)
    return response.data
  },
}
