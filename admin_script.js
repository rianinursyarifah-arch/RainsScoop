/* ============================================================
   admin_script.js — Rain'sScoop Admin (versi lengkap)
   Developed by Riani Nur Syarifah
   ============================================================ */

const STORAGE_PRODUCTS_KEY       = "daftar_produk"; // shared store key for buyer and admin
const STORAGE_PRODUCTS_KEY_LEGACY = "Rain'ScoopProducts"; // fallback compatibility for legacy pages
const STORAGE_PRODUCTS_KEY_LEGACY_2 = "Rain'sScoopProducts"; // older legacy key from previous versions
const STORAGE_ORDERS_KEY         = "Rain'ScoopOrders";
const STORAGE_ALL_ORDERS        = "lifaFloraAllOrders";
const ADMIN_SESSION_KEY         = "Rain'ScoopAdminSession";
const ADMIN_PASSWORD            = "admin123";

const defaultProducts = [
  { id:1, name:"Mangga Gelato",       price:165000, emoji:"🥭", desc:"Gelato varian mangga segar", category:"buah", hot:true,  stock:8  },
  { id:2, name:"Strawberry Gelato",   price:145000, emoji:"🍓", desc:"Gelato stroberi manis", category:"buah", hot:false, stock:10 },
  { id:3, name:"Chocolate Gelato",    price:155000, emoji:"🍫", desc:"Gelato coklat lembut", category:"susu", hot:true,  stock:12 },
  { id:4, name:"Mint Gelato",         price:175000, emoji:"🌿", desc:"Gelato mint dingin",  category:"authentik", hot:false, stock:9  },
  { id:5, name:"Lemon Gelato",        price:210000, emoji:"🍋", desc:"Gelato lemon segar", category:"buah", hot:true,  stock:6  },
  { id:6, name:"Pistachio Gelato",    price:155000, emoji:"🥜", desc:"Gelato pistachio harum", category:"susu", hot:false, stock:11 },
  { id:7, name:"Classic Gelato",      price:195000, emoji:"🍨", desc:"Gelato klasik vanilla", category:"susu", hot:false, stock:7  },
  { id:8, name:"Rainbow Gelato",      price:225000, emoji:"🍦", desc:"Gelato rasa pelangi ceria", category:"mix", hot:true,  stock:5  }
];

let products = [];
let allOrders = [];

/* ---------- helpers ---------- */
function formatPrice(n) { return "Rp " + Number(n).toLocaleString("id-ID"); }

function loadData() {
  let p = localStorage.getItem(STORAGE_PRODUCTS_KEY);
  if (!p) {
    p = localStorage.getItem(STORAGE_PRODUCTS_KEY_LEGACY);
  }
  if (!p) {
    p = localStorage.getItem(STORAGE_PRODUCTS_KEY_LEGACY_2);
  }
  const o = localStorage.getItem(STORAGE_ALL_ORDERS);

  try {
    products = p ? JSON.parse(p) : [...defaultProducts];
    if (!Array.isArray(products)) products = [...defaultProducts];
  } catch (err) {
    console.warn('Failed to parse stored products, resetting to defaults.', err);
    products = [...defaultProducts];
    try { localStorage.removeItem(STORAGE_PRODUCTS_KEY); } catch (e) {}
    try { localStorage.removeItem(STORAGE_PRODUCTS_KEY_LEGACY); } catch (e) {}
  }

  try {
    allOrders = o ? JSON.parse(o) : [];
    if (!Array.isArray(allOrders)) allOrders = [];
  } catch (err) {
    console.warn('Failed to parse stored orders, resetting to empty array.', err);
    allOrders = [];
    try { localStorage.removeItem(STORAGE_ALL_ORDERS); } catch (e) {}
  }
}

function saveProducts() {
  const serializedProducts = JSON.stringify(products);
  localStorage.setItem(STORAGE_PRODUCTS_KEY, serializedProducts);
  // keep legacy keys synced so old admin pages or compatibility layers still work
  localStorage.setItem(STORAGE_PRODUCTS_KEY_LEGACY, serializedProducts);
  localStorage.setItem(STORAGE_PRODUCTS_KEY_LEGACY_2, serializedProducts);
}

