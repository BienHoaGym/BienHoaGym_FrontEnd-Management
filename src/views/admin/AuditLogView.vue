<template>
  <v-container fluid class="pa-6">
    <!-- Modern Header & Stats Dashboard -->
    <div class="audit-dashboard-header mb-8 pa-6 rounded-xl elevation-3">
      <div class="d-flex align-center justify-space-between mb-8">
        <div>
          <div class="d-flex align-center mb-2">
            <v-avatar color="white" size="48" class="mr-4 elevation-2">
              <v-icon color="primary" size="28">mdi-shield-history</v-icon>
            </v-avatar>
            <div>
              <h1 class="text-h4 font-weight-black text-white">Nhật Ký Hệ Thống</h1>
              <div class="text-subtitle-2 text-white opacity-80">Truy vết & Giám sát hoạt động thời gian thực</div>
            </div>
          </div>
        </div>
        
        <div class="d-flex gap-3">
          <v-btn
            color="white"
            variant="flat"
            prepend-icon="mdi-refresh"
            class="rounded-lg font-weight-bold"
            @click="loadLogs"
            :loading="loading"
          >
            Làm mới
          </v-btn>
          <v-btn
            color="success"
            prepend-icon="mdi-file-export"
            variant="elevated"
            @click="exportLogs"
            :loading="loadingExport"
            class="rounded-lg font-weight-bold ml-2"
          >
            Xuất báo cáo
          </v-btn>
        </div>
      </div>

      <!-- Quick Metrics -->
      <v-row>
        <v-col cols="12" sm="4">
          <v-card class="metric-card rounded-xl pa-4 glass-card" theme="dark">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-overline opacity-70">Thao tác hôm nay</div>
                <div class="text-h4 font-weight-black">{{ stats.totalToday }}</div>
              </div>
              <v-icon size="48" color="success">mdi-trending-up</v-icon>
            </div>
            <div class="mt-2 text-caption font-weight-bold">
              <span class="text-success">+12%</span> so với dự kiến
            </div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card class="metric-card rounded-xl pa-4 glass-card" theme="dark">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-overline opacity-70">Cảnh báo nghiêm trọng</div>
                <div class="text-h4 font-weight-black text-error">{{ stats.criticalAlerts }}</div>
              </div>
              <v-icon size="48" color="error">mdi-alert-decagram</v-icon>
            </div>
            <div class="mt-2 text-caption">
              Cần kiểm tra ngay lập tức
            </div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card class="metric-card rounded-xl pa-4 glass-card" theme="dark">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-overline opacity-70">Nhân viên hoạt động</div>
                <div class="text-h4 font-weight-black">{{ stats.activeUsers }}</div>
              </div>
              <v-icon size="48" color="info">mdi-account-group</v-icon>
            </div>
            <div class="mt-2 text-caption">
              Trong vòng 1 giờ qua
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Filters Strip -->
    <v-card class="mb-6 rounded-xl border-dashed">
      <v-card-text class="pa-4">
        <v-row dense align="center">
          <v-col cols="12" md="2">
             <v-text-field
                v-model="search"
                prepend-inner-icon="mdi-magnify"
                label="Tìm kiếm nội dung..."
                variant="solo"
                flat
                bg-color="grey-lighten-4"
                density="comfortable"
                hide-details
                rounded="lg"
                clearable
              />
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="12" md="2">
            <v-select
              v-model="filters.userId"
              :items="users"
              item-title="userName"
              item-value="userId"
              label="Nhân viên"
              prepend-inner-icon="mdi-account-search"
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
              class="compact-select"
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-select
              v-model="filters.action"
              :items="actionTypes"
              label="Thao tác"
              prepend-inner-icon="mdi-gesture-tap"
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
               class="compact-select"
            />
          </v-col>
          <v-col cols="12" md="2">
             <v-select
              v-model="filters.severity"
              :items="severityTypes"
              label="Mức độ"
              prepend-inner-icon="mdi-shield-alert"
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
               class="compact-select"
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field
              v-model="filters.dateRange"
              label="Thời gian"
              prepend-inner-icon="mdi-calendar"
              variant="outlined"
              density="comfortable"
              hide-details
              readonly
               class="compact-select"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Main Table -->
    <v-card class="elevation-2 rounded-lg overflow-hidden border">
      <v-data-table-server
        v-model:items-per-page="pagination.itemsPerPage"
        :headers="headers"
        :items="logs"
        :items-length="pagination.totalItems"
        :loading="loading"
        :search="search"
        class="audit-table"
        item-value="id"
        hover
        @update:options="handleOptionsUpdate"
        @click:row="(_, { item }) => openDetails(item.raw)"
      >
        <!-- Custom Time Col -->
        <template #item.timestamp="{ value }">
          <div class="d-flex flex-column py-2">
            <span class="font-weight-bold text-grey-darken-3">{{ formatTimeOnly(value) }}</span>
            <span class="text-caption text-medium-emphasis">{{ formatDateOnly(value) }}</span>
          </div>
        </template>

        <!-- User Col -->
        <template #item.user="{ item }">
          <div class="d-flex align-center py-2" v-if="item.userName || item.UserName || item.userId || item.UserId">
             <v-avatar :color="getAvatarColor(item.userName || item.UserName)" variant="tonal" size="36" class="mr-3">
                <span class="text-h6 font-weight-bold">{{ (item.userName || item.UserName || '?').charAt(0).toUpperCase() }}</span>
              </v-avatar>
            <div>
              <div class="font-weight-bold text-body-1 text-grey-darken-4">
                {{ item.userName || item.UserName || 'System' }}
              </div>
              <div class="text-caption text-medium-emphasis">{{ item.userRole || item.UserRole || 'N/A' }}</div>
            </div>
          </div>
          <div v-else class="text-caption text-grey-lighten-1">Không xác định</div>
        </template>

        <!-- Action Col -->
        <template #item.action="{ value }">
           <v-chip size="small" :color="getActionColor(value)" variant="flat" class="font-weight-bold">
              <v-icon :icon="getActionIcon(value)" start size="16"></v-icon>
              {{ translateAction(value) }}
            </v-chip>
        </template>

        <!-- Entity Col -->
        <template #item.entity="{ item }">
          <div v-if="item.entityName || item.EntityName">
            <div class="font-weight-bold text-body-2 text-grey-darken-3">{{ translateEntity(item.entityName || item.EntityName) }}</div>
            <div v-if="item.resourceName || item.ResourceName" class="text-caption text-medium-emphasis" style="max-width: 250px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
              {{ item.resourceName || item.ResourceName }}
            </div>
          </div>
          <div v-else class="text-caption text-grey">--</div>
        </template>

        <!-- Changes Col -->
         <template #item.changes="{ item }">
            <div class="text-caption text-medium-emphasis" style="max-width: 300px;">
              {{ describeChangeSimple(item) }}
            </div>
        </template>

        <!-- Severity Col -->
        <template #item.severity="{ value }">
           <v-tooltip :text="getSeverityText(value)" location="top">
              <template #activator="{ props }">
                <v-icon v-bind="props" :color="getSeverityColor(value)" size="18">
                  {{ getSeverityIcon(value) }}
                </v-icon>
              </template>
            </v-tooltip>
        </template>

        <!-- Loading State -->
        <template #loading>
          <v-skeleton-loader type="table-row-divider@10" />
        </template>

        <!-- No data -->
        <template #no-data>
          <div class="pa-12 text-center">
            <v-icon size="64" color="grey-lighten-3" class="mb-4">mdi-shield-off-outline</v-icon>
            <h4 class="text-h5 font-weight-bold text-grey-darken-1 mb-2">Không tìm thấy kết quả</h4>
            <p class="text-body-1 text-medium-emphasis">Vui lòng thử lại với bộ lọc khác.</p>
          </div>
        </template>
      </v-data-table-server>
    </v-card>

    <!-- Detailed Modal -->
    <v-dialog v-model="detailDialog" max-width="1000" scrollable transition="dialog-bottom-transition">
      <v-card class="rounded-xl overflow-hidden shadow-2xl border">
        <v-card-title class="pa-6 border-b d-flex align-center" :class="`bg-${getSeverityColor(selectedLog?.severity)}-lighten-5`">
          <v-avatar color="white" class="mr-4 elevation-1" size="52">
             <v-icon :color="getSeverityColor(selectedLog?.severity)" size="32">mdi-shield-search</v-icon>
          </v-avatar>
          <div>
            <div class="text-h5 font-weight-black color-grey-darken-4">Bằng chứng Kiểm toán hệ thống</div>
            <div class="text-caption text-grey-darken-1 font-weight-bold">MÃ NHẬT KÝ ĐIỆN TỬ: {{ selectedLog?.id?.split('-')[0].toUpperCase() }}</div>
          </div>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="detailDialog = false" />
        </v-card-title>

        <v-card-text class="pa-0 bg-white">
          <!-- Quick Summary Bar -->
          <div class="bg-blue-grey-lighten-5 pa-6 border-b">
            <v-row dense>
              <v-col cols="12" md="3" class="border-e pr-4">
                <div class="text-overline text-grey-darken-2 mb-1 font-weight-black">Ngày thực hiện</div>
                <div class="text-h6 font-weight-black">{{ formatDateTime(selectedLog?.timestamp) }}</div>
              </v-col>
              <v-col cols="12" md="3" class="border-e px-6">
                <div class="text-overline text-grey-darken-2 mb-1 font-weight-black">Nhân viên thao tác</div>
                <div class="text-h6 font-weight-black text-primary">{{ selectedLog?.userName }}</div>
                <div class="text-caption font-weight-bold">{{ selectedLog?.userRole }}</div>
              </v-col>
              <v-col cols="12" md="3" class="border-e px-6">
                <div class="text-overline text-grey-darken-2 mb-1 font-weight-black">Đối tượng bị thay đổi</div>
                <div class="text-h6 font-weight-black">{{ translateEntity(selectedLog?.entityName) }}</div>
                <div class="text-caption font-weight-bold text-truncate">{{ selectedLog?.resourceName || 'Dữ liệu tổng quát' }}</div>
              </v-col>
              <v-col cols="12" md="3" class="pl-6">
                <div class="text-overline text-grey-darken-2 mb-1 font-weight-black">Thiết bị & IP truy cập</div>
                <div class="text-body-1 font-weight-bold">{{ simplifyUserAgent(selectedLog?.userAgent) }}</div>
                <code class="text-caption font-weight-black">{{ selectedLog?.ipAddress || '127.0.0.1' }}</code>
              </v-col>
            </v-row>
          </div>

          <div class="pa-8">
            <v-alert
              v-if="selectedLog?.reason"
              icon="mdi-comment-text-multiple"
              color="indigo"
              variant="flat"
              class="mb-8 rounded-lg"
            >
              <div class="text-subtitle-2 font-weight-black mb-1">LÝ DO THỰC HIỆN / GHI CHÚ QUẢN TRỊ:</div>
              <div class="text-h6 mb-0">{{ selectedLog?.reason }}</div>
            </v-alert>

            <!-- Human Readable Changes -->
            <div class="mb-5 d-flex align-center">
              <v-icon color="primary" class="mr-2" size="28">mdi-text-box-search-outline</v-icon>
              <span class="text-h5 font-weight-black">Bảng kê thay đổi chi tiết</span>
            </div>

            <v-card variant="outlined" class="rounded-lg overflow-hidden mb-8">
              <v-table class="change-table">
                <thead>
                  <tr class="bg-grey-lighten-4">
                    <th class="text-left font-weight-black py-4" width="220">Thông tin thay đổi</th>
                    <th class="text-left font-weight-black">Trạng thái cũ</th>
                    <th class="text-center" width="60"></th>
                    <th class="text-left font-weight-black">Trạng thái mới</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="change in parsedChanges" :key="change.key">
                    <td class="font-weight-black py-4 text-grey-darken-3 pl-4">
                       <v-icon size="16" class="mr-1" color="grey">mdi-label-outline</v-icon>
                       {{ translateField(change.key) }}
                    </td>
                    <td class="text-grey-darken-1 py-4 bg-red-lighten-5">
                      <div class="value-cell">{{ formatValue(change.oldV) }}</div>
                    </td>
                    <td class="text-center py-4">
                      <v-icon color="grey-lighten-1">mdi-arrow-right-thin</v-icon>
                    </td>
                    <td class="text-success-darken-2 font-weight-bold py-4 bg-green-lighten-5">
                      <div class="value-cell">{{ formatValue(change.newV) }}</div>
                    </td>
                  </tr>
                  <tr v-if="parsedChanges.length === 0">
                    <td colspan="4" class="text-center pa-10 text-grey-darken-1">
                      <v-icon size="40" class="mb-2 d-block mx-auto" color="grey-lighten-2">mdi-information-outline</v-icon>
                      <span class="text-body-1 font-weight-bold">
                        {{ selectedLog?.action?.includes('Deleted') ? 'Hệ thống đã xóa toàn bộ bản ghi này.' : 'Cập nhật dấu thời gian hệ thống, không thay đổi giá trị thuộc tính.' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-card>

            <!-- Raw JSON Toggle -->
            <v-expansion-panels variant="accordion" class="border rounded-lg">
              <v-expansion-panel elevation="0" class="bg-grey-lighten-4">
                <v-expansion-panel-title class="text-caption text-grey-darken-1 font-weight-bold py-1 min-height-32">
                   Bản ghi gốc dành cho bộ phận Kỹ thuật / Kiểm toán mã hóa
                </v-expansion-panel-title>
                <v-expansion-panel-text class="bg-grey-darken-4 pa-0">
                  <v-row no-gutters>
                    <v-col cols="6" class="border-e border-grey-darken-2">
                       <div class="pa-2 bg-grey-darken-3 text-caption text-grey text-center">OLD_DATA</div>
                       <pre class="raw-json pa-4">{{ prettyJson(selectedLog?.oldValues) }}</pre>
                    </v-col>
                    <v-col cols="6">
                       <div class="pa-2 bg-grey-darken-3 text-caption text-grey text-center">NEW_DATA</div>
                       <pre class="raw-json pa-4">{{ prettyJson(selectedLog?.newValues) }}</pre>
                    </v-col>
                  </v-row>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
        </v-card-text>

        <v-card-actions class="pa-6 border-t bg-grey-lighten-4">
          <v-spacer></v-spacer>
          <v-btn
            variant="outlined"
            color="grey-darken-3"
            class="rounded-lg px-8 font-weight-bold"
            height="44"
            @click="detailDialog = false"
          >
            ĐỐNG
          </v-btn>
          <v-btn
            variant="flat"
            color="error"
            class="rounded-lg px-8 font-weight-bold ml-3"
            height="44"
            prepend-icon="mdi-printer-check"
          >
            IN BẰNG CHỨNG XÁC THỰC
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { auditLogService } from '@/services/auditLogService'
import { formatDateTime } from '@/utils/helpers'

const loading = ref(false)
const loadingExport = ref(false)
const search = ref('')
const logs = ref([])
const users = ref([])
const detailDialog = ref(false)
const selectedLog = ref(null)

const stats = reactive({
  totalToday: 0,
  criticalAlerts: 0,
  activeUsers: 0
})

const filters = reactive({
  dateRange: '24/03/2026 → 31/03/2026',
  userId: null,
  action: null,
  severity: null
})

// Server-side pagination
const pagination = ref({
  page: 1,
  itemsPerPage: 10,
  sortBy: [{ key: 'timestamp', order: 'desc' }],
  totalItems: 0
})

// Debounce for search and filter changes
let debounceTimer = null
watch(filters, () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    loadLogs()
  }, 500)
}, { deep: true })

