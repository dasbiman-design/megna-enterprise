import fs from "fs";
import path from "path";
import { db as sqlDb } from "./db/index.ts";
import {
  users as usersTable,
  products as productsTable,
  orders as ordersTable,
  coupons as couponsTable,
  systemSettings as systemSettingsTable,
  activityLogs as activityLogsTable
} from "./db/schema.ts";

const DATA_DIR = path.join(process.cwd(), "data");

// Helper to ensure data directory and files exist
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJSONFile<T>(filename: string, defaultValue: T): T {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
    return defaultValue;
  }
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content) as T;
  } catch (err) {
    console.error(`Error reading ${filename}, resetting to default:`, err);
    return defaultValue;
  }
}

function writeJSONFile<T>(filename: string, data: T) {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Interfaces matching database structures
export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  description: string;
  category: "Footwear" | "Fashion" | "Accessories";
  subCategory: string;
  brand: string;
  priceINR: number;
  priceBDT: number;
  discountPercent: number;
  stock: number;
  sizes: string[];
  colors: string[];
  images: string[];
  ratings: number;
  reviews: Review[];
  featured: boolean;
  newArrival: boolean;
  bestSeller: boolean;
  trending: boolean;
  videoUrl?: string;
  is360Gallery?: boolean;
}

export interface User {
  id: string;
  username: string; // Used for login
  email: string;
  name: string;
  passwordHash: string; // Base64 encoded or standard string for this full-stack mockup
  role: "admin" | "customer";
  phone: string;
  addresses: {
    id: string;
    type: "Billing" | "Shipping";
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
    country: "India" | "Bangladesh";
  }[];
  wishlist: string[]; // Product IDs
  profilePhoto?: string;
  notifications: {
    id: string;
    title: string;
    message: string;
    date: string;
    read: boolean;
  }[];
}

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  size: string;
  color: string;
  quantity: number;
  price: number; // Final unit price paid
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. ME-2026-1001
  customerId?: string; // Empty for guests
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
    country: "India" | "Bangladesh";
  };
  billingAddress: {
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
    country: "India" | "Bangladesh";
  };
  items: OrderItem[];
  currency: "INR" | "BDT";
  subtotal: number;
  discountAmount: number;
  couponCodeUsed?: string;
  shippingCharge: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: "Pending" | "Paid" | "Failed";
  orderStatus: "Pending" | "Confirmed" | "Processing" | "Packed" | "Shipped" | "Delivered" | "Cancelled" | "Returned" | "Refunded";
  orderNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  minSpendINR: number;
  minSpendBDT: number;
  isActive: boolean;
  expiryDate: string;
}

export interface SystemSettings {
  paymentGateways: {
    india: {
      razorpay: boolean;
      phonepe: boolean;
      gpay: boolean;
      paytm: boolean;
      cod: boolean;
    };
    bangladesh: {
      sslcommerz: boolean;
      bkash: boolean;
      nagad: boolean;
      rocket: boolean;
      cod: boolean;
    };
  };
  inrToBdtRate: number;
  taxPercent: number;
  shippingChargeINR: number;
  shippingChargeBDT: number;
  announcement: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  user: string;
  date: string;
  details?: string;
}

