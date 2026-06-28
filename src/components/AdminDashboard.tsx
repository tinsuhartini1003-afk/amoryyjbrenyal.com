import React from "react";
import {
  Settings,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  TrendingUp,
  Gamepad2,
  ShoppingBag,
  Coins,
  MessageCircle,
  FileText,
  Copy,
  PlusCircle,
  Clock,
  Upload,
  AlertCircle
} from "lucide-react";
import { Product, Review, Order, AppSettings } from "../types";
import {
  addProduct,
  updateProduct,
  deleteProduct,
  updateAppSettings,
  updateOrderStatus,
  updateReview,
  deleteReview
} from "../dbService";
import { storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";

interface AdminDashboardProps {
  products: Product[];
  reviews: Review[];
  orders: Order[];
  settings: AppSettings;
}

export default function AdminDashboard({
  products,
  reviews,
  orders,
  settings
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = React.useState<"overview" | "products" | "orders" | "reviews" | "settings">("overview");

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0F0F0F] border border-white/10 p-3 rounded-xl shadow-2xl text-xs space-y-1">
          <p className="font-bold text-gray-400">{label}</p>
          {payload.map((p: any) => (
            <p key={p.name} className="font-extrabold flex items-center gap-1.5" style={{ color: p.color || p.fill }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
              {p.name}: {p.name === "Pendapatan" ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(p.value) : `${p.value} Pesanan`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Generate 30-day chart data
  const chartData = React.useMemo(() => {
    const data = [];
    const now = new Date();
    
    // Generate templates for the last 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateLabel = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
      
      data.push({
        name: dateLabel,
        day: d.getDate(),
        month: d.getMonth(),
        year: d.getFullYear(),
        "Pesanan": 0,
        "Pendapatan": 0
      });
    }

    // Populate with real orders
    orders.forEach((order) => {
      if (!order.date) return;
      const orderDate = new Date(order.date);
      const oDay = orderDate.getDate();
      const oMonth = orderDate.getMonth();
      const oYear = orderDate.getFullYear();
      
      const found = data.find((item) => item.day === oDay && item.month === oMonth && item.year === oYear);
      if (found) {
        found["Pesanan"] += 1;
        if (order.status === "completed") {
          found["Pendapatan"] += order.price;
        }
      }
    });

    return data;
  }, [orders]);

  // FORM STATES: Add / Edit Product
  const [isEditingProduct, setIsEditingProduct] = React.useState<string | null>(null);
  const [showAddProductForm, setShowAddProductForm] = React.useState(false);

  // New/Edit product form data
  const [productForm, setProductForm] = React.useState({
    name: "",
    game: "Free Fire" as "Free Fire" | "Mobile Legends",
    price: 0,
    oldPrice: 0,
    discount: 0,
    status: "available" as "available" | "sold" | "rented",
    screenshot1: "",
    screenshot2: "",
    description: "",
    rank: "",
    level: 1,
    skinCount: 0,
    heroCount: 0,
    bundle: "",
    evoGun: "",
    emote: "",
    diamond: 0,
    loginMethod: "",
    notes: "",
    isFlashSale: false
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = React.useState<AppSettings>({ ...settings });
  const [isUploadingQris, setIsUploadingQris] = React.useState(false);
  const [qrisUploadError, setQrisUploadError] = React.useState("");

  React.useEffect(() => {
    setSettingsForm({ ...settings });
  }, [settings]);

  // Handle QRIS File Upload
  const handleQrisFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setQrisUploadError("File yang diunggah harus berupa gambar (PNG, JPG, dll).");
      return;
    }

    setIsUploadingQris(true);
    setQrisUploadError("");

    try {
      // 1. Try Firebase Storage upload
      const filename = `qris_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
      const qrisRef = ref(storage, `qris/${filename}`);
      const snapshot = await uploadBytes(qrisRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      setSettingsForm((prev) => ({ ...prev, qrisUrl: downloadUrl }));
      alert("Gambar QRIS berhasil diunggah ke Firebase Storage!");
    } catch (err: any) {
      console.warn("Storage upload failed, fallback to base64 compression...", err);
      // 2. Base64 fallback with canvas compression so it's super lightweight (<100kb) and fits Firestore
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          // Get highly compressed Base64 representation
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
          setSettingsForm((prev) => ({ ...prev, qrisUrl: compressedDataUrl }));
          alert("Gambar QRIS diproses dan disimpan di Cloud (Base64 fallback)!");
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = () => {
        setQrisUploadError("Gagal membaca file gambar.");
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingQris(false);
    }
  };

  React.useEffect(() => {
    setSettingsForm({ ...settings });
  }, [settings]);

  // Handle setting updates
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateAppSettings(settingsForm);
      alert("Pengaturan website berhasil diperbarui secara real-time!");
    } catch (error) {
      console.error(error);
      alert("Gagal memperbarui pengaturan.");
    }
  };

  // Pre-populate form for editing
  const handleStartEditProduct = (p: Product) => {
    setIsEditingProduct(p.id);
    setProductForm({
      name: p.name,
      game: p.game,
      price: p.price,
      oldPrice: p.oldPrice,
      discount: p.discount,
      status: p.status,
      screenshot1: p.screenshots[0] || "",
      screenshot2: p.screenshots[1] || "",
      description: p.description,
      rank: p.rank,
      level: p.level,
      skinCount: p.skinCount,
      heroCount: p.heroCount || 0,
      bundle: p.bundle || "",
      evoGun: p.evoGun || "",
      emote: p.emote || "",
      diamond: p.diamond,
      loginMethod: p.loginMethod,
      notes: p.notes,
      isFlashSale: p.isFlashSale
    });
    setShowAddProductForm(true);
  };

  // Handle Add/Edit submit
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const screenshots = [productForm.screenshot1, productForm.screenshot2].filter(Boolean);
    if (screenshots.length === 0) {
      screenshots.push("https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=800&auto=format&fit=crop&q=80");
    }

    const payload = {
      name: productForm.name,
      game: productForm.game,
      price: Number(productForm.price),
      oldPrice: Number(productForm.oldPrice),
      discount: Number(productForm.discount),
      status: productForm.status,
      screenshots,
      description: productForm.description,
      rank: productForm.rank,
      level: Number(productForm.level),
      skinCount: Number(productForm.skinCount),
      heroCount: productForm.game === "Mobile Legends" ? Number(productForm.heroCount) : undefined,
      bundle: productForm.game === "Free Fire" ? productForm.bundle : undefined,
      evoGun: productForm.game === "Free Fire" ? productForm.evoGun : undefined,
      emote: productForm.emote,
      diamond: Number(productForm.diamond),
      loginMethod: productForm.loginMethod,
      notes: productForm.notes,
      isFlashSale: productForm.isFlashSale,
      flashSaleEndDate: productForm.isFlashSale ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : undefined,
      stock: 1
    };

    try {
      if (isEditingProduct) {
        await updateProduct(isEditingProduct, payload);
        alert("Produk berhasil diperbarui!");
      } else {
        await addProduct(payload);
        alert("Produk baru berhasil ditambahkan!");
      }
      
      // Reset form
      setShowAddProductForm(false);
      setIsEditingProduct(null);
      setProductForm({
        name: "",
        game: "Free Fire",
        price: 0,
        oldPrice: 0,
        discount: 0,
        status: "available",
        screenshot1: "",
        screenshot2: "",
        description: "",
        rank: "",
        level: 1,
        skinCount: 0,
        heroCount: 0,
        bundle: "",
        evoGun: "",
        emote: "",
        diamond: 0,
        loginMethod: "",
        notes: "",
        isFlashSale: false
      });
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menyimpan produk.");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus produk ini secara permanen?")) {
      await deleteProduct(id);
    }
  };

  const handleUpdateOrderStatus = async (id: string, status: Order["status"]) => {
    await updateOrderStatus(id, status);
  };

  const handleToggleReviewHide = async (id: string, currentHidden: boolean) => {
    await updateReview(id, { hidden: !currentHidden });
  };

  const handleDeleteReview = async (id: string) => {
    if (window.confirm("Hapus ulasan ini?")) {
      await deleteReview(id);
    }
  };

  // Formatted IDR price helper
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(value);
  };

  // Stat calculations
  const totalRevenue = orders
    .filter((o) => o.status === "completed")
    .reduce((acc, curr) => acc + curr.price, 0);

  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const activeRentals = products.filter((p) => p.status === "rented").length;

  return (
    <div className="space-y-8 py-4" id="admin-dashboard-container">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#FF4D94] animate-spin-slow" />
            <span>Dashboard Admin AMORYY</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">Kelola data produk, pesanan, ulasan, dan pengaturan website Anda secara real-time.</p>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex overflow-x-auto gap-2 border-b border-white/5 pb-2">
        {[
          { id: "overview", label: "Statistik", icon: <TrendingUp className="w-4 h-4" /> },
          { id: "products", label: "Kelola Produk", icon: <Gamepad2 className="w-4 h-4" /> },
          { id: "orders", label: "Pesanan Masuk", icon: <ShoppingBag className="w-4 h-4" /> },
          { id: "reviews", label: "Moderasi Ulasan", icon: <MessageCircle className="w-4 h-4" /> },
          { id: "settings", label: "Pengaturan Web", icon: <Settings className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeTab === tab.id
                ? "bg-[#FF4D94]/10 text-[#FF4D94] border border-[#FF4D94]/30"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6" id="tab-overview">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#141414] p-5 rounded-2xl border border-white/5 space-y-2">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">Total Pendapatan</span>
              <div className="text-2xl font-black text-[#25D366]">{formatPrice(totalRevenue)}</div>
              <span className="text-[10px] text-gray-400">Dari pesanan berstatus selesai</span>
            </div>

            <div className="bg-[#141414] p-5 rounded-2xl border border-white/5 space-y-2">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">Menunggu Verifikasi</span>
              <div className="text-2xl font-black text-yellow-500">{pendingOrders} Pesanan</div>
              <span className="text-[10px] text-gray-400">Menunggu konfirmasi bukti bayar</span>
            </div>

            <div className="bg-[#141414] p-5 rounded-2xl border border-white/5 space-y-2">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">Sewa Aktif</span>
              <div className="text-2xl font-black text-indigo-400">{activeRentals} Akun</div>
              <span className="text-[10px] text-gray-400">Akun sedang digunakan penyewa</span>
            </div>

            <div className="bg-[#141414] p-5 rounded-2xl border border-white/5 space-y-2">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">Total Akun</span>
              <div className="text-2xl font-black text-white">{products.length} Akun</div>
              <span className="text-[10px] text-gray-400">Di dalam database katalog</span>
            </div>
          </div>

          {/* CHARTS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="dashboard-analytics-charts">
            {/* Revenue Trend Chart */}
            <div className="bg-[#141414] p-6 rounded-3xl border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#25D366]" />
                    Tren Pendapatan Harian (30 Hari Terakhir)
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Total nominal pendapatan dari pesanan yang berstatus selesai</p>
                </div>
                <span className="text-xs font-black text-[#25D366] bg-[#25D366]/10 px-2.5 py-1 rounded-lg">IDR</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#25D366" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#25D366" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#6B7280" 
                      fontSize={9}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#6B7280" 
                      fontSize={9}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${v / 1000}k` : v}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="Pendapatan" 
                      stroke="#25D366" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Order Count Bar Chart */}
            <div className="bg-[#141414] p-6 rounded-3xl border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#FF4D94]" />
                    Volume Transaksi Harian (30 Hari Terakhir)
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Jumlah keseluruhan transaksi pesanan masuk per hari</p>
                </div>
                <span className="text-xs font-black text-[#FF4D94] bg-[#FF4D94]/10 px-2.5 py-1 rounded-lg">Pesanan</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#6B7280" 
                      fontSize={9}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#6B7280" 
                      fontSize={9}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="Pesanan" 
                      fill="#FF4D94" 
                      radius={[4, 4, 0, 0]} 
                      maxBarSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Quick Logs */}
          <div className="bg-[#141414] p-6 rounded-3xl border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Aktivitas Toko Terbaru</h3>
            <div className="divide-y divide-white/5">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-white/5 ${
                      order.orderType === "purchase" ? "text-[#FF4D94]" : "text-purple-400"
                    }`}>
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-white block">
                        {order.orderType === "purchase" ? "Pembelian" : "Sewa"} - {order.productName}
                      </span>
                      <span className="text-[10px] text-gray-500">ID Pesanan: {order.id} • {new Date(order.date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-white block">{formatPrice(order.price)}</span>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                      order.status === "completed" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-500"
                    }`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <div className="py-8 text-center text-gray-500">Belum ada pesanan masuk.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PRODUCTS MANAGEMENT */}
      {activeTab === "products" && (
        <div className="space-y-6" id="tab-products">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-white">Daftar Produk Game</h3>
            <button
              onClick={() => {
                setIsEditingProduct(null);
                setShowAddProductForm(!showAddProductForm);
              }}
              className="bg-[#FF4D94] hover:bg-[#FF3380] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(255,77,148,0.3)] flex items-center space-x-1.5 cursor-pointer"
            >
              {showAddProductForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{showAddProductForm ? "Tutup Form" : "Tambah Produk Baru"}</span>
            </button>
          </div>

          {/* Add / Edit Form */}
          {showAddProductForm && (
            <form onSubmit={handleSaveProduct} className="bg-[#141414] p-6 rounded-3xl border border-white/10 space-y-4">
              <h4 className="text-sm font-bold text-[#FF4D94] uppercase tracking-widest">
                {isEditingProduct ? "Edit Spesifikasi Akun" : "Form Akun Game Baru"}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Nama Akun</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="Contoh: Sultan FF Megalodon Lvl Max"
                    className="w-full bg-[#0F0F0F] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Game</label>
                  <select
                    value={productForm.game}
                    onChange={(e) => setProductForm({ ...productForm, game: e.target.value as any })}
                    className="w-full bg-[#0F0F0F] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white"
                  >
                    <option value="Free Fire">Free Fire</option>
                    <option value="Mobile Legends">Mobile Legends</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Status Akun</label>
                  <select
                    value={productForm.status}
                    onChange={(e) => setProductForm({ ...productForm, status: e.target.value as any })}
                    className="w-full bg-[#0F0F0F] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white"
                  >
                    <option value="available">Tersedia</option>
                    <option value="sold">Terjual</option>
                    <option value="rented">Sedang Dirental</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Harga Sekarang (IDR)</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full bg-[#0F0F0F] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Harga Coret / Lama (IDR)</label>
                  <input
                    type="number"
                    value={productForm.oldPrice}
                    onChange={(e) => setProductForm({ ...productForm, oldPrice: Number(e.target.value) })}
                    className="w-full bg-[#0F0F0F] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Persentase Diskon (%)</label>
                  <input
                    type="number"
                    value={productForm.discount}
                    onChange={(e) => setProductForm({ ...productForm, discount: Number(e.target.value) })}
                    className="w-full bg-[#0F0F0F] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Rank Akun</label>
                  <input
                    type="text"
                    required
                    value={productForm.rank}
                    onChange={(e) => setProductForm({ ...productForm, rank: e.target.value })}
                    placeholder="Contoh: Heroic / Mythical Glory"
                    className="w-full bg-[#0F0F0F] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Level Akun</label>
                  <input
                    type="number"
                    required
                    value={productForm.level}
                    onChange={(e) => setProductForm({ ...productForm, level: Number(e.target.value) })}
                    className="w-full bg-[#0F0F0F] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Jumlah Skin</label>
                  <input
                    type="number"
                    required
                    value={productForm.skinCount}
                    onChange={(e) => setProductForm({ ...productForm, skinCount: Number(e.target.value) })}
                    className="w-full bg-[#0F0F0F] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>

                {productForm.game === "Mobile Legends" && (
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Jumlah Hero (MLBB)</label>
                    <input
                      type="number"
                      value={productForm.heroCount}
                      onChange={(e) => setProductForm({ ...productForm, heroCount: Number(e.target.value) })}
                      className="w-full bg-[#0F0F0F] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white"
                    />
                  </div>
                )}

                {productForm.game === "Free Fire" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Bundle Langka (FF)</label>
                      <input
                        type="text"
                        value={productForm.bundle}
                        onChange={(e) => setProductForm({ ...productForm, bundle: e.target.value })}
                        placeholder="Contoh: Cobra Rage, Alok"
                        className="w-full bg-[#0F0F0F] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Evo Gun (FF)</label>
                      <input
                        type="text"
                        value={productForm.evoGun}
                        onChange={(e) => setProductForm({ ...productForm, evoGun: e.target.value })}
                        placeholder="Contoh: MP40 Cobra Max, Draco Max"
                        className="w-full bg-[#0F0F0F] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Diamond Tersisa</label>
                  <input
                    type="number"
                    value={productForm.diamond}
                    onChange={(e) => setProductForm({ ...productForm, diamond: Number(e.target.value) })}
                    className="w-full bg-[#0F0F0F] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Metode Login</label>
                  <input
                    type="text"
                    required
                    value={productForm.loginMethod}
                    onChange={(e) => setProductForm({ ...productForm, loginMethod: e.target.value })}
                    placeholder="Contoh: Moonton Clean / FB Single Bind"
                    className="w-full bg-[#0F0F0F] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Emote Khusus</label>
                  <input
                    type="text"
                    value={productForm.emote}
                    onChange={(e) => setProductForm({ ...productForm, emote: e.target.value })}
                    placeholder="Contoh: Recall Tas-tas, Emote Cobra"
                    className="w-full bg-[#0F0F0F] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* Screenshot URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">URL Screenshot 1</label>
                  <input
                    type="text"
                    value={productForm.screenshot1}
                    onChange={(e) => setProductForm({ ...productForm, screenshot1: e.target.value })}
                    placeholder="Link gambar Unsplash / upload online"
                    className="w-full bg-[#0F0F0F] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">URL Screenshot 2</label>
                  <input
                    type="text"
                    value={productForm.screenshot2}
                    onChange={(e) => setProductForm({ ...productForm, screenshot2: e.target.value })}
                    placeholder="Link gambar Unsplash / upload online"
                    className="w-full bg-[#0F0F0F] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Deskripsi Lengkap</label>
                  <textarea
                    rows={3}
                    required
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Rincian lengkap item, keunggulan akun, tier, dll..."
                    className="w-full bg-[#0F0F0F] border border-white/5 rounded-xl p-3 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Catatan Tambahan</label>
                  <textarea
                    rows={3}
                    value={productForm.notes}
                    onChange={(e) => setProductForm({ ...productForm, notes: e.target.value })}
                    placeholder="Contoh: Garansi lifetime, proses 5 menit..."
                    className="w-full bg-[#0F0F0F] border border-white/5 rounded-xl p-3 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Flash Sale switch */}
              <div className="flex items-center space-x-3 bg-black/30 p-3 rounded-xl border border-white/5">
                <input
                  type="checkbox"
                  id="isFlashSale"
                  checked={productForm.isFlashSale}
                  onChange={(e) => setProductForm({ ...productForm, isFlashSale: e.target.checked })}
                  className="w-4 h-4 text-[#FF4D94] bg-black border-white/10 rounded focus:ring-0"
                />
                <label htmlFor="isFlashSale" className="text-xs text-gray-300 font-bold cursor-pointer uppercase tracking-wider">
                  Ikutkan Dalam Flash Sale Terbatas (Durasi 24 Jam)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductForm(false)}
                  className="bg-white/5 hover:bg-white/10 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-[#25D366] hover:bg-[#20ba59] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(37,211,102,0.3)]"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          )}

          {/* Products list table */}
          <div className="bg-[#141414] rounded-3xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-400">
                <thead className="bg-[#0F0F0F] text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Akun Game</th>
                    <th className="p-4">Game</th>
                    <th className="p-4">Harga</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Statistik</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-white/5 transition-all text-white">
                      <td className="p-4 flex items-center space-x-3">
                        <img
                          src={p.screenshots[0]}
                          className="w-10 h-10 rounded-lg object-cover"
                          alt={p.name}
                        />
                        <div>
                          <span className="font-bold block text-sm">{p.name}</span>
                          <span className="text-[10px] text-gray-500">Lvl {p.level} • Rank: {p.rank}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          p.game === "Free Fire" ? "bg-orange-500/10 text-orange-400" : "bg-blue-500/10 text-blue-400"
                        }`}>
                          {p.game}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-[#FF4D94]">{formatPrice(p.price)}</span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block w-2.5 h-2.5 rounded-full mr-2 ${
                          p.status === "available" ? "bg-[#25D366]" : p.status === "sold" ? "bg-red-500" : "bg-yellow-500"
                        }`}></span>
                        <span className="capitalize text-xs">{p.status === "available" ? "Tersedia" : p.status === "sold" ? "Terjual" : "Dirental"}</span>
                      </td>
                      <td className="p-4 text-[10px] text-gray-500">
                        <span>Dilihat: {p.views}x • Suka: {p.favoritesCount}x</span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleStartEditProduct(p)}
                          className="p-1.5 rounded-lg bg-white/5 text-gray-300 hover:text-blue-400 transition-all cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 rounded-lg bg-white/5 text-gray-300 hover:text-red-500 transition-all cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: INCOMING ORDERS */}
      {activeTab === "orders" && (
        <div className="space-y-6" id="tab-orders">
          <div className="bg-[#141414] rounded-3xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-400">
                <thead className="bg-[#0F0F0F] text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">ID Pesanan</th>
                    <th className="p-4">Akun Game</th>
                    <th className="p-4">Total Bayar</th>
                    <th className="p-4">Layanan</th>
                    <th className="p-4">Tanggal</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-white/5 transition-all">
                      <td className="p-4">
                        <span className="font-mono font-bold text-gray-300">{o.id}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold block">{o.productName}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded ${
                          o.game === "Free Fire" ? "bg-orange-500/10 text-orange-400" : "bg-blue-500/10 text-blue-400"
                        }`}>{o.game}</span>
                      </td>
                      <td className="p-4 font-bold text-[#FF4D94]">
                        {formatPrice(o.price)}
                      </td>
                      <td className="p-4 text-xs">
                        {o.orderType === "purchase" ? (
                          <span className="text-[#FF4D94] font-bold">Pembelian</span>
                        ) : (
                          <span className="text-purple-400 font-bold">Rental ({o.duration})</span>
                        )}
                      </td>
                      <td className="p-4 text-gray-500 text-[11px]">
                        {new Date(o.date).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          o.status === "completed" 
                            ? "bg-[#25D366]/10 text-[#25D366]" 
                            : o.status === "cancelled" 
                            ? "bg-red-500/10 text-red-500" 
                            : "bg-yellow-500/10 text-yellow-500"
                        }`}>
                          {o.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1.5">
                        {o.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleUpdateOrderStatus(o.id, "completed")}
                              className="p-1.5 rounded-lg bg-green-500/20 text-[#25D366] hover:bg-green-500/30 transition-all cursor-pointer"
                              title="Selesaikan"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleUpdateOrderStatus(o.id, "cancelled")}
                              className="p-1.5 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-all cursor-pointer"
                              title="Batalkan"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500">
                        Belum ada pesanan yang masuk ke database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: REVIEW MODERATION */}
      {activeTab === "reviews" && (
        <div className="space-y-6" id="tab-reviews">
          <div className="bg-[#141414] rounded-3xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-400">
                <thead className="bg-[#0F0F0F] text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Pembeli</th>
                    <th className="p-4">Produk</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4">Ulasan</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Moderasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white">
                  {reviews.map((r) => (
                    <tr key={r.id} className="hover:bg-white/5 transition-all">
                      <td className="p-4">
                        <span className="font-bold block">{r.buyerName}</span>
                        <span className="text-[9px] text-gray-500 uppercase">{r.type}</span>
                      </td>
                      <td className="p-4 text-gray-300">
                        {r.productName}
                      </td>
                      <td className="p-4">
                        <div className="flex text-yellow-400 font-bold">
                          {r.rating} ★
                        </div>
                      </td>
                      <td className="p-4 text-gray-400 max-w-[200px] truncate">
                        {r.comment}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                          r.hidden ? "bg-yellow-500/10 text-yellow-500" : "bg-green-500/10 text-[#25D366]"
                        }`}>
                          {r.hidden ? "DISEMBUNYIKAN" : "TAMPIL"}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1">
                        <button
                          onClick={() => handleToggleReviewHide(r.id, r.hidden || false)}
                          className="bg-white/5 hover:bg-white/10 text-xs px-2.5 py-1.5 rounded-lg transition-all"
                        >
                          {r.hidden ? "Tampilkan" : "Sembunyikan"}
                        </button>
                        <button
                          onClick={() => handleDeleteReview(r.id)}
                          className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {reviews.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        Belum ada ulasan pembeli dalam database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: WEBSITE SETTINGS */}
      {activeTab === "settings" && (
        <div className="space-y-6" id="tab-settings">
          <form onSubmit={handleSaveSettings} className="bg-[#141414] p-6 rounded-3xl border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Konfigurasi Operasional Toko</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Kontak Resmi / Link WA Admin</label>
                <input
                  type="text"
                  required
                  value={settingsForm.whatsapp}
                  onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                  placeholder="Format: https://lynk.id/amoryy1821 atau 6281234567890"
                  className="w-full bg-[#0F0F0F] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white"
                />
                <span className="text-[9px] text-gray-500">Bisa diisi tautan hub resmi Anda (contoh: https://lynk.id/amoryy1821) atau nomor telepon diawali kode negara.</span>
              </div>

              <div className="space-y-2 col-span-1 sm:col-span-2 bg-[#0F0F0F] p-4 rounded-2xl border border-white/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Metode Pembayaran (QRIS)</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.qrisUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, qrisUrl: e.target.value })}
                      placeholder="Tautan gambar QRIS"
                      className="w-full bg-[#141414] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white"
                    />
                    <span className="text-[9px] text-gray-500 block">Tautan otomatis diperbarui setelah unggah file di samping, atau Anda bisa menempelkan URL gambar secara manual.</span>
                  </div>

                  {/* Upload box */}
                  <div className="flex items-center space-x-3 shrink-0">
                    {settingsForm.qrisUrl && (
                      <div className="relative w-16 h-16 bg-[#141414] border border-white/10 rounded-xl overflow-hidden flex items-center justify-center">
                        <img 
                          src={settingsForm.qrisUrl} 
                          alt="QRIS Preview" 
                          className="max-w-full max-h-full object-contain" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleQrisFileChange}
                        disabled={isUploadingQris}
                        className="hidden"
                        id="qris-file-upload-input"
                      />
                      <label
                        htmlFor="qris-file-upload-input"
                        className={`flex flex-col items-center justify-center px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                          isUploadingQris 
                            ? "border-[#FF4D94]/30 bg-[#FF4D94]/5 text-gray-400" 
                            : "border-white/10 hover:border-[#FF4D94]/40 hover:bg-[#FF4D94]/5 text-white"
                        }`}
                      >
                        <Upload className={`w-4 h-4 mb-1 ${isUploadingQris ? "animate-bounce text-[#FF4D94]" : "text-gray-400"}`} />
                        <span className="text-[10px] font-bold uppercase">
                          {isUploadingQris ? "Mengunggah..." : "Unggah QRIS Baru"}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {qrisUploadError && (
                  <div className="flex items-center space-x-1.5 text-red-500 text-[10px] mt-1 bg-red-500/5 p-2 rounded-lg border border-red-500/10">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{qrisUploadError}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Nama Toko Website</label>
                <input
                  type="text"
                  required
                  value={settingsForm.websiteName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, websiteName: e.target.value })}
                  className="w-full bg-[#0F0F0F] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Logo URL</label>
                <input
                  type="text"
                  required
                  value={settingsForm.logoUrl}
                  onChange={(e) => setSettingsForm({ ...settingsForm, logoUrl: e.target.value })}
                  className="w-full bg-[#0F0F0F] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Hero Banner Image URL</label>
                <input
                  type="text"
                  required
                  value={settingsForm.bannerUrl}
                  onChange={(e) => setSettingsForm({ ...settingsForm, bannerUrl: e.target.value })}
                  className="w-full bg-[#0F0F0F] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-[0_0_15px_rgba(37,211,102,0.3)] transition-all cursor-pointer"
            >
              Simpan Pengaturan
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
