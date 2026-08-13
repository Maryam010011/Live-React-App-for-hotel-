import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import { HotelModel } from './models/Hotel.js';

dotenv.config();

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

// The EXACT hotel dataset currently used in the frontend
const INITIAL_HOTELS = [
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
      'Ideal for business travelers, located in the financial district with easy access to major corporate offices and convention centers. Modern rooms with work-friendly amenities.',
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
      'Escape to nature with breathtaking mountain views. Perfect for outdoor enthusiasts with easy access to hiking trails, skiing, and adventure activities.',
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
      'Discover paradise on the California coast. Our hotel features stunning ocean views, direct beach access, and exceptional dining with fresh local seafood.',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
    amenities: ['WiFi', 'Beach Access', 'Pool', 'Restaurant', 'Gym', 'Surfboard Rental'],
    rooms: 180,
    type: 'Resort',
  },
];

const seedDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('❌ MONGODB_URI is missing in environment variables. Please check your .env file.');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    console.log('Clearing existing hotel records...');
    await HotelModel.deleteMany({});

    console.log('Seeding current frontend hotels into MongoDB...');
    const inserted = await HotelModel.insertMany(INITIAL_HOTELS);

    console.log(`🎉 Successfully seeded ${inserted.length} hotels into MongoDB!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
