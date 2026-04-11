<template>
  <div>
    <!-- Header Stats Overview -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="xl" elevation="1" class="border pa-4 bg-grey-lighten-5">
           <div class="d-flex align-center mb-2">
             <v-icon size="24" color="primary" class="mr-2">mdi-barcode-scan</v-icon>
             <span class="text-overline font-weight-bold">Tổng số SKU</span>
           </div>
           <div class="text-h4 font-weight-black">{{ inventoryStore.inventories.length }}</div>
           <div class="text-caption text-grey">Mã hàng hóa đang quản lý</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="xl" elevation="1" class="border pa-4 bg-error-lighten-5">
           <div class="d-flex align-center mb-2">
             <v-icon size="24" color="error" class="mr-2">mdi-alert-octagon</v-icon>
             <span class="text-overline font-weight-bold">HẾT HÀNG</span>
           </div>
           <div class="text-h4 font-weight-black text-error">{{ outOfStockCount }}</div>
           <div class="text-caption text-error-darken-1">Cần nhập kho khẩn cấp</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="xl" elevation="1" class="border pa-4 bg-warning-lighten-5">
           <div class="d-flex align-center mb-2">
             <v-icon size="24" color="warning" class="mr-2">mdi-alert-decagram</v-icon>
             <span class="text-overline font-weight-bold">SẮP HẾT HÀNG</span>
           </div>
           <div class="text-h4 font-weight-black text-warning">{{ lowStockCount }}</div>
           <div class="text-caption text-warning-darken-1">Dưới ngưỡng tồn an toàn</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="xl" elevation="1" class="border pa-4 bg-info-lighten-5">
           <div class="d-flex align-center mb-2">
             <v-icon size="24" color="info" class="mr-2">mdi-office-building-cog</v-icon>
             <span class="text-overline font-weight-bold">Tài sản & Thiết bị</span>
           </div>
           <div class="text-h4 font-weight-black text-info">{{ equipmentStore.equipments.length }}</div>
           <div class="text-caption text-info-darken-1">Tài sản cố định đang khai thác</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Main Content Area -->
    <v-card class="rounded-xl border shadow-sm">
      <v-toolbar flat color="white" class="rounded-t-xl border-b">
        <v-toolbar-title class="text-h6 font-weight-bold">
          <v-icon start color="primary">mdi-warehouse</v-icon> QUẢN LÝ KHO (TỔNG QUYẾT)
        </v-toolbar-title>
        <v-spacer />
        <div class="d-flex align-center gap-2 px-2">
          <v-btn color="primary" variant="flat" prepend-icon="mdi-import" @click="openTransactionDialog(1)" class="rounded-lg">
             Nhập kho
           </v-btn>
          <v-btn color="error" variant="flat" prepend-icon="mdi-export" @click="openTransactionDialog(7)" class="rounded-lg ml-2">
            Xuất tiêu hao
          </v-btn>
           <v-menu offset-y>
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-dots-vertical" v-bind="props"></v-btn>
            </template>
            <v-list density="compact">
              <!-- Removed for single-warehouse setup -->
              <!-- <v-list-item @click="openTransactionDialog(4)">
                <template #prepend><v-icon>mdi-swap-horizontal</v-icon></template>
                <v-list-item-title>Điều chuyển kho</v-list-item-title>
              </v-list-item> -->
            </v-list>
          </v-menu>
        </div>
      </v-toolbar>

      <v-tabs v-model="currentTab" bg-color="grey-lighten-4" slider-color="primary">
        <v-tab value="overview">
          <v-icon start>mdi-view-dashboard-outline</v-icon> Tổng quan
        </v-tab>
        <v-tab value="alerts">
          <v-icon start>mdi-alert-circle-outline</v-icon> Cảnh báo
          <v-badge v-if="stockAlerts.length > 0" :content="stockAlerts.length" color="error" inline class="ml-2"/>
        </v-tab>
        <v-tab value="history">
          <v-icon start>mdi-history</v-icon> Lịch sử biến động
        </v-tab>
        <v-tab value="audit">
          <v-icon start>mdi-file-check-outline</v-icon> Kiểm kê
        </v-tab>
        <v-tab value="reports">
          <v-icon start>mdi-chart-box-outline</v-icon> Báo cáo chuyên sâu
        </v-tab>
      </v-tabs>

      <v-window v-model="currentTab">
        <!-- Overview Tab -->
        <v-window-item value="overview">
          <v-card-text class="pa-0">
            <v-row class="pa-4 align-center bg-grey-lighten-5">
              <!-- Warehouse filter removed for simplification -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="search"
                  prepend-inner-icon="mdi-magnify"
                  label="Tìm kiếm sản phẩm, SKU..."
                  variant="outlined"
                  bg-color="white"
                  density="compact"
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-checkbox
                  v-model="includeAssets"
                  label="Bao gồm Thiết bị & Tài sản"
                  hide-details
                  density="compact"
                  color="primary"
                  @update:model-value="filterByWarehouse"
                ></v-checkbox>
              </v-col>
            </v-row>
            <v-data-table
              :headers="headers"
              :items="inventoryStore.inventories"
              :search="search"
              :loading="inventoryStore.loading"
              density="comfortable"
              hover
            >
              <template #[`item.productName`]="{ item }">
                <div class="d-flex align-center py-2">
                  <v-avatar size="38" :color="item.productName.includes('[TÀI SẢN]') ? 'info' : 'primary'" variant="tonal" class="mr-3">
                     <v-icon size="20">{{ item.productName.includes('[TÀI SẢN]') ? 'mdi-office-building-cog' : 'mdi-package-variant' }}</v-icon>
                  </v-avatar>
                  <div>
                    <div class="font-weight-bold" style="line-height: 1.2">
                      {{ item.productName.replace('[TÀI SẢN]', '').trim() }}
                    </div>
                    <div class="text-caption text-grey d-flex align-center mt-1">
                      <span class="mr-2">SKU: {{ item.productSKU || '---' }}</span>
                      <v-chip v-if="item.productName.includes('[TÀI SẢN]')" size="x-small" color="info" variant="flat">TÀI SẢN</v-chip>
                    </div>
                  </div>
                </div>
              </template>
              
              <!-- Warehouse name column removed -->

              <template #[`item.quantity`]="{ item }">
                <v-chip :color="getStockColor(item.quantity, item.minStockThreshold)" size="small" variant="flat" class="px-3 font-weight-black">
                  {{ item.quantity }}
                </v-chip>
              </template>

              <template #[`item.minStockThreshold`]="{ item }">
                 <v-chip size="x-small" variant="tonal" :color="item.quantity <= item.minStockThreshold ? 'error' : 'grey'">
                    Min: {{ item.minStockThreshold }}
                 </v-chip>
              </template>

              <template #[`item.costPrice`]="{ item }">
                 <span class="text-caption">{{ formatCurrency(item.costPrice) }}</span>
              </template>

              <template #[`item.price`]="{ item }">
                 <span class="text-caption font-weight-bold">{{ formatCurrency(item.price) }}</span>
              </template>

              <template #[`item.profit`]="{ item }">
                 <v-tooltip location="top" text="Lợi nhuận gộp trên mỗi đơn vị">
                   <template v-slot:activator="{ props }">
                      <span v-bind="props" class="text-caption text-success font-weight-bold">
                         +{{ formatCurrency(item.price - item.costPrice) }}
                      </span>
                   </template>
                 </v-tooltip>
              </template>

              <template #[`item.actions`]="{ item }">
                 <div class="d-flex justify-end gap-1">
                   <v-btn icon="mdi-export" variant="tonal" size="x-small" color="error" title="Xuất nhanh" @click="openTransactionDialog(2, item)"></v-btn>

                   <v-btn icon="mdi-history" variant="text" size="x-small" color="primary" title="Lịch sử" @click="viewHistory(item)"></v-btn>
                 </div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-window-item>

        <!-- Alerts Tab -->
        <v-window-item value="alerts">
          <v-card-text>
            <v-list lines="two">
              <v-list-subheader class="font-weight-bold">Các sản phẩm cần chú ý</v-list-subheader>
               <v-list-item
                  v-for="a in stockAlerts"
                  :key="a.productId"
                  class="border-b"
               >
                <template #prepend>
                   <v-avatar size="38" :color="a.productName.includes('[TÀI SẢN]') ? 'info' : (a.quantity <= 0 ? 'error' : 'warning')" variant="tonal" class="mr-3">
                      <v-icon size="20">{{ a.productName.includes('[TÀI SẢN]') ? 'mdi-office-building-cog' : 'mdi-package-variant' }}</v-icon>
                   </v-avatar>
                </template>
                <v-list-item-title class="font-weight-bold">{{ a.productName }}</v-list-item-title>
                <v-list-item-subtitle class="d-flex flex-wrap">
                  <span class="mr-4">Kho: <b>{{ a.warehouseName }}</b></span>
                  <span class="mr-4">Tồn: <b :class="a.quantity === 0 ? 'text-error' : 'text-warning'">{{ a.quantity }}</b></span>
                  <span>Ngưỡng: <b>{{ a.minStockThreshold }}</b></span>
                </v-list-item-subtitle>
                 <template #append>
                   <v-btn color="success" size="small" class="rounded-lg" @click="openTransactionDialog(1, a)">Nhập kho</v-btn>
                 </template>
              </v-list-item>
              <v-list-item v-if="!stockAlerts.length" class="text-center py-8 text-grey">
                <v-icon size="48" class="mb-2">mdi-check-circle-outline</v-icon>
                <div class="text-h6">Kho hàng ổn định</div>
                <p>Không có cảnh báo nào.</p>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-window-item>

        <!-- History Tab -->
        <v-window-item value="history">
          <v-card-text class="pa-0" style="max-height: 65vh; overflow-y: auto;">
             <div class="pa-4 bg-grey-lighten-5 border-b d-flex align-center">
                <p class="text-subtitle-1 font-weight-bold">Nhật ký biến động gần đây</p>
                <v-spacer/>
                <v-btn icon="mdi-refresh" variant="text" density="compact" @click="inventoryStore.fetchTransactions(null, DEFAULT_WAREHOUSE_ID)"></v-btn>
             </div>
             <v-list lines="three" class="pa-0">
              <v-list-item v-for="(t, idx) in inventoryStore.transactions" :key="t.id" :class="idx % 2 === 0 ? 'bg-grey-lighten-5' : ''" class="pa-3 border-b">
                <template v-slot:prepend>
                  <div class="d-flex flex-column align-center mr-3" style="width: 50px">
                    <v-icon :color="getTxColor(t.type)" size="24" class="mb-0">
                      {{ getTxIcon(t.type) }}
                    </v-icon>
                    <div class="text-caption font-weight-black mt-n1" :class="`text-${getTxColor(t.type)}`">
                      {{ getTxSymbol(t.type) }}{{ t.quantity }}
                    </div>
                  </div>
                </template>
                <div class="d-flex flex-column">
                  <v-list-item-title class="font-weight-black text-body-2 mb-0">
                    {{ t.productName.replace('[TÀI SẢN]', '').trim() }}
                  </v-list-item-title>
                  <div class="text-caption d-flex align-center flex-wrap">
                    <span class="text-grey font-weight-medium mr-1">{{ t.beforeQuantity }} →</span>
                    <span class="text-primary font-weight-bold mr-2">{{ t.afterQuantity }}</span>
                    <v-icon size="10" class="mr-1">mdi-account-circle-outline</v-icon>
                    <span class="text-grey-darken-1 mr-2">{{ t.performedBy || 'System' }}</span>
                  </div>
                  <div class="text-caption text-grey-darken-1 d-flex align-center">
                    {{ formatDateTime(t.date) }} • {{ getTxTypeName(t.type) }}
                  </div>
                  <div v-if="t.note" class="bg-white px-2 py-1 border rounded text-grey italic mt-1" style="font-size: 0.65rem">
                    {{ t.note }}
                  </div>
                </div>
              </v-list-item>
              <v-list-item v-if="!inventoryStore.transactions.length" class="text-center py-12 text-grey">
                <v-icon size="48" color="grey-lighten-2" class="mb-2">mdi-tray-blank</v-icon>
                <div class="text-caption">Chưa có lịch sử giao dịch</div>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-window-item>

        <!-- Audit Tab -->
        <v-window-item value="audit">
          <v-card-text>
            <div class="d-flex align-center mb-4">
               <div class="text-subtitle-1 font-weight-bold">Danh sách phiếu kiểm kê</div>
               <v-spacer/>
               <v-btn color="primary" prepend-icon="mdi-plus" @click="startAudit">Tạo phiếu mới</v-btn>
            </div>
            <v-data-table :items="audits" :headers="auditHeaders" hover density="comfortable">
               <template #[`item.status`]="{ item }">
                  <v-chip :color="getAuditStatusColor(item.status)" size="small" variant="flat">
                     {{ getAuditStatusName(item.status) }}
                  </v-chip>
               </template>
               <template #[`item.auditDate`]="{ item }">
                  {{ formatDateTime(item.auditDate) }}
               </template>
               <template #[`item.actions`]="{ item }">
                  <v-btn v-if="item.status === 1" icon="mdi-pencil" variant="text" size="small" color="primary" @click="editAudit(item)"></v-btn>
                  <v-btn v-else icon="mdi-eye" variant="text" size="small" color="grey" @click="viewAudit(item)"></v-btn>
               </template>
            </v-data-table>
          </v-card-text>
        </v-window-item>

        <!-- Reports Tab -->
        <v-window-item value="reports">
          <v-card-text>
            <v-row class="mb-4">
               <v-col cols="12" md="4">
                  <v-card variant="flat" border class="pa-4 bg-green-lighten-5">
                     <div class="text-overline">Giá trị kho hiện tại</div>
                     <div class="text-h5 font-weight-black text-success">{{ formatCurrency(totalStockValue) }}</div>
                  </v-card>
               </v-col>
               <v-col cols="12" md="4">
                  <v-card variant="flat" border class="pa-4 bg-red-lighten-5">
                     <div class="text-overline">Hàng tồn động (>90 ngày)</div>
                     <div class="text-h5 font-weight-black text-error">{{ deadStockCount }} mã hàng</div>
                  </v-card>
               </v-col>
            </v-row>
            <v-data-table :items="turnoverRepo" :headers="turnoverHeaders" hover density="compact">
               <template #[`item.isDeadStock`]="{ item }">
                  <v-chip v-if="item.isDeadStock" size="x-small" color="error" variant="flat">TỒN ĐỘNG</v-chip>
                  <v-chip v-else size="x-small" color="success" variant="tonal">LUÂN CHUYỂN</v-chip>
               </template>
               <template #[`item.stockValue`]="{ item }">
                  {{ formatCurrency(item.stockValue) }}
               </template>
               <template #[`item.lastTransactionDate`]="{ item }">
                  {{ formatDateTime(item.lastTransactionDate) }}
               </template>
            </v-data-table>
          </v-card-text>
        </v-window-item>
      </v-window>
    </v-card>

    <!-- Transaction Dialog -->
    <v-dialog v-model="txDialog" max-width="800">
      <v-card class="rounded-xl">
        <v-card-title class="pa-6 font-weight-bold" :class="getTxBg(txType)">
          {{ getTxTitle(txType) }}
        </v-card-title>
        <v-card-text class="pa-6">
          <v-form ref="txFormRef">
            <v-btn-toggle v-if="txType === 1" v-model="transaction.isAsset" mandatory color="primary" class="mb-6 w-100" density="compact">
               <v-btn :value="false" class="flex-grow-1">Hàng hóa/Vật tư</v-btn>
               <v-btn :value="true" class="flex-grow-1">Máy móc/Thiết bị</v-btn>
            </v-btn-toggle>

            <v-autocomplete
              v-model="transaction.productId"
              :label="transaction.isAsset ? 'Thiết bị *' : 'Sản phẩm *'"
              :items="transaction.isAsset ? assetOptions : productOptions"
              item-title="label"
              item-value="id"
              variant="outlined"
              :rules="[v => !!v || 'Bắt buộc']"
            ></v-autocomplete>

            <v-autocomplete
              v-if="txType === 1"
              v-model="transaction.providerId"
              label="Nhà cung cấp (Đối tác)"
              :items="providerOptions"
              item-title="label"
              item-value="id"
              variant="outlined"
              prepend-inner-icon="mdi-domain"
              placeholder="Chọn nhà cung cấp nếu có"
              clearable
              class="mb-2"
            ></v-autocomplete>

            <!-- Warehouse selection hidden for single-warehouse, will be set in logic -->

            <v-row v-if="txType === 1">
              <v-col cols="12" sm="6">
                <!-- Unit display -->
                <v-text-field
                  :model-value="selectedProductInfo?.unit || 'Cái'"
                  label="Đơn vị tính"
                  variant="outlined"
                  density="comfortable"
                  readonly
                  prepend-inner-icon="mdi-package-variant"
                  bg-color="grey-lighten-4"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" v-if="!transaction.isAsset">
                <!-- Expiry Date -->
                <v-text-field
                  v-model="transaction.expiryDate"
                  label="Hạn sử dụng"
                  type="date"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-calendar-clock"
                ></v-text-field>
              </v-col>
              
              <!-- Equipment specific fields -->
              <template v-if="transaction.isAsset">
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="transaction.serialNumber"
                    label="Số Seri (S/N)"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-barcode-scan"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="transaction.warrantyExpiryDate"
                    label="Hết hạn bảo hành"
                    type="date"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-shield-check"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="transaction.maintenanceIntervalDays"
                    label="Chu kỳ bảo trì (Ngày)"
                    type="number"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-wrench-clock"
                    suffix="ngày"
                  ></v-text-field>
                </v-col>
              </template>
            </v-row>

            <v-divider class="my-4" />

            <v-row>
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model.number="transaction.quantity"
                  label="Số lượng *"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  :rules="[v => !!v || 'Bắt buộc', v => v > 0 || 'Số lượng > 0']"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="5">
                <v-text-field
                  v-model.number="transaction.unitPrice"
                  label="Đơn giá nhập *"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  suffix="đ"
                  prepend-inner-icon="mdi-cash"
                  color="success"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="3">
                <v-text-field
                  v-model.number="transaction.vatPercentage"
                  label="VAT (%)"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  suffix="%"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row v-if="txType === 1" class="ma-0 mb-4 bg-grey-lighten-4 rounded-lg pa-3 border-dashed">
              <v-col cols="12" class="pa-1 d-flex justify-space-between align-center">
                <span class="text-subtitle-2 grey--text">Tổng thanh toán (có VAT):</span>
                <span class="text-h6 font-weight-bold text-primary">{{ formatCurrency(txTotalValue) }}</span>
              </v-col>
              <v-col cols="12" class="pa-1 text-caption text-grey text-right">
                Thuế VAT: {{ formatCurrency(txVatAmount) }}
              </v-col>
            </v-row>

            <v-row>
               <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="transaction.transactionDate"
                    label="Ngày nhập thực tế"
                    type="date"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-calendar-edit"
                  ></v-text-field>
               </v-col>
               <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="transaction.referenceNumber"
                    label="Số hóa đơn/Chứng từ"
                    variant="outlined"
                    density="comfortable"
                    placeholder="e.g. PN-001"
                  ></v-text-field>
               </v-col>
            </v-row>

            <v-textarea v-model="transaction.note" label="Ghi chú nghiệp vụ" variant="outlined" rows="2" density="comfortable"></v-textarea>
            
            <div v-if="txType === 1" class="d-flex align-center gap-2 mb-4">
              <input
                type="file"
                ref="fileInputRef"
                accept="image/*"
                style="display: none"
                @change="handleFileChange"
              />
              <v-btn 
                prepend-icon="mdi-camera" 
                variant="tonal" 
                color="info" 
                size="small" 
                class="text-none"
                @click="triggerFileInput"
              >
                 {{ transaction.attachmentUrl ? 'Đã chọn ảnh' : 'Chụp chứng từ' }}
              </v-btn>
              <span class="text-caption text-grey">
                {{ transaction.attachmentUrl ? 'File: ' + transaction.attachmentUrl : 'Đính kèm ảnh hóa đơn để đối soát' }}
              </span>
            </div>

            <v-divider class="my-4" />
            <div class="text-subtitle-1 font-weight-bold mb-3 text-primary d-flex align-center">
              <v-icon start color="primary">mdi-credit-card-outline</v-icon>
              THÔNG TIN THANH TOÁN & CÔNG NỢ
            </div>
            
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="transaction.paidAmount"
                  label="Số tiền thanh toán ngay *"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  suffix="đ"
                  prepend-inner-icon="mdi-cash-check"
                  color="success"
                  :rules="[v => v >= 0 || 'Không được âm']"
                  @update:model-value="validatePaidAmount"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="transaction.paymentMethod"
                  label="Hình thức thanh toán"
                  :items="['Tiền mặt', 'Chuyển khoản', 'Ví điện tử', 'Khác']"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-swap-horizontal"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="12" v-if="txTotalValue > transaction.paidAmount">
                <v-text-field
                  v-model="transaction.paymentDueDate"
                  label="Hạn thanh toán phần còn lại (Công nợ)"
                  type="date"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-calendar-alert"
                  color="warning"
                  persistent-hint
                  :hint="`Số tiền ghi nợ: ${formatCurrency(txTotalValue - transaction.paidAmount)}`"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="txDialog = false">Hủy</v-btn>
          <v-btn :color="getTxColor(txType)" variant="flat" @click="handleTransaction">
            Xác nhận
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snack.show" :color="snack.color">
      {{ snack.message }}
    </v-snackbar>

    <!-- Audit Detail Entry Dialog -->
    <v-dialog v-model="auditDetailDialog" max-width="900" persistent>
      <v-card class="rounded-xl">
        <v-card-title class="pa-6 font-weight-bold bg-primary text-white d-flex align-center">
          <v-icon start>mdi-file-edit</v-icon> CHI TIẾT KIỂM KÊ
          <v-spacer/>
          <v-chip v-if="selectedAudit" color="white" variant="outlined">{{ selectedAudit?.warehouse?.name }}</v-chip>
        </v-card-title>
        <v-card-text class="pa-0">
           <v-data-table :items="selectedAudit?.details || []" :headers="auditDetailHeaders" density="compact" height="400">
              <template #[`item.productName`]="{ item }">
                 {{ item.product?.name }}
              </template>
              <template #[`item.actualQuantity`]="{ item }">
                 <v-text-field v-model.number="item.actualQuantity" density="compact" hide-details variant="underlined" type="number"
                   @change="saveAuditDetail(item)"></v-text-field>
              </template>
              <template #[`item.difference`]="{ item }">
                 <span :class="item.actualQuantity - item.systemQuantity < 0 ? 'text-error' : 'text-success'">
                    {{ item.actualQuantity - item.systemQuantity }}
                 </span>
              </template>
              <template #[`item.reason`]="{ item }">
                 <v-text-field v-model="item.reason" density="compact" hide-details variant="underlined" placeholder="Lý do chênh lệch"
                   @change="saveAuditDetail(item)"></v-text-field>
              </template>
           </v-data-table>
        </v-card-text>
        <v-card-actions class="pa-6 border-t bg-grey-lighten-5">
          <v-btn variant="text" @click="auditDetailDialog = false">Hủy</v-btn>
          <v-spacer />
          <v-btn v-if="selectedAudit?.status === 1" color="success" variant="flat" prepend-icon="mdi-check-all" @click="confirmApproveAudit">Hoàn tất & Chốt kho</v-btn>
          <v-btn v-else color="grey" variant="flat" disabled>Phiếu đã duyệt</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { useBillingStore } from '@/stores/billing'
