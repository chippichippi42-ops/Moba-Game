# 🎮 MOBA Arena - 3v3 Battle Arena

*Tham gia vào cuộc chiến 3v3 kịch tính, nơi chiến thuật và kỹ năng quyết định tất cả!*

---

## 🌟 Giới Thiệu

MOBA Arena là một web game chiến thuật 3v3 được xây dựng hoàn toàn bằng HTML5 và JavaScript thuần. Game mang đến trải nghiệm MOBA cổ điển nhưng tối giản, nơi bạn và đồng đội sẽ chiến đấu để tiêu diệt Trụ Chính của đối phương.

Bạn sẽ điều khiển một trong năm tướng độc đáo, mỗi tướng có lối chơi riêng biệt. Từ xạ thủ tầm xa sát thương cao đến sát thủ cơ động tinh nhanh, game đáp ứng mọi phong cách chơi - thích combat trực diện, khéo léo định vị, hay bảo vệ đồng đội từ sau tuyến đầu.

Không cần cài đặt phức tạp, không cần tải game - chỉ cần mở trình duyệt và chiến!

---

## 🎯 Cách Chơi Cơ Bản

### Mục Tiêu Chính
Phá hủy **Trụ Chính** (Nexus) của đội địch để giành chiến thắng. Đây là mục tiêu duy nhất quan trọng nhất - mọi thứ khác đều phục vụ cho việc này.

### Các Mục Tiêu Phụ
- **Quân lính (Minions)**: Xuất hiện theo định kỳ, di chuyển theo 3 đường. Giết lính để nhận gold và kinh nghiệm.
- **Sinh vật hoang dã (Jungle Creatures)**: Ẩn nấp trong rừng, cung cấp gold và buff khi bị tiêu diệt.
- **Tháp phòng thủ (Towers)**: Mỗi đường có 3 tháp với sức mạnh tăng dần. Phải phá hủy các tháp bên ngoài trước khi tiếp cận tháp trong và cuối cùng là Trụ Chính.

### Teamwork & Giao Tranh
Trong MOBA Arena, bạn không bao giờ chiến đấu một mình. Hai đồng đội AI sẽ hỗ trợ bạn:
- Laning: Một hoặc hai người đi mỗi đường (Top, Mid, Bot)
- Roaming: Di chuyển giữa các đường để hỗ trợ đồng đội đang gặp khó khăn
- Teamfight: Giao tranh 3v3 khi đội hình đủ người và timing thích hợp

### Vòng Lặp Chơi
1. **Lên cấp**: Giết lính/quái/hệ tướng địch để nhận XP. Cấp càng cao, càng mạnh.
2. **Kiếm gold**: Dùng gold để... (tính năng nâng cấp sẽ được thêm sau)
3. **Timing teamfight**: Khi team bạn mạnh hơn hoặc có lợi thế số lượng, hãy engage chiến tranh tổng.
4. **Push objectives**: Sau khi thắng giao tranh, đẩy lane và phá tháp địch.
5. **Lặp lại**: Đến khi nào Trụ Chính địch sụp đổ!

---

## 🎮 Controls & UI

### Keyboard Controls (PC)
| Phím | Chức năng |
|------|-----------|
| **W / A / S / D** | Di chuyển nhân vật (lên/trái/xuống/phải) |
| **Arrow Keys** | Di chuyển (thay thế cho WASD) |
| **Q** | Kỹ năng 1 |
| **E** | Kỹ năng 2 |
| **R** | Kỹ năng 3 |
| **T** | Ultimate (Kỹ năng mạnh nhất) |
| **F** | Bổ trợ (Hồi máu/Tốc biến/Tốc hành) |
| **Space** | Đánh thường (khi có mục tiêu trong range) |
| **P** | Mở/đóng bảng thống kê chi tiết |
| **Y** | Bật/tắt khóa camera theo nhân vật |
| **ESC** | Tạm dừng game / Mở menu pause |
| **Ctrl + Q/E/R/T** | Nâng cấp kỹ năng tương ứng |

