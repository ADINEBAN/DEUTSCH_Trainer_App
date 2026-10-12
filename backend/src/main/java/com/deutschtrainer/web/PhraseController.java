package com.deutschtrainer.web;

import com.deutschtrainer.common.ApiResponse;
import com.deutschtrainer.common.PagedResult;
import com.deutschtrainer.dto.SituationCount;
import com.deutschtrainer.service.PhraseService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class PhraseController {

    private final PhraseService phraseService;

    public PhraseController(PhraseService phraseService) {
        this.phraseService = phraseService;
    }

    @GetMapping("/phrases/situations")
    public ApiResponse<List<SituationCount>> situations() {
        return ApiResponse.ok(phraseService.situations());
    }

    @GetMapping("/phrases")
    public ApiResponse<PagedResult<Map<String, Object>>> phrases(
            @RequestParam(required = false) String situation,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Page<Map<String, Object>> result = phraseService.searchPhrases(situation, q, page, size);
        return ApiResponse.ok(PagedResult.of(result));
    }
}
