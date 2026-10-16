import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing } from '@/src/theme';

interface GlassCardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  showSpecular?: boolean;
  showPrism?: boolean;
  showRivets?: boolean;
  intensity?: number;
  borderRadius?: number;
}

export function GlassCard({
  children,
  style,
  contentStyle,
  showSpecular = true,
  borderRadius = 24,
}: GlassCardProps) {
  return (
    <View style={[styles.card, { borderRadius }, style, contentStyle]}>
      {/* Delicate top specular glass meniscus highlight */}
      {showSpecular && (
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.50)', 'rgba(255, 255, 255, 0.05)', 'transparent']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[
            styles.specular,
            {
              borderTopLeftRadius: Math.max(0, borderRadius - 1),
              borderTopRightRadius: Math.max(0, borderRadius - 1),
            },
          ]}
          pointerEvents="none"
        />
      )}

      {/* Direct children: no nested clipping layer, no zIndex layer */}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    padding: spacing.md + 2,
    marginBottom: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#102A43',
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
      },
      web: {
        boxShadow: '0 4px 16px rgba(16, 42, 67, 0.05)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      } as object,
    }),
  },
  specular: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 18,
  },
});
