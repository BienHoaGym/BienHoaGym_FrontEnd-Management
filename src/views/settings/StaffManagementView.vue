<template>
  <v-container fluid>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Quản lý Nhân sự</h1>
        <p class="text-subtitle-1 text-grey mt-1">Quản lý tài khoản, vai trò và thông tin nhân viên toàn hệ thống</p>
      </div>
      <v-btn color="primary" size="large" prepend-icon="mdi-account-plus" @click="openCreate" class="text-capitalize rounded-lg shadow-sm">
        Thêm nhân viên mới
      </v-btn>
    </div>

    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Tìm theo tên, username, email..."
          variant="outlined"
          density="comfortable"
          hide-details
          rounded="lg"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="roleFilter"
          :items="roleOptions"
          label="Lọc theo vai trò"
          variant="outlined"
          density="comfortable"
          hide-details
          rounded="lg"
          clearable
        ></v-select>
      </v-col>
    </v-row>

    <v-card class="rounded-xl border shadow-sm">
      <v-data-table
        :headers="headers"
        :items="filteredStaff"
        :loading="loading"
        :search="search"
        hover
      >
        <template #[`item.fullName`]="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar :color="getRoleColor(item.role)" variant="tonal" size="40" class="mr-3">
              <v-img v-if="item.profilePhoto" :src="getFullImageUrl(item.profilePhoto)" cover />
              <v-icon v-else size="20">{{ getRoleIcon(item.role) }}</v-icon>
            </v-avatar>
            <div>
              <div class="font-weight-bold">{{ item.fullName }}</div>
              <div class="text-caption text-grey">{{ item.username }}</div>
            </div>
          </div>
        </template>

        <template #[`item.roles`]="{ item }">
          <v-chip-group>
            <v-chip v-for="r in item.roles" :key="r" size="x-small" label :color="getRoleColor(r)" variant="flat">
              {{ translateRole(r) }}
            </v-chip>
          </v-chip-group>
        </template>

        <template #[`item.isActive`]="{ item }">
          <v-chip :color="item.isActive ? 'success' : 'error'" size="x-small" variant="tonal">
            {{ item.isActive ? 'Hoạt động' : 'Tạm khóa' }}
          </v-chip>
        </template>

        <template #[`item.actions`]="{ item }">
          <div class="d-flex justify-end gap-1">
            <v-btn icon="mdi-account-details-outline" variant="text" size="small" color="info" :to="{ name: 'StaffDetail', params: { id: item.id } }" title="Xem hồ sơ nhân sự"></v-btn>
            <v-btn icon="mdi-pencil" variant="text" size="small" color="primary" @click="openEdit(item)" title="Chỉnh sửa"></v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Staff Dialog -->
    <v-dialog v-model="formDialog" max-width="700" persistent scrollable>
      <v-card class="rounded-xl">
        <v-toolbar color="primary" class="px-4">
          <v-toolbar-title>{{ isEdit ? 'Cập nhật nhân viên' : 'Thêm nhân viên mới' }}</v-toolbar-title>
          <v-spacer />
          <v-btn icon="mdi-close" @click="formDialog = false"></v-btn>
        </v-toolbar>

        <v-card-text class="pa-6">
          <v-form ref="formRef">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.username"
                  label="Username *"
                  variant="outlined"
                  :disabled="isEdit"
                  rounded="lg"
                  density="comfortable"
                  placeholder="admin_01"
                ></v-text-field>
              </v-col>
              <v-col v-if="!isEdit" cols="12" md="6">
                <v-text-field
                  v-model="form.password"
                  label="Mật khẩu *"
                  type="password"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.fullName"
                  label="Họ và tên nhân viên *"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.email"
                  label="Email *"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <div class="d-flex align-center gap-4">
                  <v-avatar size="64" class="border" rounded="lg">
                    <v-img v-if="form.profilePhoto" :src="getFullImageUrl(form.profilePhoto)" cover />
                    <v-icon v-else>mdi-account</v-icon>
                  </v-avatar>
                  <v-file-input
                    label="Tải lên ảnh chân dung"
                    variant="outlined"
                    rounded="lg"
                    density="comfortable"
                    prepend-inner-icon="mdi-camera"
                    accept="image/*"
                    hide-details
                    @change="handleFileChange"
                    :loading="uploading"
                    :disabled="saving"
                  ></v-file-input>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.phoneNumber"
                  label="Số điện thoại"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.roleIds"
                  :items="roleOptionsList"
                  item-title="roleName"
                  item-value="id"
                  label="Vai trò (Roles) *"
                  multiple
                  chips
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                ></v-select>
              </v-col>

              <!-- --- TRAINER SPECIFIC FIELDS --- -->
              <v-col cols="12" v-if="isTrainerSelected">
                <v-divider class="mb-4"></v-divider>
                <div class="text-subtitle-2 font-weight-bold text-primary mb-3">THÔNG TIN CHUYÊN MÔN (Dành cho Huấn luyện viên)</div>
                <v-row dense>
                  <v-col cols="12" md="6">
                    <v-text-field v-model="form.specialization" label="Chuyên môn" variant="outlined" rounded="lg" density="comfortable" placeholder="Gym, Yoga, Boxing..."></v-text-field>
                  </v-col>
                  <v-col cols="12" md="3">
                    <v-text-field v-model.number="form.experienceYears" type="number" label="Kinh nghiệm" variant="outlined" rounded="lg" density="comfortable" suffix="năm"></v-text-field>
                  </v-col>
                  <v-col cols="12" md="3">
                    <v-text-field v-model.number="form.salary" type="number" label="Lương" variant="outlined" rounded="lg" density="comfortable" prefix="VND"></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-switch v-model="form.isPublic" label="Công khai trên Website Marketing" color="primary" inset density="compact" hide-details></v-switch>
                    <div class="text-caption text-grey mt-1 ml-10">Khi bật, hồ sơ HLV sẽ xuất hiện trên trang chủ Marketing</div>
                  </v-col>
                </v-row>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.identityNumber"
                  label="Số CCCD/CMND"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                  placeholder="038..."
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.gender"
                  :items="['Nam', 'Nữ', 'Khác']"
                  label="Giới tính"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.birthDate"
                  label="Ngày sinh"
                  type="date"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.hireDate"
                  label="Ngày tuyển dụng"
                  type="date"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="form.address"
                  label="Địa chỉ thường trú"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.bankName"
                  label="Tên ngân hàng"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                  placeholder="Vietcombank, MB..."
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.bankCardNumber"
                  label="Số tài khoản ngân hàng"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <v-col v-if="isEdit" cols="12">
                <v-switch v-model="form.isActive" label="Trạng thái hoạt động" color="success" inset density="compact"></v-switch>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4 bg-grey-lighten-4">
          <v-spacer />
          <v-btn variant="text" @click="formDialog = false">Hủy</v-btn>
          <v-btn color="primary" variant="flat" :loading="saving" @click="handleSave" class="px-8 rounded-lg">
            {{ isEdit ? 'Lưu cập nhật' : 'Tạo nhân viên' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snack.show" :color="snack.color" location="top right">{{ snack.message }}</v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { userService } from '@/services/userService'
import { roleService } from '@/services/roleService'
import { uploadService } from '@/services/uploadService'

const route = useRoute()

const loading = ref(false)
const saving = ref(false)
const uploading = ref(false)
const staff = ref([])
const roles = ref([])
const search = ref('')
const roleFilter = ref(null)
const snack = ref({ show: false, message: '', color: 'success' })

const isTrainerSelected = computed(() => {
  const trainerRole = roleOptionsList.value.find(r => r.roleName === 'Trainer')
  return trainerRole && form.value.roleIds.includes(trainerRole.id)
})

const getFullImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return (import.meta.env.VITE_API_URL || 'http://localhost:10000/api').split('/api')[0] + url
}

const handleFileChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  uploading.value = true
  try {
    const res = await uploadService.uploadProfilePhoto(file)
    if (res.url) {
      form.value.profilePhoto = res.url
      showSnack('Tải ảnh lên thành công!')
    }
  } catch (e) {
    showSnack('Lỗi khi tải ảnh lên', 'error')
  } finally {
    uploading.value = false
  }
}

