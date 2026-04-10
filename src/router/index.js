// src/router/index.js
import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Layouts
import AuthLayout from '@/layouts/AuthLayout.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const routes = [
  // Auth Routes (No authentication required)
  {
    path: '/login',
    component: AuthLayout,
    children: [
      {
        path: '',
        name: 'Login',
        component: () => import('@/views/auth/LoginView.vue'),
        meta: { requiresAuth: false, title: 'Đăng nhập' }
      }
    ]
  },

  // Main Routes (Authentication required)
  {
    path: '/',
    component: DefaultLayout,
    meta: { requiresAuth: true }, // Áp dụng cho tất cả con
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: { permission: 'report.read', title: 'Dashboard' } // Requires report.read permission
      },
      {
        path: 'reports/revenue',
        name: 'RevenueAnalysis',
        component: () => import('@/views/dashboard/RevenueAnalysis.vue'),
        meta: { permission: 'report.financial', title: 'Báo cáo doanh thu' }
      },
      {
        path: 'reports/assets-inventory',
        name: 'AssetInventoryReports',
        component: () => import('@/views/dashboard/AssetInventoryReports.vue'),
        meta: { permission: 'report.read', title: 'Báo cáo Tài sản & Kho' }
      },
      {
        path: 'members',
        name: 'Members',
        component: () => import('@/views/members/MembersListView.vue'),
        meta: { permission: 'member.read', title: 'Quản lý Hội viên' }
      },
      {
        path: 'members/:id',
        name: 'MemberDetail',
        component: () => import('@/views/members/MemberDetailView.vue'),
        meta: { permission: 'member.read', title: 'Chi tiết Hội viên' }
      },
      {
        path: 'packages',
        name: 'Packages',
        component: () => import('@/views/packages/PackagesListView.vue'),
        meta: { permission: 'package.read', title: 'Quản lý Gói tập' }
      },
      {
        path: 'subscriptions',
        name: 'Subscriptions',
        component: () => import('@/views/subscriptions/SubscriptionsListView.vue'),
        meta: { permission: 'subscription.read', title: 'Quản lý Đăng ký' }
      },
      {
        path: 'checkins',
        name: 'CheckIns',
        component: () => import('@/views/checkins/CheckInsView.vue'),
        meta: { permission: 'checkin.read', title: 'Check-in' }
      },
      {
        path: 'staff',
        name: 'Staff',
        component: () => import('@/views/settings/StaffManagementView.vue'),
        meta: { permission: 'settings.manage', title: 'Quản lý Nhân sự' }
      },
      {
        path: 'staff/:id',
        name: 'StaffDetail',
        component: () => import('@/views/settings/StaffDetailView.vue'),
        meta: { permission: 'settings.manage', title: 'Chi tiết Nhân viên' }
      },
      {
        path: 'billing',
        name: 'Billing',
        component: () => import('@/views/billing/BillingView.vue'),
        meta: { permission: 'billing.create', title: 'Bán hàng & Thanh toán' }
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('@/views/products/ProductListView.vue'),
        meta: { permission: 'product.read', title: 'Quản lý Sản phẩm' }
      },
      {
        path: 'inventory',
        name: 'Inventory',
        component: () => import('@/views/inventory/InventoryListView.vue'),
        meta: { permission: 'inventory.read', title: 'Quản lý Kho hàng' }
      },
      {
        path: 'equipment',
        name: 'Equipment',
        component: () => import('@/views/equipment/EquipmentListView.vue'),
        meta: { permission: 'equipment.read', title: 'Quản lý Thiết bị' }
      },
      {
        path: 'equipment/categories',
        name: 'EquipmentCategories',
        component: () => import('@/views/equipment/CategoryListView.vue'),
        meta: { permission: 'equipment.read', title: 'Phân loại thiết bị' }
      },
      {
        path: 'providers',
        name: 'Providers',
        component: () => import('@/views/equipment/ProviderListView.vue'),
        meta: { permission: 'settings.manage', title: 'Nhà cung cấp' }
      },
      {
        path: 'classes',
        name: 'Classes',
        component: () => import('@/views/classes/ClassesListView.vue'),
        meta: { permission: 'class.read', title: 'Quản lý Lịch lớp học' }
      },
      {
        path: 'my-schedule',
        name: 'MySchedule',
        component: () => import('@/views/trainer/MyScheduleView.vue'),
        meta: { permission: 'class.manage', title: 'Lịch cá nhân của tôi' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/ProfileView.vue'),
        meta: { title: 'Hồ sơ cá nhân' }
      },
      {
        path: 'roles',
        name: 'RoleManagement',
        component: () => import('@/views/settings/RoleManagementView.vue'),
        meta: { permission: 'settings.manage', title: 'Thiết lập Phân quyền (RBAC)' }
      },
      {
        path: 'audit-logs',
        name: 'AuditLogs',
        component: () => import('@/views/admin/AuditLogView.vue'),
        meta: { permission: 'auditlog.read', title: 'Nhật ký hệ thống' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/settings/SettingsView.vue'),
        meta: { permission: 'settings.manage', title: 'Cài đặt hệ thống' }
      },

    ]
  },

  // Unauthorized Page
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: () => import('@/views/errors/UnauthorizedView.vue'),
    meta: { requiresAuth: false, title: 'Không có quyền truy cập' }
  },

  // 404 Not Found
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/errors/NotFoundView.vue'),
    meta: { requiresAuth: false, title: 'Không tìm thấy trang' }
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

/**
 * Helper to find the first authorized route for a user
 */
function getFirstAuthorizedRoute(authStore, routes) {
  // Check main routes (under DefaultLayout which is index 1 in our routes array)
  const mainRoutes = routes.find(r => r.path === '/')?.children || []

  for (const route of mainRoutes) {
    if (route.path === '' || route.path === 'dashboard') continue // Skip redirect or dashboard (already checked or recursive)

    if (!route.meta?.permission || authStore.hasPermission(route.meta.permission)) {
      return { name: route.name }
    }
  }

  return { name: 'Profile' } // Fallback to Profile which everyone has access to
}

/**
 * Navigation Guard
 */
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 1. Restore Auth from LocalStorage if not in Store
  if (!authStore.isAuthenticated && localStorage.getItem('token')) {
    authStore.initializeAuth()
  }

  // 2. Check if route requires login
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  // A. If page requires Login but not Logged In -> Redirect to Login
  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  // B. If Logged In but trying to access Login -> Redirect to Dashboard or first authorized route
  if (to.name === 'Login' && authStore.isAuthenticated) {
    if (authStore.hasPermission('report.read')) {
      next({ name: 'Dashboard' })
    } else {
      next(getFirstAuthorizedRoute(authStore, routes))
    }
    return
  }

  // C. Root redirect
  if (to.path === '/' && authStore.isAuthenticated) {
    if (authStore.hasPermission('report.read')) {
      next({ name: 'Dashboard' })
    } else {
      next(getFirstAuthorizedRoute(authStore, routes))
    }
    return
  }

  // D. Check Permissions
  if (requiresAuth && to.meta.permission) {
    const hasPerm = authStore.hasPermission(to.meta.permission)

    if (!hasPerm) {
      // If forbidden, and it was the dashboard, go to first authorized
      if (to.name === 'Dashboard') {
        next(getFirstAuthorizedRoute(authStore, routes))
      } else {
        next({ name: 'Unauthorized' })
      }
      return
    }
  }

  // E. Update Page Title
  document.title = to.meta.title ? `${to.meta.title} - Gym Management` : 'Gym Management'

  // F. Proceed
  next()
})

router.afterEach(() => {
  window.scrollTo(0, 0)
})

export default router