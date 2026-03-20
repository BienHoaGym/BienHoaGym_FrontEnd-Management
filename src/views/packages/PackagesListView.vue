<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Packages</h1>
        <p class="text-subtitle-1 text-grey mt-1">Manage membership packages</p>
      </div>
      <v-btn color="primary" size="large" prepend-icon="mdi-plus" @click="openCreate">
        Add Package
      </v-btn>
    </div>

    <v-row v-if="!packageStore.loading">
      <v-col v-for="pkg in packageStore.packages" :key="pkg.id" cols="12" sm="6" md="4" lg="3">
        <v-card :class="['h-100', !pkg.isActive ? 'opacity-60' : '']" hover>
          <div class="pa-5 pb-3" :style="`background: ${getPkgColor(pkg.price)};`">
            <div class="d-flex justify-space-between align-start">
              <div>
                <v-chip size="x-small" class="mb-2" :color="pkg.isActive ? 'success' : 'error'">
                  {{ pkg.isActive ? 'Active' : 'Inactive' }}
                </v-chip>
                <div class="text-h6 font-weight-bold text-white">{{ pkg.name || pkg.packageName }}</div>
              </div>
              <v-menu>
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-dots-vertical"
                    size="x-small"
                    variant="text"
                    color="white"
                  />
                </template>
                <v-list density="compact">
                  <v-list-item prepend-icon="mdi-pencil" title="Edit" @click="openEdit(pkg)" />
                  <v-list-item
                    prepend-icon="mdi-delete"
                    title="Delete"
                    base-color="error"
                    @click="confirmDelete(pkg)"
                  />
                </v-list>
              </v-menu>
            </div>
          </div>

          <v-card-text class="pa-5">
            <div class="text-h4 font-weight-bold mb-1">
              {{ formatCurrency(pkg.discountPrice || pkg.price) }}
            </div>
            <div
              v-if="pkg.discountPrice"
              class="text-body-2 text-grey text-decoration-line-through mb-3"
            >
              {{ formatCurrency(pkg.price) }}
            </div>
            <div class="text-caption text-grey mb-4">per {{ pkg.durationInDays || pkg.durationDays }} days</div>

            <v-list density="compact" class="pa-0">
              <v-list-item density="compact" class="px-0">
                <template #prepend>
                  <v-icon color="success" size="18">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                  {{ pkg.durationInDays || pkg.durationDays }} days access
                </v-list-item-title>
              </v-list-item>
              <v-list-item density="compact" class="px-0">
                <template #prepend>
                  <v-icon color="success" size="18">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                  {{ pkg.sessionLimit ? `${pkg.sessionLimit} sessions` : 'Unlimited sessions' }}
                </v-list-item-title>
              </v-list-item>
            </v-list>

            <p v-if="pkg.description" class="text-caption text-grey mt-3">
              {{ pkg.description }}
            </p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col v-if="!packageStore.packages.length" cols="12">
        <div class="text-center py-16">
          <v-icon size="80" color="grey-lighten-2">mdi-package-variant-closed</v-icon>
          <p class="text-h6 text-grey mt-4">No packages yet</p>
          <v-btn color="primary" class="mt-4" @click="openCreate">Create First Package</v-btn>
        </div>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col v-for="i in 4" :key="i" cols="12" sm="6" md="4" lg="3">
        <v-skeleton-loader type="card" />
      </v-col>
    </v-row>

    <v-dialog v-model="formDialog" max-width="560" persistent>
      <v-card>
        <v-card-title class="d-flex align-center pa-6 bg-primary text-white">
          <v-icon class="mr-3">{{ isEdit ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
          {{ isEdit ? 'Edit Package' : 'Create Package' }}
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" color="white" @click="formDialog = false" />
        </v-card-title>

        <v-card-text class="pa-6">
          <v-form ref="formRef">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="form.name"
                  label="Package Name *"
                  variant="outlined"
                  density="comfortable"
                  :rules="[r.required]"
                  :disabled="saving"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="form.price"
                  label="Price (VND) *"
                  variant="outlined"
                  density="comfortable"
                  type="number"
                  :rules="[r.required, r.positive]"
                  :disabled="saving"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="form.discountPrice"
                  label="Discount Price (VND)"
                  variant="outlined"
                  density="comfortable"
                  type="number"
                  :disabled="saving"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="form.durationInDays"
                  label="Duration (days) *"
                  variant="outlined"
                  density="comfortable"
                  type="number"
                  :rules="[r.required, r.positive]"
                  :disabled="saving"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="form.sessionLimit"
                  label="Session Limit (blank = unlimited)"
                  variant="outlined"
                  density="comfortable"
                  type="number"
                  :disabled="saving"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="form.description"
                  label="Description"
                  variant="outlined"
                  density="comfortable"
                  rows="2"
                  :disabled="saving"
                />
              </v-col>
              <v-col v-if="isEdit" cols="12">
                <v-switch
                  v-model="form.isActive"
                  label="Active"
                  color="success"
                  :disabled="saving"
                  inset
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="outlined" :disabled="saving" @click="formDialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="saving" @click="handleSave">
            {{ isEdit ? 'Save Changes' : 'Create Package' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <confirm-dialog
      v-model="deleteDialog"
      title="Delete Package"
      :message="`Delete '${selected?.name}'? This cannot be undone.`"
      confirm-text="Delete"
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
import { ref, onMounted } from 'vue'
import { usePackageStore } from '@/stores/package'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { formatCurrency } from '@/utils/helpers'

// ĐÃ XÓA: import { packageService } ... (Không cần thiết vì dùng qua Store)

const packageStore = usePackageStore()

const formDialog = ref(false)
const deleteDialog = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const deleting = ref(false)
const selected = ref(null)
const formRef = ref(null)
const snack = ref({ show: false, message: '', color: 'success' })

// Cấu trúc Form chuẩn khớp với Backend (DTO)
const defaultForm = {
  name: '', // Lưu ý: Backend thường dùng 'Name', Frontend cũ dùng 'packageName', hãy kiểm tra DTO
  price: null,
  discountPrice: null,
  durationInDays: 30, // Kiểm tra DTO backend: DurationInDays hay DurationDays
  durationInMonths: 1, // Thường backend cần cả tháng
  sessionLimit: null,
  description: '',
  isActive: true,
}
const form = ref({ ...defaultForm })

const r = {
  required: (v) => (v !== null && v !== '' && v !== undefined) || 'Required',
  positive: (v) => !v || Number(v) > 0 || 'Must be positive',
}

const getPkgColor = (price) => {
  if (price >= 1000000) return 'linear-gradient(135deg, #667eea, #764ba2)'
  if (price >= 500000) return 'linear-gradient(135deg, #f093fb, #f5576c)'
  return 'linear-gradient(135deg, #4facfe, #00f2fe)'
}

const showSnack = (msg, color = 'success') => {
  snack.value = { show: true, message: msg, color }
}

const openCreate = () => {
  isEdit.value = false
  form.value = { ...defaultForm }
  formDialog.value = true
}

const openEdit = (pkg) => {
  isEdit.value = true
  selected.value = pkg
  // Map dữ liệu từ pkg vào form
  form.value = {
    name: pkg.name || pkg.packageName, // Xử lý cả 2 trường hợp tên
    price: pkg.price,
    discountPrice: pkg.discountPrice || null,
    durationInDays: pkg.durationInDays || pkg.durationDays,
    durationInMonths: pkg.durationInMonths || 1,
    sessionLimit: pkg.sessionLimit || null,
    description: pkg.description || '',
    isActive: pkg.isActive,
  }
  formDialog.value = true
}

const confirmDelete = (pkg) => {
  selected.value = pkg
  deleteDialog.value = true
}

const handleSave = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  
  saving.value = true
  
  // Tính toán DurationInMonths (đơn giản hóa)
  if (form.value.durationInDays) {
      form.value.durationInMonths = Math.ceil(form.value.durationInDays / 30);
  }

  const result = isEdit.value
    ? await packageStore.updatePackage(selected.value.id, form.value)
    : await packageStore.createPackage(form.value)

  if (result.success) {
    formDialog.value = false
    showSnack(isEdit.value ? 'Package updated!' : 'Package created!')
  } else {
    showSnack(result.message, 'error')
  }
  saving.value = false
}

const handleDelete = async () => {
  deleting.value = true
  const result = await packageStore.deletePackage(selected.value.id)
  
  if (result.success) {
    deleteDialog.value = false
    showSnack('Package deleted!')
  } else {
    showSnack(result.message, 'error')
  }
  deleting.value = false
}

onMounted(() => {
    packageStore.fetchPackages()
})
</script>