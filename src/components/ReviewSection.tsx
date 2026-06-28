import React from "react";
import { Star, ThumbsUp, CheckCircle, ShieldAlert, MessageCircle, ArrowRight, User } from "lucide-react";
import { Review, Product, AppSettings } from "../types";
import { addReview, incrementReviewLikes, deleteReview, updateReview } from "../dbService";

interface ReviewSectionProps {
  product: Product;
  reviews: Review[];
  settings: AppSettings;
  isAdminLoggedIn: boolean;
}

export default function ReviewSection({
  product,
  reviews,
  settings,
  isAdminLoggedIn
}: ReviewSectionProps) {
  const [newBuyerName, setNewBuyerName] = React.useState("");
  const [newRating, setNewRating] = React.useState(5);
  const [newComment, setNewComment] = React.useState("");
  const [newType, setNewType] = React.useState<"purchase" | "rental">("purchase");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [replyTextMap, setReplyTextMap] = React.useState<{ [key: string]: string }>({});
  const [showReplyForm, setShowReplyForm] = React.useState<string | null>(null);

  // Filter reviews for this specific product
  const productReviews = reviews.filter((r) => r.productId === product.id && !r.hidden);

  // Calculate average rating
  const averageRating = React.useMemo(() => {
    if (productReviews.length === 0) return 4.9; // Default starting high rating
    const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
    return Number((sum / productReviews.length).toFixed(1));
  }, [productReviews]);

  // Total review count (seeded + user reviews)
  const totalReviewCount = productReviews.length > 0 ? productReviews.length + 322 : 326;

  const handleLikeReview = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await incrementReviewLikes(id);
  };

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBuyerName.trim() || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await addReview({
        productId: product.id,
        productName: product.name,
        buyerName: newBuyerName,
        rating: newRating,
        comment: newComment,
        type: newType,
        verified: true // Free reviews added by buyers are marked verified for gameplay trust
      });

      // Reset form
      setNewBuyerName("");
      setNewComment("");
      setNewRating(5);
    } catch (error) {
      console.error("Error posting review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminReply = async (id: string) => {
    const reply = replyTextMap[id];
    if (!reply || !reply.trim()) return;

    await updateReview(id, { reply });
    setShowReplyForm(null);
    setReplyTextMap({ ...replyTextMap, [id]: "" });
  };

  const handleAdminToggleHide = async (id: string, currentlyHidden: boolean) => {
    await updateReview(id, { hidden: !currentlyHidden });
  };

  const handleAdminDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus ulasan ini?")) {
      await deleteReview(id);
    }
  };

  // Render stars
  const renderStars = (rating: number, size = 4) => {
    return (
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-${size} h-${size} ${
              star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8" id={`reviews-section-${product.id}`}>
      
      {/* Reviews Summary Header */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-white/5 p-6 rounded-3xl border border-white/5">
        <div className="md:col-span-4 text-center md:text-left space-y-2">
          <span className="text-sm text-gray-400 block uppercase tracking-wider font-semibold">REPUTASI AKUN</span>
          <div className="flex items-center justify-center md:justify-start space-x-3">
            <span className="text-4xl md:text-5xl font-black text-white">{averageRating.toFixed(1)}</span>
            <span className="text-xl text-gray-500 font-bold">/ 5.0</span>
          </div>
          <div className="flex justify-center md:justify-start">
            {renderStars(Math.round(averageRating), 5)}
          </div>
          <p className="text-xs text-gray-500 font-light">
            Berdasarkan <strong className="text-white">{totalReviewCount} Ulasan</strong> Pelanggan
          </p>
        </div>

        <div className="md:col-span-8 space-y-2 text-xs text-gray-400">
          <div className="flex items-center justify-between">
            <span>Bintang 5</span>
            <div className="flex-grow mx-3 bg-white/10 h-2 rounded-full overflow-hidden">
              <div className="bg-yellow-400 h-full w-[95%] rounded-full"></div>
            </div>
            <span className="font-mono text-gray-300">95%</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Bintang 4</span>
            <div className="flex-grow mx-3 bg-white/10 h-2 rounded-full overflow-hidden">
              <div className="bg-yellow-400 h-full w-[4%] rounded-full"></div>
            </div>
            <span className="font-mono text-gray-300">4%</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Bintang 3 atau kurang</span>
            <div className="flex-grow mx-3 bg-white/10 h-2 rounded-full overflow-hidden">
              <div className="bg-yellow-400 h-full w-[1%] rounded-full"></div>
            </div>
            <span className="font-mono text-gray-300">1%</span>
          </div>
        </div>
      </div>

      {/* Review list */}
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-white tracking-tight">Ulasan Pembeli ({productReviews.length})</h4>
        
        {productReviews.length === 0 ? (
          <div className="text-center p-8 bg-white/5 rounded-2xl border border-white/5 text-gray-500">
            Belum ada ulasan untuk produk ini. Jadilah yang pertama memberikan ulasan!
          </div>
        ) : (
          <div className="space-y-4" id="review-items">
            {productReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-[#141414] p-5 rounded-2xl border border-white/5 space-y-3 hover:border-white/10 transition-all"
                id={`review-item-${rev.id}`}
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
                        {new Date(rev.date).toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "long",
                          day: "numeric"
                        })}
                      </div>
                    </div>
                  </div>
                  <div>
                    {renderStars(rev.rating)}
                  </div>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed font-light pl-13">
                  {rev.comment}
                </p>

                {/* Likes button */}
                <div className="pl-13 flex items-center justify-between text-xs text-gray-500 pt-1">
                  <button
                    onClick={(e) => handleLikeReview(rev.id, e)}
                    className="flex items-center space-x-1.5 hover:text-[#FF4D94] bg-white/5 hover:bg-[#FF4D94]/10 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Membantu ({rev.likes})</span>
                  </button>

                  {isAdminLoggedIn && (
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setShowReplyForm(showReplyForm === rev.id ? null : rev.id)}
                        className="text-purple-400 hover:text-purple-300 font-medium"
                      >
                        Balas
                      </button>
                      <button
                        onClick={() => handleAdminToggleHide(rev.id, rev.hidden || false)}
                        className="text-yellow-500 hover:text-yellow-400 font-medium"
                      >
                        {rev.hidden ? "Sembunyikan" : "Tampilkan"}
                      </button>
                      <button
                        onClick={() => handleAdminDelete(rev.id)}
                        className="text-red-500 hover:text-red-400 font-medium"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </div>

                {/* Admin Reply Form */}
                {showReplyForm === rev.id && (
                  <div className="mt-3 pl-13 space-y-2">
                    <textarea
                      value={replyTextMap[rev.id] || ""}
                      onChange={(e) => setReplyTextMap({ ...replyTextMap, [rev.id]: e.target.value })}
                      placeholder="Tulis balasan admin..."
                      className="w-full bg-[#0F0F0F] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#FF4D94] transition-all"
                      rows={2}
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setShowReplyForm(null)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 text-[10px] font-bold"
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => handleAdminReply(rev.id)}
                        className="px-3 py-1.5 rounded-lg bg-[#FF4D94] text-white text-[10px] font-bold shadow-[0_0_10px_rgba(255,77,148,0.3)]"
                      >
                        Kirim Balasan
                      </button>
                    </div>
                  </div>
                )}

                {/* Admin Reply Display */}
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
        )}
      </div>

      {/* Add Review Form */}
      <form onSubmit={handlePostReview} className="bg-[#141414] p-6 rounded-3xl border border-white/5 space-y-4" id="review-form">
        <h4 className="text-base font-bold text-white tracking-tight">Kirim Ulasan Anda</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Nama Anda</label>
            <input
              type="text"
              required
              value={newBuyerName}
              onChange={(e) => setNewBuyerName(e.target.value)}
              placeholder="Contoh: Muhammad Akbar"
              className="w-full bg-[#0F0F0F] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#FF4D94] transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tipe Layanan</label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setNewType("purchase")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  newType === "purchase"
                    ? "bg-[#FF4D94]/10 border-[#FF4D94] text-[#FF4D94]"
                    : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                Pembelian Akun
              </button>
              <button
                type="button"
                onClick={() => setNewType("rental")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  newType === "rental"
                    ? "bg-purple-500/10 border-purple-500 text-purple-400"
                    : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                Rental Akun
              </button>
            </div>
          </div>
        </div>

        {/* Rating selection */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Rating Bintang</label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setNewRating(star)}
                className="p-1 cursor-pointer"
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= newRating ? "text-yellow-400 fill-yellow-400" : "text-gray-600 hover:text-yellow-500"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Comment textarea */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Komentar / Review</label>
          <textarea
            required
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Bagaimana pengalaman Anda membeli/menyewa akun di AMORYY? Fast respon? Akun sesuai spesifikasi?"
            className="w-full bg-[#0F0F0F] border border-white/10 rounded-xl p-4 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#FF4D94] transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-[#FF4D94] to-purple-600 hover:from-[#FF3380] hover:to-purple-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-[0_0_15px_rgba(255,77,148,0.3)] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
          id="submit-review-btn"
        >
          <span>Kirim Ulasan</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
