// ═══════════════════════════════════════════════════════
// NeoBank — Priority Account Screen
// ═══════════════════════════════════════════════════════

import { api } from '../backend/api.js';
import { formatVND } from '../backend/db.js';
import { navigate } from '../components/router.js';
import { showToast } from '../components/toast.js';
import { skeletonCard, skeletonRows } from '../components/skeleton.js';

export function renderPriority(container) {
  async function load() {
    container.innerHTML = `<div class="screen-content"><div class="page-header"><h1 class="page-title">Priority</h1></div>${skeletonCard()}${skeletonRows(3)}</div>`;
    const res = await api('priority-info');
    if (!res.ok) { showToast(res.error, 'error'); return; }
    render(res);
  }

  function render(data) {
    const { isPriority, account, benefits } = data;
    container.innerHTML = `
      <div class="screen-content">
        <div class="page-header animate-fade-in">
          <button class="back-btn" id="btn-back">←</button>
          <h1 class="page-title">NeoBank Priority</h1>
        </div>

        <!-- Status Badge -->
        <div class="text-center mb-16 animate-pop">
          ${isPriority
            ? '<span class="priority-badge" style="font-size:14px;padding:10px 24px">⭐ Priority Member</span>'
            : '<span style="display:inline-block;padding:10px 24px;background:var(--bg-card);border-radius:20px;font-size:14px;font-weight:600;border:1px solid var(--border-color)">Tài khoản tiêu chuẩn</span>'}
        </div>

        <!-- Balance Card -->
        <div class="balance-card animate-pop" style="background:var(--gradient-gold)">
          <p class="balance-label" style="color:rgba(0,0,0,0.6)">Số dư Priority</p>
          <p class="balance-amount" style="color:#1a1a1a" id="priority-balance">${formatVND(account.balance)}</p>
          <p class="balance-account" style="color:rgba(0,0,0,0.5)">${account.accountNumber}</p>
        </div>

        <!-- Animated balance update -->
        <div class="text-center mt-8 animate-fade-in">
          <button class="btn btn-sm btn-ghost" id="btn-refresh-balance">🔄 Cập nhật số dư</button>
        </div>

        <!-- Benefits -->
        <div class="section-header">
          <h3 class="section-title">Quyền lợi đặc biệt</h3>
        </div>
        <div class="benefits-carousel stagger">
          ${benefits.map((b, i) => `
            <div class="benefit-card animate-slide-right" style="animation-delay:${i * 0.08}s">
              <span class="benefit-icon">${b.icon}</span>
              <div class="benefit-title">${b.title}</div>
              <div class="benefit-desc">${b.desc}</div>
            </div>
          `).join('')}
        </div>

        <!-- Limits -->
        <div class="section-header">
          <h3 class="section-title">Hạn mức giao dịch</h3>
        </div>
        <div class="card animate-fade-in">
          <div style="display:flex;flex-direction:column;gap:16px">
            <div class="flex justify-between">
              <span class="text-muted">Chuyển tiền/ngày</span>
              <span class="font-bold">${isPriority ? '5,000,000,000₫' : '500,000,000₫'}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted">Chuyển tiền/lần</span>
              <span class="font-bold">${isPriority ? '2,000,000,000₫' : '200,000,000₫'}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted">Rút ATM/ngày</span>
              <span class="font-bold">${isPriority ? '100,000,000₫' : '30,000,000₫'}</span>
            </div>
          </div>
        </div>

        ${!isPriority ? `
          <button class="btn btn-primary btn-full mt-24 animate-fade-in" id="btn-upgrade">
            ⭐ Nâng cấp Priority
          </button>
        ` : ''}
      </div>`;

    container.querySelector('#btn-back').addEventListener('click', () => navigate('dashboard'));
    
    container.querySelector('#btn-refresh-balance')?.addEventListener('click', () => {
      const balEl = container.querySelector('#priority-balance');
      balEl.style.animation = 'pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
      setTimeout(() => { balEl.style.animation = ''; }, 500);
      showToast('Số dư đã cập nhật', 'success');
    });

    container.querySelector('#btn-upgrade')?.addEventListener('click', () => {
      showToast('Yêu cầu nâng cấp đã gửi! 🎉', 'success');
    });
  }

  load();
}
