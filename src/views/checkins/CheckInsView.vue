<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Check-ins</h1>
        <p class="text-subtitle-1 text-grey mt-1">
          {{ formatDate(new Date()) }} — {{ currentTime }}
        </p>
      </div>
      <div class="d-flex gap-2">
        <v-chip color="success" size="large" prepend-icon="mdi-account-check">
          In Gym: {{ checkinStore.currentlyInGym }}
        </v-chip>
        <v-chip color="primary" size="large" prepend-icon="mdi-login">
          Today: {{ checkinStore.todayTotal }}
        </v-chip>
      </div>
    </div>

    <v-row>
      <v-col cols="12" md="5">
        <v-card elevation="3" class="rounded-xl overflow-hidden">
          <v-tabs v-model="activeMethod" bg-color="primary" grow>
            <v-tab value="code"><v-icon start>mdi-keyboard</v-icon> Mã/SĐT</v-tab>
            <v-tab value="qr"><v-icon start>mdi-qrcode-scan</v-icon> QR Code</v-tab>
            <v-tab value="face"><v-icon start>mdi-face-recognition</v-icon> Face ID</v-tab>
          </v-tabs>

          <v-card-text class="pa-6">
            <v-window v-model="activeMethod">
              <!-- Nhập mã / Quét QR -->
              <v-window-item value="code">
                <v-autocomplete
                  ref="inputRef"
                  v-model="memberCode"
                  :items="memberList"
                  item-title="fullName"
                  item-value="memberCode"
                  label="Tên, SĐT hoặc Mã hội viên..."
                  prepend-inner-icon="mdi-account-search"
                  variant="outlined"
                  class="mb-4"
                  :loading="isLoadingMembers"
                  autofocus
                  :custom-filter="searchFilter"
                  @update:model-value="onMemberSelected"
                />
              </v-window-item>

              <v-window-item value="qr">
                <div class="text-center py-6 border-dashed rounded-lg mb-4 bg-grey-lighten-4 position-relative overflow-hidden">
                  <video ref="qrVideo" class="camera-feed" autoplay muted playsinline v-show="isCameraActive"></video>
                  <div v-if="!isCameraActive" class="py-10">
                    <v-icon size="64" color="primary" class="mb-2">mdi-camera-iris</v-icon>
                    <p class="text-body-2 mb-2">Đang đợi quét mã QR từ App Mobile...</p>
                  </div>
                  <v-text-field
                    v-model="qrInput"
                    placeholder="Focus và quét để Auto Check-in..."
                    variant="underlined"
                    density="compact"
                    hide-details
                    autofocus
                    @keyup.enter="handleQRScan"
                  />
                  <v-btn v-if="!isCameraActive" color="primary" size="small" variant="text" @click="startCamera('qr')">Bật Camera</v-btn>
                </div>
              </v-window-item>

              <v-window-item value="face">
                <div class="text-center py-4 bg-black rounded-lg mb-4 position-relative overflow-hidden" style="min-height: 280px;">
                  <video ref="faceVideo" class="camera-feed" autoplay muted playsinline v-show="isCameraActive"></video>
                  <v-icon v-if="!isCameraActive" size="80" color="success" class="mt-8">mdi-face-recognition-outline</v-icon>
                  <div v-else class="face-scan-line"></div>
                  
                  <!-- Overlay thông báo lỗi hoặc hướng dẫn -->
                  <div v-if="faceScanError" class="position-absolute top-0 left-0 w-100 pa-2 bg-error text-caption text-white" style="z-index: 15;">
                    <v-icon size="14">mdi-alert-circle</v-icon> {{ faceScanError }}
                  </div>

                  <div class="position-absolute bottom-0 left-0 w-100 pa-4" style="background: rgba(0,0,0,0.5); z-index: 10;">
                    <p class="text-white text-caption mb-2">{{ isCameraActive ? 'Hệ thống đang ở chế độ Tự động nhận diện' : 'Camera đang tắt' }}</p>
                    <div class="d-flex justify-center gap-2">
                      <v-btn v-if="!isCameraActive" color="success" size="small" prepend-icon="mdi-camera" @click="startCamera('face')">Bật Camera</v-btn>
                      <v-btn v-else color="error" size="small" prepend-icon="mdi-camera-off" @click="stopCamera">Tắt Camera</v-btn>
                      <v-btn v-if="isCameraActive" color="primary" size="small" prepend-icon="mdi-face-recognition" :loading="scanningFace" @click="scanFace">Nhận diện Face ID</v-btn>
                    </div>
                  </div>
                </div>
              </v-window-item>
            </v-window>

            <div class="d-flex align-center justify-space-between mb-4">
              <span class="text-subtitle-2 font-weight-bold">Chế độ tự động</span>
              <v-switch v-model="isAutoMode" color="success" hide-details inset label="Auto Check-in" />
            </div>

            <v-expand-transition>
              <div v-if="validData">
                <v-card v-if="validData.isValid" variant="tonal" color="success" class="mb-4 border">
                  <v-card-text class="pa-4">
                    <div class="d-flex align-center">
                      <v-avatar color="success" size="56" class="mr-4">
                        <span class="text-h5 text-white">{{ validData.memberName.charAt(0) }}</span>
                      </v-avatar>
                      <div>
                        <div class="text-h6 font-weight-bold">{{ validData.memberName }}</div>
                        <v-chip size="x-small" color="white" variant="flat">{{ validData.packageName }}</v-chip>
                      </div>
                    </div>
                    <v-divider class="my-3" />
                    <div class="d-flex justify-space-between text-body-2">
                      <span>Hạn dùng:</span>
                      <span class="font-weight-bold">{{ formatDate(validData.endDate) }}</span>
                    </div>
                  </v-card-text>
                </v-card>
                <v-alert v-else type="error" variant="tonal" class="mb-4" :text="validData.message" />
              </div>
            </v-expand-transition>

            <div v-if="!isAutoMode || (validData && !validData.isValid)" class="d-flex flex-column gap-2">
              <v-btn color="primary" size="large" block :disabled="!memberCode" @click="handleValidate">Kiểm tra thông tin</v-btn>
              <v-btn v-if="validData?.isValid" color="success" size="large" block :loading="checkinStore.loading" @click="handleCheckIn">CHECK IN VÀO PHÒNG</v-btn>
            </div>
            
            <v-alert v-if="isAutoMode && !validData" type="info" variant="text" density="compact" class="text-center">
               Hệ thống sẽ tự động check-in khi nhận diện dữ liệu
            </v-alert>
          </v-card-text>
        </v-card>

        <v-row class="mt-4">
          <v-col cols="6">
            <v-card variant="tonal" color="info" class="text-center rounded-xl">
              <v-card-text class="pa-4">
                <v-icon size="32" color="info">mdi-account-multiple-check</v-icon>
                <div class="text-h5 font-weight-bold mt-1">
                  {{ checkinStore.currentlyInGym }}
                </div>
                <div class="text-caption">Đang tập</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card variant="tonal" color="success" class="text-center rounded-xl">
              <v-card-text class="pa-4">
                <v-icon size="32" color="success">mdi-calendar-check</v-icon>
                <div class="text-h5 font-weight-bold mt-1">
                  {{ checkinStore.todayTotal }}
                </div>
                <div class="text-caption">Tổng lượt hôm nay</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>

      <v-col cols="12" md="7">
        <v-card class="rounded-xl border">
          <v-card-title class="pa-5 d-flex align-center">
            <v-icon class="mr-2" color="primary">mdi-history</v-icon>
            Lịch sử vào phòng gym
          </v-card-title>
          <v-divider />

          <div v-if="checkinStore.loading && !checkinStore.todayCheckins.length" class="pa-6">
            <v-skeleton-loader v-for="i in 5" :key="i" type="list-item-avatar" />
          </div>

          <v-list v-else-if="checkinStore.todayCheckins.length" density="comfortable" lines="two">
            <template v-for="(item, index) in sortedCheckins" :key="item.id || item.Id">
              <v-list-item class="py-3">
                <template #prepend>
                  <v-avatar :color="item.checkOutTime || item.CheckOutTime ? 'grey-lighten-3' : 'success-lighten-4'" size="48" class="mr-2">
                    <span :class="item.checkOutTime || item.CheckOutTime ? 'text-grey' : 'text-success'" class="font-weight-bold">
                      {{ (item.memberName || item.MemberName)?.charAt(0) || 'M' }}
                    </span>
                  </v-avatar>
                </template>

                <v-list-item-title class="font-weight-bold">
                  {{ item.memberName || item.MemberName }}
                  <v-chip v-if="!item.checkOutTime && !item.CheckOutTime" size="x-small" color="success" class="ml-2">Đang tập</v-chip>
                </v-list-item-title>

                <v-list-item-subtitle class="mt-1">
                  <v-icon size="14" color="success">mdi-login</v-icon> {{ formatTime(item.checkInTime || item.CheckInTime) }}
                  <span v-if="item.checkOutTime || item.CheckOutTime" class="ml-3">
                    <v-icon size="14" color="grey">mdi-logout</v-icon> {{ formatTime(item.checkOutTime || item.CheckOutTime) }}
                  </span>
                </v-list-item-subtitle>

                <template #append>
                  <v-btn v-if="!item.checkOutTime && !item.CheckOutTime" size="small" variant="tonal" color="warning" @click="handleCheckOut(item.id || item.Id)">
                    Check Out
                  </v-btn>
                </template>
              </v-list-item>
              <v-divider v-if="index < sortedCheckins.length - 1" inset />
            </template>
          </v-list>
          
          <div v-else class="text-center py-16 text-grey">
            <v-icon size="64" color="grey-lighten-3">mdi-account-cancel</v-icon>
            <p class="mt-2">Chưa có lượt check-in nào</p>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snack.show" :color="snack.color" location="top right" timeout="4000">
      <v-icon start>{{ snack.color === 'success' ? 'mdi-check' : 'mdi-alert' }}</v-icon>
      {{ snack.message }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useCheckinStore } from '@/stores/checkin'
