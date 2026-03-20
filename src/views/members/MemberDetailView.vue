<template>
  <div>
    <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="router.back()">
      Quay lại danh sách
    </v-btn>

    <div v-if="loading" class="d-flex justify-center align-center" style="height: 400px;">
      <v-progress-circular indeterminate color="primary" size="64" />
    </div>

    <v-alert v-else-if="error" type="error" class="mb-4">{{ error }}</v-alert>

    <template v-else-if="member">
      <v-card class="mb-6 rounded-lg overflow-hidden" elevation="2">
        <v-img
          height="160"
          src="https://cdn.vuetifyjs.com/images/cards/server-room.jpg"
          cover
          class="align-end"
          gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.7)"
        >
          <v-card-title class="text-white d-flex align-end pl-6 pb-4" style="gap: 20px">
            <v-avatar size="100" color="white" class="elevation-4" style="border: 4px solid white; margin-bottom: -40px;">
              <span class="text-h3 font-weight-bold text-primary">
                {{ member.fullName?.charAt(0)?.toUpperCase() }}
              </span>
            </v-avatar>
            
            <div class="mb-2">
              <h1 class="text-h4 font-weight-bold mb-1" style="line-height: 1.2;">{{ member.fullName }}</h1>
              <div class="text-subtitle-1 opacity-90 font-weight-light d-flex align-center">
                <v-icon size="small" class="mr-1">mdi-card-account-details-outline</v-icon>
                {{ member.memberCode }} 
                <span class="mx-2">•</span> 
                <v-icon size="small" class="mr-1">mdi-calendar-check</v-icon>
                Tham gia {{ formatDate(member.joinedDate) }}
              </div>
            </div>
          </v-card-title>
        </v-img>

        <v-card-text class="pt-12 pl-6 pr-6 d-flex flex-column flex-sm-row justify-space-between align-center">
          <div class="d-flex gap-2 mt-4 mt-sm-0">
            <v-chip :color="statusColor(member.status)" variant="flat" size="large" class="font-weight-bold px-4">
              <v-icon start>mdi-circle-medium</v-icon>
              {{ member.status }}
            </v-chip>
            
            <v-chip v-if="member.gender" color="blue-grey" variant="tonal" size="large">
              <v-icon start>{{ member.gender === 'Nam' ? 'mdi-gender-male' : 'mdi-gender-female' }}</v-icon>
              {{ member.gender }}
            </v-chip>
          </div>

          <div v-if="authStore.canHandleCheckIn" class="d-flex gap-3 mt-4 mt-sm-0">
            <v-btn color="primary" variant="flat" prepend-icon="mdi-pencil" @click="openEdit" class="text-capitalize">
              Cập nhật hồ sơ
            </v-btn>
            <v-btn :color="member.faceEncoding ? 'success' : 'grey-darken-1'" variant="tonal" prepend-icon="mdi-face-recognition" @click="openFaceRegistration" class="text-capitalize">
              {{ member.faceEncoding ? 'Cập nhật Face ID' : 'Đăng ký Face ID' }}
            </v-btn>
            <v-btn v-if="!member.qrCode" color="secondary" variant="tonal" prepend-icon="mdi-qrcode" @click="generateQR" class="text-capitalize">
              Cấp QR Code
            </v-btn>
            <v-btn color="success" variant="outlined" prepend-icon="mdi-cash-plus" to="/billing" class="text-capitalize">
              Thanh toán
            </v-btn>
          </div>
        </v-card-text>
      </v-card>

      <v-row>
        <v-col cols="12" md="8">
          <v-card class="rounded-lg h-100" elevation="1">
            <v-tabs v-model="activeTab" color="primary" align-tabs="start">
              <v-tab value="info" class="text-capitalize"><v-icon start>mdi-account-box-outline</v-icon>Thông tin chi tiết</v-tab>
              <v-tab value="subs" class="text-capitalize"><v-icon start>mdi-ticket-account</v-icon>Gói tập</v-tab>
              <v-tab value="checkin" class="text-capitalize"><v-icon start>mdi-history</v-icon>Lịch sử ra vào</v-tab>
            </v-tabs>
            <v-divider></v-divider>

            <v-window v-model="activeTab" class="pa-6">
              <v-window-item value="info">
                <div class="mb-6">
                  <h3 class="text-h6 font-weight-bold mb-3 d-flex align-center text-primary">
                    <v-icon class="mr-2">mdi-contacts</v-icon> Liên hệ
                  </h3>
                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-list-item class="px-0">
                        <template #prepend><v-avatar color="blue-lighten-5" icon="mdi-phone" class="text-blue" rounded="0"></v-avatar></template>
                        <v-list-item-title class="font-weight-medium">{{ member.phoneNumber }}</v-list-item-title>
                        <v-list-item-subtitle>Số điện thoại</v-list-item-subtitle>
                      </v-list-item>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-list-item class="px-0">
                        <template #prepend><v-avatar color="blue-lighten-5" icon="mdi-email" class="text-blue" rounded="0"></v-avatar></template>
                        <v-list-item-title class="font-weight-medium">{{ member.email || 'Chưa cập nhật' }}</v-list-item-title>
                        <v-list-item-subtitle>Email</v-list-item-subtitle>
                      </v-list-item>
                    </v-col>
                    <v-col cols="12">
                      <v-list-item class="px-0">
                        <template #prepend><v-avatar color="blue-lighten-5" icon="mdi-map-marker" class="text-blue" rounded="0"></v-avatar></template>
                        <v-list-item-title class="font-weight-medium">{{ member.address || 'Chưa cập nhật' }}</v-list-item-title>
                        <v-list-item-subtitle>Địa chỉ</v-list-item-subtitle>
                      </v-list-item>
                    </v-col>
                  </v-row>
                </div>

                <v-divider class="mb-6 border-dashed"></v-divider>

                <div class="mb-6">
                  <h3 class="text-h6 font-weight-bold mb-3 d-flex align-center text-error">
                    <v-icon class="mr-2">mdi-alert-box-outline</v-icon> Khẩn cấp
                  </h3>
                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-list-item class="px-0">
                        <template #prepend><v-avatar color="red-lighten-5" icon="mdi-account-alert" class="text-error" rounded="0"></v-avatar></template>
                        <v-list-item-title class="font-weight-medium">{{ member.emergencyContact || '---' }}</v-list-item-title>
                        <v-list-item-subtitle>Người liên hệ</v-list-item-subtitle>
                      </v-list-item>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-list-item class="px-0">
                        <template #prepend><v-avatar color="red-lighten-5" icon="mdi-phone-alert" class="text-error" rounded="0"></v-avatar></template>
                        <v-list-item-title class="font-weight-medium">{{ member.emergencyPhone || '---' }}</v-list-item-title>
                        <v-list-item-subtitle>SĐT Khẩn cấp</v-list-item-subtitle>
                      </v-list-item>
                    </v-col>
                  </v-row>
                </div>

                <v-divider class="mb-6 border-dashed"></v-divider>

                <div>
                  <h3 class="text-h6 font-weight-bold mb-3 d-flex align-center text-grey-darken-2">
                    <v-icon class="mr-2">mdi-text-box-outline</v-icon> Ghi chú
                  </h3>
                  <v-sheet color="grey-lighten-4" class="pa-4 rounded-lg border">
                    {{ member.note || 'Không có ghi chú nào cho hội viên này.' }}
                  </v-sheet>
                </div>
              </v-window-item>

              <v-window-item value="subs">
                <div class="d-flex justify-space-between align-center mb-4">
                  <h3 class="text-h6 font-weight-bold">Lịch sử đăng ký</h3>
                  <v-btn color="primary" prepend-icon="mdi-plus" size="small" @click="openRenew(null)">Đăng ký gói mới</v-btn>
                </div>
                <v-data-table
                  :headers="subHeaders"
                  :items="subscriptions"
                  :loading="loadingSubs"
                  hover
                  class="border rounded-lg"
                >
                  <template #item.packageName="{ item }">
                    <div class="d-flex align-center">
                      <v-avatar color="primary" variant="tonal" size="32" class="mr-3">
                        <v-icon size="18">mdi-dumbbell</v-icon>
                      </v-avatar>
                      <div class="d-flex flex-column">
                        <span class="font-weight-bold">{{ item.originalPackageName || item.packageName }}</span>
                        <span class="text-caption text-blue-darken-2">Giá: {{ formatCurrency(item.originalPrice) }}</span>
                      </div>
                    </div>
                  </template>

                  <template #item.status="{ item }">
                    <v-chip :color="statusColor(item.status)" size="small" variant="flat" class="font-weight-bold">
                      {{ item.status }}
                    </v-chip>
                  </template>
                  <template #item.startDate="{ item }">
                    {{ formatDate(item.startDate) }}
                  </template>
                  <template #item.endDate="{ item }">
                    {{ formatDate(item.endDate) }}
                  </template>

                  <template #item.actions="{ item }">
                    <div class="d-flex gap-1">
                      <v-btn
                        v-if="item.status === 'Active'"
                        icon="mdi-pause"
                        size="x-small"
                        color="warning"
                        variant="text"
                        title="Tạm dừng"
                        @click="handlePause(item)"
                      />
                      <v-btn
                        v-if="item.status === 'Active' || item.status === 'Expired'"
                        icon="mdi-refresh"
                        size="x-small"
                        color="primary"
                        variant="text"
                        title="Gia hạn"
                        @click="openRenew(item)"
                      />
                      <v-btn
                        v-if="item.status === 'Pending'"
                        icon="mdi-check"
                        size="x-small"
                        color="success"
                        variant="text"
                        title="Kích hoạt"
                        @click="handleActivate(item)"
                      />
                    </div>
                  </template>

                  <template #no-data>
                    <div class="text-center py-8 text-grey">
                      <v-icon size="48" color="grey-lighten-2" class="mb-2">mdi-ticket-off-outline</v-icon>
                      <p>Chưa có lịch sử đăng ký gói</p>
                    </div>
                  </template>
                </v-data-table>
              </v-window-item>

              <v-window-item value="checkin">
                <v-data-table
                  :headers="checkInHeaders"
                  :items="checkIns"
                  :loading="loadingCheckIns"
                  hover
                  class="border rounded-lg"
                >
                  <template #item.checkInTime="{ item }">
                    <div class="d-flex align-center">
                      <v-icon color="success" size="small" class="mr-3">mdi-login-variant</v-icon>
                      <span class="font-weight-medium">{{ formatDateTime(item.checkInTime) }}</span>
                    </div>
                  </template>
                  
                  <template #item.checkOutTime="{ item }">
                    <div v-if="item.checkOutTime" class="d-flex align-center text-grey-darken-1">
                      <v-icon size="small" class="mr-2">mdi-logout-variant</v-icon>
                      <span>{{ formatDateTime(item.checkOutTime) }}</span>
                    </div>
                    <v-chip v-else color="warning" size="small" variant="flat" class="font-weight-bold">
                      <v-icon start size="small">mdi-run-fast</v-icon> Đang tập
                    </v-chip>
                  </template>

                  <template #item.packageName="{ item }">
                    <v-chip size="small" color="blue-grey" variant="tonal">{{ item.packageName }}</v-chip>
                  </template>

                  <template #item.actions="{ item }">
                    <v-btn
                      v-if="!item.checkOutTime && authStore.canHandleCheckIn"
                      color="error"
                      variant="tonal"
                      size="small"
                      prepend-icon="mdi-logout"
                      :loading="checkoutLoadingId === item.id"
                      @click="handleCheckOut(item.id)"
                    >
                      Check-out
                    </v-btn>
                  </template>

                  <template #no-data>
                    <div class="text-center py-8 text-grey">
                      <v-icon size="48" color="grey-lighten-2" class="mb-2">mdi-history</v-icon>
                      <p>Chưa có lịch sử ra vào</p>
                    </div>
                  </template>
                </v-data-table>
              </v-window-item>
            </v-window>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="rounded-lg mb-4" elevation="1">
            <v-card-title class="text-subtitle-1 font-weight-bold d-flex align-center">
              <v-icon size="small" class="mr-2" color="grey">mdi-information-outline</v-icon>
              Tổng quan
            </v-card-title>
            <v-divider></v-divider>
            <v-list density="comfortable" class="py-0">
              <v-list-item class="py-3">
                <template #prepend><v-icon color="grey-darken-1" class="mr-2">mdi-cake-variant-outline</v-icon></template>
                <v-list-item-title class="text-caption text-grey">Ngày sinh</v-list-item-title>
                <template #append>
                  <span class="font-weight-medium text-body-2">{{ member.dateOfBirth ? formatDate(member.dateOfBirth) : 'N/A' }}</span>
                </template>
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item class="py-3">
                <template #prepend><v-icon color="grey-darken-1" class="mr-2">mdi-calendar-start-outline</v-icon></template>
                <v-list-item-title class="text-caption text-grey">Ngày tham gia</v-list-item-title>
                <template #append>
                  <span class="font-weight-medium text-body-2">{{ formatDate(member.joinedDate) }}</span>
                </template>
              </v-list-item>
            </v-list>
          </v-card>

          <v-row dense>
            <v-col cols="6">
              <v-card color="primary" variant="flat" class="text-center pa-4 rounded-lg h-100">
                <div class="text-h4 font-weight-bold mb-1">{{ checkIns.length }}</div>
                <div class="text-caption font-weight-medium text-uppercase opacity-80">Lượt tập</div>
              </v-card>
            </v-col>
            <v-col cols="6">
              <v-card color="teal" variant="flat" class="text-center pa-4 rounded-lg h-100">
                <div class="text-h4 font-weight-bold mb-1">
                  <v-icon v-if="activeSubscription">mdi-check</v-icon>
                  <v-icon v-else>mdi-close</v-icon>
                </div>
                <div class="text-caption font-weight-medium text-uppercase opacity-80">Gói Active</div>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </template>

    <member-form-dialog v-model="editDialog" :member-id="route.params.id" @saved="loadMember" />

    <!-- Renew Dialog -->
    <v-dialog v-model="renewDialog" max-width="500">
      <v-card>
        <v-card-title class="pa-6 bg-primary text-white">
          <v-icon class="mr-2">mdi-refresh</v-icon>
          {{ selectedSub ? 'Gia hạn gói tập' : 'Đăng ký gói mới' }}
        </v-card-title>
        <v-card-text class="pa-6">
          <v-select
            v-model="selectedPackageId"
            :items="packages"
            item-title="name"
            item-value="id"
            label="Chọn gói tập mới"
            variant="outlined"
            density="comfortable"
          >
             <template #item="{ props, item }">
               <v-list-item v-bind="props">
                 <v-list-item-subtitle>{{ formatCurrency(item.raw.price) }} / {{ item.raw.durationInDays }} ngày</v-list-item-subtitle>
               </v-list-item>
             </template>
          </v-select>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="renewDialog = false">Hủy</v-btn>
          <v-btn color="primary" :disabled="!selectedPackageId" :loading="renewing" @click="confirmRenew">Xác nhận</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Face Registration Dialog -->
    <v-dialog v-model="faceDialog" max-width="500">
      <v-card class="rounded-xl overflow-hidden">
        <v-card-title class="bg-primary text-white pa-4">
          <v-icon start>mdi-face-recognition</v-icon>
          Đăng ký khuôn mặt (Face ID)
        </v-card-title>
        <v-card-text class="pa-0">
          <div class="bg-black position-relative" style="height: 350px;">
            <video ref="regVideo" autoplay muted playsinline style="width: 100%; height: 100%; object-fit: cover;"></video>
            <div class="face-guide"></div>
            <div v-if="capturing" class="scan-overlay">
              <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
              <p class="text-white mt-4">Đang mã hóa khuôn mặt...</p>
            </div>
          </div>
          <div class="pa-4 text-center">
            <p class="text-caption text-grey-darken-1 mb-4">
              Vui lòng nhìn thẳng vào camera để hệ thống thu thập dữ liệu sinh trắc học.
            </p>
            <div class="d-flex justify-center gap-2">
              <v-btn color="grey-lighten-3" @click="closeFaceRegistration">Hủy bỏ</v-btn>
              <v-btn color="primary" :loading="capturing" @click="registerFace">Chụp & Lưu Face ID</v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
