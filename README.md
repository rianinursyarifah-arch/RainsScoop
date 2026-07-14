https://rianinursyarifah-arch.github.io/RainsScoop/
# 🌟 Rain's Scoop

> **Proyek Akhir Mata Kuliah:** KAIT II (Administrasi Bisnis) **Program Studi:** Administrasi Bisnis **Semester:** Genap 2025/2026 **Identitas:** Riani Nur Syaridah NIM [209250206] Kelas [Administrasi Bisnis 8]

### 🌐 Live Website Links
* **Halaman Utama (Customer):** [Klik di Sini](https://rianinursyarifah-arch.github.io/RainsScoop/)
* **Halaman Login Admin:** [Klik di Sini](https://raindrvs.github.io/RainsScoop/admin_login.html)

<br><hr><br>

### 📌 Deskripsi Proyek
Rain's Scoop adalah sebuah *prototype platform e-commerce* fungsional, responsif, dan profesional yang dikembangkan khusus untuk memenuhi tugas akhir mata kuliah KAIT II. Platform ini mengintegrasikan aspek teknis *front-end development* modern dengan strategi manajemen bisnis kuliner hidangan penutup (*dessert*) premium, khususnya Gelato Italia otentik di era digital.

<br><hr><br>

## 🛠️ Fitur Utama & Spesifikasi Teknis

### 1. Fitur Website (Client & Admin)
* **Responsive Layout:** Mengoptimalkan tampilan antarmuka di perangkat Mobile, Tablet, dan Desktop menggunakan CSS Media Queries, Flexbox, dan Grid agar ramah pengguna.
* **Katalog & Detail Produk:** Menyajikan varian rasa Gelato pilihan dengan visual yang estetis dilengkapi fitur modal detail deskripsi produk.
* **Sistem Keranjang Belanja:** Fitur *Add to Cart, Update Quantity*, dan *Remove* produk yang terintegrasi secara *real-time*.
* **Sistem Checkout Terintegrasi:** Form pengisian data pengiriman lengkap dengan simulasi perhitungan total belanja otomatis yang terhubung ke nomor WhatsApp.
* **Dashboard Admin Terintegrasi:** Halaman khusus bagi manajemen untuk mengelola daftar produk, memantau perubahan stok, dan melihat ringkasan pesanan masuk.

### 2. Struktur Folder Proyek & Penjelasan Berkas
```text
📁 RainsScoop/
├── 📁 images/                   -> Aset gambar menu Gelato (*-gelato.jpg) dan QRIS Pembayaran
├── index.html                   -> Halaman Utama / Katalog Produk & Etalase Rain's Scoop
├── script.js                    -> Logika interaktif halaman utama (render katalog & keranjang)
├── style.css                    -> Desain/styling utama untuk tampilan antarmuka pelanggan
│
├── 🛒 FITUR PELANGGAN (CUSTOMER FLOW):
├── login.html                   -> Pintu masuk autentikasi/login akun pelanggan
├── register.html                -> Halaman pendaftaran/pembuatan akun pelanggan baru
├── profile.html                 -> Halaman data diri dan informasi akun pelanggan
├── detail_produk.html           -> Tampilan detail deskripsi spesifik varian rasa Gelato
├── keranjang.html               -> Halaman pratinjau barang yang siap dibeli (Cart Management)
├── checkout.html                -> Form pengisian data pengiriman barang pelanggan
├── checkout_payment.js          -> Logika pemrosesan metode pembayaran dan hitung otomatis
├── order_success.html           -> Halaman notifikasi transaksi berhasil dilakukan
├── tracking.html                -> Fitur simulasi/pelacakan status pengiriman gelato
│
└── 💼 FITUR MANAJEMEN (ADMIN PANEL):
    ├── admin_login.html         -> Pintu masuk khusus untuk autentikasi masuk akun Admin
    ├── admin_script.js          -> Logika validasi login admin (email: admin@rainsscoop.com)
    ├── admin_dashboard.html     -> Panel utama ringkasan performa toko dan statistik bisnis
    ├── admin.js                 -> Logika fungsional utama untuk operasi panel admin
    ├── admin_sidebar_component.js -> Komponen navigasi menu samping demi efisiensi kode admin
    ├── admin_style.css          -> Desain khusus untuk layout halaman dashboard admin
    ├── admin_produk.html        -> Halaman manajemen daftar produk dan kontrol stok gudang
    ├── admin_tambah_produk.html -> Form input untuk menambahkan varian menu Gelato baru
    ├── admin_edit_produk.html   -> Halaman pembaruan/modifikasi data menu yang sudah ada
    └── admin_pesanan.html       -> Manajemen laporan data riwayat transaksi masuk pembeli
