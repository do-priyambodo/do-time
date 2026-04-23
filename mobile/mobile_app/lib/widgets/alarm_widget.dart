import 'package:flutter/material.dart';

class AlarmWidget extends StatefulWidget {
  const AlarmWidget({super.key});

  @override
  State<AlarmWidget> createState() => _AlarmWidgetState();
}

class _AlarmWidgetState extends State<AlarmWidget> {
  final List<Map<String, dynamic>> _alarms = [
    {'time': '08:00', 'label': 'Good Morning!', 'enabled': true},
    {'time': '22:00', 'label': 'Good Night!', 'enabled': true},
  ];

  void _toggleAlarm(int index) {
    setState(() {
      _alarms[index]['enabled'] = !_alarms[index]['enabled'];
    });
  }

  void _deleteAlarm(int index) {
    setState(() {
      _alarms.removeAt(index);
    });
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Alarms',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1D1D1F),
            ),
          ),
          const SizedBox(height: 16),

          // Alarms List
          Column(
            children: _alarms.asMap().entries.map((entry) {
              final index = entry.key;
              final alarm = entry.value;

              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.grey.shade100),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          alarm['time'],
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'monospace',
                            color: alarm['enabled'] ? const Color(0xFF1D1D1F) : Colors.grey,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          alarm['label'],
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey.shade600,
                          ),
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        Switch(
                          value: alarm['enabled'],
                          onChanged: (_) => _toggleAlarm(index),
                          activeColor: Colors.green,
                        ),
                        IconButton(
                          onPressed: () => _deleteAlarm(index),
                          icon: const Icon(Icons.remove_circle_outline, color: Colors.redAccent),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}
