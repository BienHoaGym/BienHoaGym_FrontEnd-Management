<!-- src/views/profile/ProfileView.vue -->
<template>
  <v-container fluid class="pa-0">
    <!-- Header Banner -->
    <v-img
      src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop"
      height="220"
      cover
      class="align-end no-print"
      gradient="to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7)"
    >
      <v-container>
        <div class="d-flex align-center pb-6">
          <v-avatar size="120" color="white" class="elevation-10 profile-avatar-overlap">
            <v-img v-if="authStore.userAvatar" :src="authStore.userAvatar" />
            <span v-else class="text-h2 font-weight-bold text-primary">{{ initials }}</span>
          </v-avatar>
          <div class="ml-6 text-white mb-n4">
            <h1 class="text-h3 font-weight-bold mb-1">{{ authStore.userName }}</h1>
            <div class="d-flex align-center opacity-80">
              <v-icon size="small" class="mr-2">mdi-email-outline</v-icon>
              <span class="text-subtitle-1">{{ authStore.userEmail }}</span>
              <v-chip
                class="ml-4 font-weight-bold"
                :color="roleColor"
                size="small"
                variant="flat"
              >
                {{ authStore.translatedRole }}
              </v-chip>
            </div>
          </div>
        </div>
      </v-container>
    </v-img>

    <v-container class="mt-10 mt-md-12">
      <v-row>
        <!-- Info Cards -->
        <v-col cols="12" md="4">
          <v-card class="rounded-xl border shadow-sm mb-6 overflow-hidden">
            <v-card-title class="pa-6 pb-2 d-flex align-center">
              <v-icon color="primary" class="mr-3">mdi-information-outline</v-icon>
              <span class="font-weight-bold">Trạng thái tài khoản</span>
            </v-card-title>
            <v-list class="pa-4">
              <v-list-item class="rounded-lg mb-2 bg-grey-lighten-5">
                <template #prepend>
                  <v-icon color="success">mdi-check-decagram</v-icon>
                </template>
                <v-list-item-title class="font-weight-bold">Đã xác thực</v-list-item-title>
                <v-list-item-subtitle>Tài khoản chính thức</v-list-item-subtitle>
              </v-list-item>

              <v-list-item class="rounded-lg mb-2 bg-grey-lighten-5">
                <template #prepend>
                  <v-icon color="primary">mdi-calendar-clock</v-icon>
                </template>
                <v-list-item-title class="font-weight-bold">Ngày tham gia</v-list-item-title>
                <v-list-item-subtitle>{{ formatDate(new Date()) }}</v-list-item-subtitle>
              </v-list-item>

              <v-list-item class="rounded-lg bg-grey-lighten-5">
                <template #prepend>
                  <v-icon color="orange">mdi-shield-check</v-icon>
                </template>
                <v-list-item-title class="font-weight-bold">Bảo mật</v-list-item-title>
                <v-list-item-subtitle>2FA: Chưa kích hoạt</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card>

          <v-card class="rounded-xl border shadow-sm overflow-hidden">
            <v-card-title class="pa-6 pb-2 d-flex align-center">
              <v-icon color="primary" class="mr-3">mdi-history</v-icon>
              <span class="font-weight-bold">Hoạt động gần đây</span>
            </v-card-title>
            <v-card-text class="pa-0">
              <v-list lines="two" density="comfortable">
                <v-list-item class="px-6">
                  <template #prepend>
                    <v-avatar color="blue-lighten-5" size="36">
                      <v-icon color="primary" size="20">mdi-login</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="text-body-2 font-weight-medium">Đăng nhập thành công</v-list-item-title>
                  <v-list-item-subtitle class="text-caption">{{ formatDateTime(lastLogin) }}</v-list-item-subtitle>
                </v-list-item>
                <v-divider inset></v-divider>
                <v-list-item class="px-6">
                  <template #prepend>
                    <v-avatar color="green-lighten-5" size="36">
                      <v-icon color="success" size="20">mdi-lock-reset</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="text-body-2 font-weight-medium">Phiên làm việc hiện tại</v-list-item-title>
                  <v-list-item-subtitle class="text-caption">Token hết hạn: {{ formatDateTime(tokenExpiry) }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Main Form -->
        <v-col cols="12" md="8">
          <v-card class="rounded-xl border shadow-sm overflow-hidden pa-0">
            <v-tabs v-model="tab" color="primary" align-tabs="start" class="bg-grey-lighten-5 border-b">
              <v-tab value="personal" class="text-capitalize px-8">
                <v-icon start>mdi-account-details-outline</v-icon>Thông tin cá nhân
              </v-tab>
              <v-tab value="security" class="text-capitalize px-8">
                <v-icon start>mdi-shield-lock-outline</v-icon>Bảo mật & Mật khẩu
              </v-tab>
            </v-tabs>

            <v-window v-model="tab" class="pa-8">
              <!-- Personal Tab -->
              <v-window-item value="personal">
                <v-alert
                  v-if="successMsg"
                  type="success"
                  variant="flat"
                  class="mb-8 rounded-lg animate__animated animate__fadeIn"
                  closable
                  @click:close="successMsg = ''"
                >
                  {{ successMsg }}
                </v-alert>

                <div class="text-h6 font-weight-bold mb-6 d-flex align-center">
                  <v-icon size="small" class="mr-2" color="primary">mdi-pencil-circle-outline</v-icon>
                  Cập nhật thông tin cơ bản
                </div>

                <v-form ref="profileForm">
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="form.fullName"
                        label="Họ và tên đầy đủ"
                        placeholder="Nhập họ và tên"
                        prepend-inner-icon="mdi-account-outline"
                        variant="outlined"
                        class="rounded-lg"
                        color="primary"
                        density="comfortable"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        :model-value="authStore.userEmail"
                        label="Địa chỉ Email"
                        prepend-inner-icon="mdi-email-outline"
                        variant="outlined"
                        class="rounded-lg"
                        density="comfortable"
                        readonly
                        bg-color="grey-lighten-4"
                        hint="Email là định danh duy nhất không thể thay đổi"
                        persistent-hint
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-select
                        v-model="form.gender"
                        :items="['Nam', 'Nữ', 'Khác']"
                        label="Giới tính"
                        prepend-inner-icon="mdi-gender-male-female"
                        variant="outlined"
                        class="rounded-lg"
                        density="comfortable"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        :model-value="authStore.translatedRole"
                        label="Chức vụ / Vai trò"
                        prepend-inner-icon="mdi-shield-account-outline"
                        variant="outlined"
                        class="rounded-lg"
                        density="comfortable"
                        readonly
                        bg-color="grey-lighten-4"
                      />
                    </v-col>
                  </v-row>
                  
                  <div class="d-flex justify-end gap-2 mt-6">
                    <v-btn
                      color="primary"
                      prepend-icon="mdi-check"
                      size="large"
                      class="px-8 rounded-lg shadow-sm text-capitalize"
                      :loading="saving"
                      @click="saveProfile"
                    >
                      Xác nhận lưu
                    </v-btn>
                  </div>
                </v-form>
              </v-window-item>

              <!-- Security Tab -->
              <v-window-item value="security">
                <div class="text-h6 font-weight-bold mb-6 d-flex align-center">
                  <v-icon size="small" class="mr-2" color="primary">mdi-lock-outline</v-icon>
                  Thay đổi mật khẩu
                </div>
                
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      v-model="form.currentPassword"
                      label="Mật khẩu hiện tại"
                      :type="showCurrent ? 'text' : 'password'"
                      :append-inner-icon="showCurrent ? 'mdi-eye-off' : 'mdi-eye'"
                      @click:append-inner="showCurrent = !showCurrent"
                      prepend-inner-icon="mdi-lock-outline"
                      variant="outlined"
                      class="rounded-lg"
                      placeholder="••••••••"
                      density="comfortable"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="form.newPassword"
                      label="Mật khẩu mới"
                      :type="showNew ? 'text' : 'password'"
                      :append-inner-icon="showNew ? 'mdi-eye-off' : 'mdi-eye'"
                      @click:append-inner="showNew = !showNew"
                      prepend-inner-icon="mdi-lock-plus-outline"
                      variant="outlined"
                      class="rounded-lg"
                      placeholder="••••••••"
                      density="comfortable"
                      hint="Yêu cầu tối thiểu 8 ký tự"
                      persistent-hint
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="confirmPassword"
                      label="Xác nhận mật khẩu mới"
                      :type="showNew ? 'text' : 'password'"
                      prepend-inner-icon="mdi-lock-check-outline"
                      variant="outlined"
                      class="rounded-lg"
                      placeholder="••••••••"
                      density="comfortable"
                    />
                  </v-col>
                </v-row>

                <v-divider class="my-8"></v-divider>

                <div class="bg-blue-lighten-5 pa-6 rounded-xl d-flex">
                  <v-icon color="primary" class="mr-4 mt-1">mdi-shield-check-outline</v-icon>
                  <div>
                    <div class="text-subtitle-1 font-weight-bold text-blue-darken-4">Bảo vệ tài khoản của bạn</div>
                    <p class="text-body-2 text-blue-darken-2 mt-1">
                      Hãy đảm bảo mật khẩu của bạn mạnh. Chúng tôi khuyên bạn nên thay đổi mật khẩu định kỳ 6 tháng một lần để bảo mật tối ưu.
                    </p>
                  </div>
                </div>

                <div class="d-flex justify-end gap-2 mt-8">
                  <v-btn variant="text" size="large" class="rounded-lg text-capitalize" @click="resetForm">Hủy bỏ</v-btn>
                  <v-btn
                    color="error"
                    size="large"
                    class="px-8 rounded-lg shadow-sm text-capitalize"
                    variant="flat"
                    :loading="saving"
                    @click="saveProfile"
                  >
                    Cập nhật mật khẩu
                  </v-btn>
                </div>
              </v-window-item>
            </v-window>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { jwtDecode } from 'jwt-decode'
import { formatDate, formatDateTime } from '@/utils/helpers'

const authStore = useAuthStore()

const tab = ref('personal')
const saving = ref(false)
const successMsg = ref('')
const showCurrent = ref(false)
const showNew = ref(false)
const confirmPassword = ref('')

const form = ref({
  fullName: authStore.userName || '',
  currentPassword: '',
  newPassword: '',
  gender: 'Nam'
})

const initials = computed(() => {
  const name = authStore.userName || ''
  if (!name) return 'SA'
  const words = name.split(' ').filter(x => x.length > 0)
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
})

const roleColor = computed(() => {
  switch (authStore.userRole) {
    case 'Admin': return 'red-darken-2'
    case 'Manager': return 'orange-darken-3'
    case 'Receptionist': return 'blue-darken-2'
    case 'Trainer': return 'success'
    default: return 'grey-darken-1'
  }
})

const lastLogin = ref(new Date())
const tokenExpiry = computed(() => {
  try {
    const token = localStorage.getItem('token')
    if (token) {
      const decoded = jwtDecode(token)
      return new Date(decoded.exp * 1000)
    }
  } catch {}
  return null
})

function resetForm() {
  form.value.currentPassword = ''
  form.value.newPassword = ''
  confirmPassword.value = ''
  form.value.fullName = authStore.userName || ''
}

async function saveProfile() {
  saving.value = true
  try {
    // Giả lập API call
    await new Promise(r => setTimeout(r, 1000))
    successMsg.value = 'Hồ sơ đã được cập nhật thành công!'
    form.value.currentPassword = ''
    form.value.newPassword = ''
    confirmPassword.value = ''
    
    // Tự động tắt alert sau 5s
    setTimeout(() => { successMsg.value = '' }, 5000)
  } catch (error) {
    console.error(error)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  // Sync initial data from store
  form.value.fullName = authStore.userName
})
</script>

<style scoped>
.profile-avatar-overlap {
  margin-bottom: -80px;
  border: 6px solid #f4f6f9;
  z-index: 2;
  transition: all 0.3s ease;
}

.profile-avatar-overlap:hover {
  transform: scale(1.05);
}

.gap-2 {
  gap: 12px;
}

.shadow-sm {
  box-shadow: 0 4px 15px rgba(0,0,0,0.05) !important;
}

.v-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.v-tab {
  font-weight: 600;
  letter-spacing: 0.5px;
}

@media (max-width: 600px) {
  .profile-avatar-overlap {
    size: 100px !important;
    margin-bottom: -50px;
  }
}
</style>