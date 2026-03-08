// ═══════════════════════════════════════════════════════
// NeoBank — Transfer Screen (User's exact Tailwind design)
// Vietnamese ebank style
// ═══════════════════════════════════════════════════════

import { api } from '../backend/api.js';
import { DB, formatVND } from '../backend/db.js';
import { navigate } from '../components/router.js';
import { showToast } from '../components/toast.js';

export function renderTransfer(container) {
  let selectedBank = 'MB';
  let quickAmounts = [100000, 500000, 1000000, 2000000, 5000000];
  let selectedQuick = null;
  let isProcessing = false;
  let otpTimerInterval = null;

  const banks = [
    { code: 'MB', name: 'MBBank', full: 'Ngân hàng Quân đội', logo: 'https://cdn.vietqr.io/img/MB.png', bin: '970422' },
    { code: 'TCB', name: 'Techcombank', full: 'NH Kỹ Thương', logo: 'https://cdn.vietqr.io/img/TCB.png', bin: '970407' },
    { code: 'VCB', name: 'Vietcombank', full: 'NH Ngoại Thương', logo: 'https://cdn.vietqr.io/img/VCB.png', bin: '970436' },
    { code: 'BIDV', name: 'BIDV', full: 'Đầu tư & Phát triển', logo: 'https://cdn.vietqr.io/img/BIDV.png', bin: '970418' },
    { code: 'ACB', name: 'ACB', full: 'Á Châu', logo: 'https://cdn.vietqr.io/img/ACB.png', bin: '970416' },
    { code: 'VPB', name: 'VPBank', full: 'Việt Nam Thịnh Vượng', logo: 'https://cdn.vietqr.io/img/VPB.png', bin: '970432' },
    { code: 'TPB', name: 'TPBank', full: 'Tiên Phong', logo: 'https://cdn.vietqr.io/img/TPB.png', bin: '970423' },
    { code: 'STB', name: 'Sacombank', full: 'Sài Gòn Thương Tín', logo: 'https://cdn.vietqr.io/img/STB.png', bin: '970403' },
    { code: 'VTB', name: 'VietinBank', full: 'Công Thương Việt Nam', logo: 'https://cdn.vietqr.io/img/CTG.png', bin: '970415' },
    { code: 'AGB', name: 'Agribank', full: 'NN&PT Nông thôn VN', logo: 'https://cdn.vietqr.io/img/VBA.png', bin: '970405' },
    { code: 'OCB', name: 'OCB', full: 'Phương Đông', logo: 'https://cdn.vietqr.io/img/OCB.png', bin: '970448' },
    { code: 'HDB', name: 'HDBank', full: 'Phát triển TPHCM', logo: 'https://cdn.vietqr.io/img/HDB.png', bin: '970437' },
    { code: 'SCB', name: 'SCB', full: 'Sài Gòn', logo: 'https://cdn.vietqr.io/img/SCB.png', bin: '970429' },
    { code: 'VIB', name: 'VIB', full: 'Quốc tế', logo: 'https://cdn.vietqr.io/img/VIB.png', bin: '970441' },
    { code: 'SHB', name: 'SHB', full: 'Sài Gòn - Hà Nội', logo: 'https://cdn.vietqr.io/img/SHB.png', bin: '970443' },
    { code: 'EIB', name: 'Eximbank', full: 'Xuất Nhập Khẩu', logo: 'https://cdn.vietqr.io/img/EIB.png', bin: '970431' },
    { code: 'MSB', name: 'MSB', full: 'Hàng Hải', logo: 'https://cdn.vietqr.io/img/MSB.png', bin: '970426' },
    { code: 'CAKE', name: 'CAKE', full: 'TMCP Việt Nam Thịnh Vượng - Ngân hàng số CAKE by VPBank', logo: 'https://cdn.vietqr.io/img/CAKE.png', bin: '546034' },
    { code: 'UBANK', name: 'Ubank', full: 'TMCP Việt Nam Thịnh Vượng - Ngân hàng số Ubank by VPBank', logo: 'https://cdn.vietqr.io/img/UBANK.png', bin: '546035' },
    { code: 'VTMONEY', name: 'ViettelMoney', full: 'Tổng Công ty Dịch vụ số Viettel', logo: 'https://ui-avatars.com/api/?name=VTPay&background=ee0033&color=fff&rounded=true', bin: '971005' },
    { code: 'TIMO', name: 'Timo', full: 'Ngân hàng số Timo by Bản Việt', logo: 'https://cdn.vietqr.io/img/TIMO.png', bin: '963388' },
    { code: 'VNPTMONEY', name: 'VNPTMoney', full: 'VNPT Money', logo: 'https://cdn.vietqr.io/img/VNPTMONEY.png', bin: '971011' },
    { code: 'SGB', name: 'SaigonBank', full: 'Sài Gòn Công Thương', logo: 'https://ui-avatars.com/api/?name=SGB&background=0066b3&color=fff&rounded=true', bin: '970400' },
    { code: 'BAB', name: 'BacABank', full: 'Bắc Á', logo: 'https://cdn.vietqr.io/img/BAB.png', bin: '970409' },
    { code: 'MOMO', name: 'MoMo', full: 'Ví điện tử MoMo', logo: 'https://ui-avatars.com/api/?name=MoMo&background=a50064&color=fff&rounded=true', bin: '971025' },
    { code: 'PVC', name: 'PVcomBank', full: 'Đại chúng', logo: 'https://cdn.vietqr.io/img/PVCB.png', bin: '971133' },
    { code: 'NCB', name: 'NCB', full: 'Quốc Dân', logo: 'https://cdn.vietqr.io/img/NCB.png', bin: '970419' },
    { code: 'SHAN', name: 'ShinhanBank', full: 'TNHH MTV Shinhan Việt Nam', logo: 'https://ui-avatars.com/api/?name=Shinhan&background=0046ff&color=fff&rounded=true', bin: '970424' },
    { code: 'ABB', name: 'ABBANK', full: 'An Bình', logo: 'https://cdn.vietqr.io/img/ABB.png', bin: '970425' },
    { code: 'VAB', name: 'VietABank', full: 'Việt Á', logo: 'https://cdn.vietqr.io/img/VAB.png', bin: '970427' },
    { code: 'NAB', name: 'NamABank', full: 'Nam Á', logo: 'https://cdn.vietqr.io/img/NAB.png', bin: '970428' },
    { code: 'PGB', name: 'PGBank', full: 'Xăng dầu Petrolimex', logo: 'https://cdn.vietqr.io/img/PGB.png', bin: '970430' },
    { code: 'VB', name: 'VietBank', full: 'Việt Nam Thương Tín', logo: 'https://cdn.vietqr.io/img/VIETBANK.png', bin: '970433' },
    { code: 'BVB', name: 'BaoVietBank', full: 'Bảo Việt', logo: 'https://cdn.vietqr.io/img/BVB.png', bin: '970438' },
    { code: 'SEAB', name: 'SeABank', full: 'Đông Nam Á', logo: 'https://cdn.vietqr.io/img/SEAB.png', bin: '970440' },
    { code: 'COOP', name: 'COOPBANK', full: 'Hợp tác xã Việt Nam', logo: 'https://cdn.vietqr.io/img/COOPBANK.png', bin: '970446' },
    { code: 'LPB', name: 'LPBank', full: 'Lộc Phát Việt Nam', logo: 'https://cdn.vietqr.io/img/LPB.png', bin: '970449' },
    { code: 'KLB', name: 'KienLongBank', full: 'Kiên Long', logo: 'https://cdn.vietqr.io/img/KLB.png', bin: '970452' },
    { code: 'KBL', name: 'KBank', full: 'Đại chúng TNHH Kasikornbank', logo: 'https://cdn.vietqr.io/img/KBANK.png', bin: '668888' },
    { code: 'VCCB', name: 'VietCapitalBank', full: 'Bản Việt', logo: 'https://ui-avatars.com/api/?name=BVBank&background=0055a5&color=fff&rounded=true', bin: '970454' },
    { code: 'HLB', name: 'HongLeong', full: 'TNHH MTV Hong Leong Việt Nam', logo: 'https://cdn.vietqr.io/img/HLB.png', bin: '970442' }
  ];

  let draftData = window.draftTransfer;
  if (draftData) {
    window.draftTransfer = null;
    
    // Map bin to code
    const matchingBank = banks.find(b => b.bin === draftData.bankBin);
    if (matchingBank) {
      selectedBank = matchingBank.code;
    } else {
      const dynName = 'Bank BIN: ' + (draftData.bankBin || 'N/A');
      banks.push({
        code: draftData.bankBin,
        name: 'Ngân hàng khác',
        full: dynName,
        logo: `https://ui-avatars.com/api/?name=Khác&background=0db9f2&color=fff&rounded=true`,
        bin: draftData.bankBin
      });
      selectedBank = draftData.bankBin;
    }
  }

  // Get user data
  const token = localStorage.getItem('neo_userId');
  const user = DB.users.find(u => u.id === token);
  const account = user ? DB.accounts.find(a => a.userId === user.id) : null;
  const balance = account ? account.balance : 0;

  // Recent recipients from transaction history
  const recentRecipients = getRecentRecipients();

  function render() {
    container.className = 'screen';
    container.style.padding = '0';

    const currentBank = banks.find(b => b.code === selectedBank) || banks[0];
    let defaultNote = user ? removeVietnameseTones(user.name).toUpperCase() + ' chuyen tien' : 'Chuyen tien NeoBank';

    container.innerHTML = `
<div class="screen font-display text-slate-100 flex flex-col">
  <!-- Header -->
  <header class="flex items-center justify-between p-4 sticky top-0 bg-background-dark/80 backdrop-blur-md z-20 notch-safe-top">
    <button id="btn-back" class="p-2 rounded-full hover:bg-slate-800 transition-colors">
      <span class="material-symbols-outlined block">arrow_back</span>
    </button>
    <h1 class="text-lg font-bold">Chuyển tiền</h1>
    <button id="btn-qr" class="p-2 rounded-full hover:bg-slate-800 transition-colors">
      <span class="material-symbols-outlined block">qr_code_scanner</span>
    </button>
  </header>

  <main class="flex-1 px-4 pb-40">


    <!-- Transfer Form -->
    <div class="mt-6 space-y-4">
      <!-- Chọn ngân hàng -->
      <div class="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
        <label class="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Ngân hàng thụ hưởng</label>
        <button id="btn-select-bank" class="w-full flex items-center justify-between py-2">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden">
              <img src="${currentBank.logo}" alt="${currentBank.code}" class="w-full h-full object-contain p-1 drop-shadow-sm" />
            </div>
            <span class="font-medium text-sm">${currentBank.name} - ${currentBank.full}</span>
          </div>
          <span class="material-symbols-outlined text-slate-400">expand_more</span>
        </button>
      </div>

      <!-- Số tài khoản + Tên -->
      <div class="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30 space-y-4">
        <div>
          <label class="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Số tài khoản</label>
          <input id="inp-account" class="w-full bg-transparent border-none p-0 focus:ring-0 text-lg font-semibold text-slate-100 placeholder-slate-600 outline-none" placeholder="Nhập số tài khoản" type="text"/>
        </div>
        <div class="pt-4 border-t border-slate-700/30" id="account-name-row" style="display:none">
          <label class="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Tên tài khoản</label>
          <div class="flex items-center gap-2 text-primary" id="account-name-display-container">
            <span id="account-name" class="font-bold uppercase"></span>
            <span class="material-symbols-outlined text-sm" id="account-name-verified-icon">verified</span>
          </div>
          <input id="inp-account-name" class="w-full bg-transparent border-b border-slate-600 p-1 mt-1 focus:border-primary focus:ring-0 text-sm font-bold text-slate-100 placeholder-slate-500 outline-none uppercase" placeholder="Nhập tên người thụ hưởng" type="text" style="display:none"/>
        </div>
      </div>

      <!-- Số tiền -->
      <div class="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
        <label class="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1 text-center">Số tiền (VND)</label>
        <div class="flex items-center justify-center gap-2 py-2">
          <input id="inp-amount" class="bg-transparent border-none text-3xl font-bold text-center w-full focus:ring-0 p-0 text-slate-100 placeholder-slate-600 outline-none" placeholder="0" type="text"/>
        </div>
        <p class="text-[10px] text-center text-slate-500">Khả dụng: ${formatVND(balance)}</p>
        <div class="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar shrink-0" id="quick-amounts">
        </div>
      </div>

      <!-- Nội dung chuyển khoản -->
      <div class="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
        <label class="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Nội dung chuyển khoản</label>
        <input id="inp-note" class="w-full bg-transparent border-none p-0 focus:ring-0 text-sm text-slate-100 placeholder-slate-600 outline-none" placeholder="Nhập nội dung (tùy chọn)" type="text" value="${defaultNote}"/>
      </div>
    </div>
  </main>

  <!-- Floating Continue Button -->
  <div class="fixed bottom-28 left-0 right-0 px-4 z-20 max-w-[430px] mx-auto">
    <button id="btn-continue" class="w-full bg-primary hover:bg-primary/90 text-slate-900 font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 text-base" ${isProcessing ? 'disabled' : ''}>
      ${isProcessing ? `
        <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
        Đang xử lý...
      ` : `
        Tiếp tục
        <span class="material-symbols-outlined">arrow_forward</span>
      `}
    </button>
  </div>
</div>

<!-- Bank Selector Modal -->
<div id="bank-modal" class="fixed inset-0 z-50 flex items-end justify-center" style="display:none">
  <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" id="bank-modal-bg"></div>
  <div class="relative w-full max-w-md bg-background-dark rounded-t-2xl border-t border-slate-700 pb-8 animate-slide-up">
    <div class="flex justify-center pt-3 pb-4"><div class="w-10 h-1 rounded-full bg-slate-600"></div></div>
    <h3 class="text-center text-base font-bold mb-4">Chọn ngân hàng</h3>
    <div class="px-4 space-y-1 max-h-80 overflow-y-auto" id="bank-list">
      ${banks.map(b => `
      <button class="bank-option w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/60 transition-colors ${b.code === selectedBank ? 'bg-primary/10 border border-primary/20' : ''}" data-code="${b.code}">
        <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0">
          <img src="${b.logo}" alt="${b.code}" class="w-full h-full object-contain p-1.5 drop-shadow-sm" />
        </div>
        <div class="text-left flex-1">
          <p class="text-sm font-semibold">${b.name}</p>
          <p class="text-[10px] text-slate-500">${b.full}</p>
        </div>
        ${b.code === selectedBank ? '<span class="material-symbols-outlined text-primary text-sm">check_circle</span>' : ''}
      </button>`).join('')}
    </div>
  </div>
</div>

<!-- Smart OTP Screen -->
<div id="otp-screen" class="fixed inset-0 z-[60] bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display flex flex-col overflow-y-auto" style="display:none">
  <div class="relative flex screen w-full flex-col max-w-md mx-auto overflow-x-hidden">
    <header class="pt-12 pb-6 px-4">
      <div class="flex items-center justify-between mb-6">
        <button id="btn-cancel-otp" class="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 class="text-lg font-bold">Xác nhận giao dịch</h1>
        <div class="w-10"></div>
      </div>
      <div class="flex flex-col items-center text-center space-y-2">
        <div class="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-2">
          <span class="material-symbols-outlined text-3xl" style="font-variation-settings: 'FILL' 1">shield_lock</span>
        </div>
        <p class="text-sm text-slate-500 dark:text-slate-400 font-medium">Nhập mã PIN Smart OTP để xác nhận</p>
      </div>
    </header>
    <main class="flex-1 px-4 space-y-6">
      <div class="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-5 shadow-sm">
        <div class="space-y-4" id="otp-details"></div>
      </div>
      <div class="py-4">
        <div class="flex justify-between max-w-xs mx-auto gap-2" id="pin-inputs">
          <input class="pin-input w-12 h-14 text-center text-2xl font-bold bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all duration-200" maxlength="1" type="password" inputmode="numeric" pattern="[0-9]*" />
          <input class="pin-input w-12 h-14 text-center text-2xl font-bold bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all duration-200" maxlength="1" type="password" inputmode="numeric" pattern="[0-9]*" />
          <input class="pin-input w-12 h-14 text-center text-2xl font-bold bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all duration-200" maxlength="1" type="password" inputmode="numeric" pattern="[0-9]*" />
          <input class="pin-input w-12 h-14 text-center text-2xl font-bold bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all duration-200" maxlength="1" type="password" inputmode="numeric" pattern="[0-9]*" />
          <input class="pin-input w-12 h-14 text-center text-2xl font-bold bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all duration-200" maxlength="1" type="password" inputmode="numeric" pattern="[0-9]*" />
          <input class="pin-input w-12 h-14 text-center text-2xl font-bold bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all duration-200" maxlength="1" type="password" inputmode="numeric" pattern="[0-9]*" />
        </div>
        <div class="mt-8 flex flex-col items-center gap-2">
          <div class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <span class="material-symbols-outlined text-lg">timer</span>
            <span class="text-sm font-medium">Hiệu lực trong <span id="otp-countdown" class="text-primary font-bold">3:00</span></span>
          </div>
          <button class="text-sm font-semibold text-primary/80 hover:text-primary transition-colors mt-2">Gửi lại mã</button>
        </div>
      </div>
    </main>
    <footer class="p-6 space-y-4">
      <button id="btn-do-transfer" class="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-[0.98]">Xác nhận</button>
      <div class="flex justify-center"><a class="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" href="#">Quên PIN?</a></div>
      <div class="h-4"></div>
    </footer>
  </div>
</div>

<!-- Success Bill Screen -->
<div id="bill-screen" class="fixed inset-0 z-[70] bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display flex flex-col overflow-y-auto" style="display:none">
  <div class="relative flex screen w-full max-w-md mx-auto overflow-x-hidden pb-10">
    <!-- Header / Notch Space -->
    <div class="safe-top bg-background-dark h-8"></div>
    <!-- Top Navigation -->
    <div class="flex items-center justify-between p-4 bg-background-dark">
      <button id="btn-close-bill-top" class="flex items-center justify-center size-10 rounded-full hover:bg-white/10 transition-colors">
        <span class="material-symbols-outlined text-slate-100">close</span>
      </button>
      <h2 class="text-slate-100 text-base font-semibold">Chi tiết giao dịch</h2>
      <button class="flex items-center justify-center size-10 rounded-full hover:bg-white/10 transition-colors">
        <span class="material-symbols-outlined text-slate-100">share</span>
      </button>
    </div>
    <!-- Success Animation/Icon Area -->
    <div class="flex flex-col items-center pt-8 pb-6 px-4 bg-background-dark">
      <div class="relative flex items-center justify-center mb-4">
        <div class="absolute size-20 bg-[#22c55e]/20 rounded-full"></div>
        <div class="size-16 bg-[#22c55e] rounded-full flex items-center justify-center shadow-lg shadow-[#22c55e]/20">
          <span class="material-symbols-outlined text-white text-4xl font-bold">check</span>
        </div>
      </div>
      <p class="text-[#22c55e] font-bold text-lg tracking-wide uppercase">Chuyển thành công</p>
      <h1 class="text-slate-100 text-4xl font-bold mt-2" id="bill-amount-v2"></h1>
    </div>
    <!-- Transaction Details Card -->
    <div class="px-4 flex-1 bg-background-dark pt-4">
      <div class="bg-[#182d34] border border-[#315a68] rounded-xl overflow-hidden mb-6">
        <div class="p-4 space-y-4">
          <div class="flex justify-between items-start gap-4">
            <span class="text-slate-400 text-sm shrink-0">Người gửi</span>
            <span class="text-slate-100 text-sm font-medium text-right uppercase" id="bill-sender-name"></span>
          </div>
          <div class="h-px bg-[#315a68]/50 w-full"></div>
          <div class="flex justify-between items-start gap-4">
            <span class="text-slate-400 text-sm shrink-0">Người thụ hưởng</span>
            <span class="text-slate-100 text-sm font-medium text-right uppercase" id="bill-recipient-name-v2"></span>
          </div>
          <div class="flex justify-between items-start gap-4">
            <span class="text-slate-400 text-sm shrink-0">Số tài khoản</span>
            <span class="text-slate-100 text-sm font-medium text-right" id="bill-recipient-acc"></span>
          </div>
          <div class="flex justify-between items-start gap-4">
            <span class="text-slate-400 text-sm shrink-0">Ngân hàng thụ hưởng</span>
            <span class="text-slate-100 text-sm font-medium text-right" id="bill-recipient-bank-v2"></span>
          </div>
          <div class="h-px bg-[#315a68]/50 w-full"></div>
          <div class="flex justify-between items-start gap-4">
            <span class="text-slate-400 text-sm shrink-0">Nội dung</span>
            <span class="text-slate-100 text-sm font-medium text-right italic" id="bill-note-v2"></span>
          </div>
          <div class="flex justify-between items-start gap-4">
            <span class="text-slate-400 text-sm shrink-0">Ngày, giờ</span>
            <span class="text-slate-100 text-sm font-medium text-right" id="bill-time-v2"></span>
          </div>
          <div class="flex justify-between items-start gap-4">
            <span class="text-slate-400 text-sm shrink-0">Mã giao dịch</span>
            <span class="text-slate-100 text-sm font-medium text-right" id="bill-tx-code-v2"></span>
          </div>
          <div class="flex justify-between items-start gap-4">
            <span class="text-slate-400 text-sm shrink-0">Số tham chiếu</span>
            <span class="text-slate-100 text-sm font-medium text-right" id="bill-ref-code-v2"></span>
          </div>
        </div>
      </div>
      <!-- Quick Action Icons -->
      <div class="grid grid-cols-3 gap-3 mb-8">
        <button class="flex flex-col items-center justify-center p-3 rounded-xl bg-[#182d34] border border-[#315a68] hover:bg-primary/10 transition-colors group">
          <span class="material-symbols-outlined text-slate-100 mb-2 group-hover:text-primary">share</span>
          <span class="text-[11px] font-medium text-slate-300 text-center">Chia sẻ</span>
        </button>
        <button class="flex flex-col items-center justify-center p-3 rounded-xl bg-[#182d34] border border-[#315a68] hover:bg-primary/10 transition-colors group">
          <span class="material-symbols-outlined text-slate-100 mb-2 group-hover:text-primary">star</span>
          <span class="text-[11px] font-medium text-slate-300 text-center">Lưu mẫu</span>
        </button>
        <button id="btn-new-transfer-v2" class="flex flex-col items-center justify-center p-3 rounded-xl bg-[#182d34] border border-[#315a68] hover:bg-primary/10 transition-colors group">
          <span class="material-symbols-outlined text-slate-100 mb-2 group-hover:text-primary">add_circle</span>
          <span class="text-[11px] font-medium text-slate-300 text-center">Giao dịch mới</span>
        </button>
      </div>
    </div>
    <!-- Footer Action Button -->
    <div class="p-4 safe-bottom bg-background-dark">
      <button id="btn-done-bill-v2" class="w-full h-14 bg-primary text-background-dark font-bold text-lg rounded-xl flex items-center justify-center active:scale-[0.98] transition-transform">
        Hoàn thành
      </button>
    </div>
  </div>
</div>`;

    attachEvents();
  }

  function attachEvents() {
    // Back
    container.querySelector('#btn-back')?.addEventListener('click', () => navigate('dashboard'));
    container.querySelector('#btn-qr')?.addEventListener('click', () => navigate('qr'));

    // Bank selector
    container.querySelector('#btn-select-bank')?.addEventListener('click', () => {
      container.querySelector('#bank-modal').style.display = 'flex';
    });
    container.querySelector('#bank-modal-bg')?.addEventListener('click', () => {
      container.querySelector('#bank-modal').style.display = 'none';
    });
    container.querySelectorAll('.bank-option').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedBank = btn.dataset.code;
        container.querySelector('#bank-modal').style.display = 'none';
        render();
      });
    });

    // Account number — simulate name lookup
    const accInput = container.querySelector('#inp-account');
    let lookupTimer;
    accInput?.addEventListener('input', () => {
      clearTimeout(lookupTimer);
      hideAccountName();
      if (accInput.value.length >= 8) {
        lookupTimer = setTimeout(() => simulateNameLookup(accInput.value), 800);
      }
    });

    // Amount input with VND formatting
    const amtInput = container.querySelector('#inp-amount');
    amtInput?.addEventListener('input', () => {
      const raw = amtInput.value.replace(/[^0-9]/g, '');
      if (!raw) { amtInput.value = ''; updateQuickAmounts(''); return; }
      amtInput.value = formatNumber(raw);
      updateQuickAmounts(raw);
    });

    // Initial load for empty state
    updateQuickAmounts('');

    // Name input: Normalize on the fly
    const nameInputEl = container.querySelector('#inp-account-name');
    nameInputEl?.addEventListener('input', () => {
      nameInputEl.value = removeVietnameseTones(nameInputEl.value.toUpperCase());
    });

    // Continue → show confirmation
    container.querySelector('#btn-continue')?.addEventListener('click', () => {
      const accNum = accInput?.value.trim();
      const amtRaw = amtInput?.value.replace(/[^0-9]/g, '');
      const amt = parseInt(amtRaw || '0');
      let note = container.querySelector('#inp-note')?.value.trim();

      if (!accNum || accNum.length < 6) { showToast('Vui lòng nhập số tài khoản', 'error'); return; }
      if (!amt || amt <= 0) { showToast('Vui lòng nhập số tiền', 'error'); return; }
      if (amt > balance) { showToast('Số dư không đủ', 'error'); return; }

      showConfirmation(accNum, amt, note);
    });

    // PIN Inputs
    const pinInputs = container.querySelectorAll('.pin-input');
    pinInputs.forEach((input, index) => {
      input.addEventListener('input', () => {
        if (input.value.length === 1 && index < pinInputs.length - 1) {
          pinInputs[index + 1].focus();
        }
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && input.value.length === 0 && index > 0) {
          pinInputs[index - 1].focus();
        }
      });
    });

    // Smart OTP & Bill Events
    container.querySelector('#btn-cancel-otp')?.addEventListener('click', () => {
      clearInterval(otpTimerInterval);
      container.querySelector('#otp-screen').style.display = 'none';
    });
    container.querySelector('#btn-do-transfer')?.addEventListener('click', doTransfer);

    container.querySelector('#btn-close-bill-top')?.addEventListener('click', () => navigate('dashboard', container._transferData));
    container.querySelector('#btn-done-bill-v2')?.addEventListener('click', () => navigate('dashboard', container._transferData));
    container.querySelector('#btn-new-transfer-v2')?.addEventListener('click', () => {
      container.querySelector('#bill-screen').style.display = 'none';
      container.querySelector('#inp-account').value = '';
      container.querySelector('#inp-amount').value = '';
      hideAccountName();
      render();
    });

    // Prefill if drafted from QR scan
    if (draftData) {
      if (draftData.accountNo) {
        accInput.value = draftData.accountNo;
        // If the QR has a real tag 59 name, use it; otherwise mock based on STK
        if (draftData.recipientName) {
           showAccountName(draftData.recipientName);
        } else {
           simulateNameLookup(draftData.accountNo);
        }
      }
      if (draftData.amount) {
        const raw = draftData.amount;
        amtInput.value = formatNumber(raw.toString());
        updateQuickAmounts(raw.toString());
      }
      if (draftData.note) {
        container.querySelector('#inp-note').value = decodeURIComponent(draftData.note.replace(/\+/g,  " "));
      }
      draftData = null; // Clear so it only happens once
    }
  }

  function showAccountName(name) {
    const row = container.querySelector('#account-name-row');
    const nameEl = container.querySelector('#account-name');
    if (row && nameEl) { nameEl.textContent = name; row.style.display = 'block'; }
  }

  function hideAccountName() {
    const row = container.querySelector('#account-name-row');
    if (row) row.style.display = 'none';
  }

  async function simulateNameLookup(accNum) {
    const nameEl = container.querySelector('#account-name');
    const inputEl = container.querySelector('#inp-account-name');
    const displayContainer = container.querySelector('#account-name-display-container');
    const row = container.querySelector('#account-name-row');
    
    if (row) row.style.display = 'block';
    if (displayContainer) displayContainer.style.display = 'flex';
    if (inputEl) inputEl.style.display = 'none';
    if (nameEl) nameEl.textContent = 'Đang tra cứu...';

    const shortToBin = {
      "MB": "970422", "TCB": "970407", "VCB": "970436", "BIDV": "970418",
      "ACB": "970416", "VPB": "970432", "TPB": "970423", "STB": "970403"
    };
    const bankBin = selectedBank.match(/^\\d+$/) ? selectedBank : shortToBin[selectedBank];

    const res = await api('lookup-name', { bankBin, accountNo: accNum });
    if (res.ok && res.name) {
       if (displayContainer) displayContainer.style.display = 'flex';
       if (inputEl) inputEl.style.display = 'none';
       showAccountName(res.name);
    } else {
       // Lookup failed - allow manual entry
       if (displayContainer) displayContainer.style.display = 'none';
       if (inputEl) {
         inputEl.style.display = 'block';
         inputEl.value = '';
         inputEl.focus();
       }
    }
  }

  function formatNumber(numStr) {
    const clean = numStr.replace(/[^0-9]/g, '');
    if (!clean) return '';
    return clean.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function updateQuickAmounts(raw) {
    const quickContainer = container.querySelector('#quick-amounts');
    if (!quickContainer) return;
    
    let suggestions = [];
    if (!raw) {
      // Default suggestions if empty
      suggestions = [50000, 100000, 200000, 500000];
    } else {
      const base = parseInt(raw);
      if (base > 0) {
        suggestions.push(base * 1000);
        suggestions.push(base * 10000);
        suggestions.push(base * 100000);
        suggestions.push(base * 1000000);
      }
    }

    quickContainer.innerHTML = suggestions.map(amt => `
      <button class="quick-amt py-2 px-3 rounded-lg text-xs font-medium transition-all bg-slate-700/30 text-slate-300 hover:bg-slate-700/50 flex-1 whitespace-nowrap overflow-hidden text-ellipsis min-w-max" data-amount="${amt}">
        ${formatNumber(amt.toString())}
      </button>`).join('');

    quickContainer.querySelectorAll('.quick-amt').forEach(btn => {
      btn.addEventListener('click', () => {
        const amt = parseInt(btn.dataset.amount);
        const amtInput = container.querySelector('#inp-amount');
        if (amtInput) {
          amtInput.value = formatNumber(amt.toString());
          updateQuickAmounts(amt.toString());
        }
      });
    });
  }

  function removeVietnameseTones(str) {
    if (!str) return '';
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str;
  }

  function showConfirmation(accNum, amount, note) {
    const bank = banks.find(b => b.code === selectedBank) || banks[0];
    
    // Check if manual input is used
    const inputEl = container.querySelector('#inp-account-name');
    const isManualInput = inputEl && inputEl.style.display !== 'none';
    let accName = 'N/A';
    
    if (isManualInput) {
       accName = inputEl.value.trim().toUpperCase() || 'KHONG RO TEN';
    } else {
       accName = container.querySelector('#account-name')?.textContent || 'N/A';
    }
    accName = removeVietnameseTones(accName).toUpperCase();
    let noteToDisplay = removeVietnameseTones(note);

    container.querySelector('#otp-details').innerHTML = `
      <div class="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/50 pb-3">
        <span class="text-sm text-slate-500 dark:text-slate-400">Người nhận</span>
        <span class="text-sm font-semibold uppercase">${accName}</span>
      </div>
      <div class="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/50 pb-3">
        <span class="text-sm text-slate-500 dark:text-slate-400">Ngân hàng</span>
        <div class="flex items-center gap-2">
          <div class="w-5 h-5 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0"><img src="${bank.logo}" class="w-full h-full object-contain"></div>
          <span class="text-sm font-semibold">${bank.name}</span>
        </div>
      </div>
      <div class="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/50 pb-3">
        <span class="text-sm text-slate-500 dark:text-slate-400">Số tài khoản</span>
        <span class="text-sm font-semibold">${accNum}</span>
      </div>
      <div class="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/50 pb-3">
        <span class="text-sm text-slate-500 dark:text-slate-400">Số tiền</span>
        <span class="text-lg font-bold text-primary">${formatNumber(amount.toString())} VND</span>
      </div>
      <div class="flex justify-between items-start">
        <span class="text-sm text-slate-500 dark:text-slate-400">Nội dung</span>
        <span class="text-sm font-medium text-right max-w-[180px]">${noteToDisplay}</span>
      </div>
    `;

    container.querySelectorAll('.pin-input').forEach(i => i.value = '');
    container.querySelector('#otp-screen').style.display = 'flex';
    container.querySelector('.pin-input')?.focus();

    clearInterval(otpTimerInterval);
    let timeLeft = 180; // 3 minutes
    const timerDisplay = container.querySelector('#otp-countdown');
    if (timerDisplay) {
      timerDisplay.textContent = '3:00';
      otpTimerInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
          clearInterval(otpTimerInterval);
          container.querySelector('#otp-screen').style.display = 'none';
          showToast('Mã OTP đã hết hạn, vui lòng thử lại', 'error');
        } else {
          const m = Math.floor(timeLeft / 60);
          const s = timeLeft % 60;
          timerDisplay.textContent = `${m}:${s.toString().padStart(2, '0')}`;
        }
      }, 1000);
    }

    // Store for transfer
    container._transferData = { account: accNum, amount, note: noteToDisplay, bankCode: selectedBank, bankName: bank.name, bankFull: bank.full, accName };
  }

  async function doTransfer() {
    const data = container._transferData;
    if (!data) return;

    const pins = Array.from(container.querySelectorAll('.pin-input')).map(i => i.value).join('');
    if (pins.length < 6) {
       showToast('Vui lòng nhập đủ 6 số mã PIN Smart OTP', 'error');
       return;
    }

    clearInterval(otpTimerInterval);
    container.querySelector('#otp-screen').style.display = 'none';
    isProcessing = true;
    render();

    const res = await api('transfer', {
      toAccount: data.account,
      amount: data.amount,
      note: data.note || 'Chuyen tien NeoBank',
      accName: data.accName
    });

    isProcessing = false;

    if (res.ok) {
      render();
      const bill = container.querySelector('#bill-screen');
      container.querySelector('#bill-amount-v2').textContent = `${formatNumber(data.amount.toString())} VND`;
      
      const txCode = 'FT' + Math.floor(10000000000000 + Math.random() * 90000000000000);
      const refCode = String(Math.floor(100000 + Math.random() * 900000)).padStart(6, '0');
      const now = new Date();
      
      const day = now.getDate();
      const monthCount = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dateStr = `${day} thg ${now.getMonth() + 1}, ${now.getFullYear()} lúc ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      container.querySelector('#bill-time-v2').textContent = dateStr;
      
      const normalizedSender = removeVietnameseTones(user.name).toUpperCase();
      container.querySelector('#bill-sender-name').textContent = normalizedSender;
      container.querySelector('#bill-recipient-name-v2').textContent = data.accName.toUpperCase();
      container.querySelector('#bill-recipient-acc').textContent = data.account;
      container.querySelector('#bill-recipient-bank-v2').textContent = data.bankFull || data.bankName;
      container.querySelector('#bill-note-v2').textContent = data.note || (normalizedSender + ' CHUYEN TIEN');
      
      container.querySelector('#bill-tx-code-v2').textContent = txCode;
      container.querySelector('#bill-ref-code-v2').textContent = refCode;
      
      if (bill) bill.style.display = 'flex';
    } else {
      render();
      showToast(res.error || 'Chuyển tiền thất bại', 'error');
    }
  }

  function getRecentRecipients() {
    // Get unique recipients from transaction history
    const seen = new Set();
    const recipients = [];
    for (const tx of DB.transactions) {
      if (tx.type === 'transfer' && !seen.has(tx.note)) {
        seen.add(tx.note);
        const nameParts = (tx.note || 'Người nhận').split(' ');
        recipients.push({
          account: tx.toUserId || '0987654321',
          name: tx.note || 'Người nhận',
          shortName: nameParts.length > 2 ? nameParts.slice(-2).join(' ') : tx.note,
          bank: 'MB',
        });
        if (recipients.length >= 4) break;
      }
    }
    // Fallback demo recipients
    if (recipients.length === 0) {
      return [
        { account: '0987654321', name: 'Trần Thị Bình', shortName: 'Thị Bình', bank: 'MB' },
        { account: '1234567890', name: 'Lê Hoàng Minh', shortName: 'Hoàng Minh', bank: 'TCB' },
        { account: '5678901234', name: 'Phạm Đức Thịnh', shortName: 'Đức Thịnh', bank: 'VCB' },
      ];
    }
    return recipients;
  }

  render();
}