watch(search, () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    loadLogs()
  }, 500)
})


const actionTypes = [
  { title: 'Thêm mới', value: 'Added' },
  { title: 'Cập nhật', value: 'Modified' },
  { title: 'Xóa bỏ', value: 'Deleted' }
]
const severityTypes = [
  { title: '🟢 Bình thường', value: 0 },
  { title: '🟡 Quan trọng', value: 1 },
  { title: '🔴 Nghiêm trọng', value: 2 }
]

const headers = [
  { title: 'Timestamp', key: 'timestamp', sortable: true, width: '140px' },
  { title: 'User', key: 'user', sortable: false, width: '220px' },
  { title: 'Action', key: 'action', sortable: false, width: '130px', align: 'center' },
  { title: 'Entity', key: 'entity', sortable: false, width: '250px' },
  { title: 'Changes Summary', key: 'changes', sortable: false },
  { title: 'Severity', key: 'severity', sortable: false, width: '100px', align: 'center' },
]

const formatTimeOnly = (date) => date ? new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--'
const formatDateOnly = (date) => date ? new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''

const COLORS = ['primary', 'secondary', 'accent', 'success', 'warning', 'error', 'info'];
const getAvatarColor = (name) => {
  if (!name) return 'grey';
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COLORS[hash % COLORS.length];
}

