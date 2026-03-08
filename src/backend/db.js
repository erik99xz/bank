// ═══════════════════════════════════════════════════════
// NeoBank — In-Memory Fake Database
// ═══════════════════════════════════════════════════════

export const DB = {
  users: [
    {
      id: 'u1',
      name: 'Lưu Gia Bảo',
      email: 'baoluo@neobank.vn',
      phone: '0777440600',
      password: '090910',
      avatar: null,
      role: 'user',
      priority: true,
      biometricEnabled: true,
      language: 'vi',
      theme: 'dark',
      createdAt: '2025-01-15T08:00:00Z'
    },
    {
      id: 'u2',
      name: 'Nguyễn Hải Đăng',
      email: 'dangnh@neobank.vn',
      phone: '0964985241',
      password: '110210',
      avatar: null,
      role: 'user',
      priority: false,
      biometricEnabled: false,
      language: 'vi',
      theme: 'dark',
      createdAt: '2025-02-20T10:30:00Z'
    },
    {
      id: 'u3',
      name: 'Trần Đặng Anh Khoa',
      email: 'khoatda@neobank.vn',
      phone: '0932811785',
      password: '010210',
      avatar: null,
      role: 'user',
      priority: false,
      biometricEnabled: true,
      language: 'en',
      theme: 'dark',
      createdAt: '2025-03-10T14:00:00Z'
    },
    {
      id: 'u4',
      name: 'Nguyễn Thành Bảo Nhân',
      email: 'nhanntb@neobank.vn',
      phone: '0372263653',
      password: '090210',
      avatar: null,
      role: 'user',
      priority: false,
      biometricEnabled: false,
      language: 'vi',
      theme: 'dark',
      createdAt: '2025-03-15T09:00:00Z'
    },
    {
      id: 'admin',
      name: 'Admin NeoBank',
      email: 'admin@neobank.vn',
      phone: '0900000000',
      password: 'admin123',
      avatar: null,
      role: 'admin',
      priority: true,
      biometricEnabled: false,
      language: 'vi',
      theme: 'dark',
      createdAt: '2024-12-01T00:00:00Z'
    }
  ],

  accounts: [
    { id: 'a1', userId: 'u1', accountNumber: '0777440600', balance: 36090910, initialBalance: 36090910, currency: 'VND', type: 'checking' },
    { id: 'a2', userId: 'u2', accountNumber: '0964985241', balance: 11020210, initialBalance: 11020210, currency: 'VND', type: 'checking' },
    { id: 'a3', userId: 'u3', accountNumber: '0932811785', balance: 10200210, initialBalance: 10200210, currency: 'VND', type: 'checking' },
    { id: 'a4', userId: 'u4', accountNumber: '0372263653', balance: 10900201, initialBalance: 10900201, currency: 'VND', type: 'checking' },
    { id: 'a_admin', userId: 'admin', accountNumber: '9704 0000 0000 0001', balance: 999999999, initialBalance: 999999999, currency: 'VND', type: 'checking' }
  ],

  transactions: [],

  cards: [
    { id: 'c1', userId: 'u1', cardNumber: '4970 4000 1234 5678', expiry: '12/28', cvv: '321', cardHolder: 'LUU GIA BAO', type: 'visa', frozen: false, color: 'gradient-blue' },
    { id: 'c2', userId: 'u2', cardNumber: '5241 8100 8765 4321', expiry: '06/27', cvv: '456', cardHolder: 'NGUYEN HAI DANG', type: 'mastercard', frozen: false, color: 'gradient-purple' },
    { id: 'c3', userId: 'u3', cardNumber: '4970 4000 5555 6666', expiry: '09/29', cvv: '789', cardHolder: 'TRAN DANG ANH KHOA', type: 'visa', frozen: false, color: 'gradient-green' },
    { id: 'c4', userId: 'u4', cardNumber: '4970 4000 7777 8888', expiry: '10/30', cvv: '111', cardHolder: 'NGUYEN THANH BAO NHAN', type: 'visa', frozen: false, color: 'gradient-blue' }
  ],

  notifications: [],

  otpStore: {},
  tokenStore: {}
};

// Persistence Logic
export function saveDB() {
  localStorage.setItem('neo_db_v2', JSON.stringify(DB));
}

export function initDB() {
  const saved = localStorage.getItem('neo_db_v2');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      // Merge or replace contents
      if (data.users) DB.users = data.users;
      if (data.accounts) DB.accounts = data.accounts;
      if (data.transactions) DB.transactions = data.transactions;
      if (data.notifications) DB.notifications = data.notifications;
      if (data.cards) DB.cards = data.cards;
    } catch (e) {
      console.error('Failed to load DB from localStorage', e);
    }
  }
}

// Initialize on load
initDB();

// Helper: generate unique ID
export function genId(prefix = 'x') {
  return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// Helper: format VND
export function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
}

// Helper: get user by id
export function getUserById(id) {
  return DB.users.find(u => u.id === id);
}

// Helper: get account by userId
export function getAccountByUserId(userId) {
  return DB.accounts.find(a => a.userId === userId);
}
