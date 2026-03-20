<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Quản lý Đăng ký</h1>
        <p class="text-subtitle-1 text-grey mt-1">Quản lý các gói tập của hội viên</p>
      </div>
      <v-btn color="primary" size="large" prepend-icon="mdi-plus" @click="openCreate">
        Đăng ký mới
      </v-btn>
    </div>

    <v-alert
      v-if="subStore.expiringCount > 0"
      type="warning"
      variant="tonal"
      class="mb-6"
      closable
      :title="`${subStore.expiringCount} gói sắp hết hạn trong 7 ngày`"
      text="Vui lòng liên hệ hội viên để gia hạn."
    />

    <v-row class="mb-6">
      <v-col v-for="stat in stats" :key="stat.label" cols="6" md="3">
        <v-card variant="tonal" :color="stat.color">
          <v-card-text>
            <div class="text-caption">{{ stat.label }}</div>
            <div class="text-h4 font-weight-bold">{{ stat.value }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card>
      <v-tabs v-model="activeTab" color="primary">
        <v-tab value="all">Tất cả</v-tab>
        <v-tab value="Active">
          Đang tập
          <v-chip size="x-small" color="success" class="ml-2">{{ subStore.totalActive }}</v-chip>
        </v-tab>
        <v-tab value="Pending">Chờ thanh toán</v-tab>
        <v-tab value="Expired">Hết hạn</v-tab>
        <v-tab value="Cancelled">Đã hủy</v-tab>
      </v-tabs>
      <v-divider />

      <v-data-table
        :headers="headers"
        :items="filteredSubscriptions"
        :loading="subStore.loading"
        :items-per-page="10"
      >
        <template #item.memberName="{ item }">
          <div class="font-weight-medium">{{ item.memberName || '—' }}</div>
          <div class="text-caption text-grey">{{ item.memberCode }}</div>
        </template>

        <template #item.packageName="{ item }">
          <v-chip size="small" color="primary" variant="tonal">
            {{ item.originalPackageName || item.packageName || '—' }}
          </v-chip>
        </template>

        <template #item.status="{ item }">
          <v-chip :color="statusColor(item.status)" size="small" variant="tonal">
            {{ item.status }}
          </v-chip>
        </template>

        <template #item.startDate="{ item }">
          {{ formatDate(item.startDate) }}
        </template>

        <template #item.endDate="{ item }">
          <span :class="checkExpiring(item.endDate) ? 'text-warning font-weight-bold' : ''">
            {{ formatDate(item.endDate) }}
          </span>
          <v-chip v-if="checkExpiring(item.endDate)" size="x-small" color="warning" class="ml-1">
            Sắp hết
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex gap-1 justify-center">
            <v-tooltip v-if="item.status === 'Pending'" text="Thanh toán & Kích hoạt">
              <template #activator="{ props }">
                <v-btn v-bind="props" icon="mdi-cash-check" size="small" variant="text" color="success" to="/billing" />
              </template>
            </v-tooltip>
            
            <v-tooltip v-if="['Active', 'Pending'].includes(item.status)" text="Hủy gói">
              <template #activator="{ props }">
                <v-btn v-bind="props" icon="mdi-cancel" size="small" variant="text" color="error" @click="openCancel(item)" />
              </template>
            </v-tooltip>
          </div>
        </template>

        <template #no-data>
          <div class="text-center py-12">
            <v-icon size="64" color="grey-lighten-2">mdi-card-off</v-icon>
            <p class="text-h6 text-grey mt-4">Không tìm thấy dữ liệu</p>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="createDialog" max-width="500" persistent>
      <v-card>
        <v-card-title class="d-flex align-center pa-6 bg-primary text-white">
          <v-icon class="mr-2">mdi-card-plus</v-icon>
          Đăng ký gói tập mới
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" color="white" @click="createDialog = false" />
        </v-card-title>
        <v-card-text class="pa-6">
          <v-form ref="createFormRef">
            <v-autocomplete
              v-model="createForm.memberId"
              label="Chọn Hội viên *"
              :items="memberOptions"
              item-title="label"
              item-value="id"
              variant="outlined"
              density="comfortable"
              :rules="[r.required]"
              :disabled="saving"
              class="mb-4"
              no-data-text="Không tìm thấy hội viên"
            />
            <v-select
              v-model="createForm.packageId"
              label="Chọn Gói tập *"
              :items="pkgOptions"
              item-title="label"
              item-value="id"
              variant="outlined"
              density="comfortable"
              :rules="[r.required]"
              :disabled="saving"
              class="mb-4"
              no-data-text="Không có gói tập nào đang mở"
            />
            <v-text-field
              v-model="createForm.startDate"
              label="Ngày bắt đầu *"
              type="date"
              variant="outlined"
              density="comfortable"
              :rules="[r.required]"
              :disabled="saving"
            />
          </v-form>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="outlined" :disabled="saving" @click="createDialog = false">Hủy bỏ</v-btn>
          <v-btn color="primary" :loading="saving" @click="handleCreate">Tạo đăng ký</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="cancelDialog" max-width="400" persistent>
      <v-card>
        <v-card-title class="pa-4 text-error d-flex align-center">
          <v-icon class="mr-2">mdi-alert-circle</v-icon>
          Hủy gói tập
        </v-card-title>
        <v-card-text>
          <p class="mb-2">Bạn có chắc chắn muốn hủy gói tập này không?</p>
          <v-textarea
            v-model="cancelReason"
            label="Lý do hủy *"
            variant="outlined"
            rows="3"
            :rules="[r.required]"
            auto-grow
          />
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="outlined" @click="cancelDialog = false">Quay lại</v-btn>
          <v-btn color="error" :loading="subStore.loading" @click="handleCancel">
            Xác nhận Hủy
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snack.show" :color="snack.color" location="top right" timeout="3000">
      {{ snack.message }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSubscriptionStore } from '@/stores/subscription'
import { usePackageStore } from '@/stores/package'
import { useMemberStore } from '@/stores/member'
import { useAuthStore } from '@/stores/auth'

const subStore = useSubscriptionStore()
const pkgStore = usePackageStore()
const memberStore = useMemberStore()
const authStore = useAuthStore()

const activeTab = ref('all')
const createDialog = ref(false)
const cancelDialog = ref(false)
const saving = ref(false)
const createFormRef = ref(null)
const selectedSub = ref(null)
const cancelReason = ref('')
const snack = ref({ show: false, message: '', color: 'success' })

const r = { required: (v) => !!v || 'Thông tin bắt buộc' }

const createForm = ref({
  memberId: null,
  packageId: null,
  startDate: new Date().toISOString().split('T')[0],
})

const headers = [
  { title: 'Hội viên', key: 'memberName', minWidth: '180px' },
  { title: 'Gói tập', key: 'packageName', width: '160px' },
  { title: 'Trạng thái', key: 'status', width: '120px', align: 'center' },
  { title: 'Bắt đầu', key: 'startDate', width: '120px' },
  { title: 'Kết thúc', key: 'endDate', width: '120px' },
  { title: 'Thao tác', key: 'actions', width: '100px', sortable: false, align: 'center' },
]

const filteredSubscriptions = computed(() => {
  if (activeTab.value === 'all') return subStore.subscriptions
  return subStore.subscriptions.filter((s) => s.status === activeTab.value)
})

const stats = computed(() => [
  { label: 'Tổng số', value: subStore.subscriptions.length, color: 'blue-grey' },
  { label: 'Đang tập', value: subStore.totalActive, color: 'success' },
  { label: 'Sắp hết hạn', value: subStore.expiringCount, color: 'warning' },
  { label: 'Đã hủy/Hết hạn', value: subStore.subscriptions.filter((s) => ['Expired', 'Cancelled'].includes(s.status)).length, color: 'error' },
])

const memberOptions = computed(() =>
  memberStore.members.map((m) => ({ id: m.id, label: `${m.fullName} (${m.memberCode})` }))
)

const pkgOptions = computed(() =>
  pkgStore.activePackages.map((p) => ({ id: p.id, label: `${p.name} — ${formatCurrency(p.price)}` }))
)

const statusColor = (status) => ({ Active: 'success', Pending: 'warning', Expired: 'error', Cancelled: 'grey' })[status] || 'grey'

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0)

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('vi-VN')
}

