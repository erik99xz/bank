/// ═══════════════════════════════════════════════════════
/// NeoBank — Manual Transfer Screen
/// Input fields, bank dropdown, validation, confirmation
/// ═══════════════════════════════════════════════════════

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/neobank_theme.dart';
import '../services/neobank_backend.dart';
import '../widgets/confirmation_modal.dart';

/// Manual transfer screen with:
/// - Recipient account number input
/// - Bank dropdown (Vietnamese banks)
/// - VND amount input with formatting
/// - Optional note/memo
/// - Validation → Confirmation modal → Animated result
class TransferScreen extends StatefulWidget {
  /// Optional pre-fill from QR scan
  final String? prefillAccount;
  final String? prefillBankCode;
  final double? prefillAmount;
  final String? prefillNote;

  const TransferScreen({
    super.key,
    this.prefillAccount,
    this.prefillBankCode,
    this.prefillAmount,
    this.prefillNote,
  });

  @override
  State<TransferScreen> createState() => _TransferScreenState();
}

class _TransferScreenState extends State<TransferScreen>
    with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _accountController = TextEditingController();
  final _amountController = TextEditingController();
  final _noteController = TextEditingController();
  String _selectedBankCode = 'MB';
  bool _isProcessing = false;

  late AnimationController _slideController;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();

    // Pre-fill from QR scan (if provided)
    if (widget.prefillAccount != null) {
      _accountController.text = widget.prefillAccount!;
    }
    if (widget.prefillBankCode != null) {
      _selectedBankCode = widget.prefillBankCode!;
    }
    if (widget.prefillAmount != null && widget.prefillAmount! > 0) {
      _amountController.text = widget.prefillAmount!.toInt().toString();
    }
    if (widget.prefillNote != null) {
      _noteController.text = widget.prefillNote!;
    }

    // Slide-up entrance animation
    _slideController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.1),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _slideController,
      curve: Curves.easeOutCubic,
    ));
    _slideController.forward();
  }

  @override
  void dispose() {
    _accountController.dispose();
    _amountController.dispose();
    _noteController.dispose();
    _slideController.dispose();
    super.dispose();
  }

  // ── Submit handler ────────────────────────────────────
  Future<void> _onSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    final bank = NeoBankBackend.supportedBanks.firstWhere(
      (b) => b.code == _selectedBankCode,
    );
    final amount = double.tryParse(
          _amountController.text.replaceAll(RegExp(r'[^0-9]'), ''),
        ) ?? 0;

    // Show confirmation modal
    final confirmed = await showTransferConfirmation(
      context,
      recipientAccount: _accountController.text.trim(),
      bankName: bank.name,
      amount: amount,
      note: _noteController.text.trim().isNotEmpty
          ? _noteController.text.trim()
          : null,
    );

    if (confirmed != true || !mounted) return;

    // Execute transfer
    setState(() => _isProcessing = true);

    final result = await NeoBankBackend().transfer(
      recipientAccount: _accountController.text.trim(),
      bankCode: _selectedBankCode,
      amount: amount,
      note: _noteController.text.trim(),
    );

    setState(() => _isProcessing = false);
    if (!mounted) return;

    // Show animated result
    await showTransferResult(
      context,
      success: result.success,
      message: result.success
          ? 'Chuyển tiền thành công!'
          : result.error ?? 'Lỗi không xác định',
      detail: result.success
          ? 'Số dư mới: ${NeoBankBackend.formatVND(result.newBalance ?? 0)}'
          : null,
    );

    if (result.success && mounted) {
      Navigator.of(context).pop(); // Return to dashboard
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NeoBankTheme.bgDark,
      // ── App Bar ──
      appBar: AppBar(
        leading: IconButton(
          icon: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: NeoBankTheme.bgCard,
              shape: BoxShape.circle,
              border: Border.all(color: NeoBankTheme.borderColor),
            ),
            child: const Icon(Icons.arrow_back_ios_new,
                size: 16, color: NeoBankTheme.textPrimary),
          ),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text('Chuyển tiền'),
        actions: [
          // QR scan shortcut
          IconButton(
            icon: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: NeoBankTheme.bgCard,
                shape: BoxShape.circle,
                border: Border.all(color: NeoBankTheme.borderColor),
              ),
              child: const Icon(Icons.qr_code_scanner,
                  size: 18, color: NeoBankTheme.primary),
            ),
            onPressed: () {
              // Navigate to QR scan screen
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) =>
                      const _LazyQrScan(), // Lazy import to avoid circular
                ),
              );
            },
          ),
          const SizedBox(width: 8),
        ],
      ),

      body: SlideTransition(
        position: _slideAnimation,
        child: FadeTransition(
          opacity: _slideController,
          child: Stack(
            children: [
              SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(24, 16, 24, 120),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // ── Balance display ──
                      _buildBalanceCard(),
                      const SizedBox(height: 28),

                      // ── Recipient account ──
                      _buildSectionLabel('Số tài khoản người nhận'),
                      const SizedBox(height: 8),
                      _buildAccountInput(),
                      const SizedBox(height: 20),

                      // ── Bank selector ──
                      _buildSectionLabel('Ngân hàng'),
                      const SizedBox(height: 8),
                      _buildBankDropdown(),
                      const SizedBox(height: 20),

                      // ── Amount ──
                      _buildSectionLabel('Số tiền (VND)'),
                      const SizedBox(height: 8),
                      _buildAmountInput(),
                      const SizedBox(height: 20),

                      // ── Note ──
                      _buildSectionLabel('Ghi chú (tùy chọn)'),
                      const SizedBox(height: 8),
                      _buildNoteInput(),
                    ],
                  ),
                ),
              ),

              // ── Bottom submit button ──
              Positioned(
                left: 0,
                right: 0,
                bottom: 0,
                child: Container(
                  padding: EdgeInsets.fromLTRB(
                    24,
                    16,
                    24,
                    MediaQuery.of(context).padding.bottom + 16,
                  ),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        NeoBankTheme.bgDark.withOpacity(0),
                        NeoBankTheme.bgDark,
                      ],
                    ),
                  ),
                  child: _buildSubmitButton(),
                ),
              ),

              // ── Processing overlay ──
              if (_isProcessing)
                Container(
                  color: Colors.black54,
                  child: const Center(
                    child: CircularProgressIndicator(
                      color: NeoBankTheme.primary,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  // ═══════════════════════════════════════════════════════
  // WIDGETS
  // ═══════════════════════════════════════════════════════

  Widget _buildBalanceCard() {
    final balance = NeoBankBackend().balance;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: NeoBankTheme.glassCard,
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: NeoBankTheme.primary.withOpacity(0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.account_balance_wallet,
                color: NeoBankTheme.primary, size: 22),
          ),
          const SizedBox(width: 14),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Số dư khả dụng',
                style: TextStyle(
                  fontSize: 12,
                  color: NeoBankTheme.textMuted,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                NeoBankBackend.formatVND(balance),
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: NeoBankTheme.textPrimary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSectionLabel(String text) {
    return Text(
      text,
      style: const TextStyle(
        fontSize: 13,
        fontWeight: FontWeight.w600,
        color: NeoBankTheme.textSecondary,
      ),
    );
  }

  Widget _buildAccountInput() {
    return TextFormField(
      controller: _accountController,
      keyboardType: TextInputType.number,
      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
      style: const TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: NeoBankTheme.textPrimary,
      ),
      decoration: InputDecoration(
        hintText: 'Nhập số tài khoản',
        prefixIcon: const Padding(
          padding: EdgeInsets.all(12),
          child: Icon(Icons.credit_card,
              color: NeoBankTheme.textMuted, size: 22),
        ),
        suffixIcon: _accountController.text.isNotEmpty
            ? IconButton(
                icon: const Icon(Icons.clear,
                    color: NeoBankTheme.textMuted, size: 18),
                onPressed: () {
                  _accountController.clear();
                  setState(() {});
                },
              )
            : null,
      ),
      validator: (val) {
        if (val == null || val.trim().isEmpty) return 'Vui lòng nhập STK';
        if (val.trim().length < 6) return 'STK phải có ít nhất 6 chữ số';
        return null;
      },
      onChanged: (_) => setState(() {}),
    );
  }

  Widget _buildBankDropdown() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: NeoBankTheme.bgInput,
        borderRadius: BorderRadius.circular(NeoBankTheme.radiusMd),
        border: Border.all(color: NeoBankTheme.borderColor),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: _selectedBankCode,
          isExpanded: true,
          dropdownColor: NeoBankTheme.bgCard,
          icon: const Icon(Icons.keyboard_arrow_down,
              color: NeoBankTheme.textMuted),
          style: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w600,
            color: NeoBankTheme.textPrimary,
            fontFamily: 'Inter',
          ),
          items: NeoBankBackend.supportedBanks.map((bank) {
            return DropdownMenuItem(
              value: bank.code,
              child: Row(
                children: [
                  // Bank icon circle
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: NeoBankTheme.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Center(
                      child: Text(
                        bank.code.substring(0, 2),
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: NeoBankTheme.primary,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Text(bank.name),
                ],
              ),
            );
          }).toList(),
          onChanged: (val) {
            if (val != null) setState(() => _selectedBankCode = val);
          },
        ),
      ),
    );
  }

  Widget _buildAmountInput() {
    return TextFormField(
      controller: _amountController,
      keyboardType: TextInputType.number,
      inputFormatters: [
        FilteringTextInputFormatter.digitsOnly,
        _VndInputFormatter(),
      ],
      style: const TextStyle(
        fontSize: 24,
        fontWeight: FontWeight.w700,
        color: NeoBankTheme.primary,
      ),
      decoration: const InputDecoration(
        hintText: '0',
        hintStyle: TextStyle(
          fontSize: 24,
          fontWeight: FontWeight.w700,
          color: NeoBankTheme.textMuted,
        ),
        suffixText: 'VND',
        suffixStyle: TextStyle(
          color: NeoBankTheme.textMuted,
          fontSize: 16,
          fontWeight: FontWeight.w600,
        ),
        prefixIcon: Padding(
          padding: EdgeInsets.all(12),
          child: Icon(Icons.monetization_on_outlined,
              color: NeoBankTheme.textMuted, size: 22),
        ),
      ),
      validator: (val) {
        if (val == null || val.isEmpty) return 'Vui lòng nhập số tiền';
        final num = double.tryParse(val.replaceAll(RegExp(r'[^0-9]'), ''));
        if (num == null || num <= 0) return 'Số tiền phải lớn hơn 0';
        if (num > NeoBankBackend().balance) return 'Số dư không đủ';
        return null;
      },
    );
  }

  Widget _buildNoteInput() {
    return TextFormField(
      controller: _noteController,
      maxLines: 2,
      style: const TextStyle(
        fontSize: 14,
        color: NeoBankTheme.textPrimary,
      ),
      decoration: const InputDecoration(
        hintText: 'Nội dung chuyển tiền...',
        prefixIcon: Padding(
          padding: EdgeInsets.all(12),
          child: Icon(Icons.edit_note,
              color: NeoBankTheme.textMuted, size: 22),
        ),
      ),
    );
  }

  Widget _buildSubmitButton() {
    return SizedBox(
      height: 56,
      child: ElevatedButton(
        onPressed: _isProcessing ? null : _onSubmit,
        style: ElevatedButton.styleFrom(
          backgroundColor: NeoBankTheme.primary,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(NeoBankTheme.radiusMd),
          ),
          elevation: 0,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              'Chuyển tiền',
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
            const SizedBox(width: 8),
            const Icon(Icons.arrow_forward, color: Colors.white, size: 20),
          ],
        ),
      ),
    );
  }
}

