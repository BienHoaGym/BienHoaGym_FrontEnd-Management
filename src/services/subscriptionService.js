// src/services/subscriptionService.js
import api from './api'

export const subscriptionService = {
  async getAll() {
    const response = await api.get('/Subscriptions')
    return response.data
  },
  async getById(id) {
    const response = await api.get(`/Subscriptions/${id}`)
    return response.data
  },
  async getByMember(memberId) {
    const response = await api.get(`/Subscriptions/member/${memberId}`)
    return response.data
  },
  async getExpiring(days = 7) {
    const response = await api.get('/Subscriptions/expiring', { params: { days } })
    return response.data
  },
  async create(data) {
    const response = await api.post('/Subscriptions', data)
    return response.data
  },
  async activate(id) {
    const response = await api.put(`/Subscriptions/${id}/activate`)
    return response.data
  },
  async cancel(id, reason) {
    const payload = { reason: reason } 
    const response = await api.put(`/Subscriptions/${id}/cancel`, payload)
    return response.data
  },
  async renew(id, packageId) {
    const response = await api.post(`/Subscriptions/${id}/renew`, { packageId })
    return response.data
  },
  async pause(id, durationDays = null) {
    const response = await api.put(`/Subscriptions/${id}/pause`, null, { 
      params: { durationDays } 
    })
    return response.data
  },
  async resume(id) {
    const response = await api.put(`/Subscriptions/${id}/resume`)
    return response.data
  }
}