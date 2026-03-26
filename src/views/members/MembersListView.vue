<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Quản lý Hội viên</h1>
        <p class="text-subtitle-1 text-grey mt-1">Quản lý và theo dõi thông tin hội viên</p>
      </div>
      <v-btn color="primary" size="large" prepend-icon="mdi-plus" @click="openCreate">
        Thêm hội viên
      </v-btn>
    </div>

    <v-row class="mb-6">
      <v-col cols="6" md="3">
        <v-card variant="tonal" color="primary">
          <v-card-text class="d-flex align-center">
            <v-icon size="36" color="primary" class="mr-4">mdi-account-group</v-icon>
            <div>
              <div class="text-caption text-grey">Tổng số hội viên</div>
              <div class="text-h5 font-weight-bold">{{ memberStore.pagination.totalCount }}</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card>
      <v-card-text class="pb-0">
        <v-row align="center">
          <v-col cols="12" md="5">
            <v-text-field
              v-model="searchKeyword"
              label="Tìm kiếm theo tên, SĐT, mã HV..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              @update:model-value="handleSearch"
              @click:clear="clearSearch"
            />
          </v-col>

          <v-spacer />

          <v-col cols="auto">
            <v-btn
              icon="mdi-refresh"
              variant="outlined"
              :loading="memberStore.loading"
              @click="refreshData"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-data-table
        :headers="headers"
        :items="memberStore.members"
        :loading="memberStore.loading"
        :items-per-page="-1"
        hide-default-footer
        class="mt-2"
      >
        <template #item.memberCode="{ item }">
          <v-chip color="primary" size="small" variant="tonal">
            {{ item.memberCode }}
          </v-chip>
        </template>

        <template #item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            size="small"
            variant="tonal"
          >
            <v-icon start :color="getStatusColor(item.status)" size="10">
              mdi-circle
            </v-icon>
            {{ getStatusText(item.status) }}
          </v-chip>
        </template>

        <template #item.createdAt="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <v-tooltip text="Xem chi tiết">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-eye"
                  size="small"
                  variant="text"
                  color="info"
                  @click="viewMember(item.raw?.id || item.raw?.Id || item.id || item.Id)"
                />
              </template>
            </v-tooltip>

            <v-tooltip text="Chỉnh sửa">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  color="warning"
                  @click="openEdit(item.raw?.id || item.raw?.Id || item.id || item.Id)"
                />
              </template>
            </v-tooltip>

            <v-tooltip text="Xóa">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  @click="confirmDelete(item.raw || item)"
                />
              </template>
            </v-tooltip>
          </div>
        </template>

        <template #loading>
          <v-skeleton-loader type="table-row@5" />
        </template>

        <template #no-data>
          <div class="text-center py-12">
            <v-icon size="64" color="grey-lighten-2">mdi-account-off</v-icon>
            <p class="text-h6 text-grey mt-4">Không tìm thấy hội viên nào</p>
            <p class="text-body-2 text-grey mb-4">
              {{
                searchKeyword ? 'Vui lòng thử từ khóa tìm kiếm khác' : 'Bắt đầu bằng cách thêm hội viên đầu tiên'
              }}
            </p>
            <v-btn v-if="!searchKeyword" color="primary" @click="openCreate">
              Thêm hội viên mới
            </v-btn>
          </div>
        </template>
      </v-data-table>

      <v-divider />
      <div class="d-flex align-center justify-space-between pa-4">
        <div class="text-caption text-grey">
          Hiển thị {{ memberStore.members.length }} trên tổng số
          {{ memberStore.pagination.totalCount }} hội viên
        </div>
        <v-pagination
          v-model="currentPage"
          :length="memberStore.pagination.totalPages"
          :total-visible="5"
          density="compact"
          @update:model-value="handlePageChange"
        />
      </div>
    </v-card>

    <member-form-dialog v-model="formDialog" :member-id="selectedMemberId" @saved="onSaved" />

    <confirm-dialog
      v-model="deleteDialog"
      title="Xóa hội viên"
      :message="`Bạn có chắc chắn muốn xóa hội viên '${selectedMember?.fullName}'? Hành động này không thể hoàn tác.`"
      confirm-text="Xóa"
      type="error"
      :loading="deleting"
      @confirm="handleDelete"
    />

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000" location="top right">
      <v-icon class="mr-2">{{
        snackbar.color === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle'
      }}</v-icon>
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMemberStore } from '@/stores/member'
import MemberFormDialog from '@/components/members/MemberFormDialog.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { formatDate, debounce } from '@/utils/helpers'


