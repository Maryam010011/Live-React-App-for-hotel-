import React, { useState, useMemo } from 'react';
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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
    name: 'New York',
    country: 'United States',
    count: '1,450+ Hotels',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80',
  },
  {
    name: 'Los Angeles',
    country: 'United States',
    count: '820+ Hotels',
    image: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=600&q=80',
  },
  {
    name: 'Chicago',
    country: 'United States',
    count: '610+ Hotels',
    image: 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=600&q=80',
  },
  {
    name: 'Miami',
    country: 'United States',
    count: '540+ Hotels',
    image: 'https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?w=600&q=80',
  },
  {
    name: 'Houston',
    country: 'United States',
    count: '480+ Hotels',
    image: 'https://images.unsplash.com/photo-1530089711124-9ce31fa6e583?w=600&q=80',
  },
  {
    name: 'San Francisco',
    country: 'United States',
    count: '520+ Hotels',
    image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&q=80',
  },
  {
    name: 'Boston',
    country: 'United States',
    count: '390+ Hotels',
    image: 'https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?w=600&q=80',
  },
  {
    name: 'Las Vegas',
    country: 'United States',
    count: '430+ Hotels',
    image: 'https://images.unsplash.com/photo-1581351123004-757df051db8e?w=600&q=80',
  },
  {
    name: 'Seattle',
    country: 'United States',
    count: '360+ Hotels',
    image: 'https://images.unsplash.com/photo-1502175371644-64951525294e?w=600&q=80',
  },
  {
    name: 'Washington',
    country: 'United States',
    count: '410+ Hotels',
    image: 'https://images.unsplash.com/photo-1501469537483-100823f53531?w=600&q=80',
  },
  {
    name: 'Toronto',
    country: 'Canada',
    count: '580+ Hotels',
    image: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=600&q=80',
  },
  {
    name: 'Vancouver',
    country: 'Canada',
    count: '340+ Hotels',
    image: 'https://images.unsplash.com/photo-1559511260-66a654ae982a?w=600&q=80',
  },
  {
    name: 'London',
    country: 'United Kingdom',
    count: '1,120+ Hotels',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80',
  },
  {
    name: 'Paris',
    country: 'France',
    count: '890+ Hotels',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80',
  },
  {
    name: 'Dubai',
    country: 'United Arab Emirates',
    count: '1,240+ Hotels',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80',
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    count: '980+ Hotels',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80',
  },
  {
    name: 'Lahore',
    country: 'Pakistan',
    count: '210+ Hotels',
    image: 'https://images.unsplash.com/photo-1622546758296-3bc0038495c3?w=600&q=80',
  },
  {
    name: 'Islamabad',
    country: 'Pakistan',
    count: '180+ Hotels',
    image: 'https://images.unsplash.com/photo-1608248597259-a97728b3a4a6?w=600&q=80',
  },
  {
    name: 'Karachi',
    country: 'Pakistan',
    count: '250+ Hotels',
    image: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=600&q=80',
  },
  {
    name: 'Mumbai',
    country: 'India',
    count: '720+ Hotels',
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&q=80',
  },
  {
    name: 'USA',
    country: 'United States',
    count: '15,000+ Hotels',
    image: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=600&q=80',
  },
];
 

