import React, { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  ShoppingBag,
  Heart,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  User,
  Trash2,
  Calendar,
  Phone,
  MessageSquare,
  Compass,
  ArrowUp,
  SlidersHorizontal,
  Info,
  X,
  CreditCard,
  CheckCircle,
  HelpCircle,
  ChevronUp,
  Sun,
  Moon
} from "lucide-react";

import { api, Product, Coupon, SystemSettings } from "./api-client";
import ProductCard from "./components/ProductCard";
import ProductDetailModal from "./components/ProductDetailModal";
import AiStylistDrawer from "./components/AiStylistDrawer";
import CustomerDashboard from "./components/CustomerDashboard";
import AdminPanel from "./components/AdminPanel";
import BlogView from "./components/BlogView";
import AboutView from "./components/AboutView";
import ContactView from "./components/ContactView";

export default function App() {
  // Global States
  const [currency, setCurrency] = useState<"INR" | "BDT">("INR");
  const [lang, setLang] = useState<"EN" | "BN" | "HI">("EN");
  const [view, setView] = useState<"home" | "shop" | "wishlist" | "compare" | "dashboard" | "admin" | "checkout" | "blog" | "about" | "contact">("home");
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Authenticated User Info
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("megna_token"));

  // API Catalogs
  const [products, setProducts] = useState<Product[]>([]);
  
  // Dynamic categories aggregated from the product dataset
  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  }, [products]);

  // Helper to translate/get human readable category names dynamically
  const getCategoryLabel = (cat: string) => {
    if (lang === "BN") {
      if (cat === "Footwear") return "ফুটওয়্যার";
      if (cat === "Fashion") return "পোশাক ও ফ্যাশন";
      if (cat === "Accessories") return "এক্সেসরিজ";
      return cat;
    }
    if (lang === "HI") {
      if (cat === "Footwear") return "जूते";
      if (cat === "Fashion") return "कपड़े";
      if (cat === "Accessories") return "एक्सेसरीज़";
      return cat;
    }
    return cat;
  };

  // Helper to dynamically get representative image for a category
  const getCategoryRepresentativeImage = (cat: string) => {
    const prod = products.find((p) => p.category === cat);
    if (prod && prod.images && prod.images[0]) {
      return prod.images[0];
    }
    if (cat === "Footwear") {
      return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&auto=format&fit=crop&q=80";
    }
    if (cat === "Fashion") {
      return "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=150&auto=format&fit=crop&q=80";
    }
    if (cat === "Accessories") {
      return "https://images.unsplash.com/photo-1541643600914-78b084683601?w=150&auto=format&fit=crop&q=80";
    }
    return "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=150&auto=format&fit=crop&q=80";
  };
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [loading, setLoading] = useState(true);

  // Selected Product Detail Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filter conditions
  const [searchQuery, setSearchQuery] = useState("");
  const isExactMatch = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    if (!trimmed) return false;
    return products.some((p) => 
      p.sku.toLowerCase() === trimmed || 
      p.barcode.toLowerCase() === trimmed ||
      p.id.toLowerCase() === trimmed
    );
  }, [searchQuery, products]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("popularity");
  const [priceRange, setPriceRange] = useState<number>(60000);

  // Shopping Bag State
  const [cart, setCart] = useState<{ product: Product; size: string; color: string; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");

  // Wishlist State (In-Memory synchronized if not logged in)
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Compare State (Max 3)
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);

  // AI Stylist State
  const [isStylistOpen, setIsStylistOpen] = useState(false);

  // Back to Top button
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Checkout forms
  const [checkoutName, setCheckoutName] = useState("");
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [checkoutAddress, setCheckoutAddress] = useState("");
  const [checkoutCity, setCheckoutCity] = useState("");
  const [checkoutState, setCheckoutState] = useState("");
  const [checkoutZip, setCheckoutZip] = useState("");
  const [checkoutCountry, setCheckoutCountry] = useState<"India" | "Bangladesh">("India");
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState("");
  const [checkoutNotes, setCheckoutNotes] = useState("");
  const [checkoutOrderSuccess, setCheckoutOrderSuccess] = useState<any | null>(null);

  // WhatsApp Box popup
  const [showWhatsAppBox, setShowWhatsAppBox] = useState(false);
  const [waMessage, setWaMessage] = useState("");

  // Sync session on mount
  useEffect(() => {
    bootstrapApp();
    window.addEventListener("scroll", handleScrollCheck);
    return () => window.removeEventListener("scroll", handleScrollCheck);
  }, [token]);

  const handleScrollCheck = () => {
    setShowScrollTop(window.scrollY > 400);
  };

  const bootstrapApp = async () => {
    setLoading(true);
    try {
      // Load products
      const list = await api.getProducts();
      setProducts(list);

      // Load global store settings
      const sets = await api.getSettings();
      setSettings(sets);
      if (sets) {
        setAnnouncement(sets.announcement);
      }

      // Load session
      if (token) {
        try {
          const res = await api.getMe();
          setUser(res.user);
          setWishlist(res.user.wishlist || []);
        } catch (e) {
          // Token expired / invalid
          localStorage.removeItem("megna_token");
          setToken(null);
        }
      }
    } catch (err) {
      console.error("Critical bootstrap error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Synchronize Wishlist callback
  const handleToggleWishlist = async (productId: string) => {
    if (!user) {
      // Local Guest Wishlist toggle
      setWishlist((prev) =>
        prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
      );
      return;
    }
    try {
      const res = await api.toggleWishlist(productId);
      setWishlist(res.wishlist || []);
      // update local user state object
      setUser({ ...user, wishlist: res.wishlist || [] });
    } catch (err) {
      console.error(err);
    }
  };

  // Compare triggers
  const handleToggleCompare = (product: Product) => {
    setCompareProducts((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= 3) {
        alert("You can compare up to 3 footwear or clothing items at a time.");
        return prev;
      }
      return [...prev, product];
    });
  };

  // Cart operations
  const handleAddToCart = (product: Product, size: string, color: string, qty: number = 1) => {
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.product.id === product.id && item.size === size && item.color === color);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx].quantity = Math.min(product.stock, copy[idx].quantity + qty);
        return copy;
      }
      return [...prev, { product, size, color, quantity: qty }];
    });
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (productId: string, size: string, color: string) => {
    setCart((prev) => prev.filter((item) => !(item.product.id === productId && item.size === size && item.color === color)));
  };

  const handleUpdateCartQty = (productId: string, size: string, color: string, qty: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.size === size && item.color === color
          ? { ...item, quantity: Math.max(1, Math.min(item.product.stock, qty)) }
          : item
      )
    );
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    setAppliedCoupon(null);
    if (!couponCode.trim()) return;

    try {
      const coupons: Coupon[] = await api.getCoupons();
      const code = couponCode.trim().toUpperCase();
      const match = coupons.find((c) => c.code === code && c.isActive);

      if (!match) {
        setCouponError("Invalid or expired coupon code.");
        return;
      }

      // Check minimum spends
      const isBDT = currency === "BDT";
      const totalAmount = cart.reduce((sum, item) => {
        const itemPrice = isBDT ? item.product.priceBDT : item.product.priceINR;
        const discPrice = itemPrice * (1 - item.product.discountPercent / 100);
        return sum + discPrice * item.quantity;
      }, 0);

      const minSpend = isBDT ? match.minSpendBDT : match.minSpendINR;
      if (totalAmount < minSpend) {
        setCouponError(`Minimum spend of ${isBDT ? "৳" : "₹"}${minSpend} is required for this coupon.`);
        return;
      }

      setAppliedCoupon(match);
      setCouponError("");
    } catch (err) {
      setCouponError("Unable to verify coupon codes. Please try again.");
    }
  };

  // Calculate final checkout financials
  const calculateCartTotals = () => {
    const isBDT = currency === "BDT";
    const subtotal = cart.reduce((sum, item) => {
      const itemPrice = isBDT ? item.product.priceBDT : item.product.priceINR;
      const discPrice = itemPrice * (1 - item.product.discountPercent / 100);
      return sum + discPrice * item.quantity;
    }, 0);

    let discountAmount = 0;
    if (appliedCoupon) {
      discountAmount = Math.round(subtotal * (appliedCoupon.discountPercent / 100));
    }

    const discountedSubtotal = subtotal - discountAmount;
    const taxPercent = settings ? settings.taxPercent : 5;
    const tax = Math.round(discountedSubtotal * (taxPercent / 100));

    // Free delivery thresholds
    const inrThreshold = 1500;
    const bdtThreshold = 1800;
    let shippingCharge = 0;
    if (settings) {
      const threshold = isBDT ? bdtThreshold : inrThreshold;
      if (discountedSubtotal < threshold) {
        shippingCharge = isBDT ? settings.shippingChargeBDT : settings.shippingChargeINR;
      }
    }

    const total = discountedSubtotal + tax + shippingCharge;

    return {
      subtotal,
      discountAmount,
      tax,
      shippingCharge,
      total,
    };
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const totals = calculateCartTotals();
    const orderData = {
      customerName: checkoutName,
      customerEmail: checkoutEmail,
      customerPhone: checkoutPhone,
      shippingAddress: {
        addressLine1: checkoutAddress,
        city: checkoutCity,
        state: checkoutState,
        postalCode: checkoutZip,
        country: checkoutCountry,
      },
      items: cart.map((item) => {
        const itemPrice = currency === "BDT" ? item.product.priceBDT : item.product.priceINR;
        const finalPrice = Math.round(itemPrice * (1 - item.product.discountPercent / 100));
        return {
          productId: item.product.id,
          productName: item.product.name,
          sku: item.product.sku,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          price: finalPrice,
          image: item.product.images[0],
        };
      }),
      currency,
      subtotal: totals.subtotal,
      discountAmount: totals.discountAmount,
      couponCodeUsed: appliedCoupon ? appliedCoupon.code : undefined,
      shippingCharge: totals.shippingCharge,
      tax: totals.tax,
      total: totals.total,
      paymentMethod: checkoutPaymentMethod || "Cash on Delivery",
      orderNotes: checkoutNotes,
    };

    try {
      const order = await api.placeOrder(orderData);
      setCheckoutOrderSuccess(order);
      setCart([]);
      setAppliedCoupon(null);
      // Reset fields
      setCheckoutName("");
      setCheckoutEmail("");
      setCheckoutPhone("");
      setCheckoutAddress("");
      setCheckoutCity("");
      setCheckoutState("");
      setCheckoutZip("");
      setCheckoutNotes("");
    } catch (err: any) {
      alert(err.message || "Failed to finalize order.");
    }
  };

  // Launch WhatsApp link directly
  const handleWhatsAppSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waMessage.trim()) return;
    const text = encodeURIComponent(waMessage);
    const url = `https://wa.me/918250568500?text=${text}`;
    window.open(url, "_blank");
    setWaMessage("");
    setShowWhatsAppBox(false);
  };

  // Specific search handler that checks product SKU strings directly, ensuring users can find items using their unique identifier
  const handleHeaderSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (view !== "shop" && view !== "home") {
      setView("shop");
    }

    const trimmed = value.trim().toLowerCase();
    if (trimmed) {
      // Direct SKU string check
      const exactSkuMatch = products.some((p) => p.sku.toLowerCase() === trimmed);
      const partialSkuMatch = products.some((p) => p.sku.toLowerCase().includes(trimmed));

      if (exactSkuMatch || partialSkuMatch) {
        // Clear conflicting filters to ensure SKU matches are not filtered out
        setSelectedCategory("");
        setSelectedSubCategory("");
        setSelectedBrand("");
        setSelectedColor("");
        setSelectedSize("");
      }
    }
  };

  // Filtered products list for rendering
  const getFilteredProducts = () => {
    return products.filter((p) => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Category
      if (selectedCategory && p.category !== selectedCategory) return false;

      // Sub Category
      if (selectedSubCategory && p.subCategory !== selectedSubCategory) return false;

      // Brand
      if (selectedBrand && p.brand !== selectedBrand) return false;

      // Colors
      if (selectedColor && !p.colors.includes(selectedColor)) return false;

      // Sizes
      if (selectedSize && !p.sizes.includes(selectedSize) && !p.sizes.includes("Free Size")) return false;

      // Price Limits
      const pPrice = currency === "BDT" ? p.priceBDT : p.priceINR;
      const discounted = Math.round(pPrice * (1 - p.discountPercent / 100));
      if (discounted > priceRange) return false;

      return true;
    }).sort((a, b) => {
      const priceA = currency === "BDT" ? a.priceBDT : a.priceINR;
      const priceB = currency === "BDT" ? b.priceBDT : b.priceINR;
      const discA = Math.round(priceA * (1 - a.discountPercent / 100));
      const discB = Math.round(priceB * (1 - b.discountPercent / 100));

      if (sortOption === "price-low") return discA - discB;
      if (sortOption === "price-high") return discB - discA;
      if (sortOption === "newest") return b.id.localeCompare(a.id);
      return b.ratings - a.ratings; // popularity by rating
    });
  };

  const totals = calculateCartTotals();

  // Multi-Language content maps for high fidelity
  const contentMap = {
    EN: {
      tagline: "Summer Season 2026",
      headline: "Step into ",
      prestige: "Prestige.",
      description: "Discover the intersection of high-fashion and comfort. Curated footwear for India & Bangladesh.",
      explore: "Explore Catalog",
      shopNow: "Shop the Silhouette",
      cartTitle: "Shopping Bag",
      checkout: "Proceed to Checkout",
      searchPlaceholder: "Search luxury sneakers, sarees, watches...",
    },
    BN: {
      tagline: "গ্রীষ্মকালীন কালেকশন ২০২৬",
      headline: "ঐতিহ্যের সাথে ",
      prestige: "অভিজাত্য।",
      description: "উচ্চ ফ্যাশন এবং আরামদায়ক ডিজাইনের এক মেলবন্ধন। ভারত ও বাংলাদেশের জন্য বিশেষভাবে কিউরেট করা।",
      explore: "ক্যাটালগ দেখুন",
      shopNow: "কিনুন",
      cartTitle: "শপিং ব্যাগ",
      checkout: "চেকআউট করুন",
      searchPlaceholder: "হিল, শাড়ি, স্নিকার্স খুঁজুন...",
    },
    HI: {
      tagline: "ग्रीष्मकालीन सीजन 2026",
      headline: "प्रतिष्ठा के साथ ",
      prestige: "कदम बढ़ाएं।",
      description: "हाई-फैशन और आराम का सही संगम। भारत और बांग्लादेश के लिए चुनिंदा परिधान और जूते।",
      explore: "कैटलॉग देखें",
      shopNow: "अभी खरीदें",
      cartTitle: "शॉपिंग बैग",
      checkout: "चेकआउट करें",
      searchPlaceholder: "स्नीकर्स, साड़ी, घड़ियाँ खोजें...",
    }
  };

  const translation = contentMap[lang];

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-neutral-950 text-neutral-100" : "bg-[#FDFDFD] text-[#1A1A1A]"} flex flex-col font-sans transition-colors duration-200`}>
      
      {/* 1. Global Announcement Ticker */}
      {announcement && (
        <div className="bg-orange-600 text-white text-center py-2 px-4 text-[11px] font-bold uppercase tracking-widest overflow-hidden whitespace-nowrap z-50">
          <div className="inline-block animate-marquee">{announcement}</div>
        </div>
      )}

      {/* 2. Sticky Header & Navigation */}
      <nav className={`h-16 px-6 md:px-12 border-b ${isDarkMode ? "bg-neutral-900/90 border-neutral-800" : "bg-white/85 border-gray-100"} flex items-center justify-between sticky top-0 backdrop-blur-md z-40 transition-colors`}>
        <div className="flex items-center gap-10">
          {/* Logo */}
          <span onClick={() => setView("home")} className="text-2xl font-black tracking-tighter uppercase cursor-pointer select-none">
            Megna<span className="text-orange-600">.</span>
          </span>

          {/* Nav Categories */}
          <div className="flex gap-5 md:gap-8 text-[10px] md:text-[11px] font-bold tracking-[0.1em] md:tracking-[0.2em] uppercase text-gray-500 overflow-x-auto scrollbar-none max-w-[180px] sm:max-w-xs md:max-w-none">
            <button 
              onClick={() => setView("home")} 
              className={`hover:text-black transition-colors shrink-0 ${view === "home" ? "text-orange-600 font-extrabold" : ""}`}
            >
              Home
            </button>
            <button 
              onClick={() => { setView("shop"); setSelectedCategory(""); setSelectedSubCategory(""); }} 
              className={`hover:text-black transition-colors shrink-0 ${view === "shop" ? "text-orange-600 font-extrabold" : ""}`}
            >
              Shop
            </button>
            <button 
              onClick={() => setView("blog")} 
              className={`hover:text-black transition-colors shrink-0 ${view === "blog" ? "text-orange-600 font-extrabold" : ""}`}
            >
              Blog
            </button>
            <button 
              onClick={() => setView("about")} 
              className={`hover:text-black transition-colors shrink-0 ${view === "about" ? "text-orange-600 font-extrabold" : ""}`}
            >
              About
            </button>
            <button 
              onClick={() => setView("contact")} 
              className={`hover:text-black transition-colors shrink-0 ${view === "contact" ? "text-orange-600 font-extrabold" : ""}`}
            >
              Contact
            </button>
          </div>
        </div>

        {/* Prominent Header Search Bar (Flipkart & Amazon style) */}
        <div className="hidden md:flex items-center relative w-64 lg:w-96 mx-4" id="header-search-bar-wrapper">
          <input
            type="text"
            placeholder={translation.searchPlaceholder}
            value={searchQuery}
            onChange={handleHeaderSearch}
            className={`w-full bg-gray-50 dark:bg-neutral-800 text-xs pl-3 py-2 border rounded-full focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all ${
              isExactMatch ? "pr-[135px]" : "pr-10"
            } ${
              isDarkMode ? "border-neutral-700 text-white" : "border-gray-200 text-gray-900"
            }`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {isExactMatch && (
              <span className="text-[9px] font-black uppercase tracking-wider bg-orange-600 dark:bg-orange-500 text-white px-2 py-0.5 rounded-sm shrink-0 whitespace-nowrap animate-pulse shadow-xs font-mono">
                SKU MATCH FOUND
              </span>
            )}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-gray-400 hover:text-black dark:hover:text-white text-xs font-bold px-1"
              >
                Clear
              </button>
            )}
            <Search className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Global Control Widgets */}
        <div className="flex items-center gap-4 md:gap-6">
          
          {/* Theme switcher */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors text-gray-500"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-orange-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Localization & Currency pill */}
          <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full border ${isDarkMode ? "bg-neutral-950 border-neutral-800 text-neutral-300" : "bg-gray-50 border-gray-150"} text-[10px] font-bold`}>
            {/* Lang Dropdown */}
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as any)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="EN" className="text-black">EN</option>
              <option value="BN" className="text-black">BN (বাংলা)</option>
              <option value="HI" className="text-black">HI (हिंदी)</option>
            </select>
            <div className="w-px h-3 bg-gray-300"></div>
            {/* Currency toggle */}
            <button
              onClick={() => setCurrency(currency === "INR" ? "BDT" : "INR")}
              className="hover:text-orange-600 transition-colors"
            >
              {currency}
            </button>
          </div>

          {/* Secondary tools */}
          <div className="flex items-center gap-3.5 md:gap-5">
            {/* Wishlist Icon */}
            <button onClick={() => setView("wishlist")} className="relative text-gray-600 dark:text-gray-300 hover:text-black">
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Compare icon */}
            <button onClick={() => setView("compare")} className="relative text-gray-600 dark:text-gray-300 hover:text-black" title="Compare Products">
              <RefreshCw className="w-5 h-5" />
              {compareProducts.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-orange-600 text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {compareProducts.length}
                </span>
              )}
            </button>

            {/* Shopping cart icon */}
            <button onClick={() => setIsCartOpen(true)} className="relative text-gray-600 dark:text-gray-300 hover:text-black">
              <ShoppingBag className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-black text-white dark:bg-white dark:text-black text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center font-mono">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>

            {/* User Profile dashboard button */}
            <button
              onClick={() => setView(user?.role === "admin" ? "admin" : "dashboard")}
              className={`flex items-center gap-1.5 px-3 py-1.5 border border-black dark:border-white text-[9px] font-bold uppercase tracking-wider ${
                view === "dashboard" || view === "admin" ? "bg-black text-white" : ""
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{user ? user.username : "Log In"}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 3. Main Views router */}
      <main className="flex-grow px-6 md:px-12 py-8 max-w-7xl mx-auto w-full">
        {loading ? (
          /* Loading Skeletal State */
          <div className="space-y-8 py-12">
            <div className="h-64 bg-gray-100 animate-pulse w-full"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-48 bg-gray-100 animate-pulse w-full"></div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Flipkart & Amazon Style Horizontal Circular Category Bar with Mobile Search */}
            {(view === "home" || view === "shop") && (
              <div className="space-y-4 mb-8" id="flipkart-amazon-search-and-categories-container">
                {/* Mobile Search Bar (Only visible on small screens/mobile) */}
                <div className="block md:hidden relative w-full" id="mobile-search-bar-wrapper">
                  <input
                    type="text"
                    placeholder={translation.searchPlaceholder}
                    value={searchQuery}
                    onChange={handleHeaderSearch}
                    className={`w-full bg-gray-50 dark:bg-neutral-800 text-xs pl-4 py-3 border rounded-full focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all ${
                      isExactMatch ? "pr-[135px]" : "pr-10"
                    } ${
                      isDarkMode ? "border-neutral-700 text-white" : "border-gray-250 text-gray-900"
                    }`}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {isExactMatch && (
                      <span className="text-[9px] font-black uppercase tracking-wider bg-orange-600 dark:bg-orange-500 text-white px-2 py-0.5 rounded-sm shrink-0 whitespace-nowrap animate-pulse shadow-xs font-mono">
                        SKU MATCH FOUND
                      </span>
                    )}
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="text-gray-400 hover:text-black dark:hover:text-white text-xs font-bold px-1"
                      >
                        Clear
                      </button>
                    )}
                    <Search className="w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Categories Bar */}
                <div 
                  className="bg-white dark:bg-neutral-900 border border-gray-150 dark:border-neutral-800 p-4 shadow-sm rounded-none overflow-x-auto scrollbar-none flex gap-8 md:gap-16 justify-start md:justify-center items-center" 
                  id="flipkart-amazon-category-nav-bar"
                >
                  {/* 1. All Collections */}
                  <button
                    id="nav-cat-all"
                    onClick={() => {
                      setView("shop");
                      setSelectedCategory("");
                      setSelectedSubCategory("");
                    }}
                    className="flex flex-col items-center text-center gap-1.5 group shrink-0 focus:outline-none"
                  >
                    <div className={`relative w-16 h-16 rounded-full overflow-hidden border-2 transition-all duration-300 flex items-center justify-center bg-gray-50 dark:bg-neutral-950 ${
                      view === "shop" && !selectedCategory
                        ? "border-orange-500 scale-105 shadow-md ring-2 ring-orange-500/20"
                        : "border-gray-200 dark:border-neutral-700 group-hover:border-orange-400 group-hover:scale-105"
                    }`}>
                      <img
                        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=150&auto=format&fit=crop&q=80"
                        alt="All Products"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex flex-col items-center">
                      <span className={`text-[10px] md:text-xs font-black uppercase tracking-wider transition-colors ${
                        view === "shop" && !selectedCategory ? "text-orange-600" : "text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white"
                      }`}>
                        {lang === "BN" ? "সব কালেকশন" : lang === "HI" ? "सभी उत्पाद" : "All Collections"}
                      </span>
                      <span className="text-[8px] text-gray-400 font-mono uppercase tracking-tighter">
                        ({products.length} Items)
                      </span>
                    </div>
                  </button>

                  {/* Dynamic Categories */}
                  {uniqueCategories.map((cat) => {
                    const isHot = cat === "Footwear";
                    const isExclusive = cat === "Fashion";
                    const isLuxury = cat === "Accessories";
                    return (
                      <button
                        key={cat}
                        id={`nav-cat-${cat.toLowerCase()}`}
                        onClick={() => {
                          setView("shop");
                          setSelectedCategory(cat);
                          setSelectedSubCategory("");
                        }}
                        className="flex flex-col items-center text-center gap-1.5 group shrink-0 focus:outline-none relative"
                      >
                        {isHot && (
                          <span className="absolute -top-1.5 -right-1 z-20 bg-red-600 text-white font-black text-[7px] px-1 py-0.5 rounded uppercase tracking-widest scale-90 animate-bounce">
                            Hot
                          </span>
                        )}
                        {isExclusive && (
                          <span className="absolute -top-1.5 -right-3 z-20 bg-orange-600 text-white font-black text-[7px] px-1 py-0.5 rounded uppercase tracking-widest scale-90">
                            Saree
                          </span>
                        )}
                        {isLuxury && (
                          <span className="absolute -top-1.5 -right-2 z-20 bg-neutral-950 text-white font-black text-[7px] px-1 py-0.5 rounded uppercase tracking-widest scale-90">
                            Luxury
                          </span>
                        )}
                        <div className={`relative w-16 h-16 rounded-full overflow-hidden border-2 transition-all duration-300 flex items-center justify-center bg-gray-50 dark:bg-neutral-950 ${
                          selectedCategory === cat
                            ? "border-orange-500 scale-105 shadow-md ring-2 ring-orange-500/20"
                            : "border-gray-200 dark:border-neutral-700 group-hover:border-orange-400 group-hover:scale-105"
                        }`}>
                          <img
                            src={getCategoryRepresentativeImage(cat)}
                            alt={cat}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex flex-col items-center">
                          <span className={`text-[10px] md:text-xs font-black uppercase tracking-wider transition-colors ${
                            selectedCategory === cat ? "text-orange-600" : "text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white"
                          }`}>
                            {getCategoryLabel(cat)}
                          </span>
                          <span className="text-[8px] text-gray-400 font-mono uppercase tracking-tighter">
                            ({products.filter((p) => p.category === cat).length} Items)
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* View A: Home view */}
            {view === "home" && (
              <div className="space-y-16">
                {/* Visual Hero Split Banner */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 transition-colors">
                  {/* Left branding pillar */}
                  <div className="lg:col-span-5 bg-[#121212] p-8 md:p-12 text-white flex flex-col justify-between">
                    <div className="space-y-4">
                      <span className="text-orange-500 text-[10px] font-bold tracking-[0.3em] uppercase block">
                        {translation.tagline}
                      </span>
                      <h1 className="text-5xl md:text-7xl font-light leading-[0.9] tracking-tighter italic">
                        {translation.headline} <br />
                        <span className="font-black not-italic text-white">{translation.prestige}</span>
                      </h1>
                      <p className="text-neutral-400 text-xs md:text-sm max-w-xs pt-4 font-light leading-relaxed">
                        {translation.description}
                      </p>
                    </div>

                    <div className="space-y-6 pt-12 lg:pt-0">
                      <button
                        onClick={() => { setView("shop"); setSelectedCategory(""); setSelectedSubCategory(""); }}
                        className="px-10 py-4 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-orange-500 hover:text-white hover:scale-105 hover:tracking-[0.2em] transition-all duration-300"
                      >
                        {translation.explore}
                      </button>
                      
                      <div className="flex gap-8 border-t border-neutral-800 pt-8">
                        <div>
                          <div className="text-2xl font-bold italic font-mono text-white">12+</div>
                          <div className="text-[10px] text-neutral-500 uppercase tracking-tighter">Premium Silhouettes</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold italic font-mono text-white">India-BD</div>
                          <div className="text-[10px] text-neutral-500 uppercase tracking-tighter">Fast Express Cargo</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right visual feed */}
                  <div className="lg:col-span-7 grid grid-rows-2 h-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 border-b border-gray-100 dark:border-neutral-800">
                      {/* Interactive block */}
                      <div
                        onClick={() => { setView("shop"); setSelectedCategory("Footwear"); setSelectedSubCategory(""); }}
                        className="relative group overflow-hidden bg-neutral-100 cursor-pointer border-r border-gray-150 dark:border-neutral-800 aspect-video md:aspect-auto"
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
                        <img
                          src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"
                          alt="Elite Sneakers"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 flex flex-col justify-end p-8 z-20">
                          <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Premium Footwear</span>
                          <h3 className="text-2xl text-white font-black tracking-tight">Elite Sneakers</h3>
                        </div>
                      </div>

                      {/* Flash countdown banner */}
                      <div className="relative overflow-hidden bg-white dark:bg-neutral-900 p-8 flex flex-col justify-center">
                        <span className="inline-block px-2 py-1 bg-black text-white text-[9px] font-bold w-fit mb-4 uppercase tracking-widest">
                          Monsoon Flash Sale
                        </span>
                        <h4 className="text-3xl font-light tracking-tight text-gray-950 dark:text-white">
                          Up to <span className="font-black">25% OFF</span>
                        </h4>
                        <p className="text-gray-400 text-xs mt-2">Luxury Sarees & Leather Loafers</p>
                        <div className="mt-6 flex gap-3 font-mono">
                          {[
                            { value: "08", label: "Hrs" },
                            { value: "42", label: "Min" },
                            { value: "19", label: "Sec" }
                          ].map((time) => (
                            <div key={time.label} className="w-10 h-10 border border-black dark:border-white flex flex-col items-center justify-center">
                              <span className="text-xs font-bold">{time.value}</span>
                              <span className="text-[7px] uppercase opacity-50">{time.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom three cards featuring top catalogs */}
                    <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-neutral-800">
                      {products.slice(0, 3).map((p) => {
                        const price = currency === "BDT" ? p.priceBDT : p.priceINR;
                        const final = Math.round(price * (1 - p.discountPercent / 100));
                        return (
                          <div
                            key={p.id}
                            onClick={() => setSelectedProduct(p)}
                            className="p-4 md:p-6 flex flex-col group cursor-pointer hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors"
                          >
                            <div className="flex-1 mb-4 flex items-center justify-center max-h-[80px]">
                              <img src={p.images[0]} alt="p" className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                            </div>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block line-clamp-1">
                              {p.category} • {p.subCategory}
                            </span>
                            <div className="font-bold text-[11px] md:text-xs text-gray-800 dark:text-white line-clamp-1 mt-0.5">
                              {p.name}
                            </div>
                            <span className="text-[10px] md:text-xs font-mono font-medium text-orange-600 mt-1">
                              {currency === "BDT" ? "৳" : "₹"}{final.toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>

                {/* Featured Products Showcase Header */}
                <section className="space-y-6">
                  <div className="flex justify-between items-baseline border-b border-gray-100 dark:border-neutral-800 pb-3">
                    <div>
                      <span className="text-orange-600 text-[10px] font-bold tracking-[0.3em] uppercase block">
                        Curated Highlights
                      </span>
                      <h3 className="text-xl font-bold tracking-tight">Luxury Trending Silhouettes</h3>
                    </div>
                    <button
                      onClick={() => { setView("shop"); setSelectedCategory(""); setSelectedSubCategory(""); }}
                      className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-black hover:underline"
                    >
                      View All Products ({products.length})
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.slice(0, 4).map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        currency={currency}
                        isWishlisted={wishlist.includes(product.id)}
                        onToggleWishlist={() => handleToggleWishlist(product.id)}
                        isCompared={compareProducts.some((cp) => cp.id === product.id)}
                        onToggleCompare={() => handleToggleCompare(product)}
                        onSelect={() => setSelectedProduct(product)}
                        onAddToCart={handleAddToCart}
                      />
                    ))}
                  </div>
                </section>

                {/* Brand Story / Heritage Block */}
                <section className="p-8 md:p-12 border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <span className="text-orange-600 text-[10px] font-bold tracking-[0.3em] uppercase block">
                      OUR CRAFTSMANSHIP
                    </span>
                    <h3 className="text-3xl font-light tracking-tight text-gray-950 dark:text-white leading-tight">
                      Bespoke curation for the <br />
                      <span className="font-black">Modern Pioneer.</span>
                    </h3>
                    <p className="text-xs md:text-sm text-gray-500 font-light leading-relaxed">
                      At **MEGNA ENTERPRISE**, we hand-select products that reflect heritage elegance and precision modern utility. From our hand-woven Dhakai Jamdani Saree, sourced from local loom legends, to our Megna Pro Elite Athletic Sneakers built for daily endurance, every item is quality validated.
                    </p>
                  </div>
                  <div className="aspect-video bg-neutral-100 relative border border-neutral-200 overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/10 z-10"></div>
                    <img
                      src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600"
                      alt="Story"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 z-20 flex items-center justify-center">
                      <div className="bg-white/95 px-5 py-3 text-center border shadow-md">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-orange-600 block">ESTABLISHED</span>
                        <span className="text-sm font-black text-black">MEGNA LUXURY</span>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* View B: Shop View with dynamic filtering */}
            {view === "shop" && (() => {
              const shopTranslations = {
                EN: {
                  shopBannerTitle: "MEGNA LUXURY COLLECTIVE",
                  shopBannerSub: "Experience elite Indian sarees, high-performance athletic footwear, and spectacular solitaire diamonds.",
                  allCategories: "All Collections",
                  footwear: "Footwear",
                  fashion: "Apparel & Dress",
                  accessories: "Luxury Accessories",
                  filterByPrice: "Filter by Price",
                  filterByColor: "Filter by Color",
                  filterByBrand: "Filter by Brand",
                  filterBySize: "Filter by Size",
                  subCategories: "Sub-Categories",
                  showingProducts: "Showing {count} of {total} masterpieces",
                  resetFilters: "Reset Filters",
                  noProducts: "No matching masterpieces found",
                  adjustFilters: "Try adjusting your price range, search query or filters to find your perfect match."
                },
                BN: {
                  shopBannerTitle: "মেঘনা লাক্সারি কালেক্টিভ",
                  shopBannerSub: "অভিজাত ভারতীয় শাড়ি, হাই-পারফরম্যান্স স্পোর্টস জুতো এবং মনমুগ্ধকর ডায়মন্ড জুয়েলারি কালেকশন।",
                  allCategories: "সব কালেকশন",
                  footwear: "ফুটওয়্যার / জুতো",
                  fashion: "পোশাক ও ফ্যাশন",
                  accessories: "লাক্সারি এক্সেসরিজ",
                  filterByPrice: "মূল্য ফিল্টার",
                  filterByColor: "রঙ ফিল্টার",
                  filterByBrand: "ব্র্যান্ড ফিল্টার",
                  filterBySize: "সাইজ ফিল্টার",
                  subCategories: "সাব-ক্যাটাগরি",
                  showingProducts: "{total} টির মধ্যে {count} টি প্রোডাক্ট দেখানো হচ্ছে",
                  resetFilters: "রিসেট ফিল্টার",
                  noProducts: "কোনো পণ্য পাওয়া যায়নি",
                  adjustFilters: "আপনার অনুসন্ধান বা ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।"
                },
                HI: {
                  shopBannerTitle: "मेघना लक्ज़री कलेक्टिव",
                  shopBannerSub: "शानदार भारतीय साड़ियां, उच्च प्रदर्शन वाले एथलेटिक जूते और मनमोहक हीरे के गहने।",
                  allCategories: "सभी कलेक्शंस",
                  footwear: "जूते और फुटवियर",
                  fashion: "कपड़े और फैशन",
                  accessories: "लक्ज़री एक्सेसरीज़",
                  filterByPrice: "कीमत फ़िल्टर",
                  filterByColor: "रंग फ़िल्टर",
                  filterByBrand: "ब्रांड फ़िल्टर",
                  filterBySize: "आकार फ़िल्टर",
                  subCategories: "उप-श्रेणियाँ",
                  showingProducts: "{total} में से {count} उत्पाद दिखाए जा रहे हैं",
                  resetFilters: "फ़िल्टर रीसेट",
                  noProducts: "कोई मेल खाता उत्पाद नहीं मिला",
                  adjustFilters: "कृपया अपनी कीमत सीमा या फ़िल्टर बदलकर पुन: प्रयास करें।"
                }
              };

              const st = shopTranslations[lang] || shopTranslations.EN;
              
              // Helper to compute dynamic statistics
              const totalCount = products.length;

              // Dynamic list of all available sub-categories, brands, colors, and sizes based on current selection
              const activeCategoryProducts = selectedCategory
                ? products.filter(p => p.category === selectedCategory)
                : products;

              const availableSubCategories = Array.from(new Set(activeCategoryProducts.map(p => p.subCategory).filter(Boolean)));
              const availableBrands = Array.from(new Set(activeCategoryProducts.map(p => p.brand).filter(Boolean)));
              const availableColors = Array.from(new Set(activeCategoryProducts.flatMap(p => p.colors).filter(Boolean)));
              const availableSizes = Array.from(new Set(activeCategoryProducts.flatMap(p => p.sizes).filter(Boolean)));

              const filteredProducts = getFilteredProducts();

              // Helper for color swatches
              const getColorClass = (colorName: string) => {
                const name = colorName.toLowerCase();
                if (name.includes("blue")) return "bg-blue-600";
                if (name.includes("black") || name.includes("obsidian")) return "bg-neutral-950";
                if (name.includes("red") || name.includes("crimson")) return "bg-red-600";
                if (name.includes("gold") || name.includes("ochre") || name.includes("yellow")) return "bg-amber-500";
                if (name.includes("green") || name.includes("emerald")) return "bg-emerald-700";
                if (name.includes("brown")) return "bg-amber-900";
                if (name.includes("white") || name.includes("ivory")) return "bg-white border border-gray-300";
                if (name.includes("navy") || name.includes("indigo")) return "bg-indigo-950";
                if (name.includes("peach") || name.includes("rose")) return "bg-rose-300";
                if (name.includes("maroon") || name.includes("burgundy")) return "bg-red-900";
                if (name.includes("silver") || name.includes("grey") || name.includes("charcoal") || name.includes("gunmetal")) return "bg-gray-400";
                if (name.includes("tan") || name.includes("cognac") || name.includes("espresso")) return "bg-amber-800";
                return "bg-neutral-500";
              };

              const hasActiveFilters = !!(searchQuery || selectedCategory || selectedSubCategory || selectedBrand || selectedColor || selectedSize || priceRange < 60000);

              const handleResetFilters = () => {
                setSearchQuery("");
                setSelectedCategory("");
                setSelectedSubCategory("");
                setSelectedBrand("");
                setSelectedColor("");
                setSelectedSize("");
                setPriceRange(60000);
              };

              return (
                <div className="space-y-8 animate-fade-in" id="megna-shop-page-container">
                  
                  {/* Shop Page Luxury Hero Banner */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 text-white p-8 md:p-12 border border-neutral-800 shadow-2xl flex flex-col justify-between min-h-[160px] md:min-h-[200px]" id="shop-hero-banner">
                    <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-400 via-red-600 to-transparent pointer-events-none"></div>
                    <div className="relative z-10 max-w-3xl space-y-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" />
                        <span className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-orange-400">MEGNA ENTERPRISE</span>
                      </div>
                      <h2 className="text-3xl md:text-5xl font-black tracking-tight">{st.shopBannerTitle}</h2>
                      <p className="text-xs md:text-sm text-neutral-400 font-light leading-relaxed max-w-2xl">{st.shopBannerSub}</p>
                    </div>
                  </div>

                  {/* Gorgeous Visual Category Cards Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" id="shop-category-cards-grid">
                    {/* All collections Card */}
                    <div
                      id="cat-card-all"
                      onClick={() => { setSelectedCategory(""); setSelectedSubCategory(""); }}
                      className={`relative overflow-hidden group cursor-pointer aspect-[3/2] border transition-all duration-300 ${
                        selectedCategory === "" 
                          ? "border-orange-500 ring-2 ring-orange-500/20 shadow-lg scale-[1.02]" 
                          : "border-gray-150 dark:border-neutral-800 opacity-90 hover:opacity-100"
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-900/40 to-transparent z-10"></div>
                      <img
                        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300"
                        alt="All Collections"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-x-0 bottom-0 p-4 z-20 flex justify-between items-end">
                        <div>
                          <span className="text-[9px] font-bold text-orange-400 uppercase tracking-wider block">EXPLORE</span>
                          <span className="text-xs md:text-sm font-black text-white">{st.allCategories}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-white/20 text-white backdrop-blur-sm rounded">
                          {totalCount}
                        </span>
                      </div>
                    </div>

                    {/* Dynamic Category Cards */}
                    {uniqueCategories.map((cat) => {
                      const count = products.filter((p) => p.category === cat).length;
                      let badge = "COLLECTION";
                      if (cat === "Footwear") badge = "LUXURY";
                      else if (cat === "Fashion") badge = "TRADITIONAL";
                      else if (cat === "Accessories") badge = "ELEGANCE";

                      return (
                        <div
                          key={cat}
                          id={`cat-card-${cat.toLowerCase()}`}
                          onClick={() => { setSelectedCategory(cat); setSelectedSubCategory(""); }}
                          className={`relative overflow-hidden group cursor-pointer aspect-[3/2] border transition-all duration-300 ${
                            selectedCategory === cat 
                              ? "border-orange-500 ring-2 ring-orange-500/20 shadow-lg scale-[1.02]" 
                              : "border-gray-150 dark:border-neutral-800 opacity-90 hover:opacity-100"
                          }`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-900/40 to-transparent z-10"></div>
                          <img
                            src={getCategoryRepresentativeImage(cat)}
                            alt={cat}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-x-0 bottom-0 p-4 z-20 flex justify-between items-end">
                            <div>
                              <span className="text-[9px] font-bold text-orange-400 uppercase tracking-wider block">{badge}</span>
                              <span className="text-xs md:text-sm font-black text-white">{getCategoryLabel(cat)}</span>
                            </div>
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-white/20 text-white backdrop-blur-sm rounded">
                              {count}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Main Grid: Sidebar + Product list */}
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start" id="shop-main-layout-grid">
                    
                    {/* Left Filters Sidebar */}
                    <div className="lg:sticky lg:top-24 space-y-6 bg-white dark:bg-neutral-900 border border-gray-150 dark:border-neutral-800 p-5 shadow-sm" id="shop-sidebar-filters">
                      
                      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
                        <div className="flex items-center gap-2">
                          <SlidersHorizontal className="w-4 h-4 text-orange-600" />
                          <span className="text-xs font-black uppercase tracking-wider">FILTERS</span>
                        </div>
                        {hasActiveFilters && (
                          <button
                            id="btn-reset-filters-sidebar"
                            onClick={handleResetFilters}
                            className="text-[10px] font-bold text-orange-600 hover:text-black hover:underline tracking-tight"
                          >
                            {st.resetFilters}
                          </button>
                        )}
                      </div>

                      {/* Search Inner Filter */}
                      <div className="space-y-2" id="filter-search-container">
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400">Search Products</label>
                        <div className="relative">
                          <Search className="absolute top-2.5 left-3 w-3.5 h-3.5 text-gray-400" />
                          <input
                            id="search-input-field"
                            type="text"
                            placeholder={translation.searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 text-xs pl-8 pr-3 py-2 focus:outline-none focus:border-black rounded-none"
                          />
                        </div>
                      </div>

                      {/* Dynamic Sub-Categories Accordion */}
                      {availableSubCategories.length > 0 && (
                        <div className="space-y-2" id="filter-subcategories-container">
                          <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400">
                            {st.subCategories}
                          </label>
                          <div className="flex flex-col gap-1.5">
                            {availableSubCategories.map((sub) => (
                              <button
                                key={sub}
                                onClick={() => setSelectedSubCategory(selectedSubCategory === sub ? "" : sub)}
                                className={`text-left text-xs px-2.5 py-1.5 border transition-all duration-200 flex items-center justify-between ${
                                  selectedSubCategory === sub
                                    ? "bg-black text-white border-black font-bold"
                                    : "bg-gray-50 dark:bg-neutral-950 border-gray-150 dark:border-neutral-850 hover:bg-gray-100 text-gray-600 dark:text-neutral-400"
                                }`}
                              >
                                <span>{sub}</span>
                                <span className={`text-[9px] px-1 rounded ${selectedSubCategory === sub ? "bg-white/25 text-white" : "bg-gray-200 dark:bg-neutral-800 text-gray-500"}`}>
                                  {products.filter(p => p.subCategory === sub && (!selectedCategory || p.category === selectedCategory)).length}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Price Range Slider */}
                      <div className="space-y-3" id="filter-price-container">
                        <div className="flex justify-between items-baseline">
                          <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400">{st.filterByPrice}</label>
                          <span className="text-xs font-bold font-mono text-orange-600">
                            {currency === "BDT" ? "৳" : "₹"}{priceRange.toLocaleString()}
                          </span>
                        </div>
                        <input
                          id="price-range-slider"
                          type="range"
                          min={100}
                          max={60000}
                          step={500}
                          value={priceRange}
                          onChange={(e) => setPriceRange(Number(e.target.value))}
                          className="w-full accent-orange-600 cursor-pointer"
                        />
                        <div className="flex justify-between text-[8px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                          <span>{currency === "BDT" ? "৳100" : "₹100"}</span>
                          <span>{currency === "BDT" ? "৳60,000" : "₹60,000"}</span>
                        </div>
                      </div>

                      {/* Color Swatches Grid */}
                      {availableColors.length > 0 && (
                        <div className="space-y-2" id="filter-colors-container">
                          <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400">{st.filterByColor}</label>
                          <div className="flex flex-wrap gap-2">
                            {availableColors.map((color) => {
                              const colorStr = color as string;
                              const isSelected = selectedColor === colorStr;
                              return (
                                <button
                                  key={colorStr}
                                  onClick={() => setSelectedColor(isSelected ? "" : colorStr)}
                                  title={colorStr}
                                  className={`relative w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-sm ${getColorClass(colorStr)} ${
                                    isSelected ? "ring-2 ring-orange-500 ring-offset-2 dark:ring-offset-neutral-900" : ""
                                  }`}
                                >
                                  {isSelected && (
                                    <span className="absolute text-[10px] text-orange-600 font-black drop-shadow-md">✓</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                          {selectedColor && (
                            <span className="text-[10px] text-gray-500 font-bold">Active: <span className="text-black dark:text-white">{selectedColor}</span></span>
                          )}
                        </div>
                      )}

                      {/* Size Selector Chips */}
                      {availableSizes.length > 0 && (
                        <div className="space-y-2" id="filter-sizes-container">
                          <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400">{st.filterBySize}</label>
                          <div className="flex flex-wrap gap-1.5">
                            {availableSizes.map((size) => {
                              const isSelected = selectedSize === size;
                              return (
                                <button
                                  key={size}
                                  onClick={() => setSelectedSize(isSelected ? "" : size)}
                                  className={`text-[10px] px-2.5 py-1 font-bold border rounded-none transition-all ${
                                    isSelected
                                      ? "bg-black text-white border-black"
                                      : "bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-neutral-400 hover:bg-gray-100"
                                  }`}
                                >
                                  {size}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Brand Selectors */}
                      {availableBrands.length > 1 && (
                        <div className="space-y-2" id="filter-brands-container">
                          <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400">{st.filterByBrand}</label>
                          <div className="flex flex-col gap-1">
                            {availableBrands.map((brand) => (
                              <button
                                key={brand}
                                onClick={() => setSelectedBrand(selectedBrand === brand ? "" : brand)}
                                className={`text-left text-[11px] px-2 py-1.5 border transition-all duration-200 flex items-center justify-between ${
                                  selectedBrand === brand
                                    ? "bg-black text-white border-black font-bold"
                                    : "bg-gray-50 dark:bg-neutral-950 border-gray-250 text-gray-600 hover:bg-gray-100"
                                }`}
                              >
                                {brand}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>

                    {/* Right Results & Catalog list Grid */}
                    <div className="lg:col-span-3 space-y-6" id="shop-catalog-area">
                      
                      {/* Search Sort & Stats Top bar */}
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-neutral-900 border border-gray-150 dark:border-neutral-800 p-4">
                        <div className="space-y-1">
                          <div className="text-xs text-gray-400 uppercase tracking-widest font-bold">
                            {st.showingProducts.replace("{count}", filteredProducts.length.toString()).replace("{total}", activeCategoryProducts.length.toString())}
                          </div>
                          {selectedCategory && (
                            <div className="text-sm font-black flex items-center gap-1.5 uppercase text-orange-600">
                              <span>{selectedCategory}</span>
                              {selectedSubCategory && <span className="text-gray-300 font-light">/</span>}
                              {selectedSubCategory && <span className="text-gray-800 dark:text-white text-xs">{selectedSubCategory}</span>}
                            </div>
                          )}
                        </div>

                        {/* Sort selector */}
                        <div className="flex items-center gap-2 self-stretch md:self-auto justify-between border-t md:border-t-0 pt-2.5 md:pt-0">
                          <span className="text-[10px] text-gray-400 uppercase tracking-widest block shrink-0 font-bold">Sort By:</span>
                          <select
                            id="sort-select-field"
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-none px-3 py-1.5 text-xs focus:outline-none font-bold text-gray-800 dark:text-neutral-200 cursor-pointer"
                          >
                            <option value="popularity">Popularity / Ratings</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="newest">Newest Silhouette</option>
                          </select>
                        </div>
                      </div>

                      {/* Active Filter Badges */}
                      {hasActiveFilters && (
                        <div className="flex flex-wrap items-center gap-2 p-3 bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/40 animate-fade-in" id="active-filter-badges">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400 mr-1">Active filters:</span>
                          {selectedCategory && (
                            <span className="text-[9px] font-bold bg-white dark:bg-neutral-950 text-gray-700 dark:text-neutral-300 border px-2 py-1 flex items-center gap-1">
                              Category: {selectedCategory}
                              <button onClick={() => { setSelectedCategory(""); setSelectedSubCategory(""); }} className="text-red-500 font-bold hover:scale-110">×</button>
                            </span>
                          )}
                          {selectedSubCategory && (
                            <span className="text-[9px] font-bold bg-white dark:bg-neutral-950 text-gray-700 dark:text-neutral-300 border px-2 py-1 flex items-center gap-1">
                              Sub: {selectedSubCategory}
                              <button onClick={() => setSelectedSubCategory("")} className="text-red-500 font-bold hover:scale-110">×</button>
                            </span>
                          )}
                          {selectedColor && (
                            <span className="text-[9px] font-bold bg-white dark:bg-neutral-950 text-gray-700 dark:text-neutral-300 border px-2 py-1 flex items-center gap-1">
                              Color: {selectedColor}
                              <button onClick={() => setSelectedColor("")} className="text-red-500 font-bold hover:scale-110">×</button>
                            </span>
                          )}
                          {selectedSize && (
                            <span className="text-[9px] font-bold bg-white dark:bg-neutral-950 text-gray-700 dark:text-neutral-300 border px-2 py-1 flex items-center gap-1">
                              Size: {selectedSize}
                              <button onClick={() => setSelectedSize("")} className="text-red-500 font-bold hover:scale-110">×</button>
                            </span>
                          )}
                          {searchQuery && (
                            <span className="text-[9px] font-bold bg-white dark:bg-neutral-950 text-gray-700 dark:text-neutral-300 border px-2 py-1 flex items-center gap-1">
                              Search: "{searchQuery}"
                              <button onClick={() => setSearchQuery("")} className="text-red-500 font-bold hover:scale-110">×</button>
                            </span>
                          )}
                          {priceRange < 60000 && (
                            <span className="text-[9px] font-bold bg-white dark:bg-neutral-950 text-gray-700 dark:text-neutral-300 border px-2 py-1 flex items-center gap-1">
                              Max Price: {currency === "BDT" ? "৳" : "₹"}{priceRange.toLocaleString()}
                              <button onClick={() => setPriceRange(60000)} className="text-red-500 font-bold hover:scale-110">×</button>
                            </span>
                          )}
                          <button
                            id="btn-clear-all-badges"
                            onClick={handleResetFilters}
                            className="text-[9px] font-bold text-orange-600 hover:underline ml-auto animate-pulse"
                          >
                            Clear All
                          </button>
                        </div>
                      )}

                      {/* Products Grid list */}
                      {filteredProducts.length === 0 ? (
                        <div className="text-center py-20 border border-dashed border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 space-y-4 px-6 shadow-sm" id="shop-empty-state">
                          <div className="mx-auto w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
                            <SlidersHorizontal className="w-5 h-5 text-gray-400" />
                          </div>
                          <div className="space-y-2 max-w-md mx-auto">
                            <span className="text-lg font-black block text-gray-800 dark:text-white">{st.noProducts}</span>
                            <p className="text-xs text-gray-500 dark:text-neutral-400 font-light leading-relaxed">{st.adjustFilters}</p>
                          </div>
                          <button
                            id="btn-reset-empty-filters"
                            onClick={handleResetFilters}
                            className="px-6 py-2.5 bg-black text-white dark:bg-white dark:text-black text-xs font-black uppercase hover:scale-105 transition-transform"
                          >
                            {st.resetFilters}
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in" id="shop-products-grid">
                          {filteredProducts.map((product) => (
                            <ProductCard
                              key={product.id}
                              product={product}
                              currency={currency}
                              isWishlisted={wishlist.includes(product.id)}
                              onToggleWishlist={() => handleToggleWishlist(product.id)}
                              isCompared={compareProducts.some((cp) => cp.id === product.id)}
                              onToggleCompare={() => handleToggleCompare(product)}
                              onSelect={() => setSelectedProduct(product)}
                              onAddToCart={handleAddToCart}
                            />
                          ))}
                        </div>
                      )}

                    </div>

                  </div>

                </div>
              );
            })()}

            {/* View C: Wishlist View */}
            {view === "wishlist" && (
              <div className="space-y-6">
                <div>
                  <span className="text-orange-600 text-[10px] font-bold tracking-[0.3em] uppercase block">Your Collection</span>
                  <h3 className="text-2xl font-black tracking-tight">Saved Wishlist ({wishlist.length})</h3>
                </div>

                {wishlist.length === 0 ? (
                  <div className="text-center py-20 border bg-white space-y-3">
                    <p className="text-xs text-gray-400 italic font-light">Your saved wardrobe is currently empty.</p>
                    <button onClick={() => setView("shop")} className="px-5 py-2 bg-black text-white text-xs font-bold uppercase hover:scale-105 hover:tracking-widest transition-all duration-300">
                      Start Curating
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products
                      .filter((p) => wishlist.includes(p.id))
                      .map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          currency={currency}
                          isWishlisted={true}
                          onToggleWishlist={() => handleToggleWishlist(product.id)}
                          isCompared={compareProducts.some((cp) => cp.id === product.id)}
                          onToggleCompare={() => handleToggleCompare(product)}
                          onSelect={() => setSelectedProduct(product)}
                          onAddToCart={handleAddToCart}
                        />
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* View D: Compare Products View */}
            {view === "compare" && (
              <div className="space-y-6">
                <div>
                  <span className="text-orange-600 text-[10px] font-bold tracking-[0.3em] uppercase block">Side-By-Side</span>
                  <h3 className="text-2xl font-black tracking-tight">Compare Luxury Items ({compareProducts.length}/3)</h3>
                </div>

                {compareProducts.length === 0 ? (
                  <div className="text-center py-20 border bg-white">
                    <p className="text-xs text-gray-400 italic">Select footwear or sarees to compare features side-by-side.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-150 bg-white">
                    {compareProducts.map((p) => {
                      const isBDT = currency === "BDT";
                      const pr = isBDT ? p.priceBDT : p.priceINR;
                      const disc = Math.round(pr * (1 - p.discountPercent / 100));
                      return (
                        <div key={p.id} className="p-6 space-y-4 flex flex-col justify-between border-r border-gray-100 last:border-0 relative">
                          <button
                            onClick={() => handleToggleCompare(p)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-black"
                          >
                            <X className="w-4 h-4" />
                          </button>

                          <div className="space-y-2 text-center">
                            <img src={p.images[0]} alt="compare" className="h-32 object-contain mx-auto" referrerPolicy="no-referrer" />
                            <h4 className="font-bold text-sm text-gray-800">{p.name}</h4>
                            <span className="text-sm font-black text-orange-600">
                              {isBDT ? "৳" : "₹"}{disc.toLocaleString()}
                            </span>
                          </div>

                          <div className="divide-y divide-gray-100 text-xs font-light space-y-2 pt-4">
                            <div className="pt-2 flex justify-between">
                              <span className="text-gray-400">Main Category:</span>
                              <span className="font-bold">{p.category}</span>
                            </div>
                            <div className="pt-2 flex justify-between">
                              <span className="text-gray-400">Subtype:</span>
                              <span className="font-bold">{p.subCategory}</span>
                            </div>
                            <div className="pt-2 flex justify-between">
                              <span className="text-gray-400">Sku Identifier:</span>
                              <span className="font-mono">{p.sku}</span>
                            </div>
                            <div className="pt-2 flex justify-between">
                              <span className="text-gray-400">Sizes Ready:</span>
                              <span className="font-bold">{p.sizes.join(", ")}</span>
                            </div>
                            <div className="pt-2 flex justify-between">
                              <span className="text-gray-400">Inventory Left:</span>
                              <span className="font-bold text-orange-600">{p.stock} units</span>
                            </div>
                            <div className="pt-2 flex justify-between">
                              <span className="text-gray-400">Audience Rating:</span>
                              <span className="font-bold">{p.ratings} / 5</span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleAddToCart(p, p.sizes[0] || "Standard", p.colors[0] || "Default")}
                            className="w-full py-2.5 bg-black text-white text-[10px] font-bold uppercase tracking-wider hover:scale-105 hover:tracking-widest transition-all duration-300"
                          >
                            Add This To Bag
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* View E: Checkout Portal screen */}
            {view === "checkout" && (
              <div className="space-y-6">
                <div>
                  <span className="text-orange-600 text-[10px] font-bold tracking-[0.3em] uppercase block">Order Verification</span>
                  <h3 className="text-2xl font-black tracking-tight">Luxe Order Checkout</h3>
                </div>

                {checkoutOrderSuccess ? (
                  /* Success Screen Overlay */
                  <div className="border border-green-200 bg-green-50/20 p-8 space-y-6 max-w-xl mx-auto text-center relative">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto animate-bounce" />
                    <div className="space-y-2">
                      <h4 className="text-xl font-bold">Your Order is Placed!</h4>
                      <p className="text-xs text-gray-500 font-light">
                        We have successfully initialized your order code: <span className="font-bold text-orange-600 font-mono">{checkoutOrderSuccess.orderNumber}</span>.
                      </p>
                      <p className="text-xs text-gray-500 font-light">
                        Our merchant logistics division in Kolkata and Dhaka has received your booking information.
                      </p>
                    </div>

                    <div className="p-4 bg-white border border-gray-100 text-left text-xs font-mono max-w-md mx-auto space-y-1">
                      <div><span className="text-gray-400">Total Charged:</span> {checkoutOrderSuccess.currency === "BDT" ? "৳" : "₹"}{checkoutOrderSuccess.total.toLocaleString()}</div>
                      <div><span className="text-gray-400">Payment Channel:</span> {checkoutOrderSuccess.paymentMethod}</div>
                      <div><span className="text-gray-400">Delivery Location:</span> {checkoutOrderSuccess.shippingAddress.addressLine1}, {checkoutOrderSuccess.shippingAddress.city}</div>
                    </div>

                    <div className="flex justify-center gap-3 pt-4">
                      <button
                        onClick={() => { setCheckoutOrderSuccess(null); setView("dashboard"); }}
                        className="px-5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-orange-600 hover:scale-105 hover:tracking-widest transition-all duration-300"
                      >
                        Track In Dashboard
                      </button>
                      <button
                        onClick={() => { setCheckoutOrderSuccess(null); setView("home"); }}
                        className="px-5 py-2.5 border border-black text-black text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white hover:scale-105 hover:tracking-widest transition-all duration-300"
                      >
                        Return To Home
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Checkout Billing Form info */}
                    <div className="lg:col-span-7 bg-white border border-gray-100 p-6 md:p-8 space-y-6">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 pb-3 border-b border-gray-100">
                        Recipient & Delivery Logistics
                      </h4>

                      <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-2">
                            <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Full Recipient Name</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Biman Das"
                              value={checkoutName}
                              onChange={(e) => setCheckoutName(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 px-3 py-1.5 text-xs focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Email Address</label>
                            <input
                              type="email"
                              required
                              placeholder="your@email.com"
                              value={checkoutEmail}
                              onChange={(e) => setCheckoutEmail(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 px-3 py-1.5 text-xs focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Phone Contact (With code)</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. +918250568500"
                              value={checkoutPhone}
                              onChange={(e) => setCheckoutPhone(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 px-3 py-1.5 text-xs focus:outline-none font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Street Address Details</label>
                          <input
                            type="text"
                            required
                            placeholder="Flat Number, Street, Sector, Building Details..."
                            value={checkoutAddress}
                            onChange={(e) => setCheckoutAddress(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 px-3 py-1.5 text-xs focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">City</label>
                            <input
                              type="text"
                              required
                              value={checkoutCity}
                              onChange={(e) => setCheckoutCity(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 px-3 py-1.5 text-xs focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">State / Division</label>
                            <input
                              type="text"
                              required
                              value={checkoutState}
                              onChange={(e) => setCheckoutState(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 px-3 py-1.5 text-xs focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Postal Code</label>
                            <input
                              type="text"
                              required
                              placeholder="Zipcode"
                              value={checkoutZip}
                              onChange={(e) => setCheckoutZip(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 px-3 py-1.5 text-xs focus:outline-none font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Destination Country</label>
                            <select
                              value={checkoutCountry}
                              onChange={(e) => setCheckoutCountry(e.target.value as any)}
                              className="w-full bg-white border border-gray-200 px-3 py-1.5 text-xs focus:outline-none font-bold"
                            >
                              <option value="India">India</option>
                              <option value="Bangladesh">Bangladesh</option>
                            </select>
                          </div>
                        </div>

                        {/* Modular Checkout Payment Gateways selector based on selected Country */}
                        <div className="space-y-2 pt-3 border-t border-gray-100">
                          <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400">
                            Select Secure Gateway ({checkoutCountry})
                          </label>
                          <div className="grid grid-cols-2 gap-2.5">
                            {checkoutCountry === "India" ? (
                              <>
                                {[
                                  { id: "Razorpay", label: "Razorpay Secure" },
                                  { id: "PhonePe", label: "PhonePe UPI" },
                                  { id: "Google Pay", label: "Google Pay (UPI)" },
                                  { id: "Cash on Delivery", label: "Cash on Delivery" }
                                ].map((gw) => (
                                  <label
                                    key={gw.id}
                                    className={`flex items-center gap-2 p-3 border cursor-pointer hover:bg-neutral-50 ${
                                      checkoutPaymentMethod === gw.id ? "border-orange-600 bg-orange-50/20" : "border-gray-200"
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name="payment"
                                      required
                                      value={gw.id}
                                      checked={checkoutPaymentMethod === gw.id}
                                      onChange={() => setCheckoutPaymentMethod(gw.id)}
                                      className="text-orange-600 focus:ring-orange-500"
                                    />
                                    <span className="text-xs font-bold">{gw.label}</span>
                                  </label>
                                ))}
                              </>
                            ) : (
                              <>
                                {[
                                  { id: "SSLCommerz", label: "SSLCommerz" },
                                  { id: "bKash", label: "bKash Direct" },
                                  { id: "Nagad", label: "Nagad Wallet" },
                                  { id: "Cash on Delivery", label: "Cash on Delivery" }
                                ].map((gw) => (
                                  <label
                                    key={gw.id}
                                    className={`flex items-center gap-2 p-3 border cursor-pointer hover:bg-neutral-50 ${
                                      checkoutPaymentMethod === gw.id ? "border-orange-600 bg-orange-50/20" : "border-gray-200"
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name="payment"
                                      required
                                      value={gw.id}
                                      checked={checkoutPaymentMethod === gw.id}
                                      onChange={() => setCheckoutPaymentMethod(gw.id)}
                                      className="text-orange-600 focus:ring-orange-500"
                                    />
                                    <span className="text-xs font-bold">{gw.label}</span>
                                  </label>
                                ))}
                              </>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Additional Order Notes (Optional)</label>
                          <textarea
                            placeholder="Add specific delivery directions or style adjustments..."
                            rows={2}
                            value={checkoutNotes}
                            onChange={(e) => setCheckoutNotes(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 px-3 py-1.5 text-xs focus:outline-none w-full"
                          ></textarea>
                        </div>

                        <button
                          type="submit"
                          disabled={cart.length === 0}
                          className="w-full py-3 bg-black hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-widest hover:scale-105 hover:tracking-[0.2em] transition-all duration-300"
                        >
                          Verify & Finalize Booking ({currency === "BDT" ? "৳" : "₹"}{totals.total.toLocaleString()})
                        </button>
                      </form>
                    </div>

                    {/* Checkout Order Summary sidebar */}
                    <div className="lg:col-span-5 bg-neutral-50 border border-gray-150 p-6 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 pb-2 border-b">
                        Order Summary
                      </h4>

                      {cart.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No silhouettes inside your bag.</p>
                      ) : (
                        <div className="space-y-3.5 divide-y divide-gray-100 max-h-[300px] overflow-y-auto pr-1">
                          {cart.map((item, idx) => {
                            const price = currency === "BDT" ? item.product.priceBDT : item.product.priceINR;
                            const discount = Math.round(price * (1 - item.product.discountPercent / 100));
                            return (
                              <div key={idx} className="flex gap-3 pt-3 first:pt-0">
                                <img src={item.product.images[0]} alt="p" className="w-10 h-10 object-contain bg-white border" />
                                <div className="flex-grow text-xs">
                                  <span className="font-bold text-gray-800 line-clamp-1">{item.product.name}</span>
                                  <span className="block text-[10px] text-gray-400 font-mono">
                                    Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                                  </span>
                                </div>
                                <span className="text-xs font-mono font-bold text-gray-900 shrink-0">
                                  {currency === "BDT" ? "৳" : "₹"}{(discount * item.quantity).toLocaleString()}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Pricing list breakdowns */}
                      <div className="pt-4 border-t space-y-1.5 text-xs font-light">
                        <div className="flex justify-between text-gray-500">
                          <span>Subtotal</span>
                          <span className="font-mono">{currency === "BDT" ? "৳" : "₹"}{totals.subtotal.toLocaleString()}</span>
                        </div>
                        {totals.discountAmount > 0 && (
                          <div className="flex justify-between text-green-600 font-bold">
                            <span>Coupon Discount</span>
                            <span className="font-mono">-{currency === "BDT" ? "৳" : "₹"}{totals.discountAmount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-gray-500">
                          <span>Vat & Tax</span>
                          <span className="font-mono">{currency === "BDT" ? "৳" : "₹"}{totals.tax.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                          <span>Shipping Cargo Charge</span>
                          <span className="font-mono">
                            {totals.shippingCharge === 0 ? "FREE" : `${currency === "BDT" ? "৳" : "₹"}${totals.shippingCharge}`}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm font-black border-t pt-2 text-gray-950">
                          <span>Total to Pay</span>
                          <span className="font-mono text-orange-600">
                            {currency === "BDT" ? "৳" : "₹"}{totals.total.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* View F: Customer Dashboard and logins */}
            {view === "dashboard" && (
              <CustomerDashboard
                user={user}
                onLoginSuccess={(u, t) => {
                  setUser(u);
                  setToken(t);
                  localStorage.setItem("megna_token", t);
                }}
                onLogout={() => {
                  setUser(null);
                  setToken(null);
                  localStorage.removeItem("megna_token");
                  setView("home");
                }}
                currency={currency}
              />
            )}

            {/* View G: Admin Panel console */}
            {view === "admin" && (
              <AdminPanel
                user={user}
                onLoginSuccess={(u, t) => {
                  setUser(u);
                  setToken(t);
                  localStorage.setItem("megna_token", t);
                }}
                currency={currency}
                allProducts={products}
                onRefreshProducts={bootstrapApp}
              />
            )}

            {/* View H: Editorial Journal / Blog */}
            {view === "blog" && (
              <BlogView isDarkMode={isDarkMode} />
            )}

            {/* View I: Brand Heritage / About */}
            {view === "about" && (
              <AboutView isDarkMode={isDarkMode} />
            )}

            {/* View J: Concierge Helpdesk / Contact */}
            {view === "contact" && (
              <ContactView isDarkMode={isDarkMode} />
            )}
          </>
        )}
      </main>

      {/* 4. Sliding Interactive Shopping Bag Sidebar Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex justify-end">
          <div className="bg-[#fdfdfd] text-[#1a1a1a] w-full max-w-md h-full shadow-2xl flex flex-col justify-between">
            {/* Drawer Head */}
            <div className="p-5 border-b border-gray-150 flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-orange-600" />
                {translation.cartTitle} ({(cart || []).reduce((sum, item) => sum + item.quantity, 0)})
              </h3>
              <button onClick={() => setIsCartOpen(false)} className="p-1.5 hover:bg-neutral-100 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer list */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-16 text-gray-400 italic text-xs font-light">
                  Your bag is empty. Start exploring luxury footwear.
                </div>
              ) : (
                <div className="space-y-3.5 divide-y divide-gray-100">
                  {cart.map((item, idx) => {
                    const price = currency === "BDT" ? item.product.priceBDT : item.product.priceINR;
                    const final = Math.round(price * (1 - item.product.discountPercent / 100));
                    return (
                      <div key={idx} className="flex gap-3.5 pt-3.5 first:pt-0">
                        <img src={item.product.images[0]} alt="p" className="w-12 h-12 object-contain border bg-white shrink-0" />
                        <div className="flex-grow text-xs space-y-1">
                          <h4 className="font-bold text-gray-800 line-clamp-1">{item.product.name}</h4>
                          <span className="block text-[10px] text-gray-400 font-mono">
                            Size: {item.size} • Color: {item.color}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 font-mono">
                              {currency === "BDT" ? "৳" : "₹"}{(final * item.quantity).toLocaleString()}
                            </span>
                            <span className="text-[10px] text-gray-400">({currency === "BDT" ? "৳" : "₹"}{final}/unit)</span>
                          </div>

                          {/* Qty update buttons */}
                          <div className="flex items-center gap-1.5 pt-1">
                            <button
                              onClick={() => handleUpdateCartQty(item.product.id, item.size, item.color, item.quantity - 1)}
                              className="w-5 h-5 bg-gray-100 text-[10px] font-bold border hover:bg-gray-250 flex items-center justify-center"
                            >
                              -
                            </button>
                            <span className="text-xs font-mono font-bold">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateCartQty(item.product.id, item.size, item.color, item.quantity + 1)}
                              className="w-5 h-5 bg-gray-100 text-[10px] font-bold border hover:bg-gray-250 flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Remove item trigger */}
                        <button
                          onClick={() => handleRemoveFromCart(item.product.id, item.size, item.color)}
                          className="text-gray-400 hover:text-red-600 shrink-0 self-start p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Actions and Coupon applying */}
            <div className="p-5 border-t border-gray-150 bg-neutral-50 space-y-4">
              {/* Promo Code Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="COUPON (e.g. FESTIVE25)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 bg-white border border-gray-300 px-3 py-1.5 text-xs text-black uppercase focus:outline-none"
                />
                <button type="submit" className="px-4 py-1.5 bg-black text-white text-[10px] font-bold uppercase tracking-wider">
                  Apply
                </button>
              </form>

              {couponError && <p className="text-red-600 text-[10px]">{couponError}</p>}
              {appliedCoupon && (
                <div className="text-[10px] text-green-600 font-bold flex justify-between">
                  <span>Coupon {appliedCoupon.code} applied!</span>
                  <span>-{appliedCoupon.discountPercent}% OFF</span>
                </div>
              )}

              {/* Price calculations */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-mono">{currency === "BDT" ? "৳" : "₹"}{totals.subtotal.toLocaleString()}</span>
                </div>
                {totals.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Discount</span>
                    <span className="font-mono">-{currency === "BDT" ? "৳" : "₹"}{totals.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>Vat / Shipping estimated on checkout</span>
                </div>
                <div className="flex justify-between text-base font-black text-gray-900 border-t pt-2">
                  <span>Subtotal Amount</span>
                  <span className="font-mono text-orange-600">
                    {currency === "BDT" ? "৳" : "₹"}{(totals.subtotal - totals.discountAmount).toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setView("checkout");
                }}
                disabled={cart.length === 0}
                className="w-full py-3 bg-black hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-widest text-center block hover:scale-105 hover:tracking-[0.2em] transition-all duration-300 disabled:opacity-40"
              >
                {translation.checkout}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Custom Floating Service Widgets */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3 print:hidden">
        
        {/* Back To Top */}
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="p-3 bg-black text-white shadow-md rounded-full hover:bg-orange-600 transition-colors"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        )}

        {/* AI Stylist floating trigger */}
        <button
          onClick={() => setIsStylistOpen(true)}
          className="bg-neutral-900 border border-neutral-800 text-white px-4 py-3 shadow-xl flex items-center gap-2 hover:bg-orange-600 transition-colors"
        >
          <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider">AI Stylist</span>
        </button>

        {/* Floating Call Now Button */}
        <a
          href="tel:+918250568500"
          className="p-3 bg-gray-900 hover:bg-black text-white shadow-md rounded-full flex items-center justify-center transition-colors"
          title="Call Megna Enterprise"
        >
          <Phone className="w-4 h-4" />
        </a>

        {/* Floating WhatsApp Service Pop-up */}
        <div className="relative">
          <button
            onClick={() => setShowWhatsAppBox(!showWhatsAppBox)}
            className="p-3 bg-green-600 hover:bg-green-500 text-white shadow-lg rounded-full flex items-center justify-center transition-all"
            title="Chat on WhatsApp"
          >
            <MessageSquare className="w-4.5 h-4.5 fill-current" />
          </button>

          {showWhatsAppBox && (
            <div className="absolute bottom-14 right-0 w-72 bg-white border border-gray-200 shadow-2xl p-4 z-50 rounded-none text-black space-y-3">
              <div className="flex justify-between items-center pb-2 border-b">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">Megna WhatsApp Helpdesk</h4>
                  <span className="text-[9px] text-green-600 font-bold">● Reps Online Now</span>
                </div>
                <button onClick={() => setShowWhatsAppBox(false)} className="text-gray-400 hover:text-black">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-gray-500 font-light leading-relaxed">
                Send a live message to **+91 8250568500** for express product catalogs, sizing guidelines, or border shipping queries!
              </p>
              <form onSubmit={handleWhatsAppSend} className="flex gap-1">
                <input
                  type="text"
                  required
                  placeholder="Your style / delivery question..."
                  value={waMessage}
                  onChange={(e) => setWaMessage(e.target.value)}
                  className="flex-1 bg-gray-50 border px-2.5 py-1 text-xs focus:outline-none focus:border-black"
                />
                <button type="submit" className="bg-green-600 text-white px-3 text-xs font-bold uppercase">
                  Send
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* 6. Product Detail modal overlay popup */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          currency={currency}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          isWishlisted={wishlist.includes(selectedProduct.id)}
          onToggleWishlist={() => handleToggleWishlist(selectedProduct.id)}
          relatedProducts={products.filter((p) => p.category === selectedProduct.category && p.id !== selectedProduct.id).slice(0, 3)}
          onSelectRelated={(p) => setSelectedProduct(p)}
        />
      )}

      {/* 7. Slide-in AI Stylist virtual consultation drawer */}
      <AiStylistDrawer
        isOpen={isStylistOpen}
        onClose={() => setIsStylistOpen(false)}
        currency={currency}
      />

      {/* 8. Luxury Brand Footer */}
      <footer className={`mt-auto border-t ${isDarkMode ? "bg-neutral-900 border-neutral-800 text-neutral-300" : "bg-[#fcfcfc] border-gray-150 text-neutral-800"} py-12 px-6 md:px-12`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo story */}
          <div className="space-y-3">
            <span className="text-xl font-black uppercase tracking-tighter">Megna<span className="text-orange-600">.</span></span>
            <p className="text-[11px] text-gray-500 font-light leading-relaxed">
              **MEGNA ENTERPRISE** is a premium curated fashion & footwear store catering to the discerning patrons of India & Bangladesh. We blend luxury lifestyle options with global fast shipping.
            </p>
            <div className="text-xs font-bold uppercase tracking-wider pt-2">
              Phone: <a href="tel:+918250568500" className="text-orange-600 font-mono hover:underline">+91 8250568500</a>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Merchant Info</h5>
            <ul className="text-xs font-light space-y-1.5 text-gray-500">
              {uniqueCategories.map((cat) => (
                <li key={cat}>
                  <button 
                    onClick={() => { setView("shop"); setSelectedCategory(cat); setSelectedSubCategory(""); }} 
                    className="hover:text-black"
                  >
                    Curated {getCategoryLabel(cat)} Catalog
                  </button>
                </li>
              ))}
              <li><button onClick={() => setView("dashboard")} className="hover:text-black">Track Order Delivery</button></li>
              <li><button onClick={() => setView("admin")} className="hover:text-black">Admin Panel Console</button></li>
            </ul>
          </div>

          {/* Legal items */}
          <div className="space-y-3">
            <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Guarantees & Policies</h5>
            <ul className="text-xs font-light space-y-1.5 text-gray-500">
              <li><a href="#privacy" className="hover:text-black">Privacy Policy</a></li>
              <li><a href="#refund" className="hover:text-black">Refund & Return Policy</a></li>
              <li><a href="#shipping" className="hover:text-black">International Shipping Policy</a></li>
              <li><a href="#cookie" className="hover:text-black">Cookie Preferences</a></li>
            </ul>
          </div>

          {/* Contact Details & Maps placeholder */}
          <div className="space-y-3">
            <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">HQ Office Location</h5>
            <p className="text-[11px] text-gray-500 font-light leading-relaxed">
              **MEGNA ENTERPRISE**<br />
              Kolkata, West Bengal, India & Dhaka, Bangladesh.
            </p>
            {/* Elegant visual placeholder map */}
            <div className="h-16 w-full border border-gray-200 dark:border-neutral-800 bg-neutral-100 flex items-center justify-center text-[9px] uppercase tracking-widest font-bold text-gray-400">
              📍 Google Map Connected
            </div>
          </div>
        </div>

        {/* Footer legal copyrights */}
        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-gray-150 dark:border-neutral-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400">
          <div>
            © 2026 MEGNA ENTERPRISE. All rights reserved.
          </div>
          <div className="flex items-center gap-2 text-black dark:text-white">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
            <span>Kolkata-Dhaka express gateway active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
