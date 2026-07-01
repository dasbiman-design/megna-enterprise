import React, { useState } from "react";
import { X, Star, ShoppingCart, ShieldCheck, Truck, RotateCcw, Heart, Video, Eye, MessageSquare, Plus } from "lucide-react";
import { Product, api } from "../api-client";

interface ProductDetailModalProps {
  product: Product;
  currency: "INR" | "BDT";
  onClose: () => void;
  onAddToCart: (p: Product, size: string, color: string, qty: number) => void;
  isWishlisted: boolean;
  onToggleWishlist: () => void | Promise<void>;
  relatedProducts: Product[];
  onSelectRelated: (p: Product) => void;
}

export default function ProductDetailModal({
  product,
  currency,
  onClose,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
  relatedProducts,
  onSelectRelated,
}: ProductDetailModalProps) {
  const isBDT = currency === "BDT";
  const [selectedImage, setSelectedImage] = useState(product.images[0] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600");
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || "Standard");
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || "Default");
  const [quantity, setQuantity] = useState(1);
  const [showVideo, setShowVideo] = useState(false);

  // Review Form state
  const [reviews, setReviews] = useState(product.reviews || []);
  const [newReviewName, setNewReviewName] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const price = isBDT ? product.priceBDT : product.priceINR;
  const discountedPrice = Math.round(price * (1 - product.discountPercent / 100));

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewComment.trim()) return;

    try {
      const addedReview = await api.addReview(product.id, newReviewName, newReviewRating, newReviewComment);
      setReviews((prev) => [...prev, addedReview]);
      setNewReviewName("");
      setNewReviewComment("");
      setNewReviewRating(5);
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div id="product-detail-overlay" className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#fdfdfd] text-[#1a1a1a] w-full max-w-5xl rounded-none border border-neutral-200 shadow-2xl relative flex flex-col md:flex-row overflow-hidden max-h-[90vh] md:max-h-[85vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/90 border border-neutral-100 rounded-full hover:bg-black hover:text-white hover:border-black transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Product Gallery & Showcase */}
        <div className="w-full md:w-1/2 p-6 md:p-8 bg-neutral-50 flex flex-col justify-between border-r border-neutral-100 overflow-y-auto">
          <div className="space-y-4">
            {/* Main Visual Display */}
            <div className="aspect-square w-full relative bg-white border border-neutral-100 p-4 flex items-center justify-center">
              {showVideo && product.videoUrl ? (
                <video src={product.videoUrl} controls autoPlay className="w-full h-full object-contain" />
              ) : (
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full object-contain max-h-[350px] transition-transform duration-350 hover:scale-110 cursor-zoom-in"
                  referrerPolicy="no-referrer"
                />
              )}

              {product.videoUrl && (
                <button
                  onClick={() => setShowVideo(!showVideo)}
                  className="absolute bottom-4 right-4 bg-black text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md hover:bg-orange-600 transition-colors"
                >
                  <Video className="w-3.5 h-3.5" />
                  {showVideo ? "Show Image" : "Product Video"}
                </button>
              )}
            </div>

            {/* Thumbnail Gallery (With Unsplash Multi-Images) */}
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {product.images.map((imgUrl, imgIdx) => (
                <button
                  key={imgIdx}
                  onClick={() => {
                    setSelectedImage(imgUrl);
                    setShowVideo(false);
                  }}
                  className={`w-16 h-16 border bg-white p-1 shrink-0 ${
                    selectedImage === imgUrl && !showVideo ? "border-black ring-1 ring-black" : "border-neutral-200"
                  }`}
                >
                  <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Specifications list */}
          <div className="mt-6 pt-6 border-t border-neutral-200 space-y-3">
            <h5 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Guarantees</h5>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-white border border-neutral-100 flex flex-col items-center">
                <ShieldCheck className="w-4 h-4 text-orange-600 mb-1" />
                <span className="text-[9px] font-bold uppercase">100% Genuine</span>
              </div>
              <div className="p-3 bg-white border border-neutral-100 flex flex-col items-center">
                <Truck className="w-4 h-4 text-orange-600 mb-1" />
                <span className="text-[9px] font-bold uppercase">Express Cargo</span>
              </div>
              <div className="p-3 bg-white border border-neutral-100 flex flex-col items-center">
                <RotateCcw className="w-4 h-4 text-orange-600 mb-1" />
                <span className="text-[9px] font-bold uppercase">Easy Exchange</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Product Details & Interaction */}
        <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto space-y-6">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                {product.brand} • {product.category}
              </span>
              <div className="flex items-center gap-1 bg-neutral-100 px-2 py-0.5 text-xs font-bold text-neutral-600">
                <Star className="w-3.5 h-3.5 fill-yellow-400 stroke-yellow-400" />
                <span>{product.ratings} ({reviews.length} reviews)</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 text-xs font-mono text-neutral-400">
              <span>SKU: {product.sku}</span>
              <span>•</span>
              <span>Barcode: {product.barcode}</span>
            </div>
          </div>

          {/* Price Container */}
          <div className="p-4 bg-neutral-50 border border-neutral-100 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">Price</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-neutral-900">
                  {isBDT ? "৳" : "₹"}{discountedPrice.toLocaleString()}
                </span>
                {product.discountPercent > 0 && (
                  <span className="text-sm text-neutral-400 line-through">
                    {isBDT ? "৳" : "₹"}{price.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
            {product.discountPercent > 0 && (
              <span className="bg-orange-600 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1">
                Save {product.discountPercent}%
              </span>
            )}
          </div>

          <div className="text-xs text-neutral-600 leading-relaxed font-light">
            {product.description}
          </div>

          {/* Size & Color Selections */}
          <div className="grid grid-cols-2 gap-4">
            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  Select Size
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-3 py-1.5 text-xs font-bold border transition-colors ${
                        selectedSize === sz
                          ? "bg-black text-white border-black"
                          : "bg-white border-neutral-200 text-neutral-700 hover:border-black"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  Select Color
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {product.colors.map((clr) => (
                    <button
                      key={clr}
                      onClick={() => setSelectedColor(clr)}
                      className={`px-3 py-1.5 text-xs font-bold border transition-colors ${
                        selectedColor === clr
                          ? "bg-black text-white border-black"
                          : "bg-white border-neutral-200 text-neutral-700 hover:border-black"
                      }`}
                    >
                      {clr}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stock Alerts & Count */}
          <div className="flex items-center justify-between text-xs pt-2">
            <span className="text-neutral-500">Inventory Status:</span>
            {product.stock === 0 ? (
              <span className="text-red-600 font-bold uppercase tracking-wider">Sold Out</span>
            ) : product.stock >= 900000 ? (
              <span className="text-green-600 font-bold uppercase tracking-wider">Unlimited Stock Available</span>
            ) : product.stock <= 10 ? (
              <span className="text-orange-600 font-bold uppercase tracking-wider">Only {product.stock} items left!</span>
            ) : (
              <span className="text-green-600 font-bold uppercase tracking-wider">{product.stock} items in stock</span>
            )}
          </div>

          {/* Add Actions Strip */}
          <div className="flex items-center gap-3">
            {product.stock > 0 && (
              <div className="flex items-center border border-neutral-300">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-sm font-bold bg-neutral-100 border-r border-neutral-300 hover:bg-neutral-200"
                >
                  -
                </button>
                <span className="px-4 py-2 text-xs font-bold font-mono">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-2 text-sm font-bold bg-neutral-100 border-l border-neutral-300 hover:bg-neutral-200"
                >
                  +
                </button>
              </div>
            )}

            <button
              onClick={() => {
                onAddToCart(product, selectedSize, selectedColor, quantity);
                setQuantity(1);
              }}
              disabled={product.stock === 0}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 ${
                product.stock === 0
                  ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                  : "bg-black text-white hover:bg-orange-600 hover:scale-105 hover:tracking-[0.2em]"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              {product.stock === 0 ? "Out of Stock" : "Add To Shopping Bag"}
            </button>

            <button
              onClick={onToggleWishlist}
              className={`p-3 border transition-colors ${
                isWishlisted ? "bg-red-50 border-red-200 text-red-500" : "bg-white border-neutral-300 text-neutral-400 hover:text-black hover:border-black"
              }`}
            >
              <Heart className="w-4 h-4 fill-current" />
            </button>
          </div>

          {/* Related / Frequently bought together suggestions */}
          {relatedProducts.length > 0 && (
            <div className="pt-4 border-t border-neutral-200">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">
                Frequently Styled Together
              </h4>
              <div className="grid grid-cols-3 gap-2.5">
                {relatedProducts.map((rel) => {
                  const relPrice = isBDT ? rel.priceBDT : rel.priceINR;
                  const relDisc = Math.round(relPrice * (1 - rel.discountPercent / 100));
                  return (
                    <div
                      key={rel.id}
                      onClick={() => onSelectRelated(rel)}
                      className="border border-neutral-100 p-2 bg-neutral-50 hover:border-black cursor-pointer transition-colors flex flex-col justify-between"
                    >
                      <img src={rel.images[0]} alt={rel.name} className="w-full h-12 object-contain" referrerPolicy="no-referrer" />
                      <div>
                        <div className="text-[9px] font-bold line-clamp-1 mt-1">{rel.name}</div>
                        <div className="text-[9px] text-neutral-600 font-mono">
                          {isBDT ? "৳" : "₹"}{relDisc.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reviews Stream & Add Review form */}
          <div className="pt-6 border-t border-neutral-200 space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> Customer Reviews ({reviews.length})
            </h4>

            {reviews.length === 0 ? (
              <p className="text-xs text-neutral-400 italic font-light">
                No reviews found. Be the first to express opinion of this fine footwear or clothing silhouette!
              </p>
            ) : (
              <div className="space-y-3.5 max-h-[160px] overflow-y-auto pr-2">
                {reviews.map((rev) => (
                  <div key={rev.id} className="border-b border-neutral-100 pb-2.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-neutral-800">{rev.userName}</span>
                      <span className="text-[8px] text-neutral-400 font-mono">{rev.date}</span>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, rIdx) => (
                        <Star
                          key={rIdx}
                          className={`w-3 h-3 ${
                            rIdx < rev.rating ? "fill-yellow-400 stroke-yellow-400" : "fill-neutral-200 stroke-neutral-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[11px] text-neutral-600 font-light">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Review Form */}
            <form onSubmit={handleAddReview} className="p-3 bg-neutral-50 border border-neutral-100 space-y-2.5">
              <h5 className="text-[10px] font-bold uppercase tracking-wider text-neutral-700">Add Your Experience</h5>
              {reviewSuccess && (
                <div className="text-[10px] text-green-600 font-bold">Review submitted successfully!</div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Your Name"
                  required
                  value={newReviewName}
                  onChange={(e) => setNewReviewName(e.target.value)}
                  className="bg-white border border-neutral-200 rounded-none px-2.5 py-1 text-xs focus:outline-none focus:border-black w-full"
                />
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-neutral-400 uppercase">Rating:</span>
                  <select
                    value={newReviewRating}
                    onChange={(e) => setNewReviewRating(Number(e.target.value))}
                    className="bg-white border border-neutral-200 rounded-none px-1 py-1 text-xs focus:outline-none"
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>
                        {r} Star{r > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <textarea
                placeholder="Share your style details or fitting comfort feedback..."
                required
                rows={2}
                value={newReviewComment}
                onChange={(e) => setNewReviewComment(e.target.value)}
                className="bg-white border border-neutral-200 rounded-none px-2.5 py-1 text-xs focus:outline-none focus:border-black w-full"
              ></textarea>
              <button
                type="submit"
                className="w-full bg-neutral-900 hover:bg-black text-white text-[10px] font-bold uppercase tracking-wider py-1.5 transition-colors"
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
