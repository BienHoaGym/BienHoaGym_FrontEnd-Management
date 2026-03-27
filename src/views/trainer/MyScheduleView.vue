<template>
  <v-container fluid class="pa-6">
    <!-- Header Section -->
    <v-row class="mb-6 align-center">
      <v-col cols="12" md="8">
        <div class="d-flex align-center mb-2">
          <v-avatar color="primary" size="48" class="mr-4 shadow-sm">
            <v-icon color="white">mdi-calendar-account</v-icon>
          </v-avatar>
          <div>
            <h1 class="text-h4 font-weight-bold">Lịch làm việc của tôi</h1>
            <p class="text-subtitle-1 text-grey">Xem các lớp giảng dạy và học viên PT cá nhân</p>
          </div>
        </div>
      </v-col>
      <v-col cols="12" md="4" class="text-md-right">
        <v-chip color="primary" variant="flat" size="large" class="font-weight-bold px-4">
          <v-icon start>mdi-clock-outline</v-icon>
          {{ currentTime }}
        </v-chip>
      </v-col>
    </v-row>

    <!-- Stats summary -->
    <v-row class="mb-8">
      <v-col cols="12" sm="6" md="3">
        <v-card class="rounded-xl border shadow-sm h-100" elevation="0">
          <v-card-text class="pa-5">
            <div class="text-overline text-grey-darken-1 mb-1">Tổng số lớp</div>
            <div class="text-h3 font-weight-black text-primary">{{ schedule.classes?.length || 0 }}</div>
            <div class="text-caption text-grey mt-2">Dự kiến trong tuần này</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="rounded-xl border shadow-sm h-100" elevation="0">
          <v-card-text class="pa-5">
            <div class="text-overline text-grey-darken-1 mb-1">Học viên PT 1:1</div>
            <div class="text-h3 font-weight-black text-success">{{ schedule.personalClients?.length || 0 }}</div>
            <div class="text-caption text-grey mt-2">Hội viên đang phụ trách</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="rounded-xl border shadow-sm h-100" elevation="0">
          <v-card-text class="pa-5">
            <div class="text-overline text-grey-darken-1 mb-1">Lớp hôm nay</div>
            <div class="text-h3 font-weight-black text-warning">{{ todayClasses.length }}</div>
            <div class="text-caption text-grey mt-2">{{ currentDayName }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-tabs v-model="tab" color="primary" class="mb-6 border-b">
      <v-tab value="today" class="text-capitalize font-weight-bold">
        <v-icon start>mdi-calendar-today</v-icon> Lịch hôm nay
      </v-tab>
      <v-tab value="week" class="text-capitalize font-weight-bold">
        <v-icon start>mdi-calendar-week</v-icon> Lịch hàng tuần
      </v-tab>
      <v-tab value="clients" class="text-capitalize font-weight-bold">
        <v-icon start>mdi-account-star</v-icon> Học viên cá nhân
      </v-tab>
    </v-tabs>

    <v-window v-model="tab">
      <!-- TODAY VIEW -->
      <v-window-item value="today">
        <div v-if="loading" class="text-center py-12">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        </div>
        <v-row v-else-if="todayClasses.length > 0">
          <v-col v-for="cls in todayClasses" :key="cls.id" cols="12">
            <v-card class="rounded-xl border shadow-sm overflow-hidden mb-4" hover>
              <div class="d-flex flex-column flex-sm-row">
                <div class="pa-6 bg-primary d-flex flex-column justify-center align-center text-white" style="min-width: 140px">
                  <div class="text-h4 font-weight-black">{{ formatTime24(cls.startTime) }}</div>
                  <div class="text-caption opacity-80">Bắt đầu</div>
                </div>
                <div class="pa-6 flex-grow-1">
                  <div class="d-flex flex-column flex-sm-row justify-space-between align-start">
                    <div>
                      <v-chip size="x-small" color="primary" variant="tonal" class="mb-2 font-weight-bold text-uppercase">{{ cls.classType }}</v-chip>
                      <h2 class="text-h5 font-weight-bold mb-1">{{ cls.className }}</h2>
                      <p class="text-body-2 text-grey mb-4">
                        <v-icon size="small" class="mr-1">mdi-map-marker</v-icon> Phòng tập trung tâm
                        <span class="mx-2">|</span>
                        <v-icon size="small" class="mr-1">mdi-account-group</v-icon> {{ cls.currentEnrollment }}/{{ cls.maxCapacity }} học viên
                      </p>
                    </div>
                    <div class="d-flex gap-2">
                      <v-btn color="success" variant="flat" prepend-icon="mdi-clipboard-check" class="rounded-lg text-capitalize" @click="openAttendance(cls)">
                        Điểm danh
                      </v-btn>
                    </div>
                  </div>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
        <div v-else class="text-center py-16 bg-grey-lighten-5 rounded-xl border-dashed">
          <v-icon size="80" color="grey-lighten-2">mdi-calendar-blank</v-icon>
          <p class="text-h6 text-grey mt-4">Hôm nay bạn không có lớp học nào.</p>
          <p class="text-body-2 text-grey">Hãy tận hưởng thời gian nghỉ ngơi hoặc tập luyện cá nhân.</p>
        </div>
      </v-window-item>

      <!-- WEEK VIEW -->
      <v-window-item value="week">
        <v-row>
          <v-col v-for="day in weekDays" :key="day.value" cols="12" md="6" lg="4">
            <v-card class="rounded-xl border h-100 pb-4" elevation="0">
              <v-card-title class="pa-4 bg-grey-lighten-4 font-weight-bold d-flex align-center">
                {{ day.title }}
                <v-spacer />
                <v-chip v-if="getClassesForDay(day.value).length" size="x-small" color="primary">{{ getClassesForDay(day.value).length }} lớp</v-chip>
              </v-card-title>
              <v-list density="comfortable" class="bg-transparent">
                <v-list-item v-for="cls in getClassesForDay(day.value)" :key="cls.id" class="px-4 py-3">
                  <template #prepend>
                    <div class="text-caption font-weight-bold text-primary mr-3" style="width: 50px">{{ formatTime24(cls.startTime) }}</div>
                  </template>
                  <v-list-item-title class="font-weight-bold">{{ cls.className }}</v-list-item-title>
                  <v-list-item-subtitle>{{ cls.classType }} | {{ cls.currentEnrollment }} HV</v-list-item-subtitle>
                </v-list-item>
                <div v-if="!getClassesForDay(day.value).length" class="text-center py-8 text-grey text-caption italic">
                  Không có lịch dạy
                </div>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>

      <!-- CLIENTS VIEW -->
      <v-window-item value="clients">
        <v-card class="rounded-xl border shadow-sm overflow-hidden">
          <v-data-table
            :headers="clientHeaders"
            :items="schedule.personalClients || []"
            hover
          >
            <template #[`item.memberName`]="{ item }">
              <div class="d-flex align-center py-2">
                <v-avatar color="primary" variant="tonal" size="36" class="mr-3 font-weight-bold">
                  {{ item.memberName.charAt(0) }}
                </v-avatar>
                <div>
                  <div class="font-weight-bold">{{ item.memberName }}</div>
                  <div class="text-caption text-grey">{{ item.memberCode }}</div>
                </div>
              </div>
            </template>
            <template #[`item.assignedDate`]="{ item }">
              {{ formatDate(item.assignedDate) }}
            </template>
            <template #[`item.actions`]="{ item }">
              <v-btn icon="mdi-message-text-outline" variant="text" color="primary" size="small"></v-btn>
              <v-btn icon="mdi-information-outline" variant="text" color="grey" size="small"></v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-window-item>
    </v-window>

    <!-- Attendance Dialog (Reused logic from ClassesListView) -->
    <v-dialog v-model="attendanceDialog" max-width="700" scrollable transition="dialog-bottom-transition">
      <v-card class="rounded-xl overflow-hidden">
        <v-card-title class="pa-0 border-b">
          <div class="pa-6 bg-grey-lighten-4 d-flex align-center">
            <v-icon color="primary" start size="32">mdi-clipboard-check</v-icon>
            <div>
              <div class="text-h5 font-weight-bold">Điểm danh lớp</div>
              <div class="text-subtitle-2 text-grey">{{ selectedClass?.className }} | {{ formatTime24(selectedClass?.startTime) }}</div>
            </div>
            <v-spacer />
            <v-btn icon="mdi-close" variant="text" @click="attendanceDialog = false" />
          </div>
        </v-card-title>
        
        <v-card-text class="pa-0" style="max-height: 500px">
          <v-list v-if="enrollments.length" lines="two" class="pa-0">
            <v-list-item v-for="item in enrollments" :key="item.enrollmentId" class="pa-4 border-b">
              <template #prepend>
                <v-avatar color="blue-lighten-4" size="48">
                  <span class="text-h6 text-blue-darken-3 font-weight-bold">{{ item.memberName?.charAt(0) }}</span>
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-bold">{{ item.memberName }}</v-list-item-title>
              <v-list-item-subtitle>{{ item.memberCode }}</v-list-item-subtitle>
              <template #append>
                <v-btn
                  :color="item.isAttended ? 'success' : 'grey-lighten-1'"
                  :variant="item.isAttended ? 'flat' : 'outlined'"
                  :loading="markingId === item.enrollmentId"
                  @click="handleMarkAttendance(item)"
                  class="rounded-lg"
                >
                  {{ item.isAttended ? 'Có mặt' : 'Vắng mặt' }}
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
          <div v-else class="text-center py-12">
            <v-icon size="64" color="grey-lighten-2">mdi-account-off-outline</v-icon>
            <p class="text-grey mt-2">Chưa có học viên đăng ký lớp này</p>
          </div>
        </v-card-text>
        <v-card-actions class="pa-4 bg-grey-lighten-4">
          <v-spacer />
          <v-btn block color="primary" variant="flat" @click="attendanceDialog = false">Xong</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snack.show" :color="snack.color" location="top right">
      {{ snack.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTrainerStore } from '@/stores/trainer'
import { useClassStore } from '@/stores/class'
import dayjs from 'dayjs'

const trainerStore = useTrainerStore()
const classStore = useClassStore()

const tab = ref('today')
const loading = ref(false)
const schedule = ref({ classes: [], personalClients: [] })
const attendanceDialog = ref(false)
const selectedClass = ref(null)
const enrollments = ref([])
const markingId = ref(null)
const snack = ref({ show: false, message: '', color: 'success' })

const currentTime = ref(dayjs().format('HH:mm - DD/MM/YYYY'))
const currentDayName = ref(dayjs().format('dddd'))

const weekDays = [
  { title: 'Thứ 2', value: 'Monday' },
  { title: 'Thứ 3', value: 'Tuesday' },
  { title: 'Thứ 4', value: 'Wednesday' },
  { title: 'Thứ 5', value: 'Thursday' },
  { title: 'Thứ 6', value: 'Friday' },
  { title: 'Thứ 7', value: 'Saturday' },
  { title: 'Chủ nhật', value: 'Sunday' }
]

const clientHeaders = [
  { title: 'Học viên', key: 'memberName' },
  { title: 'Ngày bắt đầu', key: 'assignedDate' },
  { title: 'Ghi chú', key: 'notes' },
  { title: 'Thao tác', key: 'actions', align: 'end', sortable: false }
]

const todayClasses = computed(() => {
  const todayEng = dayjs().format('dddd') // e.g. "Monday"
  return (schedule.value.classes || []).filter(c => c.scheduleDay === todayEng)
})

const getClassesForDay = (dayValue) => {
  return (schedule.value.classes || []).filter(c => c.scheduleDay === dayValue)
}

const formatTime24 = (t) => {
  if (!t) return ''
  return t.substring(0, 5)
}

const formatDate = (date) => {
  return dayjs(date).format('DD/MM/YYYY')
}

const fetchSchedule = async () => {
  loading.value = true
  const res = await trainerStore.fetchMySchedule()
  if (res.success) {
    schedule.value = res.data
  } else {
    snack.value = {
      show: true,
      message: res.message || 'Không thể tải lịch làm việc của bạn',
      color: 'error'
    }
  }
  loading.value = false
}

const openAttendance = async (cls) => {
  selectedClass.value = cls
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
    snack.value = { show: true, message: 'Đã cập nhật điểm danh', color: 'success' }
  }
  markingId.value = null
}

onMounted(() => {
  fetchSchedule()
  setInterval(() => {
    currentTime.value = dayjs().format('HH:mm - DD/MM/YYYY')
  }, 60000)
})
</script>

<style scoped>
.gap-2 { gap: 8px; }
.shadow-sm { box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important; }
.border-dashed { border: 2px dashed #e0e0e0; }
</style>
