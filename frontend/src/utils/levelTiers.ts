import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export interface LevelTier {
  tier: number;
  minLevel: number;
  maxLevel: number;
  name: string;
  title: string;
  badgeText: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  glowColor: string;
  borderColor: string;
  gradientColors: readonly [string, string, string];
  badgeBg: readonly [string, string];
  elementIcon: keyof typeof Ionicons.glyphMap;
  wingColor: string;
  flameColor: string;
}

export const LEVEL_TIERS: LevelTier[] = [
  {
    tier: 1,
    minLevel: 1,
    maxLevel: 9,
    name: 'Băng Lang',
    title: 'Sói Băng Tuyết',
    badgeText: 'Lv.1',
    primaryColor: '#06B6D4',
    secondaryColor: '#38BDF8',
    accentColor: '#0284C7',
    glowColor: 'rgba(6, 182, 212, 0.45)',
    borderColor: 'rgba(56, 189, 248, 0.85)',
    gradientColors: ['#06B6D4', '#0284C7', '#38BDF8'] as const,
    badgeBg: ['#0284C7', '#0369A1'] as const,
    elementIcon: 'snow-outline',
    wingColor: '#38BDF8',
    flameColor: '#BAE6FD',
  },
  {
    tier: 2,
    minLevel: 10,
    maxLevel: 19,
    name: 'Phong Lang',
    title: 'Sói Phong Ba',
    badgeText: 'Lv.10',
    primaryColor: '#10B981',
    secondaryColor: '#22C55E',
    accentColor: '#059669',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    borderColor: 'rgba(52, 211, 153, 0.85)',
    gradientColors: ['#10B981', '#059669', '#34D399'] as const,
    badgeBg: ['#047857', '#065F46'] as const,
    elementIcon: 'leaf-outline',
    wingColor: '#34D399',
    flameColor: '#BBF7D0',
  },
  {
    tier: 3,
    minLevel: 20,
    maxLevel: 29,
    name: 'Lam Đế',
    title: 'Sói Hoàng Gia',
    badgeText: 'Lv.20',
    primaryColor: '#2563EB',
    secondaryColor: '#3B82F6',
    accentColor: '#FBBF24',
    glowColor: 'rgba(37, 99, 235, 0.5)',
    borderColor: 'rgba(96, 165, 250, 0.85)',
    gradientColors: ['#2563EB', '#1D4ED8', '#60A5FA'] as const,
    badgeBg: ['#1E40AF', '#1E3A8A'] as const,
    elementIcon: 'flash-outline',
    wingColor: '#60A5FA',
    flameColor: '#FEF08A',
  },
  {
    tier: 4,
    minLevel: 30,
    maxLevel: 39,
    name: 'Diễm Lang',
    title: 'Sói Hoả Long',
    badgeText: 'Lv.30',
    primaryColor: '#EF4444',
    secondaryColor: '#DC2626',
    accentColor: '#F97316',
    glowColor: 'rgba(239, 68, 68, 0.55)',
    borderColor: 'rgba(248, 113, 113, 0.85)',
    gradientColors: ['#EF4444', '#B91C1C', '#F97316'] as const,
    badgeBg: ['#991B1B', '#7F1D1D'] as const,
    elementIcon: 'flame-outline',
    wingColor: '#F87171',
    flameColor: '#FED7AA',
  },
  {
    tier: 5,
    minLevel: 40,
    maxLevel: 999,
    name: 'Kim Hoàng',
    title: 'Sói Thái Dương',
    badgeText: 'Lv.40',
    primaryColor: '#F59E0B',
    secondaryColor: '#D97706',
    accentColor: '#FDE047',
    glowColor: 'rgba(245, 158, 11, 0.65)',
    borderColor: 'rgba(251, 191, 36, 0.95)',
    gradientColors: ['#F59E0B', '#B45309', '#FDE047'] as const,
    badgeBg: ['#B45309', '#78350F'] as const,
    elementIcon: 'sunny-outline',
    wingColor: '#FDE047',
    flameColor: '#FEF3C7',
  },
];

export function getTierForLevel(level: number): LevelTier {
  const safeLevel = Math.max(1, level || 1);
  const found = LEVEL_TIERS.find((t) => safeLevel >= t.minLevel && safeLevel <= t.maxLevel);
  return found ?? LEVEL_TIERS[LEVEL_TIERS.length - 1];
}

export const XP_PER_LEVEL = 250;

export function getXpProgress(xp: number, level: number) {
  const safeXp = Math.max(0, xp || 0);
  const currentLevelXp = safeXp % XP_PER_LEVEL;
  const xpForNextLevel = XP_PER_LEVEL;
  const xpRatio = Math.min(1, Math.max(0.05, currentLevelXp / xpForNextLevel));
  return {
    currentLevelXp,
    xpForNextLevel,
    xpRatio,
    totalXp: safeXp,
  };
}

