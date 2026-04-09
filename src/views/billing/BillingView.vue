<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Bán hàng & Thanh toán</h1>
        <p class="text-subtitle-1 text-grey mt-1">Quản lý doanh thu, in hóa đơn và bán sản phẩm</p>
      </div>
    </div>

    <v-tabs v-model="activeTab" color="primary" class="mb-6">
      <v-tab value="pos">
        <v-icon start>mdi-cash-register</v-icon> Bán hàng (POS)
      </v-tab>
      <v-tab value="history">
        <v-icon start>mdi-history</v-icon> Lịch sử Hóa đơn
      </v-tab>
    </v-tabs>

    <v-window v-model="activeTab">
      <!-- POS TAB -->
      <v-window-item value="pos">
        <v-row>
          <!-- Catalog -->
          <v-col cols="12" md="8">
            <v-card class="rounded-xl border shadow-sm h-100">
              <v-card-title class="pa-4 d-flex align-center">
                <v-text-field
                  v-model="search"
                  placeholder="Tìm gói tập, sản phẩm, PT..."
                  prepend-inner-icon="mdi-magnify"
                  hide-details
                  density="compact"
                  variant="outlined"
                  class="rounded-lg mr-4"
                ></v-text-field>
                <v-chip-group v-model="filterType" mandatory selected-class="text-primary border-primary">
                  <v-chip value="all">Tất cả</v-chip>
                  <v-chip value="Package">Gói tập</v-chip>
                  <v-chip value="Product">Sản phẩm</v-chip>
                  <v-chip value="PT">Huấn luyện viên (PT)</v-chip>
                </v-chip-group>
              </v-card-title>
              
              <v-card-text class="pa-4 pt-0 overflow-y-auto" style="max-height: 600px;">
                <v-row>
                  <v-col v-for="item in filteredCatalog" :key="item.id + item.type" cols="12" sm="6" lg="4">
                    <v-card variant="outlined" class="rounded-lg hover-card" @click="addToCart(item)">
                      <div class="pa-3">
                        <div class="d-flex justify-space-between mb-2">
                          <v-chip size="x-small" :color="getTypeColor(item.type)" variant="flat" class="font-weight-bold">
                            {{ translateType(item.type) }}
                          </v-chip>
                          <v-chip v-if="item.hasPT" size="x-small" color="primary" variant="flat" class="font-weight-bold ml-1">
                            <v-icon start size="10">mdi-account-star</v-icon> PT
                          </v-chip>
                          <v-spacer />
                          <span v-if="item.type === 'Product'" class="text-caption text-grey">Kho: {{ item.stock }}</span>
                        </div>
                        <div class="text-body-1 font-weight-bold mb-1">{{ item.name }}</div>
                        <div class="text-h6 text-primary font-weight-bold">{{ formatPrice(item.price) }}</div>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Cart -->
          <v-col cols="12" md="4">
            <v-card class="rounded-xl border shadow-sm sticky-cart h-100 d-flex flex-column">
              <v-card-title class="pa-4 bg-grey-lighten-4 font-weight-bold d-flex align-center">
                Giỏ hàng
                <v-spacer />
                <v-btn icon="mdi-delete-sweep" variant="text" size="small" color="error" @click="cart = []"></v-btn>
              </v-card-title>
              
              <v-card-text class="pa-4 flex-grow-1 overflow-y-auto">
                <div v-if="!cart.length" class="text-center py-10 opacity-40">
                  <v-icon size="64">mdi-cart-outline</v-icon>
                  <p>Giỏ hàng đang trống</p>
                </div>
                
                <div v-for="(item, i) in cart" :key="i" class="mb-4 border-b pb-4">
                  <div class="d-flex justify-space-between align-start mb-2">
                    <div class="font-weight-bold">{{ item.name }}</div>
                    <v-btn icon="mdi-close" size="x-small" variant="text" @click="removeFromCart(i)"></v-btn>
                  </div>
                  <div class="d-flex align-center justify-space-between">
                    <div v-if="item.type === 'Product'" class="d-flex align-center">
                      <v-btn icon="mdi-minus" size="x-small" density="comfortable" variant="tonal" @click="updateQty(i, -1)"></v-btn>
                      <span class="mx-3 font-weight-bold">{{ item.qty }}</span>
                      <v-btn icon="mdi-plus" size="x-small" density="comfortable" variant="tonal" @click="updateQty(i, 1)"></v-btn>
                    </div>
                    <div v-else class="text-caption grey--text">
                      Số lượng: <span class="font-weight-bold ml-1">1</span>
                    </div>
                    <div class="font-weight-bold text-primary">{{ formatPrice(item.price * item.qty) }}</div>
                  </div>
                </div>
              </v-card-text>

              <v-divider />
              
              <v-card-text class="pa-4 bg-grey-lighten-5">
                <v-autocomplete
                  v-model="selectedMember"
                  label="Hội viên (Tùy chọn)"
                  placeholder="Tìm tên hoặc mã HV..."
                  :items="memberOptions"
                  item-title="label"
                  item-value="id"
                  density="compact"
                  variant="outlined"
                  class="mb-2"
                  clearable
                ></v-autocomplete>

                <!-- Informative Warning for Renewal (Stacking) -->
                <v-alert
                  v-if="hasActiveSub && hasPackageInCart"
                  type="info"
                  variant="tonal"
                  class="mb-3 rounded-lg"
                  density="compact"
                >
                  <div class="text-caption font-weight-bold">
                    <v-icon start size="14">mdi-information</v-icon>
                    Gia hạn gói tập
                  </div>
                  <div class="text-caption">Hội viên đang có gói tập. Gói mới sẽ tự động bắt đầu sau khi gói cũ hết hạn.</div>
                </v-alert>

                <!-- Pending Subscriptions section -->
                <div v-if="selectedMember && pendingSubsForMember.length" class="mb-4">
                  <div class="text-caption font-weight-bold text-warning mb-2 d-flex align-center">
                    <v-icon size="14" class="mr-1">mdi-alert-circle</v-icon>
                    Gói đang chờ thanh toán:
                  </div>
                  <v-card 
                    v-for="sub in pendingSubsForMember" 
                    :key="sub.id"
                    variant="tonal"
                    color="warning"
                    class="mb-2 clickable"
                    @click="addPendingSubToCart(sub)"
                  >
                    <div class="pa-2 d-flex justify-space-between align-center">
                      <div class="text-caption font-weight-bold">{{ sub.packageName }}</div>
                      <div class="text-caption font-weight-black">{{ formatPrice(sub.price) }}</div>
                    </div>
                  </v-card>
                </div>

                <div class="d-flex justify-space-between mb-2">
                  <span>Tạm tính</span>
                  <span class="font-weight-bold">{{ formatPrice(subtotal) }}</span>
                </div>
                <div class="d-flex justify-space-between mb-4">
                  <span>Giảm giá (%)</span>
                    <v-text-field
                      v-model.number="discount"
                      type="number"
                      variant="plain"
                      density="compact"
                      class="ml-10 text-right font-weight-bold text-error"
                      hide-details
                      suffix="%"
                      min="0"
                      :max="authStore.isReceptionist ? 10 : 100"
                      :persistent-hint="authStore.isReceptionist && discount > 10"
                      :hint="authStore.isReceptionist && discount > 10 ? 'Vượt quá hạn mức 10% của Lễ tân' : ''"
                    ></v-text-field>
                </div>
                <div class="d-flex justify-space-between text-h6 font-weight-bold mb-4">
                  <span>Thanh toán</span>
                  <span class="text-primary">{{ formatPrice(finalAmount) }}</span>
                </div>

                <div class="text-caption mb-2">Phương thức thanh toán:</div>
                <v-btn-toggle v-model="paymentMethod" mandatory color="primary" class="w-100 mb-4" density="comfortable">
                  <v-btn value="1" class="flex-grow-1">Tiền mặt</v-btn>
                  <v-btn value="2" class="flex-grow-1">Chuyển khoản</v-btn>
                  <v-btn value="3" class="flex-grow-1">Ví ĐT</v-btn>
                  <v-btn value="4" class="flex-grow-1">Thẻ</v-btn>
                </v-btn-toggle>

                <v-btn
                  block color="primary"
                  size="large" class="rounded-lg font-weight-bold"
                  :disabled="!cart.length || (authStore.isReceptionist && discount > 10)"
                  :loading="billingStore.saving"
                  @click="handleCheckout"
                >
                  Xác nhận & In hóa đơn
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>

      <!-- HISTORY TAB -->
      <v-window-item value="history">
        <v-card class="rounded-xl border shadow-sm">
          <v-data-table
            :headers="invoiceHeaders"
            :items="billingStore.invoices"
            :loading="billingStore.loading"
          >
            <template #[`item.invoiceNumber`]="{ item }">
              <span class="font-weight-bold text-primary">{{ item.invoiceNumber }}</span>
            </template>
            <template #[`item.finalAmount`]="{ item }">
              <span class="font-weight-bold">{{ formatPrice(item.finalAmount) }}</span>
            </template>
            <template #[`item.paymentMethod`]="{ item }">
              <v-chip size="small">{{ translatePaymentMethod(item.paymentMethod) }}</v-chip>
            </template>
            <template #[`item.createdAt`]="{ item }">
              {{ formatDate(item.createdAt) }}
            </template>
            <template #[`item.actions`]="{ item }">
              <v-btn icon="mdi-eye-outline" variant="text" color="primary" @click="viewInvoice(item)"></v-btn>
              <v-btn icon="mdi-printer-outline" variant="text" @click="printInvoice(item)"></v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-window-item>
    </v-window>

    <!-- Invoice Detail Dialog -->
    <v-dialog v-model="invoiceDialog" max-width="600">
      <v-card class="rounded-xl overflow-hidden" id="printable-invoice">
        <v-card-text class="pa-8">
          <div class="text-center mb-6">
            <div class="text-h4 font-weight-bold primary--text">HỆ THỐNG QUẢN LÝ GYM</div>
            <div class="text-caption">Hệ thống Quản lý Gym Chuyên nghiệp</div>
            <v-divider class="my-4" />
            <div class="text-h6 font-weight-bold">HÓA ĐƠN THANH TOÁN</div>
            <div class="text-subtitle-2">{{ selectedInvoice?.invoiceNumber }}</div>
          </div>

          <div class="mb-6 d-flex justify-space-between">
            <div>
              <div class="text-caption text-grey">Khách hàng</div>
              <div class="font-weight-bold">{{ selectedInvoice?.memberName }}</div>
            </div>
            <div class="text-right">
              <div class="text-caption text-grey">Ngày lập</div>
              <div class="font-weight-bold">{{ formatDateShort(selectedInvoice?.createdAt) }}</div>
            </div>
          </div>

          <v-table density="compact" class="mb-6 border rounded">
            <thead>
              <tr class="bg-grey-lighten-4">
                <th>Sản phẩm/Dịch vụ</th>
                <th class="text-center">SL</th>
                <th class="text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in selectedInvoice?.details" :key="d.id">
                <td>{{ d.itemName }}</td>
                <td class="text-center">{{ d.quantity }}</td>
                <td class="text-right font-weight-bold">{{ formatPrice(d.subtotal) }}</td>
              </tr>
            </tbody>
          </v-table>

          <v-row no-gutters>
            <v-col cols="7" offset="5">
              <div class="d-flex justify-space-between mb-1">
                <span class="text-grey">Tổng tiền:</span>
                <span class="font-weight-bold">{{ formatPrice(selectedInvoice?.totalAmount) }}</span>
              </div>
              <div class="d-flex justify-space-between mb-1">
                <span class="text-grey">Giảm giá:</span>
                <span class="text-error font-weight-bold">-{{ formatPrice(selectedInvoice?.discountAmount) }}</span>
              </div>
              <v-divider class="my-2" />
              <div class="d-flex justify-space-between text-h6 font-weight-bold text-primary">
                <span>THANH TOÁN:</span>
                <span>{{ formatPrice(selectedInvoice?.finalAmount) }}</span>
              </div>
            </v-col>
          </v-row>

          <div class="mt-8 text-center text-caption italic">
            Cảm ơn quý khách đã tin dùng dịch vụ của chúng tôi!<br>
            Hẹn gặp lại!
          </div>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4 bg-grey-lighten-4 no-print">
          <v-spacer />
          <v-btn variant="tonal" color="primary" prepend-icon="mdi-printer" @click="printCurrentInvoice">In hóa đơn</v-btn>
          <v-btn variant="text" @click="invoiceDialog = false">Đóng</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snack.show" :color="snack.color" location="top right">
      {{ snack.message }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useBillingStore } from '@/stores/billing'
