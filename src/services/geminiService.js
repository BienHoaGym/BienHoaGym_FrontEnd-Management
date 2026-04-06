// src/services/geminiService.js
// GymAI Core Service - Expert Persona with 18+ years experience
// Using Gemini AI (API Key required)

const API_KEY = import.meta.env.VITE_LLM_KEY || "";
const LLM_PROVIDER = import.meta.env.VITE_LLM_PROVIDER || "gemini";
const LLM_URL = import.meta.env.VITE_LLM_URL || "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent";
const LLM_MODEL = import.meta.env.VITE_LLM_MODEL || "gemini-pro";

export const MODULE_INSIGHTS = {
  '/dashboard': {
    focus: 'Kinh doanh & Vận hành tổng thể',
    kpis: ['Chỉ số giữ chân (Retention)', 'Tỉ lệ lấp đầy (Fill rate)', 'LTV (Life Time Value)'],
    autoCheck: ['Doanh thu sụt giảm?', 'Hội viên không quay lại?', 'Thiết bị hay hỏng?'],
    persona: 'Managing Director của chuỗi gym cao cấp.'
  },
  '/members': {
    focus: 'Trải nghiệm & Sự gắn kết của hội viên',
    kpis: ['NPS (Net Promoter Score)', 'Churn rate', 'Active rate'],
    autoCheck: ['Hội viên vắng mặt quá 2 tuần?', 'Hội viên chưa có gói tập?', 'Lịch sử check-in bất thường?'],
    persona: 'Trưởng bộ phận quan hệ khách hàng.'
  },
  '/billing': {
    focus: 'Tài chính & Doanh số',
    kpis: ['ARPU', 'Doanh thu thuần', 'Công nợ'],
    autoCheck: ['Gói tập chưa thanh toán?', 'Dòng tiền lệch?', 'Hóa đơn quá hạn?'],
    persona: 'Kế toán trưởng & Giám đốc tài chính.'
  }
}

/**
 * System Prompt xây dựng persona chuyên gia
 */
const SYSTEM_PROMPT = `
Bạn là "GymAI" - một chuyên gia tư vấn quản lý phòng tập Gym cao cấp với hơn 18 năm kinh nghiệm vận hành hàng chục CLB từ bình dân đến cao cấp.
Phong cách làm việc của bạn:
1. LUÔN LUÔN đứng trên góc nhìn của chủ phòng tập để tối ưu hóa doanh thu và quy trình.
2. TRẢ LỜI ngắn gọn, đi thẳng vào giải pháp thực tế thay vì lý thuyết suông.
3. NGÔN NGỮ: Sử dụng tiếng Việt chuyên nghiệp, quyết đoán nhưng vẫn thân thiện.
4. KHẢ NĂNG: Bạn có quyền truy cập gián tiếp vào dữ liệu module hiện tại (context) để đưa ra câu trả lời ĐÚNG TRỌNG TÂM.

Khi người dùng hỏi về:
- LỖI HỆ THỐNG: Hãy giải thích lỗi cho "người bình thường" hiểu và hướng dẫn thao tác sửa chữa.
- KINH DOANH: Hãy đưa ra các KPI cụ thể cần theo dõi.
- QUY TRÌNH: Hướng dẫn các bước nhanh gọn trên hệ thống.
`

