// ═══════════════════════════════════════════════════════
// NeoBank — Dashboard (User's exact Tailwind design)
// ═══════════════════════════════════════════════════════

import { api } from '../backend/api.js';
import { formatVND } from '../backend/db.js';
import { navigate } from '../components/router.js';
import { showToast } from '../components/toast.js';

export function renderDashboard(container, state = null) {
  let data = null;
  let balanceHidden = false;
  let showNotification = state;

  async function load() {
    renderSkeleton();
    const res = await api('dashboard');
    if (!res.ok) { showToast(res.error, 'error'); navigate('login'); return; }
    data = res;
    render();
  }

  function renderSkeleton() {
    container.className = 'screen';
    container.style.padding = '0';
    container.innerHTML = `
<div class="screen bg-background-dark font-display text-slate-100">
  <header class="sticky top-0 z-20 bg-background-dark/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-full bg-slate-800 animate-pulse"></div>
      <div><div class="w-24 h-3 bg-slate-800 rounded animate-pulse mb-2"></div><div class="w-32 h-4 bg-slate-800 rounded animate-pulse"></div></div>
    </div>
    <div class="w-10 h-10 rounded-full bg-slate-800 animate-pulse"></div>
  </header>
  <main class="px-6 pb-32">
    <div class="mt-6 h-48 bg-slate-800/40 rounded-xl animate-pulse"></div>
    <div class="mt-8 grid grid-cols-4 gap-4">${Array(4).fill('<div class="flex flex-col items-center gap-2"><div class="w-14 h-14 rounded-2xl bg-slate-800 animate-pulse"></div><div class="w-10 h-2 bg-slate-800 rounded animate-pulse"></div></div>').join('')}</div>
    <div class="mt-10 h-52 bg-slate-800/40 rounded-xl animate-pulse"></div>
  </main>
</div>`;
  }

  function render() {
    const user = data.user;
    const account = data.account;
    const transactions = data.transactions || [];
    const unreadCount = data.unreadNotifs || 0;
    const rawSpending = data.spending || [];

    // Transaction icon/color mapping
    const txMeta = {
      transfer: { icon: 'swap_horiz', color: 'blue', bg: 'bg-blue-500/10', text: 'text-blue-500' },
      qr_pay: { icon: 'qr_code_scanner', color: 'purple', bg: 'bg-purple-500/10', text: 'text-purple-500' },
      topup: { icon: 'add_circle', color: 'emerald', bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
      bill: { icon: 'receipt_long', color: 'orange', bg: 'bg-orange-500/10', text: 'text-orange-500' },
      salary: { icon: 'payments', color: 'emerald', bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
    };

    // Chart bars
    const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const spendingAmounts = rawSpending.map(s => s.amount || 0);
    const maxSpend = Math.max(...spendingAmounts, 1);
    const chartBars = rawSpending.map((s, i) => {
      const pct = Math.max((s.amount / maxSpend) * 100, 5);
      const isToday = i === rawSpending.length - 1;
      return `<div class="flex-1 flex flex-col items-center gap-2">
        <div class="w-full ${isToday ? 'bg-primary/60' : 'bg-slate-700'} rounded-t-lg relative" style="height:${pct}%">
          ${isToday ? '<div class="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-primary whitespace-nowrap">Hôm nay</div>' : ''}
        </div>
        <span class="text-[10px] font-medium text-slate-500">${s.day}</span>
      </div>`;
    }).join('');

    container.innerHTML = `
<div class="screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 flex flex-col font-display">
  <!-- Header -->
  <header class="notch-safe-top sticky top-0 z-20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
        <span class="material-symbols-outlined text-primary text-2xl">account_balance_wallet</span>
      </div>
      <div>
        <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Chào mừng trở lại,</p>
        <h1 class="text-base font-bold text-slate-900 dark:text-slate-100">${user.name}</h1>
      </div>
    </div>
    <div class="relative">
      <button id="btn-notif" class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border border-slate-300 dark:border-slate-700 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
        <span class="material-symbols-outlined text-slate-600 dark:text-slate-300">notifications</span>
      </button>
      ${unreadCount > 0 ? `<span class="absolute top-1 right-1 w-3 h-3 bg-red-500 border-2 border-background-light dark:border-background-dark rounded-full"></span>` : ''}
    </div>
  </header>

  <main class="flex-1 px-5 pb-28">
    <!-- Balance Card -->
    <section class="mt-6">
      <div class="glass-card rounded-xl p-6 relative overflow-hidden">
        <div class="absolute -top-12 -right-12 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
        <div class="flex justify-between items-start mb-8">
          <div class="px-3 py-1 bg-primary/20 border border-primary/30 rounded-full">
            <span class="text-[10px] font-bold tracking-widest text-primary uppercase">NeoBank ${user.priority ? 'Priority' : 'Standard'}</span>
          </div>
          <span class="material-symbols-outlined text-slate-600 dark:text-slate-400">contactless</span>
        </div>
        <div class="space-y-1">
          <div class="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <p class="text-sm font-medium">Tổng số dư</p>
            <span id="btn-toggle-balance" class="material-symbols-outlined text-sm cursor-pointer hover:text-primary transition-colors">${balanceHidden ? 'visibility_off' : 'visibility'}</span>
          </div>
          <h2 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            ${balanceHidden ? '••••••••' : formatVND(account.balance).replace('₫', '')} <span class="text-lg font-medium text-primary">VND</span>
          </h2>
        </div>
        <div class="mt-8 flex justify-between items-end">
          <div class="text-xs text-slate-500 tracking-[0.2em]">${String(account.accountNumber).replace(/(.{4})/g, '$1 ').trim()}</div>
          <div class="w-10 h-6 bg-slate-200 dark:bg-white/10 rounded flex items-center justify-center">
            <div class="flex -space-x-2">
              <div class="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div class="w-3 h-3 rounded-full bg-orange-500/80"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="mt-5 grid grid-cols-4 gap-3 text-center">
      <div class="flex flex-col items-center gap-2 cursor-pointer" id="qa-transfer">
        <div class="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center border border-slate-200 dark:border-slate-700 active:scale-95 transition-transform">
          <span class="material-symbols-outlined text-primary">swap_horiz</span>
        </div>
        <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Chuyển khoản</span>
      </div>
      <div class="flex flex-col items-center gap-2 cursor-pointer" id="qa-qr">
        <div class="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center border border-slate-200 dark:border-slate-700 active:scale-95 transition-transform">
          <span class="material-symbols-outlined text-primary">qr_code_scanner</span>
        </div>
        <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">QR Pay</span>
      </div>
      <div class="flex flex-col items-center gap-2 cursor-pointer" id="qa-topup">
        <div class="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center border border-slate-200 dark:border-slate-700 active:scale-95 transition-transform">
          <span class="material-symbols-outlined text-primary">add_circle</span>
        </div>
        <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nạp tiền</span>
      </div>
      <div class="flex flex-col items-center gap-2 cursor-pointer" id="qa-bills">
        <div class="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center border border-slate-200 dark:border-slate-700 active:scale-95 transition-transform">
          <span class="material-symbols-outlined text-primary">receipt_long</span>
        </div>
        <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hóa đơn</span>
      </div>
    </section>

    <!-- Spending Summary -->
    <section class="mt-6">
      <div class="flex justify-between items-center mb-4 cursor-pointer">
        <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100">Thống kê chi tiêu</h3>
        <span class="material-symbols-outlined text-slate-400">expand_more</span>
      </div>
      <div class="bg-white dark:bg-slate-800/40 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700/50">
        <div class="flex items-end justify-between h-32 gap-3" id="spending-chart">
          ${chartBars}
        </div>
        <div class="mt-4 flex flex-wrap gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-primary"></div>
            <span class="text-xs text-slate-500 dark:text-slate-400">Sức khoẻ & Vẻ đẹp (Medical & Beauty)</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span class="text-xs text-slate-500 dark:text-slate-400">Ăn uống (F&B)</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-purple-500"></div>
            <span class="text-xs text-slate-500 dark:text-slate-400">Hóa đơn (Bills)</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Recent Transactions -->
    <section class="mt-10">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100">Giao dịch gần đây</h3>
        <a class="text-sm font-semibold text-primary" href="#history">Xem tất cả</a>
      </div>
      <div class="space-y-4" id="tx-list">
        ${transactions.slice(0, 5).map(tx => {
          const meta = txMeta[tx.type] || txMeta.transfer;
          const isIncoming = tx.direction === 'in';
          return `
          <div class="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-transparent dark:hover:bg-slate-800/40 shadow-sm dark:shadow-none border border-slate-100 dark:border-transparent transition-colors cursor-pointer tx-row" data-tx-id="${tx.id}">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-full ${meta.bg} flex items-center justify-center">
                <span class="material-symbols-outlined ${meta.text}">${meta.icon}</span>
              </div>
              <div>
                <p class="font-bold text-slate-900 dark:text-slate-100">${tx.otherParty || (isIncoming ? 'Nhận tiền' : 'Chuyển khoản')}</p>
                <p class="text-xs text-slate-500 uppercase font-medium mt-0.5">${formatTime(tx.createdAt)}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="font-bold ${isIncoming ? 'text-emerald-500' : 'text-rose-500'}">${tx.displayAmount || ((isIncoming ? '+' : '-') + formatVND(tx.amount).replace('₫', ''))}</p>
              ${tx.note ? `<p class="text-[10px] text-slate-500 font-medium leading-tight mt-0.5 max-w-[120px] truncate">${tx.note}</p>` : ''}
            </div>
          </div>`;
        }).join('')}
        ${transactions.length === 0 ? '<p class="text-center text-slate-500 text-sm py-4">Chưa có giao dịch nào</p>' : ''}
      </div>
    </section>
  </main>

  ${showNotification ? `
  <!-- Notification Overlay -->
  <div id="transfer-success-notification" class="fixed inset-x-0 top-0 z-50 pointer-events-none flex flex-col items-center px-4 pt-4 animate-slide-down">
    <div class="pointer-events-auto w-full max-w-lg bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-4 shadow-2xl flex items-center gap-3">
      <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
        <span class="material-symbols-outlined text-primary">notifications_active</span>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex justify-between items-baseline mb-0.5">
          <h4 class="text-white font-semibold text-sm truncate">Thông báo biến động số dư</h4>
          <span class="text-slate-400 text-[10px] ml-2 shrink-0">bây giờ</span>
        </div>
        <p class="text-slate-200 text-xs leading-tight line-clamp-2">
          TK ${String(account.accountNumber).slice(-4)}|GD: -${formatVND(showNotification.amount).replace('₫', '')}VND ${new Date().toLocaleDateString('vi-VN', {day:'2-digit', month:'2-digit', year:'2-digit'})} ${new Date().toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})} |SD: ${formatVND(account.balance).replace('₫', '')}VND|DEN: ${showNotification.accName.toUpperCase()}...
        </p>
      </div>
    </div>
  </div>
  ` : ''}

</div>`;

    attachEvents();
    
    if (showNotification) {
      setTimeout(() => {
        const notif = container.querySelector('#transfer-success-notification');
        if (notif) {
          notif.style.opacity = '0';
          notif.style.transform = 'translateY(-20px)';
          notif.style.transition = 'all 0.4s ease-out';
          setTimeout(() => notif.remove(), 400);
        }
        showNotification = null;
      }, 5000);
    }
  }

  function attachEvents() {
    container.querySelector('#btn-toggle-balance')?.addEventListener('click', () => {
      balanceHidden = !balanceHidden;
      render();
    });

    container.querySelector('#btn-notif')?.addEventListener('click', () => navigate('notifications'));
    container.querySelector('#qa-transfer')?.addEventListener('click', () => navigate('transfer'));
    container.querySelector('#qa-qr')?.addEventListener('click', () => navigate('qr'));
    container.querySelector('#qa-topup')?.addEventListener('click', () => showToast('Nạp tiền — coming soon', 'info'));
    container.querySelector('#qa-bills')?.addEventListener('click', () => showToast('Hóa đơn — coming soon', 'info'));
    container.querySelector('#btn-see-all')?.addEventListener('click', () => navigate('history'));
  }

  function formatTime(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} giờ trước`;
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  load();
}
