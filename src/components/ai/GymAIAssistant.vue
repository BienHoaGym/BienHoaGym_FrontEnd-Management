<template>
  <!-- ===== FAB BUTTON ===== -->
  <div class="ai-fab-wrapper">
    <!-- Notification Tooltip -->
    <Transition name="pop">
      <div v-if="showNotification && !aiStore.isOpen" class="ai-notification-toast" @click="openWithNotif">
        <span class="toast-icon">✨</span>
        <span class="toast-text">{{ aiStore.notificationMessage || '💬 GymAI sẵn sàng hỗ trợ!' }}</span>
        <button class="toast-close" @click.stop="aiStore.dismissNotification()">✕</button>
      </div>
    </Transition>

    <!-- Error Badge Tooltip -->
    <Transition name="pop">
      <div v-if="aiStore.hasUnreadErrors && !aiStore.isOpen" class="ai-error-toast" @click="aiStore.open('errors')">
        🔴 Phát hiện {{ aiStore.unreadErrorCount }} lỗi · Nhấn để xem
      </div>
    </Transition>

    <button
      class="ai-fab"
      @click="aiStore.toggle()"
      :class="{ 'is-open': aiStore.isOpen, 'has-error': aiStore.hasUnreadErrors }"
      title="GymAI Assistant"
    >
      <span class="ai-fab-icon">{{ aiStore.isOpen ? '✕' : '🤖' }}</span>
      <div v-if="aiStore.unreadErrorCount > 0 && !aiStore.isOpen" class="ai-fab-badge error">
        {{ aiStore.unreadErrorCount }}
      </div>
      <div v-else-if="aiStore.hasNotification && !aiStore.isOpen" class="ai-fab-badge pulse"></div>
    </button>
  </div>

  <!-- ===== MAIN CHAT PANEL ===== -->
  <Transition name="slide-up">
    <div v-if="aiStore.isOpen" class="ai-panel">
      <!-- Header -->
      <div class="ai-header">
        <div class="ai-header-left">
          <div class="ai-avatar-wrap">
            <span class="ai-avatar-icon">🤖</span>
            <span class="ai-online-dot"></span>
          </div>
          <div class="ai-header-info">
            <div class="ai-name">GymAI <span class="ai-badge-pro">PRO</span></div>
            <div class="ai-subtitle">{{ aiStore.currentModule }} · {{ roleLabel }}</div>
          </div>
        </div>
        <div class="ai-header-actions">
          <button v-if="aiStore.activeTab === 'chat'" class="ai-icon-btn" @click="aiStore.clearMessages()" title="Xóa chat">🗑️</button>
          <button v-if="aiStore.activeTab === 'insights'" class="ai-icon-btn" @click="aiStore.refreshModuleInsight()" title="Làm mới phân tích">🔄</button>
          <button v-if="aiStore.activeTab === 'errors'" class="ai-icon-btn" @click="aiStore.clearErrorLog()" title="Xóa log lỗi">🗑️</button>
          <button class="ai-icon-btn" @click="aiStore.close()">✕</button>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="ai-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="ai-tab"
          :class="{ active: aiStore.activeTab === tab.id }"
          @click="switchTab(tab.id)"
        >
          <span>{{ tab.icon }}</span>
          <span>{{ tab.label }}</span>
          <span v-if="tab.id === 'errors' && aiStore.unreadErrorCount > 0" class="tab-badge">{{ aiStore.unreadErrorCount }}</span>
        </button>
      </div>

      <!-- ===== TAB: CHAT ===== -->
      <div v-show="aiStore.activeTab === 'chat'" class="ai-tab-content">
        <div v-if="aiStore.messages.length === 0" class="ai-welcome">
          <div class="ai-welcome-avatar">🏋️</div>
          <h3>Xin chào! Tôi là GymAI</h3>
          <p>Cố vấn AI với 18+ năm kinh nghiệm.<br>Tôi có thể giúp gì cho bạn hôm nay?</p>
          <div class="ai-quick-grid">
            <button v-for="q in quickQuestions" :key="q.text" class="ai-quick-chip" @click="sendQuick(q.text)">
              <span class="chip-icon">{{ q.icon }}</span>
              <span class="chip-text">{{ q.text }}</span>
            </button>
          </div>
        </div>

        <div ref="messagesEl" class="ai-messages" v-if="aiStore.messages.length > 0">
          <div v-for="(msg, i) in aiStore.messages" :key="i" class="ai-msg" :class="[msg.role, { 'is-diagnosis': msg.isErrorDiagnosis }]">
            <div class="ai-msg-ava">{{ msg.role === 'assistant' ? '🤖' : '👤' }}</div>
            <div class="ai-msg-body">
              <div class="ai-msg-bubble" v-html="renderMarkdown(msg.content)"></div>
              <div class="ai-msg-time">{{ formatTime(msg.timestamp) }}</div>
            </div>
          </div>
          <div v-if="aiStore.loading" class="ai-msg assistant"><div class="ai-typing"><span></span><span></span><span></span></div></div>
        </div>

        <div class="ai-input-area">
          <div class="ai-input-row">
            <textarea v-model="inputText" class="ai-input" placeholder="Hỏi GymAI..." rows="1" @keydown.enter.exact.prevent="sendMessage"></textarea>
            <button class="ai-send-btn" @click="sendMessage" :disabled="!inputText.trim() || aiStore.loading">➤</button>
          </div>
        </div>
      </div>

      <!-- ===== TAB: INSIGHTS ===== -->
      <div v-show="aiStore.activeTab === 'insights'" class="ai-tab-content">
        <div class="insights-container">
          <div v-if="aiStore.insightLoading" class="insight-loading"><div class="insight-spinner"></div><p>Đang phân tích...</p></div>
          <div v-else>
            <div class="insight-header"><div class="insight-title">📊 Phân tích · {{ aiStore.currentModule }}</div></div>
            <div class="insight-content" v-html="renderMarkdown(aiStore.moduleInsight || 'Chưa có dữ liệu phân tích hôm nay.')"></div>
          </div>
        </div>
      </div>

      <!-- ===== TAB: ERRORS ===== -->
      <div v-show="aiStore.activeTab === 'errors'" class="ai-tab-content">
        <div class="errors-container">
          <div v-if="aiStore.errorLog.length === 0" class="error-empty"><p>Hệ thống ổn định ✅</p></div>
          <div v-else class="error-list">
            <div v-for="err in aiStore.recentErrors" :key="err.id" class="error-card" :class="{ unread: !err.read }">
              <div class="error-card-header"><div class="error-status-badge">HTTP {{ err.status }}</div><div class="error-time">{{ formatTime(err.time) }}</div></div>
              <div class="error-message">{{ err.message }}</div>
              <div v-if="err.diagnosis" class="error-diagnosis" v-html="renderMarkdown(err.diagnosis)"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAiAssistantStore } from '@/stores/aiAssistant'
