import { defineStore } from 'pinia'
import { subscriptionService } from '@/services/subscriptionService'

export const useSubscriptionStore = defineStore('subscription', {
  state: () => ({
    subscriptions: [],
    expiringSubscriptions: [],
    loading: false,
    saving: false,
    error: null,
  }),

  getters: {
    // Lọc các gói đang hoạt động (Backend trả về status 'Active')
    activeSubscriptions: (state) => state.subscriptions.filter((s) => s.status === 'Active'),
    
    // Đếm tổng số gói Active
    totalActive: (state) => state.subscriptions.filter((s) => s.status === 'Active').length,
    
    // Đếm số gói sắp hết hạn
    expiringCount: (state) => state.expiringSubscriptions.length,
  },

  actions: {
    async fetchAll() {
      this.loading = true
      this.error = null
      try {
        const response = await subscriptionService.getAll()
        
        // Hỗ trợ cả 2 trường hợp response từ API (camelCase hoặc PascalCase)
        if (response.success || response.Success) {
          this.subscriptions = response.data || response.Data || []
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Không thể tải danh sách gói tập'
        console.error('Fetch All Error:', err)
      } finally {
        this.loading = false
      }
    },

    async fetchExpiring(days = 7) {
      try {
        const response = await subscriptionService.getExpiring(days)
        if (response.success || response.Success) {
          this.expiringSubscriptions = response.data || response.Data || []
        }
      } catch (err) {
        console.error('Failed to load expiring subscriptions:', err)
      }
    },

    async fetchByMember(memberId) {
      this.loading = true
      try {
        const response = await subscriptionService.getByMember(memberId)
        if (response.success || response.Success) {
          return response.data || response.Data || []
        }
        return []
      } catch (err) {
        console.error('Fetch By Member Error:', err)
        return []
      } finally {
        this.loading = false
      }
    },

    async createSubscription(data) {
      this.saving = true
      try {
        const response = await subscriptionService.create(data)
        if (response.success || response.Success) {
          await this.fetchAll() // Load lại danh sách ngay lập tức
          return { success: true, data: response.data || response.Data }
        }
        return { success: false, message: response.message || response.Message }
      } catch (err) {
        return { 
          success: false, 
          message: err.response?.data?.message || 'Đăng ký thất bại' 
        }
      } finally {
        this.saving = false
      }
    },

    async activateSubscription(id) {
      this.loading = true
      try {
        const response = await subscriptionService.activate(id)
        if (response.success || response.Success) {
          await this.fetchAll() // Cập nhật lại trạng thái trên UI
          return { success: true }
        }
        return { success: false, message: response.message || response.Message }
      } catch (err) {
        return { 
          success: false, 
          message: err.response?.data?.message || 'Kích hoạt thất bại' 
        }
      } finally {
        this.loading = false
      }
    },

    async cancelSubscription(id, reason) {
      this.loading = true
      try {
        // Gọi service (Service đã được sửa để gửi đúng định dạng JSON)
        const response = await subscriptionService.cancel(id, reason)
        
        if (response.success || response.Success) {
          await this.fetchAll() // Cập nhật lại trạng thái trên UI
          return { success: true }
        }
        return { success: false, message: response.message || response.Message }
      } catch (err) {
        return { 
          success: false, 
          message: err.response?.data?.message || 'Hủy gói thất bại' 
        }
      } finally {
        this.loading = false
      }
    },
  },
})