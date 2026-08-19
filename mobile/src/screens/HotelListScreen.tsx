import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, StatusBar } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { searchHotels } from '../api/hotelApi';
import { Hotel } from '../types/hotel';
import { COLORS } from '../constants/colors';
import { BORDER_RADIUS, FONT_SIZE, SHADOWS, SPACING } from '../constants/theme';
import HotelCard from '../components/HotelCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

type Props = NativeStackScreenProps<RootStackParamList, 'HotelList'>;

export default function HotelListScreen({ route, navigation }: Props) {
  const { city, minPrice, maxPrice, minRating } = route.params || {};

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHotels = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const data = await searchHotels(city || '', minPrice, maxPrice, minRating);
      setHotels(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load hotels. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHotels();
  }, [city, minPrice, maxPrice, minRating]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadHotels(true);
  };

  const renderItem = useCallback(
    ({ item }: { item: Hotel }) => (
      <HotelCard
        hotel={item}
        onPress={() => navigation.navigate('HotelDetail', { id: item.id })}
      />
    ),
    [navigation]
  );

  const keyExtractor = useCallback((item: Hotel) => String(item.id), []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.PRIMARY} />
      {/* Search Header Banner matching web app */}
      <View style={styles.searchHeaderBanner}>
        <Text style={styles.bannerTag}>LUXESTAY DIRECTORY</Text>
        <Text style={styles.bannerTitle}>
          {city ? `Stays in ${city}` : 'All Available Stays'}
        </Text>
        <Text style={styles.bannerSubtitle}>
          Handpicked 5-star properties & luxury boutique hotels
        </Text>
      </View>

      {loading ? (
        <LoadingSpinner message="Finding luxury stays for you..." fullScreen />
      ) : error ? (
        <ErrorMessage message={error} onRetry={() => loadHotels()} />
      ) : (
        <FlatList
          data={hotels}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          initialNumToRender={6}
          maxToRenderPerBatch={10}
          windowSize={5}
          ListHeaderComponent={
            <View style={styles.resultsBar}>
              <Text style={styles.resultsText}>
                Showing <Text style={styles.resultsCount}>{hotels.length}</Text>{' '}
                luxury propert{hotels.length === 1 ? 'y' : 'ies'}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              message="No Hotels Matching Your Criteria"
              suggestion="Try clearing your filters or exploring another destination"
              icon="🏖️"
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
  searchHeaderBanner: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.LG,
    paddingHorizontal: SPACING.MD,
    alignItems: 'center',
    ...SHADOWS.MD,
  },
  bannerTag: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.SECONDARY_MUTED,
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  bannerTitle: {
    fontSize: FONT_SIZE.H2,
    fontWeight: '900',
    color: COLORS.WHITE,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  bannerSubtitle: {
    fontSize: FONT_SIZE.BODY_SMALL,
    color: COLORS.PRIMARY_SURFACE,
    marginTop: 4,
    textAlign: 'center',
  },
  listContainer: {
    padding: SPACING.MD,
    paddingBottom: SPACING.XXL,
  },
  resultsBar: {
    marginBottom: SPACING.MD,
  },
  resultsText: {
    fontSize: FONT_SIZE.BODY_MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
  },
  resultsCount: {
    fontWeight: '800',
    color: COLORS.PRIMARY,
  },
});
