/// ═══════════════════════════════════════════════════════
/// NeoBank — Flutter Entry Point
/// Demo app showcasing QR Scan + Manual Transfer
/// ═══════════════════════════════════════════════════════

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'theme/neobank_theme.dart';
import 'services/neobank_backend.dart';
import 'screens/qr_scan_screen.dart';
import 'screens/transfer_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: NeoBankTheme.bgDark,
  ));
  runApp(const NeoBankApp());
}

class NeoBankApp extends StatelessWidget {
  const NeoBankApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NeoBank',
      debugShowCheckedModeBanner: false,
      theme: NeoBankTheme.darkTheme,
      home: const DemoHome(),
    );
  }
}

/// ── Demo home screen with two action buttons ───────────
/// In production, integrate these widgets into your existing
/// dashboard navigation.
class DemoHome extends StatelessWidget {
  const DemoHome({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NeoBankTheme.bgDark,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 20),

              // ── Header ──
              Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          NeoBankTheme.primary,
                          NeoBankTheme.primary.withOpacity(0.6),
                        ],
                      ),
                      borderRadius: BorderRadius.circular(14),
                      boxShadow: [
                        BoxShadow(
                          color: NeoBankTheme.primary.withOpacity(0.4),
                          blurRadius: 20,
                        ),
                      ],
                    ),
                    child: const Icon(Icons.account_balance_wallet,
                        color: Colors.white, size: 24),
                  ),
                  const SizedBox(width: 14),
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('NeoBank',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w800,
                            color: NeoBankTheme.textPrimary,
                          )),
                      Text('QR & Transfer Demo',
                          style: TextStyle(
                            fontSize: 13,
                            color: NeoBankTheme.textMuted,
                          )),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 40),

              // ── Balance Card ──
              Container(
                padding: const EdgeInsets.all(24),
                decoration: NeoBankTheme.glassCard.copyWith(
                  boxShadow: NeoBankTheme.softShadow,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Số dư hiện tại',
                        style: TextStyle(
                          fontSize: 13,
                          color: NeoBankTheme.textMuted,
                          fontWeight: FontWeight.w500,
                        )),
                    const SizedBox(height: 8),
                    Text(
                      NeoBankBackend.formatVND(NeoBankBackend().balance),
                      style: const TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w800,
                        color: NeoBankTheme.textPrimary,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 40),

              // ── Action buttons ──
              const Text('Chức năng',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: NeoBankTheme.textPrimary,
                  )),
              const SizedBox(height: 16),

              // QR Scan
              _ActionCard(
                icon: Icons.qr_code_scanner,
                title: 'Quét mã QR',
                subtitle: 'Quét mã VietQR để chuyển tiền nhanh',
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const QrScanScreen()),
                ),
              ),
              const SizedBox(height: 14),

              // Manual Transfer
              _ActionCard(
                icon: Icons.swap_horiz,
                title: 'Chuyển tiền thủ công',
                subtitle: 'Nhập STK, ngân hàng và số tiền',
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const TransferScreen()),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ActionCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _ActionCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: NeoBankTheme.bgCard,
      borderRadius: BorderRadius.circular(NeoBankTheme.radiusLg),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(NeoBankTheme.radiusLg),
        splashColor: NeoBankTheme.primary.withOpacity(0.1),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(NeoBankTheme.radiusLg),
            border: Border.all(color: NeoBankTheme.borderColor),
          ),
          child: Row(
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: NeoBankTheme.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(icon, color: NeoBankTheme.primary, size: 26),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: NeoBankTheme.textPrimary,
                        )),
                    const SizedBox(height: 4),
                    Text(subtitle,
                        style: const TextStyle(
                          fontSize: 13,
                          color: NeoBankTheme.textMuted,
                        )),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right,
                  color: NeoBankTheme.textMuted, size: 22),
            ],
          ),
        ),
      ),
    );
  }
}
