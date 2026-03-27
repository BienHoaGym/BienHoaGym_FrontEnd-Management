<template>
  <v-container fluid class="pa-0">
    <!-- Header -->
    <v-row class="mb-6 align-center">
      <v-col>
        <h1 class="text-h4 font-weight-bold mb-1">Thiết lập Phân quyền (RBAC)</h1>
        <div class="text-subtitle-1 text-grey">Quản lý vai trò và quyền hạn truy cập hệ thống</div>
      </v-col>
      <v-col cols="auto">
        <v-btn v-if="tab === 'roles'" color="primary" prepend-icon="mdi-plus" @click="openDialog()" elevation="2" rounded="lg">
          Thêm vai trò mới
        </v-btn>
      </v-col>
    </v-row>

    <!-- Tabs switcher -->
    <v-tabs v-model="tab" color="primary" align-tabs="start" class="mb-6">
      <v-tab value="roles" prepend-icon="mdi-security">Danh sách Vai trò & Quyền</v-tab>
      <v-tab value="users" prepend-icon="mdi-account-cog">Gán quyền cho Nhân viên</v-tab>
    </v-tabs>

    <v-window v-model="tab">
      <!-- WINDOW 1: ROLES MANAGEMENT -->
      <v-window-item value="roles">

    <!-- Roles List -->
    <v-row v-if="loading" justify="center" class="my-12">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </v-row>

    <v-row v-else>
      <v-col v-for="role in roles" :key="role.id" cols="12" md="6" lg="4">
        <v-card class="h-100 rounded-xl" elevation="3" border>
          <v-card-item class="pb-0">
            <template v-slot:prepend>
              <v-avatar color="primary" variant="tonal" size="48">
                <v-icon size="28">{{ getRoleIcon(role.roleName) }}</v-icon>
              </v-avatar>
            </template>
            <v-card-title class="text-h5 font-weight-bold mb-1">
              {{ translateRole(role.roleName) }}
            </v-card-title>
            <v-card-subtitle class="text-body-1 opacity-80">{{ role.description || 'Không có mô tả' }}</v-card-subtitle>

            <template v-slot:append>
              <v-menu v-if="role.roleName !== 'Admin'">
                <template v-slot:activator="{ props }">
                  <v-btn icon="mdi-dots-vertical" variant="text" v-bind="props"></v-btn>
                </template>
                <v-list density="compact">
                  <v-list-item prepend-icon="mdi-pencil" title="Sửa quyền hạn" @click="openDialog(role)"></v-list-item>
                  <v-divider></v-divider>
                  <v-list-item prepend-icon="mdi-delete" title="Xóa vai trò" base-color="error" @click="confirmDelete(role)"></v-list-item>
                </v-list>
              </v-menu>
              <v-chip v-else color="success" size="small" variant="flat">Hệ thống</v-chip>
            </template>
          </v-card-item>

          <v-card-text class="pt-4">
            <div class="d-flex align-center mb-3">
              <v-icon size="20" color="primary" class="mr-2">mdi-shield-check</v-icon>
              <span class="text-body-2 font-weight-bold text-uppercase">Quyền hạn ({{ role.permissions.length }})</span>
            </div>
            
            <div class="d-flex flex-wrap gap-2" style="max-height: 180px; overflow-y: auto;">
              <v-chip v-if="role.roleName === 'Admin'" color="red" size="small" label class="mr-1 mb-1 font-weight-bold">TOÀN QUYỀN (*)</v-chip>
              <v-chip
                v-else
                v-for="p in role.permissions"
                :key="p"
                size="small"
                variant="elevated"
                elevation="1"
                class="mr-1 mb-1 font-weight-medium"
                color="secondary"
              >
                {{ getPermissionLabel(p) }}
              </v-chip>
              <span v-if="role.permissions.length === 0 && role.roleName !== 'Admin'" class="text-body-2 text-grey italic">Chưa gán quyền</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
      </v-window-item>

      <!-- WINDOW 2: USER ROLE ASSIGNMENT -->
      <v-window-item value="users">
        <v-card class="rounded-xl" border elevation="2">
          <v-data-table
            :headers="userHeaders"
            :items="users"
            :loading="userLoading"
            hover
          >
            <template #item.fullName="{ item }">
              <div class="d-flex align-center py-2">
                <v-avatar color="primary" variant="tonal" size="32" class="mr-3">
                  {{ item.fullName?.charAt(0) }}
                </v-avatar>
                <div>
                  <div class="font-weight-bold">{{ item.fullName }}</div>
                  <div class="text-caption text-grey">{{ item.username }}</div>
                </div>
              </div>
            </template>

            <template #item.roles="{ item }">
              <v-chip-group>
                <v-chip v-for="r in item.roles" :key="r" size="x-small" label color="primary" variant="flat">
                  {{ translateRole(r) }}
                </v-chip>
                <div v-if="item.roles.length === 0" class="text-caption text-grey italic">Chưa có vai trò</div>
              </v-chip-group>
            </template>

            <template #item.action="{ item }">
              <v-btn size="small" variant="tonal" color="primary" prepend-icon="mdi-shield-edit" @click="openUserRoleDialog(item)">
                Gán vai trò
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-window-item>
    </v-window>

    <!-- Role Dialog -->
    <v-dialog v-model="dialog.show" max-width="800px" persistent scrollable>
      <v-card class="rounded-xl">
        <v-toolbar color="primary" class="px-4">
          <v-toolbar-title>{{ dialog.isEdit ? 'Cập nhật vai trò' : 'Thêm vai trò mới' }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" @click="dialog.show = false"></v-btn>
        </v-toolbar>

        <v-card-text class="pa-6">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="editedItem.roleName"
                label="Tên vai trò"
                placeholder="Ví dụ: Receptionist"
                variant="outlined"
                hint="Tên viết bằng tiếng Anh, ví dụ: Admin, Manager, Trainer..."
                persistent-hint
                :disabled="dialog.isEdit"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="editedItem.description"
                label="Mô tả"
                placeholder="Mô tả chức năng nhân sự..."
                variant="outlined"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <h3 class="text-subtitle-1 font-weight-bold mb-4">Danh sách Quyền hạn (Permissions)</h3>
          
          <v-row v-for="(group, gName) in permissionGroups" :key="gName" class="mb-4">
            <v-col cols="12">
              <div class="d-flex align-center mb-2">
                <v-icon size="20" color="primary" class="mr-2">{{ group.icon }}</v-icon>
                <span class="font-weight-bold">{{ group.title }}</span>
                <v-spacer></v-spacer>
                <v-btn variant="text" size="x-small" @click="toggleGroup(group.perms)">Bật/Tắt tất cả</v-btn>
              </div>
              <v-card variant="tonal" class="pa-2 rounded-lg">
                <v-row dense>
                  <v-col v-for="p in group.perms" :key="p.value" cols="12" sm="6" md="4">
                    <v-checkbox
                      v-model="editedItem.permissions"
                      :label="p.label"
                      :value="p.value"
                      density="compact"
                      hide-details
                      color="primary"
                      class="custom-check"
                    ></v-checkbox>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="pa-4 bg-grey-lighten-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="dialog.show = false">Hủy</v-btn>
          <v-btn color="primary" variant="flat" block max-width="200" :loading="saving" @click="save">Lưu thay đổi</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation -->
    <v-dialog v-model="deleteDialog.show" max-width="400">
      <v-card class="rounded-xl pa-4">
        <v-card-title class="text-center text-h5 font-weight-bold">Xác nhận xóa?</v-card-title>
        <v-card-text class="text-center">
          Bạn có chắc muốn xóa vai trò <strong>{{ deleteDialog.item?.roleName }}</strong>? 
          Lưu ý: Hành động này không thể hoàn tác và có thể ảnh hưởng đến người dùng hiện tại.
        </v-card-text>
        <v-card-actions class="justify-center mt-4">
          <v-btn variant="text" @click="deleteDialog.show = false">Hủy</v-btn>
          <v-btn color="error" variant="flat" class="px-8" @click="doDelete">Xóa ngay</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- User Role Assignment Dialog -->
    <v-dialog v-model="userRoleDialog.show" max-width="500">
      <v-card class="rounded-xl">
        <v-card-title class="pa-4 font-weight-bold">
          Gán vai trò cho {{ userRoleDialog.user.fullName }}
        </v-card-title>
        <v-card-text class="pa-4 pt-0">
          <div class="text-caption text-grey mb-4 italic">Hãy chọn các vai trò phù hợp cho nhân viên này</div>
          <v-select
            v-model="userRoleDialog.selectedIds"
            :items="roles"
            item-title="roleName"
            item-value="id"
            label="Chọn vai trò"
            multiple
            chips
            variant="outlined"
            placeholder="Chọn 1 hoặc nhiều vai trò"
          ></v-select>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="userRoleDialog.show = false">Hủy</v-btn>
          <v-btn color="primary" variant="flat" block max-width="150" :loading="saving" @click="saveUserRoles">Xác nhận</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snack.show" :color="snack.color" location="top right">{{ snack.message }}</v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { roleService } from '@/services/roleService'
import { userService } from '@/services/userService'

const tab = ref('roles')
const roles = ref([])
const loading = ref(false)
const users = ref([])
const userLoading = ref(false)
const saving = ref(false)
const snack = ref({ show: false, message: '', color: 'success' })

const userHeaders = [
  { title: 'Nhân viên / Username', key: 'fullName' },
  { title: 'Vai trò hiện tại', key: 'roles' },
  { title: 'Thao tác', key: 'action', align: 'end', sortable: false }
]

const dialog = ref({ show: false, isEdit: false })
const editedItem = ref({ id: 0, roleName: '', description: '', permissions: [] })
const deleteDialog = ref({ show: false, item: null })
const userRoleDialog = ref({ show: false, user: {}, selectedIds: [] })

const permissionGroups = {
  member: {
    title: 'Hội viên', icon: 'mdi-account-group',
    perms: [
      { label: 'Xem danh sách', value: 'member.read' },
      { label: 'Xem hồ sơ cá nhân', value: 'member.profile.read' },
      { label: 'Thêm mới', value: 'member.create' },
      { label: 'Cập nhật', value: 'member.update' },
      { label: 'Xóa', value: 'member.delete' }
    ]
  },
  package: {
    title: 'Gói tập & Đăng ký', icon: 'mdi-package-variant-closed',
    perms: [
      { label: 'Xem gói/đăng ký', value: 'package.read' },
      { label: 'Xem đăng ký cá nhân', value: 'subscription.read' },
      { label: 'Tạo mới', value: 'package.create' },
      { label: 'Gia hạn/Cập nhật', value: 'package.update' },
      { label: 'Xóa', value: 'package.delete' }
    ]
  },
  checkin: {
    title: 'Vận hành Check-in', icon: 'mdi-clock-check',
    perms: [
      { label: 'Xem lịch sử', value: 'checkin.read' },
      { label: 'Tự Check-in', value: 'checkin.self' },
      { label: 'Ghi Check-in (Lễ tân)', value: 'checkin.create' }
    ]
  },
  class: {
    title: 'Lớp học & Điểm danh', icon: 'mdi-calendar-clock',
    perms: [
      { label: 'Xem lịch lớp', value: 'class.read' },
      { label: 'Đăng ký lớp', value: 'class.enroll' },
      { label: 'Tạo lớp học', value: 'class.create' },
      { label: 'Điều phối PT', value: 'class.update' },
      { label: 'Điểm danh (PT)', value: 'class.manage' }
    ]
  },
  inventory: {
    title: 'Kho vật tư', icon: 'mdi-warehouse',
    perms: [
      { label: 'Xem tồn kho', value: 'inventory.read' },
      { label: 'Nhập/Xuất kho', value: 'inventory.consume' }, // Dùng chung cho tiêu dùng/điều chuyển
      { label: 'Quản trị kho', value: 'inventory.manage' }
    ]
  },
  equipment: {
    title: 'Thiết bị & Assets', icon: 'mdi-vibrate',
    perms: [
      { label: 'Xem danh sách', value: 'equipment.read' },
      { label: 'Cập nhật thiết bị', value: 'equipment.update' },
      { label: 'Báo lỗi/sửa chữa (PT)', value: 'equipment.report' }
    ]
  },
  report: {
    title: 'Báo cáo & Audit', icon: 'mdi-chart-line',
    perms: [
      { label: 'Xem báo cáo cơ bản', value: 'report.read' },
      { label: 'Doanh thu & tài chính', value: 'report.financial' },
      { label: 'Xem Audit Log', value: 'auditlog.read' }
    ]
  }
}

const fetchUsers = async () => {
  userLoading.value = true
  try {
    const res = await userService.getAll()
    if (res.success) users.value = res.data
  } finally { userLoading.value = false }
}

const fetchRoles = async () => {
  loading.value = true
  try {
    const res = await roleService.getAll()
    if (res.success) roles.value = res.data
  } finally { loading.value = false }
}

onMounted(() => {
  fetchRoles()
  fetchUsers()
})

watch(tab, (newVal) => {
  if (newVal === 'users') fetchUsers()
  if (newVal === 'roles') fetchRoles()
})

const getPermissionLabel = (value) => {
  const translations = {
    'member.read': 'Xem HV',
    'member.profile.read': 'Hồ sơ cá nhân',
    'member.create': 'Thêm HV',
    'member.update': 'Sửa HV',
    'member.delete': 'Xóa HV',
    'package.read': 'Xem Gói',
    'subscription.read': 'Xem Đăng ký',
    'package.create': 'Tạo Gói',
    'package.update': 'Sửa Gói',
    'package.delete': 'Xóa Gói',
    'checkin.read': 'Xem Check-in',
    'checkin.self': 'Tự Check-in',
    'checkin.create': 'Lễ tân Check-in',
    'class.read': 'Xem Lịch lớp',
    'class.enroll': 'Đăng ký lớp',
    'class.create': 'Tạo Lớp',
    'class.update': 'Sửa Lớp',
    'class.manage': 'Điểm danh',
    'inventory.read': 'Xem Kho',
    'inventory.consume': 'Xuất kho',
    'inventory.manage': 'Quản trị kho',
    'equipment.read': 'Xem Thiết bị',
    'equipment.update': 'Sửa TB',
    'equipment.report': 'Báo hỏng',
    'report.read': 'Báo cáo cơ bản',
    'report.financial': 'Doanh thu',
    'auditlog.read': 'Audit Log',
    '*': 'Toàn quyền (*) '
  }
  
  // Xử lý wildcard dạng module.*
  if (value.endsWith('.*')) {
    const module = value.split('.')[0]
    return ` ${module.toUpperCase()}`
  }

  return translations[value] || value
}

const getRoleIcon = (name) => {
  switch (name) {
    case 'Admin': return 'mdi-crown'
    case 'Manager': return 'mdi-account-tie'
    case 'Receptionist': return 'mdi-face-agent'
    case 'Trainer': return 'mdi-dumbbell'
    case 'Member': return 'mdi-account'
    default: return 'mdi-security'
  }
}

const openDialog = (item = null) => {
  if (item) {
    dialog.value = { show: true, isEdit: true }
    // Clone item
    const cloned = JSON.parse(JSON.stringify(item))
    const currentPerms = cloned.permissions || []
    
    // NẾU LÀ MANAGER HOẶC CÓ WILDCARD -> Mở rộng thành các quyền cụ thể để UI hiển thị đủ check
    if (currentPerms.includes('*') || currentPerms.some(p => p.includes('.*'))) {
      const allPossible = []
      Object.values(permissionGroups).forEach(group => {
        group.perms.forEach(p => {
          const moduleName = p.value.split('.')[0]
          // Nếu có * hoặc module.* (cả số ít/số nhiều), ta check ô đó
          if (currentPerms.includes('*') || 
              currentPerms.includes(`${moduleName}.*`) || 
              currentPerms.includes(`${moduleName}s.*`)) {
            allPossible.push(p.value)
          } else if (currentPerms.includes(p.value)) {
            allPossible.push(p.value)
          }
        })
      })
      cloned.permissions = [...new Set(allPossible)]
    }
    
    editedItem.value = cloned
  } else {
    dialog.value = { show: true, isEdit: false }
    editedItem.value = { id: 0, roleName: '', description: '', permissions: [] }
  }
}

const toggleGroup = (perms) => {
  const allValues = perms.map(p => p.value)
  const allSelected = allValues.every(v => editedItem.value.permissions.includes(v))
  
  if (allSelected) {
    editedItem.value.permissions = editedItem.value.permissions.filter(v => !allValues.includes(v))
  } else {
    allValues.forEach(v => {
      if (!editedItem.value.permissions.includes(v)) editedItem.value.permissions.push(v)
    })
  }
}

const save = async () => {
  saving.value = true
  try {
    const res = dialog.value.isEdit
      ? await roleService.update(editedItem.value.id, editedItem.value)
      : await roleService.create(editedItem.value)
      
    if (res.success) {
      showSnack('Lưu vai trò thành công!')
      dialog.value.show = false
      fetchRoles()
    } else {
      showSnack(res.message, 'error')
    }
  } finally { saving.value = false }
}

const confirmDelete = (item) => {
  deleteDialog.value = { show: true, item }
}

const doDelete = async () => {
  try {
    const res = await roleService.delete(deleteDialog.value.item.id)
    if (res.success) {
      showSnack('Đã xóa vai trò.')
      deleteDialog.value.show = false
      fetchRoles()
    }
  } catch (e) {}
}

const openUserRoleDialog = (user) => {
  userRoleDialog.value = {
    show: true,
    user: user,
    selectedIds: [...user.roleIds]
  }
}

const saveUserRoles = async () => {
  saving.value = true
  try {
    const res = await userService.setUserRoles(userRoleDialog.value.user.id, userRoleDialog.value.selectedIds)
    if (res.success) {
      showSnack('Cập nhật vai trò nhân viên thành công!')
      userRoleDialog.value.show = false
      fetchUsers()
    }
  } finally { saving.value = false }
}

const translateRole = (name) => {
  const map = {
    'Admin': 'Quản trị viên',
    'Manager': 'Quản lý',
    'Receptionist': 'Lễ tân',
    'Trainer': 'Huấn luyện viên',
    'Member': 'Hội viên'
  }
  return map[name] || name
}

const showSnack = (msg, color = 'success') => {
  snack.value = { show: true, message: msg, color }
}
</script>

<style scoped>
.gap-2 { gap: 8px; }
.v-card-text { min-height: 120px; }
:deep(.v-chip__content) { font-size: 0.85rem; }
:deep(.v-label) { font-size: 1rem !important; opacity: 1 !important; }
.custom-check :deep(.v-label) { font-size: 0.95rem !important; }
</style>
