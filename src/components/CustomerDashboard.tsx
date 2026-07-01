import React, { useState, useEffect } from "react";
import { User, MapPin, ClipboardList, Bell, Lock, UserCheck, ChevronRight, FileText, Search, Star, Sparkles } from "lucide-react";
import { api, Order } from "../api-client";

interface CustomerDashboardProps {
  user: any | null;
  onLoginSuccess: (user: any, token: string) => void;
  onLogout: () => void;
  currency: "INR" | "BDT";
  onSelectOrderNum?: (num: string) => void;
}

export default function CustomerDashboard({
  user,
  onLoginSuccess,
  onLogout,
  currency,
  onSelectOrderNum,
}: CustomerDashboardProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "notifications">("orders");

  // Login Form
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Tracking a specific order manually
  const [searchOrderNum, setSearchOrderNum] = useState("");
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [trackError, setTrackError] = useState("");

  // Orders and profile details
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);

  // Address Form details
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrLine, setAddrLine] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrZip, setAddrZip] = useState("");
  const [addrCountry, setAddrCountry] = useState<"India" | "Bangladesh">("India");

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      const list = await api.getOrders();
      setOrders(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
      setOrders([]);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    try {
      if (isRegister) {
        const response = await api.register({ username, email, name, password, phone });
        onLoginSuccess(response.user, response.token);
        setSuccessMsg("Account registered successfully!");
      } else {
        const response = await api.login(username, password);
        onLoginSuccess(response.user, response.token);
        setSuccessMsg("Logged in successfully!");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const newAddr = {
      id: `addr-${Date.now()}`,
      type: "Shipping" as const,
      addressLine1: addrLine,
      city: addrCity,
      state: addrState,
      postalCode: addrZip,
      country: addrCountry,
    };
    const updatedAddresses = [...(user.addresses || []), newAddr];
    try {
      const response = await api.updateProfile({ addresses: updatedAddresses });
      user.addresses = response.user.addresses; // update local pointer safely
      setShowAddressForm(false);
      setAddrLine("");
      setAddrCity("");
      setAddrState("");
      setAddrZip("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError("");
    setTrackedOrder(null);
    if (!searchOrderNum.trim()) return;

    try {
      const ord = await api.getOrder(searchOrderNum.trim());
      setTrackedOrder(ord);
    } catch (err) {
      setTrackError("No active order matching this Order Code / reference. Double-check number.");
    }
  };

  const handleReadNotifications = async () => {
    if (!user) return;
    try {
      await api.readNotifications();
      // locally mark as read to prevent infinite loop
      user.notifications = user.notifications.map((n: any) => ({ ...n, read: true }));
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Auth gate if user not logged in
  if (!user) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-4">
        {/* Left column: Login/Register Form */}
        <div className="lg:col-span-6 bg-white border border-gray-100 p-8 flex flex-col justify-between">
          <div>
            <span className="text-orange-600 text-[10px] font-bold tracking-[0.3em] uppercase block mb-2">
              Luxe Authenticator
            </span>
            <h2 className="text-3xl font-light tracking-tight mb-6">
              {isRegister ? "Join " : "Welcome Back to "} <span className="font-black">Megna.</span>
            </h2>

            {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs mb-4">{error}</div>}
            {successMsg && <div className="p-3 bg-green-50 border border-green-200 text-green-600 text-xs mb-4">{successMsg}</div>}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. customer1 or MEGNAADMIN"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {isRegister && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Biman Das"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. +918250568500"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Secure Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-black"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-orange-600 hover:scale-105 hover:tracking-[0.2em] transition-all duration-300"
              >
                {isRegister ? "Create Luxury Profile" : "Secure Log In"}
              </button>
            </form>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-400">
              {isRegister ? "Already registered at Megna?" : "New to Megna Enterprise?"}
            </span>
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="font-bold uppercase tracking-wider text-orange-600 hover:text-black transition-colors"
            >
              {isRegister ? "Login instead" : "Register Profile"}
            </button>
          </div>

          <div className="mt-4 p-3 bg-orange-50/50 border border-orange-100 text-[10px] text-gray-500 rounded-none">
            💡 **Demo Admin Access:** Username: <code className="font-bold text-black">MEGNAADMIN</code> | Password: <code className="font-bold text-black">123456</code>
          </div>
        </div>

        {/* Right column: Track Guest/Public Order (No login needed!) */}
        <div className="lg:col-span-6 bg-[#121212] p-8 text-white flex flex-col justify-between">
          <div>
            <span className="text-orange-500 text-[10px] font-bold tracking-[0.3em] uppercase block mb-2">
              Guest Services
            </span>
            <h2 className="text-3xl font-light tracking-tight leading-tight mb-4">
              Track Guest <br />
              <span className="font-black">Order Delivery.</span>
            </h2>
            <p className="text-gray-400 text-xs font-light max-w-sm mb-6 leading-relaxed">
              No profile? No problem. Simply enter your Order number below (e.g. ME-2026-1001) to query live logistics status.
            </p>

            <form onSubmit={handleTrackOrder} className="flex gap-2 mb-4">
              <input
                type="text"
                required
                placeholder="ME-2026-XXXXX"
                value={searchOrderNum}
                onChange={(e) => setSearchOrderNum(e.target.value)}
                className="flex-1 bg-neutral-900 border border-neutral-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-orange-500 hover:text-white transition-all"
              >
                Track
              </button>
            </form>

            {trackError && <p className="text-red-400 text-xs font-light mt-2">{trackError}</p>}

            {trackedOrder && (
              <div className="mt-6 p-4 bg-neutral-900 border border-neutral-800 space-y-4">
                <div className="flex justify-between items-center pb-2.5 border-b border-neutral-800">
                  <div>
                    <span className="text-[10px] text-gray-500 block">Order ID</span>
                    <span className="text-xs font-bold text-orange-400">{trackedOrder.orderNumber}</span>
                  </div>
                  <span className="px-2 py-1 bg-white text-black text-[9px] font-bold uppercase">
                    {trackedOrder.orderStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-neutral-500 block text-[9px] uppercase">Recipient</span>
                    <span className="font-medium">{trackedOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[9px] uppercase">Destination</span>
                    <span className="font-medium">{trackedOrder.shippingAddress.city}, {trackedOrder.shippingAddress.country}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[9px] uppercase">Shipment Mode</span>
                    <span className="font-medium">{trackedOrder.paymentMethod}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[9px] uppercase">Total Amount</span>
                    <span className="font-bold text-white">
                      {trackedOrder.currency === "BDT" ? "৳" : "₹"}{trackedOrder.total.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Simulated Order timeline */}
                <div className="pt-4 border-t border-neutral-800">
                  <span className="text-[9px] text-gray-400 uppercase tracking-widest block mb-2.5">Timeline Status</span>
                  <div className="flex justify-between relative text-[10px]">
                    <div className="absolute top-1 left-2 right-2 h-0.5 bg-neutral-800 z-0"></div>
                    {["Pending", "Confirmed", "Shipped", "Delivered"].map((st, sIdx) => {
                      const stages = ["Pending", "Confirmed", "Processing", "Packed", "Shipped", "Delivered"];
                      const currentIdx = stages.indexOf(trackedOrder.orderStatus);
                      const stageIdx = stages.indexOf(st);
                      const isPast = currentIdx >= stageIdx;
                      return (
                        <div key={st} className="flex flex-col items-center z-10">
                          <div className={`w-3 h-3 rounded-full border ${isPast ? "bg-orange-500 border-orange-500" : "bg-neutral-900 border-neutral-700"}`} />
                          <span className={`text-[8px] mt-1 ${isPast ? "text-white font-bold" : "text-gray-500"}`}>{st}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider pt-6 border-t border-neutral-900">
            Secure tracking • Megna Enterprise Cargo Verification
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top dashboard intro bar */}
      <div className="p-6 bg-neutral-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-lg font-bold">
            {user.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight">{user.name}</h3>
            <p className="text-xs text-neutral-400">
              Registered Patron • {user.email} • {user.phone}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {user.role === "admin" && (
            <span className="bg-orange-600 text-white font-bold text-[9px] tracking-widest uppercase px-3 py-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> SYSTEM ADMIN
            </span>
          )}
          <button
            onClick={onLogout}
            className="px-4 py-1.5 bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-orange-500 hover:text-white transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-gray-100 text-xs font-bold tracking-wider uppercase text-gray-400">
        <button
          onClick={() => {
            setActiveTab("orders");
            setSelectedInvoice(null);
          }}
          className={`px-5 py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === "orders" ? "border-black text-black" : "border-transparent hover:text-black"
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          My Orders ({orders.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("profile");
            setSelectedInvoice(null);
          }}
          className={`px-5 py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === "profile" ? "border-black text-black" : "border-transparent hover:text-black"
          }`}
        >
          <User className="w-4 h-4" />
          Shipping Addresses
        </button>
        <button
          onClick={() => {
            setActiveTab("notifications");
            setSelectedInvoice(null);
            handleReadNotifications();
          }}
          className={`px-5 py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === "notifications" ? "border-black text-black" : "border-transparent hover:text-black"
          }`}
        >
          <Bell className="w-4 h-4" />
          Notifications ({(user.notifications || []).filter((n: any) => !n.read).length})
        </button>
      </div>

      {/* Selected Invoice View */}
      {selectedInvoice ? (
        <div className="border border-black p-8 bg-white space-y-6 max-w-2xl mx-auto printable" id="invoice-sheet">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-2xl font-black uppercase tracking-tighter block">MEGNA<span className="text-orange-600">.</span></span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">Premium Luxury Footwear & Fashion</span>
            </div>
            <div className="text-right">
              <h4 className="text-lg font-bold uppercase text-orange-600">INVOICE</h4>
              <span className="text-xs font-mono font-bold">{selectedInvoice.orderNumber}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 text-xs pt-4 border-t border-gray-100">
            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">Billed To:</span>
              <span className="font-bold text-gray-800">{selectedInvoice.customerName}</span>
              <p className="text-gray-500 font-light mt-0.5">
                {selectedInvoice.shippingAddress.addressLine1}, {selectedInvoice.shippingAddress.city}, {selectedInvoice.shippingAddress.state}, {selectedInvoice.shippingAddress.postalCode}, {selectedInvoice.shippingAddress.country}
              </p>
              <p className="text-gray-500 font-light font-mono mt-1">{selectedInvoice.customerPhone}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">Invoice Details:</span>
              <span className="text-gray-600 font-mono">Date: {new Date(selectedInvoice.createdAt).toLocaleDateString()}</span>
              <p className="text-gray-600 mt-1 font-medium">Status: <span className="font-bold text-orange-600">{selectedInvoice.orderStatus}</span></p>
              <p className="text-gray-600 font-medium">Payment Method: {selectedInvoice.paymentMethod}</p>
            </div>
          </div>

          {/* Invoice item stream */}
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-black">
                <th className="py-2">Item Silhouette</th>
                <th className="py-2 text-center">Size</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {selectedInvoice.items.map((it, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-2">
                    <span className="font-bold text-gray-800">{it.productName}</span>
                    <span className="block text-[9px] text-gray-400 font-mono">Color: {it.color} • SKU: {it.sku}</span>
                  </td>
                  <td className="py-2 text-center font-mono">{it.size}</td>
                  <td className="py-2 text-center font-mono">{it.quantity}</td>
                  <td className="py-2 text-right font-mono">
                    {selectedInvoice.currency === "BDT" ? "৳" : "₹"}{(it.price * it.quantity).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="w-1/2 ml-auto text-xs space-y-1 pt-2">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span className="font-mono">{selectedInvoice.currency === "BDT" ? "৳" : "₹"}{selectedInvoice.subtotal.toLocaleString()}</span>
            </div>
            {selectedInvoice.discountAmount > 0 && (
              <div className="flex justify-between text-green-600 font-bold">
                <span>Coupon Discount</span>
                <span className="font-mono">-{selectedInvoice.currency === "BDT" ? "৳" : "₹"}{selectedInvoice.discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-500">
              <span>Vat & Tax</span>
              <span className="font-mono">{selectedInvoice.currency === "BDT" ? "৳" : "₹"}{selectedInvoice.tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Logistics Delivery Charge</span>
              <span className="font-mono">{selectedInvoice.currency === "BDT" ? "৳" : "₹"}{selectedInvoice.shippingCharge.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-base font-black border-t border-black pt-2">
              <span>Total Amount</span>
              <span className="font-mono text-orange-600">{selectedInvoice.currency === "BDT" ? "৳" : "₹"}{selectedInvoice.total.toLocaleString()}</span>
            </div>
          </div>

          <div className="text-center text-[9px] text-gray-400 uppercase tracking-widest pt-8 border-t border-gray-100">
            This is a computer-generated invoice for MEGNA ENTERPRISE • Phone: +91 8250568500
          </div>

          {/* Back & Print Actions */}
          <div className="flex justify-between pt-4 print:hidden">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="px-4 py-2 border border-black text-black text-[10px] font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
            >
              Back To History
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-orange-600 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-orange-500 transition-all"
            >
              Print Invoice
            </button>
          </div>
        </div>
      ) : (
        /* Standard Tab Rendering */
        <div className="bg-white border border-gray-100 p-6">
          {activeTab === "orders" && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-12 text-gray-400 italic text-xs font-light">
                  You have not placed any luxurious orders yet. Start exploring our catalog!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 uppercase tracking-widest text-[9px] text-gray-400">
                        <th className="pb-3 font-bold">Order Code</th>
                        <th className="pb-3 font-bold">Recipient</th>
                        <th className="pb-3 font-bold">Date Placed</th>
                        <th className="pb-3 font-bold">Amount Paid</th>
                        <th className="pb-3 font-bold">Status</th>
                        <th className="pb-3 font-bold text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-gray-50/50">
                          <td className="py-3">
                            <button
                              onClick={() => onSelectOrderNum && onSelectOrderNum(o.orderNumber)}
                              className="font-mono font-bold text-orange-600 hover:underline"
                            >
                              {o.orderNumber}
                            </button>
                          </td>
                          <td className="py-3 font-medium text-gray-700">{o.customerName}</td>
                          <td className="py-3 text-gray-500 font-mono">{new Date(o.createdAt).toLocaleDateString()}</td>
                          <td className="py-3 font-bold text-gray-900">
                            {o.currency === "BDT" ? "৳" : "₹"}{o.total.toLocaleString()}
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border border-black rounded-none">
                              {o.orderStatus}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => setSelectedInvoice(o)}
                              className="p-1.5 hover:bg-black hover:text-white rounded-full transition-colors text-gray-500 inline-flex items-center gap-1"
                              title="Generate Invoice Receipt"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span className="text-[9px] font-bold uppercase tracking-widest">Invoice</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Registered Addresses</h4>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="px-3 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-wider"
                >
                  {showAddressForm ? "Cancel" : "Add New Address"}
                </button>
              </div>

              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="p-4 bg-gray-50 border border-gray-200 space-y-3 max-w-lg">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Address Line 1</label>
                    <input
                      type="text"
                      required
                      placeholder="Street, Block, Building, Apartment..."
                      value={addrLine}
                      onChange={(e) => setAddrLine(e.target.value)}
                      className="w-full bg-white border border-gray-200 px-3 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={addrCity}
                        onChange={(e) => setAddrCity(e.target.value)}
                        className="w-full bg-white border border-gray-200 px-3 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">State / Region</label>
                      <input
                        type="text"
                        required
                        value={addrState}
                        onChange={(e) => setAddrState(e.target.value)}
                        className="w-full bg-white border border-gray-200 px-3 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Postal Code</label>
                      <input
                        type="text"
                        required
                        value={addrZip}
                        onChange={(e) => setAddrZip(e.target.value)}
                        className="w-full bg-white border border-gray-200 px-3 py-1.5 text-xs focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Country</label>
                      <select
                        value={addrCountry}
                        onChange={(e) => setAddrCountry(e.target.value as any)}
                        className="w-full bg-white border border-gray-200 px-3 py-1.5 text-xs focus:outline-none font-bold"
                      >
                        <option value="India">India</option>
                        <option value="Bangladesh">Bangladesh</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-bold uppercase tracking-widest">
                    Save Address Location
                  </button>
                </form>
              )}

              {(!user.addresses || user.addresses.length === 0) ? (
                <p className="text-xs text-gray-400 italic font-light">No saved delivery addresses yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.addresses.map((addr: any) => (
                    <div key={addr.id} className="border border-gray-100 p-4 space-y-1 relative">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-orange-600 bg-orange-50 px-2 py-0.5">
                        {addr.type} Deliveries
                      </span>
                      <p className="text-xs text-gray-800 font-medium pt-2">{addr.addressLine1}</p>
                      <p className="text-xs text-gray-500 font-light">
                        {addr.city}, {addr.state} - <span className="font-mono">{addr.postalCode}</span>
                      </p>
                      <span className="block text-xs font-bold text-gray-700">{addr.country}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-4">
              {(!user.notifications || user.notifications.length === 0) ? (
                <p className="text-xs text-gray-400 italic">No updates in your luxurious stream.</p>
              ) : (
                <div className="space-y-2.5">
                  {user.notifications.map((n: any) => (
                    <div key={n.id} className={`p-4 border-l-4 ${n.read ? "bg-gray-50 border-gray-300" : "bg-orange-50/40 border-orange-600"} space-y-1`}>
                      <div className="flex justify-between">
                        <h5 className="text-xs font-bold text-gray-800">{n.title}</h5>
                        <span className="text-[9px] text-gray-400 font-mono">{n.date}</span>
                      </div>
                      <p className="text-xs text-gray-600 font-light">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