// ... existing imports ...
import { nextTick } from 'vue'

const faceDialog = ref(false)
const regVideo = ref(null)
const capturing = ref(false)
let regStream = null

const openFaceRegistration = async () => {
  faceDialog.value = true
  await nextTick()
  try {
    regStream = await navigator.mediaDevices.getUserMedia({ video: true })
    if (regVideo.value) regVideo.value.srcObject = regStream
  } catch (err) {
    alert('Không thể mở camera đăng ký!')
  }
}

const closeFaceRegistration = () => {
  if (regStream) {
    regStream.getTracks().forEach(t => t.stop())
    regStream = null
  }
  faceDialog.value = false
}

const registerFace = async () => {
  capturing.value = true
  // Mã hóa ổn định dựa trên MemberCode để phục vụ Simulation Check-in
  const mockEncoding = `face_encoded_${member.value.memberCode}`
  
  try {
    const res = await memberService.update(member.value.id || member.value.Id, {
      ...member.value,
      faceEncoding: mockEncoding
    })
    
    if (res.success || res.Success) {
      member.value.faceEncoding = mockEncoding
      alert('✅ Đăng ký khuôn mặt thành công!')
      closeFaceRegistration()
    } else {
      alert(res.message || 'Lỗi đăng ký khuôn mặt')
    }
  } catch (error) {
    alert('Lỗi kết nối khi đăng ký khuôn mặt')
  } finally {
    capturing.value = false
  }
}

