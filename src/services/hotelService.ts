import { Hotel } from '../types/hotel';

/**
 * Hotel Service - Custom REST API Integration
 *
 * Interacts with the Node.js/Express/MongoDB backend server.
 * Uses VITE_API_URL environment variable as base URL.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Fallback dataset used if the backend server is temporarily unreachable
const MOCK_HOTELS: Hotel[] = [
  {
    id: 1,
    name: 'Grand Luxury Hotel',
    city: 'New York',
    country: 'USA',
    address: '123 Park Avenue, Manhattan',
    price: 250,
    rating: 4.7,
    description:
      'Experience luxury in the heart of Manhattan. Our hotel offers world-class amenities, stunning city views, and exceptional service. Perfect for business travelers and tourists alike.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Bar', 'Spa', 'Room Service'],
    rooms: 150,
    type: 'Luxury',
  },
  {
    id: 2,
    name: 'Seaside Resort & Spa',
    city: 'Miami',
    country: 'USA',
    address: '456 Ocean Drive, South Beach',
    price: 180,
    rating: 4.5,
    description:
      'Relax by the ocean at our beautiful beachfront resort. Enjoy pristine beaches, world-class spa treatments, and exquisite dining experiences with ocean views.',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
    amenities: ['WiFi', 'Beach Access', 'Pool', 'Spa', 'Restaurant', 'Water Sports'],
    rooms: 200,
    type: 'Resort',
  },
  {
    id: 3,
    name: 'Downtown Business Hotel',
    city: 'Chicago',
    country: 'USA',
    address: '789 Michigan Avenue',
    price: 150,
    rating: 4.3,
    description:
      'Ideal for business travelers, located in the financial district with easy access to major corporate offices and convention centers.',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
    amenities: ['WiFi', 'Business Center', 'Gym', 'Conference Rooms', 'Restaurant'],
    rooms: 120,
    type: 'Business',
  },
  {
    id: 4,
    name: 'Mountain View Lodge',
    city: 'Denver',
    country: 'USA',
    address: '321 Mountain Road',
    price: 120,
    rating: 4.6,
    description:
      'Escape to nature with breathtaking mountain views. Perfect for outdoor enthusiasts with easy access to hiking trails and skiing.',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
    amenities: ['WiFi', 'Fireplace', 'Mountain Views', 'Hiking Access', 'Restaurant'],
    rooms: 80,
    type: 'Lodge',
  },
  {
    id: 5,
    name: 'Historic Boutique Inn',
    city: 'Boston',
    country: 'USA',
    address: '555 Beacon Street',
    price: 200,
    rating: 4.8,
    description:
      'Stay in a beautifully restored historic building with modern comforts. Each room is uniquely designed, blending classic elegance with contemporary amenities.',
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
    amenities: ['WiFi', 'Historic Building', 'Restaurant', 'Bar', 'Concierge'],
    rooms: 45,
    type: 'Boutique',
  },
  {
    id: 6,
    name: 'Coastal Paradise Hotel',
    city: 'San Diego',
    country: 'USA',
    address: '888 Pacific Coast Highway',
    price: 190,
    rating: 4.6,
    description:
      'Discover paradise on the California coast with stunning ocean views, direct beach access, and exceptional dining with fresh local seafood.',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
    amenities: ['WiFi', 'Beach Access', 'Pool', 'Restaurant', 'Gym', 'Surfboard Rental'],
    rooms: 180,
    type: 'Resort',
  },
];

/**
 * Fetches all hotels or filters by city via backend REST API
 */
export const fetchHotels = async (city?: string): Promise<Hotel[]> => {
  try {
    const endpoint = city && city.trim() !== ''
      ? `${API_BASE_URL}/api/hotels?city=${encodeURIComponent(city.trim())}`
      : `${API_BASE_URL}/api/hotels`;

    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const json = await response.json();
    return json.data || json;
  } catch (error) {
    console.warn('[hotelService] Backend API fetch failed, using fallback data:', error);
    if (city && city.trim() !== '') {
      return MOCK_HOTELS.filter((h) =>
        h.city.toLowerCase().includes(city.toLowerCase())
      );
    }
    return MOCK_HOTELS;
  }
};

/**
 * Fetches a single hotel by ID via backend REST API
 */
export const fetchHotelById = async (id: number | string): Promise<Hotel | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/hotels/${id}`);

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`API responded with status ${response.status}`);
    }

    const json = await response.json();
    return json.data || json;
  } catch (error) {
    console.warn(`[hotelService] Backend API fetchById(${id}) failed, checking fallback:`, error);
    const mockMatch = MOCK_HOTELS.find((h) => String(h.id) === String(id));
    return mockMatch || null;
  }
};

/**
 * Creates a new hotel via POST /api/hotels
 */
export const createHotel = async (hotelData: Partial<Hotel>): Promise<Hotel> => {
  const response = await fetch(`${API_BASE_URL}/api/hotels`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(hotelData),
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(errJson.message || 'Failed to create hotel');
  }

  const json = await response.json();
  return json.data;
};

/**
 * Updates an existing hotel via PUT /api/hotels/:id
 */
export const updateHotel = async (
  id: number | string,
  hotelData: Partial<Hotel>
): Promise<Hotel> => {
  const response = await fetch(`${API_BASE_URL}/api/hotels/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(hotelData),
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(errJson.message || 'Failed to update hotel');
  }

  const json = await response.json();
  return json.data;
};

/**
 * Deletes a hotel via DELETE /api/hotels/:id
 */
export const deleteHotel = async (id: number | string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/hotels/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(errJson.message || 'Failed to delete hotel');
  }
};

/**
 * Searches hotels with filters
 */
export const searchHotels = async (
  city: string,
  minPrice?: number,
  maxPrice?: number,
  minRating?: number
): Promise<Hotel[]> => {
  let results = await fetchHotels(city);

  if (minPrice !== undefined) {
    results = results.filter((h) => h.price >= minPrice);
  }
  if (maxPrice !== undefined) {
    results = results.filter((h) => h.price <= maxPrice);
  }
  if (minRating !== undefined) {
    results = results.filter((h) => h.rating >= minRating);
  }

  return results;
};