const getActionColor = (action) => {
  if (action?.includes('Added')) return 'success'
  if (action?.includes('Modified')) return 'warning'
  if (action?.includes('Deleted')) return 'error'
  return 'grey'
}

const getActionIcon = (action) => {
  if (action?.includes('Added')) return 'mdi-plus-circle-outline'
  if (action?.includes('Modified')) return 'mdi-pencil-circle-outline'
  if (action?.includes('Deleted')) return 'mdi-minus-circle-outline'
  return 'mdi-help-circle-outline'
}

const getSeverityColor = (severity) => {
  if (severity === 2) return 'error'
  if (severity === 1) return 'warning'
  return 'success'
}

const getSeverityIcon = (severity) => {
  if (severity === 2) return 'mdi-alert-octagon'
  if (severity === 1) return 'mdi-alert'
  return 'mdi-check-circle'
}

const getSeverityText = (severity) => {
  if (severity === 2) return 'Nghiêm trọng - Thao tác nhạy cảm cần lưu ý'
  if (severity === 1) return 'Quan trọng - Thay đổi thông tin hệ thống'
  return 'Bình thường - Các thao tác cơ bản'
}

const translateAction = (action) => {
  if (action?.includes('Added')) return 'Thêm mới'
  if (action?.includes('Modified')) return 'Cập nhật'
  if (action?.includes('Deleted')) return 'Đã xóa'
  return action
}

