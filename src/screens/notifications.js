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
<div class="relative flex screen w-full flex-col max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-2xl overflow-hidden pb-20">
  <header class="notch-safe-top pt-4 px-4 bg-background-light dark:bg-background-dark sticky top-0 z-50">
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
<div class="relative flex screen w-full flex-col max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-2xl overflow-hidden pb-20">
  <!-- Header Section -->
  <header class="notch-safe-top pt-4 px-4 bg-background-light dark:bg-background-dark sticky top-0 z-50">
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
        const notif = notifications.find(n => n.id === id);
        
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

        if (notif && (notif.type === 'transfer' || notif.type === 'info')) {
          showTransactionDetail(notif);
        }
      });
    });
  }

  function showTransactionDetail(notif) {
    // Standardize with the provided HTML but integrate into the app shell
    const detailOverlay = document.createElement('div');
    detailOverlay.className = 'fixed inset-0 z-[100] bg-background-light dark:bg-background-dark flex flex-col animate-slide-up';
    
    const amount = notif.body.match(/(\d{1,3}(,\d{3})*)/) ? notif.body.match(/(\d{1,3}(,\d{3})*)/)[0] + ' VND' : '500,000 VND';
    const isOut = !notif.body.includes('+');
    const timeStr = formatTimeLong(notif.createdAt);

    detailOverlay.innerHTML = `
<!-- Header / Top App Bar -->
<header class="notch-safe-top sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
<div class="flex items-center justify-between p-4">
<button id="btn-close-detail" class="flex size-10 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
<span class="material-symbols-outlined text-2xl">arrow_back</span>
</button>
<h1 class="text-lg font-bold leading-tight tracking-tight">Chi tiết giao dịch</h1>
<button class="flex size-10 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
<span class="material-symbols-outlined text-2xl">share</span>
</button>
</div>
</header>
<main class="flex-1 overflow-y-auto px-4 pb-32">
<!-- Success Status Badge & Amount Summary -->
<div class="flex flex-col items-center py-8 gap-4">
<div class="relative">
<div class="flex size-20 items-center justify-center rounded-full bg-primary/20 text-primary">
<span class="material-symbols-outlined text-4xl font-bold">check_circle</span>
</div>
<div class="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full ${isOut ? 'bg-red-500' : 'bg-emerald-500'} text-white border-4 border-background-dark">
<span class="material-symbols-outlined text-lg">${isOut ? 'call_made' : 'call_received'}</span>
</div>
</div>
<div class="text-center space-y-1">
<p class="text-primary font-medium text-sm bg-primary/10 px-3 py-1 rounded-full inline-block">Giao dịch thành công</p>
<h2 class="text-3xl font-bold tracking-tight pt-2">${isOut ? '-' : '+'} ${amount}</h2>
<p class="text-slate-500 dark:text-slate-400 text-sm">${timeStr}</p>
</div>
</div>
<!-- Recipient Information Card -->
<div class="bg-white dark:bg-slate-800/50 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700/50 mb-4">
<div class="flex items-center gap-4">
<div class="size-14 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-xl font-bold">
                    ${notif.title.charAt(0)}
                </div>
<div class="flex-1">
<p class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">${isOut ? 'Người nhận' : 'Người gửi'}</p>
<p class="text-lg font-bold">${notif.title}</p>
<p class="text-sm text-slate-500 dark:text-slate-400">Techcombank • **** 8829</p>
</div>
</div>
<div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
<p class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Nội dung</p>
<p class="text-sm font-medium mt-1 italic text-slate-700 dark:text-slate-300">"${notif.body}"</p>
</div>
</div>
<!-- Transaction Details Section -->
<div class="space-y-4">
<h3 class="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">Thông tin bổ sung</h3>
<div class="bg-white dark:bg-slate-800/50 rounded-xl divide-y divide-slate-100 dark:divide-slate-700/50 border border-slate-200 dark:border-slate-700/50">
<!-- Row: Transaction ID -->
<div class="flex items-center justify-between p-4">
<div>
<p class="text-xs text-slate-500 dark:text-slate-400">Mã giao dịch</p>
<p class="font-medium text-sm">FT${Math.floor(Math.random()*100000000000000)}</p>
</div>
<button class="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors">
<span class="material-symbols-outlined text-xl">content_copy</span>
</button>
</div>
<!-- Row: Reference Number -->
<div class="flex items-center justify-between p-4">
<div>
<p class="text-xs text-slate-500 dark:text-slate-400">Số tham chiếu</p>
<p class="font-medium text-sm">${Math.floor(Math.random()*1000000)}</p>
</div>
<button class="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors">
<span class="material-symbols-outlined text-xl">content_copy</span>
</button>
</div>
<!-- Row: Balance After -->
<div class="flex items-center justify-between p-4">
<div>
<p class="text-xs text-slate-500 dark:text-slate-400">Số dư sau giao dịch</p>
<p class="font-medium text-sm">-- VND</p>
</div>
<span class="material-symbols-outlined text-slate-400">account_balance_wallet</span>
</div>
<!-- Row: Fee -->
<div class="flex items-center justify-between p-4">
<div>
<p class="text-xs text-slate-500 dark:text-slate-400">Phí giao dịch</p>
<p class="font-medium text-sm text-primary">Miễn phí (0 VND)</p>
</div>
<span class="material-symbols-outlined text-slate-400">info</span>
</div>
</div>
</div>
<!-- Security Tip -->
<div class="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-3">
<span class="material-symbols-outlined text-primary">verified_user</span>
<p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Giao dịch này đã được xác thực bằng sinh trắc học và bảo mật 2 lớp. NeoBank không bao giờ yêu cầu mã OTP qua điện thoại.
            </p>
</div>
</main>
<!-- Footer Actions -->
<footer class="fixed bottom-0 left-0 right-0 p-4 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 notch-safe-bottom">
<div class="flex gap-3 max-w-lg mx-auto">
<button class="flex-1 flex items-center justify-center gap-2 h-14 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-colors">
<span class="material-symbols-outlined">receipt_long</span>
                Lưu biên lai
            </button>
<button class="flex-1 flex items-center justify-center gap-2 h-14 rounded-xl bg-primary text-slate-900 font-bold hover:opacity-90 transition-opacity">
<span class="material-symbols-outlined">history</span>
                Chuyển lại
            </button>
</div>
</footer>
    `;

    document.body.appendChild(detailOverlay);
    detailOverlay.querySelector('#btn-close-detail').addEventListener('click', () => {
      detailOverlay.classList.remove('animate-slide-up');
      detailOverlay.classList.add('animate-slide-down');
      setTimeout(() => detailOverlay.remove(), 300);
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

function formatTimeLong(iso) {
  const d = new Date(iso);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${day} thg ${month}, ${year} lúc ${hours}:${minutes}`;
}
