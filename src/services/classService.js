// src/services/classService.js
import api from './api'

export const classService = {
  async getAll() {
    const response = await api.get('/Classes')
    return response.data
  },
  async getActive() {
    const response = await api.get('/Classes/active')
    return response.data
  },
  async getById(id) {
    const response = await api.get(`/Classes/${id}`)
    return response.data
  },
  async create(data) {
    const response = await api.post('/Classes', data)
    return response.data
  },
  async update(id, data) {
    const response = await api.put(`/Classes/${id}`, data)
    return response.data
  },
  async delete(id) {
    const response = await api.delete(`/Classes/${id}`)
    return response.data
  },
  async enroll(classId, memberId) {
    const response = await api.post(`/Classes/${classId}/enroll`, { memberId })
    return response.data
  },
  async unenroll(classId, memberId) {
    const response = await api.post(`/Classes/${classId}/unenroll/${memberId}`)
    return response.data
  },
  async getEnrollments(classId) {
    const response = await api.get(`/Classes/${classId}/enrollments`)
    return response.data
  },
  async markAttendance(data) {
    const response = await api.post('/Classes/attendance', data)
    return response.data
  }
}
