<template>
  <div>
    <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="router.back()">
      Quay lại danh sách
    </v-btn>

    <div v-if="loading" class="d-flex justify-center align-center" style="height: 400px;">
      <v-progress-circular indeterminate color="primary" size="64" />
    </div>

    <v-alert v-else-if="error" type="error" class="mb-4">{{ error }}</v-alert>

    <template v-else-if="trainer">
      <v-card class="mb-6 rounded-lg overflow-hidden" elevation="2">
        <v-img
          height="160"
          :src="trainer.profilePhoto || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop'"
          cover
          class="align-end"
          gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.7)"
        >
          <v-card-title class="text-white d-flex align-end pl-6 pb-4" style="gap: 20px">
            <v-avatar size="100" color="white" class="elevation-4" style="border: 4px solid white; margin-bottom: -40px;">
              <v-img v-if="trainer.profilePhoto" :src="trainer.profilePhoto" cover />
              <span v-else class="text-h3 font-weight-bold text-primary">
                {{ trainer.fullName?.charAt(0)?.toUpperCase() }}
              </span>
            </v-avatar>
            
            <div class="mb-2">
              <h1 class="text-h4 font-weight-bold mb-1" style="line-height: 1.2;">{{ trainer.fullName }}</h1>
              <div class="text-subtitle-1 opacity-90 font-weight-light d-flex align-center">
                <v-chip color="white" variant="flat" size="x-small" class="mr-2 text-primary font-weight-bold">
                  PT-{{ trainer.trainerCode || 'N/A' }}
                </v-chip>
                <v-icon size="small" class="mr-1">mdi-account-star</v-icon>
                {{ trainer.specialization || 'Huấn luyện viên' }} 
                <span class="mx-2">•</span> 
                <v-icon size="small" class="mr-1">mdi-briefcase-outline</v-icon>
                {{ trainer.experienceYears }} năm kinh nghiệm
              </div>
            </div>
          </v-card-title>
        </v-img>

        <v-card-text class="pt-12 pl-6 pr-6 d-flex flex-column flex-sm-row justify-space-between align-center">
          <div class="d-flex gap-2 mt-4 mt-sm-0">
            <v-chip :color="trainer.isActive ? 'success' : 'error'" variant="flat" size="large" class="font-weight-bold px-4">
              <v-icon start>mdi-circle-medium</v-icon>
              {{ trainer.isActive ? 'Đang làm việc' : 'Nghỉ việc' }}
            </v-chip>
          </div>

          <div class="d-flex gap-3 mt-4 mt-sm-0">
            <v-btn color="primary" variant="flat" prepend-icon="mdi-pencil" @click="openEdit" class="text-capitalize">
              Chỉnh sửa PT
            </v-btn>
            <v-btn color="success" variant="tonal" prepend-icon="mdi-account-plus" @click="assignDialog = true" class="text-capitalize">
              Phân công học viên
            </v-btn>
          </div>
        </v-card-text>
      </v-card>

      <v-row>
        <v-col cols="12" md="8">
          <v-card class="rounded-lg h-100" elevation="1">
            <v-tabs v-model="activeTab" color="primary" align-tabs="start">
              <v-tab value="students" class="text-capitalize"><v-icon start>mdi-account-multiple</v-icon>Học viên đang kèm</v-tab>
              <v-tab value="schedule" class="text-capitalize"><v-icon start>mdi-calendar-clock</v-icon>Lịch dạy lớp</v-tab>
              <v-tab value="bio" class="text-capitalize"><v-icon start>mdi-text-box-outline</v-icon>Tiểu sử & Kinh nghiệm</v-tab>
            </v-tabs>
            <v-divider></v-divider>

            <v-window v-model="activeTab" class="pa-6">
              <!-- Students List -->
              <v-window-item value="students">
                <div class="d-flex align-center justify-space-between mb-4">
                  <h3 class="text-h6 font-weight-bold">Danh sách học viên ({{ assignments.length }})</h3>
                  <v-btn color="primary" variant="text" prepend-icon="mdi-account-plus" @click="assignDialog = true">Gán thêm</v-btn>
                </div>
                
                <v-data-table
                  :headers="assignmentHeaders"
                  :items="assignments"
                  :loading="loadingAssignments"
                  hover
                  class="border rounded-lg"
                >
                  <template #item.memberName="{ item }">
                    <div class="d-flex align-center py-2">
                      <v-avatar color="blue-lighten-4" size="32" class="mr-3">
                        <span class="text-caption text-blue-darken-2">{{ item.memberName.charAt(0) }}</span>
                      </v-avatar>
                      <div>
                        <div class="font-weight-bold">{{ item.memberName }}</div>
                        <div class="text-caption text-grey">{{ item.memberCode }}</div>
                      </div>
                    </div>
                  </template>

                  <template #item.assignedDate="{ item }">
                    {{ formatDate(item.assignedDate) }}
                  </template>

                  <template #item.actions="{ item }">
                    <v-btn
                      icon="mdi-account-off"
                      size="x-small"
                      color="error"
                      variant="text"
                      title="Gỡ phân công"
                      @click="handleUnassign(item)"
                    />
                  </template>

                  <template #no-data>
                    <div class="text-center py-12 text-grey">
                      <v-icon size="48" color="grey-lighten-2" class="mb-2">mdi-account-off-outline</v-icon>
                      <p>Hiện chưa có học viên nào được gán cho PT này</p>
                    </div>
                  </template>
                </v-data-table>
              </v-window-item>

              <!-- Schedule / Classes -->
              <v-window-item value="schedule">
                 <h3 class="text-h6 font-weight-bold mb-4">Các lớp học đảm nhiệm</h3>
                 <v-row v-if="trainer.classes?.length">
                   <v-col v-for="cls in trainer.classes" :key="cls.id" cols="12" sm="6">
                     <v-card variant="outlined" class="rounded-lg">
                       <v-card-text>
                         <div class="d-flex justify-space-between align-center mb-2">
                           <span class="text-h6 font-weight-bold">{{ cls.className }}</span>
                           <v-chip size="x-small" color="primary">{{ cls.scheduleDay }}</v-chip>
                         </div>
                         <div class="text-body-2 text-grey mb-2">
                           <v-icon size="14" class="mr-1">mdi-clock-outline</v-icon>
                           {{ formatTime(cls.startTime) }} - {{ formatTime(cls.endTime) }}
                         </div>
                         <v-progress-linear
                           :model-value="(cls.currentEnrollment / cls.maxCapacity) * 100"
                           color="success"
                           height="4"
                           rounded
                         />
                         <div class="text-caption mt-1 text-right">
                           Sĩ số: {{ cls.currentEnrollment }}/{{ cls.maxCapacity }}
                         </div>
                       </v-card-text>
                     </v-card>
                   </v-col>
                 </v-row>
                 <div v-else class="text-center py-12 text-grey">
                    <v-icon size="48" color="grey-lighten-2" class="mb-2">mdi-calendar-blank</v-icon>
                    <p>PT này hiện chưa tham gia giảng dạy lớp học nào</p>
                 </div>
              </v-window-item>

              <!-- Bio -->
              <v-window-item value="bio">
                <div class="text-body-1" style="white-space: pre-line;">
                  {{ trainer.bio || 'Chưa có thông tin tiểu sử chi tiết cho huấn luyện viên này.' }}
                </div>
              </v-window-item>
            </v-window>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <!-- Salary info for Admin/Manager -->
          <v-card class="rounded-lg mb-4" elevation="1">
            <v-card-title class="text-subtitle-1 font-weight-bold d-flex align-center">
              <v-icon size="small" class="mr-2" color="success">mdi-currency-usd</v-icon>
              Chế độ lương thưởng
            </v-card-title>
            <v-divider></v-divider>
            <v-list density="comfortable" class="py-0">
              <v-list-item class="py-3">
                <v-list-item-title class="text-caption text-grey">Lương cơ bản (Tháng)</v-list-item-title>
                <template #append>
                  <span class="font-weight-bold text-body-1 text-success">{{ formatCurrency(trainer.salary) }}</span>
                </template>
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item class="py-3">
                <v-list-item-title class="text-caption text-grey">Phí dạy PT (Mỗi buổi)</v-list-item-title>
                <template #append>
                  <span class="font-weight-medium text-body-1">{{ formatCurrency(trainer.sessionRate) }}</span>
                </template>
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item class="py-3">
                <v-list-item-title class="text-caption text-grey">Ngày gia nhập</v-list-item-title>
                <template #append>
                  <span class="font-weight-medium text-body-2">{{ formatDate(trainer.hireDate) }}</span>
                </template>
              </v-list-item>
            </v-list>
          </v-card>

          <!-- Contact info -->
          <v-card class="rounded-lg mb-4" elevation="1">
            <v-card-title class="text-subtitle-1 font-weight-bold d-flex align-center">
              <v-icon size="small" class="mr-2" color="blue">mdi-card-account-phone-outline</v-icon>
              Liên hệ
            </v-card-title>
            <v-divider></v-divider>
            <v-list density="comfortable">
               <v-list-item prepend-icon="mdi-phone" :title="trainer.phoneNumber || 'N/A'" subtitle="Số điện thoại" />
               <v-list-item prepend-icon="mdi-email" :title="trainer.email || 'N/A'" subtitle="Email" />
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Assign Member Dialog -->
    <v-dialog v-model="assignDialog" max-width="450">
      <v-card class="rounded-xl">
        <v-card-title class="pa-6 bg-primary text-white">
          <v-icon start>mdi-account-plus</v-icon>
          Phân công học viên mới
        </v-card-title>
        <v-card-text class="pa-6">
          <v-autocomplete
            v-model="assignMemberId"
            :items="memberOptions"
            item-title="label"
            item-value="id"
            label="Chọn hội viên"
            variant="outlined"
            placeholder="Tìm theo tên hoặc mã hội viên..."
            :loading="loadingMembers"
          />
          <v-textarea
            v-model="assignNotes"
            label="Ghi chú (Tùy chọn)"
            variant="outlined"
            rows="2"
            class="mt-2"
          />
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="assignDialog = false">Hủy</v-btn>
          <v-btn color="primary" :disabled="!assignMemberId" :loading="assigning" @click="handleAssign">Xác nhận gán</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snack.show" :color="snack.color" location="top right">
      {{ snack.message }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTrainerStore } from '@/stores/trainer'
