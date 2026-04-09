<template>
  <v-dialog v-model="uiStore.alert.show" max-width="500" :persistent="uiStore.alert.persistent">
    <v-card class="rounded-xl overflow-hidden elevation-24">
      <v-card-title :class="uiStore.alert.color" class="text-white d-flex align-center pa-4">
        <v-icon start class="mr-2">{{ uiStore.alert.icon }}</v-icon>
        <span class="font-weight-black">{{ uiStore.alert.title }}</span>
      </v-card-title>

      <v-card-text class="pa-8 text-center">
        <v-avatar :color="uiStore.alert.color" variant="tonal" size="80" class="mb-6">
          <v-icon size="44">{{ uiStore.alert.icon }}</v-icon>
        </v-avatar>
        
        <div class="text-h6 font-weight-bold mb-3" style="line-height: 1.4;">
          {{ uiStore.alert.message }}
        </div>
        
        <div v-if="uiStore.alert.subMessage" class="text-body-2 text-grey-darken-1">
          {{ uiStore.alert.subMessage }}
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4 bg-grey-lighten-4">
        <template v-if="uiStore.alert.isConfirm">
          <v-btn
            variant="text"
            color="grey-darken-1"
            class="rounded-lg font-weight-bold px-6"
            size="large"
            @click="uiStore.closeAlert(false)"
          >
            Hủy bỏ
          </v-btn>
          <v-spacer />
          <v-btn
            variant="flat"
            :color="uiStore.alert.color"
            class="rounded-lg font-weight-black px-8"
            size="large"
            @click="uiStore.closeAlert(true)"
          >
            Xác nhận
          </v-btn>
        </template>
        <v-btn
          v-else
          block
          variant="flat"
          :color="uiStore.alert.color"
          class="rounded-lg font-weight-black py-4"
          size="large"
          @click="uiStore.closeAlert()"
        >
          {{ uiStore.alert.color === 'error' ? 'Đóng và Quay lại' : 'Tôi đã hiểu' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { useUiStore } from '@/stores/ui'
const uiStore = useUiStore()
</script>

<style scoped>
.v-card-title {
  letter-spacing: 0.5px;
}
</style>