const translateEntity = (entity) => {
  const map = {
    'MembershipPackage': 'Gói tập',
    'User': 'Tài khoản',
    'Member': 'Hội viên',
    'Product': 'Sản phẩm',
    'Role': 'Phân quyền',
    'Subscription': 'Hợp đồng',
    'Inventory': 'Kho',
    'Equipment': 'Thiết bị'
  }
  return map[entity] || entity
}

const translateField = (field) => {
  const map = {
    'Name': 'Tên', 'Price': 'Giá', 'Description': 'Mô tả', 'Permissions': 'Quyền hạn', 'Status': 'Trạng thái',
    'Role': 'Chức danh', 'FullName': 'Họ tên', 'PhoneNumber': 'SĐT', 'StockQuantity': 'Tồn kho', 'HasPT': 'Có PT',
    'JoinedDate': 'Ngày vào', 'ProviderId': 'NCC', 'Address': 'Địa chỉ', 'Email': 'Email'
  }
  return map[field] || field
}

const permissionMap = {
  '*': 'Toàn quyền (Admin)', 'member.read': 'Xem DS hội viên', 'member.profile.read': 'Xem chi tiết HV',
  'member.create': 'Thêm hội viên', 'member.update': 'Sửa hội viên', 'member.delete': 'Xóa hội viên',
  'package.read': 'Xem DS gói tập', 'package.create': 'Thêm gói tập', 'package.update': 'Sửa gói tập',
  'package.delete': 'Xóa gói tập', 'subscription.read': 'Xem đăng ký', 'checkin.read': 'Xem check-in',
  'checkin.create': 'Tạo check-in', 'class.read': 'Xem lớp học', 'class.manage': 'QL lớp học',
  'inventory.read': 'Xem tồn kho', 'inventory.consume': 'Xuất kho', 'inventory.manage': 'QL Kho',
  'equipment.read': 'Xem thiết bị', 'equipment.update': 'Sửa thiết bị', 'equipment.report': 'Báo cáo hỏng',
  'report.read': 'Xem báo cáo', 'report.financial': 'Xem BC tài chính', 'auditlog.read': 'Xem nhật ký'
}

