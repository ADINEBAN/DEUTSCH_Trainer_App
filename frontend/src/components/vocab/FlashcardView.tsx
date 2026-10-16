import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { ListenButton } from '@/src/components/ui/ListenButton';
import { colors, radius, spacing } from '@/src/theme';
import type { SrsRating, Word } from '@/src/types';

const RATINGS: { key: SrsRating; label: string; color: string; gradient: readonly [string, string] }[] = [
  { key: 'again', label: 'Chưa nhớ', color: '#EF4444', gradient: ['#F87171', '#DC2626'] },
  { key: 'hard', label: 'Khó', color: '#F59E0B', gradient: ['#FBBF24', '#D97706'] },
  { key: 'good', label: 'Nhớ', color: '#10B981', gradient: ['#34D399', '#059669'] },
  { key: 'easy', label: 'Dễ', color: '#1D7FE0', gradient: ['#60A5FA', '#1D4ED8'] },
];

export function FlashcardView({
  word,
  onRate,
  disabled = false,
}: {
  word: Word;
  onRate: (rating: SrsRating) => void;
  disabled?: boolean;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <View>
      <Pressable onPress={() => setFlipped((f) => !f)}>
        <GlassCard style={styles.card}>
          {!flipped ? (
            <View style={styles.face}>
              <View style={styles.wordPill}>
                <Text style={styles.word}>{word.word}</Text>
              </View>
              {word.ipa ? <Text style={styles.ipa}>/{word.ipa}/</Text> : null}
              <View style={styles.listenRow}>
                <ListenButton text={word.word} showLabel />
              </View>
              <View style={styles.hintContainer}>
                <Ionicons name="swap-horizontal" size={14} color={colors.inkMuted} />
                <Text style={styles.flipHint}>Chạm để lật thẻ</Text>
              </View>
            </View>
          ) : (
            <View style={styles.face}>
              <Text style={styles.meaning}>{word.meaningVi}</Text>
              {word.meaningDe ? <Text style={styles.meaningDe}>{word.meaningDe}</Text> : null}
              {word.exampleDe ? (
                <View style={styles.example}>
                  <Text style={styles.exampleDe}>{word.exampleDe}</Text>
                  {word.exampleVi ? <Text style={styles.exampleVi}>{word.exampleVi}</Text> : null}
                  <View style={styles.exampleListen}>
                    <ListenButton text={word.exampleDe} showLabel size={18} />
                  </View>
                </View>
              ) : null}
            </View>
          )}
        </GlassCard>
      </Pressable>

      {/* Liquid Jelly Rating Capsules */}
      <View style={styles.ratings}>
        {RATINGS.map((r) => {
          const isButtonActive = flipped && !disabled;
          return (
            <Pressable
              key={r.key}
              disabled={!isButtonActive}
              onPress={() => {
                onRate(r.key);
                setFlipped(false);
              }}
              style={({ pressed }) => [
                styles.rateBtn,
                { borderColor: isButtonActive ? r.color : 'rgba(255, 255, 255, 0.6)' },
                isButtonActive && { shadowColor: r.color },
                !isButtonActive && styles.rateDisabled,
                pressed && isButtonActive && styles.ratePressed,
              ]}
            >
              {isButtonActive && (
                <View style={StyleSheet.absoluteFill}>
                  <LinearGradient
                    colors={[`${r.color}25`, `${r.color}45`]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  {/* Top Meniscus Specular Shine */}
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.85)', 'rgba(255, 255, 255, 0.15)', 'transparent']}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={styles.specularShine}
                    pointerEvents="none"
                  />
                </View>
              )}

              <Text
                style={[
                  styles.rateLabel,
                  { color: isButtonActive ? r.color : colors.inkMuted },
                ]}
              >
                {r.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {!flipped ? (
        <View style={styles.rateHintRow}>
          <Ionicons name="information-circle-outline" size={14} color={colors.inkMuted} />
          <Text style={styles.rateHint}>
            Lật thẻ rồi tự đánh giá mức độ nhớ
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 320,
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  face: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  wordPill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 4,
  },
  word: {
    fontSize: 34,
    fontWeight: '900',
    color: colors.ink,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  ipa: {
    fontSize: 16,
    color: colors.inkMuted,
    marginTop: 6,
    fontWeight: '600',
  },
  listenRow: {
    marginTop: spacing.md,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.lg,
    backgroundColor: 'rgba(16, 42, 67, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  flipHint: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.inkMuted,
  },
  meaning: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.ink,
    textAlign: 'center',
  },
  meaningDe: {
    fontSize: 15,
    color: colors.inkSoft,
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '600',
  },
  example: {
    marginTop: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: radius.md,
    padding: spacing.md,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#102A43',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  exampleDe: {
    fontSize: 15,
    color: colors.ink,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '600',
  },
  exampleVi: {
    fontSize: 13,
    color: colors.inkMuted,
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '500',
  },
  exampleListen: {
    marginTop: 8,
  },
  ratings: {
    flexDirection: 'row',
    gap: 8,
    marginTop: spacing.md,
  },
  rateBtn: {
    flex: 1,
    position: 'relative',
    borderWidth: 1.5,
    borderRadius: radius.pill,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glassClear,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowOpacity: 0.35,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      web: {
        boxShadow: '0 4px 12px rgba(16, 42, 67, 0.08)',
      } as object,
    }),
  },
  specularShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '52%',
    borderTopLeftRadius: radius.pill,
    borderTopRightRadius: radius.pill,
  },
  rateDisabled: {
    opacity: 0.45,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowOpacity: 0,
  },
  ratePressed: {
    transform: [{ scale: 0.95 }],
  },
  rateLabel: {
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.2,
    zIndex: 2,
  },
  rateHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.md,
  },
  rateHint: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.inkMuted,
  },
});
