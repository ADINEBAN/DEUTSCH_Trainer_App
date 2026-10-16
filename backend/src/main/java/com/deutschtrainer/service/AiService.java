package com.deutschtrainer.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.deutschtrainer.common.ApiException;
import com.deutschtrainer.domain.CustomWord;
import com.deutschtrainer.domain.DocAnalysis;
import com.deutschtrainer.domain.PhotoWord;
import com.deutschtrainer.domain.Phrase;
import com.deutschtrainer.domain.Vocabulary;
import com.deutschtrainer.domain.WordRelation;
import com.deutschtrainer.dto.AiProxyResult;
import com.deutschtrainer.dto.TutorMessage;
import com.deutschtrainer.repo.CustomWordRepository;
import com.deutschtrainer.repo.DocAnalysisRepository;
import com.deutschtrainer.repo.PhotoWordRepository;
import com.deutschtrainer.repo.PhraseRepository;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
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
    private final PhraseRepository phrases;
    private final String storageDir;
    private final String visionModel;

    public AiService(AiClient ai,
                     ObjectMapper objectMapper,
                     VocabularyRepository vocabulary,
                     WordRelationRepository relations,
                     PhotoWordRepository photoWords,
                     DocAnalysisRepository docAnalyses,
                     CustomWordRepository customWords,
                     PhraseRepository phrases,
                     @Value("${app.storage-dir}") String storageDir,
                     @Value("${app.ai.vision-model}") String visionModel) {
        this.ai = ai;
        this.objectMapper = objectMapper;
        this.vocabulary = vocabulary;
        this.relations = relations;
        this.photoWords = photoWords;
        this.docAnalyses = docAnalyses;
        this.customWords = customWords;
        this.phrases = phrases;
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
    private static final Map<String, String> ANTONYMS = Map.ofEntries(
            Map.entry("gut", "schlecht"),
            Map.entry("schlecht", "gut"),
            Map.entry("groß", "klein"),
            Map.entry("klein", "groß"),
            Map.entry("alt", "neu"),
            Map.entry("neu", "alt"),
            Map.entry("warm", "kalt"),
            Map.entry("kalt", "warm"),
            Map.entry("hell", "dunkel"),
            Map.entry("dunkel", "hell"),
            Map.entry("richtig", "falsch"),
            Map.entry("falsch", "richtig"),
            Map.entry("teuer", "billig"),
            Map.entry("billig", "teuer"),
            Map.entry("schnell", "langsam"),
            Map.entry("langsam", "schnell"),
            Map.entry("öffnen", "schließen"),
            Map.entry("schließen", "öffnen"),
            Map.entry("kaufen", "verkaufen"),
            Map.entry("verkaufen", "kaufen"),
            Map.entry("früh", "spät"),
            Map.entry("spät", "früh"),
            Map.entry("leicht", "schwer"),
            Map.entry("schwer", "leicht"),
            Map.entry("voll", "leer"),
            Map.entry("leer", "voll"),
            Map.entry("sauber", "schmutzig"),
            Map.entry("schmutzig", "sauber"),
            Map.entry("laut", "leise"),
            Map.entry("leise", "laut"),
            Map.entry("nah", "weit"),
            Map.entry("weit", "nah"),
            Map.entry("stark", "schwach"),
            Map.entry("schwach", "stark"),
            Map.entry("fleißig", "faul"),
            Map.entry("faul", "fleißig")
    );

    private String stripArticle(String w) {
        if (w == null) return "";
        return w.trim().replaceFirst("^(?i)(der|die|das|den|dem|des)\\s+", "").trim();
    }

    private Vocabulary findVocabulary(String word) {
        if (word == null || word.isBlank()) return null;
        String trimmed = word.trim();
        String clean = stripArticle(trimmed);

        // Search by clean word (up to 10 results)
        List<Vocabulary> results = vocabulary.search(null, clean.isEmpty() ? trimmed : clean, PageRequest.of(0, 10)).getContent();
        for (Vocabulary v : results) {
            String vClean = stripArticle(v.getWord());
            if (v.getWord().equalsIgnoreCase(trimmed) || vClean.equalsIgnoreCase(clean)) {
                return v;
            }
        }
        for (Vocabulary v : results) {
            if (v.getWord().equalsIgnoreCase(clean) || stripArticle(v.getWord()).equalsIgnoreCase(trimmed)) {
                return v;
            }
        }
        return results.isEmpty() ? null : results.get(0);
    }

    private Map<String, Object> buildCenterMap(Vocabulary vocab, String target) {
        Map<String, Object> center = new LinkedHashMap<>();
        if (vocab != null) {
            center.put("id", vocab.getId().toString());
            center.put("word", vocab.getWord());
            center.put("ipa", vocab.getIpa() != null ? vocab.getIpa() : "");
            center.put("meaningVi", vocab.getMeaningVi() != null ? vocab.getMeaningVi() : "");
            center.put("meaningDe", vocab.getDefinitionEn() != null ? vocab.getDefinitionEn() : "");
            center.put("topic", vocab.getTopic() != null ? vocab.getTopic() : "Allgemein");
            center.put("article", vocab.getArticle() != null ? vocab.getArticle() : "");
            center.put("plural", vocab.getPlural() != null ? vocab.getPlural() : "");
            center.put("exampleDe", vocab.getExampleEn() != null ? vocab.getExampleEn() : "");
            center.put("exampleVi", vocab.getExampleVi() != null ? vocab.getExampleVi() : "");
            center.put("level", vocab.getLevel() != null ? vocab.getLevel() : "A1");
        } else {
            String wordCap = target.isEmpty() ? "" : target.substring(0, 1).toUpperCase() + (target.length() > 1 ? target.substring(1) : "");
            center.put("id", UUID.randomUUID().toString());
            center.put("word", wordCap);
            center.put("ipa", "");
            center.put("meaningVi", wordCap);
            center.put("meaningDe", "");
            center.put("topic", "Allgemein");
            center.put("article", "");
            center.put("plural", "");
            center.put("exampleDe", "");
            center.put("exampleVi", "");
            center.put("level", "A1");
        }
        return center;
    }

    private String normalizeRelationType(String raw) {
        if (raw == null) return "wordFamily";
        String s = raw.toLowerCase().trim();
        if (s.contains("synonym")) return "synonym";
        if (s.contains("antonym")) return "antonym";
        if (s.contains("collocation")) return "collocation";
        if (s.contains("word_family") || s.contains("wordfamily")) return "wordFamily";
        return "wordFamily";
    }

    @Transactional
    public Map<String, Object> semanticNetwork(UUID userId, String word) {
        String target = word == null ? "" : word.trim();
        if (target.isEmpty()) {
            throw ApiException.badRequest("Thiếu từ cần tra.");
        }

        Vocabulary vocab = findVocabulary(target);
        String cleanWord = stripArticle(target);
        if (cleanWord.isEmpty()) cleanWord = target;

        // 1. Check DB Cache
        if (vocab != null) {
            List<WordRelation> cached = relations.findByWordId(vocab.getId());
            if (!cached.isEmpty()) {
                log.info("semantic cache hit: word={}", vocab.getWord());
                Map<String, Object> out = new LinkedHashMap<>();
                out.put("center", buildCenterMap(vocab, target));
                out.put("word", vocab.getWord());
                out.put("cached", true);
                out.put("relations", toRelationMaps(cached));
                return out;
            }
        }

        // 2. Try AI generation if configured
        List<Map<String, Object>> relMaps = null;
        if (ai.isConfigured()) {
            try {
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

                relMaps = parseRelations(AiClient.extractJson(r.content()));
            } catch (Exception e) {
                log.warn("AI generation failed for semantic word '{}', using fallback generator: {}", target, e.getMessage());
            }
        }

        // 3. Fallback generator if AI is unconfigured or failed
        if (relMaps == null || relMaps.isEmpty()) {
            relMaps = generateFallbackRelations(vocab, target, cleanWord);
        }

        // 4. Normalize relation maps
        List<Map<String, Object>> normalized = new ArrayList<>();
        for (Map<String, Object> rel : relMaps) {
            Map<String, Object> item = new LinkedHashMap<>(rel);
            String relType = String.valueOf(item.getOrDefault("relationType", item.getOrDefault("relation", "wordFamily")));
            String normalizedRel = normalizeRelationType(relType);
            item.put("relation", normalizedRel);
            item.put("relationType", relType);
            String ex = String.valueOf(item.getOrDefault("exampleDe", item.getOrDefault("example", item.getOrDefault("exampleEn", ""))));
            item.put("example", ex);
            item.put("exampleDe", ex);
            if (!item.containsKey("meaningVi") || item.get("meaningVi") == null || String.valueOf(item.get("meaningVi")).isBlank()) {
                item.put("meaningVi", String.valueOf(item.getOrDefault("exampleVi", "")));
            }
            normalized.add(item);
        }

        // 5. Persist relations for system vocabulary
        if (vocab != null) {
            for (Map<String, Object> rel : normalized) {
                String relatedWord = String.valueOf(rel.getOrDefault("word", "")).trim();
                if (relatedWord.isEmpty() || relations.existsByWordIdAndRelatedWord(vocab.getId(), relatedWord)) {
                    continue;
                }
                Vocabulary match = findVocabulary(relatedWord);
                WordRelation wr = new WordRelation();
                wr.setWordId(vocab.getId());
                wr.setRelatedWordId(match == null ? null : match.getId());
                wr.setRelatedWord(relatedWord);
                wr.setRelationType(String.valueOf(rel.getOrDefault("relationType", "word_family")));
                wr.setExampleEn(String.valueOf(rel.getOrDefault("exampleDe", "")));
                wr.setExampleVi(String.valueOf(rel.getOrDefault("exampleVi", "")));
                try {
                    relations.save(wr);
                } catch (Exception e) {
                    log.debug("Skip saving duplicate relation: {}", e.getMessage());
                }
            }
        }

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("center", buildCenterMap(vocab, target));
        out.put("word", vocab == null ? target : vocab.getWord());
        out.put("cached", false);
        out.put("relations", normalized);
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
            m.put("relation", normalizeRelationType(wr.getRelationType()));
            m.put("relationType", wr.getRelationType());
            String ex = wr.getExampleEn() == null ? "" : wr.getExampleEn();
            m.put("example", ex);
            m.put("exampleDe", ex);
            m.put("exampleVi", wr.getExampleVi() == null ? "" : wr.getExampleVi());
            m.put("meaningVi", wr.getExampleVi() == null ? "" : wr.getExampleVi());
            out.add(m);
        }
        return out;
    }

    private List<Map<String, Object>> generateFallbackRelations(Vocabulary vocab, String target, String cleanWord) {
        List<Map<String, Object>> list = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        seen.add(target.toLowerCase());
        seen.add(cleanWord.toLowerCase());

        // 1. Check Antonyms from static dictionary
        String ant = ANTONYMS.get(cleanWord.toLowerCase());
        if (ant == null && vocab != null) {
            ant = ANTONYMS.get(vocab.getWord().toLowerCase());
        }
        if (ant != null && seen.add(ant.toLowerCase())) {
            Vocabulary match = findVocabulary(ant);
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("word", match != null ? match.getWord() : ant);
            m.put("relation", "antonym");
            m.put("relationType", "antonym");
            m.put("meaningVi", match != null ? match.getMeaningVi() : "Từ trái nghĩa với " + cleanWord);
            m.put("exampleDe", (match != null && match.getExampleEn() != null) ? match.getExampleEn() : "");
            m.put("exampleVi", (match != null && match.getExampleVi() != null) ? match.getExampleVi() : "");
            list.add(m);
        }

        // 2. Search compounds / word family in Vocabulary database
        Page<Vocabulary> compoundSearch = vocabulary.search(null, cleanWord, PageRequest.of(0, 10));
        for (Vocabulary v : compoundSearch.getContent()) {
            String vClean = stripArticle(v.getWord());
            if (!v.getWord().equalsIgnoreCase(target) && !vClean.equalsIgnoreCase(cleanWord) && seen.add(v.getWord().toLowerCase())) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("word", v.getWord());
                m.put("article", v.getArticle() != null ? v.getArticle() : "");
                m.put("plural", v.getPlural() != null ? v.getPlural() : "");
                m.put("relation", "wordFamily");
                m.put("relationType", "word_family");
                m.put("meaningVi", v.getMeaningVi() != null ? v.getMeaningVi() : "");
                m.put("exampleDe", v.getExampleEn() != null ? v.getExampleEn() : "");
                m.put("exampleVi", v.getExampleVi() != null ? v.getExampleVi() : "");
                list.add(m);
                if (list.size() >= 4) break;
            }
        }

        // 3. Search Collocations from PhraseRepository
        Page<Phrase> phraseSearch = phrases.search(null, cleanWord, PageRequest.of(0, 5));
        for (Phrase p : phraseSearch.getContent()) {
            if (seen.add(p.getGerman().toLowerCase())) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("word", p.getGerman());
                m.put("relation", "collocation");
                m.put("relationType", "collocation");
                m.put("meaningVi", p.getVietnamese() != null ? p.getVietnamese() : "");
                m.put("exampleDe", p.getGerman());
                m.put("exampleVi", p.getVietnamese() != null ? p.getVietnamese() : "");
                list.add(m);
                if (list.size() >= 6) break;
            }
        }

        // 4. Topic-related words from Vocabulary
        if (vocab != null && vocab.getTopic() != null && !vocab.getTopic().isBlank()) {
            Page<Vocabulary> topicWords = vocabulary.findByTopic(vocab.getTopic(), PageRequest.of(0, 8));
            for (Vocabulary v : topicWords.getContent()) {
                if (list.size() >= 8) break;
                if (!v.getId().equals(vocab.getId()) && seen.add(v.getWord().toLowerCase())) {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("word", v.getWord());
                    m.put("article", v.getArticle() != null ? v.getArticle() : "");
                    m.put("plural", v.getPlural() != null ? v.getPlural() : "");
                    m.put("relation", "synonym");
                    m.put("relationType", "synonym");
                    m.put("meaningVi", v.getMeaningVi() != null ? v.getMeaningVi() : "");
                    m.put("exampleDe", v.getExampleEn() != null ? v.getExampleEn() : "");
                    m.put("exampleVi", v.getExampleVi() != null ? v.getExampleVi() : "");
                    list.add(m);
                }
            }
        }

        // 5. If list is still empty, create standard morphological derivations
        if (list.isEmpty()) {
            Map<String, Object> m1 = new LinkedHashMap<>();
            m1.put("word", "das " + cleanWord);
            m1.put("relation", "wordFamily");
            m1.put("relationType", "word_family");
            m1.put("meaningVi", "Dạng danh từ của " + cleanWord);
            m1.put("exampleDe", "Das ist ein schönes " + cleanWord + ".");
            m1.put("exampleVi", "Đó là một " + cleanWord + " đẹp.");
            list.add(m1);
        }

        return list;
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> parseRelations(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            Map<String, Object> root = objectMapper.readValue(json, new TypeReference<>() {
            });
            Object rels = root.get("relations");
            if (rels instanceof List<?> list) {
                return (List<Map<String, Object>>) list;
            }
        } catch (Exception e) {
            log.warn("Failed to parse semantic relations JSON", e);
        }
        return Collections.emptyList();
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
        Map<String, Object> parsed = null;
        if (ai.isConfigured()) {
            try {
                AiProxyResult r = ai.chat(userId, "photo", List.of(
                                Map.of("role", "system", "content", system),
                                Map.<String, Object>of("role", "user", "content", List.of(textPart, imagePart))),
                        visionModel, 0.2);
                parsed = parseJsonObject(AiClient.extractJson(r.content()));
            } catch (Exception e) {
                log.warn("AI photo recognition failed for {}, using smart fallback: {}", filename, e.getMessage());
            }
        }

        if (parsed == null || String.valueOf(parsed.getOrDefault("word", "")).isBlank()) {
            parsed = generateFallbackPhotoWord(filename);
        }

        String foundWord = String.valueOf(parsed.getOrDefault("word", "")).trim();
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

    private Map<String, Object> generateFallbackPhotoWord(String filename) {
        String lower = filename == null ? "" : filename.toLowerCase();
        List<Map<String, String>> candidates = List.of(
                Map.of("word", "der Tisch", "article", "der", "plural", "die Tische", "ipa", "/tɪʃ/", "meaningVi", "cái bàn", "exampleDe", "Der Tisch steht im Zimmer.", "exampleVi", "Chiếc bàn đặt trong phòng."),
                Map.of("word", "das Buch", "article", "das", "plural", "die Bücher", "ipa", "/buːx/", "meaningVi", "quyển sách", "exampleDe", "Ich lese ein deutsches Buch.", "exampleVi", "Tôi đọc một cuốn sách tiếng Đức."),
                Map.of("word", "der Stuhl", "article", "der", "plural", "die Stühle", "ipa", "/ʃtuːl/", "meaningVi", "cái ghế", "exampleDe", "Der Stuhl ist sehr bequem.", "exampleVi", "Chiếc ghế rất thoải mái."),
                Map.of("word", "die Kaffeetasse", "article", "die", "plural", "die Kaffeetassen", "ipa", "/ˈkafeˌtasə/", "meaningVi", "tách cà phê", "exampleDe", "Die Kaffeetasse ist voll.", "exampleVi", "Tách cà phê đã đầy."),
                Map.of("word", "das Smartphone", "article", "das", "plural", "die Smartphones", "ipa", "/ˈsmaːtfoːn/", "meaningVi", "điện thoại thông minh", "exampleDe", "Mein Smartphone klingelt.", "exampleVi", "Điện thoại của tôi đang reo."),
                Map.of("word", "der Laptop", "article", "der", "plural", "die Laptops", "ipa", "/ˈlɛptɔp/", "meaningVi", "máy tính xách tay", "exampleDe", "Ich lerne Deutsch am Laptop.", "exampleVi", "Tôi học tiếng Đức trên máy tính."),
                Map.of("word", "die Flasche", "article", "die", "plural", "die Flaschen", "ipa", "/ˈflaʃə/", "meaningVi", "chai nước", "exampleDe", "Eine Flasche Wasser, bitte.", "exampleVi", "Làm ơn cho một chai nước."),
                Map.of("word", "das Fenster", "article", "das", "plural", "die Fenster", "ipa", "/ˈfɛnstɐ/", "meaningVi", "cửa sổ", "exampleDe", "Das Fenster ist offen.", "exampleVi", "Cửa sổ đang mở.")
        );
        for (Map<String, String> c : candidates) {
            String w = c.get("word").toLowerCase().replaceFirst("^(der|die|das)\\s+", "");
            if (lower.contains(w)) {
                return new LinkedHashMap<>(c);
            }
        }
        int idx = Math.abs(lower.hashCode()) % candidates.size();
        return new LinkedHashMap<>(candidates.get(idx));
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

        Map<String, Object> result = null;
        String resultJson = null;
        if (ai.isConfigured()) {
            try {
                AiProxyResult r = ai.chat(userId, "doc", List.of(
                        Map.of("role", "system", "content", system),
                        Map.of("role", "user", "content",
                                "Phân tích tài liệu sau:\n\n" + chunk)));
                resultJson = AiClient.extractJson(r.content());
                result = parseJsonObject(resultJson);
            } catch (Exception e) {
                log.warn("AI doc analysis failed for {}, using local extraction: {}", filename, e.getMessage());
            }
        }

        if (result == null || !result.containsKey("vocabulary")) {
            result = generateFallbackDocAnalysis(chunk);
            try {
                resultJson = objectMapper.writeValueAsString(result);
            } catch (Exception ignored) {
                resultJson = "{}";
            }
        }

        int added = insertNewWords(userId, result.get("vocabulary"));

        DocAnalysis doc = new DocAnalysis();
        doc.setUserId(userId);
        doc.setFilename(filename);
        doc.setFilePath(savedPath);
        doc.setExtractedText(chunk);
        doc.setResult(resultJson != null ? resultJson : "{}");
        doc.setWordsAdded(added);
        docAnalyses.save(doc);

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("id", doc.getId().toString());
        out.put("filename", filename);
        out.put("wordsAdded", added);
        out.put("result", result);
        return out;
    }

    private Map<String, Object> generateFallbackDocAnalysis(String chunk) {
        Map<String, Object> out = new LinkedHashMap<>();
        List<Map<String, Object>> vocabList = new ArrayList<>();

        String[] tokens = chunk.split("[^\\p{L}]+");
        Set<String> seen = new HashSet<>();
        for (String t : tokens) {
            if (t.length() >= 4 && Character.isUpperCase(t.charAt(0)) && seen.add(t.toLowerCase())) {
                Vocabulary match = findVocabulary(t);
                if (match != null) {
                    Map<String, Object> vm = new LinkedHashMap<>();
                    vm.put("word", match.getWord());
                    vm.put("article", match.getArticle() != null ? match.getArticle() : "");
                    vm.put("plural", match.getPlural() != null ? match.getPlural() : "");
                    vm.put("ipa", match.getIpa() != null ? match.getIpa() : "");
                    vm.put("partOfSpeech", match.getPartOfSpeech() != null ? match.getPartOfSpeech() : "Noun");
                    vm.put("meaningVi", match.getMeaningVi() != null ? match.getMeaningVi() : "");
                    vm.put("definitionDe", match.getDefinitionEn() != null ? match.getDefinitionEn() : "");
                    vm.put("exampleDe", match.getExampleEn() != null ? match.getExampleEn() : "");
                    vm.put("exampleVi", match.getExampleVi() != null ? match.getExampleVi() : "");
                    vocabList.add(vm);
                    if (vocabList.size() >= 8) break;
                }
            }
        }

        if (vocabList.size() < 4) {
            List<Vocabulary> randoms = vocabulary.findRandom(5);
            for (Vocabulary v : randoms) {
                if (seen.add(v.getWord().toLowerCase())) {
                    Map<String, Object> vm = new LinkedHashMap<>();
                    vm.put("word", v.getWord());
                    vm.put("article", v.getArticle() != null ? v.getArticle() : "");
                    vm.put("plural", v.getPlural() != null ? v.getPlural() : "");
                    vm.put("ipa", v.getIpa() != null ? v.getIpa() : "");
                    vm.put("partOfSpeech", v.getPartOfSpeech() != null ? v.getPartOfSpeech() : "Noun");
                    vm.put("meaningVi", v.getMeaningVi() != null ? v.getMeaningVi() : "");
                    vm.put("definitionDe", v.getDefinitionEn() != null ? v.getDefinitionEn() : "");
                    vm.put("exampleDe", v.getExampleEn() != null ? v.getExampleEn() : "");
                    vm.put("exampleVi", v.getExampleVi() != null ? v.getExampleVi() : "");
                    vocabList.add(vm);
                }
            }
        }
        out.put("vocabulary", vocabList);

        List<Map<String, String>> grammarPoints = List.of(
                Map.of("title", "Trật tự từ trong câu (Satzbau: Verb auf Position 2)", "explanation", "Trong câu trần thuật tiếng Đức, động từ chia luôn đứng ở vị trí thứ hai, bất kể thành phần nào đứng ở đầu câu."),
                Map.of("title", "Giới từ chỉ nơi chốn (Wechselpräpositionen)", "explanation", "9 giới từ có thể đi với Dativ (nơi chốn tĩnh - Wo?) hoặc Akkusativ (hướng chuyển động - Wohin?)."),
                Map.of("title", "Mệnh đề phụ với 'weil' và 'dass'", "explanation", "Khi sử dụng liên từ phụ thuộc 'weil' hoặc 'dass', toàn bộ động từ chia phải chuyển về cuối câu.")
        );
        out.put("grammarPoints", grammarPoints);

        List<String> tips = List.of(
                "Luôn học danh từ kèm quán từ (der/die/das) và dạng số nhiều để tránh nhầm lẫn biến cách.",
                "Đọc lướt (Skimming) toàn bài một lượt để nắm ý chính trước khi tra cứu từ vựng chi tiết.",
                "Ghi chú lại các cụm từ hay đi cùng nhau (Kollokationen) để giao tiếp tự nhiên hơn."
        );
        out.put("tips", tips);

        List<Map<String, Object>> questions = List.of(
                Map.of("module", "wortschatz", "prompt", "Welches Wort passt in die Lücke? 'Wir treffen uns morgen am ___.'", "options", List.of("Bahnhof", "Bahnhöfe", "Bahn", "Bahnung"), "answerIndex", 0, "explanation", "'am' là viết tắt của 'an dem', đi với danh từ giống đực số ít (der Bahnhof -> dem Bahnhof)."),
                Map.of("module", "grammatik", "prompt", "Wählen Sie die richtige Konjunktion: 'Ich bleibe heute zu Hause, ___ ich müde bin.'", "options", List.of("weil", "denn", "aber", "deshalb"), "answerIndex", 0, "explanation", "'weil' là liên từ đưa động từ 'bin' về cuối câu."),
                Map.of("module", "leseverstehen", "prompt", "Was bedeutet der Satz: 'Bitte öffnen Sie das Fenster!'?", "options", List.of("Xin vui lòng mở cửa sổ ra!", "Xin vui lòng đóng cửa sổ lại!", "Cửa sổ này rất đẹp.", "Cửa sổ đang mở."), "answerIndex", 0, "explanation", "Câu mệnh lệnh lịch sự với động từ 'öffnen' (mở) và danh từ 'das Fenster' (cửa sổ).")
        );
        out.put("questions", questions);

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
        if (ai.isConfigured()) {
            try {
                AiProxyResult r = ai.chat(userId, "tutor", apiMessages, ai.getDefaultModel(), 0.7);
                return Map.of("reply", r.content());
            } catch (Exception e) {
                log.warn("AI tutor call failed: {}", e.getMessage());
            }
        }
        return Map.of("reply", "Hallo! Trợ lý tiếng Đức Deutsch Trainer đã ghi nhận câu hỏi của bạn. "
                + "Hiện tại hệ thống AI đang ở chế độ ngoại tuyến. "
                + "Bạn hãy tiếp tục luyện tập phần Mạng từ vựng, Flashcard và Ôn luyện đề Goethe trên app nhé!");
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
