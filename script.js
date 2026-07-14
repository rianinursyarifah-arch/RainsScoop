/* ============================================================
   script.js — Rain'sScoop E-Commerce (FIXED VERSION)
   Developed by Riani Nur Syarifah
   ============================================================ */

const STORAGE_PRODUCTS_KEY = "daftar_produk";
const STORAGE_PRODUCTS_KEY_LEGACY = "Rain'ScoopProducts"; // legacy key used by admin pages
const STORAGE_PRODUCTS_KEY_LEGACY_2 = "Rain'sScoopProducts"; // older legacy key from previous versions
const STORAGE_ORDERS_KEY = "Rain'sScoopOrders";
const STORAGE_ALL_ORDERS_KEY = "Rain'sScoopAllOrders";

const STORAGE_USERS_KEY = "Rain'sScoopUsers";
const STORAGE_SESSION_KEY = "Rain'sScoopSession";
const STORAGE_CART_PERSIST_KEY = "Rain'sScoopCartPersist";
const STORAGE_LAST_ORDER_KEY = "Rain'sScoopLastOrder";

/* ===== PAYMENT INFO ===== */
const PAYMENT_INFO = {
  "DANA": {
    va: "089528117555",
    account_name: "Rain'sScoop",
    platform: "DANA"
  },
  "OVO": {
    va: "089528117555",
    account_name: "Rain'sScoop",
    platform: "OVO"
  },
  "GOPAY": {
    va: "089528117555",
    account_name: "Rain'sScoop",
    platform: "GoPay"
  },

  "Transfer BCA": {
    va: "089528117555",
    bank: "BCA",
    account_name: "Rain'sScoop"
  },
  "Transfer BNI": {
    va: "089528117555",
    bank: "BNI",
    account_name: "Rain'sScoop"
  },
  "Transfer BRI": {
    va: "089528117555",
    bank: "BRI",
    account_name: "Rain'sScoop"
  },
  "Transfer Mandiri": {
    va: "089528117555",
    bank: "Mandiri",
    account_name: "Rain'sScoop"
  },

  "SeaBank": {
    va: "9018089528117555",
    bank: "SeaBank",
    account_name: "Rain'sScoop"
  },

  "QRIS": {
    qr_image: "./images/qris.png"
  },

  "COD": {
    va: "Bayar saat barang diterima",
    account_name: "Rain'sScoop",
    platform: "COD"
  }
};

/* ---------- Auth helpers ---------- */
// Disable localStorage for most app state, but preserve users and session so auth works across pages
let _sessionStore = null;
let _usersStore = [];

function getSession() {
  if (_sessionStore) return _sessionStore;
  try {
    const stored = sessionStorage.getItem(STORAGE_SESSION_KEY);
    if (stored) {
      _sessionStore = JSON.parse(stored);
      return _sessionStore;
    }
  } catch (e) {
    _sessionStore = null;
  }
  return _sessionStore;
}

function setSession(s) {
  _sessionStore = s || null;
  try {
    if (s) {
      sessionStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(s));
    } else {
      sessionStorage.removeItem(STORAGE_SESSION_KEY);
    }
  } catch (e) {}
}

function clearSession() {
  _sessionStore = null;
  try { sessionStorage.removeItem(STORAGE_SESSION_KEY); } catch (e) {}
}

function getUsers() {
  if (_usersStore && _usersStore.length) return _usersStore;
  try {
    const stored = localStorage.getItem(STORAGE_USERS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        _usersStore = parsed;
        return _usersStore;
      }
    }
  } catch (e) {
    _usersStore = [];
  }
  _usersStore = [];
  return _usersStore;
}

function saveUsers(u) {
  _usersStore = u || [];
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(_usersStore));
  } catch (e) {}
}

function logoutUser() {
  clearSession();
  updateNavAuth();
  showToast("👋 Berhasil keluar.");
}

function updateNavAuth() {
  const session = getSession();
  const loginItem = document.getElementById("navLoginItem");
  const userItem = document.getElementById("navUserItem");
  const userName = document.getElementById("navUserName");
  if (!loginItem || !userItem) return;
  if (session && session.nama) {
    loginItem.style.display = "none";
    userItem.style.display = "flex";
    if (userName) userName.textContent = "👤 " + session.nama;
  } else {
    loginItem.style.display = "";
    userItem.style.display = "none";
  }
}

/* ---------- Order persistence ---------- */
// In-memory order stores (no localStorage)
let _lastOrderStore = null;
let _allOrdersStore = [];
function getLastOrder() {
  if (_lastOrderStore) return _lastOrderStore;
  try {
    const stored = localStorage.getItem(STORAGE_LAST_ORDER_KEY);
    if (stored) {
      _lastOrderStore = JSON.parse(stored);
      return _lastOrderStore;
    }
  } catch (e) {
    _lastOrderStore = null;
  }
  return _lastOrderStore;
}
function saveLastOrder(o) {
  _lastOrderStore = o || null;
  try {
    if (o) {
      localStorage.setItem(STORAGE_LAST_ORDER_KEY, JSON.stringify(o));
    } else {
      localStorage.removeItem(STORAGE_LAST_ORDER_KEY);
    }
  } catch (e) {
    // ignore storage failures
  }
}

function getAllOrders() {
  if (_allOrdersStore && _allOrdersStore.length) return _allOrdersStore;
  try {
    const stored = localStorage.getItem(STORAGE_ALL_ORDERS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        _allOrdersStore = parsed;
        return _allOrdersStore;
      }
    }
  } catch (e) {
    _allOrdersStore = [];
  }
  _allOrdersStore = _allOrdersStore || [];
  return _allOrdersStore;
}
function saveAllOrders(arr) {
  _allOrdersStore = arr || [];
  try {
    localStorage.setItem(STORAGE_ALL_ORDERS_KEY, JSON.stringify(_allOrdersStore));
  } catch (e) {
    // ignore storage failures
  }
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("id-ID", { weekday:"long", year:"numeric", month:"long", day:"numeric" });
}

const defaultProducts = [
  { id:1, name:"Gelato Mangga", price:165000, emoji:"🥭", image:"./images/manggo-gelato.jpg", desc:"Gelato mangga segar",
    category:"buah", hot:true, stock: 8 },
  { id:2, name:"Gelato Strawberry", price:145000, emoji:"🍓", image:"./images/strawberry-gelato.jpg", desc:"Gelato stroberi manis",
    category:"buah", hot:false, stock: 10 },
  { id:3, name:"Gelato Chocolate", price:155000, emoji:"🍫", image:"./images/chocolate-gelato.jpg", desc:"Gelato coklat lembut",
    category:"susu", hot:true, stock: 12 },
  { id:4, name:"Gelato Mint", price:175000, emoji:"🌿", image:"./images/mint-gelato.jpg", desc:"Gelato mint dingin",
    category:"authentik", hot:false, stock: 9 },
  { id:5, name:"Gelato Lemon", price:210000, emoji:"🍋", image:"./images/lemon-gelato.jpg", desc:"Gelato lemon segar",
    category:"buah", hot:true, stock: 6 },
  { id:6, name:"Gelato Pistachio", price:155000, emoji:"🥜", image:"./images/pistachio-gelato.jpg", desc:"Gelato pistachio harum",
    category:"susu", hot:false, stock: 11 }
];

let products = [];
let cart = [];
let orders = [];
let currentFilter = "semua";
let detailReady = false;

function hideDetailView() {
  const detailSection = document.getElementById("detailView");
  const productsGrid = document.getElementById("productsGrid");
  const detailNotFound = document.getElementById("detailNotFound");
  if (detailSection) {
    detailSection.style.display = "none";
    detailSection.classList.remove("fade-in-right");
    detailSection.classList.add("fade-out-left");
  }
  if (productsGrid) productsGrid.style.display = "grid";
  if (detailNotFound) detailNotFound.style.display = "none";
}

let searchQuery = "";
let appliedVoucher = null;

function clearLegacyStorage() {
  const legacyKeys = [
    'lifaFloraCartPersist',
    'Rain\'ScoopProducts',
    'lifaFloraProducts',
    'lifaFloraCartPersist',
    'lifaFloraOrders',
    'Rain\'ScoopProducts',
    'Rain\'ScoopCartPersist',
    'Rain\'ScoopLastOrder',
    'Rain\'ScoopAdminSession'
  ];
  legacyKeys.forEach(key => {
    try { localStorage.removeItem(key); } catch (e) {}
  });
}

function saveState() {
  // Persistence disabled by request — no-op to avoid storing stale data
}

function loadState() {
  // Load persistent product catalog, fallback to legacy keys if needed.
  let storedProducts = null;
  try {
    storedProducts = localStorage.getItem(STORAGE_PRODUCTS_KEY)
      || localStorage.getItem(STORAGE_PRODUCTS_KEY_LEGACY)
      || localStorage.getItem(STORAGE_PRODUCTS_KEY_LEGACY_2);
  } catch (e) {
    storedProducts = null;
  }

  if (storedProducts) {
    try {
      products = JSON.parse(storedProducts);
      if (!Array.isArray(products)) {
        products = Array.isArray(defaultProducts) ? [...defaultProducts] : [];
      }
    } catch (e) {
      products = Array.isArray(defaultProducts) ? [...defaultProducts] : [];
    }
  } else {
    products = Array.isArray(defaultProducts) ? [...defaultProducts] : [];
  }

  orders = [];
  // Try loading cart from new storage key 'rainsScoopCart' to avoid old cache collisions
  try {
    const stored = localStorage.getItem('rainsScoopCart');
    cart = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(cart)) cart = [];
  } catch (e) { cart = []; }
}

const vouchers = {
  RAINCUTE: { value: 10, maxDiscount: 50000 },
};

