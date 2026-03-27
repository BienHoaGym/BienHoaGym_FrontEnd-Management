// src/services/trainerService.js
import api from './api'

export const trainerService = {
  async getAll() {
    const response = await api.get('/Trainers')
    return response.data
  },
  async getActive() {
    const response = await api.get('/Trainers/active')
    return response.data
  },
  async getById(id) {
    const response = await api.get(`/Trainers/${id}`)
    return response.data
  },
  async create(data) {
    const response = await api.post('/Trainers', data)
    return response.data
  },
  async update(id, data) {
    const response = await api.put(`/Trainers/${id}`, data)
    return response.data
  },
  async delete(id) {
    const response = await api.delete(`/Trainers/${id}`)
    return response.data
  },
  async getMembers(id) {
    const response = await api.get(`/Trainers/${id}/members`)
    return response.data
  },
  async assignMember(data) {
    const response = await api.post('/Trainers/assign', data)
    return response.data
  },
  async removeAssignment(assignmentId) {
    const response = await api.delete(`/Trainers/unassign/${assignmentId}`)
    return response.data
  },
  async getMySchedule() {
    const response = await api.get('/Trainers/me/schedule')
    return response.data
  }
}
