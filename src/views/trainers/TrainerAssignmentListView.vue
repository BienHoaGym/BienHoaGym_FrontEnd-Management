<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Phân công PT</h1>
        <p class="text-subtitle-1 text-grey mt-1">Quản lý và gán Huấn luyện viên cho các hợp đồng 1-1</p>
      </div>
    </div>

    <!-- Stats -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="4">
        <v-card variant="tonal" color="warning">
          <v-card-text>
            <div class="text-caption">Chờ phân công PT</div>
            <div class="text-h4 font-weight-bold">{{ pendingCount }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-card variant="tonal" color="success">
          <v-card-text>
            <div class="text-caption">Đang tham gia tập luyện</div>
            <div class="text-h4 font-weight-bold">{{ activeCount }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="rounded-xl overflow-hidden">
      <v-tabs v-model="activeTab" color="primary">
        <v-tab value="PendingAssignment">Chờ phân công</v-tab>
        <v-tab value="Active">Đang hoạt động</v-tab>
        <v-tab value="all">Tất cả</v-tab>
      </v-tabs>
      <v-divider />

      <v-data-table
        :headers="headers"
        :items="filteredAssignments"
        :loading="trainerStore.loading"
        :items-per-page="10"
      >
        <template #item.member="{ item }">
          <div class="font-weight-medium">{{ item.memberName }}</div>
          <div class="text-caption text-grey">{{ item.memberCode }}</div>
        </template>

        <template #item.trainer="{ item }">
          <v-chip v-if="item.trainerId" size="small" color="primary" variant="tonal">
            <v-icon start size="14">mdi-account-tie</v-icon>
            {{ item.trainerName }}
          </v-chip>
          <v-chip v-else size="small" color="warning" variant="flat">
            <v-icon start size="14">mdi-account-question</v-icon>
            Chưa gán PT
          </v-chip>
        </template>

        <template #item.status="{ item }">
          <v-chip :color="statusColor(item.status)" size="small" variant="tonal">
            {{ translateStatus(item.status) }}
          </v-chip>
        </template>

        <template #item.assignedDate="{ item }">
          {{ formatDate(item.assignedDate) }}
        </template>

        <template #item.actions="{ item }">
          <v-btn
            v-if="item.status === 'PendingAssignment'"
            color="primary"
            size="small"
            prepend-icon="mdi-account-plus"
            @click="openAssign(item)"
          >
            Phân công PT
          </v-btn>
          <v-btn
            v-else
            icon="mdi-eye"
            variant="text"
            size="small"
            :to="'/trainers/' + item.trainerId"
          />
        </template>

        <template #no-data>
          <div class="text-center py-12">
            <v-icon size="64" color="grey-lighten-2">mdi-account-off</v-icon>
            <p class="text-h6 text-grey mt-4">Không có dữ liệu phân công</p>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Assign PT Dialog -->
    <v-dialog v-model="assignDialog" max-width="500" persistent>
      <v-card class="rounded-xl">
        <v-card-title class="pa-6 bg-primary text-white d-flex align-center">
          <v-icon class="mr-2">mdi-account-plus</v-icon>
          Phân công Huấn luyện viên
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" color="white" @click="assignDialog = false" />
        </v-card-title>

        <v-card-text class="pa-6">
          <div class="mb-6 d-flex align-center pa-4 bg-grey-lighten-4 rounded-lg">
            <v-avatar color="primary" size="48" class="mr-3">
              <span class="text-white font-weight-bold">{{ selectedAssignment?.memberName?.charAt(0) }}</span>
            </v-avatar>
            <div>
              <div class="text-subtitle-1 font-weight-bold">{{ selectedAssignment?.memberName }}</div>
              <div class="text-caption text-grey">{{ selectedAssignment?.memberCode }}</div>
            </div>
          </div>

          <v-select
            v-model="assignForm.trainerId"
            label="Chọn Huấn luyện viên (PT) *"
            :items="trainerOptions"
            item-title="label"
            item-value="id"
            variant="outlined"
            density="comfortable"
            :rules="[(v) => !!v || 'Vui lòng chọn PT']"
            :loading="trainerStore.loading"
          >
            <template #prepend-inner>
              <v-icon color="primary">mdi-account-tie</v-icon>
            </template>
          </v-select>

          <v-textarea
            v-model="assignForm.notes"
            label="Ghi chú (Tùy chọn)"
            variant="outlined"
            rows="3"
            placeholder="Ví dụ: Mục tiêu giảm cân, tập buổi chiều..."
          />
          
          <v-alert
            type="info"
            variant="tonal"
            density="compact"
            class="text-caption mt-2"
          >
            Hệ thống sẽ tự động khởi tạo lớp học 1-1 ngay sau khi phân công.
          </v-alert>
        </v-card-text>

        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="outlined" @click="assignDialog = false">Hủy bỏ</v-btn>
          <v-btn
            color="primary"
            :loading="submitting"
            @click="handleAssign"
          >
            Xác nhận Phân công
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snack.show" :color="snack.color" location="top right" timeout="3000">
      {{ snack.message }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTrainerStore } from '@/stores/trainer'

const trainerStore = useTrainerStore()

const activeTab = ref('PendingAssignment')
const assignDialog = ref(false)
const selectedAssignment = ref(null)
const submitting = ref(false)
const snack = ref({ show: false, message: '', color: 'success' })

const assignForm = ref({
  trainerId: null,
  notes: ''
})

const headers = [
  { title: 'Hội viên', key: 'member', minWidth: '180px' },
  { title: 'PT Phụ trách', key: 'trainer', width: '200px' },
  { title: 'Trạng thái', key: 'status', width: '150px', align: 'center' },
  { title: 'Ngày gán', key: 'assignedDate', width: '130px' },
  { title: 'Thao tác', key: 'actions', width: '150px', sortable: false, align: 'center' },
]

const filteredAssignments = computed(() => {
  if (activeTab.value === 'all') return trainerStore.assignments
  return trainerStore.assignments.filter(a => a.status === activeTab.value)
})

const pendingCount = computed(() => trainerStore.assignments.filter(a => a.status === 'PendingAssignment').length)
const activeCount = computed(() => trainerStore.assignments.filter(a => a.status === 'Active').length)

const trainerOptions = computed(() => 
  trainerStore.activeTrainers.map(t => ({ id: t.id, label: `${t.fullName} (${t.specialization || 'PT'})` }))
)

const statusColor = (status) => ({
  PendingAssignment: 'warning',
  Active: 'success',
  Completed: 'primary',
  Cancelled: 'grey'
})[status] || 'grey'

const translateStatus = (status) => ({
  PendingAssignment: 'Chờ phân công PT',
  Active: 'Đang tập luyện',
  Completed: 'Đã hoàn thành',
  Cancelled: 'Đã hủy'
})[status] || status

const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('vi-VN')
}

const showSnack = (msg, color = 'success') => { snack.value = { show: true, message: msg, color } }

const openAssign = (assignment) => {
  selectedAssignment.value = assignment
  assignForm.value = {
    trainerId: null,
    notes: assignment.notes || ''
  }
  assignDialog.value = true
}

const handleAssign = async () => {
  if (!assignForm.value.trainerId) return
  
  submitting.value = true
  const payload = {
    id: selectedAssignment.value.id,
    trainerId: assignForm.value.trainerId,
    memberId: selectedAssignment.value.memberId,
    notes: assignForm.value.notes
  }
  
  const result = await trainerStore.assignMember(payload)
  submitting.value = false
  
  if (result.success || result.Success) {
    assignDialog.value = false
    showSnack('Đã phân công PT và tạo lớp học thành công!')
    trainerStore.fetchAllAssignments()
  } else {
    showSnack(result.message || 'Lỗi phân công PT', 'error')
  }
}

onMounted(async () => {
  if (!trainerStore.assignments.length) {
    await trainerStore.fetchAllAssignments()
  }
  if (!trainerStore.trainers.length) {
    await trainerStore.fetchAll()
  }
})
</script>
