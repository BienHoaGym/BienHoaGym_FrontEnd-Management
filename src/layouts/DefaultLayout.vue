<template>
  <v-app>
    <v-app-bar fixed color="#111827" density="compact" elevation="2">
      <v-app-bar-nav-icon
        @click="drawer = !drawer"
        class="d-lg-none"
      />

      <v-toolbar-title class="d-flex align-center">
        <v-icon size="32" class="mr-2">mdi-dumbbell</v-icon>
        <span class="font-weight-bold">Quản lý Phòng Gym</span>
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
            <v-list-item-subtitle class="text-red-darken-2">{{ authStore.translatedRole }}</v-list-item-subtitle>
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
      v-model="drawer"
      :permanent="!isMobile"
      :temporary="isMobile"
      elevation="2"
      class="bg-grey-darken-4"
      location="left"
      width="280"
    >
        <div class="pa-4 d-flex align-center">
          <staff-avatar 
            :src="authStore.user?.profilePhoto" 
            :full-name="authStore.userName" 
            :role="authStore.userRole"
            size="48"
            class="mr-3"
          />
          <div class="overflow-hidden">
            <div class="text-body-2 font-weight-bold text-white text-truncate">{{ authStore.userName }}</div>
            <div class="text-caption text-red-darken-2 font-weight-medium text-truncate">{{ authStore.translatedRole }}</div>
          </div>
        </div>

      <v-divider class="mb-2" />

      <v-list nav class="px-2" density="compact">
        <template v-for="group in menuGroups" :key="group.title">
          <div class="sidebar-group-label text-grey-lighten-1 font-weight-bold px-4 mt-4 mb-1">
            {{ group.title }}
          </div>
          
          <v-list-item
            v-for="item in group.items"
            :key="item.title"
            :value="item.value"
            :to="item.to"
            :disabled="item.disabled"
            color="#EF5350" 
            rounded="md"
            class="mb-1 py-2 custom-nav-item"
          >
            <template v-slot:prepend>
              <v-icon size="22" class="mr-2">{{ item.icon }}</v-icon>
            </template>
            
            <template v-slot:title>
              <span class="text-body-2 font-weight-medium">{{ item.title }}</span>
            </template>
          </v-list-item>
        </template>
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
import StaffAvatar from '@/components/common/StaffAvatar.vue'

const router = useRouter()
const authStore = useAuthStore()
const { mobile } = useDisplay()

const drawer = ref(true)
const isMobile = computed(() => mobile.value)

