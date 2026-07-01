import React, { useState, useEffect } from "react";
import {
  Sparkles,
  TrendingUp,
  ShoppingBag,
  Users,
  Percent,
  Settings,
  ListRestart,
  Plus,
  Trash2,
  Copy,
  Edit3,
  Globe,
  DollarSign,
  AlertTriangle,
  Save,
  CheckCircle,
  RefreshCw,
  Calculator,
  Megaphone,
  Printer,
  FileText
} from "lucide-react";
import { api, Product, Coupon, SystemSettings, ActivityLog, Order } from "../api-client";

interface AdminPanelProps {
  user: any;
  onLoginSuccess: (user: any, token: string) => void;
  currency: "INR" | "BDT";
  allProducts: Product[];
  onRefreshProducts: () => void;
}

export default function AdminPanel({ user, onLoginSuccess, currency, allProducts, onRefreshProducts }: AdminPanelProps) {
  const [activeAdminTab, setActiveAdminTab] = useState<"analytics" | "products" | "coupons" | "settings" | "logs">("analytics");

  // Admin states
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Admin Auth States
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Product Add/Edit states
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);

  // Coupon Form state
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponPct, setNewCouponPct] = useState(10);
  const [minSpendInr, setMinSpendInr] = useState(1000);
  const [minSpendBdt, setMinSpendBdt] = useState(1200);

  // Settings custom states
  const [settingsNotification, setSettingsNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [demoBasketPrice, setDemoBasketPrice] = useState(1500);
  const [demoBasketCurrency, setDemoBasketCurrency] = useState<"INR" | "BDT">("INR");

  // Multi-product Selection and Bulk Update States
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
  
  // Bulk Edit Parameter States
  const [bulkPriceMode, setBulkPriceMode] = useState<"none" | "set" | "percent" | "offset">("none");
  const [bulkPriceINR, setBulkPriceINR] = useState<number>(0);
  const [bulkPriceBDT, setBulkPriceBDT] = useState<number>(0);
  const [bulkPricePercent, setBulkPricePercent] = useState<number>(0); // e.g. 10 for +10%, -5 for -5%
  const [bulkPriceOffsetINR, setBulkPriceOffsetINR] = useState<number>(0);
  const [bulkPriceOffsetBDT, setBulkPriceOffsetBDT] = useState<number>(0);

  const [bulkDiscountMode, setBulkDiscountMode] = useState<"none" | "set" | "offset">("none");
  const [bulkDiscountPercent, setBulkDiscountPercent] = useState<number>(0);
  const [bulkDiscountOffset, setBulkDiscountOffset] = useState<number>(0);

  const [bulkStockMode, setBulkStockMode] = useState<"none" | "set" | "offset" | "unlimited">("none");
  const [bulkStock, setBulkStock] = useState<number>(0);
  const [bulkStockOffset, setBulkStockOffset] = useState<number>(0);

  const [bulkFeaturedMode, setBulkFeaturedMode] = useState<"none" | "on" | "off">("none");
  const [bulkNewArrivalMode, setBulkNewArrivalMode] = useState<"none" | "on" | "off">("none");
  const [bulkBestSellerMode, setBulkBestSellerMode] = useState<"none" | "on" | "off">("none");
  const [bulkTrendingMode, setBulkTrendingMode] = useState<"none" | "on" | "off">("none");

  const [bulkIsUpdating, setBulkIsUpdating] = useState(false);
  const [bulkUpdateError, setBulkUpdateError] = useState("");
  const [bulkUpdateSuccess, setBulkUpdateSuccess] = useState("");

  // Invoice Printing state
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  // JSON Importer state
  const [showJsonImportModal, setShowJsonImportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState("");
  const [importJsonError, setImportJsonError] = useState("");
  const [importJsonSuccess, setImportJsonSuccess] = useState("");
  const [isImportingJson, setIsImportingJson] = useState(false);

  useEffect(() => {
    if (user && user.role === "admin") {
      loadAdminData();
    }
  }, [user]);

  const handleAdminLogin = async (e?: React.FormEvent, customUser?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    const u = customUser || loginUsername;
    const p = customPass || loginPassword;
    try {
      const res = await api.login(u, p);
      if (res.user && res.user.role === "admin") {
        onLoginSuccess(res.user, res.token);
      } else {
        setLoginError("This account does not have administrator privileges.");
      }
    } catch (err: any) {
      setLoginError(err.message || "Failed to authenticate.");
    } finally {
      setLoginLoading(false);
    }
  };

  const loadAdminData = async () => {
    try {
      const ords = await api.getOrders();
      setOrders(Array.isArray(ords) ? ords : []);

      const coups = await api.getCoupons();
      setCoupons(Array.isArray(coups) ? coups : []);

      const sets = await api.getSettings();
      setSettings(sets);

      const logs = await api.getLogs();
      setActivityLogs(Array.isArray(logs) ? logs : []);
    } catch (err) {
      console.error("Admin data loading error", err);
      setOrders([]);
      setCoupons([]);
      setActivityLogs([]);
    }
  };

  // Create or Update Product
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name) return;

    try {
      const defaultProduct = {
        name: editingProduct.name,
        category: editingProduct.category || "Footwear",
        subCategory: editingProduct.subCategory || "Sneakers",
        brand: editingProduct.brand || "MEGNA ENTERPRISE",
        priceINR: Number(editingProduct.priceINR || 1000),
        priceBDT: Number(editingProduct.priceBDT || 1200),
        discountPercent: Number(editingProduct.discountPercent || 0),
        stock: Number(editingProduct.stock || 10),
        description: editingProduct.description || "Premium Megna Silhouette.",
        sizes: editingProduct.sizes && editingProduct.sizes.length ? editingProduct.sizes : ["7", "8", "9", "10"],
        colors: editingProduct.colors && editingProduct.colors.length ? editingProduct.colors : ["Classic Black", "Pure White"],
        images: editingProduct.images && editingProduct.images.length ? editingProduct.images : [
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"
        ],
        featured: !!editingProduct.featured,
        newArrival: !!editingProduct.newArrival,
        bestSeller: !!editingProduct.bestSeller,
        trending: !!editingProduct.trending,
      };

      if (editingProduct.id) {
        await api.adminUpdateProduct(editingProduct.id, defaultProduct);
      } else {
        await api.adminCreateProduct(defaultProduct);
      }

      setEditingProduct(null);
      setShowProductForm(false);
      onRefreshProducts();
      loadAdminData();
    } catch (err) {
      alert("Error saving product catalog entry.");
    }
  };

  // Bulk Import Products via JSON
  const handleJsonImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportJsonError("");
    setImportJsonSuccess("");
    setIsImportingJson(true);

    try {
      if (!importJsonText.trim()) {
        throw new Error("JSON payload cannot be empty.");
      }

      let parsed: any;
      try {
        parsed = JSON.parse(importJsonText.trim());
      } catch (err: any) {
        throw new Error(`Invalid JSON syntax: ${err.message}`);
      }

      // Convert single object to array of one element for unified processing
      const itemsToImport = Array.isArray(parsed) ? parsed : [parsed];

      if (itemsToImport.length === 0) {
        throw new Error("JSON array must contain at least one item.");
      }

      // Validation check
      const validatedItems: any[] = [];
      for (let i = 0; i < itemsToImport.length; i++) {
        const item = itemsToImport[i];
        if (!item.name) {
          throw new Error(`Item at index ${i} is missing the required 'name' field.`);
        }
        if (item.priceINR === undefined) {
          throw new Error(`Item '${item.name}' is missing the required 'priceINR' field.`);
        }
        if (item.priceBDT === undefined) {
          throw new Error(`Item '${item.name}' is missing the required 'priceBDT' field.`);
        }

        const validItem = {
          name: String(item.name),
          category: item.category || "Footwear",
          subCategory: item.subCategory || "Sneakers",
          brand: item.brand || "MEGNA ENTERPRISE",
          priceINR: Number(item.priceINR),
          priceBDT: Number(item.priceBDT),
          discountPercent: Number(item.discountPercent || 0),
          stock: Number(item.stock !== undefined ? item.stock : 999999),
          description: String(item.description || "Premium Megna Silhouette."),
          sizes: Array.isArray(item.sizes) ? item.sizes.map(String) : ["7", "8", "9", "10"],
          colors: Array.isArray(item.colors) ? item.colors.map(String) : ["Classic Black", "Pure White"],
          images: Array.isArray(item.images) ? item.images.map(String) : [
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"
          ],
          featured: !!item.featured,
          newArrival: !!item.newArrival,
          bestSeller: !!item.bestSeller,
          trending: !!item.trending,
        };
        validatedItems.push(validItem);
      }

      // Import sequentially via API
      let successCount = 0;
      for (const item of validatedItems) {
        await api.adminCreateProduct(item);
        successCount++;
      }

      setImportJsonSuccess(`Successfully imported ${successCount} products into store database!`);
      setImportJsonText("");
      onRefreshProducts();
      loadAdminData();
      
      // Keep modal open for a brief period then close
      setTimeout(() => {
        setShowJsonImportModal(false);
        setImportJsonSuccess("");
      }, 2000);

    } catch (err: any) {
      console.error("JSON Import Error:", err);
      setImportJsonError(err.message || "An unexpected error occurred during import.");
    } finally {
      setIsImportingJson(false);
    }
  };

  // Bulk update selected products inventory logic
  const handleBulkUpdateProducts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductIds.length) {
      setBulkUpdateError("No products selected for bulk update.");
      return;
    }

    setBulkIsUpdating(true);
    setBulkUpdateError("");
    setBulkUpdateSuccess("");

    try {
      let updatedCount = 0;
      for (const id of selectedProductIds) {
        const prod = allProducts.find((p) => p.id === id);
        if (!prod) continue;

        // Clone details
        const updateData: any = {
          name: prod.name,
          category: prod.category,
          subCategory: prod.subCategory,
          brand: prod.brand,
          priceINR: prod.priceINR,
          priceBDT: prod.priceBDT,
          discountPercent: prod.discountPercent,
          stock: prod.stock,
          description: prod.description,
          sizes: prod.sizes,
          colors: prod.colors,
          images: prod.images,
          featured: prod.featured,
          newArrival: prod.newArrival,
          bestSeller: prod.bestSeller,
          trending: prod.trending,
        };

        // Price Update Logic
        if (bulkPriceMode === "set") {
          if (bulkPriceINR > 0) updateData.priceINR = bulkPriceINR;
          if (bulkPriceBDT > 0) updateData.priceBDT = bulkPriceBDT;
        } else if (bulkPriceMode === "percent") {
          if (bulkPricePercent !== 0) {
            updateData.priceINR = Math.max(1, Math.round(prod.priceINR * (1 + bulkPricePercent / 100)));
            updateData.priceBDT = Math.max(1, Math.round(prod.priceBDT * (1 + bulkPricePercent / 100)));
          }
        } else if (bulkPriceMode === "offset") {
          if (bulkPriceOffsetINR !== 0) updateData.priceINR = Math.max(1, prod.priceINR + bulkPriceOffsetINR);
          if (bulkPriceOffsetBDT !== 0) updateData.priceBDT = Math.max(1, prod.priceBDT + bulkPriceOffsetBDT);
        }

        // Discount Update Logic
        if (bulkDiscountMode === "set") {
          updateData.discountPercent = Math.max(0, Math.min(100, bulkDiscountPercent));
        } else if (bulkDiscountMode === "offset") {
          if (bulkDiscountOffset !== 0) {
            updateData.discountPercent = Math.max(0, Math.min(100, prod.discountPercent + bulkDiscountOffset));
          }
        }

        // Stock Update Logic
        if (bulkStockMode === "set") {
          updateData.stock = Math.max(0, bulkStock);
        } else if (bulkStockMode === "offset") {
          if (bulkStockOffset !== 0) {
            updateData.stock = Math.max(0, prod.stock + bulkStockOffset);
          }
        } else if (bulkStockMode === "unlimited") {
          updateData.stock = 999999;
        }

        // Badges Update Logic
        if (bulkFeaturedMode === "on") updateData.featured = true;
        if (bulkFeaturedMode === "off") updateData.featured = false;

        if (bulkNewArrivalMode === "on") updateData.newArrival = true;
        if (bulkNewArrivalMode === "off") updateData.newArrival = false;

        if (bulkBestSellerMode === "on") updateData.bestSeller = true;
        if (bulkBestSellerMode === "off") updateData.bestSeller = false;

        if (bulkTrendingMode === "on") updateData.trending = true;
        if (bulkTrendingMode === "off") updateData.trending = false;

        // Call Update API
        await api.adminUpdateProduct(id, updateData);
        updatedCount++;
      }

      setBulkUpdateSuccess(`Successfully updated ${updatedCount} products simultaneously!`);
      setSelectedProductIds([]);
      onRefreshProducts();
      loadAdminData();
      
      // Auto close success notification after 4 seconds
      setTimeout(() => {
        setShowBulkUpdateModal(false);
        setBulkUpdateSuccess("");
        // Reset controls
        setBulkPriceMode("none");
        setBulkPriceINR(0);
        setBulkPriceBDT(0);
        setBulkPricePercent(0);
        setBulkPriceOffsetINR(0);
        setBulkPriceOffsetBDT(0);
        setBulkDiscountMode("none");
        setBulkDiscountPercent(0);
        setBulkDiscountOffset(0);
        setBulkStockMode("none");
        setBulkStock(0);
        setBulkStockOffset(0);
        setBulkFeaturedMode("none");
        setBulkNewArrivalMode("none");
        setBulkBestSellerMode("none");
        setBulkTrendingMode("none");
      }, 3000);

    } catch (err: any) {
      setBulkUpdateError(err.message || "Failed to batch update selected products.");
    } finally {
      setBulkIsUpdating(false);
    }
  };

  const handleToggleProductSelection = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const toggleSelectAllProducts = () => {
    if (selectedProductIds.length === allProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(allProducts.map((p) => p.id));
    }
  };

  const handleDuplicateProduct = async (prod: Product) => {
    try {
      const duplicated = {
        ...prod,
        id: undefined,
        name: `${prod.name} (Copy)`,
        sku: `${prod.sku}-COPY`,
        barcode: `${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
        reviews: [],
        ratings: 5.0
      };
      await api.adminCreateProduct(duplicated);
      onRefreshProducts();
      loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product catalog entry?")) return;
    try {
      await api.adminDeleteProduct(id);
      onRefreshProducts();
      loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string, payStatus?: string) => {
    try {
      await api.adminUpdateOrderStatus(orderId, status, payStatus);
      loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;

    try {
      await api.createCoupon({
        code: newCouponCode.trim().toUpperCase(),
        discountPercent: Number(newCouponPct),
        minSpendINR: Number(minSpendInr),
        minSpendBDT: Number(minSpendBdt)
      });
      setNewCouponCode("");
      setNewCouponPct(10);
      loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    try {
      await api.deleteCoupon(code);
      loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleGateway = async (country: "india" | "bangladesh", gateway: string) => {
    if (!settings) return;
    const updatedGateways = { ...settings.paymentGateways };
    updatedGateways[country] = {
      ...updatedGateways[country],
      [gateway]: !(updatedGateways[country] as any)[gateway]
    };

    try {
      const updated = await api.updateSettings({ paymentGateways: updatedGateways });
      setSettings(updated);
      setSettingsNotification({ type: "success", message: `Updated payment options for ${country === "india" ? "India" : "Bangladesh"}!` });
      setTimeout(() => setSettingsNotification(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAllSettings = async () => {
    if (!settings) return;
    
    // Validations
    if (settings.taxPercent < 0 || settings.taxPercent > 100) {
      setSettingsNotification({ type: "error", message: "Dynamic Tax Percent must be between 0% and 100%." });
      return;
    }
    if (settings.shippingChargeINR < 0 || settings.shippingChargeBDT < 0) {
      setSettingsNotification({ type: "error", message: "Shipping charges cannot be negative." });
      return;
    }
    if (settings.inrToBdtRate <= 0) {
      setSettingsNotification({ type: "error", message: "Currency exchange multiplier must be positive and greater than 0." });
      return;
    }

    setIsSavingSettings(true);
    setSettingsNotification(null);

    try {
      const updated = await api.updateSettings(settings);
      setSettings(updated);
      setSettingsNotification({ type: "success", message: "Global system parameters and operational settings saved successfully!" });
      onRefreshProducts();
      setTimeout(() => {
        setSettingsNotification(null);
      }, 5000);
    } catch (err: any) {
      setSettingsNotification({ type: "error", message: err.message || "Failed to save operational settings." });
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Compute key sales performance indicators
  const totalSalesINR = orders
    .filter((o) => o.currency === "INR" && o.paymentStatus === "Paid")
    .reduce((sum, o) => sum + o.total, 0);

  const totalSalesBDT = orders
    .filter((o) => o.currency === "BDT" && o.paymentStatus === "Paid")
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrdersCount = orders.filter((o) => o.orderStatus === "Pending").length;
  const stockAlerts = allProducts.filter((p) => p.stock <= 10);

  if (!user || user.role !== "admin") {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white border border-gray-150 shadow-xs space-y-6 text-[#1a1a1a]">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mx-auto text-orange-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black tracking-tight uppercase">ADMIN CONTROL CENTRE</h2>
          <p className="text-xs text-gray-500">
            Secure connection required. Please verify your administrative credentials to access sales pipelines and system configuration.
          </p>
        </div>

        {loginError && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs font-medium">
            ⚠️ {loginError}
          </div>
        )}

        <form onSubmit={(e) => handleAdminLogin(e)} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Admin Username
            </label>
            <input
              type="text"
              required
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-black font-mono"
              placeholder="e.g. MEGNAADMIN"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Secret Password
            </label>
            <input
              type="password"
              required
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-black font-mono"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loginLoading}
            className="w-full py-2.5 bg-black hover:bg-orange-600 text-white text-[11px] font-bold uppercase tracking-widest transition-all disabled:opacity-50 cursor-pointer"
          >
            {loginLoading ? "Authenticating session..." : "Verify Identity & Unlock"}
          </button>
        </form>

        <div className="border-t border-gray-150 pt-4 space-y-3">
          <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest text-center">
            Rapid Developer Access
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleAdminLogin(undefined, "MEGNAADMIN", "123456")}
              disabled={loginLoading}
              className="py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 text-[10px] font-bold uppercase tracking-wider border border-orange-200 transition-all text-center cursor-pointer"
            >
              🔑 Admin Demo
            </button>
            <button
              onClick={() => handleAdminLogin(undefined, "MEGNAENTERPRISE", "MegnaLuxe2026")}
              disabled={loginLoading}
              className="py-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 text-[10px] font-bold uppercase tracking-wider border border-neutral-200 transition-all text-center cursor-pointer"
            >
              🔑 Enterprise Mode
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <span className="text-orange-600 text-[10px] font-bold tracking-[0.3em] uppercase block">
            System Control Center
          </span>
          <h2 className="text-2xl font-black tracking-tighter">MEGNA ENTERPRISE INTEL PANEL</h2>
        </div>
        <button
          onClick={loadAdminData}
          className="px-3.5 py-1.5 border border-black text-black text-[10px] font-bold uppercase tracking-wider hover:bg-black hover:text-white"
        >
          Force sync database
        </button>
      </div>

      {/* Admin tabs */}
      <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wider">
        {[
          { id: "analytics", label: "Analytics & Orders", icon: TrendingUp },
          { id: "products", label: "Catalog Products", icon: ShoppingBag },
          { id: "coupons", label: "Coupon Discounts", icon: Percent },
          { id: "settings", label: "Store Settings", icon: Settings },
          { id: "logs", label: "System Audits", icon: ListRestart }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as any)}
              className={`px-4 py-2.5 border transition-all flex items-center gap-1.5 ${
                activeAdminTab === tab.id
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-500 border-gray-200 hover:text-black hover:border-black"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Analytics dashboard */}
      {activeAdminTab === "analytics" && (
        <div className="space-y-6">
          {/* Bento-grid Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 border border-gray-100 bg-white space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Today's Sales (India)</span>
              <div className="text-2xl font-black font-mono">₹{Math.round(totalSalesINR).toLocaleString()}</div>
              <span className="text-[9px] text-green-600 font-bold block">● Active Indian Merchants</span>
            </div>
            <div className="p-5 border border-gray-100 bg-white space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Today's Sales (Bangladesh)</span>
              <div className="text-2xl font-black font-mono">৳{Math.round(totalSalesBDT).toLocaleString()}</div>
              <span className="text-[9px] text-orange-600 font-bold block">● Active Bengal Merchants</span>
            </div>
            <div className="p-5 border border-gray-100 bg-[#121212] text-white space-y-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block text-orange-400">Logistics Backlog</span>
              <div className="text-3xl font-black font-mono">{pendingOrdersCount}</div>
              <span className="text-[9px] text-gray-400 block">Pending verification orders</span>
            </div>
            <div className="p-5 border border-gray-100 bg-white space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Stock Out Alerts</span>
              <div className="text-2xl font-black text-red-600 font-mono">{stockAlerts.length}</div>
              <span className="text-[9px] text-red-500 block">Below 10 unit quantity threshold</span>
            </div>
          </div>

          {/* Orders stream & verification control */}
          <div className="border border-gray-100 p-6 bg-white space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Incoming Verified Shipments</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 uppercase text-[9px] text-gray-400">
                    <th className="pb-3 font-bold">Order Code</th>
                    <th className="pb-3 font-bold">Customer / Location</th>
                    <th className="pb-3 font-bold">Total Paid</th>
                    <th className="pb-3 font-bold">Payment Status</th>
                    <th className="pb-3 font-bold">Logistics Status</th>
                    <th className="pb-3 font-bold text-right">Update Order Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50/50">
                      <td className="py-4 font-mono font-bold text-gray-900">{o.orderNumber}</td>
                      <td className="py-4">
                        <span className="font-bold text-gray-800">{o.customerName}</span>
                        <span className="block text-[10px] text-gray-400 font-mono">
                          {o.customerPhone} • {o.shippingAddress.city}, {o.shippingAddress.country}
                        </span>
                      </td>
                      <td className="py-4 font-bold text-gray-900 font-mono">
                        {o.currency === "BDT" ? "৳" : "₹"}{o.total.toLocaleString()}
                      </td>
                      <td className="py-4">
                        <select
                          value={o.paymentStatus}
                          onChange={(e) => handleUpdateOrderStatus(o.id, "", e.target.value)}
                          className={`font-mono text-[10px] font-bold px-2 py-1 border ${
                            o.paymentStatus === "Paid" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                          <option value="Failed">Failed</option>
                        </select>
                      </td>
                      <td className="py-4">
                        <span className="font-bold text-xs">{o.orderStatus}</span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={o.orderStatus}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                            className="bg-black text-white font-bold text-[10px] uppercase tracking-wider px-2 py-1.5 focus:outline-none cursor-pointer"
                          >
                            {["Pending", "Confirmed", "Processing", "Packed", "Shipped", "Delivered", "Cancelled", "Returned", "Refunded"].map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => setSelectedInvoiceOrder(o)}
                            className="p-1.5 bg-neutral-100 hover:bg-orange-600 hover:text-white border border-transparent hover:border-orange-700 text-gray-700 transition-all cursor-pointer inline-flex items-center justify-center rounded-none"
                            title="Print Invoice / Packing Slip"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Catalog Manager */}
      {activeAdminTab === "products" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Store Catalog ({allProducts.length} items)</h4>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setImportJsonError("");
                  setImportJsonSuccess("");
                  setShowJsonImportModal(true);
                }}
                className="px-4 py-2 border border-black text-black hover:bg-black hover:text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4" /> Import JSON
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingProduct({});
                  setShowProductForm(true);
                }}
                className="px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-orange-600 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Product SKU
              </button>
            </div>
          </div>

          {showProductForm && (
            <form onSubmit={handleProductSubmit} className="p-6 bg-gray-50 border border-gray-200 space-y-4 max-w-2xl">
              <h3 className="text-sm font-black uppercase tracking-wider">
                {editingProduct?.id ? "Edit Catalog Item" : "Create Brand New Product"}
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={editingProduct?.name || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full bg-white border border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Main Category</label>
                  <select
                    value={editingProduct?.category || "Footwear"}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                    className="w-full bg-white border border-gray-200 px-3 py-1.5 text-xs focus:outline-none"
                  >
                    <option value="Footwear">Footwear</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Subcategory Type</label>
                  <input
                    type="text"
                    placeholder="e.g. Sneakers, Sarees, Loafers"
                    value={editingProduct?.subCategory || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, subCategory: e.target.value })}
                    className="w-full bg-white border border-gray-200 px-3 py-1.5 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Price in INR</label>
                  <input
                    type="number"
                    required
                    value={editingProduct?.priceINR || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, priceINR: Number(e.target.value) })}
                    className="w-full bg-white border border-gray-200 px-3 py-1.5 text-xs focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Price in BDT</label>
                  <input
                    type="number"
                    required
                    value={editingProduct?.priceBDT || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, priceBDT: Number(e.target.value) })}
                    className="w-full bg-white border border-gray-200 px-3 py-1.5 text-xs focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Discount Percent</label>
                  <input
                    type="number"
                    value={editingProduct?.discountPercent || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, discountPercent: Number(e.target.value) })}
                    className="w-full bg-white border border-gray-200 px-3 py-1.5 text-xs focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={editingProduct?.stock || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full bg-white border border-gray-200 px-3 py-1.5 text-xs focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Main Image URL</label>
                  <input
                    type="text"
                    placeholder="Unsplash / Pixabay source image link"
                    value={editingProduct?.images?.[0] || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, images: [e.target.value] })}
                    className="w-full bg-white border border-gray-200 px-3 py-1.5 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Product Description</label>
                <textarea
                  rows={3}
                  value={editingProduct?.description || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full bg-white border border-gray-200 px-3 py-1.5 text-xs focus:outline-none w-full"
                ></textarea>
              </div>

              {/* Badges triggers */}
              <div className="flex gap-4">
                {[
                  { id: "featured", label: "Featured" },
                  { id: "newArrival", label: "New Arrival" },
                  { id: "bestSeller", label: "Best Seller" },
                  { id: "trending", label: "Trending" }
                ].map((bg) => (
                  <label key={bg.id} className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!(editingProduct as any)[bg.id]}
                      onChange={(e) => setEditingProduct({ ...editingProduct, [bg.id]: e.target.checked })}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span>{bg.label}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-2">
                <button type="submit" className="px-5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider">
                  Save Catalog Product
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setShowProductForm(false);
                  }}
                  className="px-5 py-2.5 border border-gray-200 text-gray-500 text-xs font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Bulk Action Controls Bar */}
          {selectedProductIds.length > 0 && (
            <div className="bg-neutral-900 text-white p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-l-4 border-orange-600 shadow-xs transition-all animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <span className="bg-orange-600 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 text-white shrink-0">
                  {selectedProductIds.length} Products Selected
                </span>
                <p className="text-[11px] text-neutral-300">
                  Perform a simultaneous update on pricing, discount, badges, or stock statuses.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowBulkUpdateModal(true)}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                  Bulk Update Specifications
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProductIds([])}
                  className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {/* Product catalogs list table */}
          <div className="border border-gray-150 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-150 uppercase text-[9px] text-gray-400 bg-neutral-50/50">
                    <th className="p-4 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={selectedProductIds.length === allProducts.length && allProducts.length > 0}
                        onChange={toggleSelectAllProducts}
                        className="rounded border-gray-300 text-orange-600 cursor-pointer w-4 h-4"
                        title="Select/Deselect All Products"
                      />
                    </th>
                    <th className="p-4 font-bold">Product Name</th>
                    <th className="p-4 font-bold">Category</th>
                    <th className="p-4 font-bold">Price INR / BDT</th>
                    <th className="p-4 font-bold">Stock</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allProducts.map((p) => {
                    const isSelected = selectedProductIds.includes(p.id);
                    return (
                      <tr
                        key={p.id}
                        className={`hover:bg-gray-50/50 transition-colors ${
                          isSelected ? "bg-orange-50/30 hover:bg-orange-50/40" : ""
                        }`}
                      >
                        <td className="p-4 w-12 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleProductSelection(p.id)}
                            className="rounded border-gray-300 text-orange-600 cursor-pointer w-4 h-4"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <img src={p.images[0]} alt="p" className="w-8 h-8 object-contain bg-gray-50 border shrink-0" />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-gray-900">{p.name}</span>
                                {p.featured && (
                                  <span className="text-[8px] bg-yellow-50 text-yellow-700 border border-yellow-200 px-1 py-0.2 uppercase font-black tracking-wider">
                                    Featured
                                  </span>
                                )}
                                {p.newArrival && (
                                  <span className="text-[8px] bg-blue-50 text-blue-700 border border-blue-200 px-1 py-0.2 uppercase font-black tracking-wider">
                                    New
                                  </span>
                                )}
                              </div>
                              <span className="text-[9px] text-gray-400 font-mono block">SKU: {p.sku} | Barcode: {p.barcode}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-medium text-gray-700">
                          {p.category}
                          <span className="block text-[10px] text-gray-400 font-normal">{p.subCategory}</span>
                        </td>
                        <td className="p-4 font-mono">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-950">₹{p.priceINR}</span>
                            {p.discountPercent > 0 && (
                              <span className="text-[9px] text-orange-600 font-bold bg-orange-50 px-1">
                                -{p.discountPercent}%
                              </span>
                            )}
                          </div>
                          <span className="text-gray-400 text-[10px] block">৳{p.priceBDT}</span>
                        </td>
                        <td className="p-4">
                          <span className={`font-bold font-mono ${p.stock <= 10 ? "text-red-600" : p.stock >= 900000 ? "text-green-600" : "text-gray-800"}`}>
                            {p.stock >= 900000 ? "Unlimited" : `${p.stock} units`}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-1 shrink-0">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setShowProductForm(true);
                            }}
                            className="p-1.5 hover:bg-neutral-100 rounded text-blue-600 inline-flex cursor-pointer"
                            title="Edit Info"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDuplicateProduct(p)}
                            className="p-1.5 hover:bg-neutral-100 rounded text-gray-600 inline-flex cursor-pointer"
                            title="Duplicate SKU"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 hover:bg-neutral-100 rounded text-red-600 inline-flex cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bulk Update Modal Overlay */}
          {showBulkUpdateModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="bg-white border border-gray-200 max-w-2xl w-full p-6 shadow-2xl space-y-5 text-[#1a1a1a] relative animate-scaleIn max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-1.5">
                      <RefreshCw className="w-4 h-4 text-orange-600 animate-spin-slow" /> Bulk Product Inventory Update
                    </h3>
                    <p className="text-[11px] text-gray-500 font-medium">
                      Updating <span className="text-orange-600 font-bold">{selectedProductIds.length} selected catalog items</span> simultaneously.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowBulkUpdateModal(false)}
                    className="text-gray-400 hover:text-black font-black text-sm p-1 uppercase tracking-widest"
                  >
                    ✕
                  </button>
                </div>

                {/* Notifications */}
                {bulkUpdateError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                    ⚠️ {bulkUpdateError}
                  </div>
                )}
                {bulkUpdateSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>{bulkUpdateSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleBulkUpdateProducts} className="space-y-4">
                  {/* Parameter 1: Pricing Updates */}
                  <div className="p-4 bg-gray-50 border border-gray-150 rounded-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                        1. Pricing Parameters
                      </label>
                      <select
                        value={bulkPriceMode}
                        onChange={(e) => setBulkPriceMode(e.target.value as any)}
                        className="bg-white border border-gray-300 text-[10px] font-bold uppercase tracking-wider px-2 py-1 focus:outline-none"
                      >
                        <option value="none">No Change</option>
                        <option value="set">Set Fixed Prices</option>
                        <option value="percent">Percentage Adjustment (%)</option>
                        <option value="offset">Absolute Price Offset (+/-)</option>
                      </select>
                    </div>

                    {bulkPriceMode === "set" && (
                      <div className="grid grid-cols-2 gap-3 animate-fadeIn">
                        <div>
                          <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                            New Flat Price (INR ₹)
                          </label>
                          <input
                            type="number"
                            min="1"
                            placeholder="e.g. 1500"
                            value={bulkPriceINR || ""}
                            onChange={(e) => setBulkPriceINR(Math.max(0, Number(e.target.value)))}
                            className="w-full bg-white border border-gray-200 px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-black"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                            New Flat Price (BDT ৳)
                          </label>
                          <input
                            type="number"
                            min="1"
                            placeholder="e.g. 1800"
                            value={bulkPriceBDT || ""}
                            onChange={(e) => setBulkPriceBDT(Math.max(0, Number(e.target.value)))}
                            className="w-full bg-white border border-gray-200 px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-black"
                          />
                        </div>
                      </div>
                    )}

                    {bulkPriceMode === "percent" && (
                      <div className="animate-fadeIn space-y-1.5">
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                          Percentage Rate Adjustment (%)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="1"
                            placeholder="e.g. 10 for +10%, -5 for -5%"
                            value={bulkPricePercent || ""}
                            onChange={(e) => setBulkPricePercent(Number(e.target.value))}
                            className="w-full bg-white border border-gray-200 px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-black"
                          />
                          <span className="absolute right-3 top-1.5 text-[10px] text-gray-400 font-bold">
                            {bulkPricePercent > 0 ? `+${bulkPricePercent}% Increase` : bulkPricePercent < 0 ? `${bulkPricePercent}% Decrease` : "0% No Change"}
                          </span>
                        </div>
                        <span className="block text-[9px] text-gray-400">
                          Applies to both INR and BDT catalogue figures. Positive boosts price, negative decreases.
                        </span>
                      </div>
                    )}

                    {bulkPriceMode === "offset" && (
                      <div className="grid grid-cols-2 gap-3 animate-fadeIn">
                        <div>
                          <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                            INR Price Offset (₹)
                          </label>
                          <input
                            type="number"
                            placeholder="e.g. +200 or -150"
                            value={bulkPriceOffsetINR || ""}
                            onChange={(e) => setBulkPriceOffsetINR(Number(e.target.value))}
                            className="w-full bg-white border border-gray-200 px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-black"
                          />
                          <span className="text-[9px] text-gray-400 font-bold">
                            {bulkPriceOffsetINR > 0 ? `+₹${bulkPriceOffsetINR}` : bulkPriceOffsetINR < 0 ? `-₹${Math.abs(bulkPriceOffsetINR)}` : "No Change"}
                          </span>
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                            BDT Price Offset (৳)
                          </label>
                          <input
                            type="number"
                            placeholder="e.g. +250 or -200"
                            value={bulkPriceOffsetBDT || ""}
                            onChange={(e) => setBulkPriceOffsetBDT(Number(e.target.value))}
                            className="w-full bg-white border border-gray-200 px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-black"
                          />
                          <span className="text-[9px] text-gray-400 font-bold">
                            {bulkPriceOffsetBDT > 0 ? `+৳${bulkPriceOffsetBDT}` : bulkPriceOffsetBDT < 0 ? `-৳${Math.abs(bulkPriceOffsetBDT)}` : "No Change"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Parameter 2: Discount Percentages */}
                  <div className="p-4 bg-gray-50 border border-gray-150 rounded-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                        2. Discount Percentages
                      </label>
                      <select
                        value={bulkDiscountMode}
                        onChange={(e) => setBulkDiscountMode(e.target.value as any)}
                        className="bg-white border border-gray-300 text-[10px] font-bold uppercase tracking-wider px-2 py-1 focus:outline-none"
                      >
                        <option value="none">No Change</option>
                        <option value="set">Set Fixed Discount %</option>
                        <option value="offset">Relative Adjust Offset (+/- %)</option>
                      </select>
                    </div>

                    {bulkDiscountMode === "set" && (
                      <div className="animate-fadeIn relative">
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                          New Absolute Discount Percent (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="e.g. 15 for 15% Off"
                          value={bulkDiscountPercent || ""}
                          onChange={(e) => setBulkDiscountPercent(Math.max(0, Math.min(100, Number(e.target.value))))}
                          className="w-full bg-white border border-gray-200 px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-black"
                        />
                        <div className="absolute right-3 top-7 text-xs font-mono text-gray-400 font-bold">
                          % OFF
                        </div>
                      </div>
                    )}

                    {bulkDiscountMode === "offset" && (
                      <div className="animate-fadeIn relative">
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                          Discount Offset Adjustment (+/- %)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. +5 to increase discount, -10 to reduce"
                          value={bulkDiscountOffset || ""}
                          onChange={(e) => setBulkDiscountOffset(Number(e.target.value))}
                          className="w-full bg-white border border-gray-200 px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-black"
                        />
                        <span className="block text-[9px] text-gray-400 mt-1">
                          Will add or subtract relative percent points to current items. Floor limit is 0%, ceiling is 100%.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Parameter 3: Stock Statuses */}
                  <div className="p-4 bg-gray-50 border border-gray-150 rounded-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                        3. Stock Management
                      </label>
                      <select
                        value={bulkStockMode}
                        onChange={(e) => setBulkStockMode(e.target.value as any)}
                        className="bg-white border border-gray-300 text-[10px] font-bold uppercase tracking-wider px-2 py-1 focus:outline-none"
                      >
                        <option value="none">No Change</option>
                        <option value="set">Set Specific Stock Level</option>
                        <option value="offset">Increment/Decrement Units (+/-)</option>
                        <option value="unlimited">Mark as Unlimited Supply</option>
                      </select>
                    </div>

                    {bulkStockMode === "set" && (
                      <div className="animate-fadeIn">
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                          Specific Units Available
                        </label>
                        <input
                          type="number"
                          min="0"
                          placeholder="e.g. 50"
                          value={bulkStock || ""}
                          onChange={(e) => setBulkStock(Math.max(0, Number(e.target.value)))}
                          className="w-full bg-white border border-gray-200 px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-black"
                        />
                      </div>
                    )}

                    {bulkStockMode === "offset" && (
                      <div className="animate-fadeIn">
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                          Modify Quantity Offset (+/- units)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. +25 to add units, -10 to write-off"
                          value={bulkStockOffset || ""}
                          onChange={(e) => setBulkStockOffset(Number(e.target.value))}
                          className="w-full bg-white border border-gray-200 px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-black"
                        />
                      </div>
                    )}

                    {bulkStockMode === "unlimited" && (
                      <div className="p-2.5 bg-green-50 text-green-700 text-[11px] font-medium border border-green-150 animate-fadeIn">
                        ℹ️ Products will be updated to 999,999 units (system threshold for virtual/infinite supply).
                      </div>
                    )}
                  </div>

                  {/* Parameter 4: System Badges (Optional Toggle) */}
                  <div className="p-4 bg-gray-50 border border-gray-150 rounded-xs space-y-3">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400">
                      4. Global Metadata & Visual Badges
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                      {/* Featured */}
                      <div className="space-y-1">
                        <span className="block text-[9px] font-bold text-gray-500 uppercase">Featured SKU</span>
                        <select
                          value={bulkFeaturedMode}
                          onChange={(e) => setBulkFeaturedMode(e.target.value as any)}
                          className="w-full bg-white border border-gray-200 text-xs px-2 py-1.5 focus:outline-none"
                        >
                          <option value="none">No Change</option>
                          <option value="on">Force Enable (On)</option>
                          <option value="off">Force Disable (Off)</option>
                        </select>
                      </div>

                      {/* New Arrival */}
                      <div className="space-y-1">
                        <span className="block text-[9px] font-bold text-gray-500 uppercase">New Arrival</span>
                        <select
                          value={bulkNewArrivalMode}
                          onChange={(e) => setBulkNewArrivalMode(e.target.value as any)}
                          className="w-full bg-white border border-gray-200 text-xs px-2 py-1.5 focus:outline-none"
                        >
                          <option value="none">No Change</option>
                          <option value="on">Force Enable (On)</option>
                          <option value="off">Force Disable (Off)</option>
                        </select>
                      </div>

                      {/* Best Seller */}
                      <div className="space-y-1">
                        <span className="block text-[9px] font-bold text-gray-500 uppercase">Best Seller</span>
                        <select
                          value={bulkBestSellerMode}
                          onChange={(e) => setBulkBestSellerMode(e.target.value as any)}
                          className="w-full bg-white border border-gray-200 text-xs px-2 py-1.5 focus:outline-none"
                        >
                          <option value="none">No Change</option>
                          <option value="on">Force Enable (On)</option>
                          <option value="off">Force Disable (Off)</option>
                        </select>
                      </div>

                      {/* Trending */}
                      <div className="space-y-1">
                        <span className="block text-[9px] font-bold text-gray-500 uppercase">Trending SKU</span>
                        <select
                          value={bulkTrendingMode}
                          onChange={(e) => setBulkTrendingMode(e.target.value as any)}
                          className="w-full bg-white border border-gray-200 text-xs px-2 py-1.5 focus:outline-none"
                        >
                          <option value="none">No Change</option>
                          <option value="on">Force Enable (On)</option>
                          <option value="off">Force Disable (Off)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Footer Action Buttons */}
                  <div className="flex gap-2.5 pt-4 border-t border-gray-100 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowBulkUpdateModal(false)}
                      disabled={bulkIsUpdating}
                      className="px-5 py-2.5 border border-gray-250 text-gray-500 hover:text-black hover:border-black text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer"
                    >
                      Cancel / Close
                    </button>
                    <button
                      type="submit"
                      disabled={bulkIsUpdating || (bulkPriceMode === "none" && bulkDiscountMode === "none" && bulkStockMode === "none" && bulkFeaturedMode === "none" && bulkNewArrivalMode === "none" && bulkBestSellerMode === "none" && bulkTrendingMode === "none")}
                      className="px-6 py-2.5 bg-black hover:bg-orange-600 text-white text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50 cursor-pointer inline-flex items-center gap-2"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {bulkIsUpdating ? "Simultaneous Update in Progress..." : "Execute Simultaneous Update"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Coupons tab */}
      {activeAdminTab === "coupons" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4 bg-white border border-gray-100 p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Generate Coupon Code</h4>
            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MONSOON30"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 px-3 py-1.5 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Discount Percent</label>
                <input
                  type="number"
                  required
                  max={100}
                  value={newCouponPct}
                  onChange={(e) => setNewCouponPct(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 px-3 py-1.5 text-xs focus:outline-none font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Min Spend (INR)</label>
                  <input
                    type="number"
                    value={minSpendInr}
                    onChange={(e) => setMinSpendInr(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-1.5 text-xs focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Min Spend (BDT)</label>
                  <input
                    type="number"
                    value={minSpendBdt}
                    onChange={(e) => setMinSpendBdt(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-1.5 text-xs focus:outline-none font-mono"
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-2 bg-black text-white text-[10px] font-bold uppercase tracking-widest">
                Create Active Promo Code
              </button>
            </form>
          </div>

          <div className="md:col-span-8 bg-white border border-gray-100 p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Active Coupons</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 uppercase text-[9px] text-gray-400">
                    <th className="pb-2 font-bold">Code</th>
                    <th className="pb-2 font-bold">Discount</th>
                    <th className="pb-2 font-bold">Min Spend INR / BDT</th>
                    <th className="pb-2 font-bold">Expiry Date</th>
                    <th className="pb-2 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono">
                  {coupons.map((c) => (
                    <tr key={c.code}>
                      <td className="py-2.5 font-bold text-orange-600">{c.code}</td>
                      <td className="py-2.5 text-gray-900 font-bold">{c.discountPercent}% OFF</td>
                      <td className="py-2.5 text-gray-500 text-[11px]">
                        ₹{c.minSpendINR} / ৳{c.minSpendBDT}
                      </td>
                      <td className="py-2.5 text-gray-400">{c.expiryDate}</td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => handleDeleteCoupon(c.code)}
                          className="p-1 text-red-600 hover:bg-neutral-100 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Global Settings tab */}
      {activeAdminTab === "settings" && settings && (
        <div className="space-y-6">
          {/* Settings Custom Banners/Notifications */}
          {settingsNotification && (
            <div
              className={`p-4 border text-xs font-semibold flex items-center justify-between shadow-xs transition-all ${
                settingsNotification.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              <div className="flex items-center gap-2">
                {settingsNotification.type === "success" ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{settingsNotification.message}</span>
              </div>
              <button
                onClick={() => setSettingsNotification(null)}
                className="text-[10px] font-bold uppercase tracking-wider hover:opacity-75 pl-4"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Core Multipliers & Parameters Card */}
          <div className="bg-white border border-gray-150 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-orange-600" /> Operational Parameters & Variables
                </h3>
                <p className="text-[11px] text-gray-500">
                  Update global modifiers for dynamic checkouts including live conversions, system taxes, and transit freight charges.
                </p>
              </div>
              
              <button
                onClick={handleSaveAllSettings}
                disabled={isSavingSettings}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-black hover:bg-orange-600 text-white text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50 cursor-pointer shrink-0"
              >
                <Save className="w-3.5 h-3.5" />
                {isSavingSettings ? "Saving Settings..." : "Save Config Parameters"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Variable 1: Site Tax */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Site Tax Percentage
                  </label>
                  <span className="text-xs font-mono font-bold text-orange-600">{settings.taxPercent}%</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={settings.taxPercent}
                    onChange={(e) => {
                      const val = Math.max(0, Math.min(100, Number(e.target.value)));
                      setSettings({ ...settings, taxPercent: val });
                    }}
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2.5 text-xs font-mono focus:outline-none focus:border-black"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400 text-xs">
                    %
                  </div>
                </div>
                {settings.taxPercent > 30 && (
                  <p className="text-[9px] text-amber-600 font-medium">
                    ⚠️ Excessive Tax Rate. Standard store tax rates are typically below 30%.
                  </p>
                )}
                <p className="text-[10px] text-gray-400">
                  Default charge added on top of item totals. Set to 0 to disable tax.
                </p>
              </div>

              {/* Variable 2: INR Shipping */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Transit Shipping (INR ₹)
                  </label>
                  {settings.shippingChargeINR === 0 && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold uppercase tracking-wider border border-emerald-200">
                      FREE PROMO
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={settings.shippingChargeINR}
                    onChange={(e) => {
                      const val = Math.max(0, Number(e.target.value));
                      setSettings({ ...settings, shippingChargeINR: val });
                    }}
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2.5 text-xs font-mono focus:outline-none focus:border-black"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400 text-xs font-mono">
                    ₹
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setSettings({ ...settings, shippingChargeINR: 0 })}
                    className="text-[9px] bg-neutral-100 hover:bg-neutral-200 text-gray-600 px-1.5 py-0.5 uppercase font-bold"
                  >
                    Set Free
                  </button>
                  <button
                    onClick={() => setSettings({ ...settings, shippingChargeINR: 100 })}
                    className="text-[9px] bg-neutral-100 hover:bg-neutral-200 text-gray-600 px-1.5 py-0.5 uppercase font-bold"
                  >
                    Set ₹100
                  </button>
                </div>
                <p className="text-[10px] text-gray-400">
                  Base delivery rate applied to Indian postal codes.
                </p>
              </div>

              {/* Variable 3: BDT Shipping */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Transit Shipping (BDT ৳)
                  </label>
                  {settings.shippingChargeBDT === 0 && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold uppercase tracking-wider border border-emerald-200">
                      FREE PROMO
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={settings.shippingChargeBDT}
                    onChange={(e) => {
                      const val = Math.max(0, Number(e.target.value));
                      setSettings({ ...settings, shippingChargeBDT: val });
                    }}
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2.5 text-xs font-mono focus:outline-none focus:border-black"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400 text-xs font-mono">
                    ৳
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setSettings({ ...settings, shippingChargeBDT: 0 })}
                    className="text-[9px] bg-neutral-100 hover:bg-neutral-200 text-gray-600 px-1.5 py-0.5 uppercase font-bold"
                  >
                    Set Free
                  </button>
                  <button
                    onClick={() => setSettings({ ...settings, shippingChargeBDT: 120 })}
                    className="text-[9px] bg-neutral-100 hover:bg-neutral-200 text-gray-600 px-1.5 py-0.5 uppercase font-bold"
                  >
                    Set ৳120
                  </button>
                </div>
                <p className="text-[10px] text-gray-400">
                  Base delivery rate applied to Bangladesh postal codes.
                </p>
              </div>

              {/* Variable 4: Exchange Rate */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Exchange Rate (1 INR to BDT)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={settings.inrToBdtRate}
                    onChange={(e) => {
                      const val = Math.max(0.01, Number(e.target.value));
                      setSettings({ ...settings, inrToBdtRate: val });
                    }}
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2.5 text-xs font-mono focus:outline-none focus:border-black"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400 text-xs font-mono">
                    ৳
                  </div>
                </div>
                <p className="text-[10px] text-gray-400">
                  Multiplicative index used to automatically convert catalog items to BDT.
                </p>
              </div>
            </div>
          </div>

          {/* Site Announcement Ticker Banner Card */}
          <div className="bg-white border border-gray-150 p-6 space-y-4">
            <div className="flex items-center gap-1.5 border-b border-gray-100 pb-2">
              <Megaphone className="w-4 h-4 text-orange-600" />
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Global Header Announcement Ticker Text
              </h4>
            </div>

            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={settings.announcement}
                    maxLength={150}
                    onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-3 text-xs focus:outline-none focus:border-black font-semibold"
                    placeholder="e.g. 🎉 FESTIVE SALE: Flat 10% Off on Premium Sneakers! Apply code: FESTIVE10"
                  />
                  <span className="absolute right-3 bottom-1.5 text-[9px] font-mono text-gray-400">
                    {settings.announcement.length} / 150 chars
                  </span>
                </div>
                <button
                  onClick={handleSaveAllSettings}
                  disabled={isSavingSettings}
                  className="px-5 bg-black hover:bg-orange-600 text-white text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Save className="w-3.5 h-3.5" />
                  Apply Text
                </button>
              </div>

              {/* Live Preview Ticker */}
              <div className="bg-neutral-900 text-white py-2 px-4 text-xs overflow-hidden flex items-center gap-2 border-l-4 border-orange-500">
                <span className="text-[10px] bg-orange-600 text-white font-black px-1.5 py-0.5 uppercase tracking-wider scale-95 shrink-0">
                  LIVE MARQUEE PREVIEW:
                </span>
                <div className="flex-1 overflow-hidden relative">
                  <div className="whitespace-nowrap font-medium animate-marquee">
                    {settings.announcement || "No active store-wide announcement marquee currently broadcasting."}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Payment Options Gateways India */}
            <div className="bg-white border border-gray-150 p-6 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5 border-b border-gray-100 pb-2">
                <Globe className="w-4 h-4 text-orange-600 animate-pulse" /> India Payment Options
              </h4>
              <div className="space-y-2">
                {Object.entries(settings.paymentGateways.india).map(([gw, isActive]) => (
                  <label key={gw} className="flex items-center justify-between p-2.5 bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer text-xs border border-transparent hover:border-gray-200">
                    <div>
                      <span className="font-bold uppercase text-gray-800">{gw}</span>
                      <span className="block text-[9px] text-gray-400 uppercase">Live Integration gateway</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => handleToggleGateway("india", gw)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-4 h-4 cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Payment Options Gateways Bangladesh */}
            <div className="bg-white border border-gray-150 p-6 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5 border-b border-gray-100 pb-2">
                <Globe className="w-4 h-4 text-orange-600 animate-pulse" /> Bangladesh Gateways
              </h4>
              <div className="space-y-2">
                {Object.entries(settings.paymentGateways.bangladesh).map(([gw, isActive]) => (
                  <label key={gw} className="flex items-center justify-between p-2.5 bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer text-xs border border-transparent hover:border-gray-200">
                    <div>
                      <span className="font-bold uppercase text-gray-800">{gw}</span>
                      <span className="block text-[9px] text-gray-400 uppercase">MFS Direct Api Integration</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => handleToggleGateway("bangladesh", gw)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-4 h-4 cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Live Interactive Parameter Tester (Demo Calculator) */}
            <div className="bg-white border border-gray-150 p-6 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5 border-b border-gray-100 pb-2">
                <Calculator className="w-4 h-4 text-orange-600" /> Interactive Checkout Simulator
              </h4>
              <p className="text-[10px] text-gray-500">
                Simulate how the configured tax and shipping charges will apply to a customer checkout in real-time.
              </p>

              <div className="space-y-3.5 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Basket Total
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={demoBasketPrice}
                      onChange={(e) => setDemoBasketPrice(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-gray-50 border border-gray-200 px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Target Currency
                    </label>
                    <div className="flex border border-gray-200 text-xs">
                      <button
                        type="button"
                        onClick={() => setDemoBasketCurrency("INR")}
                        className={`flex-1 py-1.5 font-bold uppercase text-center ${
                          demoBasketCurrency === "INR" ? "bg-black text-white" : "bg-gray-50 text-gray-500 hover:text-black"
                        }`}
                      >
                        ₹ INR
                      </button>
                      <button
                        type="button"
                        onClick={() => setDemoBasketCurrency("BDT")}
                        className={`flex-1 py-1.5 font-bold uppercase text-center ${
                          demoBasketCurrency === "BDT" ? "bg-black text-white" : "bg-gray-50 text-gray-500 hover:text-black"
                        }`}
                      >
                        ৳ BDT
                      </button>
                    </div>
                  </div>
                </div>

                {/* Calculation Outputs */}
                <div className="bg-neutral-50 p-4 border border-gray-150 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-gray-600">
                    <span>Base Goods Value:</span>
                    <span>
                      {demoBasketCurrency === "INR" ? "₹" : "৳"}
                      {demoBasketPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Dynamic Tax ({settings.taxPercent}%):</span>
                    <span>
                      {demoBasketCurrency === "INR" ? "₹" : "৳"}
                      {Math.round(demoBasketPrice * (settings.taxPercent / 100)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Base Freight Charge:</span>
                    <span>
                      {demoBasketCurrency === "INR" ? "₹" : "৳"}
                      {(demoBasketCurrency === "INR" ? settings.shippingChargeINR : settings.shippingChargeBDT).toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-black text-gray-950 text-sm">
                    <span>EST. CUSTOMER BILL:</span>
                    <span className="text-orange-600">
                      {demoBasketCurrency === "INR" ? "₹" : "৳"}
                      {(
                        demoBasketPrice +
                        Math.round(demoBasketPrice * (settings.taxPercent / 100)) +
                        (demoBasketCurrency === "INR" ? settings.shippingChargeINR : settings.shippingChargeBDT)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Logs Audits */}
      {activeAdminTab === "logs" && (
        <div className="bg-white border border-gray-100 p-6 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Patron & System Activity Trails</h4>
          <div className="overflow-y-auto max-h-[350px] space-y-2 pr-1">
            {activityLogs.map((log) => (
              <div key={log.id} className="p-3 bg-gray-50 border border-gray-150 rounded-none flex justify-between items-start text-xs font-mono">
                <div>
                  <div className="font-bold text-gray-900">{log.action}</div>
                  <div className="text-[10px] text-gray-500 font-light mt-0.5">{log.details}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-orange-600">User: {log.user}</div>
                  <div className="text-[9px] text-gray-400">{new Date(log.date).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Printer-Friendly Invoice Modal Preview */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 md:p-6 overflow-y-auto print:p-0 print:bg-white print:relative">
          {/* Print Styles Overlay to inject print media queries */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              /* Hide everything in the document */
              body * {
                visibility: hidden !important;
              }
              /* Show ONLY the invoice section */
              #megna-invoice-print, #megna-invoice-print * {
                visibility: visible !important;
              }
              #megna-invoice-print {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                background: white !important;
                color: black !important;
                padding: 1.5cm !important;
                margin: 0 !important;
                border: none !important;
                box-shadow: none !important;
              }
              /* Hide close buttons etc inside print area */
              .print-no-render {
                display: none !important;
              }
            }
          `}} />

          <div className="bg-neutral-50 border border-gray-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col rounded-none overflow-hidden print:max-h-none print:shadow-none print:border-none print:bg-white print:w-full">
            {/* Modal Controls Bar */}
            <div className="p-4 bg-white border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 print-no-render">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-orange-50 text-orange-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">Order Invoice Manager</h3>
                  <p className="text-[10px] text-gray-500 font-mono">Invoice Preview for #{selectedInvoiceOrder.orderNumber}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => {
                    setTimeout(() => {
                      window.print();
                    }, 50);
                  }}
                  className="px-4 py-2 bg-black hover:bg-orange-600 text-white text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Invoice
                </button>
                <button
                  onClick={() => setSelectedInvoiceOrder(null)}
                  className="px-4 py-2 border border-gray-300 hover:border-black text-gray-600 hover:text-black text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>

            {/* Print Content Area */}
            <div className="overflow-y-auto p-6 md:p-8 flex-1 bg-white print:overflow-visible print:p-0">
              <div id="megna-invoice-print" className="bg-white border border-gray-150 p-6 md:p-10 space-y-8 text-black print:border-none print:p-0">
                {/* Invoice Header */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b-2 border-black pb-6">
                  <div className="space-y-2">
                    <span className="text-xs font-black tracking-[0.3em] text-orange-600 block">MEGNA ENTERPRISE</span>
                    <h1 className="text-3xl font-black tracking-tighter leading-none">ORDER INVOICE</h1>
                    <div className="text-xs font-mono text-gray-500 space-y-1">
                      <div>House 42, Road 11, Banani, Dhaka, Bangladesh</div>
                      <div>15 Park Street, Kolkata, West Bengal, India</div>
                      <div>Email: logistics@megnaenterprise.com | Tel: +91 98765 43210</div>
                    </div>
                  </div>

                  <div className="md:text-right space-y-1 md:self-stretch flex flex-col justify-between items-start md:items-end">
                    <div className="bg-black text-white px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                      {selectedInvoiceOrder.orderStatus}
                    </div>
                    <div className="text-xs space-y-0.5 pt-2">
                      <div className="font-mono"><span className="font-bold text-gray-500">INVOICE NO:</span> #{selectedInvoiceOrder.orderNumber}</div>
                      <div className="font-mono"><span className="font-bold text-gray-500">DATE:</span> {new Date(selectedInvoiceOrder.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
                      <div className="font-mono"><span className="font-bold text-gray-500">METHOD:</span> {selectedInvoiceOrder.paymentMethod}</div>
                      <div className="font-mono"><span className="font-bold text-gray-500">PAYMENT STATUS:</span> <span className={selectedInvoiceOrder.paymentStatus === "Paid" ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>{selectedInvoiceOrder.paymentStatus}</span></div>
                    </div>
                  </div>
                </div>

                {/* Addresses Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-gray-200 pb-6">
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">BILL TO CUSTOMER</h3>
                    <div className="text-sm font-bold text-gray-950">{selectedInvoiceOrder.customerName}</div>
                    <div className="text-xs space-y-0.5 text-gray-600">
                      <div>Email: {selectedInvoiceOrder.customerEmail}</div>
                      <div>Phone: {selectedInvoiceOrder.customerPhone}</div>
                      <div className="pt-2 font-medium text-gray-800">
                        {selectedInvoiceOrder.billingAddress?.addressLine1},<br />
                        {selectedInvoiceOrder.billingAddress?.city}, {selectedInvoiceOrder.billingAddress?.state} - {selectedInvoiceOrder.billingAddress?.postalCode},<br />
                        <span className="font-bold text-gray-900">{selectedInvoiceOrder.billingAddress?.country?.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">DELIVERY SHIPMENT ADDR</h3>
                    <div className="text-sm font-bold text-gray-950">{selectedInvoiceOrder.customerName}</div>
                    <div className="text-xs space-y-0.5 text-gray-600">
                      <div>Email: {selectedInvoiceOrder.customerEmail}</div>
                      <div>Phone: {selectedInvoiceOrder.customerPhone}</div>
                      <div className="pt-2 font-medium text-gray-800">
                        {selectedInvoiceOrder.shippingAddress?.addressLine1},<br />
                        {selectedInvoiceOrder.shippingAddress?.city}, {selectedInvoiceOrder.shippingAddress?.state} - {selectedInvoiceOrder.shippingAddress?.postalCode},<br />
                        <span className="font-bold text-gray-900">{selectedInvoiceOrder.shippingAddress?.country?.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">ORDERED PRODUCTS CATALOG ITEMS</h3>
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b-2 border-gray-300 uppercase text-[9px] text-gray-500 font-black tracking-wider">
                        <th className="pb-2 text-left print-no-render">Product Image</th>
                        <th className="pb-2 text-left">SKU & Item Details</th>
                        <th className="pb-2 text-center">Size / Color</th>
                        <th className="pb-2 text-center">Qty</th>
                        <th className="pb-2 text-right">Unit Price</th>
                        <th className="pb-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150">
                      {selectedInvoiceOrder.items.map((item, index) => {
                        const sym = selectedInvoiceOrder.currency === "BDT" ? "৳" : "₹";
                        return (
                          <tr key={index} className="align-middle">
                            <td className="py-3 pr-4 text-left print-no-render">
                              <img
                                src={item.image}
                                alt={item.productName}
                                className="w-10 h-10 object-cover border border-gray-200"
                                referrerPolicy="no-referrer"
                              />
                            </td>
                            <td className="py-3 text-left">
                              <span className="font-bold text-gray-900 block text-xs">{item.productName}</span>
                              <span className="text-[10px] text-gray-400 font-mono uppercase block mt-0.5">SKU: {item.sku}</span>
                            </td>
                            <td className="py-3 text-center font-medium text-gray-700">
                              {item.size || "N/A"} / {item.color || "N/A"}
                            </td>
                            <td className="py-3 text-center font-mono font-bold text-gray-900">
                              {item.quantity}
                            </td>
                            <td className="py-3 text-right font-mono text-gray-700">
                              {sym}{item.price.toLocaleString()}
                            </td>
                            <td className="py-3 text-right font-mono font-bold text-gray-950">
                              {sym}{(item.price * item.quantity).toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Financial Summary & Footnote Block */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 border-t border-gray-150">
                  <div className="md:col-span-7 space-y-4">
                    {selectedInvoiceOrder.orderNotes && (
                      <div className="p-3 bg-neutral-50 border border-gray-200 text-xs text-gray-600 rounded-none space-y-1 print:border-none print:p-0">
                        <span className="block text-[9px] font-black uppercase text-gray-400 tracking-wider font-bold">Customer Special Instructions:</span>
                        <p className="italic">"{selectedInvoiceOrder.orderNotes}"</p>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-400 leading-relaxed font-light">
                      <span className="font-bold text-gray-500 block text-[9px] uppercase tracking-wider mb-1">Standard Shipping Terms:</span>
                      Purchased products will be packaged securely and dispatched within 24 hours. Under normal logistics corridors, delivery is finalized inside 3 to 5 business days. Keep this document as an official receipt of transaction and proof of warranty verification.
                    </div>
                  </div>

                  <div className="md:col-span-5 space-y-2">
                    <div className="space-y-1.5 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Items Subtotal:</span>
                        <span className="font-mono">{selectedInvoiceOrder.currency === "BDT" ? "৳" : "₹"}{selectedInvoiceOrder.subtotal.toLocaleString()}</span>
                      </div>
                      
                      {selectedInvoiceOrder.discountAmount > 0 && (
                        <div className="flex justify-between text-orange-600 font-medium">
                          <span>Coupon Discount ({selectedInvoiceOrder.couponCodeUsed || "PROMO"}):</span>
                          <span className="font-mono">-{selectedInvoiceOrder.currency === "BDT" ? "৳" : "₹"}{selectedInvoiceOrder.discountAmount.toLocaleString()}</span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span>Dynamic System Tax:</span>
                        <span className="font-mono">+{selectedInvoiceOrder.currency === "BDT" ? "৳" : "₹"}{selectedInvoiceOrder.tax.toLocaleString()}</span>
                      </div>

                      <div className="flex justify-between">
                        <span>Transit Freight Charge:</span>
                        <span className="font-mono">+{selectedInvoiceOrder.currency === "BDT" ? "৳" : "₹"}{selectedInvoiceOrder.shippingCharge.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex justify-between border-t border-gray-300 pt-2 text-sm font-black text-gray-950">
                      <span>GRAND TOTAL DUE:</span>
                      <span className="font-mono text-base text-orange-600">{selectedInvoiceOrder.currency === "BDT" ? "৳" : "₹"}{selectedInvoiceOrder.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Signature Verification Lines */}
                <div className="pt-12 grid grid-cols-2 gap-8 text-center text-xs text-gray-500 print:pt-20">
                  <div className="space-y-1">
                    <div className="border-b border-gray-300 mx-auto w-40 h-8"></div>
                    <span className="block font-bold text-gray-700">Authorized Logistics Signature</span>
                    <span className="block text-[9px] text-gray-400 uppercase font-mono">MEGNA ENTERPRISE OFFICIAL</span>
                  </div>
                  <div className="space-y-1">
                    <div className="border-b border-gray-300 mx-auto w-40 h-8"></div>
                    <span className="block font-bold text-gray-700">Customer Acknowledgement</span>
                    <span className="block text-[9px] text-gray-400 uppercase font-mono">RECEIVED BY CLIENT ON DELIVERY</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* JSON Import Modal */}
      {showJsonImportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-150 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-600" />
                <h3 className="text-sm font-black uppercase tracking-wider text-gray-900">Bulk Import Products via JSON</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowJsonImportModal(false)}
                className="text-gray-400 hover:text-black text-xs font-bold uppercase tracking-widest p-1"
                disabled={isImportingJson}
              >
                ✕ Close
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleJsonImport} className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
              <p className="text-xs text-gray-500 leading-relaxed">
                Paste a valid JSON array or a single JSON product object below to instantly add them to the store catalog. 
                Missing optional parameters will automatically fall back to high-comfort premium defaults.
              </p>

              {/* Sample Template Helper */}
              <div className="p-3.5 bg-gray-50 border border-gray-200 space-y-1 text-[11px]">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-gray-700 uppercase text-[9px] tracking-wider">Required Schema Format Example:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setImportJsonText(JSON.stringify([
                        {
                          "name": "Megna Classic Leather Loafers",
                          "category": "Footwear",
                          "subCategory": "Loafers",
                          "brand": "MEGNA ENTERPRISE",
                          "priceINR": 4200,
                          "priceBDT": 4900,
                          "discountPercent": 10,
                          "stock": 999999,
                          "description": "Handcrafted Argentine full-grain leather loafers.",
                          "sizes": ["8", "9", "10"],
                          "colors": ["Tan", "Midnight Black"]
                        }
                      ], null, 2));
                      setImportJsonError("");
                    }}
                    className="text-[10px] text-orange-600 hover:underline font-bold"
                  >
                    📋 Load Template Schema
                  </button>
                </div>
                <pre className="font-mono text-gray-500 bg-white p-2 border border-gray-150 text-[9px] overflow-x-auto max-h-[140px] leading-relaxed">
{`[
  {
    "name": "Megna Classic Leather Loafers",
    "category": "Footwear",
    "subCategory": "Loafers",
    "brand": "MEGNA ENTERPRISE",
    "priceINR": 4200,
    "priceBDT": 4900,
    "discountPercent": 10,
    "stock": 999999,
    "description": "Handcrafted Argentine full-grain leather loafers.",
    "sizes": ["8", "9", "10"],
    "colors": ["Tan", "Midnight Black"]
  }
]`}
                </pre>
              </div>

              {/* Text Area */}
              <div className="flex-1 min-h-[220px] flex flex-col">
                <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Pasted JSON Code Payload</label>
                <textarea
                  required
                  value={importJsonText}
                  onChange={(e) => {
                    setImportJsonText(e.target.value);
                    if (importJsonError) setImportJsonError("");
                  }}
                  placeholder="[\n  {\n    &quot;name&quot;: &quot;Product SKU&quot;,\n    &quot;priceINR&quot;: 1500,\n    &quot;priceBDT&quot;: 1800\n  }\n]"
                  className="w-full flex-1 p-3 font-mono text-xs bg-gray-50 border border-gray-200 focus:outline-none focus:border-black focus:bg-white resize-none h-[220px]"
                  disabled={isImportingJson}
                />
              </div>

              {/* Messages */}
              {importJsonError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-mono font-medium leading-relaxed whitespace-pre-wrap">
                  ⚠️ Error: {importJsonError}
                </div>
              )}
              {importJsonSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs font-bold flex items-center gap-1.5">
                  ✓ {importJsonSuccess}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 border-t border-gray-150 flex justify-end gap-3 bg-white">
                <button
                  type="button"
                  onClick={() => setShowJsonImportModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold uppercase tracking-widest cursor-pointer"
                  disabled={isImportingJson}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-black text-white hover:bg-orange-600 disabled:bg-gray-300 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer"
                  disabled={isImportingJson || !importJsonText.trim()}
                >
                  {isImportingJson ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin rounded-full"></span>
                      Importing Records...
                    </>
                  ) : (
                    "Parse and Import JSON"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
