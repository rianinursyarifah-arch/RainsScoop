
# 🌟 Rain's Scoop

> **Proyek Akhir Mata Kuliah:** KAIT II (Administrasi Bisnis) **Program Studi:** Administrasi Bisnis **Semester:** Genap 2025/2026 **Identitas:** Riani Nur Syaridah NIM [209250206] Kelas [Administrasi Bisnis 8]

### 🌐 Live Website Links
* **Halaman Utama (Customer):** [Klik di Sini](https://rianinursyarifah-arch.github.io/RainsScoop/)
* **Halaman Login Admin:** [Klik di Sini](https://rianinursyarifah-arch.github.io/RainsScoop/admin_login.html)

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

3. Teknologi & Library yang Digunakan
HTML5 & CSS3: Penyusunan struktur kode bersih dan desain antarmuka modern (modern styling UI).

Vanilla JavaScript ES6+: Pemrosesan logika dinamis keranjang belanja, manajemen state array produk, dan pengiriman order.

Google Analytics Script (Dummy Integration): Tersemat di seluruh file HTML untuk simulasi pelacakan metrik konversi bisnis.



💼 Dokumentasi Strategi Bisnis (Business Overview)
A. Value Proposition
"Bringing the Authentic Taste of Italian Gelato Straight to Your Doorstep."

Kami memposisikan diri sebagai penyedia Gelato premium dengan bahan-bahan alami berkualitas tinggi, tekstur yang lembut, serta pilihan varian rasa yang inovatif untuk memberikan pengalaman kuliner yang eksklusif bagi pencinta dessert.



B. Segmentasi Pasar & Target Konsumen
Geografis: Masyarakat urban kelas menengah ke atas yang berdomisili di kawasan perkotaan besar di Indonesia.

Demografis: Pria dan Wanita (fokus utama usia 15–35 tahun), mahasiswa, pekerja kantoran, serta keluarga muda yang menyukai hidangan manis premium.

Psikografis: Individu dengan gaya hidup aktif/modern yang menaruh perhatian tinggi pada kualitas rasa kuliner, estetika visual produk, serta kenyamanan berbelanja online secara praktis.



C. Analisis Pasar & Keunggulan Kompetitif
Analisis Pasar: Industri makanan dan minuman (food & beverage), khususnya kategori hidangan penutup dingin di Indonesia, terus menunjukkan tren peningkatan yang stabil. Konsumen saat ini mencari alternatif dessert yang lebih sehat, menggunakan buah asli, dan memiliki proses pemesanan yang cepat.

Keunggulan Kompetitif: Dibandingkan dengan kedai es krim konvensional, Rain's Scoop menawarkan platform pemesanan mandiri yang instan, kurasi menu yang terfokus, serta sistem checkout langsung ke saluran layanan pelanggan WhatsApp untuk mempercepat konversi penjualan.



D. Revenue Stream & Strategi Harga
Revenue Stream: Penjualan langsung produk Gelato ritel (direct consumer sales), penjualan paket pesta/acara (event catering packages), serta paket bingkisan eksklusif (seasonal hampers).

Strategi Harga: Menerapkan value-based pricing yang mencerminkan kualitas bahan impor dan kesegaran buah asli, namun tetap bersaing di segmen pasar artisan dessert lokal.



F. Rencana Optimasi Data (Web Analytics)
Melalui skrip Google Analytics yang disematkan, metrik utama yang dipantau secara berkala untuk mengambil keputusan bisnis adalah:

Conversion Rate (CR): Mengukur efektivitas halaman katalog dalam mendorong pengunjung menambahkan menu Gelato ke keranjang hingga menekan tombol order WhatsApp.

Product Page Engagement: Mengidentifikasi varian rasa Gelato yang paling sering dilihat oleh calon pembeli untuk optimasi perencanaan produksi dapur.

Cart Abandonment Rate: Menilai hambatan psikologis konsumen sebelum checkout guna mempermudah alur pengisian form data pengiriman.



🚀 Panduan Instalasi Lokal
Unduh repositori ini dalam bentuk file ZIP atau jalankan perintah git clone https://github.com/raindrvs/RainsScoop.git.

Pastikan susunan file .html, script.js, dan direktori images/ berada dalam hierarki struktur direktori yang sama.

Klik dua kali pada file index.html untuk menjalankan platform di Google Chrome atau browser pilihan Anda menggunakan ekstensi Live Server.

Selesai.
