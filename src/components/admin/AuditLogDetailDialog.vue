<template>
  <v-dialog v-bind="$attrs" max-width="950" scrollable transition="dialog-bottom-transition">
    <v-card class="rounded-xl overflow-hidden audit-detail-card">
      <v-card-title class="pa-6 font-weight-bold d-flex align-center border-b bg-white">
        <div class="d-flex align-center">
          <v-avatar color="primary" variant="tonal" class="mr-4" size="48">
            <v-icon color="primary" size="28">mdi-text-box-search-outline</v-icon>
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-bold">CHI TIẾT BẢN GHI NHẬT KÝ</div>
            <div class="text-caption text-grey">Log ID: {{ getVal(log, 'id') || 'N/A' }}</div>
          </div>
        </div>
        <v-spacer/>
        <v-btn icon="mdi-close" variant="text" @click="$emit('close')"/>
      </v-card-title>
      
      <v-card-text class="pa-0 bg-grey-lighten-5">
        <!-- Dashboard Summary -->
        <div class="pa-6 border-b bg-white">
          <v-row>
            <v-col cols="6" sm="3">
              <div class="text-caption text-grey font-weight-bold mb-1">THỜI GIAN</div>
              <div class="text-body-2 font-weight-bold">{{ formatDateTime(getVal(log, 'timestamp')) || '---' }}</div>
            </v-col>
            <v-col cols="6" sm="3">
              <div class="text-caption text-grey font-weight-bold mb-1">NHÂN VIÊN</div>
              <div class="d-flex align-center">
                <v-avatar size="20" color="primary" class="mr-2"></v-avatar>
                <div class="text-body-2 font-weight-bold text-primary">{{ getVal(log, 'userName') || 'System' }}</div>
              </div>
            </v-col>
            <v-col cols="6" sm="3">
              <div class="text-caption text-grey font-weight-bold mb-1">HÀNH ĐỘNG</div>
              <v-chip v-if="getVal(log, 'action')" size="x-small" :color="getActionColor(getVal(log, 'action'))" class="font-weight-black px-2">
                {{ (translateAction(getVal(log, 'action')) || 'SỬA').toString().toUpperCase() }}
              </v-chip>
              <div v-else class="text-body-2 font-weight-bold">---</div>
            </v-col>
            <v-col cols="6" sm="3">
              <div class="text-caption text-grey font-weight-bold mb-1">ĐỊA CHỈ IP</div>
              <div class="text-body-2 font-weight-medium d-flex align-center text-truncate">
                <v-icon size="14" class="mr-1 text-grey">mdi-ip-network</v-icon>
                {{ getVal(log, 'ipAddress') || 'Internal' }}
              </div>
            </v-col>
          </v-row>
        </div>

        <div class="pa-6">
          <!-- Real Meaning Description -->
          <v-alert v-if="log" color="primary" variant="tonal" class="rounded-xl mb-6 py-4" border="start">
            <template #prepend>
              <v-icon size="24" class="mr-2">mdi-information-box</v-icon>
            </template>
            <div class="text-body-1 font-weight-bold mb-1">Mô tả hoạt động:</div>
            <div class="text-body-2 opacity-90">{{ describeDetailedLog(log) }}</div>
          </v-alert>

          <!-- Change Comparison Table -->
          <div class="d-flex align-center mb-4">
             <v-icon color="orange" start size="20">mdi-compare-horizontal</v-icon>
             <span class="text-subtitle-2 font-weight-black">SO SÁNH THAY ĐỔI DỮ LIỆU</span>
          </div>

          <v-card variant="flat" class="rounded-xl border bg-white overflow-hidden mb-8">
            <v-table density="comfortable" class="comparison-table">
              <thead>
                <tr>
                  <th class="bg-grey-lighten-4 text-grey-darken-2 font-weight-bold">Thuộc tính</th>
                  <th class="bg-grey-lighten-4 text-grey-darken-2 font-weight-bold">Giá trị cũ</th>
                  <th class="bg-grey-lighten-4 text-center" width="60"></th>
                  <th class="bg-grey-lighten-4 text-grey-darken-2 font-weight-bold">Giá trị mới</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="change in parsedChanges" :key="change.key">
                  <td class="font-weight-bold text-body-2 py-4" style="width: 250px;">
                    <v-chip size="x-small" variant="tonal" color="primary" class="mr-2">{{ change.key }}</v-chip>
                    {{ translateField(change.key) }}
                  </td>
                  <td class="text-body-2 text-grey-darken-1 strikes">{{ formatValue(change.oldV) }}</td>
                  <td class="text-center">
                    <v-icon color="grey-lighten-1">mdi-arrow-right-thin</v-icon>
                  </td>
                  <td class="text-body-2 font-weight-bold text-success-darken-2 bg-green-lighten-5 px-4 rounded-lg">
                    {{ formatValue(change.newV) }}
                  </td>
                </tr>
                <tr v-if="parsedChanges.length === 0">
                  <td colspan="4" class="text-center py-12 text-grey italic bg-white">
                    <v-icon size="40" class="mb-2 opacity-20">mdi-database-eye-off</v-icon>
                    <div>Thao tác này không làm thay đổi các giá trị dữ liệu cụ thể.</div>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card>

        </div>
      </v-card-text>

      <v-card-actions class="pa-6 border-t bg-white no-print">
        <v-spacer/>
        <v-btn variant="text" @click="$emit('close')" class="px-6 rounded-lg font-weight-bold">Đóng</v-btn>
        <v-btn color="primary" variant="flat" prepend-icon="mdi-printer" class="px-8 rounded-lg font-weight-bold" @click="print">
          In chứng từ
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { formatDateTime } from '@/utils/helpers'
import { 
  translateAction, 
  translateField, 
  translateEntity, 
  permissionMap 
} from '@/utils/auditTranslations'

