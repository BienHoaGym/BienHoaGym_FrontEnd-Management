// src/services/paymentService.js
import api from './api'

export const paymentService = {
  async getAll() {
    const response = await api.get('/Payments')
    return response.data
  },
  async getById(id) {
    const response = await api.get(`/Payments/${id}`)
    return response.data
  },
  async getBySubscription(subscriptionId) {
    const response = await api.get(`/Payments/subscription/${subscriptionId}`)
    return response.data
  },
  async process(data) {
    const response = await api.post('/Payments/process', data)
    return response.data
  },
  async refund(id, reason) {
    const response = await api.post(`/Payments/${id}/refund`, JSON.stringify(reason), {
      headers: { 'Content-Type': 'application/json' },
    })
    return response.data
  },
}
