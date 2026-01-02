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
| **Dễ** | Cho người mới chơi - AI cơ bản với di chuyển đơn giản và ít sử dụng kỹ năng |
| **Thường** | Cho người chơi bình thường - AI có khả năng né đạn cơ bản và sử dụng combo đơn giản |
| **Khó** | Cho người chơi giỏi - AI bắt đầu sử dụng LLM cơ bản và né kỹ năng CC, có pathfinding thông minh |
| **Cực Khó** | Cho người chơi rất giỏi - AI với LLM nâng cao, dự đoán đối thủ, combo phức tạp và targeting thông minh |
| **Ác Mộng** | Gần như không thể đánh bại - AI hoàn hảo với LLM tiên tiến, né tất cả kỹ năng, combo hoàn hảo và nhận thức toàn cầu |

> **Lưu ý:** Độ khó "Cực Khó" (Very Hard) đã được thêm vào hệ thống, với AI có khả năng dự đoán đối thủ và sử dụng LLM chất lượng cao.

### Cài Đặt Độ Khó AI - Chi Tiết

Game có 4 mức độ khó với các tham số tùy chỉnh:

| Tham Số | Dễ | Thường | Khó | Ác Mộng |
|---------|-----|--------|------|----------|
| **Ngưỡng HP trốn chạy** | 20% | 30% | 35% | 40% |
| **Tần suất dùng CC** | 30% | 60% | 75% | 90% |
| **Ngưỡng HP nổ sát thương** | 20% | 40% | 50% | 60% |
| **Ngưỡng HP hồi máu** | 50% | 60% | 65% | 70% |
| **Độ trễ quyết định** | 500ms | 300ms | 150ms | 50ms |
| **Hồi chiêu tái dùng** | 3000ms | 2000ms | 1000ms | 500ms |
| **Tỷ lệ trúng chiêu** | 45% | 57% | 72% | 98% |
| **Có LLM?** | ❌ | ❌ | ✅ Cơ bản | ✅ Tiên tiến |
| **Dự đoán địch** | ❌ | ❌ | ✅ | ✅ Nâng cao |

### AI Ability Analyzer & Skill Patterns

Hệ thống mới phân tích kỹ năng của tướng và đưa ra quyết định thông minh:

#### 6 Mẫu Hành Vi Kỹ Năng (Skill Usage Patterns):

1. **ESCAPE** (Trốn chạy)
   - Kích hoạt khi HP thấp và đang bị truy đuổi
   - Sử dụng kỹ năng Escape/Dash phù hợp nhất
   - Ngưỡng HP thay đổi theo độ khó

2. **CC** (Crowd Control)
   - Dùng khi địch gần hoặc đang chạy trốn
   - Tần suất dùng dựa trên độ khó (30% - 90%)
   - Tự động chọn kỹ năng CC tốt nhất

3. **BURST** (Nổ sát thương)
   - Kích hoạt khi mục tiêu HP thấp
   - Tự động tìm combo burst tối ưu
   - Ngưỡng HP địch: 20% - 60% tùy độ khó

4. **SUSTAIN** (Hồi máu/Khiên chắn)
   - Dùng khi HP thấp trong giao tranh
   - Tự động tìm kỹ năng hồi máu/khiên
   - Tần suất dùng tăng theo độ khó

5. **POSITIONING** (Định vị)
   - Chỉ hoạt động ở mức Khó trở lên
   - Sử dụng kỹ năng cơ động để di chuyển tốt hơn
   - Hoạt động trong teamfight (3+ địch, 2+ đồng đội)

6. **ENGAGE** (Tiếp cận)
   - Dùng kỹ năng dash/tiếp cận khi mục tiêu trong tầm
   - Tất cả độ khó đều sử dụng
   - Tự động chọn kỹ năng Engage tốt nhất

#### Phân Loại Kỹ Năng (Ability Categorization):

Hệ thống tự động phân loại kỹ năng của tướng:
- **CC**: Khống chế (stun, slow, root)
- **Engage**: Tiếp cận (dash, gap closer)
- **Escape**: Trốn chạy (flash, dash out)
- **Burst**: Sát thương cao trong thời gian ngắn
- **Sustain**: Hồi máu/khiên chắn (heal, shield)
- **Mobility**: Tăng cơ động (movement speed, dashes)

### Hệ Thống AI Mới

Game hiện tại đã được nâng cấp với **Hệ Thống AI Khổng Lồ** bao gồm:

- **19 Classes Chuyên Biệt**: Core, Intelligence, Behaviors, Tactical, Utils
- **Config Mở Rộng Khổng Lồ**: Hơn 50 tham số có thể tuning cho mỗi độ khó
- **Progressive LLM/Prediction**: Từ cơ bản (Hard) đến hoàn hảo (Nightmare)
- **Advanced Features**:
  - **A* Pathfinding**: Tìm đường thông minh, tránh tường và chướng ngại vật
  - **Dodge System**: Né đạn, né kỹ năng CC, và tránh chướng ngại vật
  - **Combo System**: Thực thi combo thông minh với tính toán sát thương
  - **Smart Targeting**: Chọn mục tiêu đa tiêu chí (HP, threat, distance, combo synergy)
  - **Vision System**: Nhận thức bản đồ và dự đoán vị trí đối thủ
  - **Movement Optimization**: Di chuyển mượt mà với waypoints và tránh lặp lại

