import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { fetchHotelById, createHotel, updateHotel } from '../api/hotelApi';
import { CLOUDINARY_CONFIG } from '../constants/api';
import { Hotel } from '../types/hotel';
import { validateName } from '../utils/validation';
import { COLORS } from '../constants/colors';
import { BORDER_RADIUS, FONT_SIZE, SHADOWS, SPACING } from '../constants/theme';
import InputField from '../components/InputField';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import * as ImagePicker from 'expo-image-picker';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminHotelForm'>;

type FormFields = 'name' | 'city' | 'country' | 'address' | 'description' | 'image' | 'price';

export default function AdminHotelFormScreen({ route, navigation }: Props) {
  const hotelId = route.params?.id;
  const isEditMode = Boolean(hotelId);

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Hotel>>({
    name: '',
    city: '',
    country: '',
    address: '',
    price: 150,
    rating: 4.5,
    description: '',
    image: '',
    amenities: ['WiFi', 'Air Conditioning', 'Room Service'],
    rooms: 50,
    type: 'Luxury',
  });

  const [amenityInput, setAmenityInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FormFields, string | null>>>({});

  // Load hotel details if in edit mode
  useEffect(() => {
    if (isEditMode && hotelId) {
      const loadHotelData = async () => {
        try {
          setLoading(true);
          setError(null);
          const data = await fetchHotelById(hotelId);
          if (data) {
            setFormData(data);
          } else {
            setError('Hotel listing not found.');
          }
        } catch (err: any) {
          setError(err.message || 'Failed to load hotel.');
        } finally {
          setLoading(false);
        }
      };
      loadHotelData();
    }
  }, [hotelId, isEditMode]);

  const validateField = (field: FormFields, value: any): string | null => {
    const strVal = String(value || '').trim();
    switch (field) {
      case 'name':
        return validateName(strVal, 'Hotel name');
      case 'city':
        return validateName(strVal, 'City');
      case 'country':
        return validateName(strVal, 'Country');
      case 'address':
        if (!strVal) return 'Address is required.';
        if (strVal.length < 5) return 'Address must be at least 5 characters.';
        return null;
      case 'description':
        if (!strVal) return 'Description is required.';
        if (strVal.length < 10) return 'Description must be at least 10 characters.';
        return null;
      case 'image':
        if (!strVal) return 'Image is required. Please upload or paste a link.';
        return null;
      case 'price':
        if (value === undefined || value === null || isNaN(Number(value)) || Number(value) <= 0) {
          return 'Please enter a valid positive price.';
        }
        return null;
      default:
        return null;
    }
  };

  const handleInputChange = (field: keyof Hotel, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field as FormFields]: null }));
  };

  // Image upload handling
  const handlePickImage = async () => {
    const permissions = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissions.granted) {
      Alert.alert('Permission Denied', 'Permission to access media library is required to select property images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      await uploadToCloudinary(result.assets[0].uri);
    }
  };

  const uploadToCloudinary = async (localUri: string) => {
    setUploadingImage(true);
    try {
      const uploadUrl = CLOUDINARY_CONFIG.UPLOAD_URL;
      const uploadPreset = CLOUDINARY_CONFIG.UPLOAD_PRESET;

      const data = new FormData();
      const uriParts = localUri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      data.append('file', {
        uri: localUri,
        name: `hotel_photo.${fileType}`,
        type: `image/${fileType}`,
      } as any);
      data.append('upload_preset', uploadPreset);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const resJson = await response.json();
      if (resJson.secure_url) {
        handleInputChange('image', resJson.secure_url);
        Alert.alert('Success', 'Image uploaded successfully to Cloudinary!');
      } else {
        throw new Error(resJson.error?.message || 'Failed to retrieve Cloudinary secure URL');
      }
    } catch (err: any) {
      console.error('Image upload failed:', err);
      Alert.alert('Upload Failed', err.message || 'Could not upload image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddAmenity = () => {
    const trimmed = amenityInput.trim();
    if (!trimmed) return;
    const current = formData.amenities || [];
    if (!current.includes(trimmed)) {
      handleInputChange('amenities', [...current, trimmed]);
    }
    setAmenityInput('');
  };

  const handleRemoveAmenity = (item: string) => {
    const current = formData.amenities || [];
    handleInputChange('amenities', current.filter((a) => a !== item));
  };

  const handleSave = async () => {
    // Validate all fields
    const nameErr = validateField('name', formData.name);
    const cityErr = validateField('city', formData.city);
    const countryErr = validateField('country', formData.country);
    const addressErr = validateField('address', formData.address);
    const descErr = validateField('description', formData.description);
    const imgErr = validateField('image', formData.image);
    const priceErr = validateField('price', formData.price);

    const errors = {
      name: nameErr,
      city: cityErr,
      country: countryErr,
      address: addressErr,
      description: descErr,
      image: imgErr,
      price: priceErr,
    };

    setFieldErrors(errors);

    if (nameErr || cityErr || countryErr || addressErr || descErr || imgErr || priceErr) {
      Alert.alert('Validation Error', 'Please correct the errors in the form before submitting.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (isEditMode && hotelId) {
        await updateHotel(hotelId, formData);
        Alert.alert('Success', 'Hotel listing updated successfully.');
      } else {
        await createHotel(formData);
        Alert.alert('Success', 'Hotel listing created successfully.');
      }
      navigation.goBack();
    } catch (err: any) {
      setError(err.message || 'Failed to save hotel listing details.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving property data..." fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Section 1: Property Image */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Property Image</Text>
          {formData.image ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: formData.image }} style={styles.previewImage} resizeMode="cover" />
              <TouchableOpacity
                style={styles.removeImageBadge}
                onPress={() => handleInputChange('image', '')}
              >
                <Text style={styles.removeImageText}>Remove Image ✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadBox} onPress={handlePickImage} disabled={uploadingImage}>
              {uploadingImage ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator size="small" color={COLORS.PRIMARY} />
                  <Text style={styles.uploadTextSub}>Uploading to Cloudinary CDN...</Text>
                </View>
              ) : (
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.uploadIcon}>📷</Text>
                  <Text style={styles.uploadTextPrimary}>Upload Property Image</Text>
                  <Text style={styles.uploadTextSub}>Supports PNG, JPG, WEBP formats</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          {fieldErrors.image ? <Text style={styles.fieldError}>{fieldErrors.image}</Text> : null}
        </View>

        {/* Section 2: Property Description */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Property Description</Text>
          
          <InputField
            label="Property Name *"
            placeholder="e.g. Luxe Resort"
            value={formData.name}
            onChangeText={(val) => handleInputChange('name', val)}
            error={fieldErrors.name}
          />

          <InputField
            label="City *"
            placeholder="e.g. Miami"
            value={formData.city}
            onChangeText={(val) => handleInputChange('city', val)}
            error={fieldErrors.city}
          />

          <InputField
            label="Country *"
            placeholder="e.g. USA"
            value={formData.country}
            onChangeText={(val) => handleInputChange('country', val)}
            error={fieldErrors.country}
          />

          <InputField
            label="Address *"
            placeholder="e.g. 100 Main St"
            value={formData.address}
            onChangeText={(val) => handleInputChange('address', val)}
            error={fieldErrors.address}
          />

          <InputField
            label="Description *"
            placeholder="Introduce details of the hotel rooms, locations..."
            value={formData.description}
            onChangeText={(val) => handleInputChange('description', val)}
            error={fieldErrors.description}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Section 3: Room configurations */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Rates & Specifications</Text>
          
          <InputField
            label="Price / Night ($) *"
            placeholder="150"
            value={String(formData.price || '')}
            onChangeText={(val) => handleInputChange('price', val ? Number(val) : 0)}
            error={fieldErrors.price}
            keyboardType="numeric"
          />

          <InputField
            label="Number of Rooms"
            placeholder="50"
            value={String(formData.rooms || '')}
            onChangeText={(val) => handleInputChange('rooms', val ? Number(val) : 0)}
            keyboardType="numeric"
          />

          <InputField
            label="Property Type"
            placeholder="e.g. Resort, Boutique, Business"
            value={formData.type}
            onChangeText={(val) => handleInputChange('type', val)}
          />

          <InputField
            label="Default Rating (0-5)"
            placeholder="4.5"
            value={String(formData.rating || '')}
            onChangeText={(val) => handleInputChange('rating', val ? Number(val) : 4.5)}
            keyboardType="numeric"
          />
        </View>

        {/* Section 4: Amenities */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenityAddRow}>
            <TextInput
              style={styles.amenityInput}
              placeholder="e.g. Free WiFi"
              placeholderTextColor={COLORS.TEXT_LIGHT}
              value={amenityInput}
              onChangeText={setAmenityInput}
            />
            <TouchableOpacity style={styles.addAmenityBtn} onPress={handleAddAmenity}>
              <Text style={styles.addAmenityBtnText}>Add</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.amenitiesBadgesContainer}>
            {(formData.amenities || []).map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.amenityBadge}
                onPress={() => handleRemoveAmenity(item)}
              >
                <Text style={styles.amenityBadgeText}>{item} ✕</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Button
          title={isEditMode ? 'Update Hotel Catalog' : 'Publish Property Listing'}
          onPress={handleSave}
          loading={submitting}
          style={styles.submitBtn}
        />
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
    padding: SPACING.MD,
    paddingBottom: SPACING.XXL,
  },
  errorBanner: {
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#feb2b2',
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: FONT_SIZE.BODY_MEDIUM,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.MD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    marginBottom: SPACING.MD,
    ...SHADOWS.SM,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.H3,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  imagePreviewContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
    borderRadius: BORDER_RADIUS.MD,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImageBadge: {
    position: 'absolute',
    bottom: SPACING.SM,
    right: SPACING.SM,
    backgroundColor: 'rgba(231, 76, 60, 0.9)',
    paddingVertical: 5,
    paddingHorizontal: SPACING.SM,
    borderRadius: BORDER_RADIUS.SM,
  },
  removeImageText: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
    fontSize: FONT_SIZE.BODY_SMALL,
  },
  uploadBox: {
    width: '100%',
    height: 150,
    borderWidth: 1.5,
    borderColor: COLORS.PRIMARY,
    borderStyle: 'dashed',
    borderRadius: BORDER_RADIUS.MD,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BG_SECONDARY,
  },
  loadingBox: {
    alignItems: 'center',
  },
  uploadIcon: {
    fontSize: 32,
    marginBottom: SPACING.XS,
  },
  uploadTextPrimary: {
    fontSize: FONT_SIZE.BODY_MEDIUM,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  uploadTextSub: {
    fontSize: FONT_SIZE.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  fieldError: {
    color: COLORS.ERROR,
    fontSize: FONT_SIZE.BODY_SMALL,
    marginTop: SPACING.XS,
  },
  amenityAddRow: {
    flexDirection: 'row',
  },
  amenityInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderTopLeftRadius: BORDER_RADIUS.MD,
    borderBottomLeftRadius: BORDER_RADIUS.MD,
    paddingHorizontal: SPACING.MD,
    height: 40,
    color: COLORS.TEXT_PRIMARY,
  },
  addAmenityBtn: {
    backgroundColor: COLORS.PRIMARY,
    borderTopRightRadius: BORDER_RADIUS.MD,
    borderBottomRightRadius: BORDER_RADIUS.MD,
    paddingHorizontal: SPACING.LG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addAmenityBtnText: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
    fontSize: FONT_SIZE.BODY_MEDIUM,
  },
  amenitiesBadgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.MD,
  },
  amenityBadge: {
    backgroundColor: COLORS.BG_SECONDARY,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: BORDER_RADIUS.SM,
    paddingVertical: 5,
    paddingHorizontal: SPACING.SM,
    marginRight: SPACING.SM,
    marginBottom: SPACING.SM,
  },
  amenityBadgeText: {
    fontSize: FONT_SIZE.BODY_SMALL,
    color: COLORS.TEXT_PRIMARY,
  },
  submitBtn: {
    marginVertical: SPACING.LG,
  },
});