// Initial Seeding Data
const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Megna Pro Elite Athletic Sneakers",
    sku: "ME-SH-001",
    barcode: "8905623812",
    description: "Experience absolute performance and premium style. Designed with a high-breathability fly-knit mesh upper and durable polymer sole damping, the Megna Pro Elite gives you professional comfort for running, sports, or premium casual wear.",
    category: "Footwear",
    subCategory: "Sneakers",
    brand: "MEGNA ENTERPRISE",
    priceINR: 3499,
    priceBDT: 4100,
    discountPercent: 15,
    stock: 999999,
    sizes: ["7", "8", "9", "10"],
    colors: ["Cobalt Blue", "Carbon Black", "Bright Red"],
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80"
    ],
    ratings: 4.8,
    reviews: [
      { id: "rev-1-1", userName: "Aman Sharma", rating: 5, comment: "Superb fitting and incredible cushion! Looks premium.", date: "2026-06-15" },
      { id: "rev-1-2", userName: "Rakibul Hasan", rating: 4.6, comment: "Excellent shoes for daily jogging. Delivery in Dhaka was very fast.", date: "2026-06-20" }
    ],
    featured: true,
    newArrival: true,
    bestSeller: true,
    trending: true,
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4"
  },
  {
    id: "prod-2",
    name: "Royal Banarasi Silk Saree",
    sku: "ME-DF-002",
    barcode: "8905623813",
    description: "Exquisite traditional Banarasi Silk Saree featuring royal golden zari handwoven patterns, a luxurious pallu, and matching blouse piece. Handcrafted elegantly for weddings, festive occasions, and ethnic grandeur.",
    category: "Fashion",
    subCategory: "Sarees",
    brand: "MEGNA ENTERPRISE",
    priceINR: 8999,
    priceBDT: 10500,
    discountPercent: 20,
    stock: 999999,
    sizes: ["Free Size"],
    colors: ["Royal Crimson", "Golden Ochre", "Emerald Green"],
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80"
    ],
    ratings: 4.9,
    reviews: [
      { id: "rev-2-1", userName: "Priya Das", rating: 5, comment: "Breathtaking design. The silk is incredibly soft and heavy. Pure luxury!", date: "2026-06-18" }
    ],
    featured: true,
    newArrival: false,
    bestSeller: true,
    trending: true
  },
  {
    id: "prod-3",
    name: "Classic Italian Leather Loafers",
    sku: "ME-SH-003",
    barcode: "8905623814",
    description: "Meticulously crafted from full-grain Argentine leather, these luxury loafers deliver timeless style and supreme comfort. Perfect for boardroom meetings, formal gala events, or premium semi-casual evenings.",
    category: "Footwear",
    subCategory: "Loafers",
    brand: "MEGNA ENTERPRISE",
    priceINR: 4299,
    priceBDT: 5050,
    discountPercent: 10,
    stock: 999999,
    sizes: ["8", "9", "10", "11"],
    colors: ["Classic Brown", "Midnight Black"],
    images: [
      "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&auto=format&fit=crop&q=80"
    ],
    ratings: 4.7,
    reviews: [
      { id: "rev-3-1", userName: "Arjun Mehta", rating: 5, comment: "Classy and extremely comfortable for long hours.", date: "2026-06-22" }
    ],
    featured: false,
    newArrival: true,
    bestSeller: true,
    trending: false
  },
  {
    id: "prod-4",
    name: "Dhakai Jamdani Premium Saree",
    sku: "ME-DF-004",
    barcode: "8905623815",
    description: "A heritage masterpiece hand-woven by master weavers in Bangladesh. Featuring delicate floral motifs across an ultra-light, breathable mesh background, this luxury saree represents the finest culinary history of South Asian craftsmanship.",
    category: "Fashion",
    subCategory: "Sarees",
    brand: "MEGNA ENTERPRISE",
    priceINR: 11999,
    priceBDT: 14000,
    discountPercent: 12,
    stock: 999999,
    sizes: ["Free Size"],
    colors: ["Pure Ivory-Gold", "Crimson-Gold"],
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80"
    ],
    ratings: 5.0,
    reviews: [
      { id: "rev-4-1", userName: "Nusrat Jahan", rating: 5, comment: "Authentic, featherlight, and beautifully detailed. Simply majestic.", date: "2026-06-25" }
    ],
    featured: true,
    newArrival: true,
    bestSeller: false,
    trending: true
  },
  {
    id: "prod-5",
    name: "Embroidered Royal Men's Kurta",
    sku: "ME-DF-005",
    barcode: "8905623816",
    description: "Premium pure cotton-silk blend kurta with rich traditional Lucknowi Chikankari hand embroidery around the neckline and cuffs. A sophisticated, breathable outfit for Eid, Diwali, or formal family celebrations.",
    category: "Fashion",
    subCategory: "Ethnic Wear",
    brand: "MEGNA ENTERPRISE",
    priceINR: 2499,
    priceBDT: 2950,
    discountPercent: 10,
    stock: 999999,
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Classic White", "Midnight Navy", "Peach Rose"],
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80"
    ],
    ratings: 4.6,
    reviews: [
      { id: "rev-5-1", userName: "Subhashis Ray", rating: 4.5, comment: "Extremely comfortable fabric. Fitting is excellent.", date: "2026-06-12" }
    ],
    featured: false,
    newArrival: true,
    bestSeller: true,
    trending: true
  },
  {
    id: "prod-6",
    name: "Stiletto Velvet Court Heels",
    sku: "ME-SH-006",
    barcode: "8905623817",
    description: "Walk with ultimate luxury and confidence. Crafted with premium soft velvet, cushioned footbed, and a sleek, sturdy 4-inch heel. Pairs flawlessly with western dresses, evening gowns, and heavy sarees alike.",
    category: "Footwear",
    subCategory: "Heels",
    brand: "MEGNA ENTERPRISE",
    priceINR: 3199,
    priceBDT: 3750,
    discountPercent: 18,
    stock: 999999,
    sizes: ["6", "7", "8", "9"],
    colors: ["Seductive Maroon", "Pitch Black", "Royal Emerald"],
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80"
    ],
    ratings: 4.5,
    reviews: [],
    featured: false,
    newArrival: false,
    bestSeller: false,
    trending: true
  },
  {
    id: "prod-7",
    name: "Luxor Premium Chronograph Watch",
    sku: "ME-AC-007",
    barcode: "8905623818",
    description: "An elegant mastercraft time-piece for the modern professional. Built with scratch-resistant sapphire glass, precise Japanese quartz movement, fully operational calendar timers, and an exquisite genuine calfskin leather strap.",
    category: "Accessories",
    subCategory: "Watches",
    brand: "MEGNA ENTERPRISE",
    priceINR: 5499,
    priceBDT: 6450,
    discountPercent: 25,
    stock: 999999,
    sizes: ["Standard"],
    colors: ["Rose Gold Black", "Silver Blue"],
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80"
    ],
    ratings: 4.9,
    reviews: [
      { id: "rev-7-1", userName: "Kamran Ahmed", rating: 5, comment: "Absolute stunner. Looks and feels like a 20k watch.", date: "2026-06-27" }
    ],
    featured: true,
    newArrival: true,
    bestSeller: true,
    trending: true
  },
  {
    id: "prod-8",
    name: "Royal Baluchari Silk Saree",
    sku: "ME-DF-008",
    barcode: "8905623819",
    description: "Exquisite Baluchari Silk Saree featuring magnificent mythological handwoven motifs and standard golden zari threads. A signature luxury garment representing grand traditional aesthetics.",
    category: "Fashion",
    subCategory: "Sarees",
    brand: "MEGNA ENTERPRISE",
    priceINR: 12500,
    priceBDT: 14600,
    discountPercent: 15,
    stock: 999999,
    sizes: ["Free Size"],
    colors: ["Peacock Blue", "Deep Maroon-Gold"],
    images: [
      "https://images.unsplash.com/photo-1610030470201-94856f6ba3a6?w=600&auto=format&fit=crop&q=80"
    ],
    ratings: 4.9,
    reviews: [],
    featured: true,
    newArrival: true,
    bestSeller: false,
    trending: true
  },
  {
    id: "prod-9",
    name: "Exquisite Solitaire Diamond Necklace",
    sku: "ME-AC-009",
    barcode: "8905623820",
    description: "Make a breathtaking statement. Master-cut flawless brilliant solitaire diamond setting on 18K solid white gold chain. Handcrafted to perfection for state dinners and lifetime celebrations.",
    category: "Accessories",
    subCategory: "Jewelry",
    brand: "MEGNA ENTERPRISE",
    priceINR: 49999,
    priceBDT: 58500,
    discountPercent: 10,
    stock: 999999,
    sizes: ["Standard"],
    colors: ["White Gold"],
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80"
    ],
    ratings: 5.0,
    reviews: [],
    featured: true,
    newArrival: true,
    bestSeller: true,
    trending: true
  },
  {
    id: "prod-10",
    name: "Imperial Saffiano Calfskin Tote Handbag",
    sku: "ME-AC-010",
    barcode: "8905623821",
    description: "Designed for the sophisticated modern woman. Constructed from genuine scratch-resistant Saffiano calfskin leather with polished 24K gold plated brass hardware, dynamic compartments, and luxury velvet lining.",
    category: "Accessories",
    subCategory: "Bags",
    brand: "MEGNA ENTERPRISE",
    priceINR: 8499,
    priceBDT: 9950,
    discountPercent: 12,
    stock: 999999,
    sizes: ["Medium"],
    colors: ["Classic Tan", "Midnight Obsidian"],
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80"
    ],
    ratings: 4.8,
    reviews: [],
    featured: true,
    newArrival: false,
    bestSeller: true,
    trending: true
  },
  {
    id: "prod-11",
    name: "Monarch Velvet Designer Sherwani",
    sku: "ME-DF-011",
    barcode: "8905623822",
    description: "Crafted for monumental weddings and receptions. Features ultra-dense royal micro-velvet, embellished with exquisite gold hand-embroidery, custom buttons, and a matching pure silk inner kurta-pajama set.",
    category: "Fashion",
    subCategory: "Ethnic Wear",
    brand: "MEGNA ENTERPRISE",
    priceINR: 18999,
    priceBDT: 22200,
    discountPercent: 15,
    stock: 999999,
    sizes: ["L", "XL", "XXL"],
    colors: ["Royal Navy Gold", "Burgundy Gold"],
    images: [
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80"
    ],
    ratings: 4.9,
    reviews: [],
    featured: true,
    newArrival: true,
    bestSeller: false,
    trending: true
  },
  {
    id: "prod-12",
    name: "Sartorial Cashmere Blend Slim Blazer",
    sku: "ME-DF-012",
    barcode: "8905623823",
    description: "Meticulously structured Italian cashmere-wool blend slim-fit blazer. Delivers ultra-soft texture, natural drape, and supreme boardroom thermal warmth. Perfect for sharp modern luxury professional ensembles.",
    category: "Fashion",
    subCategory: "Outerwear",
    brand: "MEGNA ENTERPRISE",
    priceINR: 7999,
    priceBDT: 9350,
    discountPercent: 10,
    stock: 999999,
    sizes: ["38", "40", "42", "44"],
    colors: ["Charcoal Grey", "Deep Indigo"],
    images: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80"
    ],
    ratings: 4.7,
    reviews: [],
    featured: false,
    newArrival: true,
    bestSeller: true,
    trending: false
  },
  {
    id: "prod-13",
    name: "Aerofit Ultralight Carbon Trainers",
    sku: "ME-SH-013",
    barcode: "8905623824",
    description: "Engineered with integrated carbon-fiber active response plates and ultra-dense foam cushion rebounds. Delivers explosive performance energy response with lightweight breathable flywire technology.",
    category: "Footwear",
    subCategory: "Sneakers",
    brand: "MEGNA ENTERPRISE",
    priceINR: 4499,
    priceBDT: 5250,
    discountPercent: 10,
    stock: 999999,
    sizes: ["7", "8", "9", "10"],
    colors: ["Volt Yellow", "Triple Black"],
    images: [
      "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&auto=format&fit=crop&q=80"
    ],
    ratings: 4.8,
    reviews: [],
    featured: true,
    newArrival: true,
    bestSeller: true,
    trending: true
  },
  {
    id: "prod-14",
    name: "Regal Golden Pearl Drop Earrings",
    sku: "ME-AC-014",
    barcode: "8905623825",
    description: "Sourced flawless South Sea golden pearls elegantly suspended on handcrafted 22K solid yellow gold floral drop settings. Pure luxurious sophistication for celebratory evenings.",
    category: "Accessories",
    subCategory: "Jewelry",
    brand: "MEGNA ENTERPRISE",
    priceINR: 15499,
    priceBDT: 18100,
    discountPercent: 15,
    stock: 999999,
    sizes: ["Standard"],
    colors: ["Golden Yellow Gold"],
    images: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80"
    ],
    ratings: 4.9,
    reviews: [],
    featured: false,
    newArrival: true,
    bestSeller: false,
    trending: true
  },
  {
    id: "prod-15",
    name: "Elite Aviator polarized Sunglasses",
    sku: "ME-AC-015",
    barcode: "8905623826",
    description: "Ultralight aerospace-grade Japanese titanium frame aviators paired with premium polarized, glare-shattering emerald gradient protective lenses. Fully anti-reflective with customized silicone nosepads.",
    category: "Accessories",
    subCategory: "Eyewear",
    brand: "MEGNA ENTERPRISE",
    priceINR: 3999,
    priceBDT: 4680,
    discountPercent: 10,
    stock: 999999,
    sizes: ["Standard"],
    colors: ["Titanium Gunmetal"],
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80"
    ],
    ratings: 4.8,
    reviews: [],
    featured: false,
    newArrival: true,
    bestSeller: true,
    trending: true
  },
  {
    id: "prod-16",
    name: "Amber Oud Imperial Luxury Perfume",
    sku: "ME-AC-016",
    barcode: "8905623827",
    description: "An opulent fragrance journey. Concentrated perfume oil boasting base notes of warm natural Cambodian oud wood, rare white amber, spicy cardamon, and premium Damascus rose petals.",
    category: "Accessories",
    subCategory: "Fragrances",
    brand: "MEGNA ENTERPRISE",
    priceINR: 6499,
    priceBDT: 7600,
    discountPercent: 20,
    stock: 999999,
    sizes: ["100ml"],
    colors: ["Lux Crystal Gold"],
    images: [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&auto=format&fit=crop&q=80"
    ],
    ratings: 5.0,
    reviews: [],
    featured: true,
    newArrival: true,
    bestSeller: true,
    trending: true
  },
  {
    id: "prod-17",
    name: "Classic Leather Chelsea Boots",
    sku: "ME-SH-017",
    barcode: "8905623828",
    description: "Timeless Italian suede Chelsea boots constructed with dual elasticated side panels, custom pull tabs, and robust natural crepe shock-absorbing rubber soles.",
    category: "Footwear",
    subCategory: "Boots",
    brand: "MEGNA ENTERPRISE",
    priceINR: 5299,
    priceBDT: 6200,
    discountPercent: 12,
    stock: 999999,
    sizes: ["7", "8", "9", "10"],
    colors: ["Sand Suede", "Espresso Suede"],
    images: [
      "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&auto=format&fit=crop&q=80"
    ],
    ratings: 4.7,
    reviews: [],
    featured: false,
    newArrival: true,
    bestSeller: true,
    trending: true
  },
  {
    id: "prod-18",
    name: "Luxe Croco-Embossed Calf Wallet",
    sku: "ME-AC-018",
    barcode: "8905623829",
    description: "Elegantly slim bi-fold wallet meticulously handcrafted from genuine croco-embossed calf leather. Features multiple card slots, dedicated cash slot, and secure RFID defense shield lining.",
    category: "Accessories",
    subCategory: "Wallets",
    brand: "MEGNA ENTERPRISE",
    priceINR: 1999,
    priceBDT: 2350,
    discountPercent: 10,
    stock: 999999,
    sizes: ["Standard"],
    colors: ["Classic Cognac", "Obsidian Black"],
    images: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80"
    ],
    ratings: 4.8,
    reviews: [],
    featured: false,
    newArrival: false,
    bestSeller: true,
    trending: true
  }
];

