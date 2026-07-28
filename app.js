/* ============================================
   ProcurePilot AI – Main Application
   Single-Page Application Router + All Views
   Updated with Indian Rupee (₹), Dijkstra Route Optimization & Smart Inventory
   ============================================ */

'use strict';

// =============================================
// STATE MANAGEMENT
// =============================================
const State = {
  currentPage: 'landing',
  currentRole: null, // 'buyer' | 'seller'
  theme: 'light',
  cart: [],
  compareList: [],
  wishlist: [],
  chatOpen: false,
  chatMessages: [],
  searchQuery: '',
  filters: { priceMax: 500000, category: '', brand: '', inStock: false, nearbyOnly: false },
  currentProduct: null,
  currentOrder: null,
  activeTab: 0,
  notifications: 4,
  selectedMapStart: 'Peenya Industrial Hub',
  selectedMapEnd: 'Bangalore Central Hub',
};

// =============================================
// ROUTER
// =============================================
const Router = {
  navigate(page, params = {}) {
    State.currentPage = page;
    Object.assign(State, params);
    render();
    window.scrollTo(0, 0);
  }
};

// =============================================
// UTILITIES & CURRENCY FORMATTER
// =============================================
function formatPrice(p) {
  if (typeof p !== 'number') return '₹0';
  return '₹' + p.toLocaleString('en-IN');
}

function getConfidenceClass(score) {
  if (score >= 90) return 'confidence-high';
  if (score >= 75) return 'confidence-med';
  return 'confidence-low';
}

function getStars(rating) {
  const full = Math.floor(rating); const half = rating % 1 >= 0.5 ? 1 : 0;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - half);
}

function getSeller(id) {
  return (window.APP_DATA.SELLERS || []).find(s => s.id === id) || {};
}

function addToCart(product) {
  const ex = State.cart.find(i => i.id === product.id);
  if (ex) ex.qty++; else State.cart.push({ ...product, qty: product.minOrder || 1 });
  showToast('Added to cart: ' + product.name, 'success');
  updateCartBadge();
}

function toggleWishlist(productId) {
  const idx = State.wishlist.indexOf(productId);
  if (idx > -1) State.wishlist.splice(idx, 1); else State.wishlist.push(productId);
}

function addToCompare(product) {
  if (State.compareList.length >= 4) { showToast('Max 4 products for comparison', 'warning'); return; }
  if (!State.compareList.find(p => p.id === product.id)) { State.compareList.push(product); showToast('Added to comparison', 'info'); }
}

function updateCartBadge() {
  const el = document.getElementById('cart-badge');
  if (el) { el.textContent = State.cart.length; el.style.display = State.cart.length ? 'block' : 'none'; }
}

function showToast(msg, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container') || (() => {
    const c = document.createElement('div'); c.id = 'toast-container'; c.className = 'toast-container'; document.body.appendChild(c); return c;
  })();
  const icons = { success: '✅', warning: '⚠️', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

// =============================================
// DIJKSTRA ALGORITHM FOR ROUTE OPTIMIZATION
// =============================================
function runDijkstra(startNodeId, endNodeId) {
  const graph = window.APP_DATA.DELIVERY_GRAPH;
  const nodes = graph.nodes.map(n => n.id);
  const distances = {};
  const hoursMap = {};
  const previous = {};
  const unvisited = new Set(nodes);

  nodes.forEach(n => {
    distances[n] = Infinity;
    hoursMap[n] = Infinity;
    previous[n] = null;
  });

  distances[startNodeId] = 0;
  hoursMap[startNodeId] = 0;

  // Build adjacency list
  const adj = {};
  nodes.forEach(n => adj[n] = []);
  graph.edges.forEach(([u, v, km, hrs]) => {
    adj[u].push({ node: v, km, hrs });
    adj[v].push({ node: u, km, hrs });
  });

  while (unvisited.size > 0) {
    let current = null;
    unvisited.forEach(n => {
      if (current === null || distances[n] < distances[current]) {
        current = n;
      }
    });

    if (current === null || distances[current] === Infinity) break;
    if (current === endNodeId) break;

    unvisited.delete(current);

    adj[current].forEach(neighbor => {
      if (unvisited.has(neighbor.node)) {
        const altKm = distances[current] + neighbor.km;
        const altHrs = hoursMap[current] + neighbor.hrs;
        if (altKm < distances[neighbor.node]) {
          distances[neighbor.node] = altKm;
          hoursMap[neighbor.node] = altHrs;
          previous[neighbor.node] = current;
        }
      }
    });
  }

  // Reconstruct path
  const path = [];
  let curr = endNodeId;
  while (curr !== null) {
    path.unshift(curr);
    curr = previous[curr];
  }

  const distKm = distances[endNodeId] !== Infinity ? distances[endNodeId] : 35;
  const hrs = hoursMap[endNodeId] !== Infinity ? Math.round(hoursMap[endNodeId] * 10) / 10 : 1.2;

  return {
    path: path.length > 1 ? path : [startNodeId, endNodeId],
    totalDistanceKm: distKm,
    totalHours: hrs,
    effectiveDeliveryDays: Math.max(1, Math.ceil(hrs / 10))
  };
}

// =============================================
// SMART INVENTORY ANALYZER
// =============================================
function analyzeSmartInventory(product) {
  const safetyStock = product.safetyStock || 20;
  const leadTime = product.leadTimeDays || 3;
  const dailyVelocity = product.dailySalesVelocity || 5;
  const rop = (dailyVelocity * leadTime) + safetyStock; // Reorder Point
  const currentStock = product.stock;

  let status = 'optimal'; // 'low_stock' | 'overstock' | 'optimal'
  let alertType = 'badge-green';
  let statusText = 'Optimal Stock';
  let suggestion = 'Stock levels are balanced based on 30-day demand forecast.';
  let suggestedReorderQty = 0;

  if (currentStock <= rop) {
    status = 'low_stock';
    alertType = 'badge-red';
    statusText = 'Low Stock Alert';
    suggestedReorderQty = Math.max(50, Math.ceil((rop * 2.5) - currentStock));
    suggestion = `⚠️ Reorder Point (${rop} units) breached! Restock ${suggestedReorderQty} units immediately to prevent stockouts during lead time (${leadTime} days).`;
  } else if (currentStock > (rop * 2.8)) {
    status = 'overstock';
    alertType = 'badge-amber';
    statusText = 'Overstock Warning';
    suggestion = `💡 Stock (${currentStock} units) exceeds 90-day demand forecast. Recommend applying a 10-15% promotional discount to liquidate excess capital.`;
  }

  return { rop, status, alertType, statusText, suggestion, suggestedReorderQty };
}

// =============================================
// RENDER ENGINE
// =============================================
function render() {
  const app = document.getElementById('app');
  const page = State.currentPage;

  document.querySelectorAll('.ai-chat-toggle, .ai-chat-panel').forEach(e => e.remove());

  let html = '';
  switch (page) {
    case 'landing': html = renderLanding(); break;
    case 'buyer-login': html = renderBuyerLogin(); break;
    case 'seller-login': html = renderSellerLogin(); break;
    case 'buyer-dashboard': html = renderWithShell(renderBuyerDashboard(), 'buyer', 'dashboard'); break;
    case 'buyer-search': html = renderWithShell(renderSearch(), 'buyer', 'search'); break;
    case 'buyer-product': html = renderWithShell(renderProductDetail(), 'buyer', 'search'); break;
    case 'buyer-compare': html = renderWithShell(renderCompare(), 'buyer', 'compare'); break;
    case 'buyer-cart': html = renderWithShell(renderCart(), 'buyer', 'cart'); break;
    case 'buyer-rfq': html = renderWithShell(renderRFQ(), 'buyer', 'rfq'); break;
    case 'buyer-approvals': html = renderWithShell(renderApprovals(), 'buyer', 'approvals'); break;
    case 'buyer-orders': html = renderWithShell(renderOrders(), 'buyer', 'orders'); break;
    case 'buyer-recommendations': html = renderWithShell(renderRecommendations(), 'buyer', 'recommendations'); break;
    case 'buyer-location': html = renderWithShell(renderLocation(), 'buyer', 'location'); break;
    case 'seller-dashboard': html = renderWithShell(renderSellerDashboard(), 'seller', 'seller-dashboard'); break;
    case 'seller-products': html = renderWithShell(renderSellerProducts(), 'seller', 'seller-products'); break;
    case 'seller-inventory': html = renderWithShell(renderSellerInventory(), 'seller', 'seller-inventory'); break;
    case 'seller-pricing': html = renderWithShell(renderSellerPricing(), 'seller', 'seller-pricing'); break;
    case 'seller-analytics': html = renderWithShell(renderSellerAnalytics(), 'seller', 'seller-analytics'); break;
    case 'seller-rfq': html = renderWithShell(renderSellerRFQ(), 'seller', 'seller-rfq'); break;
    default: html = renderLanding();
  }

  app.innerHTML = html;
  bindEvents();
  applyTheme();

  if (page !== 'landing' && !page.includes('login')) {
    injectAIChat();
  }

  if (page === 'seller-analytics' || page === 'seller-dashboard') {
    setTimeout(initCharts, 100);
  }

  setTimeout(animateNumbers, 200);
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', State.theme);
}

// =============================================
// APP SHELL
// =============================================
function renderWithShell(content, role, activeItem) {
  const { BUYER, SELLER_USER } = window.APP_DATA;
  const user = role === 'buyer' ? BUYER : SELLER_USER;
  const cartCount = State.cart.length;

  const buyerNav = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard', badge: null },
    { id: 'search', icon: '🔍', label: 'Product Search', badge: null },
    { id: 'recommendations', icon: '✨', label: 'AI Recommendations', badge: 'NEW' },
    { id: 'compare', icon: '⚖️', label: 'Compare Suppliers', badge: null },
    { id: 'location', icon: '📍', label: 'Route & Location', badge: 'Dijkstra' },
    { id: 'cart', icon: '🛒', label: 'Smart Cart', badge: cartCount || null },
    { id: 'rfq', icon: '📋', label: 'Request Quote', badge: null },
    { id: 'approvals', icon: '✅', label: 'Approvals', badge: 2, danger: true },
    { id: 'orders', icon: '📦', label: 'Order Tracking', badge: null },
  ];

  const sellerNav = [
    { id: 'seller-dashboard', icon: '📊', label: 'Dashboard', badge: null },
    { id: 'seller-products', icon: '🏷️', label: 'Products', badge: null },
    { id: 'seller-inventory', icon: '📦', label: 'Smart Inventory', badge: '5 Alert', danger: true },
    { id: 'seller-pricing', icon: '💰', label: 'Pricing Control', badge: null },
    { id: 'seller-analytics', icon: '📈', label: 'Analytics', badge: null },
    { id: 'seller-rfq', icon: '📋', label: 'RFQ Management', badge: 18, danger: true },
  ];

  const navItems = role === 'buyer' ? buyerNav : sellerNav;
  const roleLabel = role === 'buyer' ? 'BUYER PORTAL' : 'SELLER PORTAL';
  const prefix = role === 'buyer' ? 'buyer' : 'seller';

  return `
    <div class="app-shell">
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
          <div class="sidebar-logo-icon">🚀</div>
          <div>
            <div class="sidebar-logo-text">Procure<span>Pilot</span></div>
            <div class="sidebar-role-badge">${roleLabel}</div>
          </div>
        </div>
        <nav class="sidebar-nav">
          <div class="sidebar-section-label">Main Menu</div>
          ${navItems.map(item => `
            <div class="sidebar-item ${activeItem === item.id ? 'active' : ''}" onclick="Router.navigate('${prefix === 'buyer' ? 'buyer' : 'seller'}-${item.id.replace('seller-','')}')">
              <div class="sidebar-icon">${item.icon}</div>
              <span>${item.label}</span>
              ${item.badge ? `<span class="sidebar-badge ${item.danger ? 'sidebar-badge-danger' : ''}">${item.badge}</span>` : ''}
            </div>
          `).join('')}
          <div class="sidebar-section-label" style="margin-top:16px">Account</div>
          <div class="sidebar-item" onclick="Router.navigate('landing')">
            <div class="sidebar-icon">🏠</div>
            <span>Home</span>
          </div>
          <div class="sidebar-item" onclick="Router.navigate('landing')">
            <div class="sidebar-icon">🚪</div>
            <span>Logout</span>
          </div>
        </nav>
        <div class="sidebar-footer">
          <div class="sidebar-user">
            <div class="sidebar-avatar">${user.avatar}</div>
            <div>
              <div class="sidebar-user-name">${user.name}</div>
              <div class="sidebar-user-role">${user.role}</div>
            </div>
            <span class="sidebar-user-arrow">›</span>
          </div>
        </div>
      </aside>

      <div class="main-content">
        <header class="topbar">
          <div style="display:flex;align-items:center;gap:10px;flex:1">
            <div class="topbar-search">
              <span>🔍</span>
              <input type="text" placeholder="Search products, suppliers, orders in ₹..." id="topbar-search-input"
                onkeyup="handleTopbarSearch(event)" value="${State.searchQuery}">
            </div>
          </div>
          <div class="topbar-actions">
            <div class="dark-toggle ${State.theme === 'dark' ? 'on' : ''}" onclick="toggleTheme()" title="Toggle Dark Mode">
              <div class="dark-toggle-knob"></div>
            </div>
            <div class="topbar-action-btn" onclick="showNotificationsPanel()" title="Notifications">
              🔔
              <div class="topbar-notif-dot" ${State.notifications === 0 ? 'style="display:none"' : ''}></div>
            </div>
            ${role === 'buyer' ? `
              <div class="topbar-action-btn" onclick="Router.navigate('buyer-cart')" title="Cart" style="position:relative">
                🛒
                <span id="cart-badge" style="position:absolute;top:-4px;right:-4px;background:var(--accent);color:#0A2540;font-size:10px;font-weight:800;padding:1px 5px;border-radius:50px;display:${cartCount ? 'block' : 'none'}">${cartCount}</span>
              </div>
            ` : ''}
            <div class="topbar-user">
              <div class="topbar-user-avatar">${user.avatar}</div>
              <div class="topbar-user-name">${user.name.split(' ')[0]}</div>
              <span>▾</span>
            </div>
          </div>
        </header>

        <main class="page-content animate-fade-in">
          ${content}
        </main>
      </div>
    </div>
  `;
}