### Mouse Controls
- **Click chuột trái**: Chọn mục tiêu hoặc di chuyển đến vị trí (nếu hỗ trợ)
- **Click chuột phải**: Tấn công mục tiêu trong range
- **Di chuột**: Di chuyển camera (khi camera không bị khóa)

### Mobile Controls
- **Joystick ảo bên trái**: Di chuyển nhân vật
- **Nút kỹ năng bên phải**: Sử dụng Q, E, R, T, F
- **Nút camera**: Điều chỉnh góc nhìn
- **Nút menu pause**: Tạm dừng game

### UI Elements
- **Health Bar (Thanh máu)**: Thanh màu xanh ở đầu nhân vật. Màu đỏ bên trên là máu địch.
- **Mana Bar (Thanh năng lượng)**: Thanh màu xanh dương dưới thanh máu. Dùng để cast kỹ năng.
- **Level**: Số hiển thị bên trái thanh máu. Cấp càng cao, càng mạnh.
- **Gold**: Hiển thị ở góc trên bên phải. Dùng để mua trang bị (tính năng sắp có).
- **Kill Score**: Tỷ số giết chóc đội bạn vs đội địch.
- **Team Status Panel**: Hiển thị trạng thái 2 đồng đội AI (HP, level, vị trí trên minimap).
- **Minimap**: Bản đồ nhỏ ở góc phải dưới. Chấm xanh = đội bạn, chấm đỏ = đội địch.
- **Skill Tray**: Thanh kỹ năng hiển thị Q, E, R, T với icon và cooldown.

---

## 🦸 Nhân Vật & Kỹ Năng

### 🏹 Vanheo - Xạ Thủ (Marksman)
*Xạ thủ tầm xa với khả năng gây sát thương vật lý khủng khiếp từ khoảng cách an toàn.*

Vanheo chơi ở lane phía sau, dùng tầm đánh xa để farm lính và harass địch. Điểm mạnh là damage cao và có khả năng reposition với kỹ năng lùi. Điểm yếu là ít máu và dễ bị focus trong teamfight.

- **Passive - Tầm Nhìn Diều Hâu**: Mỗi đòn đánh liên tiếp lên cùng mục tiêu tăng 5% sát thương (tối đa 25%).
- **Q - Mũi Tên Xuyên**: Bắn mũi tên xuyên qua tất cả mục tiêu trên đường đi. Tốt để farm và poke địch.
- **E - Mưa Tên**: Bắn loạt tên rơi xuống vùng chỉ định, gây damage và slow kẻ địch. Tốt để zone và kiểm soát vùng.
- **R - Lùi Bước**: Nhảy lùi và bắn một phát đạn. Kỹ năng escape tuyệt vời khi bị tấn công.
- **T - Tên Trời Phạt**: Ultimate bắn mũi tên xuyên toàn bản đồ, gây sát thương cực lớn. Tốt để finish hoặc snipe kẻ địch yếu máu.

---

### ⚔️ Zephy - Đấu Sĩ (Fighter)
*Đấu sĩ mạnh mẽ với khả năng lao vào trận chiến và gây sát thương lớn trong tầm gần.*

Zephy là tướng cân bằng - có đủ damage, durability và sustain. Thích hợp đi solo lane hoặc phối hợp với support. Cần canh thời điểm engage tốt để phát huy tối đa.

- **Passive - Cuồng Chiến**: Mỗi lần gây sát thương nhận điểm stack, tăng tốc đánh và hút máu (tối đa 20 điểm).
- **Q - Chém Xoáy**: Chém vòng xung quanh, damage tất cả địch trong radius. Tốt để clear wave và damage area.
- **E - Vết Xước**: Tấn công kẻ địch, gây bleed damage theo thời gian và giảm khả năng hồi máu.
- **R - Phá Trận**: Lao tới kẻ địch, gây damage và stun. Kỹ năng engage chính.
- **T - Cơn Thịnh Nộ**: Ultimate tăng tất cả chỉ số và nhận khiên. Tốt để tank damage trong teamfight.

