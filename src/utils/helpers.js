// src/utils/helpers.js
import dayjs from 'dayjs'

export const formatDate = (date) => {
  if (!date) return ''
  return dayjs(date).format('DD/MM/YYYY')
}

// src/utils/helpers.js (Thêm vào nếu chưa có)
export const formatDateTime = (d) => {
  if (!d) return ''
  const date = new Date(d)
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute:'2-digit' }) + ' ' + 
         date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
// REMOVED THE FIRST DUPLICATE FROM HERE

export const formatNumber = (number) => {
  if (!number && number !== 0) return ''
  return new Intl.NumberFormat('vi-VN').format(number)
}

export const getStatusColor = (status) => {
  const colors = {
    Active: 'success',
    Inactive: 'error',
    Pending: 'warning',
    Expired: 'error',
    Cancelled: 'grey',
    Completed: 'success',
    Failed: 'error',
    Refunded: 'warning'
  }
  return colors[status] || 'grey'
}

export const getDaysUntilExpiry = (endDate) => {
  if (!endDate) return null
  const today = dayjs()
  const expiry = dayjs(endDate)
  return expiry.diff(today, 'day')
}

export const isExpiringSoon = (endDate) => {
  const days = getDaysUntilExpiry(endDate)
  return days !== null && days >= 0 && days <= 7
}

export const truncate = (text, length = 50) => {
  if (!text) return ''
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

/**
 * Format currency VND - Kept this version (returns '—' for empty values)
 */
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '—'
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND' 
  }).format(amount)
}

export const debounce = (func, wait = 300) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