const props = defineProps({
  log: { type: Object, default: null }
})

defineEmits(['close'])

// Helper để lấy giá trị không phân biệt hoa thường
const getVal = (obj, key) => {
  if (!obj) return null
  return obj[key] ?? obj[key.charAt(0).toUpperCase() + key.slice(1)]
}

const getActionColor = (action) => {
  const act = action || ''
  if (act.includes('Added')) return 'success'
  if (act.includes('Modified')) return 'warning'
  if (act.includes('Deleted')) return 'error'
  return 'grey'
}

const formatValue = (val) => {
  if (val === null || val === undefined || val === '') return '---'
  if (val === true) return 'ĐÃ KÍCH HOẠT / CÓ'
  if (val === false) return 'NGỪNG HOẠT ĐỘNG / KHÔNG'
  if (Array.isArray(val)) return val.map(p => permissionMap[p] || p).join(', ')
  return val
}

const parsedChanges = computed(() => {
  if (!props.log) return []
  try {
    const oldValuesRaw = getVal(props.log, 'oldValues') || '{}'
    const newValuesRaw = getVal(props.log, 'newValues') || '{}'
    
    const oldV = typeof oldValuesRaw === 'string' ? JSON.parse(oldValuesRaw) : oldValuesRaw
    const newV = typeof newValuesRaw === 'string' ? JSON.parse(newValuesRaw) : newValuesRaw
    
    const allKeys = new Set([...Object.keys(oldV), ...Object.keys(newV)])
    const ignoreKeys = ['updatedAt', 'id', 'passwordHash', 'createdAt', 'UpdatedAt', 'Id', 'PasswordHash', 'IsDeleted']
    
    return Array.from(allKeys)
      .filter(key => {
        const isIgnored = ignoreKeys.some(ik => ik.toLowerCase() === key.toLowerCase())
        if (isIgnored) return false
        
        const ov = oldV[key]
        const nv = newV[key]
        return JSON.stringify(ov) !== JSON.stringify(nv)
      })
      .map(key => ({
        key: key,
        oldV: oldV[key],
        newV: newV[key]
      }))
  } catch (e) { 
    console.error('Parse Changes Error:', e)
    return [] 
  }
})

const describeDetailedLog = (l) => {
  const user = getVal(l, 'userName') || 'Hệ thống'
  const actionName = getVal(l, 'action')
  const action = translateAction(actionName)
  const entity = translateEntity(getVal(l, 'entityName'))
  const resName = getVal(l, 'resourceName') || ''
  
  if (actionName?.includes('Deleted')) return `${user} đã xóa đối tượng ${entity} ${resName} khỏi hệ thống.`
  if (actionName?.includes('Added')) return `${user} đã tạo mới ${entity} vào cơ sở dữ liệu.`
  
  return `${user} đã thực hiện cập nhật các thuộc tính thông tin cho ${entity}.`
}

const prettyJson = (jsonStr) => {
  try {
    if (!jsonStr || jsonStr === '{}') return '{}'
    const obj = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr
    return JSON.stringify(obj, null, 2)
  } catch (e) { return jsonStr }
}

const print = () => { window.print() }
</script>

<style scoped>
.audit-detail-card {
  box-shadow: 0 20px 50px rgba(0,0,0,0.15) !important;
}
.comparison-table :deep(th) {
  font-size: 0.7rem !important;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.strikes {
  text-decoration: line-through;
  opacity: 0.6;
}
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 0.75rem;
}
.json-box {
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid rgba(255,255,255,0.1);
}
@media print {
  .no-print { display: none !important; }
}
</style>
