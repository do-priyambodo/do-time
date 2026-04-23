import 'package:flutter/material.dart';
import 'dart:async';

class StopwatchWidget extends StatefulWidget {
  const StopwatchWidget({super.key});

  @override
  State<StopwatchWidget> createState() => _StopwatchWidgetState();
}

class _StopwatchWidgetState extends State<StopwatchWidget> {
  int _elapsedMs = 0;
  bool _isRunning = false;
  Timer? _timer;

  void _startStopwatch() {
    setState(() {
      _isRunning = true;
    });
    _timer = Timer.periodic(const Duration(milliseconds: 10), (timer) {
      setState(() {
        _elapsedMs += 10;
      });
    });
  }

  void _pauseStopwatch() {
    _timer?.cancel();
    setState(() {
      _isRunning = false;
    });
  }

  void _resetStopwatch() {
    _timer?.cancel();
    setState(() {
      _elapsedMs = 0;
      _isRunning = false;
    });
  }

  String _formatTime(int ms) {
    final minutesStr = (ms ~/ 60000).toString().padLeft(2, '0');
    final secondsStr = ((ms % 60000) ~/ 1000).toString().padLeft(2, '0');
    final centisecondsStr = ((ms % 1000) ~/ 10).toString().padLeft(2, '0');
    return '$minutesStr:$secondsStr.$centisecondsStr';
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
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
          const Text(
            'Stopwatch',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1D1D1F),
            ),
          ),
          const SizedBox(height: 24),

          Text(
            _formatTime(_elapsedMs),
            style: const TextStyle(
              fontSize: 48,
              fontWeight: FontWeight.bold,
              fontFamily: 'monospace',
              color: Color(0xFF1D1D1F),
            ),
          ),
          const SizedBox(height: 24),

          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              IconButton(
                onPressed: _resetStopwatch,
                icon: const Icon(Icons.refresh),
              ),
              const SizedBox(width: 16),
              ElevatedButton(
                onPressed: _isRunning ? _pauseStopwatch : _startStopwatch,
                child: Icon(_isRunning ? Icons.pause : Icons.play_arrow),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