import { usePackageStore } from '@/stores/package'
import { useTrainerStore } from '@/stores/trainer'
import { useMemberStore } from '@/stores/member'
import { useSubscriptionStore } from '@/stores/subscription'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import providerService from '@/services/providerService'
import { useApiErrorHandler } from '@/composables/useApiErrorHandler'

const billingStore = useBillingStore()
const packageStore = usePackageStore()
const trainerStore = useTrainerStore()
const memberStore = useMemberStore()
const subscriptionStore = useSubscriptionStore()
const authStore = useAuthStore()
const uiStore = useUiStore()
const router = useRouter()
const { handleError } = useApiErrorHandler()

const activeTab = ref('pos')
const search = ref('')
const filterType = ref('all')
const cart = ref([])
const discount = ref(0)
const selectedMember = ref(null)
const paymentMethod = ref("1")
const invoiceDialog = ref(false)
const selectedInvoice = ref(null)
const snack = ref({ show: false, message: '', color: 'success' })
const providers = ref([])

const invoiceHeaders = [
  { title: 'Số HĐ', key: 'invoiceNumber' },
  { title: 'Hội viên', key: 'memberName' },
  { title: 'Tổng cộng', key: 'finalAmount' },
  { title: 'PTTT', key: 'paymentMethod' },
  { title: 'Ngày lập', key: 'createdAt' },
  { title: 'Thao tác', key: 'actions', sortable: false }
]

