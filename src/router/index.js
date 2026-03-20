// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
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
        meta: { title: 'Dashboard' }
      },
      {
        path: 'reports/revenue',
        name: 'RevenueAnalysis',
        component: () => import('@/views/dashboard/RevenueAnalysis.vue'),
        meta: { roles: ['Admin', 'Manager'], title: 'Báo cáo doanh thu' }
      },
      {
        path: 'reports/assets-inventory',
        name: 'AssetInventoryReports',
        component: () => import('@/views/dashboard/AssetInventoryReports.vue'),
        meta: { roles: ['Admin', 'Manager'], title: 'Báo cáo Tài sản & Kho' }
      },
      {
        path: 'members',
        name: 'Members',
        component: () => import('@/views/members/MembersListView.vue'),
        meta: { roles: ['Admin', 'Manager', 'Receptionist'], title: 'Quản lý Hội viên' }
      },
      {
        path: 'members/:id',
        name: 'MemberDetail',
        component: () => import('@/views/members/MemberDetailView.vue'),
        meta: { roles: ['Admin', 'Manager', 'Receptionist'], title: 'Chi tiết Hội viên' }
      },
      {
        path: 'packages',
        name: 'Packages',
        component: () => import('@/views/packages/PackagesListView.vue'),
        meta: { roles: ['Admin', 'Manager'], title: 'Quản lý Gói tập' }
      },
      {
        path: 'subscriptions',
        name: 'Subscriptions',
        component: () => import('@/views/subscriptions/SubscriptionsListView.vue'),
        meta: { roles: ['Admin', 'Manager', 'Receptionist'], title: 'Quản lý Đăng ký' }
      },
      {
        path: 'checkins',
        name: 'CheckIns',
        component: () => import('@/views/checkins/CheckInsView.vue'),
        meta: { roles: ['Admin', 'Manager', 'Receptionist'], title: 'Check-in' }
      },
      {
        path: 'trainers',
        name: 'Trainers',
        component: () => import('@/views/trainers/TrainersListView.vue'),
        meta: { roles: ['Admin', 'Manager'], title: 'Quản lý Huấn luyện viên' }
      },
      {
        path: 'trainers/:id',
        name: 'TrainerDetail',
        component: () => import('@/views/trainers/TrainerDetailView.vue'),
        meta: { roles: ['Admin', 'Manager'], title: 'Chi tiết Huấn luyện viên' }
      },
      {
        path: 'billing',
        name: 'Billing',
        component: () => import('@/views/billing/BillingView.vue'),
        meta: { roles: ['Admin', 'Manager', 'Receptionist'], title: 'Bán hàng & Thanh toán' }
      },
      {
        path: 'inventory',
        name: 'Inventory',
        component: () => import('@/views/inventory/InventoryListView.vue'),
        meta: { roles: ['Admin', 'Manager'], title: 'Quản lý Kho hàng' }
      },
      {
        path: 'equipment',
        name: 'Equipment',
        component: () => import('@/views/equipment/EquipmentListView.vue'),
        meta: { roles: ['Admin', 'Manager'], title: 'Quản lý Thiết bị' }
      },
      {
        path: 'equipment/categories',
        name: 'EquipmentCategories',
        component: () => import('@/views/equipment/CategoryListView.vue'),
        meta: { roles: ['Admin', 'Manager'], title: 'Phân loại thiết bị' }
      },
      {
        path: 'equipment/providers',
        name: 'Providers',
        component: () => import('@/views/equipment/ProviderListView.vue'),
        meta: { roles: ['Admin', 'Manager'], title: 'Nhà cung cấp' }
      },
      {
        path: 'classes',
        name: 'Classes',
        component: () => import('@/views/classes/ClassesListView.vue'),
        meta: { title: 'Lịch lớp học' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/ProfileView.vue'),
        meta: { title: 'Hồ sơ cá nhân' }
      },
       {
        path: 'audit-logs',
        name: 'AuditLogs',
        component: () => import('@/views/admin/AuditLogView.vue'),
        meta: { roles: ['Admin'], title: 'Nhật ký hệ thống' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/settings/SettingsView.vue'),
        meta: { roles: ['Admin'], title: 'Cài đặt hệ thống' }
      }
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
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

/**
 * Navigation Guard
 */
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 1. Khôi phục Auth từ LocalStorage nếu chưa có trong Store
  // (Làm việc này trước tiên để đảm bảo isAuthenticated đúng)
  if (!authStore.isAuthenticated && localStorage.getItem('token')) {
    authStore.initializeAuth()
  }

  // 2. Kiểm tra trang yêu cầu đăng nhập
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  // A. Nếu trang yêu cầu Login mà chưa Login -> Chuyển về Login
  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  // B. Nếu đã Login mà cố vào trang Login -> Chuyển về Dashboard
  if (to.name === 'Login' && authStore.isAuthenticated) {
    next({ name: 'Dashboard' })
    return
  }

  // C. Kiểm tra quyền hạn (Role)
  // Chỉ kiểm tra nếu đã login và route có yêu cầu roles
  if (requiresAuth && to.meta.roles) {
    // Lưu ý: authStore.hasRole cần nhận vào 1 mảng roles
    // Bạn cần đảm bảo hàm hasRole trong store xử lý đúng logic này
    const hasRequiredRole = to.meta.roles.some(role => authStore.user?.role === role || authStore.user?.roles?.includes(role));
    
    // Nếu store chưa có hàm hasRole, dùng logic tạm ở trên hoặc gọi hàm store:
    // if (!authStore.hasRole(to.meta.roles)) { ... }

    // Logic kiểm tra Role đơn giản (sửa lại cho khớp với Store của bạn):
    const userRole = authStore.user?.role || ''; // Lấy role từ user
    if (!to.meta.roles.includes(userRole)) {
       next({ name: 'Unauthorized' })
       return
    }
  }

  // D. Cập nhật Tiêu đề trang
  document.title = to.meta.title ? `${to.meta.title} - Gym Management` : 'Gym Management'

  // E. Cho phép đi tiếp
  next()
})

router.afterEach(() => {
  window.scrollTo(0, 0)
})

export default router