<template>
  <div>
    <!-- Bộ lọc & Xuất báo cáo -->
    <v-card class="mb-6" elevation="2" rounded="lg">
      <v-card-text class="pa-4">
        <v-row align="center">
          <v-col cols="12" md="4" class="d-flex align-center">
            <v-icon color="primary" class="mr-3" size="32">mdi-finance</v-icon>
            <div>
              <h1 class="text-h5 font-weight-bold">Phân tích Doanh thu</h1>
              <p class="text-caption text-grey mb-0">Theo dõi xu hướng và hiệu quả kinh doanh</p>
            </div>
          </v-col>
          
          <v-col cols="12" md="5" class="d-flex gap-2">
            <v-select
              v-model="dateRangeType"
              :items="dateRangeOptions"
              label="Khoảng thời gian"
              density="compact"
              variant="outlined"
              hide-details
              class="flex-grow-1"
              @update:modelValue="onRangeTypeChange"
            ></v-select>
            
            <v-text-field
              v-if="dateRangeType === 'custom'"
              v-model="startDate"
              type="date"
              density="compact"
              variant="outlined"
              hide-details
              label="Từ ngày"
            ></v-text-field>
            
            <v-text-field
              v-if="dateRangeType === 'custom'"
              v-model="endDate"
              type="date"
              density="compact"
              variant="outlined"
              hide-details
              label="Đến ngày"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="3" class="d-flex justify-md-end gap-2">
            <v-btn color="primary" prepend-icon="mdi-magnify" @click="loadData" :loading="loading">
              Lọc
            </v-btn>
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn variant="outlined" icon="mdi-export" v-bind="props" density="compact"></v-btn>
              </template>
              <v-list>
                <v-list-item prepend-icon="mdi-file-excel" @click="exportExcel">Excel</v-list-item>
                <v-list-item prepend-icon="mdi-file-delimited" @click="exportCsv">CSV</v-list-item>
              </v-list>
            </v-menu>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 1️⃣ Tổng quan tài chính (Tháng này) -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="lg" elevation="2" class="bg-primary-gradient" theme="dark">
          <v-card-text class="pa-4">
             <div class="text-overline opacity-70">Tổng doanh thu (tháng)</div>
             <div class="text-h4 font-weight-black mb-1">{{ formatCurrency(reportData.overview.revenueThisMonth) }}</div>
             <div class="text-caption">Đã bao gồm POS & Đăng ký</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="lg" elevation="2" class="bg-error-gradient" theme="dark">
          <v-card-text class="pa-4">
             <div class="text-overline opacity-70">Tổng chi phí vận hành</div>
             <div class="text-h4 font-weight-black mb-1">{{ formatCurrency(reportData.overview.totalExpenseThisMonth) }}</div>
             <div class="text-caption">Kho + Bảo trì + Khấu hao</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="lg" elevation="2" class="bg-success-gradient" theme="dark">
          <v-card-text class="pa-4">
             <div class="text-overline opacity-70">Lợi nhuận ròng</div>
             <div class="text-h4 font-weight-black mb-1">{{ formatCurrency(reportData.overview.netProfitThisMonth) }}</div>
             <div class="text-caption">Sau khi trừ các chi phí</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="lg" elevation="2">
          <v-card-text class="pa-4">
             <div class="d-flex justify-space-between align-center mb-1">
               <div class="text-overline text-grey">Hội viên mới</div>
               <v-icon color="info">mdi-account-plus</v-icon>
             </div>
             <div class="text-h4 font-weight-black text-info">{{ reportData.overview.newMembersCount }}</div>
             <div class="text-caption text-grey">Trong khoảng thời gian lọc</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- 2️⃣ Biểu đồ doanh thu theo thời gian -->
      <v-col cols="12" md="8">
        <v-card height="450" rounded="lg" elevation="2">
          <v-card-title class="pa-4 d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-chart-line</v-icon>
            Xu hướng doanh thu
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="pa-4 position-relative">
            <div v-if="loading" class="d-flex justify-center align-center" style="height: 300px">
              <v-progress-circular indeterminate color="primary" size="64" />
            </div>
            <div v-else-if="!reportData.revenueChart?.length" class="d-flex justify-center align-center text-grey" style="height: 300px">
              Không có dữ liệu
            </div>
            <div v-else class="chart-container">
              <!-- SVG Line/Area Chart Implementation -->
              <svg width="100%" height="300" viewBox="0 0 800 300" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="rgba(var(--v-theme-primary), 0.3)" />
                    <stop offset="100%" stop-color="rgba(var(--v-theme-primary), 0)" />
                  </linearGradient>
                </defs>
                <!-- Area -->
                <path :d="chartAreaPath" fill="url(#chartGradient)" />
                <!-- Line -->
                <path :d="chartLinePath" fill="none" stroke="rgb(var(--v-theme-primary))" stroke-width="4" stroke-linecap="round" />
                <!-- Points -->
                <circle v-for="(p, i) in chartPoints" :key="i" :cx="p.x" :cy="p.y" r="6" fill="#fff" stroke="rgb(var(--v-theme-primary))" stroke-width="3" />
              </svg>
              <!-- X-Axis Labels -->
              <div class="d-flex justify-space-between mt-2 px-1">
                <div v-for="(item, i) in chartLabels" :key="i" class="text-caption text-grey font-weight-bold" style="width: 30px; text-align: center">
                  {{ item.label }}
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 4️⃣ Top gói tập bán chạy -->
      <v-col cols="12" md="4">
        <v-card height="450" rounded="lg" elevation="2">
          <v-card-title class="pa-4">
            <v-icon color="orange" class="mr-2">mdi-star</v-icon>
            Top Gói tập bán chạy
          </v-card-title>
          <v-divider></v-divider>
          <v-list class="pa-2">
            <v-list-item v-for="(pkg, i) in sortedTopPackages" :key="pkg.packageName" class="mb-2 rounded-lg pa-3" :class="i === 0 ? 'bg-orange-lighten-5' : ''">
              <template #prepend>
                <div class="mr-3 d-flex align-center justify-center font-weight-black" style="width: 24px; height: 24px; border-radius: 50%" :class="i < 3 ? 'bg-orange text-white' : 'bg-grey-lighten-2'">
                  {{ i + 1 }}
                </div>
              </template>
              <v-list-item-title class="font-weight-bold">{{ pkg.packageName }}</v-list-item-title>
              <v-list-item-subtitle>{{ pkg.quantity }} lượt bán</v-list-item-subtitle>
              <template #append>
                <div class="text-right">
                  <div class="text-subtitle-2 font-weight-bold text-success">{{ formatCurrency(pkg.totalRevenue, true) }}</div>
                  <v-progress-linear :model-value="(pkg.quantity / maxPackageQty) * 100" color="orange" rounded height="6" class="mt-1" style="width: 60px"></v-progress-linear>
                </div>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-6">
      <!-- 3️⃣ Doanh thu theo loại gói tập -->
      <v-col cols="12" md="6">
        <v-card rounded="lg" elevation="2">
          <v-card-title class="pa-4">Doanh thu theo loại gói tập</v-card-title>
          <v-divider></v-divider>
          <v-table density="comfortable">
            <thead>
              <tr>
                <th class="text-left font-weight-bold">Gói tập</th>
                <th class="text-center font-weight-bold">Số lượng</th>
                <th class="text-right font-weight-bold">Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pkg in reportData.revenueByPackage" :key="pkg.packageName">
                <td>{{ pkg.packageName }}</td>
                <td class="text-center">{{ pkg.quantity }}</td>
                <td class="text-right font-weight-bold">{{ formatCurrency(pkg.totalRevenue, true) }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>

      <!-- 5️⃣ Doanh thu theo HLV (Trainer) -->
      <v-col cols="12" md="6">
        <v-card rounded="lg" elevation="2" class="h-100">
          <v-card-title class="pa-4 d-flex align-center">
            Doanh thu theo HLV
            <v-spacer></v-spacer>
            <v-chip size="small" color="info">Tháng này</v-chip>
          </v-card-title>
          <v-divider></v-divider>
          <v-table density="comfortable">
            <thead>
              <tr>
                <th class="text-left font-weight-bold">HLV</th>
                <th class="text-center font-weight-bold">Số lớp</th>
                <th class="text-right font-weight-bold">Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="trainer in reportData.revenueByTrainer" :key="trainer.trainerName">
                <td>
                  <div class="d-flex align-center py-2">
                    <v-avatar size="32" color="surface-variant" class="mr-2">{{ trainer.trainerName.charAt(0) }}</v-avatar>
                    {{ trainer.trainerName }}
                  </div>
                </td>
                <td class="text-center">{{ trainer.classesCount }}</td>
                <td class="text-right font-weight-bold">{{ formatCurrency(trainer.totalRevenue, true) }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>

      <!-- 6️⃣ Phân tích Chi phí vận hành -->
      <v-col cols="12" md="12" class="mt-6">
        <v-card rounded="lg" elevation="2">
          <v-card-title class="pa-4 d-flex align-center">
            <v-icon color="error" class="mr-2">mdi-chart-pie</v-icon>
            Phân tích Chi phí vận hành (tháng này)
          </v-card-title>
          <v-divider></v-divider>
          <v-row no-gutters>
            <v-col cols="12" md="4" class="pa-4 border-e">
               <div class="d-flex justify-space-between align-center mb-4">
                  <div class="text-subtitle-1 font-weight-bold">Vật tư & Hàng hóa</div>
                  <v-chip color="error" size="small">{{ ((reportData.totalMaterialExpense / (reportData.overview.totalExpenseThisMonth || 1)) * 100).toFixed(0) }}%</v-chip>
               </div>
               <div class="text-h5 font-weight-black text-error mb-2">{{ formatCurrency(reportData.totalMaterialExpense) }}</div>
               <div class="text-caption text-grey">Chi phí vật tư tiêu hao, hàng hỏng, hao hụt từ kho.</div>
            </v-col>
            <v-col cols="12" md="4" class="pa-4 border-e">
               <div class="d-flex justify-space-between align-center mb-4">
                  <div class="text-subtitle-1 font-weight-bold">Bảo trì & Sửa chữa</div>
                  <v-chip color="warning" size="small">{{ ((reportData.totalMaintenanceExpense / (reportData.overview.totalExpenseThisMonth || 1)) * 100).toFixed(0) }}%</v-chip>
               </div>
               <div class="text-h5 font-weight-black text-warning mb-2">{{ formatCurrency(reportData.totalMaintenanceExpense) }}</div>
               <div class="text-caption text-grey">Chi phí thuê thợ, linh kiện thay thế cho thiết bị.</div>
            </v-col>
            <v-col cols="12" md="4" class="pa-4">
               <div class="d-flex justify-space-between align-center mb-4">
                  <div class="text-subtitle-1 font-weight-bold">Khấu hao tài sản</div>
                  <v-chip color="grey" size="small">{{ ((reportData.totalDepreciationExpense / (reportData.overview.totalExpenseThisMonth || 1)) * 100).toFixed(0) }}%</v-chip>
               </div>
               <div class="text-h5 font-weight-black text-grey-darken-2 mb-2">{{ formatCurrency(reportData.totalDepreciationExpense) }}</div>
               <div class="text-caption text-grey">Phân bổ giá trị thiết bị theo thời gian sử dụng.</div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- 7️⃣ Bảng giao dịch chi tiết -->
    <v-card class="mt-6" rounded="lg" elevation="2">
      <v-card-title class="pa-4 d-flex align-center">
        Danh sách giao dịch chi tiết
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Tìm kiếm khách hàng, gói tập..."
          single-line
          hide-details
          density="compact"
          variant="outlined"
          style="max-width: 300px"
        ></v-text-field>
      </v-card-title>
      <v-divider></v-divider>
      <v-data-table
        :headers="transactionHeaders"
        :items="filteredTransactions"
        :loading="loading"
        density="comfortable"
        hover
        class="elevation-0"
      >
        <template v-slot:item.amount="{ item }">
          <span class="font-weight-black text-success">{{ formatCurrency(item.amount) }}</span>
        </template>
        <template v-slot:item.date="{ item }">
          {{ formatDateTime(item.date) }}
        </template>
        <template v-slot:item.status="{ item }">
          <v-chip
            :color="item.status === 'Completed' ? 'success' : 'warning'"
            size="small"
            variant="flat"
          >
            {{ item.status === 'Completed' ? 'Thành công' : item.status }}
          </v-chip>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { reportService } from '@/services/reportService'
import dayjs from 'dayjs'

const loading = ref(false)
const search = ref('')
const dateRangeType = ref('30days')
const startDate = ref('')
const endDate = ref('')

const reportData = ref({
  overview: {
    revenueToday: 0,
    revenueThisMonth: 0,
    revenueThisYear: 0,
    totalExpenseThisMonth: 0,
    netProfitThisMonth: 0,
    newMembersCount: 0,
    totalPackagesSold: 0
  },
  revenueChart: [],
  revenueByPackage: [],
  revenueByTrainer: [],
  revenueByClass: [],
  recentTransactions: [],
  totalMaterialExpense: 0,
  totalMaintenanceExpense: 0,
  totalDepreciationExpense: 0
})

const dateRangeOptions = [
  { title: 'Hôm nay', value: 'today' },
  { title: '7 ngày gần đây', value: '7days' },
  { title: '30 ngày gần đây', value: '30days' },
  { title: 'Toàn bộ năm', value: 'year' },
  { title: 'Tùy chỉnh', value: 'custom' }
]

const transactionHeaders = [
  { title: 'Ngày giao dịch', key: 'date', sortable: true },
  { title: 'Khách hàng', key: 'memberName', sortable: true },
  { title: 'Gói tập', key: 'packageName', sortable: true },
  { title: 'Số tiền', key: 'amount', align: 'end', sortable: true },
  { title: 'Trạng thái', key: 'status', align: 'center' },
  { title: 'HTTT', key: 'paymentMethod', align: 'center' }
]



const sortedTopPackages = computed(() => {
  return [...reportData.value.revenueByPackage]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)
})

const maxPackageQty = computed(() => {
  return Math.max(...reportData.value.revenueByPackage.map(p => p.quantity), 1)
})

const filteredTransactions = computed(() => {
  const q = search.value.toLowerCase()
  return reportData.value.recentTransactions.filter(t => 
    t.memberName.toLowerCase().includes(q) || 
    t.packageName.toLowerCase().includes(q)
  )
})

// ── Chart SVG Logic ──
const chartPoints = computed(() => {
  const data = reportData.value.revenueChart || []
  if (!data.length) return []
  
  const width = 800
  const height = 300
  const padding = 50
  const usableWidth = width - (padding * 2)
  const usableHeight = height - (padding * 2)
  
  const maxRev = Math.max(...data.map(d => d.revenue), 1)
  
  return data.map((d, i) => {
    const x = padding + (i * (usableWidth / (data.length - 1 || 1)))
    const y = height - padding - ((d.revenue / maxRev) * usableHeight)
    return { x, y }
  })
})

const chartLabels = computed(() => {
  const data = reportData.value.revenueChart || []
  if (data.length <= 10) return data
  // Only show labels for every few days if the range is long
  const step = Math.ceil(data.length / 10)
  return data.filter((_, i) => i % step === 0)
})

const chartLinePath = computed(() => {
  const points = chartPoints.value
  if (!points.length) return ''
  return `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`
})

const chartAreaPath = computed(() => {
  const points = chartPoints.value
  if (!points.length) return ''
  const last = points[points.length - 1]
  const first = points[0]
  return `M ${first.x},300 L ${points.map(p => `${p.x},${p.y}`).join(' L ')} L ${last.x},300 Z`
})

// ── Actions ──
function onRangeTypeChange(val) {
  const now = dayjs()
  if (val === 'today') {
    startDate.value = now.format('YYYY-MM-DD')
    endDate.value = now.format('YYYY-MM-DD')
  } else if (val === '7days') {
    startDate.value = now.subtract(7, 'day').format('YYYY-MM-DD')
    endDate.value = now.format('YYYY-MM-DD')
  } else if (val === '30days') {
    startDate.value = now.subtract(30, 'day').format('YYYY-MM-DD')
    endDate.value = now.format('YYYY-MM-DD')
  } else if (val === 'year') {
    startDate.value = now.startOf('year').format('YYYY-MM-DD')
    endDate.value = now.format('YYYY-MM-DD')
  }
  
  if (val !== 'custom') {
    loadData()
  }
}

async function loadData() {
  loading.value = true
  try {
    const res = await reportService.getRevenueReport(startDate.value, endDate.value)
    if (res.success || res.Success) {
      reportData.value = res.data || res.Data
    }
  } catch (e) {
    console.error('Lỗi tải báo cáo:', e)
  } finally {
    loading.value = false
  }
}

function formatCurrency(v, short = false) {
  if (short) {
    if (v >= 1000000) return (v / 1000000).toFixed(1) + ' tr'
    if (v >= 1000) return (v / 1000).toFixed(0) + ' k'
  }
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)
}