const hasActiveSub = computed(() => {
  if (!selectedMember.value) return false
  return subscriptionStore.subscriptions.some(s => {
    const sMemberId = s.memberId || s.MemberId
    const sStatus = s.status || s.Status
    // Chỉ tính Active hoặc Pending (Nếu có gói cũ hết hạn thì ok)
    return sMemberId === selectedMember.value && (sStatus === 'Active' || sStatus === 'Pending')
  })
})

const hasPackageInCart = computed(() => cart.value.some(item => item.type === 'Package'))

const catalog = computed(() => {
  const items = []
  
  // 1. Gói tập (Packages) - Lấy từ store chuyên dụng để có đầy đủ metadata (hasPT, sessionLimit...)
  packageStore.packages.forEach(p => {
    const pkgId = p.id || p.Id
    items.push({ 
      id: pkgId, 
      type: 'Package', 
      name: p.name || p.packageName || p.PackageName || 'Gói tập', 
      // SỬA LỖI: Ưu tiên lấy giá khuyến mãi nếu có
      price: p.discountPrice || p.price || p.Price || 0,
      originalPrice: p.price || p.Price || 0,
      stock: '∞',
      hasPT: p.hasPT || p.HasPT || false,
      isActive: p.isActive !== false && p.IsActive !== false
    })
  })
  
  // 2. Sản phẩm (Products) - Chặn lấy trùng các gói tập nếu backend có trả về (để thống nhất logic xử lý)
  billingStore.products.filter(p => (p.isActive || p.IsActive) && p.type !== 1).forEach(p => {
    items.push({ 
      id: p.id || p.Id, 
      type: 'Product', 
      name: p.name || p.productName || 'Sản phẩm', 
      price: p.price || p.Price || 0, 
      stock: p.stockQuantity || p.StockQuantity || 0,
      isActive: true
    })
  })
  
  return items.filter(i => i.isActive)
})

