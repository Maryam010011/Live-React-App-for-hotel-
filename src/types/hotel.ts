/**
 * TypeScript Type Definitions for Hotel Data
 * 
 * These types ensure type safety throughout the application.
 * They define the shape of data we expect from the API and use internally.
 */

// Represents a single hotel entity
export interface Hotel {
  id: number;
  name: string;
  city: string;
  country: string;
  address: string;
  price: number;
  rating: number;
  description: string;
  image: string;
  amenities: string[];
  rooms: number;
  type: string; // e.g., "Resort", "Business", "Boutique"
}

// Represents search/filter parameters
export interface SearchParams {
  city: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
}

// API Response wrapper type
export interface ApiResponse<T> {
  data: T;
  status: string;
  message?: string;
}
