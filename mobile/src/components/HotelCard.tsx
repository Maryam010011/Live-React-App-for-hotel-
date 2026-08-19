import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Hotel } from '../types/hotel';
import { COLORS } from '../constants/colors';
import { BORDER_RADIUS, FONT_SIZE, SHADOWS, SPACING } from '../constants/theme';
import { formatPrice } from '../utils/formatters';

interface HotelCardProps {
  hotel: Hotel;
  onPress: () => void;
}

export const HotelCard: React.FC<HotelCardProps> = React.memo(({ hotel, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.95}>
      <Image source={{ uri: hotel.image }} style={styles.image} resizeMode="cover" />
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.type}>{hotel.type.toUpperCase()}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>⭐ {hotel.rating.toFixed(1)}</Text>
          </View>
        </View>
        <Text style={styles.name} numberOfLines={1}>
          {hotel.name}
        </Text>
        <Text style={styles.location}>
          📍 {hotel.city}, {hotel.country}
        </Text>
        <View style={styles.footerRow}>
          <View>
            <Text style={styles.priceLabel}>Price per night</Text>
            <Text style={styles.price}>{formatPrice(hotel.price)}</Text>
          </View>
          <View style={styles.detailsBtn}>
            <Text style={styles.detailsBtnText}>View Details →</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.LG,
    overflow: 'hidden',
    marginBottom: SPACING.MD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOWS.SM,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.BG_SECONDARY,
  },
  content: {
    padding: SPACING.MD,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.XS,
  },
  type: {
    fontSize: FONT_SIZE.BODY_SMALL,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
    letterSpacing: 0.5,
  },
  ratingContainer: {
    backgroundColor: '#fffbeb',
    paddingHorizontal: SPACING.SM,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.ROUND,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  ratingText: {
    fontSize: FONT_SIZE.BODY_SMALL,
    fontWeight: 'bold',
    color: '#d97706',
  },
  name: {
    fontSize: FONT_SIZE.H3,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  location: {
    fontSize: FONT_SIZE.BODY_MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.MD,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    paddingTop: SPACING.SM,
  },
  priceLabel: {
    fontSize: 10,
    color: COLORS.TEXT_SECONDARY,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  price: {
    fontSize: FONT_SIZE.H2,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  detailsBtn: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.SM - 2,
    paddingHorizontal: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
  },
  detailsBtnText: {
    color: COLORS.WHITE,
    fontWeight: '600',
    fontSize: FONT_SIZE.BODY_SMALL,
  },
});

export default HotelCard;
