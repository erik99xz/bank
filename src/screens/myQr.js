// ═══════════════════════════════════════════════════════
// NeoBank — My Personal QR Code Screen
// ═══════════════════════════════════════════════════════

import { api } from '../backend/api.js';
import { navigate } from '../components/router.js';
import { showToast } from '../components/toast.js';

export function renderMyQr(container) {
  async function load() {
    container.innerHTML = `<div class="p-8 text-center text-slate-500">Loading...</div>`;
    const res = await api('profile');
    const user = res.ok ? res.user : { name: 'LƯU GIA BẢO' };
    const account = res.ok ? res.account : { accountNumber: '9901 2345 6789', balance: 5240000 };

    render(user, account);
  }

  function render(user, account) {
    const formattedAcc = String(account.accountNumber).replace(/(.{4})/g, '$1 ').trim();
    const formattedBal = new Intl.NumberFormat('vi-VN').format(account.balance) + ' VND';
    // Mặc định xài tên LƯU GIA BẢO nếu được yêu cầu tĩnh, nhưng ưu tiên tên user để real-time
    const displayName = 'LƯU GIA BẢO'; // Hoặc user.name tuỳ logic, nhưng user y/c "Chủ tài khoản LƯU GIA BẢO"

    container.innerHTML = `
      <div class="relative flex min-h-[100dvh] w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
        
        <!-- Header / Navigation Bar -->
        <header class="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800" style="padding-top: env(safe-area-inset-top);">
          <div class="flex items-center p-4 justify-between max-w-md mx-auto">
            <div id="btn-back" class="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer">
              <span class="material-symbols-outlined text-slate-900 dark:text-slate-100">arrow_back</span>
            </div>
            <h2 class="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">My QR Code</h2>
            <div class="flex size-10 items-center justify-end">
              <button class="flex size-10 cursor-pointer items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                <span class="material-symbols-outlined text-slate-900 dark:text-slate-100">more_horiz</span>
              </button>
            </div>
          </div>
        </header>

        <main class="max-w-md mx-auto w-full pb-12 flex-1 animate-fade-in">
          <!-- Main QR Card Section -->
          <div class="p-6">
            <div class="flex flex-col items-center justify-start rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-8 shadow-2xl relative overflow-hidden animate-pop" style="animation-delay: 0.1s">
              <!-- Decorative background elements -->
              <div class="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <div class="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -ml-12 -mb-12"></div>
              
              <!-- QR Code Display -->
              <div class="w-full aspect-square bg-white p-4 rounded-xl shadow-inner mb-6 flex items-center justify-center relative group">
                <div class="w-full h-full bg-center bg-no-repeat bg-contain" style='background-image: url("data:image/png;base64,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")'></div>
                <div class="absolute inset-0 flex items-center justify-center bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl cursor-pointer">
                  <span class="material-symbols-outlined text-primary text-4xl">zoom_in</span>
                </div>
              </div>
              
              <div class="flex w-full flex-col items-center text-center gap-2">
                <p class="text-primary text-sm font-semibold uppercase tracking-wider">Personal Payment QR</p>
                <p class="text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight">${displayName}</p>
                <p class="text-slate-500 dark:text-slate-400 text-sm font-normal">Quét để chuyển tiền ngay lập tức</p>
              </div>

              <!-- Account Info Box -->
              <div class="mt-8 w-full">
                <div class="flex flex-col items-stretch justify-between gap-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <div class="flex items-center justify-between">
                    <div class="flex flex-col gap-1">
                      <p class="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase">TÀI KHOẢN CHÍNH</p>
                      <p class="text-slate-900 dark:text-slate-100 text-base font-bold">${formattedAcc}</p>
                    </div>
                    <button class="flex items-center justify-center size-8 rounded-lg bg-primary text-background-dark hover:opacity-90 transition-opacity" onclick="navigator.clipboard?.writeText('${account.accountNumber.replace(/\s/g, '')}'); window.dispatchEvent(new CustomEvent('toast', {detail: {message:'Đã sao chép số tài khoản', type:'success'}}));">
                      <span class="material-symbols-outlined text-[18px]">content_copy</span>
                    </button>
                  </div>
                  <div class="h-px bg-slate-200 dark:border-slate-800 w-full"></div>
                  <div class="flex items-center justify-between">
                    <p class="text-slate-500 dark:text-slate-400 text-sm">Số dư khả dụng</p>
                    <p class="text-slate-900 dark:text-slate-100 text-lg font-bold">${formattedBal}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="px-6 flex gap-3 mb-8 animate-fade-in" style="animation-delay: 0.2s">
            <button class="flex-1 flex items-center justify-center gap-2 h-12 bg-primary text-background-dark rounded-xl font-bold hover:opacity-90 transition-opacity">
              <span class="material-symbols-outlined">share</span>
              Chia sẻ
            </button>
            <button class="flex-1 flex items-center justify-center gap-2 h-12 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700">
              <span class="material-symbols-outlined">download</span>
              Lưu ảnh
            </button>
          </div>

        </main>
      </div>
    `;

    // Bi-directional toast listener (hack for inline onclick)
    window.addEventListener('toast', (e) => {
      showToast(e.detail.message, e.detail.type);
    }, { once: true });

    container.querySelector('#btn-back').addEventListener('click', () => navigate(-1));
  }

  load();
}
