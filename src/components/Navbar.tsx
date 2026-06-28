import React from "react";
import { Gamepad2, Heart, User, PlusCircle, ShoppingBag, Menu, X, Star } from "lucide-react";
import { AppSettings } from "../types";

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, productId?: string) => void;
  favoritesCount: number;
  settings: AppSettings;
  isAdminLoggedIn: boolean;
  onLogout: () => void;
}

export default function Navbar({
  currentView,
  onNavigate,
  favoritesCount,
  settings,
  isAdminLoggedIn,
  onLogout
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { label: "Beranda", view: "home" },
    { label: "Katalog", view: "catalog" },
    { label: "Jual Akun", view: "sell" },
    { label: "Testimoni", view: "reviews" }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#0F0F0F]/90 backdrop-blur-md border-b border-[#FF4D94]/20 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div 
            onClick={() => onNavigate("home")} 
            className="flex items-center space-x-2 cursor-pointer group"
            id="nav-logo"
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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => onNavigate(item.view)}
                className={`text-sm font-medium transition-all hover:text-[#FF4D94] cursor-pointer ${
                  currentView === item.view ? "text-[#FF4D94] font-bold" : "text-gray-300"
                }`}
                id={`nav-item-${item.view}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => onNavigate("favorites")}
              className="relative p-2 text-gray-300 hover:text-[#FF4D94] hover:bg-white/5 rounded-full transition-all cursor-pointer"
              title="Favorit Saya"
              id="nav-btn-fav"
            >
              <Heart className={`w-5 h-5 ${favoritesCount > 0 ? "fill-[#FF4D94] text-[#FF4D94]" : ""}`} />
              {favoritesCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-[#FF4D94] rounded-full transform translate-x-1/3 -translate-y-1/3 shadow-[0_0_8px_rgba(255,77,148,0.8)] animate-pulse">
                  {favoritesCount}
                </span>
              )}
            </button>

            {isAdminLoggedIn ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onNavigate("admin")}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-[0_0_10px_rgba(147,51,234,0.5)] cursor-pointer flex items-center space-x-1"
                  id="nav-btn-admin-dashboard"
                >
                  <User className="w-4 h-4" />
                  <span>Admin Panel</span>
                </button>
                <button
                  onClick={onLogout}
                  className="border border-red-500/30 hover:border-red-500 text-red-500 hover:bg-red-500/10 px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer"
                  id="nav-btn-logout"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate("admin-login")}
                className="bg-[#FF4D94]/10 hover:bg-[#FF4D94]/20 border border-[#FF4D94]/30 hover:border-[#FF4D94] text-[#FF4D94] px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-[0_0_15px_rgba(255,77,148,0.1)] cursor-pointer flex items-center space-x-1"
                id="nav-btn-login"
              >
                <User className="w-4 h-4" />
                <span>Admin</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => onNavigate("favorites")}
              className="relative p-2 text-gray-300 hover:text-[#FF4D94] hover:bg-white/5 rounded-full transition-all cursor-pointer"
              id="nav-mobile-btn-fav"
            >
              <Heart className={`w-5 h-5 ${favoritesCount > 0 ? "fill-[#FF4D94] text-[#FF4D94]" : ""}`} />
              {favoritesCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-[#FF4D94] rounded-full transform translate-x-1/3 -translate-y-1/3 shadow-[0_0_8px_rgba(255,77,148,0.8)]">
                  {favoritesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-[#FF4D94] p-2 rounded-lg cursor-pointer"
              id="nav-btn-mobile-menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#0F0F0F] border-b border-[#FF4D94]/20 px-2 pt-2 pb-4 space-y-1 sm:px-3">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => {
                onNavigate(item.view);
                setIsMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                currentView === item.view ? "bg-[#FF4D94]/10 text-[#FF4D94]" : "text-gray-300 hover:bg-white/5"
              }`}
              id={`nav-mobile-item-${item.view}`}
            >
              {item.label}
            </button>
          ))}
          
          <div className="pt-4 pb-2 border-t border-gray-800">
            {isAdminLoggedIn ? (
              <div className="space-y-2 px-3">
                <button
                  onClick={() => {
                    onNavigate("admin");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all text-center flex items-center justify-center space-x-2"
                  id="nav-mobile-btn-admin"
                >
                  <User className="w-4 h-4" />
                  <span>Admin Panel</span>
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full border border-red-500/30 hover:border-red-500 text-red-500 hover:bg-red-500/10 px-3 py-2 rounded-xl text-sm font-medium transition-all text-center"
                  id="nav-mobile-btn-logout"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="px-3">
                <button
                  onClick={() => {
                    onNavigate("admin-login");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-[#FF4D94]/10 hover:bg-[#FF4D94]/20 border border-[#FF4D94]/30 text-[#FF4D94] px-4 py-2 rounded-xl text-sm font-medium transition-all text-center flex items-center justify-center space-x-2"
                  id="nav-mobile-btn-login"
                >
                  <User className="w-4 h-4" />
                  <span>Admin Login</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
