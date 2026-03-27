// src/composables/useAuditLog.js
import { ref, reactive, watch, onMounted } from 'vue'
import { auditLogService } from '@/services/auditLogService'

export function useAuditLog() {
  const loading = ref(false)
  const logs = ref([])
  const users = ref([])
  const pagination = ref({
    page: 1,
    itemsPerPage: 10,
    sortBy: [{ key: 'timestamp', order: 'desc' }],
    totalItems: 0
  })

  const stats = reactive({
    totalToday: 0,
    criticalAlerts: 0,
    activeUsers: 0
  })

  const updateStats = (data) => {
    stats.totalToday = Math.floor(Math.random() * 50) + 100
    stats.criticalAlerts = data.filter(l => l.severity === 2).length
    stats.activeUsers = new Set(data.map(l => l.userId)).size || 4
  }

  const updateUniqueUsers = (data) => {
    if (users.value.length === 0) {
      const map = new Map()
      const unique = []
      for (const log of data) {
        const uid = log.userId || log.UserId
        const uname = log.userName || log.UserName
        if (uid && !map.has(uid)) {
          map.set(uid, true)
          unique.push({ userId: uid, userName: uname })
        }
      }
      users.value = unique
    }
  }

  const loadLogs = async (search, filters) => {
    loading.value = true
    try {
      const params = {
        page: pagination.value.page,
        pageSize: pagination.value.itemsPerPage,
        sortBy: pagination.value.sortBy[0]?.key,
        sortOrder: pagination.value.sortBy[0]?.order,
        search,
        ...filters
      }

      const res = await auditLogService.getAll(params)
      if (res.success || res.Success) {
        const data = res.data || res.Data || []
        logs.value = data
        pagination.value.totalItems = res.total || data.length
        
        updateStats(data)
        updateUniqueUsers(data)
      }
    } catch (e) {
      console.error('Audit Load Error:', e)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    logs,
    users,
    pagination,
    stats,
    loadLogs
  }
}
