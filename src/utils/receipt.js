/**
 * Utility to capture a DOM element as an image and share/save it.
 * Uses html2canvas for capturing and navigator.share for the iOS native experience.
 */

import { showToast } from '../components/toast.js';

export async function captureAndShareReceipt(elementId, fileName = 'NeoBank-Receipt.png') {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found.`);
    return;
  }

  showToast('Đang chuẩn bị biên lai...', 'info');

  try {
    // Wait for any fonts or images to load fully
    await new Promise(resolve => setTimeout(resolve, 500));

    const canvas = await html2canvas(element, {
      scale: 2, // higher resolution
      useCORS: true,
      backgroundColor: null,
      logging: false,
      onclone: (clonedDoc) => {
        // Any tweaks to the cloned element for better capture
        const clonedEl = clonedDoc.getElementById(elementId);
        if (clonedEl) {
          clonedEl.style.borderRadius = '24px'; // Ensure rounded corners are captured nicely
        }
      }
    });

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('Failed to create blob');

    // Create a File object for sharing
    const file = new File([blob], fileName, { type: 'image/png' });

    // Native Share (iOS/Android)
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Biên lai NeoBank',
          text: 'Biên lai giao dịch từ NeoBank'
        });
        showToast('Đã chia sẻ biên lai thành công!', 'success');
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
          fallbackSave(canvas, fileName);
        }
      }
    } else {
      // Fallback: Direct download
      fallbackSave(canvas, fileName);
    }
  } catch (error) {
    console.error('Capture failed:', error);
    showToast('Lỗi khi tạo biên lai', 'error');
  }
}

function fallbackSave(canvas, fileName) {
  try {
    const link = document.createElement('a');
    link.download = fileName;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('Đã lưu biên lai vào thiết bị!', 'success');
  } catch (err) {
    showToast('Không thể lưu ảnh tự động. Vui lòng chụp màn hình.', 'warning');
  }
}