const router = useRouter()
const memberStore = useMemberStore()


// State
const searchKeyword = ref('')
const currentPage = ref(1)
const formDialog = ref(false)
const deleteDialog = ref(false)
const deleting = ref(false)
const selectedMemberId = ref(null)
const selectedMember = ref(null)

// Snackbar
const snackbar = ref({ show: false, message: '', color: 'success' })

const showSnackbar = (message, color = 'success') => {
  snackbar.value = { show: true, message, color }
}

// Table headers
const headers = [
  { title: 'Mã HV', key: 'memberCode', width: '120px' },
  { title: 'Họ và tên', key: 'fullName', minWidth: '180px' },
  { title: 'Số điện thoại', key: 'phoneNumber', width: '140px' },
  { title: 'Email', key: 'email', minWidth: '200px' },
  { title: 'Trạng thái', key: 'status', width: '120px', align: 'center' },
  { title: 'Ngày tham gia', key: 'createdAt', width: '140px' },
  { title: 'Thao tác', key: 'actions', width: '130px', sortable: false, align: 'center' },
]

const getStatusColor = (status) => {
  switch (status) {
    case 'Active': return 'success'
    case 'Prospective': return 'orange'
    case 'Pending': return 'warning'
    case 'Inactive': return 'grey'
    case 'Suspended': return 'error'
    default: return 'grey'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'Active': return 'Đang hoạt động'
    case 'Prospective': return 'Tiềm năng'
    case 'Pending': return 'Chờ thanh toán'
    case 'Inactive': return 'Ngừng tập'
    case 'Suspended': return 'Tạm khóa'
    default: return status
  }
}

// Methods
const refreshData = async () => {
  const result = await memberStore.fetchMembers(currentPage.value, 10)
  

}

const handleSearch = debounce((keyword) => {
  if (keyword && keyword.trim()) {
    memberStore.searchMembers(keyword.trim())
  } else {
    memberStore.fetchMembers(1, 10)
    currentPage.value = 1
  }
}, 400)

const clearSearch = () => {
  searchKeyword.value = ''
  memberStore.fetchMembers(1, 10)
  currentPage.value = 1
}

const handlePageChange = (page) => {
  currentPage.value = page
  memberStore.fetchMembers(page, 10)
}

const openCreate = () => {
  selectedMemberId.value = null
  formDialog.value = true
}

const openEdit = (id) => {
  selectedMemberId.value = id
  formDialog.value = true
}

const viewMember = (id) => {
  router.push(`/members/${id}`)
}

const confirmDelete = (member) => {
  selectedMember.value = member
  selectedMemberId.value = member.id
  deleteDialog.value = true
}

const handleDelete = async () => {
  deleting.value = true
  try {
    const result = await memberStore.deleteMember(selectedMemberId.value)
    if (result.success) {
      deleteDialog.value = false
      showSnackbar(`Đã xóa hội viên '${selectedMember.value?.fullName}' thành công`)
    } else {
      showSnackbar(result.message || 'Xóa thất bại', 'error')
    }
  } catch (err) {
    showSnackbar('Đã xảy ra lỗi khi xóa hội viên', 'error')
    console.error('Delete error:', err)
  } finally {
    deleting.value = false
  }
}

const onSaved = () => {
  const message = selectedMemberId.value
    ? 'Cập nhật hội viên thành công'
    : 'Thêm hội viên mới thành công'
  showSnackbar(message)
  refreshData()
}

onMounted(() => {
  memberStore.fetchMembers(1, 10)
})
</script>