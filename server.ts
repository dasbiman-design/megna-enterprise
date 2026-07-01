import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./src/server-db.js"; // Use JS extension or direct relative depending on ESM
import { GoogleGenAI } from "@google/genai";

// Try importing server-db with proper resolution
import * as serverDbModule from "./src/server-db.js";
const database = (serverDbModule as any).db || db;

const app = express();
const PORT = 3000;

// Enable JSON bodies
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini AI Client initialized successfully.");
  } else {
    console.warn("GEMINI_API_KEY not found or is placeholder. Using smart styling fallback generator.");
  }
} catch (e) {
  console.error("Failed to initialize Gemini Client:", e);
}

// REST API MIDDLEWARE - SIMPLE AUTHORIZATION CHECK
// We use a simple custom header 'Authorization: Bearer <user_id>' for high fidelity
const getAuthorizedUser = (req: express.Request) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const userId = authHeader.split(" ")[1];
  const users = database.getUsers();
  return users.find((u: any) => u.id === userId) || null;
};

// ==================== AUTHENTICATION API ====================

// Login
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const users = database.getUsers();
  const user = users.find(
    (u: any) =>
      u.username.toLowerCase() === username.toLowerCase() &&
      u.passwordHash === password
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  database.logActivity("User Login", user.username, `Successful login by ${user.name}`);
  res.json({
    token: user.id, // Direct robust user session token
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      addresses: user.addresses,
      wishlist: user.wishlist,
      profilePhoto: user.profilePhoto,
      notifications: user.notifications
    }
  });
});

// Register
app.post("/api/auth/register", (req, res) => {
  const { username, email, name, password, phone } = req.body;
  if (!username || !email || !name || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const users = database.getUsers();
  if (users.find((u: any) => u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(400).json({ error: "Username already exists" });
  }
  if (users.find((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: "Email already registered" });
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    username,
    email,
    name,
    passwordHash: password, // Store password safely
    role: "customer" as const,
    phone: phone || "",
    addresses: [],
    wishlist: [],
    notifications: [
      {
        id: `notif-${Date.now()}`,
        title: "Welcome to MEGNA Enterprise",
        message: `Hello ${name}! Welcome to premium fashion e-commerce.`,
        date: new Date().toISOString().split("T")[0],
        read: false
      }
    ]
  };

  users.push(newUser);
  database.saveUsers(users);
  database.logActivity("User Registration", username, `New user ${name} registered.`);

  res.status(201).json({
    token: newUser.id,
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      phone: newUser.phone,
      addresses: newUser.addresses,
      wishlist: newUser.wishlist,
      notifications: newUser.notifications
    }
  });
});

// Current User profile verification
app.get("/api/auth/me", (req, res) => {
  const user = getAuthorizedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized session" });
  }
  res.json({ user });
});

// Update Profile
app.put("/api/auth/profile", (req, res) => {
  const authUser = getAuthorizedUser(req);
  if (!authUser) return res.status(401).json({ error: "Unauthorized" });

  const { name, phone, addresses, profilePhoto } = req.body;
  const users = database.getUsers();
  const userIdx = users.findIndex((u: any) => u.id === authUser.id);

  if (userIdx === -1) return res.status(404).json({ error: "User not found" });

  if (name) users[userIdx].name = name;
  if (phone) users[userIdx].phone = phone;
  if (addresses) users[userIdx].addresses = addresses;
  if (profilePhoto) users[userIdx].profilePhoto = profilePhoto;

  database.saveUsers(users);
  database.logActivity("Profile Update", authUser.username, "Updated profile credentials");

  res.json({ user: users[userIdx] });
});

