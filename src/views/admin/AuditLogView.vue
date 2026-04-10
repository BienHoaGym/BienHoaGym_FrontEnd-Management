<template>
  <v-container fluid class="pa-6">
    <!-- Header Stats Overview -->
    <AuditLogStats :stats="stats" />

    <!-- Main Content Area -->
    <v-card class="rounded-xl border shadow-sm overflow-hidden">
      <v-toolbar flat color="white" class="border-b px-4">
        <v-toolbar-title class="text-h6 font-weight-bold d-flex align-center">
          <v-icon start color="primary" class="mr-2">mdi-shield-crown-outline</v-icon>
          NHẬT KÝ HỆ THỐNG
        </v-toolbar-title>
        <v-spacer />
        <div class="d-flex align-center gap-2">
          <v-btn
            variant="tonal"
            color="grey-darken-2"
            prepend-icon="mdi-refresh"
            class="rounded-lg font-weight-bold mr-2"
            @click="loadLogs(search, filters)"
            :loading="loading"
          >
            Làm mới
          </v-btn>
          <v-btn
            color="success"
            prepend-icon="mdi-file-export"
            variant="flat"
            @click="exportLogs"
            :loading="loadingExport"
            class="rounded-lg font-weight-bold"
          >
            Xuất báo cáo
          </v-btn>
        </div>
      </v-toolbar>

      <!-- Advanced Filters -->
      <div class="bg-grey-lighten-5 pa-4 border-b">
        <v-row dense>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              placeholder="Tìm kiếm nội dung, IP, hành động..."
              variant="outlined"
              bg-color="white"
              density="comfortable"
              hide-details
              rounded="lg"
              clearable
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-select
              v-model="filters.userId"
              :items="users"
              item-title="userName"
              item-value="userId"
              label="Nhân viên"
              variant="outlined"
              bg-color="white"
              density="comfortable"
              hide-details
              clearable
              rounded="lg"
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-select
              v-model="filters.action"
              :items="actionOptions"
              label="Thao tác"
              variant="outlined"
              bg-color="white"
              density="comfortable"
              hide-details
              clearable
              rounded="lg"
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-select
              v-model="filters.severity"
              :items="severityOptions"
              label="Mức độ"
              variant="outlined"
              bg-color="white"
              density="comfortable"
              hide-details
              clearable
              rounded="lg"
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-menu
              v-model="dateMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ props }">
                <v-text-field
                  v-bind="props"
                  v-model="formattedDateRange"
                  label="Thời gian"
                  prepend-inner-icon="mdi-calendar-range"
                  variant="outlined"
                  bg-color="white"
                  density="comfortable"
                  hide-details
                  readonly
                  rounded="lg"
                  class="cursor-pointer"
                />
              </template>
              <v-date-picker
                v-model="selectedDate"
                color="primary"
                @update:model-value="onDateSelected"
                hide-header
              >
                <template #actions>
                  <v-btn variant="text" color="primary" @click="setToday">Hôm nay</v-btn>
                  <v-btn variant="text" color="secondary" @click="setYesterday">Hôm qua</v-btn>
                  <v-btn variant="text" color="grey" @click="clearDateFilter">Xóa lọc</v-btn>
                  <v-spacer></v-spacer>
                  <v-btn variant="text" @click="dateMenu = false">Đóng</v-btn>
                </template>
              </v-date-picker>
            </v-menu>
          </v-col>
        </v-row>
      </div>

      <v-data-table-server
        v-model:items-per-page="pagination.itemsPerPage"
        :headers="headers"
        :items="logs"
        :items-length="pagination.totalItems"
        :loading="loading"
        class="audit-data-table"
        item-value="id"
        hover
        @update:options="handleOptionsUpdate"
        @click:row="(_, { item }) => openDetails(item)"
      >
        <!-- Time Col -->
        <template #item.timestamp="{ value }">
          <div class="d-flex flex-column py-2">
            <span class="font-weight-bold text-body-2">{{ formatTimeOnly(value) }}</span>
            <span class="text-caption text-grey">{{ formatDateOnly(value) }}</span>
          </div>
        </template>

        <!-- User Col -->
        <template #item.user="{ item }">
          <div class="d-flex align-center py-2" v-if="isValidUser(item)">
            <v-avatar :color="getAvatarColor(item.userName || item.UserName)" size="32" class="mr-3">
              <span class="text-caption font-weight-bold text-white">{{ (item.userName || item.UserName || '?').charAt(0).toUpperCase() }}</span>
            </v-avatar>
            <div>
              <div class="text-body-2 font-weight-bold">{{ item.userName || item.UserName }}</div>
              <div class="text-caption text-grey">{{ item.userRole || item.UserRole || 'N/A' }}</div>
            </div>
          </div>
        </template>

        <!-- Action Col -->
        <template #item.action="{ value }">
          <v-chip size="x-small" :color="getActionColor(value)" variant="flat" class="font-weight-bold px-2">
             {{ translateAction(value).toUpperCase() }}
          </v-chip>
        </template>

        <!-- Entity Col -->
        <template #item.entity="{ item }">
          <div v-if="item.entityName || item.EntityName" class="py-1">
            <div class="text-body-2 font-weight-medium">{{ translateEntity(item.entityName || item.EntityName) }}</div>
            <div class="text-caption text-primary" v-if="item.resourceName || item.ResourceName">
              ID: {{ item.resourceName || item.ResourceName }}
            </div>
          </div>
        </template>

        <!-- Changes Col -->
        <template #item.changes="{ item }">
          <div class="text-caption text-grey-darken-1 text-truncate" style="max-width: 300px;">
            {{ describeChangeSummary(item) }}
          </div>
        </template>

        <!-- Severity Col -->
        <template #item.severity="{ value }">
          <div class="text-center">
            <v-tooltip :text="getSeverityText(value)" location="top">
              <template #activator="{ props }">
                <v-icon v-bind="props" :icon="getSeverityIcon(value)" :color="getSeverityColor(value)" size="18"></v-icon>
              </template>
            </v-tooltip>
          </div>
        </template>

        <template #loading>
            <v-skeleton-loader type="table-row@10" />
        </template>

        <template #no-data>
          <div class="py-12 text-center text-grey">
            <v-icon size="64" class="mb-4 opacity-20">mdi-text-box-search-outline</v-icon>
            <div class="text-h6">Không tìm thấy dữ liệu</div>
            <p>Thử điều chỉnh bộ lọc tìm kiếm của bạn.</p>
          </div>
        </template>
      </v-data-table-server>
    </v-card>

    <!-- Detail Dialog -->
    <AuditLogDetailDialog 
      v-model="detailDialog" 
      :log="selectedLog" 
      @close="detailDialog = false" 
    />
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useAuditLog } from '@/composables/useAuditLog'
import AuditLogStats from '@/components/admin/AuditLogStats.vue'
import AuditLogDetailDialog from '@/components/admin/AuditLogDetailDialog.vue'
import { debounce } from '@/utils/helpers'
import { 
  translateAction, 
  translateEntity, 
  translateField, 
  getSeverityText,
  actionTypeMap,
  severityTypeMap 
} from '@/utils/auditTranslations'

