// src/services/authService.js
import api from './api'

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
export const authService = {
  /**
   * Login user
   * @param {string} username 
   * @param {string} password 
   * @returns {Promise} Response with token and user data
   */
  async login(username, password) {
    try {
      // SỬA: Thêm /api vào trước đường dẫn
      const response = await api.post('/Auth/login', {
        username,
        password
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Logout user
   * @returns {Promise} Response
   */
  async logout() {
    try {
      // SỬA: Thêm /api vào trước đường dẫn
      const response = await api.post('/Auth/logout')
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Get current user info
   * @returns {Promise} User data
   */
  async getCurrentUser() {
    try {
      // SỬA: Thêm /api vào trước đường dẫn
      const response = await api.get('/Auth/me')
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Verify token is still valid
   * @returns {Promise<boolean>}
   */
  async verifyToken() {
    try {
      // SỬA: Thêm /api vào trước đường dẫn
      const response = await api.get('/Auth/me')
      return response.data.success
    } catch (error) {
      return false
    }
  }
}