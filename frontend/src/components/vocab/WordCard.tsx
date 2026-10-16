import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { ListenButton } from '@/src/components/ui/ListenButton';
import { colors, radius, spacing } from '@/src/theme';
import type { Word } from '@/src/types';

export function WordCard({
  word,
  onPress,
  onToggleSave,
  saved,
}: {
  word: Word;
  onPress: () => void;
  onToggleSave?: () => void;
  saved?: boolean;
}) {
  // Extract German article if present (der/die/das)
  const parts = word.word.split(' ');
  const hasArticle = parts.length > 1 && ['der', 'die', 'das', 'dem', 'den', 'des'].includes(parts[0].toLowerCase());
  const article = hasArticle ? parts[0] : null;
  const noun = hasArticle ? parts.slice(1).join(' ') : word.word;

  const articleColor =
    article?.toLowerCase() === 'der'
      ? '#0284C7' // Ocean Blue
      : article?.toLowerCase() === 'die'
      ? '#E11D48' // Rose Pink
      : article?.toLowerCase() === 'das'
      ? '#10B981' // Mint Green
      : colors.primary;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.cardWrapper, pressed && styles.cardPressed]}
    >
      <GlassCard borderRadius={24}>
        <View style={styles.row}>
          <View style={styles.main}>
            <View style={styles.wordRow}>
              {article ? (
                <Text style={[styles.articleText, { color: articleColor }]}>{article} </Text>
              ) : null}
              <Text style={styles.word}>{noun}</Text>
            </View>

            {word.ipa ? <Text style={styles.ipa}>/{word.ipa}/</Text> : null}

            <Text style={styles.meaning} numberOfLines={2}>
              {word.meaningVi}
            </Text>

            {word.topic ? (
              <View style={styles.topicPill}>
                <Text style={styles.topic}>{word.topic}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.side}>
            <ListenButton text={word.exampleDe ? `${word.word}. ${word.exampleDe}` : word.word} size={20} />
            {onToggleSave ? (
              <Pressable
                onPress={onToggleSave}
                style={({ pressed }) => [
                  styles.saveBtn,
                  saved && styles.saveBtnActive,
                  pressed && styles.pressed,
                ]}
                hitSlop={10}
              >
                <Ionicons
                  name={saved ? 'bookmark' : 'bookmark-outline'}
                  size={18}
                  color={saved ? colors.primary : colors.inkMuted}
                />
              </Pressable>
            ) : null}
          </View>
        </View>
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  main: { flex: 1 },
  wordRow: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap' },
  articleText: { fontSize: 19, fontWeight: '800', letterSpacing: -0.2 },
  word: { fontSize: 19, fontWeight: '900', color: colors.ink, letterSpacing: -0.3 },
  ipa: { fontSize: 13, color: colors.inkMuted, marginTop: 2, fontWeight: '500' },
  meaning: { fontSize: 14, color: colors.inkSoft, marginTop: 4, lineHeight: 20, fontWeight: '500' },
  topicPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 8,
  },
  topic: {
    fontSize: 10,
    color: colors.tealDark,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  side: { alignItems: 'center', gap: 10, marginLeft: spacing.sm, paddingTop: 2 },
  saveBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#102A43',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  saveBtnActive: {
    backgroundColor: 'rgba(29, 127, 224, 0.14)',
    borderColor: 'rgba(29, 127, 224, 0.35)',
  },
  pressed: { transform: [{ scale: 0.94 }], opacity: 0.85 },
  cardWrapper: {
    marginBottom: 2,
  },
  cardPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.88,
  },
});
