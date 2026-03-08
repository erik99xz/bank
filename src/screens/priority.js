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
      <style>
        .gold-gradient {
            background: linear-gradient(135deg, #1a1a1a 0%, #000000 100%);
            position: relative;
            overflow: hidden;
        }
        .gold-gradient::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle at center, rgba(212, 175, 55, 0.15) 0%, transparent 70%);
            pointer-events: none;
        }
        .shimmer-gold {
            background: linear-gradient(90deg, #D4AF37, #F9F295, #D4AF37);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .border-gold-glow {
            border: 1px solid rgba(212, 175, 55, 0.3);
            box-shadow: 0 0 15px rgba(212, 175, 55, 0.1);
        }
      </style>
      <div class="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden animate-fade-in">
        <!-- Header -->
        <div class="flex items-center p-4 justify-between notch-safe-top">
          <button id="btn-back" class="text-slate-900 dark:text-slate-100 flex size-12 shrink-0 items-center justify-start pointer">
            <span class="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          <h2 class="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center">Priority Card</h2>
          <div class="flex w-12 items-center justify-end">
            <button class="flex size-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <span class="material-symbols-outlined text-xl">more_vert</span>
            </button>
          </div>
        </div>

        <!-- Card Display Section -->
        <div class="p-6 animate-slide-up">
          <div class="gold-gradient border-gold-glow relative aspect-[1.586/1] w-full flex flex-col justify-between rounded-xl p-6 shadow-2xl transition-transform hover:scale-[1.02]">
            <!-- Card Grain Texture Overlay -->
            <div class="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" data-alt="Subtle carbon fiber texture pattern"></div>
            <div class="flex justify-between items-start z-10">
              <div class="flex flex-col gap-1">
                <img alt="NeoBank Logo" class="h-6 w-auto object-contain brightness-0 invert opacity-90" src="https://lh3.googleusercontent.com/aida-public/AB6AXuATc0Q_CNg1utbJR96ffvXsyBEL8eBHZu9wlYi7oY4onhMOzq1rHwPRQL5f4EZz2rqLEFLCVEI9cDFbKt6xnKHAEpDdVbglfGx7aHu3U8SYaf55vZdzCeCECPMYpSRVf9ndQYVfLxrjD6jZr_NAZ7TtIQ6hxcM82I5kOVMfHkAu082MESQH_A6zxekZY001Pj6wL90TAUxHsCzwOmTHYxKYImA2p86rNM5JNAuZkk5yZOIPwKHt2yQhEgdu1HFZM973ItNilNu4ocLv"/>
                <span class="text-[10px] font-bold tracking-[0.2em] text-[#D4AF37] uppercase opacity-80">Priority</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[#D4AF37] opacity-80 text-3xl">contactless</span>
              </div>
            </div>
            
            <div class="z-10 mt-8">
              <div class="flex gap-4 text-xl md:text-2xl font-medium tracking-[0.15em] text-slate-100 drop-shadow-md">
                <span>••••</span>
                <span>••••</span>
                <span>••••</span>
                <span class="shimmer-gold font-bold">8888</span>
              </div>
            </div>
            
            <div class="flex justify-between items-end z-10">
              <div class="flex flex-col">
                <p class="text-[10px] uppercase tracking-widest text-[#D4AF37]/60 font-semibold mb-1">Card Holder</p>
                <p class="text-slate-100 text-base font-bold tracking-wide">${account.holderName || 'NGUYEN VAN A'}</p>
              </div>
              <div class="flex flex-col items-end">
                <div class="flex gap-4 mb-2">
                  <div class="flex flex-col items-center">
                    <p class="text-[8px] uppercase tracking-tighter text-[#D4AF37]/60">Expiry</p>
                    <p class="text-slate-100 text-xs font-bold">12/28</p>
                  </div>
                </div>
                <!-- Simplified VISA logo look -->
                <div class="h-8 italic font-black text-2xl text-slate-100 flex items-center">
                  <span class="text-white">VISA</span>
                  <div class="ml-1 h-1.5 w-1.5 rounded-full bg-[#D4AF37]"></div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Details Button -->
          <div class="mt-6 flex justify-center">
            <button id="btn-show-details" class="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-sm border border-slate-200 dark:border-slate-700 transition-all active:scale-95">
                <span class="material-symbols-outlined text-sm">visibility</span>
                Show Card Details
            </button>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="px-6 pt-2 animate-pop" style="animation-delay: 0.1s">
          <h3 class="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight pb-4">Security & Settings</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer btn-feature" data-msg="Card frozen temporarily">
              <div class="text-primary bg-primary/10 size-10 rounded-lg flex items-center justify-center">
                <span class="material-symbols-outlined">ac_unit</span>
              </div>
              <div class="flex flex-col">
                <h2 class="text-slate-900 dark:text-slate-100 text-sm font-bold">Freeze</h2>
                <p class="text-slate-500 dark:text-slate-400 text-xs">Temporarily lock</p>
              </div>
            </div>
            
            <div class="flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer btn-feature" data-msg="Adjusting spending limits">
              <div class="text-[#D4AF37] bg-[#D4AF37]/10 size-10 rounded-lg flex items-center justify-center">
                <span class="material-symbols-outlined">tune</span>
              </div>
              <div class="flex flex-col">
                <h2 class="text-slate-900 dark:text-slate-100 text-sm font-bold">Limits</h2>
                <p class="text-slate-500 dark:text-slate-400 text-xs">Manage spending</p>
              </div>
            </div>
            
            <div class="flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer btn-feature" data-msg="Verify identity to change PIN">
              <div class="text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 size-10 rounded-lg flex items-center justify-center">
                <span class="material-symbols-outlined">password</span>
              </div>
              <div class="flex flex-col">
                <h2 class="text-slate-900 dark:text-slate-100 text-sm font-bold">PIN</h2>
                <p class="text-slate-500 dark:text-slate-400 text-xs">Change code</p>
              </div>
            </div>
            
            <div class="flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer btn-feature" data-msg="Replacement card ordered">
              <div class="text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 size-10 rounded-lg flex items-center justify-center">
                <span class="material-symbols-outlined">credit_card</span>
              </div>
              <div class="flex flex-col">
                <h2 class="text-slate-900 dark:text-slate-100 text-sm font-bold">Replace</h2>
                <p class="text-slate-500 dark:text-slate-400 text-xs">Order new card</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Benefits Section -->
        <div class="p-6 animate-pop" style="animation-delay: 0.2s">
          <div class="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-xl p-4 border border-[#D4AF37]/20 flex items-center gap-4 cursor-pointer" id="btn-benefits">
            <div class="size-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-[#D4AF37]">workspace_premium</span>
            </div>
            <div>
              <h4 class="text-slate-100 text-sm font-bold">Priority Benefits</h4>
              <p class="text-slate-400 text-xs">Unlimited lounge access & 2% cashback</p>
            </div>
            <span class="material-symbols-outlined text-slate-500 ml-auto">chevron_right</span>
          </div>
        </div>
        
        <!-- Spacer for content -->
        <div style="height: 100px;"></div>
      </div>`;

    container.querySelector('#btn-back').addEventListener('click', () => navigate('dashboard'));
    
    container.querySelector('#btn-show-details')?.addEventListener('click', () => {
      showToast('Face ID Verified. Loading details...', 'success');
    });

    container.querySelectorAll('.btn-feature').forEach(btn => {
      btn.addEventListener('click', (e) => {
        showToast(e.currentTarget.dataset.msg, 'info');
      });
    });

    container.querySelector('#btn-benefits')?.addEventListener('click', () => {
      showToast('Priority Benefits: Unlimited Lounge Access & 2% Cashback', 'info');
    });
  }

  load();
}