// --- State Management ---
const { loading, logs, users, pagination, stats, loadLogs } = useAuditLog()

const search = ref('')
const loadingExport = ref(false)
const detailDialog = ref(false)
const selectedLog = ref(null)

const dateMenu = ref(false)
const selectedDate = ref(new Date())

const filters = reactive({
  fromDate: null,
  toDate: null,
  userId: null,
  action: null,
  severity: null
})

const formattedDateRange = computed(() => {
  if (!filters.fromDate && !filters.toDate) return 'Tất cả thời gian'
  const d = new Date(filters.fromDate)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return 'Hôm nay'
  
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return 'Hôm qua'
  
  return d.toLocaleDateString('vi-VN')
})

// --- Options Maps ---
const actionOptions = Object.entries(actionTypeMap).map(([value, title]) => ({ title, value }))
const severityOptions = Object.entries(severityTypeMap).map(([value, title]) => ({ title, value: parseInt(value) }))

const headers = [
  { title: 'Thời gian', key: 'timestamp', sortable: true, width: '130px' },
  { title: 'Nhân viên', key: 'user', sortable: false, width: '220px' },
  { title: 'Hành động', key: 'action', sortable: false, width: '120px', align: 'center' },
  { title: 'Đối tượng', key: 'entity', sortable: false, width: '200px' },
  { title: 'Lịch sử thay đổi', key: 'changes', sortable: false },
  { title: 'Cấp độ', key: 'severity', sortable: false, width: '80px', align: 'center' },
]

// --- Watchers & Debounced Loading ---
const debouncedLoad = debounce(() => {
  pagination.value.page = 1 // Reset về trang 1 khi lọc
  loadLogs(search.value, filters)
}, 500)