import { useAuthStore } from '@/stores/auth'
import { useEquipmentStore } from '@/stores/equipment'
import providerService from '@/services/providerService'

const inventoryStore = useInventoryStore()
const billingStore = useBillingStore()
const authStore = useAuthStore()
const equipmentStore = useEquipmentStore()

const currentTab = ref('overview')
const search = ref('')
const selectedWarehouseId = ref(null) // This will effectively be ignored or set to DEFAULT_WAREHOUSE_ID
const includeAssets = ref(false)
const txDialog = ref(false)
const txFormRef = ref(null)
const fileInputRef = ref(null)
const txType = ref(1) // 1: Import, 2: Export, 3: Adjustment, 4: Transfer, 7: InternalUse
const snack = ref({ show: false, message: '', color: 'success' })
const providers = ref([])
const transaction = ref({ 
  productId: null, 
  quantity: 1, 
  unitPrice: 0, 
  vatPercentage: 10, 
  note: '', 
  referenceNumber: '', 
  fromWarehouseId: null, 
  toWarehouseId: null, 
  isAsset: false, 
  providerId: null,
  expiryDate: null,
  transactionDate: new Date().toISOString().substr(0, 10),
  serialNumber: '',
  warrantyExpiryDate: null,
  maintenanceIntervalDays: 90,
  attachmentUrl: '',
  paidAmount: 0,
  paymentMethod: 'Tiền mặt',
  paymentDueDate: null
})
const stockAlerts = ref([])
const audits = ref([])
const selectedAudit = ref(null)
const auditDetailDialog = ref(false)
const turnoverRepo = ref([])
const auditHeaders = [
  { title: 'Ngày kiểm kê', key: 'auditDate' },
  { title: 'Kho', key: 'warehouse.name' },
  { title: 'Người thực hiện', key: 'performedBy' },
  { title: 'Trạng thái', key: 'status', align: 'center' },
  { title: 'Thao tác', key: 'actions', align: 'end' }
]
const auditDetailHeaders = [
  { title: 'Sản phẩm', key: 'productName' },
  { title: 'Hệ thống', key: 'systemQuantity', align: 'center' },
  { title: 'Thực tế', key: 'actualQuantity', align: 'center' },
  { title: 'Chênh lệch', key: 'difference', align: 'center' },
  { title: 'Lý do & Ghi chú', key: 'reason' }
]
const turnoverHeaders = [
  { title: 'Sản phẩm', key: 'name' },
  { title: 'SKU', key: 'sku' },
  { title: 'Tồn hiện tại', key: 'currentStock', align: 'center' },
  { title: 'Giá trị tồn', key: 'stockValue', align: 'end' },
  { title: 'Lần cuối giao dịch', key: 'lastTransactionDate' },
  { title: 'Phân loại', key: 'isDeadStock', align: 'center' }
]
const totalStockValue = computed(() => turnoverRepo.value.reduce((acc, curr) => acc + curr.stockValue, 0))
const deadStockCount = computed(() => turnoverRepo.value.filter(x => x.isDeadStock).length)

