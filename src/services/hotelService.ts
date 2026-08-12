import { Hotel } from '../types/hotel';
import { cleanHtmlDescription } from '../utils/cleanHtml';

/**
 * Hotel Service - LiteAPI Integration
 *
 * This service fetches REAL hotel data from LiteAPI (liteapi.travel).
 * API key is stored securely in the .env file (VITE_LITEAPI_KEY).
 *
 * Flow:
 * 1. fetchHotels(city) → calls LiteAPI GET /data/hotels?countryCode=XX&cityName=YY
 * 2. Maps the LiteAPI response shape → our Hotel interface
 * 3. Falls back to MOCK_HOTELS if the API is unavailable
 *
 * fetchHotelById(id) → looks up in a session cache populated by fetchHotels,
 * then falls back to mock data so the detail page always works.
 */

const API_KEY = import.meta.env.VITE_LITEAPI_KEY || '';

const API_BASE = 'https://api.liteapi.travel/v3.0';

// ─── City → ISO-2 Country Code ──────────────────────────────────────────────
// Extended map so users can search popular cities worldwide
const CITY_COUNTRY_MAP: Record<string, string> = {
  // USA
  'new york':      'US',
  'los angeles':   'US',
  'chicago':       'US',
  'miami':         'US',
  'boston':        'US',
  'seattle':       'US',
  'denver':        'US',
  'san diego':     'US',
  'san francisco': 'US',
  'las vegas':     'US',
  'houston':       'US',
  'dallas':        'US',
  'orlando':       'US',
  'washington':    'US',
  // Europe
  'london':        'GB',
  'manchester':    'GB',
  'paris':         'FR',
  'rome':          'IT',
  'milan':         'IT',
  'barcelona':     'ES',
  'madrid':        'ES',
  'amsterdam':     'NL',
  'berlin':        'DE',
  'munich':        'DE',
  'vienna':        'AT',
  'prague':        'CZ',
  'budapest':      'HU',
  'lisbon':        'PT',
  'athens':        'GR',
  'istanbul':      'TR',
  // Middle East
  'dubai':         'AE',
  'abu dhabi':     'AE',
  'doha':          'QA',
  'riyadh':        'SA',
  // Asia
  'tokyo':         'JP',
  'osaka':         'JP',
  'seoul':         'KR',
  'beijing':       'CN',
  'shanghai':      'CN',
  'hong kong':     'HK',
  'singapore':     'SG',
  'bangkok':       'TH',
  'bali':          'ID',
  'jakarta':       'ID',
  'mumbai':        'IN',
  'delhi':         'IN',
  'new delhi':     'IN',
  'kolkata':       'IN',
  // Pakistan
  'karachi':       'PK',
  'lahore':        'PK',
  'islamabad':     'PK',
  'peshawar':      'PK',
  'rawalpindi':    'PK',
  // Australia
  'sydney':        'AU',
  'melbourne':     'AU',
  'brisbane':      'AU',
  // Americas
  'toronto':       'CA',
  'vancouver':     'CA',
  'mexico city':   'MX',
  'cancun':        'MX',
  'cairo':         'EG',
  'nairobi':       'KE',
  'johannesburg':  'ZA',
  'cape town':     'ZA',
};

/**
 * Returns the ISO-2 country code for a city name.
 * Falls back to 'US' for unknown cities.
 */
const getCountryCode = (city: string): string => {
  const key = city.toLowerCase().trim();
  // Direct match
  if (CITY_COUNTRY_MAP[key]) return CITY_COUNTRY_MAP[key];
  // Partial match (e.g. "New York City" → "new york")
  for (const [cityKey, code] of Object.entries(CITY_COUNTRY_MAP)) {
    if (key.includes(cityKey) || cityKey.includes(key)) return code;
  }
  return 'US';
};

// ─── Fallback image pool ─────────────────────────────────────────────────────
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
  'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
];

// ─── Session cache (populated by fetchHotels, used by fetchHotelById) ────────
let hotelCache: Hotel[] = [];

/**
 * Maps a raw LiteAPI hotel object to our Hotel interface.
 *
 * LiteAPI response shape (abbreviated):
 * {
 *   hotelId:          "lp3803c",
 *   name:             "Grand Hyatt",
 *   hotelDescription: "...",
 *   address:          { city, country, line1, countryCode },
 *   starRating:       5,
 *   main_photo:       "https://...",
 *   facilities:       [ { name: "WiFi" }, ... ],
 *   rooms:            300,
 *   categoryId:       "luxury",
 * }
 */
