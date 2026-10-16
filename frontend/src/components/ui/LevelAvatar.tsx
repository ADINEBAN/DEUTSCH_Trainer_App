import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  AVATAR_PRESETS,
  getTierForLevel,
  type MythicFrameType,
} from '@/src/utils/levelTiers';

export interface LevelAvatarProps {
  level: number;
  avatar?: string | null;
  name?: string;
  size?: number;
  showWings?: boolean;
  showBadge?: boolean;
  animated?: boolean;
  tierOverride?: number;
  frameType?: MythicFrameType;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const LevelAvatar: React.FC<LevelAvatarProps> = ({
  level,
  avatar,
  name,
  size = 64,
  showWings = true,
  showBadge = true,
  animated = true,
  tierOverride,
  frameType = 'auto',
  onPress,
  style,
}) => {
  const safeLevel = Math.max(1, level || 1);
  const tier = getTierForLevel(tierOverride ?? safeLevel);
  const preset = AVATAR_PRESETS.find((p) => p.id === avatar) ?? AVATAR_PRESETS[0];

  const scale = size / 64;
  const badgeWidth = Math.round(44 * scale);
  const badgeHeight = Math.round(18 * scale);
  const badgeFontSize = Math.max(9, Math.round(10 * scale));
  const innerSize = size - 8;

  // Resolve custom image URI
  const isCustomImage =
    typeof avatar === 'string' &&
    (avatar.startsWith('file:') ||
      avatar.startsWith('content:') ||
      avatar.startsWith('http:') ||
      avatar.startsWith('https:') ||
      avatar.startsWith('data:'));

  // Resolve mythic frame style
  const resolvedFrame: 'phoenix' | 'dragon' | 'eagle' | 'seraph' | 'ice_wolf' = (() => {
    if (frameType && frameType !== 'auto') {
      return frameType;
    }
    if (tier.tier === 1) return 'ice_wolf';
    if (tier.tier === 2) return 'eagle';
    if (tier.tier === 3) return 'eagle';
    if (tier.tier === 4) return 'dragon';
    return 'seraph';
  })();

  // Frame theme color definitions
  const theme = (() => {
    switch (resolvedFrame) {
      case 'phoenix':
        return {
          name: 'Phượng Hoàng Lửa',
          primary: '#EF4444',
          secondary: '#DC2626',
          accent: '#FBBF24',
          flame: '#FEF3C7',
          glow: 'rgba(239, 68, 68, 0.75)',
          border: 'rgba(251, 146, 60, 0.9)',
          gradient: ['#EF4444', '#DC2626', '#F59E0B'] as const,
          wingColor: '#F87171',
          particleColor: '#F97316',
          badgeBg: ['#B91C1C', '#7F1D1D'] as const,
        };
      case 'dragon':
        return {
          name: 'Thần Long Hộ Mệnh',
          primary: '#8B5CF6',
          secondary: '#7C3AED',
          accent: '#10B981',
          flame: '#6EE7B7',
          glow: 'rgba(139, 92, 246, 0.75)',
          border: 'rgba(167, 139, 250, 0.9)',
          gradient: ['#8B5CF6', '#6D28D9', '#10B981'] as const,
          wingColor: '#A78BFA',
          particleColor: '#10B981',
          badgeBg: ['#5B21B6', '#312E81'] as const,
        };
      case 'eagle':
        return {
          name: 'Đại Bàng Bão Tố',
          primary: '#0284C7',
          secondary: '#0369A1',
          accent: '#38BDF8',
          flame: '#BAE6FD',
          glow: 'rgba(2, 132, 199, 0.75)',
          border: 'rgba(56, 189, 248, 0.9)',
          gradient: ['#0284C7', '#0369A1', '#38BDF8'] as const,
          wingColor: '#38BDF8',
          particleColor: '#38BDF8',
          badgeBg: ['#0369A1', '#075985'] as const,
        };
      case 'seraph':
        return {
          name: 'Thiên Thần Hoàng Kim',
          primary: '#F59E0B',
          secondary: '#D97706',
          accent: '#FFFFFF',
          flame: '#FEF3C7',
          glow: 'rgba(245, 158, 11, 0.8)',
          border: 'rgba(253, 224, 71, 0.95)',
          gradient: ['#F59E0B', '#B45309', '#FDE047'] as const,
          wingColor: '#FDE047',
          particleColor: '#FDE047',
          badgeBg: ['#B45309', '#78350F'] as const,
        };
      case 'ice_wolf':
      default:
        return {
          name: 'Băng Lang Cực Quang',
          primary: '#06B6D4',
          secondary: '#0284C7',
          accent: '#BAE6FD',
          flame: '#E0F2FE',
          glow: 'rgba(6, 182, 212, 0.75)',
          border: 'rgba(56, 189, 248, 0.9)',
          gradient: ['#06B6D4', '#0284C7', '#38BDF8'] as const,
          wingColor: '#38BDF8',
          particleColor: '#BAE6FD',
          badgeBg: ['#0284C7', '#0369A1'] as const,
        };
    }
  })();

  // Animation values
  const floatAnim = useRef(new Animated.Value(0)).current;
  const wingAnim = useRef(new Animated.Value(0)).current;
  const wingSecondaryAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const counterRotateAnim = useRef(new Animated.Value(0)).current;
  const auraPulseAnim = useRef(new Animated.Value(0)).current;
  const shockwaveAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const crownAnim = useRef(new Animated.Value(0)).current;
  const rayRotateAnim = useRef(new Animated.Value(0)).current;
  const p1Anim = useRef(new Animated.Value(0)).current;
  const p2Anim = useRef(new Animated.Value(0)).current;
  const p3Anim = useRef(new Animated.Value(0)).current;
  const p4Anim = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!animated) return;

