import React from "react";
import { motion } from "motion/react";
import { MessageSquare, Coins, CheckCircle, Smartphone, Award, Sparkles } from "lucide-react";
import { AppSettings } from "../types";

interface SellAccountProps {
  settings: AppSettings;
}

export default function SellAccount({ settings }: SellAccountProps) {
  const handleSellRedirect = async () => {
    if (settings.whatsapp.startsWith("http")) {
      const message = `Halo Admin AMORYY JB&RENTAL.\n\nSaya ingin menjual akun game saya.\n\nGame: [Free Fire / Mobile Legends]\nRank Akun: \nLevel Akun: \nJumlah Skin: \nEvo Gun / Skin Legend: \nMetode Login: \n\nSaya akan mengirimkan beberapa screenshot detail akun saya untuk di-taksir harganya.`;
      try {
        await navigator.clipboard.writeText(message);
        alert("Template rincian akun telah disalin otomatis! Silakan tempel (paste) rincian ini saat mengirim pesan ke Admin.");
      } catch (err) {
        console.error("Clipboard copy failed", err);
      }
      window.open(settings.whatsapp, "_blank");
    } else {
      const waBase = `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}`;
      const message = encodeURIComponent(
        `Halo Admin AMORYY JB&RENTAL.\n\nSaya ingin menjual akun game saya.\n\nGame: [Free Fire / Mobile Legends]\nRank Akun: \nLevel Akun: \nJumlah Skin: \nEvo Gun / Skin Legend: \nMetode Login: \n\nSaya akan mengirimkan beberapa screenshot detail akun saya untuk di-taksir harganya.`
      );
      window.open(`${waBase}?text=${message}`, "_blank");
    }
  };

  const sellPoints = [
    {
      icon: <Coins className="w-5 h-5 text-green-400" />,
      title: "Taksiran Harga Tertinggi",
      description: "Admin kami akan menilai spesifikasi akun Anda dan memberikan penawaran harga terbaik & paling kompetitif di pasar."
    },
    {
      icon: <Smartphone className="w-5 h-5 text-blue-400" />,
      title: "Pembayaran Instan & Kilat",
      description: "Setelah harga disepakati dan data login berhasil divalidate, uang lsg dicairkan lewat DANA, OVO, ShopeePay, atau Bank Transfer."
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-[#FF4D94]" />,
      title: "Proses 100% Aman & Terpercaya",
      description: "Sistem verifikasi data diawasi ketat. Reputasi AMORYY terjamin, bebas dari penipuan jual-beli akun."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6" id="sell-account-view">
      <div className="text-center space-y-3 mb-10">
        <span className="text-xs font-bold text-[#FF4D94] uppercase tracking-widest bg-[#FF4D94]/10 px-3 py-1 rounded-full border border-[#FF4D94]/20 inline-block">
          Dapatkan Cash Instan
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Punya Akun Sultan? Jual ke AMORYY Aja!
        </h1>
        <p className="text-sm text-gray-400 max-w-xl mx-auto">
          Kami menampung akun game Free Fire & Mobile Legends spesifikasi semi-sultan hingga sultan dewa dengan proses verifikasi instan dan pembayaran aman.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left column - Info features */}
        <div className="md:col-span-6 space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-[#FF4D94]" />
              <span>Mengapa Jual Akun di AMORYY?</span>
            </h2>
            <p className="text-xs text-gray-400 font-light leading-relaxed">
              Kami berkomitmen menyediakan platform penampungan akun game paling transparan, amanah, dan terjamin aman di Indonesia.
            </p>
          </div>

          <div className="space-y-4">
            {sellPoints.map((pt, idx) => (
              <div key={idx} className="flex gap-3.5 bg-[#141414] p-4 rounded-xl border border-white/5">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                  {pt.icon}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">{pt.title}</h3>
                  <p className="text-xs text-gray-400 font-light mt-0.5 leading-relaxed">{pt.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column - CTA Card */}
        <div className="md:col-span-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-tr from-[#141414] to-[#1a1a1a] rounded-3xl p-6 border border-[#FF4D94]/30 shadow-[0_0_40px_rgba(255,77,148,0.15)] text-center space-y-6"
          >
            <div className="mx-auto w-16 h-16 bg-[#FF4D94]/10 rounded-2xl flex items-center justify-center border border-[#FF4D94]/30 text-[#FF4D94] shadow-inner">
              <Award className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-white">Ajukan Penjualan Akun</h3>
              <p className="text-xs text-gray-400 leading-relaxed max-w-sm mx-auto font-light">
                Tekan tombol di bawah untuk langsung terhubung dengan tim taksir harga AMORYY di WhatsApp. Mohon sertakan game, rank, level, serta screenshot bukti kepemilikan akun.
              </p>
            </div>

            <button
              onClick={handleSellRedirect}
              className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold py-4 rounded-2xl shadow-[0_0_20px_rgba(37,211,102,0.3)] transition-all cursor-pointer flex items-center justify-center space-x-2.5 text-sm sm:text-base"
              id="sell-whatsapp-btn"
            >
              <MessageSquare className="w-5 h-5 fill-white text-[#25D366]" />
              <span>Jual Akun ke AMORYY JB & RENTAL</span>
            </button>

            <div className="text-[10px] text-gray-500 font-mono">
              *Syarat & Ketentuan: Akun harus legal, data lengkap/clean bind, dan bebas sanksi/ban.
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
