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
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.92}
    >
      {/* Image with type badge */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: hotel.image }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{hotel.type.toUpperCase()}</Text>
        </View>
      </View>

      {/* Card Content */}
      <View style={styles.content}>
        {/* Header: Title and Rating */}
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {hotel.name}
          </Text>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>⭐ {hotel.rating.toFixed(1)}</Text>
          </View>
        </View>

        {/* Location */}
        <Text style={styles.location}>
          📍 {hotel.city}, {hotel.country}
        </Text>

        {/* Short Description */}
        {hotel.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {hotel.description}
          </Text>
        ) : null}

        {/* Footer: Price & CTA */}
        <View style={styles.footerRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>PRICE PER NIGHT</Text>
            <View style={styles.priceValueRow}>
              <Text style={styles.price}>{formatPrice(hotel.price)}</Text>
              <Text style={styles.pricePeriod}>/ night</Text>
            </View>
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
    marginBottom: SPACING.MD + 4,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOWS.MD,
  },
  imageWrapper: {
    width: '100%',
    height: 190,
    position: 'relative',
    backgroundColor: COLORS.BG_SECONDARY,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: SPACING.SM + 2,
    right: SPACING.SM + 2,
    backgroundColor: COLORS.SECONDARY_GOLD,
    paddingVertical: 4,
    paddingHorizontal: SPACING.SM + 2,
    borderRadius: BORDER_RADIUS.ROUND,
    ...SHADOWS.SM,
  },
  badgeText: {
    color: COLORS.WHITE,
    fontWeight: '800',
    fontSize: FONT_SIZE.CAPTION,
    letterSpacing: 0.5,
  },
  content: {
    padding: SPACING.MD,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    gap: SPACING.SM,
  },
  name: {
    flex: 1,
    fontSize: FONT_SIZE.BODY_LARGE + 1,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: -0.2,
  },
  ratingBadge: {
    backgroundColor: COLORS.SECONDARY_LIGHT,
    borderWidth: 1,
    borderColor: COLORS.SECONDARY_MUTED,
    paddingHorizontal: SPACING.SM,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.SM,
    alignItems: 'center',
  },
  ratingText: {
    fontSize: FONT_SIZE.BODY_SMALL,
    fontWeight: '800',
    color: COLORS.SECONDARY,
  },
  location: {
    fontSize: FONT_SIZE.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.SM,
    fontWeight: '500',
  },
  description: {
    fontSize: FONT_SIZE.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 18,
    marginBottom: SPACING.MD,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.BG_SECONDARY,
    paddingTop: SPACING.SM + 4,
    marginTop: 2,
  },
  priceContainer: {
    justifyContent: 'center',
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.TEXT_MUTED,
    letterSpacing: 0.6,
    marginBottom: 1,
  },
  priceValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  price: {
    fontSize: FONT_SIZE.H3 + 2,
    fontWeight: '900',
    color: COLORS.PRIMARY,
    letterSpacing: -0.3,
  },
  pricePeriod: {
    fontSize: FONT_SIZE.BODY_SMALL - 1,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
  },
  detailsBtn: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.MD + 2,
    borderRadius: BORDER_RADIUS.MD,
    ...SHADOWS.SM,
  },
  detailsBtnText: {
    color: COLORS.WHITE,
    fontWeight: '700',
    fontSize: FONT_SIZE.BODY_SMALL,
    letterSpacing: 0.2,
  },
});

export default HotelCard;
