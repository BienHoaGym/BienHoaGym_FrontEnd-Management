import { defineStore } from 'pinia'
import { productService } from '@/services/productService'

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    categories: [],
    loading: false,
    saving: false,
    error: null
  }),
  actions: {
    async fetchProducts(params = {}) {
      this.loading = true
      try {
        const r = await productService.getAll(params)
        if (r.success) this.products = r.data
        return r
      } catch (e) {
        this.error = 'Lỗi khi tải danh sách sản phẩm'
      } finally { this.loading = false }
    },
    async fetchCategories() {
      const r = await productService.getCategories()
      if (r.success) this.categories = r.data
    },
    async createProduct(data) {
      this.saving = true
      try {
        const r = await productService.create(data)
        if (r.success) await this.fetchProducts()
        return r
      } finally { this.saving = false }
    },
    async updateProduct(id, data) {
      this.saving = true
      try {
        const r = await productService.update(id, data)
        if (r.success) await this.fetchProducts()
        return r
      } finally { this.saving = false }
    },
    async deleteProduct(id) {
      try {
        const r = await productService.delete(id)
        if (r.success) await this.fetchProducts()
        return r
      } catch (e) {
        return { success: false, message: 'Lỗi khi xóa sản phẩm' }
      }
    },
    async toggleStatus(id) {
      const r = await productService.toggleStatus(id)
      if (r.success) {
        const index = this.products.findIndex(p => p.id === id)
        if (index !== -1) {
          this.products[index].isActive = !this.products[index].isActive
        }
      }
      return r
    }
  }
})
