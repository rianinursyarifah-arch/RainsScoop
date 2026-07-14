/* ============================================================
   admin_sidebar_component.js
   Shared Admin Sidebar Component (DOM injection)
   - Tidak mengubah desain/lainnya
   - Sidebar berasal dari markup yang konsisten untuk semua halaman admin
   - Toggle collapse tersimpan di localStorage
   ============================================================ */

(function () {
  const STORAGE_KEY = 'adSidebarCollapsed';

  const MENU_ITEMS = [
    { label: 'Dashboard', href: 'admin_dashboard.html', icon: '📊', key: 'admin_dashboard' },
    { label: 'Produk', href: 'admin_produk.html', icon: '🍨', key: 'admin_produk' },
    { label: 'Pesanan', href: 'admin_pesanan.html', icon: '📦', key: 'admin_pesanan' },
    { label: 'Tambah Produk', href: 'admin_tambah_produk.html', icon: '➕', key: 'admin_tambah_produk' },
    { label: 'Edit Produk', href: 'admin_edit_produk.html', icon: '✏️', key: 'admin_edit_produk' },
    { label: 'Kategori', href: 'admin_produk.html', icon: '🏷️', key: 'kategori' },
    { label: 'Laporan', href: 'admin_dashboard.html', icon: '🗂️', key: 'laporan' },
    { label: 'Semua halaman Admin', href: 'admin.html', icon: '🧩', key: 'admin.html' }
  ];

  function getActiveKey() {
    const path = (window.location.pathname || '').split('/').pop();
    const base = path || '';
    return base.replace('.html', '');
  }

  function isCollapsedFromStorage() {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  }

  function setCollapsedToStorage(collapsed) {
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0');
    } catch {
      // ignore
    }
  }

  function toggleSidebarGlobal() {
    const shell = document.querySelector('.ad-shell');
    if (!shell) return;

    const willCollapse = !shell.classList.contains('sidebar-collapsed');
    shell.classList.toggle('sidebar-collapsed', willCollapse);
    setCollapsedToStorage(willCollapse);

    // toggle text (hamburger) if present
    const btn = document.getElementById('sidebarToggleBtn');
    if (btn) btn.textContent = '☰';
  }

  // expose global for onclick usage
  window.toggleSidebar = toggleSidebarGlobal;
  window.doLogout = window.doLogout || function () { /* will be provided by existing admin pages/scripts */ };

  function createSidebarMarkup() {
    const activeKey = getActiveKey();

    const navLinksHtml = MENU_ITEMS.map(item => {
      const linkBase = item.href.split('/').pop().replace('.html', '');
      const isActive = activeKey === linkBase || (item.key === 'kategori' && activeKey === 'admin_produk') || (item.key === 'laporan' && activeKey === 'admin_dashboard');
      const activeClass = isActive ? ' active' : '';
      return `<a href="${item.href}" class="ad-nav-link${activeClass}"><span class="ad-nav-icon">${item.icon}</span> ${item.label}</a>`;
    }).join('\n');

    return `
      <aside class="ad-sidebar" id="adminSidebar">
        <div class="ad-brand">
          <div class="ad-brand-icon">🍨</div>
          <div class="ad-brand-name">Rain's<em>Scoop</em></div>
          <div class="ad-brand-sub">Panel Admin</div>
        </div>

        <button id="sidebarToggleBtn" class="sidebar-toggle-btn" type="button" onclick="toggleSidebar()">☰</button>

        <nav class="ad-nav">
          ${navLinksHtml}
        </nav>

        <div class="ad-sidebar-footer">
          <button class="ad-logout-btn" onclick="doLogout()">🚪 Keluar</button>
        </div>
      </aside>
    `;
  }

  function ensureSidebarStyles() {
    // Use existing CSS variables/classes in pages.
    // Inject minimal positioning styles only if not already present.
    if (document.getElementById('adSidebarComponentStyles')) return;

    const style = document.createElement('style');
    style.id = 'adSidebarComponentStyles';
    style.textContent = `
      .sidebar-toggle-btn{
        position:absolute; top:1rem; left:1rem; z-index:250;
        background: var(--ad-pink, #F8BBD0);
        color:#000; border:none; border-radius:999px;
        padding:0.55rem 1rem; cursor:pointer; font-weight:700;
        transition: all 0.2s ease; display:inline-flex; align-items:center; justify-content:center;
      }
      .ad-shell{ position:relative; }
      .ad-shell.sidebar-collapsed .ad-sidebar{ width:0 !important; min-width:0 !important; border-right:none !important; overflow:hidden; }
      .ad-shell.sidebar-collapsed .ad-sidebar .ad-brand,
      .ad-shell.sidebar-collapsed .ad-sidebar .ad-nav,
      .ad-shell.sidebar-collapsed .ad-sidebar .ad-sidebar-footer{ display:none !important; }
      .ad-shell.sidebar-collapsed .ad-main{ margin-left:0 !important; }
    `;

    document.head.appendChild(style);
  }

  function injectSidebar() {
    const shell = document.querySelector('.ad-shell');
    if (!shell) return;

    // If a sidebar already exists (hardcoded), replace it
    const existing = shell.querySelector('.ad-sidebar');
    const active = existing ? 'replace' : 'append';

    ensureSidebarStyles();

    const tmp = document.createElement('div');
    tmp.innerHTML = createSidebarMarkup();
    const newSidebar = tmp.firstElementChild;

    if (active === 'replace') {
      existing.replaceWith(newSidebar);
    } else {
      // insert before main if possible
      const main = shell.querySelector('.ad-main');
      if (main) shell.insertBefore(newSidebar, main);
      else shell.prepend(newSidebar);
    }

    const collapsed = isCollapsedFromStorage();
    shell.classList.toggle('sidebar-collapsed', collapsed);

    // ensure toggle button is always visible even when sidebar collapsed
    const btn = document.getElementById('sidebarToggleBtn');
    if (btn) btn.textContent = '☰';
  }

  // Auto inject on DOM ready
  document.addEventListener('DOMContentLoaded', injectSidebar);
})();

