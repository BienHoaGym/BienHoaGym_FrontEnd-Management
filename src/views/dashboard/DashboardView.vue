<template>
  <div class="dashboard-wrapper pa-4 pa-md-6">
    <!-- ── TOP BAR: Control & Quick Actions ── -->
    <div class="d-flex flex-column flex-md-row align-md-center justify-space-between mb-6 gap-4">
      <div>
        <h1 class="text-h4 font-weight-black text-primary-gradient glow-text mb-1">
          Bảng điều khiển <span class="text-grey-darken-1 font-weight-medium text-subtitle-1">v3.1 PRO</span>
        </h1>
        <div class="d-flex align-center text-grey-darken-1">
          <v-chip size="x-small" color="success" variant="flat" class="mr-2 font-weight-black px-2 shadow-sm">REAL-TIME</v-chip>
          <span class="text-subtitle-2 font-weight-bold ml-1">
            <v-icon size="14" color="primary" class="mr-1 mt-n1">mdi-timer-sand</v-icon>
            {{ currentTime }}
          </span>
          <v-divider vertical class="mx-3 my-1" />
          <span class="text-caption font-weight-medium">Cập nhật: {{ lastUpdated }}</span>
        </div>
      </div>
      
      <div class="d-flex flex-wrap align-center gap-3">
        <v-btn-group variant="flat" color="primary" rounded="lg" density="comfortable" class="quick-action-group shadow-sm border overflow-hidden">
          <v-btn prepend-icon="mdi-account-plus" class="px-4 font-weight-black" to="/members?action=add">Hội viên</v-btn>
          <v-btn prepend-icon="mdi-cash-register" class="px-4 font-weight-black" to="/billing?tab=history">Giao dịch</v-btn>
          <v-btn icon="mdi-qrcode-scan" variant="tonal" color="white" to="/checkins" class="px-3"></v-btn>
        </v-btn-group>
        
        <v-btn icon="mdi-refresh" variant="elevated" size="small" color="white" class="shadow-sm border" :loading="loading" @click="loadDashboard"></v-btn>
      </div>
    </div>

    <!-- ── AI INSIGHTS BAR (2.6) ── -->
    <v-expand-transition>
      <div v-if="stats.insights && stats.insights.length" class="insight-ticker mb-6 py-2 px-4 shadow-sm border rounded-xl d-flex align-center bg-white">
        <v-chip size="small" color="primary" class="mr-4 font-weight-black" variant="elevated">
          <v-icon start size="14">mdi-auto-fix</v-icon> ANALYTICS INSIGHTS
        </v-chip>
        <div class="ticker-wrapper">
          <div class="ticker-content">
            <span v-for="(insight, i) in stats.insights" :key="i" class="insight-item">
              <v-icon size="14" color="primary" class="mr-1">mdi-brightness-1</v-icon>
              {{ insight }}
            </span>
            <span v-for="(insight, i) in stats.insights" :key="'dup-'+i" class="insight-item">
              <v-icon size="14" color="primary" class="mr-1">mdi-brightness-1</v-icon>
              {{ insight }}
            </span>
          </div>
        </div>
      </div>
    </v-expand-transition>

    <!-- ── ROW 1: MISSION CRITICAL KPIs (2.1 - 6 CARDS) ── -->
    <v-row class="mb-6">
      <v-col v-for="(kpi, index) in kpiInsights" :key="index" cols="12" sm="4" lg="2">
        <v-card class="kpi-card-v3" elevation="0" :class="{ 'urgent-card': kpi.isAlert && kpi.value > 0 }">
          <v-card-text class="pa-4">
            <div class="d-flex justify-space-between align-start mb-2">
              <div class="text-tiny font-weight-black text-grey text-uppercase">{{ kpi.label }}</div>
              <v-icon :color="kpi.color" size="18">{{ kpi.icon }}</v-icon>
            </div>
            
            <h2 class="text-h4 font-weight-black tracking-tight mb-2">
              {{ kpi.isCurrency ? formatCurrency(kpi.value, true) : kpi.value }}
            </h2>
            
            <div v-if="kpi.trend !== undefined" class="d-flex align-center gap-1">
               <template v-if="kpi.trend !== 0">
                 <div class="trend-badge-mini" :class="kpi.trend > 0 ? (kpi.inverseTrend ? 'minus' : 'plus') : (kpi.inverseTrend ? 'plus' : 'minus')">
                   {{ Math.abs(kpi.trend) }}%
                 </div>
               </template>
               <span class="text-tiny font-weight-bold text-grey-darken-1 text-truncate">{{ kpi.detail }}</span>
            </div>
            <div v-else class="text-tiny font-weight-bold text-grey-lighten-1">Đang hoạt động</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- ── ROW 2: PRIMARY ANALYTICS (2.2) ── -->
    <v-row class="mb-6">
      <!-- Revenue Trend -->
      <v-col cols="12" lg="7">
        <v-card class="insight-card-flat h-100 pa-6" elevation="0">
          <div class="d-flex justify-space-between align-center mb-4">
            <div>
              <div class="text-subtitle-1 font-weight-black">Doanh thu & Mục tiêu</div>
              <div class="text-caption text-grey font-weight-bold">Tiến độ tháng: <span class="text-success">{{ stats.revenueProgress }}%</span></div>
            </div>
            <div class="text-right">
              <div class="text-h6 font-weight-black text-primary">{{ formatCurrency(stats.revenueMonth) }}</div>
              <v-progress-linear :model-value="stats.revenueProgress" color="success" height="6" rounded class="mt-1" style="width: 100px"></v-progress-linear>
            </div>
          </div>
          <apexchart 
            v-if="stats.revenueByMonth?.length"
            type="area" 
            height="280" 
            :options="revenueChartOptions" 
            :series="revenueSeries"
          />
        </v-card>
      </v-col>

      <!-- Check-in Traffic -->
      <v-col cols="12" lg="5">
        <v-card class="insight-card-flat h-100 pa-6" elevation="0">
           <div class="text-subtitle-1 font-weight-black mb-4">Lượt khách 7 ngày qua</div>
           <apexchart 
            v-if="stats.checkinChartData?.length"
            type="bar" 
            height="280" 
            :options="checkinChartOptions" 
            :series="checkinSeries"
          />
        </v-card>
      </v-col>
    </v-row>

    <!-- ── ROW 3: CAPACITY & DISTRIBUTION ── -->
    <v-row class="mb-6">
      <!-- Gym Occupancy -->
      <v-col cols="12" lg="4">
        <v-card class="insight-card-flat h-100 pa-6 overflow-hidden" elevation="0">
           <div class="d-flex justify-space-between mb-4">
              <div class="text-subtitle-1 font-weight-black">Tải trọng phòng Gym</div>
              <v-chip :color="capacityStatus.color" size="x-small" label class="font-weight-black">{{ capacityStatus.text }}</v-chip>
           </div>
           
           <div class="text-center py-4">
              <v-progress-circular
                :model-value="stats.occupancy?.percentage || 0"
                :size="160"
                :width="12"
                :color="capacityStatus.color"
                rotate="270"
                linecap="round"
              >
                <div class="text-center">
                  <div class="text-h4 font-weight-black">{{ Math.round(stats.occupancy?.percentage || 0) }}%</div>
                  <div class="text-tiny font-weight-bold text-grey">Live</div>
                </div>
              </v-progress-circular>
           </div>

           <v-divider class="my-4 border-dashed" />
           <div class="d-flex justify-space-between align-center">
             <span class="text-caption font-weight-bold text-grey">Giờ cao điểm (Dự kiến)</span>
             <span class="text-caption font-weight-black text-primary">{{ stats.occupancy?.peakHour }}</span>
           </div>
        </v-card>
      </v-col>

      <!-- Package mix -->
      <v-col cols="12" lg="4">
        <v-card class="insight-card-flat h-100 pa-6" elevation="0">
           <div class="text-subtitle-1 font-weight-black mb-4">Phân loại gói tập</div>
           <apexchart 
            v-if="stats.revenueByPackage?.length"
            type="donut" 
            height="240" 
            :options="packageChartOptions" 
            :series="packageSeries"
          />
        </v-card>
      </v-col>

      <!-- Operations summary -->
      <v-col cols="12" lg="4">
        <v-card class="insight-card-flat h-100 pa-6" elevation="0">
           <div class="text-subtitle-1 font-weight-black mb-4">Vận hành hôm nay</div>
           <div class="d-flex flex-column gap-3">
              <div class="op-item-white shadow-sm pa-3 rounded-lg border d-flex align-center">
                 <v-avatar size="32" color="error" variant="tonal" class="mr-3"><v-icon size="16">mdi-hammer-wrench</v-icon></v-avatar>
                 <div>
                    <div class="text-tiny font-weight-bold text-grey">Thiết bị lỗi</div>
                    <div class="text-body-2 font-weight-black text-error">{{ stats.equipmentHealth?.broken }} máy cần sửa</div>
                 </div>
                 <v-spacer />
                 <v-btn icon="mdi-chevron-right" variant="text" size="small" to="/equipment"></v-btn>
              </div>
              <div class="op-item-white shadow-sm pa-3 rounded-lg border d-flex align-center">
                 <v-avatar size="32" color="primary" variant="tonal" class="mr-3"><v-icon size="16">mdi-account-tie-voice</v-icon></v-avatar>
                 <div>
                    <div class="text-tiny font-weight-bold text-grey">PT Hoạt động</div>
                    <div class="text-body-2 font-weight-black">{{ stats.activeTrainersCount?.value }} đang dạy</div>
                 </div>
              </div>
              <div class="op-item-white shadow-sm pa-3 rounded-lg border d-flex align-center">
                 <v-avatar size="32" color="success" variant="tonal" class="mr-3"><v-icon size="16">mdi-lead-pencil</v-icon></v-avatar>
                 <div>
                    <div class="text-tiny font-weight-bold text-grey">Tiềm năng mới</div>
                    <div class="text-body-2 font-weight-black">{{ stats.prospectiveLeads }} contacts</div>
                 </div>
              </div>
           </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- ── ROW 4: QUICK VIEW TABLES (2.3 & 2.5) ── -->
    <v-row>
      <!-- Member management (Quick views) -->
      <v-col cols="12" lg="8">
        <v-card class="insight-card-flat" elevation="0">
          <v-tabs v-model="memberTab" color="primary" density="comfortable">
            <v-tab value="expiring" class="text-caption font-weight-black">Sắp hết hạn ({{ stats.expiringSoonList?.length }})</v-tab>
            <v-tab value="new" class="text-caption font-weight-black">Hội viên mới</v-tab>
          </v-tabs>
          <v-divider />
          <v-window v-model="memberTab">
            <v-window-item value="expiring">
              <v-table density="comfortable" class="action-table-v3">
                <thead>
                  <tr class="bg-grey-lighten-5">
                    <th class="text-tiny font-weight-black">HỘI VIÊN</th>
                    <th class="text-tiny font-weight-black">GÓI TẬP</th>
                    <th class="text-tiny font-weight-black">HẾT HẠN</th>
                    <th class="text-right text-tiny font-weight-black">HÀNH ĐỘNG</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in stats.expiringSoonList?.slice(0, 5)" :key="item.id">
                    <td>
                      <div class="d-flex align-center">
                        <v-avatar size="28" color="primary" variant="tonal" class="mr-2 text-tiny font-weight-bold">{{ getInitials(item.memberName) }}</v-avatar>
                        <div class="text-caption font-weight-black">{{ item.memberName }}</div>
                      </div>
                    </td>
                    <td class="text-caption">{{ item.packageName }}</td>
                    <td class="text-caption" :class="item.daysLeft <= 3 ? 'text-error font-weight-bold' : ''">{{ item.daysLeft }} ngày</td>
                    <td class="text-right">
                       <v-btn icon="mdi-phone" size="x-small" color="success" variant="tonal" :href="'tel:'+item.phoneNumber" class="mr-2 rounded-lg"></v-btn>
                       <v-btn size="x-small" color="primary" class="font-weight-black px-3 rounded-lg" @click="$router.push('/billing?memberCode='+item.memberCode)">Gia hạn</v-btn>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-window-item>
            <v-window-item value="new">
              <v-table density="comfortable" class="action-table-v3">
                <thead>
                  <tr class="bg-grey-lighten-5">
                    <th class="text-tiny font-weight-black">HỘI VIÊN</th>
                    <th class="text-tiny font-weight-black">MÃ HV</th>
                    <th class="text-tiny font-weight-black">NGÀY THAM GIA</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in stats.newMembersList" :key="item.id">
                    <td class="text-caption font-weight-black">{{ item.fullName }}</td>
                    <td><v-chip size="x-small" label>{{ item.memberCode }}</v-chip></td>
                    <td class="text-caption">{{ formatShortDate(item.joinedDate) }}</td>
                  </tr>
                </tbody>
              </v-table>
            </v-window-item>
          </v-window>
        </v-card>
      </v-col>

      <!-- Today's Classes -->
      <v-col cols="12" lg="4">
        <v-card class="insight-card-flat h-100" elevation="0">
           <div class="pa-4 font-weight-black border-b d-flex align-center">
             <v-icon start size="18" color="primary">mdi-calendar-clock</v-icon>
             Lớp học & Hoạt động hôm nay
           </div>
           <v-list density="compact" class="pa-2">
              <v-list-item v-for="c in stats.classesToday" :key="c.id" class="rounded-lg mb-2 border">
                 <template #prepend>
                   <div class="text-caption font-weight-black text-primary mr-3">{{ c.time }}</div>
                 </template>
                 <v-list-item-title class="text-caption font-weight-black">{{ c.name }}</v-list-item-title>
                 <v-list-item-subtitle class="text-tiny">{{ c.trainerName }} • {{ c.enrolled }}/{{ c.capacity }}</v-list-item-subtitle>
                 <template #append>
                    <v-chip size="x-small" :color="c.status === 'Upcoming' ? 'info' : 'success'" class="font-weight-bold">{{ c.status }}</v-chip>
                 </template>
              </v-list-item>
              <div v-if="!stats.classesToday?.length" class="text-center py-8 text-grey text-caption opacity-60">
                 Không có lớp học nào được đặt hôm nay.
              </div>
           </v-list>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { dashboardService } from '@/services/dashboardService'
