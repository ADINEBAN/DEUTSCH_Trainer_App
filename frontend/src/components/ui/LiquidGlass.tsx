import React from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius as themeRadius } from '@/src/theme';

interface LiquidGlassProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  borderRadius?: number;
  showSpecular?: boolean;
  showPrism?: boolean;
  showRivets?: boolean;
}

export function LiquidGlass({
  children,
  style,
  contentStyle,
  borderRadius = themeRadius.lg,
  showSpecular = true,
  showPrism = true,
  showRivets = false,
}: LiquidGlassProps) {
  return (
    <View style={[styles.outerContainer, { borderRadius }, style]}>
      {/* Translucent liquid frost layer with web backdrop-filter */}
      <View style={[styles.glassLayer, { borderRadius }]}>
        <View style={[styles.frostOverlay, { borderRadius }]} />

        {/* Top-half Specular Gloss Meniscus (creates the 3D liquid dome shine) */}
        {showSpecular && (
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.65)', 'rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.0)']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={[
              styles.specularShine,
              {
                borderTopLeftRadius: Math.max(0, borderRadius - 1),
                borderTopRightRadius: Math.max(0, borderRadius - 1),
              },
            ]}
            pointerEvents="none"
          />
        )}

        {/* Chromatic Prism Caustic Highlight (lower edge refraction) */}
        {showPrism && (
          <LinearGradient
            colors={[
              'rgba(255, 140, 100, 0.0)',
              'rgba(255, 200, 100, 0.16)',
              'rgba(100, 220, 255, 0.22)',
              'rgba(180, 140, 255, 0.15)',
            ]}
            start={{ x: 0, y: 0.8 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.prismShine,
              {
                borderBottomLeftRadius: Math.max(0, borderRadius - 1),
                borderBottomRightRadius: Math.max(0, borderRadius - 1),
              },
            ]}
            pointerEvents="none"
          />
        )}

        {/* Optional decorative glass rivets / screws at corners (as seen in Image 1) */}
        {showRivets && (
          <>
            <View style={[styles.rivet, styles.rivetTopLeft]}><View style={styles.rivetInnerDot} /></View>
            <View style={[styles.rivet, styles.rivetTopRight]}><View style={styles.rivetInnerDot} /></View>
            <View style={[styles.rivet, styles.rivetBottomLeft]}><View style={styles.rivetInnerDot} /></View>
            <View style={[styles.rivet, styles.rivetBottomRight]}><View style={styles.rivetInnerDot} /></View>
          </>
        )}
      </View>

      {/* Content wrapper */}
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

// Small translucent liquid glass rivet screw
export function GlassRivet({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.rivetBox, style]}>
      <View style={styles.rivetInnerDot} />
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    ...Platform.select({
      ios: {
        shadowColor: '#102A43',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      web: {
        boxShadow: '0 4px 16px rgba(16, 42, 67, 0.06)',
      } as object,
    }),
  },
  glassLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  frostOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      } as object,
    }),
  },
  specularShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 26,
    opacity: 0.85,
  },
  prismShine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 18,
    opacity: 0.85,
  },
  content: {
    position: 'relative',
  },
  rivet: {
    position: 'absolute',
    width: 13,
    height: 13,
    borderRadius: 6.5,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    zIndex: 3,
  },
  rivetTopLeft: { top: 12, left: 12 },
  rivetTopRight: { top: 12, right: 12 },
  rivetBottomLeft: { bottom: 12, left: 12 },
  rivetBottomRight: { bottom: 12, right: 12 },
  rivetBox: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rivetInnerDot: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
});
