import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ImageBackground,
  Image,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';
import { BORDER_RADIUS, FONT_SIZE, SHADOWS, SPACING } from '../constants/theme';
import InputField from '../components/InputField';
import Button from '../components/Button';

const { width } = Dimensions.get('window');
const CITY_CARD_WIDTH = (width - SPACING.MD * 2 - SPACING.SM) / 2;

// Popular destinations matching the web application
const POPULAR_CITIES = [
  {
    name: 'Dubai',
    country: 'United Arab Emirates',
    count: '1,240+ Hotels',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80',
  },
  {
    name: 'Paris',
    country: 'France',
    count: '890+ Hotels',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80',
  },
  {
    name: 'New York',
    country: 'United States',
    count: '1,450+ Hotels',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80',
  },
  {
    name: 'London',
    country: 'United Kingdom',
    count: '1,120+ Hotels',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80',
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    count: '980+ Hotels',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80',
  },
  {
    name: 'Rome',
    country: 'Italy',
    count: '760+ Hotels',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=80',
  },
];

export default function HomeScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  const [city, setCity] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState<number | null>(null);

  const handleSearch = (searchCity?: string) => {
    const targetCity = searchCity !== undefined ? searchCity : city.trim();
    navigation.navigate('HotelList', {
      city: targetCity,
      minPrice: minPrice ? parseInt(minPrice, 10) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice, 10) : undefined,
      minRating: minRating || undefined,
    });
  };

  const clearFilters = () => {
    setCity('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.NAVY_DARK} />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Hero Section ─────────────────────────────────────────────────── */}
        <ImageBackground
          source={{
            uri: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80',
          }}
          style={styles.heroBanner}
          resizeMode="cover"
        >
          <View style={styles.heroOverlay}>
            {/* Top User Bar */}
            <View style={styles.topBar}>
              <View style={styles.brandRow}>
                <Text style={styles.brandLogoText}>LuxeStay</Text>
              </View>

              {user ? (
                <View style={styles.userPill}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>
                      {user.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.userName} numberOfLines={1}>
                    {user.name}
                  </Text>
                  <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                    <Text style={styles.logoutBtnText}>Logout</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => navigation.navigate('Login')}
                  style={styles.headerLoginBtn}
                >
                  <Text style={styles.headerLoginBtnText}>Sign In</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Hero Main Content */}
            <View style={styles.heroContent}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeStar}>★</Text>
                <Text style={styles.heroBadgeText}>
                  Premier Luxury Hotel Booking Platform
                </Text>
              </View>

              <Text style={styles.heroTitle}>
                Experience Hospitality Redefined
              </Text>
              <Text style={styles.heroSubtitle}>
                Book handpicked 5-star hotels, luxury resorts, and boutique stays
                worldwide with instant confirmation.
              </Text>
            </View>
          </View>
        </ImageBackground>

        {/* ─── Search Card ──────────────────────────────────────────────────── */}
        <View style={styles.searchCard}>
          <Text style={styles.searchCardTitle}>Find Your Stay</Text>

          <InputField
            label="Where are you going?"
            placeholder="Search by city (e.g., Dubai, Paris, New York)..."
            value={city}
            onChangeText={setCity}
            leftIcon={<Text style={styles.inputSearchIcon}>🔍</Text>}
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <InputField
                label="Min Price ($)"
                placeholder="0"
                value={minPrice}
                onChangeText={setMinPrice}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfWidth}>
              <InputField
                label="Max Price ($)"
                placeholder="500"
                value={maxPrice}
                onChangeText={setMaxPrice}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Rating filter selector */}
          <Text style={styles.filterLabel}>Minimum Rating</Text>
          <View style={styles.ratingRow}>
            {[3.0, 4.0, 4.5, 4.8].map((rating) => (
              <TouchableOpacity
                key={rating}
                style={[
                  styles.ratingPill,
                  minRating === rating && styles.ratingPillActive,
                ]}
                onPress={() => setMinRating(minRating === rating ? null : rating)}
              >
                <Text
                  style={[
                    styles.ratingPillText,
                    minRating === rating && styles.ratingPillTextActive,
                  ]}
                >
                  ⭐ {rating}+
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            title="Search Hotels"
            onPress={() => handleSearch()}
            style={styles.searchBtn}
            size="lg"
          />

          {city || minPrice || maxPrice || minRating ? (
            <TouchableOpacity onPress={clearFilters} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>Reset Search Filters</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* ─── Stats Bar ────────────────────────────────────────────────────── */}
        <View style={styles.statsBar}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>500K+</Text>
              <Text style={styles.statLabel}>Rooms Worldwide</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>120+</Text>
              <Text style={styles.statLabel}>Countries</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>4.9/5</Text>
              <Text style={styles.statLabel}>Average Rating</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>24/7</Text>
              <Text style={styles.statLabel}>VIP Support</Text>
            </View>
          </View>
        </View>

        {/* ─── Top Destinations ─────────────────────────────────────────────── */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTag}>TOP DESTINATIONS</Text>
            <Text style={styles.sectionTitle}>Explore Iconic Cities</Text>
            <Text style={styles.sectionSubtitle}>
              Discover top-rated luxury stays in the world's most sought-after
              travel destinations
            </Text>
          </View>

          <View style={styles.destinationsGrid}>
            {POPULAR_CITIES.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.destinationCard}
                onPress={() => handleSearch(item.name)}
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri: item.image }}
                  style={styles.destinationImg}
                  resizeMode="cover"
                />
                <View style={styles.destinationOverlay}>
                  <View style={styles.destinationCountBadge}>
                    <Text style={styles.destinationCountText}>{item.count}</Text>
                  </View>
                  <Text style={styles.destinationName}>{item.name}</Text>
                  <Text style={styles.destinationCountry}>{item.country}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ─── Value Propositions (Why LuxeStay) ────────────────────────────── */}
        <View style={styles.featuresSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTag}>WHY LUXESTAY</Text>
            <Text style={styles.sectionTitle}>Built for Discerning Travelers</Text>
            <Text style={styles.sectionSubtitle}>
              Direct REST integration with live rates and price match guarantee
            </Text>
          </View>

          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <View style={styles.featureIconBox}>
                <Text style={styles.featureIcon}>🔍</Text>
              </View>
              <Text style={styles.featureTitle}>Real-Time Search</Text>
              <Text style={styles.featureDesc}>
                Direct database & API integration delivers live rates across
                top properties worldwide.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconBox}>
                <Text style={styles.featureIcon}>💎</Text>
              </View>
              <Text style={styles.featureTitle}>Best Price Guarantee</Text>
              <Text style={styles.featureDesc}>
                We compare prices across global networks to ensure the lowest
                available rate.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconBox}>
                <Text style={styles.featureIcon}>🛡️</Text>
              </View>
              <Text style={styles.featureTitle}>Instant & Secure</Text>
              <Text style={styles.featureDesc}>
                256-bit encrypted checkout with instant reservation confirmation.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconBox}>
                <Text style={styles.featureIcon}>🌍</Text>
              </View>
              <Text style={styles.featureTitle}>Worldwide Coverage</Text>
              <Text style={styles.featureDesc}>
                From metropolitan hubs to tranquil beach resorts, access top stays.
              </Text>
            </View>
          </View>
        </View>

        {/* ─── Bottom CTA Banner ────────────────────────────────────────────── */}
        <View style={styles.ctaContainer}>
          <View style={styles.ctaCard}>
            <View style={styles.ctaBadge}>
              <Text style={styles.ctaBadgeText}>FLEXIBLE BOOKING</Text>
            </View>
            <Text style={styles.ctaTitle}>Ready to plan your next retreat?</Text>
            <Text style={styles.ctaSubtitle}>
              Enjoy free cancellation up to 24h prior to check-in on select rooms.
            </Text>
            <Button
              title="Browse All Hotels →"
              variant="gold"
              onPress={() => handleSearch('')}
              style={styles.ctaBtn}
              size="lg"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG_PAGE,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: SPACING.XL,
  },

  /* ─── Hero Styles ──────────────────────────────────────────────────────── */
  heroBanner: {
    width: '100%',
    minHeight: 380,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: SPACING.MD,
    paddingTop: SPACING.MD,
    paddingBottom: SPACING.XXL + 20,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.LG,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogoText: {
    fontSize: FONT_SIZE.H2,
    fontWeight: '900',
    color: COLORS.WHITE,
    letterSpacing: 0.5,
  },
  userPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 3,
    paddingHorizontal: SPACING.SM,
    borderRadius: BORDER_RADIUS.ROUND,
    gap: SPACING.XS + 2,
  },
  userAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.SECONDARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    color: COLORS.WHITE,
    fontSize: 11,
    fontWeight: '800',
  },
  userName: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZE.BODY_SMALL,
    fontWeight: '600',
    maxWidth: 90,
  },
  logoutBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: BORDER_RADIUS.SM,
    marginLeft: 2,
  },
  logoutBtnText: {
    color: COLORS.WHITE,
    fontSize: 10,
    fontWeight: '700',
  },
  headerLoginBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    paddingVertical: SPACING.XS + 2,
    paddingHorizontal: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
  },
  headerLoginBtnText: {
    color: COLORS.WHITE,
    fontWeight: '700',
    fontSize: FONT_SIZE.BODY_SMALL,
  },

  heroContent: {
    alignItems: 'center',
    textAlign: 'center',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 5,
    paddingHorizontal: SPACING.MD,
    borderRadius: BORDER_RADIUS.ROUND,
    marginBottom: SPACING.MD,
    gap: 6,
  },
  heroBadgeStar: {
    color: COLORS.WARNING,
    fontSize: 12,
  },
  heroBadgeText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZE.CAPTION + 1,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  heroTitle: {
    fontSize: FONT_SIZE.HERO,
    fontWeight: '900',
    color: COLORS.WHITE,
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 38,
    marginBottom: SPACING.SM,
  },
  heroSubtitle: {
    fontSize: FONT_SIZE.BODY_MEDIUM,
    color: COLORS.BORDER,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: SPACING.SM,
  },

  /* ─── Search Card Styles ───────────────────────────────────────────────── */
  searchCard: {
    backgroundColor: COLORS.WHITE,
    marginHorizontal: SPACING.MD,
    marginTop: -SPACING.XL - 8,
    borderRadius: BORDER_RADIUS.XL,
    padding: SPACING.MD + 4,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOWS.LG,
  },
  searchCardTitle: {
    fontSize: FONT_SIZE.H3,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
    letterSpacing: -0.3,
  },
  inputSearchIcon: {
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  filterLabel: {
    fontSize: FONT_SIZE.BODY_SMALL,
    fontWeight: '600',
    color: COLORS.TEXT_DARK,
    marginBottom: SPACING.SM,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.MD + 4,
  },
  ratingPill: {
    paddingVertical: SPACING.SM - 1,
    paddingHorizontal: SPACING.SM + 2,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    borderRadius: BORDER_RADIUS.ROUND,
    backgroundColor: COLORS.BG_PAGE,
  },
  ratingPillActive: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  ratingPillText: {
    fontSize: FONT_SIZE.BODY_SMALL - 1,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '700',
  },
  ratingPillTextActive: {
    color: COLORS.WHITE,
  },
  searchBtn: {
    marginTop: SPACING.XS,
  },
  clearBtn: {
    alignItems: 'center',
    marginTop: SPACING.MD,
    paddingVertical: SPACING.XS,
  },
  clearBtnText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONT_SIZE.BODY_SMALL,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  /* ─── Stats Bar ────────────────────────────────────────────────────────── */
  statsBar: {
    backgroundColor: COLORS.WHITE,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.BORDER,
    marginTop: SPACING.LG,
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.SM,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: FONT_SIZE.H3,
    fontWeight: '900',
    color: COLORS.PRIMARY,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },

  /* ─── Section Header ───────────────────────────────────────────────────── */
  sectionContainer: {
    paddingHorizontal: SPACING.MD,
    paddingTop: SPACING.XL,
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: SPACING.LG,
    paddingHorizontal: SPACING.SM,
  },
  sectionTag: {
    fontSize: FONT_SIZE.CAPTION,
    fontWeight: '800',
    color: COLORS.PRIMARY,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.H2,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZE.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },

  /* ─── Destinations Grid (Image Cards) ─────────────────────────────────── */
  destinationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  destinationCard: {
    width: CITY_CARD_WIDTH,
    height: 190,
    borderRadius: BORDER_RADIUS.LG,
    overflow: 'hidden',
    marginBottom: SPACING.MD,
    backgroundColor: COLORS.NAVY_DARK,
    ...SHADOWS.MD,
  },
  destinationImg: {
    width: '100%',
    height: '100%',
  },
  destinationOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
    padding: SPACING.MD - 2,
  },
  destinationCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: BORDER_RADIUS.ROUND,
    marginBottom: 4,
  },
  destinationCountText: {
    color: COLORS.WHITE,
    fontSize: 9,
    fontWeight: '700',
  },
  destinationName: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZE.H4,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  destinationCountry: {
    color: COLORS.TEXT_MUTED,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },

  /* ─── Features (Why LuxeStay) ──────────────────────────────────────────── */
  featuresSection: {
    backgroundColor: COLORS.BG_SECONDARY,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.BORDER,
    paddingVertical: SPACING.XL,
    paddingHorizontal: SPACING.MD,
    marginTop: SPACING.MD,
  },
  featuresGrid: {
    gap: SPACING.MD,
  },
  featureCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.MD + 2,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOWS.SM,
  },
  featureIconBox: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.MD,
    backgroundColor: COLORS.PRIMARY_SURFACE,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY_TINT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.SM,
  },
  featureIcon: {
    fontSize: 20,
  },
  featureTitle: {
    fontSize: FONT_SIZE.BODY_LARGE,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: FONT_SIZE.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 18,
  },

  /* ─── Bottom CTA ───────────────────────────────────────────────────────── */
  ctaContainer: {
    paddingHorizontal: SPACING.MD,
    paddingTop: SPACING.XL,
  },
  ctaCard: {
    backgroundColor: COLORS.NAVY_DARK,
    borderRadius: BORDER_RADIUS.XL,
    padding: SPACING.LG,
    ...SHADOWS.LG,
  },
  ctaBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: BORDER_RADIUS.SM,
    marginBottom: SPACING.SM,
  },
  ctaBadgeText: {
    color: COLORS.WHITE,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  ctaTitle: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZE.H3,
    fontWeight: '900',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  ctaSubtitle: {
    color: COLORS.TEXT_MUTED,
    fontSize: FONT_SIZE.BODY_SMALL,
    lineHeight: 18,
    marginBottom: SPACING.MD,
  },
  ctaBtn: {
    marginTop: SPACING.XS,
  },
});
