<!-- src/views/profile/ProfileView.vue -->
<template>
  <div>
    <h1 class="text-h4 font-weight-bold mb-6">
      <v-icon class="mr-2">mdi-account-circle</v-icon>Hồ sơ cá nhân
    </h1>

    <v-row>
      <!-- Avatar & Info Card -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-text class="text-center pa-8">
            <v-avatar size="96" color="primary" class="mb-4">
              <span class="text-h4 text-white font-weight-bold">
                {{ initials }}
              </span>
            </v-avatar>
            <div class="text-h6 font-weight-bold">{{ authStore.userName }}</div>
            <div class="text-caption text-grey mt-1">{{ authStore.userEmail }}</div>
            <v-chip class="mt-2" :color="roleColor" size="small" variant="tonal">
              {{ authStore.translatedRole }}
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Edit Form -->
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title class="pa-4">Thông tin tài khoản</v-card-title>
          <v-divider />
          <v-card-text class="pa-4">
            <v-alert v-if="successMsg" type="success" variant="tonal" class="mb-4" closable
                     @click:close="successMsg = ''">
              {{ successMsg }}
            </v-alert>

            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.fullName"
                  label="Họ và tên"
                  prepend-inner-icon="mdi-account"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  :model-value="authStore.userEmail"
                  label="Email"
                  prepend-inner-icon="mdi-email"
                  variant="outlined"
                  density="comfortable"
                  readonly
                  hint="Email không thể thay đổi"
                  persistent-hint
                />
              </v-col>
              <v-col cols="12" sm="6">
                  :model-value="authStore.translatedRole"
                  label="Vai trò"
                  prepend-inner-icon="mdi-shield-account"
                  variant="outlined"
                  density="comfortable"
                  readonly
                />
              </v-col>
            </v-row>

            <v-divider class="my-4" />
            <div class="text-subtitle-1 font-weight-bold mb-3">Đổi mật khẩu</div>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.currentPassword"
                  label="Mật khẩu hiện tại"
                  :type="showCurrent ? 'text' : 'password'"
                  :append-inner-icon="showCurrent ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="showCurrent = !showCurrent"
                  prepend-inner-icon="mdi-lock"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.newPassword"
                  label="Mật khẩu mới"
                  :type="showNew ? 'text' : 'password'"
                  :append-inner-icon="showNew ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="showNew = !showNew"
                  prepend-inner-icon="mdi-lock-plus"
                  variant="outlined"
                  density="comfortable"
                  hint="Tối thiểu 8 ký tự, có chữ hoa, số và ký tự đặc biệt"
                  persistent-hint
                />
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="pa-4 pt-0">
            <v-spacer />
            <v-btn variant="outlined" class="mr-2" @click="resetForm">Hủy</v-btn>
            <v-btn color="primary" variant="flat" :loading="saving" @click="saveProfile">
              <v-icon start>mdi-content-save</v-icon>Lưu thay đổi
            </v-btn>
          </v-card-actions>
        </v-card>

        <!-- Login History -->
        <v-card class="mt-4">
          <v-card-title class="pa-4">Thông tin đăng nhập</v-card-title>
          <v-divider />
          <v-list density="compact">
            <v-list-item prepend-icon="mdi-calendar-clock">
              <v-list-item-title>Đăng nhập lần cuối</v-list-item-title>
              <v-list-item-subtitle>{{ formatDateTime(lastLogin) }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item prepend-icon="mdi-ip">
              <v-list-item-title>Phiên làm việc hiện tại</v-list-item-title>
              <v-list-item-subtitle>Token hết hạn lúc {{ formatDateTime(tokenExpiry) }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { jwtDecode }    from 'jwt-decode'

const authStore = useAuthStore()

const saving       = ref(false)
const successMsg   = ref('')
const showCurrent  = ref(false)
const showNew      = ref(false)

const form = ref({
  fullName:        authStore.userName || '',
  currentPassword: '',
  newPassword:     ''
})

const initials = computed(() => {
  const name = authStore.userName || ''
  return name.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase()
})

const roleColor = computed(() => ({
  Admin:         'red',
  Manager:       'orange',
  Receptionist:  'blue',
  Trainer:       'green'
}[authStore.userRole] || 'grey'))

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

function formatDateTime(d) {
  if (!d) return 'N/A'
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium', timeStyle: 'short'
  }).format(d)
}

function resetForm() {
  form.value.currentPassword = ''
  form.value.newPassword     = ''
  form.value.fullName        = authStore.userName || ''
}

async function saveProfile() {
  saving.value = true
  await new Promise(r => setTimeout(r, 800)) // Simulate API call
  successMsg.value = 'Đã lưu thay đổi thành công!'
  form.value.currentPassword = ''
  form.value.newPassword     = ''
  saving.value = false
}
</script>