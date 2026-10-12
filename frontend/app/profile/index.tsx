import { useCallback, useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/src/components/ui/Screen';
import { GlassButton } from '@/src/components/ui/GlassButton';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { GlassInput } from '@/src/components/ui/GlassInput';
import { Chip } from '@/src/components/ui/Chip';
import { SectionTitle, StatTile } from '@/src/components/ui/Section';
import { ErrorState, LoadingState } from '@/src/components/ui/States';
import { useAuth } from '@/src/context/AuthContext';
import { authService } from '@/src/services/auth.service';
import { GERMAN_LEVELS } from '@/src/config/modules';
import {
  clearTtsFileCache,
  getOwnSpeechifyKey,
  getTtsFileCacheSize,
  removeOwnSpeechifyKey,
  saveOwnSpeechifyKey,
  speakText,
  ttsStatusLabel,
  type TtsStatus,
} from '@/src/services/tts.service';
import { colors, spacing } from '@/src/theme';
import type { DashboardStats, GermanLevel } from '@/src/types';

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

interface LocalAchievement {
  title: string;
  desc: string;
  unlocked: boolean;
}

export default function ProfileScreen() {
  const { user, refreshUser } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [targetModal, setTargetModal] = useState(false);
  const [targetLevel, setTargetLevel] = useState<GermanLevel>('B1');
  const [savingTarget, setSavingTarget] = useState(false);
  const [ownKey, setOwnKey] = useState('');
  const [hasOwnKey, setHasOwnKey] = useState(false);
  const [keyBusy, setKeyBusy] = useState(false);
  const [ttsStatus, setTtsStatus] = useState<TtsStatus>('idle');
  const [cacheSize, setCacheSize] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, key, size] = await Promise.all([
        authService.dashboard(),
        getOwnSpeechifyKey(),
        getTtsFileCacheSize(),
      ]);
      setStats(s);
      setHasOwnKey(!!key);
      setCacheSize(size);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được hồ sơ.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveTarget = async () => {
    setSavingTarget(true);
    try {
      await authService.updateMe({ targetLevel });
      await refreshUser();
      setTargetModal(false);
    } catch {
      // keep modal open on failure
    } finally {
      setSavingTarget(false);
    }
  };

  const testVoice = async () => {
    setTtsStatus('creating');
    try {
      await speakText('Hallo! Ich bin dein Deutsch-Coach. Lass uns gemeinsam Deutsch lernen.', {
        onStatus: setTtsStatus,
        onDone: () => setTtsStatus('idle'),
        onError: () => setTtsStatus('idle'),
      });
      setTtsStatus('idle');
    } catch {
      setTtsStatus('idle');
    }
  };

  const saveKey = async () => {
    if (!ownKey.trim()) return;
    setKeyBusy(true);
    try {
      await saveOwnSpeechifyKey(ownKey);
      setHasOwnKey(true);
      setOwnKey('');
    } finally {
      setKeyBusy(false);
    }
  };

  const clearKey = async () => {
    setKeyBusy(true);
    try {
      await removeOwnSpeechifyKey();
      setHasOwnKey(false);
    } finally {
      setKeyBusy(false);
    }
  };

  const clearCache = async () => {
    await clearTtsFileCache();
    setCacheSize(await getTtsFileCacheSize());
  };

  const achievements: LocalAchievement[] = stats
    ? [
        { title: '🔥 Tuần đầu tiên', desc: 'Streak 7 ngày', unlocked: stats.streakDays >= 7 },
        { title: '⭐ Ngàn XP', desc: 'Đạt 1.000 XP', unlocked: stats.xp >= 1000 },
        { title: '🎯 Chạm B1', desc: 'Điểm ước lượng ≥ 60 (trình độ B1)', unlocked: stats.estimatedScore >= 60 },
        { title: '🏆 Chạm C2', desc: 'Điểm ước lượng ≥ 90 (trình độ C2)', unlocked: stats.estimatedScore >= 90 },
      ]
    : [];

  return (
    <Screen>
      <Text style={styles.title}>Hồ sơ</Text>

      <GlassCard>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.target}>
          Mục tiêu: <Text style={styles.targetValue}>{user?.targetLevel ?? '—'}</Text>
        </Text>
        <GlassButton title="Đổi trình độ mục tiêu" variant="outline" onPress={() => {
          setTargetLevel(user?.targetLevel ?? 'B1');
          setTargetModal(true);
        }} style={styles.cta} />
      </GlassCard>

      {loading ? (
        <LoadingState message="Đang tải thống kê…" />
      ) : error || !stats ? (
        <ErrorState message={error ?? 'Không có dữ liệu.'} onRetry={load} />
      ) : (
        <View>
          <SectionTitle title="Thống kê" />
          <View style={styles.tiles}>
            <StatTile icon="speedometer" label="Điểm ước lượng" value={`${stats.estimatedScore}/100`} />
            <StatTile icon="flame" label="Streak" value={`${stats.streakDays} ngày`} color={colors.orange} />
          </View>
          <View style={styles.tiles}>
            <StatTile icon="star" label="XP" value={stats.xp} />
            <StatTile icon="trophy" label="Cấp độ" value={stats.level} color={colors.teal} />
          </View>

          <SectionTitle title="Thành tích" />
          {achievements.map((a) => (
            <GlassCard key={a.title} style={a.unlocked ? undefined : styles.locked}>
              <Text style={styles.achTitle}>{a.title}</Text>
              <Text style={styles.achDesc}>
                {a.desc} — {a.unlocked ? 'Đã mở khoá ✅' : 'Chưa mở khoá'}
              </Text>
            </GlassCard>
          ))}
        </View>
      )}

      <SectionTitle title="Giọng đọc" />
      <GlassCard>
        <Text style={styles.voiceNote}>
          Mặc định: giọng tiếng Đức do backend quản lý — bạn không cần nhập gì.
        </Text>
        <GlassButton title="🔊 Nghe thử giọng đọc" variant="outline" onPress={testVoice} style={styles.cta} />
        {ttsStatus !== 'idle' ? <Text style={styles.voiceStatus}>{ttsStatusLabel(ttsStatus)}</Text> : null}
        <Text style={styles.voiceCache}>Bộ nhớ đệm audio trên máy: {formatBytes(cacheSize)}</Text>
        <GlassButton title="Xoá bộ nhớ đệm audio" variant="ghost" onPress={clearCache} />
      </GlassCard>

      <GlassCard>
        <Text style={styles.ownKeyTitle}>Khóa Speechify của riêng bạn (tùy chọn)</Text>
        <Text style={styles.ownKeyDesc}>
          Chỉ dùng khi bạn muốn app gọi Speechify trực tiếp thay vì qua backend. Khóa chỉ lưu trên máy
          này, không gửi đi đâu khác.
        </Text>
        {hasOwnKey ? (
          <View>
            <Text style={styles.ownKeySet}>✅ Đã lưu khóa riêng trên máy này</Text>
            <GlassButton title="Xoá khóa riêng" variant="danger" onPress={clearKey} loading={keyBusy} style={styles.cta} />
          </View>
        ) : (
          <View>
            <GlassInput
              label="Speechify API key"
              value={ownKey}
              onChangeText={setOwnKey}
              secureTextEntry
              autoCapitalize="none"
              placeholder="Dán khóa của bạn…"
            />
            <GlassButton title="Lưu khóa trên máy" onPress={saveKey} loading={keyBusy} disabled={!ownKey.trim()} style={styles.cta} />
          </View>
        )}
      </GlassCard>

      <Modal visible={targetModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Trình độ mục tiêu</Text>
            <View style={styles.chips}>
              {GERMAN_LEVELS.map((l) => (
                <Chip key={l} label={l} selected={targetLevel === l} onPress={() => setTargetLevel(l)} />
              ))}
            </View>
            <Text style={styles.levelHint}>Từ A1 (cơ bản) đến C2 (thành thạo).</Text>
            <View style={styles.modalActions}>
              <GlassButton title="Huỷ" variant="ghost" onPress={() => setTargetModal(false)} />
              <GlassButton title="Lưu" onPress={saveTarget} loading={savingTarget} />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '800', color: colors.ink, marginTop: spacing.sm },
  name: { fontSize: 20, fontWeight: '800', color: colors.ink },
  email: { fontSize: 14, color: colors.inkSoft, marginTop: 2 },
  target: { fontSize: 15, color: colors.ink, marginTop: spacing.sm },
  targetValue: { fontWeight: '800', color: colors.primary },
  cta: { marginTop: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  levelHint: { fontSize: 13, color: colors.inkSoft, marginTop: spacing.sm },
  tiles: { flexDirection: 'row', marginHorizontal: -4, marginBottom: spacing.sm },
  locked: { opacity: 0.65 },
  achTitle: { fontSize: 15, fontWeight: '800', color: colors.ink },
  achDesc: { fontSize: 13, color: colors.inkSoft, marginTop: 2 },
  voiceNote: { fontSize: 13, color: colors.inkSoft, lineHeight: 19 },
  voiceStatus: { fontSize: 13, color: colors.primary, marginTop: 6, fontWeight: '600' },
  voiceCache: { fontSize: 13, color: colors.inkSoft, marginTop: 6 },
  ownKeyTitle: { fontSize: 15, fontWeight: '800', color: colors.ink },
  ownKeyDesc: { fontSize: 13, color: colors.inkSoft, marginTop: 4, lineHeight: 19 },
  ownKeySet: { fontSize: 14, color: colors.success, fontWeight: '600', marginTop: spacing.sm },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(18,50,79,0.35)', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: colors.sky,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
  },
  modalTitle: { fontSize: 19, fontWeight: '800', color: colors.ink, marginBottom: spacing.sm },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: spacing.md },
});
