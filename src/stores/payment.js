// src/stores/payment.js
import { defineStore } from 'pinia'
import { paymentService } from '@/services/paymentService'

export const usePaymentStore = defineStore('payment', {
  state: () => ({
    payments: [],
    loading: false,
    saving: false,
    error: null,
  }),
  actions: {
    async fetchAll() {
      this.loading = true
      try {
        const response = await paymentService.getAll()
        if (response.success) this.payments = response.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to load payments'
      } finally {
        this.loading = false
      }
    },

    async processPayment(data) {
      this.saving = true
      try {
        const response = await paymentService.process(data)
        if (response.success) {
          await this.fetchAll()
          return { success: true, data: response.data }
        }
        return { success: false, message: response.message }
      } catch (err) {
        return { success: false, message: err.response?.data?.message || 'Payment failed' }
      } finally {
        this.saving = false
      }
    },

    async refundPayment(id, reason) {
      this.loading = true
      try {
        const response = await paymentService.refund(id, reason)
        if (response.success) {
          await this.fetchAll()
          return { success: true }
        }
        return { success: false, message: response.message }
      } catch (err) {
        return { success: false, message: err.response?.data?.message || 'Refund failed' }
      } finally {
        this.loading = false
      }
    },
  },
})
