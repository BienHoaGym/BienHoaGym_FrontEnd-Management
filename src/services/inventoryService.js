import api from './api'

export const inventoryService = {
  async getInventories() {
    const response = await api.get('/Inventory')
    return response.data
  },
  async getTransactions(productId = null) {
    const response = await api.get('/Inventory/transactions', { params: { productId } })
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
  async getAlerts() {
    const response = await api.get('/Inventory/alerts')
    return response.data
  },
  async adjustment(data) {
    const response = await api.post('/Inventory/adjustment', data)
    return response.data
  }
}
