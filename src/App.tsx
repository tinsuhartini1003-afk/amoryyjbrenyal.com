import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Gamepad2, 
  Search, 
  Filter, 
  Award, 
  Layers, 
  Flame, 
  Heart, 
  Share2, 
  Eye, 
  User, 
  MessageCircle, 
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  Lock,
  ThumbsUp,
  X,
  Phone,
  Mail,
  HelpCircle,
  Copy,
  Check
} from "lucide-react";

import { Product, Review, Order, AppSettings } from "./types";
import { 
  seedDatabaseIfEmpty, 
  getProductsRealtime, 
  getReviewsRealtime, 
  getOrdersRealtime, 
  getSettingsRealtime,
  incrementProductViews,
  incrementProductFavorites
} from "./dbService";
import { auth } from "./firebase";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from "firebase/auth";

// Components
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProductCard from "./components/ProductCard";
import CheckoutModal from "./components/CheckoutModal";
import ReviewSection from "./components/ReviewSection";
import FAQSection from "./components/FAQSection";
import HowToBuy from "./components/HowToBuy";
import SellAccount from "./components/SellAccount";
import AdminDashboard from "./components/AdminDashboard";
import Footer from "./components/Footer";

export default function App() {
  // Views: 'home' | 'catalog' | 'detail' | 'sell' | 'reviews' | 'favorites' | 'admin-login' | 'admin'
  const [currentView, setCurrentView] = React.useState<string>("home");
  const [activeProductId, setActiveProductId] = React.useState<string | null>(null);

  // Real-time Database state
  const [products, setProducts] = React.useState<Product[]>([]);
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [settings, setSettings] = React.useState<AppSettings>({
    whatsapp: "https://lynk.id/amoryy1821",
    qrisUrl: "",
    logoUrl: "",
    bannerUrl: "",
    websiteName: "AMORYY JB&RENTAL",
    primaryColor: "#FF4D94",
    successColor: "#25D366"
  });

  // Client Favorites list synced to Local Storage
  const [favorites, setFavorites] = React.useState<string[]>([]);

  // Auth & Admin state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = React.useState(false);
  const [adminEmail, setAdminEmail] = React.useState("");
  const [adminPassword, setAdminPassword] = React.useState("");
  const [loginError, setLoginError] = React.useState("");
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  // Detail view state
  const [activeScreenshotIdx, setActiveScreenshotIdx] = React.useState(0);
  const [checkoutType, setCheckoutType] = React.useState<"purchase" | "rental" | null>(null);

  // Catalog view filter state
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedGame, setSelectedGame] = React.useState<string>("Semua");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("Semua");
  const [onlyFlashSale, setOnlyFlashSale] = React.useState(false);
  const [maxPrice, setMaxPrice] = React.useState<number>(2000000);
  const [sortOption, setSortOption] = React.useState<string>("terbaru");

  // Load and seed database on mount
  React.useEffect(() => {
    // Seed DB first
    seedDatabaseIfEmpty();

    // Listen to real-time changes
    const unsubProducts = getProductsRealtime((data) => setProducts(data));
    const unsubReviews = getReviewsRealtime((data) => setReviews(data));
    const unsubOrders = getOrdersRealtime((data) => setOrders(data));
    const unsubSettings = getSettingsRealtime((data) => setSettings(data));

    // Listen to Firebase Auth state
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAdminLoggedIn(true);
      } else {
        setIsAdminLoggedIn(false);
      }
    });

    // Load favorites from local storage
    const savedFavs = localStorage.getItem("amoryy_favorites");
    if (savedFavs) {
      setFavorites(JSON.parse(savedFavs));
    }

    return () => {
      unsubProducts();
      unsubReviews();
      unsubOrders();
      unsubSettings();
      unsubAuth();
    };
  }, []);

  // Sync favorites to Local Storage
  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated: string[];
    let delta = 0;

    if (favorites.includes(id)) {
      updated = favorites.filter((favId) => favId !== id);
      delta = -1;
    } else {
      updated = [...favorites, id];
      delta = 1;
    }

    setFavorites(updated);
    localStorage.setItem("amoryy_favorites", JSON.stringify(updated));

    // Update favorite count in Firestore
    try {
      await incrementProductFavorites(id, delta);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShareProduct = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `Keren parah! Akun ${product.game} "${product.name}" dijual seharga ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(product.price)} hanya di AMORYY JB&RENTAL. Cek sekarang!`;
    navigator.clipboard.writeText(shareText);
    alert("Detail produk berhasil disalin ke papan klip! Siap dibagikan.");
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      // Perform sign in
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      setCurrentView("admin");
      setAdminEmail("");
      setAdminPassword("");
    } catch (err: any) {
      console.error("Login failed: ", err);
      // Fallback: If account does not exist or first boot, try auto-registering admin credentials!
      if (
        err.code === "auth/user-not-found" || 
        err.code === "auth/invalid-credential" || 
        err.code === "auth/wrong-password" ||
        err.message?.includes("invalid-credential") ||
        err.message?.includes("user-not-found")
      ) {
        if (adminEmail === "admin@amoryy.com" && adminPassword === "amoryy123") {
          try {
            await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
            setCurrentView("admin");
            setAdminEmail("");
            setAdminPassword("");
            return;
          } catch (regErr) {
            console.error("Failed to seed register admin:", regErr);
          }
        } else if (adminEmail === "tinsuhartini1003@gmail.com") {
          try {
            // Register owner email as admin with their chosen password!
            await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
            setCurrentView("admin");
            setAdminEmail("");
            setAdminPassword("");
            return;
          } catch (regErr: any) {
            console.error("Failed to register owner admin:", regErr);
            if (regErr.code === "auth/email-already-in-use" || regErr.message?.includes("email-already-in-use")) {
              setLoginError("Kata sandi salah untuk email tinsuhartini1003@gmail.com. Silakan coba kembali.");
              return;
            }
          }
        }
      }
      setLoginError("Email atau sandi salah. Gunakan admin@amoryy.com / amoryy123 atau email admin terdaftar Anda.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAdminLogout = async () => {
    try {
      await signOut(auth);
      setCurrentView("home");
    } catch (err) {
      console.error(err);
    }
  };

  const handleNavigate = (view: string, productId?: string) => {
    setCurrentView(view);
    if (productId) {
      setActiveProductId(productId);
      setActiveScreenshotIdx(0);
      // Increment views count in database
      incrementProductViews(productId);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filter and sort catalog products
  const filteredProducts = React.useMemo(() => {
    let result = [...products];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.rank.toLowerCase().includes(q)
      );
    }

    // Game filter
    if (selectedGame !== "Semua") {
      result = result.filter((p) => p.game === selectedGame);
    }

    // Status filter
    if (selectedStatus !== "Semua") {
      const statusMap: { [key: string]: Product["status"] } = {
        "Tersedia": "available",
        "Sedang Dirental": "rented"
      };
      if (statusMap[selectedStatus]) {
        result = result.filter((p) => p.status === statusMap[selectedStatus]);
      }
    }

    // Flash sale only
    if (onlyFlashSale) {
      result = result.filter((p) => p.isFlashSale);
    }

    // Price range
    result = result.filter((p) => p.price <= maxPrice);

    // Sorting
    switch (sortOption) {
      case "terbaru":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "terpopuler":
        result.sort((a, b) => b.views - a.views);
        break;
      case "harga-terendah":
        result.sort((a, b) => a.price - b.price);
        break;
      case "harga-tertinggi":
        result.sort((a, b) => b.price - a.price);
        break;
    }

    return result;
  }, [products, searchQuery, selectedGame, selectedStatus, onlyFlashSale, maxPrice, sortOption]);

  const activeProduct = products.find((p) => p.id === activeProductId);

  // Pre-formatted IDR price
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white flex flex-col justify-between" id="app-root">
      
      {/* Sticky Premium Navbar */}
      <Navbar 
        currentView={currentView}
        onNavigate={handleNavigate}
        favoritesCount={favorites.length}
        settings={settings}
        isAdminLoggedIn={isAdminLoggedIn}
        onLogout={handleAdminLogout}
      />

      {/* Main Container */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          
          {/* VIEW: HOME / BERANDA */}
          {currentView === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-16"
            >
              {/* Hero Banner Section */}
              <Hero onNavigate={handleNavigate} settings={settings} />

              {/* Flash Sale Section */}
              {products.some((p) => p.isFlashSale && p.status === "available") && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6" id="home-flashsale">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                        <Flame className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">Flash Sale Terbatas</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Amankan akun game sultan incaranmu dengan diskon gila-gilaan!</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products
                      .filter((p) => p.isFlashSale && p.status === "available")
                      .slice(0, 4)
                      .map((p) => (
                        <ProductCard
                          key={p.id}
                          product={p}
                          onNavigate={handleNavigate}
                          isFavorite={favorites.includes(p.id)}
                          onToggleFavorite={handleToggleFavorite}
                          onShare={handleShareProduct}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* Categories Navigation */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#FF4D94] uppercase tracking-widest bg-[#FF4D94]/10 px-3 py-1 rounded-full border border-[#FF4D94]/20 inline-block">
                    Pilih Berdasarkan Game
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">Kategori Game Populer</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  {/* FF Card */}
                  <div
                    onClick={() => {
                      setSelectedGame("Free Fire");
                      handleNavigate("catalog");
                    }}
                    className="bg-gradient-to-tr from-orange-900/40 to-black rounded-3xl p-8 border border-orange-500/20 hover:border-orange-500/50 transition-all cursor-pointer group relative overflow-hidden shadow-2xl"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full filter blur-2xl group-hover:scale-125 transition-transform"></div>
                    <div className="flex items-center space-x-4 relative z-10">
                      <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 font-extrabold text-xl group-hover:bg-orange-500 group-hover:text-white transition-all">
                        FF
                      </div>
                      <div className="text-left">
                        <h3 className="font-extrabold text-lg text-white">Free Fire</h3>
                        <p className="text-xs text-gray-400 mt-1">Evo gun max, elite pass season lawas, bundle sultan.</p>
                      </div>
                    </div>
                  </div>

                  {/* MLBB Card */}
                  <div
                    onClick={() => {
                      setSelectedGame("Mobile Legends");
                      handleNavigate("catalog");
                    }}
                    className="bg-gradient-to-tr from-blue-900/40 to-black rounded-3xl p-8 border border-blue-500/20 hover:border-blue-500/50 transition-all cursor-pointer group relative overflow-hidden shadow-2xl"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full filter blur-2xl group-hover:scale-125 transition-transform"></div>
                    <div className="flex items-center space-x-4 relative z-10">
                      <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-extrabold text-xl group-hover:bg-blue-500 group-hover:text-white transition-all">
                        ML
                      </div>
                      <div className="text-left">
                        <h3 className="font-extrabold text-lg text-white">Mobile Legends</h3>
                        <p className="text-xs text-gray-400 mt-1">Skin collector, legend, lightborn, epic limit lengkap.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Produk Terbaru */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6" id="home-latest">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">Katalog Terbaru</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Akun-akun sultan anyar fresh yang baru saja di-listing admin.</p>
                  </div>
                  <button
                    onClick={() => {
                      setSortOption("terbaru");
                      handleNavigate("catalog");
                    }}
                    className="text-xs font-bold text-[#FF4D94] hover:text-white transition-colors"
                  >
                    Lihat Semua Katalog →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products
                    .slice(0, 4)
                    .map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        onNavigate={handleNavigate}
                        isFavorite={favorites.includes(p.id)}
                        onToggleFavorite={handleToggleFavorite}
                        onShare={handleShareProduct}
                      />
                    ))}
                </div>
              </div>

              {/* Produk Populer */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6" id="home-popular">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">Paling Banyak Dilirik</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Akun terpopuler dengan jumlah views dan likes tertinggi.</p>
                  </div>
                  <button
                    onClick={() => {
                      setSortOption("terpopuler");
                      handleNavigate("catalog");
                    }}
                    className="text-xs font-bold text-[#FF4D94] hover:text-white transition-colors"
                  >
                    Lihat Semua Populer →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...products]
                    .sort((a, b) => b.views - a.views)
                    .slice(0, 4)
                    .map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        onNavigate={handleNavigate}
                        isFavorite={favorites.includes(p.id)}
                        onToggleFavorite={handleToggleFavorite}
                        onShare={handleShareProduct}
                      />
                    ))}
                </div>
              </div>

              {/* Cara Pembelian / Sewa */}
              <div className="bg-[#141414] py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <HowToBuy />
                </div>
              </div>

              {/* FAQ Section */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <FAQSection />
              </div>

            </motion.div>
          )}

          {/* VIEW: CATALOGUE */}
          {currentView === "catalog" && (
            <motion.div
              key="catalog"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8"
              id="catalog-view"
            >
              {/* Header */}
              <div className="border-b border-white/5 pb-6">
                <h1 className="text-3xl font-black text-white tracking-tight">Katalog Akun Game</h1>
                <p className="text-xs text-gray-400 mt-1">Gunakan fitur filter dan pencarian untuk menemukan akun game sultan impian Anda.</p>
              </div>

              {/* Filter controls */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left filter sidebox */}
                <div className="lg:col-span-3 space-y-6">
                  <div className="bg-[#141414] p-5 rounded-2xl border border-white/5 space-y-5">
                    
                    {/* Search box */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Pencarian Kata Kunci</label>
                      <div className="relative">
                        <Search className="w-4 h-4 text-gray-600 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Ketik rank, item, dll..."
                          className="w-full bg-[#0F0F0F] border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#FF4D94] transition-all"
                        />
                      </div>
                    </div>

                    {/* Game Filter */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Game</label>
                      <div className="flex flex-col space-y-1">
                        {["Semua", "Free Fire", "Mobile Legends"].map((game) => (
                          <button
                            key={game}
                            onClick={() => setSelectedGame(game)}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                              selectedGame === game
                                ? "bg-[#FF4D94]/10 text-[#FF4D94] border border-[#FF4D94]/20"
                                : "text-gray-400 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            {game}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Status</label>
                      <div className="flex flex-col space-y-1">
                        {["Semua", "Tersedia", "Sedang Dirental"].map((status) => (
                          <button
                            key={status}
                            onClick={() => setSelectedStatus(status)}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                              selectedStatus === status
                                ? "bg-[#FF4D94]/10 text-[#FF4D94] border border-[#FF4D94]/20"
                                : "text-gray-400 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Flash Sale Toggle */}
                    <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5">
                      <span className="text-xs text-gray-300 font-bold uppercase">Flash Sale Saja</span>
                      <input
                        type="checkbox"
                        checked={onlyFlashSale}
                        onChange={(e) => setOnlyFlashSale(e.target.checked)}
                        className="w-4 h-4 text-[#FF4D94] bg-black border-white/10 rounded focus:ring-0"
                      />
                    </div>

                    {/* Max Price Range Slider */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase">
                        <span>Harga Maksimal</span>
                        <span className="text-white">{formatPrice(maxPrice)}</span>
                      </div>
                      <input
                        type="range"
                        min={100000}
                        max={3000000}
                        step={50000}
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="w-full h-1.5 bg-[#0F0F0F] rounded-lg appearance-none cursor-pointer accent-[#FF4D94]"
                      />
                    </div>

                  </div>
                </div>

                {/* Right products grid */}
                <div className="lg:col-span-9 space-y-6">
                  {/* Sorting bar */}
                  <div className="bg-[#141414] px-5 py-3 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <span className="text-gray-500 font-medium">Menampilkan <strong className="text-white">{filteredProducts.length}</strong> produk</span>
                    
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                      <span className="text-gray-500 shrink-0 font-medium">Urutkan:</span>
                      <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        className="bg-[#0F0F0F] border border-white/5 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF4D94] transition-all cursor-pointer w-full sm:w-auto"
                      >
                        <option value="terbaru">Terbaru Di-listing</option>
                        <option value="terpopuler">Terpopuler (Banyak Dilihat)</option>
                        <option value="harga-terendah">Harga Terendah</option>
                        <option value="harga-tertinggi">Harga Tertinggi</option>
                      </select>
                    </div>
                  </div>

                  {/* Grid display */}
                  {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="catalog-products-grid">
                      {filteredProducts.map((p) => (
                        <ProductCard
                          key={p.id}
                          product={p}
                          onNavigate={handleNavigate}
                          isFavorite={favorites.includes(p.id)}
                          onToggleFavorite={handleToggleFavorite}
                          onShare={handleShareProduct}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-[#141414] rounded-3xl border border-white/5 text-gray-500 space-y-2">
                      <p className="font-extrabold text-white text-base">Tidak Ada Akun Ditemukan</p>
                      <p className="text-xs max-w-sm mx-auto font-light leading-relaxed">
                        Coba gunakan kata kunci lain atau reset filter pencarian di sisi kiri box filter.
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          )}

          {/* VIEW: DETAIL PRODUK */}
          {currentView === "detail" && activeProduct && (
            <motion.div
              key="detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12"
              id="product-detail-view"
            >
              {/* Back Button */}
              <button
                onClick={() => handleNavigate("catalog")}
                className="flex items-center space-x-1.5 text-xs font-bold text-gray-400 hover:text-[#FF4D94] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Kembali ke Katalog</span>
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left side: Screenshots Slider & Thumbnails */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="relative aspect-[16/9] rounded-3xl overflow-hidden border border-white/10 shadow-2xl group bg-black">
                    <img
                      src={activeProduct.screenshots[activeScreenshotIdx] || "https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=800&auto=format&fit=crop&q=80"}
                      alt={activeProduct.name}
                      className="w-full h-full object-cover object-center"
                      referrerPolicy="no-referrer"
                      id="active-screenshot-img"
                    />

                    {/* Screenshot controls overlay */}
                    {activeProduct.screenshots.length > 1 && (
                      <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button
                          onClick={() => setActiveScreenshotIdx((prev) => (prev > 0 ? prev - 1 : activeProduct.screenshots.length - 1))}
                          className="p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white hover:text-[#FF4D94]"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setActiveScreenshotIdx((prev) => (prev < activeProduct.screenshots.length - 1 ? prev + 1 : 0))}
                          className="p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white hover:text-[#FF4D94]"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Screenshots Thumbnail rows */}
                  {activeProduct.screenshots.length > 1 && (
                    <div className="flex gap-2">
                      {activeProduct.screenshots.map((shot, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveScreenshotIdx(idx)}
                          className={`w-20 aspect-[16/9] rounded-lg overflow-hidden border transition-all cursor-pointer ${
                            activeScreenshotIdx === idx ? "border-[#FF4D94] ring-2 ring-[#FF4D94]/20" : "border-white/5 opacity-60"
                          }`}
                        >
                          <img src={shot} className="w-full h-full object-cover" alt="thumbnail" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Reviews component section */}
                  <div className="pt-8">
                    <ReviewSection
                      product={activeProduct}
                      reviews={reviews}
                      settings={settings}
                      isAdminLoggedIn={isAdminLoggedIn}
                    />
                  </div>
                </div>

                {/* Right side: Spec information & Pricing checkout */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Badge Row */}
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className={`text-[10px] font-extrabold px-3 py-1 rounded-md text-white border ${
                      activeProduct.game === "Free Fire" 
                        ? "bg-gradient-to-r from-orange-500 to-red-600 border-orange-500/30" 
                        : "bg-gradient-to-r from-blue-500 to-indigo-600 border-blue-500/30"
                    }`}>
                      {activeProduct.game}
                    </span>

                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                      activeProduct.status === "available" ? "bg-[#25D366]" : activeProduct.status === "sold" ? "bg-red-500" : "bg-yellow-500"
                    }`}></span>
                    <span className="capitalize text-xs text-gray-300 font-bold">
                      {activeProduct.status === "available" ? "Tersedia" : activeProduct.status === "sold" ? "Terjual" : "Sedang Dirental"}
                    </span>
                  </div>

                  {/* Title & Stats */}
                  <div className="space-y-2">
                    <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight" id="detail-product-title">
                      {activeProduct.name}
                    </h1>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Dilihat: <strong>{activeProduct.views}x</strong></span>
                      <span>Suka: <strong>{activeProduct.favoritesCount}x</strong></span>
                      <span>Status Stok: <strong>{activeProduct.stock} Akun</strong></span>
                    </div>
                  </div>

                  {/* Pricing Board */}
                  <div className="bg-white/5 p-5 rounded-3xl border border-white/5 space-y-1.5 relative overflow-hidden">
                    {activeProduct.discount > 0 && (
                      <div className="absolute top-0 right-0 bg-[#FF4D94] text-white text-[10px] font-extrabold px-4 py-1.5 rounded-bl-xl shadow-lg">
                        DISKON {activeProduct.discount}%
                      </div>
                    )}
                    
                    <span className="text-xs text-gray-400 block font-bold uppercase tracking-wider">Harga Penjualan</span>
                    <div className="flex items-baseline space-x-3">
                      <span className="text-3xl font-black text-[#FF4D94] tracking-tight">{formatPrice(activeProduct.price)}</span>
                      {activeProduct.discount > 0 && (
                        <span className="text-sm text-gray-500 line-through">{formatPrice(activeProduct.oldPrice)}</span>
                      )}
                    </div>
                  </div>

                  {/* Checkout buttons container */}
                  {activeProduct.status === "available" && (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setCheckoutType("purchase")}
                        className="bg-[#FF4D94] hover:bg-[#FF3380] text-white font-extrabold text-sm py-4 rounded-2xl shadow-[0_0_20px_rgba(255,77,148,0.4)] hover:shadow-[0_0_30px_rgba(255,77,148,0.6)] transition-all cursor-pointer text-center"
                        id="detail-buy-btn"
                      >
                        Beli Sekarang
                      </button>
                      <button
                        onClick={() => setCheckoutType("rental")}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#FF4D94]/40 text-white font-bold text-sm py-4 rounded-2xl transition-all cursor-pointer text-center"
                        id="detail-rent-btn"
                      >
                        Sewa / Rental Akun
                      </button>
                    </div>
                  )}

                  {/* Action tags (Favorite, Share, WA Chat) */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => handleToggleFavorite(activeProduct.id, e)}
                      className={`flex-1 flex items-center justify-center space-x-1.5 py-3 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        favorites.includes(activeProduct.id)
                          ? "bg-[#FF4D94]/10 border-[#FF4D94] text-[#FF4D94]"
                          : "bg-white/5 border-white/5 text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${favorites.includes(activeProduct.id) ? "fill-[#FF4D94] text-[#FF4D94]" : ""}`} />
                      <span>{favorites.includes(activeProduct.id) ? "Disukai" : "Tambah Favorit"}</span>
                    </button>

                    <button
                      onClick={(e) => handleShareProduct(activeProduct, e)}
                      className="flex-1 flex items-center justify-center space-x-1.5 py-3 bg-white/5 border border-white/5 text-gray-300 hover:bg-white/10 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Bagikan Akun</span>
                    </button>
                  </div>

                  {/* Specific Account Specs Box */}
                  <div className="bg-[#141414] rounded-3xl p-6 border border-white/5 space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-white/5 pb-2">Spesifikasi Akun Lengkap</h3>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-gray-500 block">Rank Saat Ini:</span>
                        <strong className="text-white block mt-0.5">{activeProduct.rank}</strong>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Level Akun:</span>
                        <strong className="text-white block mt-0.5">Lvl {activeProduct.level}</strong>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Metode Login:</span>
                        <strong className="text-white block mt-0.5">{activeProduct.loginMethod}</strong>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Jumlah Skin:</span>
                        <strong className="text-white block mt-0.5">{activeProduct.skinCount} Skin</strong>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Sisa Diamond:</span>
                        <strong className="text-[#FF4D94] block mt-0.5">{activeProduct.diamond} Diamond</strong>
                      </div>

                      {/* MLBB SPECIFIC */}
                      {activeProduct.game === "Mobile Legends" && (
                        <div>
                          <span className="text-gray-500 block">Jumlah Hero:</span>
                          <strong className="text-white block mt-0.5">{activeProduct.heroCount || 0} Hero</strong>
                        </div>
                      )}

                      {/* FREE FIRE SPECIFIC */}
                      {activeProduct.game === "Free Fire" && (
                        <>
                          <div>
                            <span className="text-gray-500 block">Bundle Sultan:</span>
                            <strong className="text-white block mt-0.5 truncate">{activeProduct.bundle || "-"}</strong>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Senjata Evo:</span>
                            <strong className="text-white block mt-0.5 truncate">{activeProduct.evoGun || "-"}</strong>
                          </div>
                        </>
                      )}

                      {activeProduct.emote && (
                        <div className="col-span-2">
                          <span className="text-gray-500 block">Emote Khusus:</span>
                          <strong className="text-white block mt-0.5">{activeProduct.emote}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description Box */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Deskripsi Penjual</h3>
                    <p className="text-xs text-gray-400 leading-relaxed font-light bg-[#141414] p-4 rounded-2xl border border-white/5">
                      {activeProduct.description}
                    </p>
                  </div>

                  {/* Notes Box */}
                  {activeProduct.notes && (
                    <div className="bg-yellow-500/5 border border-yellow-500/10 p-4 rounded-2xl text-[11px] text-yellow-500 leading-relaxed font-light">
                      <strong>Catatan Admin:</strong> {activeProduct.notes}
                    </div>
                  )}

                </div>
              </div>

              {/* Checkout modal triggers */}
              {checkoutType && (
                <CheckoutModal
                  product={activeProduct}
                  type={checkoutType}
                  settings={settings}
                  onClose={() => setCheckoutType(null)}
                />
              )}

            </motion.div>
          )}

          {/* VIEW: SELL ACCOUNT */}
          {currentView === "sell" && (
            <motion.div
              key="sell"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SellAccount settings={settings} />
            </motion.div>
          )}

          {/* VIEW: FAVORITES */}
          {currentView === "favorites" && (
            <motion.div
              key="favorites"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8"
              id="favorites-view"
            >
              <div className="border-b border-white/5 pb-6">
                <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
                  <Heart className="w-8 h-8 text-[#FF4D94] fill-[#FF4D94] animate-pulse" />
                  <span>Favorit Saya</span>
                </h1>
                <p className="text-xs text-gray-400 mt-1">Daftar akun game sultan yang Anda simpan untuk dipantau sewaktu-waktu.</p>
              </div>

              {favorites.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products
                    .filter((p) => favorites.includes(p.id))
                    .map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        onNavigate={handleNavigate}
                        isFavorite={true}
                        onToggleFavorite={handleToggleFavorite}
                        onShare={handleShareProduct}
                      />
                    ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-[#141414] rounded-3xl border border-white/5 text-gray-500 space-y-3">
                  <Heart className="w-12 h-12 text-gray-700 mx-auto" />
                  <p className="font-extrabold text-white text-base">Daftar Favorit Masih Kosong</p>
                  <p className="text-xs max-w-sm mx-auto font-light">
                    Jelajahi katalog akun game kami dan ketuk ikon hati di setiap kartu produk untuk memasukkannya ke sini.
                  </p>
                  <button
                    onClick={() => handleNavigate("catalog")}
                    className="bg-[#FF4D94] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg cursor-pointer"
                  >
                    Buka Katalog Game
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* VIEW: REVIEWS PAGE */}
          {currentView === "reviews" && (
            <motion.div
              key="reviews-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto px-4 py-12 space-y-8"
            >
              <div className="text-center space-y-3">
                <span className="text-xs font-bold text-[#FF4D94] uppercase tracking-widest bg-[#FF4D94]/10 px-3 py-1 rounded-full border border-[#FF4D94]/20 inline-block">
                  Pelanggan Puas
                </span>
                <h1 className="text-3xl font-black text-white tracking-tight">Testimoni & Ulasan Pelanggan</h1>
                <p className="text-sm text-gray-400 max-w-lg mx-auto">
                  Berikut adalah ulasan jujur dan terverifikasi dari para pelanggan yang telah bertransaksi jual-beli atau rental akun di AMORYY.
                </p>
              </div>

              {/* Show review summary and lists */}
              <div className="bg-[#141414] p-6 rounded-3xl border border-white/5 space-y-6">
                <h2 className="text-base font-bold text-white border-b border-white/5 pb-3">Daftar Semua Testimoni ({reviews.length})</h2>
                
                <div className="space-y-4">
                  {reviews.filter((r) => !r.hidden).map((rev) => (
                    <div
                      key={rev.id}
                      className="bg-[#0F0F0F] p-5 rounded-2xl border border-white/5 space-y-3 hover:border-white/10 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF4D94] to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                            {rev.buyerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-white text-sm">{rev.buyerName}</span>
                              {rev.verified && (
                                <span className="inline-flex items-center bg-[#25D366]/10 text-[#25D366] text-[9px] font-extrabold px-2 py-0.5 rounded border border-[#25D366]/20">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  {rev.type === "purchase" ? "PEMBELIAN TERVERIFIKASI" : "RENTAL TERVERIFIKASI"}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-gray-500 mt-0.5">
                              Produk: <strong>{rev.productName}</strong> • {new Date(rev.date).toLocaleDateString("id-ID", {
                                year: "numeric",
                                month: "long",
                                day: "numeric"
                              })}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex text-yellow-400 text-xs">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-gray-300 leading-relaxed font-light pl-13">
                        {rev.comment}
                      </p>

                      {rev.reply && (
                        <div className="ml-13 bg-purple-950/20 border border-purple-500/20 p-4 rounded-xl space-y-1.5">
                          <div className="flex items-center space-x-1.5 text-[11px] font-extrabold text-purple-400">
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>BALASAN ADMIN AMORYY</span>
                          </div>
                          <p className="text-xs text-purple-200 font-light leading-relaxed">
                            {rev.reply}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* VIEW: ADMIN LOGIN */}
          {currentView === "admin-login" && (
            <motion.div
              key="admin-login"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md mx-auto py-20 px-4"
              id="admin-login-view"
            >
              <div className="bg-[#141414] p-8 rounded-3xl border border-[#FF4D94]/30 shadow-[0_0_35px_rgba(255,77,148,0.15)] space-y-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#FF4D94]/10 border border-[#FF4D94]/30 mx-auto flex items-center justify-center text-[#FF4D94] shadow-inner">
                  <Lock className="w-8 h-8 animate-pulse" />
                </div>

                <div className="space-y-2">
                  <h1 className="text-2xl font-black text-white tracking-tight">Login Portal Admin</h1>
                  <p className="text-xs text-gray-400">Gunakan akun admin terdaftar untuk mengakses panel manajemen website.</p>
                </div>

                {loginError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-3 text-xs leading-relaxed">
                    {loginError}
                  </div>
                )}

                <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Email Admin</label>
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@amoryy.com"
                      className="w-full bg-[#0F0F0F] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#FF4D94] transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Sandi Login</label>
                    <input
                      type="password"
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#0F0F0F] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#FF4D94] transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full bg-[#FF4D94] hover:bg-[#FF3380] text-white font-extrabold py-3.5 rounded-xl shadow-[0_0_15px_rgba(255,77,148,0.3)] transition-all cursor-pointer disabled:opacity-50 text-xs uppercase tracking-wider"
                  >
                    {isLoggingIn ? "Menghubungkan..." : "Masuk Sebagai Admin"}
                  </button>
                </form>

                <div className="text-[10px] text-gray-600 leading-relaxed font-light space-y-1">
                  <div>Sandi default sistem: <strong>admin@amoryy.com</strong> / <strong>amoryy123</strong></div>
                  <div>Atau email admin Anda: <strong>tinsuhartini1003@gmail.com</strong> (Tentukan sandi baru Anda saat pertama kali login!)</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* VIEW: ADMIN PANEL */}
          {currentView === "admin" && isAdminLoggedIn && (
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
            >
              <AdminDashboard
                products={products}
                reviews={reviews}
                orders={orders}
                settings={settings}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Styled Gaming Footer */}
      <Footer onNavigate={handleNavigate} settings={settings} />

    </div>
  );
}
