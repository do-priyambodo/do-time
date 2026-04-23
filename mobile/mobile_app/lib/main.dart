import 'package:flutter/material.dart';
import 'dart:async';
import 'dart:math';

import 'widgets/alarm_widget.dart';
import 'widgets/pomodoro_widget.dart';
import 'widgets/timer_widget.dart';
import 'widgets/stopwatch_widget.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'do-time',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.blue,
          brightness: Brightness.light,
        ),
        fontFamily: 'monospace',
      ),
      home: const FocusWorkspace(),
    );
  }
}

class FocusWorkspace extends StatefulWidget {
  const FocusWorkspace({super.key});

  @override
  State<FocusWorkspace> createState() => _FocusWorkspaceState();
}

class _FocusWorkspaceState extends State<FocusWorkspace> {
  late DateTime _currentTime;
  late Timer _timer;
  int _selectedIndex = 0;

  @override
  void initState() {
    super.initState();
    _currentTime = DateTime.now();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        _currentTime = DateTime.now();
      });
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  String _formatTwoDigits(int number) {
    return number.toString().padLeft(2, '0');
  }

  @override
  Widget build(BuildContext context) {
    final hours = _formatTwoDigits(_currentTime.hour);
    final minutes = _formatTwoDigits(_currentTime.minute);
    final seconds = _formatTwoDigits(_currentTime.second);

    final List<Widget> pages = [
      // Clock Page
      Container(
        width: double.infinity,
        constraints: const BoxConstraints(maxWidth: 400),
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.8),
          borderRadius: BorderRadius.circular(32),
          border: Border.all(color: Colors.grey.shade200),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              spreadRadius: 2,
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              '$hours:$minutes:$seconds',
              style: const TextStyle(
                fontSize: 56,
                fontWeight: FontWeight.bold,
                letterSpacing: -2,
                fontFamily: 'monospace',
                color: Color(0xFF1D1D1F),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Wednesday, April 23, 2026',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.5,
                color: Colors.grey.shade600,
              ),
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: 180,
              height: 180,
              child: CustomPaint(
                painter: AnalogClockPainter(_currentTime),
              ),
            ),
          ],
        ),
      ),

      // Alarm Page
      const AlarmWidget(),

      // Pomodoro Page
      const PomodoroWidget(),

      // Timer Page
      const TimerWidget(),

      // Stopwatch Page
      const StopwatchWidget(),
    ];

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFFFFEDD5), // Orange-100
              Color(0xFFFCE7F3), // Pink-100
              Color(0xFFBFDBFE), // Blue-200
            ],
          ),
        ),
        child: SafeArea(
          child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 40.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // App Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const SizedBox(width: 48), // spacer to center title
                    const Text(
                      'do-time',
                      style: TextStyle(
                        fontSize: 48,
                        fontWeight: FontWeight.bold,
                        letterSpacing: -1.5,
                        color: Color(0xFF1D1D1F),
                      ),
                    ),
                    IconButton(
                      onPressed: () {
                        showDialog(
                          context: context,
                          builder: (context) => AlertDialog(
                            backgroundColor: Colors.white.withOpacity(0.9),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(24),
                            ),
                            title: const Text(
                              'About do-time',
                              textAlign: TextAlign.center,
                              style: TextStyle(fontWeight: FontWeight.bold),
                            ),
                            content: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Text(
                                  '⏳ Engineered for Focus.',
                                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 12),
                                const Text(
                                  'In a world full of digital noise, do-time aims to be your sanctuary of focus. We believe that productivity tools should be as beautiful as they are functional.',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(fontSize: 14, color: Colors.grey),
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  'Designed & Crafted by Doddi Priyambodo\nwith the support of Chisiella Alzena Athaya',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(fontSize: 12, color: Colors.grey.shade700, fontStyle: FontStyle.italic),
                                ),
                              ],
                            ),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.of(context).pop(),
                                child: const Text('Close'),
                              ),
                            ],
                          ),
                        );
                      },
                      icon: const Icon(Icons.info_outline, color: Colors.grey),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                const Text(
                  'Engineered for focus.',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: Colors.grey,
                  ),
                ),
                const SizedBox(height: 40),

                // Current Selected Page
                pages[_selectedIndex],
              ],
            ),
            ),
          ),
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        type: BottomNavigationBarType.fixed,
        backgroundColor: Colors.white.withOpacity(0.9),
        selectedItemColor: Colors.blue.shade600,
        unselectedItemColor: Colors.grey,
        showSelectedLabels: true,
        showUnselectedLabels: true,
        selectedFontSize: 11,
        unselectedFontSize: 11,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.access_time), label: 'Clock'),
          BottomNavigationBarItem(icon: Icon(Icons.alarm), label: 'Alarm'),
          BottomNavigationBarItem(icon: Icon(Icons.hourglass_empty), label: 'Pomodoro'),
          BottomNavigationBarItem(icon: Icon(Icons.timer), label: 'Timer'),
          BottomNavigationBarItem(icon: Icon(Icons.speed), label: 'Stopwatch'),
        ],
      ),
    );
  }
}

