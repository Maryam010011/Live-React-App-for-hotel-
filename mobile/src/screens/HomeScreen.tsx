import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, ImageBackground, StatusBar } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';
import { BORDER_RADIUS, FONT_SIZE, SHADOWS, SPACING } from '../constants/theme';
import InputField from '../components/InputField';
import Button from '../components/Button';

export default function HomeScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  
  const [city, setCity] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState<number | null>(null);

  const handleSearch = () => {
    navigation.navigate('HotelList', {
      city: city.trim(),
      minPrice: minPrice ? parseInt(minPrice, 10) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice, 10) : undefined,
      minRating: minRating || undefined,
    });
  };

  const handleQuickSearch = (quickCity: string) => {
    navigation.navigate('HotelList', { city: quickCity });
  };

  const clearFilters = () => {
    setCity('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.PRIMARY} />
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Banner Hero */}
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80' }}
          style={styles.heroBanner}
          resizeMode="cover"
        >
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>LuxeStay</Text>
            <Text style={styles.heroSubtitle}>Find Your Dream Luxury Vacation</Text>
            
            {user ? (
              <View style={styles.profileBox}>
                <Text style={styles.welcomeText}>Hello, {user.name} 👋</Text>
                <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                  <Text style={styles.logoutBtnText}>Sign Out</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                style={styles.loginBannerBtn}
              >
                <Text style={styles.loginBannerBtnText}>Sign In / Register</Text>
              </TouchableOpacity>
            )}
          </View>
        </ImageBackground>

        {/* Search Card */}
        <View style={styles.searchCard}>
          <Text style={styles.searchCardTitle}>Search Destinations</Text>
          
          <InputField
            label="Where are you going?"
            placeholder="e.g. Miami, New York, Boston..."
            value={city}
            onChangeText={setCity}
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
            {[3, 4, 4.5, 4.8].map((rating) => (
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

          <Button title="Search Stays" onPress={handleSearch} style={styles.searchBtn} />

          {(city || minPrice || maxPrice || minRating) ? (
            <TouchableOpacity onPress={clearFilters} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>Reset Search Filters</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Quick Destinations */}
        <View style={styles.quickDestContainer}>
          <Text style={styles.sectionTitle}>Popular Cities</Text>
          <View style={styles.quickGrid}>
            {['New York', 'Miami', 'Chicago', 'Boston', 'Denver', 'San Diego'].map((popCity) => (
              <TouchableOpacity
                key={popCity}
                style={styles.quickCard}
                onPress={() => handleQuickSearch(popCity)}
              >
                <Text style={styles.quickCardEmoji}>🏨</Text>
                <Text style={styles.quickCardText}>{popCity}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG_SECONDARY,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  heroBanner: {
    width: '100%',
    height: 220,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 95, 122, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.LG,
  },
  heroTitle: {
    fontSize: FONT_SIZE.H1 + 10,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: FONT_SIZE.BODY_LARGE,
    color: COLORS.WHITE,
    opacity: 0.9,
    marginTop: 4,
    marginBottom: SPACING.MD,
    textAlign: 'center',
  },
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: SPACING.XS,
    paddingHorizontal: SPACING.MD,
    borderRadius: BORDER_RADIUS.ROUND,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  welcomeText: {
    color: COLORS.WHITE,
    fontWeight: '600',
    marginRight: SPACING.MD,
    fontSize: FONT_SIZE.BODY_MEDIUM,
  },
  logoutBtn: {
    backgroundColor: COLORS.WHITE,
    paddingVertical: 4,
    paddingHorizontal: SPACING.SM,
    borderRadius: BORDER_RADIUS.SM,
  },
  logoutBtnText: {
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
    fontSize: FONT_SIZE.BODY_SMALL,
  },
  loginBannerBtn: {
    backgroundColor: COLORS.SECONDARY,
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.LG,
    borderRadius: BORDER_RADIUS.ROUND,
    ...SHADOWS.SM,
  },
  loginBannerBtnText: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
    fontSize: FONT_SIZE.BODY_MEDIUM,
  },
  searchCard: {
    backgroundColor: COLORS.WHITE,
    margin: SPACING.MD,
    marginTop: -SPACING.LG,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.MD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOWS.MD,
  },
  searchCardTitle: {
    fontSize: FONT_SIZE.H2,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  filterLabel: {
    fontSize: FONT_SIZE.BODY_MEDIUM,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.LG,
  },
  ratingPill: {
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.SM + 2,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: BORDER_RADIUS.ROUND,
    backgroundColor: COLORS.BG_SECONDARY,
  },
  ratingPillActive: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  ratingPillText: {
    fontSize: FONT_SIZE.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: 'bold',
  },
  ratingPillTextActive: {
    color: COLORS.WHITE,
  },
  searchBtn: {
    marginTop: SPACING.SM,
  },
  clearBtn: {
    alignItems: 'center',
    marginTop: SPACING.MD,
    paddingVertical: SPACING.XS,
  },
  clearBtnText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONT_SIZE.BODY_MEDIUM,
    textDecorationLine: 'underline',
  },
  quickDestContainer: {
    paddingHorizontal: SPACING.MD,
    paddingBottom: SPACING.XL,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.H3,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickCard: {
    backgroundColor: COLORS.WHITE,
    width: '31%',
    aspectRatio: 1.1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: BORDER_RADIUS.MD,
    marginBottom: SPACING.SM,
    ...SHADOWS.SM,
  },
  quickCardEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  quickCardText: {
    fontSize: FONT_SIZE.BODY_SMALL - 1,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
});