// ── VND thousands separator formatter ───────────────

class _VndInputFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    if (newValue.text.isEmpty) return newValue;

    final digits = newValue.text.replaceAll(RegExp(r'[^0-9]'), '');
    if (digits.isEmpty) return const TextEditingValue();

    final buffer = StringBuffer();
    for (int i = 0; i < digits.length; i++) {
      if (i > 0 && (digits.length - i) % 3 == 0) buffer.write('.');
      buffer.write(digits[i]);
    }

    final formatted = buffer.toString();
    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }
}

// ── Lazy QR scan import (avoids circular dependency) ──

class _LazyQrScan extends StatelessWidget {
  const _LazyQrScan();

  @override
  Widget build(BuildContext context) {
    // Import dynamically when needed
    return const _QrScanPlaceholder();
  }
}

class _QrScanPlaceholder extends StatelessWidget {
  const _QrScanPlaceholder();

  @override
  Widget build(BuildContext context) {
    // In production, return QrScanScreen() directly
    // Keeping separate to avoid circular import in this file structure
    return Scaffold(
      backgroundColor: Colors.black,
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.qr_code_scanner,
                size: 64, color: NeoBankTheme.primary),
            const SizedBox(height: 16),
            const Text('QR Scanner',
                style: TextStyle(color: Colors.white, fontSize: 18)),
            const SizedBox(height: 24),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Đóng'),
            ),
          ],
        ),
      ),
    );
  }
}
