/**
 * MEGNA ENTERPRISE - Frontend API Client
 * Decoupled data-fetching and state utilities to prevent massive App.tsx files
 */

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
}

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
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
  wishlist: string[];
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
  price: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
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

const API_BASE = ""; // Relative calls handled by Vite proxy in dev, express static in production

export const api = {
  // Helper to append Authorization headers
  getHeaders(token?: string | null) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const t = token || localStorage.getItem("megna_token");
    if (t) {
      headers["Authorization"] = `Bearer ${t}`;
    }
    return headers;
  },

  async login(username: string, password: string) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Login failed");
    }
    return res.json();
  },

  async register(data: any) {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Registration failed");
    }
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error("Unauthorized");
    return res.json();
  },

  async updateProfile(data: any) {
    const res = await fetch(`${API_BASE}/api/auth/profile`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async toggleWishlist(productId: string) {
    const res = await fetch(`${API_BASE}/api/auth/wishlist`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ productId }),
    });
    return res.json();
  },

  async readNotifications() {
    const res = await fetch(`${API_BASE}/api/auth/notifications/read`, {
      method: "POST",
      headers: this.getHeaders(),
    });
    return res.json();
  },

  // Products
  async getProducts(params: Record<string, string | number | undefined> = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== "") {
        searchParams.append(key, String(val));
      }
    });
    const res = await fetch(`${API_BASE}/api/products?${searchParams.toString()}`);
    return res.json();
  },

  async getProduct(id: string) {
    const res = await fetch(`${API_BASE}/api/products/${id}`);
    if (!res.ok) throw new Error("Product not found");
    return res.json();
  },

  async addReview(productId: string, userName: string, rating: number, comment: string) {
    const res = await fetch(`${API_BASE}/api/products/${productId}/reviews`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ userName, rating, comment }),
    });
    return res.json();
  },

  // Admin Products
  async adminCreateProduct(productData: any) {
    const res = await fetch(`${API_BASE}/api/products`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(productData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create product");
    }
    return res.json();
  },

  async adminUpdateProduct(id: string, productData: any) {
    const res = await fetch(`${API_BASE}/api/products/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(productData),
    });
    return res.json();
  },

  async adminDeleteProduct(id: string) {
    const res = await fetch(`${API_BASE}/api/products/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return res.json();
  },

  // Orders
  async getOrders() {
    const res = await fetch(`${API_BASE}/api/orders`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error("Failed to fetch orders: Unauthorized or Server Error");
    }
    const data = await res.json();
    if (!Array.isArray(data)) {
      throw new Error("Orders response is not an array");
    }
    return data;
  },

  async getOrder(idOrNum: string) {
    const res = await fetch(`${API_BASE}/api/orders/${idOrNum}`);
    if (!res.ok) throw new Error("Order not found");
    return res.json();
  },

  async placeOrder(orderData: any) {
    const res = await fetch(`${API_BASE}/api/orders`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(orderData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Order failed");
    }
    return res.json();
  },

  async adminUpdateOrderStatus(id: string, orderStatus: string, paymentStatus?: string) {
    const res = await fetch(`${API_BASE}/api/orders/${id}/status`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify({ orderStatus, paymentStatus }),
    });
    return res.json();
  },

  // Coupons
  async getCoupons() {
    const res = await fetch(`${API_BASE}/api/coupons`);
    return res.json();
  },

  async createCoupon(couponData: any) {
    const res = await fetch(`${API_BASE}/api/coupons`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(couponData),
    });
    return res.json();
  },

  async deleteCoupon(code: string) {
    const res = await fetch(`${API_BASE}/api/coupons/${code}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return res.json();
  },

  // Settings
  async getSettings() {
    const res = await fetch(`${API_BASE}/api/settings`);
    return res.json();
  },

  async updateSettings(settings: any) {
    const res = await fetch(`${API_BASE}/api/settings`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(settings),
    });
    return res.json();
  },

  // Audit Logs
  async getLogs() {
    const res = await fetch(`${API_BASE}/api/logs`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error("Failed to fetch logs: Unauthorized or Server Error");
    }
    const data = await res.json();
    if (!Array.isArray(data)) {
      throw new Error("Logs response is not an array");
    }
    return data;
  },

  // AI Stylist Chat
  async askStylist(message: string, chatHistory: { role: string; text: string }[]) {
    const res = await fetch(`${API_BASE}/api/ai-stylist`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ message, chatHistory }),
    });
    return res.json();
  }
};
