# VietNamAddressAPI

API đơn giản để truy vấn dữ liệu hành chính Việt Nam (tỉnh/thành phố, quận/huyện, phường/xã) từ nguồn dữ liệu chính thức của Tổng cục Thống kê. 
Sử dụng google apps script để triển khai api này.

## 🔗 Demo

Bạn có thể thử nghiệm API tại đây:  
[https://doanngocthanh.github.io/VietNamAddressAPI/](https://doanngocthanh.github.io/VietNamAddressAPI/)
[https://script.google.com/macros/s/AKfycbwbuPEFL2TzdMPnJY-zPb1i8DZtTSwv7_Rl3ZNPBNlqYPGgNY9Myk6vvTOsVk2J5VXuoA/exec](https://script.google.com/macros/s/AKfycbwbuPEFL2TzdMPnJY-zPb1i8DZtTSwv7_Rl3ZNPBNlqYPGgNY9Myk6vvTOsVk2J5VXuoA/exec)

## 📖 Tính năng

- ✅ Lấy danh sách tỉnh/thành phố
- ✅ Lấy danh sách quận/huyện theo tỉnh/thành phố
- ✅ Lấy danh sách phường/xã theo quận/huyện
- ✅ Lấy toàn bộ dữ liệu hành chính
- ✅ Hỗ trợ lọc theo mã đơn vị hành chính
- ✅ Dữ liệu được cập nhật từ nguồn chính thức
- ✅ API miễn phí và không giới hạn số lượt gọi

## 🚀 Sử dụng API

### 1. Lấy danh sách tỉnh/thành phố

```
GET ?path=provinces
GET ?path=provinces&matinh=01
```

Parameters:
- `date`: Tùy chọn. Định dạng DD/MM/YYYY
- `matinh`: Tùy chọn. Lọc theo mã tỉnh

### 2. Lấy danh sách quận/huyện

```
GET ?path=districts&matinh=01&tentinh=Hà Nội
```

Parameters:
- `date`: Tùy chọn. Định dạng DD/MM/YYYY
- `matinh`: Bắt buộc. Mã tỉnh
- `tentinh`: Bắt buộc. Tên tỉnh

### 3. Lấy danh sách phường/xã

```
GET ?path=wards&matinh=01&tentinh=Hà Nội&mahuyen=001&tenhuyen=Quận Ba Đình
```

Parameters:
- `date`: Tùy chọn. Định dạng DD/MM/YYYY
- `matinh`: Bắt buộc. Mã tỉnh
- `tentinh`: Bắt buộc. Tên tỉnh
- `mahuyen`: Bắt buộc. Mã huyện
- `tenhuyen`: Bắt buộc. Tên huyện

### 4. Lấy toàn bộ dữ liệu

```
GET ?path=all
```

Parameters:
- `date`: Tùy chọn. Định dạng DD/MM/YYYY

## 📝 Response Format

Tất cả response đều trả về định dạng JSON với cấu trúc:

```json
{
  "success": true,
  "data": [...],
  "count": 63,
  "timestamp": "2025-07-14T10:00:00.000Z",
  "statusCode": 200
}
```

## ⚠️ Lưu ý

1. Tất cả các tham số text phải được URL encode
2. Nếu không cung cấp tham số date, hệ thống sẽ sử dụng ngày hiện tại
3. API sử dụng nguồn dữ liệu từ Tổng cục Thống kê (GSO)
4. Các mã đơn vị hành chính tuân theo chuẩn của GSO

## 📜 License

[MIT](LICENSE)