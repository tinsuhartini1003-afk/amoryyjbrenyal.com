import React from "react";
import { Gamepad2, Heart, ShieldCheck, Mail, Phone, ExternalLink } from "lucide-react";
import { AppSettings } from "../types";

interface FooterProps {
  onNavigate: (view: string, id?: string) => void;
  settings: AppSettings;
}

export default function Footer({ onNavigate, settings }: FooterProps) {
  return (
    <footer className="bg-[#0A0A0A] border-t border-[#FF4D94]/10 text-gray-400 text-xs sm:text-sm py-12" id="footer-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8 pb-8 border-b border-white/5">
          {/* Logo Column */}
          <div className="md:col-span-5 space-y-4">
            <div 
              onClick={() => onNavigate("home")}
              className="flex items-center space-x-2 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF4D94] to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(255,77,148,0.5)] transform group-hover:rotate-12 transition-transform duration-300">
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-wider text-white">
                  AMORYY
                </span>
                <span className="font-semibold text-xs block text-[#FF4D94] tracking-widest -mt-1">
                  JB & RENTAL
                </span>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 font-light leading-relaxed max-w-sm">
              Satu-satunya marketplace & jasa sewa akun Free Fire & Mobile Legends terpercaya dengan garansi anti hackback lifetime, transaksi super kilat, amanah, dan terjamin 100%.
            </p>

            <div className="flex items-center space-x-3 text-xs text-gray-500">
              <ShieldCheck className="w-4 h-4 text-[#25D366]" />
              <span>GARANSI ANTI HACKBACK SEUMUR HIDUP</span>
            </div>
          </div>

          {/* Quick links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Kategori Game</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => onNavigate("catalog")} 
                  className="hover:text-[#FF4D94] transition-colors cursor-pointer"
                >
                  Katalog Free Fire (FF)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate("catalog")} 
                  className="hover:text-[#FF4D94] transition-colors cursor-pointer"
                >
                  Katalog Mobile Legends (MLBB)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate("sell")} 
                  className="hover:text-[#FF4D94] transition-colors cursor-pointer"
                >
                  Jual Akun Gaming
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Kontak Admin</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[#25D366]" />
                <a 
                  href={settings.whatsapp.startsWith("http") ? settings.whatsapp : `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="hover:text-[#25D366] transition-colors font-semibold text-white"
                >
                  {settings.whatsapp.startsWith("http") 
                    ? `${settings.whatsapp.replace("https://", "").replace("http://", "")} (Hubungi Kami)` 
                    : `+${settings.whatsapp} (WhatsApp Resmi)`}
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-[#FF4D94]" />
                <span>support@amoryy-jbrental.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] sm:text-xs text-gray-600 font-light">
          <div>
            &copy; {new Date().getFullYear()} <strong>{settings.websiteName}</strong>. All rights reserved. Developed with Premium Gaming Layout.
          </div>
          
          <div className="flex space-x-4">
            <span className="hover:text-white transition-colors cursor-pointer">Syarat & Ketentuan</span>
            <span className="hover:text-white transition-colors cursor-pointer">Kebijakan Privasi</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