const generateQR = async () => {
  if (!confirm('Tạo mã QR riêng cho hội viên này?')) return
  const newQR = `GYMQR_${member.value.memberCode}_${Math.random().toString(36).substr(2, 5).toUpperCase()}`
  
  try {
    const res = await memberService.update(member.value.id || member.value.Id, {
      ...member.value,
      qrCode: newQR
    })
    
    if (res.success || res.Success) {
      member.value.qrCode = newQR
      alert('✅ Đã cấp QR Code thành công!')
    } else {
      alert(res.message || 'Lỗi cấp QR Code')
    }
  } catch (error) {
    alert('Lỗi kết nối máy chủ')
  }
}
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth' 
import { memberService } from '@/services/memberService'
import { subscriptionService } from '@/services/subscriptionService'
import { packageService } from '@/services/packageService'
import { checkinService } from '@/services/checkinService' 

import MemberFormDialog from '@/components/members/MemberFormDialog.vue'
import { formatDate, formatDateTime } from '@/utils/helpers'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore() 

const member = ref(null)
const subscriptions = ref([])
const checkIns = ref([])
const packages = ref([])
const loading = ref(false)
const loadingSubs = ref(false)
const loadingCheckIns = ref(false)
const renewing = ref(false)
const error = ref(null)
const editDialog = ref(false)
const renewDialog = ref(false)
const activeTab = ref('info')
const checkoutLoadingId = ref(null) 
const selectedSub = ref(null)
const selectedPackageId = ref(null)

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0)
}

