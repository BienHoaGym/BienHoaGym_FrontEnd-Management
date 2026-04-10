import { defineStore } from 'pinia'
import { billingService } from '@/services/billingService'

export const useBillingStore = defineStore('billing', {
  state: () => ({
    products: [],
    invoices: [],
    loading: false,
    saving: false,
    error: null
  }),
  actions: {
    async fetchProducts() {
      this.loading = true
      try {
        const r = await billingService.getProducts()
        if (r.success || r.Success) this.products = r.data || r.Data || []
      } catch (e) {
        this.error = 'Failed to load products'
      } finally { this.loading = false }
    },
    async fetchInvoices() {
      this.loading = true
      try {
        const r = await billingService.getInvoices()
        if (r.success || r.Success) this.invoices = r.data || r.Data || []
      } catch (e) {
        this.error = 'Failed to load invoices'
      } finally { this.loading = false }
    },
    async createInvoice(data) {
      this.saving = true
      try {
        const r = await billingService.createInvoice(data)
        if (r.success || r.Success) {
          await this.fetchInvoices()
          return { success: true, data: r.data || r.Data }
        }
        return { success: false, message: r.message || r.Message }
      } catch (e) {
        return { success: false, message: e.response?.data?.message || 'Transaction failed' }
      } finally { this.saving = false }
    },
    async createProduct(data) {
      this.saving = true
      try {
        const r = await billingService.createProduct(data)
        if (r.success || r.Success) {
          await this.fetchProducts()
          return { success: true, data: r.data || r.Data }
        }
        return { success: false, message: r.message || r.Message }
      } catch (e) {
        return { success: false, message: 'Failed to create product' }
      } finally { this.saving = false }
    },
    async downloadPdf(id) {
      try {
        return await billingService.downloadInvoicePdf(id)
      } catch (e) {
        console.error('Download PDF error:', e)
        return false
      }
    }
  }
})