function saveAllOrders() {
  localStorage.setItem(STORAGE_ALL_ORDERS, JSON.stringify(allOrders));
}

function buildLocalImagePath(name) {
  // Generate local image path based on product name for GitHub Pages-safe links
  if (!name) return "";
  const slug = name.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return `./images/${slug}.jpg`;
}

function toggleSidebar() {
  const shell = document.querySelector('.ad-shell');
  if (!shell) return;
  const closed = shell.classList.toggle('sidebar-collapsed');
  try {
    localStorage.setItem('adSidebarCollapsed', closed ? '1' : '0');
  } catch (e) {}
}

let _toastT;
function showToast(msg) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(_toastT);
  _toastT = setTimeout(() => el.classList.remove("show"), 2500);
}

/* ---------- auth ---------- */
function isLoggedIn() { return sessionStorage.getItem(ADMIN_SESSION_KEY) === "true"; }

function doLogin(e) {
  e && e.preventDefault();
  const email = (document.getElementById("adminEmail")?.value || "").trim().toLowerCase();
  const pwd = (document.getElementById("adminPwd")?.value || "").trim();
  if (email !== 'admin@rainsscoop.com' || pwd !== ADMIN_PASSWORD) {
    document.getElementById("adminLoginMsg").textContent = "❌ Email atau kata sandi salah.";
    return;
  }
  sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
  window.location.href = "admin_dashboard.html";
}

function doLogout() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  window.location.href = "admin_login.html";
}

function requireLogin() {
  if (!isLoggedIn()) window.location.href = "admin_login.html";
}

/* ============================================================
   DASHBOARD
   ============================================================ */
function initDashboard() {
  requireLogin();
  loadData();

  const totalProduk   = products.length;
  const totalPesanan  = allOrders.length;
  const totalRevenue  = allOrders.reduce((s, o) => s + (o.total || 0), 0);
  const stokRendah    = products.filter(p => Number(p.stock || 0) <= 3).length;

  document.getElementById("statProduk")  && (document.getElementById("statProduk").textContent  = totalProduk);
  document.getElementById("statPesanan") && (document.getElementById("statPesanan").textContent = totalPesanan);
  document.getElementById("statRevenue") && (document.getElementById("statRevenue").textContent = formatPrice(totalRevenue));
  document.getElementById("statStok")    && (document.getElementById("statStok").textContent    = stokRendah + " produk");

  // Pesanan terbaru (5)
  const recentEl = document.getElementById("dashRecentOrders");
  if (recentEl) {
    const recent = allOrders.slice(0, 5);
    if (!recent.length) {
      recentEl.innerHTML = "<tr><td colspan='5' class='ad-empty'>Belum ada pesanan.</td></tr>";
    } else {
      recentEl.innerHTML = recent.map(o => {
        const statusColor = o.status === "Selesai" ? "var(--ad-green)" : o.status === "Dikirim" ? "#8B5CF6" : "var(--ad-pink)";
        return `<tr>
          <td><strong>#${o.orderNum}</strong></td>
          <td>${o.nama || "-"}</td>
          <td>${formatPrice(o.total)}</td>
          <td><span class="ad-badge" style="background:${statusColor}20;color:${statusColor}">${o.status || "Diproses"}</span></td>
          <td>${new Date(o.createdAt).toLocaleDateString("id-ID")}</td>
        </tr>`;
      }).join("");
    }
  }

  // Stok rendah
  const stokEl = document.getElementById("dashStokRendah");
  if (stokEl) {
    const low = products.filter(p => Number(p.stock || 0) <= 5);
    if (!low.length) {
      stokEl.innerHTML = "<tr><td colspan='3' class='ad-empty'>Semua stok aman ✅</td></tr>";
    } else {
      stokEl.innerHTML = low.map(p => `<tr>
        <td>${p.emoji} ${p.name}</td>
        <td><strong style="color:${Number(p.stock)<=2?'#E8758F':'inherit'}">${p.stock}</strong></td>
        <td><a href="admin_produk.html" class="ad-link">Kelola →</a></td>
      </tr>`).join("");
    }
  }
}

