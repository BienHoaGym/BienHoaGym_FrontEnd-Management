// src/stores/package.js
import { defineStore } from 'pinia'
import { packageService } from '@/services/packageService'

export const usePackageStore = defineStore('package', {
  state: () => ({
    packages: [],
    currentPackage: null,
    loading: false,
    saving: false,
    error: null,
  }),

  getters: {
    activePackages: (state) => state.packages.filter((p) => p.isActive),
    totalPackages: (state) => state.packages.length,
  },

  actions: {
    async fetchPackages() {
      this.loading = true
      this.error = null
      try {
        const response = await packageService.getAll()
        if (response.success || response.Success) {
           this.packages = response.data || response.Data || []
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to load packages'
      } finally {
        this.loading = false
      }
    },

    async createPackage(data) {
      this.saving = true
      try {
        const response = await packageService.create(data)
        if (response.success) {
          await this.fetchPackages()
          return { success: true, data: response.data }
        }
        return { success: false, message: response.message }
      } catch (err) {
        return { success: false, message: err.response?.data?.message || 'Create failed' }
      } finally {
        this.saving = false
      }
    },

    async updatePackage(id, data) {
      this.saving = true
      try {
        const response = await packageService.update(id, data)
        if (response.success) {
          await this.fetchPackages()
          return { success: true, data: response.data }
        }
        return { success: false, message: response.message }
      } catch (err) {
        return { success: false, message: err.response?.data?.message || 'Update failed' }
      } finally {
        this.saving = false
      }
    },

    async deletePackage(id) {
      this.loading = true
      try {
        const response = await packageService.delete(id)
        if (response.success) {
          await this.fetchPackages()
          return { success: true }
        }
        return { success: false, message: response.message }
      } catch (err) {
        return { success: false, message: err.response?.data?.message || 'Delete failed' }
      } finally {
        this.loading = false
      }
    },
  },
})
