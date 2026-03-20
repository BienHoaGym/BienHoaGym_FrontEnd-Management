<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold font-heading">Quản lý Thiết bị & Tài sản</h1>
        <p class="text-subtitle-1 text-grey mt-1">Theo dõi vòng đời, bảo trì và giá trị tài sản gym</p>
      </div>
      <div class="d-flex gap-2">
        <v-btn color="primary" prepend-icon="mdi-plus" size="large" @click="openEquipmentDialog()">
          Thêm thiết bị
        </v-btn>
      </div>
    </div>

    <!-- Stats Row -->
    <v-row class="mb-4">
      <v-col cols="12" md="3">
        <v-card class="rounded-xl elevation-2 pa-4 bg-success-gradient" theme="dark">
           <div class="d-flex align-center">
             <div class="pa-3 bg-white-opacity-2 rounded-circle mr-4">
                <v-icon size="32">mdi-check-circle-outline</v-icon>
             </div>
             <div>
               <div class="text-h5 font-weight-bold">{{ equipmentByStatus(1).length }}</div>
               <div class="text-caption text-uppercase font-weight-medium ls-1">Đang hoạt động</div>
             </div>
           </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="rounded-xl elevation-2 pa-4 bg-warning-gradient" theme="dark">
           <div class="d-flex align-center">
             <div class="pa-3 bg-white-opacity-2 rounded-circle mr-4">
                <v-icon size="32">mdi-wrench-clock</v-icon>
             </div>
             <div>
               <div class="text-h5 font-weight-bold">{{ equipmentByStatus(3).length }}</div>
               <div class="text-caption text-uppercase font-weight-medium ls-1">Đang bảo trì</div>
             </div>
           </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="rounded-xl elevation-2 pa-4 bg-error-gradient" theme="dark">
           <div class="d-flex align-center">
             <div class="pa-3 bg-white-opacity-2 rounded-circle mr-4">
                <v-icon size="32">mdi-alert-octagon</v-icon>
             </div>
             <div>
               <div class="text-h5 font-weight-bold">{{ equipmentByStatus(2).length }}</div>
               <div class="text-caption text-uppercase font-weight-medium ls-1">Đang hỏng</div>
             </div>
           </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="rounded-xl elevation-2 pa-4 bg-primary-gradient" theme="dark">
           <div class="d-flex align-center">
             <div class="pa-3 bg-white-opacity-2 rounded-circle mr-4">
                <v-icon size="32">mdi-calendar-alert</v-icon>
             </div>
             <div>
               <div class="text-h5 font-weight-bold">{{ maintenancePlanCount }}</div>
               <div class="text-caption text-uppercase font-weight-medium ls-1">Cần bảo trì sớm</div>
             </div>
           </div>
        </v-card>
      </v-col>
    </v-row>

    <v-tabs v-model="activeTab" color="primary" class="mb-6 modern-tabs" grow>
      <v-tab value="list" class="text-none">Danh mục Thiết bị</v-tab>
      <v-tab value="plan" class="text-none">Kế hoạch Bảo trì</v-tab>
      <v-tab value="maintenance" class="text-none">Lịch sử Bảo trì</v-tab>
      <v-tab value="depreciation" class="text-none">Khấu hao</v-tab>
    </v-tabs>

    <v-window v-model="activeTab">
      <!-- LIST TAB -->
      <v-window-item value="list">
        <v-card class="rounded-xl border shadow-sm mb-4">
          <v-card-text class="d-flex align-center gap-4 py-4 flex-wrap">
            <v-text-field
              v-model="filters.searchTerm"
              prepend-inner-icon="mdi-magnify"
              label="Tìm tên, mã, serial..."
              variant="solo-filled"
              density="comfortable"
              hide-details
              rounded="lg"
              class="flex-grow-1"
              clearable
              @update:model-value="loadEquipments"
            ></v-text-field>
            <v-select
              v-model="filters.categoryId"
              :items="categories"
              item-title="name"
              item-value="id"
              label="Loại thiết bị"
              variant="solo-filled"
              density="comfortable"
              hide-details
              rounded="lg"
              style="width: 200px"
              clearable
              placeholder="Tất cả loại"
              @update:model-value="loadEquipments"
            ></v-select>
            <v-select
              v-model="filters.status"
              :items="statusOptions"
              label="Trạng thái"
              variant="solo-filled"
              density="comfortable"
              hide-details
              rounded="lg"
              style="width: 150px"
              clearable
              placeholder="Tất cả TT"
              @update:model-value="loadEquipments"
            ></v-select>
          </v-card-text>
        </v-card>

        <v-card class="rounded-xl border shadow-sm overflow-hidden">
           <v-data-table
            :headers="headers"
            :items="equipmentStore.equipments"
            :loading="equipmentStore.loading"
            hover
            class="equipment-table"
          >
            <template #[`item.name`]="{ item }">
              <div class="py-2">
                <div class="font-weight-bold text-primary">{{ item.name }}</div>
                <div class="text-caption text-grey">SN: {{ item.serialNumber || '---' }} | Code: {{ item.equipmentCode }}</div>
                <v-chip size="x-small" color="grey-lighten-1" class="mt-1" variant="tonal">{{ item.categoryName || 'N/A' }}</v-chip>
              </div>
            </template>
            <template #[`item.status`]="{ item }">
              <v-chip :color="getStatusColor(item.status)" size="small" class="font-weight-bold px-3">
                {{ translateStatus(item.status) }}
              </v-chip>
            </template>
            <template #[`item.priority`]="{ item }">
              <v-tooltip bottom>
                <template #activator="{ props }">
                    <v-icon v-bind="props" :color="getPriorityColor(item.priority)">
                        {{ getPriorityIcon(item.priority) }}
                    </v-icon>
                </template>
                <span>Mức độ quan trọng: {{ translatePriority(item.priority) }}</span>
              </v-tooltip>
            </template>
            <template #[`item.nextMaintenanceDate`]="{ item }">
              <div class="d-flex align-center">
                <v-icon size="14" class="mr-1" :color="isOverdue(item.nextMaintenanceDate) ? 'error' : 'grey'">mdi-clock-outline</v-icon>
                <span :class="isOverdue(item.nextMaintenanceDate) ? 'text-error font-weight-bold' : ''">
                    {{ formatDate(item.nextMaintenanceDate) }}
                </span>
              </div>
            </template>
            <template #[`item.actions`]="{ item }">
              <div class="d-flex align-center justify-end">
                <v-menu>
                    <template #activator="{ props }">
                        <v-btn icon="mdi-dots-vertical" variant="text" v-bind="props"></v-btn>
                    </template>
                    <v-list density="compact" rounded="lg">
                        <v-list-item prepend-icon="mdi-wrench-cog" @click="openMaintenanceDialog(item)">
                            <v-list-item-title>Ghi bảo trì</v-list-item-title>
                        </v-list-item>
                        <v-list-item prepend-icon="mdi-alert-box" @click="openIncidentDialog(item)">
                            <v-list-item-title>Báo hỏng/Sự cố</v-list-item-title>
                        </v-list-item>
                        <v-list-item prepend-icon="mdi-history" @click="openProviderHistory(item)">
                            <v-list-item-title>Lịch sử chuyển NCC</v-list-item-title>
                        </v-list-item>
                        <v-divider class="my-1"></v-divider>
                        <v-list-item prepend-icon="mdi-pencil-outline" color="primary" @click="openEquipmentDialog(item)">
                            <v-list-item-title>Chỉnh sửa</v-list-item-title>
                        </v-list-item>
                        <v-list-item prepend-icon="mdi-trash-can-outline" color="error" @click="confirmDelete(item)">
                            <v-list-item-title>Xóa thiết bị</v-list-item-title>
                        </v-list-item>
                        <v-list-item 
                          v-if="item.status !== 4" 
                          prepend-icon="mdi-close-octagon-outline" 
                          color="warning" 
                          @click="confirmLiquidate(item)"
                        >
                            <v-list-item-title>Thanh lý</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-window-item>

      <!-- PLANE TAB -->
      <v-window-item value="plan">
        <v-card class="rounded-xl border shadow-sm overflow-hidden">
           <v-card-title class="pa-4 bg-primary text-white d-flex align-center">
             <v-icon class="mr-2">mdi-clipboard-list-outline</v-icon>
             Thiết bị tới hạn kiểm tra / Sửa chữa
           </v-card-title>
           <v-data-table
            :headers="planHeaders"
            :items="maintenancePlan"
            :loading="equipmentStore.loading"
            hover
          >
            <template #[`item.nextMaintenanceDate`]="{ item }">
              <v-chip 
                :color="isOverdue(item.nextMaintenanceDate) ? 'error' : 'primary'"
                variant="tonal"
                size="small"
                class="font-weight-bold"
              >
                {{ formatDate(item.nextMaintenanceDate) }}
              </v-chip>
            </template>
            <template #[`item.actions`]="{ item }">
              <v-btn color="primary" size="small" variant="flat" rounded="pill" class="text-none" elevation="0" @click="openMaintenanceDialog(item)">
                Bảo trì ngay
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-window-item>

      <!-- MAINTENANCE HISTORY TAB -->
      <v-window-item value="maintenance">
        <v-card class="rounded-xl border shadow-sm">
          <v-data-table
            :headers="maintenanceHeaders"
            :items="equipmentStore.maintenanceLogs"
            :loading="equipmentStore.loading"
            hover
          >
            <template #[`item.cost`]="{ item }">
              <span class="text-error font-weight-bold">{{ formatPrice(item.cost) }}</span>
            </template>
            <template #[`item.status`]="{ item }">
               <v-chip size="x-small" :color="item.status === 3 ? 'success' : 'warning'" variant="flat">
                 {{ item.status === 3 ? 'Hoàn tất' : 'Đang xử lý' }}
               </v-chip>
            </template>
            <template #[`item.date`]="{ item }">
              {{ formatDate(item.date) }}
            </template>
          </v-data-table>
        </v-card>
      </v-window-item>

      <v-window-item value="depreciation">
        <v-card class="rounded-xl border shadow-sm">
           <v-data-table
            :headers="depreciationHeaders"
            :items="equipmentStore.depreciations"
            hover
          >
            <template #[`item.value`]="{ item }">
               <span class="text-orange font-weight-bold">-{{ formatPrice(item.value) }}</span>
            </template>
          </v-data-table>
        </v-card>
      </v-window-item>
    </v-window>

    <!-- Equipment Dialog -->
    <v-dialog v-model="eqDialog" max-width="800" persistent>
      <v-card class="rounded-xl overflow-hidden">
        <v-toolbar color="primary" flat>
          <v-toolbar-title class="font-weight-bold px-4">
             <v-icon class="mr-2">mdi-desktop-classic</v-icon>
             {{ isEdit ? 'CẬP NHẬT' : 'THÊM MỚI' }} THIẾT BỊ
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="eqDialog = false"></v-btn>
        </v-toolbar>
        
        <v-card-text class="pa-6">
          <v-form ref="eqForm">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field 
                  v-model="equipment.name" 
                  label="Tên thiết bị *" 
                  variant="outlined" 
                  :rules="[v => !!v || 'Bắt buộc']" 
                  placeholder="VD: Máy chạy bộ Matrix T3x"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field 
                  v-model="equipment.equipmentCode" 
                  label="Mã thiết bị (Để trống tự sinh)" 
                  variant="outlined"
                  placeholder="Hệ thống tự sinh"
                  :disabled="isEdit && equipment.hasHistory"
                  persistent-placeholder
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="equipment.categoryId"
                  label="Phân loại thiết bị"
                  :items="categories"
                  item-title="name"
                  item-value="id"
                  variant="outlined"
                  clearable
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="equipment.providerId"
                  label="Nhà cung cấp hiện tại"
                  :items="providers"
                  item-title="name"
                  item-value="id"
                  variant="outlined"
                  clearable
                />
              </v-col>
            </v-row>
            
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="equipment.serialNumber" label="Số Seri (S/N)" variant="outlined" placeholder="VD: SN-123456" />
              </v-col>
              <v-col cols="12" md="6">
                 <v-text-field v-model="equipment.location" label="Vị trí lắp đặt" variant="outlined" placeholder="VD: Tầng 1 - Khu Cardio" />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="4">
                <v-select
                  v-model="equipment.status"
                  label="Trạng thái"
                  :items="statusOptions"
                  item-title="title"
                  item-value="value"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="4">
                <v-select
                  v-model="equipment.priority"
                  label="Độ ưu tiên"
                  :items="priorityOptions"
                  item-title="title"
                  item-value="value"
                  variant="outlined"
                />
              </v-col>
               <v-col cols="4">
                 <v-text-field v-model.number="equipment.maintenanceIntervalDays" label="Chu kỳ bảo trì (ngày)" type="number" variant="outlined" />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="6">
                <v-text-field v-model="equipment.purchaseDate" label="Ngày mua" type="date" variant="outlined" />
              </v-col>
              <v-col cols="6">
                <v-text-field v-model.number="equipment.purchasePrice" label="Giá trị mua" type="number" variant="outlined" prefix="₫" />
              </v-col>
            </v-row>
            
            <v-textarea v-model="equipment.description" label="Ghi chú thêm" variant="outlined" rows="2" />
          </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-6">
          <v-spacer />
          <v-btn variant="text" class="text-none" @click="eqDialog = false">Hủy bỏ</v-btn>
          <v-btn color="primary" variant="flat" size="large" class="text-none px-10 font-weight-bold" rounded="lg" @click="handleSaveEquipment">Lưu thông tin</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Maintenance Dialog -->
    <v-dialog v-model="mtDialog" max-width="600">
      <v-card class="rounded-xl">
        <v-card-title class="pa-6 bg-orange text-white font-weight-bold">
          <v-icon class="mr-2">mdi-hammer-wrench</v-icon> GHI NHẬN BẢO TRÌ SỬA CHỮA
        </v-card-title>
        <v-card-text class="pa-6">
          <div class="mb-6 pa-4 bg-grey-lighten-4 rounded-lg d-flex justify-space-between align-center border">
            <div>
              <div class="text-caption text-grey text-uppercase ls-1">Thiết bị:</div>
              <div class="text-h6 font-weight-bold text-primary">{{ selectedEq?.name }}</div>
            </div>
            <v-chip size="small" :color="getStatusColor(selectedEq?.status)" variant="flat" class="font-weight-bold px-3">
              {{ translateStatus(selectedEq?.status) }}
            </v-chip>
          </div>
          <v-form>
            <v-row>
              <v-col cols="6">
                <v-text-field v-model="maintenance.date" label="Ngày thực hiện" type="date" variant="outlined" />
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="maintenance.status"
                  label="Trạng thái hoàn thành"
                  :items="[{title: 'Hoàn tất (Có thể sử dụng)', value: 3}, {title: 'Vẫn đang xử lý', value: 2}]"
                  variant="outlined"
                />
              </v-col>
            </v-row>
            <v-text-field v-model="maintenance.technician" label="Nhân viên/Đơn vị kỹ thuật" variant="outlined" placeholder="VD: Thợ bảo trì Matrix" />
            <v-text-field v-model.number="maintenance.cost" label="Chi phí thực tế" type="number" variant="outlined" prefix="₫" />
            <v-textarea v-model="maintenance.description" label="Nội dung/Linh kiện thay thế" variant="outlined" rows="3" />
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="mtDialog = false">Hủy</v-btn>
          <v-btn color="orange" variant="flat" class="text-none px-6" @click="handleSaveMaintenance">Ghi nhận bảo trì</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Incident Dialog -->
    <v-dialog v-model="incidentDialog" max-width="600">
      <v-card class="rounded-xl">
        <v-toolbar color="error" flat>
          <v-toolbar-title class="font-weight-bold px-4">BÁO CÁO SỰ CỐ / HƯ HỎNG</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="incidentDialog = false"></v-btn>
        </v-toolbar>
        <v-card-text class="pa-6">
            <div class="mb-4 text-h6 font-weight-bold">{{ selectedEq?.name }}</div>
            <v-form>
                <v-row>
                    <v-col cols="6">
                        <v-text-field v-model="incident.date" label="Thời điểm xẩy ra" type="datetime-local" variant="outlined" />
                    </v-col>
                    <v-col cols="6">
                        <v-select
                            v-model="incident.severity"
                            label="Mức độ nghiêm trọng"
                            :items="['Thấp (Vẫn dùng được)', 'Trung bình', 'Cao (Ngừng sử dụng)', 'Nghiêm trọng']"
                            variant="outlined"
                        />
                    </v-col>
                </v-row>
                <v-textarea v-model="incident.description" label="Mô tả chi tiết sự cố *" variant="outlined" rows="3" placeholder="Máy bị kêu to khi chạy ở tốc độ cao..." />
                <v-text-field v-model="incident.reportedBy" label="Người báo cáo" variant="outlined" />
                
                <v-divider class="my-4"></v-divider>
                <v-checkbox v-model="incident.changeStatusToBroken" label="Đánh dấu thiết bị ở trạng thái hỏng" color="error" hide-details />
            </v-form>
        </v-card-text>
        <v-card-actions class="pa-6">
            <v-spacer />
            <v-btn variant="text" @click="incidentDialog = false">Hủy</v-btn>
            <v-btn color="error" variant="flat" @click="handleLogIncident">Gửi báo cáo</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Provider History Dialog -->
    <v-dialog v-model="historyDialog" max-width="700">
      <v-card class="rounded-xl">
        <v-toolbar color="info" flat>
          <v-toolbar-title class="font-weight-bold px-4">LỊCH SỬ NHÀ CUNG CẤP & VỊ TRÍ</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="historyDialog = false"></v-btn>
        </v-toolbar>
        <v-card-text class="pa-4">
            <div class="mb-4 text-h6 font-weight-bold text-center">{{ selectedEq?.name }}</div>
            <v-data-table
               :headers="[{title: 'Từ ngày', key: 'startDate'}, {title: 'Đến ngày', key: 'endDate'}, {title: 'Nhà cung cấp', key: 'providerName'}, {title: 'Vị trí', key: 'location'}]"
               :items="providerHistory"
               class="history-table"
               density="comfortable"
               :loading="historyLoading"
            >
                <template #[`item.startDate`]="{ item }">
                    {{ formatDate(item.startDate) }}
                </template>
                <template #[`item.endDate`]="{ item }">
                    {{ item.endDate ? formatDate(item.endDate) : 'Hiện tại' }}
                </template>
            </v-data-table>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snack.show" :color="snack.color" location="top" elevation="24">
        {{ snack.message }}
        <template v-slot:actions>
            <v-btn variant="text" @click="snack.show = false">Đóng</v-btn>
        </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useEquipmentStore } from '@/stores/equipment'
