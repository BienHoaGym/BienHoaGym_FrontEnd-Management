import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const alert = ref({
    show: false,
    title: 'Thông báo',
    message: '',
    subMessage: '',
    color: 'primary',
    icon: 'mdi-information-outline',
    persistent: false,
    isConfirm: false,
    onConfirm: null,
    onCancel: null
  })

  const showAlert = (message, title = 'Thông báo', color = 'primary', icon = 'mdi-information-outline', sub = '') => {
    alert.value = {
      show: true,
      title,
      message,
      subMessage: sub,
      color,
      icon,
      persistent: color === 'error' || color === 'warning',
      isConfirm: false
    }
  }

  const showConfirm = (message, title = 'Xác nhận', onConfirm = null, onCancel = null) => {
    alert.value = {
      show: true,
      title,
      message,
      subMessage: '',
      color: 'warning',
      icon: 'mdi-help-circle',
      persistent: true,
      isConfirm: true,
      onConfirm,
      onCancel
    }
  }

  const showError = (message, title = 'Lỗi hệ thống') => {
    showAlert(message, title, 'error', 'mdi-alert-circle')
  }

  const showWarning = (message, title = 'Cảnh báo') => {
    showAlert(message, title, 'warning', 'mdi-alert-box')
  }

  const showSuccess = (message, title = 'Thành công') => {
    showAlert(message, title, 'success', 'mdi-check-circle')
  }

  const closeAlert = (result = false) => {
    if (alert.value.isConfirm) {
      if (result && alert.value.onConfirm) alert.value.onConfirm()
      if (!result && alert.value.onCancel) alert.value.onCancel()
    }
    alert.value.show = false
  }

  return {
    alert,
    showAlert,
    showConfirm,
    showError,
    showWarning,
    showSuccess,
    closeAlert
  }
})
