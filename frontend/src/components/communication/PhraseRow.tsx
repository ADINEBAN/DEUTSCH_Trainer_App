import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { ListenButton } from '@/src/components/ui/ListenButton';
import { colors } from '@/src/theme';
import type { Phrase } from '@/src/services/phrase.service';

interface Props {
  phrase: Phrase;
  situationLabel?: string | null;
  fav: boolean;
  onToggleFav: (id: string) => void;
}

// One German <-> Vietnamese communication phrase:
// prominent German sentence, Vietnamese meaning, speaker + favorite buttons.
export function PhraseRow({ phrase, situationLabel, fav, onToggleFav }: Props) {
  return (
    <GlassCard>
      <View style={styles.row}>
        <View style={styles.main}>
          <Text style={styles.german}>{phrase.german}</Text>
          <Text style={styles.vietnamese}>{phrase.vietnamese}</Text>
          <View style={styles.metaRow}>
            {phrase.level ? <Text style={styles.level}>{phrase.level}</Text> : null}
            {situationLabel ? <Text style={styles.situation}>{situationLabel}</Text> : null}
          </View>
        </View>
        <View style={styles.actions}>
          <ListenButton text={phrase.german} size={20} />
          <Pressable
            onPress={() => onToggleFav(phrase.id)}
            style={({ pressed }) => [styles.favBtn, pressed && styles.pressed]}
            accessibilityLabel={fav ? 'Bỏ yêu thích' : 'Yêu thích'}
          >
            <Ionicons
              name={fav ? 'heart' : 'heart-outline'}
              size={20}
              color={fav ? colors.danger : colors.inkMuted}
            />
          </Pressable>
        </View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  main: { flex: 1 },
  german: { fontSize: 16, fontWeight: '800', color: colors.ink, lineHeight: 23 },
  vietnamese: { fontSize: 13, color: colors.inkSoft, marginTop: 4, lineHeight: 19 },
  metaRow: { flexDirection: 'row', gap: 8, marginTop: 6, alignItems: 'center' },
  level: {
    fontSize: 11,
    color: colors.teal,
    fontWeight: '700',
    textTransform: 'uppercase',
    backgroundColor: `${colors.teal}1A`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  situation: { fontSize: 11, color: colors.inkMuted, fontWeight: '600' },
  actions: { alignItems: 'center', gap: 8 },
  favBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
});
