import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassButton } from '@/src/components/ui/GlassButton';
import { colors, radius, spacing } from '@/src/theme';

export function LoadingState({ message = 'Đang tải…' }: { message?: string }) {
  return (
    <View style={styles.center}>
      <View style={styles.iconOrb}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.85)', 'rgba(235, 245, 255, 0.4)']}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
      <Text style={styles.hint}>{message}</Text>
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.center}>
      <View style={[styles.iconOrb, styles.errorOrb]}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.85)', 'rgba(254, 226, 226, 0.5)']}
          style={StyleSheet.absoluteFill}
        />
        <Ionicons name="cloud-offline-outline" size={36} color={colors.danger} />
      </View>
      <Text style={styles.title}>Có lỗi xảy ra</Text>
      <Text style={styles.hint}>{message}</Text>
      {onRetry ? (
        <GlassButton
          title="Thử lại"
          onPress={onRetry}
          variant="secondary"
          style={styles.retry}
        />
      ) : null}
    </View>
  );
}

export function EmptyState({ icon = 'search-outline', message }: { icon?: string; message: string }) {
  return (
    <View style={styles.center}>
      <View style={styles.iconOrb}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.85)', 'rgba(240, 246, 255, 0.4)']}
          style={StyleSheet.absoluteFill}
        />
        <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={36} color={colors.inkMuted} />
      </View>
      <Text style={styles.hint}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  iconOrb: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#102A43',
        shadowOpacity: 0.10,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      web: {
        boxShadow: '0 4px 14px rgba(16, 42, 67, 0.08)',
      } as object,
    }),
  },
  errorOrb: {
    shadowColor: '#EF4444',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.ink,
    marginTop: spacing.xs,
    letterSpacing: -0.2,
  },
  hint: {
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 20,
    maxWidth: 280,
  },
  retry: {
    marginTop: spacing.md,
    minWidth: 140,
  },
});
