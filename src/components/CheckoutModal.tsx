import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Clock, CheckCircle, Smartphone, AlertCircle, Copy, Check } from "lucide-react";
import { Product, AppSettings } from "../types";
import { createOrder } from "../dbService";

interface CheckoutModalProps {
  product: Product;
  type: "purchase" | "rental";
  settings: AppSettings;
  onClose: () => void;
}

const RENTAL_DURATIONS = [
  { label: "3 Jam", value: "3h", multiplier: 0.03 },
  { label: "6 Jam", value: "6h", multiplier: 0.05 },
  { label: "12 Jam", value: "12h", multiplier: 0.08 },
  { label: "24 Jam", value: "24h", multiplier: 0.12 },
  { label: "3 Hari", value: "3d", multiplier: 0.25 },
  { label: "7 Hari", value: "7d", multiplier: 0.45 }
];

export default function CheckoutModal({
  product,
  type,
  settings,
  onClose
}: CheckoutModalProps) {
  const [selectedDuration, setSelectedDuration] = React.useState(RENTAL_DURATIONS[3]); // Default 24 Hours
  const [orderId, setOrderId] = React.useState("");
  const [timeLeft, setTimeLeft] = React.useState(15 * 60); // 15 Minutes in seconds
  const [copiedId, setCopiedId] = React.useState(false);

  // Generate unique Order ID
  React.useEffect(() => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    setOrderId(`AMORYY-${randomNum}`);
  }, []);

  // 15-minute countdown timer
  React.useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTimer = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Calculate final checkout price
  const getFinalPrice = () => {
    if (type === "purchase") {
      return product.price;
    }
    // Rental price calculated as a percentage of product value
    return Math.round(product.price * selectedDuration.multiplier);
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(value);
  };

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handlePaymentCompleted = async () => {
    const finalPrice = getFinalPrice();
    
    // Save order in Firestore for real-time tracking
    await createOrder({
      id: orderId,
      productId: product.id,
      productName: product.name,
      game: product.game,
      price: finalPrice,
      orderType: type,
      duration: type === "rental" ? selectedDuration.label : undefined,
      status: "pending"
    });

    // Create WhatsApp or custom redirect link
    if (settings.whatsapp.startsWith("http")) {
      const message = `Halo Admin AMORYY JB&RENTAL.\n\nSaya sudah melakukan pembayaran.\n\nID Pesanan: ${orderId}\nNama Produk: ${product.name}\nLayanan: ${type === "purchase" ? "Pembelian Akun" : `Rental Akun (${selectedDuration.label})`}\nHarga: ${formatPrice(finalPrice)}\n\nSaya akan mengirim bukti pembayaran.`;
      try {
        await navigator.clipboard.writeText(message);
        alert("Detail pesanan telah disalin otomatis! Silakan kirimkan bukti bayar dan tempel (paste) detail ini ke Admin.");
      } catch (err) {
        console.error("Clipboard copy failed", err);
      }
      window.open(settings.whatsapp, "_blank");
    } else {
      const waBase = `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}`;
      const message = encodeURIComponent(
        `Halo Admin AMORYY JB&RENTAL.\n\nSaya sudah melakukan pembayaran.\n\nID Pesanan: ${orderId}\nNama Produk: ${product.name}\nLayanan: ${type === "purchase" ? "Pembelian Akun" : `Rental Akun (${selectedDuration.label})`}\nHarga: ${formatPrice(finalPrice)}\n\nSaya akan mengirim bukti pembayaran.`
      );
      window.open(`${waBase}?text=${message}`, "_blank");
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" id="checkout-modal">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-[#141414] rounded-3xl border border-white/10 w-full max-w-lg overflow-hidden shadow-[0_0_50px_rgba(255,77,148,0.2)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[#FF4D94] uppercase tracking-wider text-xs bg-[#FF4D94]/10 px-2.5 py-1 rounded-md">
                {type === "purchase" ? "BELI SEKARANG" : "RENTAL AKUN"}
              </span>
            </h3>
            <p className="text-xs text-gray-400 mt-1 line-clamp-1">{product.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            id="close-checkout-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[75vh] space-y-6">
          
          {/* Duration choice (ONLY FOR RENTAL) */}
          {type === "rental" && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">
                Pilih Durasi Sewa:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {RENTAL_DURATIONS.map((dur) => (
                  <button
                    key={dur.value}
                    onClick={() => setSelectedDuration(dur)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      selectedDuration.value === dur.value
                        ? "bg-[#FF4D94] text-white border-[#FF4D94] shadow-[0_0_15px_rgba(255,77,148,0.4)]"
                        : "bg-white/5 border-white/5 text-gray-300 hover:bg-white/10 hover:border-white/10"
                    }`}
                  >
                    <div>{dur.label}</div>
                    <div className="text-[10px] font-normal text-white/70 mt-0.5">
                      {formatPrice(Math.round(product.price * dur.multiplier))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pricing Summary */}
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400 block">Total Pembayaran</span>
              <span className="text-2xl font-black text-[#FF4D94] tracking-tight">
                {formatPrice(getFinalPrice())}
              </span>
            </div>
            
            {/* Order ID display */}
            <div className="text-right">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest block">ID Pesanan</span>
              <button 
                onClick={handleCopyOrderId}
                className="flex items-center gap-1.5 bg-black/40 hover:bg-black/60 text-white border border-white/10 px-2 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer"
                title="Salin ID"
              >
                <span>{orderId}</span>
                {copiedId ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Countdown & Guide */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-2 text-yellow-500">
              <Clock className="w-5 h-5 animate-pulse" />
              <div className="text-xs">
                <span className="font-semibold block">Selesaikan Pembayaran Dalam:</span>
                <span className="font-mono text-sm font-bold text-white bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                  {formatTimer()}
                </span>
              </div>
            </div>
            
            <div className="text-right text-[10px] text-gray-500 max-w-[150px]">
              Silakan scan QRIS di bawah dan kirim bukti transaksi via WA.
            </div>
          </div>

          {/* QRIS Code Container */}
          <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border-4 border-[#FF4D94]/30 shadow-inner relative group">
            {/* Custom QRIS header logo overlay */}
            <div className="text-center mb-4">
              <span className="text-black font-extrabold text-base tracking-wider block">QRIS</span>
              <span className="text-gray-500 text-[10px] block">STANDAR PEMBAYARAN NASIONAL</span>
            </div>

            {/* Generative QRIS image */}
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=0f0f0f&data=AMORYY-${orderId}-${getFinalPrice()}`}
              alt="AMORYY QRIS Code"
              className="w-48 h-48 object-contain"
              referrerPolicy="no-referrer"
            />
            
            <div className="mt-4 text-center">
              <span className="text-black font-bold text-xs bg-gray-100 px-3 py-1.5 rounded-full inline-block">
                AMORYY JB & RENTAL MERCHANT
              </span>
            </div>
          </div>

          {/* Guidelines info */}
          <div className="flex items-start gap-2 bg-blue-500/10 border border-blue-500/20 p-3.5 rounded-xl text-blue-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-light">
              Setelah memindai QRIS dan melakukan transfer, klik tombol <strong>"Saya Sudah Bayar"</strong> di bawah. Anda akan diarahkan otomatis ke WhatsApp Admin untuk menyerahkan bukti bayar.
            </p>
          </div>

        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-white/5 bg-black/40 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-white/5 hover:bg-white/10 text-white font-semibold py-3 rounded-xl text-xs transition-all cursor-pointer"
          >
            Batal
          </button>
          
          <button
            onClick={handlePaymentCompleted}
            className="flex-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold py-3 rounded-xl text-xs shadow-[0_0_15px_rgba(37,211,102,0.4)] flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
            id="pay-confirm-btn"
          >
            <Smartphone className="w-4 h-4" />
            <span>Saya Sudah Bayar</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
