import { Platform, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing } from '@/src/theme';

export function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={styles.titleRow}>
      <View style={styles.titleTextCol}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  );
}

// 3D Liquid Glass Pod (resembling the colorful jelly squircle pods from Image 1)
export function StatTile({
  icon,
  label,
  value,
  color = colors.primary,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <View style={[styles.pod, { shadowColor: color }]}>
      {/* Meniscus Top Specular Shine */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.50)', 'rgba(255, 255, 255, 0.05)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.specularMeniscus}
        pointerEvents="none"
      />

      {/* Content */}
      <View style={styles.content}>
        <View style={[styles.iconOrb, { backgroundColor: `${color}1A`, borderColor: `${color}40` }]}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.6)', 'transparent']}
            style={styles.orbHighlight}
            pointerEvents="none"
          />
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  titleTextCol: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: colors.inkSoft,
    marginTop: 2,
  },
  pod: {
    flex: 1,
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 4,
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    ...Platform.select({
      ios: {
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
      },
      web: {
        boxShadow: '0 4px 14px rgba(16, 42, 67, 0.05)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      } as object,
    }),
  },
  specularMeniscus: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 16,
    borderTopLeftRadius: 21,
    borderTopRightRadius: 21,
  },
  content: {
    alignItems: 'center',
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: 8,
  },
  iconOrb: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  orbHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderRadius: 20,
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.2,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: 2,
  },
});
