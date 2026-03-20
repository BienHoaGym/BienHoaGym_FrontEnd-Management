<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Quản lý Kho hàng</h1>
        <p class="text-subtitle-1 text-grey mt-1">Theo dõi hàng hóa, nhập xuất và tồn kho sản phẩm</p>
      </div>
      <div class="d-flex gap-2">
        <v-btn color="primary" prepend-icon="mdi-import" @click="openTransactionDialog(1)">
          Nhập kho
        </v-btn>
        <v-btn color="warning" prepend-icon="mdi-swap-horizontal" @click="openTransactionDialog(3)">
          Điều chỉnh
        </v-btn>
        <v-btn color="error" variant="tonal" prepend-icon="mdi-export" @click="openTransactionDialog(2)">
          Xuất kho
        </v-btn>
      </div>
    </div>

    <v-row>
      <v-col cols="12" md="3">
        <v-card class="rounded-xl border shadow-sm mb-4" color="error" theme="dark">
          <v-card-text class="d-flex align-center pa-4">
            <v-icon size="40" class="mr-4">mdi-alert-circle-outline</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">{{ stockAlerts.length }}</div>
              <div class="text-caption">Sản phẩm sắp hết</div>
            </div>
          </v-card-text>
        </v-card>

        <v-card class="rounded-xl border shadow-sm h-auto overflow-hidden">
          <v-card-title class="pa-4 border-b text-subtitle-1 font-weight-bold bg-grey-lighten-4 d-flex align-center">
            <v-icon color="error" class="mr-2">mdi-alert-decagram</v-icon>
            Cảnh báo tồn kho
          </v-card-title>
          <v-list class="pa-0">
            <v-list-item v-for="a in stockAlerts" :key="a.productId" class="border-b pa-4">
              <v-list-item-title class="font-weight-bold">{{ a.productName }}</v-list-item-title>
              <v-list-item-subtitle class="text-error font-weight-bold">
                Còn lại: {{ a.quantity }} (Ngưỡng: {{ getThreshold(a.productId) }})
              </v-list-item-subtitle>
            </v-list-item>
            <v-list-item v-if="!stockAlerts.length" class="text-center py-6 text-grey">
              Kho hàng ổn định
            </v-list-item>
          </v-list>
        </v-card>

        <v-card class="rounded-xl border shadow-sm mt-4 overflow-hidden">
          <v-card-title class="pa-4 border-b text-subtitle-1 font-weight-bold bg-amber-lighten-5 d-flex align-center">
            <v-icon color="amber-darken-2" class="mr-2">mdi-clock-alert</v-icon>
            Hết hạn / Sắp hết hạn
          </v-card-title>
          <v-list class="pa-0">
            <v-list-item v-for="p in expiringProducts" :key="p.id" class="border-b pa-4">
              <v-list-item-title class="font-weight-bold">{{ p.name }}</v-list-item-title>
              <v-list-item-subtitle :class="isExpired(p.expirationDate) ? 'text-error font-weight-bold' : 'text-amber-darken-3'">
                HSD: {{ formatDateShort(p.expirationDate) }}
              </v-list-item-subtitle>
            </v-list-item>
            <v-list-item v-if="!expiringProducts.length" class="text-center py-6 text-grey text-caption">
              Không có hàng sắp hết hạn
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="rounded-xl border shadow-sm">
          <v-card-title class="pa-4 d-flex align-center">
            Hàng hóa trong kho
            <v-spacer />
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Tìm sản phẩm..."
              variant="outlined"
              density="compact"
              hide-details
              style="max-width: 250px"
              class="rounded-lg"
            ></v-text-field>
          </v-card-title>
          
          <v-data-table
            :headers="headers"
            :items="inventoryStore.inventories"
            :search="search"
            :loading="inventoryStore.loading"
          >
            <template #[`item.productName`]="{ item }">
              <div class="d-flex align-center">
                <v-avatar size="32" color="primary" variant="tonal" class="mr-3 text-caption">
                   {{ item.productName.charAt(0) }}
                </v-avatar>
                <div>
                  <div class="font-weight-bold">{{ item.productName }}</div>
                  <div class="text-caption text-grey">SKU: {{ getSKU(item) }}</div>
                </div>
              </div>
            </template>
            
            <template #[`item.quantity`]="{ item }">
              <v-chip :color="getStockColor(item.quantity, item)" size="small" class="font-weight-bold">
                {{ item.quantity }}
              </v-chip>
            </template>

            <template #[`item.actions`]="{ item }">
              <v-tooltip text="Xem lịch sử">
                <template v-slot:activator="{ props }">
                  <v-btn v-bind="props" icon="mdi-history" variant="text" color="primary" @click="viewHistory(item)"></v-btn>
                </template>
              </v-tooltip>
            </template>
          </v-data-table>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="rounded-xl border shadow-sm">
          <v-card-title class="pa-4 border-b d-flex align-center">
            Biến động kho
            <v-spacer />
            <v-btn icon="mdi-refresh" variant="text" density="compact" @click="inventoryStore.fetchTransactions()"></v-btn>
          </v-card-title>
          <v-card-text class="pa-0" style="max-height: 500px; overflow-y: auto">
            <v-list lines="two">
              <v-list-item v-for="t in inventoryStore.transactions" :key="t.id">
                <template v-slot:prepend>
                  <v-icon :color="getTxColor(t.type)" size="small">
                    {{ getTxIcon(t.type) }}
                  </v-icon>
                </template>
                <v-list-item-title class="font-weight-bold text-body-2">
                  {{ t.productName }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-caption">
                  <span :class="`text-${getTxColor(t.type)} font-weight-bold` ">
                    {{ t.type === 1 ? '+' : (t.type === 2 ? '-' : '') }}{{ t.quantity }}
                  </span>
                  • {{ formatDateShort(t.date) }} <br/>
                  <span class="text-grey italic">{{ t.note || 'Không có ghi chú' }}</span>
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Transaction Dialog -->
    <v-dialog v-model="txDialog" max-width="500">
      <v-card class="rounded-xl">
        <v-card-title class="pa-6 font-weight-bold" :class="getTxBg(txType)">
          {{ getTxTitle(txType) }}
        </v-card-title>
        <v-card-text class="pa-6">
          <v-form ref="txForm">
            <v-select
              v-model="transaction.productId"
              label="Sản phẩm *"
              :items="productOptions"
              item-title="label"
              item-value="id"
              variant="outlined"
              :rules="[v => !!v || 'Bắt buộc']"
            ></v-select>
            <v-text-field
              v-model.number="transaction.quantity"
              label="Số lượng *"
              type="number"
              variant="outlined"
              :rules="[v => !!v || 'Bắt buộc', v => v > 0 || 'Số lượng > 0']"
            ></v-text-field>
            <v-text-field
              v-model="transaction.referenceNumber"
              label="Mã tham chiếu (Phiếu nhập/xuất)"
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

    <v-snackbar v-model="snack.show" :color="snack.color">
      {{ snack.message }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { useBillingStore } from '@/stores/billing'

const inventoryStore = useInventoryStore()
const billingStore = useBillingStore()

const search = ref('')
const txDialog = ref(false)
const txType = ref(1) // 1: Import, 2: Export, 3: Adjustment
const snack = ref({ show: false, message: '', color: 'success' })
const transaction = ref({ productId: null, quantity: 1, note: '', referenceNumber: '' })
const stockAlerts = ref([])

const expiringProducts = computed(() => {
  const today = new Date()
  const thirtyDaysLater = new Date()
  thirtyDaysLater.setDate(today.getDate() + 30)
  
  return billingStore.products.filter(p => 
    p.expirationDate && new Date(p.expirationDate) <= thirtyDaysLater
  ).sort((a,b) => new Date(a.expirationDate) - new Date(b.expirationDate))
})

const headers = [
  { title: 'Sản phẩm', key: 'productName' },
  { title: 'Tồn kho', key: 'quantity', align: 'center' },
  { title: 'Cập nhật cuối', key: 'lastUpdated' },
  { title: 'Lịch sử', key: 'actions', sortable: false }
]

const productOptions = computed(() => 
  billingStore.products.map(p => ({ id: p.id, label: p.name }))
)

const loadAlerts = async () => {
  const res = await inventoryStore.fetchAlerts()
  if (res.success) stockAlerts.value = res.data
}

const openTransactionDialog = (type) => {
  txType.value = type
  transaction.value = { productId: null, quantity: 1, note: '', referenceNumber: '' }
  txDialog.value = true
}

const handleTransaction = async () => {
  const payload = { ...transaction.value, type: txType.value }
  let res;
  if (txType.value === 1) res = await inventoryStore.importStock(payload)
  else if (txType.value === 2) res = await inventoryStore.exportStock(payload)
  else res = await inventoryStore.stockAdjustment(payload)

  if (res.success) {
    showSnack(res.message)
    txDialog.value = false
    inventoryStore.fetchTransactions()
    loadAlerts()
  } else {
    showSnack(res.message, 'error')
  }
}

const viewHistory = (item) => {
  inventoryStore.fetchTransactions(item.productId)
}

// Helpers
const showSnack = (msg, color = 'success') => snack.value = { show: true, message: msg, color }
const formatDate = (d) => d ? new Date(d).toLocaleString('vi-VN') : '---'
const formatDateShort = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : ''
const getStockColor = (q, item) => {
  const threshold = billingStore.products.find(p => p.id === item.productId)?.minStockThreshold || 5
  return q <= threshold ? 'error' : (q <= threshold * 2 ? 'warning' : 'success')
}
const getThreshold = (productId) => billingStore.products.find(p => p.id === productId)?.minStockThreshold || 5
const getSKU = (item) => billingStore.products.find(p => p.id === item.productId)?.sku || '---'
const isExpired = (date) => date && new Date(date) < new Date()

const getTxColor = (t) => ({ 1: 'success', 2: 'error', 3: 'warning' }[t])
const getTxIcon = (t) => ({ 1: 'mdi-arrow-down-bold-circle', 2: 'mdi-arrow-up-bold-circle', 3: 'mdi-autorenew' }[t])
const getTxBg = (t) => ({ 1: 'bg-success text-white', 2: 'bg-error text-white', 3: 'bg-warning text-white' }[t])
const getTxTitle = (t) => ({ 1: 'NHẬP KHO', 2: 'XUẤT KHO', 3: 'ĐIỀU CHỈNH KHO' }[t])

onMounted(async () => {
  await billingStore.fetchProducts()
  inventoryStore.fetchInventories()
  inventoryStore.fetchTransactions()
  loadAlerts()
})
</script>
