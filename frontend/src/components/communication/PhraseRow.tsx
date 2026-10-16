import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { ListenButton } from '@/src/components/ui/ListenButton';
import { colors, radius } from '@/src/theme';
import type { Phrase } from '@/src/services/phrase.service';

interface Props {
  phrase: Phrase;
  situationLabel?: string | null;
  fav: boolean;
  onToggleFav: (id: string) => void;
}

export function PhraseRow({ phrase, situationLabel, fav, onToggleFav }: Props) {
  return (
    <GlassCard>
      <View style={styles.row}>
        <View style={styles.main}>
          <Text style={styles.german}>{phrase.german}</Text>
          <Text style={styles.vietnamese}>{phrase.vietnamese}</Text>
          <View style={styles.metaRow}>
            {phrase.level ? (
              <View style={styles.levelPill}>
                <Text style={styles.level}>{phrase.level}</Text>
              </View>
            ) : null}
            {situationLabel ? (
              <View style={styles.situationPill}>
                <Text style={styles.situation}>{situationLabel}</Text>
              </View>
            ) : null}
          </View>
        </View>
        <View style={styles.actions}>
          <ListenButton text={phrase.german} size={20} />
          <Pressable
            onPress={() => onToggleFav(phrase.id)}
            style={({ pressed }) => [
              styles.favBtn,
              fav && styles.favBtnActive,
              pressed && styles.pressed,
            ]}
            accessibilityLabel={fav ? 'Bỏ yêu thích' : 'Yêu thích'}
          >
            {/* Specular sheen */}
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.8)', 'transparent']}
              style={styles.favSpecular}
              pointerEvents="none"
            />
            <Ionicons
              name={fav ? 'heart' : 'heart-outline'}
              size={18}
              color={fav ? colors.danger : colors.inkMuted}
            />
          </Pressable>
        </View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  main: { flex: 1 },
  german: { fontSize: 16, fontWeight: '800', color: colors.ink, lineHeight: 23, letterSpacing: -0.2 },
  vietnamese: { fontSize: 13, color: colors.inkSoft, marginTop: 4, lineHeight: 19 },
  metaRow: { flexDirection: 'row', gap: 8, marginTop: 8, alignItems: 'center' },
  levelPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  level: {
    fontSize: 10,
    color: colors.tealDark,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  situationPill: {
    backgroundColor: 'rgba(16, 42, 67, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  situation: { fontSize: 11, color: colors.inkSoft, fontWeight: '600' },
  actions: { alignItems: 'center', gap: 8 },
  favBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.glassClear,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#102A43',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
      },
      web: {
        boxShadow: '0 4px 10px rgba(16, 42, 67, 0.06)',
      } as object,
    }),
  },
  favBtnActive: {
    backgroundColor: 'rgba(254, 226, 226, 0.6)',
    borderColor: 'rgba(239, 68, 68, 0.35)',
    shadowColor: colors.danger,
    shadowOpacity: 0.3,
  },
  favSpecular: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderRadius: 21,
  },
  pressed: { transform: [{ scale: 0.94 }], opacity: 0.85 },
});
