# Sajivasta Frontend v2

Frontend delapan halaman, HTML/CSS/JavaScript tanpa framework atau instalasi dependency. Dibuat berdasarkan konsep roastery Indonesia, penjelajahan kopi, serta inquiry bisnis. Logo, kemasan produk, foto pendukung dan video diambil dari website Sajivasta sesuai izin pada brief. Sumber tercatat di ASSET-SOURCES.json.

## Mulai

Buka `dist/index.html` langsung, atau gunakan server lokal: `python3 -m http.server 8080 --directory dist`. Buka http://localhost:8080. Font menggunakan Google Fonts dengan fallback sistem. Gambar dan video disertakan lokal.

## Halaman

- index.html — beranda dengan video roasting, koleksi, pemilih karakter rasa, cerita proses, jalur bisnis, FAQ.
- coffee.html — katalog tiga produk asli, filter proses, sorting, tabel perbandingan.
- profile.html — galeri sembilan foto tim dari halaman PROFILE asli Sajivasta (`/__trashed/`).
- garut-natural.html — detail Garut Natural.
- sumatra-mandailing-full-wash.html — detail Sumatra Mandailing Full Wash.
- sumatra-mandailing-natural.html — detail Sumatra Mandailing Natural.
- story.html — cerita brand, arah perusahaan, peran tim.
- wholesale.html — alur bisnis dan form konsultasi.
- contact.html — kontak resmi, tautan peta, FAQ.

## Fungsionalitas

- Menu mobile dengan Escape dan outside-click dismissal.
- Scroll reveal, garis progress, hover foto, respons tombol, sticky header.
- Prefers-reduced-motion, tombol pause video, poster untuk kondisi gagal putar.
- Pemilih rasa berdasarkan deskripsi produk asli.
- Filter proses Natural/Full Wash, urut nama, status jumlah hasil.
- Detail produk: ukuran, kuantitas, daftar pilihan dalam drawer native dialog.
- Daftar pilihan disimpan hanya di sessionStorage browser/tab dan dipertahankan ant halaman. Bukan pesanan, belum checkout, tidak membuat transaksi.
- Daftar pilihan dapat dibawa sebagai draft ke WhatsApp resmi. Pengunjung masih harus menekan Kirim di WhatsApp.
- Form konsultasi: validasi, pratinjau pesan, copy, download TXT, tautan WhatsApp. Tidak mengirim otomatis dan tidak menyimpan kontak ke server.
- Tombol Beli di toko Sajivasta mengarah ke halaman produk resmi untuk transaksi di sistem asli.

## Konten dan harga

Data produk bersumber dari sajivasta.com, ditinjau 21 September 2026. Bentuk beans; ukuran 200 g, 500 g, 1 kg. Angka harga per varian dan stok tidak dapat diverifikasi dari HTML sumber sehingga sengaja tidak direkayasa. UI mengarahkan konfirmasi melalui tim atau toko resmi. Ini frontend mockup, bukan integrasi inventori/payment gateway. Nama founder dan foto tim tidak dibuat-buat. Foto pendukung mengikuti aset website asal, tidak menjamin bahwa setiap foto adalah dokumentasi fasilitas aktual.

Kontak: info@sajivasta.com / WhatsApp +62 815 2272 1290, sesuai halaman kontak situs saat riset. Tidak ada pesan yang dikirim oleh pembuat frontend.

## Edit

- Token warna, font, spacing: dist/assets/styles.css.
- Data kopi: PRODUCTS pada build-pages.py, kemudian jalankan `python3 build-pages.py`; ini memperbarui delapan HTML dan products.js.
- Header/footer/konten: build-pages.py, atau edit HTML langsung jika tidak memakai generator lagi.
- Interaksi: dist/assets/app.js.
- Aset: dist/assets/*.webp, profile-*.jpeg, dan roasting-loop.mp4. Video asli dipotong menjadi loop 10 detik, tanpa audio, 1280 px, dikompresi untuk web.

## Integrasi produksi

Gunakan tampilan ini sebagai template frontend. Untuk WordPress, port header/footer ke template theme, tautkan data WooCommerce ke komponen produk, dan gunakan cart/checkout WooCommerce. Pertahankan URL produk atau tambahkan redirect yang sesuai. Verifikasi harga, stok, kontak, izin penggunaan foto, dan kebijakan privasi bersama pemilik sebelum rilis domain utama.

## Verifikasi

Sintaks JS dan resolusi file/tautan lokal diperiksa. Interaksi katalog, ukuran, jumlah, daftar pilihan dan draft inquiry diuji pada DOM harness. Browser visual/animasi pada desktop serta ponsel belum diuji karena preview browser static tidak tersedia di lingkungan ini. WebMCP katalog bersifat opsional dan belum diuji dalam konteks browser WebMCP.
