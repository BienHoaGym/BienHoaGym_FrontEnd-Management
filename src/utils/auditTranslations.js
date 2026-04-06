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
  'StockTransaction': 'Giao dịch kho',
  'Class': 'Lớp học & Lịch tập',
  'Trainer': 'Huấn luyện viên',
  'Payment': 'Thanh toán',
  'CheckIn': 'Điểm danh Check-in'
}

export const fieldMap = {
  // General
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
  'Email': 'Hộp thư',
  'IsActive': 'Trạng thái hoạt động',
  'UserName': 'Tên đăng nhập',
  
  // Classes
  'ClassName': 'Tên lớp học',
  'MaxCapacity': 'Sức chứa tối đa',
  'ScheduleDay': 'Thứ trong tuần',
  'StartTime': 'Giờ bắt đầu',
  'EndTime': 'Giờ kết thúc',
  'TrainerId': 'Huấn luyện viên phụ trách',
  'CurrentEnrollment': 'Sĩ số hiện tại',

  // Trainers
  'Specialization': 'Chuyên môn',
  'ExperienceYears': 'Số năm kinh nghiệm',
  'TrainerCode': 'Mã PT',
  'CommissionRate': 'Tỉ lệ hoa hồng',

  // Members
  'MemberCode': 'Mã Hội viên',
  'MemberType': 'Loại khách hàng',
  'EmergencyContact': 'Liên hệ khẩn cấp',
  'FaceEncoding': 'Dữ liệu khuôn mặt'
}

export const permissionMap = {
  '*': 'Toàn quyền', 
  'member.read': 'Xem HV', 
  'member.create': 'Tạo HV', 
  'inventory.manage': 'QL Kho'
}

export const translateAction = (action) => {
  if (!action) return 'Hành động'
  if (action.includes('Added')) return 'Thêm'
  if (action.includes('Modified')) return 'Sửa'
  if (action.includes('Deleted')) return 'Xóa'
  return action
}

export const translateEntity = (entity) => entityMap[entity] || entity

export const translateField = (field) => fieldMap[field] || field

export const getSeverityText = (severity) => {
  if (severity === 2) return 'Mức độ: Nghiêm trọng'
  if (severity === 1) return 'Mức độ: Quan trọng'
  return 'Mức độ: Bình thường'
}
