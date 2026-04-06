<template>
  <v-container class="fill-height">
    <v-row justify="center">
      <v-col cols="12" md="6" class="text-center">
        <v-card class="rounded-xl pa-8 border shadow-lg">
          <v-icon size="64" color="warning" class="mb-4">mdi-database-cog</v-icon>
          <h2 class="text-h4 font-weight-black mb-2">Hệ thống Nạp Dữ liệu Mẫu</h2>
          <p class="text-subtitle-1 text-grey mb-8">Trang này được ẩn khỏi menu chính để đảm bảo an toàn.</p>
          
          <v-divider class="mb-8" />
          
          <v-alert type="info" variant="tonal" class="mb-8 text-left rounded-lg">
            Hành động này sẽ nạp hàng chục dữ liệu mẫu (HLV, Gói tập, Hội viên, Giao dịch...) vào cơ sở dữ liệu để phục vụ việc demo tính năng.
          </v-alert>

          <v-btn
            block
            color="primary"
            size="x-large"
            rounded="xl"
            class="font-weight-black"
            :loading="loading"
            @click="handleSeed"
          >
            BẮT ĐẦU NẠP DỮ LIỆU MẪU
          </v-btn>
          
          <v-btn
            variant="text"
            block
            class="mt-4 font-weight-bold"
            to="/dashboard"
          >
            Quay lại Dashboard
          </v-btn>

          <v-snackbar v-model="snack.show" :color="snack.color" timeout="3000">
            {{ snack.message }}
          </v-snackbar>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { dashboardService } from '@/services/dashboardService'

const loading = ref(false)
const snack = ref({ show: false, message: '', color: 'success' })

async function handleSeed() {
  loading.value = true
  try {
    const res = await dashboardService.seedDemoData()
    snack.value = { 
      show: true, 
      message: res.message || 'Nạp dữ liệu mẫu thành công!', 
      color: 'success' 
    }
  } catch (error) {
    snack.value = { 
      show: true, 
      message: 'Có lỗi xảy ra khi nạp dữ liệu. Hãy đảm bảo API đang chạy.', 
      color: 'error' 
    }
  } finally {
    loading.value = false
  }
}
</script>
