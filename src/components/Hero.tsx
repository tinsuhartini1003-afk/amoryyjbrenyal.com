import React from "react";
import { motion } from "motion/react";
import { Gamepad2, ShieldCheck, Zap, Heart } from "lucide-react";
import { AppSettings } from "../types";

interface HeroProps {
  onNavigate: (view: string, id?: string) => void;
  settings: AppSettings;
}

export default function Hero({ onNavigate, settings }: HeroProps) {
  return (
    <div className="relative overflow-hidden bg-[#0F0F0F] py-16 sm:py-24 border-b border-[#FF4D94]/10">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FF4D94]/10 rounded-full filter blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-purple-900/20 rounded-full filter blur-[100px] animate-pulse delay-75"></div>

      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center space-x-2 bg-[#FF4D94]/10 border border-[#FF4D94]/30 px-3 py-1.5 rounded-full text-[#FF4D94] text-xs font-semibold tracking-wider uppercase shadow-[0_0_15px_rgba(255,77,148,0.2)]"
              id="hero-badge"
            >
              <Zap className="w-3.5 h-3.5 animate-bounce" />
              <span>MARKETPLACE AKUN GAME SULTAN & REPUTASI TERBAIK</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-none"
              id="hero-title"
            >
              Sewa & Beli Akun <br />
              <span className="bg-gradient-to-r from-[#FF4D94] via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,77,148,0.3)]">
                Game Idamanmu
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed"
              id="hero-subtitle"
            >
              Jual beli dan rental akun **Free Fire** & **Mobile Legends** dengan kualitas premium, bergaransi lifetime, dan aman 100%. Transaksi instan langsung via WhatsApp dengan QRIS otomatis!
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
              id="hero-actions"
            >
              <button
                onClick={() => onNavigate("catalog")}
                className="w-full sm:w-auto bg-[#FF4D94] hover:bg-[#FF3380] text-white font-bold px-8 py-4 rounded-2xl shadow-[0_0_25px_rgba(255,77,148,0.5)] hover:shadow-[0_0_35px_rgba(255,77,148,0.7)] transition-all cursor-pointer flex items-center justify-center space-x-2 text-base"
                id="hero-btn-catalog"
              >
                <Gamepad2 className="w-5 h-5" />
                <span>Jelajahi Katalog</span>
              </button>
              
              <button
                onClick={() => onNavigate("sell")}
                className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#FF4D94]/50 text-white font-semibold px-8 py-4 rounded-2xl transition-all cursor-pointer flex items-center justify-center space-x-2 text-base"
                id="hero-btn-sell"
              >
                <span>Jual Akun Kamu</span>
                <span className="text-[#FF4D94]">→</span>
              </button>
            </motion.div>

            {/* Micro badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5 max-w-md mx-auto lg:mx-0"
              id="hero-stats"
            >
              <div className="flex items-center space-x-2 text-left">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">100% Aman</div>
                  <div className="text-xs text-gray-500">Anti Hackback</div>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-left">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Instan</div>
                  <div className="text-xs text-gray-500">Kirim Otomatis</div>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-left">
                <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Trusted</div>
                  <div className="text-xs text-gray-500">1000+ Ulasan</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Hero Right Banner Image / Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 relative"
            id="hero-banner-container"
          >
            <div className="relative rounded-3xl overflow-hidden border border-[#FF4D94]/30 shadow-[0_0_50px_rgba(255,77,148,0.25)] group">
              {/* Overlay styling */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-transparent to-transparent z-10"></div>
              
              <img
                src={settings.bannerUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80"}
                alt="Amoryy Game Banner"
                className="w-full h-80 sm:h-96 object-cover object-center group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
                id="hero-banner-img"
              />

              {/* Game Labels overlay */}
              <div className="absolute bottom-6 left-6 right-6 z-20 flex items-center justify-between">
                <div className="flex items-center space-x-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                  <img 
                    src="https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=50&auto=format&fit=crop&q=80" 
                    className="w-5 h-5 rounded-full object-cover" 
                    alt="FF"
                  />
                  <span className="text-xs font-semibold text-white">Free Fire</span>
                </div>

                <div className="flex items-center space-x-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                  <img 
                    src="https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=50&auto=format&fit=crop&q=80" 
                    className="w-5 h-5 rounded-full object-cover" 
                    alt="MLBB"
                  />
                  <span className="text-xs font-semibold text-white">Mobile Legends</span>
                </div>
              </div>
            </div>

            {/* Small floating element */}
            <div className="absolute -bottom-5 -right-5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.5)] transform rotate-6 animate-bounce">
              PROMO AKUN BARU!
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
