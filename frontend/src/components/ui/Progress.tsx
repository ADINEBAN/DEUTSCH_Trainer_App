import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, liquidGradients, radius } from '@/src/theme';

export function ProgressBar({
  value, // 0..1
  color,
  gradientColors = liquidGradients.ocean,
  style,
  height = 10,
}: {
  value: number;
  color?: string;
  gradientColors?: readonly [string, string, ...string[]];
  style?: ViewStyle;
  height?: number;
}) {
  const clamped = Math.max(0, Math.min(1, value));

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }, style]}>
      {/* Recessed glass track border */}
      <View
        style={[
          styles.fillContainer,
          { width: `${clamped * 100}%`, borderRadius: height / 2 },
        ]}
      >
        <LinearGradient
          colors={color ? [color, color] : gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Top-half gloss sheen on liquid fluid */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.65)', 'rgba(255, 255, 255, 0.1)', 'transparent']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.fillSpecular}
          pointerEvents="none"
        />
      </View>
    </View>
  );
}

// 3D Liquid Gem / Token (compact, elegant, perfectly proportioned)
export function ScoreRing({
  value,
  label,
  sub,
  size = 100,
}: {
  value: number;
  label: string;
  sub?: string;
  size?: number;
}) {
  const innerSize = size - 22;

  return (
    <View
      style={[
        styles.tokenOuter,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      {/* Liquid Gradient Ring */}
      <LinearGradient
        colors={liquidGradients.ocean}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: size / 2 }]}
      />

      {/* Ring Specular Meniscus */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.75)', 'rgba(255, 255, 255, 0.15)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.tokenRingSpecular, { borderRadius: size / 2 }]}
        pointerEvents="none"
      />

      {/* Inner White Pearl Core */}
      <View
        style={[
          styles.tokenInner,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
          },
        ]}
      >
        {/* Core Specular */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.98)', 'rgba(240, 246, 255, 0.7)']}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.75)', 'transparent']}
          style={styles.innerSpecular}
          pointerEvents="none"
        />

        <Text style={styles.tokenValue}>{value}</Text>
        <Text style={styles.tokenLabel}>{label}</Text>
        {sub ? <Text style={styles.tokenSub}>{sub}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: 'rgba(16, 42, 67, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    overflow: 'hidden',
    position: 'relative',
  },
  fillContainer: {
    height: '100%',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#1D7FE0',
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
  },
  fillSpecular: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  tokenOuter: {
    position: 'relative',
    borderWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.98)',
    borderColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    // 3D Caustic Glow
    shadowColor: '#1D7FE0',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  tokenRingSpecular: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
  },
  tokenInner: {
    position: 'relative',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  innerSpecular: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
  },
  tokenValue: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.primaryDark,
    letterSpacing: -0.5,
  },
  tokenLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.inkMuted,
  },
  tokenSub: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.inkMuted,
    marginTop: 1,
  },
});
