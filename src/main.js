// ═══════════════════════════════════════════════════════
// NeoBank — Main Entry Point
// ═══════════════════════════════════════════════════════

import { registerRoute, initRouter, navigate } from './components/router.js';
import { renderBottomNav } from './components/bottomNav.js';
import { isLoggedIn } from './backend/api.js';

// Screens
import { renderLogin } from './screens/login.js';
import { renderDashboard } from './screens/dashboard.js';
import { renderTransfer } from './screens/transfer.js';
import { renderQrPay } from './screens/qrPay.js';
import { renderHistory } from './screens/history.js';
import { renderCards } from './screens/cards.js';
import { renderProfile } from './screens/profile.js';
import { renderPriority } from './screens/priority.js';
import { renderChangePin } from './screens/changePin.js';
import { renderMyQr } from './screens/myQr.js';
import { renderNotifications } from './screens/notifications.js';
import { renderAdmin } from './admin/admin.js';

// ── Register all routes ────────────────────────────────
registerRoute('login', renderLogin);
registerRoute('dashboard', renderDashboard);
registerRoute('transfer', renderTransfer);
registerRoute('qr', renderQrPay);
registerRoute('history', renderHistory);
registerRoute('cards', renderCards);
registerRoute('profile', renderProfile);
registerRoute('priority', renderPriority);
registerRoute('changePin', renderChangePin);
registerRoute('myQr', renderMyQr);
registerRoute('notifications', renderNotifications);
registerRoute('admin', renderAdmin);

// ── Build app shell ────────────────────────────────────
function init() {
  const app = document.getElementById('app');

  // Screen container
  const content = document.createElement('div');
  content.id = 'app-content';
  content.style.cssText = 'width:100%;';
  app.appendChild(content);

  // Bottom nav
  const nav = renderBottomNav();
  app.appendChild(nav);

  // Hide/show nav on login/admin
  function updateNavVisibility() {
    const hash = (window.location.hash || '').replace('#', '');
    nav.style.display = (hash === 'login' || hash === 'admin') ? 'none' : '';
  }
  window.addEventListener('hashchange', updateNavVisibility);
  updateNavVisibility();

  // Start router
  if (!window.location.hash || window.location.hash === '#') {
    window.location.hash = isLoggedIn() ? '#dashboard' : '#login';
  }
  initRouter();
}

// ── Boot ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