import { useAuthStore } from '@/stores/auth'

const aiStore = useAiAssistantStore()
const authStore = useAuthStore()
const route = useRoute()
const inputText = ref('')
const messagesEl = ref(null)

const roleLabel = computed(() => authStore.userRole || 'Nhân viên')
const tabs = [{ id: 'chat', icon: '💬', label: 'Chat' }, { id: 'insights', icon: '📊', label: 'Phân tích' }, { id: 'errors', icon: '🔴', label: 'Lỗi' }]

// Context Watcher
watch(() => route.path, (path) => {
  const name = path === '/' ? 'Dashboard' : path.split('/')[1]
  aiStore.setContext(path, name, authStore.userRole)
}, { immediate: true })

async function sendMessage() {
  if (!inputText.value.trim() || aiStore.loading) return
  const text = inputText.value
  inputText.value = ''
  await aiStore.sendMessage(text)
  await nextTick(() => { if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight })
}

async function sendQuick(text) {
  aiStore.dismissNotification()
  await aiStore.sendMessage(text)
  await nextTick(() => { if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight })
}

function switchTab(id) { aiStore.setTab(id); if (id === 'errors') aiStore.markErrorsRead() }
function openWithNotif() { aiStore.open('chat'); aiStore.dismissNotification() }
const showNotification = computed(() => aiStore.hasNotification && !aiStore.isOpen)
const quickQuestions = computed(() => aiStore.getQuickQuestions?.() || [{text: 'Tư vấn vận hành', icon: '📈'}])

