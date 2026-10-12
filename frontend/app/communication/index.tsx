import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/src/components/ui/Screen';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { SectionTitle } from '@/src/components/ui/Section';
import { EmptyState, ErrorState, LoadingState } from '@/src/components/ui/States';
import { PhraseRow } from '@/src/components/communication/PhraseRow';
import {
  getFavPhraseIds,
  getSituationMeta,
  phraseService,
  toggleFavPhrase,
  type Phrase,
  type PhraseSituation,
} from '@/src/services/phrase.service';
import { colors, radius, spacing } from '@/src/theme';

const PAGE_SIZE = 50;
const GLYPH_MAP = Ionicons.glyphMap as Record<string, unknown>;
const ICON_COLORS = [colors.primary, colors.teal, colors.orange, '#8B5CF6', '#EC4899', '#0EA5E9'];

function safeIcon(name: string): keyof typeof Ionicons.glyphMap {
  return GLYPH_MAP[name] ? (name as keyof typeof Ionicons.glyphMap) : 'chatbubbles-outline';
}

export default function CommunicationScreen() {
  const [situations, setSituations] = useState<PhraseSituation[]>([]);
  const [loadingSituations, setLoadingSituations] = useState(true);
  const [sitError, setSitError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searching = search.trim().length > 0;

  const loadSituations = useCallback(async () => {
    setLoadingSituations(true);
    setSitError(null);
    try {
      const list = await phraseService.situations();
      setSituations([...list].sort((a, b) => b.count - a.count));
    } catch (e) {
      setSitError(e instanceof Error ? e.message : 'Không tải được danh sách tình huống.');
    } finally {
      setLoadingSituations(false);
    }
  }, []);

  useEffect(() => {
    loadSituations();
    getFavPhraseIds()
      .then((ids) => setFavIds(new Set(ids)))
      .catch(() => undefined);
  }, [loadSituations]);

  const loadSearch = useCallback(async (q: string, pageNum: number, append: boolean) => {
    if (pageNum === 0) {
      setLoadingSearch(true);
      setSearchError(null);
    } else {
      setLoadingMore(true);
    }
    try {
      const res = await phraseService.list({ q, page: pageNum, size: PAGE_SIZE });
      setPhrases((p) => (append ? [...p, ...res.items] : res.items));
      setPage(res.page);
      setTotalPages(res.totalPages);
    } catch (e) {
      if (pageNum === 0) setSearchError(e instanceof Error ? e.message : 'Không tìm được câu.');
    } finally {
      setLoadingSearch(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    const q = search.trim();
    if (!q) {
      setPhrases([]);
      setSearchError(null);
      return;
    }
    debounce.current = setTimeout(() => loadSearch(q, 0, false), 400);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [search, loadSearch]);

  const onToggleFav = useCallback(async (id: string) => {
    const next = await toggleFavPhrase(id);
    setFavIds(new Set(next));
  }, []);

  const openSituation = (slug: string) => router.push(`/communication/${slug}` as never);

  const totalPhrases = situations.reduce((sum, s) => sum + s.count, 0);

  return (
    <Screen padded={false} scroll={false}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>Giao tiếp</Text>
          <Text style={styles.sub}>
            {totalPhrases > 0
              ? `${situations.length} tình huống · ${totalPhrases} mẫu câu`
              : 'Mẫu câu Đức–Việt theo tình huống'}
          </Text>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={colors.inkMuted} />
        <TextInput
          style={styles.search}
          placeholder="Tìm mẫu câu…"
          placeholderTextColor={colors.inkMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <Pressable onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.inkMuted} />
          </Pressable>
        ) : null}
      </View>

      {searching ? (
        <FlatList
          data={phrases}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.list}
          style={styles.listWrap}
          renderItem={({ item }) => (
            <PhraseRow
              phrase={item}
              situationLabel={getSituationMeta(item.situation).nameVi}
              fav={favIds.has(item.id)}
              onToggleFav={onToggleFav}
            />
          )}
          onEndReached={() => {
            if (!loadingMore && page + 1 < totalPages) loadSearch(search.trim(), page + 1, true);
          }}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            loadingSearch ? (
              <LoadingState message="Đang tìm mẫu câu…" />
            ) : searchError ? (
              <ErrorState message={searchError} onRetry={() => loadSearch(search.trim(), 0, false)} />
            ) : (
              <EmptyState message="Không tìm thấy mẫu câu nào." />
            )
          }
          ListFooterComponent={loadingMore ? <LoadingState message="Đang tải thêm…" /> : null}
        />
      ) : loadingSituations ? (
        <View style={styles.statePad}>
          <LoadingState message="Đang tải tình huống…" />
        </View>
      ) : sitError ? (
        <View style={styles.statePad}>
          <ErrorState message={sitError} onRetry={loadSituations} />
        </View>
      ) : (
        <FlatList
          data={situations}
          keyExtractor={(s) => s.situation}
          numColumns={2}
          contentContainerStyle={styles.grid}
          style={styles.listWrap}
          columnWrapperStyle={styles.columnWrap}
          ListHeaderComponent={<SectionTitle title="Tình huống giao tiếp" />}
          renderItem={({ item, index }) => {
            const meta = getSituationMeta(item.situation);
            const color = ICON_COLORS[index % ICON_COLORS.length];
            return (
              <Pressable style={styles.cardPress} onPress={() => openSituation(item.situation)}>
                <GlassCard style={styles.card}>
                  <View style={[styles.iconWrap, { backgroundColor: `${color}1A` }]}>
                    <Ionicons name={safeIcon(meta.icon)} size={24} color={color} />
                  </View>
                  <Text style={styles.nameVi} numberOfLines={2}>
                    {meta.nameVi}
                  </Text>
                  <Text style={styles.nameDe} numberOfLines={1}>
                    {meta.nameDe}
                  </Text>
                  <Text style={styles.count}>{item.count} câu</Text>
                </GlassCard>
              </Pressable>
            );
          }}
          ListEmptyComponent={<EmptyState message="Chưa có tình huống nào." />}
        />
      )}
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
  title: { fontSize: 24, fontWeight: '800', color: colors.ink },
  sub: { fontSize: 13, color: colors.inkSoft, marginTop: 2 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  search: { flex: 1, paddingVertical: 12, fontSize: 15, color: colors.ink },
  listWrap: { flex: 1 },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  grid: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  columnWrap: { gap: 10 },
  cardPress: { flex: 1, marginBottom: 2 },
  card: { alignItems: 'center', paddingVertical: spacing.md, marginBottom: spacing.sm },
  iconWrap: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  nameVi: { fontSize: 14, fontWeight: '800', color: colors.ink, marginTop: 8, textAlign: 'center' },
  nameDe: { fontSize: 12, color: colors.inkSoft, marginTop: 2, textAlign: 'center' },
  count: { fontSize: 11, color: colors.primary, fontWeight: '700', marginTop: 4 },
  statePad: { flex: 1, paddingHorizontal: spacing.md },
});
