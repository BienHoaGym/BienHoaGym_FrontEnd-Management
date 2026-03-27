<template>
  <v-dialog v-bind="$attrs" max-width="900" scrollable>
    <v-card class="rounded-xl overflow-hidden">
      <v-card-title class="pa-6 font-weight-bold d-flex align-center border-b bg-grey-lighten-4">
        <v-icon start color="primary">mdi-information-outline</v-icon>
        CHI TIẾT BẢN GHI NHẬT KÝ
        <v-spacer/>
        <v-btn icon="mdi-close" variant="text" size="small" @click="$emit('close')"/>
      </v-card-title>
      
      <v-card-text class="pa-0">
        <!-- Summary Bar -->
        <div class="d-flex pa-6 bg-blue-lighten-5 gap-6 flex-wrap">
           <div>
              <div class="text-overline text-grey-darken-1 font-weight-bold">THỜI GIAN</div>
              <div class="text-body-1 font-weight-bold">{{ formatDateTime(log?.timestamp) }}</div>
           </div>
           <v-divider vertical class="d-none d-sm-block mx-2"/>
           <div>
              <div class="text-overline text-grey-darken-1 font-weight-bold">NHÂN VIÊN</div>
              <div class="text-body-1 font-weight-bold text-primary">{{ log?.userName }}</div>
           </div>
           <v-divider vertical class="d-none d-sm-block mx-2"/>
           <div>
              <div class="text-overline text-grey-darken-1 font-weight-bold">HÀNH ĐỘNG</div>
              <v-chip size="small" :color="getActionColor(log?.action)" class="font-weight-black">
                 {{ translateAction(log?.action) }}
              </v-chip>
           </div>
           <v-divider vertical class="d-none d-sm-block mx-2"/>
           <div>
              <div class="text-overline text-grey-darken-1 font-weight-bold">ĐỊA CHỈ IP</div>
              <div class="text-body-1 font-weight-bold">{{ log?.ipAddress || 'Internal' }}</div>
           </div>
        </div>

        <div class="pa-6">
          <!-- Details Section -->
          <div class="mb-6" v-if="log?.reason">
             <div class="text-subtitle-2 font-weight-bold mb-2">LÝ DO THAY ĐỔI:</div>
             <v-alert density="compact" color="info" variant="tonal" class="rounded-lg">
                {{ log.reason }}
             </v-alert>
          </div>

          <div class="text-subtitle-2 font-weight-bold mb-3">SO SÁNH THAY ĐỔI:</div>
          <v-card variant="outlined" class="rounded-lg border overflow-hidden">
            <v-table density="comfortable">
              <thead class="bg-grey-lighten-4">
                <tr>
                  <th class="font-weight-bold">Thuộc tính</th>
                  <th class="font-weight-bold">Giá trị cũ</th>
                  <th class="font-weight-bold text-center" width="50">→</th>
                  <th class="font-weight-bold">Giá trị mới</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="change in parsedChanges" :key="change.key">
                  <td class="text-body-2 font-weight-bold py-3">{{ translateField(change.key) }}</td>
                  <td class="text-body-2 text-error text-decoration-line-through">{{ formatValue(change.oldV) }}</td>
                  <td class="text-center"><v-icon size="16" color="grey">mdi-chevron-right</v-icon></td>
                  <td class="text-body-2 text-success font-weight-bold">{{ formatValue(change.newV) }}</td>
                </tr>
                <tr v-if="parsedChanges.length === 0">
                  <td colspan="4" class="text-center py-6 text-grey italic">
                     Hành động không làm thay đổi các thuộc tính dữ liệu cụ thể.
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card>

          <v-row class="mt-6">
            <v-col cols="12" md="6">
              <div class="text-caption font-weight-bold mb-1 text-grey">DỮ LIỆU GỐC (JSON):</div>
              <v-sheet class="pa-3 bg-grey-darken-4 rounded-lg overflow-auto" height="200">
                <pre class="text-caption text-green-accent-1">{{ prettyJson(log?.oldValues) }}</pre>
              </v-sheet>
            </v-col>
            <v-col cols="12" md="6">
              <div class="text-caption font-weight-bold mb-1 text-grey">DỮ LIỆU MỚI (JSON):</div>
              <v-sheet class="pa-3 bg-grey-darken-4 rounded-lg overflow-auto" height="200">
                <pre class="text-caption text-blue-lighten-4">{{ prettyJson(log?.newValues) }}</pre>
              </v-sheet>
            </v-col>
          </v-row>
        </div>
      </v-card-text>

      <v-card-actions class="pa-6 border-t no-print">
        <v-spacer/>
        <v-btn variant="text" @click="$emit('close')" class="px-6 rounded-lg font-weight-bold">Đóng</v-btn>
        <v-btn color="primary" variant="flat" prepend-icon="mdi-printer" class="px-6 rounded-lg font-weight-bold" @click="print">
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
  permissionMap 
} from '@/utils/auditTranslations'

const props = defineProps({
  log: {
    type: Object,
    default: null
  }
})

defineEmits(['close'])

const getActionColor = (action) => {
  if (action?.includes('Added')) return 'success'
  if (action?.includes('Modified')) return 'warning'
  if (action?.includes('Deleted')) return 'error'
  return 'grey'
}

const formatValue = (val) => {
  if (val === null || val === undefined) return '---'
  if (val === true) return 'BẬT'
  if (val === false) return 'TẮT'
  if (Array.isArray(val)) return val.map(p => permissionMap[p] || p).join(', ')
  return val
}

const parsedChanges = computed(() => {
  if (!props.log) return []
  try {
    const oldV = JSON.parse(props.log.oldValues || '{}')
    const newV = JSON.parse(props.log.newValues || '{}')
    const allKeys = new Set([...Object.keys(oldV), ...Object.keys(newV)])
    const ignoreKeys = ['UpdatedAt', 'Id', 'PasswordHash', 'CreatedAt']
    
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
    if (!jsonStr || jsonStr === '{}') return '{}'
    const obj = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr
    return JSON.stringify(obj, null, 2)
  } catch (e) { return jsonStr }
}

const print = () => {
    window.print()
}
</script>

<style scoped>
.gap-6 { gap: 24px; }
pre { white-space: pre-wrap; font-family: monospace; }
@media print {
  .no-print { display: none !important; }
}
</style>