function formatPrice(num) {
  return "Rp " + num.toLocaleString("id-ID");
}

function normalizeImagePath(path) {
  if (!path) return "";

  const trimmed = String(path).trim();
  if (!trimmed) return "";

  // If it's a data URL (base64) or external URL, return as-is
  if (/^data:/i.test(trimmed)) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const normalized = trimmed.replace(/\\/g, "/");
  if (normalized.startsWith("./images/")) return normalized;
  if (normalized.startsWith("images/")) return `./${normalized}`;
  if (normalized.startsWith("/images/")) return `.${normalized}`;

  // If it's likely already a relative path, return it unchanged
  return normalized;
}

function getProductImage(product) {
  // Prefer explicit foto/image field
  const raw = product?.foto || product?.image || "";
  let img = normalizeImagePath(raw);

  // If no image found, attempt a name-based fallback to common filenames
  if (!img) {
    const name = (product?.name || "").toLowerCase();
    const map = {
      "mangga": "./images/manggo-gelato.jpg",
      "manggo": "./images/manggo-gelato.jpg",
      "strawberry": "./images/strawberry-gelato.jpg",
      "chocolate": "./images/chocolate-gelato.jpg",
      "mint": "./images/mint-gelato.jpg",
      "lemon": "./images/lemon-gelato.jpg",
      "pistachio": "./images/pistachio-gelato.jpg",
      "pistachio gelato": "./images/pistachio-gelato.jpg"
    };
    for (const key in map) {
      if (name.includes(key)) { img = map[key]; break; }
    }
  }

  return img;
}

function getFilteredProducts(filter = currentFilter) {
  const categoryFiltered = filter === "semua"
    ? products
    : products.filter(product => product.category === filter);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  if (!normalizedQuery) return categoryFiltered;

  return categoryFiltered.filter(product => {
    const haystack = `${product.name} ${product.desc} ${product.category} ${product.emoji}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}

let lastSelectedProductId = null;

function showProductDetail(id) {
  const normalizedId = Number(id);
  lastSelectedProductId = normalizedId;

  const detailSection = document.getElementById("detailView");
  const productsSection = document.getElementById("products");
  const detailNotFound = document.getElementById("detailNotFound");
  if (!detailSection || !productsSection) return;

  // Render UI state
  const product = products.find(p => Number(p.id) === normalizedId);

  // Animasi transisi
  detailSection.style.display = "block";
  detailSection.classList.remove("fade-out-left");
  detailSection.classList.add("fade-in-right");

  // Sembunyikan produk grid
  const productsGrid = document.getElementById("productsGrid");
  if (productsGrid) productsGrid.style.display = "none";

  if (detailNotFound) detailNotFound.style.display = product ? "none" : "block";

  if (!product) {
    // reset field
    const detailImageEl = document.getElementById("detailProductImage");
    if (detailImageEl) {
      detailImageEl.src = "";
      detailImageEl.style.display = "none";
    }
    document.getElementById("detailProductEmoji") && (document.getElementById("detailProductEmoji").textContent = "");
    document.getElementById("detailProductCategory") && (document.getElementById("detailProductCategory").textContent = "-");
    document.getElementById("detailProductName") && (document.getElementById("detailProductName").textContent = "-");
    document.getElementById("detailProductPrice") && (document.getElementById("detailProductPrice").textContent = "-");
    document.getElementById("detailProductStock") && (document.getElementById("detailProductStock").textContent = "-");
    document.getElementById("detailProductDesc") && (document.getElementById("detailProductDesc").textContent = "Produk tidak ditemukan." );
    // tombol disable
    const btn = document.getElementById("detailAddToCartBtn");
    if (btn) btn.disabled = true;
    return;
  }

  // tombol enable
  const btn = document.getElementById("detailAddToCartBtn");
  if (btn) {
    btn.disabled = false;
    // update onclick agar id valid
    btn.setAttribute("onclick", `addToCart(${product.id})`);
  }



  const priceEl = document.getElementById("detailProductPrice");
  if (priceEl) priceEl.textContent = formatPrice(product.price || 0);

  const stockCount = Number(product.stock || 0);
  const stockEl = document.getElementById("detailProductStock");
  if (stockEl) {
    stockEl.textContent = stockCount > 0 ? `${stockCount} tersisa` : "Stok habis";
    stockEl.style.color = stockCount > 0 ? "var(--green-deep)" : "#e05050";
  }

  const descEl = document.getElementById("detailProductDesc");
  if (descEl) {
    descEl.textContent = product.desc || "-";
  }

  const detailImageEl = document.getElementById("detailProductImage");
  if (detailImageEl) {
    detailImageEl.src = getProductImage(product);
    detailImageEl.style.display = "block";
  }

  renderProductDetail();
  updateDetailAddToCartButton();
}


function renderProductDetail() {
  // Data detail sudah di-render di showProductDetail.
  // Fungsi ini dibiarkan agar sesuai requirement.
  detailReady = true;
}


function updateDetailAddToCartButton() {
  const btn = document.getElementById("detailAddToCartBtn");
  const detailNotFound = document.getElementById("detailNotFound");
  if (!btn) return;

  const product = products.find(p => Number(p.id) === Number(lastSelectedProductId));
  if (!product) {
    btn.disabled = true;
    btn.setAttribute("onclick", "return false;");
    if (detailNotFound) detailNotFound.style.display = "block";
    return;
  }

  btn.disabled = !(Number(product.stock || 0) > 0);
  btn.setAttribute("onclick", `addToCart(${product.id})`);
}


function backToProducts() {
  const detailSection = document.getElementById("detailView");
  const productsGrid = document.getElementById("productsGrid");
  const detailNotFound = document.getElementById("detailNotFound");
  if (!detailSection) return;

  detailSection.classList.remove("fade-in-right");
  detailSection.classList.add("fade-out-left");

  setTimeout(() => {
    detailSection.style.display = "none";
    if (productsGrid) productsGrid.style.display = "grid";
    if (detailNotFound) detailNotFound.style.display = "none";
    window.scrollTo({ top: document.getElementById("products")?.offsetTop || 0, behavior: "smooth" });
  }, 260);
}

function renderProducts(filter = "semua") { 

  const grid = document.getElementById("productsGrid");
  if (!grid) return;
  grid.innerHTML = "";
  const filtered = getFilteredProducts(filter);
  filtered.forEach((product, index) => {
    const stockCount = Number(product.stock || 0);
    const inStock = stockCount > 0;
    const stockLabel = inStock ? `${stockCount} tersisa` : `Stok habis`;
    const card = document.createElement("div");
    card.className = "product-card";
    card.style.animationDelay = `${index * 0.07}s`;
    const imageSrc = getProductImage(product);
    // Always render an <img> tag for product visuals. Use inline SVG fallback when image missing or fails to load.
    const svgFallback = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="100%" height="100%" fill="%23f6f6f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23cccccc" font-size="18">Gambar tidak tersedia</text></svg>';
    const finalSrc = imageSrc && imageSrc.length ? imageSrc : svgFallback;
    card.innerHTML = `
      <div class="product-img-wrapper">
        <img src="${finalSrc}" alt="${product.name}" onerror="this.onerror=null;this.src='${svgFallback}';" />
        <span class="product-badge">${capitalizeFirst(product.category)}</span>
        ${product.hot ? '<span class="product-badge badge-hot">🔥 Terlaris</span>' : ""}
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-desc">${product.desc}</p>
        <div class="product-stock">${stockLabel}</div>
        <div class="product-footer">
          <div class="product-price" style="display:flex;flex-direction:column;gap:0.25rem;">
            <span>${formatPrice(product.price)}</span>
            <button class="see-detail-btn" type="button" onclick="showProductDetail(${product.id})" ${inStock ? '' : ''}>
              <i class="fa-solid fa-eye"></i> Lihat Detail
            </button>
          </div>
          <button class="add-cart-btn" onclick="addToCart(${product.id})" ${inStock ? "" : "disabled"}>+ Keranjang</button>
        </div>
      </div>`;
    grid.appendChild(card);
  });
  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-light);"><div style="font-size:3rem;margin-bottom:1rem">🌿</div><p>Belum ada produk dalam kategori ini.</p></div>`;
  }
  // Inject rating & ulasan ke setiap kartu produk
  setTimeout(injectRatingToCards, 50);
}

function ensureStatusHistory(order) {
  if (!order) return order;

  if (!Array.isArray(order.statusHistory)) {
    order.statusHistory = [];
  }

  // Normalize createdAt field for consistency
  const createdAt = order.createdAt || order.created_at || order.updated_at || null;

  // If history is empty, seed with current status (or menunggu konfirmasi)
  if (!order.statusHistory.length) {
    const initStatus = order.status || order.order_status || "Menunggu Konfirmasi";
    if (createdAt) {
      order.statusHistory.push({
        status: initStatus,
        changedAt: createdAt
      });
    }
  }

  return order;
}

function recordOrder(orderData) {
  orders.push(orderData);
  saveState();

  // Unify storage source so Admin & Tracking read the same dataset
  orderData = ensureStatusHistory(orderData);

  const allOrders = getAllOrders();
  allOrders.unshift(orderData);
  saveAllOrders(allOrders);

  saveLastOrder(orderData);
}


function capitalizeFirst(str) { return str.charAt(0).toUpperCase() + str.slice(1); }

function filterProducts(category, btn) {
  currentFilter = category;
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  if (btn) {
    btn.classList.add("active");
  } else {
    const matchedBtn = document.querySelector(`.filter-btn[data-category="${category}"]`);
    if (matchedBtn) matchedBtn.classList.add("active");
  }
  renderProducts(category);
}

  function openCategory(category) {
  filterProducts(category);
  // jika user sebelumnya di detailView, sembunyikan detail
  hideDetailView();

  const productsSection = document.getElementById("products");
  if (productsSection) {
    const navbarHeight = document.querySelector(".navbar")?.offsetHeight || 0;
    const topPosition = productsSection.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 16;
    window.scrollTo({ top: topPosition, behavior: "smooth" });
  }
}

function handleProductSearch(event) {
  searchQuery = event.target.value;
  renderProducts(currentFilter);
}

function submitProductSearch() {
  const input = document.getElementById("productSearch");
  if (input) {
    searchQuery = input.value;
    renderProducts(currentFilter);
    input.focus();
  }
}

function createPetalBurst(x, y) {
  const colors = ["#F4A7B9", "#E8758F", "#B5D5C5", "#FFFFFF"];
  const petals = 16;

  for (let i = 0; i < petals; i += 1) {
    const petal = document.createElement("span");
    petal.className = "petal-burst";
    petal.style.left = `${x}px`;
    petal.style.top = `${y}px`;
    petal.style.background = colors[i % colors.length];
    petal.style.setProperty("--tx", `${(Math.random() - 0.5) * 120}px`);
    petal.style.setProperty("--ty", `${(Math.random() - 0.5) * 140 - 70}px`);
    petal.style.setProperty("--rot", `${Math.random() * 360}deg`);
    document.body.appendChild(petal);
    setTimeout(() => petal.remove(), 1200);
  }
}

function addToCart(productId) {
  const normalizedId = Number(productId);
  const product = products.find(p => Number(p.id) === normalizedId);
  if (!product) return;

  const existingItem = cart.find(item => Number(item.id) === normalizedId);
  const currentQty = existingItem ? existingItem.qty : 0;
  if (currentQty + 1 > product.stock) {
    showToast("⚠️ Stok produk tidak mencukupi.");
    return;
  }

  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, emoji: product.emoji, foto: product.foto || product.image || null, qty: 1 });
  }

  const button = document.querySelector(`button[onclick="addToCart(${product.id})"]`);
  if (button) {
    const rect = button.getBoundingClientRect();
    createPetalBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }

  updateCartUI();
  showToast(`🍦 "${product.name}" ditambahkan ke keranjang!`);
}