/* ============================================================
   PRODUK
   ============================================================ */
function initProduk() {
  requireLogin();
  loadData();
  renderProdukTable();
}

function renderProdukTable() {
  const tbody = document.getElementById("produkTableBody");
  if (!tbody) return;
  if (!products.length) {
    tbody.innerHTML = "<tr><td colspan='6' class='ad-empty'>Belum ada produk.</td></tr>";
    return;
  }
  tbody.innerHTML = products.map(p => `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:0.6rem;">
          ${(p.foto || p.image)
            ? `<img src="${p.foto || p.image}" style="width:40px;height:40px;object-fit:cover;border-radius:6px;border:1px solid var(--ad-border);" />`
            : `<div style="width:40px;height:40px;background:var(--ad-pink-lt);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;">${p.emoji}</div>`}
          <span>${p.name}</span>
        </div>
      </td>
      <td>${p.category}</td>
      <td>${formatPrice(p.price)}</td>
      <td>
        <div class="ad-stok-ctrl">
          <button class="ad-stok-btn" onclick="adjustStock(${p.id}, -1)">−</button>
          <span class="ad-stok-num" style="color:${Number(p.stock)<=3?'#E8758F':'inherit'}">${p.stock}</span>
          <button class="ad-stok-btn" onclick="adjustStock(${p.id}, 1)">+</button>
        </div>
      </td>
      <td><span class="ad-badge ${p.hot ? 'hot' : 'normal'}">${p.hot ? "🔥 Hot" : "Biasa"}</span></td>
      <td class="ad-actions">
        <a href="admin_edit_produk.html?id=${p.id}" class="ad-btn-edit">Edit</a>
        <button class="ad-btn-del" onclick="deleteProduk(${p.id})">Hapus</button>
      </td>
    </tr>`).join("");
}

function adjustStock(id, delta) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  p.stock = Math.max(0, Number(p.stock || 0) + delta);
  saveProducts();
  renderProdukTable();
  showToast("✅ Stok diperbarui.");
}

function deleteProduk(id) {
  if (!confirm("Hapus produk ini?")) return;
  products = products.filter(p => p.id !== id);
  saveProducts();
  renderProdukTable();
  showToast("🗑️ Produk dihapus.");
}

/* ============================================================
   TAMBAH PRODUK
   ============================================================ */
function initTambahProduk() {
  requireLogin();
  loadData();
  const form = document.getElementById("formTambahProduk");
  if (!form) return;

  // Gunakan onclick di button, bukan form submit, agar tidak ada konflik
  const submitBtn = form.querySelector("button[type='submit']");
  if (submitBtn) {
    submitBtn.type = "button"; // ganti ke button biasa
    submitBtn.addEventListener("click", doTambahProduk);
  }
  form.addEventListener("submit", e => { e.preventDefault(); doTambahProduk(); });
}

function doTambahProduk() {
  loadData(); // reload dulu agar data sinkron
  const nama     = document.getElementById("tpNama")?.value.trim();
  const hargaRaw = document.getElementById("tpHarga")?.value;
  const stokRaw  = document.getElementById("tpStok")?.value;
  const kategori = document.getElementById("tpKategori")?.value;
  const emoji    = document.getElementById("tpEmoji")?.value.trim() || "💐";
  const desc     = document.getElementById("tpDesc")?.value.trim() || "";
  const hot      = document.getElementById("tpHot")?.checked || false;

  const harga = Number(hargaRaw);
  const stok  = Number(stokRaw);

  if (!nama)     { showToast("⚠️ Nama produk wajib diisi!");  return; }
  if (!harga)    { showToast("⚠️ Harga produk wajib diisi!"); return; }
  if (!stok && stok !== 0) { showToast("⚠️ Stok wajib diisi!"); return; }
  if (!kategori) { showToast("⚠️ Kategori wajib dipilih!");   return; }

  // Simpan dengan foto (base64)
  getFotoBase64("tpFoto", function(fotoData) {
    const newId = products.length ? Math.max(...products.map(p => Number(p.id))) + 1 : 1;
    const imagePath = buildLocalImagePath(nama);
    const newProduct = {
      id: newId,
      name: nama,
      price: harga,
      stock: stok,
      category: kategori,
      emoji,
      desc,
      hot,
      // gunakan data foto base64 bila diupload, jika tidak gunakan path lokal berdasarkan nama produk
      foto: fotoData || null,
      image: fotoData ? null : imagePath
    };
    products.push(newProduct);

    try {
      saveProducts();
      showToast("✅ Produk berhasil ditambahkan!");
      setTimeout(() => { window.location.href = "admin_produk.html"; }, 1000);
    } catch(err) {
      showToast("❌ Gagal menyimpan: " + err.message);
    }
  });
}

