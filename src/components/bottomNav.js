// ═══════════════════════════════════════════════════════
// NeoBank — Bottom Navigation (Floating QR design)
// ═══════════════════════════════════════════════════════

import { navigate } from './router.js';

export function renderBottomNav() {
  const nav = document.createElement('nav');
  nav.id = 'bottom-nav';
  nav.className = 'fixed bottom-0 left-0 right-0 bg-background-dark/95 backdrop-blur-xl border-t border-slate-800 notch-safe-bottom z-30';
  nav.innerHTML = `
    <div class="flex items-center justify-between px-6 py-3">
      <a class="nav-link flex flex-col items-center justify-center gap-1 w-16" href="#dashboard" data-route="dashboard">
        <span class="material-symbols-outlined nav-icon">home</span>
        <span class="text-[10px] font-bold uppercase tracking-widest nav-label">Trang chủ</span>
      </a>
      <a class="nav-link flex flex-col items-center justify-center gap-1 w-16" href="#transfer" data-route="transfer">
        <span class="material-symbols-outlined nav-icon">account_balance_wallet</span>
        <span class="text-[10px] font-bold uppercase tracking-widest nav-label">Ví</span>
      </a>
      <div class="relative -top-8 flex justify-center items-center w-16">
        <button id="nav-qr-btn" class="w-16 h-16 rounded-full bg-primary shadow-[0_8px_24px_rgba(13,185,242,0.4)] flex items-center justify-center border-4 border-background-dark active:scale-90 transition-transform">
          <span class="material-symbols-outlined text-background-dark text-3xl font-bold">qr_code_scanner</span>
        </button>
        <div class="absolute w-16 h-16 rounded-full bg-primary/20 blur-xl -z-10"></div>
      </div>
      <a class="nav-link flex flex-col items-center justify-center gap-1 w-16" href="#notifications" data-route="notifications">
        <span class="material-symbols-outlined nav-icon">notifications</span>
        <span class="text-[10px] font-bold uppercase tracking-widest nav-label">Thông báo</span>
      </a>
      <a class="nav-link flex flex-col items-center justify-center gap-1 w-16" href="#profile" data-route="profile">
        <span class="material-symbols-outlined nav-icon">person</span>
        <span class="text-[10px] font-bold uppercase tracking-widest nav-label">Cá nhân</span>
      </a>
    </div>`;

  // Active state logic
  function updateActive() {
    const current = (window.location.hash || '#dashboard').replace('#', '');
    nav.querySelectorAll('.nav-link').forEach(link => {
      const route = link.dataset.route;
      if (route === current) {
        link.classList.add('text-primary');
        link.classList.remove('text-slate-500');
      } else {
        link.classList.remove('text-primary');
        link.classList.add('text-slate-500');
      }
    });
  }

  nav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(link.dataset.route);
      updateActive();
    });
  });

  nav.querySelector('#nav-qr-btn').addEventListener('click', () => {
    navigate('qr');
    updateActive();
  });

  window.addEventListener('hashchange', updateActive);
  updateActive();

  return nav;
}
