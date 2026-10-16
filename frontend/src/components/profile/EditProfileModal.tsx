import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { GlassInput } from '@/src/components/ui/GlassInput';
import { GlassButton } from '@/src/components/ui/GlassButton';
import { LevelAvatar } from '@/src/components/ui/LevelAvatar';
import {
  AVATAR_PRESETS,
  LEVEL_TIERS,
  MYTHIC_FRAMES,
  getTierForLevel,
  getUserAvatar,
  setUserAvatar,
  getUserFrame,
  setUserFrame,
  type MythicFrameType,
} from '@/src/utils/levelTiers';
import { authService } from '@/src/services/auth.service';
import { GERMAN_LEVELS } from '@/src/config/modules';
import { colors, radius, spacing } from '@/src/theme';
import type { GermanLevel, User } from '@/src/types';

interface EditProfileModalProps {
  visible: boolean;
  user: User | null;
  level?: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  user,
  level = 1,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('wolf_ice');
  const [selectedFrame, setSelectedFrame] = useState<MythicFrameType>('auto');
  const [targetLevel, setTargetLevel] = useState<GermanLevel>('B1');
  const [previewLevel, setPreviewLevel] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeLevel = previewLevel ?? level;
  const tier = getTierForLevel(activeLevel);

  useEffect(() => {
    if (visible && user) {
      setName(user.name || '');
      setTargetLevel(user.targetLevel || 'B1');
      setError(null);
      setPreviewLevel(null);
      getUserAvatar(user.id).then(setSelectedAvatar);
      getUserFrame(user.id).then(setSelectedFrame);
    }
  }, [visible, user]);

  const isCustomUploaded =
    typeof selectedAvatar === 'string' &&
    (selectedAvatar.startsWith('file:') ||
      selectedAvatar.startsWith('content:') ||
      selectedAvatar.startsWith('http:') ||
      selectedAvatar.startsWith('https:') ||
      selectedAvatar.startsWith('data:'));

