import React from "react";
import { motion } from "motion/react";
import { Heart, Share2, Eye, Award, Layers, Zap, Flame } from "lucide-react";
import { Product } from "../types";

interface ProductCardProps {
  product: Product;
  onNavigate: (view: string, id?: string) => any;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => any;
  onShare: (product: Product, e: React.MouseEvent) => any;
}

export default function ProductCard({
  product,
  onNavigate,
  isFavorite,
  onToggleFavorite,
  onShare
}: any) {
  // Flash sale countdown state
  const [timeLeft, setTimeLeft] = React.useState<string>("");

  React.useEffect(() => {
    if (!product.isFlashSale || !product.flashSaleEndDate) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(product.flashSaleEndDate!) - +new Date();
      if (difference <= 0) {
        setTimeLeft("EXPIRED");
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [product.isFlashSale, product.flashSaleEndDate]);

  // Format IDR Price
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(value);
  };

  // Status badges mapping
  const renderStatusBadge = () => {
    switch (product.status) {
      case "available":
        return (
          <span className="bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-[0_0_10px_rgba(37,211,102,0.1)]">
            <span className="w-1.5 h-1.5 bg-[#25D366] rounded-full animate-ping"></span>
            <span>🟢 TERSEDIA</span>
          </span>
        );
      case "sold":
        return (
          <span className="bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            <span>🔴 TERJUAL</span>
          </span>
        );
      case "rented":
        return (
          <span className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span>
            <span>🟡 SEDANG DIRENTAL</span>
          </span>
        );
    }
  };

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      onClick={() => onNavigate("detail", product.id)}
      className="bg-[#141414] rounded-2xl overflow-hidden border border-white/5 hover:border-[#FF4D94]/40 transition-all duration-300 shadow-xl group cursor-pointer flex flex-col justify-between"
      id={`product-card-${product.id}`}
    >
      <div className="relative overflow-hidden aspect-[4/3]">
        {/* Banner game tag */}
        <div className="absolute top-3 left-3 z-20">
          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg text-white border backdrop-blur-md ${
            product.game === "Free Fire" 
              ? "bg-gradient-to-r from-orange-500 to-red-600 border-orange-500/30" 
              : "bg-gradient-to-r from-blue-500 to-indigo-600 border-blue-500/30"
          }`}>
            {product.game}
          </span>
        </div>

        {/* Favorite & Share overlay */}
        <div className="absolute top-3 right-3 z-20 flex space-x-1.5">
          <button
            onClick={(e) => onToggleFavorite(product.id, e)}
            className="p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white hover:text-[#FF4D94] border border-white/10 hover:border-[#FF4D94]/30 transition-all cursor-pointer"
            id={`fav-btn-${product.id}`}
            title="Suka"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-[#FF4D94] text-[#FF4D94]" : ""}`} />
          </button>
          
          <button
            onClick={(e) => onShare(product, e)}
            className="p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white hover:text-blue-400 border border-white/10 hover:border-blue-500/30 transition-all cursor-pointer"
            id={`share-btn-${product.id}`}
            title="Bagikan"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Image thumbnail */}
        <img
          src={product.screenshots[0] || "https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=400&auto=format&fit=crop&q=80"}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
          id={`product-img-${product.id}`}
        />

        {/* Status overlay at bottom left */}
        <div className="absolute bottom-3 left-3 z-20">
          {renderStatusBadge()}
        </div>

        {/* Flash sale indicator */}
        {product.isFlashSale && timeLeft !== "EXPIRED" && (
          <div className="absolute bottom-3 right-3 z-20 bg-gradient-to-r from-orange-600 to-yellow-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1 shadow-[0_0_10px_rgba(234,88,12,0.5)]">
            <Flame className="w-3 h-3 text-yellow-300 animate-pulse" />
            <span>FLASH SALE {timeLeft}</span>
          </div>
        )}
      </div>

      {/* Card Details */}
      <div className="p-4 flex-grow flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-bold text-white text-base leading-snug group-hover:text-[#FF4D94] transition-colors line-clamp-1" id={`product-name-${product.id}`}>
            {product.name}
          </h3>
          
          {/* Main stats layout */}
          <div className="grid grid-cols-2 gap-2 mt-3" id={`product-stats-${product.id}`}>
            <div className="flex items-center text-xs text-gray-400 bg-white/5 px-2 py-1.5 rounded-lg">
              <Award className="w-3.5 h-3.5 text-[#FF4D94] mr-1.5 shrink-0" />
              <span className="truncate">{product.rank}</span>
            </div>
            
            <div className="flex items-center text-xs text-gray-400 bg-white/5 px-2 py-1.5 rounded-lg">
              <Layers className="w-3.5 h-3.5 text-purple-400 mr-1.5 shrink-0" />
              <span className="truncate">Lvl {product.level} • {product.skinCount} Skin</span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-white/5">
          {/* Price Layout */}
          <div className="flex items-center justify-between">
            <div>
              {product.discount > 0 && (
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs text-gray-500 line-through">
                    {formatPrice(product.oldPrice)}
                  </span>
                  <span className="text-[10px] font-bold bg-[#FF4D94]/10 text-[#FF4D94] border border-[#FF4D94]/20 px-1 py-0.2 rounded">
                    -{product.discount}%
                  </span>
                </div>
              )}
              <div className="text-lg font-black text-[#FF4D94]" id={`product-price-${product.id}`}>
                {formatPrice(product.price)}
              </div>
            </div>

            {/* Views badge */}
            <div className="flex items-center text-[11px] text-gray-500">
              <Eye className="w-3.5 h-3.5 mr-1" />
              <span>{product.views}x</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-3.5 flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate("detail", product.id);
              }}
              className="flex-grow bg-[#FF4D94]/10 hover:bg-[#FF4D94]/20 border border-[#FF4D94]/30 hover:border-[#FF4D94] text-[#FF4D94] py-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer"
              id={`details-btn-${product.id}`}
            >
              Lihat Detail
            </button>
            
            {product.status === "available" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate("detail", product.id); // Go to detail to choose buy or rental
                }}
                className="bg-gradient-to-r from-[#FF4D94] to-purple-600 hover:from-[#FF3380] hover:to-purple-700 text-white px-3 py-2 rounded-xl text-xs font-extrabold transition-all shadow-[0_0_15px_rgba(255,77,148,0.3)] cursor-pointer"
                id={`buy-now-btn-${product.id}`}
              >
                Beli / Sewa
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
