import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
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
    cardNumber: '4532 •••• •••• 8892',
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

  const handleInputChange = useCallback((field: keyof BookingFormData, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    setFieldErrors((prev) => ({ ...prev, [field]: null }));
  }, []);

  const fieldHandlers = useMemo(() => {
    const create = (field: keyof BookingFormData) => (val: any) => {
      setFormData((prev) => ({ ...prev, [field]: val }));
      setFieldErrors((prev) => ({ ...prev, [field]: null }));
    };
    return {
      firstName: create('firstName'),
      lastName: create('lastName'),
      email: create('email'),
      phone: create('phone'),
      checkIn: create('checkIn'),
      checkOut: create('checkOut'),
      specialRequests: create('specialRequests'),
      cardName: create('cardName'),
      cardNumber: create('cardNumber'),
      cardExpiry: create('cardExpiry'),
      cardCvc: create('cardCvc'),
    };
  }, []);

  const handleSubmit = async () => {
    if (!user) {
      navigation.navigate('Login', { redirectScreen: 'Booking', redirectParams: { id } });
      return;
    }

    const fnErr = validateName(formData.firstName, 'First name');
    const lnErr = validateName(formData.lastName, 'Last name');
    const emErr = validateEmail(formData.email);
    const phErr = validatePhone(formData.phone);
    const cardNameErr =
      formData.paymentMethod === 'card'
        ? validateName(formData.cardName, 'Cardholder name')
        : null;

    const errors = {
      firstName: fnErr,
      lastName: lnErr,
      email: emErr,
      phone: phErr,
      cardName: cardNameErr,
    };
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
    return <LoadingSpinner message="Loading checkout details..." fullScreen />;
  }

  // If unauthenticated
  if (!user) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <View style={styles.authBox}>
          <Text style={styles.authIcon}>🔐</Text>
          <Text style={styles.authTitle}>Sign In Required</Text>
          <Text style={styles.authText}>
            Please sign in to your LuxeStay account to complete your hotel reservation.
          </Text>
          <Button
            title="Sign In to Continue"
            onPress={() =>
              navigation.navigate('Login', {
                redirectScreen: 'Booking',
                redirectParams: { id },
              })
            }
            size="lg"
          />
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('Register', {
                redirectScreen: 'Booking',
                redirectParams: { id },
              })
            }
            style={styles.authRegisterLink}
          >
            <Text style={styles.authRegisterLinkText}>
              Don't have an account? Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Render Confirmation Receipt View
  if (isConfirmed && hotel) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.PRIMARY} />
        <ScrollView
          contentContainerStyle={styles.receiptContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.receiptCard}>
            <View style={styles.successBadge}>
              <Text style={styles.successIcon}>✓</Text>
            </View>
            <Text style={styles.receiptTag}>RESERVATION CONFIRMED</Text>
            <Text style={styles.receiptTitle}>Your Booking is Complete!</Text>
            <Text style={styles.receiptSubtitle}>
              We have sent a confirmation email to{' '}
              <Text style={{ fontWeight: '700', color: COLORS.TEXT_PRIMARY }}>
                {formData.email}
              </Text>
              .
            </Text>

            <View style={styles.refBox}>
              <Text style={styles.refLabel}>BOOKING REFERENCE NUMBER</Text>
              <Text style={styles.refValue}>{bookingRef}</Text>
            </View>

            <View style={styles.receiptGrid}>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Hotel</Text>
                <Text style={styles.receiptVal}>{hotel.name}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Location</Text>
                <Text style={styles.receiptVal}>
                  {hotel.city}, {hotel.country}
                </Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Guest</Text>
                <Text style={styles.receiptVal}>
                  {formData.firstName} {formData.lastName}
                </Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Stay Dates</Text>
                <Text style={styles.receiptVal}>
                  {formData.checkIn} to {formData.checkOut} ({nights}{' '}
                  {nights === 1 ? 'night' : 'nights'})
                </Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Room Tier</Text>
                <Text style={[styles.receiptVal, styles.capitalize]}>
                  {formData.roomType} Room
                </Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Total Paid</Text>
                <Text style={[styles.receiptVal, styles.receiptValHighlight]}>
                  {formatPrice(totalPrice)} USD
                </Text>
              </View>
            </View>

            <Button
              title="View My Bookings"
              onPress={() => navigation.navigate('MainTabs', { screen: ROUTES.MY_BOOKINGS })}
              style={styles.receiptBtn}
              size="lg"
            />
            <Button
              title="Explore More Hotels"
              variant="outline"
              onPress={() => navigation.navigate('MainTabs' as any)}
              size="md"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.PRIMARY} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.pageHeader}>
            <Text style={styles.hotelHeading}>{hotel?.name}</Text>
            <Text style={styles.hotelSubheading}>
              📍 {hotel?.city}, {hotel?.country}
            </Text>
            <Text style={styles.guaranteeText}>
              🔒 Instant confirmation • 256-bit SSL encrypted • Price guarantee
            </Text>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorBoxText}>{error}</Text>
            </View>
          ) : null}

          {/* ─── Step 1: Guest Information ────────────────────────────────── */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>1</Text>
              </View>
              <View>
                <Text style={styles.cardTitle}>Guest Information</Text>
                <Text style={styles.cardSubtitle}>
                  Primary guest details for check-in
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <InputField
                  label="First Name *"
                  placeholder="John"
                  value={formData.firstName}
                  onChangeText={fieldHandlers.firstName}
                  error={fieldErrors.firstName}
                />
              </View>
              <View style={styles.halfWidth}>
                <InputField
                  label="Last Name *"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChangeText={fieldHandlers.lastName}
                  error={fieldErrors.lastName}
                />
              </View>
            </View>

            <InputField
              label="Email Address *"
              placeholder="john@example.com"
              value={formData.email}
              onChangeText={fieldHandlers.email}
              error={fieldErrors.email}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <InputField
              label="Phone Number *"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChangeText={fieldHandlers.phone}
              error={fieldErrors.phone}
              keyboardType="phone-pad"
            />
          </View>

          {/* ─── Step 2: Stay Dates & Room Tier ───────────────────────────── */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>2</Text>
              </View>
              <View>
                <Text style={styles.cardTitle}>Stay & Room Tier</Text>
                <Text style={styles.cardSubtitle}>
                  Select dates and room specification
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <InputField
                  label="Check-In Date *"
                  placeholder="YYYY-MM-DD"
                  value={formData.checkIn}
                  onChangeText={fieldHandlers.checkIn}
                  error={fieldErrors.checkIn}
                />
              </View>
              <View style={styles.halfWidth}>
                <InputField
                  label="Check-Out Date *"
                  placeholder="YYYY-MM-DD"
                  value={formData.checkOut}
                  onChangeText={fieldHandlers.checkOut}
                  error={fieldErrors.checkOut}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Room Category Tier</Text>
            <View style={styles.roomTierRow}>
              {(['standard', 'deluxe', 'suite'] as const).map((tier) => (
                <TouchableOpacity
                  key={tier}
                  style={[
                    styles.roomTierPill,
                    formData.roomType === tier && styles.roomTierPillActive,
                  ]}
                  onPress={() => handleInputChange('roomType', tier)}
                  activeOpacity={0.88}
                >
                  <Text
                    style={[
                      styles.roomTierPillText,
                      formData.roomType === tier && styles.roomTierPillTextActive,
                    ]}
                  >
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </Text>
                  <Text
                    style={[
                      styles.roomTierPillPrice,
                      formData.roomType === tier && styles.roomTierPillTextActive,
                    ]}
                  >
                    {formatPrice(
                      Math.round((hotel?.price || 0) * roomMultipliers[tier])
                    )}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <InputField
              label="Special Requests (Optional)"
              placeholder="High floor, quiet room, late check-in..."
              value={formData.specialRequests}
              onChangeText={fieldHandlers.specialRequests}
              multiline
              numberOfLines={2}
            />
          </View>

          {/* ─── Step 3: Payment Options ──────────────────────────────────── */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>3</Text>
              </View>
              <View>
                <Text style={styles.cardTitle}>Payment Information</Text>
                <Text style={styles.cardSubtitle}>Choose your payment method</Text>
              </View>
            </View>

            <View style={styles.paymentTabs}>
              {(['card', 'paypal', 'hotel'] as const).map((method) => (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.paymentTab,
                    formData.paymentMethod === method && styles.paymentTabActive,
                  ]}
                  onPress={() => handleInputChange('paymentMethod', method)}
                >
                  <Text
                    style={[
                      styles.paymentTabText,
                      formData.paymentMethod === method &&
                        styles.paymentTabTextActive,
                    ]}
                  >
                    {method === 'card'
                      ? 'Credit Card'
                      : method === 'paypal'
                      ? 'PayPal'
                      : 'Pay at Hotel'}
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
                  onChangeText={fieldHandlers.cardName}
                  error={fieldErrors.cardName}
                />
                <InputField
                  label="Card Number"
                  placeholder="4532 •••• •••• 8892"
                  value={formData.cardNumber}
                  onChangeText={fieldHandlers.cardNumber}
                />
                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <InputField
                      label="Expiry Date"
                      placeholder="MM/YY"
                      value={formData.cardExpiry}
                      onChangeText={fieldHandlers.cardExpiry}
                    />
                  </View>
                  <View style={styles.halfWidth}>
                    <InputField
                      label="CVC Code"
                      placeholder="882"
                      value={formData.cardCvc}
                      onChangeText={fieldHandlers.cardCvc}
                      secureTextEntry
                    />
                  </View>
                </View>
              </View>
            ) : formData.paymentMethod === 'paypal' ? (
              <View style={styles.tabBox}>
                <Text style={styles.tabBoxText}>
                  You will be directed to PayPal to authenticate your transaction
                  securely after confirming.
                </Text>
              </View>
            ) : (
              <View style={styles.tabBox}>
                <Text style={styles.tabBoxText}>
                  Your reservation will be guaranteed. No charge processed until
                  check-in at property.
                </Text>
              </View>
            )}
          </View>

          {/* ─── Price Breakdown Summary ──────────────────────────────────── */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Reservation Summary</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Stay Duration</Text>
              <Text style={styles.priceVal}>
                {nights} {nights === 1 ? 'Night' : 'Nights'}
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Rate per Night</Text>
              <Text style={styles.priceVal}>{formatPrice(basePricePerNight)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Room Subtotal</Text>
              <Text style={styles.priceVal}>{formatPrice(subtotal)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Taxes & Fees (12%)</Text>
              <Text style={styles.priceVal}>{formatPrice(taxesAndFees)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.priceTotalRow}>
              <Text style={styles.priceLabelTotal}>Total Amount</Text>
              <Text style={styles.priceValTotal}>{formatPrice(totalPrice)}</Text>
            </View>
          </View>

          <Button
            title={`Confirm & Pay ${formatPrice(totalPrice)}`}
            onPress={handleSubmit}
            loading={submitting}
            style={styles.submitBtn}
            size="lg"
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
    backgroundColor: COLORS.BG_PAGE,
  },
  scrollContainer: {
    padding: SPACING.MD,
    paddingBottom: SPACING.XXL + 20,
  },
  pageHeader: {
    marginBottom: SPACING.MD,
  },
  hotelHeading: {
    fontSize: FONT_SIZE.H2,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: -0.3,
  },
  hotelSubheading: {
    fontSize: FONT_SIZE.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
    fontWeight: '500',
  },
  guaranteeText: {
    fontSize: 11,
    color: COLORS.PRIMARY,
    fontWeight: '600',
    marginTop: 6,
  },
  errorBox: {
    backgroundColor: COLORS.ERROR_BG,
    borderWidth: 1,
    borderColor: COLORS.ERROR_BORDER,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
  },
  errorBoxText: {
    color: COLORS.ERROR,
    fontSize: FONT_SIZE.BODY_SMALL,
    fontWeight: '600',
    textAlign: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BG_PAGE,
    padding: SPACING.LG,
  },
  authBox: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.XL,
    padding: SPACING.XL,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOWS.LG,
  },
  authIcon: {
    fontSize: 48,
    marginBottom: SPACING.MD,
  },
  authTitle: {
    fontSize: FONT_SIZE.H2,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  authText: {
    fontSize: FONT_SIZE.BODY_SMALL,
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
    fontWeight: '800',
    fontSize: FONT_SIZE.BODY_SMALL,
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
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.MD,
    marginBottom: SPACING.MD,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '900',
  },
  cardTitle: {
    fontSize: FONT_SIZE.BODY_LARGE,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
  },
  cardSubtitle: {
    fontSize: 11,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 1,
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
    marginBottom: SPACING.SM,
  },
  roomTierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.MD,
  },
  roomTierPill: {
    width: '31%',
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.XS,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    borderRadius: BORDER_RADIUS.MD,
    alignItems: 'center',
    backgroundColor: COLORS.BG_PAGE,
  },
  roomTierPillActive: {
    backgroundColor: COLORS.PRIMARY_SURFACE,
    borderColor: COLORS.PRIMARY,
  },
  roomTierPillText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONT_SIZE.BODY_SMALL - 1,
    fontWeight: '700',
  },
  roomTierPillTextActive: {
    color: COLORS.PRIMARY,
    fontWeight: '800',
  },
  roomTierPillPrice: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  paymentTabs: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    borderRadius: BORDER_RADIUS.MD,
    overflow: 'hidden',
    marginBottom: SPACING.MD,
  },
  paymentTab: {
    flex: 1,
    paddingVertical: SPACING.MD - 4,
    alignItems: 'center',
    backgroundColor: COLORS.BG_PAGE,
  },
  paymentTabActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  paymentTabText: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '700',
    fontSize: 11,
  },
  paymentTabTextActive: {
    color: COLORS.WHITE,
  },
  cardPaymentForm: {
    marginTop: SPACING.XS,
  },
  tabBox: {
    backgroundColor: COLORS.BG_PAGE,
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  tabBoxText: {
    fontSize: FONT_SIZE.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 18,
  },
  summaryCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.LG,
    marginBottom: SPACING.LG,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOWS.MD,
  },
  summaryTitle: {
    fontSize: FONT_SIZE.BODY_LARGE,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONT_SIZE.BODY_SMALL,
  },
  priceVal: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONT_SIZE.BODY_SMALL,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.BORDER,
    marginVertical: SPACING.SM,
  },
  priceTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.XS,
  },
  priceLabelTotal: {
    fontSize: FONT_SIZE.BODY_LARGE,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
  },
  priceValTotal: {
    fontSize: FONT_SIZE.H2,
    fontWeight: '900',
    color: COLORS.PRIMARY,
  },
  submitBtn: {
    marginBottom: SPACING.XXL,
  },

  /* ─── Receipt View Styles ──────────────────────────────────────────────── */
  receiptContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.LG,
  },
  receiptCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.XL,
    padding: SPACING.LG + 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOWS.LG,
  },
  successBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.SUCCESS_BG,
    borderWidth: 2,
    borderColor: COLORS.SUCCESS_BORDER,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  successIcon: {
    fontSize: 32,
    color: COLORS.SUCCESS,
    fontWeight: '900',
  },
  receiptTag: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.SUCCESS,
    letterSpacing: 1,
    marginBottom: 4,
  },
  receiptTitle: {
    fontSize: FONT_SIZE.H2,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  receiptSubtitle: {
    fontSize: FONT_SIZE.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: SPACING.LG,
    lineHeight: 18,
  },
  refBox: {
    backgroundColor: COLORS.PRIMARY_SURFACE,
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY_TINT,
    alignItems: 'center',
    width: '100%',
    marginBottom: SPACING.LG,
  },
  refLabel: {
    fontSize: 9,
    color: COLORS.PRIMARY,
    fontWeight: '800',
    letterSpacing: 1,
  },
  refValue: {
    fontSize: FONT_SIZE.H2,
    fontWeight: '900',
    color: COLORS.PRIMARY,
    marginTop: 3,
    letterSpacing: 0.5,
  },
  receiptGrid: {
    width: '100%',
    marginBottom: SPACING.LG,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.SM + 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BG_SECONDARY,
  },
  receiptLabel: {
    fontSize: FONT_SIZE.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  receiptVal: {
    fontSize: FONT_SIZE.BODY_SMALL,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    maxWidth: '60%',
    textAlign: 'right',
  },
  receiptValHighlight: {
    color: COLORS.PRIMARY,
    fontWeight: '900',
    fontSize: FONT_SIZE.BODY_LARGE,
  },
  capitalize: {
    textTransform: 'capitalize',
  },
  receiptBtn: {
    marginBottom: SPACING.SM,
    width: '100%',
  },
});
