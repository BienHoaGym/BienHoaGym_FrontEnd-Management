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
            <v-tab value="face"><v-icon start>mdi-face-recognition</v-icon> FaceID</v-tab>
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

              <v-window-item value="face">
                <div class="text-center py-4 px-2">
                  <div class="scanner-container mb-4 mx-auto elevation-5 overflow-hidden position-relative rounded-xl border-lg border-primary">
                    <video 
                      ref="faceVideo" 
                      class="face-video" 
                      autoplay 
                      muted 
                      playsinline
                      @playing="isCameraStreaming = true"
                      @pause="isCameraStreaming = false"
                    ></video>
                    
                    <!-- Nâng cấp chỉ báo chất lượng luồng thực tế (Stream Quality) -->
                    <div class="quality-indicator">
                       <v-chip :color="qualityColor" size="x-small" variant="flat" class="font-weight-bold">
                          {{ qualityText }}
                       </v-chip>
                    </div>

                    <div v-if="isScanning" class="face-scan-line"></div>
                    <div v-if="!isCameraStreaming" class="camera-placeholder d-flex flex-column align-center justify-center">
                       <v-progress-circular v-if="isCameraActive" indeterminate color="primary" class="mb-2" />
                       <v-icon v-else size="64" color="primary-lighten-2">mdi-camera-off</v-icon>
                       <p class="text-caption mt-2">{{ isCameraActive ? 'Đang khởi động camera...' : 'Camera đang tắt' }}</p>
                    </div>
                    <div class="scanner-corners"></div>
                  </div>
                  
                  <div class="d-flex justify-center gap-2 mb-2">
                    <v-btn
                      v-if="!isCameraActive"
                      color="primary"
                      prepend-icon="mdi-camera"
                      variant="flat"
                      rounded="pill"
                      @click="startCamera('face')"
                    >
                      Bật Camera FaceID
                    </v-btn>
                    <v-btn
                      v-else
                      color="error"
                      prepend-icon="mdi-camera-off"
                      variant="tonal"
                      rounded="pill"
                      @click="stopCamera"
                    >
                      Tắt Camera
                    </v-btn>
                  </div>
                  <p class="text-caption text-grey">Nhìn thẳng vào camera để tự động nhận diện</p>
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
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
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
const isCameraStreaming = ref(false)
const isHardwareError = ref(false)
const faceVideo = ref(null)
const isScanning = ref(false)
let stream = null
let scanTimeout = null 
let isProcessingScan = false 

const memberCode = ref('')
const validationResult = ref(null)
const inputRef = ref(null)
const currentTime = ref(dayjs().format('HH:mm:ss'))
const snack = ref({ show: false, message: '', color: 'success' })

const memberList = ref([])
const isLoadingMembers = ref(false)
let analysisCtx = null
let analysisCanvas = null
let brightnessMonitor = null
const currentBrightness = ref(0)

const qualityText = computed(() => {
  if (!isCameraActive.value) return 'Camera chưa bật'
  if (!isCameraStreaming.value || !faceVideo.value || faceVideo.value.videoWidth === 0) return 'Đang khởi động...'
  if (currentBrightness.value < 20) return 'Màn hình tối/Che'
  if (currentBrightness.value < 50) return 'Chất lượng kém'
  return 'Sẵn sàng'
})

const qualityColor = computed(() => {
  if (!isCameraActive.value) return 'grey'
  if (!isCameraStreaming.value || !faceVideo.value || faceVideo.value.videoWidth === 0) return 'warning'
  if (currentBrightness.value < 20) return 'error'
  if (currentBrightness.value < 50) return 'orange'
  return 'success'
})

// --- Helper Functions (Defined before they can be called in hooks) ---
const showSnack = (msg, color = 'success') => {
  snack.value = { show: true, message: msg, color }
}

const loadMembers = async () => {
  isLoadingMembers.value = true
  try {
    const res = await memberService.getAll(1, 1000)
    let rawData = []
    if (Array.isArray(res)) rawData = res
    else if (res && (res.data || res.Data)) {
      const innerData = res.data || res.Data
      rawData = Array.isArray(innerData) ? innerData : (innerData.items || innerData.Items || [])
    }
    memberList.value = rawData
  } catch (error) {
    console.error('Lỗi tải danh sách hội viên:', error)
  } finally {
    isLoadingMembers.value = false
  }
}

