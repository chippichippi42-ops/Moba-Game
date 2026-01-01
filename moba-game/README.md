# MOBA Arena - 3v3 Battle

## 🎮 Giới Thiệu

MOBA Arena là một web game MOBA 3v3 được viết hoàn toàn bằng HTML5, CSS và JavaScript thuần. Game có thể chơi trực tiếp trên trình duyệt mà không cần cài đặt.

## 🚀 Cách Chạy Game

### Phương pháp 1: Mở trực tiếp file HTML
1. Giải nén thư mục game
2. Mở file `index.html` bằng trình duyệt (Chrome, Firefox, Edge)
3. Bắt đầu chơi!

### Phương pháp 2: Sử dụng Local Server (khuyến nghị)
```bash
# Sử dụng Python
python -m http.server 8000

# Hoặc Node.js
npx serve .

# Sau đó mở trình duyệt và truy cập
http://localhost:8000
```

## 🎯 Cách Chơi

### Điều Khiển (PC)
- **W/A/S/D**: Di chuyển (W: lên, S: xuống, A: trái, D: phải)
- **Q**: Chiêu 1
- **E**: Chiêu 2  
- **R**: Chiêu 3
- **T**: Chiêu Ultimate
- **F**: Bổ trợ (Hồi máu/Tốc biến/Tốc hành)
- **Space**: Đánh thường
- **P**: Mở/đóng bảng thống kê chi tiết
- **Y**: Bật/tắt khóa camera
- **ESC**: Tạm dừng game
- **Ctrl + Q/E/R/T**: Nâng cấp kỹ năng
- **Chuột phải**: Tấn công mục tiêu

### Điều Khiển (Mobile)
- **Joystick ảo bên trái**: Di chuyển
- **Các nút kỹ năng bên phải**: Sử dụng kỹ năng

### Mục Tiêu
- Phá hủy **Trụ Chính** của đối phương để giành chiến thắng
- Tiêu diệt kẻ địch, ăn lính và quái rừng để lên cấp
- Hạ các trụ công trình trước khi tấn công trụ chính

## 🦸 Tướng

| Tướng | Vai Trò | Mô Tả |
|-------|---------|-------|
| **Vanheo** 🏹 | Xạ Thủ | Tầm xa, sát thương vật lý cao |
| **Zephy** ⚔️ | Đấu Sĩ | Cận chiến, combo mạnh |
| **LaLo** 🔮 | Pháp Sư | Sát thương phép thuật bùng nổ |
| **Nemo** 🛡️ | Trợ Thủ | Tank, bảo vệ đồng đội |
| **Balametany** 🗡️ | Sát Thủ | Cơ động cao, tiêu diệt mục tiêu nhanh |

## 🎲 Bổ Trợ

- **❤️ Hồi Máu**: Hồi 12% máu tối đa (45s hồi chiêu)
- **⚡ Tốc Biến**: Dịch chuyển một đoạn (60s hồi chiêu)
- **💨 Tốc Hành**: Tăng tốc chạy lên 800 trong 10s (40s hồi chiêu)

## 🤖 Độ Khó AI

| Độ Khó | Mô Tả |
|--------|-------|
| **Dễ** | Cho người mới chơi |
| **Thường** | Cho người chơi bình thường |
| **Khó** | Cho người chơi giỏi |
| **Cực Khó** | Cho người chơi rất giỏi |
| **Ác Mộng** | Gần như không thể đánh bại |

## 🗺️ Bản Đồ

- **3 Đường (Lanes)**: Top, Mid, Bot
- **Rừng**: Khu vực giữa các đường, có quái rừng
- **Sông**: Chạy chéo qua bản đồ
- **Tế Đàn**: Khu vực spawn và hồi máu của mỗi đội
- **Bụi Cỏ**: Ẩn nấp khỏi tầm nhìn địch

## 🏛️ Công Trình

### Trụ Công Trình (mỗi đường có 3 trụ)
- **Trụ Ngoài**: 6000 HP, 500 sát thương
- **Trụ Trong**: 7500 HP, 650 sát thương  
- **Trụ Ức Chế**: 9000 HP, 800 sát thương

### Trụ Chính
- **10000 HP**, 1200 sát thương
- Phá hủy để giành chiến thắng!

### Tế Đàn
- **6000 sát thương** cho kẻ xâm nhập
- Hồi máu và mana cho tướng trong vùng

## ⚔️ Hệ Thống Chiến Đấu

### Chỉ Số
- **Máu (HP)**: Sinh mệnh
- **Mana**: Năng lượng dùng kỹ năng
- **Sát Thương Vật Lý (AD)**
- **Sức Mạnh Phép Thuật (AP)**
- **Giáp**: Giảm sát thương vật lý
- **Kháng Phép**: Giảm sát thương phép
- **Tốc Đánh** (tối đa 200%)
- **Giảm Hồi Chiêu** (tối đa 40%)
- **Tỷ Lệ Chí Mạng**
- **Tốc Chạy** (tối đa 800)

### Last-hit
- Đánh hạ lính/quái cuối cùng nhận thêm 25% kinh nghiệm

### Hồi Sinh
- Thời gian hồi sinh bắt đầu từ 5 giây
- Tăng dần theo thời gian trận đấu

## 📁 Cấu Trúc Project

```
moba-game/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── config.js       # Cấu hình game
│   ├── utils.js        # Hàm tiện ích
│   ├── map.js          # Hệ thống bản đồ
│   ├── camera.js       # Camera & viewport
│   ├── projectile.js   # Đạn & hiệu ứng
│   ├── tower.js        # Trụ & công trình
│   ├── minion.js       # Lính
│   ├── creature.js     # Quái rừng
│   ├── hero.js         # Tướng
│   ├── combat.js       # Hệ thống chiến đấu
│   ├── ai.js           # AI System
│   ├── minimap.js      # Minimap
│   ├── input.js        # Điều khiển
│   ├── ui.js           # Giao diện người dùng
│   ├── screens.js      # Màn hình game
│   ├── game.js         # Game controller
│   └── heroes/
│       ├── vanheo.js
│       ├── zephy.js
│       ├── lalo.js
│       ├── nemo.js
│       └── balametany.js
└── README.md
```

## 🛠️ Tùy Chỉnh

### Thay đổi chỉ số
Chỉnh sửa file `js/config.js` để thay đổi:
- Chỉ số tướng, lính, quái, trụ
- Thời gian spawn
- Độ khó AI
- Kích thước bản đồ

### Thêm tướng mới
1. Tạo file mới trong `js/heroes/`
2. Copy cấu trúc từ tướng có sẵn
3. Thay đổi chỉ số và kỹ năng
4. Thêm script vào `index.html`

## ⚡ Tối Ưu Hiệu Năng

- Sử dụng Object Pool cho projectiles
- Spatial hashing cho collision detection
- Canvas caching cho minimap
- Debounce/throttle cho input events
- Culling entities ngoài viewport

## 🌐 Hỗ Trợ Trình Duyệt

- ✅ Chrome (khuyến nghị)
- ✅ Firefox
- ✅ Edge
- ✅ Safari
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## 📝 Ghi Chú

- Game chạy tốt nhất ở 60 FPS
- Hỗ trợ màn hình HiDPI/Retina
- Responsive design cho mobile
- Không cần server, chạy hoàn toàn client-side

## 🎨 Credits

- Developed with ❤️ using vanilla JavaScript
- No external libraries required

---

**Enjoy the game! 🎮**