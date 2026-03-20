// src/services/auditLogService.js
import api from './api' // Đảm bảo đường dẫn file api.js của bạn là đúng

export const auditLogService = {
  async getAll(params) {
    try {
      const response = await api.get('/AuditLogs', { params })
      return response.data
    } catch (error) {
      return error.response?.data || { success: false, data: [] }
    }
  }
}