const stopCamera = () => {
  if (stream) {
    stream.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
    });
    stream = null;
  }
  if (scanTimeout) {
    clearTimeout(scanTimeout);
    scanTimeout = null;
  }
  isCameraActive.value = false;
  isCameraStreaming.value = false;
  isHardwareError.value = false;
  isScanning.value = false;
  isProcessingScan = false;
  currentBrightness.value = 0;
  if (brightnessMonitor) {
    clearInterval(brightnessMonitor);
    brightnessMonitor = null;
  }
}

const startFaceScanning = () => {
    // 0. KHÓA HỆ THỐNG (Strict Concurrency Lock)
    if (isProcessingScan || !isCameraActive.value) return;
    
    // Đánh dấu lọc ngay lập tức
    isProcessingScan = true;

    // Xóa mọi tiến trình chờ trước đó
    if (scanTimeout) clearTimeout(scanTimeout);

    // 1. RÀNG BUỘC CỨNG: Camera phải thực sự phát hình và có ánh sáng
    if (!isCameraStreaming.value || !faceVideo.value || 
        faceVideo.value.videoWidth === 0 || 
        faceVideo.value.readyState < 4 || 
        currentBrightness.value < 40) {
        
        // Nếu chưa sẵn sàng, nhả khóa và thử lại sau 2s
        isProcessingScan = false;
        scanTimeout = setTimeout(startFaceScanning, 2000);
        return;
    }

    // Chỉ báo sẵn sàng khi hình ảnh thực sự rõ nét
    if (!isScanning.value) {
        // showSnack('Máy ảnh đã sẵn sàng - Đang quét khuôn mặt...', 'success');
    }
    
    isScanning.value = true;
    isProcessingScan = true;

    // 3. TIẾN HÀNH NHẬN DIỆN (Simulation an toàn)
    scanTimeout = setTimeout(async () => {
        // Kiểm tra lại trạng thái sau khi đợi
        if (!isCameraActive.value || activeMethod.value !== 'face') {
            isProcessingScan = false;
            isScanning.value = false;
            return;
        }

        try {
            // KIỂM TRA LẠI MỘT LẦN NỮA NGAY TRƯỚC KHI GỌI API
            if (checkFrameBrightness() < 40) {
                isProcessingScan = false;
                isScanning.value = false;
                return;
            }

            const registeredMember = memberList.value.find(m => m.faceEncoding || m.FaceEncoding);
            const mockEncoding = registeredMember 
              ? (registeredMember.faceEncoding || registeredMember.FaceEncoding) 
              : "MOCK_FACE_VECTOR_GYM2024001"; // Dùng mã mẫu mặc định nếu DB trống

            const result = await checkinService.faceCheckIn(mockEncoding);
            
            if (result.success || result.Success) {
                const data = result.data || result.Data;
                showSnack(`✅ Nhận diện hệ thống: ${data.memberName}`, 'success');
                memberCode.value = data.memberCode || data.MemberCode;
                await handleValidate();
                checkinStore.fetchToday();
                
                // Cooldown 10 giây sau khi thành công
                isProcessingScan = false;
                scanTimeout = setTimeout(startFaceScanning, 10000);
            } else {
                // HIỆN LỖI CHI TIẾT TỪ BACKEND (Vd: "Hội viên đang ở trong phòng tập")
                showSnack(result.message || 'FaceID không khớp hoặc lỗi dữ liệu', 'warning');
                isProcessingScan = false;
                // Thử lại sau 5 giây nếu lỗi (để ko bị spam 400)
                scanTimeout = setTimeout(startFaceScanning, 5000);
            }
        } catch (error) {
            console.error('API Error:', error);
            showSnack('Lỗi kết nối API nhận diện', 'error');
            isProcessingScan = false;
            scanTimeout = setTimeout(startFaceScanning, 5000);
        } finally {
            isScanning.value = false;
        }
    }, 1500);
}

const checkFrameBrightness = () => {
    if (!faceVideo.value || !isCameraActive.value) return 0;
    if (!analysisCanvas) {
        analysisCanvas = document.createElement('canvas');
        analysisCtx = analysisCanvas.getContext('2d', { willReadFrequently: true });
    }
    analysisCanvas.width = 64;
    analysisCanvas.height = 64;
    try {
        analysisCtx.drawImage(faceVideo.value, 0, 0, 64, 64);
        const imageData = analysisCtx.getImageData(0, 0, 64, 64);
        const data = imageData.data;
        let totalBrightness = 0;
        for (let i = 0; i < data.length; i += 4) {
            totalBrightness += (data[i] + data[i+1] + data[i+2]) / 3;
        }
        return totalBrightness / (data.length / 4);
    } catch (e) {
        return 0;
    }
}

