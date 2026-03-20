import { defineStore } from 'pinia'
import { inventoryService } from '@/services/inventoryService'

export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    inventories: [],
    transactions: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchInventories() {
      this.loading = true
      try {
        const r = await inventoryService.getInventories()
        if (r.success) this.inventories = r.data
      } catch (e) {
        this.error = 'Failed to load inventory'
      } finally { this.loading = false }
    },
    async fetchTransactions(productId = null) {
      this.loading = true
      try {
        const r = await inventoryService.getTransactions(productId)
        if (r.success) this.transactions = r.data
      } catch (e) {
        this.error = 'Failed to load stock history'
      } finally { this.loading = false }
    },
    async importStock(data) {
      const r = await inventoryService.importStock(data)
      if (r.success) await this.fetchInventories()
      return r
    },
    async exportStock(data) {
      const r = await inventoryService.exportStock(data)
      if (r.success) await this.fetchInventories()
      return r
    },
    async fetchAlerts() {
      this.loading = true
      try {
        const r = await inventoryService.getAlerts()
        return r
      } catch (e) {
        return { success: false, message: 'Failed to fetch alerts' }
      } finally { this.loading = false }
    },
    async stockAdjustment(data) {
      const r = await inventoryService.adjustment(data)
      if (r.success) await this.fetchInventories()
      return r
    }
  }
})