const outOfStockCount = computed(() => stockAlerts.value.filter(a => a.quantity === 0).length)
const lowStockCount = computed(() => stockAlerts.value.filter(a => a.quantity > 0).length)

const txTotalValue = computed(() => {
  const base = transaction.value.quantity * transaction.value.unitPrice
  return base + (base * (transaction.value.vatPercentage / 100))
})
const txVatAmount = computed(() => {
  return (transaction.value.quantity * transaction.value.unitPrice) * (transaction.value.vatPercentage / 100)
})

const DEFAULT_WAREHOUSE_ID = '10000000-0000-0000-0000-000000000001'

const warehouseOptions = computed(() => {
  const options = [{ id: null, label: 'Tất cả kho' }]
  inventoryStore.warehouses.forEach(w => options.push({ id: w.id, label: w.name }))
  return options
})

const warehouseDropdownOptions = computed(() => {
  let list = inventoryStore.warehouses
  if (authStore.isReceptionist) {
    list = list.filter(w => w.name.includes("Quầy") || w.name.includes("Counter"))
  }
  return list.map(w => ({ id: w.id, label: w.name }))
})

const headers = [
  { title: 'Sản phẩm', key: 'productName', width: '25%' },
  { title: 'SKU', key: 'productSKU' },
  { title: 'Tồn kho', key: 'quantity', align: 'center' },
  { title: 'Ngưỡng báo động', key: 'minStockThreshold', align: 'center' },
  { title: 'Giá nhập/vốn', key: 'costPrice', align: 'end' },
  { title: 'Giá trị tồn', key: 'totalValue', align: 'end' },
  { title: 'Lần cuối', key: 'lastUpdated', width: '150px' },
  { title: 'Thao tác', key: 'actions', sortable: false, align: 'end' }
]