const INITIAL_COUPONS: Coupon[] = [
  { code: "MEGNA10", discountPercent: 10, minSpendINR: 1000, minSpendBDT: 1200, isActive: true, expiryDate: "2027-12-31" },
  { code: "FESTIVE25", discountPercent: 25, minSpendINR: 4000, minSpendBDT: 4700, isActive: true, expiryDate: "2027-12-31" },
  { code: "EIDSPECIAL", discountPercent: 15, minSpendINR: 2000, minSpendBDT: 2400, isActive: true, expiryDate: "2027-12-31" }
];

const INITIAL_SETTINGS: SystemSettings = {
  paymentGateways: {
    india: { razorpay: true, phonepe: true, gpay: true, paytm: true, cod: true },
    bangladesh: { sslcommerz: true, bkash: true, nagad: true, rocket: true, cod: true }
  },
  inrToBdtRate: 1.17,
  taxPercent: 5,
  shippingChargeINR: 100,
  shippingChargeBDT: 120,
  announcement: "🎉 Monsoon Grand Sale! Get up to 25% extra off with coupon FESTIVE25. Free Shipping above ₹1500 / ৳1800! 🚚"
};

const INITIAL_USERS: User[] = [
  {
    id: "usr-megna-enterprise",
    username: "MEGNAENTERPRISE",
    email: "info@megnaenterprise.com",
    name: "MEGNA ENTERPRISE",
    passwordHash: "MegnaLuxe2026",
    role: "admin",
    phone: "+918250568500",
    addresses: [],
    wishlist: [],
    notifications: [
      { id: "notif-ad-megna", title: "Corporate Account Active", message: "MEGNA ENTERPRISE corporate credentials loaded successfully. Enjoy full store and administrative control.", date: "2026-07-01", read: false }
    ]
  },
  {
    id: "usr-admin",
    username: "MEGNAADMIN",
    email: "admin@megnaenterprise.com",
    name: "Megna Enterprise Admin",
    passwordHash: "123456", // Simple plain checking for rapid dev log-in
    role: "admin",
    phone: "+918250568500",
    addresses: [],
    wishlist: [],
    notifications: [
      { id: "notif-ad-1", title: "Welcome to MEGNA Admin", message: "Use this panel to manage orders, add catalog products, control payment options, and view sales intelligence reports.", date: "2026-07-01", read: false }
    ]
  },
  {
    id: "usr-demo",
    username: "customer1",
    email: "customer@demo.com",
    name: "Biman Das",
    passwordHash: "password123",
    role: "customer",
    phone: "+91 8250568500",
    addresses: [
      {
        id: "addr-1",
        type: "Shipping",
        addressLine1: "12 Garpar Road, Elite Enclave, Block B",
        city: "Kolkata",
        state: "West Bengal",
        postalCode: "700006",
        country: "India"
      }
    ],
    wishlist: ["prod-1", "prod-2"],
    profilePhoto: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    notifications: [
      { id: "notif-1", title: "Registration Successful", message: "Welcome to MEGNA Enterprise. Enjoy luxury clothing and footwear at wholesale prices.", date: "2026-06-29", read: false }
    ]
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: "ord-1",
    orderNumber: "ME-2026-1001",
    customerId: "usr-demo",
    customerName: "Biman Das",
    customerEmail: "customer@demo.com",
    customerPhone: "+91 8250568500",
    shippingAddress: {
      addressLine1: "12 Garpar Road, Elite Enclave, Block B",
      city: "Kolkata",
      state: "West Bengal",
      postalCode: "700006",
      country: "India"
    },
    billingAddress: {
      addressLine1: "12 Garpar Road, Elite Enclave, Block B",
      city: "Kolkata",
      state: "West Bengal",
      postalCode: "700006",
      country: "India"
    },
    items: [
      {
        productId: "prod-1",
        productName: "Megna Pro Elite Athletic Sneakers",
        sku: "ME-SH-001",
        size: "9",
        color: "Carbon Black",
        quantity: 1,
        price: 2974.15,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&auto=format&fit=crop&q=80"
      }
    ],
    currency: "INR",
    subtotal: 2974.15,
    discountAmount: 297.41,
    couponCodeUsed: "MEGNA10",
    shippingCharge: 100,
    tax: 133.83,
    total: 2910.57,
    paymentMethod: "Razorpay",
    paymentStatus: "Paid",
    orderStatus: "Delivered",
    createdAt: "2026-06-29T14:32:00.000Z",
    updatedAt: "2026-06-30T10:00:00.000Z"
  },
  {
    id: "ord-2",
    orderNumber: "ME-2026-1002",
    customerName: "Nusrat Begum (Guest)",
    customerEmail: "nusrat@guest.com",
    customerPhone: "+8801712345678",
    shippingAddress: {
      addressLine1: "House 45, Road 11, Banani",
      city: "Dhaka",
      state: "Dhaka Division",
      postalCode: "1213",
      country: "Bangladesh"
    },
    billingAddress: {
      addressLine1: "House 45, Road 11, Banani",
      city: "Dhaka",
      state: "Dhaka Division",
      postalCode: "1213",
      country: "Bangladesh"
    },
    items: [
      {
        productId: "prod-2",
        productName: "Royal Banarasi Silk Saree",
        sku: "ME-DF-002",
        size: "Free Size",
        color: "Royal Crimson",
        quantity: 1,
        price: 8400,
        image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=150&auto=format&fit=crop&q=80"
      }
    ],
    currency: "BDT",
    subtotal: 8400,
    discountAmount: 0,
    shippingCharge: 120,
    tax: 420,
    total: 8940,
    paymentMethod: "bKash",
    paymentStatus: "Paid",
    orderStatus: "Processing",
    createdAt: "2026-06-30T18:15:00.000Z",
    updatedAt: "2026-07-01T08:00:00.000Z"
  }
];

