package com.deutschtrainer.service;

import com.deutschtrainer.domain.TtsCache;
import com.deutschtrainer.repo.TtsCacheRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.web.client.RestClient;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TtsServiceTest {

    @Test
    void isConfigured_trueWhenApiKeyPresent() {
        TtsCacheRepository repo = mock(TtsCacheRepository.class);
        RestClient restClient = mock(RestClient.class);
        TtsService service = new TtsService(repo, restClient, "sk_test_key", "https://api.speechify.ai/v1/audio/speech", "simba-3.0", "amalia");

        assertTrue(service.isConfigured());
        assertEquals("simba-3.0", service.getModel());
    }

    @Test
    void isConfigured_falseWhenApiKeyBlank() {
        TtsCacheRepository repo = mock(TtsCacheRepository.class);
        RestClient restClient = mock(RestClient.class);
        TtsService service = new TtsService(repo, restClient, "   ", "https://api.speechify.ai/v1/audio/speech", "simba-3.0", "amalia");

        assertFalse(service.isConfigured());
    }

    @Test
    void synthesize_returnsFromCacheIfPresent() {
        TtsCacheRepository repo = mock(TtsCacheRepository.class);
        RestClient restClient = mock(RestClient.class);
        TtsService service = new TtsService(repo, restClient, "sk_test_key", "https://api.speechify.ai/v1/audio/speech", "simba-3.0", "amalia");

        byte[] fakeMp3 = new byte[]{1, 2, 3};
        TtsCache cached = new TtsCache();
        cached.setAudio(fakeMp3);
        cached.setChars(10);
        when(repo.findByTextHash(anyString())).thenReturn(Optional.of(cached));

        TtsService.TtsAudio result = service.synthesize("Guten Tag", "amalia");

        assertNotNull(result);
        assertTrue(result.fromCache());
        assertArrayEquals(fakeMp3, result.mp3());
        assertEquals(10, result.chars());
        verifyNoInteractions(restClient);
    }
}
