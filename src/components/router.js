// ═══════════════════════════════════════════════════════
// NeoBank — Simple Hash Router with slide transitions
// ═══════════════════════════════════════════════════════

const routes = {};
let currentState = null;
let currentRoute = null;


export function registerRoute(path, renderFn) {
  routes[path] = renderFn;
}

export function navigate(path, state = null) {
  currentState = state;
  if (path !== window.location.hash.slice(1)) {
    window.location.hash = path;
  } else {
    handleRoute();
  }
}

export function getCurrentRoute() {
  return currentRoute;
}

function handleRoute() {
  const hash = window.location.hash.slice(1) || 'login';
  const renderFn = routes[hash];
  if (!renderFn) return;

  const appContent = document.getElementById('app-content');
  if (!appContent) return;

  // Determine slide direction
  const routeOrder = ['login', 'dashboard', 'transfer', 'qr', 'history', 'cards', 'profile', 'priority', 'admin', 'notifications', 'otp', 'forgot'];
  const oldIdx = routeOrder.indexOf(currentRoute);
  const newIdx = routeOrder.indexOf(hash);
  const direction = newIdx >= oldIdx ? 'slide-in-right' : 'slide-in-left';

  currentRoute = hash;

  // Animate out old content
  appContent.style.animation = `${direction} 0.35s cubic-bezier(0.4, 0, 0.2, 1)`;
  appContent.innerHTML = '';

  // Render new screen
  const screen = document.createElement('div');
  screen.className = 'screen';
  screen.id = 'screen-' + hash;
  renderFn(screen, currentState);
  appContent.appendChild(screen);

  // Clear state after reading it
  currentState = null;

  // Reset animation
  setTimeout(() => { appContent.style.animation = ''; }, 350);

  // Update nav
  updateNav(hash);
}

function updateNav(route) {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.route === route);
  });
  // Show/hide bottom nav
  const nav = document.getElementById('bottom-nav');
  const statusBar = document.getElementById('status-bar');
  const hideNavRoutes = ['login', 'otp', 'forgot', 'admin', 'changePin', 'myQr'];
  if (nav) nav.classList.toggle('hidden', hideNavRoutes.includes(route));
  if (statusBar) statusBar.classList.toggle('hidden', route === 'login');
}

export function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}