import equipmentCategoryService from '@/services/equipmentCategoryService'
import providerService from '@/services/providerService'
import { formatCurrency } from '@/utils/helpers'

const equipmentStore = useEquipmentStore()

const activeTab = ref('list')
const eqDialog = ref(false)
const mtDialog = ref(false)
const incidentDialog = ref(false)
const historyDialog = ref(false)
const isEdit = ref(false)
const selectedEq = ref(null)
const snack = ref({ show: false, message: '', color: 'success' })
const maintenancePlan = ref([])

const categories = ref([])
const providers = ref([])

const filters = ref({
    categoryId: null,
    status: null,
    searchTerm: ''
})

const equipmentByStatus = (status) => equipmentStore.equipments.filter(e => e.status === status)
const maintenancePlanCount = computed(() => maintenancePlan.value.length)

const equipment = ref({
  name: '', equipmentCode: '', status: 1, purchaseDate: '', purchasePrice: 0, location: '', description: '',
  serialNumber: '', categoryId: null, providerId: null, priority: 2, maintenanceIntervalDays: 90
})

const maintenance = ref({ equipmentId: null, date: '', cost: 0, description: '', technician: '', status: 3 })
const incident = ref({ 
    equipmentId: null, 
    date: new Date().toISOString().substring(0, 16), 
    description: '', 
    severity: 'Trung bình', 
    reportedBy: '', 
    changeStatusToBroken: true 
})