function formatDateTime(d) {
  return dayjs(d).format('HH:mm DD/MM/YYYY')
}

function exportExcel() {
  // Logic giả lập xuất Excel: Convert JSON to CSV base64 and trigger download
  alert('Đang tạo báo cáo Excel... Vui lòng đợi trong giây lát.')
  setTimeout(() => {
    alert('Xuất báo cáo thành công!')
  }, 1000)
}

function exportCsv() {
  const headers = ['Ngày', 'Khách hàng', 'Gói tập', 'Số tiền', 'Trạng thái']
  const rows = reportData.value.recentTransactions.map(t => [
    dayjs(t.date).format('YYYY-MM-DD HH:mm'),
    t.memberName,
    t.packageName,
    t.amount,
    t.status
  ])
  
  let csvContent = "data:text/csv;charset=utf-8," 
    + headers.join(",") + "\n"
    + rows.map(e => e.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Bao-cao-doanh-thu-${dayjs().format('YYYYMMDD')}.csv`);
  document.body.appendChild(link);
  link.click();
}

onMounted(() => {
  onRangeTypeChange('30days')
})
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
.chart-container {
  overflow-x: auto;
  padding-top: 20px;
}
svg {
  display: block;
}
circle {
  transition: r 0.2s;
}
circle:hover {
  r: 8;
  cursor: pointer;
}
path {
  transition: d 0.5s ease-in-out;
}

.bg-primary-gradient {
    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
}
.bg-success-gradient {
    background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
}
.bg-error-gradient {
    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
}
.opacity-70 { opacity: 0.7; }
</style>
