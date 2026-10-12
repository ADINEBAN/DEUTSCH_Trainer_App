import type { GermanLevel, GermanModule } from '@/src/types';

// Goethe-style practice modules replacing TOEIC Part 1-7.
// UI labels stay Vietnamese; module names are German (as displayed to learners).
export interface ModuleMeta {
  key: GermanModule;
  name: string;
  desc: string;
  icon: string;
}

export const GERMAN_MODULES: ModuleMeta[] = [
  { key: 'WORTSCHATZ', name: 'Wortschatz', desc: 'Từ vựng theo chủ đề', icon: 'text-outline' },
  { key: 'GRAMMATIK', name: 'Grammatik', desc: 'Ngữ pháp & câu hỏi', icon: 'school-outline' },
  { key: 'LESEVERSTEHEN', name: 'Leseverstehen', desc: 'Đọc hiểu', icon: 'book-outline' },
  { key: 'HOERVERSTEHEN', name: 'Hörverstehen', desc: 'Nghe hiểu', icon: 'headset-outline' },
];

export function moduleName(module: GermanModule): string {
  return GERMAN_MODULES.find((m) => m.key === module)?.name ?? module;
}

export function moduleMeta(module: GermanModule): ModuleMeta | undefined {
  return GERMAN_MODULES.find((m) => m.key === module);
}

// CEFR levels offered by the German course, Beginner -> C2.
export const GERMAN_LEVELS: GermanLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export function levelName(level: string | null | undefined): string {
  if (!level) return '—';
  return GERMAN_LEVELS.includes(level as GermanLevel) ? level : level;
}