watch([filters, search], () => debouncedLoad(), { deep: true })

// --- Methods/Helpers ---
const onDateSelected = (val) => {
  let date = val
  if (Array.isArray(val)) date = val[0]
  
  if (date) {
    const d = new Date(date)
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0)
    const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59)
    
    filters.fromDate = start.toISOString()
    filters.toDate = end.toISOString()
    dateMenu.value = false
    
    // Thực thi load ngay lập tức không cần debounce cho date
    pagination.value.page = 1
    loadLogs(search.value, filters)
  }
}

const clearDateFilter = () => {
  filters.fromDate = null
  filters.toDate = null
  selectedDate.value = null
  dateMenu.value = false
}

const setToday = () => {
  const d = new Date()
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0)
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59)
  
  filters.fromDate = start.toISOString()
  filters.toDate = end.toISOString()
  selectedDate.value = d
  dateMenu.value = false
}

const setYesterday = () => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0)
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59)
  
  filters.fromDate = start.toISOString()
  filters.toDate = end.toISOString()
  selectedDate.value = d
  dateMenu.value = false
}

const formatTimeOnly = (date) => date ? new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--'
const formatDateOnly = (date) => date ? new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : ''

const getAvatarColor = (name) => {
  if (!name) return 'grey'
  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#06b6d4']
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return COLORS[hash % COLORS.length]
}

const getActionColor = (action) => {
  if (action?.includes('Added')) return 'success'
  if (action?.includes('Modified')) return 'warning'
  if (action?.includes('Deleted')) return 'error'
  return 'grey'
}

const getSeverityColor = (severity) => {
  const colors = { 2: 'error', 1: 'warning', 0: 'success' }
  return colors[severity] || 'success'
}

const getSeverityIcon = (severity) => {
  const icons = { 2: 'mdi-alert-circle', 1: 'mdi-alert', 0: 'mdi-check-circle' }
  return icons[severity] || 'mdi-check-circle'
}

const describeChangeSummary = (item) => {
  const action = item.action || item.Action || ''
  if (action.includes('Deleted')) return 'Xóa bản ghi khỏi hệ thống.'
  if (action.includes('Added')) return 'Tạo bản ghi mới.'
  
  try {
    const newValuesStr = item.newValues || item.NewValues || '{}'
    const newV = JSON.parse(newValuesStr)
    const keys = Object.keys(newV).filter(k => !['UpdatedAt', 'Id', 'PasswordHash'].includes(k))
    if (keys.length === 0) return 'Cập nhật trạng thái hệ thống.'
    if (keys.length === 1) return `Thay đổi thuộc tính '${translateField(keys[0])}'.`
    return `Cập nhật ${keys.length} thuộc tính thông tin.`
  } catch { return 'Dữ liệu thay đổi.' }
}

const isValidUser = (item) => !!(item.userName || item.UserName)

const handleOptionsUpdate = (options) => {
  // Merge options thay vì ghi đè hoàn toàn để giữ lại totalItems
  Object.assign(pagination.value, options)
  loadLogs(search.value, filters)
}

const openDetails = (item) => {
  // Tìm kiếm trực tiếp trong mảng logs để đảm bảo dữ liệu nguyên bản và đầy đủ nhất
  const logId = item.id || item.Id || (item.raw ? (item.raw.id || item.raw.Id) : null)
  const foundLog = logs.value.find(l => l.id === logId || l.Id === logId)
  
  if (foundLog) {
    selectedLog.value = { ...foundLog } // Clone để tránh side effects
    detailDialog.value = true
  } else if (item.raw) {
    // Fallback nếu không tìm thấy trong mảng hiện tại
    selectedLog.value = { ...item.raw }
    detailDialog.value = true
  }
}

const exportLogs = () => {
    loadingExport.value = true
    setTimeout(() => {
        loadingExport.value = false
        alert('Đang khởi tạo báo cáo...')
    }, 1000)
}

onMounted(() => {
  setToday() // setToday sẽ trigger watch và tự động loadLogs
})
</script>

<style scoped>
.gap-2 { gap: 8px; }
.audit-data-table :deep(thead th) {
  font-weight: bold !important;
  color: #616161 !important;
  text-transform: uppercase;
  font-size: 0.75rem !important;
  background-color: #f5f5f5 !important;
}

.audit-data-table :deep(tbody tr:hover) {
  cursor: pointer;
  background-color: #f1f8ff !important;
}
</style>