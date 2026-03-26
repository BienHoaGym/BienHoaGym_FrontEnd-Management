// src/composables/useApiErrorHandler.js
// Global API Error Interceptor - Auto-diagnose errors with GymAI

import { useAiAssistantStore } from '@/stores/aiAssistant'

// Error severity levels
const SEVERITY = {
  LOW: 'low',       // 400, 404 — user input errors, không cần AI
  MEDIUM: 'medium', // 401, 403, 409, 422 — cần hướng dẫn
  HIGH: 'high'      // 500, 502, 503, network — cần AI phân tích ngay
}

function getErrorSeverity(status) {
  if (!status) return SEVERITY.HIGH
  if ([400, 404].includes(status)) return SEVERITY.LOW
  if ([401, 403, 409, 422].includes(status)) return SEVERITY.MEDIUM
  return SEVERITY.HIGH // 500+
}

// Parse error from various response types
async function parseError(errorOrResponse) {
  if (!errorOrResponse) return { status: 0, message: 'Lỗi không xác định' }

  // If it's a Response object (fetch API)
  if (errorOrResponse instanceof Response) {
    let message = `HTTP ${errorOrResponse.status}`
    try {
      const body = await errorOrResponse.json()
      message = body?.message || body?.error || body?.title || message
    } catch { /* ignore */ }
    return {
      status: errorOrResponse.status,
      message,
      url: errorOrResponse.url
    }
  }

  // If it's an axios error
  if (errorOrResponse.response) {
    const res = errorOrResponse.response
    const message = res.data?.message || res.data?.error || res.statusText || `HTTP ${res.status}`
    return {
      status: res.status,
      message,
      url: res.config?.url || ''
    }
  }

  // If it's a network error
  if (errorOrResponse instanceof TypeError || errorOrResponse.message?.includes('fetch')) {
    return {
      status: null,
      message: 'Không thể kết nối đến máy chủ. Kiểm tra đường truyền mạng.',
      url: ''
    }
  }

  // Generic Error object
  return {
    status: errorOrResponse.status || null,
    message: errorOrResponse.message || 'Đã xảy ra lỗi không mong muốn',
    url: errorOrResponse.url || ''
  }
}

export function useApiErrorHandler() {
  const aiStore = useAiAssistantStore()

  /**
   * Xử lý lỗi và báo cho GymAI nếu cần
   * @param {Error|Response|Object} error - Lỗi hoặc Response không thành công
   * @param {Object} options - { url, forceAI, silent }
   */
  async function handleError(error, options = {}) {
    const errorInfo = await parseError(error)

    // Override với options nếu có
    if (options.url && !errorInfo.url) errorInfo.url = options.url
    if (options.status) errorInfo.status = options.status

    const severity = getErrorSeverity(errorInfo.status)

    // Quyết định có gọi AI không
    const shouldUseAI = options.forceAI ||
      severity === SEVERITY.HIGH ||
      severity === SEVERITY.MEDIUM

    if (shouldUseAI && !options.silent) {
      // Gọi AI để phân tích và mở panel lỗi
      await aiStore.diagnoseApiError(errorInfo)
    }

    // Trả về thông tin lỗi để module xử lý thêm nếu cần
    return { ...errorInfo, severity }
  }

  /**
   * Fetch wrapper tự động xử lý lỗi với AI
   * @param {string} url - API URL
   * @param {Object} options - fetch options + { silent, forceAI }
   */
  async function fetchWithAI(url, options = {}) {
    const { silent = false, forceAI = false, ...fetchOptions } = options

    try {
      const response = await fetch(url, fetchOptions)

      if (!response.ok) {
        const errInfo = await parseError(response)
        errInfo.url = url

        const severity = getErrorSeverity(response.status)
        const shouldUseAI = forceAI || severity !== SEVERITY.LOW

        if (shouldUseAI && !silent) {
          await aiStore.diagnoseApiError(errInfo)
        }

        // Throw để caller có thể catch nếu cần
        const err = new Error(errInfo.message)
        err.status = response.status
        err.errorInfo = errInfo
        throw err
      }

      return response
    } catch (e) {
      if (e.status) throw e // Already handled above

      // Network error
      const netError = { status: null, message: e.message || 'Lỗi kết nối mạng', url }
      if (!silent) await aiStore.diagnoseApiError(netError)
      throw e
    }
  }

  /**
   * Axios interceptor setup
   * Gọi hàm này 1 lần trong main.js hoặc plugin
   */
  function setupAxiosInterceptor(axiosInstance) {
    axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const errInfo = await parseError(error)

        // Không intercept lỗi 401 (thường redirect login)
        if (errInfo.status !== 401) {
          await handleError(errInfo, { silent: errInfo.status === 400 })
        }

        return Promise.reject(error)
      }
    )
  }

  /**
   * Notify AI về sự kiện cảnh báo (không phải lỗi HTTP)
   * Ví dụ: tồn kho gần hết, hội viên sắp hết hạn nhiều, v.v.
   */
  async function notifyWarning(message, details = '') {
    const warningError = {
      status: 'WARNING',
      message,
      url: details
    }
    await aiStore.diagnoseApiError(warningError)
  }

  return {
    handleError,
    fetchWithAI,
    setupAxiosInterceptor,
    notifyWarning
  }
}

// ─── Standalone: Global unhandled rejection handler ───
// Thêm vào main.js: setupGlobalErrorCapture()
export function setupGlobalErrorCapture() {
  // Capture unhandled promise rejections
  window.addEventListener('unhandledrejection', async (event) => {
    const error = event.reason
    if (!error) return

    // Bỏ qua các lỗi không liên quan đến API
    const ignoredMessages = ['ResizeObserver', 'Non-Error', 'Script error', 'ChunkLoadError']
    if (ignoredMessages.some(m => String(error).includes(m))) return

    try {
        const { useAiAssistantStore } = await import('@/stores/aiAssistant')
        const aiStore = useAiAssistantStore()

        const errInfo = {
          status: error?.status || error?.response?.status || null,
          message: error?.message || String(error),
          url: error?.config?.url || error?.url || window.location.pathname
        }

        // Chỉ báo AI khi có vẻ là lỗi API
        if (errInfo.status || errInfo.message.includes('fetch') || errInfo.message.includes('network')) {
          await aiStore.diagnoseApiError(errInfo)
        }
    } catch { /* ignore */ }
  })

  console.log('[GymAI] Global error capture initialized ✓')
}