const productOptions = computed(() => 
  billingStore.products.filter(p => p.trackInventory).map(p => ({ id: p.id, label: `${p.name} (SKU: ${p.sku || 'N/A'})` }))
)

const assetOptions = computed(() => 
  equipmentStore.equipments.map(e => ({ id: e.id, label: e.name }))
)
const providerOptions = computed(() => {
  const pId = selectedProductInfo.value?.providerId || selectedProductInfo.value?.ProviderId
  if (pId) {
    return providers.value.filter(p => p.id === pId).map(p => ({ id: p.id, label: p.name }))
  }
  return providers.value.map(p => ({ id: p.id, label: p.name }))
})

const selectedProductInfo = computed(() => {
  if (transaction.value.isAsset) {
    return equipmentStore.equipments.find(e => e.id === transaction.value.productId)
  }
  return billingStore.products.find(p => p.id === transaction.value.productId)
})

// Auto-fill price when product changes
watch(() => transaction.value.productId, (newId) => {
  if (newId && selectedProductInfo.value) {
    // Assets use 'purchasePrice', consumables use 'costPrice'
    const defaultPrice = transaction.value.isAsset 
      ? (selectedProductInfo.value.purchasePrice || 0)
      : (selectedProductInfo.value.costPrice || selectedProductInfo.value.CostPrice || 0)
    
    transaction.value.unitPrice = defaultPrice
    
    // Auto-select provider if linked to product
    const pId = selectedProductInfo.value.providerId || selectedProductInfo.value.ProviderId
    if (pId) {
      transaction.value.providerId = pId
    } else {
      transaction.value.providerId = null
    }
  }
})

