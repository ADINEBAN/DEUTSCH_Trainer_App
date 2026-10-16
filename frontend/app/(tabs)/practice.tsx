import { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/src/components/ui/Screen';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { SectionTitle } from '@/src/components/ui/Section';
import { ErrorState, LoadingState } from '@/src/components/ui/States';
import { practiceService } from '@/src/services/practice.service';
import { GERMAN_MODULES } from '@/src/config/modules';
import { colors, radius, spacing } from '@/src/theme';
import type { Question } from '@/src/types';

export default function PracticeScreen() {
  const [mistakes, setMistakes] = useState<Question[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setMistakes(await practiceService.mistakes());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được sổ lỗi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Screen>
      <Text style={styles.title}>Luyện tập</Text>

      <SectionTitle title="Thi thử" subtitle="Mô phỏng kỳ thi thực tế" />
      <GlassCard>
        <Pressable style={styles.row} onPress={() => router.push('/practice/test-setup' as never)}>
          <View style={[styles.iconWrap, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name="timer" size={24} color={colors.primary} />
          </View>
          <View style={styles.rowMain}>
            <Text style={styles.rowLabel}>Mini / Half / Full Test</Text>
            <Text style={styles.rowDesc}>Đồng hồ, lưới câu hỏi, gắn cờ — chấm 0–100 mỗi module kiểu Goethe</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.inkMuted} />
        </Pressable>
      </GlassCard>

      <SectionTitle title="Luyện theo module" subtitle="Tập trung từng kỹ năng" />
      <View style={styles.grid}>
        {GERMAN_MODULES.map((m) => (
          <Pressable
            key={m.key}
            style={({ pressed }) => [styles.partCard, pressed && styles.cardPressed]}
            onPress={() => router.push(`/practice/run?module=${m.key}` as never)}
          >
            <View style={[styles.moduleIconOrb, { backgroundColor: colors.primarySoft }]}>
              <Ionicons name={m.icon as keyof typeof Ionicons.glyphMap} size={24} color={colors.primary} />
            </View>
            <Text style={styles.partName}>{m.name}</Text>
            <Text style={styles.partDesc}>{m.desc}</Text>
          </Pressable>
        ))}
        <Pressable
          style={({ pressed }) => [styles.partCard, pressed && styles.cardPressed]}
          onPress={() => router.push('/grammar' as never)}
        >
          <View style={[styles.moduleIconOrb, { backgroundColor: colors.tealSoft }]}>
            <Ionicons name="school-outline" size={24} color={colors.teal} />
          </View>
          <Text style={styles.partName}>Ngữ pháp</Text>
          <Text style={styles.partDesc}>Bài học + quiz</Text>
        </Pressable>
      </View>

      <SectionTitle
        title="Sổ lỗi cần ôn"
        subtitle="Học từ những sai sót đã qua"
        action={
          mistakes && mistakes.length > 0 ? (
            <Pressable onPress={() => router.push('/practice/run?mode=mistakes' as never)}>
              <View style={styles.reviewPill}>
                <Text style={styles.link}>Ôn ngay</Text>
              </View>
            </Pressable>
          ) : undefined
        }
      />
      {loading ? (
        <LoadingState message="Đang tải sổ lỗi…" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : mistakes && mistakes.length > 0 ? (
        <GlassCard>
          <Text style={styles.mistakeCount}>
            Bạn có <Text style={styles.mistakeStrong}>{mistakes.length} câu sai</Text> cần ôn lại
          </Text>
          <Text style={styles.mistakeHint}>Chạm “Ôn ngay” để làm lại các câu đã sai kèm giải thích chi tiết.</Text>
        </GlassCard>
      ) : (
        <GlassCard>
          <Text style={styles.mistakeHint}>Chưa có câu sai nào. Làm bài để hệ thống ghi lại nhé!</Text>
        </GlassCard>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.ink,
    marginTop: spacing.sm,
    letterSpacing: -0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 6,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowMain: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.ink,
  },
  rowDesc: {
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: 2,
    lineHeight: 17,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  partCard: {
    width: '31%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: radius.md + 2,
    paddingVertical: spacing.md,
    paddingHorizontal: 8,
    alignItems: 'center',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#102A43',
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
      },
      web: {
        boxShadow: '0 4px 14px rgba(16, 42, 67, 0.05)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      } as object,
    }),
  },
  cardPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
  moduleIconOrb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  partName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.ink,
    marginTop: 4,
  },
  partDesc: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.inkMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  reviewPill: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  link: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 13,
  },
  mistakeCount: {
    fontSize: 15,
    color: colors.ink,
    fontWeight: '600',
  },
  mistakeStrong: {
    fontWeight: '800',
    color: colors.danger,
  },
  mistakeHint: {
    fontSize: 13,
    color: colors.inkSoft,
    marginTop: 6,
    lineHeight: 19,
  },
});
