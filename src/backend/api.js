// ═══════════════════════════════════════════════════════
// NeoBank — Fake REST API
// ═══════════════════════════════════════════════════════

import { DB, genId, getUserById, getAccountByUserId, formatVND } from './db.js';

// Simulate network latency (500-1000ms)
function delay() {
  return new Promise(r => setTimeout(r, 500 + Math.random() * 500));
}

// Current session token
let currentToken = localStorage.getItem('neo_token') || null;
let currentUserId = localStorage.getItem('neo_userId') || null;

export function getCurrentUserId() { return currentUserId; }
export function isLoggedIn() { return !!currentToken; }

export function logout() {
  currentToken = null;
  currentUserId = null;
  localStorage.removeItem('neo_token');
  localStorage.removeItem('neo_userId');
}

// ── Main API dispatcher ────────────────────────────────
export async function api(endpoint, body = {}) {
  await delay();

  const routes = {
    // Auth
    'login': handleLogin,
    'register': handleRegister,
    'send-otp': handleSendOtp,
    'verify-otp': handleVerifyOtp,
    'forgot-password': handleForgotPassword,
    'biometric-login': handleBiometricLogin,

    // User
    'dashboard': handleDashboard,
    'profile': handleProfile,
    'update-profile': handleUpdateProfile,
    'change-password': handleChangePassword,
    'toggle-theme': handleToggleTheme,
    'notifications': handleNotifications,
    'mark-notification-read': handleMarkNotificationRead,

    // Banking
    'transfer': handleTransfer,
    'transactions': handleTransactions,
    'cards': handleCards,
    'toggle-card-freeze': handleToggleCardFreeze,
    'qr-pay': handleQrPay,

    // Priority
    'priority-info': handlePriorityInfo,

    // Public API Lookup
    'lookup-name': handleLookupName,

    // Admin
    'admin/users': handleAdminUsers,
    'admin/transactions': handleAdminTransactions,
    'admin/update-balance': handleAdminUpdateBalance,
    'admin/send-notification': handleAdminSendNotification,
    'admin/delete-user': handleAdminDeleteUser,
    'admin/add-user': handleAdminAddUser,
  };

  const handler = routes[endpoint];
  if (!handler) return { ok: false, error: 'Unknown endpoint: ' + endpoint };
  try {
    return await handler(body);
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ── Public API Handlers ────────────────────────────────
async function handleLookupName({ bankBin, accountNo }) {
  try {
    const res = await fetch('https://api.httzip.com/api/bank/id-lookup-prod', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bank: bankBin, account: accountNo })
    });
    
    if (res.ok) {
        const data = await res.json();
        // Structure from httzip: { data: { ownerName: "..." } } or similar
        // if not found it might throw or return empty
        if (data && data.data && data.data.ownerName) {
           return { ok: true, name: data.data.ownerName };
        }
    }
  } catch (err) {
    console.error("Lookup API failed", err);
  }
  return { ok: false, error: 'Không tìm thấy thông tin tài khoản' };
}

// ── Auth handlers ──────────────────────────────────────
function handleLogin({ email, password }) {
  const user = DB.users.find(u => (u.email === email || u.phone === email) && u.password === password);
  if (!user) return { ok: false, error: 'Email/số điện thoại hoặc mật khẩu không đúng' };
  const token = 'tok_' + genId();
  currentToken = token;
  currentUserId = user.id;
  localStorage.setItem('neo_token', token);
  localStorage.setItem('neo_userId', user.id);
  return { ok: true, user: sanitizeUser(user), token };
}

function handleRegister({ name, email, phone, password }) {
  if (DB.users.find(u => u.email === email)) return { ok: false, error: 'Email đã tồn tại' };
  const id = genId('u');
  const user = { id, name, email, phone, password, avatar: null, role: 'user', priority: false, biometricEnabled: false, language: 'vi', theme: 'dark', createdAt: new Date().toISOString() };
  DB.users.push(user);
  DB.accounts.push({ id: genId('a'), userId: id, accountNumber: '9704 ' + Math.random().toString().slice(2, 6) + ' ' + Math.random().toString().slice(2, 6) + ' ' + Math.random().toString().slice(2, 6), balance: 10000000, currency: 'VND', type: 'checking' });
  DB.cards.push({ id: genId('c'), userId: id, cardNumber: '4970 ' + Math.random().toString().slice(2, 6) + ' ' + Math.random().toString().slice(2, 6) + ' ' + Math.random().toString().slice(2, 6), expiry: '12/29', cvv: String(Math.floor(100 + Math.random() * 900)), cardHolder: name.toUpperCase(), type: 'visa', frozen: false, color: 'gradient-blue' });
  return { ok: true, message: 'Đăng ký thành công! Vui lòng đăng nhập.' };
}

