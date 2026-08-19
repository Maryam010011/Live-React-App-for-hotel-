import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/routes';
import { COLORS } from '../constants/colors';
import { Text, View, StyleSheet } from 'react-native';

// Import Screens
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

export type RootStackParamList = {
  MainTabs: undefined;
  HotelList: { city?: string; minPrice?: number; maxPrice?: number; minRating?: number };
  HotelDetail: { id: number | string };
  Booking: { id: number | string };
  Login: { redirectScreen?: string; redirectParams?: any } | undefined;
  Register: { redirectScreen?: string; redirectParams?: any } | undefined;
  AdminHotelForm: { id?: number | string };
  AdminBookings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Custom Tab icons using emoji/characters for clean native look without extra packages weight
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.iconText, focused && styles.iconFocused]}>{name}</Text>
    </View>
  );
};

function MainTabNavigator() {
  const { user, isAdmin } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.PRIMARY,
        tabBarInactiveTintColor: COLORS.TEXT_SECONDARY,
        tabBarStyle: {
          backgroundColor: COLORS.WHITE,
          borderTopWidth: 1,
          borderTopColor: COLORS.BORDER,
          paddingBottom: 5,
          height: 60,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name={ROUTES.HOME}
        component={HomeScreen}
        options={{
          tabBarLabel: 'Explore',
          tabBarIcon: ({ focused }) => <TabIcon name="🔍" focused={focused} />,
        }}
      />
      <Tab.Screen
        name={ROUTES.MY_BOOKINGS}
        component={MyBookingsScreen}
        options={{
          tabBarLabel: 'My Bookings',
          tabBarIcon: ({ focused }) => <TabIcon name="🏨" focused={focused} />,
        }}
      />
      {isAdmin && (
        <Tab.Screen
          name={ROUTES.ADMIN_HOTELS}
          component={AdminHotelListScreen}
          options={{
            tabBarLabel: 'Admin Panel',
            tabBarIcon: ({ focused }) => <TabIcon name="⚙️" focused={focused} />,
          }}
        />
      )}
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.PRIMARY,
          },
          headerTintColor: COLORS.WHITE,
          headerTitleStyle: {
            fontWeight: 'bold',
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
          options={{ title: 'Sign In', presentation: 'card' }}
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

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
    opacity: 0.6,
  },
  iconFocused: {
    opacity: 1,
  },
});
