import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, liquidGradients, radius, spacing } from '@/src/theme';

export function Chip({
  label,
  selected,
  onPress,
  icon,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.pressed,
      ]}
    >
      {selected ? (
        <View style={StyleSheet.absoluteFill}>
          <LinearGradient
            colors={liquidGradients.ocean}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.65)', 'rgba(255, 255, 255, 0.1)', 'transparent']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.specular}
            pointerEvents="none"
          />
        </View>
      ) : (
        <View style={StyleSheet.absoluteFill}>
          <View style={styles.unselectedBase} />
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.55)', 'rgba(255, 255, 255, 0.08)', 'transparent']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.specular}
            pointerEvents="none"
          />
        </View>
      )}

      <View style={styles.innerContent}>
        {icon ? <View style={styles.iconBox}>{icon}</View> : null}
        <Text style={[styles.label, selected ? styles.labelSelected : styles.labelUnselected]}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    position: 'relative',
    borderRadius: radius.pill,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    borderColor: colors.primary,
  },
  unselectedBase: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  specular: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 14,
    borderTopLeftRadius: radius.pill,
    borderTopRightRadius: radius.pill,
  },
  innerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  iconBox: {
    marginRight: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  labelUnselected: {
    color: colors.inkSoft,
  },
  labelSelected: {
    color: colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.18)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  pressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.85,
  },
});
