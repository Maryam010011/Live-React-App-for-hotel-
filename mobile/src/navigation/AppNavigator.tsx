import React from 'react';
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
export type RootStackParamList = {
  MainTabs: undefined;
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

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        /**
         * Ionicons vector icons:
         *   Active   -> filled variant in brand PRIMARY (#1a5f7a)
         *   Inactive -> outline variant in TEXT_SECONDARY (#636e72)
         */
        tabBarIcon: ({ focused }) => {
          const iconSet = TAB_ICONS[route.name];
          if (!iconSet) return null;
          const iconName: IoniconsName = focused ? iconSet.active : iconSet.inactive;
          const color = focused ? COLORS.PRIMARY : COLORS.TEXT_SECONDARY;
          return <Ionicons name={iconName} size={TAB_ICON_SIZE} color={color} />;
        },

        tabBarActiveTintColor: COLORS.PRIMARY,
        tabBarInactiveTintColor: COLORS.TEXT_SECONDARY,
        tabBarLabelStyle: styles.tabLabel,

        /**
         * Tab bar container:
         *   - Pure white background (--bg-primary from index.css)
         *   - Hairline top border in slate-200 (#e2e8f0)
         *   - Platform shadow mirrors web app --shadow-sm (index.css:28):
         *       0 2px 4px rgba(0,0,0,0.1) — flipped upward for tab bar
         *   - Height & paddingBottom grow dynamically with insets.bottom
         *     to avoid being clipped by system home indicator / gesture bar
         */
        tabBarStyle: {
          backgroundColor: COLORS.BG_PRIMARY,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: COLORS.BORDER,
          ...Platform.select({
            ios: {
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
            },
            android: {
              elevation: 12,
            },
          }),
          height: TAB_BAR_BASE_HEIGHT + insets.bottom,
          paddingTop: TAB_BAR_INNER_PADDING_TOP,
          paddingBottom: TAB_BAR_INNER_PADDING_BOTTOM + insets.bottom,
        },

        headerShown: false,
      })}
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
