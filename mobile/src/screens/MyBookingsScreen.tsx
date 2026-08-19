import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, RefreshControl, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { fetchMyBookings } from '../api/bookingApi';
import { BookingPayload } from '../types/booking';
import { COLORS } from '../constants/colors';
import { BORDER_RADIUS, FONT_SIZE, SHADOWS, SPACING } from '../constants/theme';
import { formatDate, formatPrice } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';

export default function MyBookingsScreen({ navigation }: any) {
  const { user } = useAuth();
  
  const [bookings, setBookings] = useState<BookingPayload[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBookings = async (isRefresh = false) => {
    if (!user) return;
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const data = await fetchMyBookings();
      setBookings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve your reservations.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadBookings(true);
  };

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
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.refText}>Ref: {item.bookingRef}</Text>
            <Text style={styles.hotelName}>{item.hotelName}</Text>
          </View>
          <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
            <Text style={styles.statusText}>{(item.status || 'confirmed').toUpperCase()}</Text>
          </View>
        </View>

        {/* Card Body */}
        <View style={styles.cardBody}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Check-In</Text>
            <Text style={styles.infoVal}>{formatDate(item.checkIn)}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Check-Out</Text>
            <Text style={styles.infoVal}>{formatDate(item.checkOut)}</Text>
          </View>
        </View>

        <View style={styles.cardBodySub}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Room Category</Text>
            <Text style={[styles.infoVal, { textTransform: 'capitalize' }]}>{item.roomType} Room</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Guests</Text>
            <Text style={styles.infoVal}>
              {item.adults} Adult{item.adults > 1 ? 's' : ''}
              {item.children > 0 ? `, ${item.children} Child` : ''}
            </Text>
          </View>
        </View>

        {/* Card Footer */}
        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.guestLabel}>Primary Guest</Text>
            <Text style={styles.guestValue}>{item.firstName} {item.lastName}</Text>
          </View>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>{formatPrice(item.totalPrice)}</Text>
          </View>
        </View>
      </View>
    );
  }, []);

  const keyExtractor = useCallback((item: BookingPayload) => String(item.id || item._id || item.bookingRef), []);

  // Redirect if visitor not logged in
  if (!user) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <View style={styles.authBox}>
          <Text style={styles.authIcon}>🏨</Text>
          <Text style={styles.authTitle}>My Reservations</Text>
          <Text style={styles.authText}>
            Please sign in to view and manage your LuxeStay hotel bookings.
          </Text>
          <Button title="Sign In" onPress={() => navigation.navigate('Login')} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <LoadingSpinner message="Retrieving your reservations..." fullScreen />
      ) : error ? (
        <ErrorMessage message={error} onRetry={() => loadBookings()} />
      ) : (
        <FlatList
          data={bookings}
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
              <Text style={styles.title}>My Bookings</Text>
              <Text style={styles.subtitle}>
                You have {bookings.length} active reservation{bookings.length === 1 ? '' : 's'}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              message="No Reservations Found"
              suggestion="Ready to plan your next stay? Head over to the Explore tab!"
              icon="🏨"
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.LG,
    backgroundColor: COLORS.BG_SECONDARY,
  },
  authBox: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.XL,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOWS.MD,
  },
  authIcon: {
    fontSize: 48,
    marginBottom: SPACING.MD,
  },
  authTitle: {
    fontSize: FONT_SIZE.H2,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  authText: {
    fontSize: FONT_SIZE.BODY_MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: SPACING.LG,
    lineHeight: 20,
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
    paddingVertical: 3,
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
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.SM,
  },
  cardBodySub: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BG_SECONDARY,
    paddingBottom: SPACING.SM,
    marginBottom: SPACING.SM,
  },
  infoCol: {
    width: '48%',
  },
  infoLabel: {
    fontSize: 10,
    color: COLORS.TEXT_SECONDARY,
    textTransform: 'uppercase',
  },
  infoVal: {
    fontSize: FONT_SIZE.BODY_MEDIUM,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  guestLabel: {
    fontSize: 9,
    color: COLORS.TEXT_SECONDARY,
    textTransform: 'uppercase',
  },
  guestValue: {
    fontSize: FONT_SIZE.BODY_SMALL,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginTop: 1,
  },
  totalBox: {
    alignItems: 'flex-end',
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
    marginTop: 1,
  },
});