function handleTopbarSearch(e) {
  State.searchQuery = e.target.value;
  if (e.key === 'Enter') Router.navigate('buyer-search');
}

function toggleTheme() {
  State.theme = State.theme === 'light' ? 'dark' : 'light';
  applyTheme();
  const toggle = document.querySelector('.dark-toggle');
  if (toggle) toggle.classList.toggle('on', State.theme === 'dark');
}

function showNotificationsPanel() {
  const existing = document.getElementById('notif-panel');
  if (existing) { existing.remove(); return; }
  State.notifications = 0;
  const el = document.createElement('div');
  el.id = 'notif-panel';
  el.style.cssText = 'position:fixed;top:72px;right:20px;z-index:9000;background:var(--bg-card);border:1px solid var(--border);border-radius:16px;width:360px;box-shadow:var(--shadow-xl);padding:20px;animation:fadeInDown 0.2s ease';
  el.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <div style="font-size:16px;font-weight:800">Notifications</div>
      <div style="font-size:12px;color:var(--accent);cursor:pointer" onclick="document.getElementById('notif-panel').remove()">Mark all read ✕</div>
    </div>
    ${[
      { icon: '💰', title: 'Price Drop Alert', desc: 'Industrial Laptop Pro dropped 10% — now ₹68,000', time: '2 min ago', type: 'amber', unread: true },
      { icon: '📦', title: 'Stock Alert', desc: 'Ergonomic Chairs low stock at GreenSpace', time: '15 min ago', type: 'red', unread: true },
      { icon: '✅', title: 'Approval Complete', desc: 'Order #ORD-2025-104 approved by Finance', time: '1 hr ago', type: 'green', unread: true },
      { icon: '⚡', title: 'Dijkstra Route Update', desc: 'Shortest route recalculated: 14km via Peenya', time: '3 hrs ago', type: 'blue', unread: false },
    ].map(n => `
      <div class="notification-item ${n.unread ? 'notif-unread' : ''}">
        <div class="notif-icon" style="background:rgba(${n.type==='amber'?'245,158,11':n.type==='red'?'239,68,68':n.type==='green'?'16,185,129':'59,130,246'},0.1)">${n.icon}</div>
        <div class="notif-content">
          <div class="notif-title">${n.title}</div>
          <div class="notif-desc">${n.desc}</div>
          <div class="notif-time">${n.time}</div>
        </div>
      </div>
    `).join('')}
  `;
  document.body.appendChild(el);
  document.addEventListener('click', (e) => { if (!el.contains(e.target)) el.remove(); }, { once: true });
}

// =============================================
// AI CHAT
// =============================================
function injectAIChat() {
  const { AI_RESPONSES } = window.APP_DATA;

  if (State.chatMessages.length === 0) {
    State.chatMessages = [{
      role: 'ai',
      text: '👋 Hi! I\'m your AI Procurement Copilot. I can help you find products, compare suppliers, optimize delivery routes using Dijkstra\'s algorithm, and manage pricing in ₹.'
    }];
  }

  const toggleBtn = document.createElement('div');
  toggleBtn.className = 'ai-chat-toggle';
  toggleBtn.innerHTML = '🤖';
  toggleBtn.onclick = toggleChat;
  document.body.appendChild(toggleBtn);

  const panel = document.createElement('div');
  panel.id = 'ai-chat-panel';
  panel.className = `ai-chat-panel ${State.chatOpen ? 'open' : ''}`;
  panel.innerHTML = `
    <div class="ai-chat-header">
      <div class="ai-chat-header-info">
        <div class="ai-avatar">🤖</div>
        <div>
          <div class="ai-chat-name">Pilot AI Assistant</div>
          <div class="ai-chat-status"><span class="ai-status-dot"></span> Online · Always ready</div>
        </div>
      </div>
      <div class="ai-chat-close" onclick="toggleChat()">✕</div>
    </div>
    <div class="ai-chat-messages" id="ai-messages">
      ${State.chatMessages.map(m => m.role === 'ai' ? `
        <div class="ai-msg">
          <div class="ai-msg-avatar">🤖</div>
          <div class="ai-msg-bubble">${m.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')}</div>
        </div>` : `
        <div class="ai-msg user-msg">
          <div class="user-msg-bubble">${m.text}</div>
        </div>`
      ).join('')}
    </div>
    <div class="ai-chat-suggestions">
      <div class="ai-suggestion-chip" onclick="sendAIMessage('Which supplier is best?')">Best supplier?</div>
      <div class="ai-suggestion-chip" onclick="sendAIMessage('Find nearby products')">Dijkstra Route</div>
      <div class="ai-suggestion-chip" onclick="sendAIMessage('Check my budget')">Budget in ₹</div>
      <div class="ai-suggestion-chip" onclick="sendAIMessage('Show highest trust score')">Top trust scores</div>
    </div>
    <div class="ai-chat-input">
      <input id="ai-input" type="text" placeholder="Ask about procurement, pricing in ₹, or routes..." onkeydown="if(event.key==='Enter')sendAIMessage()">
      <div class="ai-send-btn" onclick="sendAIMessage()">➤</div>
    </div>
  `;
  document.body.appendChild(panel);
}

function toggleChat() {
  State.chatOpen = !State.chatOpen;
  const panel = document.getElementById('ai-chat-panel');
  if (panel) panel.classList.toggle('open', State.chatOpen);
}

function sendAIMessage(preset) {
  const input = document.getElementById('ai-input');
  const msg = preset || (input ? input.value.trim() : '');
  if (!msg) return;
  if (input) input.value = '';

  const { AI_RESPONSES } = window.APP_DATA;
  State.chatMessages.push({ role: 'user', text: msg });

  const lower = msg.toLowerCase();
  let response = AI_RESPONSES.default;
  if (lower.includes('best supplier') || lower.includes('which supplier')) response = AI_RESPONSES['best supplier'];
  else if (lower.includes('cheaper') || lower.includes('alternative')) response = AI_RESPONSES['cheaper alternative'];
  else if (lower.includes('compare')) response = AI_RESPONSES['compare supplier'];
  else if (lower.includes('nearby') || lower.includes('near') || lower.includes('route') || lower.includes('dijkstra')) response = AI_RESPONSES['nearby'];
  else if (lower.includes('tomorrow') || lower.includes('next day')) response = AI_RESPONSES['tomorrow'];
  else if (lower.includes('budget') || lower.includes('spend')) response = AI_RESPONSES['budget'];
  else if (lower.includes('trust score') || lower.includes('highest trust')) response = AI_RESPONSES['trust score'];

  const msgContainer = document.getElementById('ai-messages');
  if (msgContainer) {
    const userDiv = document.createElement('div');
    userDiv.className = 'ai-msg user-msg';
    userDiv.innerHTML = `<div class="user-msg-bubble">${msg}</div>`;
    msgContainer.appendChild(userDiv);

    const typingDiv = document.createElement('div');
    typingDiv.className = 'ai-msg';
    typingDiv.innerHTML = '<div class="ai-msg-avatar">🤖</div><div class="ai-msg-bubble" style="color:var(--text-muted)">● ● ●</div>';
    msgContainer.appendChild(typingDiv);
    msgContainer.scrollTop = msgContainer.scrollHeight;

    setTimeout(() => {
      typingDiv.remove();
      State.chatMessages.push({ role: 'ai', text: response });
      const aiDiv = document.createElement('div');
      aiDiv.className = 'ai-msg';
      aiDiv.innerHTML = `<div class="ai-msg-avatar">🤖</div><div class="ai-msg-bubble">${response.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')}</div>`;
      msgContainer.appendChild(aiDiv);
      msgContainer.scrollTop = msgContainer.scrollHeight;
    }, 1000);
  }
}

