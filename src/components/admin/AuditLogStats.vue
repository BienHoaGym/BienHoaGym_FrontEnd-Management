<template>
  <v-row class="mb-6">
    <v-col cols="12" sm="6" md="4">
      <v-card rounded="xl" elevation="1" class="border pa-5 bg-white">
         <div class="d-flex align-center mb-3">
           <v-icon size="28" color="primary" class="mr-3">mdi-history</v-icon>
           <span class="text-overline font-weight-bold grey--text">THAO TÁC HÔM NAY</span>
         </div>
         <div class="d-flex align-baseline">
           <div class="text-h3 font-weight-black mr-2">{{ stats.totalToday }}</div>
           <v-chip size="x-small" color="success" variant="flat" class="font-weight-bold">+12%</v-chip>
         </div>
         <div class="text-caption text-grey mt-1">Số lượng bản ghi mới trong 24h qua</div>
      </v-card>
    </v-col>
    <v-col cols="12" sm="6" md="4">
      <v-card rounded="xl" elevation="1" class="border pa-5 bg-error-lighten-5">
         <div class="d-flex align-center mb-3">
           <v-icon size="28" color="error" class="mr-3">mdi-alert-decagram</v-icon>
           <span class="text-overline font-weight-bold text-error">CẢNH BÁO NGHIÊM TRỌNG</span>
         </div>
         <div class="text-h3 font-weight-black text-error">{{ stats.criticalAlerts }}</div>
         <div class="text-caption text-error-darken-1 mt-1">Các hành động thay đổi dữ liệu nhạy cảm</div>
      </v-card>
    </v-col>
    <v-col cols="12" sm="6" md="4">
      <v-card rounded="xl" elevation="1" class="border pa-5 bg-info-lighten-5">
         <div class="d-flex align-center mb-3">
           <v-icon size="28" color="info" class="mr-3">mdi-account-group</v-icon>
           <span class="text-overline font-weight-bold text-info">NHÂN VIÊN ĐANG TRỰC</span>
         </div>
         <div class="text-h3 font-weight-black text-info">{{ stats.activeUsers }}</div>
         <div class="text-caption text-info-darken-1 mt-1">Tài khoản có hoạt động trong 1 giờ qua</div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
defineProps({
  stats: {
    type: Object,
    required: true
  }
})
</script>