import { useMemberStore } from '@/stores/member'
import { formatDate } from '@/utils/helpers'

const route = useRoute()
const router = useRouter()
const trainerStore = useTrainerStore()
const memberStore = useMemberStore()

const trainer = ref(null)
const assignments = ref([])
const loading = ref(false)
const loadingAssignments = ref(false)
const loadingMembers = ref(false)
const error = ref(null)
const activeTab = ref('students')

const assignDialog = ref(false)
const assignMemberId = ref(null)
const assignNotes = ref('')
const assigning = ref(false)

const snack = ref({ show: false, message: '', color: 'success' })

const assignmentHeaders = [
  { title: 'Hội viên', key: 'memberName' },
  { title: 'Ngày gán', key: 'assignedDate' },
  { title: 'Thao tác', key: 'actions', align: 'end', sortable: false },
]

const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0)
const formatTime = (t) => t?.substring(0, 5) || 'N/A'
const showSnack = (m, c = 'success') => { snack.value = { show: true, message: m, color: c } }

const memberOptions = computed(() => 
  memberStore.members.map(m => ({ id: m.id, label: `${m.fullName} (${m.memberCode})` }))
)

const loadTrainer = async () => {
  loading.value = true
  try {
    const res = await trainerStore.fetchById(route.params.id) // Cần action fetchById trong store
    if (res.success) {
      trainer.value = res.data
      await Promise.all([loadAssignments(), loadMembers()])
    } else {
      error.value = res.message || 'Không tìm thấy PT'
    }
  } catch (err) {
    error.value = 'Lỗi kết nối máy chủ'
  } finally {
    loading.value = false
  }
}

