<template>
  <v-container fluid>
    <div class="d-flex align-center justify-space-between mb-4">
      <v-btn variant="text" prepend-icon="mdi-arrow-left" class="text-capitalize" @click="router.back()">
        Quay lại danh sách
      </v-btn>
      <div v-if="staff" class="d-flex gap-2 no-print">
        <v-btn variant="outlined" color="primary" prepend-icon="mdi-printer" class="rounded-lg text-capitalize" @click="handlePrint">
          In hồ sơ
        </v-btn>
        <v-btn color="primary" prepend-icon="mdi-pencil" class="rounded-lg text-capitalize shadow-sm" @click="openEdit">
          Cập nhật
        </v-btn>
      </div>
    </div>

    <div v-if="loading" class="d-flex justify-center align-center" style="height: 400px;">
      <v-progress-circular indeterminate color="primary" size="64" />
    </div>

    <v-alert v-else-if="error" type="error" class="mb-4">{{ error }}</v-alert>

    <template v-else-if="staff">
      <v-row>
        <!-- CỘT TRÁI: THÔNG TIN CƠ BẢN & AVATAR -->
        <v-col cols="12" md="4">
          <v-card class="rounded-xl overflow-hidden border shadow-sm mb-6">
            <v-img
              height="120"
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"
              cover
              gradient="to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.5)"
            ></v-img>
            <v-card-text class="text-center pt-0">
              <v-avatar size="130" :color="getRoleColor(staff.roles?.[0])" class="elevation-10 staff-avatar-offset" variant="flat">
                <span class="text-h1 font-weight-bold text-white">{{ staff.fullName?.charAt(0) }}</span>
              </v-avatar>
              
              <div class="mt-4">
                <h1 class="text-h4 font-weight-bold" style="letter-spacing: -0.5px;">{{ staff.fullName }}</h1>
                <p class="text-subtitle-1 text-grey-darken-1 mb-2">@{{ staff.username }}</p>
                
                <div class="d-flex justify-center flex-wrap gap-2 mb-4">
                  <v-chip v-for="role in staff.roles" :key="role" size="small" :color="getRoleColor(role)" variant="flat" class="text-capitalize font-weight-bold">
                    {{ translateRole(role) }}
                  </v-chip>
                </div>
                
                <v-chip :color="staff.isActive ? 'success' : 'error'" variant="tonal" size="small" class="mb-4 font-weight-bold px-4">
                  <v-icon start size="small">mdi-circle</v-icon>
                  {{ staff.isActive ? 'ĐANG LÀM VIỆC' : 'TẠM KHÓA' }}
                </v-chip>
              </div>

              <v-divider class="my-6"></v-divider>

              <div class="text-left px-2">
                <div class="d-flex align-center mb-5">
                  <v-avatar color="blue-lighten-5" size="40" class="mr-4">
                    <v-icon color="primary">mdi-email-outline</v-icon>
                  </v-avatar>
                  <div class="overflow-hidden">
                    <div class="text-caption text-grey font-weight-bold text-uppercase">Email</div>
                    <div class="text-body-2 font-weight-medium text-truncate">{{ staff.email }}</div>
                  </div>
                </div>
                <div class="d-flex align-center mb-5">
                  <v-avatar color="green-lighten-5" size="40" class="mr-4">
                    <v-icon color="success">mdi-phone-outline</v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-caption text-grey font-weight-bold text-uppercase">Số điện thoại</div>
                    <div class="text-body-2 font-weight-medium">{{ staff.phoneNumber || 'Chưa cập nhật' }}</div>
                  </div>
                </div>
                <div class="d-flex align-center">
                  <v-avatar color="orange-lighten-5" size="40" class="mr-4">
                    <v-icon color="warning">mdi-map-marker-outline</v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-caption text-grey font-weight-bold text-uppercase">Địa chỉ</div>
                    <div class="text-body-2 font-weight-medium">{{ staff.address || 'Chưa cập nhật' }}</div>
                  </div>
                </div>
              </div>
            </v-card-text>
            <v-card-actions class="pa-6 pt-0 no-print">
               <!-- Action buttons could go here if needed more -->
            </v-card-actions>
          </v-card>
        </v-col>

        <!-- CỘT PHẢI: CHI TIẾT HỒ SƠ & CÔNG VIỆC -->
        <v-col cols="12" md="8">
          <v-tabs v-model="tab" color="primary" align-tabs="start" class="mb-4">
            <v-tab value="profile" class="text-capitalize"><v-icon start>mdi-account-details</v-icon>Hồ sơ nhân sự</v-tab>
            <v-tab value="work" class="text-capitalize"><v-icon start>mdi-briefcase-outline</v-icon>Công việc & Lương</v-tab>
            <v-tab v-if="staff.roles?.includes('Trainer')" value="expertise" class="text-capitalize"><v-icon start>mdi-certificate-outline</v-icon>Chuyên môn (PT)</v-tab>
          </v-tabs>

          <v-window v-model="tab">
            <!-- TAB: HỒ SƠ CHI TIẾT -->
            <v-window-item value="profile">
              <v-card class="rounded-xl border shadow-sm pa-6">
                <h3 class="text-h6 font-weight-bold mb-4 d-flex align-center">
                  <v-icon class="mr-2" color="primary">mdi-card-account-details</v-icon>
                  Thông tin cá nhân
                </h3>
                <v-row>
                  <v-col cols="12" sm="6">
                    <div class="text-caption text-grey">Số CCCD/CMND</div>
                    <div class="text-body-1 font-weight-medium">{{ staff.identityNumber || '---' }}</div>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <div class="text-caption text-grey">Giới tính</div>
                    <div class="text-body-1 font-weight-medium">{{ staff.gender || '---' }}</div>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <div class="text-caption text-grey">Ngày sinh</div>
                    <div class="text-body-1 font-weight-medium">{{ formatDate(staff.birthDate) }}</div>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <div class="text-caption text-grey">Mật khẩu</div>
                    <div class="text-body-2 text-grey-darken-1">******** (Đã mã hóa)</div>
                  </v-col>
                </v-row>

                <v-divider class="my-6"></v-divider>

                <h3 class="text-h6 font-weight-bold mb-4 d-flex align-center">
                  <v-icon class="mr-2" color="primary">mdi-bank-outline</v-icon>
                  Thông tin tài chính
                </h3>
                <v-row>
                  <v-col cols="12" sm="6">
                    <div class="text-caption text-grey">Ngân hàng</div>
                    <div class="text-body-1 font-weight-medium">{{ staff.bankName || '---' }}</div>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <div class="text-caption text-grey">Số tài khoản</div>
                    <div class="text-body-1 font-weight-medium font-mono text-primary">{{ staff.bankCardNumber || '---' }}</div>
                  </v-col>
                </v-row>

                <v-divider class="my-6"></v-divider>

                <div class="d-flex align-center justify-space-between mb-2">
                  <h3 class="text-h6 font-weight-bold d-flex align-center">
                    <v-icon class="mr-2" color="primary">mdi-file-document-outline</v-icon>
                    Tài liệu đính kèm
                  </h3>
                  <v-btn size="small" variant="text" color="primary" prepend-icon="mdi-upload">Tải lên</v-btn>
                </div>
                <v-list class="bg-grey-lighten-5 rounded-lg border">
                  <v-list-item title="Hợp đồng lao động.pdf" subtitle="2.4 MB - Cập nhật 04/04/2026">
                    <template #prepend><v-icon color="red">mdi-file-pdf-box</v-icon></template>
                    <template #append>
                      <v-btn icon="mdi-download-outline" variant="text" size="small"></v-btn>
                    </template>
                  </v-list-item>
                  <v-divider></v-divider>
                  <v-list-item title="CMND_Mat_Truoc.jpg" subtitle="1.1 MB - Cập nhật 01/01/2026">
                    <template #prepend><v-icon color="blue">mdi-file-image-outline</v-icon></template>
                    <template #append>
                      <v-btn icon="mdi-eye-outline" variant="text" size="small"></v-btn>
                    </template>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-window-item>

            <!-- TAB: CÔNG VIỆC & LƯƠNG -->
            <v-window-item value="work">
              <v-card class="rounded-xl border shadow-sm pa-6">
                <v-row>
                  <v-col cols="12" sm="4">
                    <v-card color="blue-lighten-5" flat class="pa-4 rounded-lg text-center h-100 border-blue-lighten-4 border">
                      <div class="text-caption text-blue-darken-3 font-weight-bold mb-1">NGÀY TẠO TÀI KHOẢN</div>
                      <div class="text-h6 font-weight-bold text-blue-darken-4">{{ formatDate(staff.createdAt) }}</div>
                    </v-card>
                  </v-col>
                  <v-col cols="12" sm="4">
                    <v-card color="green-lighten-5" flat class="pa-4 rounded-lg text-center h-100 border-green-lighten-4 border">
                      <div class="text-caption text-green-darken-3 font-weight-bold mb-1">NGÀY VÀO LÀM</div>
                      <div class="text-h6 font-weight-bold text-green-darken-4">{{ formatDate(staff.hireDate) || 'Chưa cập nhật' }}</div>
                    </v-card>
                  </v-col>
                  <v-col cols="12" sm="4">
                    <v-card color="orange-lighten-5" flat class="pa-4 rounded-lg text-center h-100 border-orange-lighten-4 border">
                      <div class="text-caption text-orange-darken-3 font-weight-bold mb-1">LƯƠNG CƠ BẢN</div>
                      <div class="text-h6 font-weight-bold text-orange-darken-4">{{ formatCurrency(staff.salary) }}</div>
                    </v-card>
                  </v-col>
                </v-row>

                <h3 class="text-h6 font-weight-bold mt-8 mb-4 d-flex align-center">
                  <v-icon class="mr-2" color="primary">mdi-history</v-icon>
                  Lịch sử hoạt động
                </h3>
                <v-timeline side="end" density="compact" align="start">
                  <v-timeline-item dot-color="success" size="small">
                    <div class="d-flex justify-space-between align-center">
                      <strong>Cập nhật thông tin ngân hàng</strong>
                      <span class="text-caption text-grey">09/04/2026 14:20</span>
                    </div>
                  </v-timeline-item>
                  <v-timeline-item dot-color="primary" size="small">
                    <div class="d-flex justify-space-between align-center">
                      <strong>Được thăng chức lên Quản lý danh mục</strong>
                      <span class="text-caption text-grey">01/03/2026</span>
                    </div>
                  </v-timeline-item>
                  <v-timeline-item dot-color="grey" size="small">
                    <div class="d-flex justify-space-between align-center">
                      <strong>Khởi tạo tài khoản nhân viên</strong>
                      <span class="text-caption text-grey">01/01/2026</span>
                    </div>
                  </v-timeline-item>
                </v-timeline>
              </v-card>
            </v-window-item>

            <!-- TAB: CHUYÊN MÔN PT -->
            <v-window-item value="expertise">
              <v-card class="rounded-xl border shadow-sm pa-6">
                <h3 class="text-h6 font-weight-bold mb-4 d-flex align-center">
                  <v-icon class="mr-2" color="primary">mdi-dumbbell</v-icon>
                  Năng lực huấn luyện
                </h3>
                <v-row>
                  <v-col cols="12" sm="6">
                    <div class="text-caption text-grey">Chuyên môn chính</div>
                    <div class="text-h6 text-primary font-weight-bold mb-4">{{ staff.specialization || 'Chưa cập nhật' }}</div>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <div class="text-caption text-grey">Số năm kinh nghiệm</div>
                    <div class="text-h6 font-weight-bold mb-4">{{ staff.experienceYears || 0 }} năm</div>
                  </v-col>
                </v-row>
                
                <h4 class="text-subtitle-1 font-weight-bold mb-2">Giới thiệu bản thân</h4>
                <v-sheet color="grey-lighten-4" class="pa-4 rounded-lg border text-body-1" style="white-space: pre-line;">
                  {{ staff.bio || 'Chưa có thông tin giới thiệu chi tiết cho huấn luyện viên này.' }}
                </v-sheet>
              </v-card>
            </v-window-item>
          </v-window>
        </v-col>
      </v-row>
    </template>

    <v-snackbar v-model="snack.show" :color="snack.color" location="top right">{{ snack.message }}</v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { userService } from '@/services/userService'
