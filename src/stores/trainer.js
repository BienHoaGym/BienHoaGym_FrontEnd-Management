// src/stores/trainer.js
import { defineStore } from 'pinia'
import { trainerService } from '@/services/trainerService'

export const useTrainerStore = defineStore('trainer', {
  state: () => ({
    trainers: [],
    loading: false,
    saving: false,
    error: null
  }),
  getters: {
    activeTrainers: (s) => s.trainers.filter(t => t.isActive && !t.isDeleted)
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
      try {
        const r = await trainerService.getAll()
        if (r.success || r.Success) this.trainers = r.data || r.Data || []
      } catch (e) {
        this.error = e.response?.data?.message || 'Load failed'
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
    }
  }
})