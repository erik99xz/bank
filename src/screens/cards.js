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
          <div class="virtual-card-container animate-pop" style="animation-delay:${i * 0.15}s; perspective: 1000px; position:relative; width:100%;">
            <div class="relative w-full aspect-[1.586/1] transition-transform duration-700 virtual-card ${flippedId === card.id ? 'flipped' : ''} ${card.frozen ? 'grayscale opacity-80' : ''}" data-card-id="${card.id}" style="transform-style: preserve-3d; cursor:pointer;">
              
              <!-- Front -->
              <div class="absolute inset-0 backface-hidden rounded-xl overflow-hidden shadow-2xl p-6 flex flex-col justify-between" style="background: linear-gradient(135deg, ${card.type==='visa'?'#111':'#1f2b3d'} 0%, #000 100%); border: 1px solid rgba(212, 175, 55, 0.3);">
                <!-- Card Grain Texture -->
                <div class="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                <div class="flex justify-between items-start z-10">
                  <div class="flex flex-col gap-1">
                    <img alt="NeoBank Logo" class="h-6 w-auto object-contain brightness-0 invert opacity-90" src="https://lh3.googleusercontent.com/aida-public/AB6AXuATc0Q_CNg1utbJR96ffvXsyBEL8eBHZu9wlYi7oY4onhMOzq1rHwPRQL5f4EZz2rqLEFLCVEI9cDFbKt6xnKHAEpDdVbglfGx7aHu3U8SYaf55vZdzCeCECPMYpSRVf9ndQYVfLxrjD6jZr_NAZ7TtIQ6hxcM82I5kOVMfHkAu082MESQH_A6zxekZY001Pj6wL90TAUxHsCzwOmTHYxKYImA2p86rNM5JNAuZkk5yZOIPwKHt2yQhEgdu1HFZM973ItNilNu4ocLv"/>
                    <span class="text-[10px] font-bold tracking-[0.2em] text-[#D4AF37] uppercase opacity-80">${card.type === 'visa' ? 'Priority' : 'Standard'}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-[#D4AF37] opacity-80 text-3xl">contactless</span>
                  </div>
                </div>
                <!-- Card Number -->
                <div class="z-10 mt-6 md:mt-8">
                  <div class="flex gap-4 text-lg md:text-2xl font-medium tracking-[0.15em] text-slate-100 drop-shadow-md">
                    <span>••••</span><span>••••</span><span>••••</span>
                    <span class="bg-gradient-to-r ${card.type==='visa' ? 'from-[#D4AF37] via-[#F9F295] to-[#D4AF37]' : 'from-slate-200 to-white'} bg-clip-text text-transparent font-bold">${card.cardNumber.slice(-4)}</span>
                  </div>
                </div>
                <!-- Card Bottom View -->
                <div class="flex justify-between items-end z-10">
                  <div class="flex flex-col">
                    <p class="text-[9px] uppercase tracking-widest text-[#D4AF37]/60 font-semibold mb-1">Card Holder</p>
                    <p class="text-slate-100 text-sm md:text-base font-bold tracking-wide">${card.cardHolder}</p>
                  </div>
                  <div class="flex flex-col items-end">
                    <div class="flex gap-4 mb-1">
                      <div class="flex flex-col items-center">
                        <p class="text-[8px] uppercase tracking-tighter text-[#D4AF37]/60">Expiry</p>
                        <p class="text-slate-100 text-xs font-bold">${card.expiry}</p>
                      </div>
                    </div>
                    ${card.type === 'visa' ? `
                    <div class="h-6 md:h-8 italic font-black text-xl md:text-2xl text-slate-100 flex items-center">
                      <span class="text-white">VISA</span><div class="ml-1 h-1.5 w-1.5 rounded-full bg-[#D4AF37]"></div>
                    </div>` : `
                    <div class="h-6 md:h-8 font-black text-xl md:text-2xl text-slate-300 flex items-center">
                      MASTERCARD
                    </div>`}
                  </div>
                </div>
              </div>

              <!-- Back -->
              <div class="absolute inset-0 backface-hidden rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-900 to-black border border-slate-800" style="transform: rotateY(180deg);">
                <div class="w-full h-12 bg-slate-950 mt-6"></div>
                <div class="px-6 py-4 flex flex-col h-full">
                  <div class="flex items-center gap-2 mb-4">
                    <div class="flex-1 bg-repeating-linear-gradient-to-r from-slate-300 to-slate-400 h-8 rounded relative overflow-hidden flex items-center justify-end px-3">
                       <span class="font-mono text-black font-bold mr-2 text-sm">${card.cvv}</span>
                    </div>
                  </div>
                  <div class="mt-auto mb-6 text-xs text-slate-500 font-mono tracking-widest break-all">
                    ${card.cardNumber}
                  </div>
                </div>
              </div>

              <!-- Freeze Overlay -->
              ${card.frozen ? `
                <div class="absolute inset-0 z-20 rounded-xl overflow-hidden backdrop-blur-[4px] bg-slate-900/30 flex flex-col items-center justify-center transition-all animate-fade-in" style="transform: translateZ(10px);">
                  <div class="w-full h-full absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMDAnIGhlaWdodD0nMTAwJz48ZmlsdGVyIGlkPSdmJz48ZmVUdXJidWxlbmNlIHR5cGU9J2ZyYWN0YWxOb2lzZScgYmFzZUZyZXF1ZW5jeT0nMC4wNScgbnVtT2N0YXZlcz0nMycgc3RpdGNoVGlsZXM9J3N0aXRjaCcvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPScxMDAlJyBoZWlnaHQ9JzEwMCUnIGZpbHRlcj0ndXJsKCNmKScgb3BhY2l0eT0nMC4xJy8+PC9zdmc+')] mix-blend-overlay"></div>
                  <span class="material-symbols-outlined text-white text-5xl mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">ac_unit</span>
                  <span class="text-white font-bold tracking-widest uppercase text-xs px-3 py-1 bg-black/50 rounded-full backdrop-blur-md">Frozen</span>
                </div>
              ` : ''}
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
