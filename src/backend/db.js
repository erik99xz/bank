// ═══════════════════════════════════════════════════════
// NeoBank — In-Memory Fake Database
// ═══════════════════════════════════════════════════════

export const DB = {
  users: [
    {
      id: 'u1',
      name: 'Nguyễn Văn An',
      email: 'demo@neobank.vn',
      phone: '0901234567',
      password: '123456',
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
      name: 'Trần Thị Bình',
      email: 'binh@neobank.vn',
      phone: '0912345678',
      password: '123456',
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
      name: 'Lê Hoàng Minh',
      email: 'minh@neobank.vn',
      phone: '0923456789',
      password: '123456',
      avatar: null,
      role: 'user',
      priority: false,
      biometricEnabled: true,
      language: 'en',
      theme: 'dark',
      createdAt: '2025-03-10T14:00:00Z'
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
    { id: 'a1', userId: 'u1', accountNumber: '9704 0000 1234 5678', balance: 125000000, currency: 'VND', type: 'checking' },
    { id: 'a2', userId: 'u2', accountNumber: '9704 0000 8765 4321', balance: 45200000, currency: 'VND', type: 'checking' },
    { id: 'a3', userId: 'u3', accountNumber: '9704 0000 5555 6666', balance: 78500000, currency: 'VND', type: 'checking' },
    { id: 'a4', userId: 'admin', accountNumber: '9704 0000 0000 0001', balance: 999999999, currency: 'VND', type: 'checking' }
  ],

  transactions: [
    { id: 't1', fromUserId: 'u1', toUserId: 'u2', amount: 2500000, type: 'transfer', note: 'Trả tiền ăn trưa', status: 'completed', createdAt: '2026-03-07T18:30:00Z' },
    { id: 't2', fromUserId: 'u2', toUserId: 'u1', amount: 1000000, type: 'transfer', note: 'Trả tiền cafe', status: 'completed', createdAt: '2026-03-07T14:15:00Z' },
    { id: 't3', fromUserId: 'u1', toUserId: null, amount: 500000, type: 'topup', note: 'Nạp tiền điện thoại', status: 'completed', createdAt: '2026-03-06T10:00:00Z' },
    { id: 't4', fromUserId: 'u1', toUserId: null, amount: 1200000, type: 'bill', note: 'Thanh toán tiền điện', status: 'completed', createdAt: '2026-03-05T09:00:00Z' },
    { id: 't5', fromUserId: 'u1', toUserId: 'u3', amount: 3500000, type: 'transfer', note: 'Chuyển tiền thuê nhà', status: 'completed', createdAt: '2026-03-04T16:00:00Z' },
    { id: 't6', fromUserId: 'u3', toUserId: 'u1', amount: 800000, type: 'qr_pay', note: 'QR thanh toán đồ uống', status: 'completed', createdAt: '2026-03-03T20:00:00Z' },
    { id: 't7', fromUserId: 'u1', toUserId: null, amount: 250000, type: 'bill', note: 'Thanh toán internet', status: 'completed', createdAt: '2026-03-02T11:30:00Z' },
    { id: 't8', fromUserId: 'u1', toUserId: null, amount: 150000, type: 'topup', note: 'Nạp ví MoMo', status: 'completed', createdAt: '2026-03-01T08:45:00Z' },
    { id: 't9', fromUserId: 'u2', toUserId: 'u1', amount: 5000000, type: 'transfer', note: 'Trả tiền vé máy bay', status: 'completed', createdAt: '2026-02-28T13:00:00Z' },
    { id: 't10', fromUserId: 'u1', toUserId: null, amount: 2000000, type: 'bill', note: 'Thanh toán bảo hiểm', status: 'completed', createdAt: '2026-02-27T15:00:00Z' }
  ],

  cards: [
    { id: 'c1', userId: 'u1', cardNumber: '4970 4000 1234 5678', expiry: '12/28', cvv: '321', cardHolder: 'NGUYEN VAN AN', type: 'visa', frozen: false, color: 'gradient-blue' },
    { id: 'c2', userId: 'u2', cardNumber: '5241 8100 8765 4321', expiry: '06/27', cvv: '456', cardHolder: 'TRAN THI BINH', type: 'mastercard', frozen: false, color: 'gradient-purple' },
    { id: 'c3', userId: 'u3', cardNumber: '4970 4000 5555 6666', expiry: '09/29', cvv: '789', cardHolder: 'LE HOANG MINH', type: 'visa', frozen: true, color: 'gradient-green' }
  ],

  notifications: [
    { id: 'n1', userId: 'u1', title: 'Chuyển tiền thành công', body: 'Bạn đã chuyển 2,500,000₫ cho Trần Thị Bình', read: false, createdAt: '2026-03-07T18:30:00Z' },
    { id: 'n2', userId: 'u1', title: 'Nhận tiền', body: 'Bạn nhận được 1,000,000₫ từ Trần Thị Bình', read: false, createdAt: '2026-03-07T14:15:00Z' },
    { id: 'n3', userId: 'u1', title: 'Thanh toán hóa đơn', body: 'Thanh toán tiền điện 1,200,000₫ thành công', read: true, createdAt: '2026-03-05T09:00:00Z' },
    { id: 'n4', userId: 'u1', title: 'NeoBank Priority', body: 'Chúc mừng! Bạn đã được nâng cấp tài khoản Priority', read: true, createdAt: '2026-03-01T00:00:00Z' }
  ],

  otpStore: {},
  tokenStore: {}
};

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
