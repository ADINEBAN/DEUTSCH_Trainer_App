import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '@/src/services/api.client';
import type { Page } from '@/src/types';

// Mirror of the Spring Boot phrase contract (see PhraseController):
//   GET /api/phrases/situations        -> [{ situation, count }]
//   GET /api/phrases?situation=&q=&page=&size= -> Page<{ id, german, vietnamese, situation, level }>

export interface Phrase {
  id: string;
  german: string;
  vietnamese: string;
  situation: string;
  level?: string | null;
}

export interface PhraseSituation {
  situation: string;
  count: number;
}

// Local meta (Vietnamese name, German name, Ionicons name) for known situation
// slugs. Unknown slugs still render through the fallback in getSituationMeta().

export interface SituationMeta {
  nameVi: string;
  nameDe: string;
  icon: string;
}

const SITUATION_META: Record<string, SituationMeta> = {
  begruessung: { nameVi: 'Chào hỏi', nameDe: 'Begrüßung', icon: 'hand-left-outline' },
  vorstellung: { nameVi: 'Giới thiệu bản thân', nameDe: 'Sich vorstellen', icon: 'person-add-outline' },
  smalltalk: { nameVi: 'Chuyện phiếm', nameDe: 'Small Talk', icon: 'chatbubbles-outline' },
  verabschiedung: { nameVi: 'Tạm biệt', nameDe: 'Abschied', icon: 'flag-outline' },
  dank: { nameVi: 'Cảm ơn', nameDe: 'Danke sagen', icon: 'thumbs-up-outline' },
  entschuldigung: { nameVi: 'Xin lỗi', nameDe: 'Entschuldigung', icon: 'sad-outline' },
  bitte: { nameVi: 'Nhờ vả', nameDe: 'Um etwas bitten', icon: 'hand-right-outline' },
  meinung: { nameVi: 'Bày tỏ ý kiến', nameDe: 'Meinung sagen', icon: 'bulb-outline' },
  einladung: { nameVi: 'Lời mời', nameDe: 'Einladung', icon: 'mail-open-outline' },
  termin: { nameVi: 'Hẹn gặp', nameDe: 'Termin vereinbaren', icon: 'calendar-outline' },
  restaurant: { nameVi: 'Nhà hàng', nameDe: 'Im Restaurant', icon: 'restaurant-outline' },
  cafe: { nameVi: 'Quán cà phê', nameDe: 'Im Café', icon: 'cafe-outline' },
  bestellen: { nameVi: 'Gọi món', nameDe: 'Bestellen', icon: 'receipt-outline' },
  zahlen: { nameVi: 'Thanh toán', nameDe: 'Bezahlen', icon: 'card-outline' },
  einkaufen: { nameVi: 'Mua sắm', nameDe: 'Einkaufen', icon: 'cart-outline' },
  supermarkt: { nameVi: 'Siêu thị', nameDe: 'Im Supermarkt', icon: 'basket-outline' },
  kleidung: { nameVi: 'Mua quần áo', nameDe: 'Kleidung kaufen', icon: 'shirt-outline' },
  hotel: { nameVi: 'Khách sạn', nameDe: 'Im Hotel', icon: 'bed-outline' },
  rezeption: { nameVi: 'Lễ tân', nameDe: 'An der Rezeption', icon: 'business-outline' },
  flughafen: { nameVi: 'Sân bay', nameDe: 'Am Flughafen', icon: 'airplane-outline' },
  bahnhof: { nameVi: 'Ga tàu', nameDe: 'Am Bahnhof', icon: 'train-outline' },
  taxi: { nameVi: 'Taxi', nameDe: 'Taxi', icon: 'car-outline' },
  bus: { nameVi: 'Xe buýt & tàu', nameDe: 'Bus & Bahn', icon: 'bus-outline' },
  weg: { nameVi: 'Hỏi đường', nameDe: 'Nach dem Weg fragen', icon: 'map-outline' },
  arzt: { nameVi: 'Bác sĩ', nameDe: 'Beim Arzt', icon: 'medkit-outline' },
  apotheke: { nameVi: 'Hiệu thuốc', nameDe: 'In der Apotheke', icon: 'bandage-outline' },
  krankenhaus: { nameVi: 'Bệnh viện', nameDe: 'Im Krankenhaus', icon: 'heart-circle-outline' },
  zahnarzt: { nameVi: 'Nha sĩ', nameDe: 'Beim Zahnarzt', icon: 'medical-outline' },
  notfall: { nameVi: 'Khẩn cấp', nameDe: 'Notfall', icon: 'warning-outline' },
  polizei: { nameVi: 'Cảnh sát', nameDe: 'Bei der Polizei', icon: 'shield-outline' },
  bank: { nameVi: 'Ngân hàng', nameDe: 'In der Bank', icon: 'cash-outline' },
  post: { nameVi: 'Bưu điện', nameDe: 'Bei der Post', icon: 'mail-outline' },
  telefon: { nameVi: 'Gọi điện thoại', nameDe: 'Telefonieren', icon: 'call-outline' },
  internet: { nameVi: 'Internet & Wi-Fi', nameDe: 'Internet & WLAN', icon: 'wifi-outline' },
  arbeit: { nameVi: 'Công việc', nameDe: 'Bei der Arbeit', icon: 'briefcase-outline' },
  bewerbung: { nameVi: 'Xin việc', nameDe: 'Bewerbung', icon: 'document-text-outline' },
  uni: { nameVi: 'Đại học', nameDe: 'An der Uni', icon: 'school-outline' },
  wetter: { nameVi: 'Thời tiết', nameDe: 'Wetter', icon: 'partly-sunny-outline' },
  freizeit: { nameVi: 'Thời gian rảnh', nameDe: 'Freizeit', icon: 'happy-outline' },
  sport: { nameVi: 'Thể thao', nameDe: 'Sport', icon: 'fitness-outline' },
  kino: { nameVi: 'Rạp chiếu phim', nameDe: 'Im Kino', icon: 'film-outline' },
  konzert: { nameVi: 'Hòa nhạc', nameDe: 'Konzert', icon: 'musical-notes-outline' },
  urlaub: { nameVi: 'Kỳ nghỉ', nameDe: 'Urlaub', icon: 'sunny-outline' },
  wohnung: { nameVi: 'Tìm nhà', nameDe: 'Wohnungssuche', icon: 'home-outline' },
  umzug: { nameVi: 'Chuyển nhà', nameDe: 'Umzug', icon: 'cube-outline' },
  nachbarn: { nameVi: 'Hàng xóm', nameDe: 'Nachbarschaft', icon: 'people-circle-outline' },
  feier: { nameVi: 'Tiệc tùng', nameDe: 'Feiern', icon: 'sparkles-outline' },
  geburtstag: { nameVi: 'Sinh nhật', nameDe: 'Geburtstag', icon: 'gift-outline' },
  hochzeit: { nameVi: 'Đám cưới', nameDe: 'Hochzeit', icon: 'heart-outline' },
  familie: { nameVi: 'Gia đình', nameDe: 'Familie', icon: 'people-outline' },
  auto: { nameVi: 'Ô tô', nameDe: 'Auto', icon: 'key-outline' },
  friseur: { nameVi: 'Tiệm cắt tóc', nameDe: 'Beim Friseur', icon: 'cut-outline' },
  behoerde: { nameVi: 'Cơ quan hành chính', nameDe: 'Bei der Behörde', icon: 'business-outline' },
  'bitte-danke': { nameVi: 'Nhờ vả & cảm ơn', nameDe: 'Bitte & Danke', icon: 'thumbs-up-outline' },
  email: { nameVi: 'Viết email', nameDe: 'E-Mails schreiben', icon: 'mail-outline' },
  freunde: { nameVi: 'Bạn bè', nameDe: 'Freunde', icon: 'people-outline' },
  feilschen: { nameVi: 'Mặc cả', nameDe: 'Feilschen', icon: 'pricetag-outline' },
  haustiere: { nameVi: 'Thú cưng', nameDe: 'Haustiere', icon: 'paw-outline' },
  komplimente: { nameVi: 'Khen ngợi', nameDe: 'Komplimente', icon: 'heart-outline' },
  nahverkehr: { nameVi: 'Taxi & xe công cộng', nameDe: 'Taxi, Bus & Bahn', icon: 'car-outline' },
  'online-shopping': { nameVi: 'Mua sắm online', nameDe: 'Online-Shopping', icon: 'globe-outline' },
  reisen: { nameVi: 'Du lịch', nameDe: 'Reisen', icon: 'airplane-outline' },
  reklamation: { nameVi: 'Khiếu nại', nameDe: 'Reklamation', icon: 'alert-circle-outline' },
  'schule-uni': { nameVi: 'Trường học', nameDe: 'Schule & Uni', icon: 'school-outline' },
};

