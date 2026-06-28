import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  limit,
  increment
} from "firebase/firestore";
import { db } from "./firebase";
import { Product, Review, Order, AppSettings } from "./types";

// Collection names
const PRODUCTS_COL = "products";
const REVIEWS_COL = "reviews";
const ORDERS_COL = "orders";
const SETTINGS_COL = "settings";

// Default app settings
const DEFAULT_SETTINGS: AppSettings = {
  whatsapp: "https://lynk.id/amoryy1821",
  qrisUrl: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=AMORYY-PAYMENT-MOCK",
  logoUrl: "https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=200&auto=format&fit=crop&q=80",
  bannerUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80",
  websiteName: "AMORYY JB&RENTAL",
  primaryColor: "#FF4D94",
  successColor: "#25D366"
};

// Initial Seed Data for Products
const INITIAL_PRODUCTS: Product[] = [
  {
    id: "ff-sultan-cobra",
    name: "Sultan FF Cobra Max - Full Evo Gun",
    game: "Free Fire",
    price: 750000,
    oldPrice: 1000000,
    discount: 25,
    status: "available",
    screenshots: [
      "https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Akun Free Fire Sultan spesifikasi dewa. COBRA MP40 Level Max dan AK Blue Flame Draco Level Max. Banyak bundle elite pass old, emote melimpah, sisa diamond masih ada untuk ganti nama.",
    rank: "Heroic Stars 15",
    level: 72,
    skinCount: 185,
    bundle: "Cobra Rage Bundle, Criminal Red, Alok Elite",
    evoGun: "MP40 Cobra (MAX), AK Blue Flame (MAX), M1014 Green Flame (Lvl 5)",
    emote: "Cobra Emote, Chair Emote, Booyah Pass Special",
    diamond: 450,
    loginMethod: "FB (Facebook) - Single Bind Aman 100%",
    notes: "Akun bergaransi lifetime admin AMORYY. Proses pemindahan tangan cepat.",
    views: 1250,
    favoritesCount: 88,
    stock: 1,
    isFlashSale: true,
    flashSaleEndDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
    createdAt: new Date().toISOString()
  },
  {
    id: "ml-sultan-mythic",
    name: "MLBB Mythical Glory - 245 Skins - Legend Gusion",
    game: "Mobile Legends",
    price: 1200000,
    oldPrice: 1600000,
    discount: 25,
    status: "available",
    screenshots: [
      "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Spesifikasi Sultan Mobile Legends. Skin Gusion Legend, 3 Collector (Aldous, Granger, Wanwan), 15 Epic Limit (Saber, Fanny, Selena), emblem max semua. Winrate cakep 68%+",
    rank: "Mythical Glory 75★",
    level: 89,
    skinCount: 245,
    heroCount: 124,
    emote: "Gusion Recall Effect, Fire Crown, RRQ Emote",
    diamond: 120,
    loginMethod: "Moonton Bind (Dikasih se-emailnya) - Anti Hackback",
    notes: "Data lengkap sampai ke akar. Email pemulihan kosong.",
    views: 1890,
    favoritesCount: 142,
    stock: 1,
    isFlashSale: true,
    flashSaleEndDate: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: "ff-semi-sultan",
    name: "FF Semi Sultan Murah Meriah - Megalodon Max",
    game: "Free Fire",
    price: 320000,
    oldPrice: 450000,
    discount: 28,
    status: "available",
    screenshots: [
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Akun FF ekonomis tapi mentereng. Ada SCAR Megalodon Alpha Level Max, M1887 Rapper Underworld, Bundle Alok dan Chrono lengkap.",
    rank: "Diamond IV",
    level: 61,
    skinCount: 75,
    bundle: "Rapper Underworld, Elite Pass Season 34-39",
    evoGun: "SCAR Megalodon (MAX)",
    emote: "Push Up Emote, Laughing Emote",
    diamond: 12,
    loginMethod: "Google (Gmail) - Aman Terjamin",
    notes: "Pembelian instan dibimbing admin sampai selesai.",
    views: 450,
    favoritesCount: 29,
    stock: 1,
    isFlashSale: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "ml-kof-chou",
    name: "MLBB Chou KOF - Lightborn Alucard - Murah",
    game: "Mobile Legends",
    price: 490000,
    oldPrice: 650000,
    discount: 24,
    status: "rented",
    screenshots: [
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Akun MLBB idaman pejuang Chou. Skin Chou KOF (Iori Yagami), Lightborn Alucard, 5 Epic Shop (Lancelot, Gusion, Harley). Hero komplit 110, emblem mantap level 60 rata.",
    rank: "Mythic Honor",
    level: 75,
    skinCount: 98,
    heroCount: 110,
    emote: "Iori Yagami Voice & Emote, Recall Tas-Tas",
    diamond: 8,
    loginMethod: "Moonton Clean (Bisa langsung ganti email)",
    notes: "Sedang dalam rental aktif oleh pelanggan. Bisa di-booking sekarang.",
    views: 890,
    favoritesCount: 74,
    stock: 1,
    isFlashSale: false,
    createdAt: new Date().toISOString()
  }
];

// Initial Seed Data for Reviews
const INITIAL_REVIEWS: Review[] = [
  {
    id: "rev-1",
    productId: "ff-sultan-cobra",
    productName: "Sultan FF Cobra Max - Full Evo Gun",
    buyerName: "Rian Ganz",
    rating: 5,
    comment: "Gila parah sih ini! Akun sesuai deskripsi, COBRA MAX ngeri bgt buat ngerush. Admin fast respon ramah banget, dibantu ampe tuntas ganti datanya. Recommended bgt lah AMORYY JB!",
    type: "purchase",
    verified: true,
    date: "2026-06-25T14:30:00Z",
    likes: 12,
    reply: "Terima kasih banyak bro Rian! Selamat mabar and salam Booyah! 🔥"
  },
  {
    id: "rev-2",
    productId: "ml-sultan-mythic",
    productName: "MLBB Mythical Glory - 245 Skins - Legend Gusion",
    buyerName: "Dika MLBB",
    rating: 5,
    comment: "Awalnya sempet ragu beli akun harga jutaan gini lewat web. Tapi pas chat admin lsg fast respon ramah bgt, transaksinya aman bgt ga nyampe 10 menit akun udah di tangan. Mantap pol!",
    type: "purchase",
    verified: true,
    date: "2026-06-26T09:15:00Z",
    likes: 8,
    reply: "Sama-sama bro Dika! Kepuasan pelanggan adalah prioritas utama kami. Selamat meng-gendong kawan di Mythic! 👑"
  },
  {
    id: "rev-3",
    productId: "ml-kof-chou",
    productName: "MLBB Chou KOF - Lightborn Alucard - Murah",
    buyerName: "SlayerChou",
    rating: 5,
    comment: "Keren sewa disini, akun iori yagami mulus ga nabrak. Pas disewa dapet kuota penuh lsg push rank mabar sm temen-temen dapet win streak. Murah meriah pelayanannya top.",
    type: "rental",
    verified: true,
    date: "2026-06-27T18:40:00Z",
    likes: 4
  }
];

// Initial Seed Data for Orders
const INITIAL_ORDERS: Order[] = [
  {
    id: "ord-1",
    productId: "ff-sultan-cobra",
    productName: "Sultan FF Cobra Max - Full Evo Gun",
    game: "Free Fire",
    price: 1200000,
    orderType: "purchase",
    status: "completed",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    customerName: "Rian Ganz"
  },
  {
    id: "ord-2",
    productId: "ml-sultan-mythic",
    productName: "MLBB Mythical Glory - 245 Skins - Legend Gusion",
    game: "Mobile Legends",
    price: 1500000,
    orderType: "purchase",
    status: "completed",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    customerName: "Dika MLBB"
  },
  {
    id: "ord-3",
    productId: "ml-kof-chou",
    productName: "MLBB Chou KOF - Lightborn Alucard - Murah",
    game: "Mobile Legends",
    price: 15000,
    orderType: "rental",
    duration: "3 Hari",
    status: "completed",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    customerName: "SlayerChou"
  },
  {
    id: "ord-4",
    productId: "ff-sultan-cobra",
    productName: "Sultan FF Cobra Max - Full Evo Gun",
    game: "Free Fire",
    price: 1200000,
    orderType: "purchase",
    status: "pending",
    date: new Date().toISOString(), // Today
    customerName: "Fajar G"
  },
  {
    id: "ord-5",
    productId: "ml-kof-chou",
    productName: "MLBB Chou KOF - Lightborn Alucard - Murah",
    game: "Mobile Legends",
    price: 15000,
    orderType: "rental",
    duration: "3 Hari",
    status: "completed",
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    customerName: "Agus ML"
  },
  {
    id: "ord-6",
    productId: "ff-sultan-cobra",
    productName: "Sultan FF Cobra Max - Full Evo Gun",
    game: "Free Fire",
    price: 45000,
    orderType: "rental",
    duration: "7 Hari",
    status: "completed",
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    customerName: "Budi FF"
  },
  {
    id: "ord-7",
    productId: "ml-sultan-mythic",
    productName: "MLBB Mythical Glory - 245 Skins - Legend Gusion",
    game: "Mobile Legends",
    price: 1500000,
    orderType: "purchase",
    status: "completed",
    date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
    customerName: "Chandra"
  }
];

// Seed databases if empty
export async function seedDatabaseIfEmpty() {
  try {
    // 1. Check & Seed Settings
    const settingsDocRef = doc(db, SETTINGS_COL, "global");
    const settingsSnap = await getDoc(settingsDocRef);
    if (!settingsSnap.exists()) {
      await setDoc(settingsDocRef, DEFAULT_SETTINGS);
      console.log("Successfully seeded App Settings");
    } else {
      // If it exists, but contains the old placeholder number, let's auto-update it to the official link!
      const currentData = settingsSnap.data() as AppSettings;
      if (currentData.whatsapp === "6281234567890") {
        await updateDoc(settingsDocRef, { whatsapp: "https://lynk.id/amoryy1821" });
        console.log("Automatically upgraded old contact number to official link: https://lynk.id/amoryy1821");
      }
    }

    // 2. Check & Seed Products
    const productsColRef = collection(db, PRODUCTS_COL);
    const productsSnap = await getDocs(productsColRef);
    if (productsSnap.empty) {
      for (const p of INITIAL_PRODUCTS) {
        await setDoc(doc(db, PRODUCTS_COL, p.id), p);
      }
      console.log("Successfully seeded Products");
    }

    // 3. Check & Seed Reviews
    const reviewsColRef = collection(db, REVIEWS_COL);
    const reviewsSnap = await getDocs(reviewsColRef);
    if (reviewsSnap.empty) {
      for (const r of INITIAL_REVIEWS) {
        await setDoc(doc(db, REVIEWS_COL, r.id), r);
      }
      console.log("Successfully seeded Reviews");
    }

    // 4. Check & Seed Orders
    const ordersColRef = collection(db, ORDERS_COL);
    const ordersSnap = await getDocs(ordersColRef);
    if (ordersSnap.empty) {
      for (const o of INITIAL_ORDERS) {
        await setDoc(doc(db, ORDERS_COL, o.id), o);
      }
      console.log("Successfully seeded Orders");
    }
  } catch (error) {
    console.error("Error seeding database: ", error);
  }
}

// ==========================================
// DB OPERATIONS: APP SETTINGS
// ==========================================
export function getSettingsRealtime(callback: (settings: AppSettings) => void) {
  const docRef = doc(db, SETTINGS_COL, "global");
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as AppSettings);
    } else {
      callback(DEFAULT_SETTINGS);
    }
  });
}

