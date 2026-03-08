/// ═══════════════════════════════════════════════════════
/// NeoBank — Dark Theme Constants
/// ═══════════════════════════════════════════════════════

import 'package:flutter/material.dart';

class NeoBankTheme {
  // ── Colors ────────────────────────────────────────────
  static const Color primary = Color(0xFF0DB9F2);
  static const Color primaryDark = Color(0xFF0A9BD4);
  static const Color bgDark = Color(0xFF101E22);
  static const Color bgCard = Color(0xFF1A2832);
  static const Color bgInput = Color(0xFF0F1A1F);
  static const Color bgOverlay = Color(0xCC000000);
  static const Color textPrimary = Color(0xFFF1F5F9);
  static const Color textSecondary = Color(0xFF94A3B8);
  static const Color textMuted = Color(0xFF64748B);
  static const Color borderColor = Color(0x1AFFFFFF);
  static const Color success = Color(0xFF10B981);
  static const Color danger = Color(0xFFEF4444);
  static const Color warning = Color(0xFFFBBF24);

  // ── Border radii ──────────────────────────────────────
  static const double radiusSm = 8;
  static const double radiusMd = 12;
  static const double radiusLg = 16;
  static const double radiusXl = 24;

  // ── Theme Data ────────────────────────────────────────
  static ThemeData get darkTheme => ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: bgDark,
        fontFamily: 'Inter',
        colorScheme: const ColorScheme.dark(
          primary: primary,
          surface: bgCard,
          error: danger,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.transparent,
          elevation: 0,
          centerTitle: true,
          titleTextStyle: TextStyle(
            fontFamily: 'Inter',
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: textPrimary,
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: bgInput,
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(radiusMd),
            borderSide: const BorderSide(color: borderColor),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(radiusMd),
            borderSide: const BorderSide(color: borderColor),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(radiusMd),
            borderSide: const BorderSide(color: primary, width: 1.5),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(radiusMd),
            borderSide: const BorderSide(color: danger),
          ),
          hintStyle: const TextStyle(color: textMuted, fontSize: 14),
          labelStyle: const TextStyle(color: textSecondary, fontSize: 14),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: primary,
            foregroundColor: Colors.white,
            minimumSize: const Size.fromHeight(56),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(radiusMd),
            ),
            textStyle: const TextStyle(
              fontFamily: 'Inter',
              fontSize: 16,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      );

  // ── Glass Card Decoration ─────────────────────────────
  static BoxDecoration get glassCard => BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            primary.withOpacity(0.15),
            const Color(0xFF101E22).withOpacity(0.4),
          ],
        ),
        borderRadius: BorderRadius.circular(radiusLg),
        border: Border.all(color: primary.withOpacity(0.2)),
      );

  // ── Soft Shadow ───────────────────────────────────────
  static List<BoxShadow> get softShadow => [
        BoxShadow(
          color: Colors.black.withOpacity(0.3),
          blurRadius: 20,
          offset: const Offset(0, 8),
        ),
      ];
}
