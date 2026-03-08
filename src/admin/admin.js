// ═══════════════════════════════════════════════════════
// NeoBank — Admin Panel
// ═══════════════════════════════════════════════════════

import { api, logout } from '../backend/api.js';
import { DB, formatVND, getUserById } from '../backend/db.js';
import { navigate } from '../components/router.js';
import { showModal, closeModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';

export function renderAdmin(container) {
  let activeTab = 'users'; // users | transactions | notifications
  let users = [];
  let transactions = [];
  let searchQuery = '';
  let txFilter = 'all';

  async function load() {
    if (activeTab === 'users') {
      const res = await api('admin/users', { search: searchQuery });
      if (!res.ok) { showToast(res.error, 'error'); if (res.error.includes('quyền')) navigate('login'); return; }
      users = res.users;
    } else if (activeTab === 'transactions') {
      const res = await api('admin/transactions', { search: searchQuery, type: txFilter });
      if (!res.ok) { showToast(res.error, 'error'); return; }
      transactions = res.transactions;
    }
    render();
  }

  function render() {
    container.classList.add('admin-screen');
    container.innerHTML = `
      <div class="screen-content">
        <!-- Header -->
        <div class="admin-header animate-fade-in">
          <div>
            <h1 style="font-size:22px;font-weight:800">🏦 Admin Panel</h1>
            <p class="text-sm text-muted">NeoBank Management</p>
          </div>
          <button class="btn btn-sm btn-danger" id="btn-admin-logout">Đăng xuất</button>
        </div>

        <!-- Stats -->
        <div class="admin-stats animate-fade-in">
          <div class="admin-stat-card">
            <div class="admin-stat-value" style="color:var(--accent)">${DB.users.filter(u => u.role !== 'admin').length}</div>
            <div class="admin-stat-label">Người dùng</div>
          </div>
          <div class="admin-stat-card">
            <div class="admin-stat-value" style="color:var(--info)">${DB.transactions.length}</div>
            <div class="admin-stat-label">Giao dịch</div>
          </div>
          <div class="admin-stat-card">
            <div class="admin-stat-value" style="color:var(--warning)">${formatVND(DB.accounts.reduce((s, a) => s + a.balance, 0))}</div>
            <div class="admin-stat-label">Tổng số dư</div>
          </div>
          <div class="admin-stat-card">
            <div class="admin-stat-value" style="color:var(--success)">${DB.users.filter(u => u.priority).length}</div>
            <div class="admin-stat-label">Priority</div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="admin-tab-bar animate-fade-in">
          <button class="admin-tab ${activeTab === 'users' ? 'active' : ''}" data-tab="users">👥 Users</button>
          <button class="admin-tab ${activeTab === 'transactions' ? 'active' : ''}" data-tab="transactions">📋 Transactions</button>
          <button class="admin-tab ${activeTab === 'notifications' ? 'active' : ''}" data-tab="notifications">🔔 Push</button>
        </div>

        <!-- Search -->
        <div class="search-bar mb-16 animate-slide-right">
          <span class="search-icon">🔍</span>
          <input type="text" placeholder="Tìm kiếm..." id="admin-search" value="${searchQuery}">
        </div>

        <!-- Content -->
        <div id="admin-content" class="animate-fade-in">
          ${activeTab === 'users' ? renderUsersTab() : ''}
          ${activeTab === 'transactions' ? renderTransactionsTab() : ''}
          ${activeTab === 'notifications' ? renderNotificationsTab() : ''}
        </div>
      </div>`;

    attachEvents();
  }

  function renderUsersTab() {
    return `
      <div class="flex justify-between items-center mb-16">
        <span class="text-sm text-muted">${users.length} người dùng</span>
        <button class="btn btn-sm btn-primary" id="btn-add-user">+ Thêm user</button>
      </div>
      <div style="overflow-x:auto">
        <table class="admin-table">
          <thead><tr>
            <th>Tên</th>
            <th>Email</th>
            <th>Số dư</th>
            <th>Thao tác</th>
          </tr></thead>
          <tbody>
            ${users.map(u => `
              <tr>
                <td>
                  <div class="font-bold">${u.name}</div>
                  <div class="text-sm text-muted">${u.phone}</div>
                </td>
                <td>${u.email}</td>
                <td class="font-bold">${formatVND(u.balance)}</td>
                <td>
                  <div class="flex gap-8">
                    <button class="btn btn-sm btn-secondary btn-edit-balance" data-user-id="${u.id}" data-balance="${u.balance}">💰</button>
                    <button class="btn btn-sm btn-danger btn-delete-user" data-user-id="${u.id}">🗑️</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>`;
  }

  function renderTransactionsTab() {
    return `
      <div class="filter-pills mb-16">
        ${['all', 'transfer', 'qr_pay', 'topup', 'bill'].map(f => `
          <button class="filter-pill ${txFilter === f ? 'active' : ''}" data-txfilter="${f}">
            ${{ all: 'Tất cả', transfer: 'Chuyển', qr_pay: 'QR', topup: 'Nạp', bill: 'Hóa đơn' }[f]}
          </button>
        `).join('')}
      </div>
      <div style="overflow-x:auto">
        <table class="admin-table">
          <thead><tr>
            <th>Từ</th><th>Đến</th><th>Số tiền</th><th>Loại</th><th>Thời gian</th>
          </tr></thead>
          <tbody>
            ${transactions.map(t => `
              <tr>
                <td>${t.fromUser}</td>
                <td>${t.toUser}</td>
                <td class="font-bold" style="color:var(--accent)">${formatVND(t.amount)}</td>
                <td><span class="filter-pill" style="padding:4px 10px;font-size:11px">${t.type}</span></td>
                <td class="text-sm text-muted">${new Date(t.createdAt).toLocaleString('vi-VN')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>`;
  }

  function renderNotificationsTab() {
    const nonAdminUsers = DB.users.filter(u => u.role !== 'admin');
    return `
      <div class="card">
        <h3 style="font-size:16px;font-weight:700;margin-bottom:16px">Gửi thông báo</h3>
        <div class="form-group">
          <label class="form-label">Người nhận</label>
          <select class="form-input" id="notif-user" style="cursor:pointer">
            ${nonAdminUsers.map(u => `<option value="${u.id}">${u.name} (${u.email})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Tiêu đề</label>
          <input type="text" class="form-input" id="notif-title" placeholder="Tiêu đề thông báo">
        </div>
        <div class="form-group">
          <label class="form-label">Nội dung</label>
          <input type="text" class="form-input" id="notif-body" placeholder="Nội dung thông báo">
        </div>
        <button class="btn btn-primary btn-full" id="btn-send-notif">📤 Gửi thông báo</button>
      </div>

      <div class="section-header"><h3 class="section-title">Thông báo gần đây</h3></div>
      <div class="notif-list">
        ${DB.notifications.slice(0, 10).map(n => `
          <div class="notif-item ${n.read ? '' : 'unread'}">
            <div class="notif-dot ${n.read ? 'read' : ''}"></div>
            <div style="flex:1">
              <div class="notif-item-title">${n.title}</div>
              <div class="notif-item-body">→ ${getUserById(n.userId)?.name || 'Unknown'}: ${n.body}</div>
              <div class="notif-item-time">${new Date(n.createdAt).toLocaleString('vi-VN')}</div>
            </div>
          </div>
        `).join('')}
      </div>`;
  }

  function attachEvents() {
    container.querySelector('#btn-admin-logout').addEventListener('click', () => {
      logout();
      navigate('login');
    });

    // Tabs
    container.querySelectorAll('.admin-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        activeTab = tab.dataset.tab;
        searchQuery = '';
        load();
      });
    });

    // Search
    let searchTimer;
    container.querySelector('#admin-search').addEventListener('input', (e) => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        searchQuery = e.target.value.trim();
        load();
      }, 400);
    });

    // Transaction filter
    container.querySelectorAll('.filter-pill[data-txfilter]').forEach(pill => {
      pill.addEventListener('click', () => {
        txFilter = pill.dataset.txfilter;
        load();
      });
    });

    // Add user
    container.querySelector('#btn-add-user')?.addEventListener('click', () => {
      const modal = showModal(`
        <h3 class="modal-title">Thêm người dùng</h3>
        <div class="form-group">
          <label class="form-label">Họ tên</label>
          <input type="text" class="form-input" id="new-user-name" placeholder="Nguyễn Văn X">
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input type="email" class="form-input" id="new-user-email" placeholder="email@domain.com">
        </div>
        <div class="form-group">
          <label class="form-label">SĐT</label>
          <input type="tel" class="form-input" id="new-user-phone" placeholder="0901234567">
        </div>
        <div class="form-group">
          <label class="form-label">Số dư ban đầu (VND)</label>
          <input type="number" class="form-input" id="new-user-balance" value="10000000">
        </div>
        <button class="btn btn-primary btn-full" id="btn-confirm-add">Thêm</button>
        <button class="btn btn-ghost btn-full" id="btn-cancel-add">Hủy</button>
      `);
      modal.querySelector('#btn-cancel-add').addEventListener('click', () => closeModal(modal));
      modal.querySelector('#btn-confirm-add').addEventListener('click', async () => {
        const res = await api('admin/add-user', {
          name: modal.querySelector('#new-user-name').value,
          email: modal.querySelector('#new-user-email').value,
          phone: modal.querySelector('#new-user-phone').value,
          balance: modal.querySelector('#new-user-balance').value
        });
        closeModal(modal);
        if (res.ok) { showToast('Đã thêm user!', 'success'); load(); }
        else showToast(res.error, 'error');
      });
    });

    // Edit balance
    container.querySelectorAll('.btn-edit-balance').forEach(btn => {
      btn.addEventListener('click', () => {
        const userId = btn.dataset.userId;
        const currentBalance = btn.dataset.balance;
        const modal = showModal(`
          <h3 class="modal-title">Cập nhật số dư</h3>
          <div class="form-group">
            <label class="form-label">Số dư mới (VND)</label>
            <input type="number" class="form-input" id="edit-balance-val" value="${currentBalance}">
          </div>
          <button class="btn btn-primary btn-full" id="btn-confirm-balance">Cập nhật</button>
          <button class="btn btn-ghost btn-full" id="btn-cancel-balance">Hủy</button>
        `);
        modal.querySelector('#btn-cancel-balance').addEventListener('click', () => closeModal(modal));
        modal.querySelector('#btn-confirm-balance').addEventListener('click', async () => {
          const newBalance = modal.querySelector('#edit-balance-val').value;
          const res = await api('admin/update-balance', { userId, newBalance });
          closeModal(modal);
          if (res.ok) { showToast('Đã cập nhật số dư!', 'success'); load(); }
          else showToast(res.error, 'error');
        });
      });
    });

    // Delete user
    container.querySelectorAll('.btn-delete-user').forEach(btn => {
      btn.addEventListener('click', async () => {
        const userId = btn.dataset.userId;
        if (!confirm('Xóa người dùng này?')) return;
        const res = await api('admin/delete-user', { userId });
        if (res.ok) { showToast('Đã xóa user', 'success'); load(); }
        else showToast(res.error, 'error');
      });
    });

    // Send notification
    container.querySelector('#btn-send-notif')?.addEventListener('click', async () => {
      const userId = container.querySelector('#notif-user').value;
      const title = container.querySelector('#notif-title').value.trim();
      const body = container.querySelector('#notif-body').value.trim();
      if (!title || !body) { showToast('Nhập đủ tiêu đề và nội dung', 'error'); return; }
      const res = await api('admin/send-notification', { userId, title, body });
      if (res.ok) {
        showToast('Đã gửi thông báo!', 'success');
        container.querySelector('#notif-title').value = '';
        container.querySelector('#notif-body').value = '';
        load();
      } else {
        showToast(res.error, 'error');
      }
    });
  }

  load();
}