const providerHistory = ref([])
const historyLoading = ref(false)

const headers = [
  { title: 'Tên thiết bị', key: 'name' },
  { title: 'Trạng thái', key: 'status' },
  { title: 'Ưu tiên', key: 'priority', align: 'center' },
  { title: 'Vị trí', key: 'location' },
  { title: 'Hạn bảo trì', key: 'nextMaintenanceDate' },
  { title: '', key: 'actions', sortable: false, align: 'end' }
]

const planHeaders = [
  { title: 'Thiết bị', key: 'name' },
  { title: 'Vị trí', key: 'location' },
  { title: 'Trạng thái hiện tại', key: 'status' },
  { title: 'Hạn kiểm định', key: 'nextMaintenanceDate' },
  { title: 'Thao tác', key: 'actions', sortable: false }
]

const maintenanceHeaders = [
  { title: 'Ngày', key: 'date' },
  { title: 'Thiết bị', key: 'equipmentName' },
  { title: 'Người sửa', key: 'technician' },
  { title: 'Chi phí', key: 'cost' },
  { title: 'Trạng thái', key: 'status' }
]

const depreciationHeaders = [
  { title: 'Ngày', key: 'date' },
  { title: 'Thiết bị', key: 'equipmentName' },
  { title: 'Mức khấu hao', key: 'value' }
]

