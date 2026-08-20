import React, { useMemo, useCallback } from 'react';
import { NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/routes';
import { COLORS } from '../constants/colors';
import { Platform, StyleSheet } from 'react-native';
import { FONT_SIZE } from '../constants/theme';

// --- Screens ------------------------------------------------------------------
import HomeScreen from '../screens/HomeScreen';
import HotelListScreen from '../screens/HotelListScreen';
import HotelDetailScreen from '../screens/HotelDetailScreen';
import BookingScreen from '../screens/BookingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import AdminHotelListScreen from '../screens/AdminHotelListScreen';
import AdminHotelFormScreen from '../screens/AdminHotelFormScreen';
import AdminBookingsScreen from '../screens/AdminBookingsScreen';

// --- Navigation Type Definitions ----------------------------------------------
export type MainTabParamList = {
  [ROUTES.HOME]: undefined;
  [ROUTES.MY_BOOKINGS]: undefined;
  [ROUTES.ADMIN_HOTELS]: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  HotelList: { city?: string; minPrice?: number; maxPrice?: number; minRating?: number } | undefined;
  HotelDetail: { id: number | string };
  Booking: { id: number | string };
  Login: { redirectScreen?: string; redirectParams?: any } | undefined;
  Register: { redirectScreen?: string; redirectParams?: any } | undefined;
  AdminHotelForm: { id?: number | string } | undefined;
  AdminBookings: undefined;
};

// --- Ionicons name type -------------------------------------------------------
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

// --- Tab icon configuration ---------------------------------------------------
interface TabIconConfig {
  active: IoniconsName;
  inactive: IoniconsName;
}

const TAB_ICONS: Record<string, TabIconConfig> = {
  /** Explore: compass (search/discovery metaphor) */
  [ROUTES.HOME]: {
    active: 'compass',
    inactive: 'compass-outline',
  },
  /** My Bookings: calendar (reservation management) */
  [ROUTES.MY_BOOKINGS]: {
    active: 'calendar',
    inactive: 'calendar-outline',
  },
  /** Admin Panel: shield (authority/management metaphor) */
  [ROUTES.ADMIN_HOTELS]: {
    active: 'shield',
    inactive: 'shield-outline',
  },
};

const TAB_ICON_SIZE = 24;
const TAB_BAR_INNER_PADDING_TOP = 8;
const TAB_BAR_INNER_PADDING_BOTTOM = 8;
const TAB_BAR_BASE_HEIGHT = 60;

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// --- Main Tab Navigator -------------------------------------------------------
function MainTabNavigator() {
  const { isAdmin } = useAuth();

  /**
   * useSafeAreaInsets() returns device-specific safe-area insets:
   *   - iOS (Face ID / home indicator): bottom ~= 34
   *   - iOS (home button):              bottom ~= 0
   *   - Android gesture nav:            bottom varies (16-28 on stock Android)
   *   - Android 3-button nav:           bottom ~= 0
   *
   * We dynamically add insets.bottom to both the bar height and paddingBottom
   * so the tab bar content always sits above the system home indicator or
   * gesture bar on EVERY device, with no hardcoded platform hacks.
   */
  const insets = useSafeAreaInsets();

  const tabBarStyle = useMemo(() => ({
    backgroundColor: COLORS.WHITE,
    borderTopColor: COLORS.BORDER,
    borderTopWidth: StyleSheet.hairlineWidth,
    ...(Platform.OS === 'android'
      ? { elevation: 8 }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }),
    height: TAB_BAR_BASE_HEIGHT + insets.bottom,
    paddingTop: TAB_BAR_INNER_PADDING_TOP,
    paddingBottom: TAB_BAR_INNER_PADDING_BOTTOM + insets.bottom,
  }), [insets.bottom]);

  const screenOptions = useCallback(({ route }: { route: any }) => ({
    tabBarIcon: ({ focused }: { focused: boolean }) => {
      const iconSet = TAB_ICONS[route.name];
      if (!iconSet) return null;
      const iconName: IoniconsName = focused ? iconSet.active : iconSet.inactive;
      const color = focused ? COLORS.PRIMARY : COLORS.TEXT_SECONDARY;
      return <Ionicons name={iconName} size={TAB_ICON_SIZE} color={color} />;
    },
    tabBarActiveTintColor: COLORS.PRIMARY,
    tabBarInactiveTintColor: COLORS.TEXT_SECONDARY,
    tabBarLabelStyle: styles.tabLabel,
    tabBarStyle,
    headerShown: false,
  }), [tabBarStyle]);

  return (
    <Tab.Navigator
      screenOptions={screenOptions}
    >
      {/* Explore tab */}
      <Tab.Screen
        name={ROUTES.HOME}
        component={HomeScreen}
        options={{ tabBarLabel: 'Explore' }}
      />

      {/* My Bookings tab */}
      <Tab.Screen
        name={ROUTES.MY_BOOKINGS}
        component={MyBookingsScreen}
        options={{ tabBarLabel: 'My Bookings' }}
      />

      {/* Admin Panel tab — conditionally rendered for admin users only */}
      {isAdmin && (
        <Tab.Screen
          name={ROUTES.ADMIN_HOTELS}
          component={AdminHotelListScreen}
          options={{ tabBarLabel: 'Admin Panel' }}
        />
      )}
    </Tab.Navigator>
  );
}

// --- Root Stack Navigator ----------------------------------------------------
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          /**
           * Stack header:
           * Background matches web app Header.css gradient start color (#1a5f7a).
           * Full gradient (linear-gradient 135deg #1a5f7a -> #0f3d52) is not
           * natively supported by React Navigation headers; the solid PRIMARY
           * (#1a5f7a) faithfully replicates the visual tone.
           */
          headerStyle: {
            backgroundColor: COLORS.PRIMARY,
          },
          headerTintColor: COLORS.WHITE,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: FONT_SIZE.BODY_LARGE,
          },
          contentStyle: {
            backgroundColor: COLORS.BG_SECONDARY,
          },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HotelList"
          component={HotelListScreen}
          options={{ title: 'Hotel Catalog' }}
        />
        <Stack.Screen
          name="HotelDetail"
          component={HotelDetailScreen}
          options={{ title: 'Hotel Details' }}
        />
        <Stack.Screen
          name="Booking"
          component={BookingScreen}
          options={{ title: 'Complete Reservation' }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'Sign In' }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ title: 'Create Account' }}
        />
        <Stack.Screen
          name="AdminHotelForm"
          component={AdminHotelFormScreen}
          options={({ route }) => ({
            title: route.params?.id ? 'Edit Hotel Listing' : 'Add New Hotel',
          })}
        />
        <Stack.Screen
          name="AdminBookings"
          component={AdminBookingsScreen}
          options={{ title: 'System Reservations' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// --- Styles ------------------------------------------------------------------
const styles = StyleSheet.create({
  tabLabel: {
    fontWeight: '600',
    fontSize: 11,
    letterSpacing: 0.2,
  },
});