const filteredCatalog = computed(() => {
  const query = (search.value || '').toLowerCase()
  return catalog.value.filter(item => {
    const itemName = (item.name || '').toLowerCase()
    const matchSearch = itemName.includes(query)
    let matchType = filterType.value === 'all' || item.type === filterType.value
    if (filterType.value === 'PT') {
      matchType = item.type === 'PT' || (item.type === 'Package' && item.hasPT)
    }
    return matchSearch && matchType
  })
})

const memberOptions = computed(() => 
  (memberStore.members || []).map(m => ({ 
    id: m.id || m.Id, 
    label: `${m.fullName || m.FullName || 'N/A'} (${m.memberCode || m.MemberCode || ''})` 
  }))
)

const pendingSubsForMember = computed(() => {
  if (!selectedMember.value) return []
  return (subscriptionStore.subscriptions || []).filter(s => {
    const sMemberId = s.memberId || s.MemberId
    const sStatus = s.status || s.Status
    return sMemberId === selectedMember.value && sStatus === 'Pending'
  }).map(s => ({
    id: s.id || s.Id,
    packageId: s.packageId || s.PackageId,
    packageName: s.packageName || s.PackageName || s.originalPackageName || 'Gói tập',
    // SỬA LỖI: Ưu tiên lấy giá bán thực tế của gói đang chờ (Price/FinalPrice)
    price: s.price || s.finalPrice || s.Price || s.FinalPrice || s.packagePrice || s.PackagePrice || 0
  }))
})