const statusOptions = [
  { title: 'Hoạt động', value: 1 },
  { title: 'Sự cố/Hỏng', value: 2 },
  { title: 'Đang bảo trì', value: 3 },
  { title: 'Đã thanh lý', value: 4 }
]

const priorityOptions = [
  { title: 'Thấp', value: 1 },
  { title: 'Trung bình', value: 2 },
  { title: 'Quan trọng', value: 3 },
  { title: 'Nghiêm trọng', value: 4 }
]

const loadEquipments = () => {
    const params = {
        categoryId: filters.value.categoryId || undefined,
        status: filters.value.status || undefined,
        searchTerm: filters.value.searchTerm || undefined
    }
    equipmentStore.fetchEquipments(params)
}

const loadMaintenancePlan = async () => {
  const res = await equipmentStore.fetchMaintenancePlan()
  if (res.success) maintenancePlan.value = res.data
}

const openEquipmentDialog = (item = null) => {
  if (item) {
    isEdit.value = true
    equipment.value = { 
        ...item, 
        purchaseDate: item.purchaseDate?.split('T')[0],
        hasHistory: true // Dùng để disable mã nếu cần
    }
  } else {
    isEdit.value = false
    equipment.value = { 
      name: '', equipmentCode: '', status: 1, purchaseDate: new Date().toISOString().split('T')[0], 
      purchasePrice: 0, location: '', description: '',
      serialNumber: '', categoryId: null, providerId: null, priority: 2, maintenanceIntervalDays: 90
    }
  }
  eqDialog.value = true
}

