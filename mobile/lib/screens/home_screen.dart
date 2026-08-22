import 'package:flutter/material.dart';

import 'calc_percentage_screen.dart';
import 'tv_remote_screen.dart';

class _MenuItem {
  final String label;
  final WidgetBuilder? builder;

  const _MenuItem(this.label, [this.builder]);
}

const _menuItems = <_MenuItem>[
  _MenuItem('Calc Percentage', _buildCalcPercentage),
  _MenuItem('Loan Calculator'),
  _MenuItem('Calc Sheet'),
  _MenuItem('Aumento / Disminución'),
  _MenuItem('Crypto Purchases'),
  _MenuItem('Crypto Withdrawals'),
  _MenuItem('Ahorros'),
  _MenuItem('Salary Distribution'),
  _MenuItem('Btc Histograma'),
  _MenuItem('Calc List'),
  _MenuItem('Control TV', _buildTvRemote),
];

Widget _buildCalcPercentage(BuildContext context) => const CalcPercentageScreen();
Widget _buildTvRemote(BuildContext context) => const TvRemoteScreen();

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  void _open(BuildContext context, _MenuItem item) {
    if (item.builder == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${item.label}: próximamente')),
      );
      return;
    }
    Navigator.of(context).push(MaterialPageRoute(builder: item.builder!));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Admin')),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: GridView.builder(
                padding: const EdgeInsets.all(8),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  mainAxisSpacing: 8,
                  crossAxisSpacing: 8,
                  childAspectRatio: 1.6,
                ),
                itemCount: _menuItems.length,
                itemBuilder: (context, i) {
                  final item = _menuItems[i];
                  return OutlinedButton(
                    onPressed: () => _open(context, item),
                    child: Text(item.label, textAlign: TextAlign.center),
                  );
                },
              ),
            ),
            const SizedBox(height: 48),
          ],
        ),
      ),
    );
  }
}