const simplifyUserAgent = (ua) => {
  if (!ua) return 'Không xác định'
  if (ua.includes('Windows')) return 'Desktop (Windows)'
  if (ua.includes('Macintosh')) return 'Desktop (macOS)'
  if (ua.includes('iPhone')) return 'iPhone'
  if (ua.includes('iPad')) return 'iPad'
  if (ua.includes('Android')) return 'Android'
  return 'Web Browser'
}

const describeChangeSimple = (item) => {
  const action = item.action || item.Action || '';
  if (action.includes('Deleted')) return 'Đã xóa bản ghi khỏi hệ thống.'
  if (action.includes('Added')) return 'Tạo mới một bản ghi trong cơ sở dữ liệu.'
  
  try {
    const newValuesStr = item.newValues || item.NewValues || '{}';
    const oldValuesStr = item.oldValues || item.OldValues || '{}';
    const newV = JSON.parse(newValuesStr)
    const keys = Object.keys(newV).filter(k => k !== 'UpdatedAt' && k !== 'Id' && k !== 'PasswordHash')
    if (keys.length === 0) return 'Cập nhật hệ thống (Heartbeat).'
    if (keys.length === 1) {
      const oldV = JSON.parse(oldValuesStr)
      const formattedOld = formatValue(oldV[keys[0]]).toString().substring(0, 30)
      const formattedNew = formatValue(newV[keys[0]]).toString().substring(0, 30)
      return `Thay đổi '${translateField(keys[0])}' từ "${formattedOld}..." sang "${formattedNew}...".`
    }
    return `Cập nhật ${keys.length} trường thông tin.`
  } catch {
    return 'Cập nhật nhiều trường thông tin chi tiết.'
  }
}

