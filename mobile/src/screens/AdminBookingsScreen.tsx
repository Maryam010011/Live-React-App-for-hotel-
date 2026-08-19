import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Alert,
  StatusBar,
} from 'react-native';
import { fetchBookings, updateBooking, deleteBooking } from '../api/bookingApi';
import { BookingPayload } from '../types/booking';
import { COLORS } from '../constants/colors';
import { BORDER_RADIUS, FONT_SIZE, SHADOWS, SPACING } from '../constants/theme';
import { formatDate, formatPrice } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';

export default function AdminBookingsScreen() {
  const [bookings, setBookings] = useState<BookingPayload[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');
  const [deleteTarget, setDeleteTarget] = useState<BookingPayload | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadAllBookings = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const data = await fetchBookings();
      setBookings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve system reservations.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllBookings();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadAllBookings(true);
  };

  const handleToggleStatus = async (
    item: BookingPayload,
    nextStatus: 'confirmed' | 'pending' | 'cancelled'
  ) => {
    const bookingId = item.id || item._id;
    if (!bookingId) return;

    try {
      await updateBooking(bookingId, { status: nextStatus });
      setBookings((prev) =>
        prev.map((b) =>
          (b.id === bookingId || b._id === bookingId)
            ? { ...b, status: nextStatus }
            : b
        )
      );
    } catch (err: any) {
      Alert.alert('Status Update Failed', err.message || 'Could not update reservation status.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const bookingId = deleteTarget.id || deleteTarget._id;
    if (!bookingId) return;

    setDeleting(true);
    try {
      await deleteBooking(bookingId);
      setBookings((prev) => prev.filter((b) => (b.id || b._id) !== bookingId));
      setDeleteTarget(null);
    } catch (err: any) {
      Alert.alert('Deletion Failed', err.message || 'Could not delete reservation.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === 'all') return true;
    return (b.status || 'confirmed').toLowerCase() === statusFilter;
  });

  const getStatusBadgeStyle = (status = 'confirmed') => {
    switch (status.toLowerCase()) {
      case 'cancelled':
        return { bg: COLORS.ERROR_BG, border: COLORS.ERROR_BORDER, text: COLORS.ERROR };
      case 'pending':
        return { bg: COLORS.WARNING_BG, border: COLORS.WARNING_BORDER, text: COLORS.WARNING };
      default:
        return { bg: COLORS.SUCCESS_BG, border: COLORS.SUCCESS_BORDER, text: COLORS.SUCCESS };
    }
  };

  const renderBooking = useCallback(
    ({ item }: { item: BookingPayload }) => {
      const currentStatus = (item.status || 'confirmed').toLowerCase();
      const badge = getStatusBadgeStyle(currentStatus);

      return (
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <View style={styles.refBadge}>
                <Text style={styles.refText}>Ref: {item.bookingRef}</Text>
              </View>
              <Text style={styles.hotelName}>{item.hotelName}</Text>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
              <Text style={[styles.statusText, { color: badge.text }]}>
                {currentStatus.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Grid */}
          <View style={styles.grid}>
            <View style={styles.gridCol}>
              <Text style={styles.gridLabel}>GUEST</Text>
              <Text style={styles.gridVal}>
                {item.firstName} {item.lastName}
              </Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.gridLabel}>TOTAL PAID</Text>
              <Text style={[styles.gridVal, { color: COLORS.PRIMARY, fontWeight: '800' }]}>
                {formatPrice(item.totalPrice)}
              </Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.gridLabel}>DATES</Text>
              <Text style={styles.gridVal}>
                {formatDate(item.checkIn)} → {formatDate(item.checkOut)}
              </Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.gridLabel}>ROOM</Text>
              <Text style={[styles.gridVal, styles.capitalize]}>
                {item.roomType} Tier
              </Text>
            </View>
          </View>

          {/* Contact Details */}
          <View style={styles.contactRow}>
            <Text style={styles.contactText}>📧 {item.email}</Text>
            <Text style={styles.contactText}>📞 {item.phone}</Text>
          </View>

          {/* Status Changer Actions */}
          <View style={styles.actionsFooter}>
            <Text style={styles.actionPrompt}>Update Status:</Text>
            <View style={styles.statusButtonGroup}>
              {(['confirmed', 'pending', 'cancelled'] as const).map((st) => (
                <TouchableOpacity
                  key={st}
                  style={[
                    styles.statusChangeBtn,
                    currentStatus === st && styles.statusChangeBtnActive,
                  ]}
                  onPress={() => handleToggleStatus(item, st)}
                >
                  <Text
                    style={[
                      styles.statusChangeBtnText,
                      currentStatus === st && styles.statusChangeBtnTextActive,
                    ]}
                  >
                    {st.charAt(0).toUpperCase() + st.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.deleteActionBtn}
                onPress={() => setDeleteTarget(item)}
              >
                <Text style={styles.deleteActionText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    },
    [bookings]
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.NAVY_DARK} />
      {/* Admin Header */}
      <View style={styles.topHeader}>
        <Text style={styles.headerTag}>SYSTEM ADMINISTRATION</Text>
        <Text style={styles.headerTitle}>All Reservations</Text>
        <Text style={styles.headerSubtitle}>
          Live feed of customer bookings across the global platform
        </Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {(['all', 'confirmed', 'pending', 'cancelled'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, statusFilter === tab && styles.tabActive]}
            onPress={() => setStatusFilter(tab)}
          >
            <Text
              style={[
                styles.tabText,
                statusFilter === tab && styles.tabTextActive,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <LoadingSpinner message="Fetching global reservations..." fullScreen />
      ) : error ? (
        <ErrorMessage message={error} onRetry={() => loadAllBookings()} />
      ) : (
        <FlatList
          data={filteredBookings}
          renderItem={renderBooking}
          keyExtractor={(item) => String(item.id || item._id || item.bookingRef)}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.counterBar}>
              <Text style={styles.counterText}>
                Showing{' '}
                <Text style={{ fontWeight: '800', color: COLORS.PRIMARY }}>
                  {filteredBookings.length}
                </Text>{' '}
                reservations
              </Text>
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              message="No Bookings Found"
              suggestion="No reservations exist matching this status filter."
              icon="📑"
            />
          }
        />
      )}

      {/* Delete Modal */}
      <Modal visible={!!deleteTarget} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalIcon}>⚠️</Text>
            <Text style={styles.modalTitle}>Cancel & Remove Booking</Text>
            <Text style={styles.modalText}>
              Are you sure you want to permanently delete reservation reference{' '}
              <Text style={{ fontWeight: '800', color: COLORS.PRIMARY }}>
                {deleteTarget?.bookingRef}
              </Text>
              ?
            </Text>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setDeleteTarget(null)}
                style={styles.modalBtn}
              />
              <Button
                title="Confirm Delete"
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
    marginTop: 2,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.BODY_SMALL,
    color: COLORS.TEXT_MUTED,
    marginTop: 2,
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.SM,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.MD,
  },
  tabActive: {
    backgroundColor: COLORS.PRIMARY_SURFACE,
  },
  tabText: {
    fontSize: FONT_SIZE.BODY_SMALL,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
  },
  tabTextActive: {
    color: COLORS.PRIMARY,
    fontWeight: '800',
  },
  counterBar: {
    marginBottom: SPACING.SM,
  },
  counterText: {
    fontSize: FONT_SIZE.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  list: {
    padding: SPACING.MD,
    paddingBottom: SPACING.XXL,
  },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.LG,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: SPACING.MD + 2,
    marginBottom: SPACING.MD,
    ...SHADOWS.SM,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BG_SECONDARY,
    paddingBottom: SPACING.SM + 2,
    marginBottom: SPACING.SM + 2,
    gap: SPACING.SM,
  },
  refBadge: {
    backgroundColor: COLORS.PRIMARY_SURFACE,
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: BORDER_RADIUS.SM,
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  refText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.PRIMARY,
  },
  hotelName: {
    fontSize: FONT_SIZE.BODY_LARGE,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: BORDER_RADIUS.ROUND,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: SPACING.SM,
    marginBottom: SPACING.SM + 2,
  },
  gridCol: {
    width: '50%',
  },
  gridLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.TEXT_MUTED,
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  gridVal: {
    fontSize: FONT_SIZE.BODY_SMALL,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  capitalize: {
    textTransform: 'capitalize',
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.BG_PAGE,
    padding: SPACING.SM,
    borderRadius: BORDER_RADIUS.SM,
    marginBottom: SPACING.SM + 2,
  },
  contactText: {
    fontSize: 11,
    color: COLORS.TEXT_SECONDARY,
  },
  actionsFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.BG_SECONDARY,
    paddingTop: SPACING.SM,
  },
  actionPrompt: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.TEXT_MUTED,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  statusButtonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusChangeBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: BORDER_RADIUS.SM,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: COLORS.BG_PAGE,
  },
  statusChangeBtnActive: {
    backgroundColor: COLORS.NAVY_DARK,
    borderColor: COLORS.NAVY_DARK,
  },
  statusChangeBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
  },
  statusChangeBtnTextActive: {
    color: COLORS.WHITE,
    fontWeight: '700',
  },
  deleteActionBtn: {
    marginLeft: 'auto',
    padding: 6,
  },
  deleteActionText: {
    fontSize: 16,
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
