// ═══════════════════════════════════════════════════════
// NeoBank — Skeleton Loader Components
// ═══════════════════════════════════════════════════════

export function skeletonCard() {
  return '<div class="skeleton skeleton-card"></div>';
}

export function skeletonLines(count = 3) {
  const widths = ['w-80', 'w-60', 'w-40', 'w-80', 'w-60'];
  let html = '';
  for (let i = 0; i < count; i++) {
    html += `<div class="skeleton skeleton-line ${widths[i % widths.length]}"></div>`;
  }
  return html;
}

export function skeletonRows(count = 3) {
  let html = '';
  for (let i = 0; i < count; i++) {
    html += `
      <div class="skeleton-row">
        <div class="skeleton skeleton-circle"></div>
        <div style="flex:1">
          <div class="skeleton skeleton-line w-60"></div>
          <div class="skeleton skeleton-line w-40"></div>
        </div>
      </div>`;
  }
  return html;
}

export function showSkeletonScreen(container) {
  container.innerHTML = `
    <div class="screen-content animate-fade-in">
      ${skeletonCard()}
      <div style="margin-top:24px">
        ${skeletonLines(2)}
      </div>
      <div style="margin-top:20px">
        ${skeletonRows(4)}
      </div>
    </div>`;
}
