import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, SafeAreaView, TouchableOpacity, Share } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { fetchHotelById } from '../api/hotelApi';
import { Hotel } from '../types/hotel';
import { COLORS } from '../constants/colors';
import { BORDER_RADIUS, FONT_SIZE, SPACING, SHADOWS } from '../constants/theme';
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
    return <LoadingSpinner message="Fetching details of the hotel..." fullScreen />;
  }

  if (error || !hotel) {
    return <ErrorMessage message={error || 'Hotel not found'} onRetry={loadHotel} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Main Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: hotel.image }} style={styles.image} resizeMode="cover" />
          <TouchableOpacity style={styles.shareBadge} onPress={handleShare}>
            <Text style={styles.shareText}>Share 📤</Text>
          </TouchableOpacity>
        </View>

        {/* Content Card */}
        <View style={styles.contentCard}>
          <View style={styles.headerRow}>
            <Text style={styles.typeBadge}>{hotel.type}</Text>
            <View style={styles.ratingBox}>
              <Text style={styles.ratingText}>⭐ {hotel.rating.toFixed(1)} / 5.0</Text>
            </View>
          </View>

          <Text style={styles.name}>{hotel.name}</Text>
          <Text style={styles.address}>📍 {hotel.address}, {hotel.city}, {hotel.country}</Text>

          <View style={styles.divider} />

          {/* Description */}
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.description}>{hotel.description}</Text>

          <View style={styles.divider} />

          {/* Amenities Grid */}
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesContainer}>
            {hotel.amenities.map((amenity, idx) => (
              <View key={idx} style={styles.amenityBadge}>
                <Text style={styles.amenityText}>✔️ {amenity}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          {/* Room configuration info */}
          <Text style={styles.sectionTitle}>Rooms & Capacity</Text>
          <Text style={styles.roomDesc}>
            This property features {hotel.rooms} total luxury rooms. Standard, Deluxe, and Suite packages are available. Free cancellation is offered up to 24 hours prior to check-in.
          </Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.priceLabel}>RATES STARTING FROM</Text>
          <Text style={styles.priceValue}>{formatPrice(hotel.price)} <Text style={styles.priceUnit}>/ night</Text></Text>
        </View>
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => navigation.navigate('Booking', { id: hotel.id })}
        >
          <Text style={styles.bookBtnText}>Book Stay</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG_SECONDARY,
  },
  scrollContainer: {
    paddingBottom: 100, // Safe padding for bottom bar
  },
  imageContainer: {
    width: '100%',
    height: 240,
    position: 'relative',
    backgroundColor: COLORS.BG_SECONDARY,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  shareBadge: {
    position: 'absolute',
    top: SPACING.MD,
    right: SPACING.MD,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: SPACING.XS,
    paddingHorizontal: SPACING.SM,
    borderRadius: BORDER_RADIUS.SM,
  },
  shareText: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
    fontSize: FONT_SIZE.BODY_SMALL,
  },
  contentCard: {
    backgroundColor: COLORS.WHITE,
    padding: SPACING.MD,
    borderTopLeftRadius: BORDER_RADIUS.XL,
    borderTopRightRadius: BORDER_RADIUS.XL,
    marginTop: -BORDER_RADIUS.XL,
    ...SHADOWS.MD,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  typeBadge: {
    backgroundColor: COLORS.SECONDARY_LIGHT,
    color: COLORS.PRIMARY_DARK,
    fontWeight: 'bold',
    fontSize: FONT_SIZE.BODY_SMALL,
    paddingVertical: 4,
    paddingHorizontal: SPACING.MD,
    borderRadius: BORDER_RADIUS.ROUND,
    textTransform: 'uppercase',
  },
  ratingBox: {
    backgroundColor: '#fffbeb',
    borderColor: '#fef3c7',
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: SPACING.SM,
    borderRadius: BORDER_RADIUS.MD,
  },
  ratingText: {
    color: '#d97706',
    fontWeight: 'bold',
    fontSize: FONT_SIZE.BODY_SMALL,
  },
  name: {
    fontSize: FONT_SIZE.H1,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS,
  },
  address: {
    fontSize: FONT_SIZE.BODY_MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.BORDER,
    marginVertical: SPACING.MD,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.H3,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  description: {
    fontSize: FONT_SIZE.BODY_MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 22,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityBadge: {
    backgroundColor: COLORS.BG_SECONDARY,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: BORDER_RADIUS.SM,
    paddingVertical: SPACING.XS + 2,
    paddingHorizontal: SPACING.SM,
    marginRight: SPACING.SM,
    marginBottom: SPACING.SM,
  },
  amenityText: {
    fontSize: FONT_SIZE.BODY_SMALL,
    color: COLORS.TEXT_PRIMARY,
  },
  roomDesc: {
    fontSize: FONT_SIZE.BODY_MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.WHITE,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    padding: SPACING.MD,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.LG,
  },
  priceLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 1,
  },
  priceValue: {
    fontSize: FONT_SIZE.H2,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  priceUnit: {
    fontSize: FONT_SIZE.BODY_SMALL,
    fontWeight: 'normal',
    color: COLORS.TEXT_SECONDARY,
  },
  bookBtn: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.MD - 2,
    paddingHorizontal: SPACING.XL,
    borderRadius: BORDER_RADIUS.MD,
    ...SHADOWS.SM,
  },
  bookBtnText: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
    fontSize: FONT_SIZE.BODY_LARGE,
  },
});