// Menu groups based on user permissions
const menuGroups = computed(() => {
  const allGroups = [
    {
      title: 'TỔNG QUAN',
      items: [
        { title: 'Bảng điều khiển', icon: 'mdi-view-dashboard', to: '/dashboard', value: 'dashboard', permission: 'report.read' }, // Requires report.read permission
        { title: 'Bán hàng & POS', icon: 'mdi-cash-register', to: '/billing', value: 'billing', permission: 'billing.create' }
      ]
    },
    {
      title: 'QUẢN LÝ HỘI VIÊN',
      items: [
        { title: 'Hội viên', icon: 'mdi-account-group', to: '/members', value: 'members', permission: 'member.read' },
        { title: 'Gói tập', icon: 'mdi-package-variant-closed', to: '/packages', value: 'packages', permission: 'package.read' },
        { title: 'Gói đăng ký', icon: 'mdi-card-account-details-outline', to: '/subscriptions', value: 'subscriptions', permission: 'subscription.read' },
        { title: 'Check-in', icon: 'mdi-clock-check-outline', to: '/checkins', value: 'checkins', permission: 'checkin.read' }
      ]
    },
    {
      title: 'LỚP HỌC & ĐÀO TẠO',
      items: [
        { title: 'Quản lý Lịch lớp', icon: 'mdi-calendar-edit', to: '/classes', value: 'classes', permission: 'class.read' },
        { title: 'Phân công PT 1-1', icon: 'mdi-account-switch', to: '/trainer-assignments', value: 'trainer-assignments', permission: 'trainer.read' },
        { title: 'Lịch cá nhân PT', icon: 'mdi-calendar-account', to: '/my-schedule', value: 'my-schedule', permission: 'class.manage' }
      ]
    },
    {
      title: 'QUẢN LÝ KHO',
      items: [
        { title: 'Danh mục Sản phẩm', icon: 'mdi-basket-outline', to: '/products', value: 'products', permission: 'product.read' },
        { title: 'Thiết bị & Máy móc', icon: 'mdi-vibrate', to: '/equipment', value: 'equipment', permission: 'equipment.read' },
        { title: 'Phân loại thiết bị', icon: 'mdi-shape-outline', to: '/equipment/categories', value: 'categories', permission: 'equipment.read' },
        { title: 'Tồn kho vật tư', icon: 'mdi-warehouse', to: '/inventory', value: 'inventory', permission: 'inventory.read' },
        { title: 'Nhà cung cấp', icon: 'mdi-truck-delivery', to: '/providers', value: 'providers', permission: 'settings.manage' }
      ]
    },
    {
      title: 'BÁO CÁO',
      items: [
        { title: 'Doanh thu', icon: 'mdi-chart-bar', to: '/reports/revenue', value: 'revenue', permission: 'report.financial' },
        { title: 'Tài sản & Tồn kho', icon: 'mdi-chart-pie', to: '/reports/assets-inventory', value: 'assets-report', permission: 'report.read' }
      ]
    },
    {
      title: 'HỆ THỐNG',
      items: [
        { title: 'Phân quyền RBAC', icon: 'mdi-shield-check', to: '/roles', value: 'rbac', permission: 'settings.manage' },
        { title: 'Quản lý Nhân sự', icon: 'mdi-account-group-outline', to: '/staff', value: 'staff', permission: 'settings.manage' },
        { title: 'Nhật ký hệ thống', icon: 'mdi-history', to: '/audit-logs', value: 'audit-logs', permission: 'auditlog.read' }
      ]
    },
  ]

  // Filter based on permissions
  return allGroups.map(group => {
    const visibleItems = group.items.filter(item => {
      // If no permission is required, show it
      if (!item.permission) return true
      // Otherwise check with authStore
      return authStore.hasPermission(item.permission)
    })

    return {
      ...group,
      items: visibleItems
    }
  }).filter(group => group.items.length > 0)
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
  color: #BDBDBD !important; /* Mặc định chữ xám nhạt */
}

.custom-nav-item:hover:not(.v-list-item--active) {
  background-color: rgba(255, 255, 255, 0.1) !important;
  transform: translateX(4px);
  color: #fff !important;
}

/* Kiểu dáng cho nhãn của nhóm sidebar */
.sidebar-group-label {
  font-size: 0.65rem;
  letter-spacing: 0.08rem;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45) !important;
}

.hover-item:hover {
  background-color: #f5f5f5;
}

/* Căn chỉnh đường viền phải của sidebar cho tách biệt với main content */
.border-r {
  border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
}

/* ĐẢM BẢO SIDEBAR KHÔNG BỊ ĐẨY LÊN VÀ CHỈ LẤY VỪA ĐỦ CHIỀU CAO NỘI DUNG */
:deep(.v-navigation-drawer) {
  top: 48px !important; 
  height: auto !important;
  max-height: calc(100vh - 48px) !important;
  position: fixed !important;
  border-bottom-right-radius: 12px;
}

:deep(.v-navigation-drawer__content) {
  height: auto !important;
  position: static !important;
}

/* ĐẢM BẢO HEADER CỐ ĐỊNH */
:deep(.v-app-bar) {
  position: fixed !important;
  top: 0 !important;
  z-index: 1001 !important;
}

/* Fix padding cho v-main để không bị đè bởi bar cố định */
:deep(.v-main) {
  padding-top: 48px !important;
}
</style>