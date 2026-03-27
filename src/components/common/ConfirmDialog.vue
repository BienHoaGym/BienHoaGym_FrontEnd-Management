<!-- src/components/common/ConfirmDialog.vue -->
<template>
  <v-dialog v-model="dialog" max-width="420" persistent>
    <v-card>
      <v-card-title class="d-flex align-center pa-5">
        <v-icon :color="iconColor" size="28" class="mr-3">{{ icon }}</v-icon>
        {{ title }}
      </v-card-title>

      <v-card-text class="pa-5 pt-0 text-body-1">
        {{ message }}
      </v-card-text>

      <v-divider />
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="outlined" :disabled="loading" @click="cancel">
          {{ cancelText }}
        </v-btn>
        <v-btn :color="confirmColor" :loading="loading" @click="confirm">
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  title: { type: String, default: 'Xác nhận hành động' },
  message: { type: String, default: 'Bạn có chắc chắn muốn thực hiện?' },
  confirmText: { type: String, default: 'Xác nhận' },
  cancelText: { type: String, default: 'Hủy' },
  type: { type: String, default: 'warning' }, // warning, error, info
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const dialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const icon = computed(
  () =>
    ({
      error: 'mdi-alert-circle',
      warning: 'mdi-alert',
      info: 'mdi-information',
    })[props.type] || 'mdi-alert',
)

const iconColor = computed(() => props.type)

const confirmColor = computed(
  () =>
    ({
      error: 'error',
      warning: 'warning',
      info: 'primary',
    })[props.type] || 'primary',
)

const confirm = () => {
  emit('confirm')
}

const cancel = () => {
  emit('cancel')
  emit('update:modelValue', false)
}
</script>