function changeQty(productId, delta) {
  const normalizedId = Number(productId);
  const item = cart.find(i => Number(i.id) === normalizedId);
  if (!item) return;

  const product = products.find(p => p.id === normalizedId);
  if (delta > 0 && product && item.qty + delta > Number(product.stock || 0)) {
    showToast("⚠️ Tidak bisa menambah. Stok produk terbatas.");
    return;
  }

  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => Number(i.id) !== normalizedId);
  updateCartUI();
}

function removeFromCart(productId) {
  const normalizedId = Number(productId);
  cart = cart.filter(i => Number(i.id) !== normalizedId);
  updateCartUI();
  showToast("❌ Item dihapus dari keranjang.");
}

function clearCart() {
  if (cart.length === 0) return;
  showConfirmModal("Kosongkan Keranjang?", "Semua item akan dihapus dari keranjang.", () => {
    cart = [];
    updateCartUI();
    showToast("🗑️ Keranjang dikosongkan.");
  });
}

function getCartSummary() {
  const subtotal = cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0);
  const totalItems = cart.reduce((sum, item) => sum + Number(item.qty || 0), 0);
  let discount = 0;

  if (appliedVoucher && subtotal > 0 && totalItems >= 2) {
    const voucher = vouchers[appliedVoucher.code];
    if (voucher) {
      discount = Math.min(subtotal * (voucher.value / 100), voucher.maxDiscount || subtotal);
    }
  }

  return {
    subtotal,
    discount,
    total: Math.max(0, subtotal - discount),
    totalItems
  };
}

function renderVoucherStatus() {
  const statusEl = document.getElementById("voucherStatus");
  if (!statusEl) return;

  if (!appliedVoucher) {
    statusEl.textContent = "Masukkan kode voucher RAINCUTE untuk dapat diskon.";
    statusEl.className = "voucher-status";
    return;
  }

  const summary = getCartSummary();
  if (summary.totalItems < 2) {
    statusEl.innerHTML = `<span class="voucher-status-text">Voucher ${appliedVoucher.code} hanya berlaku untuk minimal 2 produk.</span>`;
    statusEl.className = "voucher-status";
    return;
  }

  statusEl.innerHTML = `<span class="voucher-status-text success">Voucher ${appliedVoucher.code} aktif • diskon ${formatPrice(summary.discount)}</span>`;
  statusEl.className = "voucher-status voucher-status--success";
}

function applyVoucher() {
  const input = document.getElementById("voucherInput");
  const code = input?.value.trim().toUpperCase();

  if (!code) {
    showToast("⚠️ Masukkan kode voucher terlebih dahulu.");
    return;
  }

  if (!vouchers[code]) {
    appliedVoucher = null;
    renderVoucherStatus();
    showToast("❌ Kode voucher tidak valid. Gunakan RAINCUTE.");
    return;
  }

  if (cart.reduce((sum, item) => sum + Number(item.qty || 0), 0) < 2) {
    appliedVoucher = null;
    renderVoucherStatus();
    showToast("⚠️ Voucher hanya bisa dipakai saat keranjang minimal 2 produk.");
    return;
  }

  appliedVoucher = { code };
  renderVoucherStatus();
  updateCartUI();
  showToast(`🎟️ Voucher ${code} berhasil diterapkan.`);
}

function updateCartUI() {
  cart = cart.filter(item => item && Number(item.qty) > 0);
  // Persist cart to new storage key to avoid legacy cache collisions
  try { localStorage.setItem('rainsScoopCart', JSON.stringify(cart)); } catch (e) {}

  const totalItems = cart.reduce((sum, item) => sum + Number(item.qty || 0), 0);
  const summary = getCartSummary();
  const countEl = document.getElementById("cartCount");
  if (countEl) {
    countEl.textContent = totalItems > 0 ? totalItems : "0";
    countEl.style.display = totalItems > 0 ? "flex" : "none";
  }

  const cartItemsEl  = document.getElementById("cartItems");
  const cartEmptyEl  = document.getElementById("cartEmpty");
  const cartFooterEl = document.getElementById("cartFooter");
  const subtotalEl   = document.getElementById("subtotalPrice");
  const discountEl    = document.getElementById("discountPrice");
  const totalEl      = document.getElementById("totalPrice");

  if (cart.length === 0) {
    if (cartItemsEl) cartItemsEl.innerHTML = "";
    if (cartEmptyEl) cartEmptyEl.style.display = "flex";
    if (cartItemsEl && cartEmptyEl) cartItemsEl.appendChild(cartEmptyEl);
    if (cartFooterEl) cartFooterEl.style.display = "none";
    if (subtotalEl) subtotalEl.textContent = formatPrice(0);
    if (discountEl) discountEl.textContent = "-" + formatPrice(0);
    if (totalEl) totalEl.textContent = formatPrice(0);
    renderVoucherStatus();
    return;
  }

  if (cartEmptyEl) cartEmptyEl.style.display = "none";
  if (cartFooterEl) cartFooterEl.style.display = "block";
  if (cartItemsEl) cartItemsEl.innerHTML = "";
  cart.forEach(item => {
    const itemImage = normalizeImagePath(item.foto || item.image || "");
    const imageHTML = itemImage
      ? `<img src="${itemImage}" alt="${item.name}" style="width:48px;height:48px;object-fit:cover;border-radius:8px;" />`
      : item.emoji;

    const el = document.createElement("div");
    el.className = "cart-item";
    el.innerHTML = `
      <div class="cart-item-emoji">${imageHTML}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${formatPrice(item.price * item.qty)}</div>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" data-action="minus" data-id="${item.id}">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" data-action="plus" data-id="${item.id}">+</button>
        <button class="cart-remove" data-action="remove" data-id="${item.id}">✕</button>
      </div>`;
    if (cartItemsEl) cartItemsEl.appendChild(el);
  });
  if (cartItemsEl) {
    cartItemsEl.querySelectorAll("button[data-action]").forEach(btn => {
    btn.addEventListener("click", function () {
      const id = parseInt(this.dataset.id);
      const action = this.dataset.action;
      if (action === "minus")  changeQty(id, -1);
      if (action === "plus")   changeQty(id, +1);
      if (action === "remove") removeFromCart(id);
    });
    });
  }
  if (subtotalEl) subtotalEl.textContent = formatPrice(summary.subtotal);
  if (discountEl) discountEl.textContent = `-${formatPrice(summary.discount)}`;
  if (totalEl) totalEl.textContent = formatPrice(summary.total);
  renderVoucherStatus();
}

function toggleCart() {
  const sidebar = document.getElementById("cartSidebar");
  const overlay = document.getElementById("cartOverlay");
  sidebar.classList.toggle("open");
  overlay.classList.toggle("open");
  document.body.style.overflow = sidebar.classList.contains("open") ? "hidden" : "";
}

function checkout() {
  if (cart.length === 0) { showToast("❗ Keranjangmu masih kosong!"); return; }

  const summary = getCartSummary();
  const itemsHTML = cart.map(item => `
    <div class="receipt-item">
      <span class="receipt-emoji">${(function(){
        const img = normalizeImagePath(item.foto || item.image || "");
        return img ? `<img src="${img}" alt="${item.name}" style="width:48px;height:48px;object-fit:cover;border-radius:6px;" />` : (item.emoji || '🍦');
      })()}</span>
      <div class="receipt-item-info">
        <span class="receipt-name">${item.name}</span>
        <span class="receipt-qty">x${item.qty}</span>
      </div>
      <span class="receipt-price">${formatPrice(item.price * item.qty)}</span>
    </div>`).join("");
  const itemsText = cart.map(item => `- ${item.name} x${item.qty} (${formatPrice(item.price * item.qty)})`).join("\n");
  const now = new Date();
  const tgl = now.toLocaleDateString("id-ID", { weekday:"long", year:"numeric", month:"long", day:"numeric" });
  const jam = now.toLocaleTimeString("id-ID", { hour:"2-digit", minute:"2-digit" });
  const orderNum = "LF" + Date.now().toString().slice(-6);

  showPaymentModal({ orderNum, tgl, jam, subtotalPrice: summary.subtotal, discountPrice: summary.discount, totalPrice: summary.total, itemsHTML, itemsText });
}