const openMaintenanceDialog = (item) => {
  selectedEq.value = item
  maintenance.value = { 
    equipmentId: item.id, 
    date: new Date().toISOString().split('T')[0], 
    cost: 0, 
    description: '',
    technician: '',
    status: 3
  }
  mtDialog.value = true
}

const openIncidentDialog = (item) => {
    selectedEq.value = item
    incident.value = {
        equipmentId: item.id,
        date: new Date().toISOString().substring(0, 16),
        description: '',
        severity: 'Trung bình',
        reportedBy: '',
        changeStatusToBroken: true
    }
    incidentDialog.value = true
}

const openProviderHistory = async (item) => {
    selectedEq.value = item
    historyDialog.value = true
    historyLoading.value = true
    try {
        const res = await equipmentStore.getProviderHistory(item.id)
        providerHistory.value = res.data || []
    } finally {
        historyLoading.value = false
    }
}

const handleSaveEquipment = async () => {
  let res;
  // Payload clean up
  const payload = { ...equipment.value }
  delete payload.hasHistory 

  if (isEdit.value) res = await equipmentStore.updateEquipment(equipment.value.id, payload)
  else res = await equipmentStore.createEquipment(payload)

  if (res.success) {
    showSnack(isEdit.value ? 'Đã cập nhật tài sản!' : 'Đã đăng ký tài sản mới!')
    eqDialog.value = false
    loadMaintenancePlan()
  } else {
    showSnack(res.message, 'error')
  }
}