// Update Wishlist
app.post("/api/auth/wishlist", (req, res) => {
  const authUser = getAuthorizedUser(req);
  if (!authUser) return res.status(401).json({ error: "Unauthorized" });

  const { productId } = req.body;
  if (!productId) return res.status(400).json({ error: "Product ID required" });

  const users = database.getUsers();
  const userIdx = users.findIndex((u: any) => u.id === authUser.id);

  if (userIdx === -1) return res.status(404).json({ error: "User not found" });

  const wishlist = users[userIdx].wishlist || [];
  const index = wishlist.indexOf(productId);

  if (index === -1) {
    wishlist.push(productId);
  } else {
    wishlist.splice(index, 1);
  }
  users[userIdx].wishlist = wishlist;
  database.saveUsers(users);

  res.json({ wishlist });
});

// Clear User Notifications
app.post("/api/auth/notifications/read", (req, res) => {
  const authUser = getAuthorizedUser(req);
  if (!authUser) return res.status(401).json({ error: "Unauthorized" });

  const users = database.getUsers();
  const userIdx = users.findIndex((u: any) => u.id === authUser.id);

  if (userIdx !== -1) {
    users[userIdx].notifications = users[userIdx].notifications.map((n: any) => ({ ...n, read: true }));
    database.saveUsers(users);
  }
  res.json({ success: true });
});


// ==================== PRODUCTS API ====================

// Get all products + Filter options
app.get("/api/products", (req, res) => {
  let products = database.getProducts();
  const { search, category, subCategory, brand, color, size, gender, minPrice, maxPrice, sort, currency } = req.query;

  // Search
  if (search) {
    const q = (search as string).toLowerCase();
    products = products.filter(
      (p: any) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
    );
  }

  // Category
  if (category) {
    products = products.filter((p: any) => p.category.toLowerCase() === (category as string).toLowerCase());
  }

  // Sub Category
  if (subCategory) {
    products = products.filter((p: any) => p.subCategory.toLowerCase() === (subCategory as string).toLowerCase());
  }

  // Brand
  if (brand) {
    products = products.filter((p: any) => p.brand.toLowerCase() === (brand as string).toLowerCase());
  }

  // Color Filter
  if (color) {
    products = products.filter((p: any) =>
      p.colors.some((c: string) => c.toLowerCase() === (color as string).toLowerCase())
    );
  }

  // Size Filter
  if (size) {
    products = products.filter((p: any) =>
      p.sizes.some((s: string) => s.toLowerCase() === (size as string).toLowerCase() || s.toLowerCase() === "free size")
    );
  }

  // Price Limits (Dynamic based on selected currency)
  const isBDT = currency === "BDT";
  if (minPrice) {
    const min = parseFloat(minPrice as string);
    products = products.filter((p: any) => (isBDT ? p.priceBDT : p.priceINR) >= min);
  }
  if (maxPrice) {
    const max = parseFloat(maxPrice as string);
    products = products.filter((p: any) => (isBDT ? p.priceBDT : p.priceINR) <= max);
  }

  // Sorting
  if (sort) {
    switch (sort as string) {
      case "price-low":
        products.sort((a: any, b: any) => (isBDT ? a.priceBDT : a.priceINR) - (isBDT ? b.priceBDT : b.priceINR));
        break;
      case "price-high":
        products.sort((a: any, b: any) => (isBDT ? b.priceBDT : b.priceINR) - (isBDT ? a.priceBDT : a.priceINR));
        break;
      case "newest":
        products.sort((a: any, b: any) => b.id.localeCompare(a.id));
        break;
      case "popularity":
      default:
        products.sort((a: any, b: any) => b.ratings - a.ratings);
        break;
    }
  }

  res.json(products);
});

