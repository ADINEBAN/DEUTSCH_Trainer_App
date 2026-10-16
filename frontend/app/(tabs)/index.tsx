import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/src/components/ui/Screen';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { SectionTitle, StatTile } from '@/src/components/ui/Section';
import { ProgressBar } from '@/src/components/ui/Progress';
import { ErrorState, LoadingState } from '@/src/components/ui/States';
import { useAuth } from '@/src/context/AuthContext';
import { authService } from '@/src/services/auth.service';
import { LevelAvatar } from '@/src/components/ui/LevelAvatar';
import { EditProfileModal } from '@/src/components/profile/EditProfileModal';
import {
  getTierForLevel,
  getXpProgress,
  getUserAvatar,
  getUserFrame,
  type MythicFrameType,
} from '@/src/utils/levelTiers';
import { colors, radius, spacing } from '@/src/theme';
import type { DashboardStats } from '@/src/types';

const AI_SHORTCUTS: { href: string; icon: keyof typeof Ionicons.glyphMap; label: string; color: string }[] = [
  { href: '/(ai)/semantic', icon: 'share-social', label: 'Mạng từ', color: colors.primary },
  { href: '/(ai)/docs', icon: 'document-text', label: 'Nạp tài liệu', color: '#8B5CF6' },
  { href: '/(ai)/speaking', icon: 'mic', label: 'Luyện nói', color: colors.orange },
];