import { useApiErrorHandler } from '@/composables/useApiErrorHandler'

const { handleError } = useApiErrorHandler()
const loading = ref(true)
const currentTime = ref(new Date().toLocaleTimeString('vi-VN'))
const lastUpdated = ref(new Date().toLocaleTimeString('vi-VN'))
const memberTab = ref('expiring')
let clockInterval = null
let refreshInterval = null

const stats = ref({
  insights: [],
  revenueToday: { value: 0, trend: 0 },
  checkInsToday: { value: 0, trend: 0 },
  activeMembers: { value: 0, trend: 0 },
  expiringSubscriptionsCount: { value: 0 },
  activeTrainersCount: { value: 0 },
  equipmentAlertCount: { value: 0 },
  occupancy: { current: 0, max: 100, percentage: 0, peakHour: '' },
  revenueMonth: 0,
  revenueTarget: 0,
  revenueProgress: 0,
  revenueByMonth: [],
  checkinChartData: [],
  revenueByPackage: [],
  expiringSoonList: [],
  newMembersList: [],
  classesToday: [],
  equipmentHealth: { broken: 0 }
})

// ── KPI Logic (2.1) ──
const kpiInsights = computed(() => [
  {
    label: 'Doanh thu hôm nay',
    value: stats.value.revenueToday?.value || 0,
    trend: stats.value.revenueToday?.trend || 0,
    detail: 'vs Hôm qua',
    isCurrency: true,
    icon: 'mdi-currency-usd',
    color: 'success'
  },
  {
    label: 'Lượt Check-in',
    value: stats.value.checkInsToday?.value || 0,
    trend: stats.value.checkInsToday?.trend || 0,
    detail: 'vs Hôm qua',
    icon: 'mdi-login-variant',
    color: 'primary'
  },
  {
    label: 'Tổng Hội viên',
    value: stats.value.activeMembers?.value || 0,
    trend: stats.value.activeMembers?.trend || 0,
    detail: 'Tăng trưởng',
    icon: 'mdi-account-group',
    color: 'info'
  },
  {
    label: 'Sắp hết hạn',
    value: stats.value.expiringSubscriptionsCount?.value || 0,
    icon: 'mdi-timer-alert',
    color: 'warning',
    isAlert: (stats.value.expiringSubscriptionsCount?.value > 0)
  },
  {
    label: 'PT Đang dạy',
    value: stats.value.activeTrainersCount?.value || 0,
    icon: 'mdi-account-tie-voice',
    color: 'deep-purple'
  },
  {
    label: 'Thiết bị lỗi',
    value: stats.value.equipmentAlertCount?.value || 0,
    icon: 'mdi-hammer-wrench',
    color: 'error',
    isAlert: (stats.value.equipmentAlertCount?.value > 0)
  }
])