### Giải Quyết Vấn Đề AI Cũ

**Vấn đề đã giải quyết:**
- ✅ **Di chuyển lặp lại**: Sử dụng waypoint-based movement + A* pathfinding
- ✅ **Không biết né trụ**: DodgeSystem với obstacle detection và avoidance
- ✅ **Không biết né chiêu**: DodgeSystem với CC ability detection và prediction
- ✅ **Không biết combo**: ComboExecutor với ability sequencing và damage calculation
- ✅ **Targeting ngu**: TargetSelector với multi-criteria decision making

### Cấu Trúc AI Mới

```
js/ai/
├── AIManager.js                    # Quản lý tất cả AI
├── utils/
│   ├── AIAbilityAnalyzer.js        # NEW: Phân tích kỹ năng
│   ├── PerformanceMonitor.js      # Theo dõi FPS
│   ├── SpatialGrid.js            # Tối ưu collision detection
│   └── VisionSystem.js          # Vision & awareness
├── core/
│   ├── AIController.js           # Core orchestrator
│   ├── AIState.js               # State machine
│   └── DecisionMaker.js         # Decision logic
├── intelligence/
│   ├── StrategicAnalyzer.js       # Phân tích chiến lược
│   ├── CombatAnalyzer.js        # Phân tích chiến đấu (with skill patterns)
│   ├── MovementOptimizer.js      # Tối ưu di chuyển + A*
│   └── LLMDecisionEngine.js     # LLM integration
├── behaviors/
│   ├── LaneBehavior.js          # Laning
│   ├── CombatBehavior.js        # Fighting
│   ├── RetreatBehavior.js       # Escaping
│   ├── PushBehavior.js         # Objective push
│   ├── DodgeBehavior.js        # Kiting & positioning
│   └── JungleBehavior.js       # Jungle clear
└── tactical/
    ├── DodgeSystem.js           # Dodge obstacles/abilities/projectiles
    ├── ComboExecutor.js        # Smart combo execution
    ├── TargetSelector.js       # Multi-criteria targeting
    └── PathFinding.js         # A* + dynamic pathfinding
```

## ⚖️ Game Scaling

### Minion & Creature Progression

Lính và quái rừng sẽ tự động tăng sức mạnh theo thời gian trận đấu:

| Loại Tăng Tốc | Lính | Quái Rừng |
|---------------|------|-----------|
| **Máu** | +5% mỗi phút | +4% mỗi phút |
| **Sát Thương** | +6% mỗi phút | +5% mỗi phút |
| **Cập Nhật** | Mỗi 60 giây | Mỗi 60 giây |

**Ví dụ:**
- Sau 5 phút: Lính có ~28% máu và ~34% sát thương cao hơn
- Sau 10 phút: Lính có ~57% máu và ~77% sát thương cao hơn
- Quái rừng tăng chậm hơn để cân bằng với hero

### Tower Spacing

Khoảng cách giữa các trụ đã được tăng 17.5% để tạo không gian chiến thuật tốt hơn:

| Trụ | Cũ | Mới |
|------|-----|------|
| **Trụ Ngoài** | 1500 | 1760 |
| **Trụ Trong** | 2800 | 3290 |
| **Trụ Ức Chế** | 4200 | 4940 |

- Cả hai đội đều được tăng khoảng cách
- Tạo thêm không gian cho giao tranh
- Tăng tính chiến thuật khi đẩy đường

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
│   ├── config.js       # Cấu hình game (bao gồm AI config khổng lồ)
│   ├── utils.js        # Hàm tiện ích
│   ├── map.js          # Hệ thống bản đồ
│   ├── camera.js       # Camera & viewport
│   ├── projectile.js   # Đạn & hiệu ứng
│   ├── tower.js        # Trụ & công trình
│   ├── minion.js       # Lính (with scaling)
│   ├── creature.js     # Quái rừng (with scaling)
│   ├── hero.js         # Tướng
│   ├── combat.js       # Hệ thống chiến đấu
│   ├── ai.js           # AI System (Legacy Proxy)
│   ├── ai/             # Hệ thống AI mới
│   │   ├── AIManager.js
│   │   ├── core/
│   │   ├── intelligence/
│   │   ├── behaviors/
│   │   ├── tactical/
│   │   └── utils/
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
- Độ khó AI (với hơn 50 tham số cho mỗi độ khó)
- Kích thước bản đồ
- Tất cả tham số AI mới:
  - `aiDifficulty`: Cài đặt cho từng độ khó
  - `aiDifficultyMods`: Cài đặt cho kỹ năng (HP threshold, frequency, etc)
  - `gameScaling`: Cài đặt scaling cho lính và quái
  - `aiMovement`: Di chuyển và pathfinding
  - `aiDodge`: Hệ thống né tránh
  - `aiCombo`: Thực thi combo
  - `aiTargeting`: Chọn mục tiêu
  - `aiVision`: Nhận thức bản đồ
  - `aiFarming`: Hệ thống farm
  - `aiRoaming`: Di chuyển xoay vòng
  - `aiParameters`: Tham số scaling

