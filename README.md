# Deutsch Trainer — Bản App Thật

Ứng dụng học tiếng Đức trên điện thoại thật, từ **A1 đến C2**: học từ vựng (SRS),
luyện 4 module kiểu Goethe (Wortschatz · Grammatik · Leseverstehen · Hörverstehen),
mock test chấm **0–100 mỗi module**, ngữ pháp A1–C2, sổ tay, Speaking Coach,
học rảnh tay và 5 tính năng AI for Life.

| Lớp | Công nghệ |
|---|---|
| Frontend | React Native — Expo SDK 57, TypeScript, expo-router, giao diện glass (UI tiếng Việt) |
| Backend | Java 21, Spring Boot 3, REST API, Spring Security + JWT, Flyway |
| Database | Supabase Postgres (kết nối JDBC trực tiếp) |
| Giọng đọc | Speechify (giọng Đức `amalia`, model `simba-3.0`) qua backend proxy + cache phía server |
| AI | OpenAI-compatible API qua backend proxy (key ở server), prompt chuyên tiếng Đức |
| Cập nhật | Expo Updates (OTA) cho JS · backend auto-deploy từ GitHub |

> Đây là bản app thật (repo `ADINEBAN/DEUTSCH_Trainer_App`), mirror đầy đủ chức năng
> của `TOEIC_Trainer_App`. Mọi API key (Speechify, AI) chỉ nằm ở biến môi trường
> phía server — app không chứa key chung.

## Cấu trúc repo

```
frontend/   # Expo app (SDK 57): npx expo start, quét QR bằng Expo Go SDK 57
backend/    # Spring Boot API: mvn spring-boot:run (cần DB_URL/DB_USER/DB_PASSWORD)
docs/       # Tài liệu cấu hình: supabase, eas, speechify, ai
```

## Chạy nhanh (dev)

**Backend**
```bash
cd backend
cp .env.example .env   # điền DB_URL/DB_USER/DB_PASSWORD (Supabase), JWT_SECRET
# Windows (PowerShell): $env:JAVA_HOME="C:\Program Files\Java\jdk-21"
mvn spring-boot:run    # Flyway tự tạo bảng + seed từ vựng/câu hỏi/ngữ pháp tiếng Đức
```

**Frontend**
```bash
cd frontend
npm install            # package-lock.json KHÔNG commit theo repo này — chạy npm install sau khi clone
npx expo start         # quét QR bằng Expo Go (SDK 57), cùng Wi-Fi với máy tính
```

App tự nhận địa chỉ máy tính để gọi backend cổng 8080 (xem `frontend/src/config/env.ts`).
Trang admin: mở bản web `npx expo start --web` rồi vào `http://localhost:8081/admin`.

## Biến môi trường backend

| Biến | Bắt buộc | Mô tả |
|---|---|---|
| `DB_URL`, `DB_USER`, `DB_PASSWORD` | Có | Chuỗi kết nối Supabase Postgres (Database → Connection string, Session mode) |
| `JWT_SECRET` | Có (prod) | Chuỗi bí mật ký JWT, tối thiểu 32 ký tự |
| `SPEECHIFY_API_KEY` | Không | Key Speechify — chưa có thì `/api/tts` trả `503 {fallback:true}`, app dùng giọng máy |
| `SPEECHIFY_VOICE_ID` | Không | Voice ID giọng Đức, mặc định `amalia` (de-DE) |
| `SPEECHIFY_MODEL` | Không | Mặc định `simba-3.0` (lưu ý: `simba-3.2` chỉ hỗ trợ tiếng Anh) |
| `AI_API_KEY`, `AI_API_BASE`, `AI_MODEL` | Không | Key AI OpenAI-compatible — chưa có thì tính năng AI báo rõ, không giả lập |
| `AI_VISION_MODEL` | Không | Model vision cho tính năng chụp ảnh học từ |
| `AI_TRANSCRIBE_MODEL` | Không | Model transcription cho Speaking Coach (chưa có → chấm heuristic + `fallback:true`) |
| `AI_DAILY_CHAR_LIMIT` | Không | Giới hạn ký tự AI/ngày/user (mặc định 200000) |
| `CORS_ALLOWED_ORIGINS` | Không | Mặc định `*` cho dev |
| `STORAGE_DIR` | Không | Thư mục lưu ảnh/file upload (mặc định `./uploads`) |
| `PORT` | Không | Mặc định 8080 |

**Không bao giờ** gửi key qua chat hay commit vào repo.

## Nội dung học

- **Từ vựng:** bank ~800–1200 từ gắn tag CEFR (A1/A2/B1/B2/C1/C2), mỗi từ có mạo từ
  der/die/das, dạng số nhiều, loại từ, nghĩa tiếng Việt, ví dụ Đức–Việt, chủ đề.
- **Ngữ pháp:** 16–20 chủ đề từ A1 đến C2 (Kasus, Konjugation, Modalverben, Perfekt,
  Nebensätze, Passiv, Konjunktiv I/II, Nominalisierung, Partizipialkonstruktionen…),
  lý thuyết tiếng Việt + mini quiz.
- **Luyện tập & mock test:** 200+ câu trắc nghiệm kiểu Goethe gắn level A1–C2,
  placement test phân loại tới C2, chấm 0–100 mỗi module.

## Tính năng AI — nói thật

5 tính năng AI (mạng từ vựng theo word family Đức, chụp ảnh → danh từ kèm mạo từ +
số nhiều, tài liệu → MCQ kiểu Goethe hoặc lý thuyết ngữ pháp, Speaking Coach chấm
phát âm Đức, học rảnh tay bằng audio Đức) gọi model có sẵn qua API, kết quả được
cache vào database để tái dùng. **Không có chuyện train lại LLM.** Phần "học" duy
nhất là mô hình thích ứng nhỏ trên dữ liệu của từng người học (điểm thành thạo/
đường cong quên cho SRS và gợi ý). Chấm phát âm dựa trên transcript nhận dạng được,
chưa phân tích âm học từng phoneme.

## Đóng gói & cập nhật

- **OTA (khuyên dùng):** `eas update:configure` một lần, sau đó mỗi lần sửa JS chỉ cần
  `eas update --branch production` — máy đã cài tự nhận bản mới khi mở app.
- **Build file cài:** `eas build --platform android` khi thêm thư viện native mới.

Chi tiết xem `docs/SETUP.md`.
