<!-- src/views/settings/SettingsView.vue -->
<template>
  <div>
    <h1 class="text-h4 font-weight-bold mb-6">
      <v-icon class="mr-2">mdi-cog</v-icon>Cài đặt hệ thống
    </h1>

    <v-alert type="info" variant="tonal" class="mb-6">
      Chỉ Admin mới có quyền truy cập trang này. Các thay đổi sẽ ảnh hưởng toàn bộ hệ thống.
    </v-alert>

    <v-row>
      <!-- Gym Info -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="pa-4">
            <v-icon class="mr-2">mdi-store</v-icon>Thông tin phòng gym
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-4">
            <v-text-field v-model="settings.gymName" label="Tên phòng gym"
              variant="outlined" density="comfortable" class="mb-3" />
            <v-text-field v-model="settings.phone" label="Số điện thoại"
              variant="outlined" density="comfortable" class="mb-3"
              prepend-inner-icon="mdi-phone" />
            <v-text-field v-model="settings.email" label="Email liên hệ"
              variant="outlined" density="comfortable" class="mb-3"
              prepend-inner-icon="mdi-email" />
            <v-textarea v-model="settings.address" label="Địa chỉ"
              variant="outlined" density="comfortable" rows="2" />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Business Hours -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="pa-4">
            <v-icon class="mr-2">mdi-clock-outline</v-icon>Giờ hoạt động
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-4">
            <v-row>
              <v-col cols="6">
                <v-text-field v-model="settings.openTime" label="Giờ mở cửa"
                  type="time" variant="outlined" density="comfortable" />
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="settings.closeTime" label="Giờ đóng cửa"
                  type="time" variant="outlined" density="comfortable" />
              </v-col>
            </v-row>
            <v-select v-model="settings.closedDays" label="Ngày nghỉ trong tuần"
              :items="daysOfWeek" multiple variant="outlined" density="comfortable"
              chips closable-chips />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Notification Settings -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="pa-4">
            <v-icon class="mr-2">mdi-bell-outline</v-icon>Cài đặt thông báo
          </v-card-title>
          <v-divider />
          <v-list>
            <v-list-item>
              <template #prepend>
                <v-icon>mdi-clock-alert</v-icon>
              </template>
              <v-list-item-title>Nhắc hết hạn gói tập</v-list-item-title>
              <v-list-item-subtitle>Thông báo trước {{ settings.expiryReminderDays }} ngày</v-list-item-subtitle>
              <template #append>
                <v-switch v-model="settings.expiryReminder" color="primary" hide-details />
              </template>
            </v-list-item>
            <v-list-item>
              <template #prepend>
                <v-icon>mdi-birthday-cake</v-icon>
              </template>
              <v-list-item-title>Chúc mừng sinh nhật</v-list-item-title>
              <v-list-item-subtitle>Tự động gửi SMS/email sinh nhật</v-list-item-subtitle>
              <template #append>
                <v-switch v-model="settings.birthdayNotify" color="primary" hide-details />
              </template>
            </v-list-item>
            <v-list-item>
              <template #prepend>
                <v-icon>mdi-account-plus</v-icon>
              </template>
              <v-list-item-title>Member mới đăng ký online</v-list-item-title>
              <v-list-item-subtitle>Thông báo khi có đăng ký từ website</v-list-item-subtitle>
              <template #append>
                <v-switch v-model="settings.newOnlineRegister" color="primary" hide-details />
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- System Info -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="pa-4">
            <v-icon class="mr-2">mdi-information-outline</v-icon>Thông tin hệ thống
          </v-card-title>
          <v-divider />
          <v-list density="compact">
            <v-list-item>
              <v-list-item-title>Phiên bản</v-list-item-title>
              <template #append><code>v1.0.0</code></template>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Framework Backend</v-list-item-title>
              <template #append><code>.NET 8</code></template>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Framework Frontend</v-list-item-title>
              <template #append><code>Vue 3 + Vuetify 3</code></template>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Database</v-list-item-title>
              <template #append><code>SQL Server</code></template>
            </v-list-item>
          </v-list>
          <v-divider />
          <v-card-actions class="pa-4">
            <v-btn variant="outlined" color="warning" size="small" prepend-icon="mdi-database-refresh">
              Sao lưu DB
            </v-btn>
            <v-spacer />
            <v-btn variant="outlined" color="info" size="small" prepend-icon="mdi-cached">
              Xóa cache
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Save Button -->
    <v-row class="mt-2">
      <v-col>
        <v-btn color="primary" variant="flat" size="large" :loading="saving" @click="saveSettings">
          <v-icon start>mdi-content-save</v-icon>Lưu tất cả cài đặt
        </v-btn>
        <v-snackbar v-model="snackbar" color="success" timeout="3000">
          ✅ Đã lưu cài đặt thành công!
        </v-snackbar>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const saving  = ref(false)
const snackbar = ref(false)

const daysOfWeek = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật']

const settings = ref({
  gymName:             'Gym Biên Hòa',
  phone:               '0901234567',
  email:               'info@gymbienhoz.vn',
  address:             'Số 123 Đường ABC, Phường XYZ, TP. Biên Hòa, Đồng Nai',
  openTime:            '05:00',
  closeTime:           '22:00',
  closedDays:          [],
  expiryReminder:      true,
  expiryReminderDays:  7,
  birthdayNotify:      true,
  newOnlineRegister:   true
})

async function saveSettings() {
  saving.value = true
  await new Promise(r => setTimeout(r, 600))
  saving.value  = false
  snackbar.value = true
}
</script>