const formatValue = (val) => {
  if (val === null || val === undefined) return '(trống)'
  if (val === true) return '✅'
  if (val === false) return '❌'
  if (Array.isArray(val) || (typeof val === 'string' && val.startsWith('['))) {
    const arr = Array.isArray(val) ? val : JSON.parse(val)
    return arr.map(p => permissionMap[p] || p).join(', ')
  }
  return val
}

const parsedChanges = computed(() => {
  if (!selectedLog.value) return []
  try {
    const oldValuesStr = selectedLog.value.oldValues || selectedLog.value.OldValues || '{}';
    const newValuesStr = selectedLog.value.newValues || selectedLog.value.NewValues || '{}';
    const oldV = JSON.parse(oldValuesStr)
    const newV = JSON.parse(newValuesStr)
    const allKeys = new Set([...Object.keys(oldV), ...Object.keys(newV)])
    const ignoreKeys = ['UpdatedAt', 'Id', 'PasswordHash']
    
    return Array.from(allKeys)
      .filter(key => !ignoreKeys.includes(key) && oldV[key] !== newV[key])
      .map(key => ({
        key: key,
        oldV: oldV[key],
        newV: newV[key]
      }))
  } catch { return [] }
})

const prettyJson = (jsonStr) => {
  try {
    if (!jsonStr || jsonStr === '{}') return '{"info": "Không có dữ liệu thô"}'
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

const exportLogs = () => {
  loadingExport.value = true
  // In a real app, this would call a service to generate and download a CSV
  setTimeout(() => {
    loadingExport.value = false
    alert('Chức năng xuất báo cáo đang được phát triển!')
  }, 1000)
}

const handleOptionsUpdate = (options) => {
  pagination.value = options
  loadLogs()
}

const loadLogs = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      pageSize: pagination.value.itemsPerPage,
      sortBy: pagination.value.sortBy[0]?.key,
      sortOrder: pagination.value.sortBy[0]?.order,
      search: search.value,
      ...filters
    }
    
    const res = await auditLogService.getAll(params) 
    
    if (res.success || res.Success) {
      logs.value = res.data || res.Data || []
      pagination.value.totalItems = res.total || logs.value.length
      
      // Update Stats
      stats.totalToday = logs.value.length // This is just a proxy for demo since API doesn't give real stats yet
      stats.criticalAlerts = logs.value.filter(l => l.severity === 2).length
      stats.activeUsers = new Set(logs.value.map(l => l.userId)).size
      
      if (users.value.length === 0) {
        const uniqueUsers = []
        const map = new Map()
        for (const log of logs.value) {
          if (!map.has(log.userId)) {
            map.set(log.userId, true)
            uniqueUsers.push({ userId: log.userId, userName: log.userName })
          }
        }
        users.value = uniqueUsers
      }
    }
  } catch (e) {
    console.error('Audit Error:', e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.audit-dashboard-header {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  position: relative;
  overflow: hidden;
}

.audit-dashboard-header::before {
  content: "";
  position: absolute;
  top: -20%;
  right: -10%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%);
  border-radius: 50%;
}

.glass-card {
  background: rgba(255, 255, 255, 0.05) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  transition: transform 0.3s ease;
}

.glass-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.08) !important;
}

