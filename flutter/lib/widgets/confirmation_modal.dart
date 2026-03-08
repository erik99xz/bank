/// ═══════════════════════════════════════════════════════
/// NeoBank — Confirmation Modal Widget
/// Slide-up modal with animated success/error result
/// ═══════════════════════════════════════════════════════

import 'package:flutter/material.dart';
import '../theme/neobank_theme.dart';
import '../services/neobank_backend.dart';

/// Shows a slide-up confirmation modal. Returns `true` if user confirms.
Future<bool?> showTransferConfirmation(
  BuildContext context, {
  required String recipientAccount,
  required String bankName,
  required double amount,
  String? note,
}) {
  return showModalBottomSheet<bool>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (ctx) => _ConfirmationSheet(
      recipientAccount: recipientAccount,
      bankName: bankName,
      amount: amount,
      note: note,
    ),
  );
}

class _ConfirmationSheet extends StatelessWidget {
  final String recipientAccount;
  final String bankName;
  final double amount;
  final String? note;

  const _ConfirmationSheet({
    required this.recipientAccount,
    required this.bankName,
    required this.amount,
    this.note,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(top: 80),
      decoration: const BoxDecoration(
        color: NeoBankTheme.bgCard,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 12, 24, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // ── Handle ──
              Container(
                width: 36,
                height: 4,
                decoration: BoxDecoration(
                  color: NeoBankTheme.textMuted.withOpacity(0.4),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 24),

              // ── Title ──
              const Text(
                'Xác nhận chuyển tiền',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: NeoBankTheme.textPrimary,
                ),
              ),
              const SizedBox(height: 24),

              // ── Detail card ──
              Container(
                padding: const EdgeInsets.all(20),
                decoration: NeoBankTheme.glassCard,
                child: Column(
                  children: [
                    _detailRow('Người nhận', recipientAccount),
                    _divider(),
                    _detailRow('Ngân hàng', bankName),
                    _divider(),
                    _detailRow(
                      'Số tiền',
                      NeoBankBackend.formatVND(amount),
                      valueColor: NeoBankTheme.primary,
                      valueBold: true,
                    ),
                    if (note != null && note!.isNotEmpty) ...[
                      _divider(),
                      _detailRow('Ghi chú', note!),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // ── Buttons ──
              Row(
                children: [
                  // Cancel
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(context, false),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: NeoBankTheme.textSecondary,
                        side: const BorderSide(color: NeoBankTheme.borderColor),
                        minimumSize: const Size.fromHeight(52),
                        shape: RoundedRectangleBorder(
                          borderRadius:
                              BorderRadius.circular(NeoBankTheme.radiusMd),
                        ),
                      ),
                      child: const Text('Hủy',
                          style: TextStyle(fontWeight: FontWeight.w600)),
                    ),
                  ),
                  const SizedBox(width: 16),
                  // Confirm
                  Expanded(
                    flex: 2,
                    child: ElevatedButton(
                      onPressed: () => Navigator.pop(context, true),
                      child: const Text('Xác nhận chuyển'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _detailRow(String label, String value,
      {Color? valueColor, bool valueBold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 14,
              color: NeoBankTheme.textMuted,
              fontWeight: FontWeight.w500,
            ),
          ),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: TextStyle(
                fontSize: 14,
                color: valueColor ?? NeoBankTheme.textPrimary,
                fontWeight: valueBold ? FontWeight.w700 : FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _divider() => Divider(
        color: NeoBankTheme.borderColor,
        height: 1,
      );
}

// ═══════════════════════════════════════════════════════
// Animated success / error result overlay
// ═══════════════════════════════════════════════════════

/// Shows a full-screen animated result (checkmark or X shake).
Future<void> showTransferResult(
  BuildContext context, {
  required bool success,
  String? message,
  String? detail,
}) {
  return showDialog(
    context: context,
    barrierDismissible: false,
    barrierColor: Colors.black87,
    builder: (ctx) => _ResultOverlay(
      success: success,
      message: message ?? (success ? 'Chuyển tiền thành công!' : 'Chuyển tiền thất bại'),
      detail: detail,
    ),
  );
}

class _ResultOverlay extends StatefulWidget {
  final bool success;
  final String message;
  final String? detail;

  const _ResultOverlay({
    required this.success,
    required this.message,
    this.detail,
  });

  @override
  State<_ResultOverlay> createState() => _ResultOverlayState();
}

class _ResultOverlayState extends State<_ResultOverlay>
    with TickerProviderStateMixin {
  late AnimationController _iconController;
  late AnimationController _shakeController;
  late Animation<double> _iconScale;
  late Animation<double> _shakeOffset;

  @override
  void initState() {
    super.initState();

    // Success: bouncy scale-in
    _iconController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _iconScale = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _iconController,
        curve: Curves.elasticOut,
      ),
    );

    // Error: horizontal shake
    _shakeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
    _shakeOffset = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _shakeController, curve: Curves.elasticIn),
    );

    // Play the appropriate animation
    if (widget.success) {
      _iconController.forward();
    } else {
      _shakeController.forward();
    }

    // Auto-dismiss after 2.5 seconds
    Future.delayed(const Duration(milliseconds: 2500), () {
      if (mounted) Navigator.of(context).pop();
    });
  }

  @override
  void dispose() {
    _iconController.dispose();
    _shakeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: AnimatedBuilder(
        animation: widget.success ? _iconScale : _shakeOffset,
        builder: (ctx, child) {
          double dx = 0;
          if (!widget.success) {
            dx = sin(_shakeOffset.value * 3 * pi) * 12;
          }
          return Transform.translate(
            offset: Offset(dx, 0),
            child: Transform.scale(
              scale: widget.success ? _iconScale.value : 1.0,
              child: child,
            ),
          );
        },
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // ── Icon circle ──
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  colors: widget.success
                      ? [NeoBankTheme.primary, NeoBankTheme.primaryDark]
                      : [NeoBankTheme.danger, const Color(0xFFDC2626)],
                ),
                boxShadow: [
                  BoxShadow(
                    color: (widget.success
                            ? NeoBankTheme.primary
                            : NeoBankTheme.danger)
                        .withOpacity(0.4),
                    blurRadius: 40,
                  ),
                ],
              ),
              child: Icon(
                widget.success ? Icons.check_rounded : Icons.close_rounded,
                color: Colors.white,
                size: 48,
              ),
            ),
            const SizedBox(height: 24),

            // ── Message ──
            Text(
              widget.message,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
            if (widget.detail != null) ...[
              const SizedBox(height: 8),
              Text(
                widget.detail!,
                style: const TextStyle(
                  fontSize: 14,
                  color: NeoBankTheme.textSecondary,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
