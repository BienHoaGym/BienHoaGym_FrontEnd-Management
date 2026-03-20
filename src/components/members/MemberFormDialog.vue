<!-- src/components/members/MemberFormDialog.vue -->
<template>
  <v-dialog v-model="dialog" max-width="700" persistent scrollable>
    <v-card>
      <!-- Title -->
      <v-card-title class="d-flex align-center pa-6 bg-primary text-white">
        <v-icon class="mr-3">{{ isEdit ? 'mdi-account-edit' : 'mdi-account-plus' }}</v-icon>
        <span>{{ isEdit ? 'Edit Member' : 'Create New Member' }}</span>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" color="white" @click="close" />
      </v-card-title>

      <!-- Form -->
      <v-card-text class="pa-6">
        <v-form ref="formRef" @submit.prevent="handleSubmit">
          <v-row>
            <!-- Full Name -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.fullName"
                label="Full Name *"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required, rules.maxLength(255)]"
                :disabled="saving"
              />
            </v-col>

            <!-- Phone Number -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.phoneNumber"
                label="Phone Number *"
                prepend-inner-icon="mdi-phone"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required, rules.phone]"
                :disabled="saving"
                placeholder="0901234567"
              />
            </v-col>

            <!-- Email -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.email"
                label="Email"
                prepend-inner-icon="mdi-email"
                variant="outlined"
                density="comfortable"
                :rules="[rules.email]"
                :disabled="saving"
                placeholder="example@email.com"
              />
            </v-col>

            <!-- Date of Birth -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.dateOfBirth"
                label="Date of Birth"
                prepend-inner-icon="mdi-calendar"
                variant="outlined"
                density="comfortable"
                type="date"
                :disabled="saving"
              />
            </v-col>

            <!-- Gender -->
            <v-col cols="12" md="6">
              <v-select
                v-model="form.gender"
                :items="genderOptions"
                label="Gender"
                prepend-inner-icon="mdi-gender-male-female"
                variant="outlined"
                density="comfortable"
                :disabled="saving"
                clearable
              />
            </v-col>

            <!-- Address -->
            <v-col cols="12">
              <v-textarea
                v-model="form.address"
                label="Address"
                prepend-inner-icon="mdi-map-marker"
                variant="outlined"
                density="comfortable"
                rows="2"
                :disabled="saving"
              />
            </v-col>

            <!-- Emergency Contact -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.emergencyContact"
                label="Emergency Contact Name"
                prepend-inner-icon="mdi-account-alert"
                variant="outlined"
                density="comfortable"
                :disabled="saving"
              />
            </v-col>

            <!-- Emergency Phone -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.emergencyPhone"
                label="Emergency Phone"
                prepend-inner-icon="mdi-phone-alert"
                variant="outlined"
                density="comfortable"
                :rules="[rules.phone]"
                :disabled="saving"
                placeholder="0901234567"
              />
            </v-col>

            <!-- Notes -->
            <v-col cols="12">
              <v-textarea
                v-model="form.notes"
                label="Notes"
                prepend-inner-icon="mdi-note-text"
                variant="outlined"
                density="comfortable"
                rows="2"
                :disabled="saving"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <!-- Actions -->
      <v-divider />
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="outlined" :disabled="saving" @click="close"> Cancel </v-btn>
        <v-btn color="primary" :loading="saving" :disabled="saving" @click="handleSubmit">
          <v-icon left>{{ isEdit ? 'mdi-content-save' : 'mdi-plus' }}</v-icon>
          {{ isEdit ? 'Save Changes' : 'Create Member' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { memberService } from '@/services/memberService'

const props = defineProps({
  modelValue: Boolean,
  memberId: { type: String, default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const dialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const isEdit = computed(() => !!props.memberId)

const formRef = ref(null)
const saving = ref(false)
const loadingData = ref(false)

const defaultForm = {
  fullName: '',
  email: '',
  phoneNumber: '',
  dateOfBirth: null,
  gender: null,
  address: '',
  emergencyContact: '',
  emergencyPhone: '',
  notes: '',
}

const form = ref({ ...defaultForm })
const genderOptions = ['Male', 'Female', 'Other']

const rules = {
  required: (v) => !!v || 'This field is required',
  email: (v) => !v || /.+@.+\..+/.test(v) || 'Invalid email format',
  phone: (v) => !v || /^0\d{9}$/.test(v) || 'Must be 10 digits starting with 0',
  maxLength: (max) => (v) => !v || v.length <= max || `Max ${max} characters`,
}

const loadMember = async (id) => {
  loadingData.value = true
  try {
    const response = await memberService.getById(id)
    if (response.success) {
      const data = response.data
      form.value = {
        fullName: data.fullName || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : null,
        gender: data.gender || null,
        address: data.address || '',
        emergencyContact: data.emergencyContact || '',
        emergencyPhone: data.emergencyPhone || '',
        notes: data.notes || '',
      }
    }
  } catch (err) {
    console.error('Failed to load member:', err)
  } finally {
    loadingData.value = false
  }
}

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  saving.value = true
  try {
    let response
    if (isEdit.value) {
      response = await memberService.update(props.memberId, form.value)
    } else {
      response = await memberService.create(form.value)
    }

    if (response.success) {
      emit('saved', response.data)
      close()
    }
  } catch (err) {
    console.error('Save failed:', err)
  } finally {
    saving.value = false
  }
}

const close = () => {
  form.value = { ...defaultForm }
  formRef.value?.reset()
  emit('update:modelValue', false)
}

watch(
  () => props.memberId,
  (id) => {
    if (id && props.modelValue) loadMember(id)
  },
)

watch(
  () => props.modelValue,
  (open) => {
    if (open && props.memberId) loadMember(props.memberId)
    if (!open) {
      form.value = { ...defaultForm }
    }
  },
)
</script>
