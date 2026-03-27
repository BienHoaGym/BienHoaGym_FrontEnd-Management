<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">
          Xin chào, {{ authStore?.user?.fullName || 'Hội viên' }}! 👋
        </h1>
        <p class="text-subtitle-1 text-grey mt-1">
          {{ formatDate(new Date()) }} — Tổng quan hôm nay
        </p>
      </div>
      <v-btn
        variant="outlined"
        prepend-icon="mdi-refresh"
        :loading="loading"
        @click="loadDashboard"
        color="primary"
      >
        Làm mới
      </v-btn>
    </div>

    <v-row class="mb-4">
      <v-col v-for="(kpi, index) in kpiCards" :key="index" cols="12" sm="6" md="3">
        <v-card hover :to="kpi.to" class="kpi-card h-100" elevation="2">
          <v-card-text class="pa-5 h-100 d-flex flex-column justify-space-between">
            <div class="d-flex justify-space-between align-start mb-2">
              <div>
                <div class="text-subtitle-2 text-medium-emphasis mb-1">{{ kpi.label }}</div>
                <div class="text-h4 font-weight-bold" :class="`text-${kpi.color}`">
                  <template v-if="loading">
                    <v-progress-circular indeterminate :size="24" :width="2" :color="kpi.color" />
                  </template>
                  <template v-else>
                    {{ kpi.isCurrency ? formatCurrency(kpi.value, true) : kpi.value }}
                  </template>
                </div>
              </div>
              <v-avatar :color="kpi.color" variant="tonal" size="48" class="rounded-lg">
                <v-icon :color="kpi.color" size="28">{{ kpi.icon }}</v-icon>
              </v-avatar>
            </div>
            
            <div class="d-flex align-center mt-2">
              <v-icon 
                size="16" 
                :color="kpi.subColor || 'grey'" 
                class="mr-1"
                v-if="kpi.subIcon"
              >
                {{ kpi.subIcon }}
              </v-icon>
              <div class="text-caption font-weight-medium" :class="kpi.subColor || 'text-grey'">
                {{ kpi.sub }}
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="8">
        <v-card class="h-100" elevation="2">
          <v-card-title class="pa-4 d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon class="mr-2 text-primary" size="24">mdi-chart-bar</v-icon>
              <span>Doanh thu 6 tháng</span>
            </div>
            <v-chip size="small" color="primary" variant="tonal">
              Tổng: {{ formatCurrency(stats.revenueTotal, true) }}
            </v-chip>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="pa-4">
            <div v-if="loading" class="d-flex justify-center align-center" style="height: 300px">
              <v-progress-circular indeterminate color="primary" size="50" />
            </div>
            <div v-else class="chart-container pt-8">
              <div v-if="!stats.revenueByMonth?.length" class="text-center w-100 text-grey">
                Chưa có dữ liệu doanh thu
              </div>
              <div 
                v-for="(item, i) in stats.revenueByMonth" 
                :key="i"
                class="chart-bar-wrap d-flex flex-column align-center justify-end"
                style="height: 100%"
              >
                <v-tooltip location="top">
                  <template v-slot:activator="{ props }">
                    <div 
                      v-bind="props"
                      class="chart-bar-group d-flex flex-column align-center w-100"
                    >
                      <div class="text-caption mb-1 font-weight-bold text-primary">
                        {{ item.revenue > 0 ? formatCurrency(item.revenue, true) : '' }}
                      </div>
                      <div 
                        class="chart-bar bg-primary rounded-t-lg w-100"
                        :style="{ height: getBarHeight(item.revenue) + 'px', opacity: 0.8 }"
                      />
                    </div>
                  </template>
                  <span>{{ formatCurrency(item.revenue) }}</span>
                </v-tooltip>
                <div class="text-caption mt-2 text-medium-emphasis font-weight-medium">
                  {{ item.month }}
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="h-100" elevation="2">
          <v-card-title class="pa-4 d-flex align-center">
            <v-icon class="mr-2 text-success" size="24">mdi-door-open</v-icon>
            Check-in hôm nay
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="pa-4 d-flex flex-column align-center justify-center h-75">
            <div class="position-relative d-flex justify-center align-center my-4">
              <v-progress-circular
                :model-value="100"
                :size="180"
                :width="15"
                color="grey-lighten-3"
                class="position-absolute"
              />
              <v-progress-circular
                :model-value="currentlyInGymPercent"
                :size="180"
                :width="15"
                color="success"
                rotate="270"
                linecap="round"
              >
                <div class="text-center">
                  <div class="text-h3 font-weight-bold text-success mb-1">
                    {{ loading ? '-' : stats.currentlyInGym }}
                  </div>
                  <div class="text-body-2 text-medium-emphasis text-uppercase font-weight-bold">
                    Đang tập
                  </div>
                </div>
              </v-progress-circular>
            </div>
            
            <div class="d-flex w-100 mt-6 justify-space-around">
               <div class="text-center">
                 <div class="text-h6 font-weight-bold">{{ stats.checkInsToday }}</div>
                 <div class="text-caption text-grey">Tổng lượt vào</div>
               </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-card elevation="2" class="h-100">
          <v-card-title class="pa-4 d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon class="mr-2 text-warning">mdi-clock-alert</v-icon>
              Sắp hết hạn (≤ 7 ngày)
            </div>
            <v-chip v-if="!loading" color="warning" size="small" variant="flat" class="font-weight-bold">
              {{ stats.expiringSoonList?.length || 0 }}
            </v-chip>
          </v-card-title>
          <v-divider></v-divider>
          
          <div v-if="loading" class="d-flex justify-center pa-8">
            <v-progress-circular indeterminate color="warning" />
          </div>
          
          <v-list v-else-if="stats.expiringSoonList?.length" lines="two" class="pa-2">
            <template v-for="(item, i) in stats.expiringSoonList.slice(0, 5)" :key="item.id">
              <v-list-item rounded="lg" class="mb-1">
                <template #prepend>
                  <v-avatar color="warning" variant="tonal" size="40" class="mr-3">
                    <span class="text-h6 font-weight-bold">{{ getInitials(item.memberName) }}</span>
                  </v-avatar>
                </template>
                
                <v-list-item-title class="font-weight-bold">
                  {{ item.memberName }}
                  <span class="text-caption text-grey ms-2">({{ item.memberCode }})</span>
                </v-list-item-title>
                
                <v-list-item-subtitle class="mt-1">
                  {{ item.packageName }}
                </v-list-item-subtitle>
                
                <template #append>
                  <div class="text-right">
                    <v-chip 
                      :color="item.daysLeft <= 3 ? 'error' : 'warning'" 
                      size="small" 
                      variant="flat"
                      class="mb-1"
                    >
                      Còn {{ item.daysLeft }} ngày
                    </v-chip>
                    <div class="text-caption text-grey">
                      {{ formatShortDate(item.endDate) }}
                    </div>
                  </div>
                </template>
              </v-list-item>
              <v-divider v-if="i < Math.min(stats.expiringSoonList.length, 5) - 1" inset></v-divider>
            </template>
          </v-list>
          
          <div v-else class="pa-8 text-center text-grey">
            <v-icon size="48" color="grey-lighten-2" class="mb-2">mdi-check-circle-outline</v-icon>
            <div>Không có gói tập nào sắp hết hạn</div>
          </div>
          
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="warning" variant="text" to="/subscriptions">
              Xem tất cả
              <v-icon end>mdi-arrow-right</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card elevation="2" class="h-100">
          <v-card-title class="pa-4 d-flex align-center">
            <v-icon class="mr-2 text-success">mdi-cash-multiple</v-icon>
            Thanh toán gần nhất
          </v-card-title>
          <v-divider></v-divider>
          
          <div v-if="loading" class="d-flex justify-center pa-8">
            <v-progress-circular indeterminate color="success" />
          </div>
          
          <v-list v-else-if="stats.recentPayments?.length" lines="two" class="pa-2">
            <template v-for="(item, i) in stats.recentPayments" :key="item.id">
              <v-list-item rounded="lg" class="mb-1">
                <template #prepend>
                  <v-avatar color="success" variant="tonal" size="40" class="mr-3">
                    <v-icon>mdi-currency-usd</v-icon>
                  </v-avatar>
                </template>
                
                <v-list-item-title class="font-weight-bold">
                  {{ item.memberName }}
                </v-list-item-title>
                
                <v-list-item-subtitle class="mt-1 d-flex align-center">
                  <v-icon size="14" class="mr-1">mdi-package-variant-closed</v-icon>
                  {{ item.packageName }}
                </v-list-item-subtitle>
                
                <template #append>
                  <div class="text-right">
                    <div class="text-success font-weight-black">
                      +{{ formatCurrency(item.amount) }}
                    </div>
                    <div class="text-caption text-grey">
                      {{ formatDateTime(item.paymentDate) }}
                    </div>
                  </div>
                </template>
              </v-list-item>
              <v-divider v-if="i < stats.recentPayments.length - 1" inset></v-divider>
            </template>
          </v-list>
          
          <div v-else class="pa-8 text-center text-grey">
            <v-icon size="48" color="grey-lighten-2" class="mb-2">mdi-cash-remove</v-icon>
            <div>Chưa có giao dịch nào</div>
          </div>
          
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="success" variant="text" to="/billing">
              Xem tất cả
              <v-icon end>mdi-arrow-right</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { dashboardService } from '@/services/dashboardService'
