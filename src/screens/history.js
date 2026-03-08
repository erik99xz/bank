// ═══════════════════════════════════════════════════════
// NeoBank — Transaction History Screen
// ═══════════════════════════════════════════════════════

import { api } from '../backend/api.js';
import { formatVND } from '../backend/db.js';
import { navigate } from '../components/router.js';
import { showModal, closeModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { skeletonRows } from '../components/skeleton.js';
import { captureAndShareReceipt } from '../utils/receipt.js';

export function renderHistory(container) {
  let filter = 'all';
  let searchQuery = '';
  let transactions = [];

  async function load() {
    container.innerHTML = `
      <div class="screen-content">
        <div class="page-header"><h1 class="page-title">Lịch sử giao dịch</h1></div>
        ${skeletonRows(6)}
      </div>`;
    const res = await api('transactions', { type: filter, search: searchQuery });
    if (!res.ok) { showToast(res.error, 'error'); return; }
    transactions = res.transactions;
    render();
  }

  function render() {
    // Group transactions by Date
    const grouped = {};
    const todayStr = new Date().toLocaleDateString('vi-VN');
    const yesterdayStr = new Date(Date.now() - 86400000).toLocaleDateString('vi-VN');

    transactions.forEach(tx => {
      const dateStr = new Date(tx.createdAt).toLocaleDateString('vi-VN');
      let groupName = dateStr;
      if (dateStr === todayStr) groupName = 'Hôm nay';
      else if (dateStr === yesterdayStr) groupName = 'Hôm qua';

      if (!grouped[groupName]) grouped[groupName] = [];
      grouped[groupName].push(tx);
    });

    function getTailwindIcon(type, direction) {
      if (type === 'transfer') return direction === 'in' ? { icon: 'payments', bg: 'bg-primary/10 dark:bg-primary/20 text-primary' } : { icon: 'swap_horiz', bg: 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100' };
      if (type === 'qr_pay') return { icon: 'qr_code_scanner', bg: 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100' };
      if (type === 'topup') return { icon: 'add_circle', bg: 'bg-primary/10 dark:bg-primary/20 text-primary' };
      if (type === 'bill') return { icon: 'receipt_long', bg: 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100' };
      return { icon: 'account_balance_wallet', bg: 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100' };
    }

    container.innerHTML = `
      <div class="relative flex screen w-full flex-col max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-2xl overflow-hidden">
        <!-- Header -->
        <header class="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
          <div class="flex items-center p-4 justify-between notch-safe-top">
            <button id="btn-back" class="flex size-10 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors" onclick="history.back()">
              <span class="material-symbols-outlined text-slate-900 dark:text-slate-100">arrow_back</span>
            </button>
            <h1 class="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight">Lịch sử giao dịch</h1>
            <button class="flex size-10 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
              <span class="material-symbols-outlined text-slate-900 dark:text-slate-100">download</span>
            </button>
          </div>
          <!-- Search Bar -->
          <div class="px-4 pb-4">
            <label class="relative flex items-center w-full">
              <span class="material-symbols-outlined absolute left-4 text-slate-400">search</span>
              <input id="inp-search" class="w-full h-12 pl-12 pr-4 bg-slate-100 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none" placeholder="Tìm kiếm giao dịch" type="text" value="${searchQuery}"/>
            </label>
          </div>
          <!-- Filters -->
          <div class="flex gap-2 px-4 pb-4 overflow-x-auto hide-scrollbar">
            ${['all', 'transfer', 'qr_pay', 'topup', 'bill'].map(f => `
              <button class="filter-pill flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors ${filter === f ? 'bg-primary/10 dark:bg-primary/20 border border-primary/30 text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}" data-filter="${f}">
                ${getFilterLabel(f)}
              </button>
            `).join('')}
          </div>
        </header>

        <!-- Transaction List -->
        <main class="flex-1 overflow-y-auto px-4 py-4 space-y-6 pb-24">
          ${Object.keys(grouped).length === 0 ? '<p class="text-sm text-slate-500 text-center py-10">Không có giao dịch nào</p>' : ''}
          ${Object.entries(grouped).map(([date, txs]) => `
          <div>
            <h3 class="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">${date}</h3>
            <div class="space-y-3">
              ${txs.map(tx => {
                const isIncoming = tx.direction === 'in';
                const style = getTailwindIcon(tx.type, tx.direction);
                return `
                <div class="tx-item flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 cursor-pointer active:scale-95 transition-transform" data-tx-id="${tx.id}">
                  <div class="flex items-center gap-3">
                    <div class="size-11 flex items-center justify-center rounded-full ${style.bg}">
                      <span class="material-symbols-outlined">${style.icon}</span>
                    </div>
                    <div>
                      <p class="font-semibold text-slate-900 dark:text-slate-100">${tx.otherParty || (isIncoming ? 'Nhận tiền' : 'Chuyển khoản')}</p>
                      <p class="text-sm text-slate-500">${new Date(tx.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} • ${getFilterLabel(tx.type)}</p>
                    </div>
                  </div>
                  <p class="font-bold ${isIncoming ? 'text-emerald-500' : 'text-slate-900 dark:text-slate-100'} text-right">
                    ${tx.displayAmount || ((isIncoming ? '+' : '-') + formatVND(tx.amount).replace('₫', ''))}
                    ${tx.note ? `<br/><span class="text-[11px] text-slate-500 font-normal leading-tight">${tx.note}</span>` : ''}
                  </p>
                </div>`;
              }).join('')}
            </div>
          </div>
          `).join('')}
        </main>
      </div>`;

    // Search
    let searchTimer;
    container.querySelector('#inp-search').addEventListener('input', (e) => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        searchQuery = e.target.value.trim();
        load();
      }, 400);
    });

    // Filter
    container.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        filter = pill.dataset.filter;
        load();
      });
    });

    // Transaction detail
    container.querySelectorAll('.tx-item[data-tx-id]').forEach(item => {
      item.addEventListener('click', () => {
        const tx = transactions.find(t => t.id === item.dataset.txId);
        if (tx) showTxDetail(tx);
      });
    });
  }

  function showTxDetail(tx) {
    let detailScreen = container.querySelector('#tx-detail-screen');
    if (!detailScreen) {
      detailScreen = document.createElement('div');
      detailScreen.id = 'tx-detail-screen';
      detailScreen.className = 'fixed inset-0 z-[100] bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display flex flex-col overflow-y-auto';
      detailScreen.style.display = 'none';
      container.appendChild(detailScreen);
    }

    const isIncoming = tx.direction === 'in';
    const amountPrefix = isIncoming ? '+' : '-';
    const initials = tx.otherParty ? tx.otherParty.split(' ').map(n => n[0]).join('').slice(0, 2) : 'NB';
    
    // Format date strings
    const txDate = new Date(tx.createdAt);
    const dateStr = txDate.toLocaleDateString('vi-VN', {day:'2-digit', month:'short', year:'numeric'});
    const timeStr = txDate.toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'});
    
    // Use fallback for transaction ID if not present
    const txIdDisplay = tx.id || ('FT' + Math.floor(Math.random()*1000000000000));
    const refCodeDisplay = tx.ref || String(Math.floor(Math.random()*1000000)).padStart(6, '0');
    
    detailScreen.innerHTML = `
<div id="tx-capture-area" class="flex flex-col flex-1 bg-background-light dark:bg-background-dark">
<!-- Header / Top App Bar -->
<header class="notch-safe sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
<div class="flex items-center justify-between p-4">
<button id="btn-close-tx-detail" class="flex size-10 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
<span class="material-symbols-outlined text-2xl">arrow_back</span>
</button>
<h1 class="text-lg font-bold leading-tight tracking-tight">Chi tiết giao dịch</h1>
<button id="btn-share-tx-top" class="flex size-10 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
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
<div class="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full ${isIncoming ? 'bg-emerald-500' : 'bg-red-500'} text-white border-4 border-background-dark">
<span class="material-symbols-outlined text-lg">${isIncoming ? 'call_received' : 'call_made'}</span>
</div>
</div>
<div class="text-center space-y-1">
<p class="text-primary font-medium text-sm bg-primary/10 px-3 py-1 rounded-full inline-block">Giao dịch thành công</p>
<h2 class="text-3xl font-bold tracking-tight pt-2 ${isIncoming ? 'text-emerald-500' : ''}">${amountPrefix} ${formatVND(tx.amount).replace('₫', '')} VND</h2>
<p class="text-slate-500 dark:text-slate-400 text-sm">${dateStr} lúc ${timeStr}</p>
</div>
</div>
<!-- Recipient Information Card -->
<div class="bg-white dark:bg-slate-800/50 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700/50 mb-4">
<div class="flex items-center gap-4">
<div class="size-14 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-xl font-bold uppercase">${initials}</div>
<div class="flex-1">
<p class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">${isIncoming ? 'Người gửi' : 'Người nhận'}</p>
<p class="text-lg font-bold">${tx.otherParty || (isIncoming ? 'Ngân hàng' : 'Người nhận')}</p>
<p class="text-sm text-slate-500 dark:text-slate-400">${tx.bank || 'Mã tài khoản: ' + (tx.toUserId || 'Tài khoản')}</p>
</div>
</div>
<div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
<p class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Nội dung</p>
<p class="text-sm font-medium mt-1 italic text-slate-700 dark:text-slate-300">"${tx.note || 'Không có nội dung'}"</p>
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
<p class="font-medium text-sm">${txIdDisplay}</p>
</div>
<button class="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors">
<span class="material-symbols-outlined text-xl">content_copy</span>
</button>
</div>
<!-- Row: Reference Number -->
<div class="flex items-center justify-between p-4">
<div>
<p class="text-xs text-slate-500 dark:text-slate-400">Số tham chiếu</p>
<p class="font-medium text-sm">${refCodeDisplay}</p>
</div>
<button class="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors">
<span class="material-symbols-outlined text-xl">content_copy</span>
</button>
</div>
${tx.balanceAfter ? `
<!-- Row: Balance After -->
<div class="flex items-center justify-between p-4">
<div>
<p class="text-xs text-slate-500 dark:text-slate-400">Số dư sau giao dịch</p>
<p class="font-medium text-sm">${formatVND(tx.balanceAfter).replace('₫', '')} VND</p>
</div>
<span class="material-symbols-outlined text-slate-400">account_balance_wallet</span>
</div>` : ''}
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
<span class="material-symbols-outlined text-primary shrink-0">verified_user</span>
<p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
    Giao dịch này đã được xác thực bằng sinh trắc học và bảo mật 2 lớp. NeoBank không bao giờ yêu cầu mã OTP qua điện thoại.
</p>
</div>
</main>
</div>
<!-- Footer Actions -->
<footer class="bottom-safe fixed bottom-0 left-0 right-0 p-4 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800">
<div class="flex gap-3 max-w-lg mx-auto">
<button id="btn-save-receipt" class="flex-1 flex items-center justify-center gap-2 h-14 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-colors">
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
    
    // Attach close event
    detailScreen.querySelector('#btn-close-tx-detail').addEventListener('click', () => {
      detailScreen.style.display = 'none';
      detailScreen.remove(); // Cleanup to avoid duplicate listeners on recreate
    });

    // Receipt sharing
    const shareHandler = () => captureAndShareReceipt('tx-capture-area', `NeoBank-Receipt-${txIdDisplay}.png`);
    detailScreen.querySelector('#btn-share-tx-top')?.addEventListener('click', shareHandler);
    detailScreen.querySelector('#btn-save-receipt')?.addEventListener('click', shareHandler);
    
    detailScreen.style.display = 'flex';
  }

  load();
}

function getFilterLabel(f) {
  const labels = { all: 'Tất cả', transfer: 'Chuyển tiền', qr_pay: 'QR Pay', topup: 'Nạp tiền', bill: 'Hóa đơn' };
  return labels[f] || f;
}

function getTxIcon(type) {
  return { transfer: '💸', topup: '📲', bill: '🧾', qr_pay: '📱' }[type] || '💰';
}

function getTxBg(type) {
  return { transfer: 'rgba(0,212,170,0.12)', topup: 'rgba(255,165,2,0.12)', bill: 'rgba(124,58,237,0.12)', qr_pay: 'rgba(0,180,216,0.12)' }[type] || 'rgba(0,212,170,0.12)';
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
