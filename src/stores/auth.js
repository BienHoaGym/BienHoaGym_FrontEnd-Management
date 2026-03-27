// src/stores/auth.js
import { defineStore } from 'pinia'
import { authService } from '@/services/authService'
import { jwtDecode } from 'jwt-decode'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null
  }),

  getters: {
    // --- LẤY THÔNG TIN CƠ BẢN ---
    userRole: (state) => state.user?.role,
    userName: (state) => state.user?.fullName,
    userEmail: (state) => state.user?.email,
    userId: (state) => state.user?.id,
    translatedRole: (state) => {
      const role = state.user?.role
      const map = {
        'Admin': 'Quản trị viên',
        'Manager': 'Quản lý',
        'Receptionist': 'Lễ tân',
        'Trainer': 'Huấn luyện viên',
        'Accountant': 'Kế toán'
      }
      return map[role] || role
    },

    // --- KIỂM TRA ROLE CHÍNH XÁC ---
    isAdmin: (state) => state.user?.role === 'Admin',
    isManager: (state) => state.user?.role === 'Manager',
    isReceptionist: (state) => state.user?.role === 'Receptionist',
    isTrainer: (state) => state.user?.role === 'Trainer',
    isAccountant: (state) => state.user?.role === 'Accountant',

    // --- KIỂM TRA QUYỀN (Dùng để ẩn/hiện giao diện) ---
    canManageSystem: (state) => ['Admin', 'Manager'].includes(state.user?.role),
    canManageFinance: (state) => ['Admin', 'Manager', 'Accountant'].includes(state.user?.role),
    canHandleCheckIn: (state) => ['Admin', 'Manager', 'Receptionist'].includes(state.user?.role),

    hasRole: (state) => {
      return (roles) => {
        if (!state.user?.role) return false
        if (Array.isArray(roles)) {
          return roles.includes(state.user.role)
        }
        return state.user.role === roles
      }
    },
    
    // --- KIỂM TRA QUYỀN RBAC (DÙNG PERMISSIONS) ---
    hasPermission: (state) => {
      return (permission) => {
        if (!state.user) return false
        
        // Admin/Manager mặc định có quyền cao nhất
        if (state.user.role === 'Admin' || state.user.role === 'Manager') return true
        
        // Kiểm tra trong danh sách permissions
        const perms = state.user.permissions || []
        if (perms.includes('*')) return true
        
        return perms.includes(permission)
      }
    }
  },

  actions: {
    async login(username, password) {
      this.loading = true
      this.error = null

      try {
        const response = await authService.login(username, password)
        
        if (response.success) {
          this.token = response.data.accessToken
          this.user = response.data.user
          this.isAuthenticated = true

          localStorage.setItem('token', this.token)
          localStorage.setItem('user', JSON.stringify(this.user))

          this.loading = false
          return { success: true, user: this.user }
        } else {
          this.loading = false
          this.error = response.message || 'Login failed'
          return { success: false, message: this.error }
        }
      } catch (error) {
        this.loading = false
        const errorMessage = error.response?.data?.message || 'Invalid username or password'
        this.error = errorMessage
        return { success: false, message: errorMessage }
      }
    },

    async logout() {
      try {
        await authService.logout()
      } catch (error) {
        console.error('Logout API call failed:', error)
      } finally {
        this.token = null
        this.user = null
        this.isAuthenticated = false
        this.error = null
        
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    },

    checkTokenExpiration() {
      if (!this.token) return false
      
      try {
        const decoded = jwtDecode(this.token)
        const currentTime = Date.now() / 1000
        
        if (decoded.exp < currentTime) {
          this.logout()
          return false
        }
        
        return true
      } catch (error) {
        console.error('Error decoding token:', error)
        this.logout()
        return false
      }
    },

    initializeAuth() {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')

      if (token && user) {
        this.token = token
        this.user = JSON.parse(user)
        this.isAuthenticated = true

        if (!this.checkTokenExpiration()) {
          this.logout()
        }
      }
    },

    async refreshUserData() {
      try {
        const response = await authService.getCurrentUser()
        if (response.success) {
          this.user = response.data
          localStorage.setItem('user', JSON.stringify(this.user))
        }
      } catch (error) {
        console.error('Failed to refresh user data:', error)
      }
    }
  }
})