function handleSendOtp({ email }) {
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  DB.otpStore[email] = otp;
  console.log(`[NeoBank] OTP for ${email}: ${otp}`);
  return { ok: true, message: 'OTP đã gửi', hint: otp };
}

function handleVerifyOtp({ email, otp }) {
  if (DB.otpStore[email] === otp) {
    delete DB.otpStore[email];
    return { ok: true, message: 'Xác thực thành công' };
  }
  return { ok: false, error: 'OTP không đúng' };
}

function handleForgotPassword({ email }) {
  const user = DB.users.find(u => u.email === email);
  if (!user) return { ok: false, error: 'Email không tồn tại' };
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  DB.otpStore[email] = otp;
  return { ok: true, message: 'OTP đặt lại mật khẩu đã gửi', hint: otp };
}

function handleBiometricLogin() {
  // Simulate biometric — auto-login as demo user
  const user = DB.users.find(u => u.id === 'u1');
  const token = 'tok_' + genId();
  currentToken = token;
  currentUserId = user.id;
  localStorage.setItem('neo_token', token);
  localStorage.setItem('neo_userId', user.id);
  return { ok: true, user: sanitizeUser(user), token };
}

// ── Dashboard ──────────────────────────────────────────
function handleDashboard() {
  requireAuth();
  const user = getUserById(currentUserId);
  const account = getAccountByUserId(currentUserId);
  const txs = DB.transactions
    .filter(t => t.fromUserId === currentUserId || t.toUserId === currentUserId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map(t => enrichTransaction(t, currentUserId));
  const unreadNotifs = DB.notifications.filter(n => n.userId === currentUserId && !n.read).length;

  // Spending summary — last 7 days
  const now = new Date();
  const spending = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    const dayStr = d.toISOString().slice(0, 10);
    const dayTotal = DB.transactions
      .filter(t => t.fromUserId === currentUserId && t.createdAt.slice(0, 10) === dayStr)
      .reduce((s, t) => s + t.amount, 0);
    spending.push({ day: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()], amount: dayTotal });
  }

  return { ok: true, user: sanitizeUser(user), account, transactions: txs, unreadNotifs, spending };
}

// ── Profile ────────────────────────────────────────────
function handleProfile() {
  requireAuth();
  const user = getUserById(currentUserId);
  const account = getAccountByUserId(currentUserId);
  return { ok: true, user: sanitizeUser(user), account };
}

function handleUpdateProfile({ name, email, phone }) {
  requireAuth();
  const user = getUserById(currentUserId);
  if (name) user.name = name;
  if (email) user.email = email;
  if (phone) user.phone = phone;
  return { ok: true, user: sanitizeUser(user) };
}

function handleChangePassword({ oldPassword, newPassword }) {
  requireAuth();
  const user = getUserById(currentUserId);
  if (user.password !== oldPassword) return { ok: false, error: 'Mật khẩu cũ không đúng' };
  user.password = newPassword;
  return { ok: true, message: 'Đổi mật khẩu thành công' };
}

function handleToggleTheme() {
  requireAuth();
  const user = getUserById(currentUserId);
  user.theme = user.theme === 'dark' ? 'light' : 'dark';
  return { ok: true, theme: user.theme };
}