export async function updateAppSettings(settings: Partial<AppSettings>) {
  const docRef = doc(db, SETTINGS_COL, "global");
  await updateDoc(docRef, settings);
}

// ==========================================
// DB OPERATIONS: PRODUCTS
// ==========================================
export function getProductsRealtime(callback: (products: Product[]) => void) {
  const colRef = collection(db, PRODUCTS_COL);
  const q = query(colRef, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const products: Product[] = [];
    snapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() } as Product);
    });
    callback(products);
  });
}

export async function addProduct(product: Omit<Product, "id" | "views" | "favoritesCount" | "createdAt">) {
  const newId = `product-${Date.now()}`;
  const fullProduct: Product = {
    ...product,
    id: newId,
    views: 0,
    favoritesCount: 0,
    createdAt: new Date().toISOString()
  };
  await setDoc(doc(db, PRODUCTS_COL, newId), fullProduct);
  return newId;
}

export async function updateProduct(id: string, updates: Partial<Product>) {
  const docRef = doc(db, PRODUCTS_COL, id);
  await updateDoc(docRef, updates);
}

export async function deleteProduct(id: string) {
  const docRef = doc(db, PRODUCTS_COL, id);
  await deleteDoc(docRef);
}

export async function incrementProductViews(id: string) {
  const docRef = doc(db, PRODUCTS_COL, id);
  await updateDoc(docRef, {
    views: increment(1)
  });
}