function showPaymentModal(orderData) {
  let overlay = document.getElementById("paymentOverlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "paymentOverlay";
    overlay.className = "receipt-overlay";
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div class="receipt-box payment-modal">
      <div class="receipt-header">
        <div class="receipt-flower">🏦</div>
        <h2>Pembayaran</h2>
        <p>Pilih metode pembayarannya dan lengkapi alamat pengiriman.</p>
      </div>
      <div class="payment-card">
        <p class="payment-label">Metode Pembayaran</p>
        <select id="customerPayment" class="payment-input">
          <option value="DANA">DANA</option>
          <option value="OVO">OVO</option>
          <option value="GOPAY">GOPAY</option>
          <option value="Transfer BNI">Transfer BNI</option>
          <option value="Transfer BCA">Transfer BCA</option>
          <option value="Transfer Mandiri">Transfer Mandiri</option>
          <option value="SeaBank">SeaBank</option>
          <option value="QRIS">QRIS</option>
          <option value="COD">COD</option>
        </select>
        <p class="payment-note">Pilih metode pembayaran yang paling nyaman untukmu. Untuk pembayaran non-COD, harap lampirkan bukti pembayaran.</p>
        <div id="paymentInfo" style="display:none;margin-top:1rem;padding:1rem;background:#FDF0F3;border-radius:8px;border-left:4px solid #F8BBD0;">
          <div id="paymentDetails"></div>
          <div id="paymentCopyActions" style="display:none;margin-top:0.75rem;gap:0.5rem;">
            <button type="button" class="btn btn-outline" id="paymentCopyBtn" style="width:100%;">Salin</button>
          </div>
        </div>
      </div>
      <div class="payment-card">
        <p class="payment-label">Pengiriman</p>
        <select id="customerShipping" class="payment-input">
          <option value="0">Reguler (GRATIS)</option>
          <option value="10000">Express (Rp 10.000)</option>
          <option value="20000">Same Day (Rp 20.000)</option>
        </select>
        <p class="payment-note">Pilih layanan pengiriman sesuai kebutuhanmu.</p>
      </div>
      <div class="payment-card">
        <p class="payment-label">Biodata</p>
        <div class="payment-field">
          <label for="customerName">Nama Lengkap</label>
          <input type="text" id="customerName" class="payment-input" placeholder="Masukkan nama lengkap Anda" />
        </div>
        <div class="payment-field">
          <label for="customerPhone">Nomor Telepon</label>
          <input type="tel" id="customerPhone" class="payment-input" placeholder="Masukkan nomor telepon Anda" />
        </div>
        <div class="payment-field">
          <label for="customerAddress">Alamat Lengkap</label>
          <textarea id="customerAddress" class="payment-input payment-textarea" rows="3" placeholder="Masukkan alamat lengkap untuk pengiriman"></textarea>
        </div>
      </div>
      <div class="receipt-divider">— Ringkasan Pesanan —</div>
      <div class="receipt-items">${orderData.itemsHTML}</div>
      <div class="receipt-summary">
        <div class="receipt-row"><span>Subtotal</span><span>${formatPrice(orderData.subtotalPrice)}</span></div>
        <div class="receipt-row"><span>Diskon</span><span class="discount-green">-${formatPrice(orderData.discountPrice)}</span></div>
        <div class="receipt-row"><span>Ongkir</span><span id="receiptShippingCost" class="free-green">✓ GRATIS</span></div>
        <div class="receipt-row receipt-total"><strong>Total Bayar</strong><strong id="receiptGrandTotal">${formatPrice(orderData.totalPrice)}</strong></div>
      </div>
      <div class="payment-actions">
        <button class="btn btn-outline btn-full" onclick="closePaymentModal()">Batal</button>
        <button class="btn btn-primary btn-full" id="confirmPaymentBtn">Bayar & Kirim ke WhatsApp</button>
      </div>
    </div>`;

  overlay.style.display = "flex";
  setTimeout(() => overlay.classList.add("open"), 10);
  document.body.style.overflow = "hidden";

  // Event listener untuk menampilkan info pembayaran
  const paymentSelect = document.getElementById("customerPayment");
  const paymentInfoDiv = document.getElementById("paymentInfo");
  const paymentDetailsDiv = document.getElementById("paymentDetails");

  if (paymentSelect) {
    paymentSelect.addEventListener("change", function() {
      const selectedPayment = this.value;
      const info = PAYMENT_INFO[selectedPayment];
      
      if (info) {
        if (selectedPayment === "QRIS") {
          paymentDetailsDiv.innerHTML = `
            <p style="font-weight:600;margin-bottom:0.5rem;">📱 Scan QR Code untuk pembayaran:</p>
            <img src="${info.qr_image}" alt="QRIS" style="max-width:200px;margin:0.5rem 0;border-radius:6px;border:1px solid #C8E6C9;"/>
          `;
          const copyActions = document.getElementById("paymentCopyActions");
          if (copyActions) copyActions.style.display = "none";
        } else if (info.bank) {
          // Bank transfer
          paymentDetailsDiv.innerHTML = `
            <p style="font-weight:600;margin-bottom:0.5rem;">🏦 Transfer Bank</p>
            <div style="font-size:0.9rem;line-height:1.6;">
              <div>Nama Penerima: <strong>${info.account_name}</strong></div>
              <div>Nomor Virtual Account:</div>
              <div style="margin-top:0.25rem;">- ${info.bank} VA: <strong>${info.va}</strong></div>
            </div>
          `;
          const copyActions = document.getElementById("paymentCopyActions");
          if (copyActions) copyActions.style.display = "block";

          const copyBtn = document.getElementById("paymentCopyBtn");
          if (copyBtn) {
            copyBtn.onclick = () => {
              const text = info.va;
              if (navigator.clipboard?.writeText) {
                navigator.clipboard.writeText(text).then(() => showToast("✅ Nomor VA tersalin."));
              } else {
                showToast("⚠️ Browser tidak mendukung copy otomatis.");
              }
            };
          }
        } else if (info.platform && info.platform !== "COD") {
          // E-wallet (DANA, OVO, GOPAY)
          paymentDetailsDiv.innerHTML = `
            <p style="font-weight:600;margin-bottom:0.5rem;">📱 Pembayaran E-Wallet</p>
            <div style="font-size:0.9rem;line-height:1.6;">
              <div>Nama Akun: <strong>${info.account_name}</strong></div>
              <div>Nomor Tujuan:</div>
              <div style="margin-top:0.25rem;">${info.va}</div>
            </div>
          `;
          const copyActions = document.getElementById("paymentCopyActions");
          if (copyActions) copyActions.style.display = "block";

          const copyBtn = document.getElementById("paymentCopyBtn");
          if (copyBtn) {
            copyBtn.onclick = () => {
              const text = info.va;
              if (navigator.clipboard?.writeText) {
                navigator.clipboard.writeText(text).then(() => showToast("✅ Nomor tersalin."));
              } else {
                showToast("⚠️ Browser tidak mendukung copy otomatis.");
              }
            };
          }
        } else if (selectedPayment === "COD") {
          // COD
          paymentDetailsDiv.innerHTML = `
            <p style="font-weight:600;margin-bottom:0.5rem;">💰 Pembayaran di Tempat:</p>
            <div style="font-size:0.9rem;line-height:1.6;">
              <div>📦 Metode: <strong>Bayar saat barang diterima</strong></div>
              <div>👤 Atas Nama: <strong>${info.account_name}</strong></div>
              <div style="margin-top:0.5rem;color:#666;">ℹ️ Pastikan Anda siap dengan uang tunai saat barang tiba.</div>
            </div>
          `;
          const copyActions = document.getElementById("paymentCopyActions");
          if (copyActions) copyActions.style.display = "none";
        }
        paymentInfoDiv.style.display = "block";
      } else {
        paymentInfoDiv.style.display = "none";
      }
    });
    // Auto-trigger change event untuk menampilkan payment info saat modal dibuka
    setTimeout(() => {
      paymentSelect.dispatchEvent(new Event('change'));
    }, 100);
  }

      const confirmBtn = document.getElementById("confirmPaymentBtn");
      if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      // validasi metode pembayaran wajib dipilih
      const customerName = document.getElementById("customerName")?.value.trim();
      const customerPhone = document.getElementById("customerPhone")?.value.trim();
      const customerAddress = document.getElementById("customerAddress")?.value.trim();
      const paymentMethod = document.getElementById("customerPayment")?.value || "SeaBank";

      if (!paymentMethod) {
        showToast("❗ Metode pembayaran wajib dipilih.");
        return;
      }

      const shippingCost = Number(document.getElementById("customerShipping")?.value || 0);
      const shippingLabel = document.getElementById("customerShipping")?.selectedOptions[0]?.text || "Reguler (GRATIS)";
      const totalWithShipping = orderData.totalPrice + shippingCost;
      const session = getSession();

      if (!customerName || !customerPhone || !customerAddress) {
        showToast("❗ Lengkapi nama, nomor telepon, dan alamat lengkap sebelum lanjut ke WhatsApp.");
        return;
      }

      const voucherText = appliedVoucher ? `Voucher: ${appliedVoucher.code} (diskon ${formatPrice(orderData.discountPrice)})` : "Voucher: tidak ada";
      const waMessage = encodeURIComponent(`🍦 Halo, Selamat datang di Rain'sScoop 🌸\n\nTerima kasih sudah melakukan pemesanan 💗 Berikut detail pesanan Anda:\n\n🧾 Detail Pesanan\n* Produk:\n- ${orderData.itemsText.replace(/\n/g, '\n- ')}\nSubtotal: _${formatPrice(orderData.subtotalPrice)}_\nDiskon: _-${formatPrice(orderData.discountPrice)}_\n${voucherText}\nOngkir: _${shippingCost === 0 ? 'GRATIS' : formatPrice(shippingCost)}_\nTotal Pembayaran: _${formatPrice(totalWithShipping)}_\n\n📌 Informasi Pesanan\n* No. Pesanan: #${orderData.orderNum}\n* Tanggal: ${orderData.tgl} | ${orderData.jam} WIB\n\n💳 Metode Pembayaran\n${paymentMethod}\n\n🚚 Pengiriman\n${shippingLabel}\n\n👤 Data Pemesan\n* Nama: ${customerName}\n* No. Telepon: ${customerPhone}\n* Alamat: ${customerAddress}\n\n📍 Konfirmasi Pesanan\nMohon kirim bukti pembayaran agar pesanan dapat segera diproses. Pesanan akan diproses setelah pembayaran terverifikasi 💗\n\n🚚 GRATIS ONGKIR untuk area Bandung 🌷`);

      cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product) {
          product.stock = Math.max(0, Number(product.stock || 0) - Number(item.qty));
        }
      });

      const order = {
        orderNum: orderData.orderNum,
        userId: session?.id || null,
        createdAt: new Date().toISOString(),
        nama: customerName,
        phone: customerPhone,
        alamat: customerAddress,
        payment: paymentMethod,
        shipping: shippingCost,
        shippingLabel,
        items: cart.map(item => ({ id: item.id, name: item.name, price: item.price, qty: item.qty, emoji: item.emoji || '🍨' })),
        subtotal: orderData.subtotalPrice,
        discount: orderData.discountPrice,
        total: totalWithShipping,
        status: "Diproses",
        voucher: appliedVoucher ? appliedVoucher.code : null
      };
      recordOrder(order);
      window.open(`https://wa.me/6289528117555?text=${waMessage}`, "_blank");
      closePaymentModal();
      cart = [];
      appliedVoucher = null;
      updateCartUI();
      toggleCart();
      renderProducts(currentFilter);
      showReceiptModal(`
        <div class="receipt-modal">
          <div class="receipt-header">
            <div class="receipt-Gelato">🍦</div>
            <h2>Pesanan Diterima!</h2>
            <p>Terima kasih sudah memesan di Rain'sSoop 🍨</p>
          </div>
          <div class="receipt-order-num">
            <span>No. Pesanan</span>
            <strong>#${orderData.orderNum}</strong>
          </div>
          <div class="receipt-date"><span>📅 ${orderData.tgl} · ${orderData.jam} WIB</span></div>
          <div class="receipt-divider">— Rincian Pesanan —</div>
          <div class="receipt-items">${orderData.itemsHTML}</div>
          <div class="receipt-divider"></div>
          <div class="receipt-summary">
            <div class="receipt-row"><span>Subtotal</span><span>${formatPrice(orderData.subtotalPrice)}</span></div>
            <div class="receipt-row"><span>Diskon</span><span class="discount-green">-${formatPrice(orderData.discountPrice)}</span></div>
            <div class="receipt-row"><span>Ongkir</span><span class="free-green">✓ GRATIS</span></div>
            <div class="receipt-row receipt-total"><strong>Total Bayar</strong><strong>${formatPrice(orderData.totalPrice)}</strong></div>
          </div>
          <div class="receipt-note">🏦 Pembayaran via SeaBank: 901809290073<br/>📱 Pesananmu sudah kami kirimkan ke WhatsApp untuk diproses. Harap kirimkan bukti pembayaran dan alamat lengkap jika belum melengkapinya.</div>
          <button class="btn btn-primary btn-full receipt-ok-btn" onclick="closeReceiptModal()">✓ Oke, Terima Kasih!</button>
        </div>`, () => {
        showToast("✅ Pesanan berhasil dikirim ke WhatsApp untuk diproses 🍨");
      });
    });
  }
}

