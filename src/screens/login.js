// ═══════════════════════════════════════════════════════
// NeoBank — Login Screen (User's exact HTML design)
// ═══════════════════════════════════════════════════════

import { api } from '../backend/api.js';
import { navigate } from '../components/router.js';
import { showToast } from '../components/toast.js';

export function renderLogin(container) {
  let mode = 'login'; // login | register | otp | forgot
  let otpEmail = '';
  let otpHint = '';

  function render() {
    container.className = 'screen';
    container.style.padding = '0';
    container.style.overflow = 'hidden';

    if (mode === 'login') renderLoginView();
    else if (mode === 'register') renderRegisterView();
    else if (mode === 'otp') renderOtpView();
    else if (mode === 'forgot') renderForgotView();
  }

  // ─── LOGIN ────────────────────────────────────────────
  function renderLoginView() {
    container.innerHTML = `
<div class="relative flex min-h-screen w-full flex-col items-center justify-center overflow-x-hidden bg-gradient-to-b from-background-dark via-[#081215] to-black px-6 py-12 font-display text-slate-100 antialiased">
  <!-- Background Decorative Elements -->
  <div class="pointer-events-none absolute inset-0 overflow-hidden">
    <div class="absolute -top-[10%] -left-[10%] h-[40%] w-[60%] rounded-full bg-primary/10 blur-[120px]"></div>
    <div class="absolute -bottom-[10%] -right-[10%] h-[40%] w-[60%] rounded-full bg-primary/5 blur-[120px]"></div>
  </div>
  <!-- Main Content Container -->
  <div class="relative z-10 w-full max-w-md">
    <!-- Header Section -->
    <div class="mb-10 flex flex-col items-center">
      <div class="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-[0_0_25px_rgba(13,185,242,0.4)]">
        <span class="material-symbols-outlined text-4xl text-white">account_balance_wallet</span>
      </div>
      <h1 class="text-center text-4xl font-bold tracking-tight text-slate-100">Welcome back</h1>
      <p class="mt-2 text-center text-slate-400">Securely access your NeoBank account</p>
    </div>
    <!-- Login Form -->
    <form class="space-y-6" id="login-form">
      <!-- Account Number Field -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-slate-300 ml-1">Account Number (STK)</label>
        <div class="group relative flex w-full items-center transition-all">
          <div class="absolute left-4 flex items-center justify-center text-slate-500 group-focus-within:text-primary transition-colors">
            <span class="material-symbols-outlined">credit_card</span>
          </div>
          <input id="login-email" class="h-14 w-full rounded-xl border border-white/10 bg-white/5 pl-12 pr-4 text-slate-100 placeholder-slate-600 focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all outline-none" placeholder="demo@neobank.vn" type="text"/>
        </div>
      </div>
      <!-- PIN Field -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-slate-300 ml-1">Secure PIN</label>
        <div class="group relative flex w-full items-center">
          <div class="absolute left-4 flex items-center justify-center text-slate-500 group-focus-within:text-primary transition-colors">
            <span class="material-symbols-outlined">lock</span>
          </div>
          <input id="login-password" class="h-14 w-full rounded-xl border border-white/10 bg-white/5 pl-12 pr-12 text-slate-100 placeholder-slate-600 focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all outline-none" maxlength="20" placeholder="••••••" type="password"/>
          <button id="toggle-pass" class="absolute right-4 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors" type="button">
            <span class="material-symbols-outlined">visibility</span>
          </button>
        </div>
      </div>
      <!-- Action Links -->
      <div class="flex items-center justify-between px-1">
        <label class="flex items-center space-x-2 cursor-pointer">
          <input class="h-4 w-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/30" type="checkbox" checked/>
          <span class="text-xs text-slate-400">Remember me</span>
        </label>
        <a id="btn-forgot" class="text-xs font-medium text-primary hover:text-primary/80 cursor-pointer">Forgot PIN?</a>
      </div>
      <!-- Error message -->
      <div id="login-error" class="text-sm text-red-400 text-center hidden"></div>
      <!-- Login Button -->
      <div class="pt-4">
        <button id="btn-login" class="relative group flex h-14 w-full items-center justify-center overflow-hidden rounded-xl bg-primary text-lg font-bold text-white shadow-[0_8px_30px_rgb(13,185,242,0.3)] transition-all active:scale-95" type="button">
          <!-- Glow effect -->
          <div class="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          <span id="login-text" class="relative z-10 flex items-center gap-2">
            Sign In
            <span class="material-symbols-outlined">arrow_forward</span>
          </span>
          <span id="login-spinner" class="hidden relative z-10"><svg class="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg></span>
        </button>
      </div>
    </form>
    <!-- Quick Access / Biometrics -->
    <div class="mt-12 flex flex-col items-center space-y-6">
      <div class="flex items-center gap-4 w-full">
        <div class="h-[1px] flex-1 bg-white/10"></div>
        <span class="text-xs font-medium uppercase tracking-wider text-slate-500">Quick Login</span>
        <div class="h-[1px] flex-1 bg-white/10"></div>
      </div>
      <div class="flex gap-4">
        <button id="btn-bio-fp" class="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition-all active:scale-90">
          <span class="material-symbols-outlined text-2xl">fingerprint</span>
        </button>
        <button id="btn-bio-face" class="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition-all active:scale-90">
          <span class="material-symbols-outlined text-2xl">face</span>
        </button>
      </div>
    </div>
    <!-- Footer -->
    <div class="mt-12 text-center">
      <p class="text-sm text-slate-400">
        Don't have an account?
        <a id="btn-to-register" class="font-semibold text-primary cursor-pointer hover:underline">Open one now</a>
      </p>
    </div>
  </div>
  <div class="h-8 md:hidden"></div>
</div>`;

    // Events
    const emailInput = container.querySelector('#login-email');
    const passInput = container.querySelector('#login-password');

    container.querySelector('#toggle-pass').addEventListener('click', () => {
      const isPass = passInput.type === 'password';
      passInput.type = isPass ? 'text' : 'password';
      container.querySelector('#toggle-pass .material-symbols-outlined').textContent = isPass ? 'visibility_off' : 'visibility';
    });

    container.querySelector('#btn-login').addEventListener('click', async () => {
      const email = emailInput.value.trim();
      const password = passInput.value;
      if (!email || !password) { showLoginError('Please enter your credentials'); return; }
      setLoading(true);
      const res = await api('login', { email, password });
      setLoading(false);
      if (res.ok) {
        showToast('Welcome back! 🎉', 'success');
        navigate(res.user.role === 'admin' ? 'admin' : 'dashboard');
      } else {
        showLoginError(res.error);
        passInput.closest('.group').style.animation = 'shake 0.4s ease';
        setTimeout(() => passInput.closest('.group').style.animation = '', 400);
      }
    });

    // Enter key
    [emailInput, passInput].forEach(inp => {
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') container.querySelector('#btn-login').click();
      });
    });

    container.querySelector('#btn-forgot').addEventListener('click', () => { mode = 'forgot'; render(); });
    container.querySelector('#btn-to-register').addEventListener('click', () => { mode = 'register'; render(); });

    // Biometric
    const bioHandler = async () => {
      showToast('Authenticating...', 'info');
      const res = await api('biometric-login');
      if (res.ok) { showToast('Biometric verified! ✓', 'success'); navigate('dashboard'); }
      else showToast('Authentication failed', 'error');
    };
    container.querySelector('#btn-bio-fp').addEventListener('click', bioHandler);
    container.querySelector('#btn-bio-face').addEventListener('click', bioHandler);
  }

  // ─── REGISTER ─────────────────────────────────────────
  function renderRegisterView() {
    container.innerHTML = `
<div class="relative flex min-h-screen w-full flex-col items-center justify-center overflow-x-hidden bg-gradient-to-b from-background-dark via-[#081215] to-black px-6 py-12 font-display text-slate-100 antialiased">
  <div class="pointer-events-none absolute inset-0 overflow-hidden">
    <div class="absolute -top-[10%] -left-[10%] h-[40%] w-[60%] rounded-full bg-primary/10 blur-[120px]"></div>
    <div class="absolute -bottom-[10%] -right-[10%] h-[40%] w-[60%] rounded-full bg-primary/5 blur-[120px]"></div>
  </div>
  <div class="relative z-10 w-full max-w-md">
    <div class="mb-10 flex flex-col items-center">
      <div class="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-[0_0_25px_rgba(13,185,242,0.4)]">
        <span class="material-symbols-outlined text-4xl text-white">person_add</span>
      </div>
      <h1 class="text-center text-4xl font-bold tracking-tight text-slate-100">Create Account</h1>
      <p class="mt-2 text-center text-slate-400">Join NeoBank — ngân hàng số thế hệ mới</p>
    </div>
    <form class="space-y-5" id="register-form">
      <div class="space-y-2">
        <label class="block text-sm font-medium text-slate-300 ml-1">Full Name</label>
        <div class="group relative flex w-full items-center transition-all">
          <div class="absolute left-4 flex items-center justify-center text-slate-500 group-focus-within:text-primary transition-colors"><span class="material-symbols-outlined">person</span></div>
          <input id="reg-name" class="h-14 w-full rounded-xl border border-white/10 bg-white/5 pl-12 pr-4 text-slate-100 placeholder-slate-600 focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all outline-none" placeholder="Nguyễn Văn A" type="text"/>
        </div>
      </div>
      <div class="space-y-2">
        <label class="block text-sm font-medium text-slate-300 ml-1">Email</label>
        <div class="group relative flex w-full items-center transition-all">
          <div class="absolute left-4 flex items-center justify-center text-slate-500 group-focus-within:text-primary transition-colors"><span class="material-symbols-outlined">mail</span></div>
          <input id="reg-email" class="h-14 w-full rounded-xl border border-white/10 bg-white/5 pl-12 pr-4 text-slate-100 placeholder-slate-600 focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all outline-none" placeholder="email@domain.com" type="email"/>
        </div>
      </div>
      <div class="space-y-2">
        <label class="block text-sm font-medium text-slate-300 ml-1">Phone Number</label>
        <div class="group relative flex w-full items-center transition-all">
          <div class="absolute left-4 flex items-center justify-center text-slate-500 group-focus-within:text-primary transition-colors"><span class="material-symbols-outlined">phone</span></div>
          <input id="reg-phone" class="h-14 w-full rounded-xl border border-white/10 bg-white/5 pl-12 pr-4 text-slate-100 placeholder-slate-600 focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all outline-none" placeholder="0901234567" type="tel"/>
        </div>
      </div>
      <div class="space-y-2">
        <label class="block text-sm font-medium text-slate-300 ml-1">Create PIN</label>
        <div class="group relative flex w-full items-center transition-all">
          <div class="absolute left-4 flex items-center justify-center text-slate-500 group-focus-within:text-primary transition-colors"><span class="material-symbols-outlined">lock</span></div>
          <input id="reg-password" class="h-14 w-full rounded-xl border border-white/10 bg-white/5 pl-12 pr-4 text-slate-100 placeholder-slate-600 focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all outline-none" placeholder="Minimum 6 characters" type="password"/>
        </div>
      </div>
      <div id="reg-error" class="text-sm text-red-400 text-center hidden"></div>
      <div class="pt-2">
        <button id="btn-register" class="relative group flex h-14 w-full items-center justify-center overflow-hidden rounded-xl bg-primary text-lg font-bold text-white shadow-[0_8px_30px_rgb(13,185,242,0.3)] transition-all active:scale-95" type="button">
          <div class="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          <span id="reg-text" class="relative z-10 flex items-center gap-2">Create Account <span class="material-symbols-outlined">how_to_reg</span></span>
          <span id="reg-spinner" class="hidden relative z-10"><svg class="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg></span>
        </button>
      </div>
    </form>
    <div class="mt-10 text-center">
      <p class="text-sm text-slate-400">Already have an account? <a id="btn-to-login" class="font-semibold text-primary cursor-pointer hover:underline">Sign In</a></p>
    </div>
  </div>
</div>`;

    container.querySelector('#btn-to-login').addEventListener('click', () => { mode = 'login'; render(); });
    container.querySelector('#btn-register').addEventListener('click', async () => {
      const name = container.querySelector('#reg-name').value.trim();
      const email = container.querySelector('#reg-email').value.trim();
      const phone = container.querySelector('#reg-phone').value.trim();
      const password = container.querySelector('#reg-password').value;
      if (!name || !email || !phone || !password) { showRegError('Please fill in all fields'); return; }
      if (password.length < 6) { showRegError('PIN must be at least 6 characters'); return; }
      toggleSpinner('reg', true);
      const otpRes = await api('send-otp', { email });
      toggleSpinner('reg', false);
      if (otpRes.ok) {
        otpEmail = email;
        otpHint = otpRes.hint;
        container._regData = { name, email, phone, password };
        mode = 'otp';
        render();
      }
    });
  }

  // ─── OTP ──────────────────────────────────────────────
  function renderOtpView() {
    container.innerHTML = `
<div class="relative flex min-h-screen w-full flex-col items-center justify-center overflow-x-hidden bg-gradient-to-b from-background-dark via-[#081215] to-black px-6 py-12 font-display text-slate-100 antialiased">
  <div class="pointer-events-none absolute inset-0 overflow-hidden">
    <div class="absolute -top-[10%] -left-[10%] h-[40%] w-[60%] rounded-full bg-primary/10 blur-[120px]"></div>
    <div class="absolute -bottom-[10%] -right-[10%] h-[40%] w-[60%] rounded-full bg-primary/5 blur-[120px]"></div>
  </div>
  <div class="relative z-10 w-full max-w-md">
    <div class="mb-10 flex flex-col items-center">
      <div class="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-[0_0_25px_rgba(13,185,242,0.4)]">
        <span class="material-symbols-outlined text-4xl text-white">verified</span>
      </div>
      <h1 class="text-center text-4xl font-bold tracking-tight text-slate-100">Verify OTP</h1>
      <p class="mt-2 text-center text-slate-400">Enter the code sent to ${otpEmail}</p>
    </div>
    ${otpHint ? `<div class="mb-6 rounded-xl bg-primary/10 border border-primary/20 p-3 text-center text-sm text-primary">OTP Hint: <strong>${otpHint}</strong></div>` : ''}
    <div class="flex justify-center gap-3 mb-6" id="otp-group">
      <input type="text" maxlength="1" class="h-14 w-12 rounded-xl border border-white/10 bg-white/5 text-center text-xl font-bold text-slate-100 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all" data-idx="0" inputmode="numeric">
      <input type="text" maxlength="1" class="h-14 w-12 rounded-xl border border-white/10 bg-white/5 text-center text-xl font-bold text-slate-100 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all" data-idx="1" inputmode="numeric">
      <input type="text" maxlength="1" class="h-14 w-12 rounded-xl border border-white/10 bg-white/5 text-center text-xl font-bold text-slate-100 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all" data-idx="2" inputmode="numeric">
      <input type="text" maxlength="1" class="h-14 w-12 rounded-xl border border-white/10 bg-white/5 text-center text-xl font-bold text-slate-100 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all" data-idx="3" inputmode="numeric">
      <input type="text" maxlength="1" class="h-14 w-12 rounded-xl border border-white/10 bg-white/5 text-center text-xl font-bold text-slate-100 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all" data-idx="4" inputmode="numeric">
      <input type="text" maxlength="1" class="h-14 w-12 rounded-xl border border-white/10 bg-white/5 text-center text-xl font-bold text-slate-100 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all" data-idx="5" inputmode="numeric">
    </div>
    <div id="otp-error" class="text-sm text-red-400 text-center hidden mb-4"></div>
    <button id="btn-verify" class="relative group flex h-14 w-full items-center justify-center overflow-hidden rounded-xl bg-primary text-lg font-bold text-white shadow-[0_8px_30px_rgb(13,185,242,0.3)] transition-all active:scale-95" type="button">
      <div class="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
      <span class="relative z-10 flex items-center gap-2">Verify Code <span class="material-symbols-outlined">check_circle</span></span>
    </button>
    <button id="btn-back-login" class="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-slate-300 hover:bg-white/10 transition-all" type="button">
      <span class="material-symbols-outlined text-lg">arrow_back</span> Back to Sign In
    </button>
  </div>
</div>`;

    const otpInputs = container.querySelectorAll('#otp-group input');
    otpInputs.forEach((inp, i) => {
      inp.addEventListener('input', () => { if (inp.value.length === 1 && i < 5) otpInputs[i + 1].focus(); });
      inp.addEventListener('keydown', (e) => { if (e.key === 'Backspace' && !inp.value && i > 0) otpInputs[i - 1].focus(); });
    });

    container.querySelector('#btn-verify').addEventListener('click', async () => {
      const otp = Array.from(otpInputs).map(i => i.value).join('');
      if (otp.length !== 6) { showOtpError('Enter all 6 digits'); return; }
      const res = await api('verify-otp', { email: otpEmail, otp });
      if (res.ok) {
        if (container._regData) {
          await api('register', container._regData);
          showToast('Account created! Please sign in.', 'success');
          delete container._regData;
        } else { showToast('Verified!', 'success'); }
        mode = 'login'; render();
      } else { showOtpError(res.error); }
    });

    container.querySelector('#btn-back-login').addEventListener('click', () => { mode = 'login'; render(); });
  }

  // ─── FORGOT PASSWORD ──────────────────────────────────
  function renderForgotView() {
    container.innerHTML = `
<div class="relative flex min-h-screen w-full flex-col items-center justify-center overflow-x-hidden bg-gradient-to-b from-background-dark via-[#081215] to-black px-6 py-12 font-display text-slate-100 antialiased">
  <div class="pointer-events-none absolute inset-0 overflow-hidden">
    <div class="absolute -top-[10%] -left-[10%] h-[40%] w-[60%] rounded-full bg-primary/10 blur-[120px]"></div>
    <div class="absolute -bottom-[10%] -right-[10%] h-[40%] w-[60%] rounded-full bg-primary/5 blur-[120px]"></div>
  </div>
  <div class="relative z-10 w-full max-w-md">
    <div class="mb-10 flex flex-col items-center">
      <div class="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-[0_0_25px_rgba(13,185,242,0.4)]">
        <span class="material-symbols-outlined text-4xl text-white">lock_reset</span>
      </div>
      <h1 class="text-center text-4xl font-bold tracking-tight text-slate-100">Reset PIN</h1>
      <p class="mt-2 text-center text-slate-400">We'll send you a recovery code</p>
    </div>
    <form class="space-y-6">
      <div class="space-y-2">
        <label class="block text-sm font-medium text-slate-300 ml-1">Registered Email</label>
        <div class="group relative flex w-full items-center transition-all">
          <div class="absolute left-4 flex items-center justify-center text-slate-500 group-focus-within:text-primary transition-colors"><span class="material-symbols-outlined">mail</span></div>
          <input id="forgot-email" class="h-14 w-full rounded-xl border border-white/10 bg-white/5 pl-12 pr-4 text-slate-100 placeholder-slate-600 focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all outline-none" placeholder="email@domain.com" type="email"/>
        </div>
      </div>
      <div id="forgot-error" class="text-sm text-red-400 text-center hidden"></div>
      <button id="btn-forgot-send" class="relative group flex h-14 w-full items-center justify-center overflow-hidden rounded-xl bg-primary text-lg font-bold text-white shadow-[0_8px_30px_rgb(13,185,242,0.3)] transition-all active:scale-95" type="button">
        <div class="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        <span class="relative z-10 flex items-center gap-2">Send Recovery Code <span class="material-symbols-outlined">send</span></span>
      </button>
    </form>
    <button id="btn-back-login2" class="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-slate-300 hover:bg-white/10 transition-all" type="button">
      <span class="material-symbols-outlined text-lg">arrow_back</span> Back to Sign In
    </button>
  </div>
</div>`;

    container.querySelector('#btn-forgot-send').addEventListener('click', async () => {
      const email = container.querySelector('#forgot-email').value.trim();
      if (!email) { showForgotError('Please enter your email'); return; }
      const res = await api('forgot-password', { email });
      if (res.ok) {
        otpEmail = email; otpHint = res.hint; mode = 'otp';
        showToast('Recovery code sent!', 'success');
        render();
      } else { showForgotError(res.error); }
    });

    container.querySelector('#btn-back-login2').addEventListener('click', () => { mode = 'login'; render(); });
  }

  // ─── Helpers ──────────────────────────────────────────
  function showLoginError(msg) {
    const el = container.querySelector('#login-error');
    if (el) { el.textContent = msg; el.classList.remove('hidden'); }
  }

  function showRegError(msg) {
    const el = container.querySelector('#reg-error');
    if (el) { el.textContent = msg; el.classList.remove('hidden'); }
  }

  function showOtpError(msg) {
    const el = container.querySelector('#otp-error');
    if (el) { el.textContent = msg; el.classList.remove('hidden'); }
  }

  function showForgotError(msg) {
    const el = container.querySelector('#forgot-error');
    if (el) { el.textContent = msg; el.classList.remove('hidden'); }
  }

  function setLoading(loading) {
    const text = container.querySelector('#login-text');
    const spinner = container.querySelector('#login-spinner');
    const btn = container.querySelector('#btn-login');
    if (text) text.classList.toggle('hidden', loading);
    if (spinner) spinner.classList.toggle('hidden', !loading);
    if (btn) btn.disabled = loading;
  }

  function toggleSpinner(prefix, loading) {
    const text = container.querySelector(`#${prefix}-text`);
    const spinner = container.querySelector(`#${prefix}-spinner`);
    const btn = text?.closest('button');
    if (text) text.classList.toggle('hidden', loading);
    if (spinner) spinner.classList.toggle('hidden', !loading);
    if (btn) btn.disabled = loading;
  }

  render();
}