const formDialog = ref(false)
const isEdit = ref(false)
const defaultForm = {
  id: '', username: '', password: '', fullName: '', email: '', phoneNumber: '',
  roleIds: [], isActive: true, specialization: '', experienceYears: 0, salary: 0,
  identityNumber: '', address: '', birthDate: null, gender: 'Nam', hireDate: null,
  bankCardNumber: '', bankName: '', profilePhoto: '', isPublic: false
}
const form = ref({ ...defaultForm })

// Helper for date formatting for input type="date"
const formatDateForInput = (dateString) => {
  if (!dateString) return null
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}

const headers = [
  { title: 'Nhân viên / Username', key: 'fullName' },
  { title: 'Email / Liên hệ', key: 'email' },
  { title: 'Vai trò', key: 'roles' },
  { title: 'Trạng thái', key: 'isActive' },
  { title: 'Thao tác', key: 'actions', align: 'end', sortable: false }
]

const roleOptions = ['Admin', 'Manager', 'Receptionist', 'Trainer']
const roleOptionsList = ref([])

const filteredStaff = computed(() => {
  return staff.value.filter(u => {
    // Không hiện Member trong bản quản lý nhân sự cấp cao
    if (u.roles.includes('Member')) return false
    if (roleFilter.value && !u.roles.includes(roleFilter.value)) return false
    return true
  })
})

