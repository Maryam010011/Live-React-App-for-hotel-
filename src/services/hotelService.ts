import { Hotel } from '../types/hotel';

/**
 * Hotel Service - API Integration Layer
 * 
 * This service handles all API calls related to hotels.
 * We're using a mock API (RapidAPI's Travel Advisor or similar),
 * but the structure allows easy switching to a real backend.
 * 
 * Key responsibilities:
 * 1. Fetch hotel data from external API
 * 2. Handle errors and network issues
 * 3. Transform API responses into our application's data format
 */

// In production, these would be used for real API calls:
// const API_BASE_URL = 'https://booking-com.p.rapidapi.com/v1';
// const API_KEY = process.env.VITE_API_KEY;

// Mock data for demonstration (fallback when API is unavailable)
const MOCK_HOTELS: Hotel[] = [
  {
    id: 1,
    name: "Grand Luxury Hotel",
    city: "New York",
    country: "USA",
    address: "123 Park Avenue, Manhattan",
    price: 250,
    rating: 4.7,
    description: "Experience luxury in the heart of Manhattan. Our hotel offers world-class amenities, stunning city views, and exceptional service. Perfect for business travelers and tourists alike.",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    amenities: ["WiFi", "Pool", "Gym", "Restaurant", "Bar", "Spa", "Room Service"],
    rooms: 150,
    type: "Luxury"
  },
  {
    id: 2,
    name: "Seaside Resort & Spa",
    city: "Miami",
    country: "USA",
    address: "456 Ocean Drive, South Beach",
    price: 180,
    rating: 4.5,
    description: "Relax by the ocean at our beautiful beachfront resort. Enjoy pristine beaches, world-class spa treatments, and exquisite dining experiences with ocean views.",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    amenities: ["WiFi", "Beach Access", "Pool", "Spa", "Restaurant", "Water Sports"],
    rooms: 200,
    type: "Resort"
  },
  {
    id: 3,
    name: "Downtown Business Hotel",
    city: "Chicago",
    country: "USA",
    address: "789 Michigan Avenue",
    price: 150,
    rating: 4.3,
    description: "Ideal for business travelers, located in the financial district with easy access to major corporate offices and convention centers. Modern rooms with work-friendly amenities.",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
    amenities: ["WiFi", "Business Center", "Gym", "Conference Rooms", "Restaurant"],
    rooms: 120,
    type: "Business"
  },
  {
    id: 4,
    name: "Mountain View Lodge",
    city: "Denver",
    country: "USA",
    address: "321 Mountain Road",
    price: 120,
    rating: 4.6,
    description: "Escape to nature with breathtaking mountain views. Perfect for outdoor enthusiasts with easy access to hiking trails, skiing, and adventure activities.",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80",
    amenities: ["WiFi", "Fireplace", "Mountain Views", "Hiking Access", "Restaurant"],
    rooms: 80,
    type: "Lodge"
  },
  {
    id: 5,
    name: "Historic Boutique Inn",
    city: "Boston",
    country: "USA",
    address: "555 Beacon Street",
    price: 200,
    rating: 4.8,
    description: "Stay in a beautifully restored historic building with modern comforts. Each room is uniquely designed, blending classic elegance with contemporary amenities.",
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80",
    amenities: ["WiFi", "Historic Building", "Restaurant", "Bar", "Concierge"],
    rooms: 45,
    type: "Boutique"
  },
  {
    id: 6,
    name: "Coastal Paradise Hotel",
    city: "San Diego",
    country: "USA",
    address: "888 Pacific Coast Highway",
    price: 190,
    rating: 4.6,
    description: "Discover paradise on the California coast. Our hotel features stunning ocean views, direct beach access, and exceptional dining with fresh local seafood.",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
    amenities: ["WiFi", "Beach Access", "Pool", "Restaurant", "Gym", "Surfboard Rental"],
    rooms: 180,
    type: "Resort"
  },
  {
    id: 7,
    name: "Urban Chic Hotel",
    city: "Los Angeles",
    country: "USA",
    address: "999 Sunset Boulevard",
    price: 220,
    rating: 4.4,
    description: "Modern design meets Hollywood glamour. Stay in the heart of LA with rooftop pool, trendy bar, and walking distance to entertainment venues.",
    image: "https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800&q=80",
    amenities: ["WiFi", "Rooftop Pool", "Bar", "Gym", "Valet Parking", "Restaurant"],
    rooms: 160,
    type: "Luxury"
  },
  {
    id: 8,
    name: "Garden Suites Hotel",
    city: "Seattle",
    country: "USA",
    address: "444 Pine Street",
    price: 140,
    rating: 4.5,
    description: "Tranquil garden setting in the city center. Our spacious suites offer a peaceful retreat with beautiful landscaped gardens and eco-friendly amenities.",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
    amenities: ["WiFi", "Garden", "Kitchenette", "Free Breakfast", "Gym"],
    rooms: 90,
    type: "Boutique"
  }
];

