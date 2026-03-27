<template>
  <v-container fluid class="pa-0">
    <!-- Header -->
    <v-card class="mb-4 bg-grey-darken-4 elevation-2 rounded-lg" border>
      <v-card-text class="d-flex align-center flex-wrap gap-4 py-4">
        <div class="flex-grow-1">
          <h2 class="text-h5 font-weight-bold mb-1">Nhà cung cấp</h2>
          <div class="text-subtitle-2 text-grey-lighten-1">Quản lý đối tác cung cấp thiết bị và vật tư</div>
        </div>

        <div class="d-flex align-center gap-2 flex-grow-1" style="max-width: 600px">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            label="Tìm theo tên, mã, địa chỉ..."
            variant="solo-filled"
            density="comfortable"
            hide-details
            rounded="lg"
            class="flex-grow-1"
            clearable
            @update:model-value="onFilterChanged"
          ></v-text-field>

          <v-select
            v-model="selectedSupplyType"
            :items="['Tất cả loại', ...supplyTypes]"
            label="Loại cung cấp"
            variant="solo-filled"
            density="comfortable"
            hide-details
            rounded="lg"
            style="width: 200px"
            @update:model-value="onFilterChanged"
          ></v-select>
        </div>

        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          size="large"
          class="text-none font-weight-bold"
          rounded="lg"
          @click="openDialog()"
          elevation="2"
        >
          Thêm nhà cung cấp
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- Table -->
    <v-card class="elevation-2 rounded-lg" border>
      <v-data-table
        :headers="headers"
        :items="providers"
        :loading="loading"
        hover
        class="custom-table"
      >
        <template v-slot:item.supplyType="{ item }">
          <v-chip color="secondary" size="small" variant="outlined" label class="font-weight-medium">
            {{ item.supplyType }}
          </v-chip>
        </template>

        <template v-slot:item.contact="{ item }">
          <div class="d-flex flex-column">
            <span v-if="item.contactPerson" class="text-body-2 font-weight-black text-primary"><v-icon size="16" class="mr-1">mdi-account-tie</v-icon>{{ item.contactPerson }}</span>
            <span class="text-body-2 font-weight-bold"><v-icon size="16" class="mr-1">mdi-phone</v-icon>{{ item.phoneNumber || 'N/A' }}</span>
            <span class="text-caption text-grey"><v-icon size="14" class="mr-1">mdi-email-outline</v-icon>{{ item.email || 'N/A' }}</span>
          </div>
        </template>

        <template v-slot:item.isActive="{ item }">
          <v-chip 
            :color="item.isActive ? 'success' : 'grey'" 
            size="small" 
            variant="flat" 
            class="font-weight-bold"
          >
            {{ item.isActive ? 'Đang hợp tác' : 'Ngừng hợp tác' }}
          </v-chip>
        </template>

        <template v-slot:item.counts="{ item }">
          <div class="d-flex gap-2">
            <v-chip size="x-small" color="blue" variant="tonal">{{ item.equipmentCount }} TB</v-chip>
            <v-chip size="x-small" color="purple" variant="tonal">{{ item.productCount }} SP</v-chip>
          </div>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn
            icon="mdi-history"
            variant="text"
            size="small"
            color="info"
            class="mr-1"
            title="Xem hồ sơ & Danh mục hàng"
            @click="viewDetails(item)"
          ></v-btn>
          <v-btn
            icon="mdi-pencil"
            variant="text"
            size="small"
            color="primary"
            class="mr-1"
            @click="openDialog(item)"
          ></v-btn>
          <v-btn
            icon="mdi-delete"
            variant="text"
            size="small"
            color="error"
            @click="confirmDelete(item)"
          ></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog -->
    <v-dialog v-model="dialog" max-width="800px" persistent>
      <v-card rounded="lg" class="elevation-4">
        <v-toolbar color="primary" density="comfortable" flat>
          <v-toolbar-title class="font-weight-bold px-4">
            {{ editedIndex === -1 ? 'Nhà cung cấp mới' : 'Chỉnh sửa nhà cung cấp' }}
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="closeDialog" class="mr-2"></v-btn>
        </v-toolbar>

        <v-card-text class="pa-6">
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-row>
              <v-col cols="12" sm="8">
                <v-text-field
                  v-model="editedItem.name"
                  label="Tên nhà cung cấp*"
                  :rules="[v => !!v || 'Phải nhập tên']"
                  variant="outlined"
                  density="comfortable"
                  placeholder="VD: Cty CP Thể Thao ABC"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="editedItem.contactPerson"
                  label="Người liên hệ"
                  variant="outlined"
                  density="comfortable"
                  placeholder="VD: Nguyễn Văn A"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="editedItem.code"
                  label="Mã định danh (Tự sinh nếu trống)"
                  variant="outlined"
                  density="comfortable"
                  placeholder="Hệ thống tự sinh"
                  :disabled="editedIndex > -1 && (editedItem.equipmentCount > 0 || editedItem.productCount > 0)"
                ></v-text-field>
              </v-col>

              <v-divider class="my-2 px-12" />

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.phoneNumber"
                  label="Số điện thoại"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-phone"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.email"
                  label="Email"
                  type="email"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-email-outline"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="8">
                <v-text-field
                  v-model="editedItem.address"
                  label="Địa chỉ"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="editedItem.taxCode"
                  label="Mã số thuế"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="7">
                <v-text-field
                  v-model="editedItem.bankAccountNumber"
                  label="Số tài khoản ngân hàng"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-bank"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="5">
                <v-text-field
                  v-model="editedItem.bankName"
                  label="Tên ngân hàng"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-select
                  v-model="editedItem.supplyType"
                  :items="supplyTypes"
                  label="Loại hàng cung cấp"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-switch
                  v-model="editedItem.isActive"
                  label="Đang hợp tác"
                  color="success"
                  density="compact"
                  hide-details
                ></v-switch>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="editedItem.note"
                  label="Ghi chú / Hợp đồng"
                  variant="outlined"
                  density="comfortable"
                  rows="3"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="pa-6">
          <v-spacer></v-spacer>
          <v-btn variant="text" color="grey-darken-1" class="text-none px-6" @click="closeDialog">Hủy</v-btn>
          <v-btn color="primary" class="text-none px-6 font-weight-bold" elevation="1" :loading="saving" @click="save">
            {{ editedIndex === -1 ? 'Lưu mới' : 'Cập nhật' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Details Dialog (Portolio & History) -->
    <v-dialog v-model="detailsDialog" max-width="1000px" scrollable>
      <v-card rounded="xl" class="overflow-hidden">
        <v-toolbar color="grey-darken-4" flat>
          <v-avatar size="36" color="primary" variant="tonal" class="ml-4 mr-2">
            <v-icon size="20">mdi-domain</v-icon>
          </v-avatar>
          <v-toolbar-title class="font-weight-black text-body-1">Hồ sơ đối tác: {{ selectedProvider?.name }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="detailsDialog = false" class="mr-2"></v-btn>
        </v-toolbar>

        <v-tabs v-model="detailsTab" custom-class="bg-grey-darken-4 text-white" grow color="primary">
          <v-tab value="history"><v-icon start>mdi-history</v-icon> Lịch sử giao dịch</v-tab>
          <v-tab value="products"><v-icon start>mdi-basket-outline</v-icon> Sản phẩm ({{ suppliedProducts.length }})</v-tab>
          <v-tab value="equipments"><v-icon start>mdi-dumbbell</v-icon> Thiết bị ({{ suppliedEquipments.length }})</v-tab>
        </v-tabs>

        <v-divider />

        <v-card-text class="pa-0 bg-grey-lighten-4" style="height: 600px">
          <v-window v-model="detailsTab">
            <!-- Window Item: History -->
            <v-window-item value="history">
              <v-data-table
                :headers="historyHeaders"
                :items="transactionHistory"
                :loading="detailsLoading"
                hover
                class="bg-transparent"
              >
                <template #[`item.date`]="{ item }">
                  <div class="font-weight-medium">{{ new Date(item.date).toLocaleDateString('vi-VN') }}</div>
                </template>
                <template #[`item.totalAmount`]="{ item }">
                  <div class="font-weight-black text-primary">{{ formatCurrency(item.totalAmount) }}</div>
                </template>
                <template #[`item.status`]="{ item }">
                   <v-chip size="x-small" color="success" class="font-weight-bold" variant="flat">Hoàn tất</v-chip>
                </template>
              </v-data-table>
            </v-window-item>

            <!-- Window Item: Products -->
            <v-window-item value="products">
              <v-data-table
                :headers="[
                  { title: 'Tên sản phẩm', key: 'name' },
                  { title: 'SKU', key: 'sku' },
                  { title: 'Đơn vị', key: 'unit' },
                  { title: 'Giá niêm yết', key: 'price', align: 'end' }
                ]"
                :items="suppliedProducts"
                :loading="detailsLoading"
                hover
                class="bg-transparent"
              >
                <template #[`item.price`]="{ item }">
                  <span class="font-weight-bold">{{ formatCurrency(item.price) }}</span>
                </template>
              </v-data-table>
            </v-window-item>

            <!-- Window Item: Equipments -->
            <v-window-item value="equipments">
              <v-data-table
                :headers="[
                  { title: 'Tên thiết bị', key: 'name' },
                  { title: 'Mã', key: 'equipmentCode' },
                  { title: 'Loại', key: 'categoryName' },
                  { title: 'Vị trí', key: 'location' }
                ]"
                :items="suppliedEquipments"
                :loading="detailsLoading"
                hover
                class="bg-transparent"
              >
              </v-data-table>
            </v-window-item>
          </v-window>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import providerService from '@/services/providerService'
import { formatCurrency } from '@/utils/helpers'

const headers = [
  { title: 'Tên đối tác', key: 'name', sortable: true },
  { title: 'Mã', key: 'code', sortable: true },
  { title: 'Liên hệ', key: 'contact', sortable: false },
  { title: 'Loại cung cấp', key: 'supplyType', sortable: true },
  { title: 'Số lượng', key: 'counts', sortable: false },
  { title: 'Trạng thái', key: 'isActive', align: 'center' },
  { title: 'Thao tác', key: 'actions', sortable: false, align: 'end' }
]

 
const historyHeaders = [
  { title: 'Mã GD', key: 'transactionCode' },
  { title: 'Loại', key: 'type' },
  { title: 'Ngày', key: 'date' },
  { title: 'Giá trị', key: 'totalAmount', align: 'end' },
  { title: 'Trạng thái', key: 'status', align: 'center' }
]

const supplyTypes = ['Máy móc gym', 'Thực phẩm bổ sung', 'Điện tử/Thông minh', 'Dụng cụ cá nhân', 'Dịch vụ bảo trì']

const providers = ref([])
const loading = ref(false)
const saving = ref(false)
const dialog = ref(false)
const valid = ref(false)
const form = ref(null)

const search = ref('')
const selectedSupplyType = ref('Tất cả loại')

const detailsDialog = ref(false)
const detailsTab = ref('history')
const detailsLoading = ref(false)
const selectedProvider = ref(null)
const transactionHistory = ref([])
const suppliedProducts = ref([])
const suppliedEquipments = ref([])

const editedIndex = ref(-1)
const editedItem = ref({
  name: '',
  code: '',
  address: '',
  phoneNumber: '',
  email: '',
  taxCode: '',
  contactPerson: '',
  bankAccountNumber: '',
  bankName: '',
  supplyType: '',
  note: '',
  isActive: true
})

const defaultItem = {
  name: '',
  code: '',
  address: '',
  phoneNumber: '',
  email: '',
  taxCode: '',
  contactPerson: '',
  bankAccountNumber: '',
  bankName: '',
  supplyType: '',
  note: '',
  isActive: true
}

const fetchProviders = async () => {
  loading.value = true
  try {
    const params = {
      searchTerm: search.value || undefined,
      supplyType: selectedSupplyType.value === 'Tất cả loại' ? undefined : selectedSupplyType.value
    }
    const res = await providerService.getAll(params)
    providers.value = res.data || []
  } catch (error) {
    console.error('Error fetching providers:', error)
  } finally {
    loading.value = false
  }
}

const onFilterChanged = () => {
  fetchProviders()
}

const openDialog = async (item) => {
  if (item) {
    editedIndex.value = providers.value.indexOf(item)
    try {
        const res = await providerService.getById(item.id)
        editedItem.value = { ...res.data }
    } catch (e) {
        editedItem.value = { ...item }
    }
  } else {
    editedIndex.value = -1
    editedItem.value = { ...defaultItem }
  }
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
  editedItem.value = { ...defaultItem }
  editedIndex.value = -1
  if (form.value) form.value.resetValidation()
}

const save = async () => {
  const { valid: isValid } = await form.value.validate()
  if (!isValid) return

  saving.value = true
  try {
    if (editedIndex.value > -1) {
      await providerService.update(editedItem.value.id, editedItem.value)
    } else {
      await providerService.create(editedItem.value)
    }
    await fetchProviders()
    closeDialog()
  } catch (error) {
    console.error('Error saving provider:', error)
    const message = error.response?.data?.message || error.response?.data?.Message || 'Có lỗi xảy ra'
    const errors = error.response?.data?.errors?.join('\n') || ''
    alert(errors ? `${message}:\n${errors}` : message)
  } finally {
    saving.value = false
  }
}

const viewDetails = async (item) => {
  selectedProvider.value = item
  detailsDialog.value = true
  detailsTab.value = 'history'
  detailsLoading.value = true
  
  try {
    // Gọi song song 3 API để lấy hồ sơ đầy đủ
    const [historyRes, productsRes, equipmentsRes] = await Promise.all([
      providerService.getHistory(item.id),
      providerService.getProducts(item.id),
      providerService.getEquipments(item.id)
    ])
    
    transactionHistory.value = historyRes.data || []
    suppliedProducts.value = productsRes.data || []
    suppliedEquipments.value = equipmentsRes.data || []
  } catch (error) {
    console.error('Error fetching provider portfolio:', error)
  } finally {
    detailsLoading.value = false
  }
}

const confirmDelete = async (item) => {
  if (confirm(`Bạn có chắc chắn muốn xóa nhà cung cấp "${item.name}"?`)) {
    try {
      await providerService.delete(item.id)
      await fetchProviders()
    } catch (error) {
      console.error('Error deleting provider:', error)
      alert(error.response?.data?.message || 'Không thể xóa nhà cung cấp này')
    }
  }
}

onMounted(fetchProviders)
</script>

<style scoped>
.custom-table {
  border-radius: 8px;
}
</style>