const startCamera = async (type) => {
  try {
    stopCamera() 
    isHardwareError.value = false; // Reset error state
    
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' }
    })
    
    isCameraActive.value = true
    await nextTick()
    
    if (type === 'face' && faceVideo.value) {
      faceVideo.value.srcObject = stream;
      
      if (brightnessMonitor) clearInterval(brightnessMonitor);
      brightnessMonitor = setInterval(() => {
          currentBrightness.value = checkFrameBrightness();
      }, 500);

      // THUẬT TOÁN CANH CHỈNH PHẦN CỨNG:
      setTimeout(() => {
          if (isCameraActive.value && (!isCameraStreaming.value || faceVideo.value?.videoWidth === 0)) {
              isHardwareError.value = true;
          }
      }, 5000);
    }
  } catch (err) {
    console.error('Lỗi truy cập camera:', err)
    isHardwareError.value = true;
    showSnack('Không thể truy cập camera. Vui lòng cấp quyền!', 'error')
  }
}

// Watcher để tự động nhận diện
watch(isCameraStreaming, (streaming) => {
    if (streaming && activeMethod.value === 'face') {
        isHardwareError.value = false;
        // KHÔNG hiện thông báo "Xong" ở đây, để startFaceScanning tự kiểm tra hình ảnh mới báo thành công
        startFaceScanning();
    }
})

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

const handleValidate = async () => {
  if (!memberCode.value?.trim()) return
  const result = await checkinStore.validateMember(memberCode.value.trim())
  validationResult.value = result
}

const handleCheckOut = async (id) => {
  const result = await checkinStore.checkOut(id)
  if (result.success || result.Success) {
    showSnack('Check-out thành công!', 'success')
    checkinStore.fetchToday()
  }
}

// --- Lifecycle and watchers ---
let clockInterval = null;
onMounted(() => {
  loadMembers()
  checkinStore.fetchToday()
  clockInterval = setInterval(() => {
    currentTime.value = dayjs().format('HH:mm:ss')
  }, 1000)
})

onUnmounted(() => {
  if (clockInterval) clearInterval(clockInterval)
  stopCamera()
})

watch(activeMethod, (newVal) => {
  if (newVal !== 'face') {
    stopCamera()
  }
})

const onMemberSelected = async (val) => {
  validationResult.value = null
  if (!val) return;
  if (isAutoMode.value) {
     await handleAutoFlow(val);
  } else {
     await handleValidate();
  }
}

// --- Computeds ---
const sortedCheckins = computed(() =>
  [...checkinStore.todayCheckins].sort(
    (a, b) => new Date(b.checkInTime || b.CheckInTime) - new Date(a.checkInTime || a.CheckInTime)
  )
)

const formatTime = (dt) => dt ? dayjs(dt).format('HH:mm') : '—'

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

const searchFilter = (itemTitle, queryText, item) => {
  const name = (item.raw.fullName || '').toLowerCase()
  const code = (item.raw.memberCode || '').toLowerCase()
  const phone = (item.raw.phoneNumber || '').toLowerCase()
  const search = queryText.toLowerCase()
  return name.includes(search) || code.includes(search) || phone.includes(search)
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

.scanner-container {
  width: 280px;
  height: 280px;
  background: #000;
  position: relative;
}

.face-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1); /* Mirror effect */
}

.camera-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #1a1a1a;
  color: white;
}

.scanner-corners {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  bottom: 20px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  pointer-events: none;
}

.face-scan-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: #1976D2;
  box-shadow: 0 0 15px #1976D2;
  animation: scan 3s infinite linear;
  z-index: 5;
}

@keyframes scan {
  0% { top: 10%; }
  50% { top: 90%; }
  100% { top: 10% ; }
}
.camera-status-overlay {
   position: absolute;
   top: 0; left: 0; right: 0; bottom: 0;
   background: rgba(0,0,0,0.7);
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   z-index: 10;
}
.quality-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 15;
}
</style>