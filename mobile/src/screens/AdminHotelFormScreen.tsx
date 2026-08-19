import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../navigation/AppNavigator';
import { fetchHotelById, createHotel, updateHotel } from '../api/hotelApi';
import { Hotel } from '../types/hotel';
import { COLORS } from '../constants/colors';
import { CLOUDINARY_CONFIG } from '../constants/api';
import { BORDER_RADIUS, FONT_SIZE, SHADOWS, SPACING } from '../constants/theme';
import InputField from '../components/InputField';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminHotelForm'>;

export default function AdminHotelFormScreen({ route, navigation }: Props) {
  const { id } = route.params || {};
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    city: '',
    country: '',
    address: '',
    description: '',
    price: '',
    rating: '4.8',
    rooms: '50',
    type: 'Resort',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    amenitiesStr: 'Free WiFi, Swimming Pool, Spa & Wellness, Fine Dining, Ocean View',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});

  useEffect(() => {
    if (isEditing && id) {
      loadHotelData(id);
    }
  }, [id, isEditing]);

  const loadHotelData = async (hotelId: string | number) => {
    setLoading(true);
    try {
      const data = await fetchHotelById(hotelId);
      if (data) {
        setFormData({
          name: data.name,
          city: data.city,
          country: data.country,
          address: data.address || '',
          description: data.description,
          price: String(data.price),
          rating: String(data.rating),
          rooms: String(data.rooms),
          type: data.type,
          image: data.image,
          amenitiesStr: data.amenities ? data.amenities.join(', ') : '',
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load property details.');
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Camera roll permission is required to upload property photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedUri = result.assets[0].uri;
      uploadToCloudinary(selectedUri);
    }
  };

  const uploadToCloudinary = async (imageUri: string) => {
    setUploadingImage(true);
    setError(null);

    try {
      const uploadData = new FormData();
      const filename = imageUri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      uploadData.append('file', {
        uri: imageUri,
        name: filename,
        type: type,
      } as any);

      uploadData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: uploadData,
        }
      );

      const json = await response.json();
      if (json.secure_url) {
        setFormData((prev) => ({ ...prev, image: json.secure_url }));
      } else {
        throw new Error(json.error?.message || 'Cloudinary upload failed.');
      }
    } catch (err: any) {
      setError('Image upload failed: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    const errors: Record<string, string | null> = {};
    if (!formData.name.trim()) errors.name = 'Hotel name is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.country.trim()) errors.country = 'Country is required';
    if (!formData.price.trim() || isNaN(Number(formData.price)))
      errors.price = 'Valid numeric price required';

    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    setSubmitting(true);
    setError(null);

    const payload: Partial<Hotel> = {
      name: formData.name.trim(),
      city: formData.city.trim(),
      country: formData.country.trim(),
      address: formData.address.trim() || `${formData.city}, ${formData.country}`,
      description: formData.description.trim(),
      price: Number(formData.price),
      rating: Number(formData.rating) || 4.5,
      rooms: Number(formData.rooms) || 10,
      type: formData.type,
      image: formData.image,
      amenities: formData.amenitiesStr
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean),
    };

    try {
      if (isEditing && id) {
        await updateHotel(id, payload);
      } else {
        await createHotel(payload);
      }
      navigation.goBack();
    } catch (err: any) {
      setError(err.message || 'Failed to save property listing.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading property specifications..." fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.NAVY_DARK} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTag}>
              {isEditing ? 'UPDATE LISTING' : 'NEW LISTING'}
            </Text>
            <Text style={styles.headerTitle}>
              {isEditing ? 'Edit Property Details' : 'Add New Property'}
            </Text>
            <Text style={styles.headerSubtitle}>
              Provide complete hotel specifications, high-res photos, and rates
            </Text>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Image Uploader Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Property Photography</Text>
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{ uri: formData.image }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
              {uploadingImage && (
                <View style={styles.uploadOverlay}>
                  <ActivityIndicator size="large" color={COLORS.WHITE} />
                  <Text style={styles.uploadingText}>
                    Uploading to Cloudinary...
                  </Text>
                </View>
              )}
            </View>

            <Button
              title="📷 Choose Photo from Library"
              variant="outline"
              onPress={handlePickImage}
              loading={uploadingImage}
              style={styles.uploadBtn}
            />

            <InputField
              label="Or Direct Image URL"
              placeholder="https://..."
              value={formData.image}
              onChangeText={(val) =>
                setFormData((prev) => ({ ...prev, image: val }))
              }
            />
          </View>

          {/* Basic Info */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Basic Information</Text>

            <InputField
              label="Property Name *"
              placeholder="e.g. The Grand Palace Resort"
              value={formData.name}
              onChangeText={(val) =>
                setFormData((prev) => ({ ...prev, name: val }))
              }
              error={fieldErrors.name}
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <InputField
                  label="City *"
                  placeholder="Dubai"
                  value={formData.city}
                  onChangeText={(val) =>
                    setFormData((prev) => ({ ...prev, city: val }))
                  }
                  error={fieldErrors.city}
                />
              </View>
              <View style={styles.halfWidth}>
                <InputField
                  label="Country *"
                  placeholder="UAE"
                  value={formData.country}
                  onChangeText={(val) =>
                    setFormData((prev) => ({ ...prev, country: val }))
                  }
                  error={fieldErrors.country}
                />
              </View>
            </View>

            <InputField
              label="Street Address"
              placeholder="123 Luxury Blvd, Marina District"
              value={formData.address}
              onChangeText={(val) =>
                setFormData((prev) => ({ ...prev, address: val }))
              }
            />

            <InputField
              label="Property Overview & Description"
              placeholder="Describe the hotel atmosphere, views, and luxury features..."
              value={formData.description}
              onChangeText={(val) =>
                setFormData((prev) => ({ ...prev, description: val }))
              }
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Rates and Specs */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Rates & Specifications</Text>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <InputField
                  label="Base Price ($/nt) *"
                  placeholder="250"
                  value={formData.price}
                  onChangeText={(val) =>
                    setFormData((prev) => ({ ...prev, price: val }))
                  }
                  error={fieldErrors.price}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfWidth}>
                <InputField
                  label="Total Rooms"
                  placeholder="50"
                  value={formData.rooms}
                  onChangeText={(val) =>
                    setFormData((prev) => ({ ...prev, rooms: val }))
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <InputField
                  label="Initial Rating"
                  placeholder="4.8"
                  value={formData.rating}
                  onChangeText={(val) =>
                    setFormData((prev) => ({ ...prev, rating: val }))
                  }
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfWidth}>
                <InputField
                  label="Category Type"
                  placeholder="Resort, Luxury, Boutique"
                  value={formData.type}
                  onChangeText={(val) =>
                    setFormData((prev) => ({ ...prev, type: val }))
                  }
                />
              </View>
            </View>

            <InputField
              label="Amenities (comma-separated)"
              placeholder="Free WiFi, Swimming Pool, Spa, Ocean View..."
              value={formData.amenitiesStr}
              onChangeText={(val) =>
                setFormData((prev) => ({ ...prev, amenitiesStr: val }))
              }
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Actions */}
          <Button
            title={isEditing ? 'Save Property Changes' : 'Publish New Property'}
            onPress={handleSubmit}
            loading={submitting}
            size="lg"
            style={styles.submitBtn}
          />

          <Button
            title="Cancel"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={styles.cancelBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG_PAGE,
  },
  scroll: {
    padding: SPACING.MD,
    paddingBottom: SPACING.XXL + 20,
  },
  header: {
    backgroundColor: COLORS.NAVY_DARK,
    padding: SPACING.LG,
    borderRadius: BORDER_RADIUS.LG,
    marginBottom: SPACING.MD,
    ...SHADOWS.MD,
  },
  headerTag: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.SECONDARY_GOLD,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZE.H2,
    fontWeight: '900',
    color: COLORS.WHITE,
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.BODY_SMALL,
    color: COLORS.TEXT_MUTED,
    marginTop: 2,
  },
  errorBox: {
    backgroundColor: COLORS.ERROR_BG,
    borderWidth: 1,
    borderColor: COLORS.ERROR_BORDER,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: FONT_SIZE.BODY_SMALL,
    fontWeight: '600',
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.LG,
    marginBottom: SPACING.MD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOWS.SM,
  },
  cardTitle: {
    fontSize: FONT_SIZE.BODY_LARGE,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  imagePreviewContainer: {
    width: '100%',
    height: 180,
    borderRadius: BORDER_RADIUS.MD,
    overflow: 'hidden',
    marginBottom: SPACING.MD,
    backgroundColor: COLORS.BG_SECONDARY,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZE.BODY_SMALL,
    fontWeight: '700',
    marginTop: SPACING.SM,
  },
  uploadBtn: {
    marginBottom: SPACING.MD,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  submitBtn: {
    marginTop: SPACING.SM,
    marginBottom: SPACING.SM,
  },
  cancelBtn: {
    marginBottom: SPACING.XL,
  },
});