function closePaymentModal() {
  const overlay = document.getElementById("paymentOverlay");
  if (overlay) {
    overlay.classList.remove("open");
    setTimeout(() => {
      overlay.style.display = "none";
      overlay.innerHTML = "";
    }, 350);
  }
  document.body.style.overflow = "";
}

let receiptCallback = null;
function showReceiptModal(htmlContent, callback) {
  receiptCallback = callback;
  let overlay = document.getElementById("receiptOverlay");
  if (!overlay) { overlay = document.createElement("div"); overlay.id = "receiptOverlay"; overlay.className = "receipt-overlay"; document.body.appendChild(overlay); }
  overlay.innerHTML = `<div class="receipt-box">${htmlContent}</div>`;
  overlay.style.display = "flex";
  setTimeout(() => overlay.classList.add("open"), 10);
  document.body.style.overflow = "hidden";
}
function closeReceiptModal() {
  const overlay = document.getElementById("receiptOverlay");
  if (overlay) { overlay.classList.remove("open"); setTimeout(() => { overlay.style.display = "none"; }, 350); }
  document.body.style.overflow = "";
  if (receiptCallback) { receiptCallback(); receiptCallback = null; }
}

function showConfirmModal(title, desc, onConfirm) {
  let overlay = document.getElementById("confirmOverlay");
  if (!overlay) { overlay = document.createElement("div"); overlay.id = "confirmOverlay"; overlay.className = "receipt-overlay"; document.body.appendChild(overlay); }
  overlay.innerHTML = `
    <div class="receipt-box confirm-box">
      <div style="font-size:2.5rem;margin-bottom:0.75rem">🗑️</div>
      <h3 style="font-family:'Playfair Display',serif;margin-bottom:0.5rem">${title}</h3>
      <p style="color:var(--text-mid);font-size:0.9rem;margin-bottom:1.5rem">${desc}</p>
      <div style="display:flex;gap:0.75rem">
        <button class="btn btn-outline btn-full" onclick="closeConfirmModal()">Batal</button>
        <button class="btn btn-primary btn-full" id="confirmYesBtn">Ya, Hapus</button>
      </div>
    </div>`;
  overlay.style.display = "flex";
  setTimeout(() => overlay.classList.add("open"), 10);
  document.body.style.overflow = "hidden";
  document.getElementById("confirmYesBtn").addEventListener("click", () => { closeConfirmModal(); onConfirm(); });
}
function closeConfirmModal() {
  const overlay = document.getElementById("confirmOverlay");
  if (overlay) { overlay.classList.remove("open"); setTimeout(() => { overlay.style.display = "none"; }, 350); }
  document.body.style.overflow = "";
}

function closeMenu() {
  const nav = document.getElementById("navLinks");
  const hamburger = document.getElementById("hamburger");
  nav.classList.remove("open");
  document.body.classList.remove("menu-open");
  if (hamburger) hamburger.setAttribute("aria-expanded", "false");
}

function toggleMenu() {
  const nav = document.getElementById("navLinks");
  const hamburger = document.getElementById("hamburger");
  const isOpen = nav.classList.toggle("open");
  document.body.classList.toggle("menu-open", isOpen);
  if (hamburger) hamburger.setAttribute("aria-expanded", isOpen ? "true" : "false");
}

document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", () => closeMenu());
});

document.addEventListener("click", (event) => {
  const nav = document.getElementById("navLinks");
  const hamburger = document.getElementById("hamburger");
  if (window.innerWidth <= 767 && nav && hamburger && !nav.contains(event.target) && !hamburger.contains(event.target)) {
    closeMenu();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 767) closeMenu();
});

window.addEventListener("scroll", () => {
  document.getElementById("navbar").classList.toggle("scrolled", window.scrollY > 50);
});

window.addEventListener("scroll", () => {
  const sections = ["home", "products", "contact"];
  let current = "home";
  sections.forEach(id => { const s = document.getElementById(id); if (s && window.scrollY >= s.offsetTop - 120) current = id; });
  document.querySelectorAll(".nav-link").forEach(link => { link.classList.toggle("active", link.getAttribute("href") === "#" + current); });
});

function openInfoCardByHash(hash) {
  const normalizedHash = hash.replace("#", "");
  const cards = document.querySelectorAll(".info-card");
  if (!cards.length) return;

  cards.forEach(card => {
    const button = card.querySelector(".info-toggle");
    const panel = card.querySelector(".info-panel");
    const isTarget = card.id === normalizedHash;

    card.classList.toggle("active", isTarget);
    if (button) button.setAttribute("aria-expanded", isTarget ? "true" : "false");
    if (panel) panel.setAttribute("aria-hidden", isTarget ? "false" : "true");
  });

  if (normalizedHash) {
    const targetCard = document.getElementById(normalizedHash);
    if (targetCard) {
      setTimeout(() => {
        const navbarHeight = document.querySelector(".navbar")?.offsetHeight || 0;
        const topPosition = targetCard.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 16;
        window.scrollTo({ top: topPosition, behavior: "smooth" });
      }, 50);
    }
  }
}

