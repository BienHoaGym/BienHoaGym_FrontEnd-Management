<template>
  <div>
    <!-- Header Stats Overview -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="xl" elevation="1" class="border pa-4 bg-grey-lighten-5">
           <div class="d-flex align-center mb-2">
             <v-icon size="24" color="primary" class="mr-2">mdi-barcode-scan</v-icon>
             <span class="text-overline font-weight-bold">Tổng số SKU</span>
           </div>
           <div class="text-h4 font-weight-black">{{ inventoryStore.inventories.length }}</div>
           <div class="text-caption text-grey">Mã hàng hóa đang quản lý</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="xl" elevation="1" class="border pa-4 bg-error-lighten-5">
           <div class="d-flex align-center mb-2">
             <v-icon size="24" color="error" class="mr-2">mdi-alert-octagon</v-icon>
             <span class="text-overline font-weight-bold">HẾT HÀNG</span>
           </div>
           <div class="text-h4 font-weight-black text-error">{{ outOfStockCount }}</div>
           <div class="text-caption text-error-darken-1">Cần nhập kho khẩn cấp</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="xl" elevation="1" class="border pa-4 bg-warning-lighten-5">
           <div class="d-flex align-center mb-2">
             <v-icon size="24" color="warning" class="mr-2">mdi-alert-decagram</v-icon>
             <span class="text-overline font-weight-bold">SẮP HẾT HÀNG</span>
           </div>
           <div class="text-h4 font-weight-black text-warning">{{ lowStockCount }}</div>
           <div class="text-caption text-warning-darken-1">Dưới ngưỡng tồn an toàn</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="xl" elevation="1" class="border pa-4 bg-info-lighten-5">
           <div class="d-flex align-center mb-2">
             <v-icon size="24" color="info" class="mr-2">mdi-office-building-cog</v-icon>
             <span class="text-overline font-weight-bold">Tài sản & Thiết bị</span>
           </div>
           <div class="text-h4 font-weight-black text-info">{{ equipmentStore.equipments.length }}</div>
           <div class="text-caption text-info-darken-1">Tài sản cố định đang khai thác</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Main Content Area -->
    <v-card class="rounded-xl border shadow-sm">
      <v-toolbar flat color="white" class="rounded-t-xl border-b">
        <v-toolbar-title class="text-h6 font-weight-bold">
          <v-icon start color="primary">mdi-warehouse</v-icon> QUẢN LÝ KHO (TỔNG QUYẾT)
        </v-toolbar-title>
        <v-spacer />
        <div class="d-flex align-center gap-2 px-2">
          <v-btn color="deep-purple" variant="flat" prepend-icon="mdi-plus" @click="openSupplyDialog" class="rounded-lg mr-2">
             Thêm vật tư mới
           </v-btn>
          <v-btn color="primary" variant="flat" prepend-icon="mdi-import" @click="openTransactionDialog(1)" class="rounded-lg">
             Nhập kho
           </v-btn>
          <v-btn color="error" variant="flat" prepend-icon="mdi-export" @click="openTransactionDialog(7)" class="rounded-lg ml-2">
            Xuất tiêu hao
          </v-btn>
           <v-menu offset-y>
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-dots-vertical" v-bind="props"></v-btn>
            </template>
            <v-list density="compact">
              <!-- Removed for single-warehouse setup -->
              <!-- <v-list-item @click="openTransactionDialog(4)">
                <template #prepend><v-icon>mdi-swap-horizontal</v-icon></template>
                <v-list-item-title>Điều chuyển kho</v-list-item-title>
              </v-list-item> -->
              <v-list-item @click="openTransactionDialog(3)">
                <template #prepend><v-icon>mdi-wrench-outline</v-icon></template>
                <v-list-item-title>Điều chỉnh số lượng</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </v-toolbar>

      <v-tabs v-model="currentTab" bg-color="grey-lighten-4" slider-color="primary">
        <v-tab value="overview">
          <v-icon start>mdi-view-dashboard-outline</v-icon> Tổng quan
        </v-tab>
        <v-tab value="alerts">
          <v-icon start>mdi-alert-circle-outline</v-icon> Cảnh báo
          <v-badge v-if="stockAlerts.length > 0" :content="stockAlerts.length" color="error" inline class="ml-2"/>
        </v-tab>
        <v-tab value="history">
          <v-icon start>mdi-history</v-icon> Lịch sử biến động
        </v-tab>
      </v-tabs>

      <v-window v-model="currentTab">
        <!-- Overview Tab -->
        <v-window-item value="overview">
          <v-card-text class="pa-0">
            <v-row class="pa-4 align-center bg-grey-lighten-5">
              <!-- Warehouse filter removed for simplification -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="search"
                  prepend-inner-icon="mdi-magnify"
                  label="Tìm kiếm sản phẩm, SKU..."
                  variant="outlined"
                  bg-color="white"
                  density="compact"
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-checkbox
                  v-model="includeAssets"
                  label="Bao gồm Thiết bị & Tài sản"
                  hide-details
                  density="compact"
                  color="primary"
                  @update:model-value="filterByWarehouse"
                ></v-checkbox>
              </v-col>
            </v-row>
            <v-data-table
              :headers="headers"
              :items="inventoryStore.inventories"
              :search="search"
              :loading="inventoryStore.loading"
              density="comfortable"
              hover
            >
              <template #[`item.productName`]="{ item }">
                <div class="d-flex align-center py-2">
                  <v-avatar size="38" :color="item.productName.includes('[TÀI SẢN]') ? 'info' : 'primary'" variant="tonal" class="mr-3">
                     <v-icon size="20">{{ item.productName.includes('[TÀI SẢN]') ? 'mdi-office-building-cog' : 'mdi-package-variant' }}</v-icon>
                  </v-avatar>
                  <div>
                    <div class="font-weight-bold" style="line-height: 1.2">
                      {{ item.productName.replace('[TÀI SẢN]', '').trim() }}
                    </div>
                    <div class="text-caption text-grey d-flex align-center mt-1">
                      <span class="mr-2">SKU: {{ item.productSKU || '---' }}</span>
                      <v-chip v-if="item.productName.includes('[TÀI SẢN]')" size="x-small" color="info" variant="flat">TÀI SẢN</v-chip>
                    </div>
                  </div>
                </div>
              </template>
              
              <!-- Warehouse name column removed -->

              <template #[`item.quantity`]="{ item }">
                <v-chip :color="getStockColor(item.quantity, item.minStockThreshold)" size="small" variant="flat" class="px-3 font-weight-black">
                  {{ item.quantity }}
                </v-chip>
              </template>

              <template #[`item.minStockThreshold`]="{ item }">
                 <v-chip size="x-small" variant="tonal" :color="item.quantity <= item.minStockThreshold ? 'error' : 'grey'">
                    Min: {{ item.minStockThreshold }}
                 </v-chip>
              </template>

              <template #[`item.costPrice`]="{ item }">
                 <span class="text-caption">{{ formatCurrency(item.costPrice) }}</span>
              </template>

              <template #[`item.price`]="{ item }">
                 <span class="text-caption font-weight-bold">{{ formatCurrency(item.price) }}</span>
              </template>

              <template #[`item.profit`]="{ item }">
                 <v-tooltip location="top" text="Lợi nhuận gộp trên mỗi đơn vị">
                   <template v-slot:activator="{ props }">
                      <span v-bind="props" class="text-caption text-success font-weight-bold">
                         +{{ formatCurrency(item.price - item.costPrice) }}
                      </span>
                   </template>
                 </v-tooltip>
              </template>

              <template #[`item.actions`]="{ item }">
                 <div class="d-flex justify-end gap-1">
                   <v-btn icon="mdi-export" variant="tonal" size="x-small" color="error" title="Xuất nhanh" @click="openTransactionDialog(2, item)"></v-btn>
                   <v-btn icon="mdi-wrench" variant="tonal" size="x-small" color="warning" title="Điều chỉnh" @click="openTransactionDialog(3, item)"></v-btn>
                   <v-btn icon="mdi-history" variant="text" size="x-small" color="primary" title="Lịch sử" @click="viewHistory(item)"></v-btn>
                 </div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-window-item>

        <!-- Alerts Tab -->
        <v-window-item value="alerts">
          <v-card-text>
            <v-list lines="two">
              <v-list-subheader class="font-weight-bold">Các sản phẩm cần chú ý</v-list-subheader>
               <v-list-item
                  v-for="a in stockAlerts"
                  :key="a.productId"
                  class="border-b"
               >
                <template #prepend>
                   <v-avatar size="38" :color="a.productName.includes('[TÀI SẢN]') ? 'info' : (a.quantity <= 0 ? 'error' : 'warning')" variant="tonal" class="mr-3">
                      <v-icon size="20">{{ a.productName.includes('[TÀI SẢN]') ? 'mdi-office-building-cog' : 'mdi-package-variant' }}</v-icon>
                   </v-avatar>
                </template>
                <v-list-item-title class="font-weight-bold">{{ a.productName }}</v-list-item-title>
                <v-list-item-subtitle class="d-flex flex-wrap">
                  <span class="mr-4">Kho: <b>{{ a.warehouseName }}</b></span>
                  <span class="mr-4">Tồn: <b :class="a.quantity === 0 ? 'text-error' : 'text-warning'">{{ a.quantity }}</b></span>
                  <span>Ngưỡng: <b>{{ a.minStockThreshold }}</b></span>
                </v-list-item-subtitle>
                 <template #append>
                   <v-btn color="success" size="small" class="rounded-lg" @click="openTransactionDialog(1, a)">Nhập kho</v-btn>
                 </template>
              </v-list-item>
              <v-list-item v-if="!stockAlerts.length" class="text-center py-8 text-grey">
                <v-icon size="48" class="mb-2">mdi-check-circle-outline</v-icon>
                <div class="text-h6">Kho hàng ổn định</div>
                <p>Không có cảnh báo nào.</p>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-window-item>

        <!-- History Tab -->
        <v-window-item value="history">
          <v-card-text class="pa-0" style="max-height: 65vh; overflow-y: auto;">
             <div class="pa-4 bg-grey-lighten-5 border-b d-flex align-center">
                <p class="text-subtitle-1 font-weight-bold">Nhật ký biến động gần đây</p>
                <v-spacer/>
                <v-btn icon="mdi-refresh" variant="text" density="compact" @click="inventoryStore.fetchTransactions(null, DEFAULT_WAREHOUSE_ID)"></v-btn>
             </div>
             <v-list lines="three" class="pa-0">
              <v-list-item v-for="(t, idx) in inventoryStore.transactions" :key="t.id" :class="idx % 2 === 0 ? 'bg-grey-lighten-5' : ''" class="pa-3 border-b">
                <template v-slot:prepend>
                  <div class="d-flex flex-column align-center mr-3" style="width: 50px">
                    <v-icon :color="getTxColor(t.type)" size="24" class="mb-0">
                      {{ getTxIcon(t.type) }}
                    </v-icon>
                    <div class="text-caption font-weight-black mt-n1" :class="`text-${getTxColor(t.type)}`">
                      {{ getTxSymbol(t.type) }}{{ t.quantity }}
                    </div>
                  </div>
                </template>
                <div class="d-flex flex-column">
                  <v-list-item-title class="font-weight-black text-body-2 mb-0">
                    {{ t.productName.replace('[TÀI SẢN]', '').trim() }}
                  </v-list-item-title>
                  <div class="text-caption d-flex align-center flex-wrap">
                    <span class="text-grey font-weight-medium mr-1">{{ t.beforeQuantity }} →</span>
                    <span class="text-primary font-weight-bold mr-2">{{ t.afterQuantity }}</span>
                    <v-icon size="10" class="mr-1">mdi-account-circle-outline</v-icon>
                    <span class="text-grey-darken-1 mr-2">{{ t.performedBy || 'System' }}</span>
                  </div>
                  <div class="text-caption text-grey-darken-1 d-flex align-center">
                    {{ formatDateTime(t.date) }} • {{ getTxTypeName(t.type) }}
                  </div>
                  <div v-if="t.note" class="bg-white px-2 py-1 border rounded text-grey italic mt-1" style="font-size: 0.65rem">
                    {{ t.note }}
                  </div>
                </div>
              </v-list-item>
              <v-list-item v-if="!inventoryStore.transactions.length" class="text-center py-12 text-grey">
                <v-icon size="48" color="grey-lighten-2" class="mb-2">mdi-tray-blank</v-icon>
                <div class="text-caption">Chưa có lịch sử giao dịch</div>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-window-item>
      </v-window>
    </v-card>

    <!-- Transaction Dialog -->
    <v-dialog v-model="txDialog" max-width="500">
      <v-card class="rounded-xl">
        <v-card-title class="pa-6 font-weight-bold" :class="getTxBg(txType)">
          {{ getTxTitle(txType) }}
        </v-card-title>
        <v-card-text class="pa-6">
          <v-form ref="txFormRef">
            <v-btn-toggle v-if="txType === 1" v-model="transaction.isAsset" mandatory color="primary" class="mb-6 w-100" density="compact">
               <v-btn :value="false" class="flex-grow-1">Hàng hóa/Vật tư</v-btn>
               <v-btn :value="true" class="flex-grow-1">Máy móc/Thiết bị</v-btn>
            </v-btn-toggle>

            <v-autocomplete
              v-model="transaction.productId"
              :label="transaction.isAsset ? 'Thiết bị *' : 'Sản phẩm *'"
              :items="transaction.isAsset ? assetOptions : productOptions"
              item-title="label"
              item-value="id"
              variant="outlined"
              :rules="[v => !!v || 'Bắt buộc']"
            ></v-autocomplete>

            <!-- Warehouse selection hidden for single-warehouse, will be set in logic -->

            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model.number="transaction.quantity"
                  label="Số lượng *"
                  type="number"
                  variant="outlined"
                  :rules="[v => !!v || 'Bắt buộc', v => v > 0 || 'Số lượng > 0']"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model.number="transaction.unitPrice"
                  label="Đơn giá nhập *"
                  type="number"
                  variant="outlined"
                  suffix="đ"
                  :hint="selectedProductInfo ? `Giá vốn mặc định: ${formatCurrency(selectedProductInfo.costPrice)}` : ''"
                  persistent-hint
                  prepend-inner-icon="mdi-cash-multiple"
                  color="success"
                  class="mb-2"
                ></v-text-field>
                <v-alert v-if="txType === 1" density="compact" color="success" variant="tonal" class="text-caption mt-2 py-1 px-2 border" icon="mdi-information-outline">
                    Giá nhập này sẽ dùng để tính lại <b>Giá bình quân</b> cho kho.
                </v-alert>
              </v-col>
            </v-row>

            <v-text-field
              v-model="transaction.referenceNumber"
              label="Mã tham chiếu (Phiếu mua/hóa đơn)"
              variant="outlined"
              placeholder="e.g. PN-001"
            ></v-text-field>
            <v-textarea v-model="transaction.note" label="Ghi chú" variant="outlined" rows="2"></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="txDialog = false">Hủy</v-btn>
          <v-btn :color="getTxColor(txType)" variant="flat" @click="handleTransaction">
            Xác nhận
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- New Internal Supply Dialog -->
    <v-dialog v-model="supplyDialog" max-width="600">
      <v-card class="rounded-xl">
        <v-card-title class="pa-6 font-weight-bold bg-deep-purple text-white">
          <v-icon start>mdi-plus-circle</v-icon> THÊM VẬT TƯ NỘI BỘ MỚI
        </v-card-title>
        <v-card-text class="pa-6">
          <v-form ref="supplyFormRef">
            <v-text-field
              v-model="newSupply.name"
              label="Tên vật tư *"
              variant="outlined"
              :rules="[v => !!v || 'Bắt buộc']"
              placeholder="e.g. Khăn tắm, Xà phòng, Dầu nhớt..."
            ></v-text-field>
            
            <v-row>
              <v-col cols="6">
                <v-text-field v-model="newSupply.unit" label="Đơn vị tính *" variant="outlined" :rules="[v => !!v || 'Bắt buộc']"></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field v-model.number="newSupply.costPrice" label="Giá nhập/vốn" type="number" variant="outlined" suffix="đ"></v-text-field>
              </v-col>
            </v-row>

            <v-divider class="my-4"/>
            <div class="text-subtitle-2 mb-2 text-primary font-weight-bold italic">Nhập kho khởi tạo:</div>
            
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model.number="newSupply.initialQuantity"
                  label="Số lượng nhập ban đầu"
                  type="number"
                  variant="outlined"
                  hint="Nếu > 0, hệ thống sẽ tự động tạo phiếu nhập kho"
                  persistent-hint
                ></v-text-field>
              </v-col>
            </v-row>
            
            <v-textarea v-model="newSupply.description" label="Ghi chú mô tả" variant="outlined" rows="2" class="mt-4"></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="supplyDialog = false">Hủy</v-btn>
          <v-btn color="deep-purple" variant="flat" @click="handleCreateSupply" class="px-6 rounded-lg">
            Thành công & Lưu kho
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snack.show" :color="snack.color">
      {{ snack.message }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { useBillingStore } from '@/stores/billing'
import { useAuthStore } from '@/stores/auth'
import { useEquipmentStore } from '@/stores/equipment'

const inventoryStore = useInventoryStore()
const billingStore = useBillingStore()
const authStore = useAuthStore()
const equipmentStore = useEquipmentStore()

const currentTab = ref('overview')
const search = ref('')
const selectedWarehouseId = ref(null) // This will effectively be ignored or set to DEFAULT_WAREHOUSE_ID
const includeAssets = ref(false)
const txDialog = ref(false)
const supplyDialog = ref(false)
const txFormRef = ref(null)
const supplyFormRef = ref(null)
const txType = ref(1) // 1: Import, 2: Export, 3: Adjustment, 4: Transfer, 7: InternalUse
const snack = ref({ show: false, message: '', color: 'success' })
const transaction = ref({ productId: null, quantity: 1, unitPrice: 0, note: '', referenceNumber: '', fromWarehouseId: null, toWarehouseId: null, isAsset: false })
const newSupply = ref({ name: '', unit: 'Cái', costPrice: 0, initialQuantity: 0, description: '', warehouseId: DEFAULT_WAREHOUSE_ID })
const stockAlerts = ref([])

const outOfStockCount = computed(() => stockAlerts.value.filter(a => a.quantity === 0).length)
const lowStockCount = computed(() => stockAlerts.value.filter(a => a.quantity > 0).length)

const DEFAULT_WAREHOUSE_ID = '10000000-0000-0000-0000-000000000001'

const warehouseOptions = computed(() => {
  const options = [{ id: null, label: 'Tất cả kho' }]
  inventoryStore.warehouses.forEach(w => options.push({ id: w.id, label: w.name }))
  return options
})

const warehouseDropdownOptions = computed(() => {
  let list = inventoryStore.warehouses
  if (authStore.isReceptionist) {
    list = list.filter(w => w.name.includes("Quầy") || w.name.includes("Counter"))
  }
  return list.map(w => ({ id: w.id, label: w.name }))
})

const headers = [
  { title: 'Sản phẩm', key: 'productName', width: '25%' },
  { title: 'SKU', key: 'productSKU' },
  { title: 'Tồn kho', key: 'quantity', align: 'center' },
  { title: 'Ngưỡng báo động', key: 'minStockThreshold', align: 'center' },
  { title: 'Giá nhập/vốn', key: 'costPrice', align: 'end' },
  { title: 'Giá trị tồn', key: 'totalValue', align: 'end' },
  { title: 'Lần cuối', key: 'lastUpdated', width: '150px' },
  { title: 'Thao tác', key: 'actions', sortable: false, align: 'end' }
]

const productOptions = computed(() => 
  billingStore.products.filter(p => p.trackInventory).map(p => ({ id: p.id, label: `${p.name} (SKU: ${p.sku || 'N/A'})` }))
)

const assetOptions = computed(() => 
  equipmentStore.equipments.map(e => ({ id: e.id, label: e.name }))
)

const selectedProductInfo = computed(() => {
  if (transaction.value.isAsset) {
    return equipmentStore.equipments.find(e => e.id === transaction.value.productId)
  }
  return billingStore.products.find(p => p.id === transaction.value.productId)
})

// Auto-fill price when product changes
watch(() => transaction.value.productId, (newId) => {
  if (newId && selectedProductInfo.value) {
    // Assets use 'purchasePrice', consumables use 'costPrice'
    const defaultPrice = transaction.value.isAsset 
      ? (selectedProductInfo.value.purchasePrice || 0)
      : (selectedProductInfo.value.costPrice || selectedProductInfo.value.CostPrice || 0)
    
    transaction.value.unitPrice = defaultPrice
  }
})

// Reset when switching between goods and assets
watch(() => transaction.value.isAsset, () => {
  transaction.value.productId = null
  transaction.value.unitPrice = 0
})

const filterByWarehouse = () => {
  inventoryStore.fetchInventories(selectedWarehouseId.value, includeAssets.value)
  inventoryStore.fetchTransactions(null, selectedWarehouseId.value)
}

const loadAlerts = async () => {
  const res = await inventoryStore.fetchAlerts()
  if (res.success) stockAlerts.value = res.data
}

const openTransactionDialog = (type, item = null) => {
  txType.value = type
  const isAsset = item?.productName.includes('[TÀI SẢN]') || false
  
  let productId = item?.productId || null;
  // For assets, the ID might be directly on the item
  if (isAsset && item && !item.productId) {
    productId = item.id
  }
  
  transaction.value = { 
    productId: productId, 
    quantity: 1, 
    unitPrice: item?.costPrice || 0, 
    note: '', 
    referenceNumber: '', 
    fromWarehouseId: item?.warehouseId || null, 
    toWarehouseId: null,
    isAsset: isAsset
  }

  // Auto-select the correct product/asset dropdown
  if(txType.value === 1) { // Import
      transaction.value.isAsset = isAsset;
  }
  
  txDialog.value = true
}

const openSupplyDialog = () => {
  newSupply.value = { name: '', unit: 'Cái', costPrice: 0, initialQuantity: 0, description: '', warehouseId: DEFAULT_WAREHOUSE_ID }
  supplyDialog.value = true
}

const handleCreateSupply = async () => {
  const { valid } = await supplyFormRef.value.validate()
  if (!valid) return

  const res = await inventoryStore.createInternalSupply(newSupply.value)
  if (res.success) {
    showSnack(res.message)
    supplyDialog.value = false
    inventoryStore.fetchInventories(selectedWarehouseId.value, includeAssets.value)
    inventoryStore.fetchTransactions(null, selectedWarehouseId.value)
  } else {
    showSnack(res.message, 'error')
  }
}

const handleTransaction = async () => {
  const { valid } = await txFormRef.value.validate()
  if (!valid) return

  const payload = { 
    ...transaction.value, 
    type: txType.value,
    fromWarehouseId: DEFAULT_WAREHOUSE_ID,
    toWarehouseId: DEFAULT_WAREHOUSE_ID
  }
  let res;
  
  if (txType.value === 1) res = await inventoryStore.importStock(payload)
  else if (txType.value === 2) res = await inventoryStore.exportStock(payload)
  else if (txType.value === 4) res = await inventoryStore.transferStock(payload)
  else if (txType.value === 7) res = await inventoryStore.internalUseStock(payload)
  else res = await inventoryStore.stockAdjustment(payload)

  if (res.success) {
    showSnack(res.message)
    txDialog.value = false
    inventoryStore.fetchInventories(selectedWarehouseId.value, includeAssets.value)
    inventoryStore.fetchTransactions(null, selectedWarehouseId.value)
    loadAlerts()
  } else {
    showSnack(res.message, 'error')
  }
}

const viewHistory = (item) => {
  inventoryStore.fetchTransactions(item.productId, item.warehouseId)
  currentTab.value = 'history'
}

// Helpers
const showSnack = (msg, color = 'success') => snack.value = { show: true, message: msg, color }
const formatCurrency = (v) => v ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v) : '---'
const formatDateTime = (d) => d ? new Date(d).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : ''

