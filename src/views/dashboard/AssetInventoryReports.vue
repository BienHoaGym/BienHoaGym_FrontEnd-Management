<template>
  <v-container fluid class="pa-6">
    <div class="d-flex align-center justify-space-between mb-8">
      <div>
        <h1 class="text-h4 font-weight-black primary--text">Báo cáo Tài sản & Kho hàng</h1>
        <p class="text-subtitle-1 text-grey-darken-1">Phân tích giá trị tồn kho và vòng đời thiết bị</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-refresh" @click="loadStats" :loading="loading">Cập nhật</v-btn>
    </div>

    <!-- Inventory Stats Section -->
    <h2 class="text-h5 font-weight-bold mb-4 d-flex align-center">
      <v-icon color="success" class="mr-2">mdi-warehouse</v-icon>
      Phân tích Kho hàng
    </h2>
    <v-row class="mb-8">
      <v-col cols="12" md="4">
        <v-card class="rounded-xl pa-4 border shadow-sm h-100" elevation="0">
          <div class="text-overline text-grey">Tổng giá trị tồn kho</div>
          <div class="text-h3 font-weight-black text-success my-2">{{ formatCurrency(stats.totalStockValue) }}</div>
          <div class="text-body-2 text-grey">Dựa trên giá bán hiện tại của {{ stats.totalProducts }} sản phẩm</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="rounded-xl pa-4 border shadow-sm h-100" elevation="0">
          <div class="text-overline text-grey">Tổng số lượng hàng hóa</div>
          <div class="text-h3 font-weight-black text-primary my-2">{{ stats.totalStockItems }}<span class="text-h6 ml-1">món</span></div>
          <div class="text-body-2 text-grey">Tổng tất cả đơn vị lưu kho đang có</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="rounded-xl pa-4 border shadow-sm h-100" elevation="0">
          <div class="text-overline text-grey">Cảnh báo tồn kho thấp</div>
          <v-list density="compact" class="bg-transparent pa-0 mt-2">
            <v-list-item v-for="item in stats.lowStockItems" :key="item.name" class="px-0">
              <template v-slot:prepend>
                <v-icon color="error" size="small">mdi-alert-circle</v-icon>
              </template>
              <v-list-item-title class="text-body-2">{{ item.name }}</v-list-item-title>
              <template v-slot:append>
                <v-chip size="x-small" color="error" variant="flat">{{ item.quantity }}</v-chip>
              </template>
            </v-list-item>
            <v-list-item v-if="!stats.lowStockItems?.length" class="text-center text-grey opacity-50 py-4">
              Mọi thứ đều ổn
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <!-- Equipment Stats Section -->
    <h2 class="text-h5 font-weight-bold mb-4 d-flex align-center">
      <v-icon color="primary" class="mr-2">mdi-tools</v-icon>
      Phân tích Thiết bị & Tài sản
    </h2>
    <v-row class="mb-8">
      <v-col cols="12" md="3">
        <v-card class="rounded-xl pa-4 bg-blue-lighten-5 border-none" elevation="0">
          <div class="text-caption text-blue-darken-2 font-weight-bold">Giá trị mua vào</div>
          <div class="text-h5 font-weight-black text-blue-darken-4">{{ formatCurrency(stats.totalOriginalValue) }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="rounded-xl pa-4 bg-orange-lighten-5 border-none" elevation="0">
          <div class="text-caption text-orange-darken-2 font-weight-bold">Tổng chi phí bảo trì</div>
          <div class="text-h5 font-weight-black text-orange-darken-4">{{ formatCurrency(stats.totalMaintenanceCosts) }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="rounded-xl pa-4 bg-red-lighten-5 border-none" elevation="0">
          <div class="text-caption text-red-darken-2 font-weight-bold">Giá trị đã khấu hao</div>
          <div class="text-h5 font-weight-black text-red-darken-4">{{ formatCurrency(stats.totalOriginalValue - stats.totalCurrentValue) }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="rounded-xl pa-4 bg-green-lighten-5 border-none" elevation="0">
          <div class="text-caption text-green-darken-2 font-weight-bold">Giá trị tài sản hiện tại</div>
          <div class="text-h5 font-weight-black text-green-darken-4">{{ formatCurrency(stats.totalCurrentValue) }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" v-if="authStore.hasPermission('report.financial')">
        <v-card class="rounded-xl border shadow-sm pa-6" elevation="0">
          <div class="d-flex align-center justify-space-between mb-6">
            <h2 class="text-h5 font-weight-bold d-flex align-center">
              <v-icon color="indigo" class="mr-2">mdi-finance</v-icon>
              Báo cáo Chi phí vận hành tháng ({{ costReport.month }}/{{ costReport.year }})
            </h2>
            <div class="d-flex gap-2 align-center">
               <v-select
                 v-model="selectedMonth"
                 :items="[1,2,3,4,5,6,7,8,9,10,11,12]"
                 label="Tháng"
                 density="compact"
                 variant="outlined"
                 hide-details
                 style="width: 100px"
                 @update:model-value="loadCostReport"
               ></v-select>
               <v-select
                 v-model="selectedYear"
                 :items="[2024, 2025, 2026]"
                 label="Năm"
                 density="compact"
                 variant="outlined"
                 hide-details
                 style="width: 120px"
                 @update:model-value="loadCostReport"
               ></v-select>
            </div>
          </div>

          <v-row>
            <!-- Material Costs (Module Kho) -->
            <v-col cols="12" md="6">
              <v-card variant="tonal" color="indigo" class="rounded-lg pa-4 h-100">
                <div class="d-flex justify-space-between align-center mb-4">
                  <div class="text-subtitle-1 font-weight-bold">📦 CHI PHÍ VẬT TƯ (KHO)</div>
                  <div class="text-h6 font-weight-black">{{ formatCurrency(costReport.totalMaterialCost) }}</div>
                </div>
                <v-list density="compact" bg-color="transparent" class="pa-0">
                  <v-list-item v-for="item in costReport.materialDetails" :key="item.productName" class="px-0">
                    <v-list-item-title class="text-body-2">{{ item.productName }}</v-list-item-title>
                    <v-list-item-subtitle class="text-caption">Số lượng: {{ item.quantity }}</v-list-item-subtitle>
                    <template v-slot:append>
                       <span class="text-body-2 font-weight-bold">{{ formatCurrency(item.cost) }}</span>
                    </template>
                  </v-list-item>
                  <v-list-item v-if="!costReport.materialDetails.length" class="text-center py-4 text-grey">
                    Chưa có chi phí vật tư
                  </v-list-item>
                </v-list>
              </v-card>
            </v-col>

            <!-- Depreciation Costs (Module Thiết bị) -->
            <v-col cols="12" md="6">
              <v-card variant="tonal" color="deep-purple" class="rounded-lg pa-4 h-100">
                <div class="d-flex justify-space-between align-center mb-4">
                  <div class="text-subtitle-1 font-weight-bold">🛠️ CHI PHÍ KHẤU HAO (THIẾT BỊ)</div>
                  <div class="text-h6 font-weight-black">{{ formatCurrency(costReport.totalDepreciationCost) }}</div>
                </div>
                <v-list density="compact" bg-color="transparent" class="pa-0">
                  <v-list-item v-for="item in costReport.depreciationDetails" :key="item.equipmentName" class="px-0">
                    <v-list-item-title class="text-body-2">{{ item.equipmentName }}</v-list-item-title>
                    <v-list-item-subtitle class="text-caption">SL: {{ item.count }} máy</v-list-item-subtitle>
                    <template v-slot:append>
                       <span class="text-body-2 font-weight-bold">{{ formatCurrency(item.amount) }}</span>
                    </template>
                  </v-list-item>
                  <v-list-item v-if="!costReport.depreciationDetails.length" class="text-center py-4 text-grey">
                    Chưa ghi nhận khấu hao
                  </v-list-item>
                </v-list>
              </v-card>
            </v-col>
          </v-row>

          <v-divider class="my-6"></v-divider>
          <div class="d-flex justify-end align-center">
            <span class="text-h6 mr-4 text-grey">TỔNG CHI PHÍ VẬN HÀNH:</span>
            <span class="text-h4 font-weight-black text-indigo">{{ formatCurrency(costReport.totalMaterialCost + costReport.totalDepreciationCost) }}</span>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-card class="rounded-xl border shadow-sm pa-6 pt-4" elevation="0">
          <v-card-title class="px-0 mb-4 font-weight-bold">Trạng thái vận hành thiết bị</v-card-title>
          <div class="d-flex align-center justify-space-around py-4">
             <div v-for="item in stats.statusCounts" :key="item.status" class="text-center">
               <v-progress-circular
                 :model-value="(item.count / (stats.totalEquipments || 1)) * 100"
                 :color="getStatusColor(item.status)"
                 size="80"
                 width="12"
               >
                 <span class="text-h6 font-weight-bold">{{ item.count }}</span>
               </v-progress-circular>
               <div class="mt-2 text-body-2 font-weight-bold">{{ item.status }}</div>
             </div>
          </div>
          <v-divider class="my-4"></v-divider>
          <div class="text-center text-body-2 text-grey">
            Tỷ lệ thiết bị hoạt động tốt chiếm <b>{{ getActivePercent() }}%</b> trên tổng số {{ stats.totalEquipments }} máy
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="rounded-xl border shadow-sm pa-6 pt-4" elevation="0">
          <v-card-title class="px-0 mb-4 font-weight-bold">Sức khỏe tài sản</v-card-title>
          <div class="my-2">
            <div class="d-flex justify-space-between text-body-2 mb-1">
              <span>Giá trị còn lại</span>
              <span class="font-weight-bold">{{ getDepValuePercent() }}%</span>
            </div>
            <v-progress-linear :model-value="getDepValuePercent()" color="green" height="12" rounded></v-progress-linear>
          </div>
          <div class="my-6">
             <div class="d-flex justify-space-between text-body-2 mb-1">
              <span>Tỷ lệ chi phí bảo trì / Giá trị mua</span>
              <span class="font-weight-bold">{{ getMaintRatio() }}%</span>
            </div>
            <v-progress-linear :model-value="getMaintRatio()" color="orange" height="12" rounded></v-progress-linear>
          </div>
          <p class="text-caption text-grey mt-4 italic">
            * Chỉ số chi phí bảo trì cao (>20%) khuyến nghị nên xem xét thay mới thiết bị thay vì tiếp tục sửa chữa.
          </p>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { reportService } from '@/services/reportService'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const loading = ref(false)
const selectedMonth = ref(new Date().getMonth() + 1)
const selectedYear = ref(new Date().getFullYear())

const stats = ref({
  totalProducts: 0,
  totalStockItems: 0,
  totalStockValue: 0,
  lowStockItems: [],
  totalEquipments: 0,
  totalOriginalValue: 0,
  totalMaintenanceCosts: 0,
  totalCurrentValue: 0,
  statusCounts: []
})

const costReport = ref({
  month: 0,
  year: 0,
  totalMaterialCost: 0,
  materialDetails: [],
  totalDepreciationCost: 0,
  depreciationDetails: []
})

const loadStats = async () => {
  loading.value = true
  try {
    const res = await reportService.getAssetInventoryStats()
    if (res.success) stats.value = res.data
  } finally {
    loading.value = false
  }
}

const loadCostReport = async () => {
  if (!authStore.hasPermission('report.financial')) return
  try {
    const res = await reportService.getOperatingCostReport(selectedMonth.value, selectedYear.value)
    if (res.success) costReport.value = res.data
  } catch (e) {
    console.error('Error loading cost report:', e)
  }
}

const formatCurrency = (v) => 
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0)

const getStatusColor = (s) => ({ 'Hoạt động': 'success', 'Hỏng': 'error', 'Bảo trì': 'orange' }[s] || 'grey')

const getActivePercent = () => {
  const active = stats.value.statusCounts.find(s => s.status === 'Hoạt động')?.count || 0
  return Math.round((active / (stats.value.totalEquipments || 1)) * 100)
}

const getDepValuePercent = () => {
  if (!stats.value.totalOriginalValue) return 0
  return Math.round((stats.value.totalCurrentValue / stats.value.totalOriginalValue) * 100)
}

const getMaintRatio = () => {
  if (!stats.value.totalOriginalValue) return 0
  return Math.round((stats.value.totalMaintenanceCosts / stats.value.totalOriginalValue) * 100)
}

onMounted(() => {
  loadStats()
  loadCostReport()
})
</script>

<style scoped>
.shadow-sm {
  box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important;
}
.border-none {
  border: none !important;
}
</style>