const addPendingSubToCart = (sub) => {
  const existing = cart.value.find(c => c.referenceId === sub.id && c.type === 'Subscription')
  if (existing) return
  
  cart.value.push({
    id: sub.packageId,
    referenceId: sub.id,
    type: 'Subscription',
    name: sub.packageName,
    price: sub.price,
    qty: 1
  })
}

const subtotal = computed(() => cart.value.reduce((sum, item) => sum + (item.price * item.qty), 0))
const discountAmount = computed(() => (subtotal.value * (discount.value || 0)) / 100)
const finalAmount = computed(() => Math.max(0, subtotal.value - discountAmount.value))

const addToCart = (item) => {
  if (item.type === 'Product' && (item.stock === 0 || item.stock === '0')) {
    showSnack('Sản phẩm đã hết hàng trong kho!', 'error')
    return
  }

  // CHẶN: Chỉ cho phép tối đa 1 gói tập trong giỏ hàng để tránh nhầm lẫn
  if (item.type === 'Package' && hasPackageInCart.value) {
    showAlert('Giới hạn giỏ hàng', 'Chỉ có thể đăng ký tối đa 1 gói tập trong mỗi hóa đơn!', 'warning', 'mdi-alert-box')
    return
  }
  
  const existing = cart.value.find(c => c.id === item.id && c.type === item.type)
  if (existing) {
    if (item.type === 'Package' || item.type === 'Subscription') {
      showSnack('Gói tập này đã có trong giỏ hàng!', 'warning')
      return
    }
    if (item.type === 'Product' && existing.qty >= item.stock) {
        showSnack(`Số lượng vượt quá tồn kho (${item.stock})`, 'warning')
        return
    }
    existing.qty++
  } else {
    cart.value.push({ ...item, qty: 1 })
  }
}

const removeFromCart = (index) => cart.value.splice(index, 1)
const updateQty = (index, delta) => {
  const itemInCart = cart.value[index]
  
  // Không cho phép chỉnh sửa số lượng gói tập
  if (itemInCart.type === 'Package' || itemInCart.type === 'Subscription') return

  // Find original item in catalog for stock check
  const original = catalog.value.find(c => c.id === itemInCart.id && c.type === itemInCart.type)
  
  if (delta > 0 && original && original.type === 'Product' && itemInCart.qty >= original.stock) {
    showSnack(`Số lượng vượt quá tồn kho (${original.stock})`, 'warning')
    return
  }
  
  itemInCart.qty = Math.max(1, itemInCart.qty + delta)
}

