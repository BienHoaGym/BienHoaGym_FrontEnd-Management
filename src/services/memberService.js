// src/services/memberService.js
import api from './api'

export const memberService = {
  async getAll(page = 1, pageSize = 10) {
    const response = await api.get('/Members', {
      params: { page, pageSize },
    })
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/Members/${id}`)
    return response.data
  },

  async getByCode(memberCode) {
    const response = await api.get(`/Members/by-code/${memberCode}`)
    return response.data
  },

  async search(keyword) {
    const response = await api.get('/Members/search', {
      params: { keyword },
    })
    return response.data
  },

  async create(data) {
    const response = await api.post('/Members', data)
    return response.data
  },

  async update(id, data) {
    const response = await api.put(`/Members/${id}`, data)
    return response.data
  },

  async updateFace(id, faceEncoding) {
    const response = await api.put(`/Members/${id}/face`, JSON.stringify(faceEncoding))
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/Members/${id}`)
    return response.data
  },
}