.border-dashed {
  border: 1px dashed #e2e8f0 !important;
}

.compact-select :deep(.v-field__input) {
  min-height: 40px !important;
  padding-top: 4px !important;
  padding-bottom: 4px !important;
}

.audit-table :deep(thead th) {
  background-color: #f8fafc;
  color: #64748b !important;
  font-weight: 700 !important;
  text-transform: uppercase;
  font-size: 0.7rem !important;
  letter-spacing: 0.05em;
}

.audit-table :deep(tbody tr) {
  transition: all 0.2s ease;
}

.audit-table :deep(tbody tr:hover) {
  background-color: #f1f5f9 !important;
  transform: scale(1.002);
}

.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
}

.change-table :deep(th) {
  font-size: 0.8rem;
  color: #475569 !important;
  background-color: #f8fafc;
}

.value-cell {
  word-break: break-word;
  max-width: 350px;
  line-height: 1.6;
  font-family: 'Inter', sans-serif;
}

.raw-json {
  font-size: 0.8rem;
  color: #a7f3d0;
  font-family: 'Fira Code', 'JetBrains Mono', monospace;
  overflow-x: auto;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
}

.border-e {
  border-right: 1px solid #e2e8f0;
}

.border-b {
  border-bottom: 1px solid #e2e8f0;
}

.border-t {
  border-top: 1px solid #e2e8f0;
}
</style>