const fetchRoles = async () => {
  const r = await roleService.getAll()
  if (r.success) roleOptionsList.value = r.data
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await userService.getAll()
    if (res.success) staff.value = res.data
  } finally { loading.value = false }
}

onMounted(async () => {
  await fetchData()
  await fetchRoles()
  
  // Kiểm tra nếu có query edit thì mở dialog Edit ngay
  if (route.query.edit) {
    const item = staff.value.find(s => s.id === route.query.edit)
    if (item) openEdit(item)
  }
})

const openCreate = () => {
  isEdit.value = false
  form.value = { ...defaultForm }
  formDialog.value = true
}

const openEdit = (item) => {
  isEdit.value = true
  form.value = { 
    ...item,
    birthDate: formatDateForInput(item.birthDate),
    hireDate: formatDateForInput(item.hireDate)
  }
  formDialog.value = true
}

const handleSave = async () => {
  saving.value = true
  try {
    const res = isEdit.value 
      ? await userService.update(form.value.id, form.value)
      : await userService.create(form.value)
      
    if (res.success) {
      showSnack('Lưu thông tin nhân sự thành công!')
      formDialog.value = false
      fetchData()
    } else {
      showSnack(res.message, 'error')
    }
  } finally { saving.value = false }
}

const getRoleColor = (role) => {
  switch (role) {
    case 'Admin': return 'red'
    case 'Manager': return 'orange'
    case 'Receptionist': return 'blue'
    case 'Trainer': return 'success'
    default: return 'grey'
  }
}

const getRoleIcon = (role) => {
  switch (role) {
    case 'Admin': return 'mdi-crown'
    case 'Manager': return 'mdi-account-tie'
    case 'Receptionist': return 'mdi-face-agent'
    case 'Trainer': return 'mdi-dumbbell'
    default: return 'mdi-account'
  }
}

const translateRole = (role) => {
  const map = {
    'Admin': 'Quản trị viên',
    'Manager': 'Quản lý',
    'Receptionist': 'Lễ tân',
    'Trainer': 'Huấn luyện viên',
    'Member': 'Hội viên'
  }
  return map[role] || role
}

const showSnack = (msg, color = 'success') => {
  snack.value = { show: true, message: msg, color }
}
</script>

<style scoped>
.gap-1 { gap: 4px; }
</style>
