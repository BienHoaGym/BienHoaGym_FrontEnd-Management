// src/stores/checkin.js
import { defineStore } from 'pinia'
import { checkinService } from '@/services/checkinService'

export const useCheckinStore = defineStore('checkin', {
  state: () => ({
    todayCheckins: [],
    validationResult: null,
    loading: false,
    validating: false,
    error: null,
  }),

  getters: {
    todayTotal: (state) => state.todayCheckins.length,
    currentlyInGym: (state) => state.todayCheckins.filter((c) => !c.checkOutTime).length,
  },

  actions: {
    async validateMember(memberCode) {
      this.validating = true
      this.validationResult = null
      try {
        const response = await checkinService.validate(memberCode)
        this.validationResult = response
        return response
      } catch (err) {
        const result = {
          success: false,
          message: err.response?.data?.message || 'Validation failed',
        }
        this.validationResult = result
        return result
      } finally {
        this.validating = false
      }
    },

    async checkIn(memberCode) {
      this.loading = true
      try {
        const response = await checkinService.checkIn({ memberCode })
        if (response.success) {
          await this.fetchToday()
          return { success: true, data: response.data }
        }
        return { success: false, message: response.message }
      } catch (err) {
        return { success: false, message: err.response?.data?.message || 'Check-in failed' }
      } finally {
        this.loading = false
      }
    },

    async checkOut(id) {
      this.loading = true
      try {
        const response = await checkinService.checkOut(id)
        if (response.success) {
          await this.fetchToday()
          return { success: true }
        }
        return { success: false, message: response.message }
      } catch (err) {
        return { success: false, message: err.response?.data?.message || 'Check-out failed' }
      } finally {
        this.loading = false
      }
    },

    async fetchToday() {
      this.loading = true
      try {
        const response = await checkinService.getToday()
        if (response.success) this.todayCheckins = response.data
      } catch (err) {
        this.error = 'Failed to load today check-ins'
      } finally {
        this.loading = false
      }
    },
  },
})
