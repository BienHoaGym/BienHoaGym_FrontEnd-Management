import axios from 'axios'
import router from '@/router'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // ✅ bỏ fallback '/api'
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Hàm đệ quy để biến tất cả keys thành camelCase
    const toCamel = (o) => {
      if (o === null || typeof o !== 'object') return o
      if (Array.isArray(o)) return o.map(toCamel)
      const n = {}
      Object.keys(o).forEach((k) => {
        const nk = k.charAt(0).toLowerCase() + k.slice(1)
        n[nk] = toCamel(o[k])
      })
      return n
    }

    if (response.data) {
      response.data = toCamel(response.data)
    }
    return response
  },
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      if (router.currentRoute.value.path !== '/login') {
        router.push('/login')
      }
    }

    if (error.response?.status === 403) {
      console.warn('403 Forbidden:', error.config.url)
    }

    if (error.response?.status === 500) {
      console.error('500 Server Error:', error.response.data)
    }

    if (error.message === 'Network Error' && !error.response) {
      console.error('Network Error - Backend hoặc CORS có vấn đề')
    }

    return Promise.reject(error)
  }
)

export default api