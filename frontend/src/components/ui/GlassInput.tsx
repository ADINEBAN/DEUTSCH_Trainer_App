import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing } from '@/src/theme';

interface GlassInputProps extends TextInputProps {
  label?: string;
  error?: string | null;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export function GlassInput({ label, error, leftIcon, rightElement, style, ...props }: GlassInputProps) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.capsule, error ? styles.capsuleError : null]}>
        {/* Translucent glass layer */}
        <View style={styles.glassBase} />

        {/* Specular gloss top sheen */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.60)', 'rgba(255, 255, 255, 0.10)', 'transparent']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.specular}
          pointerEvents="none"
        />

        <View style={styles.innerRow}>
          {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}
          <TextInput
            placeholderTextColor={colors.inkMuted}
            style={[styles.input, style]}
            {...props}
          />
          {rightElement ? <View style={styles.rightElement}>{rightElement}</View> : null}
        </View>
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.inkSoft,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
    letterSpacing: 0.2,
  },
  capsule: {
    position: 'relative',
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderTopColor: colors.glassBorderHighlight,
    borderLeftColor: 'rgba(255, 255, 255, 0.85)',
    borderRightColor: 'rgba(255, 255, 255, 0.45)',
    borderBottomColor: 'rgba(255, 255, 255, 0.35)',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    // Soft liquid shadow
    shadowColor: '#102A43',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  glassBase: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.68)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      } as object,
    }),
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
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 48,
    zIndex: 2,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightElement: {
    marginLeft: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.ink,
    height: '100%',
    padding: 0,
  },
  capsuleError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 4,
    marginLeft: spacing.sm,
    fontWeight: '600',
  },
});
