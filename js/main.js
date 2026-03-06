/* ============================================================
   main.js — Dapur Nusantara
   File ini dipakai bersama oleh SEMUA halaman HTML.
   Berisi: navbar, animasi, toast, cart, filter menu, form order.
   ============================================================ */


/* ── 1. NAVBAR: efek shadow saat scroll + tandai link aktif ── */

const navbar = document.querySelector('.navbar');

// Tambah class 'scrolled' kalau halaman sudah di-scroll > 40px
// Class ini dipakai CSS untuk munculkan box-shadow
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// Ambil nama file halaman yang sedang aktif, misal: "menu.html"
// location.pathname.split('/').pop() → ambil bagian terakhir URL
// Jika hasilnya kosong string (misal di root "/"), fallback ke 'index.html'
const currentPage = location.pathname.split('/').pop() || 'index.html';

// Loop semua link di navbar desktop dan mobile,
// lalu tambah class 'active' kalau href-nya cocok dengan halaman sekarang
document.querySelectorAll('.navbar-links a, .mobile-menu a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage) link.classList.add('active');
});


/* ── 2. HAMBURGER: toggle mobile menu ── */

const hamburger  = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');

if (hamburger && mobileMenu) {
  // Klik hamburger → tampilkan / sembunyikan menu mobile
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });

  // Klik salah satu link di mobile menu → tutup menu otomatis
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });
}


/* ── 3. FADE-IN: animasi elemen saat muncul di layar ── */

const fadeEls = document.querySelectorAll('.fade-in');

// IntersectionObserver memantau apakah elemen sudah masuk area tampilan layar (viewport)
// threshold: 0.12 artinya animasi mulai saat 12% elemen sudah terlihat
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible'); // picu animasi CSS
      observer.unobserve(entry.target);      // berhenti memantau (animasi cukup sekali)
    }
  });
}, { threshold: 0.12 });

fadeEls.forEach(el => observer.observe(el));


/* ── 4. TOAST NOTIFICATION ── */

/**
 * Tampilkan notifikasi pop-up kecil di pojok kanan bawah.
 * @param {string} message  - Teks yang ditampilkan (default: 'Berhasil!')
 * @param {number} duration - Berapa ms toast ditampilkan (default: 2500ms)
 */
function showToast(message = 'Berhasil!', duration = 2500) {
  let toast = document.querySelector('.toast');

  // Kalau elemen .toast belum ada di HTML, buat secara dinamis
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('show');

  // Sembunyikan toast setelah durasi habis
  setTimeout(() => toast.classList.remove('show'), duration);
}


/* ── 5. CART (Keranjang Belanja) ── */
// sessionStorage: data tersimpan selama tab browser masih terbuka,
// akan hilang kalau tab/browser ditutup — cocok untuk sesi belanja sementara.
// Format data cart: array of object → [{ name, price, qty }, ...]

let cart = JSON.parse(sessionStorage.getItem('dn-cart') || '[]');

/** Simpan state cart ke sessionStorage */
function saveCart() {
  sessionStorage.setItem('dn-cart', JSON.stringify(cart));
}

/**
 * Tambah item ke keranjang.
 * Jika item sudah ada → tambah qty. Jika belum → push item baru.
 * @param {string} name  - Nama menu
 * @param {number} price - Harga satuan (angka, bukan string)
 */
function addToCart(name, price) {
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  saveCart();
  showToast(`✓ ${name} ditambahkan!`);
  renderCartBadge();
}

/**
 * Ubah qty item di cart. delta = +1 (tambah) atau -1 (kurang).
 * Jika qty jadi 0 atau minus → hapus item dari cart.
 * @param {string} name  - Nama item yang diubah
 * @param {number} delta - Perubahan qty: +1 atau -1
 */
function changeQty(name, delta) {
  const idx = cart.findIndex(i => i.name === name);
  if (idx === -1) return; // item tidak ditemukan, abaikan

  cart[idx].qty += delta;

  // Hapus item jika qty sudah 0 atau di bawahnya
  if (cart[idx].qty <= 0) cart.splice(idx, 1);

  saveCart();
  renderCart();
  renderCartBadge();
}

/** Kosongkan seluruh isi keranjang */
function clearCart() {
  cart = [];
  saveCart();
  renderCart();
  renderCartBadge();
}

/**
 * Update badge jumlah item di navbar (opsional, jika elemen .cart-badge ada).
 * Menjumlahkan semua qty dari setiap item di cart.
 */
function renderCartBadge() {
  const badge = document.querySelector('.cart-badge');
  if (!badge) return;

  // reduce: iterasi array dan akumulasi nilainya
  // sum = akumulator, i = item saat ini
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  badge.textContent = total;
  badge.style.display = total > 0 ? 'inline-block' : 'none';
}

/**
 * Render isi keranjang ke dalam elemen #cart-items di pemesanan.html.
 * Juga otomatis update total harga dan textarea pesanan.
 */