// ── Capacity Display (2.2) ──
const capacityStatus = computed(() => {
  const p = stats.value.occupancy?.percentage || 0
  if (p > 80) return { text: 'QUÁ TẢI', color: 'error' }
  if (p > 50) return { text: 'BÌNH THƯỜNG', color: 'warning' }
  return { text: 'AN TOÀN', color: 'success' }
})

// ── Charts (2.2) ──
const revenueSeries = computed(() => [{ name: 'Doanh thu', data: stats.value.revenueByMonth?.map(m => m.revenue) || [] }])
const revenueChartOptions = computed(() => ({
  chart: { toolbar: { show: false }, background: 'transparent' },
  stroke: { curve: 'smooth', width: 3, colors: ['#EF5350'] },
  xaxis: { categories: stats.value.revenueByMonth?.map(m => m.month) || [] },
  fill: { type: 'gradient', gradient: { opacityFrom: 0.1, opacityTo: 0 } },
  dataLabels: { enabled: false },
  grid: { show: false }
}))

const checkinSeries = computed(() => [{ name: 'Check-ins', data: stats.value.checkinChartData?.map(d => d.count) || [] }])
const checkinChartOptions = computed(() => ({
  chart: { toolbar: { show: false } },
  plotOptions: { bar: { borderRadius: 4, columnWidth: '60%' } },
  colors: ['#42A5F5'],
  xaxis: { categories: stats.value.checkinChartData?.map(d => d.date) || [] },
  grid: { show: false },
  dataLabels: { enabled: false }
}))

