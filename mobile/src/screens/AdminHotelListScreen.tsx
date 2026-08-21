import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { fetchHotels, deleteHotel } from '../api/hotelApi';
import { Hotel } from '../types/hotel';
import { COLORS } from '../constants/colors';
import { BORDER_RADIUS, FONT_SIZE, SHADOWS, SPACING } from '../constants/theme';
import { formatPrice } from '../utils/formatters';
import InputField from '../components/InputField';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

const CATEGORIES = ['All', 'Luxury', 'Resort', 'Boutique', 'Business', 'Lodge'];

export default function AdminHotelListScreen({ navigation }: any) {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Hotel | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadHotels = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const data = await fetchHotels();
      setHotels(data);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve hotel listings.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHotels();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadHotels(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteHotel(deleteTarget.id);
      setDeleteTarget(null);
      loadHotels(true);
    } catch (err: any) {
      alert(err.message || 'Could not delete property.');
    } finally {
      setDeleting(false);
    }
  };

  // Live matching suggestions for search bar (Google-style experience)
  const searchSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return hotels
      .filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.city.toLowerCase().includes(q) ||
          h.country.toLowerCase().includes(q)
      )
      .slice(0, 4);
  }, [hotels, searchQuery]);

  const filteredHotels = useMemo(() => {
    return hotels.filter((h) => {
      const matchesQuery =
        !searchQuery.trim() ||
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.country.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' ||
        (h.type && h.type.toLowerCase() === selectedCategory.toLowerCase());

      return matchesQuery && matchesCategory;
    });
  }, [hotels, searchQuery, selectedCategory]);

  const renderItem = useCallback(
    ({ item }: { item: Hotel }) => (
      <View style={styles.hotelRowCard}>
        <Image
          source={{ uri: item.image }}
          style={styles.thumb}
          resizeMode="cover"
        />

        <View style={styles.infoCol}>
          <View style={styles.titleRow}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>
                {item.type.toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.location} numberOfLines={1}>
            📍 {item.city}, {item.country}
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.price}>{formatPrice(item.price)}/nt</Text>
            <Text style={styles.rating}>⭐ {item.rating.toFixed(1)}</Text>
            <Text style={styles.rooms}>{item.rooms} rooms</Text>
          </View>
        </View>

        <View style={styles.actionsCol}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() =>
              navigation.navigate('AdminHotelForm', { id: item.id })
            }
          >
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => setDeleteTarget(item)}
          >
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [navigation]
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.NAVY_DARK} />
      {/* Admin Top Header Banner */}
      <View style={styles.topHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTag}>ADMINISTRATION</Text>
          <Text style={styles.headerTitle}>Hotel Directory</Text>
          <Text style={styles.headerSubtitle}>
            Manage hotel properties, pricing, and availability
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AdminHotelForm', {})}
          activeOpacity={0.88}
        >
          <Text style={styles.addBtnText}>+ Add Property</Text>
        </TouchableOpacity>
      </View>

      {/* Search Section with Live Auto-Suggest */}
      <View style={styles.searchSection}>
        <View style={styles.searchFieldContainer}>
          <InputField
            placeholder="Filter by hotel name, city, or country..."
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              if (!isSearchFocused) setIsSearchFocused(true);
            }}
            onFocus={() => setIsSearchFocused(true)}
            leftIcon={<Ionicons name="search-outline" size={18} color={COLORS.PRIMARY} />}
          />

          {searchQuery.length > 0 ? (
            <TouchableOpacity
              style={styles.clearSearchBtn}
              onPress={() => {
                setSearchQuery('');
                setIsSearchFocused(false);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={18} color={COLORS.TEXT_MUTED} />
            </TouchableOpacity>
          ) : null}

          {/* Live Auto-suggest Dropdown */}
          {isSearchFocused && searchSuggestions.length > 0 && (
            <View style={styles.suggestionsDropdown}>
              <View style={styles.suggestionsHeader}>
                <Text style={styles.suggestionsHeaderText}>MATCHING PROPERTIES</Text>
                <TouchableOpacity onPress={() => setIsSearchFocused(false)}>
                  <Text style={styles.suggestionsCloseText}>Done</Text>
                </TouchableOpacity>
              </View>

              {searchSuggestions.map((item, idx) => (
                <TouchableOpacity
                  key={String(item.id) + idx}
                  style={[
                    styles.suggestionRow,
                    idx === searchSuggestions.length - 1 && styles.suggestionRowLast,
                  ]}
                  onPress={() => {
                    setSearchQuery(item.name);
                    setIsSearchFocused(false);
                  }}
                  activeOpacity={0.75}
                >
                  <Image source={{ uri: item.image }} style={styles.suggestionThumb} />
                  <View style={styles.suggestionInfo}>
                    <Text style={styles.suggestionName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.suggestionLoc} numberOfLines={1}>
                      📍 {item.city}, {item.country} • {item.type}
                    </Text>
                  </View>
                  <Text style={styles.suggestionPrice}>{formatPrice(item.price)}/nt</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Category Filter Pills / Dropdown Tabs */}
        <View style={styles.categoryScroll}>
          <FlatList
            horizontal
            data={CATEGORIES}
            keyExtractor={(cat) => cat}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryPillContainer}
            renderItem={({ item: cat }) => (
              <TouchableOpacity
                style={[
                  styles.categoryPill,
                  selectedCategory === cat && styles.categoryPillActive,
                ]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    selectedCategory === cat && styles.categoryPillTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>

      {loading ? (
        <LoadingSpinner message="Loading catalog..." fullScreen />
      ) : error ? (
        <ErrorMessage message={error} onRetry={() => loadHotels()} />
      ) : (
        <FlatList
          data={filteredHotels}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.counterRow}>
              <Text style={styles.counterText}>
                Catalog contains{' '}
                <Text style={{ fontWeight: '800', color: COLORS.PRIMARY }}>
                  {filteredHotels.length}
                </Text>{' '}
                properties
              </Text>
              {(searchQuery || selectedCategory !== 'All') && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                >
                  <Text style={styles.resetFilterText}>Clear Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              message="No Hotels Found"
              suggestion="No properties match your search criteria."
              icon="🏢"
            />
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal visible={!!deleteTarget} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconBox}>
              <Ionicons name="trash-outline" size={28} color={COLORS.ERROR} />
            </View>
            <Text style={styles.modalTitle}>Delete Hotel Listing?</Text>
            <Text style={styles.modalText}>
              Are you sure you want to permanently delete{' '}
              <Text style={{ fontWeight: '700', color: COLORS.TEXT_PRIMARY }}>
                "{deleteTarget?.name}"
              </Text>
              ? This action cannot be undone.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                <Text style={styles.cancelModalBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmDeleteBtn}
                onPress={handleConfirmDelete}
                disabled={deleting}
              >
                <Text style={styles.confirmDeleteBtnText}>
                  {deleting ? 'Deleting...' : 'Delete Listing'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG_PAGE,
  },
  topHeader: {
    backgroundColor: COLORS.NAVY_DARK,
    padding: SPACING.LG,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.MD,
  },
  headerTag: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.SECONDARY_GOLD,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZE.H2,
    fontWeight: '900',
    color: COLORS.WHITE,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.BODY_SMALL,
    color: COLORS.TEXT_MUTED,
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.SM + 2,
    paddingHorizontal: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    alignSelf: 'center',
    ...SHADOWS.SM,
  },
  addBtnText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZE.BODY_SMALL,
    fontWeight: '800',
  },
  searchSection: {
    paddingHorizontal: SPACING.MD,
    paddingTop: SPACING.MD,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    zIndex: 100,
  },
  searchFieldContainer: {
    position: 'relative',
    zIndex: 200,
  },
  clearSearchBtn: {
    position: 'absolute',
    right: 14,
    top: 14,
    zIndex: 210,
  },
  suggestionsDropdown: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1.5,
    borderColor: COLORS.PRIMARY_TINT,
    marginTop: -8,
    marginBottom: SPACING.SM,
    ...SHADOWS.MD,
    overflow: 'hidden',
  },
  suggestionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
    paddingVertical: 7,
    backgroundColor: COLORS.BG_SECONDARY,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  suggestionsHeaderText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.TEXT_MUTED,
    letterSpacing: 0.8,
  },
  suggestionsCloseText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.PRIMARY,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    gap: 10,
  },
  suggestionRowLast: {
    borderBottomWidth: 0,
  },
  suggestionThumb: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: COLORS.BG_SECONDARY,
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionName: {
    fontSize: FONT_SIZE.BODY_SMALL,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
  },
  suggestionLoc: {
    fontSize: 11,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 1,
  },
  suggestionPrice: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.PRIMARY,
  },
  categoryScroll: {
    paddingBottom: SPACING.SM,
  },
  categoryPillContainer: {
    gap: SPACING.XS,
  },
  categoryPill: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.ROUND,
    backgroundColor: COLORS.BG_PAGE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  categoryPillActive: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.TEXT_SECONDARY,
  },
  categoryPillTextActive: {
    color: COLORS.WHITE,
  },
  list: {
    padding: SPACING.MD,
    paddingBottom: SPACING.XXL + 30,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM + 2,
  },
  counterText: {
    fontSize: FONT_SIZE.BODY_SMALL,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
  },
  resetFilterText: {
    fontSize: FONT_SIZE.BODY_SMALL,
    fontWeight: '700',
    color: COLORS.PRIMARY,
  },
  hotelRowCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.MD,
    marginBottom: SPACING.SM + 2,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOWS.SM,
    alignItems: 'center',
    gap: SPACING.MD,
  },
  thumb: {
    width: 65,
    height: 65,
    borderRadius: BORDER_RADIUS.MD,
  },
  infoCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: FONT_SIZE.BODY_MEDIUM,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
    flexShrink: 1,
  },
  typeBadge: {
    backgroundColor: COLORS.PRIMARY_SURFACE,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.SM,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.PRIMARY,
  },
  location: {
    fontSize: FONT_SIZE.BODY_SMALL - 1,
    color: COLORS.TEXT_SECONDARY,
    marginVertical: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
    marginTop: 2,
  },
  price: {
    fontSize: FONT_SIZE.BODY_SMALL,
    fontWeight: '800',
    color: COLORS.PRIMARY,
  },
  rating: {
    fontSize: FONT_SIZE.BODY_SMALL,
    fontWeight: '700',
    color: COLORS.TEXT_SECONDARY,
  },
  rooms: {
    fontSize: FONT_SIZE.BODY_SMALL - 1,
    color: COLORS.TEXT_MUTED,
  },
  actionsCol: {
    gap: 6,
  },
  editBtn: {
    backgroundColor: COLORS.PRIMARY_SURFACE,
    paddingHorizontal: SPACING.MD,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.SM,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY_TINT,
    alignItems: 'center',
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.PRIMARY,
  },
  deleteBtn: {
    backgroundColor: COLORS.ERROR_BG,
    paddingHorizontal: SPACING.MD,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.SM,
    borderWidth: 1,
    borderColor: COLORS.ERROR_BORDER,
    alignItems: 'center',
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.ERROR,
  },

  /* Modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.LG,
  },
  modalCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.XL,
    padding: SPACING.XL,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    ...SHADOWS.LG,
  },
  modalIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.ERROR_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.MD,
  },
  modalTitle: {
    fontSize: FONT_SIZE.H3,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
    textAlign: 'center',
  },
  modalText: {
    fontSize: FONT_SIZE.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: SPACING.LG,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.SM,
    width: '100%',
  },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: SPACING.SM + 4,
    borderRadius: BORDER_RADIUS.MD,
    backgroundColor: COLORS.BG_PAGE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
  },
  cancelModalBtnText: {
    fontSize: FONT_SIZE.BODY_SMALL,
    fontWeight: '700',
    color: COLORS.TEXT_SECONDARY,
  },
  confirmDeleteBtn: {
    flex: 1,
    paddingVertical: SPACING.SM + 4,
    borderRadius: BORDER_RADIUS.MD,
    backgroundColor: COLORS.ERROR,
    alignItems: 'center',
  },
  confirmDeleteBtnText: {
    fontSize: FONT_SIZE.BODY_SMALL,
    fontWeight: '700',
    color: COLORS.WHITE,
  },
});
