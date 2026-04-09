// src/composables/useApiErrorHandler.js
// Global API Error Interceptor - Standard Error Handling
import { useUiStore } from '@/stores/ui'

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
  /**
   * Xử lý lỗi
   * @param {Error|Response|Object} error - Lỗi hoặc Response không thành công
   * @param {Object} options - { url, silent, title }
   */
  async function handleError(error, options = {}) {
    const errorInfo = await parseError(error)
    const uiStore = useUiStore()

    // Override với options nếu có
    if (options.url && !errorInfo.url) errorInfo.url = options.url
    if (options.status) errorInfo.status = options.status

    console.error('[API Error]', errorInfo)

    if (!options.silent) {
       uiStore.showError(errorInfo.message, options.title || 'Lỗi hệ thống')
    }

    // Trả về thông tin lỗi để module xử lý thêm nếu cần
    return { ...errorInfo }
  }

  /**
   * Fetch wrapper
   */
  async function fetchWithAI(url, options = {}) {
    const { silent = false, ...fetchOptions } = options

    try {
      const response = await fetch(url, fetchOptions)

      if (!response.ok) {
        const errInfo = await parseError(response)
        errInfo.url = url

        if (!silent) {
           console.error('[API Error]', errInfo)
        }

        const err = new Error(errInfo.message)
        err.status = response.status
        err.errorInfo = errInfo
        throw err
      }

      return response
    } catch (e) {
      if (e.status) throw e 
      throw e
    }
  }

  function setupAxiosInterceptor(axiosInstance) {
    axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const errInfo = await parseError(error)
        if (errInfo.status !== 401) {
          await handleError(errInfo, { silent: errInfo.status === 400 })
        }
        return Promise.reject(error)
      }
    )
  }

  async function notifyWarning(message, details = '') {
    console.warn('[Warning]', message, details)
  }

  return {
    handleError,
    fetchWithAI,
    setupAxiosInterceptor,
    notifyWarning
  }
}

export function setupGlobalErrorCapture() {
  window.addEventListener('unhandledrejection', async (event) => {
    const error = event.reason
    if (!error) return
    console.error('[Unhandled Rejection]', error)
  })

  console.log('Global error capture initialized')
}
