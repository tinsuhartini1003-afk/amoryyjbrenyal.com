export interface Product {
  id: string;
  name: string;
  game: 'Free Fire' | 'Mobile Legends';
  price: number;
  oldPrice: number;
  discount: number;
  status: 'available' | 'sold' | 'rented';
  screenshots: string[];
  description: string;
  rank: string;
  level: number;
  skinCount: number;
  heroCount?: number; // MLBB specific
  bundle?: string; // FF specific
  evoGun?: string; // FF specific
  emote?: string;
  diamond: number;
  loginMethod: string;
  notes: string;
  views: number;
  favoritesCount: number;
  stock: number;
  isFlashSale: boolean;
  flashSaleEndDate?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  buyerName: string;
  rating: number;
  comment: string;
  type: 'purchase' | 'rental';
  verified: boolean;
  date: string;
  likes: number;
  reply?: string;
  hidden?: boolean;
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  game: 'Free Fire' | 'Mobile Legends';
  price: number;
  orderType: 'purchase' | 'rental';
  duration?: string;
  status: 'pending' | 'completed' | 'cancelled';
  date: string;
  customerName?: string;
}

export interface AppSettings {
  whatsapp: string;
  qrisUrl: string;
  logoUrl: string;
  bannerUrl: string;
  websiteName: string;
  primaryColor: string; // #FF4D94
  successColor: string; // #25D366
}