import { checkinService } from '@/services/checkinService'
import { memberService } from '@/services/memberService' 
import { formatDate } from '@/utils/helpers'
import dayjs from 'dayjs'

const checkinStore = useCheckinStore()

// State điều khiển giao diện
const activeMethod = ref('code')
const isAutoMode = ref(true)
const qrInput = ref('')

// Camera State
const isCameraActive = ref(false)
const faceVideo = ref(null)
const qrVideo = ref(null)
const scanningFace = ref(false)
const faceScanError = ref('')
let stream = null

const memberCode = ref('')
const validationResult = ref(null)
const inputRef = ref(null)
const currentTime = ref(dayjs().format('HH:mm:ss'))
const snack = ref({ show: false, message: '', color: 'success' })

const memberList = ref([])
const isLoadingMembers = ref(false)

let clockInterval
onMounted(() => {
  loadMembers()
  checkinStore.fetchToday()
  clockInterval = setInterval(() => {
    currentTime.value = dayjs().format('HH:mm:ss')
  }, 1000)
})

onUnmounted(() => {
  clearInterval(clockInterval)
  stopCamera()
})

const startCamera = async (type) => {
  try {
    stopCamera() // Dọn dẹp stream cũ nếu có
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' }
    })
    
    isCameraActive.value = true
    await nextTick()
    
    if (type === 'face' && faceVideo.value) {
      faceVideo.value.srcObject = stream
    } else if (type === 'qr' && qrVideo.value) {
      qrVideo.value.srcObject = stream
    }
  } catch (err) {
    console.error('Lỗi truy cập camera:', err)
    showSnack('Không thể truy cập camera. Vui lòng cấp quyền!', 'error')
  }
}