const handleSaveMaintenance = async () => {
  const res = await equipmentStore.logMaintenance(maintenance.value)
  if (res.success) {
    showSnack('Ghi nhận bảo trì thành công!')
    mtDialog.value = false
    equipmentStore.fetchEquipments()
    loadMaintenancePlan()
  } else {
    showSnack(res.message, 'error')
  }
}

const handleLogIncident = async () => {
    const res = await equipmentStore.logIncident(incident.value)
    if (res.success) {
        showSnack('Báo cáo sự cố đã được ghi nhận!')
        incidentDialog.value = false
        equipmentStore.fetchEquipments()
    } else {
        showSnack(res.message, 'error')
    }
}

const confirmDelete = async (item) => {
    if (confirm(`Bạn có đồng ý xóa thiết bị "${item.name}" khỏi hệ thống?`)) {
        const res = await equipmentStore.deleteEquipment(item.id)
        if (res.success) showSnack('Đã xóa thiết bị!')
        else showSnack(res.message, 'error')
    }
}

const confirmLiquidate = async (item) => {
    if (confirm(`Xác nhận thanh lý tài sản "${item.name}"? Trạng thái sẽ được chuyển thành "Đã thanh lý".`)) {
        const res = await equipmentStore.liquidateEquipment(item.id)
        if (res.success) showSnack('Đã thanh lý tài sản!')
        else showSnack(res.message, 'error')
    }
}