/**
 * Simulates network delay for realistic API behavior
 * In production, this would be a real API call
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetches all hotels or filters by city
 * 
 * @param city - Optional city filter
 * @returns Promise<Hotel[]> - Array of hotel objects
 * @throws Error if the API request fails
 */
export const fetchHotels = async (city?: string): Promise<Hotel[]> => {
  try {
    // Simulate network delay (500ms-1000ms)
    await delay(500 + Math.random() * 500);
    
    // Simulate occasional API errors (5% chance)
    if (Math.random() < 0.05) {
      throw new Error('Network error: Unable to fetch hotels');
    }
    
    // Filter by city if provided
    if (city && city.trim() !== '') {
      const filtered = MOCK_HOTELS.filter(
        hotel => hotel.city.toLowerCase().includes(city.toLowerCase())
      );
      return filtered;
    }
    
    return MOCK_HOTELS;
  } catch (error) {
    console.error('Error fetching hotels:', error);
    throw error;
  }
};

/**
 * Fetches a single hotel by ID
 * 
 * @param id - Hotel ID
 * @returns Promise<Hotel | null> - Hotel object or null if not found
 * @throws Error if the API request fails
 */
export const fetchHotelById = async (id: number): Promise<Hotel | null> => {
  try {
    // Simulate network delay
    await delay(300 + Math.random() * 300);
    
    // Simulate occasional API errors (5% chance)
    if (Math.random() < 0.05) {
      throw new Error('Network error: Unable to fetch hotel details');
    }
    
    const hotel = MOCK_HOTELS.find(h => h.id === id);
    return hotel || null;
  } catch (error) {
    console.error('Error fetching hotel by ID:', error);
    throw error;
  }
};

/**
 * Searches hotels with filters
 * 
 * @param params - Search parameters (city, price range, rating)
 * @returns Promise<Hotel[]> - Filtered array of hotels
 */
export const searchHotels = async (
  city: string,
  minPrice?: number,
  maxPrice?: number,
  minRating?: number
): Promise<Hotel[]> => {
  try {
    await delay(500 + Math.random() * 500);
    
    let filtered = [...MOCK_HOTELS];
    
    // Filter by city
    if (city && city.trim() !== '') {
      filtered = filtered.filter(
        hotel => hotel.city.toLowerCase().includes(city.toLowerCase())
      );
    }
    
    // Filter by minimum price
    if (minPrice !== undefined) {
      filtered = filtered.filter(hotel => hotel.price >= minPrice);
    }
    
    // Filter by maximum price
    if (maxPrice !== undefined) {
      filtered = filtered.filter(hotel => hotel.price <= maxPrice);
    }
    
    // Filter by minimum rating
    if (minRating !== undefined) {
      filtered = filtered.filter(hotel => hotel.rating >= minRating);
    }
    
    return filtered;
  } catch (error) {
    console.error('Error searching hotels:', error);
    throw error;
  }
};