---

### 🔮 LaLo - Pháp Sư (Mage)
*Pháp sư bùng nổ với khả năng gây sát thương phép thuật lớn từ xa và kiểm soát chiến trường.*

LaLo chơi ở lane giữa, dùng khả năng area damage và CC để kiểm soát trận đấu. Có burst damage cực cao nhưng rất yếu trong combat cận chiến. Cần positioning tốt.

- **Passive - Tích Tụ Ma Lực**: Mỗi kỹ năng trúng tướng địch tăng 8% sức mạnh phép thuật trong 5 giây (tối đa 24%).
- **Q - Cầu Lửa**: Bắn cầu lửa xuyên qua kẻ địch, gây damage và stun lần đầu tiên trúng.
- **E - Vòng Tròn Lửa**: Tạo vòng tròn lửa xung quanh, gây damage liên tục và slow kẻ địch bước vào.
- **R - Vụ Nổ Ngôi Sao**: Gây sát thương phép lên kẻ địch và lan tỏa xung quanh.
- **T - Thiên Thạch**: Ultimate triệu tập thiên thạch rơi xuống vùng chỉ định, gây sát thương cực lớn và knock up.

---

### 🛡️ Nemo - Trợ Thủ (Tank/Support)
*Trợ thủ bền bỉ với khả năng bảo vệ đồng đội và khống chế kẻ địch hiệu quả.*

Nemo là tanker với nhiều CC và khả năng bảo vệ team. Thích hợp đi cùng đồng đội để peel cho carries. Cần dẫn teamfight và timing CC tốt.

- **Passive - Ý Chí Thép**: Khi máu dưới 30%, nhận 30% giảm sát thương trong 5 giây.
- **Q - Khiên Đất**: Tạo khiên bảo vệ bản thân và đồng đội gần nhất.
- **E - Dây Xích**: Ném dây xích kéo kẻ địch gần lại (CC mạnh).
- **R - Đập Xuống**: Nhảy xuống đất, gây damage và stun kẻ địch xung quanh.
- **T - Bức Tường Đất**: Ultimate tạo bức tường ngăn cản địch và nhận khiên cho đồng đội đi qua.

---

### 🗡️ Balametany - Sát Thủ (Assassin)
*Sát thủ cực kỳ cơ động với khả năng xâm nhập và tiêu diệt mục tiêu ưu tiên trong nháy mắt.*

Balametany là assassin cao cấp, chuyên đi gank và tiêu diệt carries địch. Có mobility cực cao và burst damage khủng khiếp. Cần patience và positioning tốt.

- **Passive - Bóng Tối**: Tấn công từ phía sau gây thêm 15% sát thương. Kill reset hồi chiêu E.
- **Q - Đâm Thẳng**: Lao thẳng tới mục tiêu, gây damage và nhận shield.
- **E - Bóng Hơi**: Tạo bóng, có thể teleport lại vị trí bóng sau vài giây hoặc dùng ngay.
- **R - Dao Đâm**: Ném dao lên kẻ địch, gây damage và mark. Tấn công marked target để trigger thêm damage.
- **T - Tàn Sát**: Ultimate dash cực nhanh qua tất cả kẻ địch trên đường đi, gây sát thương cực lớn cho mỗi kẻ bị trúng.

---

### 💡 Cách Dùng Kỹ Năng Hiệu Quả

**Cooldown & Mana Management**
- Mỗi kỹ năng có **cooldown** (thời gian chờ) và tiêu tốn mana
- Cooldown giảm khi bạn lên level kỹ năng
- Không spam kỹ năng - mana có hạn và cần dùng đúng lúc

