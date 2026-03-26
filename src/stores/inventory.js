import { defineStore } from 'pinia'
import { inventoryService } from '@/services/inventoryService'

export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    inventories: [],
    transactions: [],
    warehouses: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchWarehouses() {
      const r = await inventoryService.getWarehouses()
      if (r.success) this.warehouses = r.data
    },
    async fetchInventories(warehouseId = null, includeAssets = false) {
      this.loading = true
      try {
        const r = await inventoryService.getInventories(warehouseId, includeAssets)
        if (r.success) this.inventories = r.data
      } catch (e) {
        this.error = 'Failed to load inventory'
      } finally { this.loading = false }
    },
    async fetchTransactions(productId = null, warehouseId = null) {
      this.loading = true
      try {
        const r = await inventoryService.getTransactions(productId, warehouseId)
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
    async transferStock(data) {
      const r = await inventoryService.transferStock(data)
      if (r.success) await this.fetchInventories()
      return r
    },
    async internalUseStock(data) {
      const r = await inventoryService.internalUseStock(data)
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
    },
    async createInternalSupply(data) {
      const r = await inventoryService.createInternalSupply(data)
      if (r.success) await this.fetchInventories()
      return r
    }
  }
})