function renderCart() {
  const container = document.getElementById('cart-items');
  const totalEl   = document.getElementById('cart-total');
  if (!container) return; // fungsi ini hanya relevan di pemesanan.html

  // Tampilkan pesan kosong jika cart tidak ada isinya
  if (cart.length === 0) {
    container.innerHTML = '<p class="cart-empty">Belum ada item. Pilih menu dulu!</p>';
    if (totalEl) totalEl.textContent = 'Rp 0';
    return;
  }

  // Buat HTML untuk tiap item menggunakan template literal
  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-info">
        <span class="cart-item-name">${item.name}</span>
        <span class="cart-item-price">Rp ${(item.price * item.qty).toLocaleString('id-ID')}</span>
      </div>
      <div class="cart-item-qty">
        <button class="qty-btn" onclick="changeQty('${item.name}', -1)">−</button>
        <span>${item.qty}</span>
        <button class="qty-btn" onclick="changeQty('${item.name}', 1)">+</button>
      </div>
    </div>
  `).join(''); // join('') gabungkan array string jadi satu string HTML

  // Hitung dan tampilkan total harga semua item
  if (totalEl) {
    const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    totalEl.textContent = 'Rp ' + total.toLocaleString('id-ID');
  }

  // Sinkronisasi ringkasan pesanan ke textarea di form pemesanan
  const inputPesan = document.getElementById('input-pesanan');
  if (inputPesan) {
    inputPesan.value = cart.map(i => `${i.qty}x ${i.name}`).join(', ');
  }
}


/* ── 6. FILTER MENU (menu.html) ── */

/**
 * Filter tampilan card menu berdasarkan kategori.
 * Sembunyikan card yang tidak sesuai kategori, tampilkan yang sesuai.
 * @param {string} category - 'semua' | 'berat' | 'ringan' | 'minuman'
 */
function filterMenu(category) {
  // Update tampilan tombol: hanya tombol yang diklik yang aktif
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === category);
  });

  // Tampilkan atau sembunyikan tiap card berdasarkan data-cat-nya
  document.querySelectorAll('.menu-item').forEach(item => {
    const match = category === 'semua' || item.dataset.cat === category;
    item.style.display = match ? 'block' : 'none';
  });
}


/* ── 7. FORM PEMESANAN: kirim via WhatsApp ── */

/**
 * Validasi form, susun teks pesan, lalu buka WhatsApp dengan pesan siap kirim.
 * encodeURIComponent() diperlukan agar teks dengan spasi/simbol aman di URL.
 */
function submitOrder() {
  // Ambil nilai dari tiap field; optional chaining (?.) mencegah error
  // jika elemen tidak ditemukan di halaman
  const nama    = document.getElementById('nama')?.value.trim();
  const wa      = document.getElementById('wa')?.value.trim();
  const alamat  = document.getElementById('alamat')?.value.trim();
  const pesanan = document.getElementById('input-pesanan')?.value.trim();
  const tanggal = document.getElementById('tanggal')?.value;
  const jam     = document.getElementById('jam')?.value;
  const catatan = document.getElementById('catatan')?.value.trim();

  // Ambil value radio button yang sedang dipilih
  // querySelector dengan :checked → cari input radio yang aktif
  const payment = document.querySelector('input[name="payment"]:checked')?.value || '-';

  // Validasi: field wajib tidak boleh kosong
  if (!nama || !wa || !alamat || !pesanan) {
    alert('Mohon lengkapi: Nama, WhatsApp, Alamat, dan Pesanan!');
    return; // hentikan eksekusi jika validasi gagal
  }

  // Hitung ulang total langsung dari data cart (bukan dari tampilan DOM)
  // Ini lebih aman karena tidak bergantung pada teks yang tampil di layar
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  // confirm() menampilkan dialog konfirmasi dengan tombol OK dan Cancel.
  // Mengembalikan true jika user klik OK, false jika klik Cancel.
  // Ini mencegah pesanan terkirim secara tidak sengaja (human error).
  const konfirmasi = confirm(
    `Pastikan pesanan sudah sesuai!\n\n` +
    `Nama     : ${nama}\n` +
    `Alamat   : ${alamat}\n` +
    `Pesanan  : ${pesanan}\n` +
    `Total    : Rp ${total.toLocaleString('id-ID')}\n\n` +
    `Kirim pesanan sekarang?`
  );

  // Jika user klik "Cancel" pada dialog → batalkan, jangan lanjutkan
  if (!konfirmasi) return;

  // Susun teks pesan dengan format rapi menggunakan template literal
  // \n = baris baru di dalam string
  const pesan =
    `*PESANAN DAPUR NUSANTARA*\n\n` +
    `Nama     : ${nama}\n` +
    `WhatsApp : ${wa}\n` +
    `Alamat   : ${alamat}\n` +
    `Tanggal  : ${tanggal || '-'}\n` +
    `Jam      : ${jam || '-'}\n\n` +
    `Pesanan  :\n${pesanan}\n\n` +
    `Total    : Rp ${total.toLocaleString('id-ID')}\n` +
    `Bayar    : ${payment}\n` +
    `Catatan  : ${catatan || '-'}\n\n` +
    `Terima kasih!`;

  // Nomor WA tujuan (format internasional, tanpa + dan tanpa tanda -)
  const nomorWA = '6281234567890';

  // Buka tab baru ke WhatsApp Web/App dengan pesan yang sudah disusun
  window.open(`https://wa.me/${nomorWA}?text=${encodeURIComponent(pesan)}`, '_blank');
}


/* ── 8. INISIALISASI saat halaman selesai dimuat ── */

// DOMContentLoaded: pastikan semua elemen HTML sudah terbaca
// sebelum kita coba akses atau manipulasi elemen tersebut
document.addEventListener('DOMContentLoaded', () => {
  renderCartBadge(); // update badge cart di navbar
  renderCart();      // render isi cart (hanya berpengaruh di pemesanan.html)

  // Set nilai default input tanggal ke hari ini
  const inputTanggal = document.getElementById('tanggal');
  if (inputTanggal && !inputTanggal.value) {
    inputTanggal.valueAsDate = new Date();
  }
});