const handleCheckout = async () => {
  if (!cart.value.length) return
  
  if (!selectedMember.value) {
    showAlert('Thiếu thông tin', 'Vui lòng chọn khách hàng trước khi thanh toán!', 'warning', 'mdi-account-alert')
    return
  }
  
  const payload = {
    memberId: selectedMember.value,
    discountAmount: parseFloat((discountAmount.value || 0).toFixed(2)),
    paymentMethod: parseInt(paymentMethod.value || "1"),
    note: 'Bán hàng tại quầy',
    details: cart.value.map(item => ({
      itemType: item.type === 'Subscription' ? 'Package' : item.type,
      referenceId: item.type === 'Subscription' ? item.id : (item.type !== 'PT' ? item.id : null),
      itemName: item.name,
      quantity: item.qty || 1,
      unitPrice: item.price || 0,
      subscriptionId: item.type === 'Subscription' ? item.referenceId : null
    }))
  }
  
  const res = await billingStore.createInvoice(payload)
  if (res.success || res.Success) {
    showSnack('Thanh toán thành công!')
    selectedInvoice.value = res.data || res.Data
    invoiceDialog.value = true
    cart.value = []
    discount.value = 0
    selectedMember.value = null
    
    // Refresh stock
    billingStore.fetchProducts()
  } else {
    showAlert(
      'Không thể thanh toán', 
      res.message || res.Message || 'Lỗi hệ thống', 
      'error', 
      'mdi-alert-circle'
    )
    console.error('Checkout error:', res)
    handleError(res, { url: '/api/billing/checkout' })
  }
}

const viewInvoice = (invoice) => {
  selectedInvoice.value = invoice
  invoiceDialog.value = true
}

const printCurrentInvoice = () => {
  window.print()
}

// Helpers
const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0)
const formatDate = (d) => d ? new Date(d).toLocaleString('vi-VN') : '---'
const formatDateShort = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : ''

const showSnack = (msg, color = 'success') => snack.value = { show: true, message: msg, color }

const showAlert = (title, message, color = 'primary', icon = 'mdi-information-outline', sub = '') => {
  uiStore.showAlert(message, title, color, icon, sub)
}

const translateType = (t) => ({ 'Package': 'Gói tập', 'Product': 'Sản phẩm', 'PT': 'Buổi tập PT' }[t] || t)
const getTypeColor = (t) => ({ 'Package': 'orange', 'Product': 'blue', 'PT': 'purple' }[t] || 'grey')
const translatePaymentMethod = (m) => ({ 1: 'Tiền mặt', 2: 'Chuyển khoản', 3: 'Ví ĐT', 4: 'Thẻ' }[m] || 'Khác')

const fetchProviders = async () => {
  try {
    const res = await providerService.getAll()
    providers.value = res.data || []
  } catch (error) {
    console.error('Error loading providers:', error)
  }
}

onMounted(async () => {
  billingStore.fetchProducts()
  billingStore.fetchInvoices()
  packageStore.fetchPackages()
  
  // Tăng limit để tìm kiếm hội viên tốt hơn
  await memberStore.fetchMembers(1, 500)
  
  subscriptionStore.fetchAll()
  fetchProviders()
  
  // Handle query params
  const query = router.currentRoute.value.query
  const { tab, memberCode, memberId, subId } = query
  
  // 1. Chuyển Tab
  if (tab && ['pos', 'history'].includes(tab)) {
    activeTab.value = tab
  }

  // 2. Tự động chọn hội viên
  if (memberId) {
    selectedMember.value = memberId
  } else if (memberCode) {
    const member = memberStore.members.find(m => (m.memberCode || m.MemberCode) === memberCode)
    if (member) {
      selectedMember.value = member.id || member.Id
    }
  }

  // 3. Tự động thêm gói tập chờ thanh toán vào giỏ hàng
  if (subId) {
    // Đợi một chút để store load data xong
    setTimeout(() => {
      const sub = pendingSubsForMember.value.find(s => s.id === subId)
      if (sub) {
        addPendingSubToCart(sub)
        showSnack(`Đã chọn gói tập của hội viên để thanh toán`, 'info')
      }
    }, 800)
  }
})
</script>

<style scoped>
.gap-2 { gap: 8px; }
.shadow-sm { box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important; }
.hover-card { cursor: pointer; transition: all 0.2s; }
.hover-card:hover { border-color: var(--v-primary-base) !important; background-color: rgba(var(--v-theme-primary), 0.05); transform: translateY(-2px); }
.sticky-cart { position: sticky; top: 20px; max-height: calc(100vh - 120px); }

@media print {
  .no-print, .v-navigation-drawer, .v-app-bar { display: none !important; }
  .v-main { padding: 0 !important; }
  #printable-invoice { box-shadow: none !important; border: none !important; }
}
</style>
