import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/src/components/ui/Screen';
import { Chip } from '@/src/components/ui/Chip';
import { SectionTitle } from '@/src/components/ui/Section';
import { EmptyState, ErrorState, LoadingState } from '@/src/components/ui/States';
import { PhraseRow } from '@/src/components/communication/PhraseRow';
import {
  getFavPhraseIds,
  getSituationMeta,
  phraseService,
  toggleFavPhrase,
  type Phrase,
} from '@/src/services/phrase.service';
import { colors, radius, spacing } from '@/src/theme';

const PAGE_SIZE = 50;

export default function SituationScreen() {
  const { situation } = useLocalSearchParams<{ situation: string }>();
  const meta = getSituationMeta(situation ?? '');
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [search, setSearch] = useState('');

  const loadPage = useCallback(
    async (pageNum: number, append: boolean) => {
      if (!situation) return;
      if (pageNum === 0) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }
      try {
        const res = await phraseService.list({ situation, page: pageNum, size: PAGE_SIZE });
        setPhrases((p) => (append ? [...p, ...res.items] : res.items));
        setPage(res.page);
        setTotalPages(res.totalPages);
        setTotal(res.total);
      } catch (e) {
        if (pageNum === 0) setError(e instanceof Error ? e.message : 'Không tải được mẫu câu.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [situation]
  );

  useEffect(() => {
    loadPage(0, false);
    getFavPhraseIds()
      .then((ids) => setFavIds(new Set(ids)))
      .catch(() => undefined);
  }, [loadPage]);

  const onToggleFav = useCallback(async (id: string) => {
    const next = await toggleFavPhrase(id);
    setFavIds(new Set(next));
  }, []);

  const visible = phrases.filter((p) => {
    if (showFavOnly && !favIds.has(p.id)) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return p.german.toLowerCase().includes(q) || p.vietnamese.toLowerCase().includes(q);
  });

  return (
    <Screen padded={false} scroll={false}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>{meta.nameVi}</Text>
          <Text style={styles.sub}>
            {meta.nameDe}
            {total > 0 ? ` · ${total} mẫu câu` : ''}
          </Text>
        </View>
      </View>

      <View style={styles.filterRow}>
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={16} color={colors.inkMuted} />
          <TextInput
            style={styles.search}
            placeholder="Tìm trong tình huống này…"
            placeholderTextColor={colors.inkMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={colors.inkMuted} />
            </Pressable>
          ) : null}
        </View>
        <Chip
          label={`Yêu thích${favIds.size > 0 ? ` (${favIds.size})` : ''}`}
          selected={showFavOnly}
          onPress={() => setShowFavOnly((v) => !v)}
        />
      </View>

      <FlatList
        data={visible}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        style={styles.listWrap}
        ListHeaderComponent={<SectionTitle title={showFavOnly ? 'Câu đã yêu thích' : 'Mẫu câu'} />}
        renderItem={({ item }) => (
          <PhraseRow phrase={item} fav={favIds.has(item.id)} onToggleFav={onToggleFav} />
        )}
        onEndReached={() => {
          if (!loadingMore && page + 1 < totalPages) loadPage(page + 1, true);
        }}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          loading ? (
            <LoadingState message="Đang tải mẫu câu…" />
          ) : error ? (
            <ErrorState message={error} onRetry={() => loadPage(0, false)} />
          ) : (
            <EmptyState
              message={showFavOnly ? 'Bạn chưa yêu thích câu nào ở đây.' : 'Chưa có mẫu câu nào.'}
            />
          )
        }
        ListFooterComponent={loadingMore ? <LoadingState message="Đang tải thêm…" /> : null}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  title: { fontSize: 22, fontWeight: '800', color: colors.ink },
  sub: { fontSize: 13, color: colors.inkSoft, marginTop: 2 },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.md,
    paddingHorizontal: 10,
  },
  search: { flex: 1, paddingVertical: 10, fontSize: 14, color: colors.ink },
  listWrap: { flex: 1 },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
});
