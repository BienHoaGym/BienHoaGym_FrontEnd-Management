// src/stores/class.js
import { defineStore } from 'pinia'
import { classService } from '@/services/classService'

export const useClassStore = defineStore('class', {
  state: () => ({
    classes: [],
    loading: false,
    saving: false,
    error: null
  }),
  getters: {
    activeClasses: (s) => s.classes.filter(c => c.isActive && !c.isDeleted)
  },
  actions: {
    async fetchAll() {
      this.loading = true
      try {
        const r = await classService.getAll()
        if (r.success) this.classes = r.data
      } catch (e) {
        this.error = e.response?.data?.message || 'Load failed'
      } finally { this.loading = false }
    },
    async create(data) {
      this.saving = true
      try {
        const r = await classService.create(data)
        if (r.success) { 
          await this.fetchAll()
          return { success: true, data: r.data } 
        }
        return { success: false, message: r.message }
      } catch (e) {
        return { success: false, message: e.response?.data?.message || 'Create failed' }
      } finally { this.saving = false }
    },
    async update(id, data) {
      this.saving = true
      try {
        const r = await classService.update(id, data)
        if (r.success) { 
          await this.fetchAll()
          return { success: true } 
        }
        return { success: false, message: r.message }
      } catch (e) {
        return { success: false, message: e.response?.data?.message || 'Update failed' }
      } finally { this.saving = false }
    },
    async remove(id) {
      this.loading = true
      try {
        const r = await classService.delete(id)
        if (r.success) { 
          await this.fetchAll()
          return { success: true } 
        }
        return { success: false, message: r.message }
      } catch (e) {
        const errorMsg = e.response?.data?.message || e.response?.data?.Message || 'Lỗi không xác định khi xóa lớp'
        return { success: false, message: errorMsg }
      } finally { this.loading = false }
    },
    async enroll(classId, memberId) {
      try {
        const r = await classService.enroll(classId, memberId)
        if (r.success) { 
          await this.fetchAll()
          return { success: true } 
        }
        return { success: false, message: r.message }
      } catch (e) {
        return { success: false, message: e.response?.data?.message || 'Enroll failed' }
      }
    },
    async unenroll(classId, memberId) {
      try {
        const r = await classService.unenroll(classId, memberId)
        if (r.success) { 
          await this.fetchAll()
          return { success: true } 
        }
        return { success: false, message: r.message }
      } catch (e) {
        return { success: false, message: e.response?.data?.message || 'Unenroll failed' }
      }
    },
    async getEnrollments(classId) {
      try {
        const r = await classService.getEnrollments(classId)
        return r
      } catch (e) {
        return { success: false, message: e.response?.data?.message || 'Load failed' }
      }
    },
    async markAttendance(data) {
      try {
        const r = await classService.markAttendance(data)
        return r
      } catch (e) {
        return { success: false, message: e.response?.data?.message || 'Mark attendance failed' }
      }
    }
  }
})