    // 1. Floating Hover Loop
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // 2. Primary Wing Flap Loop
    const wingLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(wingAnim, {
          toValue: 1,
          duration: 1250,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(wingAnim, {
          toValue: 0,
          duration: 1250,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    // Secondary wing flap with phase offset
    const wingSecondaryLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(wingSecondaryAnim, {
          toValue: 1,
          duration: 1450,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(wingSecondaryAnim, {
          toValue: 0,
          duration: 1450,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // 3. 360 Rotating Celestial Halo
    const rotateLoop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Counter-rotating Rune Star Ring
    const counterRotateLoop = Animated.loop(
      Animated.timing(counterRotateAnim, {
        toValue: 1,
        duration: 13000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Rotating Sunburst Rays
    const rayRotateLoop = Animated.loop(
      Animated.timing(rayRotateAnim, {
        toValue: 1,
        duration: 18000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // 4. Aura Breathing Glow
    const auraLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(auraPulseAnim, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(auraPulseAnim, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // 5. Radiant Shockwave Burst
    const shockwaveLoop = Animated.loop(
      Animated.timing(shockwaveAnim, {
        toValue: 1,
        duration: 2100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    );

    // 6. Holographic Specular Shimmer Streak
    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(2800),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    // 7. Crown Jewel Twinkle & Glisten
    const crownLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(crownAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(crownAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // 8. 4 Rising Elemental Particle Sparks
    const p1Loop = Animated.loop(
      Animated.timing(p1Anim, {
        toValue: 1,
        duration: 2200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    const p2Loop = Animated.loop(
      Animated.timing(p2Anim, {
        toValue: 1,
        duration: 2700,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    const p3Loop = Animated.loop(
      Animated.timing(p3Anim, {
        toValue: 1,
        duration: 3200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    const p4Loop = Animated.loop(
      Animated.timing(p4Anim, {
        toValue: 1,
        duration: 2500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    floatLoop.start();
    wingLoop.start();
    wingSecondaryLoop.start();
    rotateLoop.start();
    counterRotateLoop.start();
    rayRotateLoop.start();
    auraLoop.start();
    shockwaveLoop.start();
    shimmerLoop.start();
    crownLoop.start();
    p1Loop.start();
    p2Loop.start();
    p3Loop.start();
    p4Loop.start();

    return () => {
      floatLoop.stop();
      wingLoop.stop();
      wingSecondaryLoop.stop();
      rotateLoop.stop();
      counterRotateLoop.stop();
      rayRotateLoop.stop();
      auraLoop.stop();
      shockwaveLoop.stop();
      shimmerLoop.stop();
      crownLoop.stop();
      p1Loop.stop();
      p2Loop.stop();
      p3Loop.stop();
      p4Loop.stop();
    };
  }, [animated]);

  // Touch spring feedback
  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
  };

  // Interpolations
  const floatTranslateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [3 * scale, -3 * scale],
  });

  const floatScale = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.99, 1.025],
  });

  // Primary wing rotation
  const leftWingRotate = wingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-24deg', '-36deg'],
  });
  const rightWingRotate = wingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['24deg', '36deg'],
  });

  // Secondary wing feather rotation
  const leftWingSecRotate = wingSecondaryAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-18deg', '-30deg'],
  });
  const rightWingSecRotate = wingSecondaryAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['18deg', '30deg'],
  });

  // Tertiary bottom feather rotation
  const leftWingTertRotate = wingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-10deg', '-18deg'],
  });
  const rightWingTertRotate = wingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['10deg', '18deg'],
  });

  const wingScale = wingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.97, 1.08],
  });

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const counterRotateInterpolate = counterRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  const rayRotateInterpolate = rayRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const auraScale = auraPulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.98, 1.12],
  });
  const auraOpacity = auraPulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 0.9],
  });

  const shockwaveScale = shockwaveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1.32],
  });
  const shockwaveOpacity = shockwaveAnim.interpolate({
    inputRange: [0, 0.2, 0.7, 1],
    outputRange: [0.75, 0.55, 0.15, 0],
  });

