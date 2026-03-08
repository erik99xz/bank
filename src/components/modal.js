// ═══════════════════════════════════════════════════════
// NeoBank — Modal Component
// ═══════════════════════════════════════════════════════

export function showModal(contentHtml, onClose) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-content">
      <div class="modal-handle"></div>
      ${contentHtml}
    </div>`;

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeModal(overlay, onClose);
    }
  });

  document.getElementById('app').appendChild(overlay);
  return overlay;
}

export function closeModal(overlay, callback) {
  if (!overlay) return;
  overlay.querySelector('.modal-content').style.animation = 'slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1) reverse';
  setTimeout(() => {
    overlay.remove();
    if (callback) callback();
  }, 280);
}
