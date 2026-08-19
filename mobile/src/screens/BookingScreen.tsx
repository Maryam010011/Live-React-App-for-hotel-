import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';
import { fetchHotelById } from '../api/hotelApi';
import { createBooking } from '../api/bookingApi';
import { Hotel } from '../types/hotel';
import { COLORS } from '../constants/colors';
import { ROUTES } from '../constants/routes';
import { BORDER_RADIUS, FONT_SIZE, SHADOWS, SPACING } from '../constants/theme';
import { validateName, validateEmail, validatePhone } from '../utils/validation';
import { formatPrice } from '../utils/formatters';
import InputField from '../components/InputField';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';

type Props = NativeStackScreenProps<RootStackParamList, 'Booking'>;

interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  roomType: 'standard' | 'deluxe' | 'suite';
  specialRequests: string;
  paymentMethod: 'card' | 'paypal' | 'hotel';
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  cardName: string;
}

export default function BookingScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const { user } = useAuth();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getThreeDaysLaterDate = () => {
    const inThreeDays = new Date();
    inThreeDays.setDate(inThreeDays.getDate() + 4);
    return inThreeDays.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState<BookingFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    checkIn: getTomorrowDate(),
    checkOut: getThreeDaysLaterDate(),
    adults: 2,
    children: 0,
    roomType: 'standard',
    specialRequests: '',
    paymentMethod: 'card',
    cardNumber: '4532 8892 7731 2291',
    cardExpiry: '08/28',
    cardCvc: '882',
    cardName: '',
  });

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof BookingFormData, string | null>>>({});

  const loadHotel = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHotelById(id);
      if (data) {
        setHotel(data);
      } else {
        setError('Hotel listing not found.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch hotel details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHotel();
  }, [id]);

  // Autofill user details when logged in
  useEffect(() => {
    if (user) {
      const nameParts = user.name.split(' ');
      const first = nameParts[0] || '';
      const last = nameParts.slice(1).join(' ') || '';
      setFormData((prev) => ({
        ...prev,
        firstName: prev.firstName || first,
        lastName: prev.lastName || last,
        email: prev.email || user.email,
        cardName: prev.cardName || user.name,
      }));
    }
  }, [user]);

  // Calculate stay nights from date strings
  const getStayNights = (): number => {
    try {
      const inDate = new Date(formData.checkIn);
      const outDate = new Date(formData.checkOut);
      const diff = outDate.getTime() - inDate.getTime();
      const calculatedNights = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return isNaN(calculatedNights) || calculatedNights <= 0 ? 1 : calculatedNights;
    } catch {
      return 1;
    }
  };

  const nights = getStayNights();

  const roomMultipliers: Record<'standard' | 'deluxe' | 'suite', number> = {
    standard: 1.0,
    deluxe: 1.25,
    suite: 1.6,
  };

  const basePricePerNight = hotel ? Math.round(hotel.price * roomMultipliers[formData.roomType]) : 0;
  const subtotal = basePricePerNight * nights;
  const taxesAndFees = Math.round(subtotal * 0.12);
  const totalPrice = subtotal + taxesAndFees;

  const handleInputChange = (field: keyof BookingFormData, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    setFieldErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleSubmit = async () => {
    if (!user) {
      navigation.navigate('Login', { redirectScreen: 'Booking', redirectParams: { id } });
      return;
    }

    const fnErr = validateName(formData.firstName, 'First name');
    const lnErr = validateName(formData.lastName, 'Last name');
    const emErr = validateEmail(formData.email);
    const phErr = validatePhone(formData.phone);
    const cardNameErr = formData.paymentMethod === 'card'
      ? validateName(formData.cardName, 'Cardholder name')
      : null;

    const errors = { firstName: fnErr, lastName: lnErr, email: emErr, phone: phErr, cardName: cardNameErr };
    setFieldErrors(errors);

    if (fnErr || lnErr || emErr || phErr || cardNameErr) return;

    setSubmitting(true);
    setError(null);

    const generatedRef = 'LX-' + Math.floor(100000 + Math.random() * 900000);

    try {
      const result = await createBooking({
        bookingRef: generatedRef,
        hotelId: hotel!.id,
        hotelName: hotel!.name,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        adults: formData.adults,
        children: formData.children,
        roomType: formData.roomType,
        specialRequests: formData.specialRequests,
        paymentMethod: formData.paymentMethod,
        totalPrice: totalPrice,
      });

      setBookingRef(result.bookingRef || generatedRef);
      setIsConfirmed(true);
    } catch (err: any) {
      setError(err.message || 'Failed to complete booking.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Pre-loading your checkout form..." fullScreen />;
  }

  // Redirect unauthenticated visitors
  if (!user) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <View style={styles.authBox}>
          <Text style={styles.authIcon}>🔐</Text>
          <Text style={styles.authTitle}>Sign In Required</Text>
          <Text style={styles.authText}>
            You must be logged into your LuxeStay account to book hotel stays.
          </Text>
          <Button
            title="Sign In to Continue"
            onPress={() => navigation.navigate('Login', { redirectScreen: 'Booking', redirectParams: { id } })}
          />
          <TouchableOpacity
            onPress={() => navigation.navigate('Register', { redirectScreen: 'Booking', redirectParams: { id } })}
            style={styles.authRegisterLink}
          >
            <Text style={styles.authRegisterLinkText}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Render booking confirmation receipt
  if (isConfirmed && hotel) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.receiptContainer}>
          <View style={styles.receiptCard}>
            <View style={styles.successBadge}>
              <Text style={styles.successIcon}>✓</Text>
            </View>
            <Text style={styles.receiptTitle}>Booking Confirmed!</Text>
            <Text style={styles.receiptSubtitle}>
              Your stay at {hotel.name} is scheduled. A confirmation email was sent to {formData.email}.
            </Text>

            <View style={styles.refBox}>
              <Text style={styles.refLabel}>BOOKING REFERENCE</Text>
              <Text style={styles.refValue}>{bookingRef}</Text>
            </View>

            <View style={styles.receiptGrid}>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Hotel</Text>
                <Text style={styles.receiptVal}>{hotel.name}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Location</Text>
                <Text style={styles.receiptVal}>{hotel.city}, {hotel.country}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Dates</Text>
                <Text style={styles.receiptVal}>{formData.checkIn} to {formData.checkOut}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Room Type</Text>
                <Text style={[styles.receiptVal, styles.capitalize]}>{formData.roomType}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Paid Amount</Text>
                <Text style={[styles.receiptVal, styles.receiptValHighlight]}>{formatPrice(totalPrice)}</Text>
              </View>
            </View>

            <Button
              title="View My Bookings"
              onPress={() => navigation.navigate(ROUTES.MY_BOOKINGS as any)}
              style={styles.receiptBtn}
            />
            <Button
              title="Explore More Hotels"
              variant="outline"
              onPress={() => navigation.navigate('MainTabs')}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <Text style={styles.hotelHeading}>{hotel?.name}</Text>
          <Text style={styles.hotelSubheading}>📍 {hotel?.city}, {hotel?.country}</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorBoxText}>{error}</Text>
            </View>
          ) : null}

          {/* Section 1: Guest Information */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>1. Guest Information</Text>
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <InputField
                  label="First Name *"
                  placeholder="John"
                  value={formData.firstName}
                  onChangeText={(val) => handleInputChange('firstName', val)}
                  error={fieldErrors.firstName}
                />
              </View>
              <View style={styles.halfWidth}>
                <InputField
                  label="Last Name *"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChangeText={(val) => handleInputChange('lastName', val)}
                  error={fieldErrors.lastName}
                />
              </View>
            </View>

            <InputField
              label="Email Address *"
              placeholder="john@example.com"
              value={formData.email}
              onChangeText={(val) => handleInputChange('email', val)}
              error={fieldErrors.email}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <InputField
              label="Phone Number *"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChangeText={(val) => handleInputChange('phone', val)}
              error={fieldErrors.phone}
              keyboardType="phone-pad"
            />
          </View>

          {/* Section 2: Stay Dates & Room */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>2. Dates & Rooms</Text>
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <InputField
                  label="Check-In Date *"
                  placeholder="YYYY-MM-DD"
                  value={formData.checkIn}
                  onChangeText={(val) => handleInputChange('checkIn', val)}
                  error={fieldErrors.checkIn}
                />
              </View>
              <View style={styles.halfWidth}>
                <InputField
                  label="Check-Out Date *"
                  placeholder="YYYY-MM-DD"
                  value={formData.checkOut}
                  onChangeText={(val) => handleInputChange('checkOut', val)}
                  error={fieldErrors.checkOut}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Room Tier Selection</Text>
            <View style={styles.roomTierRow}>
              {(['standard', 'deluxe', 'suite'] as const).map((tier) => (
                <TouchableOpacity
                  key={tier}
                  style={[styles.roomTierPill, formData.roomType === tier && styles.roomTierPillActive]}
                  onPress={() => handleInputChange('roomType', tier)}
                >
                  <Text style={[styles.roomTierPillText, formData.roomType === tier && styles.roomTierPillTextActive]}>
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </Text>
                  <Text style={[styles.roomTierPillPrice, formData.roomType === tier && styles.roomTierPillTextActive]}>
                    {formatPrice(Math.round((hotel?.price || 0) * roomMultipliers[tier]))}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <InputField
              label="Special Requests (Optional)"
              placeholder="e.g. high floor, late check-in..."
              value={formData.specialRequests}
              onChangeText={(val) => handleInputChange('specialRequests', val)}
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Section 3: Payment */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>3. Payment Options</Text>
            <View style={styles.paymentTabs}>
              {(['card', 'paypal', 'hotel'] as const).map((method) => (
                <TouchableOpacity
                  key={method}
                  style={[styles.paymentTab, formData.paymentMethod === method && styles.paymentTabActive]}
                  onPress={() => handleInputChange('paymentMethod', method)}
                >
                  <Text style={[styles.paymentTabText, formData.paymentMethod === method && styles.paymentTabTextActive]}>
                    {method === 'card' ? 'Credit Card' : method === 'paypal' ? 'PayPal' : 'Pay at Hotel'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {formData.paymentMethod === 'card' ? (
              <View style={styles.cardPaymentForm}>
                <InputField
                  label="Cardholder Name *"
                  placeholder="e.g. John Doe"
                  value={formData.cardName}
                  onChangeText={(val) => handleInputChange('cardName', val)}
                  error={fieldErrors.cardName}
                />
                <InputField
                  label="Card Number"
                  placeholder="4532 8892 7731 2291"
                  value={formData.cardNumber}
                  onChangeText={(val) => handleInputChange('cardNumber', val)}
                />
                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <InputField
                      label="Expiry Date"
                      placeholder="MM/YY"
                      value={formData.cardExpiry}
                      onChangeText={(val) => handleInputChange('cardExpiry', val)}
                    />
                  </View>
                  <View style={styles.halfWidth}>
                    <InputField
                      label="CVC"
                      placeholder="882"
                      value={formData.cardCvc}
                      onChangeText={(val) => handleInputChange('cardCvc', val)}
                      secureTextEntry
                    />
                  </View>
                </View>
              </View>
            ) : formData.paymentMethod === 'paypal' ? (
              <View style={styles.tabBox}>
                <Text style={styles.tabBoxText}>
                  You will be directed to PayPal to authenticate your secure transaction.
                </Text>
              </View>
            ) : (
              <View style={styles.tabBox}>
                <Text style={styles.tabBoxText}>
                  Your reservation will be guaranteed by credit card. You can make payment at check-in.
                </Text>
              </View>
            )}
          </View>

          {/* Price Breakdown */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Price Breakdown</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Stay Duration</Text>
              <Text style={styles.priceVal}>{nights} Night{nights > 1 ? 's' : ''}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Room Rate / Night</Text>
              <Text style={styles.priceVal}>{formatPrice(basePricePerNight)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal</Text>
              <Text style={styles.priceVal}>{formatPrice(subtotal)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Taxes & Fees (12%)</Text>
              <Text style={styles.priceVal}>{formatPrice(taxesAndFees)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.priceTotalRow}>
              <Text style={styles.priceLabelTotal}>Total Paid</Text>
              <Text style={styles.priceValTotal}>{formatPrice(totalPrice)}</Text>
            </View>
          </View>

          <Button
            title={`Confirm Reservation — ${formatPrice(totalPrice)}`}
            onPress={handleSubmit}
            loading={submitting}
            style={styles.submitBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: COLORS.BG_SECONDARY,
  },
  scrollContainer: {
    padding: SPACING.MD,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BG_SECONDARY,
    padding: SPACING.LG,
  },
  authBox: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.XL,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOWS.MD,
  },
  authIcon: {
    fontSize: 48,
    marginBottom: SPACING.MD,
  },
  authTitle: {
    fontSize: FONT_SIZE.H2,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  authText: {
    fontSize: FONT_SIZE.BODY_MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: SPACING.LG,
    lineHeight: 20,
  },
  authRegisterLink: {
    marginTop: SPACING.MD,
    paddingVertical: SPACING.XS,
  },
  authRegisterLinkText: {
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
    fontSize: FONT_SIZE.BODY_MEDIUM,
  },
  hotelHeading: {
    fontSize: FONT_SIZE.H2,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  hotelSubheading: {
    fontSize: FONT_SIZE.BODY_MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.MD,
  },
  errorBox: {
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#feb2b2',
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
  },
  errorBoxText: {
    color: COLORS.ERROR,
    fontSize: FONT_SIZE.BODY_MEDIUM,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOWS.SM,
  },
  cardTitle: {
    fontSize: FONT_SIZE.H3,
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
  inputLabel: {
    fontSize: FONT_SIZE.BODY_MEDIUM,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  roomTierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.MD,
  },
  roomTierPill: {
    width: '31%',
    padding: SPACING.SM,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: BORDER_RADIUS.MD,
    alignItems: 'center',
    backgroundColor: COLORS.BG_SECONDARY,
  },
  roomTierPillActive: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  roomTierPillText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONT_SIZE.BODY_SMALL,
    fontWeight: 'bold',
  },
  roomTierPillTextActive: {
    color: COLORS.WHITE,
  },
  roomTierPillPrice: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONT_SIZE.BODY_SMALL,
    marginTop: 2,
  },
  paymentTabs: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: BORDER_RADIUS.MD,
    overflow: 'hidden',
    marginBottom: SPACING.MD,
  },
  paymentTab: {
    flex: 1,
    paddingVertical: SPACING.MD - 4,
    alignItems: 'center',
    backgroundColor: COLORS.BG_SECONDARY,
  },
  paymentTabActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  paymentTabText: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: 'bold',
    fontSize: FONT_SIZE.BODY_SMALL,
  },
  paymentTabTextActive: {
    color: COLORS.WHITE,
  },
  cardPaymentForm: {
    marginTop: SPACING.XS,
  },
  tabBox: {
    backgroundColor: COLORS.BG_SECONDARY,
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  tabBoxText: {
    fontSize: FONT_SIZE.BODY_MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  priceTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.SM,
  },
  priceLabel: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONT_SIZE.BODY_MEDIUM,
  },
  priceVal: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONT_SIZE.BODY_MEDIUM,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.BORDER,
    marginVertical: SPACING.SM,
  },
  priceLabelTotal: {
    fontSize: FONT_SIZE.BODY_LARGE,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  priceValTotal: {
    fontSize: FONT_SIZE.H2,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  submitBtn: {
    marginBottom: SPACING.XXL,
  },
  // Confirmation Receipt styles
  receiptContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.LG,
  },
  receiptCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.LG,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOWS.MD,
  },
  successBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DEF7EC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  successIcon: {
    fontSize: 28,
    color: COLORS.SUCCESS,
    fontWeight: 'bold',
  },
  receiptTitle: {
    fontSize: FONT_SIZE.H2,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  receiptSubtitle: {
    fontSize: FONT_SIZE.BODY_MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: SPACING.LG,
    lineHeight: 20,
  },
  refBox: {
    backgroundColor: COLORS.BG_SECONDARY,
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.XL,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
    width: '100%',
    marginBottom: SPACING.LG,
  },
  refLabel: {
    fontSize: 10,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  refValue: {
    fontSize: FONT_SIZE.H1,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginTop: 4,
  },
  receiptGrid: {
    width: '100%',
    marginBottom: SPACING.XL,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.SM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BG_SECONDARY,
  },
  receiptLabel: {
    fontSize: FONT_SIZE.BODY_MEDIUM,
    color: COLORS.TEXT_SECONDARY,
  },
  receiptVal: {
    fontSize: FONT_SIZE.BODY_MEDIUM,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  receiptValHighlight: {
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  capitalize: {
    textTransform: 'capitalize',
  },
  receiptBtn: {
    marginBottom: SPACING.SM,
    width: '100%',
  },
});
