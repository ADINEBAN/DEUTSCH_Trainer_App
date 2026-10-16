import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, liquidGradients, liquidShadow, radius, spacing } from '@/src/theme';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'amber' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export function GlassButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  labelStyle,
}: GlassButtonProps) {
  const isDisabled = disabled || loading;

  // Choose gradient & caustics based on variant
  const isPrimary = variant === 'primary';
  const isAmber = variant === 'amber';
  const isDanger = variant === 'danger';
  const isSecondary = variant === 'secondary' || variant === 'outline';
  const isGhost = variant === 'ghost';

  const gradientColors: readonly [string, string, ...string[]] = isAmber
    ? liquidGradients.amber
    : isPrimary
    ? liquidGradients.ocean
    : isDanger
    ? ['#F43F5E', '#E11D48', '#BE123C']
    : ['rgba(255, 255, 255, 0.90)', 'rgba(235, 245, 255, 0.65)'];

  const shadowPreset = isAmber
    ? liquidShadow.buttonAmber
    : isPrimary
    ? liquidShadow.buttonBlue
    : isDanger
    ? liquidShadow.buttonDanger
    : liquidShadow.buttonClear;

  const sizeStyle =
    size === 'sm'
      ? styles.sizeSm
      : size === 'lg'
      ? styles.sizeLg
      : styles.sizeMd;

  const textSizeStyle =
    size === 'sm'
      ? styles.textSm
      : size === 'lg'
      ? styles.textLg
      : styles.textMd;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.outer,
        sizeStyle,
        !isGhost && shadowPreset,
        isGhost && styles.ghostContainer,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {/* Liquid Jelly Core Background */}
      {!isGhost && (
        <View style={StyleSheet.absoluteFill}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Liquid Top-Meniscus Specular Gloss Shine (Image 2 signature effect) */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.85)', 'rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.0)']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.specularMeniscus}
            pointerEvents="none"
          />

          {/* Bottom subtle rainbow refraction flare for clear/white buttons */}
          {isSecondary && (
            <LinearGradient
              colors={[
                'rgba(255, 255, 255, 0.0)',
                'rgba(255, 180, 120, 0.25)',
                'rgba(90, 210, 255, 0.35)',
                'rgba(180, 130, 255, 0.25)',
              ]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 1 }}
              style={styles.chromaticEdge}
              pointerEvents="none"
            />
          )}
        </View>
      )}

      {/* Button Content */}
      <View style={styles.contentRow}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={isSecondary || isGhost ? colors.primary : colors.white}
          />
        ) : (
          <>
            {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
            <Text
              style={[
                styles.label,
                textSizeStyle,
                isSecondary || isGhost ? styles.labelSecondary : styles.labelWhite,
                labelStyle,
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'relative',
    borderRadius: radius.pill,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.70)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeSm: {
    paddingVertical: 9,
    paddingHorizontal: 16,
  },
  sizeMd: {
    paddingVertical: 13,
    paddingHorizontal: spacing.lg,
  },
  sizeLg: {
    paddingVertical: 16,
    paddingHorizontal: spacing.xl,
  },
  ghostContainer: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
  },
  specularMeniscus: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '52%',
    borderTopLeftRadius: radius.pill,
    borderTopRightRadius: radius.pill,
  },
  chromaticEdge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 12,
    borderBottomLeftRadius: radius.pill,
    borderBottomRightRadius: radius.pill,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    position: 'relative',
  },
  iconWrap: {
    marginRight: 8,
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  textSm: { fontSize: 13 },
  textMd: { fontSize: 15 },
  textLg: { fontSize: 17 },
  labelWhite: {
    color: colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.22)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  labelSecondary: {
    color: colors.ink,
    fontWeight: '700',
  },
  pressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.5,
  },
});
