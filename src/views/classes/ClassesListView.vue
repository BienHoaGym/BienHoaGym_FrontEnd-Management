<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Quản lý Lớp học & Lịch tập</h1>
        <p class="text-subtitle-1 text-grey mt-1">Lên lịch, đăng ký và điểm danh học viên</p>
      </div>
      <v-btn v-if="authStore.canManageSystem" color="primary" size="large" prepend-icon="mdi-plus" @click="openCreate" class="text-capitalize rounded-lg shadow-sm">
        Thêm Lớp học mới
      </v-btn>
    </div>

    <!-- Filter Tabs -->
    <v-tabs v-model="activeDay" color="primary" class="mb-6 border-b">
      <v-tab value="all" class="text-capitalize">Tất cả lớp</v-tab>
      <v-tab v-for="day in weekDays" :key="day" :value="day" class="text-capitalize">{{ translateDay(day) }}</v-tab>
    </v-tabs>

    <!-- Cards Grid -->
    <v-row v-if="!classStore.loading">
      <v-col
        v-for="cls in filteredClasses"
        :key="cls.id"
        cols="12" sm="6" lg="4"
      >
        <v-card class="rounded-xl border shadow-sm overflow-hidden" :class="!cls.isActive ? 'opacity-60 grayscale' : ''">
          <!-- Dynamic Header based on Class Type -->
          <div class="pa-5" :style="getClassHeaderStyle(cls.classType)">
            <div class="d-flex justify-space-between align-start">
              <div>
                <v-chip size="x-small" class="mb-2 font-weight-bold" color="white" variant="flat" :style="{ color: getClassColor(cls.classType) }">
                  {{ cls.classType || 'General' }}
                </v-chip>
                <div class="text-h5 font-weight-bold text-white mb-1">{{ cls.className }}</div>
                <div class="text-subtitle-2 text-white opacity-90 d-flex align-center">
                  <v-icon size="small" class="mr-1">mdi-clock-outline</v-icon>
                  {{ formatTime24(cls.startTime || cls.StartTime) }} – {{ formatTime24(cls.endTime || cls.EndTime) }}
                  <span class="mx-2">|</span>
                  <span class="font-weight-bold">
                    {{ (Array.isArray(cls.scheduleDay || cls.ScheduleDay) && (cls.scheduleDay || cls.ScheduleDay).length > 0) 
                        ? (cls.scheduleDay || cls.ScheduleDay).map(d => translateDay(d)).join(', ') 
                        : translateDay(cls.scheduleDay || cls.ScheduleDay) }}
                  </span>
                </div>
              </div>
              <v-menu transition="scale-transition">
                <template #activator="{ props }">
                  <v-btn v-bind="props" icon="mdi-dots-vertical" size="small" variant="tonal" color="white" />
                </template>
                <v-list density="compact" class="rounded-lg">
                  <v-list-item v-if="authStore.canManageSystem" prepend-icon="mdi-pencil-outline" title="Chỉnh sửa" @click="openEdit(cls)" />
                  <v-list-item prepend-icon="mdi-account-plus-outline" title="Đăng ký HV" @click="openEnroll(cls)" />
                  <v-list-item prepend-icon="mdi-account-details-outline" title="Chi tiết" @click="openAttendance(cls)" />
                  <v-divider v-if="authStore.canManageSystem" class="my-1" />
                  <v-list-item v-if="authStore.canManageSystem" prepend-icon="mdi-delete-outline" title="Xóa lớp" base-color="error" @click="confirmDelete(cls)" />
                </v-list>
              </v-menu>
            </div>
          </div>

          <v-card-text class="pa-5">
            <!-- Trainer -->
            <div class="d-flex align-center mb-4 p-2 bg-grey-lighten-4 rounded-lg">
              <v-avatar color="primary" size="32" class="mr-3">
                <span class="text-caption text-white font-weight-bold">{{ getTrainerName(cls).charAt(0).toUpperCase() }}</span>
              </v-avatar>
              <div>
                <div class="text-caption text-grey">Huấn luyện viên</div>
                <div class="text-body-2 font-weight-bold">{{ getTrainerName(cls) }}</div>
              </div>
            </div>

            <!-- Capacity Bar -->
            <div class="mb-4">
              <div class="d-flex justify-space-between text-body-2 mb-2">
                <span class="font-weight-medium">Sĩ số lớp</span>
                <span :class="(cls.isFull || cls.IsFull) ? 'text-error font-weight-bold' : 'text-primary font-weight-bold'">
                  {{ cls.currentEnrollment ?? cls.CurrentEnrollment }} / {{ cls.maxCapacity ?? cls.MaxCapacity }}
                  <v-chip v-if="cls.isFull || cls.IsFull" size="x-small" color="error" class="ml-2 font-weight-bold">FULL</v-chip>
                </span>
              </div>
              <v-progress-linear
                :model-value="((cls.currentEnrollment ?? cls.CurrentEnrollment) / (cls.maxCapacity ?? cls.MaxCapacity)) * 100"
                :color="(cls.isFull || cls.IsFull) ? 'error' : 'primary'"
                rounded
                height="8"
                class="rounded-pill"
              />
            </div>

            <div v-if="cls.description" class="text-body-2 text-grey-darken-1 line-clamp-2">
              {{ cls.description }}
            </div>

            <div class="mt-5 d-flex gap-2">
              <v-btn variant="tonal" color="primary" block class="text-capitalize rounded-lg" prepend-icon="mdi-account-details" @click="openAttendance(cls)">
                Xem Chi tiết lớp học
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Empty State -->
      <v-col v-if="!filteredClasses.length" cols="12">
        <div class="text-center py-16 bg-grey-lighten-5 rounded-xl border-dashed">
          <v-icon size="100" color="grey-lighten-2">mdi-calendar-blank-outline</v-icon>
          <p class="text-h6 text-grey mt-4">Không tìm thấy lớp học nào cho ngày này</p>
          <v-btn color="primary" variant="flat" class="mt-4 px-8 text-capitalize" @click="openCreate">Tạo lớp học đầu tiên</v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <v-row v-else>
      <v-col v-for="i in 6" :key="i" cols="12" sm="6" lg="4">
        <v-skeleton-loader type="card" class="rounded-xl" />
      </v-col>
    </v-row>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="formDialog" max-width="600" persistent transition="dialog-bottom-transition">
      <v-card class="rounded-xl overflow-hidden">
        <v-card-title class="d-flex align-center pa-6 bg-primary text-white">
          <v-icon class="mr-3">{{ isEdit ? 'mdi-pencil' : 'mdi-plus-circle' }}</v-icon>
          <span class="text-h5 font-weight-bold">{{ isEdit ? 'Cập nhật Lớp học' : 'Thiết lập Lớp học mới' }}</span>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" color="white" @click="formDialog = false" />
        </v-card-title>

        <v-card-text class="pa-8">
          <v-form ref="formRef">
            <v-row>
              <v-col cols="12" md="8">
                <v-text-field
                  v-model="form.className"
                  label="Tên lớp học *"
                  variant="outlined"
                  placeholder="Ví dụ: Yoga Flow Sáng"
                  :rules="[r.required]"
                  :disabled="saving"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="form.classType"
                  label="Loại lớp"
                  :items="classTypes"
                  variant="outlined"
                  placeholder="Chọn..."
                  :disabled="saving"
                />
              </v-col>
              <v-col cols="12">
                <v-autocomplete
                  v-model="form.trainerId"
                  label="Huấn luyện viên phụ trách *"
                  :items="trainerOptions"
                  item-title="label"
                  item-value="id"
                  variant="outlined"
                  :rules="[r.required]"
                  :disabled="saving"
                  prepend-inner-icon="mdi-account-tie"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.scheduleDay"
                  label="Thứ trong tuần"
                  :items="weekDaysOptions"
                  item-title="title"
                  item-value="value"
                  variant="outlined"
                  multiple
                  chips
                  closable-chips
                  :disabled="saving"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="form.maxCapacity"
                  label="Số lượng học viên tối đa *"
                  type="number"
                  variant="outlined"
                  :rules="[r.required, r.positive]"
                  :disabled="saving"
                  prepend-inner-icon="mdi-account-group"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.startTime"
                  label="Giờ bắt đầu *"
                  type="time"
                  variant="outlined"
                  :rules="[r.required]"
                  :disabled="saving"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.endTime"
                  label="Giờ kết thúc *"
                  type="time"
                  variant="outlined"
                  :rules="[r.required]"
                  :disabled="saving"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="form.description"
                  label="Mô tả lớp học"
                  variant="outlined"
                  rows="2"
                  hide-details
                  :disabled="saving"
                />
              </v-col>
              <v-col v-if="isEdit" cols="12">
                <v-switch v-model="form.isActive" label="Lớp đang hoạt động" color="success" inset :disabled="saving" />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider />
        <v-card-actions class="pa-6">
          <v-spacer />
          <v-btn variant="text" :disabled="saving" @click="formDialog = false" class="px-6">Hủy</v-btn>
          <v-btn color="primary" variant="flat" :loading="saving" @click="handleSave" class="px-8 rounded-lg font-weight-bold">
            {{ isEdit ? 'Lưu thay đổi' : 'Tạo lớp học' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Attendance Dialog -->
    <v-dialog v-model="attendanceDialog" max-width="700" scrollable transition="dialog-bottom-transition">
      <v-card class="rounded-xl overflow-hidden">
        <v-card-title class="pa-0 border-b">
          <div class="pa-6 bg-grey-lighten-4 d-flex align-center">
            <v-icon color="primary" start size="32">mdi-account-details</v-icon>
            <div>
              <div class="text-h5 font-weight-bold">Chi tiết học viên trong lớp</div>
              <div class="text-subtitle-2 text-grey">
                Lớp: <span class="text-primary font-weight-bold">{{ selectedClass?.className }}</span> | 
                <v-icon size="14">mdi-clock-outline</v-icon> {{ formatTime24(selectedClass?.startTime) }} - {{ formatTime24(selectedClass?.endTime) }}
              </div>
            </div>
            <v-spacer />
            <v-btn icon="mdi-close" variant="text" @click="attendanceDialog = false" />
          </div>
        </v-card-title>
        
        <v-card-text class="pa-0">
          <v-list v-if="enrollments.length" lines="two" class="pa-0">
            <template v-for="(item, i) in enrollments" :key="item.enrollmentId">
              <v-list-item class="pa-4 border-b">
                <template #prepend>
                  <v-avatar color="blue-lighten-4" size="48">
                    <span class="text-h6 text-blue-darken-3 font-weight-bold">{{ item.memberName?.charAt(0) }}</span>
                  </v-avatar>
                </template>
                
                <v-list-item-title class="font-weight-bold text-body-1">{{ item.memberName }}</v-list-item-title>
                <v-list-item-subtitle class="mt-1">
                  <v-chip size="x-small" label color="grey" variant="flat" class="mr-2">{{ item.memberCode }}</v-chip>
                  <span v-if="item.isAttended" class="text-success font-weight-medium">
                    <v-icon size="small" class="mr-1">mdi-check-circle</v-icon> Đã tham gia
                  </span>
                </v-list-item-subtitle>

                <template #append>
                  <div class="d-flex align-center">
                    <v-btn
                      :color="item.isAttended ? 'success' : 'grey-lighten-1'"
                      :variant="item.isAttended ? 'flat' : 'outlined'"
                      :loading="markingId === item.enrollmentId"
                      class="text-capitalize rounded-lg shadow-sm"
                      @click="handleMarkAttendance(item)"
                    >
                      {{ item.isAttended ? 'Đã có mặt' : 'Điểm danh' }}
                    </v-btn>
                  </div>
                </template>
              </v-list-item>
            </template>
          </v-list>
          <div v-else class="text-center py-16">
            <v-icon size="64" color="grey-lighten-2">mdi-account-off-outline</v-icon>
            <p class="text-h6 text-grey mt-2">Chưa có học viên nào đăng ký lớp này</p>
            <v-btn color="primary" variant="text" prepend-icon="mdi-account-plus" class="mt-2" @click="openEnroll(selectedClass)">Đăng ký ngay</v-btn>
          </div>
        </v-card-text>
        
        <v-card-actions class="pa-4 border-t">
          <v-spacer />
          <v-btn block variant="tonal" @click="attendanceDialog = false">Đóng</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Enroll Dialog -->
    <v-dialog v-model="enrollDialog" max-width="450" persistent>
      <v-card class="rounded-xl">
        <v-card-title class="pa-6 border-b d-flex align-center">
          <v-icon color="primary" class="mr-3">mdi-account-plus</v-icon>
          <span class="font-weight-bold">Đăng ký lớp: {{ selectedClass?.className }}</span>
        </v-card-title>
        <v-card-text class="pa-8">
          <v-autocomplete
            v-model="enrollMemberId"
            label="Tìm kiếm hội viên"
            :items="memberOptions"
            item-title="label"
            item-value="id"
            variant="outlined"
            density="comfortable"
            placeholder="Nhập tên hoặc mã HV..."
            auto-select-first
          />
          <div class="d-flex justify-space-between mt-2 text-caption">
            <span class="text-grey">Sức chứa còn lại:</span>
            <span class="font-weight-bold" :class="selectedClass?.availableSlots <= 2 ? 'text-error' : 'text-primary'">
              {{ selectedClass?.availableSlots }} chỗ trống
            </span>
          </div>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-spacer />
          <v-btn variant="text" @click="enrollDialog = false" class="px-6 text-capitalize">Hủy</v-btn>
          <v-btn color="primary" variant="flat" class="px-8 rounded-lg font-weight-bold text-capitalize" :loading="enrolling" @click="handleEnroll" :disabled="!enrollMemberId || selectedClass?.isFull">Xác nhận đăng ký</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirm -->
    <confirm-dialog
      v-model="deleteDialog"
      title="Xóa Lớp học"
      :message="`Bạn có chắc muốn xóa lớp '${selected?.className}'? Lưu ý: Phải gỡ hết học viên trước khi xóa.`"
      confirm-text="Xác nhận xóa"
      type="error"
      :loading="deleting"
      @confirm="handleDelete"
    />

    <v-snackbar v-model="snack.show" :color="snack.color" location="top right" elevation="2">
      {{ snack.message }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useClassStore } from '@/stores/class'
import { useTrainerStore } from '@/stores/trainer'
import { useMemberStore } from '@/stores/member'
import { useAuthStore } from '@/stores/auth'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const classStore = useClassStore()
const authStore = useAuthStore()
const trainerStore = useTrainerStore()
const memberStore = useMemberStore()

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const weekDaysOptions = [
  { title: 'Thứ 2 (Monday)', value: 'Monday' },
  { title: 'Thứ 3 (Tuesday)', value: 'Tuesday' },
  { title: 'Thứ 4 (Wednesday)', value: 'Wednesday' },
  { title: 'Thứ 5 (Thursday)', value: 'Thursday' },
  { title: 'Thứ 6 (Friday)', value: 'Friday' },
  { title: 'Thứ 7 (Saturday)', value: 'Saturday' },
  { title: 'Chủ Nhật (Sunday)', value: 'Sunday' },
]

const classTypes = ['Yoga', 'Zumba', 'Boxing', 'Dance', 'HIIT', 'Aerobic', 'Cardio', 'Khác']

const activeDay = ref('all')
const formDialog = ref(false)
const enrollDialog = ref(false)
const attendanceDialog = ref(false)
const deleteDialog = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const deleting = ref(false)
const enrolling = ref(false)
const selected = ref(null)
const selectedClass = ref(null)
const enrollMemberId = ref(null)
const enrollments = ref([])
const markingId = ref(null)
const formRef = ref(null)
const snack = ref({ show: false, message: '', color: 'success' })

const defaultForm = {
  className: '', classType: 'Yoga', trainerId: null, scheduleDay: [],
  startTime: '06:00', endTime: '07:00',
  maxCapacity: 20, description: '', isActive: true
}
const form = ref({ ...defaultForm })

const r = {
  required: (v) => !!v || 'Bắt buộc nhập',
  positive: (v) => (!v || Number(v) > 0) || 'Phải là số dương'
}

const translateDay = (day) => {
  const map = {
    'Monday': 'Thứ 2', 'Tuesday': 'Thứ 3', 'Wednesday': 'Thứ 4', 'Thursday': 'Thứ 5',
    'Friday': 'Thứ 6', 'Saturday': 'Thứ 7', 'Sunday': 'Chủ nhật'
  }
  return map[day] || day || 'Chưa xếp lịch'
}

const getClassColor = (type) => {
  const map = {
    'Yoga': '#43A047',
    'Zumba': '#E91E63',
    'Boxing': '#D32F2F',
    'Dance': '#9C27B0',
    'HIIT': '#FF9800',
    'Aerobic': '#2196F3'
  }
  return map[type] || '#424242'
}

const getClassHeaderStyle = (type) => {
  const color = getClassColor(type)
  return {
    background: `linear-gradient(135deg, ${color}, ${lightenColor(color, 20)})`
  }
}

const lightenColor = (color, percent) => {
  const num = parseInt(color.replace("#", ""), 16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        G = (num >> 8 & 0x00FF) + amt,
        B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

const filteredClasses = computed(() => {
  if (activeDay.value === 'all') return classStore.classes
  return classStore.classes.filter(c => {
    const days = c.scheduleDay || c.ScheduleDay || []
    return Array.isArray(days) ? days.includes(activeDay.value) : days === activeDay.value
  })
})

const trainerOptions = computed(() =>
  trainerStore.activeTrainers.map(t => ({ 
    id: t.id || t.Id, 
    label: `${t.fullName || t.FullName} (${t.specialization || t.Specialization || 'PT'})` 
  }))
)

const memberOptions = computed(() =>
  memberStore.members.map(m => ({ id: m.id, label: `${m.fullName} (${m.memberCode})` }))
)

const formatTime24 = (t) => {
  if (!t) return ''
  if (typeof t === 'string' && t.includes(':')) return t.substring(0, 5)
  return t
}

const getTrainerName = (cls) => {
  const name = cls.trainerName || cls.TrainerName
  if (name) return name

  // Fallback: Tìm trong store nếu backend chưa kịp Include dữ liệu Trainer
  const trainer = trainerStore.trainers.find(t => (t.id || t.Id) === (cls.trainerId || cls.TrainerId))
  return trainer ? (trainer.fullName || trainer.FullName) : 'Chưa phân công'
}

const showSnack = (msg, color = 'success') => { snack.value = { show: true, message: msg, color } }

const openCreate = () => {
  isEdit.value = false; form.value = { ...defaultForm }; formDialog.value = true
}

const openEdit = (cls) => {
  isEdit.value = true; selected.value = cls
  form.value = {
    className: cls.className, classType: cls.classType || 'Khác', trainerId: cls.trainerId,
    scheduleDay: Array.isArray(cls.scheduleDay) ? [...cls.scheduleDay] : [cls.scheduleDay], 
    startTime: formatTime24(cls.startTime),
    endTime: formatTime24(cls.endTime), maxCapacity: cls.maxCapacity,
    description: cls.description || '', isActive: cls.isActive
  }
  formDialog.value = true
}

const openEnroll = (cls) => { 
  if (cls.isFull) { showSnack('Lớp đã kín chỗ!', 'warning'); return }
  selectedClass.value = cls; enrollMemberId.value = null; enrollDialog.value = true 
}

const openAttendance = async (cls) => {
  selectedClass.value = cls
  enrollments.value = []
  attendanceDialog.value = true
  const res = await classStore.getEnrollments(cls.id)
  if (res.success) enrollments.value = res.data
}

const handleMarkAttendance = async (item) => {
  markingId.value = item.enrollmentId
  const res = await classStore.markAttendance({
    enrollmentId: item.enrollmentId,
    isPresent: !item.isAttended
  })
  if (res.success) {
    item.isAttended = !item.isAttended
    showSnack(res.message)
  } else {
    showSnack(res.message, 'error')
  }
  markingId.value = null
}

const confirmDelete = (cls) => { selected.value = cls; deleteDialog.value = true }

const handleSave = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  saving.value = true
  
  // Chuẩn hóa định dạng giờ HH:mm:ss trước khi gửi
  const formatTime = (time) => {
    if (!time) return '00:00:00'
    return time.split(':').length === 2 ? `${time}:00` : time
  }
  
  const payload = {
    ...form.value,
    startTime: formatTime(form.value.startTime),
    endTime: formatTime(form.value.endTime)
  }

  const result = isEdit.value
    ? await classStore.update(selected.value.id, payload)
    : await classStore.create(payload)
  saving.value = false
  if (result.success) { 
    formDialog.value = false; 
    showSnack(isEdit.value ? 'Đã cập nhật lớp học!' : 'Đã tạo lớp học thành công!') 
  }
  else showSnack(result.message, 'error')
}

const handleEnroll = async () => {
  if (!enrollMemberId.value) return
  enrolling.value = true
  const result = await classStore.enroll(selectedClass.value.id, enrollMemberId.value)
  enrolling.value = false
  if (result.success) { enrollDialog.value = false; showSnack('Đăng ký học viên thành công!') }
  else showSnack(result.message, 'error')
}

const handleDelete = async () => {
  deleting.value = true
  const result = await classStore.remove(selected.value.id)
  deleting.value = false
  if (result.success) { deleteDialog.value = false; showSnack('Đã xóa lớp học!') }
  else showSnack(result.message, 'error')
}
onMounted(() => {
  if (authStore.hasPermission('class.read')) {
    classStore.fetchAll()
    trainerStore.fetchAll()
    memberStore.fetchMembers(1, 100)
  }
})
</script>

<style scoped>
.gap-2 { gap: 8px; }
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.shadow-sm {
  box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important;
}
.v-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.v-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.1) !important;
}
.grayscale {
  filter: grayscale(1);
}
</style>