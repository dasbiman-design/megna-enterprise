import React from "react";
import { Heart, RefreshCw, ShoppingCart, Eye, Star } from "lucide-react";
import { Product } from "../api-client";

interface ProductCardProps {
  key?: any;
  product: Product;
  currency: "INR" | "BDT";
  isWishlisted: boolean;
  onToggleWishlist: () => void | Promise<void>;
  isCompared: boolean;
  onToggleCompare: () => void;
  onSelect: () => void;
  onAddToCart: (p: Product, size: string, color: string, qty?: number) => void;
}

export default function ProductCard({
  product,
  currency,
  isWishlisted,
  onToggleWishlist,
  isCompared,
  onToggleCompare,
  onSelect,
  onAddToCart,
}: ProductCardProps) {
  const isBDT = currency === "BDT";
  const price = isBDT ? product.priceBDT : product.priceINR;
  const discountedPrice = Math.round(price * (1 - product.discountPercent / 100));

  return (
    <div id={`prod-card-${product.id}`} className="group border border-gray-100 hover:border-gray-900 bg-white transition-all duration-300 flex flex-col h-full relative">
      {/* Badges Overlay */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {product.discountPercent > 0 && (
          <span className="bg-orange-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-none">
            -{product.discountPercent}% OFF
          </span>
        )}
        {product.featured && (
          <span className="bg-black text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-none">
            Luxury Elite
          </span>
        )}
        {product.newArrival && (
          <span className="bg-green-600 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-none">
            New Silhouette
          </span>
        )}
      </div>

      {/* Hover Action Strip */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist();
          }}
          className={`p-2 rounded-full border shadow-sm transition-colors ${
            isWishlisted ? "bg-red-550 border-red-250 text-red-500 bg-red-50" : "bg-white border-gray-200 text-gray-500 hover:text-black"
          }`}
          title="Wishlist"
        >
          <Heart className="w-3.5 h-3.5 fill-current" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleCompare();
          }}
          className={`p-2 rounded-full border shadow-sm transition-colors ${
            isCompared ? "bg-orange-50 border-orange-200 text-orange-600" : "bg-white border-gray-200 text-gray-500 hover:text-black"
          }`}
          title="Compare Product"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Visual Box */}
      <div className="aspect-square w-full overflow-hidden bg-gray-50 flex items-center justify-center relative p-4" onClick={onSelect}>
        <img
          src={product.images[0] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"}
          alt={product.name}
          className="object-contain w-full h-full max-h-[180px] group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="px-3 py-1.5 bg-black text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 hover:bg-orange-600 transition-colors"
          >
            <Eye className="w-3 h-3" /> Quick View
          </button>
        </div>
      </div>

      {/* Metadata */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold tracking-widest text-gray-400 uppercase">
            <span>{product.category} • {product.subCategory}</span>
            <span className="flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 fill-yellow-400 stroke-yellow-400" />
              <span className="text-gray-600 text-[9px]">{product.ratings}</span>
            </span>
          </div>
          <h4 className="font-bold text-xs tracking-tight line-clamp-1 group-hover:text-orange-600 transition-colors text-gray-800" onClick={onSelect}>
            {product.name}
          </h4>
          <p className="text-[11px] text-gray-500 font-light line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Pricing & Add Trigger */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-gray-900">
                {isBDT ? "৳" : "₹"}{discountedPrice.toLocaleString()}
              </span>
              {product.discountPercent > 0 && (
                <span className="text-[10px] text-gray-400 line-through">
                  {isBDT ? "৳" : "₹"}{price.toLocaleString()}
                </span>
              )}
            </div>
            <span className="text-[8px] text-gray-400 font-mono">SKU: {product.sku}</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product, product.sizes[0] || "Standard", product.colors[0] || "Default");
            }}
            disabled={product.stock === 0}
            className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all duration-300 ${
              product.stock === 0
                ? "bg-gray-150 text-gray-400 cursor-not-allowed"
                : "border border-black text-black hover:bg-black hover:text-white hover:scale-105 hover:tracking-widest"
            }`}
          >
            <ShoppingCart className="w-3 h-3" />
            {product.stock === 0 ? "OOS" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
