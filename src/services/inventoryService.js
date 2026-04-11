import api from './api'

export const inventoryService = {
  async getWarehouses() {
    const response = await api.get('/Inventory/warehouses')
    return response.data
  },
  async createWarehouse(data) {
    const response = await api.post('/Inventory/warehouses', data)
    return response.data
  },
  async getInventories(warehouseId = null, includeAssets = false) {
    const response = await api.get('/Inventory', { params: { warehouseId, includeAssets } })
    return response.data
  },
  async getTransactions(productId = null, warehouseId = null) {
    const response = await api.get('/Inventory/transactions', { params: { productId, warehouseId } })
    return response.data
  },
  async importStock(data) {
    const response = await api.post('/Inventory/import', data)
    return response.data
  },
  async exportStock(data) {
    const response = await api.post('/Inventory/export', data)
    return response.data
  },
  async transferStock(data) {
    const response = await api.post('/Inventory/transfer', data)
    return response.data
  },
  async internalUseStock(data) {
    const response = await api.post('/Inventory/internal-use', data)
    return response.data
  },
  async getAlerts() {
    const response = await api.get('/Inventory/alerts')
    return response.data
  },
  async adjustment(data) {
    const response = await api.post('/Inventory/adjustment', data)
    return response.data
  },
  async createInternalSupply(data) {
    const response = await api.post('/Inventory/internal-supply', data)
    return response.data
  },
  async getAudits() {
    const response = await api.get('/Inventory/audits')
    return response.data
  },
  async createAudit(warehouseId, note) {
    const response = await api.post('/Inventory/audits', null, { params: { warehouseId, note } })
    return response.data
  },
  async updateAuditDetail(auditId, productId, actualQuantity, reason) {
    const response = await api.put(`/Inventory/audits/${auditId}/detail`, null, { params: { productId, actualQuantity, reason } })
    return response.data
  },
  async approveAudit(auditId) {
    const response = await api.post(`/Inventory/audits/${auditId}/approve`)
    return response.data
  },
  async getTurnoverReport() {
    const response = await api.get('/Inventory/turnover')
    return response.data
  }
}
