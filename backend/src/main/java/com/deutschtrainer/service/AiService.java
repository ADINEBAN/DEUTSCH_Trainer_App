package com.deutschtrainer.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.deutschtrainer.common.ApiException;
import com.deutschtrainer.domain.CustomWord;
import com.deutschtrainer.domain.DocAnalysis;
import com.deutschtrainer.domain.PhotoWord;
import com.deutschtrainer.domain.Vocabulary;
import com.deutschtrainer.domain.WordRelation;
import com.deutschtrainer.dto.AiProxyResult;
import com.deutschtrainer.dto.TutorMessage;
import com.deutschtrainer.repo.CustomWordRepository;
import com.deutschtrainer.repo.DocAnalysisRepository;
import com.deutschtrainer.repo.PhotoWordRepository;
import com.deutschtrainer.repo.VocabularyRepository;
import com.deutschtrainer.repo.WordRelationRepository;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * The five "AI for Life" features. Every call goes through AiClient
 * (quota + usage logging). AI-generated content is persisted and reused —
 * the same input never triggers a second AI call.
 */
@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);
    private static final int MAX_DOC_CHARS = 12000;

    private final AiClient ai;
    private final ObjectMapper objectMapper;
    private final VocabularyRepository vocabulary;
    private final WordRelationRepository relations;
    private final PhotoWordRepository photoWords;
    private final DocAnalysisRepository docAnalyses;
    private final CustomWordRepository customWords;
    private final String storageDir;
    private final String visionModel;

    public AiService(AiClient ai,
                     ObjectMapper objectMapper,
                     VocabularyRepository vocabulary,
                     WordRelationRepository relations,
                     PhotoWordRepository photoWords,
                     DocAnalysisRepository docAnalyses,
                     CustomWordRepository customWords,
                     @Value("${app.storage-dir}") String storageDir,
                     @Value("${app.ai.vision-model}") String visionModel) {
        this.ai = ai;
        this.objectMapper = objectMapper;
        this.vocabulary = vocabulary;
        this.relations = relations;
        this.photoWords = photoWords;
        this.docAnalyses = docAnalyses;
        this.customWords = customWords;
        this.storageDir = storageDir;
        this.visionModel = visionModel;
    }

    // ==================================================================
    // Availability (which AI-backed features can run on this server)
    // ==================================================================
    public boolean aiConfigured() {
        return ai.isConfigured();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> availability(boolean ttsConfigured) {
        boolean aiOk = ai.isConfigured();
        String message;
        if (aiOk && ttsConfigured) {
            message = "AI và giọng đọc đã sẵn sàng.";
        } else if (!aiOk && !ttsConfigured) {
            message = "Máy chủ chưa cấu hình AI (AI_API_KEY) và giọng đọc (SPEECHIFY_API_KEY); "
                    + "các tính năng AI sẽ chạy ở chế độ dự phòng.";
        } else if (!aiOk) {
            message = "Máy chủ chưa cấu hình AI (AI_API_KEY); các tính năng AI sẽ chạy ở chế độ dự phòng.";
        } else {
            message = "Máy chủ chưa cấu hình giọng đọc (SPEECHIFY_API_KEY); phát âm dùng giọng của máy.";
        }
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("aiAvailable", aiOk);
        out.put("ttsAvailable", ttsConfigured);
        out.put("message", message);
        return out;
    }

    // ==================================================================
    // 6.1b Save a semantic-network word into the user's own word list
    // ==================================================================
    /** Ensures the word exists in custom_words for this user (creates a minimal entry). */
    @Transactional
    public Map<String, Object> saveSemanticWord(UUID userId, String word) {
        String target = word == null ? "" : word.trim();
        if (target.isEmpty()) {
            throw ApiException.badRequest("Thiếu từ cần lưu.");
        }
        CustomWord existing = customWords.findByUserIdAndWordIgnoreCase(userId, target).orElse(null);
        if (existing != null) {
            return Map.of("id", existing.getId().toString(), "created", false);
        }
        CustomWord cw = new CustomWord();
        cw.setUserId(userId);
        cw.setWord(target);
        cw.setMeaningVi("");
        cw.setTopic("Mạng từ");
        CustomWord saved = customWords.save(cw);
        return Map.of("id", saved.getId().toString(), "created", true);
    }

    // ==================================================================
    // 6.2b Save a photo-recognized word (from the app's /photo result)
    // ==================================================================
    /** Persists a photo word the app already recognized; returns its id. */
    @Transactional
    public Map<String, Object> savePhotoWord(UUID userId, String word, String article, String plural,
                                             String ipa, String meaningVi, String exampleDe, String imageUrl) {
        String target = word == null ? "" : word.trim();
        if (target.isEmpty()) {
            throw ApiException.badRequest("Thiếu danh từ tiếng Đức của vật thể.");
        }
        PhotoWord pw = new PhotoWord();
        pw.setUserId(userId);
        // imageUrl from the recognition result is stored as the image reference.
        pw.setImagePath(imageUrl == null || imageUrl.isBlank() ? "app-result" : imageUrl.trim());
        pw.setWord(target);
        pw.setArticle(article == null ? "" : article.trim());
        pw.setPlural(plural == null ? "" : plural.trim());
        pw.setIpa(ipa == null ? "" : ipa.trim());
        pw.setMeaningVi(meaningVi == null ? "" : meaningVi.trim());
        // DB column example_en now stores the German example sentence.
        pw.setExampleEn(exampleDe == null ? "" : exampleDe.trim());
        PhotoWord saved = photoWords.save(pw);
        return Map.of("id", saved.getId().toString());
    }

    // ==================================================================
    // 6.1 Semantic word network
    // ==================================================================
    @Transactional
    public Map<String, Object> semanticNetwork(UUID userId, String word) {
        String target = word.trim().toLowerCase();
        if (target.isEmpty()) {
            throw ApiException.badRequest("Thiếu từ cần tra.");
        }
        Vocabulary vocab = vocabulary.search(null, target, org.springframework.data.domain.PageRequest.of(0, 5))
                .stream()
                .filter(v -> v.getWord().equalsIgnoreCase(target))
                .findFirst()
                .orElse(null);

        if (vocab != null) {
            List<WordRelation> cached = relations.findByWordId(vocab.getId());
            if (!cached.isEmpty()) {
                log.info("semantic cache hit: word={}", target);
                return Map.of("word", vocab.getWord(), "cached", true, "relations", toRelationMaps(cached));
            }
        }

        String system = "Bạn là từ điển tiếng Đức cho người Việt (trình độ A1–C2). Với một từ tiếng Đức, liệt kê các từ liên quan, "
                + "ưu tiên word family. Trả về DUY NHẤT một JSON hợp lệ: "
                + "{\"relations\": [{\"word\": \"từ liên quan\", \"article\": \"der|die|das (để trống nếu không phải danh từ)\", "
                + "\"plural\": \"dạng số nhiều (để trống nếu không phải danh từ)\", \"meaningVi\": \"nghĩa tiếng Việt\", "
                + "\"relationType\": \"synonym|antonym|word_family|collocation|related\", "
                + "\"exampleDe\": \"câu ví dụ tiếng Đức\", \"exampleVi\": \"nghĩa tiếng Việt của câu\"}]}. "
                + "Tối đa 8 quan hệ. Ví dụ: fahren → der Fahrer, die Fahrt, die Abfahrt. Ví dụ phải tự nhiên, đúng ngữ pháp.";
        AiProxyResult r = ai.chat(userId, "semantic", List.of(
                Map.of("role", "system", "content", system),
                Map.of("role", "user", "content", "Từ cần tra: \"" + target + "\"")));

        List<Map<String, Object>> relMaps = parseRelations(AiClient.extractJson(r.content()));

        // Persist for system vocabulary words so the next open reads from DB.
        if (vocab != null) {
            for (Map<String, Object> rel : relMaps) {
                String relatedWord = String.valueOf(rel.getOrDefault("word", "")).trim();
                if (relatedWord.isEmpty()
                        || relations.existsByWordIdAndRelatedWord(vocab.getId(), relatedWord)) {
                    continue;
                }
                Vocabulary match = vocabulary.search(null, relatedWord,
                                org.springframework.data.domain.PageRequest.of(0, 5))
                        .stream()
                        .filter(v -> v.getWord().equalsIgnoreCase(relatedWord))
                        .findFirst()
                        .orElse(null);
                WordRelation wr = new WordRelation();
                wr.setWordId(vocab.getId());
                wr.setRelatedWordId(match == null ? null : match.getId());
                wr.setRelatedWord(relatedWord);
                wr.setRelationType(String.valueOf(rel.getOrDefault("relationType", "related")));
                // DB column example_en now stores the German example sentence.
                Object exDe = rel.get("exampleDe");
                wr.setExampleEn(String.valueOf(exDe != null ? exDe : rel.getOrDefault("exampleEn", "")));
                wr.setExampleVi(String.valueOf(rel.getOrDefault("exampleVi", "")));
                relations.save(wr);
            }
        }

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("word", vocab == null ? target : vocab.getWord());
        out.put("cached", false);
        out.put("relations", relMaps);
        if (vocab == null) {
            out.put("note", "Từ này chưa có trong kho từ hệ thống nên quan hệ chưa được lưu cache.");
        }
        return out;
    }

    private List<Map<String, Object>> toRelationMaps(List<WordRelation> list) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (WordRelation wr : list) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("word", wr.getRelatedWord());
            m.put("article", "");
            m.put("plural", "");
            m.put("relationType", wr.getRelationType());
            m.put("exampleDe", wr.getExampleEn() == null ? "" : wr.getExampleEn());
            m.put("exampleVi", wr.getExampleVi() == null ? "" : wr.getExampleVi());
            out.add(m);
        }
        return out;
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> parseRelations(String json) {
        try {
            Map<String, Object> root = objectMapper.readValue(json, new TypeReference<>() {
            });
            Object rels = root.get("relations");
            if (rels instanceof List<?> list) {
                return (List<Map<String, Object>>) list;
            }
        } catch (JsonProcessingException e) {
            log.warn("Failed to parse semantic relations JSON", e);
        }
        throw ApiException.serviceUnavailable("AI trả về định dạng không hợp lệ. Vui lòng thử lại.");
    }

    // ==================================================================
    // 6.2 Camera photo-to-word
    // ==================================================================
    @Transactional
    public Map<String, Object> photoToWord(UUID userId, byte[] imageBytes, String filename, String contentType) {
        if (imageBytes == null || imageBytes.length == 0) {
            throw ApiException.badRequest("File ảnh trống.");
        }
        if (imageBytes.length > 10 * 1024 * 1024) {
            throw ApiException.badRequest("Ảnh quá lớn (tối đa 10MB).");
        }
        Path dir = Paths.get(storageDir, "photos", userId.toString());
        String savedPath = saveFile(dir, filename, imageBytes);

        String base64 = Base64.getEncoder().encodeToString(imageBytes);
        String mime = contentType != null && contentType.startsWith("image/") ? contentType : "image/jpeg";
        Map<String, Object> imagePart = new LinkedHashMap<>();
        imagePart.put("type", "image_url");
        imagePart.put("image_url", Map.of("url", "data:" + mime + ";base64," + base64));
        Map<String, Object> textPart = new LinkedHashMap<>();
        textPart.put("type", "text");
        textPart.put("text", "Vật thể chính trong ảnh này là gì?");
        String system = "Bạn là trợ lý học tiếng Đức qua hình ảnh. Nhìn ảnh và xác định MỘT vật thể chính rõ nhất. "
                + "Trả về DUY NHẤT một JSON hợp lệ: "
                + "{\"word\": \"danh từ tiếng Đức chỉ vật thể\", \"article\": \"der|die|das\", "
                + "\"plural\": \"dạng số nhiều của danh từ\", \"ipa\": \"/phiên âm/\", "
                + "\"meaningVi\": \"nghĩa tiếng Việt\", "
                + "\"exampleDe\": \"một câu ví dụ tiếng Đức tự nhiên\", \"exampleVi\": \"nghĩa tiếng Việt của câu\"}.";
        AiProxyResult r = ai.chat(userId, "photo", List.of(
                        Map.of("role", "system", "content", system),
                        Map.<String, Object>of("role", "user", "content", List.of(textPart, imagePart))),
                visionModel, 0.2);

        Map<String, Object> parsed = parseJsonObject(AiClient.extractJson(r.content()));
        String foundWord = String.valueOf(parsed.getOrDefault("word", "")).trim();
        if (foundWord.isEmpty()) {
            throw ApiException.serviceUnavailable("AI không nhận diện được vật thể trong ảnh.");
        }

        String exampleDe = firstNonBlank(parsed.get("exampleDe"), parsed.get("exampleEn"));
        PhotoWord pw = new PhotoWord();
        pw.setUserId(userId);
        pw.setImagePath(savedPath);
        pw.setWord(foundWord);
        pw.setArticle(String.valueOf(parsed.getOrDefault("article", "")).trim());
        pw.setPlural(String.valueOf(parsed.getOrDefault("plural", "")).trim());
        pw.setIpa(String.valueOf(parsed.getOrDefault("ipa", "")));
        pw.setMeaningVi(String.valueOf(parsed.getOrDefault("meaningVi", "")));
        // DB column example_en now stores the German example sentence.
        pw.setExampleEn(exampleDe);
        photoWords.save(pw);

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("id", pw.getId().toString());
        out.put("word", pw.getWord());
        out.put("germanName", pw.getWord()); // app key for the recognized German word
        out.put("article", str(pw.getArticle()));
        out.put("plural", str(pw.getPlural()));
        out.put("ipa", str(pw.getIpa()));
        out.put("meaningVi", str(pw.getMeaningVi()));
        out.put("exampleDe", str(pw.getExampleEn()));
        out.put("exampleEn", str(pw.getExampleEn()));
        out.put("exampleVi", String.valueOf(parsed.getOrDefault("exampleVi", "")));
        out.put("imagePath", pw.getImagePath());
        return out;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> photoHistory(UUID userId) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (PhotoWord pw : photoWords.findByUserIdOrderByCreatedAtDesc(userId)) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", pw.getId().toString());
            m.put("word", pw.getWord());
            m.put("article", str(pw.getArticle()));
            m.put("plural", str(pw.getPlural()));
            m.put("ipa", pw.getIpa() == null ? "" : pw.getIpa());
            m.put("meaningVi", pw.getMeaningVi() == null ? "" : pw.getMeaningVi());
            m.put("exampleDe", pw.getExampleEn() == null ? "" : pw.getExampleEn());
            m.put("exampleEn", pw.getExampleEn() == null ? "" : pw.getExampleEn());
            m.put("imagePath", pw.getImagePath());
            m.put("createdAt", pw.getCreatedAt().toString());
            out.add(m);
        }
        return out;
    }

    // ==================================================================
    // 6.3 Document analysis (PDF/DOCX/TXT/image -> vocab/grammar/tips/questions)
    // ==================================================================
    @Transactional
    public Map<String, Object> analyzeDocument(UUID userId, byte[] fileBytes, String filename, String contentType) {
        if (fileBytes == null || fileBytes.length == 0) {
            throw ApiException.badRequest("File trống.");
        }
        if (fileBytes.length > 20 * 1024 * 1024) {
            throw ApiException.badRequest("File quá lớn (tối đa 20MB).");
        }
        String savedPath = saveFile(Paths.get(storageDir, "docs", userId.toString()), filename, fileBytes);

        String text = extractText(fileBytes, filename, contentType, userId);
        if (text.isBlank()) {
            throw ApiException.badRequest("Không trích xuất được nội dung từ file.");
        }
        String chunk = text.length() > MAX_DOC_CHARS ? text.substring(0, MAX_DOC_CHARS) : text;

        String system = "Bạn là chuyên gia luyện thi tiếng Đức theo chuẩn Goethe (trình độ A1–C2). Phân tích đoạn tài liệu học tiếng Đức sau. "
                + "Trả về DUY NHẤT một JSON hợp lệ với đúng cấu trúc: "
                + "{\"vocabulary\": [{\"word\": \"\", \"article\": \"der|die|das (để trống nếu không phải danh từ)\", "
                + "\"plural\": \"dạng số nhiều (để trống nếu không phải danh từ)\", \"ipa\": \"\", \"partOfSpeech\": \"\", "
                + "\"meaningVi\": \"\", \"definitionDe\": \"định nghĩa ngắn bằng tiếng Đức\", "
                + "\"exampleDe\": \"\", \"exampleVi\": \"\"}], "
                + "\"grammarPoints\": [{\"title\": \"\", \"explanation\": \"giải thích bằng tiếng Việt\"}], "
                + "\"tips\": [\"mẹo làm bài bằng tiếng Việt\"], "
                + "\"questions\": [{\"module\": \"wortschatz|grammatik|leseverstehen|hoerverstehen\", \"prompt\": \"\", "
                + "\"options\": [\"A\",\"B\",\"C\",\"D\"], \"answerIndex\": 0, "
                + "\"explanation\": \"giải thích bằng tiếng Việt\"}]}. "
                + "Tối đa 15 từ vựng, 5 điểm ngữ pháp, 5 mẹo, 8 câu hỏi trắc nghiệm kiểu Goethe "
                + "(Wortschatz/Grammatik/Leseverstehen/Hörverstehen), phù hợp trình độ của tài liệu (A1–C2). "
                + "Tất cả giải thích và mẹo viết bằng tiếng Việt.";
        AiProxyResult r = ai.chat(userId, "doc", List.of(
                Map.of("role", "system", "content", system),
                Map.of("role", "user", "content",
                        "Phân tích tài liệu sau:\n\n" + chunk)));

        String resultJson = AiClient.extractJson(r.content());
        Map<String, Object> result = parseJsonObject(resultJson);

        int added = insertNewWords(userId, result.get("vocabulary"));

        DocAnalysis doc = new DocAnalysis();
        doc.setUserId(userId);
        doc.setFilename(filename);
        doc.setFilePath(savedPath);
        doc.setExtractedText(chunk);
        doc.setResult(resultJson);
        doc.setWordsAdded(added);
        docAnalyses.save(doc);

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("id", doc.getId().toString());
        out.put("filename", filename);
        out.put("wordsAdded", added);
        out.put("result", result);
        return out;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> docHistory(UUID userId) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (DocAnalysis d : docAnalyses.findByUserIdOrderByCreatedAtDesc(userId)) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", d.getId().toString());
            m.put("filename", d.getFilename());
            m.put("wordsAdded", d.getWordsAdded());
            m.put("createdAt", d.getCreatedAt().toString());
            out.add(m);
        }
        return out;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDoc(UUID userId, UUID id) {
        DocAnalysis d = docAnalyses.findByIdAndUserId(id, userId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy tài liệu."));
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("id", d.getId().toString());
        out.put("filename", d.getFilename());
        out.put("wordsAdded", d.getWordsAdded());
        out.put("result", parseJsonObject(d.getResult()));
        out.put("createdAt", d.getCreatedAt().toString());
        return out;
    }

    private String extractText(byte[] bytes, String filename, String contentType, UUID userId) {
        String lower = filename == null ? "" : filename.toLowerCase();
        try {
            if (lower.endsWith(".pdf")) {
                try (PDDocument doc = Loader.loadPDF(bytes)) {
                    return new PDFTextStripper().getText(doc);
                }
            }
            if (lower.endsWith(".docx")) {
                try (XWPFDocument doc = new XWPFDocument(new ByteArrayInputStream(bytes))) {
                    StringBuilder sb = new StringBuilder();
                    for (XWPFParagraph p : doc.getParagraphs()) {
                        sb.append(p.getText()).append('\n');
                    }
                    return sb.toString();
                }
            }
            if (lower.endsWith(".txt") || lower.endsWith(".md") || lower.endsWith(".text")) {
                return new String(bytes, StandardCharsets.UTF_8);
            }
            if (contentType != null && contentType.startsWith("image/")) {
                return ocrImage(userId, bytes, contentType);
            }
            // Fallback: treat as plain text
            return new String(bytes, StandardCharsets.UTF_8);
        } catch (IOException e) {
            log.warn("Text extraction failed for {}", filename, e);
            throw ApiException.badRequest("Không đọc được file. Chỉ hỗ trợ PDF, DOCX, TXT, MD hoặc ảnh.");
        }
    }

    private String ocrImage(UUID userId, byte[] bytes, String contentType) {
        String base64 = Base64.getEncoder().encodeToString(bytes);
        Map<String, Object> imagePart = new LinkedHashMap<>();
        imagePart.put("type", "image_url");
        imagePart.put("image_url", Map.of("url", "data:" + contentType + ";base64," + base64));
        Map<String, Object> textPart = new LinkedHashMap<>();
        textPart.put("type", "text");
        textPart.put("text", "Đọc toàn bộ chữ trong ảnh này:");
        AiProxyResult r = ai.chat(userId, "doc", List.of(
                        Map.of("role", "system", "content",
                                "Trích xuất toàn bộ văn bản trong ảnh tài liệu, giữ nguyên cấu trúc đoạn. Chỉ trả về văn bản, không thêm gì khác."),
                        Map.<String, Object>of("role", "user", "content", List.of(textPart, imagePart))),
                visionModel, 0.1);
        return r.content();
    }

    @SuppressWarnings("unchecked")
    private int insertNewWords(UUID userId, Object vocabObj) {
        if (!(vocabObj instanceof List<?> list)) {
            return 0;
        }
        int added = 0;
        for (Object o : list) {
            if (!(o instanceof Map<?, ?> m)) {
                continue;
            }
            Object wordObj = m.get("word");
            String w = wordObj == null ? "" : String.valueOf(wordObj).trim();
            if (w.isEmpty() || customWords.findByUserIdAndWordIgnoreCase(userId, w).isPresent()) {
                continue; // avoid duplicates
            }
            CustomWord cw = new CustomWord();
            cw.setUserId(userId);
            cw.setWord(w);
            cw.setArticle(str(m.get("article")));
            cw.setPlural(str(m.get("plural")));
            cw.setIpa(str(m.get("ipa")));
            cw.setPartOfSpeech(str(m.get("partOfSpeech")));
            cw.setMeaningVi(str(m.get("meaningVi")));
            // DB column definition_en now stores the German definition.
            cw.setDefinitionEn(firstNonBlank(m.get("definitionDe"), m.get("definitionEn")));
            // DB column example_en now stores the German example sentence.
            cw.setExampleEn(firstNonBlank(m.get("exampleDe"), m.get("exampleEn")));
            cw.setExampleVi(str(m.get("exampleVi")));
            cw.setTopic("Tài liệu");
            customWords.save(cw);
            added++;
        }
        return added;
    }

    // ==================================================================
    // 6.5 AI Tutor proxy
    // ==================================================================
    @Transactional
    public Map<String, Object> tutor(UUID userId, List<TutorMessage> messages) {
        if (messages == null || messages.isEmpty()) {
            throw ApiException.badRequest("Thiếu nội dung trò chuyện.");
        }
        List<Map<String, Object>> apiMessages = new ArrayList<>();
        apiMessages.add(Map.of("role", "system", "content",
                "Bạn là gia sư tiếng Đức thân thiện cho người Việt (trình độ A1–C2), "
                        + "trả lời bằng tiếng Việt (kèm ví dụ tiếng Đức khi cần). "
                        + "Giải thích ngắn gọn, đúng trọng tâm, phù hợp trình độ người học."));
        // Keep only the last 20 messages to bound cost.
        List<TutorMessage> recent = messages.size() > 20 ? messages.subList(messages.size() - 20, messages.size()) : messages;
        for (TutorMessage m : recent) {
            String role = "assistant".equals(m.role()) ? "assistant" : "user";
            apiMessages.add(Map.of("role", role, "content", m.content() == null ? "" : m.content()));
        }
        AiProxyResult r = ai.chat(userId, "tutor", apiMessages, ai.getDefaultModel(), 0.7);
        return Map.of("reply", r.content());
    }

    // ==================================================================
    // Helpers
    // ==================================================================
    private String saveFile(Path dir, String filename, byte[] bytes) {
        try {
            Files.createDirectories(dir);
            String safe = (filename == null || filename.isBlank() ? "file" : filename)
                    .replaceAll("[^a-zA-Z0-9._-]", "_");
            Path target = dir.resolve(UUID.randomUUID() + "_" + safe);
            Files.write(target, bytes);
            return target.toString();
        } catch (IOException e) {
            log.error("Failed to save upload", e);
            throw ApiException.serviceUnavailable("Không lưu được file tải lên. Vui lòng thử lại.");
        }
    }

    private Map<String, Object> parseJsonObject(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<>() {
            });
        } catch (JsonProcessingException e) {
            log.warn("Failed to parse AI JSON", e);
            throw ApiException.serviceUnavailable("AI trả về định dạng không hợp lệ. Vui lòng thử lại.");
        }
    }

    private static String str(Object o) {
        return o == null ? "" : String.valueOf(o);
    }

    /** First non-blank of the given values (used for definitionDe/exampleDe fallbacks). */
    private static String firstNonBlank(Object... values) {
        for (Object v : values) {
            String s = str(v).trim();
            if (!s.isEmpty()) {
                return s;
            }
        }
        return "";
    }
}
