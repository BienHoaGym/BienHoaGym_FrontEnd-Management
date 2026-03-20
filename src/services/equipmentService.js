import api from './api'

export const equipmentService = {
  async getEquipments(params) {
    const response = await api.get('/Equipment', { params })
    return response.data
  },
  async getById(id) {
    const response = await api.get(`/Equipment/${id}`)
    return response.data
  },
  async create(data) {
    const response = await api.post('/Equipment', data)
    return response.data
  },
  async update(id, data) {
    const response = await api.put(`/Equipment/${id}`, data)
    return response.data
  },
  async delete(id) {
    const response = await api.delete(`/Equipment/${id}`)
    return response.data
  },
  async liquidate(id) {
    const response = await api.post(`/Equipment/${id}/liquidate`)
    return response.data
  },
  async getProviderHistory(id) {
    const response = await api.get(`/Equipment/${id}/provider-history`)
    return response.data
  },
  async getTransactions(equipmentId = null) {
    const response = await api.get('/Equipment/transactions', { params: { equipmentId } })
    return response.data
  },
  async logMaintenance(data) {
    const response = await api.post('/Equipment/maintenance', data)
    return response.data
  },
  async getMaintenanceLogs(equipmentId = null) {
    const response = await api.get('/Equipment/maintenance', { params: { equipmentId } })
    return response.data
  },
  async getIncidentLogs(equipmentId = null) {
    const response = await api.get('/Equipment/incidents', { params: { equipmentId } })
    return response.data
  },
  async logIncident(data) {
    const response = await api.post('/Equipment/incidents', data)
    return response.data
  },
  async getDepreciations(equipmentId = null) {
    const response = await api.get('/Equipment/depreciations', { params: { equipmentId } })
    return response.data
  },
  async getMaintenancePlan() {
    const response = await api.get('/Equipment/maintenance/plan')
    return response.data
  }
}