export interface AvatarPreset {
  id: string;
  label: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  emoji: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: 'wolf_ice', label: 'Băng Lang', title: 'Hệ Băng', icon: 'snow', color: '#38BDF8', bg: '#082F49', emoji: '🐺' },
  { id: 'wolf_forest', label: 'Phong Lang', title: 'Hệ Mộc', icon: 'leaf', color: '#34D399', bg: '#064E3B', emoji: '🌲' },
  { id: 'wolf_blue', label: 'Lam Đế', title: 'Hệ Lôi', icon: 'flash', color: '#60A5FA', bg: '#1E3A8A', emoji: '⚡' },
  { id: 'wolf_fire', label: 'Diễm Lang', title: 'Hệ Hoả', icon: 'flame', color: '#F87171', bg: '#7F1D1D', emoji: '🔥' },
  { id: 'wolf_gold', label: 'Kim Hoàng', title: 'Hệ Quang', icon: 'sunny', color: '#FBBF24', bg: '#78350F', emoji: '👑' },
  { id: 'student_boy', label: 'Học sinh Nam', title: 'Đức Ngữ', icon: 'school', color: '#818CF8', bg: '#312E81', emoji: '🧑‍🎓' },
  { id: 'student_girl', label: 'Học sinh Nữ', title: 'Đức Ngữ', icon: 'sparkles', color: '#F472B6', bg: '#831843', emoji: '👩‍🎓' },
  { id: 'scholar', label: 'Học giả', title: 'Viện Hàn Lâm', icon: 'book', color: '#A78BFA', bg: '#4C1D95', emoji: '📜' },
];

export async function getUserAvatar(userId?: string): Promise<string> {
  if (!userId) return 'wolf_ice';
  try {
    const saved = await AsyncStorage.getItem(`@user_avatar_${userId}`);
    return saved || 'wolf_ice';
  } catch {
    return 'wolf_ice';
  }
}

export async function setUserAvatar(userId: string, avatarId: string): Promise<void> {
  if (!userId) return;
  try {
    await AsyncStorage.setItem(`@user_avatar_${userId}`, avatarId);
  } catch {
    // ignore
  }
}

export type MythicFrameType = 'auto' | 'phoenix' | 'dragon' | 'eagle' | 'seraph' | 'ice_wolf';

export interface FrameOption {
  id: MythicFrameType;
  name: string;
  subtitle: string;
  emoji: string;
  icon: keyof typeof Ionicons.glyphMap;
  primaryColor: string;
  accentColor: string;
  tag: string;
}

export const MYTHIC_FRAMES: FrameOption[] = [
  {
    id: 'auto',
    name: 'Theo Cấp độ',
    subtitle: 'Tự động nâng cấp theo Level học viên',
    emoji: '🌟',
    icon: 'sparkles',
    primaryColor: '#F59E0B',
    accentColor: '#FDE047',
    tag: 'TỰ ĐỘNG',
  },
  {
    id: 'phoenix',
    name: 'Phượng Hoàng Lửa',
    subtitle: 'Cánh lửa đa tầng & ngọc thái dương',
    emoji: '🔥',
    icon: 'flame',
    primaryColor: '#EF4444',
    accentColor: '#FBBF24',
    tag: 'THẦN THOẠI',
  },
  {
    id: 'dragon',
    name: 'Thần Long Hộ Mệnh',
    subtitle: 'Sừng rồng uy lực & 2 viên ngọc long',
    emoji: '🐉',
    icon: 'shield',
    primaryColor: '#8B5CF6',
    accentColor: '#10B981',
    tag: 'HUYỀN THOẠI',
  },
  {
    id: 'eagle',
    name: 'Đại Bàng Bão Tố',
    subtitle: 'Sải cánh bão lốc & tia sét lôi điện',
    emoji: '🦅',
    icon: 'flash',
    primaryColor: '#0284C7',
    accentColor: '#38BDF8',
    tag: 'TỐI THƯỢNG',
  },
  {
    id: 'seraph',
    name: 'Thiên Thần Hoàng Kim',
    subtitle: 'Lục dực Seraphim & hào quang mặt trời',
    emoji: '👑',
    icon: 'sunny',
    primaryColor: '#F59E0B',
    accentColor: '#FFFFFF',
    tag: 'CHÍ TÔN',
  },
  {
    id: 'ice_wolf',
    name: 'Băng Lang Cực Quang',
    subtitle: 'Cánh pha lê băng tuyết vĩnh cửu',
    emoji: '🐺',
    icon: 'snow',
    primaryColor: '#06B6D4',
    accentColor: '#BAE6FD',
    tag: 'BĂNG GIÁ',
  },
];

export async function getUserFrame(userId?: string): Promise<MythicFrameType> {
  if (!userId) return 'auto';
  try {
    const saved = await AsyncStorage.getItem(`@user_frame_${userId}`);
    return (saved as MythicFrameType) || 'auto';
  } catch {
    return 'auto';
  }
}

export async function setUserFrame(userId: string, frame: MythicFrameType): Promise<void> {
  if (!userId) return;
  try {
    await AsyncStorage.setItem(`@user_frame_${userId}`, frame);
  } catch {
    // ignore
  }
}