const getStockColor = (quantity, minThreshold) => {
  if (quantity <= 0) return 'error'
  if (quantity <= minThreshold) return 'warning'
  return 'success'
}


const getTxColor = (t) => ({ 1: 'success', 2: 'error', 3: 'warning', 4: 'info', 7: 'deep-purple' }[t] || 'primary')
const getTxIcon = (t) => ({ 
  1: 'mdi-arrow-down-bold-circle', 
  2: 'mdi-arrow-up-bold-circle', 
  3: 'mdi-autorenew', 
  4: 'mdi-swap-horizontal-bold',
  7: 'mdi-hand-heart'
}[t] || 'mdi-circle')

const getTxSymbol = (t) => ({ 1: '+', 2: '-', 7: '-' }[t] || '')

const getTxBg = (t) => {
  const colors = { 1: 'bg-success', 2: 'bg-error', 3: 'bg-warning', 4: 'bg-info', 7: 'bg-deep-purple' }
  return `${colors[t] || 'bg-primary'} text-white`
}

const getTxTitle = (t) => ({ 
  1: 'NHẬP KHO', 
  2: 'XUẤT BÁN', 
  3: 'ĐIỀU CHỈNH KHO', 
  4: 'ĐIỀU CHUYỂN NỘI BỘ',
  7: 'XUẤT DÙNG NỘI BỘ'
}[t] || 'Giao dịch Kho')

const getTxTypeName = (t) => ({ 
  1: 'Nhập kho', 
  2: 'Xuất kho', 
  3: 'Điều chỉnh', 
  4: 'Điều chuyển',
  7: 'Xuất dùng',
  8: 'Trả hàng'
}[t] || 'Khác')

onMounted(async () => {
  await Promise.all([
    billingStore.fetchProducts(),
    inventoryStore.fetchWarehouses(),
    equipmentStore.fetchEquipments()
  ])
  inventoryStore.fetchInventories(null, includeAssets.value)
  inventoryStore.fetchTransactions()
  loadAlerts()
})
</script>

<style scoped>
.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.italic { font-style: italic; }

/* Custom Scrollbar for specific areas if needed */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}
</style>