const activeSubscription = computed(() => 
  subscriptions.value.find(s => s.status === 'Active')
)

const subHeaders = [
  { title: 'Gói tập', key: 'packageName' },
  { title: 'Trạng thái', key: 'status', align: 'center' },
  { title: 'Bắt đầu', key: 'startDate' },
  { title: 'Kết thúc', key: 'endDate' },
  { title: 'Thao tác', key: 'actions', align: 'end', sortable: false },
]

const checkInHeaders = [
  { title: 'Thời gian vào', key: 'checkInTime' },
  { title: 'Thời gian ra', key: 'checkOutTime' }, 
  { title: 'Gói sử dụng', key: 'packageName' },
  { title: 'Thao tác', key: 'actions', align: 'end', sortable: false }, 
]

const statusColor = (status) => {
  if (status === 'Active') return 'success'
  if (status === 'Expired') return 'warning'
  if (status === 'Cancelled') return 'error'
  if (status === 'Suspended') return 'orange'
  if (status === 'Pending') return 'info'
  return 'grey'
}

const loadMember = async () => {
  loading.value = true
  try {
    const res = await memberService.getById(route.params.id)
    if (res.success || res.Success) {
      member.value = res.data || res.Data
      loadSubscriptions()
      loadCheckIns()
      loadPackages()
    } else {
      error.value = res.message || 'Không tìm thấy hội viên'
    }
  } catch (err) {
    error.value = 'Lỗi kết nối máy chủ'
  } finally {
    loading.value = false
  }
}

