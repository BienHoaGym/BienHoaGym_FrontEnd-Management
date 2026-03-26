// src/services/reportService.js
import api from './api'

export const reportService = {
  /**
   * Lấy báo cáo doanh thu chi tiết
   * @param {string} startDate - Định dạng YYYY-MM-DD
   * @param {string} endDate - Định dạng YYYY-MM-DD
   */
  async getRevenueReport(startDate, endDate) {
    const params = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    
    const response = await api.get('/Reports/revenue', { params })
    return response.data
  },

  async getAssetInventoryStats() {
    const response = await api.get('/Reports/assets-inventory')
    return response.data
  },

  async getOperatingCostReport(month, year) {
    const response = await api.get('/Reports/operating-costs', { params: { month, year } })
    return response.data
  },

  /**
   * Seed dữ liệu mẫu cho báo cáo
   */
  async seedData() {
    const response = await api.post('/Reports/seed')
    return response.data
  }
}