function formatSlug(slug: string): string {
  return slug
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
}

/** Meta for a situation slug; falls back gracefully for slugs not in the map. */
export function getSituationMeta(slug: string): SituationMeta {
  const known = SITUATION_META[slug];
  if (known) return known;
  const de = formatSlug(slug);
  return { nameVi: `Tình huống: ${de}`, nameDe: de, icon: 'chatbubbles-outline' };
}

// --- Favorite phrases (device-local, independent from the server notebook) ---

const PHRASE_FAVS_KEY = 'deutsch_phrase_favs';

export async function getFavPhraseIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(PHRASE_FAVS_KEY);
    const parsed: unknown = JSON.parse(raw ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export async function toggleFavPhrase(id: string): Promise<string[]> {
  const ids = await getFavPhraseIds();
  const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
  try {
    await AsyncStorage.setItem(PHRASE_FAVS_KEY, JSON.stringify(next));
  } catch {
    // non-fatal
  }
  return next;
}

export const phraseService = {
  situations() {
    return apiRequest<PhraseSituation[]>('/api/phrases/situations');
  },

  list(params: { situation?: string; q?: string; page?: number; size?: number } = {}) {
    const query = new URLSearchParams();
    if (params.situation) query.set('situation', params.situation);
    if (params.q) query.set('q', params.q);
    query.set('page', String(params.page ?? 0));
    query.set('size', String(params.size ?? 50));
    return apiRequest<Page<Phrase>>(`/api/phrases?${query.toString()}`);
  },
};
