package com.deutschtrainer.service;

import com.deutschtrainer.domain.Phrase;
import com.deutschtrainer.dto.SituationCount;
import com.deutschtrainer.repo.PhraseRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/** Everyday communication phrases: search and situation listing. */
@Service
public class PhraseService {

    private final PhraseRepository phrases;

    public PhraseService(PhraseRepository phrases) {
        this.phrases = phrases;
    }

    @Transactional(readOnly = true)
    public Page<Map<String, Object>> searchPhrases(String situation, String q, int page, int size) {
        String s = blankToNull(situation);
        String query = blankToNull(q);
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), Sort.by("id"));
        if (s == null && query == null) {
            return phrases.findAll(pageable).map(this::toPhraseMap);
        }
        return phrases.search(s, query, pageable)
                .map(this::toPhraseMap);
    }

    @Transactional(readOnly = true)
    public List<SituationCount> situations() {
        return phrases.countBySituation();
    }

    /**
     * App-facing phrase shape: {id, german, vietnamese, situation, level}.
     */
    private Map<String, Object> toPhraseMap(Phrase p) {
        Map<String, Object> m = new java.util.LinkedHashMap<>();
        m.put("id", p.getId().toString());
        m.put("german", p.getGerman());
        m.put("vietnamese", p.getVietnamese());
        m.put("situation", p.getSituation());
        m.put("level", strOrEmpty(p.getLevel()));
        return m;
    }

    private static String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }

    private static String strOrEmpty(String s) {
        return s == null ? "" : s;
    }
}
