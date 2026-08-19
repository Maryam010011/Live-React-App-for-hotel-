import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
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

  const getStatusBadgeStyle = (status = 'confirmed') => {
    switch (status.toLowerCase()) {
      case 'cancelled':
        return {
          bg: COLORS.ERROR_BG,
          border: COLORS.ERROR_BORDER,
          text: COLORS.ERROR,
        };
      case 'pending':
        return {
          bg: COLORS.WARNING_BG,
          border: COLORS.WARNING_BORDER,
          text: COLORS.WARNING,
        };
      default:
        return {
          bg: COLORS.SUCCESS_BG,
          border: COLORS.SUCCESS_BORDER,
          text: COLORS.SUCCESS,
        };
    }
  };

  const renderBookingItem = useCallback(
    ({ item }: { item: BookingPayload }) => {
      const badgeStyle = getStatusBadgeStyle(item.status);

      return (
        <View style={styles.bookingCard}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <View style={styles.refBadge}>
                <Text style={styles.refText}>Ref: {item.bookingRef}</Text>
              </View>
              <Text style={styles.hotelName}>{item.hotelName}</Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: badgeStyle.bg,
                  borderColor: badgeStyle.border,
                },
              ]}
            >
              <Text style={[styles.statusText, { color: badgeStyle.text }]}>
                {(item.status || 'confirmed').toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Card Body Grid */}
          <View style={styles.cardBodyGrid}>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>CHECK-IN</Text>
              <Text style={styles.infoVal}>{formatDate(item.checkIn)}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>CHECK-OUT</Text>
              <Text style={styles.infoVal}>{formatDate(item.checkOut)}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>ROOM TIER</Text>
              <Text style={[styles.infoVal, styles.capitalize]}>
                {item.roomType} Room
              </Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>GUESTS</Text>
              <Text style={styles.infoVal}>
                {item.adults} Adult{item.adults > 1 ? 's' : ''}
                {item.children > 0 ? `, ${item.children} Child` : ''}
              </Text>
            </View>
          </View>

          {/* Card Footer */}
          <View style={styles.cardFooter}>
            <View style={styles.guestInfo}>
              <Text style={styles.guestName}>
                👤 {item.firstName} {item.lastName}
              </Text>
              <Text style={styles.guestEmail}>{item.email}</Text>
            </View>
            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>TOTAL PAID</Text>
              <Text style={styles.totalValue}>
                {formatPrice(item.totalPrice)}
              </Text>
            </View>
          </View>
        </View>
      );
    },
    []
  );

  const keyExtractor = useCallback(
    (item: BookingPayload) => String(item.id || item._id || item.bookingRef),
    []
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.BG_PAGE} />
        <View style={styles.authBox}>
          <Text style={styles.authIcon}>🏨</Text>
          <Text style={styles.authTitle}>My Reservations</Text>
          <Text style={styles.authText}>
            Please sign in to view and manage your LuxeStay hotel bookings.
          </Text>
          <Button
            title="Sign In to LuxeStay"
            onPress={() => navigation.navigate('Login')}
            size="lg"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.PRIMARY} />
      {/* Top Banner Header */}
      <View style={styles.topHeaderBanner}>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>My Bookings</Text>
          <Text style={styles.bannerSubtitle}>
            Manage and view details for all your hotel reservations
          </Text>
        </View>
        <TouchableOpacity
          style={styles.bookAnotherBtn}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.88}
        >
          <Text style={styles.bookAnotherBtnText}>+ Book Stays</Text>
        </TouchableOpacity>
      </View>

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
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.PRIMARY]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              message="No Reservations Found"
              suggestion="You haven't booked any hotel stays yet. Explore our premier hotel catalog to plan your next retreat!"
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
    backgroundColor: COLORS.BG_PAGE,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.LG,
    backgroundColor: COLORS.BG_PAGE,
  },
  authBox: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.XL,
    padding: SPACING.XL,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOWS.LG,
  },
  authIcon: {
    fontSize: 48,
    marginBottom: SPACING.MD,
  },
  authTitle: {
    fontSize: FONT_SIZE.H2,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  authText: {
    fontSize: FONT_SIZE.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: SPACING.LG,
    lineHeight: 18,
  },
  topHeaderBanner: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.LG,
    paddingHorizontal: SPACING.MD,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.MD,
    ...SHADOWS.MD,
  },
  bannerTitle: {
    fontSize: FONT_SIZE.H2,
    fontWeight: '900',
    color: COLORS.WHITE,
    letterSpacing: -0.3,
  },
  bannerSubtitle: {
    fontSize: FONT_SIZE.BODY_SMALL,
    color: COLORS.PRIMARY_SURFACE,
    marginTop: 2,
  },
  bookAnotherBtn: {
    backgroundColor: COLORS.SECONDARY,
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    ...SHADOWS.GOLD_GLOW,
  },
  bookAnotherBtnText: {
    color: COLORS.WHITE,
    fontWeight: '800',
    fontSize: FONT_SIZE.BODY_SMALL,
  },
  listContainer: {
    padding: SPACING.MD,
    paddingBottom: SPACING.XXL,
  },
  bookingCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.LG,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    marginBottom: SPACING.MD + 2,
    padding: SPACING.LG,
    ...SHADOWS.MD,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BG_SECONDARY,
    paddingBottom: SPACING.MD,
    marginBottom: SPACING.MD,
    gap: SPACING.SM,
  },
  refBadge: {
    backgroundColor: COLORS.PRIMARY_SURFACE,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: BORDER_RADIUS.SM,
    alignSelf: 'flex-start',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY_TINT,
  },
  refText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.PRIMARY,
    letterSpacing: 0.5,
  },
  hotelName: {
    fontSize: FONT_SIZE.BODY_LARGE + 1,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: -0.2,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: SPACING.SM + 2,
    borderRadius: BORDER_RADIUS.ROUND,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  cardBodyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: SPACING.MD,
    marginBottom: SPACING.MD,
  },
  infoCol: {
    width: '48%',
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.TEXT_MUTED,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  infoVal: {
    fontSize: FONT_SIZE.BODY_MEDIUM,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
  },
  capitalize: {
    textTransform: 'capitalize',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.BG_SECONDARY,
    paddingTop: SPACING.MD - 2,
  },
  guestInfo: {
    flex: 1,
  },
  guestName: {
    fontSize: FONT_SIZE.BODY_SMALL,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
  },
  guestEmail: {
    fontSize: 11,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 1,
  },
  totalBox: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.TEXT_MUTED,
    letterSpacing: 0.6,
  },
  totalValue: {
    fontSize: FONT_SIZE.H3,
    fontWeight: '900',
    color: COLORS.PRIMARY,
    letterSpacing: -0.3,
  },
});
