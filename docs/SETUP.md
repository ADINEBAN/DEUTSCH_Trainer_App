# Hướng dẫn cấu hình & chạy Deutsch Trainer

## 1. Supabase (database)

1. Vào [supabase.com](https://supabase.com) → project của bạn → **Database**.
2. Mục **Connection string**, chọn chế độ **Session**, copy chuỗi dạng:
   `postgresql://postgres.[ref]:[PASSWORD]@aws-0-...pooler.supabase.com:5432/postgres`
3. Tách thành 3 biến cho backend:
   - `DB_URL=jdbc:postgresql://aws-0-...pooler.supabase.com:5432/postgres`
   - `DB_USER=postgres.[ref]`
   - `DB_PASSWORD=[PASSWORD]`
4. Chạy backend lần đầu — Flyway tự tạo bảng và seed từ vựng / câu hỏi / ngữ pháp
   tiếng Đức (migrations V1→V5). Mở **Table Editor** trong Supabase để kiểm chứng.

## 2. Speechify (giọng Đức)

1. Đăng ký tại `platform.speechify.ai` → **API Keys** → tạo key mới, copy ngay.
2. Đặt `SPEECHIFY_API_KEY=<key>` cho backend (biến môi trường server).
3. Giọng Đức mặc định: `SPEECHIFY_VOICE_ID=amalia` (de-DE), model `simba-3.0`.
   ⚠️ **Đừng dùng `simba-3.2` cho tiếng Đức** — model này chỉ hỗ trợ tiếng Anh
   (API trả 400 khi ghép với voice Đức). Đổi voice khác qua `SPEECHIFY_VOICE_ID`.
4. Chưa có key: API `/api/tts` trả `503 {fallback:true}` và app tự dùng giọng máy
   (de-DE), hiển thị rõ "giọng dự phòng".

## 3. AI (5 tính năng AI for Life, prompt tiếng Đức)

1. Chuẩn bị một API key OpenAI-compatible (ví dụ OpenAI, hoặc bất kỳ provider nào
   có endpoint `/v1/chat/completions`).
2. Đặt `AI_API_KEY`, `AI_API_BASE` (mặc định `https://api.openai.com/v1`),
   `AI_MODEL` (mặc định `gpt-4o-mini`), `AI_VISION_MODEL` (cho chụp ảnh học từ).
3. Chưa có key: các màn hình AI hiển thị đúng thông báo từ backend, không giả lập.
4. Chấm giọng nói phía server cần provider hỗ trợ transcription
   (`AI_TRANSCRIBE_MODEL`, mặc định `whisper-1`); chưa có thì Speaking Coach dùng
   chấm heuristic trên transcript và ghi rõ `fallback:true`.
5. Giới hạn chi phí: `AI_DAILY_CHAR_LIMIT` (mặc định 200000 ký tự/ngày/user),
   mọi cuộc gọi AI được ghi vào bảng `ai_usage_log`.

## 4. Chạy trên điện thoại thật (Expo Go)

```bash
cd frontend && npm install && npx expo start
```

- Cài **Expo Go** đúng **SDK 57** trên điện thoại, cùng Wi-Fi với máy tính.
- Quét mã QR. App tự trỏ về IP máy tính để gọi backend cổng 8080
  (hoặc đặt `EXPO_PUBLIC_API_BASE_URL=http://<IP>:8080` trong `.env` của frontend).
- Backend phải đang chạy (`mvn spring-boot:run`).
- **Lưu ý:** `frontend/package-lock.json` không được commit trong repo này
  (theo convention của repo TOEIC) — sau khi clone luôn chạy `npm install`
  (không dùng `npm ci`).

## 5. Trang admin

```bash
cd frontend && npx expo start --web
# mở http://localhost:8081/admin
```

Đăng nhập bằng tài khoản có `role = ADMIN`. Tạo tài khoản admin đầu tiên bằng cách
đăng ký thường rồi sửa `role` thành `ADMIN` trong bảng `users` (Supabase Table Editor).
Trang admin quản lý: từ vựng (kèm mạo từ der/die/das + số nhiều + level A1–C2),
câu hỏi (module Wortschatz/Grammatik/Leseverstehen/Hörverstehen + level),
bài ngữ pháp, người dùng.

## 6. OTA updates (EAS)

```bash
cd frontend
npm i -g eas-cli
eas login
eas update:configure     # một lần duy nhất, tạo projectId trong app.json
eas update --branch production --message "mô tả thay đổi"
```

Máy đã cài bản dev/production có `expo-updates` sẽ tự tải bản mới khi mở app.
Chỉ sửa JS/logic mới dùng OTA; thêm thư viện native → `eas build --platform android`.

## 7. Deploy backend

Backend là Spring Boot thuần — deploy ở đâu cũng được (Render, Railway, VPS…):

```bash
cd backend && mvn -DskipTests package
java -jar target/deutsch-trainer-backend-*.jar
```

Đặt toàn bộ biến môi trường ở mục trên trong phần Environment của host.
Schema database đi qua Flyway migration có phiên bản — không sửa tay trên DB thật.

## 8. Checklist cho lần chạy đầu tiên

- [ ] Supabase: lấy connection string (Session mode), điền `DB_URL/DB_USER/DB_PASSWORD`
- [ ] `JWT_SECRET` ≥ 32 ký tự
- [ ] `SPEECHIFY_API_KEY` (nếu muốn giọng Đức chất lượng cao; chưa có vẫn chạy bằng giọng máy)
- [ ] `AI_API_KEY` (+ `AI_API_BASE`, `AI_MODEL`) nếu muốn dùng 5 tính năng AI
- [ ] Backend chạy lần đầu → Flyway seed xong → kiểm tra bảng `vocabulary` có dữ liệu
- [ ] Frontend `npm install` → `npx expo start` → quét QR bằng Expo Go SDK 57
- [ ] Đăng ký tài khoản, làm placement test, kiểm tra TTS đọc tiếng Đức
- [ ] (Tuỳ chọn) tạo admin, `eas login` + cấu hình OTA