const loadSubscriptions = async () => {
  loadingSubs.value = true
  try {
    const res = await subscriptionService.getByMember(route.params.id)
    if (res.success || res.Success) {
      subscriptions.value = res.data || res.Data || []
    }
  } catch (e) { console.error(e) }
  finally { loadingSubs.value = false }
}

const loadPackages = async () => {
  try {
    const res = await packageService.getAll()
    if (res.success || res.Success) {
      packages.value = (res.data || res.Data)?.filter(p => p.isActive) || []
    }
  } catch (e) { console.error(e) }
}

const loadCheckIns = async () => {
  loadingCheckIns.value = true
  try {
    const res = await checkinService.getByMember(route.params.id) 
    
    let rawData = []
    if (Array.isArray(res)) rawData = res
    else if (res && (res.data || res.Data)) rawData = res.data || res.Data
    else if (res && (res.items || res.Items)) rawData = res.items || res.Items

    checkIns.value = rawData.map(item => ({
      id: item.id || item.Id,
      checkInTime: item.checkInTime || item.CheckInTime || item.createdAt || item.CreatedAt,
      checkOutTime: item.checkOutTime || item.CheckOutTime, 
      packageName: item.packageName || item.PackageName || item.method || item.Method || 'Vé lượt'
    }))

  } catch (e) { console.error(e) }
  finally { loadingCheckIns.value = false }
}