const packageSeries = computed(() => stats.value.revenueByPackage?.map(p => p.value) || [])
const packageChartOptions = computed(() => ({
  labels: stats.value.revenueByPackage?.map(p => p.category) || [],
  legend: { position: 'bottom', fontSize: '10px' },
  stroke: { width: 0 },
  plotOptions: { pie: { donut: { size: '70%', labels: { show: true, total: { show: true, label: 'Doanh thu', formatter: (w) => formatCurrency(w.globals.seriesTotals.reduce((a,b)=>a+b, 0), true) } } } } },
  colors: ['#FF7043', '#26A69A', '#66BB6A', '#FFA726', '#AB47BC']
}))

// ── Helpers ──
function formatCurrency(v, short = false) {
  if (!v) return '0 ₫'
  if (short) {
    if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + ' tr'
    if (v >= 1_000) return (v / 1_000).toFixed(0) + ' k'
  }
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)
}
function formatShortDate(d) { return d ? new Date(d).toLocaleDateString('vi-VN') : '' }
function getInitials(name) {
  if (!name) return '?'
  const p = name.trim().split(' ')
  return p.length === 1 ? p[0].charAt(0).toUpperCase() : (p[p.length-2].charAt(0) + p[p.length-1].charAt(0)).toUpperCase()
}