const mapToHotel = (raw: any, index: number): Hotel => {
  // Build amenities list from facilities array
  const amenities: string[] = Array.isArray(raw.facilities)
    ? raw.facilities.slice(0, 8).map((f: any) =>
        typeof f === 'string' ? f : f.name || f.facilityName || 'Amenity'
      )
    : ['WiFi', 'Air Conditioning', 'Room Service'];

  // Determine hotel type from starRating or category
  const getType = (raw: any): string => {
    if (raw.categoryId) return raw.categoryId;
    const stars = raw.starRating || 0;
    if (stars >= 5) return 'Luxury';
    if (stars === 4) return 'Deluxe';
    if (stars === 3) return 'Business';
    return 'Hotel';
  };

  // Generate a realistic price from star rating
  const getPrice = (raw: any): number => {
    if (raw.startingFrom?.amount) return Math.round(raw.startingFrom.amount);
    const stars = raw.starRating || 3;
    const base = stars * 50;
    // Add some variance per hotel
    return base + (index % 5) * 20;
  };

  // Build rating from starRating (convert 1–5 stars to a 1-decimal score)
  const getRating = (raw: any): number => {
    if (raw.reviewScore) return parseFloat(raw.reviewScore.toFixed(1));
    const stars = raw.starRating || 3;
    // Map 1-5 stars → 3.0 – 5.0 with variance
    const base = 2.5 + stars * 0.4;
    const variance = (index % 3) * 0.1;
    return parseFloat(Math.min(5.0, base + variance).toFixed(1));
  };

  const image =
    raw.main_photo ||
    raw.thumbnail ||
    FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];

  return {
    id: index + 1,
    name: raw.name || 'Hotel',
    city: raw.address?.city || raw.city || '',
    country: raw.address?.country || raw.address?.countryCode || '',
    address: raw.address?.line1 || raw.address?.full || raw.address?.street || '',
    price: getPrice(raw),
    rating: getRating(raw),
    description: cleanHtmlDescription(
      raw.hotelDescription ||
      raw.description ||
      `A ${raw.starRating || 3}-star hotel located in ${raw.address?.city || 'the city'}, offering comfortable rooms and excellent amenities for both leisure and business travelers.`
    ),
    image,
    amenities: amenities.length > 0 ? amenities : ['WiFi', 'Restaurant', 'Gym'],
    rooms: raw.rooms || raw.numberOfRooms || 50,
    type: getType(raw),
  };
};

// ─── Mock fallback data ───────────────────────────────────────────────────────
// Used only when the API is unavailable (network error, rate limit, etc.)
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

// ─── Public API functions ─────────────────────────────────────────────────────

/**
 * Fetches hotels from LiteAPI for a given city.
 * Falls back to MOCK_HOTELS on any error.
 *
 * @param city - The city to search (e.g. "London", "Dubai")
 * @returns Promise<Hotel[]>
 */
export const fetchHotels = async (city?: string): Promise<Hotel[]> => {
  try {
    const searchCity = city?.trim() || 'New York';
    const countryCode = getCountryCode(searchCity);

    const url = new URL(`${API_BASE}/data/hotels`);
    url.searchParams.set('countryCode', countryCode);
    url.searchParams.set('cityName', searchCity);
    url.searchParams.set('limit', '20');

    console.log(`[LiteAPI] Fetching hotels for "${searchCity}" (${countryCode})…`);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-API-Key': API_KEY,
        'Accept':    'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`LiteAPI responded with status ${response.status}`);
    }

    const json = await response.json();
    const rawHotels: any[] = json.data ?? json.hotels ?? [];

    if (!rawHotels.length) {
      console.warn('[LiteAPI] No hotels returned, using fallback data');
      // If user searched and got nothing, return empty (not mock)
      if (city && city.trim() !== '') return [];
      return MOCK_HOTELS;
    }

    const hotels = rawHotels.map(mapToHotel);
    hotelCache = hotels; // save to cache for fetchHotelById
    console.log(`[LiteAPI] ✅ Received ${hotels.length} hotels`);
    return hotels;

  } catch (error) {
    console.error('[LiteAPI] Fetch failed, using fallback data:', error);

    // Return filtered mock data so a search still "works" in fallback mode
    if (city && city.trim() !== '') {
      const filtered = MOCK_HOTELS.filter(h =>
        h.city.toLowerCase().includes(city.toLowerCase())
      );
      return filtered;
    }
    return MOCK_HOTELS;
  }
};

/**
 * Fetches a single hotel by its numeric ID.
 *
 * Priority order:
 * 1. Session cache (populated by the most recent fetchHotels call)
 * 2. Mock fallback data
 *
 * @param id - Numeric hotel ID (from hotel.id in the list)
 * @returns Promise<Hotel | null>
 */
export const fetchHotelById = async (id: number): Promise<Hotel | null> => {
  try {
    // 1. Check session cache first (fastest, from current search)
    if (hotelCache.length > 0) {
      const cached = hotelCache.find(h => h.id === id);
      if (cached) return cached;
    }

    // 2. Fall back to mock data
    const mock = MOCK_HOTELS.find(h => h.id === id);
    return mock ?? null;

  } catch (error) {
    console.error('[LiteAPI] fetchHotelById error:', error);
    return null;
  }
};

/**
 * Searches hotels with optional price/rating filters.
 * Delegates to fetchHotels then applies client-side filtering.
 */
export const searchHotels = async (
  city: string,
  minPrice?: number,
  maxPrice?: number,
  minRating?: number
): Promise<Hotel[]> => {
  let results = await fetchHotels(city);

  if (minPrice !== undefined) {
    results = results.filter(h => h.price >= minPrice);
  }
  if (maxPrice !== undefined) {
    results = results.filter(h => h.price <= maxPrice);
  }
  if (minRating !== undefined) {
    results = results.filter(h => h.rating >= minRating);
  }

  return results;
};