function initInfoAccordion() {
  const cards = document.querySelectorAll(".info-card");
  if (!cards.length) return;

  cards.forEach(card => {
    const button = card.querySelector(".info-toggle");
    const panel = card.querySelector(".info-panel");
    if (!button || !panel) return;

    button.addEventListener("click", () => {
      const shouldOpen = !card.classList.contains("active");
      cards.forEach(item => {
        const itemButton = item.querySelector(".info-toggle");
        const itemPanel = item.querySelector(".info-panel");
        item.classList.remove("active");
        if (itemButton) itemButton.setAttribute("aria-expanded", "false");
        if (itemPanel) itemPanel.setAttribute("aria-hidden", "true");
      });

      if (shouldOpen) {
        card.classList.add("active");
        button.setAttribute("aria-expanded", "true");
        panel.setAttribute("aria-hidden", "false");
      }
    });
  });

  openInfoCardByHash(window.location.hash);
}

window.addEventListener("hashchange", () => {
  openInfoCardByHash(window.location.hash);
});

let toastTimeout;
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 2500);
}

function createConfettiBurst(x, y) {
  const colors = ["#F4A7B9", "#E8758F", "#B5D5C5", "#FFFFFF"];
  const pieces = 26;

  for (let i = 0; i < pieces; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${x}px`;
    piece.style.top = `${y}px`;
    piece.style.background = colors[i % colors.length];
    piece.style.setProperty("--tx", `${(Math.random() - 0.5) * 140}px`);
    piece.style.setProperty("--ty", `${(Math.random() - 0.5) * 160 + 90}px`);
    piece.style.setProperty("--rot", `${Math.random() * 360}deg`);
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 1250);
  }
}

function copyVoucherCode() {
  const codeEl = document.getElementById("voucherCodeText");
  const code = codeEl?.textContent?.trim();
  const button = document.querySelector(".voucher-copy-btn");
  const side = document.querySelector(".voucher-side");
  if (!code) return;

  const triggerX = side ? side.getBoundingClientRect().left + side.getBoundingClientRect().width / 2 : window.innerWidth / 2;
  const triggerY = side ? side.getBoundingClientRect().top + 36 : 140;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code)
      .then(() => {
        createConfettiBurst(triggerX, triggerY);
        if (button) {
          button.textContent = "✓ Tersalin";
          button.classList.add("copied");
          setTimeout(() => {
            button.textContent = "Salin Kode";
            button.classList.remove("copied");
          }, 1200);
        }
        showToast(`✅ Kode ${code} disalin!`);
      })
      .catch(() => fallbackCopy(code, triggerX, triggerY));
  } else {
    fallbackCopy(code, triggerX, triggerY);
  }
}

function fallbackCopy(text, x, y) {
  const tempInput = document.createElement("input");
  tempInput.value = text;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand("copy");
  document.body.removeChild(tempInput);
  createConfettiBurst(x, y);
  showToast(`✅ Kode ${text} disalin!`);
}

function initRevealOnScroll() {
  const elements = document.querySelectorAll(".reveal-on-scroll");
  if (!("IntersectionObserver" in window) || !elements.length) {
    elements.forEach(el => el.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  elements.forEach(el => observer.observe(el));
}

function goToCheckout() {
  if (cart.length === 0) { showToast("❗ Keranjangmu masih kosong!"); return; }
  if (location.pathname.split("/").pop() === "checkout.html") {
    const wrapper = document.getElementById("checkoutWrapper");
    if (wrapper) wrapper.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  window.location.href = "checkout.html";
}

function initApp() {
  loadState();
  renderProducts("semua");
  initInfoAccordion();
  initRevealOnScroll();
  updateNavAuth();
}

/* ============================================================
   AUTH PAGES: login.html / register.html
   ============================================================ */
function initLoginPage() {
  const form = document.getElementById("lfLoginForm");
  if (!form) return;
  form.addEventListener("submit", function(e) {
    e.preventDefault();
    const email = form.email.value.trim().toLowerCase();
    const password = form.password.value;
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      document.getElementById("lfLoginMsg").textContent = "Email atau password salah.";
      return;
    }
    setSession({ id: user.id, nama: user.nama, email: user.email });
    window.location.href = "index.html";
  });
}

function initRegisterPage() {
  const form = document.getElementById("lfRegisterForm");
  if (!form) return;
  form.addEventListener("submit", function(e) {
    e.preventDefault();
    const nama = form.nama.value.trim();
    const email = form.email.value.trim().toLowerCase();
    const password = form.password.value;
    if (!nama || !email || !password) return;
    const users = getUsers();
    if (users.some(u => u.email === email)) {
      document.getElementById("lfRegisterMsg").textContent = "Email sudah terdaftar.";
      return;
    }
    users.push({ id: "u_" + Date.now(), nama, email, password });
    saveUsers(users);
    document.getElementById("lfRegisterMsg").textContent = "Akun berhasil dibuat! Mengarahkan ke login...";
    setTimeout(() => { window.location.href = "login.html"; }, 1200);
  });
}

/* ============================================================
   PROFILE PAGE
   ============================================================ */
function initProfilePage() {
  const session = getSession();
  if (!session) { window.location.href = "login.html"; return; }

  const namaEl = document.getElementById("pfNama");
  const emailEl = document.getElementById("pfEmail");
  if (namaEl) namaEl.value = session.nama;
  if (emailEl) emailEl.value = session.email;

  const saveBtn = document.getElementById("pfSaveBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const newNama = namaEl?.value.trim();
      if (!newNama) { showToast("⚠️ Nama tidak boleh kosong."); return; }
      session.nama = newNama;
      setSession(session);
      const users = getUsers();
      const idx = users.findIndex(u => u.id === session.id);
      if (idx > -1) { users[idx].nama = newNama; saveUsers(users); }
      showToast("✅ Profil berhasil disimpan.");
    });
  }

  // order history in profile
  const orderList = document.getElementById("pfOrderList");
  if (orderList) {
    const orders = getAllOrders().filter(o => o.userId === session.id);
    if (!orders.length) {
      orderList.innerHTML = "<p style='color:var(--text-light)'>Belum ada pesanan.</p>";
    } else {
      orderList.innerHTML = orders.map(o => `
        <div class="pf-order-card">
          <div><strong>#${o.orderNum}</strong> &nbsp;·&nbsp; ${fmtDate(o.createdAt)}</div>
          <div>Total: <strong>${formatPrice(o.total)}</strong> &nbsp;·&nbsp; <span class="pf-status">${o.status || "Diproses"}</span></div>
          <div style="font-size:0.83rem;color:var(--text-light)">${o.items.map(i=>i.name+" x"+i.qty).join(", ")}</div>
        </div>`).join("");
    }
  }

  // menu switching
  document.querySelectorAll(".pf-menu-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".pf-menu-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".pf-panel").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      const target = document.getElementById(btn.dataset.panel);
      if (target) target.classList.add("active");
    });
  });
}

/* ============================================================
   CHECKOUT PAGE
   ============================================================ */
function initCheckoutPage() {
  loadState();
  // Pastikan cart selalu terbaru saat checkout dibuka
  // Persistence disabled: cart remains in-memory and starts empty on page load

  const session = getSession();
  const cartItemsEl = document.getElementById("coCartItems");
  const subtotalEl = document.getElementById("coSubtotal");
  const discountEl = document.getElementById("coDiscount");
  const ongkirEl = document.getElementById("coOngkir");
  const totalEl = document.getElementById("coTotal");
  const shippingEl = document.getElementById("coShipping");
  const voucherEl = document.getElementById("coVoucher");
  const paymentEl = document.getElementById("coPayment");
  const namaEl = document.getElementById("coNama");
  const phoneEl = document.getElementById("coPhone");
  const alamatEl = document.getElementById("coAlamat");
  const submitBtn = document.getElementById("coSubmitBtn");
  const errorEl = document.getElementById("coError");

  if (!cartItemsEl) return;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = "<p style='color:var(--text-light)'>Keranjang kosong.</p>";
    if (submitBtn) submitBtn.disabled = true;
    return;
  }

  if (session && namaEl) {
    namaEl.value = session.nama || "";
  }

  function computeVoucherDiscount(voucherCode, summary) {
    if (!voucherCode) return 0;
    const voucher = vouchers[voucherCode];
    if (!voucher || summary.totalItems < 2) return 0;
    return Math.min(summary.subtotal * (voucher.value / 100), voucher.maxDiscount || summary.subtotal);
  }

  function recompute() {
    const summary = getCartSummary();
    const shipping = Number(shippingEl?.value || 0);
    const voucherCode = voucherEl?.value.trim().toUpperCase() || "";
    const discount = computeVoucherDiscount(voucherCode, summary);
    const total = Math.max(0, summary.subtotal - discount + shipping);

    if (subtotalEl) subtotalEl.textContent = formatPrice(summary.subtotal);
    if (discountEl) discountEl.textContent = "-" + formatPrice(discount);
    if (ongkirEl) ongkirEl.textContent = shipping === 0 ? "GRATIS" : formatPrice(shipping);
    if (totalEl) totalEl.textContent = formatPrice(total);
  }

  cartItemsEl.innerHTML = cart.map(item => {
    const itemImage = normalizeImagePath(item.foto || item.image || "");
    const imageHTML = itemImage
      ? `<img src="${itemImage}" alt="${item.name}" style="width:42px;height:42px;object-fit:cover;border-radius:8px;" />`
      : item.emoji;

    return `
      <div class="co-item">
        <span class="co-emoji">${imageHTML}</span>
        <div class="co-item-info">
          <div class="co-item-name">${item.name} <span style="color:var(--text-light)">x${item.qty}</span></div>
          <div class="co-item-price">${formatPrice(item.price * item.qty)}</div>
        </div>
      </div>`;
  }).join("");

  recompute();
  if (shippingEl) shippingEl.addEventListener("change", recompute);
  if (voucherEl) voucherEl.addEventListener("input", recompute);

  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      const nama = namaEl?.value.trim();
      const phone = phoneEl?.value.trim();
      const alamat = alamatEl?.value.trim();
      const payment = paymentEl?.value || "";
      const voucherCode = voucherEl?.value.trim().toUpperCase() || "";
      const shipping = Number(shippingEl?.value || 0);
      const shippingLabel = shippingEl?.selectedOptions[0]?.text || "Reguler (GRATIS)";

      if (!nama || !phone || !alamat) {
        if (errorEl) errorEl.textContent = "Lengkapi nama, nomor telepon, dan alamat.";
        return;
      }
      if (errorEl) errorEl.textContent = "";

      const summary = getCartSummary();
      const discount = computeVoucherDiscount(voucherCode, summary);
      const total = Math.max(0, summary.subtotal - discount + shipping);
      const orderNum = "LF" + Date.now().toString().slice(-6);
      const now = new Date();

      const order = {
        orderNum,
        userId: session?.id || null,
        createdAt: now.toISOString(),
        items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, emoji: i.emoji || '🍨', image: i.foto || i.image || null })),
        subtotal: summary.subtotal,
        discount,
        shipping,
        shippingLabel,
        total,
        payment,
        nama,
        phone,
        alamat,
        voucher: voucherCode || null,
        status: "Menunggu Konfirmasi",
        // alias field kebutuhan sinkronisasi
        order_status: "Menunggu Konfirmasi",
        payment_method: payment,
        payment_detail: null,
        updated_at: now.toISOString()
      };

      cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product) product.stock = Math.max(0, Number(product.stock || 0) - Number(item.qty));
      });

      recordOrder(order);
      saveState();
      // Persistence disabled: do not remove cart from localStorage

      const itemsText = cart.map(i => `- ${i.name} x${i.qty} (${formatPrice(i.price * i.qty)})`).join("\n");
      const waMsg = encodeURIComponent(`🍨 Halo Rain'sScoop!\n\n*Pesanan Baru* #${orderNum}\n\n🛍️ Produk:\n${itemsText}\n\n💰 Subtotal: ${formatPrice(summary.subtotal)}\n🎟️ Diskon: -${formatPrice(discount)}\n🚗 Ongkir: ${shipping === 0 ? 'GRATIS' : formatPrice(shipping)}\n*Total: ${formatPrice(total)}*\n\n💳 Pembayaran: ${payment}\n🚚 Pengiriman: ${shippingLabel}\n\n👤 Nama: ${nama}\n📱 Telepon: ${phone}\n📍 Alamat: ${alamat}\n\nMohon konfirmasi pesanan ini ya! 🌷`);
      window.open(`https://api.whatsapp.com/send?phone=628815103299&text=${waMsg}`, "_blank");

      cart = [];
      appliedVoucher = null;
      window.location.href = "order_success.html";
    });
  }
}

