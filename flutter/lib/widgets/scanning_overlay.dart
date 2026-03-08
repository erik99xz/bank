/// ═══════════════════════════════════════════════════════
/// NeoBank — QR Scanner Overlay Widget
/// Animated scanning line + corner brackets + ripple
/// ═══════════════════════════════════════════════════════

import 'dart:math';
import 'package:flutter/material.dart';
import '../theme/neobank_theme.dart';

/// Full-screen QR scanner overlay with animated scanning line,
/// corner brackets, and pulsing ripple effect.
class ScanningOverlay extends StatefulWidget {
  final VoidCallback onClose;
  final Widget? cameraPreview; // Plug in your camera_preview widget here

  const ScanningOverlay({
    super.key,
    required this.onClose,
    this.cameraPreview,
  });

  @override
  State<ScanningOverlay> createState() => _ScanningOverlayState();
}

class _ScanningOverlayState extends State<ScanningOverlay>
    with TickerProviderStateMixin {
  late AnimationController _scanLineController;
  late AnimationController _pulseController;
  late Animation<double> _scanLineAnimation;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();

    // Scanning line: moves top → bottom → top
    _scanLineController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2500),
    )..repeat(reverse: true);
    _scanLineAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _scanLineController, curve: Curves.easeInOut),
    );

    // Pulse ripple on the frame corners
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat();
    _pulseAnimation = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _scanLineController.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    const frameSize = 260.0;
    final frameTop = (size.height - frameSize) / 2 - 40;
    final frameLeft = (size.width - frameSize) / 2;

    return Material(
      color: Colors.transparent,
      child: Stack(
        children: [
          // ── Camera preview (or dark background) ──
          Positioned.fill(
            child: widget.cameraPreview ??
                Container(color: const Color(0xF0000000)),
          ),

          // ── Dark overlay with cutout ──
          Positioned.fill(
            child: CustomPaint(
              painter: _OverlayPainter(
                frameRect: Rect.fromLTWH(
                  frameLeft, frameTop, frameSize, frameSize,
                ),
              ),
            ),
          ),

          // ── Corner brackets ──
          AnimatedBuilder(
            animation: _pulseAnimation,
            builder: (ctx, child) => Transform.scale(
              scale: _pulseAnimation.value,
              child: child,
            ),
            child: Positioned(
              top: frameTop,
              left: frameLeft,
              child: SizedBox(
                width: frameSize,
                height: frameSize,
                child: CustomPaint(
                  painter: _CornerBracketPainter(
                    color: NeoBankTheme.primary,
                    cornerLength: 28,
                    strokeWidth: 3,
                    radius: 16,
                  ),
                ),
              ),
            ),
          ),

          // ── Scanning line ──
          AnimatedBuilder(
            animation: _scanLineAnimation,
            builder: (ctx, _) {
              final y = frameTop + (_scanLineAnimation.value * frameSize);
              return Positioned(
                top: y,
                left: frameLeft + 8,
                child: Container(
                  width: frameSize - 16,
                  height: 3,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        NeoBankTheme.primary.withOpacity(0),
                        NeoBankTheme.primary,
                        NeoBankTheme.primary.withOpacity(0),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(2),
                    boxShadow: [
                      BoxShadow(
                        color: NeoBankTheme.primary.withOpacity(0.6),
                        blurRadius: 12,
                        spreadRadius: 2,
                      ),
                    ],
                  ),
                ),
              );
            },
          ),

          // ── Top bar: close button + title ──
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              child: Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _circleButton(Icons.close, widget.onClose),
                    const Text(
                      'Quét mã QR',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    _circleButton(Icons.flash_on, () {
                      // Toggle flashlight — implement with camera plugin
                    }),
                  ],
                ),
              ),
            ),
          ),

          // ── Bottom hint ──
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              child: Padding(
                padding: const EdgeInsets.only(bottom: 32),
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 24, vertical: 12),
                      decoration: BoxDecoration(
                        color: Colors.black54,
                        borderRadius: BorderRadius.circular(24),
                      ),
                      child: const Text(
                        'Đưa mã QR vào khung hình',
                        style: TextStyle(
                          color: Colors.white70,
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _circleButton(IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.1),
          shape: BoxShape.circle,
          border: Border.all(color: Colors.white.withOpacity(0.15)),
        ),
        child: Icon(icon, color: Colors.white, size: 22),
      ),
    );
  }
}

// ── Dark overlay painter with transparent cutout ─────

class _OverlayPainter extends CustomPainter {
  final Rect frameRect;
  _OverlayPainter({required this.frameRect});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = Colors.black.withOpacity(0.7);
    final path = Path()
      ..addRect(Rect.fromLTWH(0, 0, size.width, size.height))
      ..addRRect(RRect.fromRectAndRadius(frameRect, const Radius.circular(16)))
      ..fillType = PathFillType.evenOdd;
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter old) => false;
}

// ── Corner bracket painter ───────────────────────────

class _CornerBracketPainter extends CustomPainter {
  final Color color;
  final double cornerLength;
  final double strokeWidth;
  final double radius;

  _CornerBracketPainter({
    required this.color,
    this.cornerLength = 24,
    this.strokeWidth = 3,
    this.radius = 12,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = strokeWidth
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    // Top-left
    canvas.drawPath(
      Path()
        ..moveTo(0, cornerLength)
        ..lineTo(0, radius)
        ..arcToPoint(Offset(radius, 0),
            radius: Radius.circular(radius))
        ..lineTo(cornerLength, 0),
      paint,
    );
    // Top-right
    canvas.drawPath(
      Path()
        ..moveTo(size.width - cornerLength, 0)
        ..lineTo(size.width - radius, 0)
        ..arcToPoint(Offset(size.width, radius),
            radius: Radius.circular(radius))
        ..lineTo(size.width, cornerLength),
      paint,
    );
    // Bottom-left
    canvas.drawPath(
      Path()
        ..moveTo(0, size.height - cornerLength)
        ..lineTo(0, size.height - radius)
        ..arcToPoint(Offset(radius, size.height),
            radius: Radius.circular(radius))
        ..lineTo(cornerLength, size.height),
      paint,
    );
    // Bottom-right
    canvas.drawPath(
      Path()
        ..moveTo(size.width - cornerLength, size.height)
        ..lineTo(size.width - radius, size.height)
        ..arcToPoint(Offset(size.width, size.height - radius),
            radius: Radius.circular(radius))
        ..lineTo(size.width, size.height - cornerLength),
      paint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter old) => false;
}
