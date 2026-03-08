// ═══════════════════════════════════════════════════════
// NeoBank — Profile / Settings Screen
// ═══════════════════════════════════════════════════════

import { api, logout } from '../backend/api.js';
import { navigate } from '../components/router.js';
import { showModal, closeModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { skeletonRows } from '../components/skeleton.js';

export function renderProfile(container) {
  let profile = null;

  async function load() {
    container.innerHTML = `<div class="screen-content"><div class="page-header"><h1 class="page-title">Cá nhân</h1></div>${skeletonRows(5)}</div>`;
    const res = await api('profile');
    if (!res.ok) { showToast(res.error, 'error'); return; }
    profile = res;
    render();
  }

  function render() {
    container.className = 'screen';
    container.style.padding = '0';
    const { user, account } = profile;
    container.innerHTML = `
<div class="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 screen flex flex-col relative max-w-md mx-auto shadow-2xl">
<!-- Header -->
<header class="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
<div class="flex items-center justify-between p-4 w-full notch-safe-top">
<button class="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors" onclick="history.back()">
<span class="material-symbols-outlined block">arrow_back</span>
</button>
<h1 class="text-lg font-bold">Cá nhân</h1>
<button class="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors relative">
<span class="material-symbols-outlined block">notifications</span>
<span class="absolute top-2 right-2 flex h-2 w-2">
<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
<span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
</span>
</button>
</div>
</header>
<!-- Main Content -->
<main class="flex-1 w-full pb-32 stagger">
<!-- User Info Section -->
<section class="flex flex-col items-center py-8 px-4">
<div class="relative group">
<div class="size-32 rounded-full p-1 bg-gradient-to-tr from-primary to-primary/20">
<div class="w-full h-full rounded-full bg-primary/20 flex flex-col items-center justify-center border-4 border-background-light dark:border-background-dark text-4xl font-bold text-primary">
${user.name.charAt(0)}
</div>
</div>
<button id="menu-edit" class="absolute bottom-0 right-0 bg-primary text-slate-900 p-2 rounded-full border-4 border-background-light dark:border-background-dark hover:scale-105 transition-transform cursor-pointer">
<span class="material-symbols-outlined text-sm block">edit</span>
</button>
</div>
<div class="mt-4 text-center">
<h2 class="text-2xl font-bold tracking-tight">${user.name}</h2>
<p class="text-sm font-mono mt-1 text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">${String(account.accountNumber).replace(/(.{4})/g, '$1 ').trim()} <span id="btn-copy-acc" class="material-symbols-outlined text-[14px] cursor-pointer hover:text-primary">content_copy</span></p>
${user.priority ? `
<div class="flex items-center justify-center gap-2 mt-2">
<span class="bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Priority Member</span>
</div>` : ''}
<p class="text-slate-500 dark:text-slate-400 text-sm mt-3">${user.email}</p>
</div>
</section>
<!-- Menu Section -->
<section class="px-4 space-y-6">
<div>
<h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">Quản lý Tài khoản</h3>
<div class="bg-slate-100 dark:bg-slate-900/50 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
<a id="menu-password" class="cursor-pointer flex items-center gap-4 p-4 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors border-b border-slate-200 dark:border-slate-800">
<div class="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
<span class="material-symbols-outlined">shield_person</span>
</div>
<div class="flex-1">
<p class="font-semibold">Bảo mật</p>
<p class="text-xs text-slate-500 dark:text-slate-400">Đổi mật khẩu, 2FA, Sinh trắc học</p>
</div>
<span class="material-symbols-outlined text-slate-400">chevron_right</span>
</a>
<a id="menu-cards" class="cursor-pointer flex items-center gap-4 p-4 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors border-b border-slate-200 dark:border-slate-800">
<div class="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
<span class="material-symbols-outlined">credit_card</span>
</div>
<div class="flex-1">
<p class="font-semibold">Quản lý thẻ</p>
<p class="text-xs text-slate-500 dark:text-slate-400">Thẻ vật lý, Thẻ ảo, Khóa thẻ</p>
</div>
<span class="material-symbols-outlined text-slate-400">chevron_right</span>
</a>
<a id="menu-my-qr" class="cursor-pointer flex items-center gap-4 p-4 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors border-b border-slate-200 dark:border-slate-800">
<div class="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
<span class="material-symbols-outlined">qr_code_2</span>
</div>
<div class="flex-1">
<p class="font-semibold">QR Cá Nhân</p>
<p class="text-xs text-slate-500 dark:text-slate-400">Mã QR nhận tiền của bạn</p>
</div>
<span class="material-symbols-outlined text-slate-400">chevron_right</span>
</a>
<a id="menu-history" class="cursor-pointer flex items-center gap-4 p-4 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors border-b border-slate-200 dark:border-slate-800">
<div class="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
<span class="material-symbols-outlined">history</span>
</div>
<div class="flex-1">
<p class="font-semibold">Chi tiết giao dịch</p>
<p class="text-xs text-slate-500 dark:text-slate-400">Xem lại lịch sử các giao dịch đã thực hiện</p>
</div>
<span class="material-symbols-outlined text-slate-400">chevron_right</span>
</a>
<a id="menu-priority" class="cursor-pointer flex items-center gap-4 p-4 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
<div class="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
<span class="material-symbols-outlined">star</span>
</div>
<div class="flex-1">
<p class="font-semibold">Đặc quyền Priority</p>
<p class="text-xs text-slate-500 dark:text-slate-400">Khám phá phong cách sống</p>
</div>
<span class="material-symbols-outlined text-slate-400">chevron_right</span>
</a>
</div>
</div>
<div>
<h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">Cài đặt Ứng dụng</h3>
<div class="bg-slate-100 dark:bg-slate-900/50 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
<div id="menu-theme" class="cursor-pointer flex items-center gap-4 p-4 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors border-b border-slate-200 dark:border-slate-800">
<div class="size-10 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500">
<span class="material-symbols-outlined">palette</span>
</div>
<div class="flex-1">
<p class="font-semibold">Giao diện</p>
<p class="text-xs text-slate-500 dark:text-slate-400">${user.theme === 'dark' ? 'Tối' : 'Sáng'}</p>
</div>
<div id="theme-toggle" class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${user.theme === 'dark' ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}">
<span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${user.theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}"></span>
</div>
</div>
<div id="menu-language" class="cursor-pointer flex items-center gap-4 p-4 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors border-b border-slate-200 dark:border-slate-800">
<div class="size-10 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500">
<span class="material-symbols-outlined">language</span>
</div>
<div class="flex-1">
<p class="font-semibold">Ngôn ngữ</p>
<p class="text-xs text-slate-500 dark:text-slate-400">${user.language === 'vi' ? 'Tiếng Việt' : 'English'}</p>
</div>
<span class="material-symbols-outlined text-slate-400">chevron_right</span>
</div>
<div class="cursor-pointer flex items-center gap-4 p-4 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors" onclick="alert('Tính năng đang phát triển')">
<div class="size-10 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500">
<span class="material-symbols-outlined">support_agent</span>
</div>
<div class="flex-1">
<p class="font-semibold">Hỗ trợ CSKH</p>
<p class="text-xs text-slate-500 dark:text-slate-400">24/7 Priority Concierge</p>
</div>
<span class="material-symbols-outlined text-slate-400">chevron_right</span>
</div>
</div>
</div>
<div class="pt-4">
<button id="btn-logout" class="w-full flex items-center justify-center gap-2 p-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors font-bold border border-red-500/20">
<span class="material-symbols-outlined">logout</span>
                    Đăng xuất
                </button>
</div>
<div class="pt-4">
<button id="menu-reset-balance" class="w-full flex items-center justify-center gap-2 p-4 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-xl transition-colors font-bold border border-blue-500/20">
<span class="material-symbols-outlined">restart_alt</span>
                    Reset số dư
                </button>
</div>
<div class="text-center pb-8">
<p class="text-xs text-slate-500 dark:text-slate-600">NeoBank v1.0.0 (Build 2024)</p>
</div>
</section>
</main>
</div>`;

    attachEvents();
  }

  function attachEvents() {
    container.querySelector('#btn-copy-acc').addEventListener('click', () => {
      navigator.clipboard?.writeText(profile.account.accountNumber.replace(/\s/g, ''));
      showToast('Đã sao chép số tài khoản', 'success');
    });

    container.querySelector('#menu-edit').addEventListener('click', () => showEditModal());
    container.querySelector('#menu-cards').addEventListener('click', () => navigate('cards'));
    container.querySelector('#menu-priority').addEventListener('click', () => navigate('priority'));
    container.querySelector('#menu-password').addEventListener('click', () => showPasswordModal());

    container.querySelector('#menu-my-qr').addEventListener('click', () => navigate('myQr'));
    container.querySelector('#menu-history').addEventListener('click', () => navigate('history'));

    container.querySelector('#theme-toggle').addEventListener('click', async () => {
      const res = await api('toggle-theme');
      if (res.ok) {
        profile.user.theme = res.theme;
        document.documentElement.setAttribute('data-theme', res.theme);
        showToast(`Đã chuyển giao diện ${res.theme === 'dark' ? 'tối' : 'sáng'}`, 'success');
        render();
      }
    });

    container.querySelector('#menu-language').addEventListener('click', () => {
      profile.user.language = profile.user.language === 'vi' ? 'en' : 'vi';
      showToast(`Ngôn ngữ: ${profile.user.language === 'vi' ? 'Tiếng Việt' : 'English'}`, 'info');
      render();
    });

    container.querySelector('#btn-logout').addEventListener('click', () => {
      logout();
      document.documentElement.setAttribute('data-theme', 'dark');
      showToast('Đã đăng xuất', 'info');
      navigate('login');
    });

    container.querySelector('#menu-reset-balance').addEventListener('click', () => {
      handleResetBalance();
    });
  }

  function showEditModal() {
    const { user } = profile;
    const modal = showModal(`
      <h3 class="modal-title">Chỉnh sửa thông tin</h3>
      <div class="form-group">
        <label class="form-label">Họ và tên</label>
        <input type="text" class="form-input" id="edit-name" value="${user.name}">
      </div>
      <div class="form-group">
        <label class="form-label">Email</label>
        <input type="email" class="form-input" id="edit-email" value="${user.email}">
      </div>
      <div class="form-group">
        <label class="form-label">Số điện thoại</label>
        <input type="tel" class="form-input" id="edit-phone" value="${user.phone}">
      </div>
      <button class="btn btn-primary btn-full" id="btn-save-edit">Lưu thay đổi</button>
      <button class="btn btn-ghost btn-full" id="btn-cancel-edit">Hủy</button>
    `);

    modal.querySelector('#btn-cancel-edit').addEventListener('click', () => closeModal(modal));
    modal.querySelector('#btn-save-edit').addEventListener('click', async () => {
      const name = modal.querySelector('#edit-name').value.trim();
      const email = modal.querySelector('#edit-email').value.trim();
      const phone = modal.querySelector('#edit-phone').value.trim();
      const res = await api('update-profile', { name, email, phone });
      closeModal(modal);
      if (res.ok) {
        profile.user = res.user;
        showToast('Cập nhật thành công!', 'success');
        render();
      } else {
        showToast(res.error, 'error');
      }
    });
  }

  function showPasswordModal() {
    const modal = showModal(`
      <h3 class="modal-title">Đổi mật khẩu</h3>
      <div class="form-group">
        <label class="form-label">Mật khẩu cũ</label>
        <input type="password" inputmode="numeric" pattern="[0-9]*" class="form-input" id="old-pass" placeholder="••••••">
      </div>
      <div class="form-group">
        <label class="form-label">Mật khẩu mới</label>
        <input type="password" inputmode="numeric" pattern="[0-9]*" class="form-input" id="new-pass" placeholder="Ít nhất 6 ký tự">
      </div>
      <div id="pass-error" class="form-error hidden"></div>
      <button class="btn btn-primary btn-full" id="btn-save-pass">Đổi mật khẩu</button>
      <button class="btn btn-ghost btn-full" id="btn-cancel-pass">Hủy</button>
    `);

    modal.querySelector('#btn-cancel-pass').addEventListener('click', () => closeModal(modal));
    modal.querySelector('#btn-save-pass').addEventListener('click', async () => {
      const oldPassword = modal.querySelector('#old-pass').value;
      const newPassword = modal.querySelector('#new-pass').value;
      if (newPassword.length < 6) {
        modal.querySelector('#pass-error').textContent = 'Mật khẩu mới ít nhất 6 ký tự';
        modal.querySelector('#pass-error').classList.remove('hidden');
        return;
      }
      const res = await api('change-password', { oldPassword, newPassword });
      closeModal(modal);
      showToast(res.ok ? res.message : res.error, res.ok ? 'success' : 'error');
    });
  }

  async function handleResetBalance() {
    const modal = showModal(`
      <h3 class="modal-title">Xác nhận Reset Số dư</h3>
      <p class="text-center mb-4">Bạn có chắc chắn muốn reset số dư tài khoản về 10,000,000 VND không?</p>
      <button class="btn btn-primary btn-full" id="btn-confirm-reset">Xác nhận</button>
      <button class="btn btn-ghost btn-full" id="btn-cancel-reset">Hủy</button>
    `);

    modal.querySelector('#btn-cancel-reset').addEventListener('click', () => closeModal(modal));
    modal.querySelector('#btn-confirm-reset').addEventListener('click', async () => {
      closeModal(modal);
      const res = await api('reset-balance');
      if (res.ok) {
        profile.account.balance = res.newBalance;
        showToast('Số dư đã được reset về 10,000,000 VND', 'success');
        render(); // Re-render to update balance display if needed
      } else {
        showToast(res.error, 'error');
      }
    });
  }

  load();
}
