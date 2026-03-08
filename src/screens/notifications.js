// ═══════════════════════════════════════════════════════
// NeoBank — Notifications Screen
// ═══════════════════════════════════════════════════════

import { api } from '../backend/api.js';
import { navigate } from '../components/router.js';
import { showToast } from '../components/toast.js';
import { skeletonRows } from '../components/skeleton.js';

export function renderNotifications(container) {
  async function load() {
    container.innerHTML = `
<div class="relative flex min-h-screen w-full flex-col max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-2xl overflow-hidden pb-20">
  <header class="notch-safe pt-4 px-4 bg-background-light dark:bg-background-dark sticky top-0 z-50">
    <div class="flex items-center justify-between pb-4">
      <div class="flex items-center gap-3">
        <button id="btn-back-loading" class="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-primary/10 transition-colors">
          <span class="material-symbols-outlined text-slate-900 dark:text-slate-100">arrow_back_ios_new</span>
        </button>
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-bold tracking-tight">Thông báo</h1>
        </div>
      </div>
    </div>
  </header>
  <main class="flex-1 overflow-y-auto px-4 py-6 space-y-4">
    <!-- Skeleton Loader -->
    <div class="flex items-start gap-4 p-4 rounded-xl bg-slate-100 dark:bg-card-dark opacity-40">
      <div class="size-12 rounded-lg skeleton shrink-0"></div>
      <div class="flex-1 space-y-2">
        <div class="h-4 w-1/2 skeleton rounded"></div>
        <div class="h-3 w-full skeleton rounded"></div>
        <div class="h-3 w-1/4 skeleton rounded"></div>
      </div>
    </div>
    <div class="flex items-start gap-4 p-4 rounded-xl bg-slate-100 dark:bg-card-dark opacity-40">
      <div class="size-12 rounded-lg skeleton shrink-0"></div>
      <div class="flex-1 space-y-2">
        <div class="h-4 w-1/2 skeleton rounded"></div>
        <div class="h-3 w-full skeleton rounded"></div>
        <div class="h-3 w-1/4 skeleton rounded"></div>
      </div>
    </div>
  </main>
</div>`;
    container.querySelector('#btn-back-loading')?.addEventListener('click', () => navigate('dashboard'));
    const res = await api('notifications');
    if (!res.ok) { showToast(res.error, 'error'); return; }
    render(res.notifications);
  }

  function render(notifications) {

    container.innerHTML = `
<div class="relative flex min-h-screen w-full flex-col max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-2xl overflow-hidden pb-20">
  <!-- Header Section -->
  <header class="notch-safe pt-4 px-4 bg-background-light dark:bg-background-dark sticky top-0 z-50">
    <div class="flex items-center justify-between pb-4">
      <div class="flex items-center gap-3">
        <button id="btn-back" class="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-primary/10 transition-colors">
          <span class="material-symbols-outlined text-slate-900 dark:text-slate-100">arrow_back_ios_new</span>
        </button>
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-bold tracking-tight">Thông báo</h1>
          ${notifications.filter(n => !n.read).length > 0 ? `
          <span class="flex items-center justify-center bg-primary text-white text-[10px] font-bold h-5 min-w-5 px-1.5 rounded-full neon-glow">
            ${notifications.filter(n => !n.read).length}
          </span>` : ''}
        </div>
      </div>
      <button class="text-primary text-sm font-semibold hover:opacity-80 transition-opacity">
        Đã đọc tất cả
      </button>
    </div>
    <!-- Tabs -->
    <div class="flex border-b border-slate-200 dark:border-slate-800">
      <button class="flex-1 py-3 text-sm font-bold border-b-2 border-primary text-primary transition-all">
        Tất cả
      </button>
      <button class="flex-1 py-3 text-sm font-medium text-slate-500 dark:text-slate-400 border-b-2 border-transparent hover:text-primary transition-all">
        Chưa đọc
      </button>
      <button class="flex-1 py-3 text-sm font-medium text-slate-500 dark:text-slate-400 border-b-2 border-transparent hover:text-primary transition-all">
        Cảnh báo
      </button>
    </div>
  </header>

  <!-- Notification List -->
  <main class="flex-1 overflow-y-auto px-4 py-6 space-y-4">
    ${notifications.length === 0 ? '<p class="text-sm text-slate-500 text-center" style="padding:40px 0">Không có thông báo</p>' : ''}
    
    ${notifications.map((n, i) => {
      let icon = 'notifications';
      let iconColor = 'text-primary';
      let bgColor = 'bg-primary/10';
      
      if (n.type === 'transfer' || n.title.includes('thành công')) {
        icon = 'check_circle';
        iconColor = 'text-emerald-500';
        bgColor = 'bg-emerald-500/10';
      } else if (n.type === 'security' || n.title.includes('cảnh báo')) {
        icon = 'warning';
        iconColor = 'text-amber-500';
        bgColor = 'bg-amber-500/10';
      } else if (n.type === 'info' || n.title.includes('Biến động')) {
        icon = 'info';
        iconColor = 'text-primary';
        bgColor = 'bg-primary/10';
      }

      return `
      <div class="group relative flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-card-dark border ${n.read ? 'border-slate-100 dark:border-slate-800 opacity-70' : 'border-primary/20 dark:border-primary/30'} shadow-sm active:scale-[0.98] transition-all cursor-pointer overflow-hidden notif-item" data-notif-id="${n.id}" style="animation: slideRight 0.3s ease forwards; animation-delay: ${i * 0.05}s">
        <div class="absolute inset-0 bg-primary/5 opacity-0 group-active:opacity-100 transition-opacity"></div>
        <div class="size-12 flex items-center justify-center rounded-lg ${bgColor} ${iconColor} shrink-0">
          <span class="material-symbols-outlined text-[28px]">${icon}</span>
        </div>
        <div class="flex-1">
          <div class="flex justify-between items-start mb-1">
            <h3 class="font-bold text-slate-900 dark:text-slate-100">${n.title}</h3>
            <span class="text-[11px] font-medium text-slate-400 whitespace-nowrap">${formatTime(n.createdAt)}</span>
          </div>
          <p class="text-sm text-slate-600 dark:text-slate-400 leading-snug">${n.body}</p>
        </div>
        ${!n.read ? '<div class="size-2 rounded-full bg-primary shrink-0 self-center notif-dot"></div>' : ''}
      </div>
      `;
    }).join('')}
  </main>
</div>
<style>
  @keyframes slideRight {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
</style>
`;

    container.querySelector('#btn-back')?.addEventListener('click', () => navigate('dashboard'));

    container.querySelectorAll('.notif-item').forEach(item => {
      item.addEventListener('click', async () => {
        const id = item.dataset.notifId;
        await api('mark-notification-read', { id });
        item.classList.add('opacity-70');
        item.classList.replace('border-primary/20', 'border-slate-100');
        item.classList.replace('dark:border-primary/30', 'dark:border-slate-800');
        item.querySelector('.notif-dot')?.remove();
        
        // Update unread badge count
        const badge = container.querySelector('.neon-glow');
        if (badge) {
          let count = parseInt(badge.textContent);
          if (count > 1) {
            badge.textContent = count - 1;
          } else {
            badge.remove();
          }
        }
      });
    });
  }

  load();
}

function formatTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return Math.floor(diff / 60) + ' phút trước';
  if (diff < 86400) return Math.floor(diff / 3600) + ' giờ trước';
  if (diff < 604800) return Math.floor(diff / 86400) + ' ngày trước';
  return d.toLocaleDateString('vi-VN');
}