/* ============================================================
   ORDER SUCCESS PAGE
   ============================================================ */
function initOrderSuccessPage() {
  const order = getLastOrder();
  const idEl = document.getElementById("osOrderNum");
  const totalEl = document.getElementById("osTotal");
  const statusEl = document.getElementById("osStatus");
  if (idEl) idEl.textContent = order ? "#" + order.orderNum : "-";
  if (totalEl) totalEl.textContent = order ? formatPrice(order.total) : "Rp 0";
  if (statusEl) statusEl.textContent = order ? (order.status || "Diproses") : "-";
}

/* ============================================================
   TRACKING PAGE
   ============================================================ */
function updateOrdersToSelesaiIfNeeded() {
  const session = getSession();
  if (!session) return;

  const allOrd = getAllOrders();
  if (!Array.isArray(allOrd) || !allOrd.length) return;

  const now = Date.now();
  let changed = false;

  allOrd.forEach(o => {
    const userMatch = o.userId === session.id;
    if (!userMatch) return;

    const status = o.status || o.order_status || "Menunggu Konfirmasi";
    if (status !== "Menunggu Konfirmasi") return;

    const createdAtRaw = o.createdAt || o.created_at || null;
    if (!createdAtRaw) return;

    const createdMs = new Date(createdAtRaw).getTime();
    if (Number.isNaN(createdMs)) return;

    // 1 menit setelah dibuat
    if (now < createdMs + 60_000) return;

    // Cegah duplikasi event
    const alreadyHasSelesai = Array.isArray(o.statusHistory)
      ? o.statusHistory.some(h => h && h.status === "Selesai")
      : false;

    o.status = "Selesai";
    o.order_status = "Selesai";
    o.updated_at = new Date().toISOString();

    if (!alreadyHasSelesai) {
      if (!Array.isArray(o.statusHistory)) o.statusHistory = [];
      o.statusHistory.push({ status: "Selesai", changedAt: o.updated_at });
    }

    changed = true;
  });

  if (changed) saveAllOrders(allOrd);
}

function initTrackingPage() {
  const session = getSession();
  const grid    = document.getElementById("trackGrid");
  const emptyEl = document.getElementById("trackEmpty");
  if (!grid) return;
  updateOrdersToSelesaiIfNeeded();


  const STEPS = ["Diproses", "Dikirim", "Selesai"];

  const statusNext  = s => s === "Diproses" ? "Dikirim" : s === "Dikirim" ? "Selesai" : "Selesai";
  const statusColor = s => s === "Selesai" ? "#6DA58A" : s === "Dikirim" ? "#8B5CF6" : "#E8758F";
  const statusBg    = s => s === "Selesai" ? "#E8F5EE" : s === "Dikirim" ? "#EDE9FE" : "#FDE8EE";

  function buildTimeline(status) {
    const current = STEPS.indexOf(status);
    let html = '<div class="track-timeline">';
    STEPS.forEach((step, i) => {
      const isDone   = i < current;
      const isActive = i === current;
      const dotClass = isDone ? "done" : isActive ? "active" : "";
      const lblClass = isDone || isActive ? (isDone ? "done" : "active") : "";
      html += `<div class="track-step">
        <div class="track-step-dot ${dotClass}">${isDone ? "✓" : i + 1}</div>
        <div class="track-step-label ${lblClass}">${step}</div>
      </div>`;
      if (i < STEPS.length - 1) {
        html += `<div class="track-line ${isDone ? "done" : ""}"></div>`;
      }
    });
    html += '</div>';
    return html;
  }

  function render() {
    let allOrd   = getAllOrders();
    let filtered = session ? allOrd.filter(o => o.userId === session.id) : allOrd;

    if (!filtered.length) {
      if (emptyEl) emptyEl.style.display = "block";
      grid.innerHTML = "";
      return;
    }
    if (emptyEl) emptyEl.style.display = "none";

    grid.innerHTML = filtered.map(o => {
      const status    = o.status || "Diproses";
      const canUpdate = status !== "Selesai";
      const nextLabel = statusNext(status);
      const itemsText = o.items.map(i => `${i.emoji || "💐"} ${i.name} x${i.qty}`).join(" · ");

      return `<div class="track-card">
        <div class="track-header">
          <span class="track-num">#${o.orderNum}</span>
          <span class="track-status" style="background:${statusBg(status)};color:${statusColor(status)}">${status}</span>
        </div>
        <div class="track-date">📅 ${fmtDate(o.createdAt)}</div>
        ${buildTimeline(status)}
        <div class="track-items">${itemsText}</div>
        <div class="track-total">Total: <strong>${formatPrice(o.total)}</strong></div>
        <button class="track-update-btn" data-id="${o.orderNum}" ${canUpdate ? "" : "disabled"}>
          ${canUpdate ? "Update → " + nextLabel : "✓ Pesanan Selesai"}
        </button>
      </div>`;
    }).join("");

    grid.querySelectorAll(".track-update-btn").forEach(btn => {
      // Tracking: baca-only (tidak mengubah status pesanan)
      btn.addEventListener("click", () => {
        showToast && showToast("ℹ️ Status pesanan diperbarui oleh Admin.");
      });
    });
  }

  render();
}

/* ============================================================
   PAGE ROUTER — called on each page
   ============================================================ */
function initPageRouter() {
  const path = location.pathname.split("/").pop() || "index.html";
  initApp();
  if (path === "login.html") initLoginPage();
  if (path === "register.html") initRegisterPage();
  if (path === "profile.html") initProfilePage();
  if (path === "checkout.html") initCheckoutPage();
  if (path === "order_success.html") initOrderSuccessPage();
  if (path === "tracking.html") initTrackingPage();
}

function submitContact() {
  const name  = document.getElementById("contactName").value.trim();
  const phone = document.getElementById("contactPhone").value.trim();
  const msg   = document.getElementById("contactMsg").value.trim();
  if (!name || !phone || !msg) { showToast("❗ Semua kolom wajib diisi!"); return; }
  const waMessage = encodeURIComponent(`Halo Rain'sScoop! 🍨\n\nNama  : ${name}\nHP    : ${phone}\nPesan : ${msg}`);
  window.open(`https://api.whatsapp.com/send?phone=628815103299&text=${waMessage}`, "_blank");
  document.getElementById("contactName").value = "";
  document.getElementById("contactPhone").value = "";
  document.getElementById("contactMsg").value = "";
  showToast("✅ Mengarahkan ke WhatsApp...");
}

lucide.createIcons();
initPageRouter();
/* ============================================================
   CS WIDGET — WhatsApp Live Chat
   ============================================================ */
