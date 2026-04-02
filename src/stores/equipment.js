import { defineStore } from 'pinia'
import { equipmentService } from '@/services/equipmentService'

export const useEquipmentStore = defineStore('equipment', {
  state: () => ({
    equipments: [],
    transactions: [],
    maintenanceLogs: [],
    depreciations: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchEquipments(params = null) {
      this.loading = true
      try {
        const r = await equipmentService.getEquipments(params)
        if (r.success) this.equipments = r.data
      } finally { this.loading = false }
    },
    async createEquipment(data) {
      const r = await equipmentService.create(data)
      if (r.success) await this.fetchEquipments()
      return r
    },
    async updateEquipment(id, data) {
      const r = await equipmentService.update(id, data)
      if (r.success) await this.fetchEquipments()
      return r
    },
    async deleteEquipment(id) {
      const r = await equipmentService.delete(id)
      if (r.success) await this.fetchEquipments()
      return r
    },
    async liquidateEquipment(id) {
      const r = await equipmentService.liquidate(id)
      if (r.success) await this.fetchEquipments()
      return r
    },
    async getProviderHistory(id) {
      return await equipmentService.getProviderHistory(id)
    },
    async logMaintenance(data) {
      const r = await equipmentService.logMaintenance(data)
      if (r.success) {
        await this.fetchEquipments()
        await this.fetchMaintenanceLogs(data.equipmentId)
      }
      return r
    },
    async fetchMaintenanceLogs(equipmentId = null) {
      this.loading = true
      try {
        const r = await equipmentService.getMaintenanceLogs(equipmentId)
        if (r.success) this.maintenanceLogs = r.data
      } finally { this.loading = false }
    },
    async fetchIncidentLogs(equipmentId = null) {
      return await equipmentService.getIncidentLogs(equipmentId)
    },
    async logIncident(data) {
      return await equipmentService.logIncident(data)
    },
    async fetchEquipTransactions(equipmentId = null) {
      const r = await equipmentService.getTransactions(equipmentId)
      if (r.success) this.transactions = r.data
    },
    async fetchDepreciations(equipmentId = null) {
      const r = await equipmentService.getDepreciations(equipmentId)
      if (r.success) this.depreciations = r.data
    },
    async fetchMaintenancePlan() {
      this.loading = true
      try {
        const r = await equipmentService.getMaintenancePlan()
        return r
      } finally { this.loading = false }
    },
    async runBulkDepreciate(month, year) {
      this.loading = true
      try {
        const r = await equipmentService.bulkDepreciate(month, year)
        if (r.success) {
          await this.fetchEquipments()
          await this.fetchDepreciations()
        }
        return r
      } finally { this.loading = false }
    }
  }
})