// ── Data Loading ──
async function loadDashboard() {
  loading.value = true
  try {
    const res = await dashboardService.getStats()
    if (res?.success || res?.Success) {
      stats.value = res.data || res.Data
      lastUpdated.value = new Date().toLocaleTimeString('vi-VN')
    }
  } catch (e) { 
    handleError(e) 
  } finally { 
    loading.value = false 
  }
}

onMounted(() => {
  loadDashboard()
  
  // Đồng hồ chạy từng giây
  clockInterval = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString('vi-VN')
  }, 1000)

  // Tự động làm mới dữ liệu mỗi 30 giây
  refreshInterval = setInterval(() => {
    loadDashboard()
  }, 30000)
})

onUnmounted(() => {
  if (clockInterval) clearInterval(clockInterval)
  if (refreshInterval) clearInterval(refreshInterval)
})
</script>

<style scoped>
.dashboard-wrapper { background-color: #f4f7fa; min-height: 100vh; font-family: 'Inter', sans-serif; }
.text-primary-gradient { background: linear-gradient(135deg, #1A237E 0%, #B71C1C 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.glow-text { text-shadow: 0 4px 10px rgba(0,0,0,0.03); }
.insight-card-flat { border-radius: 16px; background: #fff; border: 1px solid #eef2f6; box-shadow: 0 8px 24px rgba(0,0,0,0.02); }
.kpi-card-v3 { border-radius: 16px; background: #fff; border: 1px solid #eef2f6; transition: transform 0.2s; }
.kpi-card-v3:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0,0,0,0.04); }
.urgent-card { background: #FFF5F5 !important; border-color: #FEB2B2 !important; animation: pulse-error 2s infinite; }
@keyframes pulse-error { 0% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.2); } 70% { box-shadow: 0 0 0 8px rgba(244, 67, 54, 0); } 100% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0); } }
.text-tiny { font-size: 10px; }
.trend-badge-mini { font-size: 9px; font-weight: 900; padding: 1px 4px; border-radius: 4px; }
.trend-badge-mini.plus { background: #E8F5E9; color: #2E7D32; }
.trend-badge-mini.minus { background: #FFEBEE; color: #C62828; }
.insight-ticker { background: #fff; overflow: hidden; }
.ticker-wrapper { flex: 1; overflow: hidden; }
.ticker-content { display: inline-block; white-space: nowrap; animation: ticker 40s linear infinite; }
.insight-item { display: inline-block; font-weight: bold; font-size: 12px; margin-right: 40px; color: #546E7A; }
@keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
.border-dashed { border-style: dashed !important; }
.action-table-v3 th { padding: 12px !important; font-size: 10px !important; color: #94A3B8 !important; }
</style>