// Reset when switching between goods and assets
watch(() => transaction.value.isAsset, () => {
  transaction.value.productId = null
  transaction.value.unitPrice = 0
})

const filterByWarehouse = () => {
  inventoryStore.fetchInventories(selectedWarehouseId.value, includeAssets.value)
  inventoryStore.fetchTransactions(null, selectedWarehouseId.value)
}

const loadAlerts = async () => {
  const res = await inventoryStore.fetchAlerts()
  if (res.success) stockAlerts.value = res.data
}

const openTransactionDialog = (type, item = null) => {
  txType.value = type
  const isAsset = item?.productName.includes('[TÀI SẢN]') || false
  
  let productId = item?.productId || null;
  // For assets, the ID might be directly on the item
  if (isAsset && item && !item.productId) {
    productId = item.id
  }
  
  transaction.value = { 
    productId: productId, 
    quantity: 1, 
    unitPrice: item?.costPrice || 0, 
    note: '', 
    referenceNumber: '', 
    fromWarehouseId: item?.warehouseId || null, 
    toWarehouseId: null,
    isAsset: isAsset,
    providerId: item?.providerId || null,
    vatPercentage: 10,
    transactionDate: new Date().toISOString().substr(0, 10),
    expiryDate: null,
    serialNumber: '',
    warrantyExpiryDate: null,
    maintenanceIntervalDays: 90
  }

  // Auto-select the correct product/asset dropdown
  if(txType.value === 1) { // Import
      transaction.value.isAsset = isAsset;
  }
  
  txDialog.value = true
}


