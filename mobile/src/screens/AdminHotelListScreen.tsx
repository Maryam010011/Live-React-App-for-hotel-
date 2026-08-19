import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, Modal, SafeAreaView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { fetchHotels, deleteHotel } from '../api/hotelApi';
import { Hotel } from '../types/hotel';
import { COLORS } from '../constants/colors';
import { BORDER_RADIUS, FONT_SIZE, SHADOWS, SPACING } from '../constants/theme';
import { formatPrice } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'MainTabs'>;

export default function AdminHotelListScreen({ navigation }: any) {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Deletion modal state
  const [deletingId, setDeletingId] = useState<number | string | null>(null);
  const [deletingName, setDeletingName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const loadHotels = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchHotels();
      setHotels(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load hotel catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reload whenever screen is focused
    const unsubscribe = navigation.addListener('focus', () => {
      loadHotels();
    });
    return unsubscribe;
  }, [navigation]);

  const confirmDelete = (hotel: Hotel) => {
    setDeletingId(hotel.id);
    setDeletingName(hotel.name);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteHotel(deletingId);
      setDeletingId(null);
      Alert.alert('Success', 'Hotel deleted successfully.');
      loadHotels();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not delete hotel listing.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredHotels = hotels.filter(
    (h) =>
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderHotelRow = ({ item }: { item: Hotel }) => (
    <View style={styles.hotelRow}>
      <Image source={{ uri: item.image }} style={styles.thumb} />
      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.location}>📍 {item.city}, {item.country}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.price}>{formatPrice(item.price)}</Text>
          <Text style={styles.rating}>⭐ {item.rating}</Text>
          <Text style={styles.type}>{item.type}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('AdminHotelForm', { id: item.id })}
        >
          <Text style={styles.actionText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => confirmDelete(item)}
        >
          <Text style={styles.actionText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Banner Toolbar */}
      <View style={styles.topToolbar}>
        <View>
          <Text style={styles.toolbarTitle}>Hotel Catalog</Text>
          <Text style={styles.toolbarSub}>Manage property inventories</Text>
        </View>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => navigation.navigate('AdminHotelForm')}
        >
          <Text style={styles.createBtnText}>+ Add New</Text>
        </TouchableOpacity>
      </View>

      {/* Admin Quick Options */}
      <View style={styles.adminQuickOptions}>
        <Button
          title="View All System Bookings 📋"
          variant="outline"
          onPress={() => navigation.navigate('AdminBookings')}
          style={styles.sysBookingsBtn}
        />
      </View>

      {/* Search Filter */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by hotel, city, type..."
          placeholderTextColor={COLORS.TEXT_LIGHT}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        {searchTerm ? (
          <TouchableOpacity onPress={() => setSearchTerm('')}>
            <Text style={styles.clearSearch}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {loading ? (
        <LoadingSpinner message="Retrieving catalog..." fullScreen />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadHotels} />
      ) : (
        <FlatList
          data={filteredHotels}
          renderItem={renderHotelRow}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <EmptyState
              message="No properties listed yet"
              suggestion={searchTerm ? 'Try checking your search spelling' : 'Tap Add New to register a property'}
            />
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deletingId !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setDeletingId(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalIcon}>⚠️</Text>
            <Text style={styles.modalTitle}>Confirm Deletion</Text>
            <Text style={styles.modalText}>
              Are you sure you want to remove <Text style={{ fontWeight: 'bold' }}>"{deletingName}"</Text>? This will permanently delete it from MongoDB database.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setDeletingId(null)}
                disabled={isDeleting}
              >
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnDelete]}
                onPress={handleDelete}
                disabled={isDeleting}
              >
                <Text style={styles.modalBtnDeleteText}>
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG_SECONDARY,
  },
  topToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    padding: SPACING.MD,
  },
  toolbarTitle: {
    fontSize: FONT_SIZE.H2,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  toolbarSub: {
    fontSize: FONT_SIZE.BODY_SMALL,
    color: COLORS.SECONDARY_LIGHT,
  },
  createBtn: {
    backgroundColor: COLORS.SECONDARY,
    paddingVertical: SPACING.SM - 2,
    paddingHorizontal: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    ...SHADOWS.SM,
  },
  createBtnText: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
    fontSize: FONT_SIZE.BODY_SMALL,
  },
  adminQuickOptions: {
    paddingHorizontal: SPACING.MD,
    paddingTop: SPACING.MD,
  },
  sysBookingsBtn: {
    marginVertical: 0,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: BORDER_RADIUS.MD,
    margin: SPACING.MD,
    paddingHorizontal: SPACING.MD,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZE.BODY_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
  },
  clearSearch: {
    fontSize: FONT_SIZE.BODY_LARGE,
    color: COLORS.TEXT_LIGHT,
    paddingHorizontal: 5,
  },
  listContainer: {
    padding: SPACING.MD,
  },
  hotelRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    marginBottom: SPACING.SM,
    padding: SPACING.SM,
    alignItems: 'center',
    ...SHADOWS.SM,
  },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.SM,
    backgroundColor: COLORS.BG_SECONDARY,
  },
  details: {
    flex: 1,
    marginLeft: SPACING.SM,
    justifyContent: 'center',
  },
  name: {
    fontSize: FONT_SIZE.BODY_LARGE,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  location: {
    fontSize: FONT_SIZE.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  price: {
    fontSize: FONT_SIZE.BODY_SMALL,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginRight: SPACING.SM,
  },
  rating: {
    fontSize: FONT_SIZE.BODY_SMALL - 1,
    color: COLORS.TEXT_SECONDARY,
    marginRight: SPACING.SM,
  },
  type: {
    fontSize: 9,
    fontWeight: 'bold',
    backgroundColor: COLORS.BG_SECONDARY,
    color: COLORS.SECONDARY,
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: COLORS.BORDER,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editBtn: {
    padding: SPACING.SM,
  },
  deleteBtn: {
    padding: SPACING.SM,
  },
  actionText: {
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.LG,
  },
  modalCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.LG,
    alignItems: 'center',
    width: '100%',
    ...SHADOWS.LG,
  },
  modalIcon: {
    fontSize: 40,
    marginBottom: SPACING.SM,
  },
  modalTitle: {
    fontSize: FONT_SIZE.H3,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  modalText: {
    fontSize: FONT_SIZE.BODY_MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: SPACING.LG,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: SPACING.MD - 4,
    borderRadius: BORDER_RADIUS.MD,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.XS,
  },
  modalBtnCancel: {
    backgroundColor: COLORS.BG_SECONDARY,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  modalBtnCancelText: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: 'bold',
  },
  modalBtnDelete: {
    backgroundColor: COLORS.ERROR,
  },
  modalBtnDeleteText: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },
});
