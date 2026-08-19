import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { searchHotels } from '../api/hotelApi';
import { Hotel } from '../types/hotel';
import { COLORS } from '../constants/colors';
import { FONT_SIZE, SPACING } from '../constants/theme';
import HotelCard from '../components/HotelCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

type Props = NativeStackScreenProps<RootStackParamList, 'HotelList'>;

export default function HotelListScreen({ route, navigation }: Props) {
  const { city, minPrice, maxPrice, minRating } = route.params;

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
      {loading ? (
        <LoadingSpinner message="Searching best stays for you..." fullScreen />
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
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          windowSize={5}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.title}>
                {city ? `Stays in ${city}` : 'All Available Stays'}
              </Text>
              <Text style={styles.subtitle}>
                Found {hotels.length} luxury propert{hotels.length === 1 ? 'y' : 'ies'}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              message="No Hotels Matching Your Criteria"
              suggestion="Try widening your search location or clearing filter ranges"
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
    backgroundColor: COLORS.BG_SECONDARY,
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
});