  const shimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-innerSize * 1.6, innerSize * 1.6],
  });

  const crownScale = crownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1.25],
  });
  const crownOpacity = crownAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.8, 1, 0.8],
  });

  // Particles
  const p1TranslateY = p1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [12 * scale, -28 * scale],
  });
  const p1TranslateX = p1Anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -7 * scale, -2 * scale],
  });
  const p1Opacity = p1Anim.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, 0.9, 0.9, 0],
  });

  const p2TranslateY = p2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [14 * scale, -30 * scale],
  });
  const p2TranslateX = p2Anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 7 * scale, 2 * scale],
  });
  const p2Opacity = p2Anim.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, 0.9, 0.9, 0],
  });

  const p3TranslateY = p3Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [8 * scale, -22 * scale],
  });
  const p3TranslateX = p3Anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -4 * scale, -10 * scale],
  });
  const p3Opacity = p3Anim.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, 0.85, 0.85, 0],
  });

  const p4TranslateY = p4Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [10 * scale, -24 * scale],
  });
  const p4TranslateX = p4Anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 4 * scale, 10 * scale],
  });
  const p4Opacity = p4Anim.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, 0.85, 0.85, 0],
  });

  const badgeScale = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.98, 1.04],
  });

  // Render Wing Geometry according to Mythic Frame Type
  const renderMythicWings = () => {
    if (!showWings) return null;

    if (resolvedFrame === 'dragon') {
      // 🐉 THẦN LONG WINGS: Spiked bone knuckles, webbed membranes & dragon horns
      return (
        <>
          {/* Left Dragon Wing */}
          <Animated.View
            style={[
              styles.wingGroup,
              {
                top: 2 * scale,
                left: -2 * scale,
                transform: [
                  { rotate: animated ? leftWingRotate : '-28deg' },
                  { scale: animated ? wingScale : 1 },
                ],
              },
            ]}
          >
            {/* Dragon Wing Main Bone */}
            <View
              style={[
                styles.dragonBone,
                {
                  width: 22 * scale,
                  height: 32 * scale,
                  borderColor: theme.accent,
                  backgroundColor: `${theme.primary}50`,
                },
              ]}
            >
              {/* Dragon Claws on knuckle */}
              <View
                style={[
                  styles.dragonClaw,
                  {
                    top: -2 * scale,
                    right: -2 * scale,
                    backgroundColor: theme.accent,
                  },
                ]}
              />
            </View>
            {/* Inner Webbing Membrane */}
            <Animated.View
              style={[
                styles.dragonMembrane,
                {
                  width: 15 * scale,
                  height: 22 * scale,
                  top: 7 * scale,
                  left: 4 * scale,
                  backgroundColor: `${theme.secondary}90`,
                  transform: [{ rotate: animated ? leftWingSecRotate : '-20deg' }],
                },
              ]}
            />
          </Animated.View>

          {/* Right Dragon Wing */}
          <Animated.View
            style={[
              styles.wingGroup,
              {
                top: 2 * scale,
                right: -2 * scale,
                transform: [
                  { rotate: animated ? rightWingRotate : '28deg' },
                  { scale: animated ? wingScale : 1 },
                ],
              },
            ]}
          >
            <View
              style={[
                styles.dragonBone,
                styles.dragonBoneRight,
                {
                  width: 22 * scale,
                  height: 32 * scale,
                  borderColor: theme.accent,
                  backgroundColor: `${theme.primary}50`,
                },
              ]}
            >
              <View
                style={[
                  styles.dragonClaw,
                  {
                    top: -2 * scale,
                    left: -2 * scale,
                    backgroundColor: theme.accent,
                  },
                ]}
              />
            </View>
            <Animated.View
              style={[
                styles.dragonMembrane,
                styles.dragonMembraneRight,
                {
                  width: 15 * scale,
                  height: 22 * scale,
                  top: 7 * scale,
                  right: 4 * scale,
                  backgroundColor: `${theme.secondary}90`,
                  transform: [{ rotate: animated ? rightWingSecRotate : '20deg' }],
                },
              ]}
            />
          </Animated.View>

          {/* Dragon Horns at top */}
          <View style={styles.dragonHornsWrap}>
            <View
              style={[
                styles.dragonHorn,
                styles.dragonHornLeft,
                {
                  width: 6 * scale,
                  height: 14 * scale,
                  backgroundColor: theme.accent,
                  borderColor: '#FFFFFF',
                },
              ]}
            />
            <View
              style={[
                styles.dragonHorn,
                styles.dragonHornRight,
                {
                  width: 6 * scale,
                  height: 14 * scale,
                  backgroundColor: theme.accent,
                  borderColor: '#FFFFFF',
                },
              ]}
            />
          </View>
        </>
      );
    }

    if (resolvedFrame === 'seraph') {
      // 👑 THIÊN THẦN SERAPHIM: 6 Golden Wings (Upper, Middle, Lower)
      return (
        <>
          {/* Upper High Wings (Left & Right) */}
          <Animated.View
            style={[
              styles.wingGroup,
              {
                top: -4 * scale,
                left: -3 * scale,
                transform: [
                  { rotate: animated ? leftWingRotate : '-30deg' },
                  { scale: animated ? wingScale : 1 },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={['#FEF08A', '#F59E0B']}
              style={[
                styles.seraphUpperWing,
                { width: 20 * scale, height: 34 * scale, borderColor: '#FFFFFF' },
              ]}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.wingGroup,
              {
                top: -4 * scale,
                right: -3 * scale,
                transform: [
                  { rotate: animated ? rightWingRotate : '30deg' },
                  { scale: animated ? wingScale : 1 },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={['#FEF08A', '#F59E0B']}
              style={[
                styles.seraphUpperWing,
                styles.seraphUpperWingRight,
                { width: 20 * scale, height: 34 * scale, borderColor: '#FFFFFF' },
              ]}
            />
          </Animated.View>

          {/* Middle Spreading Wings */}
          <Animated.View
            style={[
              styles.wingGroup,
              {
                top: 10 * scale,
                left: -7 * scale,
                transform: [
                  { rotate: animated ? leftWingSecRotate : '-15deg' },
                  { scale: animated ? wingScale : 1 },
                ],
              },
            ]}
          >
            <View
              style={[
                styles.seraphMidWing,
                {
                  width: 16 * scale,
                  height: 24 * scale,
                  borderColor: theme.accent,
                  backgroundColor: `${theme.primary}75`,
                },
              ]}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.wingGroup,
              {
                top: 10 * scale,
                right: -7 * scale,
                transform: [
                  { rotate: animated ? rightWingSecRotate : '15deg' },
                  { scale: animated ? wingScale : 1 },
                ],
              },
            ]}
          >
            <View
              style={[
                styles.seraphMidWing,
                styles.seraphMidWingRight,
                {
                  width: 16 * scale,
                  height: 24 * scale,
                  borderColor: theme.accent,
                  backgroundColor: `${theme.primary}75`,
                },
              ]}
            />
          </Animated.View>
        </>
      );
    }

    if (resolvedFrame === 'phoenix') {
      // 🔥 PHƯỢNG HOÀNG LỬA: 3-tiered Fiery Feather plumes
      return (
        <>
          {/* Left Wing 3-tier Flame Plumes */}
          <Animated.View
            style={[
              styles.wingGroup,
              {
                top: 0,
                left: -3 * scale,
                transform: [
                  { rotate: animated ? leftWingRotate : '-32deg' },
                  { scale: animated ? wingScale : 1 },
                ],
              },
            ]}
          >
            {/* Top Primary Flame Feather */}
            <LinearGradient
              colors={['#FBBF24', '#EF4444', '#7F1D1D']}
              style={[
                styles.phoenixFeather,
                {
                  width: 22 * scale,
                  height: 36 * scale,
                  borderColor: '#FED7AA',
                },
              ]}
            />
            {/* Middle Secondary Flame Feather */}
            <Animated.View
              style={[
                styles.phoenixMidFeather,
                {
                  width: 14 * scale,
                  height: 22 * scale,
                  top: 8 * scale,
                  left: 4 * scale,
                  transform: [{ rotate: animated ? leftWingSecRotate : '-22deg' }],
                },
              ]}
            >
              <LinearGradient
                colors={['#FDE047', '#EA580C']}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
            {/* Lower Plume Accent */}
            <Animated.View
              style={[
                styles.phoenixLowFeather,
                {
                  width: 10 * scale,
                  height: 16 * scale,
                  top: 16 * scale,
                  left: 7 * scale,
                  backgroundColor: '#DC2626',
                  transform: [{ rotate: animated ? leftWingTertRotate : '-14deg' }],
                },
              ]}
            />
          </Animated.View>

          {/* Right Wing 3-tier Flame Plumes */}
          <Animated.View
            style={[
              styles.wingGroup,
              {
                top: 0,
                right: -3 * scale,
                transform: [
                  { rotate: animated ? rightWingRotate : '32deg' },
                  { scale: animated ? wingScale : 1 },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={['#FBBF24', '#EF4444', '#7F1D1D']}
              style={[
                styles.phoenixFeather,
                styles.phoenixFeatherRight,
                {
                  width: 22 * scale,
                  height: 36 * scale,
                  borderColor: '#FED7AA',
                },
              ]}
            />
            <Animated.View
              style={[
                styles.phoenixMidFeather,
                styles.phoenixMidFeatherRight,
                {
                  width: 14 * scale,
                  height: 22 * scale,
                  top: 8 * scale,
                  right: 4 * scale,
                  transform: [{ rotate: animated ? rightWingSecRotate : '22deg' }],
                },
              ]}
            >
              <LinearGradient
                colors={['#FDE047', '#EA580C']}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
            <Animated.View
              style={[
                styles.phoenixLowFeather,
                styles.phoenixLowFeatherRight,
                {
                  width: 10 * scale,
                  height: 16 * scale,
                  top: 16 * scale,
                  right: 7 * scale,
                  backgroundColor: '#DC2626',
                  transform: [{ rotate: animated ? rightWingTertRotate : '14deg' }],
                },
              ]}
            />
          </Animated.View>
        </>
      );
    }

    // Default / Eagle / Ice Wolf: Dual Crystalline Feathers
    return (
      <>
        {/* Left Wing Group */}
        <Animated.View
          style={[
            styles.wingGroup,
            {
              top: 2 * scale,
              left: 0,
              transform: [
                { rotate: animated ? leftWingRotate : '-28deg' },
                { scale: animated ? wingScale : 1 },
              ],
            },
          ]}
        >
          <View
            style={[
              styles.classicWingOuter,
              {
                width: 20 * scale,
                height: 30 * scale,
                borderColor: theme.flame,
                backgroundColor: `${theme.wingColor}45`,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.classicWingInner,
              {
                width: 13 * scale,
                height: 21 * scale,
                top: 7 * scale,
                left: 4 * scale,
                backgroundColor: theme.primary,
                transform: [{ rotate: animated ? leftWingSecRotate : '-38deg' }],
              },
            ]}
          />
        </Animated.View>

        {/* Right Wing Group */}
        <Animated.View
          style={[
            styles.wingGroup,
            {
              top: 2 * scale,
              right: 0,
              transform: [
                { rotate: animated ? rightWingRotate : '28deg' },
                { scale: animated ? wingScale : 1 },
              ],
            },
          ]}
        >
          <View
            style={[
              styles.classicWingOuter,
              styles.classicWingOuterRight,
              {
                width: 20 * scale,
                height: 30 * scale,
                borderColor: theme.flame,
                backgroundColor: `${theme.wingColor}45`,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.classicWingInner,
              styles.classicWingInnerRight,
              {
                width: 13 * scale,
                height: 21 * scale,
                top: 7 * scale,
                right: 4 * scale,
                backgroundColor: theme.primary,
                transform: [{ rotate: animated ? rightWingSecRotate : '38deg' }],
              },
            ]}
          />
        </Animated.View>
      </>
    );
  };

  const content = (
    <Animated.View
      style={[
        styles.container,
        {
          width: size + 26 * scale,
          height: size + 26 * scale,
        },
        style,
      ]}
    >
      {/* Floating Animated Avatar Body */}
      <Animated.View
        style={[
          styles.avatarBody,
          {
            transform: [
              { translateY: animated ? floatTranslateY : 0 },
              { scale: Animated.multiply(pressScale, animated ? floatScale : 1) },
            ],
          },
        ]}
      >
        {/* Rotating Sunburst Halo Rays (For Seraph & Phoenix) */}
        {animated && (resolvedFrame === 'seraph' || resolvedFrame === 'phoenix') && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.sunburstRaysWrap,
              {
                width: size + 24 * scale,
                height: size + 24 * scale,
                transform: [{ rotate: rayRotateInterpolate }],
              },
            ]}
          >
            {[0, 45, 90, 135].map((deg) => (
              <View
                key={deg}
                style={[
                  styles.sunburstBeam,
                  {
                    transform: [{ rotate: `${deg}deg` }],
                    backgroundColor: `${theme.accent}33`,
                    width: size + 24 * scale,
                    height: 2 * scale,
                  },
                ]}
              />
            ))}
          </Animated.View>
        )}

        {/* Expanding Radiant Shockwave Burst */}
        {animated && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.shockwaveRing,
              {
                width: size + 10 * scale,
                height: size + 10 * scale,
                borderRadius: (size + 10 * scale) / 2,
                borderColor: theme.flame,
                transform: [{ scale: shockwaveScale }],
                opacity: shockwaveOpacity,
              },
            ]}
          />
        )}

        {/* 360-degree Rotating Celestial Orbit Ring with Satellite Orbs */}
        {animated && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.orbitRing,
              {
                width: size + 18 * scale,
                height: size + 18 * scale,
                borderRadius: (size + 18 * scale) / 2,
                transform: [{ rotate: rotateInterpolate }],
              },
            ]}
          >
            {/* Luminous dashed orbit trajectory */}
            <View
              style={[
                styles.orbitTrajectory,
                {
                  borderColor: `${theme.flame}55`,
                  borderRadius: (size + 18 * scale) / 2,
                },
              ]}
            />

            {/* Orbiting Star Orb 1 (Top / North) */}
            <View
              style={[
                styles.orbitOrb,
                styles.orbitOrbNorth,
                {
                  width: 7.5 * scale,
                  height: 7.5 * scale,
                  borderRadius: 3.75 * scale,
                  backgroundColor: theme.flame,
                  shadowColor: theme.glow,
                },
              ]}
            >
              <View style={[styles.orbitOrbCore, { width: 3.5 * scale, height: 3.5 * scale }]} />
            </View>

            {/* Orbiting Star Orb 2 (Bottom / South) */}
            <View
              style={[
                styles.orbitOrb,
                styles.orbitOrbSouth,
                {
                  width: 6.5 * scale,
                  height: 6.5 * scale,
                  borderRadius: 3.25 * scale,
                  backgroundColor: theme.accent,
                  shadowColor: theme.accent,
                },
              ]}
            >
              <View style={[styles.orbitOrbCore, { width: 3 * scale, height: 3 * scale }]} />
            </View>

            {/* Orbiting Star Orbs (East & West) */}
            <View
              style={[
                styles.orbitOrb,
                styles.orbitOrbEast,
                {
                  width: 5.5 * scale,
                  height: 5.5 * scale,
                  borderRadius: 2.75 * scale,
                  backgroundColor: theme.primary,
                  shadowColor: theme.glow,
                },
              ]}
            />
            <View
              style={[
                styles.orbitOrb,
                styles.orbitOrbWest,
                {
                  width: 5.5 * scale,
                  height: 5.5 * scale,
                  borderRadius: 2.75 * scale,
                  backgroundColor: theme.primary,
                  shadowColor: theme.glow,
                },
              ]}
            />
          </Animated.View>
        )}

        {/* Counter-rotating mystic particles */}
        {animated && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.orbitRing,
              {
                width: size + 24 * scale,
                height: size + 24 * scale,
                borderRadius: (size + 24 * scale) / 2,
                transform: [{ rotate: counterRotateInterpolate }],
              },
            ]}
          >
            <View
              style={[
                styles.orbitOrb,
                {
                  top: 2,
                  right: '25%',
                  width: 4.5 * scale,
                  height: 4.5 * scale,
                  borderRadius: 2.25 * scale,
                  backgroundColor: theme.flame,
                  shadowColor: theme.flame,
                },
              ]}
            />
            <View
              style={[
                styles.orbitOrb,
                {
                  bottom: 2,
                  left: '25%',
                  width: 4.5 * scale,
                  height: 4.5 * scale,
                  borderRadius: 2.25 * scale,
                  backgroundColor: theme.accent,
                  shadowColor: theme.accent,
                },
              ]}
            />
          </Animated.View>
        )}

        {/* Mythic Wings (Phoenix, Dragon, Eagle, Seraph, Ice Wolf) */}
        {renderMythicWings()}

        {/* Apex Crown Crest Jewel */}
        {showWings && (
          <>
            <Animated.View
              style={[
                styles.crownJewel,
                {
                  width: 11 * scale,
                  height: 11 * scale,
                  top: -1 * scale,
                  backgroundColor: theme.accent,
                  borderColor: '#FFFFFF',
                  transform: [
                    { rotate: '45deg' },
                    { scale: animated ? crownScale : 1 },
                  ],
                  opacity: animated ? crownOpacity : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.crownInnerCore,
                  {
                    width: 4 * scale,
                    height: 4 * scale,
                    backgroundColor: '#FFFFFF',
                  },
                ]}
              />
            </Animated.View>

            {/* Crown Sparkle Star */}
            {animated && (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.crownSparkle,
                  {
                    top: -6 * scale,
                    transform: [{ scale: crownScale }],
                    opacity: crownOpacity,
                  },
                ]}
              >
                <Ionicons name="sparkles" size={Math.round(11 * scale)} color={theme.flame} />
              </Animated.View>
            )}
          </>
        )}

        {/* Outer Tier Glow Aura Ring (Breathing Pulse) */}
        <Animated.View
          style={[
            styles.glowRing,
            {
              width: size + 4,
              height: size + 4,
              borderRadius: (size + 4) / 2,
              shadowColor: theme.glow,
              borderColor: theme.border,
              transform: [{ scale: animated ? auraScale : 1 }],
              opacity: animated ? auraOpacity : 0.85,
            },
          ]}
        >
          {/* Tier Gradient Bezel Frame */}
          <LinearGradient
            colors={theme.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.gradientBezel,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
              },
            ]}
          >
            {/* Inner Dark Mystical Chamber */}
            <View
              style={[
                styles.innerChamber,
                {
                  width: innerSize,
                  height: innerSize,
                  borderRadius: innerSize / 2,
                },
              ]}
            >
              {/* If custom image uploaded, render Image */}
              {isCustomImage ? (
                <Image
                  source={{ uri: avatar }}
                  style={{
                    width: innerSize,
                    height: innerSize,
                    borderRadius: innerSize / 2,
                  }}
                  resizeMode="cover"
                />
              ) : (
                <>
                  {/* Ambient Background Aura */}
                  <LinearGradient
                    colors={[`${preset.color}35`, `${preset.bg}CC`, 'rgba(10, 16, 28, 0.95)']}
                    style={StyleSheet.absoluteFill}
                  />

                  {/* Preset Avatar Icon */}
                  <View style={styles.avatarCore}>
                    <Ionicons name={preset.icon} size={Math.round(26 * scale)} color={preset.color} />
                  </View>
                </>
              )}

              {/* Metallic Specular Shimmer Streak Sweep */}
              {animated && (
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.shimmerStreak,
                    {
                      width: innerSize * 0.8,
                      height: innerSize * 2.2,
                      transform: [
                        { translateX: shimmerTranslateX },
                        { rotate: '-25deg' },
                      ],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[
                      'rgba(255, 255, 255, 0)',
                      'rgba(255, 255, 255, 0.15)',
                      'rgba(255, 255, 255, 0.75)',
                      'rgba(255, 255, 255, 0.15)',
                      'rgba(255, 255, 255, 0)',
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                </Animated.View>
              )}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* 4 Rising Elemental Sparks */}
        {animated && (
          <>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.particle,
                {
                  left: 1 * scale,
                  bottom: 8 * scale,
                  transform: [{ translateY: p1TranslateY }, { translateX: p1TranslateX }],
                  opacity: p1Opacity,
                },
              ]}
            >
              <View
                style={[
                  styles.particleDot,
                  {
                    width: 4.5 * scale,
                    height: 4.5 * scale,
                    borderRadius: 2.25 * scale,
                    backgroundColor: theme.flame,
                    shadowColor: theme.flame,
                  },
                ]}
              />
            </Animated.View>

            <Animated.View
              pointerEvents="none"
              style={[
                styles.particle,
                {
                  right: 1 * scale,
                  bottom: 10 * scale,
                  transform: [{ translateY: p2TranslateY }, { translateX: p2TranslateX }],
                  opacity: p2Opacity,
                },
              ]}
            >
              <View
                style={[
                  styles.particleDot,
                  {
                    width: 4 * scale,
                    height: 4 * scale,
                    borderRadius: 2 * scale,
                    backgroundColor: theme.accent,
                    shadowColor: theme.accent,
                  },
                ]}
              />
            </Animated.View>

            <Animated.View
              pointerEvents="none"
              style={[
                styles.particle,
                {
                  left: 6 * scale,
                  bottom: 4 * scale,
                  transform: [{ translateY: p3TranslateY }, { translateX: p3TranslateX }],
                  opacity: p3Opacity,
                },
              ]}
            >
              <View
                style={[
                  styles.particleDot,
                  {
                    width: 3 * scale,
                    height: 3 * scale,
                    borderRadius: 1.5 * scale,
                    backgroundColor: theme.particleColor,
                    shadowColor: theme.particleColor,
                  },
                ]}
              />
            </Animated.View>

            <Animated.View
              pointerEvents="none"
              style={[
                styles.particle,
                {
                  right: 6 * scale,
                  bottom: 5 * scale,
                  transform: [{ translateY: p4TranslateY }, { translateX: p4TranslateX }],
                  opacity: p4Opacity,
                },
              ]}
            >
              <View
                style={[
                  styles.particleDot,
                  {
                    width: 3 * scale,
                    height: 3 * scale,
                    borderRadius: 1.5 * scale,
                    backgroundColor: theme.accent,
                    shadowColor: theme.accent,
                  },
                ]}
              />
            </Animated.View>
          </>
        )}

        {/* Bottom Level Shield Badge */}
        {showBadge && (
          <Animated.View
            style={[
              styles.badgeWrap,
              {
                bottom: -2 * scale,
                transform: [{ scale: animated ? badgeScale : 1 }],
              },
            ]}
          >
            {/* Ribbons */}
            <View
              style={[
                styles.ribbonTail,
                {
                  left: -6 * scale,
                  borderColor: theme.accent,
                  backgroundColor: theme.primary,
                  transform: [{ rotate: '25deg' }],
                },
              ]}
            />
            <View
              style={[
                styles.ribbonTail,
                {
                  right: -6 * scale,
                  borderColor: theme.accent,
                  backgroundColor: theme.primary,
                  transform: [{ rotate: '-25deg' }],
                },
              ]}
            />

            {/* Badge Center */}
            <LinearGradient
              colors={theme.badgeBg}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.badgePill,
                {
                  width: badgeWidth,
                  height: badgeHeight,
                  borderRadius: badgeHeight / 2,
                  borderColor: '#FFFFFF',
                },
              ]}
            >
              <Text style={[styles.badgeText, { fontSize: badgeFontSize }]}>
                Lv.{tierOverride ?? safeLevel}
              </Text>
            </LinearGradient>
          </Animated.View>
        )}
      </Animated.View>
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.pressableWrap}
      >
        {content}
      </Pressable>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pressableWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBody: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  sunburstRaysWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  sunburstBeam: {
    position: 'absolute',
    borderRadius: 2,
  },
  shockwaveRing: {
    position: 'absolute',
    borderWidth: 1.5,
    zIndex: 0,
  },
  orbitRing: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  orbitTrajectory: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  orbitOrb: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 5,
    elevation: 4,
  },
  orbitOrbNorth: {
    top: -4,
  },
  orbitOrbSouth: {
    bottom: -4,
  },
  orbitOrbEast: {
    right: -3,
  },
  orbitOrbWest: {
    left: -3,
  },
  orbitOrbCore: {
    backgroundColor: '#FFFFFF',
    borderRadius: 99,
  },
  glowRing: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.9,
    shadowRadius: 14,
    elevation: 9,
    zIndex: 2,
  },
  gradientBezel: {
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerChamber: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    backgroundColor: '#090D16',
    position: 'relative',
  },
  avatarCore: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shimmerStreak: {
    position: 'absolute',
    top: -30,
    bottom: -30,
    zIndex: 4,
  },
  wingGroup: {
    position: 'absolute',
    zIndex: 1,
  },
  // Classic / Eagle Wings
  classicWingOuter: {
    borderWidth: 1.5,
    borderTopLeftRadius: 18,
    borderBottomRightRadius: 18,
    opacity: 0.95,
  },
  classicWingOuterRight: {
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderTopLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  classicWingInner: {
    position: 'absolute',
    borderTopLeftRadius: 12,
    borderBottomRightRadius: 12,
    opacity: 0.9,
  },
  classicWingInnerRight: {
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderTopLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  // 🐉 Dragon Wings & Horns
  dragonBone: {
    borderWidth: 1.8,
    borderTopLeftRadius: 22,
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 14,
    position: 'relative',
  },
  dragonBoneRight: {
    borderTopRightRadius: 22,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 14,
    borderTopLeftRadius: 0,
  },
  dragonClaw: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  dragonMembrane: {
    position: 'absolute',
    borderTopLeftRadius: 16,
    borderBottomRightRadius: 6,
    opacity: 0.9,
  },
  dragonMembraneRight: {
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 6,
    borderTopLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dragonHornsWrap: {
    position: 'absolute',
    top: -6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 28,
    zIndex: 3,
  },
  dragonHorn: {
    borderWidth: 1,
    borderRadius: 3,
  },
  dragonHornLeft: {
    transform: [{ rotate: '-28deg' }],
  },
  dragonHornRight: {
    transform: [{ rotate: '28deg' }],
  },
  // 🔥 Phoenix Feathers
  phoenixFeather: {
    borderWidth: 1.5,
    borderTopLeftRadius: 22,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 4,
    opacity: 0.95,
  },
  phoenixFeatherRight: {
    borderTopRightRadius: 22,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 4,
    borderTopLeftRadius: 0,
  },
  phoenixMidFeather: {
    position: 'absolute',
    borderTopLeftRadius: 14,
    borderBottomRightRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FDE047',
  },
  phoenixMidFeatherRight: {
    borderTopRightRadius: 14,
    borderBottomLeftRadius: 10,
    borderTopLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  phoenixLowFeather: {
    position: 'absolute',
    borderTopLeftRadius: 10,
    borderBottomRightRadius: 8,
    borderWidth: 1,
    borderColor: '#FFA500',
  },
  phoenixLowFeatherRight: {
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 8,
    borderTopLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  // 👑 Seraphim Wings
  seraphUpperWing: {
    borderWidth: 1.5,
    borderTopLeftRadius: 22,
    borderBottomRightRadius: 18,
    shadowColor: '#FDE047',
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  seraphUpperWingRight: {
    borderTopRightRadius: 22,
    borderBottomLeftRadius: 18,
    borderTopLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  seraphMidWing: {
    position: 'absolute',
    borderWidth: 1.2,
    borderTopLeftRadius: 14,
    borderBottomRightRadius: 10,
  },
  seraphMidWingRight: {
    borderTopRightRadius: 14,
    borderBottomLeftRadius: 10,
    borderTopLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  // Crown Crest
  crownJewel: {
    position: 'absolute',
    borderWidth: 1.2,
    alignSelf: 'center',
    zIndex: 4,
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.95,
    shadowRadius: 6,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crownInnerCore: {
    borderRadius: 2,
  },
  crownSparkle: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 5,
  },
  particle: {
    position: 'absolute',
    zIndex: 4,
  },
  particleDot: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 5,
    elevation: 4,
  },
  badgeWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  badgePill: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  ribbonTail: {
    position: 'absolute',
    width: 10,
    height: 7,
    borderWidth: 1,
    borderRadius: 2,
    zIndex: -1,
  },
});