  // Pick image from gallery
  const pickImageFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Quyền truy cập',
          'Vui lòng cấp quyền thư viện ảnh trong cài đặt để tải ảnh đại diện.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setSelectedAvatar(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Lỗi', 'Không thể mở thư viện ảnh.');
    }
  };

  // Take photo with camera
  const takePhotoWithCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Quyền truy cập', 'Vui lòng cấp quyền máy ảnh để chụp ảnh đại diện.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setSelectedAvatar(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Lỗi', 'Không thể mở máy ảnh.');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Tên hiển thị không được để trống.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await authService.updateMe({
        name: name.trim(),
        targetLevel,
      });

      if (user?.id) {
        await setUserAvatar(user.id, selectedAvatar);
        await setUserFrame(user.id, selectedFrame);
      }

      onSuccess();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không lưu được thông tin.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          <GlassCard borderRadius={32} contentStyle={styles.cardContent}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Tuỳ chỉnh Hồ Sơ & Khung</Text>
                <Text style={styles.subtitle}>Tải avatar riêng & trang bị khung động thần thoại</Text>
              </View>
              <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
                <Ionicons name="close" size={22} color={colors.inkSoft} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
              {/* Live Animated Avatar Preview */}
              <View style={styles.previewSection}>
                <LevelAvatar
                  level={activeLevel}
                  avatar={selectedAvatar}
                  frameType={selectedFrame}
                  size={84}
                  showWings
                  showBadge
                  tierOverride={activeLevel}
                />
                <View style={styles.previewMeta}>
                  <View style={styles.previewLiveTag}>
                    <Ionicons name="sparkles" size={11} color="#F59E0B" />
                    <Text style={styles.previewLiveTagText}>Khung Động Thần Thoại 60 FPS</Text>
                  </View>
                  <Text style={styles.previewTierTitle}>
                    {MYTHIC_FRAMES.find((f) => f.id === selectedFrame)?.name || tier.name}
                  </Text>
                  <Text style={styles.previewDesc}>
                    {isCustomUploaded ? 'Ảnh đại diện riêng của bạn' : tier.title}
                  </Text>
                </View>
              </View>

              {/* Upload Custom Avatar Section */}
              <Text style={styles.fieldLabel}>Tải ảnh đại diện của bạn</Text>
              <View style={styles.uploadRow}>
                <Pressable style={styles.uploadBtn} onPress={pickImageFromGallery}>
                  <LinearGradient
                    colors={['rgba(2, 132, 199, 0.2)', 'rgba(3, 105, 161, 0.1)']}
                    style={styles.uploadBtnGradient}
                  >
                    <Ionicons name="images-outline" size={20} color="#0284C7" />
                    <Text style={styles.uploadBtnText}>Chọn từ thư viện</Text>
                  </LinearGradient>
                </Pressable>

                <Pressable style={styles.uploadBtn} onPress={takePhotoWithCamera}>
                  <LinearGradient
                    colors={['rgba(139, 92, 246, 0.2)', 'rgba(109, 40, 217, 0.1)']}
                    style={styles.uploadBtnGradient}
                  >
                    <Ionicons name="camera-outline" size={20} color="#8B5CF6" />
                    <Text style={[styles.uploadBtnText, { color: '#8B5CF6' }]}>Chụp ảnh mới</Text>
                  </LinearGradient>
                </Pressable>
              </View>

              {isCustomUploaded && (
                <View style={styles.customImageNotice}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.customImageNoticeText}>Đang sử dụng ảnh đại diện riêng của bạn</Text>
                  <Pressable
                    style={styles.revertBtn}
                    onPress={() => setSelectedAvatar('wolf_ice')}
                  >
                    <Text style={styles.revertBtnText}>Dùng lại linh thú</Text>
                  </Pressable>
                </View>
              )}

              {/* Mythic Frame Type Selector */}
              <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>
                Chọn loại Khung Thần Thoại
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.framesScrollRow}
              >
                {MYTHIC_FRAMES.map((f) => {
                  const isSelected = selectedFrame === f.id;
                  return (
                    <Pressable
                      key={f.id}
                      style={[
                        styles.frameCard,
                        isSelected && [
                          styles.frameCardSelected,
                          { borderColor: f.primaryColor, backgroundColor: `${f.primaryColor}18` },
                        ],
                      ]}
                      onPress={() => setSelectedFrame(f.id)}
                    >
                      <View style={styles.frameCardTop}>
                        <Text style={styles.frameEmoji}>{f.emoji}</Text>
                        <View
                          style={[
                            styles.frameTag,
                            { backgroundColor: `${f.primaryColor}25`, borderColor: f.primaryColor },
                          ]}
                        >
                          <Text style={[styles.frameTagText, { color: f.primaryColor }]}>
                            {f.tag}
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={[
                          styles.frameName,
                          isSelected && { color: f.primaryColor, fontWeight: '900' },
                        ]}
                        numberOfLines={1}
                      >
                        {f.name}
                      </Text>
                      <Text style={styles.frameSubtitle} numberOfLines={1}>
                        {f.subtitle}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Preset Beast Selector */}
              <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>
                Hoặc chọn Linh Thú Đại Diện
              </Text>
              <View style={styles.avatarGrid}>
                {AVATAR_PRESETS.map((preset) => {
                  const isSelected = selectedAvatar === preset.id;
                  return (
                    <Pressable
                      key={preset.id}
                      style={[
                        styles.avatarOption,
                        isSelected && [
                          styles.avatarOptionSelected,
                          { borderColor: tier.primaryColor, backgroundColor: `${preset.color}15` },
                        ],
                      ]}
                      onPress={() => setSelectedAvatar(preset.id)}
                    >
                      <View style={[styles.avatarIconOrb, { backgroundColor: preset.bg }]}>
                        <Ionicons name={preset.icon} size={20} color={preset.color} />
                      </View>
                      <Text
                        style={[
                          styles.avatarLabel,
                          isSelected && { color: tier.primaryColor, fontWeight: '800' },
                        ]}
                        numberOfLines={1}
                      >
                        {preset.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Test Drive Tiers */}
              <View style={styles.tierSelectorBlock}>
                <Text style={styles.tierSelectorLabel}>Xem trước hiệu ứng theo cấp:</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.tierChipsRow}
                >
                  {LEVEL_TIERS.map((t) => {
                    const isSelected = activeLevel >= t.minLevel && activeLevel <= t.maxLevel;
                    return (
                      <Pressable
                        key={t.tier}
                        style={[
                          styles.tierChip,
                          isSelected && [
                            styles.tierChipSelected,
                            { borderColor: t.primaryColor, backgroundColor: `${t.primaryColor}22` },
                          ],
                        ]}
                        onPress={() => setPreviewLevel(t.minLevel)}
                      >
                        <Ionicons
                          name={t.elementIcon}
                          size={13}
                          color={isSelected ? t.primaryColor : colors.inkSoft}
                        />
                        <Text
                          style={[
                            styles.tierChipText,
                            isSelected && { color: t.primaryColor, fontWeight: '800' },
                          ]}
                        >
                          {t.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                  {previewLevel !== null && (
                    <Pressable style={styles.resetTierBtn} onPress={() => setPreviewLevel(null)}>
                      <Ionicons name="reload-outline" size={12} color={colors.inkSoft} />
                      <Text style={styles.resetTierText}>Cấp gốc ({level})</Text>
                    </Pressable>
                  )}
                </ScrollView>
              </View>

              {/* Name Input */}
              <Text style={[styles.fieldLabel, { marginTop: spacing.sm }]}>Tên hiển thị</Text>
              <GlassInput
                value={name}
                onChangeText={(t) => {
                  setName(t);
                  setError(null);
                }}
                placeholder="Nhập tên hiển thị của bạn..."
                leftIcon="person-outline"
                autoCapitalize="words"
              />

              {/* Target Level */}
              <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>Trình độ mục tiêu</Text>
              <View style={styles.chipsRow}>
                {GERMAN_LEVELS.map((lvl) => {
                  const isSelected = targetLevel === lvl;
                  return (
                    <Pressable
                      key={lvl}
                      style={[
                        styles.levelChip,
                        isSelected && [
                          styles.levelChipSelected,
                          { borderColor: tier.primaryColor, backgroundColor: `${tier.primaryColor}22` },
                        ],
                      ]}
                      onPress={() => setTargetLevel(lvl)}
                    >
                      <Text
                        style={[
                          styles.levelChipText,
                          isSelected && { color: tier.primaryColor, fontWeight: '900' },
                        ]}
                      >
                        {lvl}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Error Message */}
              {error && (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={16} color={colors.danger} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Actions */}
              <View style={styles.actionRow}>
                <GlassButton
                  title="Huỷ"
                  variant="outline"
                  onPress={onClose}
                  style={styles.cancelBtn}
                />
                <GlassButton
                  title={saving ? 'Đang lưu…' : 'Lưu thay đổi'}
                  onPress={handleSave}
                  disabled={saving}
                  style={styles.saveBtn}
                />
              </View>
            </ScrollView>
          </GlassCard>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 12, 24, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    maxHeight: '92%',
  },
  cardContent: {
    padding: spacing.lg,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.ink,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: colors.inkSoft,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingBottom: spacing.lg,
  },
  previewSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    padding: 16,
    marginBottom: spacing.md,
  },
  previewMeta: {
    flex: 1,
  },
  previewTierTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.ink,
  },
  previewDesc: {
    fontSize: 12,
    color: colors.inkSoft,
    marginTop: 3,
  },
  previewLiveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginBottom: 4,
  },
  previewLiveTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 0.3,
  },
  uploadRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  uploadBtn: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  uploadBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  uploadBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284C7',
  },
  customImageNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  customImageNoticeText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  revertBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  revertBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
  },
  framesScrollRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
  },
  frameCard: {
    width: 140,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  frameCardSelected: {
    borderWidth: 2,
  },
  frameCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  frameEmoji: {
    fontSize: 22,
  },
  frameTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.8,
  },
  frameTagText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  frameName: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: 2,
  },
  frameSubtitle: {
    fontSize: 10,
    color: colors.inkSoft,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  avatarOption: {
    width: '23%',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  avatarOptionSelected: {
    borderWidth: 2,
  },
  avatarIconOrb: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.inkSoft,
    textAlign: 'center',
  },
  tierSelectorBlock: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  tierSelectorLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.inkSoft,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  tierChipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  tierChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  tierChipSelected: {
    borderWidth: 1.5,
  },
  tierChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.inkSoft,
  },
  resetTierBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  resetTierText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.inkSoft,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  levelChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  levelChipSelected: {
    borderWidth: 2,
  },
  levelChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 10,
    marginTop: spacing.md,
  },
  errorText: {
    fontSize: 13,
    color: colors.danger,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: spacing.lg,
  },
  cancelBtn: {
    flex: 1,
  },
  saveBtn: {
    flex: 2,
  },
});
