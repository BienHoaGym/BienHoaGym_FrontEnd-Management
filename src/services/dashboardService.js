// src/services/dashboardService.js
import api from './api'

export const dashboardService = {
  /**
   * Lấy toàn bộ stats dashboard trong 1 request
   */
  async getStats() {
    const response = await api.get('/Dashboard/stats')
    return response.data
  },

  /**
   * Biểu đồ check-in 7 ngày gần nhất
   */
  async getCheckinChart() {
    const response = await api.get('/Dashboard/checkin-chart')
    return response.data
  }
}