export default function HomeScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  const [city, setCity] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState<number | null>(null);
  const [isCityFocused, setIsCityFocused] = useState(false);

  // Live auto-suggest destinations matching user query (Google search experience)
  const filteredSuggestions = useMemo(() => {
    const query = city.trim().toLowerCase();
    if (!query) {
      return POPULAR_CITIES.slice(0, 5);
    }
    return POPULAR_CITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.country.toLowerCase().includes(query)
    );
  }, [city]);

  const handleSelectSuggestion = (cityName: string) => {
    setCity(cityName);
    setIsCityFocused(false);
  };

  const handleSearch = (searchCity?: string) => {
    setIsCityFocused(false);
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
    setIsCityFocused(false);
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

        {/* ─── Search Card with Live Google-style Auto-Suggest ────────────── */}
        <View style={styles.searchCard}>
          <Text style={styles.searchCardTitle}>Find Your Stay</Text>

          {/* Search Input Container */}
          <View style={styles.searchFieldWrapper}>
            <InputField
              label="Where are you going?"
              placeholder="Search by city (e.g., Dubai)..."
              value={city}
              onChangeText={(text) => {
                setCity(text);
                if (!isCityFocused) setIsCityFocused(true);
              }}
              onFocus={() => setIsCityFocused(true)}
              leftIcon={<Ionicons name="search-outline" size={18} color={COLORS.PRIMARY} />}
            />

            {city.length > 0 ? (
              <TouchableOpacity
                style={styles.clearInputBtn}
                onPress={() => setCity('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={18} color={COLORS.TEXT_MUTED} />
              </TouchableOpacity>
            ) : null}

            {/* Live Auto-suggest Dropdown Modal / List */}
            {isCityFocused && filteredSuggestions.length > 0 && (
              <View style={styles.suggestionsDropdown}>
                <View style={styles.suggestionsHeader}>
                  <Text style={styles.suggestionsHeaderText}>
                    {city.trim() ? 'MATCHING DESTINATIONS' : 'POPULAR DESTINATIONS'}
                  </Text>
                  <TouchableOpacity onPress={() => setIsCityFocused(false)}>
                    <Text style={styles.suggestionsCloseText}>Done</Text>
                  </TouchableOpacity>
                </View>

                {filteredSuggestions.map((item, idx) => (
                  <TouchableOpacity
                    key={item.name + idx}
                    style={[
                      styles.suggestionItem,
                      idx === filteredSuggestions.length - 1 && styles.suggestionItemLast,
                    ]}
                    onPress={() => handleSelectSuggestion(item.name)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.suggestionIconBox}>
                      <Ionicons name="location-outline" size={16} color={COLORS.PRIMARY} />
                    </View>
                    <View style={styles.suggestionTextBox}>
                      <Text style={styles.suggestionCityText}>{item.name}</Text>
                      <Text style={styles.suggestionCountryText}>{item.country}</Text>
                    </View>
                    <View style={styles.suggestionCountBadge}>
                      <Text style={styles.suggestionCountText}>{item.count}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

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
                key={item.name + index}
                style={styles.destinationCard}
                activeOpacity={0.9}
                onPress={() => handleSearch(item.name)}
              >
                <ImageBackground
                  source={{ uri: item.image }}
                  style={styles.destinationImage}
                  imageStyle={{ borderRadius: BORDER_RADIUS.LG }}
                  resizeMode="cover"
                >
                  <View style={styles.destinationOverlay}>
                    <View style={styles.destinationBadge}>
                      <Text style={styles.destinationBadgeText}>
                        {item.count}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.destinationName}>{item.name}</Text>
                      <Text style={styles.destinationCountry}>
                        {item.country}
                      </Text>
                    </View>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ─── Features (Why LuxeStay) ──────────────────────────────────────── */}
        <View style={styles.featuresSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTag}>THE LUXESTAY DIFFERENCE</Text>
            <Text style={styles.sectionTitle}>Why Book With Us</Text>
            <Text style={styles.sectionSubtitle}>
              Curated luxury travel backed by transparent pricing and round-the-clock
              concierge assistance
            </Text>
          </View>

          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <View style={styles.featureIconBox}>
                <Text style={styles.featureIcon}>⭐</Text>
              </View>
              <Text style={styles.featureTitle}>Handpicked Luxury</Text>
              <Text style={styles.featureDesc}>
                Every property undergoes a 50-point quality audit for unmatched
                comfort and luxury.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconBox}>
                <Text style={styles.featureIcon}>💎</Text>
              </View>
              <Text style={styles.featureTitle}>Best Price Guarantee</Text>
              <Text style={styles.featureDesc}>
                Found a lower rate elsewhere? We will match it and offer a 10%
                booking credit.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconBox}>
                <Text style={styles.featureIcon}>🔒</Text>
              </View>
              <Text style={styles.featureTitle}>Flexible Cancellation</Text>
              <Text style={styles.featureDesc}>
                Plans change. Enjoy free cancellation up to 24 hours prior on
                most stays.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconBox}>
                <Text style={styles.featureIcon}>🛡️</Text>
              </View>
              <Text style={styles.featureTitle}>24/7 Concierge</Text>
              <Text style={styles.featureDesc}>
                Our multilingual VIP team is on call to handle special requests
                at any hour.
              </Text>
            </View>
          </View>
        </View>

        {/* ─── Bottom CTA ───────────────────────────────────────────────────── */}
        <View style={styles.ctaContainer}>
          <View style={styles.ctaCard}>
            <View style={styles.ctaBadge}>
              <Text style={styles.ctaBadgeText}>MEMBERSHIP ADVANTAGE</Text>
            </View>
            <Text style={styles.ctaTitle}>Unlock Member-Only Rates</Text>
            <Text style={styles.ctaSubtitle}>
              Sign up today and get up to 20% off your first luxury hotel booking.
            </Text>
            <Button
              title="Explore Luxury Stays Now →"
              variant="gold"
              onPress={() => handleSearch()}
              size="lg"
              style={styles.ctaBtn}
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
    paddingBottom: SPACING.XXL + 24,
  },

  /* ─── Hero Section ─────────────────────────────────────────────────────── */
  heroBanner: {
    width: '100%',
    height: 380,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.OVERLAY_HERO,
    paddingTop: Platform.OS === 'ios' ? SPACING.MD : SPACING.XL,
    paddingHorizontal: SPACING.MD,
    justifyContent: 'space-between',
    paddingBottom: SPACING.LG,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandLogoText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZE.H3,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  userPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: BORDER_RADIUS.ROUND,
    paddingVertical: 4,
    paddingLeft: 4,
    paddingRight: 10,
    gap: 6,
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.SECONDARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    color: COLORS.WHITE,
    fontWeight: '800',
    fontSize: 13,
  },
  userName: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZE.BODY_SMALL,
    fontWeight: '600',
    maxWidth: 90,
  },
  logoutBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.SM,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  logoutBtnText: {
    color: COLORS.WHITE,
    fontSize: 10,
    fontWeight: '700',
  },
  headerLoginBtn: {
    backgroundColor: COLORS.SECONDARY,
    paddingVertical: 7,
    paddingHorizontal: SPACING.MD,
    borderRadius: BORDER_RADIUS.ROUND,
  },
  headerLoginBtnText: {
    color: COLORS.WHITE,
    fontWeight: '700',
    fontSize: FONT_SIZE.BODY_SMALL,
  },
  heroContent: {
    alignItems: 'center',
    paddingBottom: SPACING.MD,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 4,
    paddingHorizontal: SPACING.SM + 2,
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

  /* ─── Search Card ──────────────────────────────────────────────────────── */
  searchCard: {
    backgroundColor: COLORS.WHITE,
    marginHorizontal: SPACING.MD,
    marginTop: -36,
    borderRadius: BORDER_RADIUS.XL,
    padding: SPACING.LG,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOWS.LG,
    zIndex: 100,
  },
  searchCardTitle: {
    fontSize: FONT_SIZE.H3,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
    letterSpacing: -0.3,
  },
  searchFieldWrapper: {
    position: 'relative',
    zIndex: 200,
  },
  clearInputBtn: {
    position: 'absolute',
    right: 14,
    top: 38,
    zIndex: 210,
  },
  suggestionsDropdown: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1.5,
    borderColor: COLORS.PRIMARY_TINT,
    marginTop: -8,
    marginBottom: SPACING.MD,
    ...SHADOWS.MD,
    overflow: 'hidden',
  },
  suggestionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
    paddingVertical: 8,
    backgroundColor: COLORS.BG_SECONDARY,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  suggestionsHeaderText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.TEXT_MUTED,
    letterSpacing: 0.8,
  },
  suggestionsCloseText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.PRIMARY,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    gap: 10,
  },
  suggestionItemLast: {
    borderBottomWidth: 0,
  },
  suggestionIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.PRIMARY_SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionTextBox: {
    flex: 1,
  },
  suggestionCityText: {
    fontSize: FONT_SIZE.BODY_MEDIUM,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
  },
  suggestionCountryText: {
    fontSize: 11,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 1,
  },
  suggestionCountBadge: {
    backgroundColor: COLORS.BG_SECONDARY,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.SM,
  },
  suggestionCountText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.TEXT_DARK,
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
    fontWeight: '700',
    color: COLORS.TEXT_DARK,
    marginBottom: SPACING.XS + 2,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: SPACING.XS,
    marginBottom: SPACING.MD,
  },
  ratingPill: {
    flex: 1,
    paddingVertical: SPACING.SM - 1,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.BG_PAGE,
  },
  ratingPillActive: {
    borderColor: COLORS.WARNING,
    backgroundColor: '#fffbeb',
  },
  ratingPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.TEXT_SECONDARY,
  },
  ratingPillTextActive: {
    color: '#b45309',
  },
  searchBtn: {
    marginTop: SPACING.XS,
  },
  clearBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.SM,
    marginTop: SPACING.XS,
  },
  clearBtnText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONT_SIZE.BODY_SMALL,
    fontWeight: '600',
  },

  /* ─── Stats Bar ────────────────────────────────────────────────────────── */
  statsBar: {
    marginHorizontal: SPACING.MD,
    marginTop: SPACING.LG,
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.LG,
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.SM,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOWS.SM,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
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
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },

  /* ─── Top Destinations ─────────────────────────────────────────────────── */
  sectionContainer: {
    marginTop: SPACING.XL,
    paddingHorizontal: SPACING.MD,
  },
  sectionHeader: {
    marginBottom: SPACING.MD,
  },
  sectionTag: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.PRIMARY,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.H2,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZE.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 18,
  },
  destinationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SM,
  },
  destinationCard: {
    width: CITY_CARD_WIDTH,
    height: 180,
    borderRadius: BORDER_RADIUS.LG,
    overflow: 'hidden',
    ...SHADOWS.MD,
  },
  destinationImage: {
    width: '100%',
    height: '100%',
  },
  destinationOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.OVERLAY_CARD,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.MD,
    justifyContent: 'space-between',
  },
  destinationBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: BORDER_RADIUS.ROUND,
  },
  destinationBadgeText: {
    color: COLORS.WHITE,
    fontSize: 10,
    fontWeight: '800',
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
