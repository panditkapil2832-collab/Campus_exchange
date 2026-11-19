// Student Academic Resources Exchange System - Core Application Logic

(function () {
  'use strict';

  // ================= STORAGE KEYS =================
  const STORAGE_ITEMS_KEY = 'campus_exchange_items_v2';
  const STORAGE_SAVED_KEY = 'campus_exchange_saved_ids_v2';
  const STORAGE_THEME_KEY = 'campus_exchange_theme_v2';

  // ================= APPLICATION STATE =================
  let state = {
    items: [],
    savedIds: new Set(),
    activeFilter: {
      branch: 'ALL',
      semester: null,
      priceMode: 'all',
      maxPrice: 300,
      category: null,
      conditions: [],
      searchQuery: '',
      sortBy: 'featured'
    },
    activeDetailItem: null,
    uploadedPhotoBase64: null
  };

  // ================= INITIALIZATION =================
  function initApp() {
    loadTheme();
    loadStateFromStorage();
    setupEventListeners();
    renderCategories();
    applyFiltersAndRender();
    updateHeaderStats();
    updateBookmarksBadge();
  }

  // ================= STORAGE HELPERS =================
  function loadStateFromStorage() {
    try {
      const storedItems = localStorage.getItem(STORAGE_ITEMS_KEY);
      if (storedItems) {
        state.items = JSON.parse(storedItems);
      } else {
        state.items = [...INITIAL_ITEMS];
        saveItemsToStorage();
      }

      const storedSaved = localStorage.getItem(STORAGE_SAVED_KEY);
      if (storedSaved) {
        state.savedIds = new Set(JSON.parse(storedSaved));
      } else {
        // Default demo saved item
        state.savedIds = new Set(['item-104', 'item-110']);
        saveBookmarksToStorage();
      }
    } catch (err) {
      console.error('Error loading localStorage:', err);
      state.items = [...INITIAL_ITEMS];
      state.savedIds = new Set();
    }
  }

  function saveItemsToStorage() {
    try {
      localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(state.items));
    } catch (err) {
      console.warn('LocalStorage save failed:', err);
    }
  }

  function saveBookmarksToStorage() {
    try {
      localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify([...state.savedIds]));
    } catch (err) {
      console.warn('LocalStorage save bookmarks failed:', err);
    }
  }

  // ================= THEME TOGGLE =================
  function loadTheme() {
    const savedTheme = localStorage.getItem(STORAGE_THEME_KEY) || 'light';
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem(STORAGE_THEME_KEY, isDark ? 'dark' : 'light');
    showToast(`Switched to ${isDark ? 'Dark' : 'Light'} theme`, 'info');
  }

  // ================= RENDER CATEGORY PILLS & SIDEBAR =================
  function renderCategories() {
    const heroContainer = document.getElementById('quick-category-pills');
    const sidebarContainer = document.getElementById('category-filter-list');

    // Count items per category
    const counts = {};
    Object.keys(CATEGORY_MAP).forEach(k => counts[k] = 0);
    state.items.forEach(it => {
      if (counts[it.category] !== undefined) counts[it.category]++;
    });

    // 1. Quick Category Pills in Hero
    if (heroContainer) {
      let heroHtml = `
        <button data-cat="ALL" class="category-chip ${state.activeFilter.category === null ? 'active' : ''} px-3 py-1.5 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 whitespace-nowrap shadow-sm hover:border-brand-500">
          All (${state.items.length})
        </button>
      `;

      Object.entries(CATEGORY_MAP).forEach(([key, info]) => {
        const isActive = state.activeFilter.category === key;
        heroHtml += `
          <button data-cat="${key}" class="category-chip ${isActive ? 'active' : ''} px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 whitespace-nowrap shadow-sm hover:border-brand-500">
            ${info.name} (${counts[key] || 0})
          </button>
        `;
      });
      heroContainer.innerHTML = heroHtml;
    }

    // 2. Sidebar Category list
    if (sidebarContainer) {
      let sideHtml = `
        <button data-cat="ALL" class="category-chip w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border ${state.activeFilter.category === null ? 'active' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300'}">
          <span class="flex items-center gap-2">
            <i data-lucide="layout-grid" class="w-3.5 h-3.5"></i>
            All Categories
          </span>
          <span class="text-[11px] opacity-80 font-bold">${state.items.length}</span>
        </button>
      `;

      Object.entries(CATEGORY_MAP).forEach(([key, info]) => {
        const isActive = state.activeFilter.category === key;
        sideHtml += `
          <button data-cat="${key}" class="category-chip w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border ${isActive ? 'active' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-brand-500'}">
            <span class="flex items-center gap-2">
              <i data-lucide="${info.icon}" class="w-3.5 h-3.5"></i>
              ${info.name}
            </span>
            <span class="text-[11px] px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">${counts[key] || 0}</span>
          </button>
        `;
      });
      sidebarContainer.innerHTML = sideHtml;
      lucide.createIcons();
    }
  }

  // ================= FILTERING & SORTING LOGIC =================
  function applyFiltersAndRender() {
    const f = state.activeFilter;
    let filtered = state.items.filter(item => {
      // Branch filter
      if (f.branch !== 'ALL' && item.branch !== f.branch) {
        return false;
      }

      // Semester filter
      if (f.semester !== null && item.semester !== f.semester) {
        return false;
      }

      // Category filter
      if (f.category !== null && item.category !== f.category) {
        return false;
      }

      // Price filter
      if (f.priceMode === 'free' && item.price !== 0) {
        return false;
      }
      if (f.priceMode === 'under150' && item.price > 150) {
        return false;
      }
      if (item.price > f.maxPrice) {
        return false;
      }

      // Condition filter
      if (f.conditions.length > 0 && !f.conditions.includes(item.condition)) {
        return false;
      }

      // Search Query
      if (f.searchQuery.trim() !== '') {
        const q = f.searchQuery.toLowerCase();
        const catName = (CATEGORY_MAP[item.category]?.name || '').toLowerCase();
        const branchMatch = item.branch.toLowerCase().includes(q);
        const titleMatch = item.title.toLowerCase().includes(q);
        const descMatch = item.description.toLowerCase().includes(q);
        const sellerMatch = item.seller.name.toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !catName.includes(q) && !branchMatch && !sellerMatch) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      switch (f.sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'condition':
          const rank = { 'Brand New': 3, 'Gently Used': 2, 'Marked with Notes': 1 };
          return (rank[b.condition] || 0) - (rank[a.condition] || 0);
        case 'semester':
          return a.semester - b.semester;
        case 'featured':
        default:
          if (a.price === 0 && b.price !== 0) return -1;
          if (b.price === 0 && a.price !== 0) return 1;
          return new Date(b.postedAt) - new Date(a.postedAt);
      }
    });

    renderItemsGrid(filtered);
    updateFilterIndicators(filtered.length);
  }

  // ================= RENDER ITEM CARDS =================
  function renderItemsGrid(items) {
    const grid = document.getElementById('items-grid');
    const emptyState = document.getElementById('empty-state');
    const resultsCount = document.getElementById('results-count');

    if (resultsCount) resultsCount.textContent = items.length;

    if (items.length === 0) {
      grid.innerHTML = '';
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');

    grid.innerHTML = items.map(item => {
      const isSaved = state.savedIds.has(item.id);
      const isFree = item.price === 0;
      const catInfo = CATEGORY_MAP[item.category] || { name: item.category, icon: 'box' };
      const branchStyle = BRANCH_INFO[item.branch]?.color || 'bg-slate-100 text-slate-800 border-slate-200';
      const condClass = item.condition === 'Brand New' 
        ? 'condition-brand-new' 
        : item.condition === 'Gently Used' 
          ? 'condition-gently-used' 
          : 'condition-marked-notes';

      const stars = item.condition === 'Brand New' ? '★★★★★' : item.condition === 'Gently Used' ? '★★★★☆' : '★★★½☆';

      return `
        <div class="resource-card group bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/80 overflow-hidden flex flex-col justify-between shadow-sm hover:border-brand-500/50">
          
          <!-- Card Image & Top Tags -->
          <div class="relative h-48 bg-slate-100 dark:bg-slate-900 overflow-hidden flex items-center justify-center cursor-pointer" onclick="window.CampusApp.openDetails('${item.id}')">
            <img 
              src="${item.photo || SVG_PLACEHOLDERS[item.category] || SVG_PLACEHOLDERS.textbook}" 
              alt="${escapeHtml(item.title)}" 
              loading="lazy" 
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            >

            <!-- Top Left Tags -->
            <div class="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-800 dark:text-slate-100 shadow-sm border border-slate-200/50 dark:border-slate-700 flex items-center gap-1">
                <i data-lucide="${catInfo.icon}" class="w-3 h-3 text-brand-600 dark:text-indigo-400"></i>
                ${catInfo.name}
              </span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold ${branchStyle} shadow-sm border">
                ${item.branch}
              </span>
            </div>

            <!-- Top Right Bookmark Action -->
            <button 
              type="button" 
              onclick="event.stopPropagation(); window.CampusApp.toggleBookmark('${item.id}')"
              title="${isSaved ? 'Remove from saved' : 'Save resource'}"
              class="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-700 dark:text-slate-200 flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all"
            >
              <i data-lucide="bookmark" class="w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}"></i>
            </button>

            <!-- Price Badge on Card Image Bottom -->
            <div class="absolute bottom-2.5 right-2.5 z-10">
              ${isFree ? `
                <div class="pulse-free px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 flex items-center gap-1 border border-emerald-400">
                  <i data-lucide="gift" class="w-3.5 h-3.5"></i>
                  <span>FREE DONATION</span>
                </div>
              ` : `
                <div class="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-900/90 dark:bg-indigo-600/95 text-white shadow-lg backdrop-blur-md flex items-center gap-0.5 border border-white/20">
                  <span>₹${item.price}</span>
                </div>
              `}
            </div>

            <!-- Semester Pill on Bottom Left -->
            <div class="absolute bottom-2.5 left-2.5 z-10">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white shadow-md">
                Semester ${item.semester}
              </span>
            </div>
          </div>

          <!-- Card Content Body -->
          <div class="p-4 sm:p-5 flex-1 flex flex-col justify-between">
            
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${condClass}">
                  <span>${stars}</span>
                  <span>${item.condition}</span>
                </span>
                <span class="text-[11px] text-slate-400 font-medium">Sem ${item.semester} • ${item.branch}</span>
              </div>

              <h3 
                onclick="window.CampusApp.openDetails('${item.id}')"
                class="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-2 hover:text-brand-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                title="${escapeHtml(item.title)}"
              >
                ${escapeHtml(item.title)}
              </h3>

              <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                ${escapeHtml(item.description)}
              </p>
            </div>

            <!-- Seller Preview & Action -->
            <div class="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700/60">
              
              <div class="flex items-center justify-between text-xs mb-3">
                <div class="flex items-center gap-2 min-w-0">
                  <div class="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold flex items-center justify-center text-[10px] shrink-0">
                    ${item.seller.name.charAt(0)}
                  </div>
                  <span class="font-medium text-slate-700 dark:text-slate-300 truncate" title="${escapeHtml(item.seller.name)}">
                    ${escapeHtml(item.seller.name)}
                  </span>
                </div>
                <span class="text-[11px] text-slate-400 shrink-0">
                  <i data-lucide="map-pin" class="w-3 h-3 inline text-slate-400 -mt-0.5"></i>
                  ${item.seller.hostel.split(',')[0]}
                </span>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <button 
                  type="button" 
                  onclick="window.CampusApp.openDetails('${item.id}')"
                  class="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-650 text-slate-800 dark:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <i data-lucide="info" class="w-3.5 h-3.5"></i>
                  <span>Details</span>
                </button>

                <button 
                  type="button" 
                  onclick="window.CampusApp.quickContact('${item.id}')"
                  class="w-full py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <i data-lucide="message-square" class="w-3.5 h-3.5"></i>
                  <span>Contact</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      `;
    }).join('');

    lucide.createIcons();
  }

  // ================= DETAILS MODAL =================
  function openDetails(itemId) {
    const item = state.items.find(it => it.id === itemId);
    if (!item) return;

    state.activeDetailItem = item;
    item.views = (item.views || 0) + 1;
    saveItemsToStorage();

    const modal = document.getElementById('details-modal');
    const imgEl = document.getElementById('detail-image');
    const catBadge = document.getElementById('detail-category-badge');
    const branchBadge = document.getElementById('detail-branch-badge');
    const semBadge = document.getElementById('detail-semester-badge');
    const priceBadge = document.getElementById('detail-price-badge');
    const titleEl = document.getElementById('detail-title');
    const viewsEl = document.getElementById('detail-views');
    const dateEl = document.getElementById('detail-posted-date');
    const descEl = document.getElementById('detail-description');

    const condPill = document.getElementById('detail-condition-pill');
    const condStars = document.getElementById('detail-condition-stars');
    const condDesc = document.getElementById('detail-condition-desc');
    const condBox = document.getElementById('detail-condition-box');

    const sellerName = document.getElementById('detail-seller-name');
    const sellerAvatar = document.getElementById('detail-seller-avatar');
    const sellerBadge = document.getElementById('detail-seller-badge');
    const sellerYear = document.getElementById('detail-seller-year');
    const sellerHostel = document.getElementById('detail-seller-hostel');
    const sellerTiming = document.getElementById('detail-seller-timing');

    const waBtn = document.getElementById('detail-whatsapp-btn');
    const callBtn = document.getElementById('detail-call-btn');
    const inAppBtn = document.getElementById('detail-in-app-msg-btn');
    const bkmkBtn = document.getElementById('detail-bookmark-btn');

    imgEl.src = item.photo || SVG_PLACEHOLDERS[item.category] || SVG_PLACEHOLDERS.textbook;
    catBadge.textContent = CATEGORY_MAP[item.category]?.name || item.category;
    branchBadge.textContent = item.branch;
    semBadge.textContent = `Semester ${item.semester}`;

    if (item.price === 0) {
      priceBadge.className = 'px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-500 text-white shadow-lg flex items-center gap-1';
      priceBadge.innerHTML = '🎁 FREE DONATION';
    } else {
      priceBadge.className = 'px-3.5 py-1.5 rounded-full text-xs font-black bg-slate-900 text-white shadow-lg';
      priceBadge.textContent = `₹${item.price} (Max Cap ₹300)`;
    }

    titleEl.textContent = item.title;
    viewsEl.textContent = `${item.views} campus views`;
    dateEl.textContent = item.postedAt || 'Recently';
    descEl.textContent = item.description;

    const condDetails = CONDITION_INFO[item.condition] || CONDITION_INFO['Gently Used'];
    condPill.textContent = item.condition;
    condPill.className = `text-xs font-bold px-2.5 py-0.5 rounded-full ${condDetails.color}`;
    condStars.textContent = condDetails.stars;
    condDesc.textContent = condDetails.description;
    condBox.className = `p-4 rounded-2xl border ${condDetails.pillClass}`;

    sellerName.textContent = item.seller.name;
    sellerAvatar.textContent = item.seller.name.charAt(0);
    sellerBadge.textContent = item.seller.badge || 'Verified Senior';
    sellerYear.textContent = item.seller.year || `${item.branch} Senior`;
    sellerHostel.textContent = item.seller.hostel || 'Campus Hostel';
    sellerTiming.textContent = item.seller.availability || 'Available after classes';

    const messageText = `Hi ${item.seller.name}, I found your listing '${item.title}' on CampusExchange (Sem ${item.semester} / ${item.branch}). Is it still available to collect on campus?`;
    waBtn.href = `https://wa.me/${item.seller.whatsapp}?text=${encodeURIComponent(messageText)}`;
    callBtn.href = `tel:${item.seller.phone}`;

    inAppBtn.onclick = () => {
      closeDetailsModal();
      openChatModal(item);
    };

    updateDetailBookmarkButton(item.id);

    bkmkBtn.onclick = () => {
      toggleBookmark(item.id);
      updateDetailBookmarkButton(item.id);
    };

    modal.classList.remove('hidden');
    lucide.createIcons();
  }

  function updateDetailBookmarkButton(itemId) {
    const bkmkBtn = document.getElementById('detail-bookmark-btn');
    const bkmkText = document.getElementById('detail-bookmark-text');
    const isSaved = state.savedIds.has(itemId);
    if (isSaved) {
      bkmkBtn.classList.add('bg-rose-50', 'text-rose-600', 'border-rose-300');
      bkmkText.textContent = 'Saved in Wishlist ✓';
    } else {
      bkmkBtn.classList.remove('bg-rose-50', 'text-rose-600', 'border-rose-300');
      bkmkText.textContent = 'Save to Wishlist';
    }
  }

  function closeDetailsModal() {
    const modal = document.getElementById('details-modal');
    modal.classList.add('hidden');
    state.activeDetailItem = null;
  }

  // ================= POST YOUR ITEM MODAL & LOGIC =================
  function openPostModal() {
    const modal = document.getElementById('post-modal');
    modal.classList.remove('hidden');
    resetPostForm();
    lucide.createIcons();
  }

  function closePostModal() {
    const modal = document.getElementById('post-modal');
    modal.classList.add('hidden');
    resetPostForm();
  }

  function resetPostForm() {
    const form = document.getElementById('post-item-form');
    if (form) form.reset();
    state.uploadedPhotoBase64 = null;
    
    const dropPrompt = document.getElementById('dropzone-prompt');
    const previewContainer = document.getElementById('photo-preview-container');
    const previewImg = document.getElementById('photo-preview-img');
    if (dropPrompt) dropPrompt.classList.remove('hidden');
    if (previewContainer) previewContainer.classList.add('hidden');
    if (previewImg) previewImg.src = '';

    const paidInputContainer = document.getElementById('post-price-input-container');
    if (paidInputContainer) paidInputContainer.classList.add('hidden');

    document.querySelectorAll('.post-condition-card').forEach(card => {
      card.classList.remove('active', 'border-brand-500', 'bg-brand-50');
      if (card.dataset.condition === 'Gently Used') {
        card.classList.add('active', 'border-brand-500', 'bg-brand-50');
      }
    });
    document.getElementById('post-condition-val').value = 'Gently Used';

    document.querySelectorAll('.post-sem-btn').forEach(btn => {
      btn.classList.remove('active', 'bg-brand-600', 'text-white', 'border-brand-600');
      if (btn.dataset.sem === '1') {
        btn.classList.add('active', 'bg-brand-600', 'text-white', 'border-brand-600');
      }
    });
    document.getElementById('post-semester-val').value = '1';
  }

  function handlePhotoUpload(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file (PNG, JPG, etc.)', 'warning');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size is too large (max 5MB)', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      state.uploadedPhotoBase64 = e.target.result;
      const dropPrompt = document.getElementById('dropzone-prompt');
      const previewContainer = document.getElementById('photo-preview-container');
      const previewImg = document.getElementById('photo-preview-img');

      if (dropPrompt) dropPrompt.classList.add('hidden');
      if (previewContainer) previewContainer.classList.remove('hidden');
      if (previewImg) previewImg.src = state.uploadedPhotoBase64;
      showToast('Photo uploaded successfully!', 'success');
    };
    reader.readAsDataURL(file);
  }

  function handlePostFormSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('post-title').value.trim();
    const category = document.getElementById('post-category').value;
    const branch = document.getElementById('post-branch').value;
    const semester = parseInt(document.getElementById('post-semester-val').value, 10);
    const condition = document.getElementById('post-condition-val').value;
    const priceType = document.querySelector('input[name="post-price-type"]:checked').value;
    const description = document.getElementById('post-desc').value.trim();

    const sellerName = document.getElementById('seller-name').value.trim();
    const sellerYear = document.getElementById('seller-year').value.trim();
    const sellerPhone = document.getElementById('seller-phone').value.trim();
    const sellerEmail = document.getElementById('seller-email').value.trim();
    const sellerLocation = document.getElementById('seller-location').value.trim();

    if (!title || !category || !branch || !semester || !condition || !description || !sellerName || !sellerPhone) {
      showToast('Please complete all required fields.', 'warning');
      return;
    }

    let price = 0;
    if (priceType === 'paid') {
      const priceVal = parseFloat(document.getElementById('post-price-val').value);
      if (isNaN(priceVal) || priceVal <= 0) {
        showToast('Please enter a valid price between ₹10 and ₹300.', 'warning');
        return;
      }
      if (priceVal > 300) {
        showToast('Maximum price cap is ₹300 to keep resources student-affordable.', 'warning');
        return;
      }
      price = priceVal;
    }

    const photo = state.uploadedPhotoBase64 || SVG_PLACEHOLDERS[category] || SVG_PLACEHOLDERS.textbook;

    const newItem = {
      id: 'item-' + Date.now(),
      title,
      category,
      branch,
      semester,
      price,
      condition,
      photo,
      description,
      seller: {
        name: sellerName,
        year: sellerYear,
        badge: 'Verified Senior',
        hostel: sellerLocation || 'Campus Hostel',
        phone: sellerPhone,
        whatsapp: sellerPhone.replace(/\D/g, ''),
        email: sellerEmail || 'student@college.edu.in',
        availability: 'Available on campus'
      },
      postedAt: 'Just now',
      views: 1,
      saved: false
    };

    state.items.unshift(newItem);
    saveItemsToStorage();

    triggerCelebration();
    closePostModal();

    state.activeFilter.branch = 'ALL';
    state.activeFilter.semester = null;
    state.activeFilter.category = null;
    state.activeFilter.priceMode = 'all';
    state.activeFilter.searchQuery = '';
    renderCategories();
    applyFiltersAndRender();
    updateHeaderStats();

    showToast(`"${title}" listed successfully! Thank you for supporting fellow students!`, 'success');

    const grid = document.getElementById('items-grid');
    if (grid) grid.scrollIntoView({ behavior: 'smooth' });
  }

  // ================= IN-APP LIVE CHAT SIMULATOR =================
  function openChatModal(item) {
    const modal = document.getElementById('chat-modal');
    const avatar = document.getElementById('chat-seller-avatar');
    const nameEl = document.getElementById('chat-seller-name');
    const msgContainer = document.getElementById('chat-messages-container');

    avatar.textContent = item.seller.name.charAt(0);
    nameEl.textContent = item.seller.name;

    msgContainer.innerHTML = `
      <div class="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-slate-700 dark:text-slate-300 border border-indigo-100 dark:border-indigo-900 text-center">
        ⚡ Inquiring about <strong>${escapeHtml(item.title)}</strong> (${item.price === 0 ? 'Free Donation' : '₹' + item.price}).
      </div>
      <div class="flex items-start gap-2 max-w-[85%]">
        <div class="w-6 h-6 rounded-full bg-brand-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
          ${item.seller.name.charAt(0)}
        </div>
        <div class="p-3 rounded-2xl rounded-tl-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
          Hi! Yes, I still have the item available. Let me know if you want to inspect it at <strong>${escapeHtml(item.seller.hostel)}</strong>!
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    lucide.createIcons();

    document.querySelectorAll('.quick-chip').forEach(btn => {
      btn.onclick = () => {
        sendChatMessage(btn.textContent.trim(), item);
      };
    });

    const sendBtn = document.getElementById('send-chat-btn');
    const chatInput = document.getElementById('chat-input-text');

    sendBtn.onclick = () => {
      const text = chatInput.value.trim();
      if (text) {
        sendChatMessage(text, item);
        chatInput.value = '';
      }
    };

    chatInput.onkeydown = (e) => {
      if (e.key === 'Enter') {
        const text = chatInput.value.trim();
        if (text) {
          sendChatMessage(text, item);
          chatInput.value = '';
        }
      }
    };
  }

  function sendChatMessage(text, item) {
    const msgContainer = document.getElementById('chat-messages-container');
    
    const userMsg = document.createElement('div');
    userMsg.className = 'flex items-start justify-end gap-2 max-w-[85%] ml-auto';
    userMsg.innerHTML = `
      <div class="p-3 rounded-2xl rounded-tr-none bg-brand-600 text-white shadow-sm">
        ${escapeHtml(text)}
      </div>
    `;
    msgContainer.appendChild(userMsg);
    msgContainer.scrollTop = msgContainer.scrollHeight;

    setTimeout(() => {
      const seniorReplies = [
        `Sounds great! I'm free today after 5:30 PM. You can ping me on WhatsApp (${item.seller.phone}) or meet at ${item.seller.hostel.split(',')[0]}.`,
        `Sure! All parts and calibrations are fully intact as described. Bring your bag and we can test it together!`,
        `Perfect! I've reserved it for you. See you around the campus library!`
      ];
      const randomReply = seniorReplies[Math.floor(Math.random() * seniorReplies.length)];

      const replyEl = document.createElement('div');
      replyEl.className = 'flex items-start gap-2 max-w-[85%]';
      replyEl.innerHTML = `
        <div class="w-6 h-6 rounded-full bg-brand-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
          ${item.seller.name.charAt(0)}
        </div>
        <div class="p-3 rounded-2xl rounded-tl-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
          ${randomReply}
        </div>
      `;
      msgContainer.appendChild(replyEl);
      msgContainer.scrollTop = msgContainer.scrollHeight;
    }, 1000);
  }

  function closeChatModal() {
    const modal = document.getElementById('chat-modal');
    modal.classList.add('hidden');
  }

  // ================= BOOKMARKS / WISHLIST SYSTEM =================
  function toggleBookmark(itemId) {
    if (state.savedIds.has(itemId)) {
      state.savedIds.delete(itemId);
      showToast('Removed from saved items', 'info');
    } else {
      state.savedIds.add(itemId);
      showToast('Saved to your Wishlist!', 'success');
    }
    saveBookmarksToStorage();
    updateBookmarksBadge();
    applyFiltersAndRender();
    renderBookmarksDrawer();
  }

  function updateBookmarksBadge() {
    const badge = document.getElementById('saved-badge-count');
    const count = state.savedIds.size;
    if (count > 0) {
      badge.textContent = count;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  function openBookmarksDrawer() {
    const drawer = document.getElementById('bookmarks-drawer');
    drawer.classList.remove('hidden');
    renderBookmarksDrawer();
    lucide.createIcons();
  }

  function closeBookmarksDrawer() {
    const drawer = document.getElementById('bookmarks-drawer');
    drawer.classList.add('hidden');
  }

  function renderBookmarksDrawer() {
    const list = document.getElementById('bookmarks-list');
    const savedItems = state.items.filter(it => state.savedIds.has(it.id));

    if (savedItems.length === 0) {
      list.innerHTML = `
        <div class="py-12 text-center text-slate-400">
          <i data-lucide="bookmark-x" class="w-12 h-12 mx-auto mb-2 opacity-50"></i>
          <p class="text-sm font-semibold text-slate-600 dark:text-slate-300">No saved items yet</p>
          <p class="text-xs text-slate-400 mt-1">Click the bookmark icon on any resource card to save it here for quick access.</p>
        </div>
      `;
      return;
    }

    list.innerHTML = savedItems.map(item => `
      <div class="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 hover:border-brand-400 transition-colors">
        <img 
          src="${item.photo || SVG_PLACEHOLDERS[item.category] || SVG_PLACEHOLDERS.textbook}" 
          alt="${escapeHtml(item.title)}" 
          class="w-14 h-14 object-cover rounded-xl shrink-0"
        >
        <div class="flex-1 min-w-0">
          <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate" title="${escapeHtml(item.title)}">
            ${escapeHtml(item.title)}
          </h4>
          <div class="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
            <span>Sem ${item.semester} • ${item.branch}</span>
            <span>•</span>
            <span class="font-bold text-emerald-600 dark:text-emerald-400">${item.price === 0 ? 'FREE' : '₹' + item.price}</span>
          </div>
        </div>
        <div class="flex items-center gap-1 shrink-0">
          <button 
            onclick="window.CampusApp.openDetails('${item.id}'); window.CampusApp.closeBookmarksDrawer();"
            class="p-2 text-slate-500 hover:text-brand-600 dark:hover:text-indigo-400"
            title="View Details"
          >
            <i data-lucide="eye" class="w-4 h-4"></i>
          </button>
          <button 
            onclick="window.CampusApp.toggleBookmark('${item.id}')"
            class="p-2 text-slate-400 hover:text-rose-500"
            title="Remove"
          >
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    `).join('');

    lucide.createIcons();
  }

  // ================= EVENT LISTENERS =================
  function setupEventListeners() {
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

    const openBkmkBtn = document.getElementById('open-bookmarks-btn');
    const closeBkmkBtn = document.getElementById('close-bookmarks-btn');
    const clearAllBkmkBtn = document.getElementById('clear-all-bookmarks-btn');
    if (openBkmkBtn) openBkmkBtn.addEventListener('click', openBookmarksDrawer);
    if (closeBkmkBtn) closeBkmkBtn.addEventListener('click', closeBookmarksDrawer);
    if (clearAllBkmkBtn) {
      clearAllBkmkBtn.addEventListener('click', () => {
        state.savedIds.clear();
        saveBookmarksToStorage();
        updateBookmarksBadge();
        applyFiltersAndRender();
        renderBookmarksDrawer();
        showToast('All saved items cleared', 'info');
      });
    }

    const openPostBtn = document.getElementById('open-post-modal-btn');
    const closePostBtn = document.getElementById('close-post-modal-btn');
    const cancelPostBtn = document.getElementById('cancel-post-btn');
    const emptyPostBtn = document.getElementById('empty-post-btn');
    const postForm = document.getElementById('post-item-form');

    if (openPostBtn) openPostBtn.addEventListener('click', openPostModal);
    if (closePostBtn) closePostBtn.addEventListener('click', closePostModal);
    if (cancelPostBtn) cancelPostBtn.addEventListener('click', closePostModal);
    if (emptyPostBtn) emptyPostBtn.addEventListener('click', openPostModal);
    if (postForm) postForm.addEventListener('submit', handlePostFormSubmit);

    const closeDetailsBtn = document.getElementById('close-details-modal-btn');
    const closeDetailsFooterBtn = document.getElementById('close-modal-footer-btn');
    if (closeDetailsBtn) closeDetailsBtn.addEventListener('click', closeDetailsModal);
    if (closeDetailsFooterBtn) closeDetailsFooterBtn.addEventListener('click', closeDetailsModal);

    const closeChatBtn = document.getElementById('close-chat-modal-btn');
    if (closeChatBtn) closeChatBtn.addEventListener('click', closeChatModal);

    const navSearch = document.getElementById('nav-search-input');
    const sideSearch = document.getElementById('sidebar-search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');

    function syncSearch(query) {
      state.activeFilter.searchQuery = query;
      if (navSearch && navSearch.value !== query) navSearch.value = query;
      if (sideSearch && sideSearch.value !== query) sideSearch.value = query;
      if (clearSearchBtn) {
        clearSearchBtn.classList.toggle('hidden', query.length === 0);
      }
      applyFiltersAndRender();
    }

    if (navSearch) {
      navSearch.addEventListener('input', (e) => syncSearch(e.target.value));
    }
    if (sideSearch) {
      sideSearch.addEventListener('input', (e) => syncSearch(e.target.value));
    }
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => syncSearch(''));
    }

    const branchGroup = document.getElementById('branch-filter-group');
    if (branchGroup) {
      branchGroup.addEventListener('click', (e) => {
        const btn = e.target.closest('.branch-chip');
        if (!btn) return;
        const branch = btn.dataset.branch;
        state.activeFilter.branch = branch;

        branchGroup.querySelectorAll('.branch-chip').forEach(b => {
          b.classList.remove('active', 'bg-brand-50', 'dark:bg-brand-950/60', 'text-brand-700', 'dark:text-brand-300');
        });
        btn.classList.add('active', 'bg-brand-50', 'dark:bg-brand-950/60', 'text-brand-700', 'dark:text-brand-300');

        const indicator = document.getElementById('active-branch-indicator');
        if (indicator) indicator.textContent = branch;

        applyFiltersAndRender();
      });
    }

    const semGroup = document.getElementById('semester-filter-group');
    const clearSemBtn = document.getElementById('clear-sem-btn');
    if (semGroup) {
      semGroup.addEventListener('click', (e) => {
        const btn = e.target.closest('.sem-btn');
        if (!btn) return;
        const sem = parseInt(btn.dataset.sem, 10);
        
        if (state.activeFilter.semester === sem) {
          state.activeFilter.semester = null;
          btn.classList.remove('active');
        } else {
          state.activeFilter.semester = sem;
          semGroup.querySelectorAll('.sem-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        }
        applyFiltersAndRender();
      });
    }
    if (clearSemBtn) {
      clearSemBtn.addEventListener('click', () => {
        state.activeFilter.semester = null;
        if (semGroup) {
          semGroup.querySelectorAll('.sem-btn').forEach(b => b.classList.remove('active'));
        }
        applyFiltersAndRender();
      });
    }

    const priceQuickGroup = document.getElementById('price-quick-filter-group');
    const priceSlider = document.getElementById('price-range-slider');
    const priceSliderDisplay = document.getElementById('price-slider-display');

    if (priceQuickGroup) {
      priceQuickGroup.addEventListener('click', (e) => {
        const btn = e.target.closest('.price-pill');
        if (!btn) return;
        const mode = btn.dataset.priceMode;
        state.activeFilter.priceMode = mode;

        priceQuickGroup.querySelectorAll('.price-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (mode === 'free') {
          state.activeFilter.maxPrice = 0;
          if (priceSlider) priceSlider.value = 0;
          if (priceSliderDisplay) priceSliderDisplay.textContent = 'Free (₹0) Only';
        } else if (mode === 'under150') {
          state.activeFilter.maxPrice = 150;
          if (priceSlider) priceSlider.value = 150;
          if (priceSliderDisplay) priceSliderDisplay.textContent = 'Under ₹150';
        } else {
          state.activeFilter.maxPrice = 300;
          if (priceSlider) priceSlider.value = 300;
          if (priceSliderDisplay) priceSliderDisplay.textContent = 'Max ₹300';
        }

        applyFiltersAndRender();
      });
    }

    if (priceSlider) {
      priceSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        state.activeFilter.maxPrice = val;
        state.activeFilter.priceMode = val === 0 ? 'free' : 'all';

        if (priceSliderDisplay) {
          priceSliderDisplay.textContent = val === 0 ? 'Free (₹0) Only' : `Max ₹${val}`;
        }
        applyFiltersAndRender();
      });
    }

    const condCheckboxes = document.querySelectorAll('.condition-checkbox');
    condCheckboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        const checked = Array.from(condCheckboxes).filter(c => c.checked).map(c => c.value);
        state.activeFilter.conditions = checked;
        applyFiltersAndRender();
      });
    });

    document.addEventListener('click', (e) => {
      const chip = e.target.closest('.category-chip');
      if (chip && chip.dataset.cat) {
        const cat = chip.dataset.cat;
        state.activeFilter.category = cat === 'ALL' ? null : cat;
        renderCategories();
        applyFiltersAndRender();
      }
    });

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        state.activeFilter.sortBy = e.target.value;
        applyFiltersAndRender();
      });
    }

    const resetAllBtn = document.getElementById('reset-all-filters-btn');
    const emptyResetBtn = document.getElementById('empty-reset-btn');
    const resetFn = () => {
      state.activeFilter = {
        branch: 'ALL',
        semester: null,
        priceMode: 'all',
        maxPrice: 300,
        category: null,
        conditions: [],
        searchQuery: '',
        sortBy: 'featured'
      };

      syncSearch('');
      if (branchGroup) {
        branchGroup.querySelectorAll('.branch-chip').forEach(b => {
          b.classList.toggle('active', b.dataset.branch === 'ALL');
        });
      }
      if (semGroup) {
        semGroup.querySelectorAll('.sem-btn').forEach(b => b.classList.remove('active'));
      }
      if (priceQuickGroup) {
        priceQuickGroup.querySelectorAll('.price-pill').forEach(b => {
          b.classList.toggle('active', b.dataset.priceMode === 'all');
        });
      }
      if (priceSlider) priceSlider.value = 300;
      if (priceSliderDisplay) priceSliderDisplay.textContent = 'Max ₹300';
      condCheckboxes.forEach(cb => cb.checked = false);
      if (sortSelect) sortSelect.value = 'featured';

      renderCategories();
      applyFiltersAndRender();
      showToast('All filters reset', 'info');
    };

    if (resetAllBtn) resetAllBtn.addEventListener('click', resetFn);
    if (emptyResetBtn) emptyResetBtn.addEventListener('click', resetFn);

    const mobFilterBtn = document.getElementById('mobile-filter-btn');
    const sidebar = document.getElementById('filter-sidebar');
    if (mobFilterBtn && sidebar) {
      mobFilterBtn.addEventListener('click', () => {
        sidebar.classList.toggle('hidden');
        sidebar.scrollIntoView({ behavior: 'smooth' });
      });
    }

    const dropzone = document.getElementById('photo-dropzone');
    const fileInput = document.getElementById('post-photo-file');
    const removePhotoBtn = document.getElementById('remove-photo-btn');

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          handlePhotoUpload(e.target.files[0]);
        }
      });
    }

    if (dropzone) {
      ['dragenter', 'dragover'].forEach(name => {
        dropzone.addEventListener(name, (e) => {
          e.preventDefault();
          dropzone.classList.add('dragover');
        });
      });
      ['dragleave', 'drop'].forEach(name => {
        dropzone.addEventListener(name, (e) => {
          e.preventDefault();
          dropzone.classList.remove('dragover');
        });
      });
      dropzone.addEventListener('drop', (e) => {
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handlePhotoUpload(e.dataTransfer.files[0]);
        }
      });
    }

    if (removePhotoBtn) {
      removePhotoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        state.uploadedPhotoBase64 = null;
        document.getElementById('photo-preview-container').classList.add('hidden');
        document.getElementById('dropzone-prompt').classList.remove('hidden');
        document.getElementById('post-photo-file').value = '';
      });
    }

    const priceRadios = document.querySelectorAll('input[name="post-price-type"]');
    const priceInputWrap = document.getElementById('post-price-input-container');
    priceRadios.forEach(r => {
      r.addEventListener('change', (e) => {
        if (e.target.value === 'paid') {
          priceInputWrap.classList.remove('hidden');
        } else {
          priceInputWrap.classList.add('hidden');
        }
      });
    });

    const postSemPicker = document.getElementById('post-semester-picker');
    if (postSemPicker) {
      postSemPicker.addEventListener('click', (e) => {
        const btn = e.target.closest('.post-sem-btn');
        if (!btn) return;
        postSemPicker.querySelectorAll('.post-sem-btn').forEach(b => {
          b.classList.remove('active', 'bg-brand-600', 'text-white', 'border-brand-600');
        });
        btn.classList.add('active', 'bg-brand-600', 'text-white', 'border-brand-600');
        document.getElementById('post-semester-val').value = btn.dataset.sem;
      });
    }

    const postCondPicker = document.getElementById('post-condition-picker');
    if (postCondPicker) {
      postCondPicker.addEventListener('click', (e) => {
        const card = e.target.closest('.post-condition-card');
        if (!card) return;
        postCondPicker.querySelectorAll('.post-condition-card').forEach(c => {
          c.classList.remove('active', 'border-brand-500', 'bg-brand-50');
        });
        card.classList.add('active', 'border-brand-500', 'bg-brand-50');
        document.getElementById('post-condition-val').value = card.dataset.condition;
      });
    }

    const footerResetBtn = document.getElementById('footer-clear-data-btn');
    if (footerResetBtn) {
      footerResetBtn.addEventListener('click', () => {
        if (confirm('Reset to initial campus resource listings? Your created test listings will be refreshed.')) {
          localStorage.removeItem(STORAGE_ITEMS_KEY);
          localStorage.removeItem(STORAGE_SAVED_KEY);
          location.reload();
        }
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeDetailsModal();
        closePostModal();
        closeBookmarksDrawer();
        closeChatModal();
      }
    });

    [
      { id: 'details-modal', fn: closeDetailsModal },
      { id: 'post-modal', fn: closePostModal },
      { id: 'chat-modal', fn: closeChatModal },
      { id: 'bookmarks-drawer', fn: closeBookmarksDrawer }
    ].forEach(({ id, fn }) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', (e) => {
          if (e.target === el) fn();
        });
      }
    });
  }

  // ================= UI HELPERS =================
  function updateFilterIndicators(count) {
    const activePillsWrap = document.getElementById('active-tag-pills');
    const f = state.activeFilter;
    const pills = [];

    if (f.branch !== 'ALL') {
      pills.push(`Branch: ${f.branch}`);
    }
    if (f.semester !== null) {
      pills.push(`Sem ${f.semester}`);
    }
    if (f.category !== null) {
      pills.push(CATEGORY_MAP[f.category]?.name || f.category);
    }
    if (f.priceMode === 'free') {
      pills.push('Free Donations Only');
    } else if (f.maxPrice < 300) {
      pills.push(`≤ ₹${f.maxPrice}`);
    }
    if (f.conditions.length > 0) {
      pills.push(f.conditions.join(', '));
    }
    if (f.searchQuery) {
      pills.push(`"${f.searchQuery}"`);
    }

    if (activePillsWrap) {
      if (pills.length > 0) {
        activePillsWrap.innerHTML = pills.map(p => `
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-slate-700 text-brand-700 dark:text-indigo-300 border border-indigo-200 dark:border-slate-600">
            ${escapeHtml(p)}
          </span>
        `).join('');
        activePillsWrap.classList.remove('hidden');
      } else {
        activePillsWrap.classList.add('hidden');
      }
    }
  }

  function updateHeaderStats() {
    const totalEl = document.getElementById('stat-total-items');
    const freeEl = document.getElementById('stat-free-items');
    if (totalEl) totalEl.textContent = state.items.length;
    if (freeEl) {
      const freeCount = state.items.filter(it => it.price === 0).length;
      freeEl.textContent = `${freeCount} Free`;
    }
  }

  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const bgColors = {
      success: 'bg-emerald-600 text-white',
      warning: 'bg-amber-600 text-white',
      info: 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900',
      error: 'bg-rose-600 text-white'
    };

    const icons = {
      success: 'check-circle-2',
      warning: 'alert-triangle',
      info: 'info',
      error: 'x-circle'
    };

    toast.className = `toast px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold ${bgColors[type] || bgColors.info}`;
    toast.innerHTML = `
      <i data-lucide="${icons[type] || 'info'}" class="w-4 h-4 shrink-0"></i>
      <span>${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);
    lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  function triggerCelebration() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ================= EXPOSE TO GLOBAL SCOPE =================
  window.CampusApp = {
    openDetails,
    closeDetailsModal,
    quickContact: (itemId) => {
      const item = state.items.find(it => it.id === itemId);
      if (item) openChatModal(item);
    },
    toggleBookmark,
    openBookmarksDrawer,
    closeBookmarksDrawer
  };

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
