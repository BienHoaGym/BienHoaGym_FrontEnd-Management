// src/stores/member.js
import { defineStore } from 'pinia'
import { memberService } from '@/services/memberService'

export const useMemberStore = defineStore('member', {
  state: () => ({
    members: [],
    currentMember: null,
    pagination: {
      pageNumber: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0,
    },
    loading: false,
    saving: false,
    error: null,
  }),

  getters: {
    totalMembers: (state) => state.pagination.totalCount,
    hasNextPage: (state) => state.pagination.pageNumber < state.pagination.totalPages,
    hasPrevPage: (state) => state.pagination.pageNumber > 1,
  },

  actions: {
    async fetchMembers(pageNumber = 1, pageSize = 10) {
      this.loading = true
      this.error = null
      try {
        const response = await memberService.getAll(pageNumber, pageSize)
        if (response.success || response.Success) {
          const data = response.data || response.Data
          this.members = data.items || []
          this.pagination = {
            pageNumber: data.pageNumber || 1,
            pageSize: data.pageSize || 10,
            totalCount: data.totalCount || 0,
            totalPages: data.totalPages || 0,
          }
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to load members'
      } finally {
        this.loading = false
      }
    },

    async fetchMemberById(id) {
      this.loading = true
      this.error = null
      try {
        const response = await memberService.getById(id)
        if (response.success || response.Success) {
          this.currentMember = response.data || response.Data
          return this.currentMember
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Member not found'
        throw error
      } finally {
        this.loading = false
      }
    },

    async searchMembers(keyword) {
      this.loading = true
      this.error = null
      try {
        const response = await memberService.search(keyword)
        if (response.success || response.Success) {
          const data = response.data || response.Data || []
          this.members = data
          this.pagination = { ...this.pagination, totalCount: data.length }
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Search failed'
      } finally {
        this.loading = false
      }
    },

    async createMember(data) {
      this.saving = true
      this.error = null
      try {
        const response = await memberService.create(data)
        if (response.success || response.Success) {
          await this.fetchMembers(this.pagination.pageNumber, this.pagination.pageSize)
          return { success: true, data: response.data || response.Data }
        }
        return { success: false, message: response.message }
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to create member'
        this.error = message
        return { success: false, message }
      } finally {
        this.saving = false
      }
    },

    async updateMember(id, data) {
      this.saving = true
      this.error = null
      try {
        const response = await memberService.update(id, data)
        if (response.success || response.Success) {
          await this.fetchMembers(this.pagination.pageNumber, this.pagination.pageSize)
          return { success: true, data: response.data || response.Data }
        }
        return { success: false, message: response.message }
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to update member'
        this.error = message
        return { success: false, message }
      } finally {
        this.saving = false
      }
    },

    async deleteMember(id) {
      this.loading = true
      this.error = null
      try {
        const response = await memberService.delete(id)
        if (response.success) {
          await this.fetchMembers(this.pagination.pageNumber, this.pagination.pageSize)
          return { success: true }
        }
        return { success: false, message: response.message }
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to delete member'
        this.error = message
        return { success: false, message }
      } finally {
        this.loading = false
      }
    },

    clearCurrentMember() {
      this.currentMember = null
    },
  },
})