/* ============================================================
   EDIT PRODUK
   ============================================================ */
function initEditProduk() {
  requireLogin();
  loadData();
  const params = new URLSearchParams(window.location.search);
  const id     = Number(params.get("id"));
  const p      = products.find(x => x.id === id);
  if (!p) { showToast("❌ Produk tidak ditemukan."); return; }

  document.getElementById("epNama").value     = p.name;
  document.getElementById("epHarga").value    = p.price;
  document.getElementById("epStok").value     = p.stock;
  document.getElementById("epKategori").value = p.category;
  document.getElementById("epEmoji").value    = p.emoji;
  document.getElementById("epDesc").value     = p.desc || "";
  document.getElementById("epHot").checked    = p.hot || false;

  const form = document.getElementById("formEditProduk");
  if (!form) return;

  // Tampilkan foto existing jika ada
  if (p.foto || p.image) {
    const currentWrap = document.getElementById("epFotoCurrent");
    const currentImg  = document.getElementById("epFotoCurrentImg");
    if (currentWrap) currentWrap.style.display = "block";
    if (currentImg)  currentImg.src = p.foto || p.image;
  }

  function doEdit() {
    const newNama = document.getElementById("epNama")?.value.trim();
    if (!newNama) { showToast("⚠️ Nama produk wajib diisi!"); return; }

    p.name     = newNama;
    p.price    = Number(document.getElementById("epHarga")?.value) || p.price;
    p.stock    = Number(document.getElementById("epStok")?.value ?? p.stock);
    p.category = document.getElementById("epKategori")?.value || p.category;
    p.emoji    = document.getElementById("epEmoji")?.value.trim() || p.emoji || "🍦";
    p.desc     = document.getElementById("epDesc")?.value.trim() || "";
    p.hot      = document.getElementById("epHot")?.checked || false;

    if (!p.foto) {
      p.image = buildLocalImagePath(newNama); // gunakan path lokal jika tidak ada foto base64
    }

    getFotoBase64("epFoto", function(fotoData) {
      if (fotoData) {
        p.foto = fotoData;
        p.image = null;
      }
      saveProducts();
      showToast("✅ Produk berhasil diperbarui!");
      setTimeout(() => { window.location.href = "admin_produk.html"; }, 1000);
    });
  }

  const submitBtn = form.querySelector("button[type='submit']");
  if (submitBtn) { submitBtn.type = "button"; submitBtn.addEventListener("click", doEdit); }
  form.addEventListener("submit", e => { e.preventDefault(); doEdit(); });
}

/* ============================================================
   PESANAN
   ============================================================ */
function initPesanan() {
  requireLogin();
  loadData();
  renderPesananTable();
}

