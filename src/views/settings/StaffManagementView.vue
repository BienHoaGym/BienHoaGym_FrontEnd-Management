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
              <v-icon size="20">{{ getRoleIcon(item.role) }}</v-icon>
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
            <v-btn icon="mdi-pencil" variant="text" size="small" color="primary" @click="openEdit(item)"></v-btn>
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
              <v-col cols="12" v-if="form.roleIds.includes(3)">
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
                </v-row>
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
import { ref, onMounted, computed } from 'vue'
import { userService } from '@/services/userService'
import { roleService } from '@/services/roleService'

const loading = ref(false)
const saving = ref(false)
const staff = ref([])
const roles = ref([])
const search = ref('')
const roleFilter = ref(null)
const snack = ref({ show: false, message: '', color: 'success' })

const formDialog = ref(false)
const isEdit = ref(false)
const form = ref({
  id: '', username: '', password: '', fullName: '', email: '', phoneNumber: '',
  roleIds: [], isActive: true, specialization: '', experienceYears: 0, salary: 0
})

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

onMounted(() => {
  fetchData()
  fetchRoles()
})

const openCreate = () => {
  isEdit.value = false
  form.value = {
    username: '', password: '', fullName: '', email: '', phoneNumber: '',
    roleIds: [], isActive: true, specialization: '', experienceYears: 0, salary: 0
  }
  formDialog.value = true
}

const openEdit = (item) => {
  isEdit.value = true
  form.value = { ...item }
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
    'Trainer': 'HLV (PT)',
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
