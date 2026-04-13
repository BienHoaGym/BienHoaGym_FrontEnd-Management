<template>
  <v-avatar :size="size" :color="avatarColor" :class="[elevationClass, {'staff-avatar-pulse': loading}]" :style="customStyle">
    <!-- Image Display -->
    <v-img 
      v-if="profileUrl && !isDead" 
      :src="profileUrl" 
      cover 
      @error="handleError"
      @load="loading = false"
    >
      <template #placeholder>
        <div class="d-flex align-center justify-center fill-height bg-grey-lighten-3">
          <v-progress-circular indeterminate color="primary" size="20"></v-progress-circular>
        </div>
      </template>
    </v-img>

    <!-- Fallback Text (Initials) -->
    <span v-else :class="textClass">
      {{ initials }}
    </span>
  </v-avatar>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { getFullImageUrl, markUrlAsDead, isUrlDead } from '@/utils/helpers'

const props = defineProps({
  src: { type: String, default: '' },
  fullName: { type: String, default: '' },
  size: { type: [Number, String], default: 40 },
  color: { type: String, default: '' },
  elevation: { type: [Number, String], default: 0 },
  role: { type: String, default: '' }
})

const loading = ref(true)
const isDead = ref(isUrlDead(props.src))

const profileUrl = computed(() => {
  if (!props.src || isDead.value) return null
  return getFullImageUrl(props.src)
})

const initials = computed(() => {
  if (!props.fullName) return '?'
  const words = props.fullName.trim().split(' ').filter(w => w.length > 0)
  if (words.length === 1) return words[0].substring(0, 1).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
})

const avatarColor = computed(() => {
  if (props.color) return props.color
  if (profileUrl.value && !isDead.value) return 'white'
  
  // Role based colors
  switch (props.role) {
    case 'Admin': return 'red-darken-2'
    case 'Manager': return 'orange-darken-3'
    case 'Receptionist': return 'blue-darken-2'
    case 'Trainer': return 'success'
    default: return 'primary'
  }
})

const textClass = computed(() => {
  const base = 'font-weight-bold text-white'
  if (props.size > 80) return `${base} text-h2`
  if (props.size > 60) return `${base} text-h4`
  if (props.size > 40) return `${base} text-h6`
  return `${base} text-body-1`
})

const elevationClass = computed(() => {
  return props.elevation > 0 ? `elevation-${props.elevation}` : ''
})

const customStyle = computed(() => {
  if (profileUrl.value && !isDead.value) return { border: '1px solid rgba(0,0,0,0.05)' }
  return {}
})

const handleError = () => {
  if (profileUrl.value) {
    markUrlAsDead(profileUrl.value)
    markUrlAsDead(props.src)
    isDead.value = true
  }
  loading.value = false
}

// Watch for src changes
watch(() => props.src, (newVal) => {
  isDead.value = isUrlDead(newVal)
  if (!newVal) loading.value = false
  else if (!isDead.value) loading.value = true
})

// If no src, we are not loading an image
if (!props.src) loading.value = false
</script>

<style scoped>
.staff-avatar-pulse {
  animation: avatar-pulse 2s infinite ease-in-out;
}

@keyframes avatar-pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}
</style>