// Helpers
const formatPrice = (p) => formatCurrency(p)
const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '---'
const translateStatus = (s) => ({ 1: 'Hoạt động', 2: 'Sự cố', 3: 'Bảo trì', 4: 'Thanh lý' }[s] || 'Khác')
const getStatusColor = (s) => ({ 1: 'success', 2: 'error', 3: 'orange', 4: 'grey' }[s] || 'grey')
const translatePriority = (p) => ({ 1: 'Thấp', 2: 'Bình thường', 3: 'Cao', 4: 'Khẩn cấp' }[p])
const getPriorityColor = (p) => ({ 1: 'grey-lighten-1', 2: 'info', 3: 'warning', 4: 'error' }[p] || 'grey')
const getPriorityIcon = (p) => ({ 1: 'mdi-chevron-down', 2: 'mdi-chevron-right', 3: 'mdi-chevron-up', 4: 'mdi-alert-decagram' }[p])
const isOverdue = (date) => date && new Date(date) < new Date()
const showSnack = (msg, color = 'success') => snack.value = { show: true, message: msg, color }

const fetchCategories = async () => {
  try {
    const res = await equipmentCategoryService.getAll()
    categories.value = res.data
  } catch (error) {
    console.error('Error loading categories:', error)
  }
}

const fetchProviders = async () => {
  try {
    const res = await providerService.getAll()
    providers.value = res.data
  } catch (error) {
    console.error('Error loading providers:', error)
  }
}

onMounted(() => {
  loadEquipments()
  equipmentStore.fetchMaintenanceLogs()
  equipmentStore.fetchDepreciations()
  loadMaintenancePlan()
  fetchCategories()
  fetchProviders()
})
</script>

<style scoped>
.modern-tabs {
    border-bottom: 1px solid rgba(255,255,255,0.05);
}

.bg-success-gradient {
    background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
}
.bg-warning-gradient {
    background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
}
.bg-error-gradient {
    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
}
.bg-primary-gradient {
    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
}

.bg-white-opacity-2 {
    background-color: rgba(255, 255, 255, 0.2);
}

.ls-1 {
    letter-spacing: 1px;
}

.equipment-table :deep(thead th) {
  font-weight: 700 !important;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}

.font-heading {
    font-family: 'Outfit', sans-serif !important;
}
</style>