export default function HomeScreen() {
  const { user, refreshUser } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [userAvatar, setUserAvatar] = useState('wolf_ice');
  const [userFrame, setUserFrame] = useState<MythicFrameType>('auto');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setStats(await authService.dashboard());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được dữ liệu.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (user?.id) {
      getUserAvatar(user.id).then(setUserAvatar);
      getUserFrame(user.id).then(setUserFrame);
    }
  }, [user?.id]);

  const handleProfileUpdated = useCallback(async () => {
    await refreshUser();
    await load();
    if (user?.id) {
      const av = await getUserAvatar(user.id);
      const fr = await getUserFrame(user.id);
      setUserAvatar(av);
      setUserFrame(fr);
    }
  }, [refreshUser, load, user?.id]);

  if (loading) {
    return (
      <Screen>
        <LoadingState message="Đang tải bảng điều khiển…" />
      </Screen>
    );
  }

  if (error || !stats) {
    return (
      <Screen>
        <ErrorState message={error ?? 'Không có dữ liệu.'} onRetry={load} />
      </Screen>
    );
  }

  const dailyRatio = stats.dailyGoalMinutes > 0 ? stats.dailyDoneMinutes / stats.dailyGoalMinutes : 0;
  const tier = getTierForLevel(stats.level);
  const xpProgress = getXpProgress(stats.xp, stats.level);

  return (
    <Screen>
      {/* Gamified Hero Profile Card (Tier Avatar, Name, Level & XP Bar) */}
      <GlassCard borderRadius={28} showRivets contentStyle={styles.profileHeroContent} style={styles.profileHeroCard}>
        <Pressable
          style={({ pressed }) => [styles.profileHeroRow, pressed && styles.profileHeroRowPressed]}
          onPress={() => setEditModalVisible(true)}
        >
          {/* Level Avatar with Tier Wings and Shield Badge */}
          <LevelAvatar
            level={stats.level}
            avatar={userAvatar}
            frameType={userFrame}
            size={64}
            showWings
            showBadge
          />

          {/* User Name, Tier Tag, and Gamified XP Progress */}
          <View style={styles.profileHeroDetails}>
            <View style={styles.profileNameRow}>
              <Text style={styles.profileName} numberOfLines={1}>
                {user?.name || 'Học viên'}
              </Text>
              <Pressable
                style={styles.editProfileBtn}
                onPress={() => setEditModalVisible(true)}
                hitSlop={8}
              >
                <Ionicons name="create-outline" size={13} color={tier.accentColor} />
                <Text style={[styles.editProfileText, { color: tier.accentColor }]}>Sửa hồ sơ</Text>
              </Pressable>
            </View>

            {/* Tier & Target Badges */}
            <View style={styles.tierTagsRow}>
              <View style={[styles.tierPill, { backgroundColor: `${tier.primaryColor}18`, borderColor: `${tier.primaryColor}55` }]}>
                <Ionicons name={tier.elementIcon} size={12} color={tier.primaryColor} />
                <Text style={[styles.tierPillText, { color: tier.primaryColor }]}>
                  {tier.name} • Cấp {stats.level}
                </Text>
              </View>
              {user?.targetLevel && (
                <View style={styles.targetPill}>
                  <Text style={styles.targetPillText}>Mục tiêu: {user.targetLevel}</Text>
                </View>
              )}
            </View>

            {/* Gamified XP Progress Bar */}
            <View style={styles.xpBarWrap}>
              <View style={styles.xpInfoRow}>
                <Text style={styles.xpCountText}>
                  <Text style={{ fontWeight: '900', color: tier.primaryColor }}>{xpProgress.currentLevelXp}</Text> / {xpProgress.xpForNextLevel} XP
                </Text>
                <Text style={styles.xpPercentText}>{Math.round(xpProgress.xpRatio * 100)}%</Text>
              </View>
              <View style={styles.xpTrack}>
                <LinearGradient
                  colors={tier.gradientColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.xpFill,
                    { width: `${Math.max(6, Math.min(100, xpProgress.xpRatio * 100))}%` },
                  ]}
                />
              </View>
            </View>
          </View>
        </Pressable>
      </GlassCard>

      {/* 3D Liquid Glass Pods (Streak, XP, Cấp độ) */}
      <View style={styles.tiles}>
        <StatTile icon="flame" label="Streak" value={`${stats.streakDays} ngày`} color={colors.orange} />
        <StatTile icon="star" label="XP" value={stats.xp} color={colors.primary} />
        <StatTile icon="trophy" label="Cấp độ" value={stats.level} color={colors.teal} />
      </View>

      {/* Daily Progress Glass Card */}
      <GlassCard borderRadius={24}>
        <View style={styles.progressHeader}>
          <Text style={styles.cardTitle}>Tiến độ hôm nay</Text>
          <View style={styles.progressPill}>
            <Text style={styles.dailyText}>
              {stats.dailyDoneMinutes}/{stats.dailyGoalMinutes} phút
            </Text>
          </View>
        </View>
        <ProgressBar value={dailyRatio} height={10} />
      </GlassCard>

      <SectionTitle title="Học nhanh" subtitle="Công cụ AI trợ giảng thông minh" />
      <GlassCard borderRadius={26} contentStyle={styles.shortcutsCardContent}>
        <View style={styles.shortcutsRow}>
          {AI_SHORTCUTS.map((s) => (
            <Link key={s.href} href={s.href as never} asChild>
              <Pressable style={({ pressed }) => [styles.shortcut, pressed && styles.shortcutPressed]}>
                <View style={[styles.shortcutIcon, { backgroundColor: `${s.color}18`, borderColor: `${s.color}35` }]}>
                  <Ionicons name={s.icon} size={22} color={s.color} />
                </View>
                <Text style={styles.shortcutLabel}>{s.label}</Text>
              </Pressable>
            </Link>
          ))}
        </View>
      </GlassCard>

      {/* Luyện tập Card — Only outer card is rounded, no inner nested backgrounds */}
      <SectionTitle title="Luyện tập" subtitle="Các lộ trình rèn luyện chuyên sâu" />
      <GlassCard borderRadius={26}>
        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          onPress={() => router.push('/practice/test-setup' as never)}
        >
          <View style={[styles.rowIconOrb, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name="timer-outline" size={20} color={colors.primary} />
          </View>
          <View style={styles.rowMain}>
            <Text style={styles.rowLabel}>Làm bài thi thử</Text>
            <Text style={styles.rowSub}>Mini / Half / Full Test kiểu Goethe</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.inkMuted} />
        </Pressable>

        <View style={styles.rowDivider} />

        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          onPress={() => router.push('/(tabs)/practice')}
        >
          <View style={[styles.rowIconOrb, { backgroundColor: colors.tealSoft }]}>
            <Ionicons name="list-outline" size={20} color={colors.teal} />
          </View>
          <View style={styles.rowMain}>
            <Text style={styles.rowLabel}>Luyện theo 4 module Goethe</Text>
            <Text style={styles.rowSub}>Nghe, Đọc, Viết, Nói chuyên sâu</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.inkMuted} />
        </Pressable>

        <View style={styles.rowDivider} />

        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          onPress={() => router.push('/communication' as never)}
        >
          <View style={[styles.rowIconOrb, { backgroundColor: 'rgba(14, 165, 233, 0.12)' }]}>
            <Ionicons name="chatbubbles-outline" size={20} color="#0EA5E9" />
          </View>
          <View style={styles.rowMain}>
            <Text style={styles.rowLabel}>Mẫu câu giao tiếp hằng ngày</Text>
            <Text style={styles.rowSub}>Tình huống thực tế kèm phát âm</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.inkMuted} />
        </Pressable>

        <View style={styles.rowDivider} />

        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          onPress={() => router.push('/(tabs)/flashcards')}
        >
          <View style={[styles.rowIconOrb, { backgroundColor: colors.orangeSoft }]}>
            <Ionicons name="layers-outline" size={20} color={colors.orange} />
          </View>
          <View style={styles.rowMain}>
            <Text style={styles.rowLabel}>Ôn flashcard hôm nay</Text>
            <Text style={styles.rowSub}>Lặp lại ngắt quãng (SRS) nhớ lâu</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.inkMuted} />
        </Pressable>
      </GlassCard>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={editModalVisible}
        user={user}
        level={stats.level}
        onClose={() => setEditModalVisible(false)}
        onSuccess={handleProfileUpdated}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileHeroCard: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  profileHeroContent: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  profileHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileHeroRowPressed: {
    opacity: 0.9,
  },
  profileHeroDetails: {
    flex: 1,
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileName: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.ink,
    letterSpacing: -0.3,
    flex: 1,
    marginRight: 6,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.65)',
  },
  editProfileText: {
    fontSize: 10,
    fontWeight: '800',
  },
  tierTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
    marginBottom: 5,
  },
  tierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  tierPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  targetPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(16, 42, 67, 0.06)',
  },
  targetPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.inkMuted,
  },
  xpBarWrap: {
    marginTop: 1,
  },
  xpInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  xpCountText: {
    fontSize: 10,
    color: colors.inkSoft,
    fontWeight: '600',
  },
  xpPercentText: {
    fontSize: 10,
    color: colors.inkMuted,
    fontWeight: '800',
  },
  xpTrack: {
    height: 7,
    borderRadius: 3.5,
    backgroundColor: 'rgba(16, 42, 67, 0.08)',
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    borderRadius: 3.5,
  },
  scoreCard: {
    marginTop: spacing.xs,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  milestone: {
    flex: 1,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 42, 67, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    marginBottom: 4,
  },
  milestoneLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  milestoneTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.ink,
    letterSpacing: -0.3,
  },
  milestoneDesc: {
    fontSize: 13,
    color: colors.inkSoft,
    marginTop: 4,
    lineHeight: 18,
    fontWeight: '500',
  },
  tiles: {
    flexDirection: 'row',
    marginHorizontal: -4,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.ink,
  },
  progressPill: {
    backgroundColor: 'rgba(29, 127, 224, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  dailyText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  shortcutsCardContent: {
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  shortcutsRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  shortcut: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: 18,
    paddingVertical: 12,
    position: 'relative',
  },
  shortcutPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.88,
  },
  shortcutIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutLabel: {
    fontSize: 11,
    color: colors.ink,
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  rowPressed: {
    opacity: 0.7,
  },
  rowIconOrb: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  rowMain: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.2,
  },
  rowSub: {
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  rowDivider: {
    height: 1,
    backgroundColor: 'rgba(16, 42, 67, 0.06)',
    marginVertical: 2,
  },
});
