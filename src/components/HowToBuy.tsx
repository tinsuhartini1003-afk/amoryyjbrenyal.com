import React from "react";
import { Gamepad2, ShoppingCart, QrCode, MessageSquare, KeyRound, ArrowRight } from "lucide-react";

export default function HowToBuy() {
  const purchaseSteps = [
    {
      icon: <Gamepad2 className="w-6 h-6 text-[#FF4D94]" />,
      title: "1. Cari & Pilih Akun",
      description: "Telusuri katalog akun Free Fire atau Mobile Legends. Pilih spesifikasi skin, rank, dan hero impian Anda."
    },
    {
      icon: <ShoppingCart className="w-6 h-6 text-purple-400" />,
      title: "2. Checkout Instan",
      description: "Klik 'Beli Sekarang' atau 'Sewa Akun' dan tentukan durasi sewa yang sesuai dengan kebutuhan main Anda."
    },
    {
      icon: <QrCode className="w-6 h-6 text-[#25D366]" />,
      title: "3. Scan QRIS Pembayaran",
      description: "Scan QRIS otomatis yang muncul di layar menggunakan e-wallet (DANA, OVO, GoPay) atau m-Banking Anda."
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-[#FF8C00]" />,
      title: "4. Konfirmasi WhatsApp",
      description: "Tekan tombol 'Saya Sudah Bayar' untuk terhubung langsung ke WhatsApp Admin dengan format data pesanan otomatis."
    },
    {
      icon: <KeyRound className="w-6 h-6 text-blue-400" />,
      title: "5. Terima Akun & Amankan",
      description: "Admin memverifikasi bukti bayar Anda dan langsung mengirimkan kredensial akun game. Siap mabar!"
    }
  ];

  return (
    <div className="space-y-12 py-8" id="howto-buy-section">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-[#FF4D94] uppercase tracking-widest bg-[#FF4D94]/10 px-3 py-1 rounded-full border border-[#FF4D94]/20 inline-block">
          Alur Transaksi Mudah
        </span>
        <h2 className="text-3xl font-black text-white tracking-tight">
          Cara Beli & Sewa Akun di AMORYY
        </h2>
        <p className="text-sm text-gray-400 max-w-xl mx-auto">
          Sistem kami dirancang instan dan transparan tanpa perlu pendaftaran akun rumit. Transaksi aman, legal, dan bergaransi penuh.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {purchaseSteps.map((step, idx) => (
          <div
            key={idx}
            className="bg-[#141414] p-5 rounded-2xl border border-white/5 relative flex flex-col justify-between group hover:border-[#FF4D94]/30 transition-all duration-300"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-[#FF4D94]/10 group-hover:border-[#FF4D94]/30 transition-all shadow-inner">
                {step.icon}
              </div>
              
              <div className="space-y-1.5">
                <h3 className="font-extrabold text-sm text-white group-hover:text-[#FF4D94] transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs text-gray-400 font-light leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>

            {/* Step indicators / connectors */}
            {idx < 4 && (
              <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                <ArrowRight className="w-5 h-5 text-gray-700 group-hover:text-[#FF4D94]/50 transition-colors" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
