import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, RefreshControl, TouchableOpacity, Alert, TextInput } from 'react-native';
import { fetchBookings, updateBooking, deleteBooking } from '../api/bookingApi';
import { BookingPayload } from '../types/booking';
import { COLORS } from '../constants/colors';
import { BORDER_RADIUS, FONT_SIZE, SHADOWS, SPACING } from '../constants/theme';
import { formatDate, formatPrice } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

export default function AdminBookingsScreen() {
  const [bookings, setBookings] = useState<BookingPayload[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadAllBookings = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const data = await fetchBookings();
      setBookings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load system bookings.');
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

  const handleUpdateStatus = (bookingId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'confirmed' ? 'cancelled' : 'confirmed';
    
    Alert.alert(
      'Update Reservation Status',
      `Are you sure you want to change booking status to ${nextStatus.toUpperCase()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async () => {
            try {
              await updateBooking(bookingId, { status: nextStatus as any });
              Alert.alert('Success', 'Booking status updated successfully.');
              loadAllBookings();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Could not update status.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteBooking = (bookingId: string, refCode: string) => {
    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to permanently delete booking "${refCode}" from MongoDB?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBooking(bookingId);
              Alert.alert('Success', 'Booking deleted successfully.');
              loadAllBookings();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Could not delete booking.');
            }
          },
        },
      ]
    );
  };

  const filteredBookings = bookings.filter(
    (b) =>
      b.bookingRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.hotelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status = 'confirmed') => {
    switch (status.toLowerCase()) {
      case 'cancelled':
        return styles.statusCancelled;
      case 'pending':
        return styles.statusPending;
      default:
        return styles.statusConfirmed;
    }
  };

  const renderBookingItem = useCallback(({ item }: { item: BookingPayload }) => {
    return (
      <View style={styles.bookingCard}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.refText}>Ref: {item.bookingRef}</Text>
            <Text style={styles.hotelName}>{item.hotelName}</Text>
          </View>
          <TouchableOpacity
            style={[styles.statusBadge, getStatusStyle(item.status)]}
            onPress={() => handleUpdateStatus(item.id || item._id || '', item.status || 'confirmed')}
          >
            <Text style={styles.statusText}>{(item.status || 'confirmed').toUpperCase()} 🔄</Text>
          </TouchableOpacity>
        </View>

        {/* Guest info details */}
        <View style={styles.detailsRow}>
          <Text style={styles.detailLabel}>Guest:</Text>
          <Text style={styles.detailVal}>{item.firstName} {item.lastName}</Text>
        </View>
        <View style={styles.detailsRow}>
          <Text style={styles.detailLabel}>Contact:</Text>
          <Text style={styles.detailVal}>{item.email} | {item.phone}</Text>
        </View>
        <View style={styles.detailsRow}>
          <Text style={styles.detailLabel}>Stay Dates:</Text>
          <Text style={styles.detailVal}>{formatDate(item.checkIn)} to {formatDate(item.checkOut)}</Text>
        </View>
        <View style={styles.detailsRow}>
          <Text style={styles.detailLabel}>Room / Guests:</Text>
          <Text style={[styles.detailVal, { textTransform: 'capitalize' }]}>
            {item.roomType} room • {item.adults} Adults{item.children > 0 ? `, ${item.children} Children` : ''}
          </Text>
        </View>
        
        {item.specialRequests ? (
          <View style={styles.specialRequestsBox}>
            <Text style={styles.specialRequestsLabel}>Special Requests:</Text>
            <Text style={styles.specialRequestsText}>"{item.specialRequests}"</Text>
          </View>
        ) : null}

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.totalLabel}>Total Price</Text>
            <Text style={styles.totalValue}>{formatPrice(item.totalPrice)}</Text>
          </View>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDeleteBooking(item.id || item._id || '', item.bookingRef)}
          >
            <Text style={styles.deleteBtnText}>Delete Reservation 🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [bookings]);

  const keyExtractor = useCallback((item: BookingPayload) => String(item.id || item._id || item.bookingRef), []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Input Filter */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by ref, guest, hotel..."
          placeholderTextColor={COLORS.TEXT_LIGHT}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        {searchTerm ? (
          <TouchableOpacity onPress={() => setSearchTerm('')}>
            <Text style={styles.clearSearch}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {loading ? (
        <LoadingSpinner message="Retrieving all reservations..." fullScreen />
      ) : error ? (
        <ErrorMessage message={error} onRetry={() => loadAllBookings()} />
      ) : (
        <FlatList
          data={filteredBookings}
          renderItem={renderBookingItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.PRIMARY]}
            />
          }
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.title}>System Reservations</Text>
              <Text style={styles.subtitle}>
                Total {filteredBookings.length} booking documents across all guests
              </Text>
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              message="No Booking Records Found"
              suggestion={searchTerm ? 'Try checking your search filters' : 'No reservations have been registered in the database'}
              icon="📋"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG_SECONDARY,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: BORDER_RADIUS.MD,
    margin: SPACING.MD,
    paddingHorizontal: SPACING.MD,
    height: 44,
    ...SHADOWS.SM,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZE.BODY_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
  },
  clearSearch: {
    fontSize: FONT_SIZE.BODY_LARGE,
    color: COLORS.TEXT_LIGHT,
    paddingHorizontal: 5,
  },
  listContainer: {
    padding: SPACING.MD,
    paddingBottom: SPACING.XL,
  },
  header: {
    marginBottom: SPACING.MD,
  },
  title: {
    fontSize: FONT_SIZE.H2,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  subtitle: {
    fontSize: FONT_SIZE.BODY_MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  bookingCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.LG,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    marginBottom: SPACING.MD,
    padding: SPACING.MD,
    ...SHADOWS.SM,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BG_SECONDARY,
    paddingBottom: SPACING.SM,
    marginBottom: SPACING.SM,
  },
  refText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    letterSpacing: 0.5,
  },
  hotelName: {
    fontSize: FONT_SIZE.H3,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginTop: 2,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: SPACING.SM,
    borderRadius: BORDER_RADIUS.SM,
  },
  statusConfirmed: {
    backgroundColor: '#DEF7EC',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusCancelled: {
    backgroundColor: '#FDE8E8',
  },
  statusText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    width: 90,
    fontSize: FONT_SIZE.BODY_SMALL,
    fontWeight: 'bold',
    color: COLORS.TEXT_SECONDARY,
  },
  detailVal: {
    flex: 1,
    fontSize: FONT_SIZE.BODY_SMALL,
    color: COLORS.TEXT_PRIMARY,
  },
  specialRequestsBox: {
    backgroundColor: COLORS.BG_SECONDARY,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: SPACING.SM,
    borderRadius: BORDER_RADIUS.MD,
    marginTop: SPACING.SM,
    marginBottom: SPACING.SM,
  },
  specialRequestsLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.TEXT_SECONDARY,
    textTransform: 'uppercase',
  },
  specialRequestsText: {
    fontSize: FONT_SIZE.BODY_SMALL,
    color: COLORS.TEXT_PRIMARY,
    fontStyle: 'italic',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: COLORS.BG_SECONDARY,
    paddingTop: SPACING.SM,
    marginTop: SPACING.SM,
  },
  totalLabel: {
    fontSize: 9,
    color: COLORS.TEXT_SECONDARY,
    textTransform: 'uppercase',
  },
  totalValue: {
    fontSize: FONT_SIZE.BODY_LARGE,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  deleteBtn: {
    backgroundColor: '#FDF2F2',
    borderWidth: 1,
    borderColor: '#FDE8E8',
    paddingVertical: 5,
    paddingHorizontal: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
  },
  deleteBtnText: {
    fontSize: FONT_SIZE.BODY_SMALL - 1,
    fontWeight: 'bold',
    color: COLORS.ERROR,
  },
});