class AnalogClockPainter extends CustomPainter {
  final DateTime dateTime;

  AnalogClockPainter(this.dateTime);

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;

    // 1. Clock Face Ring
    final facePaint = Paint()
      ..color = const Color(0xFFF5F5F7)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(center, radius, facePaint);

    final ringPaint = Paint()
      ..color = Colors.grey.shade200
      ..strokeWidth = 4
      ..style = PaintingStyle.stroke;
    canvas.drawCircle(center, radius, ringPaint);

    // 2. Minute/Hour Ticks
    final tickPaint = Paint()
      ..color = Colors.grey.shade400
      ..strokeWidth = 2;
    for (var i = 0; i < 12; i++) {
      final angle = i * 30 * pi / 180;
      final start = Offset(
        center.dx + (radius - 12) * cos(angle),
        center.dy + (radius - 12) * sin(angle),
      );
      final end = Offset(
        center.dx + radius * cos(angle),
        center.dy + radius * sin(angle),
      );
      canvas.drawLine(start, end, tickPaint);
    }

    // 3. Hour Hand
    final hourAngle = (dateTime.hour % 12 + dateTime.minute / 60) * 30 * pi / 180 - pi / 2;
    final hourHandPaint = Paint()
      ..color = const Color(0xFF1D1D1F)
      ..strokeWidth = 6
      ..strokeCap = StrokeCap.round;
    canvas.drawLine(
      center,
      Offset(
        center.dx + (radius * 0.5) * cos(hourAngle),
        center.dy + (radius * 0.5) * sin(hourAngle),
      ),
      hourHandPaint,
    );

    // 4. Minute Hand
    final minAngle = (dateTime.minute + dateTime.second / 60) * 6 * pi / 180 - pi / 2;
    final minHandPaint = Paint()
      ..color = const Color(0xFF1D1D1F)
      ..strokeWidth = 4
      ..strokeCap = StrokeCap.round;
    canvas.drawLine(
      center,
      Offset(
        center.dx + (radius * 0.7) * cos(minAngle),
        center.dy + (radius * 0.7) * sin(minAngle),
      ),
      minHandPaint,
    );

    // 5. Second Hand
    final secAngle = dateTime.second * 6 * pi / 180 - pi / 2;
    final secHandPaint = Paint()
      ..color = Colors.redAccent
      ..strokeWidth = 2
      ..strokeCap = StrokeCap.round;
    canvas.drawLine(
      center,
      Offset(
        center.dx + (radius * 0.8) * cos(secAngle),
        center.dy + (radius * 0.8) * sin(secAngle),
      ),
      secHandPaint,
    );

    // 6. Center dot
    canvas.drawCircle(center, 4, Paint()..color = const Color(0xFF1D1D1F));
  }

  @override
  bool shouldRepaint(covariant AnalogClockPainter oldDelegate) {
    return oldDelegate.dateTime != dateTime;
  }
}