import { useApiErrorHandler } from '@/composables/useApiErrorHandler'

const authStore = useAuthStore()
const { handleError } = useApiErrorHandler()
const loading = ref(false)

const stats = ref({
  totalActiveMembers: 0,
  newMembersThisMonth: 0,
  activeSubscriptions: 0,
  expiringIn7Days: 0,
  expiredSubscriptions: 0,
  checkInsToday: 0,
  currentlyInGym: 0,
  revenueToday: 0,
  revenueThisMonth: 0,
  revenueTotal: 0,
  revenueByMonth: [],
  recentPayments: [],
  expiringSoonList: [],
  prospectiveMembersCount: 0
})

// ── KPI Cards ──
const kpiCards = computed(() => [
  {
    label: 'Hội viên Active',
    value: stats.value.totalActiveMembers, 
    sub: `+${stats.value.newMembersThisMonth} tháng này`,
    icon: 'mdi-account-group',
    color: 'primary',
    subColor: 'text-success',
    subIcon: 'mdi-trending-up',
    to: '/members'
  },
  {
    label: 'Gói tập Active',
    value: stats.value.activeSubscriptions,
    sub: stats.value.expiringIn7Days > 0 
      ? `${stats.value.expiringIn7Days} sắp hết hạn`
      : 'Tất cả ổn định',
    icon: 'mdi-card-account-details',
    color: stats.value.expiringIn7Days > 0 ? 'warning' : 'info',
    subColor: stats.value.expiringIn7Days > 0 ? 'text-warning' : 'text-grey',
    subIcon: stats.value.expiringIn7Days > 0 ? 'mdi-alert-circle' : 'mdi-check-circle',
    to: '/subscriptions'
  },
  {
    label: 'Doanh thu tháng',
    value: stats.value.revenueThisMonth,
    isCurrency: true,
    sub: `Hôm nay: ${formatCurrency(stats.value.revenueToday, true)}`,
    icon: 'mdi-cash-register',
    color: 'success',
    subColor: 'text-success',
    subIcon: 'mdi-calendar-today',
    to: '/billing'
  },
  {
    label: 'Check-in Hôm nay',
    value: stats.value.checkInsToday,
    sub: `${stats.value.currentlyInGym} đang tập`,
    icon: 'mdi-login-variant',
    color: 'deep-purple',
    subColor: 'text-deep-purple',
    subIcon: 'mdi-dumbbell',
    to: '/checkins'
  },
  {
    label: 'Khách tiềm năng',
    value: stats.value.prospectiveMembersCount || 0,
    sub: 'Từ Marketing Web',
    icon: 'mdi-account-star',
    color: 'orange',
    subColor: 'text-orange',
    subIcon: 'mdi-earth',
    to: '/members'
  }
])