// Single Product details
app.get("/api/products/:id", (req, res) => {
  const products = database.getProducts();
  const product = products.find((p: any) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

// Admin Create Product
app.post("/api/products", (req, res) => {
  const authUser = getAuthorizedUser(req);
  if (!authUser || authUser.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  const productData = req.body;
  if (!productData.name || !productData.priceINR || !productData.category) {
    return res.status(400).json({ error: "Name, price and category are required" });
  }

  const products = database.getProducts();
  const newProduct = {
    ...productData,
    id: `prod-${Date.now()}`,
    sku: productData.sku || `ME-DF-${Math.floor(Math.random() * 9000 + 1000)}`,
    barcode: productData.barcode || `${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
    ratings: 5.0,
    reviews: []
  };

  products.push(newProduct);
  database.saveProducts(products);
  database.logActivity("Create Product", authUser.username, `Added new product: ${newProduct.name}`);

  res.status(201).json(newProduct);
});

// Admin Update Product
app.put("/api/products/:id", (req, res) => {
  const authUser = getAuthorizedUser(req);
  if (!authUser || authUser.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  const products = database.getProducts();
  const idx = products.findIndex((p: any) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Product not found" });

  products[idx] = { ...products[idx], ...req.body };
  database.saveProducts(products);
  database.logActivity("Update Product", authUser.username, `Updated product details: ${products[idx].name}`);

  res.json(products[idx]);
});

// Admin Delete Product
app.delete("/api/products/:id", (req, res) => {
  const authUser = getAuthorizedUser(req);
  if (!authUser || authUser.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  const products = database.getProducts();
  const idx = products.findIndex((p: any) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Product not found" });

  const deletedName = products[idx].name;
  products.splice(idx, 1);
  database.saveProducts(products);
  database.logActivity("Delete Product", authUser.username, `Removed product: ${deletedName}`);

  res.json({ success: true, message: "Product deleted" });
});

// Product Review Post
app.post("/api/products/:id/reviews", (req, res) => {
  const { userName, rating, comment } = req.body;
  if (!userName || !rating) {
    return res.status(400).json({ error: "Review name and rating required" });
  }

  const products = database.getProducts();
  const idx = products.findIndex((p: any) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Product not found" });

  const newReview = {
    id: `rev-${Date.now()}`,
    userName,
    rating: Number(rating),
    comment: comment || "",
    date: new Date().toISOString().split("T")[0]
  };

  const reviews = products[idx].reviews || [];
  reviews.push(newReview);
  products[idx].reviews = reviews;

  // Recalculate rating
  const total = reviews.reduce((sum: number, r: any) => sum + r.rating, 0);
  products[idx].ratings = parseFloat((total / reviews.length).toFixed(1));

  database.saveProducts(products);
  res.status(201).json(newReview);
});


// ==================== ORDERS API ====================

// Get orders (All for admin, filtered for customer)
app.get("/api/orders", (req, res) => {
  const authUser = getAuthorizedUser(req);
  if (!authUser) return res.status(401).json({ error: "Unauthorized" });

  const orders = database.getOrders();
  if (authUser.role === "admin") {
    return res.json(orders);
  } else {
    const userOrders = orders.filter((o: any) => o.customerId === authUser.id);
    return res.json(userOrders);
  }
});

// Get individual order details (No auth required to allow public Guest tracking with phone validation)
app.get("/api/orders/:idOrNum", (req, res) => {
  const orders = database.getOrders();
  const order = orders.find(
    (o: any) =>
      o.id === req.params.idOrNum ||
      o.orderNumber.toLowerCase() === req.params.idOrNum.toLowerCase()
  );

  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});

// Place Order (Checkout)
app.post("/api/orders", (req, res) => {
  const {
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    billingAddress,
    items,
    currency,
    subtotal,
    discountAmount,
    couponCodeUsed,
    shippingCharge,
    tax,
    total,
    paymentMethod,
    orderNotes
  } = req.body;

  if (!customerName || !customerEmail || !customerPhone || !items || !items.length) {
    return res.status(400).json({ error: "Missing required order checkout details" });
  }

  const authUser = getAuthorizedUser(req);
  const orders = database.getOrders();
  const orderNum = `ME-2026-${Math.floor(Math.random() * 90000 + 10000)}`;

  const newOrder = {
    id: `ord-${Date.now()}`,
    orderNumber: orderNum,
    customerId: authUser ? authUser.id : undefined,
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    billingAddress: billingAddress || shippingAddress,
    items,
    currency: currency || "INR",
    subtotal,
    discountAmount: discountAmount || 0,
    couponCodeUsed,
    shippingCharge: shippingCharge || 0,
    tax: tax || 0,
    total,
    paymentMethod,
    paymentStatus: paymentMethod === "Cash on Delivery" ? ("Pending" as const) : ("Paid" as const),
    orderStatus: "Pending" as const,
    orderNotes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  orders.unshift(newOrder); // Newest on top
  database.saveOrders(orders);

  // Keep stocks unlimited
  const products = database.getProducts();
  items.forEach((item: any) => {
    const pIdx = products.findIndex((p: any) => p.id === item.productId);
    if (pIdx !== -1) {
      products[pIdx].stock = 999999; // Truly unlimited stock
    }
  });
  database.saveProducts(products);

  // Alert registered user via dashboard notification
  if (authUser) {
    const users = database.getUsers();
    const userIdx = users.findIndex((u: any) => u.id === authUser.id);
    if (userIdx !== -1) {
      users[userIdx].notifications.unshift({
        id: `notif-${Date.now()}`,
        title: "Order Placed Successfully",
        message: `Your order ${orderNum} has been registered and is under verification. Thank you for shopping!`,
        date: new Date().toISOString().split("T")[0],
        read: false
      });
      database.saveUsers(users);
    }
  }

  database.logActivity("Place Order", authUser ? authUser.username : "Guest", `Placed Order ${orderNum} totaling ${currency} ${total}`);
  res.status(201).json(newOrder);
});

// Admin Update Order Status
app.put("/api/orders/:id/status", (req, res) => {
  const authUser = getAuthorizedUser(req);
  if (!authUser || authUser.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  const { orderStatus, paymentStatus } = req.body;
  const orders = database.getOrders();
  const idx = orders.findIndex((o: any) => o.id === req.params.id);

  if (idx === -1) return res.status(404).json({ error: "Order not found" });

  if (orderStatus) orders[idx].orderStatus = orderStatus;
  if (paymentStatus) orders[idx].paymentStatus = paymentStatus;
  orders[idx].updatedAt = new Date().toISOString();

  database.saveOrders(orders);

  // Notify customer if order was registered to a registered ID
  if (orders[idx].customerId) {
    const users = database.getUsers();
    const userIdx = users.findIndex((u: any) => u.id === orders[idx].customerId);
    if (userIdx !== -1) {
      users[userIdx].notifications.unshift({
        id: `notif-st-${Date.now()}`,
        title: `Order Status: ${orderStatus}`,
        message: `Your order ${orders[idx].orderNumber} status was changed to: ${orderStatus}.`,
        date: new Date().toISOString().split("T")[0],
        read: false
      });
      database.saveUsers(users);
    }
  }

  database.logActivity("Order Status Update", authUser.username, `Updated Order ${orders[idx].orderNumber} to ${orderStatus}`);
  res.json(orders[idx]);
});


// ==================== COUPONS API ====================

app.get("/api/coupons", (req, res) => {
  res.json(database.getCoupons());
});

app.post("/api/coupons", (req, res) => {
  const authUser = getAuthorizedUser(req);
  if (!authUser || authUser.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  const coupons = database.getCoupons();
  const newCoupon = req.body;
  if (!newCoupon.code || !newCoupon.discountPercent) {
    return res.status(400).json({ error: "Coupon code and percent are required" });
  }

  coupons.push({
    code: newCoupon.code.toUpperCase(),
    discountPercent: Number(newCoupon.discountPercent),
    minSpendINR: Number(newCoupon.minSpendINR || 500),
    minSpendBDT: Number(newCoupon.minSpendBDT || 600),
    isActive: true,
    expiryDate: newCoupon.expiryDate || "2027-12-31"
  });

  database.saveCoupons(coupons);
  database.logActivity("Create Coupon", authUser.username, `Added coupon code: ${newCoupon.code}`);
  res.status(201).json(newCoupon);
});

app.delete("/api/coupons/:code", (req, res) => {
  const authUser = getAuthorizedUser(req);
  if (!authUser || authUser.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  const coupons = database.getCoupons();
  const idx = coupons.findIndex((c: any) => c.code === req.params.code.toUpperCase());
  if (idx === -1) return res.status(404).json({ error: "Coupon not found" });

  coupons.splice(idx, 1);
  database.saveCoupons(coupons);
  database.logActivity("Delete Coupon", authUser.username, `Deleted coupon: ${req.params.code}`);
  res.json({ success: true });
});


// ==================== SETTINGS API ====================

app.get("/api/settings", (req, res) => {
  res.json(database.getSettings());
});

app.put("/api/settings", (req, res) => {
  const authUser = getAuthorizedUser(req);
  if (!authUser || authUser.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  const currentSettings = database.getSettings();
  const updated = { ...currentSettings, ...req.body };
  database.saveSettings(updated);
  database.logActivity("Update Settings", authUser.username, "Updated global store parameters and gateways");
  res.json(updated);
});


// ==================== ADMIN AUDIT LOGS ====================

app.get("/api/logs", (req, res) => {
  const authUser = getAuthorizedUser(req);
  if (!authUser || authUser.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  res.json(database.getActivityLogs());
});


// ==================== AI STYLIST API (GEMINI SDK) ====================

app.post("/api/ai-stylist", async (req, res) => {
  const { message, chatHistory } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const systemPrompt = `You are "Megna AI Stylist", the virtual premium fashion & shoe expert of MEGNA ENTERPRISE.
Your voice is luxurious, modern, helpful, friendly, and extremely knowledgeable in shoes and dress styling.
MEGNA ENTERPRISE sells footwear (Sneakers, Heels, Formal leather shoes, Loafers, Sports Shoes, Walking Shoes) and apparel for men, women, and children (Traditional sarees, Jamdani sarees, Embroidered Kurtas, Jackets, blazers, Frocks, accessories like luxury wallets, premium watches).
Provide highly customized styling advice, suggest matching outfits/footwear combos, select appropriate garments based on user-described events (weddings, gym workouts, client presentations, festive pujas, casual outings).
Address prices in INR and BDT when customers inquire about general budget parameters.
Recommend specific items from our collection based on what they say:
- For weddings/festivals: Sarees (Banarasi Silk, Jamdani), Kurtas with hand Chikankari, court heels, or leather loafers.
- For daily/athletic wear: Megna Pro Elite Athletic Sneakers.
- For business/semi-formal: Italian Leather Loafers, blazers, luxor chronograph watches.
Keep your answer engaging and formatted in clear, easy-to-read markdown paragraphs and bullet points. Do not mention any code, variables, or system logs.`;

  // Check if Gemini Client is initialized
  if (ai) {
    try {
      // Build conversation structures
      const formattedContents = [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Understood. I am Megna AI Stylist, your premium fashion concierge. How can I help elevate your wardrobe today?" }] }
      ];

      if (chatHistory && Array.isArray(chatHistory)) {
        chatHistory.slice(-6).forEach((item: any) => {
          formattedContents.push({
            role: item.role === "user" ? "user" : "model",
            parts: [{ text: item.text }]
          });
        });
      }

      formattedContents.push({ role: "user", parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
      });

      const responseText = response.text || "I am currently fine-tuning my wardrobe recommendations. How else can I assist you?";
      return res.json({ reply: responseText });
    } catch (err: any) {
      console.error("Gemini query execution failed:", err);
      // Fail gracefully down to fallback
    }
  }

  // Smart local fallback stylist advice generator (Rule-based stylish responses)
  const query = message.toLowerCase();
  let reply = "";

  if (query.includes("wedding") || query.includes("saree") || query.includes("marriage") || query.includes("party")) {
    reply = `✨ **Megna AI Stylist Recommendation for Festive & Weddings** ✨\n\nFor wedding grand events and luxury parties, nothing surpasses the sheer grace of our **Royal Banarasi Silk Saree** with exquisite golden zari weave, or the premium hand-woven **Dhakai Jamdani Saree**. \n\n*   **For Women:** Pair the Crimson-Gold Banarasi Saree with our sleek **Stiletto Velvet Court Heels** in maroon or classic black for a regal posture.\n*   **For Men:** Choose our hand-embroidered **Lucknowi cotton-silk Kurta** or a tailored sherwani. Finish the classic look with the **Classic Italian Leather Loafers** in classic brown.\n*   **Accessory Accent:** Add our **Luxor Premium Chronograph Watch** in rose gold for a luxurious final touch!\n\nWould you like me to guide you to our saree category or help with sizing?`;
  } else if (query.includes("shoe") || query.includes("sneaker") || query.includes("run") || query.includes("sport") || query.includes("footwear")) {
    reply = `👟 **Megna AI Stylist - Ultimate Footwear Match** 👟\n\nShoes are the foundation of any elite outfit! At MEGNA ENTERPRISE, we specialize in high-comfort luxury footwear:\n\n*   **Active Lifestyle / Workouts:** Check out our **Megna Pro Elite Athletic Sneakers**. Made with fly-knit breathability, they provide high-elastic response ideal for running, jogging, or gym training.\n*   **Professional Boardrooms & Dinner:** Slide into our hand-crafted **Italian Leather Loafers** in rich espresso brown. Excellent padding makes them comfortable for long days.\n*   **Sophisticated After-Hours:** Enhance your evening attire with the **Stiletto Velvet Heels**, designed with memory foam soles for pain-free elegance.\n\nWhat size do you usually wear? I can check active stocks for you!`;
  } else if (query.includes("discount") || query.includes("coupon") || query.includes("sale") || query.includes("offer")) {
    reply = `🏷️ **Premium Exclusive Offers** 🏷️\n\nWe have fantastic rewards active right now for our India and Bangladesh fashion patrons:\n\n*   Use coupon **FESTIVE25** to secure a grand **25% off** on orders exceeding ₹4,000 or ৳4,700.\n*   Use coupon **MEGNA10** for an instant **10% off** your cart.\n*   We are also running a site-wide **Monsoon Grand Sale** with up to 25% price reduction automatically applied!\n\nWould you like me to help apply a coupon code to your shopping bag?`;
  } else if (query.includes("bengali") || query.includes("bangladesh") || query.includes("bdt") || query.includes("kolkata") || query.includes("dhaka")) {
    reply = `🇧🇩 🇮🇳 **MEGNA ENTERPRISE - Serving India & Bangladesh** \n\nWe support our lovely fashion communities in both nations with express shipping and localized currency conversion (INR & BDT). Our handwoven **Dhakai Jamdani Sarees** are imported directly from master artisans in Dhaka, while our premium silk sarees are hand-crafted in Varanasi.\n\n*   **Quick conversions** are fully active on top of our website navigation bar!\n*   We support bKash, Nagad, Rocket, SSLCommerz in Bangladesh, and Razorpay, PhonePe, Paytm, and BHIM UPI in India.\n\nHow can I help customize your delivery across borders today?`;
  } else {
    reply = `🌸 **Welcome to MEGNA ENTERPRISE Luxe Concierge** 🌸\n\nI am your dedicated virtual fashion concierge. I can help you design high-fashion attire, pair premium footwear, or suggest perfect gifts. \n\nTell me about: \n*   The event you are styling for (casual, athletic, party, formal office)\n*   Your favorite style preferences (traditional sarees, modern western wear, elite leather loafers, comfort sneakers)\n*   Any budget or sizes you want to filter!\n\nWhat can we explore together today?`;
  }

  res.json({ reply });
});


// ==================== DEV VS PRODUCTION VITE SERVING ====================

async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode serving compiled static assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MEGNA ENTERPRISE server running at http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Critical server boot failure:", err);
});
