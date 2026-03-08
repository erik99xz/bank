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
  initMobileGestures();
}

function initMobileGestures() {
  let touchStartX = 0;
  let touchStartY = 0;

  window.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    // Swipe Right (Back) - starts from left edge (within 50px)
    if (diffX > 100 && Math.abs(diffY) < 50 && touchStartX < 50) {
      window.history.back();
    }
  }, { passive: true });

  // Prevent context menu (optional for more native feel)
  window.addEventListener('contextmenu', (e) => {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      // e.preventDefault(); 
    }
  });

  // ── Keyboard Visibility Detection ────────────────────
  // When an input is focused, the mobile keyboard usually appears.
  // This causes fixed elements to jump or be displaced.
  // We hide the bottom nav to maintain a "stable and locked" UI.
  window.addEventListener('focusin', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      document.body.classList.add('keyboard-visible');
    }
  });

  window.addEventListener('focusout', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      document.body.classList.remove('keyboard-visible');
    }
  });
}

// ── Boot ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
