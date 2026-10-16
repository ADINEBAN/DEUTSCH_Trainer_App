import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

// Luminous Studio Backdrop with seamless diffuse aurora gradients:
// Creates a clean, ethereal, transparent liquid glass look with zero hard circular edges.
export function AuroraBackground({ children }: { children: ReactNode }) {
  return (
    <View style={styles.root}>
      {/* 1. Base Crystal Sky Background */}
      <LinearGradient
        colors={['#EBF3FA', '#F2F7FC', '#E5F0FA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* 2. Soft Ambient Pastel Aurora (Seamless diffuse light caustics) */}
      <LinearGradient
        colors={[
          'rgba(125, 211, 252, 0.30)', // Sky Cyan
          'transparent',
          'rgba(254, 215, 170, 0.24)', // Warm Champagne
          'rgba(167, 243, 208, 0.22)', // Mint Dew
          'rgba(221, 214, 254, 0.22)', // Lavender
        ]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* 3. Subtle Counter-Refraction Flare */}
      <LinearGradient
        colors={['transparent', 'rgba(255, 255, 255, 0.40)', 'transparent']}
        start={{ x: 0, y: 0.4 }}
        end={{ x: 1, y: 0.7 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#EBF3FA',
  },
  content: {
    flex: 1,
  },
});