// Asynchronous SQL wrapper with localized error state logging
async function safeSqlWrite(callback: () => Promise<void>) {
  if (!sqlDb) return;
  try {
    await callback();
  } catch (error) {
    console.error("Async Cloud SQL write failed:", error);
  }
}

// Database CRUD Interface
export const db = {
  getProducts: () => readJSONFile<Product[]>("products.json", INITIAL_PRODUCTS),
  saveProducts: (products: Product[]) => {
    writeJSONFile("products.json", products);
    safeSqlWrite(async () => {
      for (const p of products) {
        await sqlDb!.insert(productsTable)
          .values({
            id: p.id,
            name: p.name,
            sku: p.sku,
            barcode: p.barcode,
            description: p.description,
            category: p.category,
            subCategory: p.subCategory,
            brand: p.brand,
            priceINR: p.priceINR,
            priceBDT: p.priceBDT,
            discountPercent: p.discountPercent,
            stock: p.stock,
            sizes: p.sizes,
            colors: p.colors,
            images: p.images,
            ratings: p.ratings,
            reviews: p.reviews,
            featured: p.featured,
            newArrival: p.newArrival,
            bestSeller: p.bestSeller,
            trending: p.trending,
            videoUrl: p.videoUrl,
            is360Gallery: p.is360Gallery,
          })
          .onConflictDoUpdate({
            target: productsTable.id,
            set: {
              name: p.name,
              sku: p.sku,
              barcode: p.barcode,
              description: p.description,
              category: p.category,
              subCategory: p.subCategory,
              brand: p.brand,
              priceINR: p.priceINR,
              priceBDT: p.priceBDT,
              discountPercent: p.discountPercent,
              stock: p.stock,
              sizes: p.sizes,
              colors: p.colors,
              images: p.images,
              ratings: p.ratings,
              reviews: p.reviews,
              featured: p.featured,
              newArrival: p.newArrival,
              bestSeller: p.bestSeller,
              trending: p.trending,
              videoUrl: p.videoUrl,
              is360Gallery: p.is360Gallery,
            }
          });
      }
    });
  },

  getUsers: () => readJSONFile<User[]>("users.json", INITIAL_USERS),
  saveUsers: (users: User[]) => {
    writeJSONFile("users.json", users);
    safeSqlWrite(async () => {
      for (const u of users) {
        await sqlDb!.insert(usersTable)
          .values({
            id: u.id,
            username: u.username,
            email: u.email,
            name: u.name,
            passwordHash: u.passwordHash,
            role: u.role,
            phone: u.phone,
            addresses: u.addresses,
            wishlist: u.wishlist,
            profilePhoto: u.profilePhoto,
            notifications: u.notifications,
          })
          .onConflictDoUpdate({
            target: usersTable.id,
            set: {
              username: u.username,
              email: u.email,
              name: u.name,
              passwordHash: u.passwordHash,
              role: u.role,
              phone: u.phone,
              addresses: u.addresses,
              wishlist: u.wishlist,
              profilePhoto: u.profilePhoto,
              notifications: u.notifications,
            }
          });
      }
    });
  },

  getOrders: () => readJSONFile<Order[]>("orders.json", INITIAL_ORDERS),
  saveOrders: (orders: Order[]) => {
    writeJSONFile("orders.json", orders);
    safeSqlWrite(async () => {
      for (const o of orders) {
        await sqlDb!.insert(ordersTable)
          .values({
            id: o.id,
            orderNumber: o.orderNumber,
            customerId: o.customerId,
            customerName: o.customerName,
            customerEmail: o.customerEmail,
            customerPhone: o.customerPhone,
            shippingAddress: o.shippingAddress,
            billingAddress: o.billingAddress,
            items: o.items,
            currency: o.currency,
            subtotal: o.subtotal,
            discountAmount: o.discountAmount,
            couponCodeUsed: o.couponCodeUsed,
            shippingCharge: o.shippingCharge,
            tax: o.tax,
            total: o.total,
            paymentMethod: o.paymentMethod,
            paymentStatus: o.paymentStatus,
            orderStatus: o.orderStatus,
            orderNotes: o.orderNotes,
            createdAt: o.createdAt ? new Date(o.createdAt) : new Date(),
            updatedAt: o.updatedAt ? new Date(o.updatedAt) : new Date(),
          })
          .onConflictDoUpdate({
            target: ordersTable.id,
            set: {
              orderNumber: o.orderNumber,
              customerId: o.customerId,
              customerName: o.customerName,
              customerEmail: o.customerEmail,
              customerPhone: o.customerPhone,
              shippingAddress: o.shippingAddress,
              billingAddress: o.billingAddress,
              items: o.items,
              currency: o.currency,
              subtotal: o.subtotal,
              discountAmount: o.discountAmount,
              couponCodeUsed: o.couponCodeUsed,
              shippingCharge: o.shippingCharge,
              tax: o.tax,
              total: o.total,
              paymentMethod: o.paymentMethod,
              paymentStatus: o.paymentStatus,
              orderStatus: o.orderStatus,
              orderNotes: o.orderNotes,
              updatedAt: new Date()
            }
          });
      }
    });
  },

  getCoupons: () => readJSONFile<Coupon[]>("coupons.json", INITIAL_COUPONS),
  saveCoupons: (coupons: Coupon[]) => {
    writeJSONFile("coupons.json", coupons);
    safeSqlWrite(async () => {
      for (const c of coupons) {
        await sqlDb!.insert(couponsTable)
          .values({
            code: c.code,
            discountPercent: c.discountPercent,
            minSpendINR: c.minSpendINR,
            minSpendBDT: c.minSpendBDT,
            isActive: c.isActive,
            expiryDate: c.expiryDate,
          })
          .onConflictDoUpdate({
            target: couponsTable.code,
            set: {
              discountPercent: c.discountPercent,
              minSpendINR: c.minSpendINR,
              minSpendBDT: c.minSpendBDT,
              isActive: c.isActive,
              expiryDate: c.expiryDate,
            }
          });
      }
    });
  },

  getSettings: () => readJSONFile<SystemSettings>("settings.json", INITIAL_SETTINGS),
  saveSettings: (settings: SystemSettings) => {
    writeJSONFile("settings.json", settings);
    safeSqlWrite(async () => {
      await sqlDb!.insert(systemSettingsTable)
        .values({
          id: "default",
          paymentGateways: settings.paymentGateways,
          inrToBdtRate: settings.inrToBdtRate,
          taxPercent: settings.taxPercent,
          shippingChargeINR: settings.shippingChargeINR,
          shippingChargeBDT: settings.shippingChargeBDT,
          announcement: settings.announcement,
        })
        .onConflictDoUpdate({
          target: systemSettingsTable.id,
          set: {
            paymentGateways: settings.paymentGateways,
            inrToBdtRate: settings.inrToBdtRate,
            taxPercent: settings.taxPercent,
            shippingChargeINR: settings.shippingChargeINR,
            shippingChargeBDT: settings.shippingChargeBDT,
            announcement: settings.announcement,
            updatedAt: new Date()
          }
        });
    });
  },

  getActivityLogs: () => readJSONFile<ActivityLog[]>("activityLogs.json", [
    { id: "log-1", action: "Database Initialized", user: "SYSTEM", date: "2026-07-01T09:30:00.000Z", details: "Initial high-quality seed products written successfully." }
  ]),
  saveActivityLogs: (logs: ActivityLog[]) => {
    writeJSONFile("activityLogs.json", logs);
    safeSqlWrite(async () => {
      for (const l of logs) {
        await sqlDb!.insert(activityLogsTable)
          .values({
            id: l.id,
            action: l.action,
            user: l.user,
            details: l.details,
            createdAt: l.date ? new Date(l.date) : new Date(),
          })
          .onConflictDoUpdate({
            target: activityLogsTable.id,
            set: {
              action: l.action,
              user: l.user,
              details: l.details,
            }
          });
      }
    });
  },

  logActivity: (action: string, user: string, details?: string) => {
    const logs = db.getActivityLogs();
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      action,
      user,
      date: new Date().toISOString(),
      details
    };
    logs.unshift(newLog); // newest first
    db.saveActivityLogs(logs.slice(0, 500)); // Keep last 500
  }
};