### Tùy chỉnh AI
Hệ thống AI mới cho phép tùy chỉnh sâu:

```javascript
// Ví dụ: Tăng khả năng né đạn cho AI "Khó"
CONFIG.aiDifficulty.hard.dodgeProjectile = 0.6;
CONFIG.aiDifficulty.hard.dodgeAbilityCC = 0.6;

// Tăng tầm nhìn cho AI "Cực Khó"
CONFIG.aiVision.mapAwarenessRefreshRate = 300;
CONFIG.aiVision.lastSeenTimeout = 8000;

// Tùy chỉnh scaling lính
CONFIG.gameScaling.minion.healthPerMinute = 1.05;  // 5% mỗi phút
CONFIG.gameScaling.minion.damagePerMinute = 1.06;  // 6% mỗi phút

// Tùy chỉnh ngưỡng kỹ năng
CONFIG.aiDifficultyMods.hard.escapeHPThreshold = 0.35;  // Trốn khi 35% HP
CONFIG.aiDifficultyMods.nightmare.useCCFrequency = 0.90;  // Dùng CC 90% thời gian

// Đặt độ khó tùy chỉnh
CONFIG.aiDifficulty.custom = {
    decisionInterval: 1000,
    reactionTime: 200,
    accuracy: 0.85,
    // ... tất cả tham số khác
};
```

### Thêm tướng mới
1. Tạo file mới trong `js/heroes/`
2. Copy cấu trúc từ tướng có sẵn
3. Thay đổi chỉ số và kỹ năng
4. Thêm script vào `index.html`
5. Cấu hình AI hints cho tướng mới:

```javascript
// Trong file tướng
aiHints: {
    preferredLane: 'mid',
    combos: [
        {
            condition: 'all_in',
            sequence: ['q', 'auto', 'e', 'r', 'auto']
        },
        {
            condition: 'poke',
            sequence: ['q', 'auto']
        }
    ]
}
```

## ⚡ Tối Ưu Hiệu Năng

### Hiệu Năng AI
Hệ thống AI mới được tối ưu hóa để chạy mượt mà:

- **A* Pathfinding với Grid Caching**: Tối ưu hóa tìm đường với caching và chỉ cập nhật khi cần thiết
- **Spatial Partitioning**: Chia bản đồ thành lưới để tìm kiếm mục tiêu và chướng ngại vật nhanh chóng
- **Object Pooling**: Tái sử dụng đối tượng để giảm thiểu garbage collection
- **Lazy Evaluation**: Chỉ tính toán khi cần thiết (ví dụ: chỉ phân tích chiến lược mỗi 5 giây)
- **Priority-Based Updates**: Các hệ thống quan trọng được ưu tiên cập nhật

### Hiệu Năng Chung
- Sử dụng Object Pool cho projectiles
- Spatial hashing cho collision detection
- Canvas caching cho minimap
- Debounce/throttle cho input events
- Culling entities ngoài viewport
- Batch rendering cho các hiệu ứng
- Web Workers cho các tính toán nặng (tùy chọn)

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

## 📋 Recent Changes

### Version Update - Asset Structure & CORS Fix

#### 1. Fixed CORS Errors (Issue with file:// protocol)
- **Removed fetch() with HEAD method** that caused CORS errors when loading skill icons
- **Implemented direct image loading** with proper error handling
- Now works seamlessly with both `file://` and `http://` protocols

#### 2. Updated Asset Path Structure
All hero ability icons have been updated to follow the new structure:
- **Old:** `assets/icons/{heroName}_{ability}.png`
- **New:** `assets/heroes/{heroName}/{ability}.png`

**Updated paths for all heroes:**
- Vanheo: `assets/heroes/vanheo/q.png`, `assets/heroes/vanheo/e.png`, etc.
- Zephy: `assets/heroes/zephy/q.png`, `assets/heroes/zephy/e.png`, etc.
- Balametany: `assets/heroes/balametany/q.png`, `assets/heroes/balametany/e.png`, etc.
- Nemo: `assets/heroes/nemo/q.png`, `assets/heroes/nemo/e.png`, etc.
- LaLo: `assets/heroes/lalo/q.png`, `assets/heroes/lalo/e.png`, etc.

#### 3. Smart Icon Display System
- **Key indicator** (small Q/E/R/T badge in bottom-right corner) now:
  - **Shows** when icon loads successfully
  - **Hides** when icon asset is missing or fails to load
- **Text fallback** (large Q/E/R/T in center) displays when no icon is available
- Provides cleaner UI when assets are not present

#### 4. Very Hard AI Difficulty Available
- **"Cực Khó" (Very Hard)** difficulty is now fully functional
- Features advanced LLM integration (65% quality, 75% accuracy)
- Enhanced prediction capabilities with 2.0x range
- 98% farm efficiency and 95% last-hit accuracy
- Optimal targeting with 90% accuracy
- Excellent pathfinding and 0.8 second decision intervals

---

**Enjoy the game! 🎮**
