document.addEventListener('DOMContentLoaded', async () => {
  let catalog = [];
  let currentActiveId = null;
  let activeCategory = 'all';

  // DOM Elements
  const grid = document.getElementById('wallpaper-grid');
  const searchInput = document.getElementById('search-input');
  const filterPills = document.getElementById('filter-pills');
  const themeToggle = document.getElementById('theme-toggle');
  const randomBtn = document.getElementById('btn-random-pick');
  const toast = document.getElementById('toast');

  // Phone Mockup Elements
  const activePhoneImg = document.getElementById('active-phone-img');
  const metaCategory = document.getElementById('meta-category');
  const metaRes = document.getElementById('meta-res');
  const metaTitle = document.getElementById('meta-title');
  const metaFeatured = document.getElementById('meta-featured');
  const btnMetaDownload = document.getElementById('btn-meta-download');
  const btnMetaCopy = document.getElementById('btn-meta-copy');
  const lockClock = document.getElementById('lock-clock');
  const lockDate = document.getElementById('lock-date');
  const statusTime = document.getElementById('status-time');

  // Lightbox Elements
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxBackdrop = document.getElementById('lightbox-backdrop');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxRes = document.getElementById('lightbox-res');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const lightboxSize = document.getElementById('lightbox-size');
  const lightboxDownloadLink = document.getElementById('lightbox-download-link');
  const lightboxApplyPhone = document.getElementById('lightbox-apply-phone');

  // Load Catalog
  try {
    const res = await fetch('wallpapers.json');
    if (res.ok) {
      catalog = await res.json();
      const statCount = document.getElementById('stat-count');
      if (statCount) statCount.textContent = catalog.length;
      const allPill = document.querySelector('[data-category="all"]');
      if (allPill) allPill.textContent = `All (${catalog.length})`;
    } else {
      throw new Error('Fetch failed');
    }
  } catch (e) {
    console.warn('Falling back to static catalog', e);
  }

  // Update Clock on Phone
  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;
    
    if (lockClock) lockClock.textContent = timeStr;
    if (statusTime) statusTime.textContent = timeStr;
    
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    if (lockDate) lockDate.textContent = now.toLocaleDateString('en-US', options);
  }
  setInterval(updateClock, 1000);
  updateClock();

  // Render Grid
  function renderGrid(items) {
    grid.innerHTML = '';
    if (items.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-dim);">
          <p style="font-size: 1.4rem; margin-bottom: 8px;">🔍 No wallpapers match your search.</p>
          <p style="font-size: 0.9rem;">Try searching for a different character or anime title.</p>
        </div>
      `;
      return;
    }

    items.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'wp-card';
      card.setAttribute('data-id', item.id);

      card.innerHTML = `
        <div class="wp-thumb-wrapper" title="Click to preview on phone">
          <img src="${item.thumb_url}" alt="${item.title}" loading="lazy">
          <div class="wp-badge-overlay">
            <span class="wp-category-chip">${item.category}</span>
            <span class="wp-res-chip">${item.resolution}</span>
          </div>
          <div class="wp-quick-actions">
            <button class="btn btn-primary btn-sm btn-action-preview">📱 Preview</button>
            <button class="btn btn-secondary btn-sm btn-action-zoom">🔍 View</button>
          </div>
        </div>
        <div class="wp-info">
          <h4 class="wp-title">${item.title}</h4>
          <span class="wp-anime">${item.anime}</span>
          <p class="wp-featured">${item.featured_in}</p>
          <div class="wp-card-footer">
            <button class="btn btn-secondary btn-sm btn-card-phone" style="flex: 1;">📱 On Phone</button>
            <a href="${item.file_url}" download class="btn btn-primary btn-sm" title="Download original resolution">⬇️ 4K</a>
          </div>
        </div>
      `;

      // Click on thumbnail or "On Phone" applies to mockup
      const thumb = card.querySelector('.wp-thumb-wrapper');
      const btnPhone = card.querySelector('.btn-card-phone');
      const btnPreview = card.querySelector('.btn-action-preview');
      const btnZoom = card.querySelector('.btn-action-zoom');

      const applyHandler = () => {
        setActiveWallpaper(item);
        // Scroll smoothly to phone on mobile
        if (window.innerWidth < 900) {
          document.querySelector('.phone-showcase').scrollIntoView({ behavior: 'smooth' });
        }
      };

      thumb.addEventListener('click', (e) => {
        if (!e.target.closest('.btn-action-zoom')) {
          applyHandler();
        }
      });
      btnPhone.addEventListener('click', applyHandler);
      btnPreview.addEventListener('click', (e) => {
        e.stopPropagation();
        applyHandler();
      });

      btnZoom.addEventListener('click', (e) => {
        e.stopPropagation();
        openLightbox(item);
      });

      grid.appendChild(card);
    });
  }

  // Set Active Wallpaper on Phone
  function setActiveWallpaper(item) {
    currentActiveId = item.id;
    activePhoneImg.style.opacity = '0';
    setTimeout(() => {
      activePhoneImg.src = item.file_url;
      activePhoneImg.onload = () => {
        activePhoneImg.style.opacity = '1';
      };
    }, 150);

    metaCategory.textContent = item.category;
    metaRes.textContent = `${item.resolution} • ${item.size}`;
    metaTitle.textContent = item.title;
    metaFeatured.textContent = `Featured in: ${item.featured_in}`;
    btnMetaDownload.href = item.file_url;

    btnMetaCopy.onclick = () => {
      const shareUrl = `${window.location.origin}${window.location.pathname}#wp=${item.id}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        showToast('Direct link copied to clipboard!');
      });
    };
  }

  // Lightbox Modal
  function openLightbox(item) {
    lightboxImg.src = item.file_url;
    lightboxTitle.textContent = item.title;
    lightboxRes.textContent = item.resolution;
    lightboxDesc.textContent = `${item.anime} • Featured in: ${item.featured_in}`;
    lightboxSize.textContent = item.size;
    lightboxDownloadLink.href = item.file_url;

    lightboxApplyPhone.onclick = () => {
      setActiveWallpaper(item);
      closeLightbox();
      document.querySelector('.phone-showcase').scrollIntoView({ behavior: 'smooth' });
    };

    lightboxModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightboxModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxBackdrop.addEventListener('click', closeLightbox);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  // Filter & Search
  function applyFilters() {
    const query = searchInput.value.toLowerCase().trim();
    const filtered = catalog.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.character.toLowerCase().includes(query) ||
        item.anime.toLowerCase().includes(query) ||
        item.featured_in.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
    renderGrid(filtered);
  }

  filterPills.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    activeCategory = btn.getAttribute('data-category');
    applyFilters();
  });

  searchInput.addEventListener('input', applyFilters);

  // Random Pick
  randomBtn.addEventListener('click', () => {
    if (catalog.length === 0) return;
    const randomItem = catalog[Math.floor(Math.random() * catalog.length)];
    setActiveWallpaper(randomItem);
    showToast(`Picked ${randomItem.title}!`);
    document.querySelector('.phone-showcase').scrollIntoView({ behavior: 'smooth' });
  });

  // Toast
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // Theme Toggle
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.remove('dark-mode');
    document.body.classList.add('light-mode');
    themeToggle.querySelector('.theme-icon').textContent = '☀️';
  }

  themeToggle.addEventListener('click', () => {
    if (document.body.classList.contains('dark-mode')) {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
      themeToggle.querySelector('.theme-icon').textContent = '☀️';
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('light-mode');
      document.body.classList.add('dark-mode');
      themeToggle.querySelector('.theme-icon').textContent = '🌙';
      localStorage.setItem('theme', 'dark');
    }
  });

  // Hash Navigation support
  function checkHash() {
    const hash = window.location.hash;
    if (hash.startsWith('#wp=')) {
      const id = hash.replace('#wp=', '');
      const item = catalog.find((w) => w.id === id);
      if (item) {
        setActiveWallpaper(item);
      }
    }
  }

  // Initialize
  renderGrid(catalog);
  if (catalog.length > 0) {
    setActiveWallpaper(catalog[0]);
    checkHash();
  }
});
