<template>
  <v-container fluid class="pa-0">
    <!-- Header -->
    <v-card class="mb-4 bg-grey-darken-4 elevation-2 rounded-lg" border>
      <v-card-text class="d-flex align-center flex-wrap gap-4 py-4">
        <div class="flex-grow-1">
          <h2 class="text-h5 font-weight-bold mb-1">Phân loại thiết bị</h2>
          <div class="text-subtitle-2 text-grey-lighten-1">Quản lý nhóm máy, chi phí và bảo hành tiêu chuẩn</div>
        </div>

        <div class="d-flex align-center gap-2 flex-grow-1" style="max-width: 600px">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            label="Tìm kiếm theo tên, mã..."
            variant="solo-filled"
            density="comfortable"
            hide-details
            rounded="lg"
            class="flex-grow-1"
            clearable
            @update:model-value="onFilterChanged"
          ></v-text-field>
          <v-select
            v-model="selectedGroup"
            :items="['Tất cả nhóm', ...groups]"
            label="Lọc theo nhóm"
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
          Thêm phân loại
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- Table -->
    <v-card class="elevation-2 rounded-lg" border>
      <v-data-table
        :headers="headers"
        :items="categories"
        :loading="loading"
        hover
        class="custom-table"
      >
        <template v-slot:item.equipmentCount="{ item }">
          <v-chip color="info" size="small" label variant="tonal" class="font-weight-bold">
            {{ item.equipmentCount }} máy
          </v-chip>
        </template>

        <template v-slot:item.avgMaintenanceCost="{ item }">
          {{ formatCurrency(item.avgMaintenanceCost) }}
        </template>

        <template v-slot:item.actions="{ item }">
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
    <v-dialog v-model="dialog" max-width="600px" persistent>
      <v-card rounded="lg" class="elevation-4">
        <v-toolbar color="primary" density="comfortable" flat>
          <v-toolbar-title class="font-weight-bold px-4">
            {{ editedIndex === -1 ? 'Thêm phân loại mới' : 'Chỉnh sửa phân loại' }}
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="closeDialog" class="mr-2"></v-btn>
        </v-toolbar>

        <v-card-text class="pa-6">
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.name"
                  label="Tên loại thiết bị*"
                  :rules="[v => !!v || 'Phải nhập tên']"
                  variant="outlined"
                  density="comfortable"
                  placeholder="VD: Cardio, Máy khối..."
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.code"
                  label="Mã loại (Để trống tự sinh)"
                  variant="outlined"
                  density="comfortable"
                  placeholder="Hệ thống tự sinh"
                  :disabled="editedIndex > -1 && editedItem.equipmentCount > 0"
                  persistent-placeholder
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="editedItem.group"
                  :items="groups"
                  label="Nhóm thiết bị"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.avgMaintenanceCost"
                  label="Chi phí bảo trì TB"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  suffix="VNĐ"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.standardWarrantyMonths"
                  label="Bảo hành tiêu chuẩn"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  suffix="Tháng"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editedItem.description"
                  label="Mô tả"
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
          <v-btn
            variant="text"
            color="grey-darken-1"
            class="text-none px-6"
            @click="closeDialog"
          >
            Hủy
          </v-btn>
          <v-btn
            color="primary"
            class="text-none px-6 font-weight-bold"
            elevation="1"
            :loading="saving"
            @click="save"
          >
            {{ editedIndex === -1 ? 'Tạo mới' : 'Cập nhật' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import equipmentCategoryService from '@/services/equipmentCategoryService'
import { formatCurrency } from '@/utils/helpers'

const headers = [
  { title: 'Tên loại', key: 'name', sortable: true },
  { title: 'Mã', key: 'code', sortable: true },
  { title: 'Nhóm', key: 'group', sortable: true },
  { title: 'Số lượng máy', key: 'equipmentCount', align: 'center' },
  { title: 'CP Bảo trì TB', key: 'avgMaintenanceCost', align: 'end' },
  { title: 'BH Tiêu chuẩn', key: 'standardWarrantyMonths', align: 'center' },
  { title: 'Thao tác', key: 'actions', sortable: false, align: 'end' }
]

const groups = ['Sức mạnh/Cơ bắp', 'Tim mạch (Cardio)', 'Tạ tự do', 'Phụ kiện/Dụng cụ hỗ trợ', 'Điện tử/Thông minh']

const categories = ref([])
const loading = ref(false)
const saving = ref(false)
const dialog = ref(false)
const valid = ref(false)
const form = ref(null)

const search = ref('')
const selectedGroup = ref('Tất cả nhóm')

const editedIndex = ref(-1)
const editedItem = ref({
  name: '',
  code: '',
  group: '',
  description: '',
  avgMaintenanceCost: 0,
  standardWarrantyMonths: 12
})

const defaultItem = {
  name: '',
  code: '',
  group: '',
  description: '',
  avgMaintenanceCost: 0,
  standardWarrantyMonths: 12
}

const fetchCategories = async () => {
  loading.value = true
  try {
    const params = {
      searchTerm: search.value || undefined,
      group: selectedGroup.value === 'Tất cả nhóm' ? undefined : selectedGroup.value
    }
    const res = await equipmentCategoryService.getAll(params)
    categories.value = res.data || []
  } catch (error) {
    console.error('Error fetching categories:', error)
  } finally {
    loading.value = false
  }
}

const onFilterChanged = () => {
  fetchCategories()
}

const openDialog = (item) => {
  if (item) {
    editedIndex.value = categories.value.indexOf(item)
    editedItem.value = { ...item }
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
      await equipmentCategoryService.update(editedItem.value.id, editedItem.value)
    } else {
      await equipmentCategoryService.create(editedItem.value)
    }
    await fetchCategories()
    closeDialog()
  } catch (error) {
    console.error('Error saving category:', error)
    alert(error.response?.data?.message || 'Có lỗi xảy ra')
  } finally {
    saving.value = false
  }
}

const confirmDelete = async (item) => {
  if (confirm(`Bạn có chắc chắn muốn xóa loại thiết bị "${item.name}"?`)) {
    try {
      await equipmentCategoryService.delete(item.id)
      await fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      alert(error.response?.data?.message || 'Không thể xóa loại thiết bị này')
    }
  }
}

onMounted(fetchCategories)
</script>

<style scoped>
.custom-table {
  border-radius: 8px;
}
</style>
