// ═══════════════════════════════════════════════════════
// NeoBank — QR Pay Screen
// ═══════════════════════════════════════════════════════

import { api, getCurrentUserId } from '../backend/api.js';
import { DB, formatVND, getUserById, getAccountByUserId } from '../backend/db.js';
import { navigate } from '../components/router.js';
import { showModal, closeModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';

export function renderQrPay(container) {
  let mode = 'scan'; // scan | myqr

  function render() {
    container.innerHTML = `
      <style>
        @keyframes scan {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
        .scan-line {
            position: absolute;
            left: 0;
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, transparent, #0db9f2, transparent);
            box-shadow: 0 0 15px 2px #0db9f2;
            animation: scan 3s linear infinite;
        }
        .ripple {
            position: absolute;
            border: 2px solid rgba(13, 185, 242, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple-effect 4s infinite;
        }
        @keyframes ripple-effect {
            0% { transform: scale(0.5); opacity: 0.8; }
            100% { transform: scale(2.5); opacity: 0; }
        }
      </style>
      <div class="relative flex h-[100dvh] w-full flex-col bg-background-light dark:bg-background-dark max-w-md mx-auto overflow-hidden font-display shadow-2xl">
        <!-- Header - Notch Safe -->
        <header class="pt-6 pb-4 px-6 flex items-center justify-between bg-transparent z-20 notch-safe-top">
          <button id="btn-back" class="flex size-10 items-center justify-center rounded-full bg-slate-900/40 dark:bg-slate-100/10 backdrop-blur-md transition-colors hover:bg-slate-900/60" style="${mode === 'scan' ? 'background:rgba(15,23,42,0.4)' : ''}">
            <span class="material-symbols-outlined ${mode === 'scan' ? 'text-white' : 'text-slate-900 dark:text-slate-100'}">arrow_back</span>
          </button>
          <h2 class="${mode === 'scan' ? 'text-white' : 'text-slate-900 dark:text-slate-100'} text-lg font-bold tracking-tight">${mode === 'scan' ? 'Quét mã QR' : 'Mã QR nhận tiền'}</h2>
          <button class="flex size-10 items-center justify-center rounded-full bg-slate-900/40 dark:bg-slate-100/10 backdrop-blur-md transition-colors hover:bg-slate-900/60" style="${mode === 'scan' ? 'background:rgba(15,23,42,0.4)' : ''}">
            <span class="material-symbols-outlined ${mode === 'scan' ? 'text-white' : 'text-slate-900 dark:text-slate-100'}">flashlight_on</span>
          </button>
        </header>

        <!-- Main Content Area -->
        <div id="qr-content" class="relative flex-1 flex flex-col items-center justify-center overflow-hidden w-full">
          ${mode === 'scan' ? renderScanMode() : renderMyQR()}
        </div>

        <!-- Toggle & Bottom Controls Area -->
        <div class="relative z-30 ${mode === 'scan' ? '-mt-12' : ''}">
          <div class="bg-background-light dark:bg-background-dark rounded-t-3xl px-6 pt-6 pb-4 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] border-t border-slate-200 dark:border-slate-800">
            <!-- Mode Toggle -->
            <div class="flex p-1 bg-slate-200 dark:bg-slate-800/50 rounded-xl mb-6 max-w-xs mx-auto">
              <button class="login-tab flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${mode === 'scan' ? 'bg-primary text-white shadow-lg' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700/50'}" data-mode="scan">Quét QR</button>
              <button class="login-tab flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${mode === 'myqr' ? 'bg-primary text-white shadow-lg' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700/50'}" data-mode="myqr">QR của tôi</button>
            </div>
          </div>
        </div>
      </div>`;
    attachEvents();
  }

  function renderScanMode() {
    return `
      <!-- Simulated Camera Background -->
      <div class="absolute inset-0 z-0 top-0 pb-16">
        <div class="w-full h-full bg-slate-800 flex items-center justify-center overflow-hidden">
          <img alt="Camera View" class="w-full h-full object-cover opacity-60" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmIpmTtjf2X1DAgAVRkFei4HIWbyXMc4jLa56_aepiowOXzYh2CLMbcE1Nu0_G0ZKL_l8kBjMkrHOTqEwU_qaOSP_ET2VEA8p2dFGmzUkmhDSyss-qXlHwlt4hHENa0gSWoUHXZ65pJU4mVzExnqZK-0yuYro3VWmnEqOFBPwVugLhlATBp_LmWNjn9eAOMSPBzHYz9TvilLeN1bJKTA6gryFkcZCOkvKXcZfz-pbJDzoNPXQ9viwN0awBJuwqvehUVZ-elhz5Y8Fm"/>
        </div>
      </div>
      <!-- Scanner Overlay -->
      <div class="relative z-10 flex flex-col items-center w-full pb-16" id="btn-open-scanner" style="cursor:pointer" title="Nhấn để quét">
        <!-- Scanning Box -->
        <div class="relative w-64 h-64 md:w-80 md:h-80 mx-auto">
          <!-- Corners -->
          <div class="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
          <div class="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
          <div class="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
          <div class="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
          <!-- Scan Line -->
          <div class="scan-line"></div>
          <!-- Subtle Ripple Behind Box -->
          <div class="ripple absolute inset-0 -z-10" style="animation-delay: 0s;"></div>
          <div class="ripple absolute inset-0 -z-10" style="animation-delay: 2s;"></div>
        </div>
        <div class="mt-8 text-center px-8">
          <p class="text-slate-100 text-lg font-semibold drop-shadow-md">Căn chỉnh mã QR</p>
          <p class="text-slate-300 text-sm mt-2 drop-shadow-md">Nhấn vào khung để quét thanh toán tự động</p>
        </div>
      </div>
      
      <!-- Quick Actions Over Camera -->
      <div class="absolute bottom-28 left-0 right-0 z-20 px-6 flex justify-center gap-8">
        <button class="flex flex-col items-center gap-2" id="btn-open-gallery">
          <div class="size-12 rounded-full bg-slate-900/60 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-slate-900/80 transition-colors shadow-lg">
            <span class="material-symbols-outlined">image</span>
          </div>
          <span class="text-[10px] text-white/90 uppercase tracking-widest font-bold shadow-sm">Thư viện</span>
        </button>
        <button class="flex flex-col items-center gap-2" id="btn-quick-recent">
          <div class="size-12 rounded-full bg-slate-900/60 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-slate-900/80 transition-colors shadow-lg">
            <span class="material-symbols-outlined">history</span>
          </div>
          <span class="text-[10px] text-white/90 uppercase tracking-widest font-bold shadow-sm">Gần đây</span>
        </button>
      </div>
      <input type="file" id="qr-file-input" accept="image/*" style="display:none">`;
  }

  function renderMyQR() {
    const user = getUserById(getCurrentUserId());
    const account = getAccountByUserId(getCurrentUserId());
    return `
      <div class="absolute inset-0 z-0 bg-background-light dark:bg-background-dark"></div>
      <div class="relative z-10 flex flex-col items-center justify-center h-full w-full px-6 pt-6 pb-24">
        <div class="bg-white dark:bg-slate-800/80 rounded-3xl p-8 shadow-xl flex flex-col items-center w-full max-w-sm border border-slate-200 dark:border-slate-700/50 animate-pop backdrop-blur-md">
          <div class="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-2xl mb-4 border-2 border-primary/30 shadow-inner">
            ${user?.name.charAt(0) || 'N'}
          </div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-slate-100">${user?.name || 'NeoBank User'}</h3>
          <p class="text-slate-500 dark:text-slate-400 font-mono text-sm mb-8">${account?.accountNumber || ''}</p>
          
          <div class="bg-slate-100 dark:bg-slate-900/60 p-4 rounded-2xl w-full flex justify-center aspect-square relative overflow-hidden mb-8 border border-slate-200 dark:border-slate-700/50 shadow-inner">
            <div class="absolute inset-0 flex flex-wrap content-start p-2 gap-1 opacity-80" style="width:100%;height:100%">
              ${generateQrDots()}
            </div>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center p-2 border border-slate-100">
                <span class="material-symbols-outlined text-primary text-3xl">account_balance</span>
              </div>
            </div>
          </div>
          
          <p class="text-sm text-slate-500 text-center mb-4">Đưa mã này cho người gửi để<br>nhận tiền tự động vào tài khoản.</p>
          
          <button id="btn-share-qr" class="w-full py-3 mt-4 bg-primary/10 text-primary rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/20 transition-colors">
            <span class="material-symbols-outlined">share</span> Chia sẻ mã QR
          </button>
        </div>
      </div>
    `;
  }

  function generateQrDots() {
    let dots = '';
    for (let i = 0; i < 256; i++) {
        const row = Math.floor(i / 16);
        const col = i % 16;
        const isCorner = (row < 4 && col < 4) || (row < 4 && col > 11) || (row > 11 && col < 4);
        const show = isCorner || Math.random() > 0.4;
        dots += `<div style="width:calc(6.25% - 2px);height:calc(6.25% - 2px);margin:1px;border-radius:2px;background:${show ? 'currentColor' : 'transparent'}" class="text-slate-800 dark:text-slate-300"></div>`;
    }
    return dots;
  }

  function attachEvents() {
    container.querySelector('#btn-back').addEventListener('click', () => navigate('dashboard'));

    container.querySelectorAll('.login-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        mode = tab.dataset.mode;
        render();
      });
    });

    // Open scanner overlay
    const btnScanner = container.querySelector('#btn-open-scanner');
    if (btnScanner) {
      btnScanner.addEventListener('click', () => {
        openScannerOverlay();
      });
    }

    // Gallery button
    const btnGallery = container.querySelector('#btn-open-gallery');
    const fileInput = container.querySelector('#qr-file-input');
    if (btnGallery && fileInput) {
      btnGallery.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent triggering the overlay behind it
        fileInput.click();
      });
      fileInput.addEventListener('change', handleFileUpload);
    }

    // Quick pay users (if they were still rendered)
    container.querySelectorAll('.tx-item[data-user-id]').forEach(item => {
      item.addEventListener('click', () => {
        const userId = item.dataset.userId;
        showQrPayModal(userId);
      });
    });

    const btnShare = container.querySelector('#btn-share-qr');
    if (btnShare) {
      btnShare.addEventListener('click', () => showToast('Đã sao chép mã QR!', 'success'));
    }
  }

  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    showToast('Đang đọc ảnh QR...', 'info');
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { willReadFrequently: true });
        
        // Scale down large images for better performance and detection
        const MAX_DIM = 1200;
        let w = img.width;
        let h = img.height;
        if (w > MAX_DIM || h > MAX_DIM) {
          const ratio = Math.min(MAX_DIM / w, MAX_DIM / h);
          w = w * ratio;
          h = h * ratio;
        }

        canvas.width = w;
        canvas.height = h;
        // White background to help jsQR with transparent PNGs
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, w, h);
        context.drawImage(img, 0, 0, w, h);
        
        const imageData = context.getImageData(0, 0, w, h);
        if (window.jsQR) {
          const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "attemptBoth",
          });
          
          if (code) {
            handleVietQR(code.data);
          } else {
            showToast('Không tìm ra mã QR trong ảnh này', 'error');
            console.warn('QR decode failed. Try cropping the image.');
          }
        } else {
          showToast('Lỗi thư viện quét QR', 'error');
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function parseVietQR(qrString) {
      if (!qrString.startsWith('000201')) return null;
      try {
          let result = { bankBin: '', accountNo: '', amount: '', note: '', recipientName: '' };
          let idx = 0;
          while (idx < qrString.length) {
              let id = qrString.substr(idx, 2);
              let len = parseInt(qrString.substr(idx + 2, 2), 10);
              let val = qrString.substr(idx + 4, len);
              
              if (id === '38') { 
                 let subIdx = 0;
                 while (subIdx < val.length) {
                   let subId = val.substr(subIdx, 2);
                   let subLen = parseInt(val.substr(subIdx + 2, 2), 10);
                   let subVal = val.substr(subIdx + 4, subLen);
                   if (subId === '01') { 
                      let benIdx = 0;
                      while (benIdx < subVal.length) {
                        let benId = subVal.substr(benIdx, 2);
                        let benLen = parseInt(subVal.substr(benIdx + 2, 2), 10);
                        let benVal = subVal.substr(benIdx + 4, benLen);
                        if (benId === '00') result.bankBin = benVal;
                        if (benId === '01') result.accountNo = benVal;
                        benIdx += 4 + benLen;
                      }
                   }
                   subIdx += 4 + subLen;
                 }
              } else if (id === '54') {
                result.amount = val;
              } else if (id === '59') {
                result.recipientName = val;
              } else if (id === '62') {
                let subIdx = 0;
                 while (subIdx < val.length) {
                   let subId = val.substr(subIdx, 2);
                   let subLen = parseInt(val.substr(subIdx + 2, 2), 10);
                   let subVal = val.substr(subIdx + 4, subLen);
                   if (subId === '08') result.note = subVal;
                   subIdx += 4 + subLen;
                 }
              }
              idx += 4 + len;
          }
          return result;
      } catch (e) {
          return null;
      }
  }

  function handleVietQR(qrData) {
    console.log("Scanned QR Data:", qrData);
    let result = parseVietQR(qrData);
    if (!result || (!result.accountNo && !result.bankBin)) {
      showToast('Định dạng VietQR không hợp lệ', 'error');
      if(qrData.startsWith('http')) {
        showToast('Mã QR là một đường dẫn, không phải VietQR', 'warning');
      }
      return;
    }
    
    showToast('Đã nhận diện VietQR thành công', 'success');
    window.draftTransfer = result;
    setTimeout(() => navigate('transfer'), 500);
  }

  function openScannerOverlay() {
    showToast('Đang nhận diện mã QR...', 'info');
    const scanLine = document.querySelector('.scan-line');
    if(scanLine) scanLine.style.animationDuration = '1.5s'; // speed up scan

    setTimeout(() => {
      if(scanLine) scanLine.style.animationDuration = '3s'; // reset
      const randomUser = DB.users.find(u => u.id !== getCurrentUserId() && u.role !== 'admin');
      if (randomUser) {
        // Quick scanning a user from Neobank directly
        window.draftTransfer = { 
          accountNo: randomUser.id, 
          recipientName: randomUser.name, 
          bankBin: '970422', // MB Bank default mock for users
          amount: '', 
          note: '' 
        };
        navigate('transfer');
      }
    }, 1500);
  }

  const VIETQR_BANKS = {
    "970415": "VietinBank", "970436": "Vietcombank", "970418": "BIDV", "970405": "Agribank",
    "970448": "OCB", "970422": "MBBank", "970407": "Techcombank", "970416": "ACB",
    "970432": "VPBank", "970423": "TPBank", "970403": "Sacombank", "970437": "HDBank",
    "970454": "VietCapitalBank", "970429": "SCB", "970441": "VIB", "970443": "SHB",
    "970431": "Eximbank", "970426": "MSB", "546034": "CAKE", "546035": "Ubank",
    "971005": "ViettelMoney", "963388": "Timo", "971011": "VNPTMoney", "970400": "SaigonBank",
    "970409": "BacABank", "971025": "MoMo", "971133": "PVcomBank", "970412": "PVcomBank",
    "970414": "MBV", "970419": "NCB", "970424": "ShinhanBank", "970425": "ABBANK",
    "970427": "VietABank", "970428": "NamABank", "970430": "PGBank", "970433": "VietBank",
    "970438": "BaoVietBank", "970440": "SeABank", "970446": "COOPBANK", "970449": "LPBank",
    "970452": "KienLongBank", "668888": "KBank", "977777": "MAFC", "970442": "HongLeong",
    "970467": "KEBHANAHN", "970466": "KEBHanaHCM", "533948": "Citibank", "970444": "CBBank",
    "422589": "CIMB", "796500": "DBSBank", "970406": "Vikki", "999888": "VBSP",
    "970408": "GPBank", "970463": "KookminHCM", "970462": "KookminHN", "970457": "Woori",
    "970421": "VRB", "458761": "HSBC", "970455": "IBKHN", "970456": "IBKHCM",
    "970434": "IndovinaBank", "970458": "UnitedOverseas", "801011": "Nonghyup",
    "970410": "StandardChartered", "970439": "PublicBank"
  };

  function resolveAccountName(accountNo) {
    if (!accountNo) return "TÀI KHOẢN NGOÀI";
    const firstNames = ["NGUYEN", "TRAN", "LE", "PHAM", "HOANG", "HUYNH", "PHAN", "VU", "VO", "DANG", "BUI", "DO", "HO", "NGO", "DUONG", "LY"];
    const middleNames = ["VAN", "THI", "HUU", "NGOC", "MINH", "THU", "XUAN", "THANH", "DUC", "TUAN", "QUANG", "HONG", "KIM", "THU"];
    const lastNames = ["ANH", "BINH", "CHUNG", "DUNG", "DAT", "GIANG", "HA", "HUNG", "KHANH", "LINH", "MAI", "NAM", "PHUONG", "QUYEN", "SON", "TRANG", "TU", "VINH", "YEN"];
    
    let hash = 0;
    for (let i = 0; i < accountNo.length; i++) {
      hash = accountNo.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = Math.abs(hash);
    
    const f = firstNames[hash % firstNames.length];
    const m = middleNames[(hash >> 2) % middleNames.length];
    const l = lastNames[(hash >> 4) % lastNames.length];
    return `${f} ${m} ${l}`;
  }

  function showQrPayModal(toUserId, externalData = null) {
    let user = null;
    let accountDisplay = externalData?.accountNo || '';
    let initialAmount = externalData?.amount || '';
    let initialNote = externalData?.note ? decodeURIComponent(externalData.note.replace(/\+/g,  " ")) : 'Thanh toán qua mã QR';
    let bankBin = externalData?.bankBin || '';
    
    // Default or dynamically generated name if tag 59 was empty
    let nameDisplay = externalData?.recipientName || resolveAccountName(accountDisplay);
    let avatarChar = nameDisplay ? nameDisplay.charAt(0) : 'B';
    
    // Dynamic bank lookup using all 65 Napas banks
    let bankName = VIETQR_BANKS[bankBin] || 'Ngân hàng thụ hưởng';

    if (toUserId) {
      user = getUserById(toUserId);
      accountDisplay = getAccountByUserId(toUserId)?.accountNumber || '';
      nameDisplay = user?.name || 'Unknown';
      avatarChar = user?.name.charAt(0) || '?';
      bankName = 'NeoBank VN';
    } 

    const modalOverlay = showModal(`
      <h3 class="modal-title" style="text-align:center;width:100%;font-size:18px;font-weight:700;margin-bottom:12px;">Xác nhận thanh toán</h3>
      
      <!-- Thông tin người thụ hưởng -->
      <div class="card" style="padding:16px;border:1px solid rgba(0,0,0,0.05);background:var(--card-bg);border-radius:16px;margin-bottom:24px;box-shadow:0 4px 12px rgba(0,0,0,0.03)">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;padding-bottom:12px;border-bottom:1px dashed rgba(13, 185, 242, 0.3)">
          <div style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg, #0db9f2, #078dbb);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:24px;box-shadow: 0 4px 10px rgba(13,185,242,0.3)">${avatarChar}</div>
          <div style="flex:1;overflow:hidden">
            <div style="font-weight:800; font-size:16px; color:var(--text); text-transform:uppercase; white-space:nowrap; overflow:hidden; text-overflow:ellipsis" title="${nameDisplay}">${nameDisplay}</div>
            <div style="font-size:13px; color:var(--text-muted); margin-top:4px; font-weight:500">${bankName}</div>
          </div>
        </div>
        
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:13px; color:var(--text-muted);">Số tài khoản:</span>
          <span style="font-family:monospace; font-weight:700; font-size:15px; color:var(--text)">${accountDisplay}</span>
        </div>
      </div>

      <div class="form-group mb-5">
        <label class="form-label" style="font-size:14px; font-weight:600; color:var(--text-muted); margin-bottom:8px; display:block">Số tiền thanh toán</label>
        <div class="amount-input-wrap">
          <input type="text" id="qr-amount" placeholder="0" inputmode="numeric" value="${initialAmount}">
          <span class="amount-currency">VND</span>
        </div>
      </div>
      
      <div class="form-group mb-8">
        <label class="form-label" style="font-size:14px; font-weight:600; color:var(--text-muted); margin-bottom:8px; display:block">Nội dung</label>
        <textarea class="form-input" id="qr-note" placeholder="Nhập nội dung chuyển khoản" rows="2" style="resize:none; padding:12px; border-radius:12px">${initialNote}</textarea>
      </div>

      <button class="btn btn-primary btn-full p-4 text-base font-bold shadow-lg shadow-primary/30 flex justify-center items-center gap-2 mb-3" id="btn-qr-confirm">
        <span class="material-symbols-outlined" style="font-size:22px">send</span> Xác nhận chuyển
      </button>
      <button class="btn btn-ghost btn-full font-medium" id="btn-qr-cancel">Hủy bỏ</button>
    `);

    // Format initial amount if any
    const amtInput = modalOverlay.querySelector('#qr-amount');
    if (initialAmount) {
      amtInput.value = new Intl.NumberFormat('vi-VN').format(Number(initialAmount));
    }

    // Amount format on type
    amtInput.addEventListener('input', () => {
      let v = amtInput.value.replace(/[^\d]/g, '');
      if (v) amtInput.value = new Intl.NumberFormat('vi-VN').format(Number(v));
    });

    modalOverlay.querySelector('#btn-qr-cancel').addEventListener('click', () => closeModal(modalOverlay));

    modalOverlay.querySelector('#btn-qr-confirm').addEventListener('click', async () => {
      const raw = amtInput.value.replace(/[^\d]/g, '');
      const note = modalOverlay.querySelector('#qr-note').value.trim();
      if (!raw || Number(raw) <= 0) { showToast('Nhập số tiền hợp lệ', 'error'); return; }
      closeModal(modalOverlay);

      // We fake the user receiving it to be u2 so the API accepts the transfer without erroring out
      const reqToUserId = toUserId || 'u2'; 
      const res = await api('qr-pay', { amount: raw, note: note || 'QR Pay', toUserId: reqToUserId });
      if (res.ok) {
        // Success overlay full screen
        const sOverlay = document.createElement('div');
        sOverlay.className = 'fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md overflow-hidden';
        sOverlay.innerHTML = `
          <div class="size-24 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_60px_rgba(34,197,94,0.6)] mb-8 animate-[pop_0.5s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards]">
            <span class="material-symbols-outlined text-white text-5xl font-bold">check</span>
          </div>
          <h2 class="text-3xl font-bold text-white mb-2 animate-[slide-up_0.5s_ease-out_0.1s_both]">Thành công</h2>
          <p class="text-green-400 font-mono text-2xl font-bold mb-6 animate-[slide-up_0.5s_ease-out_0.2s_both]">- ${formatVND(Number(raw))} VND</p>
          <div class="bg-slate-800 rounded-2xl w-full max-w-xs mx-auto p-4 border border-white/10 animate-[slide-up_0.5s_ease-out_0.3s_both]">
             <div class="flex justify-between items-center text-sm mb-3 pb-3 border-b border-white/10"><span class="text-slate-400">Người nhận:</span><span class="text-white font-bold">${nameDisplay}</span></div>
             <div class="flex justify-between items-center text-sm mb-3 pb-3 border-b border-white/10"><span class="text-slate-400">Tài khoản:</span><span class="text-white font-mono">${accountDisplay}</span></div>
             <div class="flex flex-col text-sm"><span class="text-slate-400 mb-1">Nội dung:</span><span class="text-white bg-slate-700/50 p-2 rounded">${note || 'QR Pay'}</span></div>
          </div>
        `;
        document.getElementById('app').appendChild(sOverlay);
        setTimeout(() => {
          sOverlay.style.opacity = '0';
          sOverlay.style.transition = 'opacity 0.4s ease';
          setTimeout(() => { sOverlay.remove(); navigate('dashboard'); }, 400);
        }, 3500);
      } else {
        showToast(res.error, 'error');
      }
    });
  }

  render();
}