const checkExpiring = (endDate) => {
  if (!endDate) return false
  const days = (new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24)
  return days >= 0 && days <= 7
}

const showSnack = (msg, color = 'success') => {
  snack.value = { show: true, message: msg, color }
}

const openCreate = () => {
  createForm.value = {
    memberId: null,
    packageId: null,
    startDate: new Date().toISOString().split('T')[0],
  }
  createDialog.value = true
}

const handleCreate = async () => {
  const { valid } = await createFormRef.value.validate()
  if (!valid) return
  
  saving.value = true
  const payload = {
    memberId: createForm.value.memberId,
    packageId: createForm.value.packageId,
    startDate: new Date(createForm.value.startDate).toISOString(),
    userId: authStore.userId || "00000000-0000-0000-0000-000000000000",
    voucherCode: "",
    paymentMethod: "Chưa thanh toán"
  }

  const result = await subStore.createSubscription(payload)
  saving.value = false
  
  if (result.success || result.Success) {
    createDialog.value = false
    showSnack('Đã tạo đăng ký thành công!')
    await subStore.fetchAll() 
  } else {
    showSnack(result.message || 'Lỗi khi tạo đăng ký', 'error')
  }
}

const openCancel = (sub) => {
  selectedSub.value = sub
  cancelReason.value = ''
  cancelDialog.value = true
}

const handleCancel = async () => {
  if (!cancelReason.value.trim()) {
    showSnack('Vui lòng nhập lý do hủy', 'warning')
    return
  }
  
  const result = await subStore.cancelSubscription(selectedSub.value.id, cancelReason.value)
  if (result.success || result.Success) {
    cancelDialog.value = false
    showSnack('Đã hủy gói tập thành công')
    await subStore.fetchAll()
  } else {
    showSnack(result.message || 'Lỗi hủy gói', 'error')
  }
}

onMounted(() => {
  subStore.fetchAll()
  subStore.fetchExpiring()
  pkgStore.fetchPackages()
  memberStore.fetchMembers(1, 100)
})
</script>