const loadAssignments = async () => {
  loadingAssignments.value = true
  const res = await trainerStore.fetchAssignments(route.params.id)
  if (res.success) assignments.value = res.data
  loadingAssignments.value = false
}

const loadMembers = async () => {
  if (memberStore.members.length > 5) return
  loadingMembers.value = true
  await memberStore.fetchMembers(1, 200)
  loadingMembers.value = false
}

const handleAssign = async () => {
  assigning.value = true
  try {
    const res = await trainerStore.assignMember({
      trainerId: trainer.value.id,
      memberId: assignMemberId.value,
      notes: assignNotes.value
    })
    if (res.success) {
      showSnack('Phân công học viên thành công!')
      assignDialog.value = false
      assignMemberId.value = null
      assignNotes.value = ''
      await loadAssignments()
    } else {
      showSnack(res.message, 'error')
    }
  } catch (e) {
    showSnack('Lỗi khi phân công', 'error')
  } finally {
    assigning.value = false
  }
}

const handleUnassign = async (item) => {
  if (!confirm(`Gỡ học viên ${item.memberName} khỏi PT này?`)) return
  const id = item.id || item.Id
  const res = await trainerStore.unassignMember(id)
  if (res.success) {
    showSnack('Đã gỡ phân công')
    await loadAssignments()
  } else {
    showSnack(res.message, 'error')
  }
}

const openEdit = () => {
  // Navigation hoặc trigger edit dialog từ view list (phải pass data về hoặc handle tại đây)
  router.push({ name: 'Trainers', query: { edit: trainer.value.id } })
}

onMounted(loadTrainer)
</script>

<style scoped>
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
</style>