const stopCamera = () => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
    stream = null
  }
  isCameraActive.value = false
  scanningFace.value = false
}

const scanFace = async () => {
  if (!isCameraActive.value) return
  scanningFace.value = true
  faceScanError.value = ''
  
  // Logic mô phỏng nhận diện:
  // 1. Ưu tiên hội viên đang được chọn trong dropdown (nếu họ đã đăng ký Face) để dễ test
  // 2. Nếu không chọn ai, tìm hội viên ngẫu nhiên đã đăng ký Face
  let targetMember = null
  if (memberCode.value) {
    targetMember = memberList.value.find(m => 
      (m.memberCode === memberCode.value || m.MemberCode === memberCode.value) 
      && (m.faceEncoding || m.FaceEncoding)
    )
  }

  const registeredMember = targetMember || memberList.value.find(m => m.faceEncoding || m.FaceEncoding)
  
  if (!registeredMember) {
    setTimeout(() => {
      scanningFace.value = false
      faceScanError.value = 'Hệ thống không tìm thấy bất kỳ hội viên nào có dữ liệu khuôn mặt. Vui lòng đăng ký trước.'
      showSnack('Lỗi: Chưa có dữ liệu Face ID!', 'error')
    }, 1000)
    return
  }

  // Lấy encoding của hội viên đó
  const faceEncoding = registeredMember.faceEncoding || registeredMember.FaceEncoding
  
  setTimeout(async () => {
    try {
      // Gọi API luôn ở chế độ AUTO (Không cần button check-in nữa)
      const result = await checkinService.faceCheckIn(faceEncoding)
      const data = result.data || result.Data
      const isSuccess = result.success || result.Success
      
      if (isSuccess) {
        showSnack(`✅ Tự động Check-in: ${data.memberName || 'Hội viên'}`, 'success')
        memberCode.value = '' // Clear input
        checkinStore.fetchToday()
      } else {
        const msg = result.message || 'Không nhận diện được khuôn mặt'
        faceScanError.value = msg
        showSnack(msg, 'error')
      }
    } catch (error) {
      console.error('Face Checkin error:', error)
      faceScanError.value = 'Lỗi kết nối máy chủ khi quét mặt'
      showSnack("Lỗi nhận diện khuôn mặt", 'error')
    } finally {
      scanningFace.value = false
    }
  }, 1200)
}

