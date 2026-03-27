<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Quản lý Sản phẩm & Dịch vụ</h1>
        <p class="text-subtitle-1 text-grey mt-1">Đăng ký và quản lý danh mục hàng hóa, gói PT, và vật tư gym</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" size="large" @click="openCreateDialog">
        Thêm sản phẩm mới
      </v-btn>
    </div>

    <!-- Quick Stats / Tabs -->
    <!-- Quick Stats / Tabs - REMOVED Gói tập/dịch vụ as requested -->
    <v-tabs v-model="activeTab" color="primary" class="mb-6">
      <v-tab :value="null">
        <v-icon start>mdi-basket-outline</v-icon> HÀNG BÁN LẺ (PHỤ KIỆN, NƯỚC UỐNG...)
      </v-tab>
    </v-tabs>

    <v-row>
      <v-col cols="12">
        <v-card class="rounded-xl border shadow-sm">
          <v-data-table
            :headers="headers"
            :items="filteredProducts"
            :loading="productStore.loading"
            :search="search"
            hover
          >
            <template v-slot:top>
              <v-toolbar flat color="transparent" class="px-4 py-2">
                <v-text-field
                  v-model="search"
                  prepend-inner-icon="mdi-magnify"
                  label="Tìm theo tên, SKU hoặc mã vạch..."
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="rounded-lg mr-4"
                  style="max-width: 400px"
                ></v-text-field>
                <v-select
                  v-model="selectedCategory"
                  :items="['Tất cả danh mục', ...productStore.categories]"
                  label="Danh mục"
                  variant="outlined"
                  density="compact"
                  hide-details
                  style="max-width: 200px"
                  class="mr-4"
                ></v-select>
                <v-spacer />
                <v-btn icon="mdi-refresh" variant="text" @click="fetchData"></v-btn>
              </v-toolbar>
            </template>

            <template #[`item.name`]="{ item }">
              <div class="d-flex align-center py-2">
                <v-avatar size="40" :color="getTypeColor(item.type)" variant="tonal" class="mr-3">
                  <v-icon size="20">{{ getTypeIcon(item.type) }}</v-icon>
                </v-avatar>
                <div>
                  <div class="font-weight-bold">{{ item.name }}</div>
                  <div class="text-caption text-grey">SKU: {{ item.sku }} | Barcode: {{ item.barcode || '---' }}</div>
                </div>
              </div>
            </template>

            <template #[`item.type`]="{ item }">
              <v-chip :color="getTypeColor(item.type)" size="x-small" label class="font-weight-bold">
                {{ getTypeText(item.type) }}
              </v-chip>
            </template>

            <template #[`item.price`]="{ item }">
              <div class="font-weight-bold text-primary">{{ formatPrice(item.price) }}</div>
              <div class="text-caption text-grey italic" v-if="item.costPrice > 0">Vốn: {{ formatPrice(item.costPrice) }}</div>
            </template>

            <template #[`item.stockQuantity`]="{ item }">
              <div v-if="item.trackInventory">
                <v-chip :color="getStockColor(item)" size="small" class="font-weight-bold">
                  {{ item.stockQuantity }} {{ item.unit }}
                </v-chip>
              </div>
              <div v-else class="text-grey text-caption">N/A (Dịch vụ)</div>
            </template>

            <template #[`item.isActive`]="{ item }">
              <v-switch
                :model-value="item.isActive"
                color="success"
                density="compact"
                hide-details
                @click.stop="toggleStatus(item)"
              ></v-switch>
            </template>

            <template #[`item.actions`]="{ item }">
              <v-btn icon="mdi-pencil-outline" variant="text" color="primary" size="small" @click="openEditDialog(item)"></v-btn>
              <v-btn icon="mdi-delete-outline" variant="text" color="error" size="small" @click="deleteItem(item)"></v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Product Form Dialog -->
    <v-dialog v-model="formDialog" max-width="900" persistent scrollable transition="dialog-bottom-transition">
      <v-card class="rounded-xl overflow-hidden" max-height="90vh">
        <v-card-title class="pa-6 bg-grey-lighten-4 d-flex align-center border-b">
          <v-icon class="mr-3">{{ isEdit ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
          <span class="font-weight-bold">{{ isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới' }}</span>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="formDialog = false"></v-btn>
        </v-card-title>
        
        <v-card-text class="pa-6 overflow-y-auto bg-white">
          <v-form ref="formRef">
            <v-row>
              <v-col cols="12">
                <div class="text-subtitle-2 mb-2 text-primary font-weight-bold">
                  <v-icon start>mdi-basket</v-icon> THÊM DANH MỤC HÀNG BÁN LẺ (NƯỚC, WHEY, PHỤ KIỆN...)
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedItem.name"
                  label="Tên sản phẩm/dịch vụ *"
                  variant="outlined"
                  :rules="[v => !!v || 'Bắt buộc']"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="editedItem.sku"
                  label="Mã SKU (Tự sinh nếu trống)"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="editedItem.barcode"
                  label="Mã vạch (Quét barcode)"
                  variant="outlined"
                  prepend-inner-icon="mdi-barcode-scan"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="4">
                <v-combobox
                  v-model="editedItem.category"
                  label="Danh mục / Nhóm"
                  :items="productStore.categories"
                  variant="outlined"
                ></v-combobox>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="editedItem.unit"
                  label="Đơn vị tính *"
                  variant="outlined"
                  placeholder="Cái, Chai, kg, Buổi, Tháng..."
                  :rules="[v => !!v || 'Bắt buộc']"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="editedItem.providerId"
                  label="Nhà cung cấp"
                  :items="providerOptions"
                  item-title="label"
                  item-value="id"
                  variant="outlined"
                  clearable
                ></v-select>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="editedItem.price"
                  label="Giá bán niêm yết *"
                  type="number"
                  variant="outlined"
                  suffix="VNĐ"
                  :rules="[v => !!v || 'Bắt buộc']"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="editedItem.costPrice"
                  label="Giá vốn (Giá nhập dự kiến)"
                  type="number"
                  variant="outlined"
                  suffix="VNĐ"
                ></v-text-field>
              </v-col>

              <!-- Optional Inventory Controls -->
              <v-col cols="12" v-if="editedItem.type !== 1">
                <v-expand-transition>
                  <v-card variant="tonal" color="primary" class="pa-4">
                    <div class="d-flex align-center mb-2">
                      <v-checkbox v-model="editedItem.trackInventory" label="Theo dõi tồn kho (Manual) " hide-details density="compact"></v-checkbox>
                      <v-tooltip text="Nếu bật, hệ thống sẽ cảnh báo khi số lượng xuống thấp">
                        <template v-slot:activator="{ props }">
                          <v-icon v-bind="props" size="small" class="ml-2">mdi-help-circle-outline</v-icon>
                        </template>
                      </v-tooltip>
                    </div>
                    <v-row v-if="editedItem.trackInventory">
                      <v-col cols="6">
                        <v-text-field v-model.number="editedItem.minStockThreshold" label="Ngưỡng tồn tối thiểu" type="number" variant="outlined" density="compact"></v-text-field>
                      </v-col>
                      <v-col cols="6">
                        <v-text-field v-model.number="editedItem.maxStockThreshold" label="Ngưỡng tồn tối đa" type="number" variant="outlined" density="compact"></v-text-field>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-expand-transition>
              </v-col>


              <v-col cols="12">
                <v-textarea v-model="editedItem.description" label="Mô tả chi tiết" variant="outlined" rows="2"></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider />
        <v-card-actions class="pa-6 border-t bg-grey-lighten-5">
          <v-spacer />
          <v-btn variant="text" size="large" @click="formDialog = false" class="px-6">Hủy bỏ</v-btn>
          <v-btn color="primary" size="large" variant="flat" :loading="productStore.saving" @click="saveItem" class="px-8 rounded-lg">
            {{ isEdit ? 'Cập nhật' : 'Thêm sản phẩm' }}
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
import { useProductStore } from '@/stores/product'
import { useInventoryStore } from '@/stores/inventory'
import providerService from '@/services/providerService'

const productStore = useProductStore()
const inventoryStore = useInventoryStore()
const providers = ref([])

const search = ref('')
const activeTab = ref(null) // null means 'All'
const selectedCategory = ref('Tất cả danh mục')
const formDialog = ref(false)
const formRef = ref(null)
const isEdit = ref(false)
const snack = ref({ show: false, message: '', color: 'success' })

const defaultItem = {
  name: '',
  description: '',
  sku: '',
  barcode: '',
  price: 0,
  costPrice: 0,
  unit: 'Cái',
  type: 3, // Retail
  trackInventory: true,
  minStockThreshold: 5,
  maxStockThreshold: 100,
  durationDays: null,
  sessionCount: null,
  category: '',
  providerId: null,
  isActive: true
}

const editedItem = ref({ ...defaultItem })

const headers = [
  { title: 'Sản phẩm', key: 'name' },
  { title: 'Loại', key: 'type', width: '120px' },
  { title: 'Danh mục', key: 'category' },
  { title: 'Đơn giá', key: 'price', align: 'end' },
  { title: 'Hiện có', key: 'stockQuantity', align: 'center' },
  { title: 'Trạng thái', key: 'isActive', align: 'center', sortable: false },
  { title: 'Thao tác', key: 'actions', sortable: false, align: 'end' }
]

const filteredProducts = computed(() => {
  // Chỉ hiển thị Hàng bán lẻ (Type 3)
  let list = productStore.products.filter(p => !p.isDeleted && p.type === 3) 

  if (selectedCategory.value !== 'Tất cả danh mục') {
    list = list.filter(p => p.category === selectedCategory.value)
  }

  return list
})

const providerOptions = computed(() => 
  providers.value.map(p => ({ id: p.id, label: p.name }))
)

const fetchProviders = async () => {
  try {
    const res = await providerService.getAll()
    if (res.success || res.Success) {
      providers.value = res.data || res.Data || []
    }
  } catch (error) {
    console.error('Error fetching providers:', error)
  }
}

const fetchData = async () => {
  await productStore.fetchProducts()
  await productStore.fetchCategories()
}

const openCreateDialog = () => {
  isEdit.value = false
  editedItem.value = { ...defaultItem, type: 3 } // Default to Retail
  formDialog.value = true
}

const openEditDialog = (item) => {
  isEdit.value = true
  editedItem.value = { ...item }
  formDialog.value = true
}

const saveItem = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  let res;
  if (isEdit.value) {
    res = await productStore.updateProduct(editedItem.value.id, editedItem.value)
  } else {
    res = await productStore.createProduct(editedItem.value)
  }

  if (res.success) {
    showSnack(res.message)
    formDialog.value = false
  } else {
    showSnack(res.message, 'error')
  }
}

const toggleStatus = async (item) => {
  const res = await productStore.toggleStatus(item.id)
  if (res.success) showSnack(res.message)
}

const deleteItem = async (item) => {
  if (confirm(`Bạn có chắc muốn xóa sản phẩm "${item.name}"? (Sẽ xóa mềm)`)) {
    const res = await productStore.deleteProduct(item.id)
    if (res.success) showSnack(res.message)
    else showSnack(res.message, 'error')
  }
}

// Helpers
const showSnack = (msg, color = 'success') => snack.value = { show: true, message: msg, color }
const formatPrice = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)
const getTypeColor = (t) => ({ 1: 'info', 2: 'blue-grey', 3: 'success' }[t] || 'primary')
const getTypeIcon = (t) => ({ 1: 'mdi-ticket-account', 2: 'mdi-hand-heart', 3: 'mdi-basket' }[t] || 'mdi-package')
const getTypeText = (t) => ({ 1: 'Gói tập / Dịch vụ', 2: 'Vật tư nội bộ', 3: 'Hàng bán lẻ' }[t] || 'Sản phẩm')
const getStockColor = (item) => {
  if (item.stockQuantity <= item.minStockThreshold) return 'error'
  if (item.stockQuantity <= item.minStockThreshold * 2) return 'warning'
  return 'grey-darken-3'
}

onMounted(async () => {
  fetchData()
  fetchProviders()
})
</script>

<style scoped>
.v-data-table :deep(thead th) {
  font-weight: 700 !important;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  background-color: #f9fafb !important;
}
</style>