**Combo Basics**
- **Poke**: Q + auto (đánh thường) để harass địch
- **Trade**: E + Q + auto để trade damage
- **All-in**: E → R → Q → auto → T (nên có đủ mana và timing)
- **Escape**: R (hoặc skill escape khác) + F (tốc biến nếu có)

**Timing là tất cả**
- Dùng CC khi địch đang chạy trốn hoặc đang cast skill quan trọng
- Dùng burst khi địch yếu máu (<40%)
- Dùng escape khi đang bị focus hoặc quá sức địch
- Luôn canh minimap trước khi engage 1v2 hoặc 1v3

---

## ⚔️ Chiến Thuật Cơ Bản

### Kinh Tế Game (Gold & Leveling)
- **Gold**: Nguồn chính từ farm lính (last-hit tốt hơn), quái rừng, và kill. Gold dùng để mua items (tính năng sắp có).
- **Leveling**: Nhận XP từ giết bất cứ đơn vị nào. Cấp càng cao:
  - Tăng chỉ số cơ bản (HP, damage, defense)
  - Mở khóa và nâng cấp kỹ năng
  - Tăng damage và hiệu quả kỹ năng

- **Power Spike**: Mỗi tướng có thời điểm mạnh nhất (thường là cấp 6 có Ultimate, hoặc cấp 9-12 khi đã nâng đủ 3 skill chính)

### Positioning & Team Fight
- **Frontline (Tank/Fighter)**: Đi đầu, chịu damage, peel cho carries
- **Backline (Marksman/Mage)**: Đi sau, deal damage từ range, tránh bị focus
- **Flanking (Assassin)**: Đi vòng sau địch, tiêu diệt carries
- **Focus**: Tất cả cùng attack cùng một mục tiêu, đặc biệt là carries địch

- **Khi nào nên engage**:
  - Đội bạn full HP, địch đang farm tản mạn
  - Có advantage level hoặc số lượng
  - Đã hủy bỏ Ultimate hoặc skill quan trọng của địch

- **Khi nào nên retreat**:
  - Đội bạn yếu máu, địch full HP
  - Mất key member (tank hoặc carry)
  - Địch đang dồn về tháp hoặc spawn

### Farming (Làm Kinh Tế)
- **Last-hit**: Đánh cuối cùng vào lính/quái để nhận full gold. Miss last-hit = mất gold.
- **Wave management**:
  - **Freeze**: Giữ wave near tower của bạn để farm an toàn
  - **Slow push**: Push từ từ để địch phải farm under tower
  - **Hard push**: Push nhanh để tower và roam

- **Jungle clear**:
  - Quái rừng respawns sau 60 giây
  - Buff quái cung cấp advantage tạm thời
  - Clear jungle khi lane bị pushed hoặc khi cần gold

### Roaming (Di Chuyển Hỗ Trợ)
- Roam khi lane đã pushed hoặc địch recall
- Roam qua jungle để tránh bị detect
- Gank từ rừng để surprise địch
- Ward bush để check vision (tính feature sắp có)

### Bảo Vệ Tháp & Push Lane
- **Tower diving** (dive tháp) chỉ khi:
  - Địch yếu máu dưới 40%
  - Bạn có đủ damage để finish nhanh
  - Có đồng đội hỗ trợ

- **Defending tower**:
  - Đừng để địch hit tower tự do
  - Farm lính dưới tower (last-hit tower hit)
  - Roam từ other lanes khi tower bị attack

- **Pushing**:
  - Push với wave lính lớn
  - Roam sau khi pushed lane
  - Tham gia teamfight khi pushed lane là advantage

---

## ⚙️ Cài Đặt & Tùy Chỉnh

### Chọn Độ Khó AI
Game có 5 độ khó AI để bạn chọn tùy theo trình độ:

| Độ Khó | Mô Tả | Dành Cho |
|--------|-------|----------|
| **Dễ (Easy)** | AI cơ bản, ít dùng kỹ năng, dễ đánh bại | Người mới bắt đầu |
| **Thường (Medium)** | AI có né đạn cơ bản và dùng combo đơn giản | Người chơi bình thường |
| **Khó (Hard)** | AI dùng LLM cơ bản, né kỹ năng CC, pathfinding thông minh | Người chơi giỏi |
| **Cực Khó (Very Hard)** | AI với LLM nâng cao, dự đoán đối thủ, combo phức tạp, targeting thông minh | Người chơi rất giỏi |
| **Ác Mộng (Nightmare)** | AI hoàn hảo, né tất cả kỹ năng, combo hoàn hảo, nhận thức toàn cầu | Thử thách cực khó |

### Cài Đặt Âm Lượng
- **Master Volume**: Điều chỉnh tổng âm lượng
- **SFX Volume**: Âm thanh kỹ năng và combat
- **Music Volume**: Nhạc nền game
- **Mute**: Tắt toàn bộ âm thanh

### Cài Đặt Camera
- **Camera Lock**: Khóa camera theo nhân vật (gợi ý cho người mới)
- **Camera Speed**: Tốc độ di chuyển camera
- **Camera Zoom**: Khoảng cách zoom của camera

### Tuỳ Chỉnh Controls
- **Key bindings**: Thay đổi phím điều khiển (WASD vs Arrow Keys)
- **Skill bindings**: Thay đổi phím kỹ năng (Q/W/E/R vs bất kỳ phím nào)
- **Camera controls**: Tuỳ chỉnh cách di chuyển camera (edge scroll vs middle click drag)

### Gợi Ý Cài Đặt Cho Người Mới
1. **Độ khó**: Bắt đầu với "Dễ" hoặc "Thường"
2. **Camera**: Lock camera để tập trung vào nhân vật
3. **Controls**: Dùng WASD nếu chơi nhiều game, Arrow Keys nếu quen chơi MOBA mobile
4. **Hero**: Bắt đầu với Nemo (Tank) hoặc Zephy (Fighter) - dễ chơi và forgiving
5. **Audio**: Giữ SFX volume cao để nghe kỹ năng địch

---

## 💡 Tips & Tricks Cho Người Mới

### Mẹo Định Vị Kỹ Năng
- **Skillshot**: Dự đoán di chuyển địch, đừng target vị trí hiện tại của họ. Hãy target vị trí họ sẽ đến.
- **Area skill**: Cast skill vào choke points (hành lang hẹp) để dễ trúng hơn.
- **CC timing**: Dùng stun/slow khi địch đang chạy hoặc đang cast skill quan trọng.
- **Ultimate**: Đừng hold Ultimate quá lâu. Nếu có thể kill hoặc save teammate, hãy dùng ngay.

### Quản Lý Mana Hiệu Quả
- **Early game**: Mana rất hạn chế. Đừng spam skill khi không cần.
- **Last-hit**: Dùng auto attack thay vì skill để farm lính khi mana thấp.
- **Recall**: Quay về base khi mana <30% để hồi mana và mua items.
- **Potion**: Dùng potion khi cần (tính feature sắp có).

### Khi Nào Nên Team Fight vs Farm
- **Team fight khi**:
  - Cả team full HP và có Ultimate sẵn
  - Đội địch yếu máu hoặc tản mạn
  - Có advantage level hoặc số lượng
  - Cần defend tower hoặc objective

- **Farm khi**:
  - Teammate đang dead hoặc đã recall
  - Lane bị pushed đến tower
  - Cần gold để cấp up hoặc buy items
  - Teamfight quá risk và không có advantage

### Sử Dụng Minimap Hiệu Quả
- **Check minimap mỗi 5-10 giây** để biết vị trí địch
- **Chấm đỏ = địch**: Nếu không thấy chấm đỏ trên minimap, địch có thể đang gank bạn
- **MIA (Missing in Action)**: Nếu thấy lane địch trống, ping team để báo động
- **Roaming**: Dùng minimap để tìm jungle path tốt nhất để gank

