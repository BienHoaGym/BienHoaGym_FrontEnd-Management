<template>
  <div class="login-wrapper">
    <div class="ambient-glow shape-1"></div>
    <div class="ambient-glow shape-2"></div>

    <div class="login-container animate-scale-up">
      
      <div class="login-left">
        <div class="orb orb-top"></div>
        <div class="orb orb-bottom"></div>
        <div class="noise-overlay"></div>

        <div class="brand-info animate-fade-in-stagger-1">
          <div class="logo-container">
            <v-icon size="38" color="white">mdi-dumbbell</v-icon>
          </div>
          <h1 class="brand-title">Gym<br/>Management</h1>
          <p class="brand-subtitle">Hệ thống quản lý phòng gym thông minh & toàn diện.</p>
        </div>
        
        <div class="visual-focal-point animate-float">
          <div class="glass-widget">
            <div class="widget-header">
              <div class="widget-icon">
                <v-icon size="20" color="#dc2626">mdi-trending-up</v-icon>
              </div>
              <span class="widget-title">Doanh thu tháng</span>
            </div>
            <div class="widget-body">
              <span class="widget-value">+24.5%</span>
              <div class="widget-chart">
                <div class="bar bar-1"></div>
                <div class="bar bar-2"></div>
                <div class="bar bar-3"></div>
                <div class="bar bar-4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="login-right">
        <div class="form-wrapper">
          <div class="text-center mb-10 animate-fade-in-stagger-2">
            <h2 class="form-title">Chào mừng trở lại</h2>
            <p class="form-subtitle">Đăng nhập để quản lý hệ thống của bạn</p>
          </div>

          <v-form ref="formRef" @submit.prevent="handleLogin" class="animate-fade-in-stagger-3">
            
            <div class="custom-input-group mb-6">
              <input
                v-model="username"
                type="text"
                id="username"
                class="custom-input"
                placeholder=" "
                required
                :disabled="loading"
              />
              <label for="username" class="floating-label">Tên đăng nhập</label>
              <v-icon class="input-icon">mdi-account-outline</v-icon>
            </div>

            <div class="custom-input-group mb-4">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                id="password"
                class="custom-input"
                placeholder=" "
                required
                :disabled="loading"
              />
              <label for="password" class="floating-label">Mật khẩu</label>
              <v-icon class="input-icon">mdi-lock-outline</v-icon>
              
              <v-btn
                icon
                variant="text"
                size="small"
                class="eye-btn"
                @click="showPassword = !showPassword"
              >
                <v-icon size="20">{{ showPassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline' }}</v-icon>
              </v-btn>
            </div>

            <div class="d-flex align-center justify-space-between mb-8 mt-2 animate-fade-in-stagger-4">
              <v-checkbox
                v-model="rememberMe"
                label="Ghi nhớ đăng nhập"
                color="accent"
                density="compact"
                hide-details
                class="custom-checkbox"
                :disabled="loading"
              ></v-checkbox>
              <a href="#" class="forgot-link">Quên mật khẩu?</a>
            </div>

            <div v-if="errorMessage" class="error-alert animate-shake">
              <v-icon size="small" color="#dc2626" class="mr-2">mdi-alert-circle</v-icon>
              <span>{{ errorMessage }}</span>
            </div>

            <button type="submit" class="btn-3d-submit animate-fade-in-stagger-5" :disabled="loading">
              <span class="btn-shine"></span>
              <v-progress-circular v-if="loading" indeterminate size="22" width="2.5" class="mr-2"></v-progress-circular>
              <span class="btn-text">{{ loading ? 'Đang xác thực...' : 'Đăng Nhập Hệ Thống' }}</span>
              <v-icon v-if="!loading" size="20" class="ml-2 btn-arrow">mdi-arrow-right</v-icon>
            </button>
          </v-form>

          <div class="form-footer animate-fade-in-stagger-5">
            <p>© {{ new Date().getFullYear() }} Gym Management. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref(null)
const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

// Ghi nhớ mật khẩu
onMounted(() => {
  const savedUsername = localStorage.getItem('remember_username')
  const savedPassword = localStorage.getItem('remember_password')
  if (savedUsername && savedPassword) {
    username.value = savedUsername
    password.value = savedPassword
    rememberMe.value = true
  }
})

const handleLogin = async () => {
  if (!username.value || !password.value) return

  loading.value = true
  errorMessage.value = ''

  try {
    const result = await authStore.login(username.value, password.value)
    if (result.success) {
      // Xử lý ghi nhớ mật khẩu
      if (rememberMe.value) {
        localStorage.setItem('remember_username', username.value)
        localStorage.setItem('remember_password', password.value)
      } else {
        localStorage.removeItem('remember_username')
        localStorage.removeItem('remember_password')
      }
      
      // Redirect based on permissions
      if (authStore.hasPermission('report.read')) {
        router.push('/dashboard')
      } else {
        // Fallback to find first allowed route if doesn't have dashboard access
        const routes = router.getRoutes()
        const mainRoute = routes.find(r => r.path === '/')
        const children = mainRoute?.children || []
        
        let target = '/profile'
        for (const child of children) {
          if (child.path === '' || child.path === 'dashboard') continue
          if (!child.meta?.permission || authStore.hasPermission(child.meta.permission)) {
            target = `/${child.path}`
            break
          }
        }
        router.push(target)
      }
    } else {
      errorMessage.value = result.message || 'Tên đăng nhập hoặc mật khẩu không đúng.'
    }
  } catch (error) {
    errorMessage.value = 'Đã có lỗi xảy ra khi kết nối đến máy chủ.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

/* --- 1. Global & Background --- */
.login-wrapper {
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #F8FAFC; /* Light Gray background */
  position: relative;
  overflow: hidden;
  padding: 24px;
}

.ambient-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(140px);
  opacity: 0.4;
  z-index: 0;
}
.shape-1 {
  width: 500px; height: 500px;
  background: #FECACA; /* Red 200 */
  top: -150px; left: -100px;
  animation: drift 15s infinite alternate ease-in-out;
}
.shape-2 {
  width: 600px; height: 600px;
  background: #FEE2E2; /* Red 100 */
  bottom: -200px; right: -150px;
  animation: drift 20s infinite alternate-reverse ease-in-out;
}
@keyframes drift {
  from { transform: translate(0, 0); }
  to { transform: translate(40px, 40px); }
}

/* --- 2. Main Container --- */
.login-container {
  position: relative;
  z-index: 10;
  display: flex;
  width: 100%;
  max-width: 1100px;
  min-height: 680px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 28px;
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.08);
  overflow: hidden;
}

/* --- 3. Left Column (Branding & Visuals) --- */
.login-left {
  flex: 1;
  background: linear-gradient(145deg, #dc2626 0%, #b91c1c 100%); /* Red gradient */
  padding: 60px 48px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: white;
  position: relative;
  overflow: hidden;
}
.noise-overlay {
  position: absolute;
  inset: 0;
  background: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+') repeat;
  opacity: 0.6;
  mix-blend-mode: overlay;
}
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
}
.orb-top {
  width: 300px; height: 300px;
  background: #fb7185; /* Rose 400 */
  top: -50px; right: -50px;
  opacity: 0.6;
}
.orb-bottom {
  width: 250px; height: 250px;
  background: #b91c1c; /* Red 700 */
  bottom: -50px; left: -50px;
  opacity: 0.8;
}

.logo-container {
  width: 64px; height: 64px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 18px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 32px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}
.brand-title {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin-bottom: 16px;
  position: relative; z-index: 2;
}
.brand-subtitle {
  font-size: 1.1rem;
  color: #FCCFCF; /* Light red */
  font-weight: 400;
  position: relative; z-index: 2;
  line-height: 1.6;
}

/* Glassmorphism Focal Point */
.visual-focal-point {
  position: relative;
  z-index: 5;
  margin-top: 40px;
}
.glass-widget {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.4);
  border-left: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  padding: 24px;
  width: 80%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}
.widget-header {
  display: flex; align-items: center; gap: 12px; margin-bottom: 16px;
}
.widget-icon {
  width: 32px; height: 32px; background: white; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}
.widget-title { font-size: 0.9rem; font-weight: 500; color: rgba(255,255,255,0.9); }
.widget-body { display: flex; align-items: flex-end; justify-content: space-between; }
.widget-value { font-size: 2.2rem; font-weight: 800; }
.widget-chart { display: flex; gap: 6px; align-items: flex-end; height: 40px; }
.bar { width: 8px; background: rgba(255,255,255,0.8); border-radius: 4px; }
.bar-1 { height: 40%; animation: grow 2s ease-out forwards; }
.bar-2 { height: 60%; animation: grow 2s ease-out 0.2s forwards; }
.bar-3 { height: 30%; animation: grow 2s ease-out 0.4s forwards; }
.bar-4 { height: 100%; background: #FFFFFF; box-shadow: 0 0 10px rgba(255,255,255,0.5); animation: grow 2s ease-out 0.6s forwards; }

@keyframes grow {
  from { transform: scaleY(0); transform-origin: bottom; }
  to { transform: scaleY(1); transform-origin: bottom; }
}
.animate-float {
  animation: floatWidget 6s ease-in-out infinite;
}
@keyframes floatWidget {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(1deg); }
}

/* --- 4. Right Column (Form Area) --- */
.login-right {
  flex: 1.15;
  padding: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FFFFFF;
}
.form-wrapper {
  width: 100%;
  max-width: 400px;
}
.form-title {
  font-size: 2rem;
  font-weight: 800;
  color: #0F172A; /* Dark Slate */
  letter-spacing: -0.02em;
  margin-bottom: 8px;
}
.form-subtitle {
  font-size: 1rem;
  color: #64748B; /* Slate 500 */
  font-weight: 400;
}

/* --- 5. Inputs --- */
.custom-input-group {
  position: relative;
}
.custom-input {
  width: 100%;
  height: 60px;
  padding: 0 52px;
  background-color: #F8FAFC;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 500;
  color: #0F172A;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.custom-input:hover {
  background-color: #F1F5F9;
  border-color: #CBD5E1;
}
.custom-input:focus {
  outline: none;
  background-color: #FFFFFF;
  border-color: #dc2626; /* Red focus */
  box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.15); /* Red glow */
}
.floating-label {
  position: absolute;
  left: 52px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1rem;
  color: #64748B;
  pointer-events: none;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  background: transparent;
}
.custom-input:focus ~ .floating-label,
.custom-input:not(:placeholder-shown) ~ .floating-label {
  top: 0;
  left: 44px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #dc2626; /* Red focus */
  padding: 0 6px;
  background: linear-gradient(to bottom, #FFFFFF 50%, #F8FAFC 50%); /* Match bg */
}
.custom-input:not(:focus):not(:placeholder-shown) ~ .floating-label {
  color: #64748B;
}

.input-icon {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #94A3B8;
  transition: color 0.3s ease;
}
.custom-input:focus ~ .input-icon {
  color: #dc2626;
}
.eye-btn {
  position: absolute !important;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #94A3B8 !important;
}
.eye-btn:hover { color: #dc2626 !important; }

/* --- 6. Button Cao cấp 3D --- */
.btn-3d-submit {
  position: relative;
  width: 100%;
  height: 60px;
  background: linear-gradient(to right, #dc2626, #b91c1c); /* Red gradient */
  color: white;
  font-size: 1.05rem;
  font-weight: 700;
  border-radius: 16px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 10px 25px -5px rgba(220, 38, 38, 0.4), 
              inset 0 2px 2px rgba(255, 255, 255, 0.2),
              inset 0 -2px 2px rgba(0, 0, 0, 0.2);
}
.btn-3d-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px -5px rgba(220, 38, 38, 0.5), 
              inset 0 2px 2px rgba(255, 255, 255, 0.3),
              inset 0 -2px 2px rgba(0, 0, 0, 0.2);
}
.btn-3d-submit:active:not(:disabled) {
  transform: translateY(1px);
  box-shadow: 0 5px 10px -5px rgba(220, 38, 38, 0.4), 
              inset 0 2px 4px rgba(0, 0, 0, 0.3);
}
.btn-3d-submit:disabled {
  opacity: 0.7; cursor: not-allowed;
}

.btn-arrow {
  transition: transform 0.3s ease;
}
.btn-3d-submit:hover .btn-arrow {
  transform: translateX(4px);
}

.btn-shine {
  position: absolute;
  top: 0; left: -100%;
  width: 50%; height: 100%;
  background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
  transform: skewX(-25deg);
  animation: shine 4s infinite 2s;
}
@keyframes shine {
  0% { left: -100%; }
  20% { left: 200%; }
  100% { left: 200%; }
}

/* --- 7. Minor Details --- */
.forgot-link {
  font-size: 0.9rem;
  color: #dc2626;
  text-decoration: none;
  font-weight: 600;
  position: relative;
}
.forgot-link::after {
  content: '';
  position: absolute; width: 0; height: 2px;
  bottom: -2px; left: 0;
  background-color: #dc2626;
  transition: width 0.3s ease;
}
.forgot-link:hover::after { width: 100%; }

:deep(.custom-checkbox .v-label) {
  font-size: 0.95rem;
  color: #475569;
  font-weight: 500;
}

.error-alert {
  background: #FEF2F2;
  border: 1px solid #FCA5A5;
  color: #DC2626;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
}

.form-footer {
  text-align: center;
  margin-top: 48px;
  font-size: 0.85rem;
  color: #94A3B8;
  font-weight: 500;
}

/* --- 8. Micro-animations --- */
.animate-scale-up { animation: scaleUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.96) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.animate-fade-in-stagger-1 { animation: fadeStagger 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards; opacity: 0; }
.animate-fade-in-stagger-2 { animation: fadeStagger 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards; opacity: 0; }
.animate-fade-in-stagger-3 { animation: fadeStagger 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards; opacity: 0; }
.animate-fade-in-stagger-4 { animation: fadeStagger 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards; opacity: 0; }
.animate-fade-in-stagger-5 { animation: fadeStagger 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.5s forwards; opacity: 0; }

@keyframes fadeStagger {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-shake {
  animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
}
@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}

/* Responsive */
@media (max-width: 960px) {
  .login-left { display: none; }
  .login-container { max-width: 480px; min-height: auto; }
  .login-right { padding: 48px 32px; border-radius: 28px; }
}
</style>