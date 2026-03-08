// ═══════════════════════════════════════════════════════
// NeoBank — Change Card PIN Screen
// ═══════════════════════════════════════════════════════

import { api } from '../backend/api.js';
import { navigate } from '../components/router.js';
import { showToast } from '../components/toast.js';

export function renderChangePin(container) {
  async function load() {
    container.innerHTML = `<div class="p-8 text-center text-slate-500">Loading...</div>`;
    const res = await api('profile');
    const userName = res.ok ? res.user.name.toUpperCase() : 'NGUYEN VAN A';

    container.innerHTML = `
      <div class="relative flex min-h-[100dvh] w-full flex-col overflow-x-hidden max-w-md mx-auto">
        <!-- Top App Bar -->
        <header class="sticky top-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-md pt-6 pb-2 px-4 flex items-center justify-between">
          <button id="btn-back" class="flex items-center justify-center w-10 h-10 rounded-full hover:bg-[var(--accent)]/10 transition-colors">
            <span class="material-symbols-outlined text-[var(--text-primary)]">arrow_back</span>
          </button>
          <h1 class="text-lg font-bold leading-tight tracking-tight flex-1 text-center">Change Card PIN</h1>
          <div class="flex w-10 h-10 items-center justify-center rounded-full bg-[var(--accent)]/10">
            <span class="material-symbols-outlined text-[var(--accent)]">lock</span>
          </div>
        </header>
        
        <main class="flex-1 px-6 pb-28">
          <div class="mt-4 mb-6">
            <p class="text-[var(--text-muted)] text-sm font-medium">Update the PIN used for your NeoBank Visa card</p>
          </div>

          <!-- Card Preview Section -->
          <div class="mb-8 animate-pop">
            <div class="relative aspect-[1.586/1] w-full rounded-xl overflow-hidden shadow-xl bg-gradient-to-br from-slate-800 via-[#101e22] to-slate-900 border border-slate-700 p-6 flex flex-col justify-between">
              <div class="flex justify-between items-start">
                <div class="flex flex-col">
                  <span class="text-[10px] font-bold tracking-widest text-[var(--accent)] uppercase">NeoBank Platinum</span>
                  <div class="mt-1 h-8 w-12 bg-[var(--accent)]/20 rounded flex items-center justify-center border border-[var(--accent)]/30">
                    <span class="material-symbols-outlined text-[var(--accent)]/60 scale-75">credit_card</span>
                  </div>
                </div>
                <div class="italic font-black text-xl text-slate-400">VISA</div>
              </div>
              <div class="flex flex-col gap-1">
                <p class="text-xl font-mono tracking-widest text-slate-100">•••• •••• •••• 8888</p>
                <div class="flex justify-between items-end mt-2">
                  <div class="flex flex-col">
                    <span class="text-[8px] text-slate-500 uppercase">Card Holder</span>
                    <span class="text-sm font-bold text-slate-100">${userName}</span>
                  </div>
                  <div class="flex flex-col items-end">
                    <span class="text-[8px] text-slate-500 uppercase">Expires</span>
                    <span class="text-sm font-bold text-slate-100">12/28</span>
                  </div>
                </div>
              </div>
              <div class="absolute -right-10 -top-10 w-40 h-40 bg-[var(--accent)]/5 rounded-full blur-3xl"></div>
            </div>
          </div>

          <!-- PIN Input Sections -->
          <div class="space-y-8 animate-fade-in" style="animation-delay: 0.1s">
            
            <!-- Current PIN -->
            <div class="flex flex-col items-center">
              <label class="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest mb-3">Current PIN</label>
              <div class="flex gap-4 pin-group" id="current-pin-group">
                <input class="w-12 h-14 bg-[var(--bg-input)] border-b-2 border-slate-700 focus:border-[var(--accent)] focus:ring-0 text-center text-2xl font-bold rounded-t-lg transition-all" maxlength="1" type="password" inputmode="numeric" pattern="[0-9]*" />
                <input class="w-12 h-14 bg-[var(--bg-input)] border-b-2 border-slate-700 focus:border-[var(--accent)] focus:ring-0 text-center text-2xl font-bold rounded-t-lg transition-all" maxlength="1" type="password" inputmode="numeric" pattern="[0-9]*" />
                <input class="w-12 h-14 bg-[var(--bg-input)] border-b-2 border-slate-700 focus:border-[var(--accent)] focus:ring-0 text-center text-2xl font-bold rounded-t-lg transition-all" maxlength="1" type="password" inputmode="numeric" pattern="[0-9]*" />
                <input class="w-12 h-14 bg-[var(--bg-input)] border-b-2 border-slate-700 focus:border-[var(--accent)] focus:ring-0 text-center text-2xl font-bold rounded-t-lg transition-all" maxlength="1" type="password" inputmode="numeric" pattern="[0-9]*" />
              </div>
            </div>

            <!-- New PIN -->
            <div class="flex flex-col items-center">
              <label class="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest mb-3">New PIN</label>
              <div class="flex gap-4 pin-group" id="new-pin-group">
                <input class="w-12 h-14 bg-[var(--bg-input)] border-b-2 border-slate-700 focus:border-[var(--accent)] focus:ring-0 text-center text-2xl font-bold rounded-t-lg transition-all" maxlength="1" type="password" inputmode="numeric" pattern="[0-9]*" />
                <input class="w-12 h-14 bg-[var(--bg-input)] border-b-2 border-slate-700 focus:border-[var(--accent)] focus:ring-0 text-center text-2xl font-bold rounded-t-lg transition-all" maxlength="1" type="password" inputmode="numeric" pattern="[0-9]*" />
                <input class="w-12 h-14 bg-[var(--bg-input)] border-b-2 border-slate-700 focus:border-[var(--accent)] focus:ring-0 text-center text-2xl font-bold rounded-t-lg transition-all" maxlength="1" type="password" inputmode="numeric" pattern="[0-9]*" />
                <input class="w-12 h-14 bg-[var(--bg-input)] border-b-2 border-slate-700 focus:border-[var(--accent)] focus:ring-0 text-center text-2xl font-bold rounded-t-lg transition-all" maxlength="1" type="password" inputmode="numeric" pattern="[0-9]*" />
              </div>
            </div>

            <!-- Confirm New PIN -->
            <div class="flex flex-col items-center">
              <label class="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest mb-3">Confirm New PIN</label>
              <div class="flex gap-4 pin-group" id="confirm-pin-group">
                <input class="w-12 h-14 bg-[var(--bg-input)] border-b-2 border-slate-700 focus:border-[var(--accent)] focus:ring-0 text-center text-2xl font-bold rounded-t-lg transition-all" maxlength="1" type="password" inputmode="numeric" pattern="[0-9]*" />
                <input class="w-12 h-14 bg-[var(--bg-input)] border-b-2 border-slate-700 focus:border-[var(--accent)] focus:ring-0 text-center text-2xl font-bold rounded-t-lg transition-all" maxlength="1" type="password" inputmode="numeric" pattern="[0-9]*" />
                <input class="w-12 h-14 bg-[var(--bg-input)] border-b-2 border-slate-700 focus:border-[var(--accent)] focus:ring-0 text-center text-2xl font-bold rounded-t-lg transition-all" maxlength="1" type="password" inputmode="numeric" pattern="[0-9]*" />
                <input class="w-12 h-14 bg-[var(--bg-input)] border-b-2 border-slate-700 focus:border-[var(--accent)] focus:ring-0 text-center text-2xl font-bold rounded-t-lg transition-all" maxlength="1" type="password" inputmode="numeric" pattern="[0-9]*" />
              </div>
            </div>
            
          </div>

          <!-- Security Tips -->
          <div class="mt-8 bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-xl p-5 animate-fade-in" style="animation-delay: 0.2s">
            <div class="flex items-center gap-3 mb-3">
              <span class="material-symbols-outlined text-[var(--accent)]">verified_user</span>
              <h3 class="text-sm font-bold text-slate-100">Security Tips</h3>
            </div>
            <ul class="space-y-2">
              <li class="flex items-start gap-2 text-xs text-slate-400">
                <span class="min-w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-1.5 shrink-0"></span>
                Do not share your PIN with anyone, even NeoBank staff.
              </li>
              <li class="flex items-start gap-2 text-xs text-slate-400">
                <span class="min-w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-1.5 shrink-0"></span>
                Avoid simple combinations like '1234' or your birth year.
              </li>
              <li class="flex items-start gap-2 text-xs text-slate-400">
                <span class="min-w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-1.5 shrink-0"></span>
                Update your PIN regularly to ensure maximum account safety.
              </li>
            </ul>
          </div>
        </main>

        <!-- Bottom Action Button -->
        <footer class="fixed bottom-0 w-full max-w-md p-6 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)] to-transparent" style="padding-bottom: max(24px, env(safe-area-inset-bottom));">
          <button id="btn-update-pin" class="w-full bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-[#000] font-bold py-4 rounded-xl shadow-[0_0_20px_var(--accent-glow)] transition-all flex items-center justify-center gap-2 group active:scale-[0.98]">
            Update PIN
            <span class="material-symbols-outlined text-sm font-bold group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </footer>
      </div>
    `;

    // Setup input auto-advance logic
    setupPinInputs(container);

    // Bind actions
    container.querySelector('#btn-back').addEventListener('click', () => navigate(-1));
    container.querySelector('#btn-update-pin').addEventListener('click', async () => {
      const getPin = (id) => Array.from(container.querySelectorAll(`#${id} input`)).map(i => i.value).join('');
      const currentPin = getPin('current-pin-group');
      const newPin = getPin('new-pin-group');
      const confirmPin = getPin('confirm-pin-group');

      if (currentPin.length < 4 || newPin.length < 4 || confirmPin.length < 4) {
        showToast('Please enter full 4-digit PINs', 'warning');
        return;
      }
      if (newPin !== confirmPin) {
        showToast('New PIN and Confirm PIN do not match', 'error');
        return;
      }

      showToast('PIN updated successfully', 'success');
      setTimeout(() => navigate(-1), 1500);
    });
  }

  function setupPinInputs(container) {
    const groups = container.querySelectorAll('.pin-group');
    groups.forEach(group => {
      const inputs = group.querySelectorAll('input');
      inputs.forEach((input, index) => {
        // Enforce numeric only on input
        input.addEventListener('input', (e) => {
          input.value = input.value.replace(/[^0-9]/g, '');
          if (input.value && index < inputs.length - 1) {
            inputs[index + 1].focus();
          }
        });
        
        // Handle backspace to reverse
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Backspace' && !input.value && index > 0) {
            inputs[index - 1].focus();
            inputs[index - 1].value = '';
          }
        });
      });
    });
  }

  load();
}