function renderMarkdown(text) { 
  if(!text) return ''; 
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>') 
}
function formatTime(ts) { return new Date(ts).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) }
</script>

<style scoped>
.ai-fab-wrapper { position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
.ai-fab { width: 56px; height: 56px; border-radius: 28px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; cursor: pointer; color: white; font-size: 24px; box-shadow: 0 4px 12px rgba(99,102,241,0.4); transition: transform 0.2s; }
.ai-fab:hover { transform: scale(1.1); }
.ai-panel { position: fixed; bottom: 90px; right: 24px; width: 380px; height: 550px; background: white; border-radius: 16px; box-shadow: 0 12px 40px rgba(0,0,0,0.15); display: flex; flex-direction: column; overflow: hidden; border: 1px solid rgba(0,0,0,0.05); }
.ai-header { padding: 12px 16px; background: #6366f1; color: white; display: flex; justify-content: space-between; align-items: center; }
.ai-header-info { line-height: 1.2; }
.ai-name { font-weight: bold; font-size: 14px; }
.ai-subtitle { font-size: 11px; opacity: 0.8; }
.ai-tabs { display: flex; border-bottom: 1px solid #eee; }
.ai-tab { flex: 1; padding: 10px; border: none; background: none; cursor: pointer; font-size: 13px; color: #666; border-bottom: 2px solid transparent; }
.ai-tab.active { color: #6366f1; border-bottom-color: #6366f1; font-weight: bold; }
.ai-tab-content { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; }
.ai-messages { flex: 1; display: flex; flex-direction: column; gap: 10px; }
.ai-msg { display: flex; gap: 8px; }
.ai-msg.user { flex-direction: row-reverse; }
.ai-msg-bubble { padding: 8px 12px; border-radius: 12px; font-size: 13px; max-width: 85%; }
.assistant .ai-msg-bubble { background: #f3f4f6; color: #1f2937; }
.user .ai-msg-bubble { background: #6366f1; color: white; }
.ai-msg-time { font-size: 10px; color: #9ca3af; margin-top: 2px; }
.ai-input-area { padding: 12px; border-top: 1px solid #eee; }
.ai-input-row { display: flex; gap: 8px; }
.ai-input { flex: 1; border: 1px solid #ddd; borderRadius: 8px; padding: 8px; font-size: 13px; resize: none; outline: none; }
.ai-send-btn { background: #6366f1; color: white; border: none; padding: 0 12px; borderRadius: 8px; cursor: pointer; }
.insight-content { font-size: 13px; line-height: 1.6; color: #4b5563; }
.error-card { padding: 10px; border: 1px solid #fee2e2; border-radius: 8px; background: #fffafb; margin-bottom: 8px; }
.error-status-badge { font-size: 11px; font-weight: bold; color: #dc2626; }
.error-diagnosis { margin-top: 8px; padding: 8px; background: #f0fdf4; border-radius: 6px; font-size: 12px; color: #166534; }
.ai-typing span { width: 6px; height: 6px; background: #6366f1; border-radius: 50%; display: inline-block; margin: 0 1px; animation: bounce 1s infinite alternate; }
@keyframes bounce { from { opacity: 0.3; transform: scale(0.8); } to { opacity: 1; transform: scale(1.1); } }
</style>
