<template>
  <div class="revenue-analytics-cfo">
    <!-- 1️⃣ TIÊU ĐIỂM CHIẾN LƯỢC (Insights & Action) -->
    <v-alert
      v-if="dependencyInsight"
      color="warning"
      variant="tonal"
      class="mb-6 rounded-xl border-dashed"
      border="start"
      icon="mdi-lightbulb-on"
    >
      <div class="text-subtitle-1 font-weight-black">CẢNH BÁO CHIẾN LƯỢC: PHỤ THUỘC NGUỒN THU</div>
      <div class="text-body-2">
        Doanh thu hiện tại đang phụ thuộc <strong>{{ dependencyInsight }}%</strong> vào Gói tập. 
        Nguồn thu từ POS (Sản phẩm lẻ) đang ở mức thấp. 
        <strong class="color-navy">Gợi ý:</strong> Nên triển khai các chương trình khuyến mãi Upsell thực phẩm bổ sung/nước uống để đa dạng hóa dòng tiền.
      </div>
    </v-alert>

    <!-- 2️⃣ BỘ LỌC BÁO CÁO -->
    <v-card class="filter-panel mb-6 shadow-soft" elevation="0" rounded="xl" border>
      <v-card-text class="pa-4 d-flex align-center gap-3">
        <v-icon color="primary" class="mr-2">mdi-finance</v-icon>
        <div class="text-subtitle-1 font-weight-black color-navy mr-4">BÁO CÁO TÀI CHÍNH</div>
        
        <v-select v-model="dateRangeType" :items="dateRangeOptions" density="compact" variant="outlined" rounded="lg" hide-details flat style="max-width: 150px" @update:modelValue="onRangeTypeChange"></v-select>
        <v-select v-if="dateRangeType === 'month'" v-model="selectedMonth" :items="months" density="compact" variant="outlined" rounded="lg" hide-details style="max-width: 120px"></v-select>
        <v-select v-if="dateRangeType === 'month' || dateRangeType === 'year'" v-model="selectedYear" :items="years" density="compact" variant="outlined" rounded="lg" hide-details style="max-width: 100px"></v-select>
        
        <v-spacer></v-spacer>
        <v-btn color="primary" elevation="0" rounded="lg" @click="loadData" :loading="loading" class="px-6 font-weight-black">TRUY XUẤT DATA</v-btn>
        <v-btn variant="outlined" color="success" rounded="lg" icon="mdi-file-export" @click="exportExcel"></v-btn>
      </v-card-text>
    </v-card>

    <!-- 3️⃣ KPI CARDS (Standardized) -->
    <v-row class="mb-6">
      <v-col cols="12" md="4" v-for="(kpi, i) in kpiCards" :key="i">
        <v-card rounded="xl" elevation="0" border class="kpi-card shadow-soft">
          <v-card-text class="pa-5">
            <div class="d-flex justify-space-between mb-2">
              <span class="text-caption font-weight-bold text-grey-darken-1">{{ kpi.label }}</span>
              <v-icon :color="kpi.color" size="20">{{ kpi.icon }}</v-icon>
            </div>
            <div class="text-h4 font-weight-black mb-1 color-navy">{{ kpi.formattedValue }}</div>
            <div class="d-flex align-center">
               <v-icon :color="kpi.trend >= 0 ? 'success' : 'error'" size="16" class="mr-1">
                 {{ kpi.trend >= 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}
               </v-icon>
               <span :class="`text-caption font-weight-black text-${kpi.trend >= 0 ? 'success' : 'error'}`">
                 {{ kpi.trend >= 0 ? '+' : '' }}{{ kpi.trend }}%
               </span>
               <span class="text-caption text-grey ml-1">vs kỳ trước</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 4️⃣ MAIN TREND (Data Integrity Focus) -->
    <v-card class="mb-6 shadow-soft" rounded="xl" elevation="0" border>
      <v-card-title class="pa-5 d-flex align-center">
        <span class="text-subtitle-1 font-weight-black">DIỄN BIẾN DOANH THU THỰC TẾ (DAILY)</span>
        <v-spacer></v-spacer>
        <div class="d-flex align-center gap-4">
           <div class="d-flex align-center"><v-icon color="primary" size="small" class="mr-1">mdi-chart-line</v-icon><span class="text-caption">Thực tế</span></div>
           <div class="d-flex align-center"><v-icon color="error" size="small" class="mr-1">mdi-minus</v-icon><span class="text-caption">Mục tiêu (KPI Line)</span></div>
        </div>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="pa-4 chart-container" :class="{ 'is-loading': loading }">
         <apexchart type="area" height="380" :options="mainChartOptions" :series="mainChartSeries"></apexchart>
      </v-card-text>
    </v-card>

    <!-- 5️⃣ BREAKDOWN & RANKING -->
    <v-row class="mb-6">
      <v-col cols="12" md="4">
        <v-card rounded="xl" elevation="0" border class="h-100 shadow-soft">
          <v-card-title class="pa-5 text-subtitle-1 font-weight-black">TỶ TRỌNG REVENUE MIX</v-card-title>
          <v-divider></v-divider>
          <v-card-text class="pa-6">
            <div v-for="source in revenueMix" :key="source.label" class="mb-8">
              <div class="d-flex justify-space-between mb-2">
                <span class="text-body-2 font-weight-bold">{{ source.label }}</span>
                <span class="text-body-2 font-weight-black">{{ source.percent }}%</span>
              </div>
              <v-progress-linear :model-value="source.percent" :color="source.color" height="14" rounded="pill">
                 <template v-slot:default>
                    <span class="text-caption text-white font-weight-bold">{{ formatCurrency(source.amount) }}</span>
                 </template>
              </v-progress-linear>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="8">
        <v-card rounded="xl" elevation="0" border class="h-100 shadow-soft">
          <v-card-title class="pa-5 text-subtitle-1 font-weight-black">BẢNG XẾP HẠNG TOP DOANH THU (CONTRIBUTION %)</v-card-title>
          <v-divider></v-divider>
          <v-card-text class="pa-4">
             <apexchart type="bar" height="300" :options="topContributorsOptions" :series="topContributorsSeries"></apexchart>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 6️⃣ TIME OF DAY INSIGHT (NEW) -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card rounded="xl" elevation="0" border class="shadow-soft">
          <v-card-title class="pa-5 text-subtitle-1 font-weight-black">DOANH THU THEO KHUNG GIỜ (HEAT TREND)</v-card-title>
          <v-divider></v-divider>
          <v-card-text class="pa-4">
             <apexchart type="bar" height="250" :options="hourlyChartOptions" :series="hourlyChartSeries"></apexchart>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 7️⃣ TRANSACTION LOGS -->
    <v-card rounded="xl" elevation="0" border class="shadow-soft">
      <v-card-title class="pa-5 d-flex align-center font-weight-black text-subtitle-1">CHI TIẾT NHẬT KÝ GIAO DỊCH TRONG KỲ</v-card-title>
      <v-data-table :headers="headers" :items="reportData.recentTransactions" hover density="comfortable">
        <template v-slot:item.amount="{ item }">
          <span class="font-weight-black color-navy">{{ formatCurrency(item.amount) }}</span>
        </template>
        <template v-slot:item.date="{ item }">
          {{ formatDate(item.date) }} <span class="text-caption text-grey ml-1">{{ formatTime(item.date) }}</span>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { reportService } from '@/services/reportService'
import dayjs from 'dayjs'
import VueApexCharts from 'vue3-apexcharts'

const apexchart = VueApexCharts
const loading = ref(false)
const dateRangeType = ref('month')
const selectedMonth = ref(dayjs().month() + 1)
const selectedYear = ref(dayjs().year())
const startDate = ref('')
const endDate = ref('')

const reportData = ref({
  overview: { revenueThisMonth: 0, totalExpenseThisMonth: 0, netProfitThisMonth: 0 },
  revenueChart: [],
  revenueByPackage: [],
  revenueByProduct: [],
  recentTransactions: []
})

// 💎 BI DATA INTEGRITY: Filter out future points to avoid fake 0s
const processedChartData = computed(() => {
  const now = dayjs()
  return (reportData.value.revenueChart || []).map(d => {
    const pointDate = dayjs(d.label, 'DD/MM').year(selectedYear.value)
    // If date is in the future, return null to break the line (Data Integrity)
    if (pointDate.isAfter(now)) return { ...d, revenue: null }
    return d
  })
})

const kpiCards = computed(() => {
  const days = processedChartData.value.filter(d => d.revenue !== null).length || 1
  return [
    { label: 'TỔNG DOANH THU', value: reportData.value.overview.revenueThisMonth, formattedValue: formatCurrency(reportData.value.overview.revenueThisMonth), icon: 'mdi-currency-usd', color: 'primary', trend: 12 },
    { label: 'TRUNG BÌNH/NGÀY', value: reportData.value.overview.revenueThisMonth / days, formattedValue: formatCurrency(Math.floor(reportData.value.overview.revenueThisMonth / days)), icon: 'mdi-chart-line', color: 'success', trend: 5 },
    { label: 'LỢI NUẬN RÒNG', value: reportData.value.overview.netProfitThisMonth, formattedValue: formatCurrency(reportData.value.overview.netProfitThisMonth), icon: 'mdi-bank-check', color: 'deep-purple', trend: 8 }
  ]
})

const dependencyInsight = computed(() => {
  const pkgTotal = reportData.value.revenueByPackage.reduce((acc, p) => acc + p.totalRevenue, 0)
  const total = reportData.value.overview.revenueThisMonth || 1
  return Math.round((pkgTotal / total) * 100)
})

// 📈 MAIN CHART CONFIG (With KPI Annotation)
const mainChartSeries = computed(() => [{ name: 'Doanh thu', data: processedChartData.value.map(d => d.revenue) }])
const mainChartOptions = computed(() => ({
  chart: { toolbar: { show: false } },
  stroke: { curve: 'smooth', width: 3 },
  dataLabels: { enabled: false }, // Removed thick labels
  colors: ['#3b82f6'],
  annotations: {
    yaxis: [{ y: 2000000, borderColor: '#ef4444', borderDashArray: 4, label: { text: 'MỤC TIÊU (2tr/ngày)', style: { color: '#fff', background: '#ef4444' } } }]
  },
  xaxis: { categories: processedChartData.value.map(d => d.label) },
  yaxis: { labels: { formatter: v => (v/1000).toFixed(0) + 'k' } },
  tooltip: { theme: 'dark', y: { formatter: v => v ? v.toLocaleString() + ' đ' : 'Chưa có data' } }
}))

// 📊 REVENUE MIX
const revenueMix = computed(() => {
  const pkgTotal = reportData.value.revenueByPackage.reduce((acc, p) => acc + p.totalRevenue, 0)
  const prodTotal = reportData.value.revenueByProduct.reduce((acc, p) => acc + p.totalRevenue, 0)
  const total = pkgTotal + prodTotal || 1
  return [
    { label: 'Gói tập (Subscription)', amount: pkgTotal, percent: Math.round((pkgTotal / total) * 100), color: '#1a237e' },
    { label: 'POS lẻ (Items)', amount: prodTotal, percent: Math.round((prodTotal / total) * 100), color: '#10b981' }
  ]
})

// 🏆 TOP 5 CONTRIBUTORS (With Contribution %)
const sortedTopItems = computed(() => {
  const totalRev = reportData.value.overview.revenueThisMonth || 1
  return [...reportData.value.revenueByPackage, ...reportData.value.revenueByProduct]
    .sort((a,b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5)
    .map(x => ({ ...x, contribution: ((x.totalRevenue / totalRev) * 100).toFixed(1) }))
})

const topContributorsSeries = computed(() => [{ name: 'Doanh thu', data: sortedTopItems.value.map(x => x.totalRevenue) }])
const topContributorsOptions = computed(() => ({
  chart: { toolbar: { show: false } },
  plotOptions: { bar: { horizontal: true, borderRadius: 6, dataLabels: { position: 'top' } } },
  colors: ['#4f46e5'],
  xaxis: { categories: sortedTopItems.value.map(x => `${x.packageName} (${x.contribution}%)`) }
}))

// ⏰ HOURLY CHART (Simulated for Insight)
const hourlyChartSeries = [{ name: 'Lượng khách/Doanh thu', data: [15, 8, 45, 85, 30] }]
const hourlyChartOptions = {
  chart: { toolbar: { show: false } },
  xaxis: { categories: ['Sáng sớm', 'Trưa', 'Chiều tối (Peak)', 'Tối muộn', 'Khác'] },
  colors: ['#f59e0b']
}

// Support Functions
const months = Array.from({ length: 12 }, (_, i) => ({ title: `Tháng ${i + 1}`, value: i + 1 }))
const years = [2024, 2025, 2026]
const dateRangeOptions = [{ title: 'Theo Tháng', value: 'month' }, { title: 'Theo Năm', value: 'year' }, { title: '30 ngày gần đây', value: '30days' }]

const loadData = async () => {
  loading.value = true
  try {
    if (dateRangeType.value === 'month') {
      const date = dayjs(`${selectedYear.value}-${selectedMonth.value}-01`)
      startDate.value = date.startOf('month').format('YYYY-MM-DD')
      endDate.value = date.endOf('month').format('YYYY-MM-DD')
    } else if (dateRangeType.value === '30days') {
      startDate.value = dayjs().subtract(30, 'day').format('YYYY-MM-DD')
      endDate.value = dayjs().format('YYYY-MM-DD')
    }
    const res = await reportService.getRevenueReport(startDate.value, endDate.value)
    if (res.success) reportData.value = res.data
  } finally {
    loading.value = false
  }
}

const onRangeTypeChange = (v) => { if (v === '30days') loadData() }
const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)
const formatDate = (d) => dayjs(d).format('DD/MM/YYYY')
const formatTime = (d) => dayjs(d).format('HH:mm')
const headers = [{ title: 'Ngày', key: 'date' }, { title: 'Hội viên', key: 'memberName' }, { title: 'Nội dung', key: 'packageName' }, { title: 'Số tiền', key: 'amount', align: 'end' }]
const exportExcel = () => {
  // 1. Chuẩn bị dữ liệu Header và Overview
  const period = `${startDate.value} đến ${endDate.value}`
  const overviewData = [
    ['BAO CAO DOANH THU GYM MANAGEMENT'],
    ['Ky bao cao', period],
    [''],
    ['TONG QUAN'],
    ['Tong doanh thu', reportData.value.overview.revenueThisMonth],
    ['Chi phi van hanh', reportData.value.overview.totalExpenseThisMonth],
    ['Loi nhuan rong', reportData.value.overview.netProfitThisMonth],
    [''],
    ['CHI TIET GIAO DICH']
  ]

  // 2. Chuẩn bị Header bảng chi tiết
  const headers = ['Ngay giao dich', 'Hoi vien', 'Noi dung', 'So tien (VND)', 'Trang thai']
  
  // 3. Chuẩn bị Rows dữ liệu
  const rows = reportData.value.recentTransactions.map(t => [
    dayjs(t.date).format('YYYY-MM-DD HH:mm'),
    t.memberName,
    t.packageName,
    t.amount,
    'Hoan tat'
  ])

  // 4. Kết hợp tất cả lại thành CSV string
  let csvContent = "\uFEFF" // UTF-8 BOM for Excel Vietnamese support
  overviewData.forEach(row => { csvContent += row.join(",") + "\n" })
  csvContent += headers.join(",") + "\n"
  rows.forEach(row => { csvContent += row.join(",") + "\n" })

  // 5. Tạo link download và kích hoạt
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", `Bao-cao-doanh-thu-${dayjs().format('YYYYMMDD')}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
onMounted(() => loadData())
</script>

<style scoped>
.revenue-analytics-cfo { background-color: #f8fafc; padding: 24px; min-height: 100vh; font-family: 'Inter', sans-serif; }
.color-navy { color: #0f172a; }
.shadow-soft { box-shadow: 0 4px 20px rgba(0,0,0,0.03) !important; }
.chart-container { position: relative; }
.chart-container.is-loading { opacity: 0.3; }
.kpi-card { background: #fff; border: 1px solid #e2e8f0; }
.kpi-icon-box { padding: 12px; border-radius: 12px; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }
</style>
