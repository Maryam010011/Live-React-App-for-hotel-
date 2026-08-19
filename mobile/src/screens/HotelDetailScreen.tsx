import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Share,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { fetchHotelById } from '../api/hotelApi';
import { Hotel } from '../types/hotel';
import { COLORS } from '../constants/colors';
import { BORDER_RADIUS, FONT_SIZE, SHADOWS, SPACING } from '../constants/theme';
import { formatPrice } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Button from '../components/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'HotelDetail'>;

export default function HotelDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHotel = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHotelById(id);
      if (data) {
        setHotel(data);
      } else {
        setError('Hotel listing not found.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load hotel details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHotel();
  }, [id]);

  const handleShare = async () => {
    if (!hotel) return;
    try {
      await Share.share({
        message: `Check out ${hotel.name} in ${hotel.city}, ${hotel.country}! Rates from ${formatPrice(hotel.price)}/night.`,
      });
    } catch (error) {
      console.warn('Share failed:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Fetching hotel details..." fullScreen />;
  }

  if (error || !hotel) {
    return <ErrorMessage message={error || 'Hotel not found'} onRetry={loadHotel} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.NAVY_DARK} />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Main Hero Image ────────────────────────────────────────────── */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: hotel.image }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.topBadgesRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{hotel.type.toUpperCase()}</Text>
            </View>
            <TouchableOpacity style={styles.shareBadge} onPress={handleShare}>
              <Text style={styles.shareText}>Share 📤</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Content Body ───────────────────────────────────────────────── */}
        <View style={styles.contentCard}>
          {/* Header row: title and rating */}
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{hotel.name}</Text>
              <Text style={styles.location}>
                📍 {hotel.address}, {hotel.city}, {hotel.country}
              </Text>
            </View>
            <View style={styles.ratingBox}>
              <Text style={styles.ratingStar}>⭐</Text>
              <Text style={styles.ratingNumber}>{hotel.rating.toFixed(1)}</Text>
              <Text style={styles.ratingOutOf}>/ 5.0</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* ─── Specifications Grid (Matching Web App) ──────────────────── */}
          <Text style={styles.sectionHeading}>Property Overview</Text>
          <View style={styles.specGrid}>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>PROPERTY TYPE</Text>
              <Text style={styles.specValue}>{hotel.type}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>TOTAL ROOMS</Text>
              <Text style={styles.specValue}>{hotel.rooms} Suites</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>CANCELLATION</Text>
              <Text style={styles.specValueFree}>Free (24h)</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>CHECK-IN</Text>
              <Text style={styles.specValue}>3:00 PM</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* ─── Description ──────────────────────────────────────────────── */}
          <Text style={styles.sectionHeading}>About the Property</Text>
          <Text style={styles.description}>{hotel.description}</Text>

          <View style={styles.divider} />

          {/* ─── Amenities Grid ───────────────────────────────────────────── */}
          <Text style={styles.sectionHeading}>Featured Amenities</Text>
          <View style={styles.amenitiesContainer}>
            {hotel.amenities.map((amenity, idx) => (
              <View key={idx} style={styles.amenityBadge}>
                <Text style={styles.amenityCheck}>✓</Text>
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* ─── Sticky Bottom Bar (Matching Web App) ─────────────────────────── */}
      <View style={styles.bottomBar}>
        <View style={styles.priceColumn}>
          <Text style={styles.priceLabel}>RATES STARTING FROM</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceValue}>{formatPrice(hotel.price)}</Text>
            <Text style={styles.priceUnit}>/ night</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => navigation.navigate('Booking', { id: hotel.id })}
          activeOpacity={0.88}
        >
          <Text style={styles.bookBtnText}>Book Stay Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG_PAGE,
  },
  scrollContainer: {
    paddingBottom: 110,
  },
  imageContainer: {
    width: '100%',
    height: 260,
    position: 'relative',
    backgroundColor: COLORS.BG_SECONDARY,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  topBadgesRow: {
    position: 'absolute',
    top: SPACING.MD,
    left: SPACING.MD,
    right: SPACING.MD,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    backgroundColor: COLORS.SECONDARY_GOLD,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.ROUND,
    ...SHADOWS.SM,
  },
  typeBadgeText: {
    color: COLORS.WHITE,
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.6,
  },
  shareBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.ROUND,
  },
  shareText: {
    color: COLORS.WHITE,
    fontWeight: '700',
    fontSize: 12,
  },
  contentCard: {
    backgroundColor: COLORS.WHITE,
    padding: SPACING.LG,
    borderTopLeftRadius: BORDER_RADIUS.XXL,
    borderTopRightRadius: BORDER_RADIUS.XXL,
    marginTop: -BORDER_RADIUS.XL,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOWS.MD,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: SPACING.MD,
  },
  name: {
    fontSize: FONT_SIZE.H2,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: -0.3,
  },
  location: {
    fontSize: FONT_SIZE.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
    fontWeight: '500',
    lineHeight: 18,
  },
  ratingBox: {
    backgroundColor: COLORS.SECONDARY_LIGHT,
    borderColor: COLORS.SECONDARY_MUTED,
    borderWidth: 1.5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: BORDER_RADIUS.MD,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  ratingStar: {
    fontSize: 14,
  },
  ratingNumber: {
    color: COLORS.SECONDARY,
    fontWeight: '900',
    fontSize: FONT_SIZE.BODY_LARGE,
  },
  ratingOutOf: {
    color: COLORS.SECONDARY,
    fontWeight: '600',
    fontSize: 10,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.BG_SECONDARY,
    marginVertical: SPACING.LG,
  },
  sectionHeading: {
    fontSize: FONT_SIZE.BODY_LARGE,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD - 2,
    letterSpacing: -0.2,
  },
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.SM,
  },
  specItem: {
    width: '48%',
    backgroundColor: COLORS.BG_SECONDARY,
    padding: SPACING.MD - 2,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  specLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.TEXT_MUTED,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  specValue: {
    fontSize: FONT_SIZE.BODY_MEDIUM,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
  },
  specValueFree: {
    fontSize: FONT_SIZE.BODY_MEDIUM,
    fontWeight: '800',
    color: COLORS.SUCCESS,
  },
  description: {
    fontSize: FONT_SIZE.BODY_MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 22,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SM,
  },
  amenityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BG_SECONDARY,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: BORDER_RADIUS.MD,
    paddingVertical: SPACING.SM - 2,
    paddingHorizontal: SPACING.MD - 2,
    gap: 6,
  },
  amenityCheck: {
    color: COLORS.SUCCESS,
    fontWeight: '900',
    fontSize: 12,
  },
  amenityText: {
    fontSize: FONT_SIZE.BODY_SMALL,
    color: COLORS.TEXT_DARK,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.NAVY_DARK,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.LG,
  },
  priceColumn: {
    justifyContent: 'center',
  },
  priceLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.TEXT_MUTED,
    letterSpacing: 0.8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    marginTop: 1,
  },
  priceValue: {
    fontSize: FONT_SIZE.H2,
    fontWeight: '900',
    color: COLORS.WHITE,
    letterSpacing: -0.5,
  },
  priceUnit: {
    fontSize: FONT_SIZE.BODY_SMALL,
    color: COLORS.TEXT_MUTED,
    fontWeight: '600',
  },
  bookBtn: {
    backgroundColor: COLORS.SECONDARY,
    paddingVertical: SPACING.SM + 4,
    paddingHorizontal: SPACING.LG + 4,
    borderRadius: BORDER_RADIUS.MD,
    ...SHADOWS.GOLD_GLOW,
  },
  bookBtnText: {
    color: COLORS.WHITE,
    fontWeight: '800',
    fontSize: FONT_SIZE.BODY_MEDIUM,
    letterSpacing: 0.2,
  },
});
