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
  type: string;
}

export interface SearchParams {
  city: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
}

export interface ApiResponse<T> {
  data: T;
  status: string;
  message?: string;
}
