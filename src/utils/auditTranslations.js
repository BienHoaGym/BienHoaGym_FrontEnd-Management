// src/utils/auditTranslations.js

export const actionTypeMap = {
  Added: 'Thêm mới',
  Modified: 'Cập nhật',
  Deleted: 'Xóa bỏ'
}

export const severityTypeMap = {
  0: 'Bình thường',
  1: 'Quan trọng',
  2: 'Nghiêm trọng'
}

export const entityMap = {
  'MembershipPackage': 'Gói tập',
  'User': 'Tài khoản',
  'Member': 'Hội viên',
  'Product': 'Sản phẩm',
  'Role': 'Nhân viên/Quyền',
  'Subscription': 'Đăng ký',
  'Inventory': 'Kho hàng',
  'Equipment': 'Thiết bị',
  'StockTransaction': 'Giao dịch kho'
}

export const fieldMap = {
  'Name': 'Tên gọi', 
  'Price': 'Giá bán', 
  'Description': 'Mô tả', 
  'Permissions': 'Quyền hạn', 
  'Status': 'Trạng thái',
  'Role': 'Chức vụ', 
  'FullName': 'Họ tên', 
  'PhoneNumber': 'SĐT', 
  'StockQuantity': 'Số lượng', 
  'HasPT': 'Có PT',
  'JoinedDate': 'Ngày tham gia', 
  'ProviderId': 'ID nhà cung cấp', 
  'Address': 'Địa chỉ', 
  'Email': 'Hộp thư'
}

export const permissionMap = {
  '*': 'Toàn quyền', 
  'member.read': 'Xem HV', 
  'member.create': 'Tạo HV', 
  'inventory.manage': 'QL Kho'
}

export const translateAction = (action) => {
  if (action?.includes('Added')) return 'Thêm'
  if (action?.includes('Modified')) return 'Sửa'
  if (action?.includes('Deleted')) return 'Xóa'
  return action
}

export const translateEntity = (entity) => entityMap[entity] || entity

export const translateField = (field) => fieldMap[field] || field

export const getSeverityText = (severity) => {
  if (severity === 2) return 'Mức độ: Nghiêm trọng'
  if (severity === 1) return 'Mức độ: Quan trọng'
  return 'Mức độ: Bình thường'
}