import { formatDate, formatCurrency } from '@/utils/helpers'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const staff = ref(null)
const error = ref(null)
const tab = ref('profile')
const snack = ref({ show: false, message: '', color: 'success' })

const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await userService.getById(route.params.id)
    if (res.success) {
      staff.value = res.data
    } else {
      error.value = res.message || 'Không tìm thấy thông tin nhân viên'
    }
  } catch (err) {
    error.value = 'Lỗi kết nối máy chủ'
  } finally {
    loading.value = false
  }
}

const openEdit = () => {
  // Logic to open edit dialog or navigate to edit page
  // For now, we can navigate back with a query param if needed
  router.push({ name: 'Staff', query: { edit: staff.value.id } })
}

const getRoleColor = (role) => {
  switch (role) {
    case 'Admin': return 'red-darken-2'
    case 'Manager': return 'orange-darken-2'
    case 'Receptionist': return 'blue-darken-2'
    case 'Trainer': return 'success'
    default: return 'grey-darken-1'
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

const handlePrint = () => {
  window.print()
}

onMounted(fetchData)
</script>

<style scoped>
.staff-avatar-offset {
  margin-top: -65px;
  border: 6px solid white;
}
.gap-2 { gap: 8px; }
.font-mono { font-family: monospace; }

@media print {
  .no-print {
    display: none !important;
  }
  .v-main {
    padding: 0 !important;
  }
  .v-container {
    padding: 0 !important;
    max-width: none !important;
  }
  .shadow-sm {
    box-shadow: none !important;
  }
  .v-tabs, .v-divider {
    border: none !important;
  }
  .v-card {
    border: 1px solid #ddd !important;
  }
}
</style>