// Tính phần trăm vòng tròn check-in
const currentlyInGymPercent = computed(() => {
  if (stats.value.checkInsToday === 0) return 0
  const percent = (stats.value.currentlyInGym / stats.value.checkInsToday) * 100
  return Math.min(Math.round(percent), 100)
})

// ── Chart helpers ──
const maxRevenue = computed(() => {
  const months = stats.value.revenueByMonth || []
  if (months.length === 0) return 1
  
  // SỬA LỖI: Convert sang Number và xử lý mảng rỗng để tránh lỗi Infinity
  const maxVal = Math.max(...months.map(m => Number(m.revenue || 0)))
  return maxVal > 0 ? maxVal : 1
})

function getBarHeight(revenue) {
  const max = maxRevenue.value
  const val = Number(revenue || 0)
  if (max === 0 || val === 0) return 0
  // Cố định chiều cao tối thiểu 4px để hiển thị đẹp
  return Math.max(4, Math.round((val / max) * 200))
}

// ── Format helpers ──
function formatCurrency(amount, short = false) {
  if (amount === null || amount === undefined) return '0 ₫'
  
  if (short) {
    if (amount >= 1_000_000_000) return (amount / 1_000_000_000).toFixed(1) + ' tỷ'
    if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(1) + ' tr'
    if (amount >= 1_000) return (amount / 1_000).toFixed(0) + ' k'
  }
  
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

function formatDate(d) {
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }).format(d)
}

function formatShortDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

function formatDateTime(d) {
   if (!d) return ''
   return new Date(d).toLocaleTimeString('vi-VN', { hour: '2-digit', minute:'2-digit' }) + ' ' + 
          new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

function getInitials(name) {
  if (!name) return ''
  const parts = name.split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[parts.length - 2].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

// ── Load data ──
async function loadDashboard() {
  loading.value = true
  try {
    const res = await dashboardService.getStats()
    if (res?.success || res?.Success) { 
       const data = res.data || res.Data
       if (data) {
         stats.value = data
       }
    }
  } catch (e) {
    console.error('Dashboard load error:', e)
    // Tự động gọi AI chẩn đoán lỗi nếu load thất bại
    handleError(e, { url: '/api/dashboard/stats' })
  } finally {
    loading.value = false
  }
}

onMounted(loadDashboard)
</script>

<style scoped>
.kpi-card {
  transition: all .2s ease-in-out;
  border-radius: 12px;
}
.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 25px 0 rgba(0, 0, 0, 0.1) !important;
}
.chart-container {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 300px;
  gap: 8px;
}
.chart-bar-wrap {
  flex: 1;
  min-width: 0;
  cursor: pointer;
  transition: opacity 0.2s;
}
.chart-bar-wrap:hover {
  opacity: 0.8;
}
.chart-bar {
  transition: height 1s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 4px;
  width: 100%;
}
</style>