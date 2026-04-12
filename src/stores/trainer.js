// src/stores/trainer.js
import { defineStore } from 'pinia'
import { trainerService } from '@/services/trainerService'

export const useTrainerStore = defineStore('trainer', {
  state: () => ({
    trainers: [],
    assignments: [],
    loading: false,
    saving: false,
    error: null
  }),
  getters: {
    // Sửa lỗi: Hỗ trợ cả CamelCase và PascalCase từ Backend
    activeTrainers: (s) => (s.trainers || []).filter(t => {
      const active = t.isActive !== undefined ? t.isActive : (t.IsActive !== undefined ? t.IsActive : true)
      const deleted = t.isDeleted !== undefined ? t.isDeleted : (t.IsDeleted !== undefined ? t.IsDeleted : false)
      return active && !deleted
    })
  },
  actions: {
    async fetchById(id) {
      this.loading = true
      try {
        const r = await trainerService.getById(id)
        return r
      } catch (e) {
        return { success: false, message: e.response?.data?.message || 'Load failed' }
      } finally { this.loading = false }
    },
    async fetchAll() {
      this.loading = true
      this.error = null
      try {
        const r = await trainerService.getAll()
        if (r.success || r.Success) this.trainers = r.data || r.Data || []
      } catch (e) {
        if (e.response?.status === 403) {
          // Fallback cho Trainer/Staff không có quyền xem lương/full info: Lấy danh sách active công khai
          try {
            const r = await trainerService.getActive()
            if (r.success || r.Success) this.trainers = r.data || r.Data || []
          } catch (err) {
            this.error = err.response?.data?.message || 'Load active trainers failed'
          }
        } else {
          this.error = e.response?.data?.message || 'Load failed'
        }
      } finally { this.loading = false }
    },
    async create(data) {
      this.saving = true
      try {
        const r = await trainerService.create(data)
        if (r.success) { await this.fetchAll(); return { success: true, data: r.data } }
        return { success: false, message: r.message }
      } catch (e) {
        return { success: false, message: e.response?.data?.message || 'Create failed' }
      } finally { this.saving = false }
    },
    async update(id, data) {
      this.saving = true
      try {
        const r = await trainerService.update(id, data)
        if (r.success) { await this.fetchAll(); return { success: true } }
        return { success: false, message: r.message }
      } catch (e) {
        return { success: false, message: e.response?.data?.message || 'Update failed' }
      } finally { this.saving = false }
    },
    async remove(id) {
      this.loading = true
      try {
        const r = await trainerService.delete(id)
        if (r.success) { await this.fetchAll(); return { success: true } }
        return { success: false, message: r.message }
      } catch (e) {
        return { success: false, message: e.response?.data?.message || 'Delete failed' }
      } finally { this.loading = false }
    },
    async fetchAssignments(id) {
      this.loading = true
      try {
        const r = await trainerService.getMembers(id)
        if (r.success) return { success: true, data: r.data }
        return { success: false, message: r.message }
      } catch (e) {
        return { success: false, message: e.response?.data?.message || 'Load failed' }
      } finally { this.loading = false }
    },
    async assignMember(data) {
      this.saving = true
      try {
        const r = await trainerService.assignMember(data)
        return r
      } catch (e) {
        return { success: false, message: e.response?.data?.message || 'Assign failed' }
      } finally { this.saving = false }
    },
    async unassignMember(assignmentId) {
      this.saving = true
      try {
        const r = await trainerService.removeAssignment(assignmentId)
        return r
      } catch (e) {
        return { success: false, message: e.response?.data?.message || 'Unassign failed' }
      } finally { this.saving = false }
    },
    async fetchMySchedule() {
      this.loading = true
      try {
        const r = await trainerService.getMySchedule()
        return r
      } catch (e) {
        return { success: false, message: e.response?.data?.message || 'Load schedule failed' }
      } finally { this.loading = false }
    },
    async fetchTrainerSchedule(id) {
      this.loading = true
      try {
        const r = await trainerService.getTrainerSchedule(id)
        return r
      } catch (e) {
        return { success: false, message: e.response?.data?.message || 'Load schedule failed' }
      } finally { this.loading = false }
    },
    async fetchGlobalSchedule() {
      this.loading = true
      try {
        const r = await trainerService.getGlobalSchedule()
        return r
      } catch (e) {
        return { success: false, message: e.response?.data?.message || 'Load global schedule failed' }
      } finally { this.loading = false }
    },
    async fetchAllAssignments() {
      this.loading = true
      try {
        const r = await trainerService.getAllAssignments()
        if (r.success || r.Success) {
          this.assignments = r.data || r.Data || []
        }
        return r
      } catch (e) {
        return { success: false, message: e.response?.data?.message || 'Load assignments failed' }
      } finally { this.loading = false }
    }
  }
})