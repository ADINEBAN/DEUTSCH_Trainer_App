import { apiDownload, apiRequest } from '@/src/services/api.client';
import type {
  AiAvailability,
  DocAnalysis,
  HandsfreeAnswer,
  HandsfreeSession,
  PhotoWordResult,
  SemanticGraph,
  SemanticRelation,
  SpeakingAttempt,
  SpeakingResult,
  SpeakingSample,
} from '@/src/types';

export const aiService = {
  availability() {
    return apiRequest<AiAvailability>('/api/ai/availability');
  },

  // --- 6.1 Semantic word network (cached in word_relations by the backend) ---
  async semanticGraph(word: string): Promise<SemanticGraph> {
    const raw = await apiRequest<any>(`/api/ai/semantic?word=${encodeURIComponent(word)}`);
    const center = raw.center || {
      id: raw.word || word,
      word: raw.word || word,
      meaningVi: raw.meaningVi || '',
      ipa: raw.ipa || '',
      topic: raw.topic || 'Allgemein',
    };
    const relations: SemanticRelation[] = (raw.relations || []).map((r: any) => {
      let rel: SemanticRelation['relation'] = 'wordFamily';
      const rawRel = (r.relation || r.relationType || '').toLowerCase();
      if (rawRel.includes('synonym')) rel = 'synonym';
      else if (rawRel.includes('antonym')) rel = 'antonym';
      else if (rawRel.includes('collocation')) rel = 'collocation';
      else rel = 'wordFamily';
      return {
        word: r.word,
        wordId: r.wordId || r.relatedWordId,
        relation: rel,
        example: r.example || r.exampleDe || r.exampleEn || null,
      };
    });
    return {
      center,
      relations,
    };
  },

  saveSemanticWord(word: string) {
    return apiRequest<{ id: string }>('/api/ai/semantic/save', { method: 'POST', body: { word } });
  },

  // --- 6.2 Camera photo-to-name ---
  recognizePhoto(imageUri: string, fileName = 'photo.jpg') {
    const form = new FormData();
    form.append('image', {
      uri: imageUri,
      name: fileName,
      type: 'image/jpeg',
    } as unknown as Blob);
    return apiRequest<PhotoWordResult>('/api/ai/photo', {
      method: 'POST',
      body: form,
      multipart: true,
    });
  },

  savePhotoWord(payload: {
    germanName: string;
    ipa?: string;
    meaningVi: string;
    exampleDe?: string;
    imageUrl: string;
  }) {
    return apiRequest<{ id: string }>('/api/ai/photo/save', { method: 'POST', body: payload });
  },

  // --- 6.3 Docs upload -> analysis ---
  uploadDoc(fileUri: string, fileName: string, mimeType: string) {
    const form = new FormData();
    form.append('file', { uri: fileUri, name: fileName, type: mimeType } as unknown as Blob);
    return apiRequest<{ analysisId: string }>('/api/ai/docs/upload', {
      method: 'POST',
      body: form,
      multipart: true,
    });
  },

  docAnalysis(analysisId: string) {
    return apiRequest<DocAnalysis>(`/api/ai/docs/${analysisId}`);
  },

  docHistory() {
    return apiRequest<DocAnalysis[]>('/api/ai/docs/history');
  },

  // --- 6.4 Speaking coach ---
  speakingSamples() {
    return apiRequest<SpeakingSample[]>('/api/ai/speaking/samples');
  },

  scoreSpeaking(audioUri: string, sampleId: string) {
    const form = new FormData();
    form.append('audio', {
      uri: audioUri,
      name: 'speaking.m4a',
      type: 'audio/m4a',
    } as unknown as Blob);
    form.append('sampleId', sampleId);
    return apiRequest<SpeakingResult>('/api/ai/speaking/score', {
      method: 'POST',
      body: form,
      multipart: true,
    });
  },

  speakingHistory() {
    return apiRequest<SpeakingAttempt[]>('/api/ai/speaking/history');
  },

  // --- 6.5 Hands-free voice learning ---
  startHandsfree(count = 10) {
    return apiRequest<HandsfreeSession>('/api/ai/handsfree/session', {
      method: 'POST',
      body: { count },
    });
  },

  answerHandsfree(sessionId: string, itemId: string, audioUri: string) {
    const form = new FormData();
    form.append('audio', {
      uri: audioUri,
      name: 'answer.m4a',
      type: 'audio/m4a',
    } as unknown as Blob);
    form.append('sessionId', sessionId);
    form.append('itemId', itemId);
    return apiRequest<HandsfreeAnswer>('/api/ai/handsfree/answer', {
      method: 'POST',
      body: form,
      multipart: true,
    });
  },

  // TTS bytes from backend proxy: GET /api/tts?text=...[&voice=...]
  // When `voice` is omitted the backend picks its default German voice.
  ttsAudio(text: string, voice?: string) {
    const query = new URLSearchParams({ text });
    if (voice) query.set('voice', voice);
    return apiDownload(`/api/tts?${query.toString()}`);
  },
};
