// ═══════════════════════════════════════════════════════
// NeoBank — Cards Management Screen
// ═══════════════════════════════════════════════════════

import { api } from '../backend/api.js';
import { navigate } from '../components/router.js';
import { showToast } from '../components/toast.js';
import { skeletonCard } from '../components/skeleton.js';

export function renderCards(container) {
  let cards = [];
  let flippedId = null;

  async function load() {
    container.innerHTML = `<div class="screen-content"><div class="page-header"><h1 class="page-title">Thẻ của tôi</h1></div>${skeletonCard()}${skeletonCard()}</div>`;
    const res = await api('cards');
    if (!res.ok) { showToast(res.error, 'error'); return; }
    cards = res.cards;
    render();
  }

  function render() {
    container.innerHTML = `
      <div class="screen-content">
        <div class="page-header animate-fade-in">
          <button class="back-btn" id="btn-back">←</button>
          <h1 class="page-title">Thẻ của tôi</h1>
        </div>

        ${cards.map((card, i) => `
          <div class="virtual-card-container animate-pop" style="animation-delay:${i * 0.15}s">
            <div class="virtual-card ${flippedId === card.id ? 'flipped' : ''}" data-card-id="${card.id}">
              <!-- Front -->
              <div class="card-face card-front ${card.color}">
                <div class="card-type-logo">${card.type === 'visa' ? '𝗩' : '◉◉'}</div>
                <div class="card-chip"></div>
                <div class="card-number">${maskCardNumber(card.cardNumber)}</div>
                <div class="card-bottom">
                  <div>
                    <div class="card-holder-label">Card Holder</div>
                    <div class="card-holder-name">${card.cardHolder}</div>
                  </div>
                  <div>
                    <div class="card-expiry-label">Expires</div>
                    <div class="card-expiry-value">${card.expiry}</div>
                  </div>
                </div>
              </div>
              <!-- Back -->
              <div class="card-face card-back">
                <div class="card-magnetic"></div>
                <div style="display:flex;align-items:center;gap:12px;margin-top:12px">
                  <div style="flex:1;background:repeating-linear-gradient(90deg,#ccc,#ccc 2px,#eee 2px,#eee 4px);height:36px;border-radius:4px"></div>
                  <div class="card-cvv-strip">${card.cvv}</div>
                </div>
                <div style="margin-top:20px;font-size:12px;color:rgba(255,255,255,0.5)">
                  Số thẻ: ${card.cardNumber}
                </div>
                <div style="margin-top:8px;font-size:11px;color:rgba(255,255,255,0.4)">
                  Bấm vào thẻ để lật lại
                </div>
              </div>

              ${card.frozen ? `
                <div class="card-frozen-overlay">
                  <span style="font-size:36px">❄️</span>
                  <span>Thẻ đã bị đóng băng</span>
                </div>` : ''}
            </div>

            <!-- Card actions -->
            <div class="flex items-center justify-between mt-16" style="padding:0 4px">
              <div>
                <div style="font-size:13px;font-weight:600">${card.type === 'visa' ? 'Visa Debit' : 'Mastercard'}</div>
                <div class="text-sm text-muted">${card.frozen ? 'Đã đóng băng' : 'Đang hoạt động'}</div>
              </div>
              <div class="flex items-center gap-12">
                <span class="text-sm text-muted">${card.frozen ? 'Mở khóa' : 'Đóng băng'}</span>
                <div class="toggle ${card.frozen ? '' : 'active'}" data-freeze-id="${card.id}"></div>
              </div>
            </div>
          </div>
        `).join('')}

        ${cards.length === 0 ? '<p class="text-center text-muted" style="padding:40px">Bạn chưa có thẻ nào</p>' : ''}

        <p class="text-sm text-muted text-center mt-24 animate-fade-in">
          💡 Nhấn vào thẻ để xem chi tiết mặt sau
        </p>
      </div>`;

    // Back
    container.querySelector('#btn-back').addEventListener('click', () => navigate('dashboard'));

    // Flip cards
    container.querySelectorAll('.virtual-card').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.cardId;
        flippedId = flippedId === id ? null : id;
        render();
      });
    });

    // Freeze toggle
    container.querySelectorAll('.toggle[data-freeze-id]').forEach(toggle => {
      toggle.addEventListener('click', async (e) => {
        e.stopPropagation();
        const cardId = toggle.dataset.freezeId;
        const res = await api('toggle-card-freeze', { cardId });
        if (res.ok) {
          const card = cards.find(c => c.id === cardId);
          if (card) card.frozen = res.frozen;
          showToast(res.frozen ? 'Thẻ đã bị đóng băng ❄️' : 'Thẻ đã mở khóa ✅', res.frozen ? 'warning' : 'success');
          render();
        }
      });
    });
  }

  function maskCardNumber(num) {
    const parts = num.split(' ');
    return parts.map((p, i) => i > 0 && i < parts.length - 1 ? '••••' : p).join(' ');
  }

  load();
}