// ── Notifications ──────────────────────────────────────
function handleNotifications() {
  requireAuth();
  const notifs = DB.notifications
    .filter(n => n.userId === currentUserId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return { ok: true, notifications: notifs };
}

function handleMarkNotificationRead({ id }) {
  requireAuth();
  const n = DB.notifications.find(x => x.id === id);
  if (n) n.read = true;
  return { ok: true };
}

// ── Transfer ───────────────────────────────────────────
function handleTransfer({ toAccount, amount, note, accName }) {
  requireAuth();
  const fromAcc = getAccountByUserId(currentUserId);
  amount = Number(amount);
  if (!amount || amount <= 0) return { ok: false, error: 'Số tiền không hợp lệ' };
  if (fromAcc.balance < amount) return { ok: false, error: 'Số dư không đủ' };

  // Find recipient
  const toAcc = DB.accounts.find(a => a.accountNumber.replace(/\s/g, '').includes(toAccount.replace(/\s/g, '')));
  if (toAcc && toAcc.userId === currentUserId) return { ok: false, error: 'Không thể chuyển cho chính mình' };

  fromAcc.balance -= amount;
  if (toAcc) toAcc.balance += amount;

  const toUserId = toAcc ? toAcc.userId : ('ext_' + toAccount);
  const tx = { id: genId('t'), fromUserId: currentUserId, toUserId: toUserId, amount, type: 'transfer', note: note || '', otherParty: accName || null, status: 'completed', createdAt: new Date().toISOString() };
  DB.transactions.unshift(tx);

  const toUser = toAcc ? getUserById(toAcc.userId) : null;
  const toName = toUser ? toUser.name : `tài khoản ${toAccount}`;
  
  DB.notifications.unshift({ id: genId('n'), userId: currentUserId, title: 'Chuyển tiền thành công', body: `Bạn đã chuyển ${formatVND(amount)} cho ${toName}`, read: false, createdAt: new Date().toISOString() });
  
  if (toAcc) {
    DB.notifications.unshift({ id: genId('n'), userId: toAcc.userId, title: 'Nhận tiền', body: `Bạn nhận được ${formatVND(amount)} từ ${getUserById(currentUserId)?.name}`, read: false, createdAt: new Date().toISOString() });
  }

  return { ok: true, transaction: enrichTransaction(tx, currentUserId), newBalance: fromAcc.balance };
}

// ── Transactions ───────────────────────────────────────
function handleTransactions({ type, search, dateFrom, dateTo } = {}) {
  requireAuth();
  let txs = DB.transactions
    .filter(t => t.fromUserId === currentUserId || t.toUserId === currentUserId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (type && type !== 'all') txs = txs.filter(t => t.type === type);
  if (search) {
    const s = search.toLowerCase();
    txs = txs.filter(t => t.note.toLowerCase().includes(s) || t.id.includes(s));
  }
  if (dateFrom) txs = txs.filter(t => t.createdAt >= dateFrom);
  if (dateTo) txs = txs.filter(t => t.createdAt <= dateTo + 'T23:59:59Z');

  return { ok: true, transactions: txs.map(t => enrichTransaction(t, currentUserId)) };
}

// ── Cards ──────────────────────────────────────────────
function handleCards() {
  requireAuth();
  const cards = DB.cards.filter(c => c.userId === currentUserId);
  return { ok: true, cards };
}

function handleToggleCardFreeze({ cardId }) {
  requireAuth();
  const card = DB.cards.find(c => c.id === cardId && c.userId === currentUserId);
  if (!card) return { ok: false, error: 'Không tìm thấy thẻ' };
  card.frozen = !card.frozen;
  return { ok: true, frozen: card.frozen };
}

// ── QR Pay ─────────────────────────────────────────────
function handleQrPay({ amount, note, toUserId }) {
  requireAuth();
  const fromAcc = getAccountByUserId(currentUserId);
  amount = Number(amount);
  if (!amount || amount <= 0) return { ok: false, error: 'Số tiền không hợp lệ' };
  if (fromAcc.balance < amount) return { ok: false, error: 'Số dư không đủ' };

  const toAcc = getAccountByUserId(toUserId || 'u2');
  if (!toAcc) return { ok: false, error: 'Người nhận không hợp lệ' };

  fromAcc.balance -= amount;
  toAcc.balance += amount;

  const tx = { id: genId('t'), fromUserId: currentUserId, toUserId: toAcc.userId, amount, type: 'qr_pay', note: note || 'QR Pay', status: 'completed', createdAt: new Date().toISOString() };
  DB.transactions.unshift(tx);
  return { ok: true, transaction: enrichTransaction(tx, currentUserId), newBalance: fromAcc.balance };
}

// ── Priority ───────────────────────────────────────────
function handlePriorityInfo() {
  requireAuth();
  const user = getUserById(currentUserId);
  const account = getAccountByUserId(currentUserId);
  return {
    ok: true,
    isPriority: user.priority,
    account,
    benefits: [
      { icon: '💎', title: 'Hạn mức chuyển tiền', desc: 'Lên đến 5 tỷ VNĐ/ngày' },
      { icon: '🛡️', title: 'Bảo hiểm giao dịch', desc: 'Bảo vệ 100% giao dịch' },
      { icon: '🎯', title: 'Cashback 2%', desc: 'Hoàn tiền mọi giao dịch' },
      { icon: '✈️', title: 'Lounge sân bay', desc: 'Miễn phí 4 lần/năm' },
      { icon: '🏦', title: 'Lãi suất ưu đãi', desc: 'Tiết kiệm lãi suất 8.5%/năm' },
      { icon: '📞', title: 'Hỗ trợ 24/7', desc: 'Đường dây riêng Priority' }
    ]
  };
}

// ── Admin handlers ─────────────────────────────────────
function handleAdminUsers({ search } = {}) {
  requireAdmin();
  let users = DB.users.filter(u => u.role !== 'admin').map(u => {
    const acc = getAccountByUserId(u.id);
    return { ...sanitizeUser(u), balance: acc?.balance || 0, accountNumber: acc?.accountNumber || '' };
  });
  if (search) {
    const s = search.toLowerCase();
    users = users.filter(u => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || u.phone.includes(s));
  }
  return { ok: true, users };
}

function handleAdminTransactions({ search, type } = {}) {
  requireAdmin();
  let txs = DB.transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (type && type !== 'all') txs = txs.filter(t => t.type === type);
  if (search) {
    const s = search.toLowerCase();
    txs = txs.filter(t => {
      const from = getUserById(t.fromUserId);
      const to = getUserById(t.toUserId);
      return t.note.toLowerCase().includes(s) || from?.name.toLowerCase().includes(s) || to?.name.toLowerCase().includes(s);
    });
  }
  return { ok: true, transactions: txs.map(t => ({ ...t, fromUser: getUserById(t.fromUserId)?.name || 'System', toUser: getUserById(t.toUserId)?.name || 'N/A' })) };
}

function handleAdminUpdateBalance({ userId, newBalance }) {
  requireAdmin();
  const acc = getAccountByUserId(userId);
  if (!acc) return { ok: false, error: 'Không tìm thấy tài khoản' };
  acc.balance = Number(newBalance);
  return { ok: true, balance: acc.balance };
}

function handleAdminSendNotification({ userId, title, body }) {
  requireAdmin();
  const notif = { id: genId('n'), userId, title, body, read: false, createdAt: new Date().toISOString() };
  DB.notifications.unshift(notif);
  return { ok: true, notification: notif };
}

function handleAdminDeleteUser({ userId }) {
  requireAdmin();
  const idx = DB.users.findIndex(u => u.id === userId);
  if (idx === -1) return { ok: false, error: 'Không tìm thấy người dùng' };
  DB.users.splice(idx, 1);
  DB.accounts = DB.accounts.filter(a => a.userId !== userId);
  DB.cards = DB.cards.filter(c => c.userId !== userId);
  return { ok: true };
}

function handleAdminAddUser({ name, email, phone, password, balance }) {
  requireAdmin();
  if (DB.users.find(u => u.email === email)) return { ok: false, error: 'Email đã tồn tại' };
  const id = genId('u');
  const user = { id, name, email, phone, password: password || '123456', avatar: null, role: 'user', priority: false, biometricEnabled: false, language: 'vi', theme: 'dark', createdAt: new Date().toISOString() };
  DB.users.push(user);
  DB.accounts.push({ id: genId('a'), userId: id, accountNumber: '9704 ' + Math.random().toString().slice(2, 6) + ' ' + Math.random().toString().slice(2, 6) + ' ' + Math.random().toString().slice(2, 6), balance: Number(balance) || 10000000, currency: 'VND', type: 'checking' });
  DB.cards.push({ id: genId('c'), userId: id, cardNumber: '4970 ' + Math.random().toString().slice(2, 6) + ' ' + Math.random().toString().slice(2, 6) + ' ' + Math.random().toString().slice(2, 6), expiry: '12/29', cvv: String(Math.floor(100 + Math.random() * 900)), cardHolder: name.toUpperCase(), type: 'visa', frozen: false, color: 'gradient-blue' });
  return { ok: true, user: sanitizeUser(user) };
}

// ── Utilities ──────────────────────────────────────────
function requireAuth() {
  if (!currentToken || !currentUserId) throw new Error('Vui lòng đăng nhập');
}

function requireAdmin() {
  requireAuth();
  const user = getUserById(currentUserId);
  if (!user || user.role !== 'admin') throw new Error('Không có quyền truy cập');
}

function sanitizeUser(u) {
  const { password, ...rest } = u;
  return rest;
}

function enrichTransaction(t, userId) {
  const isOutgoing = t.fromUserId === userId;
  const otherUser = getUserById(isOutgoing ? t.toUserId : t.fromUserId);
  return {
    ...t,
    direction: isOutgoing ? 'out' : 'in',
    otherParty: otherUser?.name || (t.type === 'topup' ? 'Nạp tiền' : t.type === 'bill' ? 'Thanh toán' : 'Hệ thống'),
    displayAmount: (isOutgoing ? '-' : '+') + formatVND(t.amount)
  };
}
