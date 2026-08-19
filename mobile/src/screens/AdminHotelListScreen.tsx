import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Modal,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchHotels, deleteHotel } from '../api/hotelApi';
import { Hotel } from '../types/hotel';
import { COLORS } from '../constants/colors';
import { BORDER_RADIUS, FONT_SIZE, SHADOWS, SPACING } from '../constants/theme';
import { formatPrice } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import InputField from '../components/InputField';
import Button from '../components/Button';

export default function AdminHotelListScreen({ navigation }: any) {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredHotels = hotels.filter(
    (h) =>
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      <View style={styles.searchSection}>
        <InputField
          label=""
          placeholder="Filter by hotel name or city..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Text>🔍</Text>}
        />
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
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              message="No Hotels Found"
              suggestion="No properties match your filter criteria."
              icon="🏢"
            />
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal visible={!!deleteTarget} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalIcon}>⚠️</Text>
            <Text style={styles.modalTitle}>Confirm Property Removal</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete{' '}
              <Text style={{ fontWeight: '800', color: COLORS.TEXT_PRIMARY }}>
                "{deleteTarget?.name}"
              </Text>
              ? This action cannot be undone.
            </Text>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setDeleteTarget(null)}
                style={styles.modalBtn}
              />
              <Button
                title="Delete Property"
                variant="danger"
                onPress={handleConfirmDelete}
                loading={deleting}
                style={styles.modalBtn}
              />
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
    paddingVertical: SPACING.LG,
    paddingHorizontal: SPACING.MD,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.MD,
    ...SHADOWS.MD,
  },
  headerTag: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.SECONDARY_GOLD,
    letterSpacing: 1.2,
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
    ...SHADOWS.PRIMARY_GLOW,
  },
  addBtnText: {
    color: COLORS.WHITE,
    fontWeight: '800',
    fontSize: FONT_SIZE.BODY_SMALL,
  },
  searchSection: {
    paddingHorizontal: SPACING.MD,
    paddingTop: SPACING.MD,
  },
  counterRow: {
    marginBottom: SPACING.SM,
  },
  counterText: {
    fontSize: FONT_SIZE.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  list: {
    paddingHorizontal: SPACING.MD,
    paddingBottom: SPACING.XXL,
  },
  hotelRowCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.LG,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: SPACING.SM + 2,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.MD - 2,
    gap: SPACING.MD,
    ...SHADOWS.SM,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: BORDER_RADIUS.MD,
    backgroundColor: COLORS.BG_SECONDARY,
  },
  infoCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    fontSize: FONT_SIZE.BODY_MEDIUM,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    marginRight: 4,
  },
  typeBadge: {
    backgroundColor: COLORS.PRIMARY_SURFACE,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY_TINT,
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: BORDER_RADIUS.SM,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.PRIMARY,
  },
  location: {
    fontSize: 11,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
  },
  price: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.PRIMARY,
  },
  rating: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.SECONDARY,
  },
  rooms: {
    fontSize: 11,
    color: COLORS.TEXT_MUTED,
  },
  actionsCol: {
    gap: 6,
  },
  editBtn: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.SM,
  },
  editBtnText: {
    color: COLORS.WHITE,
    fontSize: 11,
    fontWeight: '700',
  },
  deleteBtn: {
    backgroundColor: COLORS.ERROR_BG,
    borderWidth: 1,
    borderColor: COLORS.ERROR_BORDER,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BORDER_RADIUS.SM,
  },
  deleteBtnText: {
    color: COLORS.ERROR,
    fontSize: 11,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.LG,
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.XL,
    padding: SPACING.XL,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    ...SHADOWS.LG,
  },
  modalIcon: {
    fontSize: 40,
    marginBottom: SPACING.SM,
  },
  modalTitle: {
    fontSize: FONT_SIZE.H3,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  modalText: {
    fontSize: FONT_SIZE.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: SPACING.LG,
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.MD,
    width: '100%',
  },
  modalBtn: {
    flex: 1,
  },
});