### Học Hỏi Từ Các Game MOBA Khác
Nếu bạn đã chơi League of Legends, Dota 2, hay Mobile Legends:
- **Kỹ năng chuyển đổi**: Positioning, farming, timing skill rất giống nhau
- **Sự khác biệt**: MOBA Arena có map nhỏ hơn, game nhanh hơn, ít item hơn
- **Hero tương tự**:
  - Vanheo ≈ Ashe / Jinx (LoL)
  - Zephy ≈ Garen / Sett (LoL)
  - LaLo ≈ Lux / Annie (LoL)
  - Nemo ≈ Leona / Braum (LoL)
  - Balametany ≈ Zed / Talon (LoL)

### Đừng Hoảng Sợ Khi Thua
- **MOBA là game học từ sai lầm**: Mỗi trận thua là bài học
- **Analyze**: Tại sao bạn chết? Có phải dive tower 1v3? Timing engage sai?
- **Practice**: Chơi cùng độ khó nhiều lần để quen với hero và map
- **Ask for help**: Nếu có community hoặc discord, đừng ngại hỏi tips
- **Have fun**: Game là để giải trí! Đừng để win/loss ảnh hưởng tâm trạng quá nhiều

---

## ❓ FAQ (Câu Hỏi Thường Gặp)

### Làm Sao Để Chơi Tốt Hơn?
- **Practice**: Chơi nhiều để quen với hero và mechanics
- **Watch minimap**: Luôn biết vị trí địch
- **Last-hit tốt**: Farm hiệu quả = nhiều gold = mạnh hơn
- **Positioning**: Đi đúng vai trò trong teamfight (tank đi đầu, carry đi sau)
- **Combo execution**: Học combo của hero và timing skill

### Tại Sao Mình Bị Giết Nhiều?
- **Overextending**: Đi quá xa khỏi tower, dễ bị gank
- **Bad positioning**: Đi alone vào rừng hoặc lane địch
- **Diving tower**: Tha địch dưới tower khi không đủ damage
- **Mana wastage**: Spam skill và hết mana khi combat
- **Wrong timing**: Engage khi team disadvantage

### Làm Sao Để Earn Gold Nhanh?
- **Last-hit tốt**: Đánh cuối cùng vào lính để nhận full gold
- **Farm jungle**: Clear quái rừng khi có thời gian
- **Kills và assists**: Giết hoặc hỗ trợ giết kẻ địch
- **Push lane**: Farm nhiều wave liên tục khi có advantage
- **Don't die**: Chết = mất time farm và feed gold cho địch

### Game Bị Lag, Phải Làm Sao?
- **Kiểm tra browser**: Chrome và Firefox thường mượt hơn
- **Giảm graphics**: Tắt shadow hoặc giảm chất lượng (nếu có tùy chọn)
- **Đóng tab khác**: Tắt các tab browser đang chạy để freed up RAM
- **Restart browser**: Nếu game lag lâu, hãy refresh page
- **Check internet**: Lag do network thì không phải do game

### Có Thể Chơi Vs Bạn Bè Không?
- Hiện tại game chỉ hỗ trợ chơi vs AI (single player)
- Multiplayer có thể sẽ được thêm trong tương lai
- Bạn có thể stream hoặc share screen để "chơi cùng" bạn bè

### Hero Nào Dễ Nhất Cho Người Mới?
- **Nemo (Tank)**: Nhiều HP, forgiving, dễ học mechanics
- **Zephy (Fighter)**: Cân bằng, đủ damage và durability
- **LaLo (Mage)**: Dễ clear wave với area skill

### Hero Nào Khó Nhất?
- **Balametany (Assassin)**: Cần positioning hoàn hảo và timing combo chính xác
- **Vanheo (Marksman)**: Yếu trong combat cận chiến, cần kiting và positioning tốt