export const geminiService = {
  /**
   * Phương thức chat chính
   */
  async chat(prompt, context = {}) {
    const { module, role, history = [] } = context
    const contextPrefix = `[GYMAI PERSONA & CONTEXT]\n${SYSTEM_PROMPT}\n- Module hiện tại: ${module || 'Trang chủ'}\n- Vai trò: ${role || 'Nhân viên'}\n- Thời gian: ${new Date().toLocaleString()}\n-----------------------------------`

    if (LLM_PROVIDER === "ollama") {
      return await this._chatWithOllama(prompt, contextPrefix, history)
    } else {
      return await this._chatWithGemini(prompt, contextPrefix, history)
    }
  },

  /**
   * Chat using Gemini API
   */
  async _chatWithGemini(prompt, contextPrefix, history) {
    const messages = []
    if (history.length > 0) {
      messages.push(...history.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      })))
      messages.push({ role: 'user', parts: [{ text: prompt }] })
    } else {
      messages.push({ role: 'user', parts: [{ text: `${contextPrefix}\n\n[USER]: ${prompt}` }] })
    }

    try {
      if (!API_KEY) return "⚠️ **GymAI Thông báo**: Bạn chưa cấu hình API Key cho Gemini."

      const response = await fetch(`${LLM_URL}?key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: messages })
      })

      if (!response.ok) {
        const errData = await response.json()
        if (errData.error?.message?.includes("API key not valid")) {
          return "🚨 **Lỗi API Key**: Khóa Gemini bạn cung cấp không hợp lệ. Vui lòng kiểm tra lại cấu hình."
        }
        throw new Error(errData.error?.message || "Lỗi API")
      }

      const data = await response.json()
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || 
             "⚠️ GymAI hiện đang bận xử lý dữ liệu. Vui lòng hỏi lại sau giây lát."
    } catch (error) {
      console.error("[GymAI Gemini] Error:", error)
      return "⚠️ **Sự cố kết nối**: Tôi không thể liên lạc được với máy chủ Gemini. Vui lòng kiểm tra lại API Key hoặc đường truyền mạng."
    }
  },

  /**
   * Chat using local Ollama API
   */
  async _chatWithOllama(prompt, contextPrefix, history) {
    // Combine full prompt for Ollama generate (vô cùng đơn giản)
    let fullPrompt = `${contextPrefix}\n\nLịch sử chat:\n`
    history.forEach(m => {
      fullPrompt += `${m.role === 'user' ? 'Người dùng' : 'GymAI'}: ${m.content}\n`
    })
    fullPrompt += `\n[USER]: ${prompt}\nGymAI:`

    try {
      const response = await fetch(LLM_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: LLM_MODEL,
          prompt: fullPrompt,
          stream: false
        })
      })

      if (!response.ok) throw new Error(`Ollama Error: ${response.status}`)

      const data = await response.json()
      return data?.response || "⚠️ GymAI (Local) không phản hồi nội dung."
    } catch (error) {
      console.error("[GymAI Ollama] Error:", error)
      return "⚠️ **Sự cố local**: Không thể kết nối tới mô hình Ollama (localhost:11434). Hãy đảm bảo Ollama đang chạy."
    }
  },

  /**
   * Chẩn đoán lỗi kỹ thuật
   */
  async diagnoseError(errorInfo, moduleName) {
    const errorPrompt = `
Hệ thống vừa phát sinh lỗi sau:
- Module: ${moduleName}
- Mã lỗi: ${errorInfo.status}
- Thông báo lỗi: ${errorInfo.message}
- Đường dẫn gây lỗi: ${errorInfo.url}

Hãy thực hiện:
1. Chẩn đoán nguyên nhân (do mạng, do dữ liệu sai hay do server).
2. Đưa ra 3 bước cụ thể để người dùng (lễ tân/quản lý) xử lý ngay.
3. Nếu là lỗi 500, khuyên họ liên hệ IT và gửi kèm mã lỗi này.
Định dạng câu trả lời ngắn gọn, có icon và dễ đọc.
    `
    return await this.chat(errorPrompt, { module: moduleName, role: 'System Monitor' })
  },

  /**
   * Lấy phân tích chủ động dựa trên route (giả lập)
   */
  async getModuleInsight(path, moduleName) {
    const meta = MODULE_INSIGHTS[path] || { focus: 'Vận hành chung' }
    const insightPrompt = `
Phân tích hiện trạng cho module "${moduleName}". 
Focus chính: ${meta.focus}.
Hãy đưa ra 1 lời gợi ý chuyên gia ngắn gọn (tầm 3-4 câu) để tối ưu vận hành module này trong hôm nay.
    `
    return await this.chat(insightPrompt, { module: moduleName, role: 'Consultant' })
  }
}