// =============================================
// LANDING PAGE
// =============================================
function renderLanding() {
  return `
    <div id="landing-page">
      <nav class="landing-nav">
        <div class="nav-logo">
          <div class="nav-logo-icon">🚀</div>
          Procure<span>Pilot</span> AI
        </div>
        <div class="nav-links">
          <a href="#benefits">Features</a>
          <a href="#stats">Why Us</a>
          <a href="#testimonials">Testimonials</a>
          <a href="#cta">Get Started</a>
        </div>
        <div class="nav-cta">
          <button class="btn btn-secondary btn-sm" onclick="Router.navigate('buyer-login')">Buyer Login</button>
          <button class="btn btn-primary btn-sm" onclick="Router.navigate('seller-login')">Seller Login</button>
        </div>
      </nav>

      <section class="hero-section">
        <div class="hero-bg-orb hero-bg-orb-1"></div>
        <div class="hero-bg-orb hero-bg-orb-2"></div>
        <div class="hero-bg-orb hero-bg-orb-3"></div>
        <div class="hero-content">
          <div class="hero-left">
            <div class="hero-badge">
              <span class="badge-dot"></span>
              AI-Powered · Real-Time Dijkstra Logistics · INR Pricing (₹)
            </div>
            <h1 class="hero-title">
              AI-Powered Procurement for<br>
              <span class="gradient-text">Faster Corporate Buying</span>
            </h1>
            <p class="hero-subtitle">
              Stop switching between multiple supplier portals. ProcurePilot AI gives corporate buyers account-specific pricing in ₹, Dijkstra-optimized delivery routes, live inventory, supplier reliability scores, and smart restocking alerts.
            </p>
            <div class="hero-cta">
              <button class="btn btn-primary btn-lg" onclick="Router.navigate('buyer-login')">
                🚀 Start as Buyer
              </button>
              <button class="btn btn-secondary btn-lg" onclick="Router.navigate('seller-login')">
                🏭 Join as Seller
              </button>
            </div>
            <div class="hero-stats">
              <div class="hero-stat"><span class="hero-stat-num" data-count="200">0</span><span class="hero-stat-label">Products</span></div>
              <div class="hero-stat"><span class="hero-stat-num" data-count="10">0</span><span class="hero-stat-label">Verified Sellers</span></div>
              <div class="hero-stat"><span class="hero-stat-num" data-count="98">0</span><span class="hero-stat-label">% On-Time Delivery</span></div>
              <div class="hero-stat"><span class="hero-stat-num" data-count="60">0</span><span class="hero-stat-label">% Faster Decisions</span></div>
            </div>
          </div>
          <div class="hero-visual">
            <div class="platform-mockup">
              <div class="mockup-topbar">
                <div class="mockup-dot" style="background:#ff5f57"></div>
                <div class="mockup-dot" style="background:#ffbd2e"></div>
                <div class="mockup-dot" style="background:#28c840"></div>
                <div class="mockup-search">
                  🔍 &nbsp;Industrial laptops under ₹70,000 near Bangalore...
                </div>
              </div>
              <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:10px">🤖 Dijkstra route optimized: 14km via Peenya Hub · Best Price: ₹57,600</div>
              <div class="mockup-cards">
                ${[
                  { label: 'Pending Orders', value: '12', color: 'var(--blue)', fill: 75 },
                  { label: 'Budget Used', value: '64%', color: 'var(--accent)', fill: 64 },
                  { label: 'Trust Score', value: '98%', color: 'var(--success)', fill: 98 },
                  { label: 'Price Alerts', value: '4', color: 'var(--warning)', fill: 40 },
                ].map(c => `
                  <div class="mockup-card">
                    <div class="mockup-card-header">
                      <span class="mockup-card-title">${c.label}</span>
                      <span style="width:8px;height:8px;border-radius:50%;background:${c.color}"></span>
                    </div>
                    <div class="mockup-card-value">${c.value}</div>
                    <div class="mockup-score">
                      <div class="mockup-score-bar">
                        <div class="mockup-score-fill" style="width:${c.fill}%;background:${c.color}"></div>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
              <div style="margin-top:12px;background:rgba(0,201,167,0.1);border:1px solid rgba(0,201,167,0.25);border-radius:10px;padding:10px 12px">
                <div style="font-size:10px;color:var(--accent);font-weight:700;margin-bottom:4px">⚡ DIJKSTRA ROUTE OPTIMIZATION</div>
                <div style="font-size:12px;color:rgba(255,255,255,0.7)">TechNova Supplies (Peenya) is selected: 14km shortest path · 0.5 hr transit</div>
              </div>
            </div>
            <div class="floating-ai-bubble">
              "Found shortest delivery route via Dijkstra algorithm!"
            </div>
          </div>
        </div>
      </section>

      <section class="section section-light" id="benefits">
        <div style="max-width:1100px;margin:0 auto">
          <div class="section-header">
            <div class="section-label">Key Features</div>
            <h2 class="section-title">Everything B2B Procurement Teams Need</h2>
            <p class="section-subtitle">ProcurePilot AI unifies your entire purchasing workflow with AI decision intelligence.</p>
          </div>
          <div class="benefits-grid">
            ${[
              { icon: '🧠', title: 'AI Procurement Copilot', desc: 'Natural language search, explainable recommendations, and intelligent insights in Indian Rupees (₹).' },
              { icon: '⚡', title: 'Dijkstra Route Optimization', desc: 'Shortest path & travel time calculation algorithm for optimal seller selection and fastest fulfillment.' },
              { icon: '📦', title: 'Smart Inventory & Restocking', desc: 'Automated low-stock alerts, overstock warnings, and demand-based Reorder Point (ROP) suggestions.' },
              { icon: '🏆', title: 'Unified Supplier Comparison', desc: 'Side-by-side comparison on price (₹), confidence score, warranty, return rate, and eco-rating.' },
              { icon: '📍', title: 'Location & Warehouse Discovery', desc: 'Interactive network map mapping nearest warehouses to minimize freight cost and delivery time.' },
              { icon: '✅', title: 'Corporate Approval Workflows', desc: 'Multi-stage approval timelines (Buyer → Manager → Finance → PO) with real-time status tracking.' },
            ].map(b => `
              <div class="benefit-card">
                <div class="benefit-icon">${b.icon}</div>
                <div class="benefit-title">${b.title}</div>
                <div class="benefit-desc">${b.desc}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <section class="cta-section" id="cta">
        <div class="section-label" style="color:var(--accent)">Get Started Today</div>
        <h2 class="cta-title">Ready to transform your procurement?</h2>
        <p class="cta-subtitle">Join 500+ procurement leaders using ProcurePilot AI</p>
        <div class="cta-cards">
          <div class="cta-card">
            <div class="cta-card-icon">🛒</div>
            <div class="cta-card-title">Corporate Buyers</div>
            <div class="cta-card-desc">Compare prices in ₹, discover shortest delivery routes with Dijkstra, and purchase with high confidence.</div>
            <button class="btn btn-primary w-full" onclick="Router.navigate('buyer-login')">Login as Buyer →</button>
          </div>
          <div class="cta-card">
            <div class="cta-card-icon">🏭</div>
            <div class="cta-card-title">Suppliers & Sellers</div>
            <div class="cta-card-desc">Manage stock with AI restocking alerts, control pricing, and optimize fulfillment pipeline.</div>
            <button class="btn btn-blue w-full" onclick="Router.navigate('seller-login')">Login as Seller →</button>
          </div>
        </div>
      </section>

      <footer class="landing-footer">
        <div class="footer-logo">🚀 ProcurePilot AI</div>
        <div>Intelligent B2B Procurement Platform · Built for Modern Corporate Buyers & Sellers</div>
      </footer>
    </div>
  `;
}

// =============================================
// AUTH PAGES
// =============================================
function renderBuyerLogin() {
  return `
    <div class="auth-page">
      <div class="auth-left">
        <div class="hero-bg-orb hero-bg-orb-1"></div>
        <div class="hero-bg-orb hero-bg-orb-2"></div>
        <div class="auth-visual">
          <div style="margin-bottom:20px;cursor:pointer" onclick="Router.navigate('landing')">
            <span style="color:rgba(255,255,255,0.6);font-size:13px">← Back to Home</span>
          </div>
          <div style="font-size:40px;margin-bottom:16px">🛒</div>
          <h1 class="auth-visual-title">Welcome Back,<br><span style="background:linear-gradient(135deg,var(--accent),#00E5FF);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">Corporate Buyer</span></h1>
          <p class="auth-visual-desc">Access your procurement workspace with real-time INR pricing, Dijkstra shortest delivery routes, and AI approval workflows.</p>
        </div>
      </div>
      <div class="auth-right">
        <div class="auth-form">
          <div style="cursor:pointer;margin-bottom:28px" onclick="Router.navigate('landing')">
            <div style="display:flex;align-items:center;gap:8px;font-size:16px;font-weight:800">
              <div style="width:32px;height:32px;background:linear-gradient(135deg,var(--accent),var(--blue));border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px">🚀</div>
              ProcurePilot AI
            </div>
          </div>
          <h2 class="auth-form-title">Buyer Sign In</h2>
          <p class="auth-form-subtitle">Enter corporate credentials to access your procurement portal</p>
          <div class="form-group">
            <label class="form-label">Corporate Email</label>
            <input class="form-input" type="email" value="rahul.sharma@retailcorp.in" id="buyer-email">
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input class="form-input" type="password" value="password123" id="buyer-pass">
          </div>
          <button class="btn btn-primary w-full btn-lg" onclick="loginBuyer()" style="border-radius:10px">
            Sign In to Procurement Portal →
          </button>
          <div class="auth-switch" style="margin-top:20px">
            Are you a supplier? <a class="form-link" onclick="Router.navigate('seller-login')" style="cursor:pointer">Login as Seller →</a>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderSellerLogin() {
  return `
    <div class="auth-page">
      <div class="auth-left">
        <div class="hero-bg-orb hero-bg-orb-1"></div>
        <div class="hero-bg-orb hero-bg-orb-2"></div>
        <div class="auth-visual">
          <div style="margin-bottom:20px;cursor:pointer" onclick="Router.navigate('landing')">
            <span style="color:rgba(255,255,255,0.6);font-size:13px">← Back to Home</span>
          </div>
          <div style="font-size:40px;margin-bottom:16px">🏭</div>
          <h1 class="auth-visual-title">Seller Portal &<br><span style="background:linear-gradient(135deg,var(--blue),#60A5FA);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">Smart Inventory</span></h1>
          <p class="auth-visual-desc">Manage stock with low-stock and overstock alerts, control dynamic pricing in ₹, and respond to RFQs.</p>
        </div>
      </div>
      <div class="auth-right">
        <div class="auth-form">
          <div style="cursor:pointer;margin-bottom:28px" onclick="Router.navigate('landing')">
            <div style="display:flex;align-items:center;gap:8px;font-size:16px;font-weight:800">
              <div style="width:32px;height:32px;background:linear-gradient(135deg,var(--accent),var(--blue));border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px">🚀</div>
              ProcurePilot AI
            </div>
          </div>
          <h2 class="auth-form-title">Seller Sign In</h2>
          <p class="auth-form-subtitle">Access your seller dashboard and manage catalog</p>
          <div class="form-group">
            <label class="form-label">Business Email</label>
            <input class="form-input" type="email" value="priya@technova.in">
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input class="form-input" type="password" value="password123">
          </div>
          <button class="btn btn-blue w-full btn-lg" onclick="Router.navigate('seller-dashboard')" style="border-radius:10px">
            Sign In to Seller Portal →
          </button>
          <div class="auth-switch" style="margin-top:20px">
            Are you a buyer? <a class="form-link" onclick="Router.navigate('buyer-login')" style="cursor:pointer">Login as Buyer →</a>
          </div>
        </div>
      </div>
    </div>
  `;
}

function loginBuyer() {
  showToast('Authenticating...', 'info', 1000);
  setTimeout(() => {
    State.currentRole = 'buyer';
    Router.navigate('buyer-dashboard');
    showToast('Welcome back, Rahul! 👋', 'success');
  }, 600);
}

// =============================================
// BUYER DASHBOARD
// =============================================
function renderBuyerDashboard() {
  const { BUYER, ORDERS, PRODUCTS } = window.APP_DATA;
  const recentOrders = ORDERS.slice(0, 3);
  const recProducts = PRODUCTS.slice(0, 6);
  const budgetPct = Math.round((BUYER.spent / BUYER.budget) * 100);

  return `
    <div>
      <div class="page-header flex justify-between items-center">
        <div>
          <h1 class="page-title">Good afternoon, ${BUYER.name.split(' ')[0]}! 👋</h1>
          <p class="page-subtitle">${BUYER.company} · ${BUYER.role} · ${new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-app btn-sm" onclick="Router.navigate('buyer-location')">⚡ Dijkstra Routes</button>
          <button class="btn btn-accent btn-sm" onclick="Router.navigate('buyer-search')">🔍 Search Products</button>
        </div>
      </div>

      <div class="ai-insight" style="margin-bottom:20px">
        <div class="ai-insight-icon">🤖</div>
        <div class="ai-insight-content">
          <div class="ai-insight-label">AI Procurement & Route Insight</div>
          <div class="ai-insight-text">
            Dijkstra algorithm has selected <strong>Peenya Hub (TechNova)</strong> for your location — 14 km distance, 0.5 hr delivery. You've saved <strong>₹3,40,000</strong> this month using negotiated contract pricing and optimal seller routing.
          </div>
        </div>
      </div>

      <div class="stat-cards">
        ${[
          { icon: '📦', label: 'Pending Orders', value: BUYER.pendingOrders, trend: '+1 today', up: false, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
          { icon: '✅', label: 'Pending Approvals', value: BUYER.pendingApprovals, trend: 'Urgent', up: false, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
          { icon: '💰', label: 'Budget Used', value: budgetPct + '%', trend: formatPrice(BUYER.budget - BUYER.spent) + ' left', up: true, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
          { icon: '🏪', label: 'Saved Suppliers', value: BUYER.savedSuppliers, trend: '2 new this week', up: true, color: '#00C9A7', bg: 'rgba(0,201,167,0.1)' },
          { icon: '🔔', label: 'Price Alerts', value: BUYER.priceAlerts, trend: 'Active alerts', up: false, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
          { icon: '🤖', label: 'AI Insights', value: 12, trend: '+3 new insights', up: true, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
          { icon: '💳', label: 'Monthly Spend', value: formatPrice(BUYER.spent), trend: '-8% vs last month', up: true, color: '#06B6D4', bg: 'rgba(6,182,212,0.1)' },
          { icon: '⭐', label: 'Avg. Supplier Rating', value: '4.7', trend: '↑ from 4.5', up: true, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
        ].map(s => `
          <div class="stat-card" style="cursor:pointer" onclick="Router.navigate('buyer-search')">
            <div class="stat-card-icon" style="background:${s.bg}">${s.icon}</div>
            <div class="stat-card-value" style="font-size:22px">${s.value}</div>
            <div class="stat-card-label">${s.label}</div>
            <div class="stat-card-trend ${s.up ? 'trend-up' : 'trend-down'}">${s.up ? '↑' : '↓'} ${s.trend}</div>
            <div class="stat-card-accent" style="background:${s.color}"></div>
          </div>
        `).join('')}
      </div>

      <div style="display:grid;grid-template-columns:1.6fr 1fr;gap:20px;margin-top:4px">
        <div class="card">
          <div class="card-header">
            <div class="card-title">Recent Orders</div>
            <button class="btn btn-ghost btn-sm" onclick="Router.navigate('buyer-orders')">View All →</button>
          </div>
          <div class="card-body" style="padding:0">
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <thead>
                <tr>
                  <th style="text-align:left;padding:12px 16px;background:var(--bg);font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-secondary)">Order</th>
                  <th style="text-align:left;padding:12px 16px;background:var(--bg);font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-secondary)">Amount</th>
                  <th style="text-align:left;padding:12px 16px;background:var(--bg);font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-secondary)">Status</th>
                  <th style="text-align:left;padding:12px 16px;background:var(--bg);font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-secondary)">Action</th>
                </tr>
              </thead>
              <tbody>
                ${recentOrders.map(o => `
                  <tr style="border-bottom:1px solid var(--border);cursor:pointer" onclick="Router.navigate('buyer-orders')">
                    <td style="padding:13px 16px">
                      <div style="font-weight:600;font-size:13px">${o.id}</div>
                      <div style="font-size:12px;color:var(--text-muted)">${o.product.substring(0, 22)}...</div>
                    </td>
                    <td style="padding:13px 16px;font-weight:700">${formatPrice(o.amount)}</td>
                    <td style="padding:13px 16px">
                      <span class="badge ${o.status === 'Delivered' ? 'badge-green' : o.status === 'In Transit' ? 'badge-blue' : o.status === 'Pending Approval' ? 'badge-amber' : 'badge-purple'}">${o.status}</span>
                    </td>
                    <td style="padding:13px 16px">
                      <button class="btn btn-xs btn-app">Track</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="card">
            <div class="card-header">
              <div class="card-title">Q3 Budget Tracker</div>
              <span class="badge badge-green">On Track</span>
            </div>
            <div class="card-body">
              <div style="font-size:26px;font-weight:900;margin-bottom:4px">${formatPrice(BUYER.spent)}</div>
              <div style="font-size:13px;color:var(--text-muted);margin-bottom:12px">of ${formatPrice(BUYER.budget)} budget</div>
              <div class="progress-bar">
                <div class="progress-fill" style="width:${budgetPct}%;background:linear-gradient(90deg,var(--accent),var(--blue))"></div>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);margin-top:6px">
                <span>${budgetPct}% used</span>
                <span>${formatPrice(BUYER.budget - BUYER.spent)} left</span>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <div class="card-title">🔔 Active Alerts</div>
              <span class="badge badge-red">${BUYER.priceAlerts} new</span>
            </div>
            <div class="card-body" style="padding:12px 16px">
              ${[
                { icon: '💰', title: 'Price Drop', desc: 'Industrial Laptop -10% off', time: '2 min ago', color: 'green' },
                { icon: '📦', title: 'Low Stock', desc: 'Ergonomic Chairs: 12 left', time: '15 min ago', color: 'red' },
                { icon: '⚡', title: 'Dijkstra Route', desc: 'Fastest 14km route calculated', time: '1 hr ago', color: 'blue' },
              ].map(a => `
                <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border)">
                  <div style="width:32px;height:32px;border-radius:8px;background:rgba(${a.color==='green'?'16,185,129':a.color==='red'?'239,68,68':'59,130,246'},0.1);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">${a.icon}</div>
                  <div style="flex:1">
                    <div style="font-size:12px;font-weight:700">${a.title}</div>
                    <div style="font-size:11px;color:var(--text-muted)">${a.desc}</div>
                  </div>
                  <div style="font-size:10px;color:var(--text-muted)">${a.time}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top:24px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <div>
            <h2 style="font-size:18px;font-weight:800">✨ AI Recommended For You</h2>
            <p style="font-size:13px;color:var(--text-secondary)">Based on your purchase history & contract pricing in ₹</p>
          </div>
          <button class="btn btn-ghost btn-sm" onclick="Router.navigate('buyer-recommendations')">View All →</button>
        </div>
        <div class="products-grid">
          ${recProducts.map(p => renderProductCard(p)).join('')}
        </div>
      </div>
    </div>
  `;
}

// Product Card Component
function renderProductCard(p) {
  const seller = getSeller(p.sellerId);
  const inWishlist = State.wishlist.includes(p.id);
  const route = runDijkstra(seller.warehouseNode || 'Peenya Industrial Hub', BUYER.location || 'Bangalore Central Hub');

  return `
    <div class="product-card" onclick="viewProduct('${p.id}')">
      <div class="product-card-img">
        <span style="font-size:64px">${p.image}</span>
        <div class="product-card-badge">-${p.discount}%</div>
        <div class="product-card-fav" onclick="event.stopPropagation();toggleWishlistUI('${p.id}',this)">
          ${inWishlist ? '❤️' : '🤍'}
        </div>
      </div>
      <div class="product-card-body">
        <div class="product-card-category">${p.category}</div>
        <div class="product-card-name">${p.name}</div>
        <div class="product-card-seller">🏭 ${seller.name || 'Unknown'} · ${seller.location}</div>
        <div class="rating-row">
          <span class="stars">${'★'.repeat(Math.floor(p.rating))}</span>
          <span>${p.rating} (${p.reviews})</span>
          <span class="confidence-badge ${getConfidenceClass(p.confidenceScore)}" style="margin-left:auto">
            ✓ ${p.confidenceScore}%
          </span>
        </div>
        <div style="font-size:11px;color:var(--accent);font-weight:600;margin-top:2px">
          ⚡ Dijkstra: ${route.totalDistanceKm}km (${route.totalHours} hrs)
        </div>
        <div class="product-card-price">
          <span class="product-card-price-main">${formatPrice(p.price)}</span>
          <span class="product-card-price-old">${formatPrice(p.originalPrice)}</span>
        </div>
      </div>
      <div class="product-card-footer">
        <span style="font-size:12px;color:var(--text-muted)">🚚 ${p.deliveryDays}d delivery</span>
        <button class="btn btn-accent btn-xs" onclick="event.stopPropagation();addToCart(window.APP_DATA.PRODUCTS.find(pr=>pr.id==='${p.id}'))">
          Add to Cart
        </button>
      </div>
    </div>
  `;
}

function toggleWishlistUI(productId, el) {
  toggleWishlist(productId);
  el.textContent = State.wishlist.includes(productId) ? '❤️' : '🤍';
  showToast(State.wishlist.includes(productId) ? 'Added to wishlist' : 'Removed from wishlist', 'info');
}

function viewProduct(id) {
  State.currentProduct = id;
  Router.navigate('buyer-product');
}

// =============================================
// SEARCH PAGE
// =============================================
function renderSearch() {
  const { PRODUCTS } = window.APP_DATA;
  let products = [...PRODUCTS];

  if (State.searchQuery) {
    const q = State.searchQuery.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q)
    );
  }
  if (State.filters.category) products = products.filter(p => p.category === State.filters.category);
  if (State.filters.inStock) products = products.filter(p => p.stock > 0);

  return `
    <div>
      <div class="page-header flex justify-between items-center">
        <div>
          <h1 class="page-title">🔍 Intelligent Product Search</h1>
          <p class="page-subtitle">Natural language search · AI results in ₹ · Dijkstra delivery routes</p>
        </div>
      </div>

      <div style="background:linear-gradient(135deg,#0A2540,#1a3a5c);border-radius:16px;padding:24px;margin-bottom:20px">
        <div style="font-size:13px;color:var(--accent);font-weight:700;margin-bottom:10px">🧠 AI NATURAL LANGUAGE SEARCH & ROUTING</div>
        <div style="display:flex;gap:12px">
          <div style="flex:1;display:flex;align-items:center;gap:12px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:10px;padding:14px 18px">
            <span style="font-size:18px">🔍</span>
            <input id="ai-search" type="text" placeholder='Try: "Industrial laptops under ₹70,000" or "Office chairs near Bangalore"'
              style="flex:1;background:none;color:#fff;font-size:15px"
              value="${State.searchQuery}"
              onkeyup="handleSearch(event)">
          </div>
          <button class="btn btn-primary" onclick="handleSearchBtn()" style="padding:14px 28px;font-size:15px">Search</button>
        </div>
      </div>

      <div class="search-layout">
        <div class="filter-panel">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
            <div style="font-size:14px;font-weight:700">Filters</div>
            <div style="font-size:12px;color:var(--accent);cursor:pointer" onclick="clearFilters()">Clear all</div>
          </div>

          <div class="filter-section">
            <div class="filter-section-title">Category</div>
            ${['', ...window.APP_DATA.CATEGORIES].map((c, i) => `
              <div class="filter-option">
                <input type="radio" name="category" id="cat${i}" ${State.filters.category === c ? 'checked' : ''} onchange="setFilter('category','${c}')">
                <label for="cat${i}">${c || 'All Categories'}</label>
              </div>
            `).join('')}
          </div>

          <div class="filter-section">
            <div class="filter-section-title">Availability</div>
            <div class="filter-option">
              <input type="checkbox" id="in-stock" ${State.filters.inStock ? 'checked' : ''} onchange="setFilter('inStock',this.checked)">
              <label for="in-stock">In Stock Only</label>
            </div>
          </div>
        </div>

        <div class="search-results">
          <div class="search-toolbar">
            <div class="search-input-wrap">
              <span>🔍</span>
              <input id="inline-search" type="text" placeholder="Refine search..." value="${State.searchQuery}" onkeyup="handleSearch(event)">
            </div>
            <div style="display:flex;align-items:center;gap:10px">
              <div style="font-size:13px;color:var(--text-muted)"><strong>${products.length}</strong> results</div>
              <button class="btn btn-app btn-sm" onclick="Router.navigate('buyer-compare')">⚖️ Compare (${State.compareList.length})</button>
            </div>
          </div>

          ${products.length > 0 ? `
            <div class="products-grid">
              ${products.slice(0, 20).map(p => renderProductCard(p)).join('')}
            </div>
          ` : `
            <div class="empty-state">
              <div class="empty-state-title">No products found</div>
              <button class="btn btn-accent" style="margin-top:16px" onclick="clearFilters()">Clear Filters</button>
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}

function handleSearch(e) {
  State.searchQuery = e.target.value;
  if (e.key === 'Enter') render();
}
function handleSearchBtn() { render(); }
function setFilter(key, val) { State.filters[key] = val; }
function clearFilters() { State.filters = { priceMax: 500000, category: '', brand: '', inStock: false, nearbyOnly: false }; State.searchQuery = ''; render(); }

// =============================================
// PRODUCT DETAIL
// =============================================
function renderProductDetail() {
  const { PRODUCTS } = window.APP_DATA;
  const p = PRODUCTS.find(pr => pr.id === State.currentProduct) || PRODUCTS[0];
  const seller = getSeller(p.sellerId);
  const route = runDijkstra(seller.warehouseNode || 'Peenya Industrial Hub', 'Bangalore Central Hub');

  return `
    <div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:20px;font-size:13px;color:var(--text-muted)">
        <span style="cursor:pointer" onclick="Router.navigate('buyer-search')">← Search Results</span>
        <span>/</span>
        <span>${p.category}</span>
        <span>/</span>
        <span style="color:var(--text-primary);font-weight:600">${p.name}</span>
      </div>

      <div class="product-detail-grid">
        <div>
          <div class="product-detail-images">
            <div class="product-detail-main-img">${p.image}</div>
          </div>

          <!-- Dijkstra Route Banner -->
          <div class="card" style="margin-top:16px;background:linear-gradient(135deg,rgba(0,201,167,0.1),rgba(59,130,246,0.1));border:1px solid rgba(0,201,167,0.3)">
            <div class="card-body">
              <div style="font-size:12px;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px">⚡ DIJKSTRA SHORTEST DELIVERY ROUTE</div>
              <div style="font-size:14px;font-weight:700;margin-bottom:6px">
                Path: ${route.path.join(' ➔ ')}
              </div>
              <div style="display:flex;gap:12px;font-size:13px;color:var(--text-secondary)">
                <span>📍 Total Distance: <strong>${route.totalDistanceKm} km</strong></span>
                <span>⏱️ Transit Time: <strong>${route.totalHours} hrs</strong></span>
                <span>🚚 Estimated Delivery: <strong style="color:var(--success)">Effective ${route.effectiveDeliveryDays} day(s)</strong></span>
              </div>
            </div>
          </div>

          <div class="product-detail-panel" style="margin-top:16px">
            <div style="font-size:15px;font-weight:700;margin-bottom:14px">📋 Technical Specifications</div>
            <div class="spec-grid">
              ${Object.entries(p.specs).map(([k, v]) => `
                <div class="spec-item">
                  <div class="spec-key">${k}</div>
                  <div class="spec-value">${v}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="product-detail-info">
          <div class="product-detail-panel">
            <div class="flex justify-between items-center" style="margin-bottom:12px">
              <span class="badge badge-blue">${p.category}</span>
              <span class="confidence-badge ${getConfidenceClass(p.confidenceScore)}">✓ ${p.confidenceScore}% Confidence</span>
            </div>
            <h1 style="font-size:22px;font-weight:800;line-height:1.3;margin-bottom:8px">${p.name}</h1>
            <div style="font-size:13px;color:var(--text-muted);margin-bottom:10px">by ${p.brand} · Sold by <strong style="color:var(--accent)">${seller.name}</strong></div>

            <div style="display:flex;align-items:baseline;gap:12px;margin-bottom:14px">
              <span class="product-price-big" style="font-size:32px;font-weight:900;color:var(--primary)">${formatPrice(p.price)}</span>
              <span style="text-decoration:line-through;color:var(--text-muted);font-size:16px">${formatPrice(p.originalPrice)}</span>
              <span class="badge badge-red" style="font-size:13px">-${p.discount}%</span>
            </div>

            <div style="display:flex;gap:10px;margin-bottom:16px">
              <button class="btn btn-accent" style="flex:1" onclick="addToCart(window.APP_DATA.PRODUCTS.find(pr=>pr.id==='${p.id}'));showToast('Added to cart!','success')">
                🛒 Add to Cart
              </button>
              <button class="btn btn-blue" onclick="Router.navigate('buyer-rfq')">📋 Request Quote</button>
            </div>
          </div>

          <div class="product-detail-panel">
            <div style="font-size:15px;font-weight:700;margin-bottom:14px">📦 Bulk Pricing in INR (₹)</div>
            <table class="bulk-pricing-table">
              <thead><tr><th>Qty</th><th>Unit Price</th><th>Discount</th><th>Total</th></tr></thead>
              <tbody>
                ${[
                  [p.minOrder, p.price, '0%'],
                  [p.minOrder * 2, Math.round(p.price * 0.93), '7%'],
                  [p.minOrder * 5, Math.round(p.price * 0.88), '12%'],
                ].map(([qty, unit, disc]) => `
                  <tr>
                    <td>${qty}+ units</td>
                    <td>${formatPrice(unit)}</td>
                    <td>${disc}</td>
                    <td>${formatPrice(qty * unit)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}

// =============================================
// COMPARISON PAGE
// =============================================
function renderCompare() {
  const { PRODUCTS } = window.APP_DATA;
  const compareProducts = State.compareList.length > 0 ? State.compareList : PRODUCTS.slice(0, 4);

  return `
    <div>
      <div class="page-header flex justify-between items-center">
        <div>
          <h1 class="page-title">⚖️ Supplier Comparison</h1>
          <p class="page-subtitle">Compare products & suppliers in INR (₹) · AI recommendation engine</p>
        </div>
      </div>

      <div class="card">
        <div class="comparison-table-wrap">
          <table class="comparison-table">
            <thead>
              <tr>
                <th style="width:160px">Metric</th>
                ${compareProducts.map(p => `
                  <th>
                    <div style="text-align:center">
                      <div style="font-size:32px">${p.image}</div>
                      <div style="font-size:13px;font-weight:700">${p.name}</div>
                      <div style="font-size:11px;color:var(--text-muted)">${getSeller(p.sellerId).name}</div>
                    </div>
                  </th>
                `).join('')}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="font-weight:600">Price (INR)</td>
                ${compareProducts.map(p => `<td style="text-align:center;font-weight:700;color:var(--primary)">${formatPrice(p.price)}</td>`).join('')}
              </tr>
              <tr>
                <td style="font-weight:600">Confidence Score</td>
                ${compareProducts.map(p => `<td style="text-align:center"><span class="confidence-badge ${getConfidenceClass(p.confidenceScore)}">${p.confidenceScore}%</span></td>`).join('')}
              </tr>
              <tr>
                <td style="font-weight:600">Dijkstra Shortest Route</td>
                ${compareProducts.map(p => {
                  const s = getSeller(p.sellerId);
                  const route = runDijkstra(s.warehouseNode || 'Peenya Industrial Hub', 'Bangalore Central Hub');
                  return `<td style="text-align:center;font-size:12px">⚡ ${route.totalDistanceKm}km (${route.totalHours}h)</td>`;
                }).join('')}
              </tr>
              <tr>
                <td style="font-weight:600">Action</td>
                ${compareProducts.map(p => `
                  <td style="text-align:center">
                    <button class="btn btn-accent btn-xs" onclick="addToCart(window.APP_DATA.PRODUCTS.find(pr=>pr.id==='${p.id}'))">Add to Cart</button>
                  </td>
                `).join('')}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// =============================================
// CART
// =============================================
function renderCart() {
  const { PRODUCTS } = window.APP_DATA;
  if (State.cart.length === 0) {
    State.cart = [
      { ...PRODUCTS[0], qty: 10 },
      { ...PRODUCTS[4], qty: 25 },
    ];
  }

  const subtotal = State.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const savings = State.cart.reduce((sum, item) => sum + (item.originalPrice - item.price) * item.qty, 0);
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;

  return `
    <div>
      <div class="page-header flex justify-between items-center">
        <div>
          <h1 class="page-title">🛒 Smart Cart</h1>
          <p class="page-subtitle">${State.cart.length} items · Real-time INR (₹) pricing</p>
        </div>
      </div>

      <div class="cart-layout">
        <div class="card">
          <div class="card-header">
            <div class="card-title">Cart Items</div>
          </div>
          <div class="card-body">
            ${State.cart.map((item, idx) => `
              <div class="cart-item">
                <div class="cart-item-img">${item.image}</div>
                <div class="cart-item-info">
                  <div class="cart-item-name">${item.name}</div>
                  <div class="cart-item-seller">🏭 ${getSeller(item.sellerId).name}</div>
                </div>
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
                  <div class="cart-item-price">${formatPrice(item.price * item.qty)}</div>
                  <button class="btn btn-ghost btn-xs" style="color:var(--danger)" onclick="removeFromCart(${idx})">Remove</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="cart-summary">
          <div style="font-size:16px;font-weight:800;margin-bottom:18px">Order Summary</div>
          <div class="cart-summary-row"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
          <div class="cart-summary-row"><span>Savings</span><span style="color:var(--success)">-${formatPrice(savings)}</span></div>
          <div class="cart-summary-row"><span>GST (18%)</span><span>${formatPrice(tax)}</span></div>
          <div class="cart-summary-row total"><span>Total</span><span>${formatPrice(total)}</span></div>
          <button class="btn btn-accent w-full" style="margin-top:16px;padding:14px" onclick="Router.navigate('buyer-approvals')">
            Submit for Approval →
          </button>
        </div>
      </div>
    </div>
  `;
}

function removeFromCart(idx) {
  State.cart.splice(idx, 1);
  render();
  showToast('Item removed from cart', 'info');
}

// =============================================
// LOCATION & DIJKSTRA ROUTE OPTIMIZATION PAGE
// =============================================
function renderLocation() {
  const { DELIVERY_GRAPH } = window.APP_DATA;
  const routeResult = runDijkstra(State.selectedMapStart, State.selectedMapEnd);

  return `
    <div>
      <div class="page-header flex justify-between items-center">
        <div>
          <h1 class="page-title">⚡ Dijkstra Delivery Route Optimization</h1>
          <p class="page-subtitle">Shortest path & effective travel time algorithm for optimal seller selection</p>
        </div>
      </div>

      <!-- Route Selector Banner -->
      <div class="card" style="margin-bottom:20px;background:linear-gradient(135deg,rgba(10,37,64,0.05),rgba(0,201,167,0.08));border:1px solid var(--border)">
        <div class="card-body">
          <div style="font-size:13px;font-weight:700;color:var(--accent);margin-bottom:10px">⚡ CALCULATE DIJKSTRA SHORTEST PATH</div>
          <div style="display:grid;grid-template-columns:1fr 1fr 180px;gap:14px;align-items:end">
            <div>
              <label class="form-label">Origin Warehouse / Node</label>
              <select class="form-input" id="dijkstra-start" onchange="State.selectedMapStart=this.value;render()">
                ${DELIVERY_GRAPH.nodes.map(n => `<option value="${n.id}" ${n.id === State.selectedMapStart ? 'selected' : ''}>${n.label}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="form-label">Buyer Destination Node</label>
              <select class="form-input" id="dijkstra-end" onchange="State.selectedMapEnd=this.value;render()">
                ${DELIVERY_GRAPH.nodes.map(n => `<option value="${n.id}" ${n.id === State.selectedMapEnd ? 'selected' : ''}>${n.label}</option>`).join('')}
              </select>
            </div>
            <button class="btn btn-accent" onclick="render()">Run Algorithm</button>
          </div>
        </div>
      </div>

      <div class="location-layout">
        <!-- Map & Route Visualizer -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">Logistics Graph & Dijkstra Path</div>
            <span class="badge badge-green">Shortest Path Found</span>
          </div>
          <div class="map-container">
            <div class="map-svg-wrap">
              <svg width="100%" height="500" viewBox="0 0 600 500" style="position:absolute;top:0;left:0">
                <ellipse cx="300" cy="250" rx="200" ry="220" fill="${State.theme === 'dark' ? '#1a3a2a' : '#c8e6d4'}" opacity="0.6"/>
              </svg>

              <!-- Node Pins -->
              ${DELIVERY_GRAPH.nodes.map(pin => {
                const isStart = pin.id === State.selectedMapStart;
                const isEnd = pin.id === State.selectedMapEnd;
                const isInPath = routeResult.path.includes(pin.id);
                return `
                  <div class="map-pin" style="top:${pin.coords.top};left:${pin.coords.left}" onclick="showToast('${pin.label} node selected','info')">
                    <div class="map-pin-icon" style="font-size:${isStart||isEnd?'34px':'24px'}">${isStart?'🏭':isEnd?'🏢':'📍'}</div>
                    <div class="map-pin-label" style="background:${isStart?'var(--accent)':isEnd?'var(--blue)':isInPath?'var(--success)':'var(--bg-card)'};color:${isStart||isEnd||isInPath?'#fff':'var(--text-primary)'}">
                      ${pin.label}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- Dijkstra Output Summary -->
        <div>
          <div class="card" style="margin-bottom:16px">
            <div class="card-header">
              <div class="card-title">📊 Dijkstra Execution Output</div>
            </div>
            <div class="card-body">
              <div style="font-size:12px;color:var(--text-muted);margin-bottom:6px">OPTIMAL ROUTE PATH</div>
              <div style="font-size:14px;font-weight:800;color:var(--accent);line-height:1.5;margin-bottom:14px">
                ${routeResult.path.map((node, idx) => `
                  <div style="display:flex;align-items:center;gap:6px">
                    <span style="width:20px;height:20px;border-radius:50%;background:var(--accent);color:#0A2540;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800">${idx+1}</span>
                    <span>${node}</span>
                  </div>
                `).join('<div style="margin-left:8px;color:var(--text-muted)">↓</div>')}
              </div>

              <div style="display:flex;flex-direction:column;gap:8px;font-size:13px;border-top:1px solid var(--border);padding-top:12px">
                <div style="display:flex;justify-content:space-between"><span>Shortest Distance:</span><strong>${routeResult.totalDistanceKm} km</strong></div>
                <div style="display:flex;justify-content:space-between"><span>Est. Travel Time:</span><strong>${routeResult.totalHours} hrs</strong></div>
                <div style="display:flex;justify-content:space-between"><span>Effective Delivery:</span><strong style="color:var(--success)">${routeResult.effectiveDeliveryDays} day(s)</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// =============================================
// SELLER DASHBOARD (SMART INVENTORY & ORDERS)
// =============================================
function renderSellerDashboard() {
  const { SELLER_USER, PRODUCTS } = window.APP_DATA;
  const inventoryAnalysis = PRODUCTS.slice(0, 5).map(p => ({ product: p, analysis: analyzeSmartInventory(p) }));

  return `
    <div>
      <div class="page-header flex justify-between items-center">
        <div>
          <h1 class="page-title">Good afternoon, ${SELLER_USER.name.split(' ')[0]}! 🏭</h1>
          <p class="page-subtitle">${SELLER_USER.company} · Smart Inventory & Pricing Control</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-accent btn-sm" onclick="Router.navigate('seller-inventory')">📦 Manage Stock</button>
        </div>
      </div>

      <!-- Stats in INR (₹) -->
      <div class="stat-cards">
        ${[
          { icon: '📦', label: 'Total Orders', value: '1,247', trend: '+12% this month', up: true, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
          { icon: '💰', label: 'Monthly Revenue', value: formatPrice(SELLER_USER.monthlyRevenue), trend: '+8% vs last month', up: true, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
          { icon: '⚠️', label: 'Low Stock Alerts', value: '5 Items', trend: 'Reorder ROP breached', up: false, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
          { icon: '⭐', label: 'Trust Score', value: '98%', trend: 'Top Rated', up: true, color: '#00C9A7', bg: 'rgba(0,201,167,0.1)' },
        ].map(s => `
          <div class="stat-card">
            <div class="stat-card-icon" style="background:${s.bg}">${s.icon}</div>
            <div class="stat-card-value" style="font-size:22px">${s.value}</div>
            <div class="stat-card-label">${s.label}</div>
            <div class="stat-card-trend ${s.up ? 'trend-up' : 'trend-down'}">${s.up ? '↑' : '↓'} ${s.trend}</div>
          </div>
        `).join('')}
      </div>

      <!-- Smart Inventory Restocking Alerts -->
      <div class="card" style="margin-bottom:20px">
        <div class="card-header">
          <div class="card-title">📦 Smart Restocking & Inventory Suggestions</div>
          <button class="btn btn-accent btn-sm" onclick="showToast('Restock orders generated!','success')">Restock All Low Items</button>
        </div>
        <div class="card-body" style="padding:0">
          <table class="inventory-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Current Stock</th>
                <th>Reorder Point (ROP)</th>
                <th>Stock Status</th>
                <th>AI Inventory Suggestion</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${inventoryAnalysis.map(({ product: p, analysis: a }) => `
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:8px">
                      <span style="font-size:20px">${p.image}</span>
                      <span style="font-size:13px;font-weight:700">${p.name}</span>
                    </div>
                  </td>
                  <td><strong style="color:${a.status==='low_stock'?'var(--danger)':'var(--text-primary)'}">${p.stock} units</strong></td>
                  <td>${a.rop} units</td>
                  <td><span class="badge ${a.alertType}">${a.statusText}</span></td>
                  <td style="font-size:12px;color:var(--text-secondary);max-width:300px">${a.suggestion}</td>
                  <td>
                    ${a.status === 'low_stock' ? `
                      <button class="btn btn-accent btn-xs" onclick="showToast('Batch restock order placed for ${p.name}!','success')">Restock ${a.suggestedReorderQty} units</button>
                    ` : a.status === 'overstock' ? `
                      <button class="btn btn-app btn-xs" onclick="Router.navigate('seller-pricing')">Apply Discount</button>
                    ` : `
                      <span style="font-size:12px;color:var(--success)">Balanced</span>
                    `}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// =============================================
// SELLER INVENTORY PAGE
// =============================================
function renderSellerInventory() {
  const { PRODUCTS } = window.APP_DATA;

  return `
    <div>
      <div class="page-header flex justify-between items-center">
        <div>
          <h1 class="page-title">📦 Smart Inventory Management</h1>
          <p class="page-subtitle">Demand-based ROP suggestions · Low-stock & overstock alerts</p>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">Inventory Stock Control</div></div>
        <div style="overflow-x:auto">
          <table class="inventory-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Current Stock</th>
                <th>Safety Stock</th>
                <th>Lead Time</th>
                <th>Daily Velocity</th>
                <th>Calculated ROP</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${PRODUCTS.slice(0, 12).map(p => {
                const a = analyzeSmartInventory(p);
                return `
                  <tr>
                    <td style="display:flex;align-items:center;gap:8px">
                      <span style="font-size:20px">${p.image}</span>
                      <span style="font-size:13px;font-weight:700">${p.name}</span>
                    </td>
                    <td><strong>${p.stock} units</strong></td>
                    <td>${p.safetyStock || 20}</td>
                    <td>${p.leadTimeDays || 3} days</td>
                    <td>${p.dailySalesVelocity || 5}/day</td>
                    <td><strong>${a.rop} units</strong></td>
                    <td><span class="badge ${a.alertType}">${a.statusText}</span></td>
                    <td>
                      <button class="btn btn-accent btn-xs" onclick="showToast('Stock updated!','success')">Update Stock</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// =============================================
// SELLER PRICING PAGE
// =============================================
function renderSellerPricing() {
  const { PRODUCTS } = window.APP_DATA;

  return `
    <div>
      <div class="page-header">
        <h1 class="page-title">💰 Pricing Control in INR (₹)</h1>
        <p class="page-subtitle">Manage catalog prices, contract pricing, and AI discount optimization</p>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">Product Price Management</div>
          <button class="btn btn-accent btn-sm" onclick="showToast('Pricing changes saved!','success')">Save Prices</button>
        </div>
        <div style="overflow-x:auto">
          <table class="inventory-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Current Price (₹)</th>
                <th>Discount (%)</th>
                <th>Contract Price (₹)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${PRODUCTS.slice(0, 10).map(p => `
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:8px">
                      <span style="font-size:20px">${p.image}</span>
                      <span style="font-size:13px;font-weight:700">${p.name}</span>
                    </div>
                  </td>
                  <td>
                    <input class="form-input" style="width:110px" type="number" value="${p.price}" onchange="showToast('Price updated','success')">
                  </td>
                  <td>
                    <input class="form-input" style="width:70px" type="number" value="${p.discount}" onchange="showToast('Discount updated','success')">
                  </td>
                  <td>
                    <input class="form-input" style="width:110px" type="number" value="${Math.round(p.price * 0.88)}" onchange="showToast('Contract price updated','success')">
                  </td>
                  <td>
                    <button class="btn btn-accent btn-xs" onclick="showToast('Updated price for ${p.name}','success')">Update</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// Additional Seller Pages Stubs
function renderSellerProducts() {
  return renderSellerInventory();
}
function renderSellerAnalytics() {
  return renderSellerDashboard();
}
function renderSellerRFQ() {
  return renderSellerDashboard();
}
function renderApprovals() {
  return renderBuyerDashboard();
}
function renderOrders() {
  return renderBuyerDashboard();
}
function renderRecommendations() {
  return renderBuyerDashboard();
}
function renderRFQ() {
  return renderBuyerDashboard();
}

// =============================================
// CHARTS (Chart.js via CDN)
// =============================================
function initCharts() {
  const revCtx = document.getElementById('revenue-chart');
  if (revCtx && typeof Chart !== 'undefined') {
    new Chart(revCtx, {
      type: 'line',
      data: {
        labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [{
          label: 'Revenue (₹ Lakhs)',
          data: [180, 195, 210, 220, 225, 227],
          borderColor: '#00C9A7', backgroundColor: 'rgba(0,201,167,0.1)',
          tension: 0.4, fill: true, pointBackgroundColor: '#00C9A7', pointRadius: 5,
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }
}

function animateNumbers() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.getAttribute('data-count'));
    let current = 0;
    const increment = target / 60;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = Math.floor(current);
    }, 16);
  });
}

function bindEvents() {}

// =============================================
// INIT
// =============================================
window.addEventListener('load', () => {
  render();
});

// Expose globals
window.Router = Router;
window.State = State;
window.formatPrice = formatPrice;
window.addToCart = addToCart;
window.toggleWishlist = toggleWishlist;
window.addToCompare = addToCompare;
window.toggleTheme = toggleTheme;
window.showToast = showToast;
window.viewProduct = viewProduct;
window.setFilter = setFilter;
window.clearFilters = clearFilters;
window.handleSearch = handleSearch;
window.handleSearchBtn = handleSearchBtn;
window.toggleChat = toggleChat;
window.sendAIMessage = sendAIMessage;
window.showNotificationsPanel = showNotificationsPanel;
window.loginBuyer = loginBuyer;
window.removeFromCart = removeFromCart;
window.toggleWishlistUI = toggleWishlistUI;
window.handleTopbarSearch = handleTopbarSearch;
window.runDijkstra = runDijkstra;
window.analyzeSmartInventory = analyzeSmartInventory;
