/// ═══════════════════════════════════════════════════════
/// NeoBank — QR Scan Screen
/// Full-screen scanner → parse VietQR → auto-fill transfer
/// ═══════════════════════════════════════════════════════

import 'package:flutter/material.dart';
import '../theme/neobank_theme.dart';
import '../services/neobank_backend.dart';
import '../widgets/scanning_overlay.dart';
import '../widgets/confirmation_modal.dart';

/// QR Scan screen that:
/// 1. Shows a full-screen scanning overlay with animated line
/// 2. Simulates scanning a VietQR code (for demo)
/// 3. Parses the QR content into bank + account + amount
/// 4. Auto-fills a Transfer confirmation modal
/// 5. Executes the transfer and shows animated success/error
class QrScanScreen extends StatefulWidget {
  const QrScanScreen({super.key});

  @override
  State<QrScanScreen> createState() => _QrScanScreenState();
}

class _QrScanScreenState extends State<QrScanScreen> {
  bool _isScanning = true;
  bool _isProcessing = false;

  // ── Simulated QR codes for demo ───────────────────────
  // In production, replace with mobile_scanner or qr_code_scanner plugin
  static const List<String> _demoQrCodes = [
    // VietQR format: contains bank BIN 970422 (MB Bank), account 0987654321, amount 500000
    '00020101021238570010A00000072701270006970422011309876543210208QRIBFTTA530370454065000005802VN62090805hello6304XXXX',
    // Simple format: TCB|1234567890|1500000|Tiền nhà
    'TCB|1234567890|1500000|Tiền nhà tháng 6',
    // VCB|9876543210|800000|Cafe
    'VCB|9876543210|800000|Trả tiền cafe',
  ];

  @override
  void initState() {
    super.initState();
    // Simulate QR detection after 3 seconds (demo)
    _simulateScan();
  }

  Future<void> _simulateScan() async {
    await Future.delayed(const Duration(seconds: 3));
    if (!mounted || !_isScanning) return;

    // Pick a random demo QR code
    final qrData = (_demoQrCodes..shuffle()).first;
    _onQrDetected(qrData);
  }

  // ── QR Detected Handler ───────────────────────────────
  void _onQrDetected(String rawData) {
    if (!_isScanning) return;
    setState(() => _isScanning = false);

    final result = NeoBankBackend.parseVietQR(rawData);

    if (!result.success) {
      // Show error and return to scanning
      _showParseError(result.error ?? 'Không nhận dạng được mã QR');
      return;
    }

    // Navigate to pre-filled transfer confirmation
    _showTransferFromQr(result);
  }

  void _showParseError(String error) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(error),
        backgroundColor: NeoBankTheme.danger,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
    // Resume scanning after delay
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) setState(() => _isScanning = true);
      _simulateScan();
    });
  }

  // ── Show pre-filled transfer from QR data ─────────────
  Future<void> _showTransferFromQr(QrParseResult qr) async {
    final bank = NeoBankBackend.supportedBanks.firstWhere(
      (b) => b.code == qr.bankCode,
      orElse: () => NeoBankBackend.supportedBanks.first,
    );

    // If amount is not in QR, ask user
    double amount = qr.amount ?? 0;
    if (amount <= 0) {
      amount = await _showAmountInput() ?? 0;
      if (amount <= 0) {
        setState(() => _isScanning = true);
        _simulateScan();
        return;
      }
    }

    if (!mounted) return;

    // Show confirmation modal
    final confirmed = await showTransferConfirmation(
      context,
      recipientAccount: qr.accountNumber ?? '',
      bankName: bank.name,
      amount: amount,
      note: qr.description,
    );

    if (confirmed == true) {
      _executeTransfer(
        account: qr.accountNumber ?? '',
        bankCode: bank.code,
        amount: amount,
        note: qr.description,
      );
    } else {
      setState(() => _isScanning = true);
      _simulateScan();
    }
  }

  // ── Amount input dialog (when QR has no amount) ───────
  Future<double?> _showAmountInput() async {
    final controller = TextEditingController();
    return showModalBottomSheet<double>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(ctx).viewInsets.bottom,
        ),
        child: Container(
          decoration: const BoxDecoration(
            color: NeoBankTheme.bgCard,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
          child: SafeArea(
            top: false,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 36,
                    height: 4,
                    decoration: BoxDecoration(
                      color: NeoBankTheme.textMuted.withOpacity(0.4),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                const Text(
                  'Nhập số tiền',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: NeoBankTheme.textPrimary,
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: controller,
                  keyboardType: TextInputType.number,
                  autofocus: true,
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w700,
                    color: NeoBankTheme.primary,
                  ),
                  decoration: const InputDecoration(
                    hintText: '0',
                    suffixText: 'VND',
                    suffixStyle: TextStyle(
                      color: NeoBankTheme.textMuted,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () {
                    final val = double.tryParse(
                        controller.text.replaceAll(RegExp(r'[^0-9]'), ''));
                    Navigator.pop(ctx, val);
                  },
                  child: const Text('Tiếp tục'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ── Execute the transfer ──────────────────────────────
  Future<void> _executeTransfer({
    required String account,
    required String bankCode,
    required double amount,
    String? note,
  }) async {
    setState(() => _isProcessing = true);

    final result = await NeoBankBackend().transfer(
      recipientAccount: account,
      bankCode: bankCode,
      amount: amount,
      note: note,
    );

    setState(() => _isProcessing = false);

    if (!mounted) return;

    await showTransferResult(
      context,
      success: result.success,
      message: result.success
          ? 'Chuyển tiền thành công!'
          : result.error ?? 'Lỗi không xác định',
      detail: result.success
          ? 'Số dư: ${NeoBankBackend.formatVND(result.newBalance ?? 0)}'
          : null,
    );

    if (mounted) Navigator.of(context).pop(); // Return to previous screen
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // ── Scanner overlay ──
          if (_isScanning)
            ScanningOverlay(
              onClose: () => Navigator.of(context).pop(),
            ),

          // ── Processing skeleton ──
          if (_isProcessing)
            Container(
              color: Colors.black87,
              child: const Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    SizedBox(
                      width: 48,
                      height: 48,
                      child: CircularProgressIndicator(
                        color: NeoBankTheme.primary,
                        strokeWidth: 3,
                      ),
                    ),
                    SizedBox(height: 16),
                    Text(
                      'Đang xử lý...',
                      style: TextStyle(
                        color: NeoBankTheme.textSecondary,
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
