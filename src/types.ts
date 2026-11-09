export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: 'tandoor' | 'feast' | 'dessert' | 'sides';
  isVeg: boolean;
  isChefSpecial?: boolean;
}

export interface GalleryItem {
  id: string;
  url: string;
  caption: string;
  category: 'interior' | 'cuisine' | 'beverage' | 'atmosphere';
  description: string;
}

export interface DrinkItem {
  id: string;
  name: string;
  description: string;
  price: number;
  sweet: number; // 0-100
  bitter: number; // 0-100
  woody: number; // 0-100
  smoky: number; // 0-100
  notes: string[];
}

export interface Reservation {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  tableType: 'standard' | 'tandoor_counter' | 'obsidian_vault' | 'window_seat';
  dietaryNotes?: string;
  occasion?: string;
  status: 'confirmed' | 'pending' | 'completed';
  createdAt: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
}