const handleTransaction = async () => {
  const { valid } = await txFormRef.value.validate()
  if (!valid) return

  const payload = { 
    ...transaction.value, 
    type: txType.value,
    fromWarehouseId: DEFAULT_WAREHOUSE_ID,
    toWarehouseId: DEFAULT_WAREHOUSE_ID
  }
  let res;
  
  if (txType.value === 1) res = await inventoryStore.importStock(payload)
  else if (txType.value === 2) res = await inventoryStore.exportStock(payload)
  else if (txType.value === 4) res = await inventoryStore.transferStock(payload)
  else if (txType.value === 7) res = await inventoryStore.internalUseStock(payload)
  else if (txType.value === 3) res = { success: false, message: 'Thao tác không khả dụng' }

  if (res.success) {
    showSnack(res.message)
    txDialog.value = false
    inventoryStore.fetchInventories(selectedWarehouseId.value, includeAssets.value)
    inventoryStore.fetchTransactions(null, selectedWarehouseId.value)
    loadAlerts()
  } else {
    showSnack(res.message, 'error')
  }
}

const viewHistory = (item) => {
  inventoryStore.fetchTransactions(item.productId, item.warehouseId)
  currentTab.value = 'history'
}

// 🕵️ Audit Methods
const startAudit = async () => {
  const res = await inventoryStore.createStockAudit(DEFAULT_WAREHOUSE_ID, "Kiểm kê định kỳ");
  if (res.success) {
    selectedAudit.value = res.data;
    auditDetailDialog.value = true;
    loadAudits();
  }
}
const loadAudits = async () => {
  const res = await inventoryStore.fetchAudits();
  if (res.success) audits.value = res.data;
}
const editAudit = (item) => {
  selectedAudit.value = item;
  auditDetailDialog.value = true;
}
const viewAudit = (item) => {
  selectedAudit.value = item;
  auditDetailDialog.value = true;
}
const saveAuditDetail = async (detail) => {
  await inventoryStore.updateAuditDetail(selectedAudit.value.id, detail.productId, detail.actualQuantity, detail.reason);
}
const confirmApproveAudit = async () => {
  if (confirm("Xác nhận hoàn tất kiểm kê? Số lượng tồn kho sẽ được cập nhật theo thực tế.")) {
    const res = await inventoryStore.approveStockAudit(selectedAudit.value.id);
    if (res.success) {
       showSnack("Đã chốt kho thành công");
       auditDetailDialog.value = false;
       loadAudits();
    }
  }
}
const loadTurnover = async () => {
  const res = await inventoryStore.fetchTurnoverReport();
  if (res.success) turnoverRepo.value = res.data;
}
const getAuditStatusName = (s) => ({ 1: 'Nháp', 2: 'Chờ duyệt', 3: 'Đã duyệt', 4: 'Đã hủy' }[s] || '---')
const getAuditStatusColor = (s) => ({ 1: 'grey', 2: 'warning', 3: 'success', 4: 'error' }[s] || 'grey')

