import React, { useState, useEffect, useMemo } from 'react';
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
  Alert,
  Modal,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
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

const HOTEL_CATEGORIES = [
  { value: 'Luxury', label: 'Luxury', icon: 'diamond-outline', desc: '5-star premier hospitality' },
  { value: 'Resort', label: 'Resort', icon: 'sunny-outline', desc: 'Scenic holiday retreat' },
  { value: 'Business', label: 'Business', icon: 'briefcase-outline', desc: 'Executive downtown travel' },
  { value: 'Boutique', label: 'Boutique', icon: 'sparkles-outline', desc: 'Unique curated charm' },
  { value: 'Lodge', label: 'Lodge', icon: 'leaf-outline', desc: 'Nature & safari getaway' },
];

export default function AdminHotelFormScreen({ route, navigation }: Props) {
  const { id } = route.params || {};
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    city: '',
    country: '',
    address: '',
    description: '',
    price: '150',
    rating: '4.5',
    rooms: '50',
    type: 'Luxury',
    image: '',
    amenitiesStr: 'WiFi, Air Conditioning, Room Service, Swimming Pool',
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
          type: data.type || 'Luxury',
          image: data.image || '',
          amenitiesStr: data.amenities ? data.amenities.join(', ') : '',
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load property details.');
    } finally {
      setLoading(false);
    }
  };

  const fieldHandlers = useMemo(() => {
    const create = (field: string) => (val: string) => {
      setFormData((prev) => ({ ...prev, [field]: val }));
      setFieldErrors((prev) => ({ ...prev, [field]: null }));
    };
    return {
      name: create('name'),
      city: create('city'),
      country: create('country'),
      address: create('address'),
      description: create('description'),
      price: create('price'),
      rating: create('rating'),
      rooms: create('rooms'),
      type: create('type'),
      amenitiesStr: create('amenitiesStr'),
    };
  }, []);

  /**
   * Upload image to Cloudinary using Base64 Data URI
   */
  const uploadAssetToCloudinary = async (asset: ImagePicker.ImagePickerAsset) => {
    setUploadingImage(true);
    setError(null);
    setFieldErrors((prev) => ({ ...prev, image: null }));

    try {
      let payloadBody: any;
      let headers: Record<string, string> = {};

      if (asset.base64) {
        const mime = asset.mimeType || 'image/jpeg';
        const base64Data = `data:${mime};base64,${asset.base64}`;
        headers['Content-Type'] = 'application/json';
        payloadBody = JSON.stringify({
          file: base64Data,
          upload_preset: CLOUDINARY_CONFIG.UPLOAD_PRESET,
        });
      } else {
        const uploadData = new FormData();
        const filename = asset.uri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : asset.mimeType || 'image/jpeg';

        uploadData.append('file', {
          uri: asset.uri,
          name: filename,
          type: type,
        } as any);

        uploadData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
        payloadBody = uploadData;
      }

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          headers: headers,
          body: payloadBody,
        }
      );

      const json = await response.json();
      if (json.secure_url) {
        setFormData((prev) => ({ ...prev, image: json.secure_url }));
      } else {
        throw new Error(json.error?.message || 'Cloudinary upload failed.');
      }
    } catch (err: any) {
      setError('Image upload failed: ' + (err.message || 'Please check your internet connection.'));
    } finally {
      setUploadingImage(false);
    }
  };

  // 1. Choose from Photo Gallery
  const handlePickFromLibrary = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Photo library access is needed to select hotel photos.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadAssetToCloudinary(result.assets[0]);
      }
    } catch (err: any) {
      Alert.alert('Error', 'Could not open photo library: ' + err.message);
    }
  };

  // 2. Take Photo with Device Camera
  const handleTakePhotoWithCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera access is needed to capture hotel photos directly.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadAssetToCloudinary(result.assets[0]);
      }
    } catch (err: any) {
      Alert.alert('Error', 'Could not open camera: ' + err.message);
    }
  };

  // Replace photo options dialog
  const handlePromptPhotoSource = () => {
    Alert.alert(
      'Upload Hotel Photo',
      'Choose a photo source for this property listing:',
      [
        {
          text: '📷 Take Photo',
          onPress: handleTakePhotoWithCamera,
        },
        {
          text: '🖼️ Choose from Gallery',
          onPress: handlePickFromLibrary,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, image: '' }));
  };

  const handleSubmit = async () => {
    const errors: Record<string, string | null> = {};
    if (!formData.name.trim()) errors.name = 'Hotel name is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.country.trim()) errors.country = 'Country is required';
    if (!formData.address.trim()) errors.address = 'Street address is required';
    if (!formData.description.trim()) errors.description = 'Property description is required';
    if (!formData.price.trim() || isNaN(Number(formData.price)) || Number(formData.price) <= 0)
      errors.price = 'Valid positive price required';
    if (!formData.image.trim())
      errors.image = 'Please upload a property photo to Cloudinary';

    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) {
      if (errors.image && !error) {
        setError('Please upload a property photo before saving.');
      }
      return;
    }

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
      type: formData.type || 'Luxury',
      image: formData.image.trim(),
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
      setError(err.message || 'Failed to save property listing to database.');
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
              {isEditing
                ? 'Update property details, rates, and amenities in MongoDB'
                : 'Create a new hotel entry to display in the LuxeStay catalog'}
            </Text>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* ─── Property Photo Card (Cloudinary Uploader) ────────────────── */}
          <View style={[styles.card, fieldErrors.image ? styles.cardErrorBorder : null]}>
            <View style={styles.photoHeaderRow}>
              <Text style={styles.cardTitle}>Property Photography *</Text>
              {formData.image ? (
                <View style={styles.cloudBadge}>
                  <Ionicons name="cloud-done-outline" size={14} color={COLORS.PRIMARY} />
                  <Text style={styles.cloudBadgeText}>Cloudinary Hosted</Text>
                </View>
              ) : null}
            </View>

            {/* Mode A: Image is Present */}
            {formData.image ? (
              <View style={styles.previewCard}>
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

                <View style={styles.photoActionRow}>
                  <TouchableOpacity
                    style={styles.replacePhotoBtn}
                    onPress={handlePromptPhotoSource}
                    disabled={uploadingImage}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="camera-reverse-outline" size={16} color={COLORS.PRIMARY} />
                    <Text style={styles.replacePhotoBtnText}>Replace Photo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.removePhotoBtn}
                    onPress={handleRemovePhoto}
                    disabled={uploadingImage}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trash-outline" size={16} color={COLORS.ERROR} />
                    <Text style={styles.removePhotoBtnText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* Mode B: Empty State Dropzone */
              <View style={styles.emptyPhotoDropzone}>
                {uploadingImage ? (
                  <View style={styles.uploadingCenterBox}>
                    <ActivityIndicator size="large" color={COLORS.PRIMARY} />
                    <Text style={styles.uploadingDropzoneText}>
                      Uploading to Cloudinary...
                    </Text>
                  </View>
                ) : (
                  <>
                    <View style={styles.cameraIconCircle}>
                      <Ionicons name="images-outline" size={32} color={COLORS.PRIMARY} />
                    </View>
                    <Text style={styles.dropzoneTitle}>Upload Property Photo</Text>
                    <Text style={styles.dropzoneSubtitle}>
                      JPG, PNG, or WEBP (Saved directly to Cloudinary)
                    </Text>

                    <View style={styles.buttonChooserRow}>
                      <TouchableOpacity
                        style={styles.chooserBtnPrimary}
                        onPress={handlePickFromLibrary}
                        activeOpacity={0.85}
                      >
                        <Ionicons name="image-outline" size={18} color={COLORS.WHITE} />
                        <Text style={styles.chooserBtnPrimaryText}>Choose from Gallery</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.chooserBtnSecondary}
                        onPress={handleTakePhotoWithCamera}
                        activeOpacity={0.85}
                      >
                        <Ionicons name="camera-outline" size={18} color={COLORS.PRIMARY} />
                        <Text style={styles.chooserBtnSecondaryText}>Take Photo</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            )}

            {fieldErrors.image ? (
              <Text style={styles.fieldErrorText}>{fieldErrors.image}</Text>
            ) : null}
          </View>

          {/* ─── Basic Details ────────────────────────────────────────────── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Basic Information</Text>

            <InputField
              label="Property Name *"
              placeholder="e.g. Grand Luxury Hotel & Resort"
              value={formData.name}
              onChangeText={fieldHandlers.name}
              error={fieldErrors.name}
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <InputField
                  label="City *"
                  placeholder="Dubai"
                  value={formData.city}
                  onChangeText={fieldHandlers.city}
                  error={fieldErrors.city}
                />
              </View>
              <View style={styles.halfWidth}>
                <InputField
                  label="Country *"
                  placeholder="UAE"
                  value={formData.country}
                  onChangeText={fieldHandlers.country}
                  error={fieldErrors.country}
                />
              </View>
            </View>

            <InputField
              label="Street Address *"
              placeholder="123 Luxury Blvd, Marina District"
              value={formData.address}
              onChangeText={fieldHandlers.address}
              error={fieldErrors.address}
            />

            <InputField
              label="Property Overview & Description *"
              placeholder="Describe the hotel atmosphere, views, and luxury features..."
              value={formData.description}
              onChangeText={fieldHandlers.description}
              error={fieldErrors.description}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* ─── Rates and Specs ──────────────────────────────────────────── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Rates & Specifications</Text>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <InputField
                  label="Price per Night ($) *"
                  placeholder="150"
                  value={formData.price}
                  onChangeText={fieldHandlers.price}
                  error={fieldErrors.price}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfWidth}>
                <InputField
                  label="Total Rooms"
                  placeholder="50"
                  value={formData.rooms}
                  onChangeText={fieldHandlers.rooms}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <InputField
                  label="Rating (1.0 to 5.0)"
                  placeholder="4.5"
                  value={formData.rating}
                  onChangeText={fieldHandlers.rating}
                  keyboardType="numeric"
                />
              </View>

              {/* Category Dropdown Picker */}
              <View style={styles.halfWidth}>
                <Text style={styles.inputLabel}>Category Type</Text>
                <TouchableOpacity
                  style={styles.dropdownSelectorBtn}
                  onPress={() => setCategoryModalVisible(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.dropdownSelectorValue}>
                    {formData.type || 'Luxury'}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={COLORS.TEXT_SECONDARY} />
                </TouchableOpacity>
              </View>
            </View>

            <InputField
              label="Amenities (comma-separated)"
              placeholder="WiFi, Air Conditioning, Room Service, Spa, Ocean View"
              value={formData.amenitiesStr}
              onChangeText={fieldHandlers.amenitiesStr}
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Actions */}
          <Button
            title={isEditing ? 'Save Property Changes' : 'Create Hotel Listing'}
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

      {/* ─── Category Selection Modal Dropdown ─────────────────────────── */}
      <Modal
        visible={categoryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCategoryModalVisible(false)}
        >
          <View style={styles.categoryDropdownModal}>
            <View style={styles.categoryModalHeader}>
              <Text style={styles.categoryModalTitle}>Select Property Category</Text>
              <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                <Ionicons name="close" size={22} color={COLORS.TEXT_SECONDARY} />
              </TouchableOpacity>
            </View>

            {HOTEL_CATEGORIES.map((cat) => {
              const isSelected = (formData.type || 'Luxury').toLowerCase() === cat.value.toLowerCase();
              return (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryOptionRow,
                    isSelected && styles.categoryOptionRowSelected,
                  ]}
                  onPress={() => {
                    setFormData((prev) => ({ ...prev, type: cat.value }));
                    setCategoryModalVisible(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.categoryOptionIconBox}>
                    <Ionicons
                      name={cat.icon as any}
                      size={20}
                      color={isSelected ? COLORS.PRIMARY : COLORS.TEXT_SECONDARY}
                    />
                  </View>
                  <View style={styles.categoryOptionInfo}>
                    <Text
                      style={[
                        styles.categoryOptionName,
                        isSelected && styles.categoryOptionNameSelected,
                      ]}
                    >
                      {cat.label}
                    </Text>
                    <Text style={styles.categoryOptionDesc}>{cat.desc}</Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.PRIMARY} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
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
    lineHeight: 18,
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
  cardErrorBorder: {
    borderColor: COLORS.ERROR,
  },
  cardTitle: {
    fontSize: FONT_SIZE.BODY_LARGE,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
  },
  photoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  cloudBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.PRIMARY_SURFACE,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.ROUND,
  },
  cloudBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.PRIMARY,
  },
  previewCard: {
    width: '100%',
  },
  imagePreviewContainer: {
    width: '100%',
    height: 190,
    borderRadius: BORDER_RADIUS.MD,
    overflow: 'hidden',
    marginBottom: SPACING.SM,
    backgroundColor: COLORS.BG_SECONDARY,
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
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
  photoActionRow: {
    flexDirection: 'row',
    gap: SPACING.SM,
    marginTop: SPACING.XS,
  },
  replacePhotoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.SM + 2,
    borderRadius: BORDER_RADIUS.MD,
    backgroundColor: COLORS.PRIMARY_SURFACE,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY_TINT,
  },
  replacePhotoBtnText: {
    fontSize: FONT_SIZE.BODY_SMALL,
    fontWeight: '700',
    color: COLORS.PRIMARY,
  },
  removePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM + 2,
    borderRadius: BORDER_RADIUS.MD,
    backgroundColor: COLORS.ERROR_BG,
    borderWidth: 1,
    borderColor: COLORS.ERROR_BORDER,
  },
  removePhotoBtnText: {
    fontSize: FONT_SIZE.BODY_SMALL,
    fontWeight: '700',
    color: COLORS.ERROR,
  },
  emptyPhotoDropzone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.BORDER_STRONG,
    borderRadius: BORDER_RADIUS.LG,
    paddingVertical: SPACING.XL,
    paddingHorizontal: SPACING.MD,
    alignItems: 'center',
    backgroundColor: COLORS.BG_SECONDARY,
  },
  uploadingCenterBox: {
    paddingVertical: SPACING.LG,
    alignItems: 'center',
  },
  uploadingDropzoneText: {
    marginTop: SPACING.MD,
    fontSize: FONT_SIZE.BODY_SMALL,
    fontWeight: '700',
    color: COLORS.PRIMARY,
  },
  cameraIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.PRIMARY_SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.SM,
  },
  dropzoneTitle: {
    fontSize: FONT_SIZE.BODY_LARGE,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  dropzoneSubtitle: {
    fontSize: FONT_SIZE.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.LG,
    textAlign: 'center',
  },
  buttonChooserRow: {
    flexDirection: 'column',
    width: '100%',
    gap: SPACING.SM,
  },
  chooserBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.SM + 4,
    borderRadius: BORDER_RADIUS.MD,
    width: '100%',
  },
  chooserBtnPrimaryText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZE.BODY_MEDIUM,
    fontWeight: '700',
  },
  chooserBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.WHITE,
    borderWidth: 1.5,
    borderColor: COLORS.PRIMARY,
    paddingVertical: SPACING.SM + 4,
    borderRadius: BORDER_RADIUS.MD,
    width: '100%',
  },
  chooserBtnSecondaryText: {
    color: COLORS.PRIMARY,
    fontSize: FONT_SIZE.BODY_MEDIUM,
    fontWeight: '700',
  },
  fieldErrorText: {
    color: COLORS.ERROR,
    fontSize: FONT_SIZE.CAPTION,
    fontWeight: '600',
    marginTop: SPACING.SM,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  inputLabel: {
    fontSize: FONT_SIZE.BODY_SMALL,
    fontWeight: '600',
    color: COLORS.TEXT_DARK,
    marginBottom: SPACING.XS + 2,
    letterSpacing: 0.2,
  },
  dropdownSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    borderRadius: BORDER_RADIUS.MD,
    backgroundColor: COLORS.BG_PAGE,
    paddingHorizontal: SPACING.MD,
    height: 48,
    marginBottom: SPACING.MD,
  },
  dropdownSelectorValue: {
    fontSize: FONT_SIZE.BODY_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: SPACING.SM,
    marginBottom: SPACING.SM,
  },
  cancelBtn: {
    marginBottom: SPACING.XL,
  },

  /* Category Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.LG,
  },
  categoryDropdownModal: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.XL,
    padding: SPACING.LG,
    width: '100%',
    maxWidth: 380,
    ...SHADOWS.LG,
  },
  categoryModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.MD,
    paddingBottom: SPACING.SM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  categoryModalTitle: {
    fontSize: FONT_SIZE.BODY_LARGE,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
  },
  categoryOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.MD - 2,
    paddingHorizontal: SPACING.SM,
    borderRadius: BORDER_RADIUS.MD,
    marginBottom: 4,
    gap: 12,
  },
  categoryOptionRowSelected: {
    backgroundColor: COLORS.PRIMARY_SURFACE,
  },
  categoryOptionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.BG_PAGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryOptionInfo: {
    flex: 1,
  },
  categoryOptionName: {
    fontSize: FONT_SIZE.BODY_MEDIUM,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
  },
  categoryOptionNameSelected: {
    color: COLORS.PRIMARY,
  },
  categoryOptionDesc: {
    fontSize: 11,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 1,
  },
});