export async function incrementProductFavorites(id: string, delta: number) {
  const docRef = doc(db, PRODUCTS_COL, id);
  await updateDoc(docRef, {
    favoritesCount: increment(delta)
  });
}

// ==========================================
// DB OPERATIONS: REVIEWS
// ==========================================
export function getReviewsRealtime(callback: (reviews: Review[]) => void) {
  const colRef = collection(db, REVIEWS_COL);
  const q = query(colRef, orderBy("date", "desc"));
  return onSnapshot(q, (snapshot) => {
    const reviews: Review[] = [];
    snapshot.forEach((doc) => {
      reviews.push({ id: doc.id, ...doc.data() } as Review);
    });
    callback(reviews);
  });
}

export async function addReview(review: Omit<Review, "id" | "date" | "likes">) {
  const newId = `review-${Date.now()}`;
  const fullReview: Review = {
    ...review,
    id: newId,
    date: new Date().toISOString(),
    likes: 0
  };
  await setDoc(doc(db, REVIEWS_COL, newId), fullReview);
  return newId;
}

export async function updateReview(id: string, updates: Partial<Review>) {
  const docRef = doc(db, REVIEWS_COL, id);
  await updateDoc(docRef, updates);
}

export async function deleteReview(id: string) {
  const docRef = doc(db, REVIEWS_COL, id);
  await deleteDoc(docRef);
}

export async function incrementReviewLikes(id: string) {
  const docRef = doc(db, REVIEWS_COL, id);
  await updateDoc(docRef, {
    likes: increment(1)
  });
}

// ==========================================
// DB OPERATIONS: ORDERS
// ==========================================
export function getOrdersRealtime(callback: (orders: Order[]) => void) {
  const colRef = collection(db, ORDERS_COL);
  const q = query(colRef, orderBy("date", "desc"));
  return onSnapshot(q, (snapshot) => {
    const orders: Order[] = [];
    snapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as Order);
    });
    callback(orders);
  });
}

export async function createOrder(order: Omit<Order, "date">) {
  const fullOrder: Order = {
    ...order,
    date: new Date().toISOString()
  };
  await setDoc(doc(db, ORDERS_COL, order.id), fullOrder);
}

export async function updateOrderStatus(id: string, status: Order["status"]) {
  const docRef = doc(db, ORDERS_COL, id);
  await updateDoc(docRef, { status });
}
