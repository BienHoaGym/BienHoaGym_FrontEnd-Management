// src/services/checkinService.js
import api from './api'

export const checkinService = {
  async validate(memberCode) {
    try {
      const response = await api.post('/CheckIns/validate', { memberCode })
      return response.data
    } catch (error) {
      // Bắt lỗi 400 và trả về nguyên trạng cục data báo lỗi của C#
      return error.response?.data || { success: false, message: 'Lỗi kết nối máy chủ' }
    }
  },

  async checkIn(memberCode) {
    try {
      const payload = { memberCode: memberCode }
      const response = await api.post('/CheckIns', payload)
      return response.data
    } catch (error) {
      return error.response?.data || { success: false, message: 'Lỗi kết nối máy chủ' }
    }
  },


  async faceCheckIn(faceEncoding) {
    try {
      const response = await api.post('/CheckIns/face', { faceEncoding: faceEncoding })
      return response.data
    } catch (error) {
      return error.response?.data || { success: false, message: 'Lỗi nhận diện khuôn mặt' }
    }
  },

  async checkOut(id) {
    try {
      const response = await api.put(`/CheckIns/${id}/checkout`)
      return response.data
    } catch (error) {
      return error.response?.data || { success: false, message: 'Lỗi kết nối' }
    }
  },

  async getToday() {
    try {
      const response = await api.get('/CheckIns/today')
      return response.data
    } catch (error) {
      return error.response?.data || { success: false, data: [] }
    }
  },

  async getByMember(memberId) {
    try {
      // ĐÃ SỬA: Đổi từ /members/ sang /member/ để khớp 100% với Controller C#
      const response = await api.get(`/CheckIns/member/${memberId}`)
      return response.data
    } catch (error) {
      return error.response?.data || { success: false, data: [] }
    }
  }
}