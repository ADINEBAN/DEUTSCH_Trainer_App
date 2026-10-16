import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { isServerTtsAvailable, speakText, stopTts, ttsStatusLabel, type TtsStatus } from '@/src/services/tts.service';
import { colors, liquidGradients, radius } from '@/src/theme';

export function ListenButton({
  text,
  size = 20,
  showLabel = false,
}: {
  text: string;
  size?: number;
  showLabel?: boolean;
}) {
  const [status, setStatus] = useState<TtsStatus>('idle');
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      stopTts().catch(() => undefined);
    };
  }, []);

  const busy = status === 'creating';
  const isPlaying = status === 'playing-george' || status === 'playing-cache' || status === 'fallback';

  const onPress = useCallback(async () => {
    if (busy) return;
    if (isPlaying) {
      await stopTts().catch(() => undefined);
      if (mounted.current) setStatus('idle');
      return;
    }
    const fastVoice = isServerTtsAvailable() === false;
    setStatus(fastVoice ? 'fallback' : 'creating');
    try {
      await speakText(text, {
        onStatus: (s) => mounted.current && setStatus(s),
        onDone: () => mounted.current && setStatus('idle'),
        onError: () => mounted.current && setStatus('idle'),
      });
    } catch {
      if (mounted.current) setStatus('idle');
    }
  }, [text, busy, isPlaying]);

  const isFallback = status === 'fallback';
  const label = busy ? ttsStatusLabel('creating') : isFallback ? ttsStatusLabel('fallback') : null;

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          isPlaying && styles.buttonPlaying,
          pressed && styles.pressed,
        ]}
        accessibilityLabel="Nghe phát âm"
      >
        {/* Liquid Glass Background */}
        <LinearGradient
          colors={
            isPlaying
              ? liquidGradients.ocean
              : ['rgba(255, 255, 255, 0.45)', 'rgba(235, 245, 255, 0.16)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* 3D Specular Dome Shine */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.85)', 'rgba(255, 255, 255, 0.20)', 'transparent']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.specular}
          pointerEvents="none"
        />

        {/* Prismatic edge */}
        <LinearGradient
          colors={['transparent', 'rgba(100, 220, 255, 0.3)', 'rgba(255, 180, 100, 0.25)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={styles.prism}
          pointerEvents="none"
        />

        <View style={styles.iconContainer}>
          {busy ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons
              name={
                isPlaying
                  ? 'volume-high'
                  : isFallback
                  ? 'volume-medium-outline'
                  : 'volume-medium'
              }
              size={size}
              color={isPlaying ? colors.white : isFallback ? colors.orange : colors.primary}
            />
          )}
        </View>
      </Pressable>
      {showLabel && label ? <Text style={styles.status}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  button: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#102A43',
        shadowOpacity: 0.10,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
      },
      web: {
        boxShadow: '0 2px 10px rgba(16, 42, 67, 0.08)',
      } as object,
    }),
  },
  buttonPlaying: {
    shadowOpacity: 0.5,
    shadowRadius: 14,
  },
  specular: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderRadius: 21,
  },
  prism: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 12,
    borderRadius: 21,
  },
  iconContainer: {
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    transform: [{ scale: 0.94 }],
    opacity: 0.9,
  },
  status: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.inkMuted,
    maxWidth: 140,
  },
});
