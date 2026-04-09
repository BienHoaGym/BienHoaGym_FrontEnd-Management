# 🏋️ Hệ Thống Quản Lý Gym - BienHoaGym Management

Tài liệu này mô tả chi tiết mô hình dữ liệu, các logic nghiệp vụ quan trọng và các công thức tính toán được sử dụng trong module Management (Backend & Frontend).

---

## 1. Mô Hình Trạng Thái (State Machine)

### A. Trạng Thái Gói Tập (Subscription Status)
- **Pending**: Gói tập vừa được tạo, đang chờ thanh toán.
- **Active**: Gói tập đã thanh toán thành công và đang trong thời hạn sử dụng.
- **Suspended**: Gói tập đang được tạm dừng (bảo lưu).
- **Expired**: Gói tập đã quá ngày kết thúc (`EndDate < Today`).
- **Cancelled**: Gói tập bị hủy (do người dùng yêu cầu hoặc quá thời hạn thanh toán 30 phút).

### B. Trạng Thái Hội Viên (Member Status)
- **Active**: Có ít nhất một gói tập đang ở trạng thái `Active`.
- **Inactive**: Không có gói tập nào hoặc tất cả gói tập đã `Expired`/`Cancelled`.
- **Suspended**: Gói tập duy nhất hoặc quan trọng nhất đang bị tạm dừng.
- **Prospective**: Khách hàng tiềm năng, mới chỉ có thông tin, chưa mua gói.

---

## 2. Logic Gia Hạn & Bảo Lưu (Core Flow)

### A. Logic Gia Hạn (Renewal)
- **Điều kiện**: Chỉ cho phép gia hạn khi gói cũ còn hạn **≤ 1 ngày**.
- **Tính toán ngày bắt đầu**: 
  - Nếu gói cũ còn hạn: `StartDate (Mới) = EndDate (Cũ) + 1 ngày`.
  - Nếu gói cũ đã hết hạn: `StartDate (Mới) = Today`.
- **Ngày kết thúc**: `EndDate = StartDate + DurationDays (của gói tập)`.

### B. Logic Tạm Dừng & Kích Hoạt Lại (Pause/Resume)
Đây là logic phức tạp nhất nhằm đảm bảo quyền lợi thời gian cho hội viên:

1. **Trường hợp tạm dừng có thời hạn (`EstimatedDays`):**
   - `EndDate (Mới) = EndDate (Cũ) + EstimatedDays`.
   - `LastPausedAt = Now`.
   - `AutoPauseExtensionDays = EstimatedDays`.

2. **Trường hợp kích hoạt lại (Resume):**
   - Tính số ngày nghỉ thực tế: `ActualDays = Ceiling(Now - LastPausedAt)`.
   - Điều chỉnh ngày hết hạn:
     - Nếu là nghỉ tự do: `EndDate (Final) = EndDate (Cũ) + ActualDays`.
     - Nếu là nghỉ có thời hạn: `Adjustment = ActualDays - AutoPauseExtensionDays`. 
       => `EndDate (Final) = EndDate (Current) + Adjustment`.

---

## 3. Công Thức Tài Chính (Financial Formulas)

### A. Doanh Thu (Revenue)
$$Revenue = \sum(Payments_{Completed}) + \sum(Invoices_{Completed} - Discounts)$$
*Trong đó:*
- `Payments`: Các khoản thu từ bán gói tập.
- `Invoices`: Các khoản thu từ bán sản phẩm (POS) hoặc dịch vụ lẻ.

### B. Chi Phí Vận Hành (Operating Cost)
Hệ thống tự động tính toán 3 loại chi phí chính:
1. **Chi phí vật tư**: $\sum(Quantity \times CostPrice)$ của các giao dịch xuất dùng nội bộ, hỏng hóc hoặc hao hụt kho.
2. **Chi phí bảo trì**: $\sum(MaintenanceCost)$ của các thiết bị đã hoàn thành bảo trì.
3. **Chi phí khấu hao**: Tự động trích theo tháng dựa trên thiết lập của từng thiết bị.