watch(currentTab, (val) => {
  if (val === 'audit') loadAudits();
  if (val === 'reports') loadTurnover();
})

// Helpers
const showSnack = (msg, color = 'success') => snack.value = { show: true, message: msg, color }
const formatCurrency = (v) => v ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v) : '---'
const formatDateTime = (d) => d ? new Date(d).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : ''

const getStockColor = (quantity, minThreshold) => {
  if (quantity <= 0) return 'error'
  if (quantity <= minThreshold) return 'warning'
  return 'success'
}


const getTxColor = (t) => ({ 1: 'success', 2: 'error', 3: 'warning', 4: 'info', 7: 'deep-purple' }[t] || 'primary')
const getTxIcon = (t) => ({ 
  1: 'mdi-arrow-down-bold-circle', 
  2: 'mdi-arrow-up-bold-circle', 
  3: 'mdi-autorenew', 
  4: 'mdi-swap-horizontal-bold',
  7: 'mdi-hand-heart'
}[t] || 'mdi-circle')

const getTxSymbol = (t) => ({ 1: '+', 2: '-', 7: '-' }[t] || '')

const getTxBg = (t) => {
  const colors = { 1: 'bg-success', 2: 'bg-error', 3: 'bg-warning', 4: 'bg-info', 7: 'bg-deep-purple' }
  return `${colors[t] || 'bg-primary'} text-white`
}

