import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';
import { validateName, validateEmail, validatePassword } from '../utils/validation';
import { COLORS } from '../constants/colors';
import { BORDER_RADIUS, FONT_SIZE, SHADOWS, SPACING } from '../constants/theme';
import InputField from '../components/InputField';
import Button from '../components/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ route, navigation }: Props) {
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const redirectScreen = route.params?.redirectScreen;
  const redirectParams = route.params?.redirectParams;

  const handleRegister = async () => {
    const nameVal = validateName(name, 'Full name');
    const emailVal = validateEmail(email);
    const passVal = validatePassword(password);

    setNameError(nameVal);
    setEmailError(emailVal);
    setPasswordError(passVal);

    if (nameVal || emailVal || passVal) return;

    setLoading(true);
    setGeneralError(null);

    try {
      await register(name.trim(), email.trim(), password);

      if (redirectScreen) {
        navigation.replace(redirectScreen as any, redirectParams);
      } else {
        navigation.navigate('MainTabs' as any);
      }
    } catch (err: any) {
      setGeneralError(err.message || 'Registration failed. Email might already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.BG_PAGE} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.authCard}>
            {/* Logo Badge */}
            <View style={styles.header}>
              <View style={styles.authLogoBox}>
                <Text style={styles.authLogoIcon}>✨</Text>
              </View>
              <Text style={styles.authTitle}>Create Account</Text>
              <Text style={styles.authSubtitle}>
                Join LuxeStay to unlock member rates and instant reservations
              </Text>
            </View>

            {generalError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{generalError}</Text>
              </View>
            ) : null}

            <InputField
              label="Full Name"
              placeholder="e.g. John Doe"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setNameError(null);
              }}
              error={nameError}
              autoCapitalize="words"
              autoCorrect={false}
            />

            <InputField
              label="Email Address"
              placeholder="e.g. john@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError(null);
              }}
              error={emailError}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <InputField
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError(null);
              }}
              error={passwordError}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Button
              title="Create LuxeStay Account"
              variant="dark"
              onPress={handleRegister}
              loading={loading}
              style={styles.registerBtn}
              size="lg"
            />

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.replace('Login', { redirectScreen, redirectParams })
                }
              >
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BG_PAGE,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.LG,
  },
  authCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.XL,
    padding: SPACING.LG + 4,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOWS.LG,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.LG,
  },
  authLogoBox: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.LG,
    backgroundColor: COLORS.NAVY_DARK,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.MD,
    ...SHADOWS.MD,
  },
  authLogoIcon: {
    fontSize: 28,
  },
  authTitle: {
    fontSize: FONT_SIZE.H2,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  authSubtitle: {
    fontSize: FONT_SIZE.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: SPACING.SM,
  },
  errorBanner: {
    backgroundColor: COLORS.ERROR_BG,
    borderWidth: 1,
    borderColor: COLORS.ERROR_BORDER,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD - 2,
    marginBottom: SPACING.MD,
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: FONT_SIZE.BODY_SMALL,
    fontWeight: '600',
    textAlign: 'center',
  },
  registerBtn: {
    marginTop: SPACING.SM,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.LG,
  },
  loginText: {
    fontSize: FONT_SIZE.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  loginLink: {
    fontSize: FONT_SIZE.BODY_SMALL,
    fontWeight: '800',
    color: COLORS.PRIMARY,
  },
});