const loadMembers = async () => {
  isLoadingMembers.value = true
  try {
    const res = await memberService.getAll()
    let rawData = []
    if (Array.isArray(res)) rawData = res
    else if (res && (res.data || res.Data)) {
      const innerData = res.data || res.Data
      rawData = Array.isArray(innerData) ? innerData : (innerData.items || innerData.Items || [])
    }
    memberList.value = rawData
  } catch (error) {
    console.error(error)
  } finally {
    isLoadingMembers.value = false
  }
}

const searchFilter = (itemTitle, queryText, item) => {
  const name = (item.raw.fullName || '').toLowerCase()
  const code = (item.raw.memberCode || '').toLowerCase()
  const phone = (item.raw.phoneNumber || '').toLowerCase()
  const search = queryText.toLowerCase()

  return name.includes(search) || code.includes(search) || phone.includes(search)
}

const sortedCheckins = computed(() =>
  [...checkinStore.todayCheckins].sort(
    (a, b) => new Date(b.checkInTime || b.CheckInTime) - new Date(a.checkInTime || a.CheckInTime)
  )
)

const formatTime = (dt) => dt ? dayjs(dt).format('HH:mm') : '—'

const showSnack = (msg, color = 'success') => {
  snack.value = { show: true, message: msg, color }
}

const onMemberSelected = async (val) => {
  validationResult.value = null
  if (!val) return;
  
  if (isAutoMode.value) {
     await handleAutoFlow(val);
  } else {
     await handleValidate();
  }
}

const handleQRScan = async () => {
  if (!qrInput.value) return;
  const code = qrInput.value.trim();
  qrInput.value = ''; // Reset ngay sau quét
  
  if (isAutoMode.value) {
    try {
      const result = await checkinService.qrCheckIn(code)
      if (result.success || result.Success) {
        showSnack('✅ Check-in QR thành công!', 'success')
        checkinStore.fetchToday()
      } else {
        showSnack(result.message || 'Lỗi quét QR', 'error')
      }
    } catch (error) {
      showSnack("Lỗi kết nối máy chủ", 'error')
    }
  } else {
    await handleAutoFlow(code);
  }
}

const simulateFaceScan = async () => {
    await scanFace();
}

const handleAutoFlow = async (code) => {
  memberCode.value = code;
  const result = await checkinStore.validateMember(code);
  validationResult.value = result;

  const data = result.data || result.Data;
  const isValid = data?.isValid ?? data?.IsValid;

  if (isValid) {
      await handleCheckIn();
  } else {
      showSnack(data?.message || 'Không thể check-in tự động', 'error');
  }
}

const validData = computed(() => {
  if (!validationResult.value) return null;
  const d = validationResult.value.data || validationResult.value.Data;
  if (!d) return null;

  const member = d.member || d.Member || {};
  const sub = d.activeSubscription || d.ActiveSubscription || {};

  return {
    isValid: d.isValid ?? d.IsValid,
    message: d.message ?? d.Message,
    memberName: member.fullName || member.FullName || 'N/A',
    packageName: sub.package?.name || sub.Package?.Name || sub.packageName || sub.PackageName || 'N/A',
    endDate: sub.endDate || sub.EndDate
  }
})

const handleValidate = async () => {
  if (!memberCode.value?.trim()) return
  const result = await checkinStore.validateMember(memberCode.value.trim())
  validationResult.value = result
}

const handleCheckIn = async () => {
  if (!memberCode.value) return;
  try {
    const result = await checkinService.checkIn(memberCode.value);
    const isSuccess = result.success || result.Success;

    if (isSuccess) {
      showSnack(`✅ Check-in thành công!`, 'success')
      memberCode.value = null
      validationResult.value = null
      checkinStore.fetchToday()
    } else {
      showSnack(result.message || 'Lỗi Check-in', 'error')
    }
  } catch (error) {
    showSnack("Lỗi kết nối máy chủ", 'error');
  }
}

const handleCheckOut = async (id) => {
  const result = await checkinStore.checkOut(id)
  if (result.success || result.Success) {
    showSnack('Check-out thành công!', 'success')
    checkinStore.fetchToday()
  }
}
</script>

<style scoped>
.border-bottom {
  border-bottom: 1px solid #f0f0f0;
}
/* Hiệu ứng khi hover list item autocomplete */
.v-list-item:hover {
  background-color: #f5f5f5;
  cursor: pointer;
}

.face-scan-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: #4caf50;
  box-shadow: 0 0 15px #4caf50;
  animation: scan 3s infinite linear;
  z-index: 5;
}

.camera-feed {
  width: 100%;
  height: 280px;
  object-fit: cover;
  background: #000;
}
</style>