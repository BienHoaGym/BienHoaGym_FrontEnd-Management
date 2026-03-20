<template>
  <v-app>
    <v-app-bar app color="#111827" density="compact" elevation="2">
      <v-app-bar-nav-icon
        @click="drawer = !drawer"
        class="d-lg-none"
      />

      <v-toolbar-title class="d-flex align-center">
        <v-icon size="32" class="mr-2">mdi-dumbbell</v-icon>
        <span class="font-weight-bold">Gym Management</span>
      </v-toolbar-title>

      <v-spacer />

      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            variant="text"
            class="mr-2 font-weight-medium"
          >
            <v-icon left size="24" class="mr-2">mdi-account-circle</v-icon>
            {{ authStore.userName }}
            <v-icon right>mdi-chevron-down</v-icon>
          </v-btn>
        </template>

        <v-list elevation="3" rounded="lg">
          <v-list-item>
            <v-list-item-title class="font-weight-bold">{{ authStore.userEmail }}</v-list-item-title>
            <v-list-item-subtitle class="text-red-darken-2">{{ authStore.userRole }}</v-list-item-subtitle>
          </v-list-item>

          <v-divider class="my-2" />

          <v-list-item @click="handleProfile" class="hover-item">
            <template v-slot:prepend>
              <v-icon>mdi-account</v-icon>
            </template>
            <v-list-item-title>Hồ sơ cá nhân</v-list-item-title>
          </v-list-item>

          <v-list-item @click="handleSettings" class="hover-item">
            <template v-slot:prepend>
              <v-icon>mdi-cog</v-icon>
            </template>
            <v-list-item-title>Cài đặt</v-list-item-title>
          </v-list-item>

          <v-divider class="my-2" />

          <v-list-item @click="handleLogout" class="hover-item">
            <template v-slot:prepend>
              <v-icon color="error">mdi-logout</v-icon>
            </template>
            <v-list-item-title class="text-error font-weight-bold">Đăng xuất</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-navigation-drawer
      app
      v-model="drawer"
      :permanent="!isMobile"
      :temporary="isMobile"
      elevation="1"
      class="bg-grey-darken-4 border-r"
      style="position: fixed;"
    >
      <v-list class="pa-4">
        <v-list-item
          :prepend-avatar="`https://ui-avatars.com/api/?name=${authStore.userName}&background=b91c1c&color=fff&bold=true`"
          class="py-2"
        >
          <template v-slot:title>
            <span class="font-weight-bold text-body-1">{{ authStore.userName }}</span>
          </template>
          <template v-slot:subtitle>
            <span class="text-red-darken-2 font-weight-medium">{{ authStore.userRole }}</span>
          </template>
        </v-list-item>
      </v-list>

      <v-divider class="mb-2" />

      <v-list nav class="px-4">
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :value="item.value"
          :to="item.to"
          :disabled="item.disabled"
          color="#C62828" 
          rounded="lg"
          class="mb-2 py-3 custom-nav-item"
        >
          <template v-slot:prepend>
            <v-icon size="24" class="mr-3">{{ item.icon }}</v-icon>
          </template>
          
          <template v-slot:title>
            <span class="text-body-1 font-weight-medium">{{ item.title }}</span>
          </template>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main class="bg-grey-darken-3">
      <v-container fluid class="pa-6">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDisplay } from 'vuetify'

const router = useRouter()
const authStore = useAuthStore()
const { mobile } = useDisplay()

const drawer = ref(true)
const isMobile = computed(() => mobile.value)

// Menu items based on user role
const menuItems = computed(() => {
  const items = [
    {
      title: 'Tổng quan',
      icon: 'mdi-view-dashboard-outline',
      to: '/dashboard',
      value: 'dashboard'
    },
    {
      title: 'Báo cáo doanh thu',
      icon: 'mdi-chart-bar',
      to: '/reports/revenue',
      value: 'revenue'
    },
    {
      title: 'Báo cáo Tài sản & Kho',
      icon: 'mdi-finance',
      to: '/reports/assets-inventory',
      value: 'assets-report'
    },
    {
      title: 'Quản lý thành viên',
      icon: 'mdi-account-group-outline',
      to: '/members',
      value: 'members'
    },
    {
      title: 'Quản lý gói tập',
      icon: 'mdi-package-variant-closed',
      to: '/packages',
      value: 'packages'
    },
    {
      title: 'Quản lý đăng ký',
      icon: 'mdi-card-account-details-outline',
      to: '/subscriptions',
      value: 'subscriptions'
    },
    {
      title: 'Bán hàng & Thanh toán',
      icon: 'mdi-cash-register',
      to: '/billing',
      value: 'billing'
    },
    {
      title: 'Quản lý Kho hàng',
      icon: 'mdi-warehouse',
      to: '/inventory',
      value: 'inventory'
    },
    {
      title: 'Quản lý Thiết bị',
      icon: 'mdi-tools',
      to: '/equipment',
      value: 'equipment'
    },
    {
      title: 'Phân loại thiết bị',
      icon: 'mdi-tag-outline',
      to: '/equipment/categories',
      value: 'categories'
    },
    {
      title: 'Nhà cung cấp',
      icon: 'mdi-truck-outline',
      to: '/equipment/providers',
      value: 'providers'
    },
    {
      title: 'Quản lý check-in',
      icon: 'mdi-login',
      to: '/checkins',
      value: 'checkins'
    },
    {
      title: 'Huấn luyện viên',
      icon: 'mdi-account-tie-outline',
      to: '/trainers',
      value: 'trainers'
    },
    {
      title: 'Quản lý lớp học',
      icon: 'mdi-yoga',
      to: '/classes',
      value: 'classes'
    },
    {
      title: 'Quản lý nhật ký',
      icon: 'mdi-yoga',
      to: '/audit-logs',
      value: 'audit-logs'
    },
     {
      title: 'Cài đặt hệ thống',
      icon: 'mdi-cog-outline',
      to: '/settings',
      value: 'settings'
    }
  ]

  // Filter based on role if needed
  if (authStore.isTrainer) {
    return items.filter(item => 
      ['dashboard', 'classes', 'checkins'].includes(item.value)
    )
  }

  return items
})

const handleProfile = () => {
  router.push('/profile')
}

const handleSettings = () => {
  router.push('/settings')
}

const handleLogout = async () => {
  if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?')) {
    await authStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
/* Custom hover effect cho các mục menu */
.custom-nav-item {
  transition: all 0.2s ease;
}

.custom-nav-item:hover:not(.v-list-item--active) {
  background-color: #f5f5f5;
  transform: translateX(4px);
}

.hover-item:hover {
  background-color: #f5f5f5;
}

/* Căn chỉnh đường viền phải của sidebar cho tách biệt với main content */
.border-r {
  border-right: 1px solid #e0e0e0 !important;
}
</style>