/// ═══════════════════════════════════════════════════════
/// NeoBank — Fake Backend Service
/// Simulates balance, accounts, and transaction logging.
/// ═══════════════════════════════════════════════════════

import 'dart:math';

class NeoBankBackend {
  // ── Singleton ─────────────────────────────────────────
  static final NeoBankBackend _instance = NeoBankBackend._internal();
  factory NeoBankBackend() => _instance;
  NeoBankBackend._internal();

  // ── State ─────────────────────────────────────────────
  double _balance = 125000000; // 125 triệu VND
  final List<Transaction> _transactions = [];

  double get balance => _balance;
  List<Transaction> get transactions => List.unmodifiable(_transactions);

  // ── Vietnamese Banks ──────────────────────────────────
  static const List<BankInfo> supportedBanks = [
    BankInfo(code: 'MB', name: 'MB Bank', bin: '970422'),
    BankInfo(code: 'TCB', name: 'Techcombank', bin: '970407'),
    BankInfo(code: 'VCB', name: 'Vietcombank', bin: '970436'),
    BankInfo(code: 'ACB', name: 'ACB', bin: '970416'),
    BankInfo(code: 'BIDV', name: 'BIDV', bin: '970418'),
    BankInfo(code: 'VPB', name: 'VPBank', bin: '970432'),
    BankInfo(code: 'TPB', name: 'TPBank', bin: '970423'),
    BankInfo(code: 'STB', name: 'Sacombank', bin: '970403'),
  ];

  // ── Transfer ──────────────────────────────────────────
  /// Executes a transfer. Returns a [TransferResult].
  Future<TransferResult> transfer({
    required String recipientAccount,
    required String bankCode,
    required double amount,
    String? note,
  }) async {
    // Simulate network delay (800–1500ms)
    await Future.delayed(
      Duration(milliseconds: 800 + Random().nextInt(700)),
    );

    // ── Validate ──
    if (amount <= 0) {
      return TransferResult(
        success: false,
        error: 'Số tiền phải lớn hơn 0',
      );
    }

    if (amount > _balance) {
      return TransferResult(
        success: false,
        error: 'Số dư không đủ',
      );
    }

    if (recipientAccount.length < 6) {
      return TransferResult(
        success: false,
        error: 'Số tài khoản không hợp lệ',
      );
    }

    // ── Execute ──
    _balance -= amount;

    final bank = supportedBanks.firstWhere(
      (b) => b.code == bankCode,
      orElse: () => supportedBanks.first,
    );

    final tx = Transaction(
      id: 'TX${DateTime.now().millisecondsSinceEpoch}',
      type: TransactionType.transfer,
      amount: amount,
      recipientAccount: recipientAccount,
      bankName: bank.name,
      bankCode: bankCode,
      note: note ?? '',
      createdAt: DateTime.now(),
    );

    _transactions.insert(0, tx);

    return TransferResult(
      success: true,
      transaction: tx,
      newBalance: _balance,
    );
  }

  // ── Parse Vietnamese Bank QR ──────────────────────────
  /// Parses VietQR / NAPAS QR content.
  /// Format: BankBIN | Account | Amount | Description
  static QrParseResult parseVietQR(String raw) {
    // Try VietQR standard (EMVCo)
    // Look for tag 38 (merchant info) containing bank BIN + account
    String? bankCode;
    String? account;
    double? amount;
    String? description;

    // ── Simple VietQR parsing (tag-based) ──
    // Real VietQR: "00020101021238570010A00000072701270006970422011309876543210208QRIBFTTA5303704540850000005802VN62090805hello6304XXXX"
    for (final bank in supportedBanks) {
      if (raw.contains(bank.bin)) {
        bankCode = bank.code;

        // Extract account number after BIN (tag 01, length varies)
        final binIdx = raw.indexOf(bank.bin);
        final afterBin = raw.substring(binIdx + bank.bin.length);
        // Account is typically after "01" + 2-digit length
        final accMatch = RegExp(r'01(\d{2})(\d+)').firstMatch(afterBin);
        if (accMatch != null) {
          final len = int.tryParse(accMatch.group(1)!) ?? 0;
          account = accMatch.group(2)!.substring(0, len.clamp(0, accMatch.group(2)!.length));
        }
        break;
      }
    }

    // Extract amount (tag 54)
    final amountMatch = RegExp(r'54(\d{2})(\d+)').firstMatch(raw);
    if (amountMatch != null) {
      final len = int.tryParse(amountMatch.group(1)!) ?? 0;
      final amtStr = amountMatch.group(2)!.substring(0, len.clamp(0, amountMatch.group(2)!.length));
      amount = double.tryParse(amtStr);
    }

    // Extract description (tag 08 inside tag 62)
    final descMatch = RegExp(r'6\d{3}08(\d{2})(.+?)63').firstMatch(raw);
    if (descMatch != null) {
      final len = int.tryParse(descMatch.group(1)!) ?? 0;
      description = descMatch.group(2)!.substring(0, len.clamp(0, descMatch.group(2)!.length));
    }

    // ── Fallback: simple delimited format ──
    // "BANKCODE|ACCOUNT|AMOUNT|NOTE"
    if (bankCode == null && raw.contains('|')) {
      final parts = raw.split('|');
      if (parts.length >= 2) {
        final matchedBank = supportedBanks.where(
          (b) => b.code.toUpperCase() == parts[0].trim().toUpperCase(),
        );
        if (matchedBank.isNotEmpty) {
          bankCode = matchedBank.first.code;
          account = parts[1].trim();
          if (parts.length >= 3) amount = double.tryParse(parts[2].trim());
          if (parts.length >= 4) description = parts[3].trim();
        }
      }
    }

    if (bankCode == null || account == null) {
      return QrParseResult(success: false, error: 'Không nhận dạng được mã QR');
    }

    return QrParseResult(
      success: true,
      bankCode: bankCode,
      accountNumber: account,
      amount: amount,
      description: description,
    );
  }

  // ── Format VND ────────────────────────────────────────
  static String formatVND(double amount) {
    final str = amount.toInt().toString();
    final buffer = StringBuffer();
    for (int i = 0; i < str.length; i++) {
      if (i > 0 && (str.length - i) % 3 == 0) buffer.write('.');
      buffer.write(str[i]);
    }
    buffer.write(' VND');
    return buffer.toString();
  }
}

// ── Data Models ───────────────────────────────────────

class BankInfo {
  final String code;
  final String name;
  final String bin;
  const BankInfo({required this.code, required this.name, required this.bin});
}

enum TransactionType { transfer, qrPay, topup, bill }

class Transaction {
  final String id;
  final TransactionType type;
  final double amount;
  final String recipientAccount;
  final String bankName;
  final String bankCode;
  final String note;
  final DateTime createdAt;

  const Transaction({
    required this.id,
    required this.type,
    required this.amount,
    required this.recipientAccount,
    required this.bankName,
    required this.bankCode,
    required this.note,
    required this.createdAt,
  });
}

class TransferResult {
  final bool success;
  final String? error;
  final Transaction? transaction;
  final double? newBalance;

  const TransferResult({
    required this.success,
    this.error,
    this.transaction,
    this.newBalance,
  });
}

class QrParseResult {
  final bool success;
  final String? error;
  final String? bankCode;
  final String? accountNumber;
  final double? amount;
  final String? description;

  const QrParseResult({
    required this.success,
    this.error,
    this.bankCode,
    this.accountNumber,
    this.amount,
    this.description,
  });
}
