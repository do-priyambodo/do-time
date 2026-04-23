import 'package:flutter/material.dart';
import 'dart:async';

class PomodoroWidget extends StatefulWidget {
  const PomodoroWidget({super.key});

  @override
  State<PomodoroWidget> createState() => _PomodoroWidgetState();
}

class _PomodoroWidgetState extends State<PomodoroWidget> {
  int _timeLeft = 25 * 60;
  bool _isActive = false;
  Timer? _pomodoroTimer;

  void _startTimer() {
    if (_pomodoroTimer != null) return;
    setState(() {
      _isActive = true;
    });
    _pomodoroTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        if (_timeLeft > 0) {
          _timeLeft--;
        } else {
          _pomodoroTimer?.cancel();
          _isActive = false;
        }
      });
    });
  }

  void _pauseTimer() {
    _pomodoroTimer?.cancel();
    _pomodoroTimer = null;
    setState(() {
      _isActive = false;
    });
  }

  void _resetTimer() {
    _pomodoroTimer?.cancel();
    _pomodoroTimer = null;
    setState(() {
      _timeLeft = 25 * 60;
      _isActive = false;
    });
  }

  String _formatTime(int seconds) {
    final minutesStr = _formatTwoDigits(seconds ~/ 60);
    final secondsStr = _formatTwoDigits(seconds % 60);
    return '$minutesStr:$secondsStr';
  }

  String _formatTwoDigits(int number) {
    return number.toString().padLeft(2, '0');
  }

  @override
  void dispose() {
    _pomodoroTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final progress = (25 * 60 - _timeLeft) / (25 * 60);

    return Container(
      width: double.infinity,
      constraints: const BoxConstraints(maxWidth: 400),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.8),
        borderRadius: BorderRadius.circular(24),
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
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Pomodoro',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1D1D1F),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Text(
                  'Focus',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Colors.red,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          Text(
            _formatTime(_timeLeft),
            style: const TextStyle(
              fontSize: 64,
              fontWeight: FontWeight.bold,
              fontFamily: 'monospace',
              color: Color(0xFF1D1D1F),
            ),
          ),
          const SizedBox(height: 12),

          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 6,
              backgroundColor: Colors.grey.shade100,
              color: Colors.red.shade500,
            ),
          ),
          const SizedBox(height: 24),

          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              IconButton(
                onPressed: _resetTimer,
                icon: const Icon(Icons.refresh, size: 20),
                color: Colors.grey.shade600,
              ),
              const SizedBox(width: 12),
              ElevatedButton(
                onPressed: _isActive ? _pauseTimer : _startTimer,
                style: ElevatedButton.styleFrom(
                  backgroundColor: _isActive ? const Color(0xFF1D1D1F) : Colors.blue.shade600,
                  foregroundColor: Colors.white,
                  shape: const CircleBorder(),
                  padding: const EdgeInsets.all(16),
                ),
                child: Icon(_isActive ? Icons.pause : Icons.play_arrow, size: 28),
              ),
              const SizedBox(width: 12),
              IconButton(
                onPressed: () {},
                icon: const Icon(Icons.skip_next, size: 20),
                color: Colors.grey.shade600,
              ),
            ],
          ),
        ],
      ),
    );
  }
}