const handleCheckOut = async (checkInId) => {
  if (!confirm('Xác nhận hội viên ra về? (Check-out)')) return

  checkoutLoadingId.value = checkInId
  try {
    const res = await checkinService.checkOut(checkInId)
    if (res.success || res.Success) {
      await loadCheckIns() 
    } else {
      alert(res.message || 'Có lỗi xảy ra khi Check-out')
    }
  } catch (error) {
    console.error(error)
    alert('Lỗi kết nối đến máy chủ')
  } finally {
    checkoutLoadingId.value = null
  }
}

const openRenew = (sub) => {
  selectedSub.value = sub
  selectedPackageId.value = sub ? sub.packageId : null
  renewDialog.value = true
}

const confirmRenew = async () => {
  renewing.value = true
  try {
    let res
    const pId = selectedPackageId.value
    const mId = route.params.id

    if (selectedSub.value) {
      // Đảm bảo lấy ID dù case-sensitive (id hay Id)
      const subId = selectedSub.value.id || selectedSub.value.Id
      res = await subscriptionService.renew(subId, pId)
    } else {
      res = await subscriptionService.create({
        MemberId: mId,
        PackageId: pId,
        StartDate: new Date().toISOString(),
        UserId: "",
        VoucherCode: "",
        PaymentMethod: "Cash"
      })
    }

    if (res.success || res.Success) {
      renewDialog.value = false
      alert(res.message || res.Message || 'Thao tác thành công!')
      loadSubscriptions()
    } else {
      alert(res.message || res.Message || 'Thao tác thất bại')
    }
  } catch (e) {
    console.error('Renew error details:', e)
    const errorData = e.response?.data
    console.log('Error Data received from server:', errorData)

    let errorMsg = ''
    
    if (typeof errorData === 'string') {
      errorMsg = errorData
    } else if (errorData) {
      // Ưu tiên bóc tách message từ ResponseDto
      errorMsg = errorData.message || errorData.Message || errorData.title || errorData.Title
      
      // Nếu là lỗi Validation từ ASP.NET Core (errors object)
      if (errorData.errors) {
        const details = Object.entries(errorData.errors)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join('\n')
        errorMsg = `${errorMsg || 'Lỗi dữ liệu'}:\n- ${details}`
      }
    }

    // Nếu vẫn trắng thông báo, hiển thị chi tiết nội dung phản hồi từ server
    if (!errorMsg && errorData) {
      errorMsg = 'Lỗi từ Server:\n' + JSON.stringify(errorData, null, 2)
    }

    alert(errorMsg || e.message || 'Lỗi không xác định khi kết nối server')
  } finally {
    renewing.value = false
  }
}

const handlePause = async (item) => {
  const id = item.id || item.Id
  if (!confirm('Tạm dừng gói tập này?')) return
  try {
    const res = await subscriptionService.pause(id)
    if (res.success || res.Success) {
      loadSubscriptions()
    } else {
      alert(res.message || res.Message || 'Thao tác thất bại')
    }
  } catch (e) {
    console.error(e)
  }
}

const handleActivate = async (item) => {
  const id = item.id || item.Id
  if (!confirm('Kích hoạt gói tập này? (Yêu cầu đã thanh toán)')) return
  try {
    const res = await subscriptionService.activate(id)
    if (res.success || res.Success) {
      loadSubscriptions()
    } else {
      alert(res.message || res.Message || 'Thao tác thất bại. Có thể gói này chưa được thanh toán.')
    }
  } catch (e) {
    console.error(e)
  }
}

const openEdit = () => {
  editDialog.value = true
}

onMounted(loadMember)
</script>

<style scoped>
.face-guide {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 250px;
  height: 300px;
  border: 2px dashed rgba(255,255,255,0.5);
  border-radius: 125px / 150px;
  pointer-events: none;
}
.scan-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.v-card { transition: box-shadow 0.2s; }
</style>