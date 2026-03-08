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
    const formattedAcc = '07 7744 0600'; // Override per user request
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
              <div class="w-full aspect-square bg-white p-2 rounded-xl shadow-inner mb-6 flex items-center justify-center relative group">
                <div class="w-full h-full bg-center bg-no-repeat bg-contain" style='background-image: url("./qr.png")'></div>
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
                    <button class="flex items-center justify-center size-8 rounded-lg bg-primary text-background-dark hover:opacity-90 transition-opacity" onclick="navigator.clipboard?.writeText('0777440600'); window.dispatchEvent(new CustomEvent('toast', {detail: {message:'Đã sao chép số tài khoản', type:'success'}}));">
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
