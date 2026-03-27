import axios from 'axios'
import router from '@/router'

// Tạo instance axios
const api = axios.create({
  // QUAN TRỌNG: Đặt baseURL là '/api' để khớp với proxy trong vite.config.js
  // Khi bạn gọi api.post('/Auth/login'), nó sẽ thành: http://localhost:5173/api/Auth/login
  // Vite sẽ chuyển tiếp sang: https://localhost:7163/api/Auth/login
  baseURL: '/api', 
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - Tự động thêm Token vào Header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Xử lý lỗi toàn cục
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Xử lý lỗi 401 Unauthorized (Token hết hạn hoặc không hợp lệ)
    if (error.response?.status === 401) {
      // Xóa data cũ
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // Chuyển hướng về trang login
      // Dùng window.location để đảm bảo reset trạng thái app sạch sẽ hơn router.push đôi khi
      if (router.currentRoute.value.path !== '/login') {
         router.push('/login')
      }
    }

    // Xử lý lỗi 403 Forbidden (Không có quyền truy cập)
    if (error.response?.status === 403) {
      console.warn('Forbidden access (403):', error.config.url)
      // Không tự động redirect để Component/Store có thể xử lý fallback nếu cần
    }

    // Xử lý lỗi 500 Server Error
    if (error.response?.status === 500) {
      console.error('Server error:', error.response.data)
      // Tùy chọn: Hiển thị thông báo lỗi cho user (dùng Toast/Notification)
    }

    // Xử lý lỗi Network Error (Backend tắt hoặc sai CORS)
    if (error.message === 'Network Error' && !error.response) {
      console.error('Network Error - Kiểm tra xem Backend có chạy không?')
    }

    return Promise.reject(error)
  }
)

export default api