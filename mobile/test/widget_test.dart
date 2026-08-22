import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:myadmin_mobile/main.dart';
import 'package:myadmin_mobile/screens/calc_percentage_screen.dart';

void main() {
  testWidgets('Home shows the 10-button menu grid', (WidgetTester tester) async {
    await tester.pumpWidget(const MyAdminApp());

    expect(find.text('Calc Percentage'), findsOneWidget);
    await tester.scrollUntilVisible(find.text('Calc List'), 200);
    expect(find.text('Calc List'), findsOneWidget);
  });

  testWidgets('Tapping Calc Percentage opens the calculator', (WidgetTester tester) async {
    await tester.pumpWidget(const MyAdminApp());

    await tester.tap(find.text('Calc Percentage'));
    await tester.pumpAndSettle();

    expect(find.text('Calc Porcentaje'), findsOneWidget);
  });

  testWidgets('Entering initial + pct derives change and final (increase)', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const MaterialApp(home: CalcPercentageScreen()));

    final fields = find.byType(TextField);
    await tester.enterText(fields.at(0), '100'); // initial
    await tester.pump();
    await tester.enterText(fields.at(1), '10'); // pct
    await tester.pump();

    TextField fieldAt(int i) => tester.widget<TextField>(fields.at(i));
    expect(fieldAt(2).controller!.text, '10'); // change
    expect(fieldAt(3).controller!.text, '110'); // final
  });
}