### Làm Sao Để Nâng Kỹ Năng?
- **Up skill**: Nhấn Ctrl + Q/E/R/T khi có skill point
- **Nên nâng gì trước**:
  - Tank/Fighter: Max skill damage hoặc CC đầu tiên (thường là Q hoặc E)
  - Marksman: Max Q hoặc E để farm tốt, R là escape/sustain
  - Mage: Max damage skill để burst
  - Assassin: Max combo skill và mobility

---

## 🚀 Installation & Getting Started

### Yêu Cầu Hệ Thống
- **Browser**: Chrome, Firefox, Edge, hoặc Safari (khuyến nghị Chrome)
- **OS**: Windows, macOS, Linux, Android, iOS (bất kỳ OS nào có browser)
- **Internet**: Không cần (game chạy hoàn toàn offline)
- **Hardware**: Máy tính hoặc điện thoại trung bình có thể chạy mượt 60 FPS

### Cách Cài Đặt & Chạy Game

**Phương pháp 1: Mở trực tiếp file HTML (Đơn giản nhất)**
1. Tải hoặc clone repository
2. Mở file `index.html` bằng browser (double-click hoặc right-click → Open with)
3. Bắt đầu chơi!

**Phương pháp 2: Sử dụng Local Server (Khuyến nghị cho full features)**
```bash
# Sử dụng Python 3
python -m http.server 8000

# Hoặc Python 2
python -m SimpleHTTPServer 8000

# Hoặc Node.js
npx serve .

# Hoặc PHP
php -S localhost:8000
```
Sau đó mở trình duyệt và truy cập: `http://localhost:8000`

### Các Lựa Chọn Setup

**Option A: Đơn giản nhất** (cho người chơi chỉ muốn chơi)
- Chỉ cần mở `index.html` trong browser
- Tất cả features hoạt động (trừ một số tính năng cần CORS)

**Option B: Local Server** (cho đầy đủ features)
- Dùng Python, Node.js, hoặc bất kỳ web server nào
- Tất cả features hoạt động 100%
- Không có lỗi CORS hoặc asset loading

**Option C: Docker** (cho dev hoặc tùy biến sâu)
```bash
# Xem file docker-compose.yml trong thư mục ollama/
# Đối với AI LLM nâng cấp, có thể cần run Ollama service
docker-compose up -d
```

### Getting Started Checklist
- ✅ Kiểm tra browser version (cập nhật nếu quá cũ)
- ✅ Tải hoặc clone repository
- ✅ Mở `index.html` hoặc chạy local server
- ✅ Chọn độ khó AI (bắt đầu với "Dễ" hoặc "Thường")
- ✅ Chọn hero (thử Nemo hoặc Zephy cho người mới)
- ✅ Đọc controls (WASD, Q/E/R/T, Space, F)
- ✅ Bắt đầu game và have fun!

---

## 🙏 Credits & Links

### Nguồn Cảm Hứng
Game được phát triển với cảm hứng từ các MOBA kinh điển:
- **League of Legends** (Riot Games)
- **Dota 2** (Valve)
- **Mobile Legends: Bang Bang** (Moonton)

### Tech Stack
- **Vanilla JavaScript**: Không external libraries, pure JS
- **HTML5 Canvas**: Render graphics mượt mà
- **CSS3**: Styling UI và responsive design
- **Optional**: Docker + Ollama cho AI LLM nâng cao

### Development
- Developed with ❤️ using vanilla JavaScript
- No external dependencies required
- Open source (nếu applicable)

### Contact & Community
- Nếu có bug hoặc suggestion, hãy report qua issue tracker
- Join community discord (nếu có) để discuss tips và strategies

---

**Chúc bạn có những giờ phút thú vị với MOBA Arena! 🎮⚔️**

*Nhớ: Practice makes perfect - đừng nản nếu thua, mỗi trận là bài học!*
