<template>
  <div>
    <h1 class="text-h4 font-weight-bold mb-6">Nhật ký Hệ thống (Audit Log)</h1>

    <v-card>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Tìm kiếm (User, Entity, Action...)"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="auto">
            <v-btn icon="mdi-refresh" variant="tonal" @click="loadLogs" :loading="loading" />
          </v-col>
        </v-row>
      </v-card-text>

      <v-data-table
        :headers="headers"
        :items="logs"
        :loading="loading"
        :search="search"
        :items-per-page="20"
        hover
      >
        <template #item.userName="{ item }">
          <div class="d-flex align-center">
            <v-avatar color="primary" variant="tonal" size="28" class="mr-3">
              <span class="text-caption font-weight-bold">{{ item.userName?.charAt(0) || 'S' }}</span>
            </v-avatar>
            <span class="text-body-2 font-weight-medium">{{ item.userName }}</span>
          </div>
        </template>

        <template #item.action="{ item }">
          <v-chip :color="getActionColor(item.action)" size="x-small" label class="font-weight-bold">
            {{ item.action }}
          </v-chip>
        </template>

        <template #item.entityName="{ item }">
          <span class="text-caption font-weight-medium">{{ item.entityName }}</span>
        </template>

        <template #item.timestamp="{ item }">
          <div class="text-caption">{{ formatDateTime(item.timestamp) }}</div>
        </template>

        <template #item.details="{ item }">
          <v-btn size="x-small" variant="text" color="primary" @click="openDetails(item)">
            Xem chi tiết
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="detailDialog" max-width="700">
      <v-card>
        <v-card-title class="bg-grey-lighten-3 pa-4">
          Chi tiết Thay đổi
          <v-spacer></v-spacer>
        </v-card-title>
        <v-card-text class="pa-4">
          <v-row>
            <v-col cols="6">
              <div class="text-subtitle-2 text-error mb-2">Giá trị Cũ (Old)</div>
              <v-sheet color="grey-lighten-4" class="pa-3 rounded code-block" border>
                <pre>{{ prettyJson(selectedLog?.oldValues) }}</pre>
              </v-sheet>
            </v-col>
            <v-col cols="6">
              <div class="text-subtitle-2 text-success mb-2">Giá trị Mới (New)</div>
              <v-sheet color="grey-lighten-4" class="pa-3 rounded code-block" border>
                <pre>{{ prettyJson(selectedLog?.newValues) }}</pre>
              </v-sheet>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="detailDialog = false">Đóng</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { auditLogService } from '@/services/auditLogService' // Nhớ tạo file service này
import { formatDateTime } from '@/utils/helpers'

const loading = ref(false)
const logs = ref([])
const search = ref('')
const detailDialog = ref(false)
const selectedLog = ref(null)

const headers = [
  { title: 'Thời gian', key: 'timestamp', width: '180px' },
  { title: 'Người dùng', key: 'userName', width: '200px' },
  { title: 'Hành động', key: 'action', width: '120px' },
  { title: 'Đối tượng', key: 'entityName' },
  { title: 'Chi tiết', key: 'details', sortable: false, align: 'end' },
]

const getActionColor = (action) => {
  if (action?.includes('CREATE') || action?.includes('Added')) return 'success'
  if (action?.includes('UPDATE') || action?.includes('Modified')) return 'warning'
  if (action?.includes('DELETE') || action?.includes('Deleted')) return 'error'
  return 'info'
}

const prettyJson = (jsonStr) => {
  try {
    if (!jsonStr || jsonStr === '{}') return 'Empty'
    const obj = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr
    return JSON.stringify(obj, null, 2)
  } catch (e) {
    return jsonStr
  }
}

const openDetails = (item) => {
  selectedLog.value = item
  detailDialog.value = true
}

const loadLogs = async () => {
  loading.value = true
  try {
    const res = await auditLogService.getAll()
    if (res.success || res.Success) {
      logs.value = res.data || res.Data || []
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(loadLogs)
</script>

<style scoped>
.code-block pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 0.85rem;
  font-family: monospace;
}
</style>