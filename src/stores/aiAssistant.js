// src/stores/aiAssistant.js
import { defineStore } from 'pinia'
import { geminiService, MODULE_INSIGHTS } from '@/services/geminiService'

export const useAiAssistantStore = defineStore('aiAssistant', {
  state: () => ({
    isOpen: false,
    loading: false,
    messages: [], // { role: 'user' | 'assistant', content: string, timestamp: number, isError: bool, isSystemError: bool }
    currentPath: '/',
    currentModule: 'Dashboard',
    currentUserRole: 'Staff',
    activeTab: 'chat', // 'chat' | 'insights' | 'errors'
    
    // Proactive insights
    moduleInsight: null,
    insightLoading: false,
    hasNotification: false,
    notificationMessage: '',
    
    // Error Logging System
    errorLog: [], // { id, status, message, url, time, module, read: false, diagnosis: null }
    unreadErrorCount: 0
  }),

  getters: {
    hasMessages: (state) => state.messages.length > 0,
    hasUnreadErrors: (state) => state.unreadErrorCount > 0,
    recentErrors: (state) => [...state.errorLog].sort((a, b) => b.time - a.time).slice(0, 5),
    hasModuleInsights: (state) => !!MODULE_INSIGHTS[state.currentPath]
  },

  actions: {
    toggle() {
      this.isOpen = !this.isOpen
      if (this.isOpen && this.activeTab === 'insights' && !this.moduleInsight) {
        this.refreshModuleInsight()
      }
    },
    
    open(tab = 'chat') {
      this.isOpen = true
      this.activeTab = tab
    },

    close() {
      this.isOpen = false
    },

    setTab(tab) {
      this.activeTab = tab
    },

    setContext(path, moduleName, role) {
      if (this.currentPath !== path) {
        this.currentPath = path
        this.currentModule = moduleName
        this.currentUserRole = role
        // Tự động load insight mới khi chuyển trang nếu drawer đang mở
        if (this.isOpen && this.activeTab === 'insights') {
          this.refreshModuleInsight()
        } else {
          // Reset insight của trang cũ
          this.moduleInsight = null
        }
      }
    },

    async sendMessage(text) {
      if (!text.trim()) return

      const userMsg = {
        role: 'user',
        content: text,
        timestamp: Date.now()
      }
      this.messages.push(userMsg)
      
      this.loading = true
      try {
        const history = this.messages.slice(0, -1) // Không gửi chính tin vừa thêm
        const response = await geminiService.chat(text, {
          module: this.currentModule,
          role: this.currentUserRole,
          history
        })

        this.messages.push({
          role: 'assistant',
          content: response,
          timestamp: Date.now()
        })
      } catch (error) {
        this.messages.push({
          role: 'assistant',
          content: '⚠️ Xin lỗi, tôi gặp sự cố kết nối. Vui lòng thử lại sau.',
          timestamp: Date.now(),
          isSystemError: true
        })
      } finally {
        this.loading = false
      }
    },

    /**
     * Chẩn đoán lỗi API chủ động
     */
    async diagnoseApiError(errorInfo) {
      const errorEntry = {
        id: Date.now(),
        status: errorInfo.status,
        message: errorInfo.message,
        url: errorInfo.url,
        time: Date.now(),
        module: this.currentModule,
        read: false,
        diagnosis: null
      }

      this.errorLog.push(errorEntry)
      this.unreadErrorCount++

      // Nếu lỗi nghiêm trọng (500+), tự động tạo lời nhắc hoặc thông báo
      if (errorInfo.status >= 500 || !errorInfo.status) {
         this.notifyByAI(`🔴 Phát hiện lỗi hệ thống tại module ${this.currentModule}. Tôi đang phân tích nguyên nhân...`)
         
         // Tự động chẩn đoán bằng AI
         const diagnosis = await geminiService.diagnoseError(errorInfo, this.currentModule)
         errorEntry.diagnosis = diagnosis
         
         // Thêm vào chat nếu đang mở tab chat
         if (this.isOpen && this.activeTab === 'chat') {
            this.messages.push({
              role: 'assistant',
              content: diagnosis,
              timestamp: Date.now(),
              isErrorDiagnosis: true
            })
         }
      }
    },

    /**
     * Cập nhật dữ liệu cho AI phân tích chủ động
     * (Called by components in onMounted)
     */
    async updateStats(stats) {
       // Trong thực tế, AI có thể tự động cảnh báo nếu stats bất thường
       // Ví dụ: Doanh thu giảm đột ngột, hội viên check-in quá đông,...
       console.log(`[GymAI] Received stats for ${this.currentModule}:`, stats)
    },

    async refreshModuleInsight() {
      if (!this.currentPath) return
      
      this.insightLoading = true
      try {
        // Giả lập hoặc gọi AI lấy insight chuyên sâu cho module hiện tại
        // Ở phase này ta dùng template có sẵn từ geminiService
        const insight = await geminiService.getModuleInsight(this.currentPath, this.currentModule)
        this.moduleInsight = insight
      } finally {
        this.insightLoading = false
      }
    },

    notifyByAI(message) {
      this.hasNotification = true
      this.notificationMessage = message
    },

    dismissNotification() {
      this.hasNotification = false
    },

    markErrorsRead() {
      this.errorLog.forEach(e => e.read = true)
      this.unreadErrorCount = 0
    },

    clearMessages() {
      this.messages = []
    },

    clearErrorLog() {
      this.errorLog = []
      this.unreadErrorCount = 0
    }
  }
})