### C. Lợi Nhuận (Profit Estimate)
$$Profit \approx Revenue - (MaterialCost + MaintenanceCost + DepreciationCost)$$

---

## 4. Quản Lý Tài Sản & Khấu Hao (Asset Management)

- **Giá trị còn lại (Remaining Value)**:
  $$Value_{Current} = PurchasePrice - AccumulatedDepreciation$$
- **Logic Khấu hao**: 
  Hệ thống tính toán khấu hao hàng tháng dựa trên thời gian sử dụng hữu ích. Khi thiết bị đạt giá trị 0 hoặc bị thanh lý, việc trích khấu hao sẽ dừng lại.

---

## 5. Các Quy Tắc Ràng Buộc (Business Constraints)

- **Snapshot Giá**: Khi mua gói tập, tên gói và giá tiền tại thời điểm đó được copy vào bản ghi `Subscription`. Điều này giúp báo cáo tài chính không bị thay đổi nếu sau này người quản lý đổi giá gói tập trong danh mục.
- **Quyền Lễ Tân (Receptionist)**: Chỉ được phép giảm giá tối đa **10%** trên giá trị gói tập. Muốn giảm nhiều hơn phải được Manager thực hiện hoặc cấp quyền.
- **Hủy Giao Dịch Treo**: Hệ thống tự động chuyển trạng thái `Pending` -> `Cancelled` sau **30 phút** nếu không nhận được Signal thanh toán thành công.

---

## 6. Luồng Kiểm Soát Ra Vào (Check-in Flow)

1. **Nhận diện**: Thông qua Quét mã Thành viên hoặc FaceID (Vector Encoded).
2. **Kiểm tra điều kiện**:
   - Thành viên có gạch xóa (`IsDeleted`) không? => Chặn.
   - Có gói tập `Active` không? => Chặn nếu không có.
   - Gói tập còn buổi tập không (`RemainingSessions`)? => Chặn nếu `= 0` (đối với gói tính buổi).
3. **Ghi nhận**: Tạo bản ghi `CheckIn`, trừ 1 buổi tập (nếu gói tính buổi) và cập nhật thời gian hoạt động cuối (`LastVisit`).

---

## 7. Hướng dẫn Kiểm thử (Testing Guide)

Hệ thống sử dụng mô hình kiểm thử phân tầng để đảm bảo tính ổn định của các logic quản lý phức tạp.

### A. Công nghệ sử dụng
- **Framework**: xUnit
- **Mocking**: Moq (để giả lập Repository và UnitOfWork)
- **Database**: Entity Framework Core InMemory Database (để test logic thao tác dữ liệu mà không cần DB thật)

### B. Các thành phần đã được kiểm thử
- **BillingServiceTests**:
    - Tính toán độ chính xác của doanh thu sản phẩm.
    - Kiểm tra logic tạo hóa đơn và chi tiết hóa đơn.
    - Xác thực việc trừ tồn kho khi bán hàng.
- **MemberTests**:
    - Kiểm tra tính hợp lệ của thông tin hội viên khi đăng ký.
    - Xác thực mã hội viên (MemberCode) được tạo đúng định dạng.
- **ValidatorTests**:
    - Kiểm tra các ràng buộc dữ liệu đầu vào cho Subscription, Member và Product.

### C. Cách chạy kiểm thử
Mở Terminal tại thư mục gốc của Backend và chạy lệnh:
```bash
dotnet test
```

### D. Định hướng kiểm thử tiếp theo
Cần tập trung viết thêm các Case test cho `SubscriptionService` để bao phủ các kịch bản:
- Bảo lưu gói tập vào các ngày cuối tháng.
- Xử lý tranh chấp khi hội viên vừa hết hạn vừa yêu cầu bảo lưu.
- Tính toán ngày kết thúc khi có nhiều lần bảo lưu liên tiếp.