function initCSWidget() {
  const WA_NUMBER = "628815103299"; // Ganti dengan nomor WhatsApp CS Anda";
  const WA_DEFAULT = "Halo Rain'sScoop! 🍨 Saya mau tanya-tanya dulu.";

  // Buat elemen widget
  const widget = document.createElement("div");
  widget.className = "cs-widget";
  widget.id = "csWidget";
  widget.innerHTML = `
    <!-- Bubble popup -->
    <div class="cs-bubble" id="csBubble">
      <div class="cs-bubble-header">
        <div style="display:flex;align-items:center;gap:0.5rem;">
          <span style="font-size:1.2rem;">🍨</span>
          <div>
            <div class="cs-bubble-title">Rain'sScoop CS</div>
            <div style="font-size:0.72rem;color:#6DA58A;font-weight:500;">● Online sekarang</div>
          </div>
        </div>
        <button class="cs-bubble-close" onclick="toggleCS()" title="Tutup">✕</button>
      </div>
      <div class="cs-bubble-msg">
        Halo! 👋 Ada yang bisa kami bantu? Ketik pesanmu dan kami akan segera balas via WhatsApp.
      </div>
      <textarea class="cs-bubble-input" id="csInput" placeholder="Tulis pesanmu di sini...">${WA_DEFAULT}</textarea>
      <button class="cs-bubble-send" onclick="sendCS()">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.138.563 4.144 1.547 5.878L.057 23.504a.5.5 0 0 0 .614.596l5.701-1.476A11.938 11.938 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 0 1-5.001-1.368l-.36-.214-3.713.96.988-3.607-.236-.372A9.785 9.785 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg>
        Chat via WhatsApp
      </button>
      <div class="cs-bubble-note">Biasanya balas dalam beberapa menit</div>
    </div>

    <!-- Tombol utama -->
    <button class="cs-btn" onclick="toggleCS()" title="Chat CS">
      <span class="cs-label">Hubungi CS</span>
      <div class="cs-notif" id="csNotif"></div>
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.138.563 4.144 1.547 5.878L.057 23.504a.5.5 0 0 0 .614.596l5.701-1.476A11.938 11.938 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 0 1-5.001-1.368l-.36-.214-3.713.96.988-3.607-.236-.372A9.785 9.785 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
      </svg>
    </button>
  `;

  document.body.appendChild(widget);

  // Sembunyikan notif dot setelah dibuka pertama kali
  const seen = sessionStorage.getItem("csWidgetSeen");
  if (seen) {
    const notif = document.getElementById("csNotif");
    if (notif) notif.style.display = "none";
  }
}

function toggleCS() {
  const bubble = document.getElementById("csBubble");
  const notif  = document.getElementById("csNotif");
  if (!bubble) return;
  bubble.classList.toggle("open");
  if (bubble.classList.contains("open")) {
    sessionStorage.setItem("csWidgetSeen", "1");
    if (notif) notif.style.display = "none";
    document.getElementById("csInput")?.focus();
  }
}

function sendCS() {
  const msg = document.getElementById("csInput")?.value.trim();
  if (!msg) return;
  const url = `https://api.whatsapp.com/send?phone=628815103299&text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
  toggleCS();
}

/* ============================================================
   RATING & ULASAN PRODUK
   ============================================================ */

// In-memory reviews (no localStorage)
let _reviewsStore = {};
function getReviews() { return _reviewsStore || {}; }
function saveReviews(r) { _reviewsStore = r || {}; }

function getProductReviews(productId) {
  return (getReviews()[productId] || []);
}

function getProductRating(productId) {
  const reviews = getProductReviews(productId);
  if (!reviews.length) return { avg: 0, count: 0 };
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  return { avg: Math.round(avg * 10) / 10, count: reviews.length };
}

function renderStars(rating, size = "sm") {
  const filled = Math.round(rating);
  return [1,2,3,4,5].map(i =>
    `<span class="${i <= filled ? "filled" : ""}">${i <= filled ? "★" : "☆"}</span>`
  ).join("");
}

function renderDistribBars(reviews) {
  let html = "";
  for (let s = 5; s >= 1; s--) {
    const count = reviews.filter(r => r.rating === s).length;
    const pct   = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
    html += `<div class="review-bar-row">
      <div class="review-bar-label">${s}</div>
      <div class="review-bar-track"><div class="review-bar-fill" style="width:${pct}%"></div></div>
      <div class="review-bar-count">${count}</div>
    </div>`;
  }
  return html;
}

/* Inject rating ke kartu produk */
function injectRatingToCards() {
  document.querySelectorAll(".product-card").forEach(card => {
    const btn = card.querySelector(".add-cart-btn");
    if (!btn) return;
    const match = btn.getAttribute("onclick")?.match(/addToCart\((\d+)\)/);
    if (!match) return;
    const productId = Number(match[1]);
    const { avg, count } = getProductRating(productId);

    // Hapus rating lama jika ada
    card.querySelector(".product-rating")?.remove();

    const ratingEl = document.createElement("div");
    ratingEl.className = "product-rating";
    ratingEl.innerHTML = `
      <div class="product-stars">${renderStars(avg)}</div>
      ${avg > 0 ? `<span class="product-rating-avg">${avg}</span>` : ""}
      <span class="product-rating-count">(${count} ulasan)</span>
      <button class="review-btn" onclick="openReviewModal(${productId})">Lihat & Beri Ulasan</button>`;

    // Sisipkan sebelum product-desc
    const desc = card.querySelector(".product-desc");
    if (desc) desc.before(ratingEl);
  });
}

/* Buka modal ulasan */
let _reviewProductId = null;
let _selectedStar    = 0;

function openReviewModal(productId) {
  _reviewProductId = productId;
  _selectedStar    = 0;

  const product = products.find(p => p.id === productId);
  const reviews = getProductReviews(productId);
  const { avg, count } = getProductRating(productId);
  const session = getSession ? getSession() : null;

  // Buat modal jika belum ada
  let overlay = document.getElementById("reviewModalOverlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "review-modal-overlay";
    overlay.id = "reviewModalOverlay";
    overlay.innerHTML = `<div class="review-modal" id="reviewModal"></div>`;
    overlay.addEventListener("click", e => { if (e.target === overlay) closeReviewModal(); });
    document.body.appendChild(overlay);
  }

  const modal = document.getElementById("reviewModal");

  // Render ulasan list
  const reviewList = reviews.length
    ? reviews.slice().reverse().map(r => `
        <div class="review-item">
          <div class="review-item-header">
            <span class="review-item-name">👤 ${r.name}</span>
            <span class="review-item-date">${new Date(r.createdAt).toLocaleDateString("id-ID")}</span>
          </div>
          <div class="review-item-stars">${renderStars(r.rating)}</div>
          <div class="review-item-text">${r.text || "<em style='color:var(--text-light)'>Tidak ada komentar.</em>"}</div>
        </div>`).join("")
    : `<div class="review-empty">🌿 Belum ada ulasan. Jadilah yang pertama!</div>`;

  modal.innerHTML = `
    <div class="review-modal-header">
      <div>
        <div class="review-modal-title">${product?.emoji || "💐"} ${product?.name || "Produk"}</div>
        <div style="font-size:0.8rem;color:var(--text-light)">Rating & Ulasan Pembeli</div>
      </div>
      <button class="review-modal-close" onclick="closeReviewModal()">✕</button>
    </div>

    <!-- Summary -->
    <div class="review-summary">
      <div>
        <div class="review-summary-score">${avg || "—"}</div>
        <div class="review-summary-stars">${renderStars(avg)}</div>
        <div class="review-summary-count">${count} ulasan</div>
      </div>
      <div class="review-bars">${renderDistribBars(reviews)}</div>
    </div>

    <!-- List ulasan -->
    <div class="review-list">${reviewList}</div>

    <!-- Form tulis ulasan -->
    <div class="review-form-title">✍️ Tulis Ulasanmu</div>
    <div class="review-star-picker" id="starPicker">
      ${[1,2,3,4,5].map(i => `<span data-star="${i}" onclick="selectStar(${i})">☆</span>`).join("")}
    </div>
    <input class="review-form-name" id="reviewName" placeholder="Nama kamu..."
      value="${session?.nama || ""}" ${session ? "readonly" : ""} />
    <textarea class="review-form-text" id="reviewText" placeholder="Ceritakan pengalamanmu dengan produk ini..."></textarea>
    <button class="review-submit-btn" onclick="submitReview()">Kirim Ulasan 🌸</button>
    ${!session ? `<p class="review-login-note"><a href="login.html">Login</a> agar nama otomatis terisi.</p>` : ""}
  `;

  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeReviewModal() {
  document.getElementById("reviewModalOverlay")?.classList.remove("open");
  document.body.style.overflow = "";
}

function selectStar(star) {
  _selectedStar = star;
  document.querySelectorAll("#starPicker span").forEach((el, i) => {
    el.textContent = i < star ? "★" : "☆";
    el.classList.toggle("selected", i < star);
    el.style.color = i < star ? "#F59E0B" : "#D1D1D1";
  });
}

function submitReview() {
  const session = getSession ? getSession() : null;
  const name    = document.getElementById("reviewName")?.value.trim();
  const text    = document.getElementById("reviewText")?.value.trim();

  if (!_selectedStar) { showToast("⭐ Pilih bintang dulu!"); return; }
  if (!name)           { showToast("📝 Masukkan namamu dulu!"); return; }

  const review = {
    id: "rv_" + Date.now(),
    productId: _reviewProductId,
    userId: session?.id || null,
    name,
    rating: _selectedStar,
    text,
    createdAt: new Date().toISOString()
  };

  const allReviews = getReviews();
  if (!allReviews[_reviewProductId]) allReviews[_reviewProductId] = [];
  allReviews[_reviewProductId].unshift(review);
  saveReviews(allReviews);

  showToast("✅ Ulasan berhasil dikirim! Terima kasih 🌸");
  closeReviewModal();

  // Refresh rating di kartu
  setTimeout(() => {
    injectRatingToCards();
    // Buka ulang modal untuk lihat ulasan baru
    openReviewModal(_reviewProductId);
  }, 300);
}