// Background synchronization on startup to align with Cloud SQL
async function syncLocalToSql() {
  if (!sqlDb) {
    console.warn("Cloud SQL Drizzle connection is not initialized. Skipping automatic pre-seeding.");
    return;
  }
  try {
    console.log("Beginning automatic synchronisation of local store JSON database to Cloud SQL PostgreSQL...");

    // Force refresh products JSON with unlimited stock items if there is any mismatch in count or stocks
    const currentProds = db.getProducts();
    if (currentProds.length < INITIAL_PRODUCTS.length || currentProds.some(p => p.stock !== 999999)) {
      console.log("Forcing data fill: Overwriting products.json with unlimited stock products...");
      writeJSONFile("products.json", INITIAL_PRODUCTS);
    }

    // Sync System Settings
    const localSettings = db.getSettings();
    await sqlDb.insert(systemSettingsTable)
      .values({
        id: "default",
        paymentGateways: localSettings.paymentGateways,
        inrToBdtRate: localSettings.inrToBdtRate,
        taxPercent: localSettings.taxPercent,
        shippingChargeINR: localSettings.shippingChargeINR,
        shippingChargeBDT: localSettings.shippingChargeBDT,
        announcement: localSettings.announcement,
      })
      .onConflictDoUpdate({
        target: systemSettingsTable.id,
        set: {
          paymentGateways: localSettings.paymentGateways,
          inrToBdtRate: localSettings.inrToBdtRate,
          taxPercent: localSettings.taxPercent,
          shippingChargeINR: localSettings.shippingChargeINR,
          shippingChargeBDT: localSettings.shippingChargeBDT,
          announcement: localSettings.announcement,
          updatedAt: new Date()
        }
      });

    // Sync Products
    const localProducts = db.getProducts();
    for (const p of localProducts) {
      await sqlDb.insert(productsTable)
        .values({
          id: p.id,
          name: p.name,
          sku: p.sku,
          barcode: p.barcode,
          description: p.description,
          category: p.category,
          subCategory: p.subCategory,
          brand: p.brand,
          priceINR: p.priceINR,
          priceBDT: p.priceBDT,
          discountPercent: p.discountPercent,
          stock: p.stock,
          sizes: p.sizes,
          colors: p.colors,
          images: p.images,
          ratings: p.ratings,
          reviews: p.reviews,
          featured: p.featured,
          newArrival: p.newArrival,
          bestSeller: p.bestSeller,
          trending: p.trending,
          videoUrl: p.videoUrl,
          is360Gallery: p.is360Gallery,
        })
        .onConflictDoUpdate({
          target: productsTable.id,
          set: {
            name: p.name,
            sku: p.sku,
            barcode: p.barcode,
            description: p.description,
            category: p.category,
            subCategory: p.subCategory,
            brand: p.brand,
            priceINR: p.priceINR,
            priceBDT: p.priceBDT,
            discountPercent: p.discountPercent,
            stock: p.stock,
            sizes: p.sizes,
            colors: p.colors,
            images: p.images,
            ratings: p.ratings,
            reviews: p.reviews,
            featured: p.featured,
            newArrival: p.newArrival,
            bestSeller: p.bestSeller,
            trending: p.trending,
            videoUrl: p.videoUrl,
            is360Gallery: p.is360Gallery,
          }
        });
    }

    // Sync Users
    const localUsers = db.getUsers();
    for (const u of localUsers) {
      await sqlDb.insert(usersTable)
        .values({
          id: u.id,
          username: u.username,
          email: u.email,
          name: u.name,
          passwordHash: u.passwordHash,
          role: u.role,
          phone: u.phone,
          addresses: u.addresses,
          wishlist: u.wishlist,
          profilePhoto: u.profilePhoto,
          notifications: u.notifications,
        })
        .onConflictDoUpdate({
          target: usersTable.id,
          set: {
            username: u.username,
            email: u.email,
            name: u.name,
            passwordHash: u.passwordHash,
            role: u.role,
            phone: u.phone,
            addresses: u.addresses,
            wishlist: u.wishlist,
            profilePhoto: u.profilePhoto,
            notifications: u.notifications,
          }
        });
    }

    // Sync Coupons
    const localCoupons = db.getCoupons();
    for (const c of localCoupons) {
      await sqlDb.insert(couponsTable)
        .values({
          code: c.code,
          discountPercent: c.discountPercent,
          minSpendINR: c.minSpendINR,
          minSpendBDT: c.minSpendBDT,
          isActive: c.isActive,
          expiryDate: c.expiryDate,
        })
        .onConflictDoUpdate({
          target: couponsTable.code,
          set: {
            discountPercent: c.discountPercent,
            minSpendINR: c.minSpendINR,
            minSpendBDT: c.minSpendBDT,
            isActive: c.isActive,
            expiryDate: c.expiryDate,
          }
        });
    }

    // Sync Orders
    const localOrders = db.getOrders();
    for (const o of localOrders) {
      await sqlDb.insert(ordersTable)
        .values({
          id: o.id,
          orderNumber: o.orderNumber,
          customerId: o.customerId,
          customerName: o.customerName,
          customerEmail: o.customerEmail,
          customerPhone: o.customerPhone,
          shippingAddress: o.shippingAddress,
          billingAddress: o.billingAddress,
          items: o.items,
          currency: o.currency,
          subtotal: o.subtotal,
          discountAmount: o.discountAmount,
          couponCodeUsed: o.couponCodeUsed,
          shippingCharge: o.shippingCharge,
          tax: o.tax,
          total: o.total,
          paymentMethod: o.paymentMethod,
          paymentStatus: o.paymentStatus,
          orderStatus: o.orderStatus,
          orderNotes: o.orderNotes,
          createdAt: o.createdAt ? new Date(o.createdAt) : new Date(),
          updatedAt: o.updatedAt ? new Date(o.updatedAt) : new Date(),
        })
        .onConflictDoUpdate({
          target: ordersTable.id,
          set: {
            orderNumber: o.orderNumber,
            customerId: o.customerId,
            customerName: o.customerName,
            customerEmail: o.customerEmail,
            customerPhone: o.customerPhone,
            shippingAddress: o.shippingAddress,
            billingAddress: o.billingAddress,
            items: o.items,
            currency: o.currency,
            subtotal: o.subtotal,
            discountAmount: o.discountAmount,
            couponCodeUsed: o.couponCodeUsed,
            shippingCharge: o.shippingCharge,
            tax: o.tax,
            total: o.total,
            paymentMethod: o.paymentMethod,
            paymentStatus: o.paymentStatus,
            orderStatus: o.orderStatus,
            orderNotes: o.orderNotes,
            updatedAt: new Date()
          }
        });
    }

    // Sync Activity Logs
    const localLogs = db.getActivityLogs();
    for (const l of localLogs) {
      await sqlDb.insert(activityLogsTable)
        .values({
          id: l.id,
          action: l.action,
          user: l.user,
          details: l.details,
          createdAt: l.date ? new Date(l.date) : new Date(),
        })
        .onConflictDoUpdate({
          target: activityLogsTable.id,
          set: {
            action: l.action,
            user: l.user,
            details: l.details,
          }
        });
    }

    console.log("Automatic pre-seeding alignment to Cloud SQL PostgreSQL completed successfully!");
  } catch (err) {
    console.error("Failed to run startup automatic synchronization to Cloud SQL:", err);
  }
}

// Boot synchronization task delayed slightly to ensure connection pool setup
setTimeout(() => {
  syncLocalToSql();
}, 2000);
