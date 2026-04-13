<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Quản lý Đội ngũ PT</h1>
        <p class="text-subtitle-1 text-grey mt-1">Quản lý huấn luyện viên và phân công học viên</p>
      </div>
      <v-btn color="primary" size="large" prepend-icon="mdi-plus" @click="openCreate" class="text-capitalize">
        Thêm Huấn luyện viên
      </v-btn>
    </div>

    <!-- Trainer Cards -->
    <v-row v-if="!trainerStore.loading">
      <v-col
        v-for="trainer in trainerStore.trainers"
        :key="trainer.id"
        cols="12" sm="6" md="4" lg="3"
      >
        <v-card hover class="rounded-xl overflow-hidden" :class="!trainer.isActive ? 'opacity-60' : ''">
          <v-card-text class="text-center pt-6 pb-2">
            <v-avatar color="primary" variant="tonal" size="80" class="mb-3">
              <v-img v-if="trainer.profilePhoto" :src="getFullImageUrl(trainer.profilePhoto)" cover />
              <span v-else class="text-h4 font-weight-bold">
                {{ trainer.fullName?.charAt(0)?.toUpperCase() }}
              </span>
            </v-avatar>
            <div class="text-h6 font-weight-bold">{{ trainer.fullName }}</div>
            <div class="text-caption text-blue-darken-2 font-weight-medium mb-2">{{ trainer.specialization || 'PT Huấn luyện' }}</div>
            
            <div class="d-flex justify-center gap-1 mb-2">
              <v-chip size="x-small" color="primary" variant="flat">PT-{{ trainer.trainerCode || 'NA' }}</v-chip>
              <v-chip :color="trainer.isActive ? 'success' : 'error'" size="x-small" variant="tonal">
                {{ trainer.isActive ? 'Đang làm việc' : 'Nghỉ việc' }}
              </v-chip>
            </div>
          </v-card-text>

          <v-divider class="mx-4" />

          <v-card-text class="pa-4">
            <div class="d-flex align-center text-body-2 mb-2">
              <v-icon size="16" color="grey" class="mr-2">mdi-briefcase-outline</v-icon>
              {{ trainer.experienceYears || 0 }} năm kinh nghiệm
            </div>
            <div v-if="trainer.phoneNumber" class="d-flex align-center text-body-2 mb-2">
              <v-icon size="16" color="grey" class="mr-2">mdi-phone</v-icon>
              {{ trainer.phoneNumber }}
            </div>
            <div class="d-flex align-center text-body-2 text-primary font-weight-bold">
              <v-icon size="16" color="primary" class="mr-2">mdi-currency-usd</v-icon>
              {{ formatCurrency(trainer.salary) }} / tháng
            </div>
          </v-card-text>

          <v-divider />

          <v-card-actions class="pa-3">
            <v-btn
              variant="flat"
              color="primary"
              block
              prepend-icon="mdi-account-details"
              class="text-capitalize"
              :to="'/trainers/' + trainer.id"
            >
              Hồ sơ chi tiết
            </v-btn>
          </v-card-actions>
          
          <v-card-actions class="pa-2 pt-0 justify-center">
            <v-btn size="x-small" variant="text" color="warning" icon="mdi-pencil" @click="openEdit(trainer)" />
            <v-btn size="x-small" variant="text" color="error" icon="mdi-delete" @click="confirmDelete(trainer)" />
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col v-if="!trainerStore.trainers.length" cols="12">
        <div class="text-center py-16">
          <v-icon size="80" color="grey-lighten-2">mdi-account-tie-outline</v-icon>
          <p class="text-h6 text-grey mt-4">Chưa có huấn luyện viên nào</p>
          <v-btn color="primary" class="mt-4" @click="openCreate">Thêm PT đầu tiên</v-btn>
        </div>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col v-for="i in 4" :key="i" cols="12" sm="6" md="4" lg="3">
        <v-skeleton-loader type="card" class="rounded-xl" />
      </v-col>
    </v-row>

    <!-- Form Dialog -->
    <v-dialog v-model="formDialog" max-width="650" persistent>
      <v-card class="rounded-xl">
        <v-card-title class="d-flex align-center pa-6 bg-primary text-white">
          <v-icon class="mr-2">{{ isEdit ? 'mdi-pencil' : 'mdi-account-plus' }}</v-icon>
          {{ isEdit ? 'Cập nhật thông tin PT' : 'Thêm mới Huấn luyện viên' }}
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" color="white" @click="formDialog = false" />
        </v-card-title>

        <v-card-text class="pa-6">
          <v-form ref="formRef">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="form.fullName"
                  label="Họ và Tên PT *"
                  variant="outlined"
                  density="comfortable"
                  :rules="[r.required]"
                  :disabled="saving"
                />
              </v-col>
              <v-col cols="12">
                <div class="d-flex align-center gap-4">
                  <v-avatar size="64" class="border" rounded="lg">
                    <v-img v-if="form.profilePhoto" :src="getFullImageUrl(form.profilePhoto)" cover />
                    <v-icon v-else>mdi-account</v-icon>
                  </v-avatar>
                  <v-file-input
                    label="Tải lên ảnh chân dung PT"
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
                  density="comfortable"
                  :disabled="saving"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.email"
                  label="Email"
                  variant="outlined"
                  density="comfortable"
                  :rules="[r.email]"
                  :disabled="saving"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.specialization"
                  label="Chuyên môn"
                  variant="outlined"
                  density="comfortable"
                  :disabled="saving"
                  placeholder="Ví dụ: Gym, Yoga, Cardio, MMA"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="form.experienceYears"
                  label="Số năm kinh nghiệm"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  suffix="năm"
                  :disabled="saving"
                />
              </v-col>
              
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="form.salary"
                  label="Lương cơ bản"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  prefix="VND"
                  :disabled="saving"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="form.sessionRate"
                  label="Phí PT / buổi"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  prefix="VND"
                  :disabled="saving"
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="form.bio"
                  label="Tiểu sử & Kinh nghiệm chi tiết"
                  variant="outlined"
                  density="comfortable"
                  rows="3"
                  :disabled="saving"
                />
              </v-col>
              <v-col v-if="isEdit" cols="12">
                <v-switch
                  v-model="form.isActive"
                  label="Đang làm việc"
                  color="success"
                  inset
                  :disabled="saving"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="outlined" :disabled="saving" @click="formDialog = false">Hủy</v-btn>
          <v-btn color="primary" :loading="saving" @click="handleSave">
            {{ isEdit ? 'Lưu thay đổi' : 'Thêm PT' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirm -->
    <confirm-dialog
      v-model="deleteDialog"
      title="Xóa Huấn luyện viên"
      :message="`Bạn có chắc muốn xóa PT '${selected?.fullName}'? Hành động này sẽ thực hiện xoá mềm.`"
      confirm-text="Xác nhận xóa"
      type="error"
      :loading="deleting"
      @confirm="handleDelete"
    />

    <v-snackbar v-model="snack.show" :color="snack.color" location="top right" timeout="3000">
      {{ snack.message }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTrainerStore } from '@/stores/trainer'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { uploadService } from '@/services/uploadService'
import { getFullImageUrl } from '@/utils/helpers'

const trainerStore = useTrainerStore()
const route = useRoute()
const router = useRouter()

const formDialog = ref(false)
const deleteDialog = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const uploading = ref(false)
const deleting = ref(false)
const selected = ref(null)
const formRef = ref(null)
const snack = ref({ show: false, message: '', color: 'success' })


const handleFileChange = async (event) => {
  const file = event.target.files?.[0]
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

const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0)

const defaultForm = { 
  trainerCode: '', 
  fullName: '', 
  phoneNumber: '', 
  email: '', 
  specialization: '', 
  experienceYears: 0,
  salary: 0,
  sessionRate: 0,
  bio: '', 
  profilePhoto: '',
  isActive: true 
}
const form = ref({ ...defaultForm })

const r = {
  required: (v) => !!v || 'Bắt buộc nhập',
  email: (v) => !v || /.+@.+\..+/.test(v) || 'Email không hợp lệ'
}

const showSnack = (msg, color = 'success') => { snack.value = { show: true, message: msg, color } }

const openCreate = () => {
  isEdit.value = false
  form.value = { ...defaultForm }
  formDialog.value = true
}

const openEdit = (trainer) => {
  isEdit.value = true
  selected.value = trainer
  form.value = {
    trainerCode: trainer.trainerCode || '',
    fullName: trainer.fullName || '',
    phoneNumber: trainer.phoneNumber || '',
    email: trainer.email || '',
    specialization: trainer.specialization || '',
    experienceYears: trainer.experienceYears || 0,
    salary: trainer.salary || 0,
    sessionRate: trainer.sessionRate || 0,
    bio: trainer.bio || '',
    profilePhoto: trainer.profilePhoto || '',
    isActive: trainer.isActive
  }
  formDialog.value = true
}

const confirmDelete = (trainer) => { selected.value = trainer; deleteDialog.value = true }

const handleSave = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  saving.value = true
  const result = isEdit.value
    ? await trainerStore.update(selected.value.id, form.value)
    : await trainerStore.create(form.value)
  saving.value = false
  if (result.success) { 
    formDialog.value = false
    trainerStore.fetchAll()
    showSnack(isEdit.value ? 'Đã cập nhật PT!' : 'Đã thêm PT mới!') 
  }
  else showSnack(result.message, 'error')
}

const handleDelete = async () => {
  deleting.value = true
  const result = await trainerStore.remove(selected.value.id)
  deleting.value = false
  if (result.success) { 
    deleteDialog.value = false
    showSnack('Đã xóa huấn luyện viên!') 
  }
  else showSnack(result.message, 'error')
}

// Watch query for trigger edit modal from detail view
watch(() => route.query.edit, async (newVal) => {
  if (newVal) {
    if (!trainerStore.trainers.length) await trainerStore.fetchAll()
    const t = trainerStore.trainers.find(x => x.id === newVal)
    if (t) openEdit(t)
    // Clear query
    router.replace({ query: {} })
  }
}, { immediate: true })

onMounted(() => trainerStore.fetchAll())
</script>

<style scoped>
.gap-1 { gap: 4px; }
.v-card { transition: transform 0.2s, box-shadow 0.2s; }
.v-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.1) !important; }
</style>