function renderPesananTable(filter = "semua") {
  const tbody = document.getElementById("pesananTableBody");
  if (!tbody) return;


  let list = [...allOrders];
  if (filter !== "semua") {
    list = list.filter(o => {
      const st = o.status || o.order_status || "Menunggu Konfirmasi";
      return st === filter;
    });
  }


  if (!list.length) {
    tbody.innerHTML = "<tr><td colspan='6' class='ad-empty'>Belum ada pesanan.</td></tr>";
    return;
  }

  const statusColor = s => {
    if (s === "Selesai") return "var(--ad-green)";
    if (s === "Diproses") return "#8B5CF6";
    return "var(--ad-pink)";
  };

  const statusOptions = ["Menunggu Konfirmasi", "Diproses", "Selesai"];

  const normalizeStatus = (o) => o?.status || o?.order_status || "Menunggu Konfirmasi";

  const fmtDate = (val) => {
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return "-";
      return d.toLocaleDateString("id-ID");
    } catch (e) {
      return "-";
    }
  };

  tbody.innerHTML = list.map(o => {
    const status = o.status || o.order_status || "Menunggu Konfirmasi";
    const next   = statusNext(status);

    return `<tr>
      <td><strong>#${o.orderNum}</strong></td>
      <td>${o.nama || "-"}<br/><small style="color:var(--ad-muted)">${o.phone || ""}</small></td>
      <td>${(o.items||[]).map(i=>`${i.emoji||"💐"} ${i.name} x${i.qty}`).join("<br/>")}</td>
      <td>${formatPrice(o.total)}</td>
      <td>${o.payment_method || o.payment || o.metode_pembayaran || "-"}</td>
      <td>${fmtDate(o.createdAt || o.created_at)}</td>
      <td><span class="ad-badge" style="background:${statusColor(status)}20;color:${statusColor(status)}">${status}</span></td>

    </tr>`;

  }).join("");
}

function updateOrderStatus(orderNum, newStatus) {
  const idx = allOrders.findIndex(o => o.orderNum === orderNum);
  if (idx === -1) return;

  const prev = allOrders[idx];

  // normalisasi field yang diminta
  allOrders[idx].status = newStatus;
  allOrders[idx].order_status = newStatus;
  allOrders[idx].updated_at = new Date().toISOString();

  // field customer
  allOrders[idx].customer_name = prev.nama || prev.customer_name || "";
  allOrders[idx].phone = prev.phone || prev.phone_number || prev.customer_phone || prev.telpon || prev.phoneNumber || prev.no_hp || prev.phone || "";

  // field pembayaran
  allOrders[idx].payment_method = prev.payment_method || prev.payment || prev.metode_pembayaran || "";
  allOrders[idx].payment_detail = prev.payment_detail || prev.payment_detail || null;
  allOrders[idx].metode_pembayaran = allOrders[idx].payment_method;

  // field waktu
  allOrders[idx].created_at = prev.createdAt || prev.created_at || new Date().toISOString();
  allOrders[idx].createdAt = allOrders[idx].createdAt || allOrders[idx].created_at;

  // pastikan createdAt tidak hilang (dipakai order_success.html)
  if (!allOrders[idx].createdAt) allOrders[idx].createdAt = allOrders[idx].created_at;

  saveAllOrders();

  const activeFilter = document.querySelector(".ad-filter-btn.active")?.dataset.filter || "semua";
  renderPesananTable(activeFilter);
  showToast("✅ Status pesanan diperbarui.");
}


/* ============================================================
   FOTO PRODUK — Upload & Preview
   ============================================================ */

function previewFoto(inputId, previewWrapId, areaId) {
  const input   = document.getElementById(inputId);
  const preview = document.getElementById(previewWrapId);
  const area    = document.getElementById(areaId);
  if (!input?.files?.length) return;

  const file = input.files[0];
  if (file.size > 2 * 1024 * 1024) {
    showToast("⚠️ Ukuran foto maksimal 2MB!");
    input.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = e => {
    const imgId = previewWrapId === "tpFotoPreview" ? "tpFotoImg" : "epFotoImg";
    const imgEl = document.getElementById(imgId);
    if (imgEl) imgEl.src = e.target.result;
    if (preview) preview.style.display = "block";
    if (area)    area.style.display    = "none";
  };
  reader.readAsDataURL(file);
}

function removeFoto(inputId, previewWrapId, areaId) {
  const input   = document.getElementById(inputId);
  const preview = document.getElementById(previewWrapId);
  const area    = document.getElementById(areaId);
  if (input)   input.value = "";
  if (preview) preview.style.display = "none";
  if (area)    area.style.display    = "block";
}

function getFotoBase64(inputId, callback) {
  const input = document.getElementById(inputId);
  if (!input?.files?.length) { callback(null); return; }
  const reader = new FileReader();
  reader.onload = e => callback(e.target.result);
  reader.readAsDataURL(input.files[0]);
}