const getTxTitle = (t) => ({ 
  1: 'NHẬP KHO', 
  2: 'XUẤT BÁN', 
  3: 'ĐIỀU CHỈNH KHO', 
  4: 'ĐIỀU CHUYỂN NỘI BỘ',
  7: 'XUẤT DÙNG NỘI BỘ'
}[t] || 'Giao dịch Kho')

const getTxLabel = (t) => ({
  1: 'Nhập kho',
  2: 'Xuất kho',
  3: 'Điều chỉnh',
  4: 'Điều chuyển',
  7: 'Sử dụng nội bộ'
}[t] || 'Khác')

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    // In a real app, you would upload this to a server
    // For now, we'll just mock the URL with the filename
    transaction.value.attachmentUrl = file.name
    snack.value = { show: true, message: `Đã chọn file: ${file.name}`, color: 'success' }
  }
}

const validatePaidAmount = (val) => {
  if (val > txTotalValue.value) {
    transaction.value.paidAmount = txTotalValue.value
  }
}

const getTxTypeName = (t) => ({ 
  1: 'Nhập kho', 
  2: 'Xuất kho', 
  3: 'Điều chỉnh', 
  4: 'Điều chuyển',
  7: 'Xuất dùng',
  8: 'Trả hàng'
}[t] || 'Khác')

onMounted(async () => {
  const pRes = await providerService.getAll()
  if (pRes.success) providers.value = pRes.data || []
  
  await Promise.all([
    billingStore.fetchProducts(),
    inventoryStore.fetchWarehouses(),
    equipmentStore.fetchEquipments()
  ])
  inventoryStore.fetchInventories(null, includeAssets.value)
  inventoryStore.fetchTransactions()
  loadAlerts()
})
</script>

<style scoped>
.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.italic { font-style: italic; }

/* Custom Scrollbar for specific areas if needed */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}
</style>
