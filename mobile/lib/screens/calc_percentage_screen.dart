import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';

const _fields = ['initial', 'pct', 'change', 'final'];

const _labels = {
  'initial': 'Valor inicial',
  'pct': 'Porcentaje',
  'change': 'Cambio',
  'final': 'Valor final',
};

const _suffix = {'pct': '%'};

const _storageKey = 'calc_percentage';

double? _parse(String? v) {
  if (v == null || v.isEmpty) return null;
  final n = double.tryParse(v.replaceAll(',', '.'));
  return (n != null && n.isFinite) ? n : null;
}

double _round(double n, [int decimals = 6]) {
  final f = _pow10(decimals);
  return (n * f).round() / f;
}

double _pow10(int decimals) {
  var f = 1.0;
  for (var i = 0; i < decimals; i++) {
    f *= 10;
  }
  return f;
}

// Canonical value fed back into the text field — must round-trip through parse().
String _fmtValue(double? n) {
  if (n == null || !n.isFinite) return '';
  final r = _round(n);
  if (r == r.roundToDouble() && r.abs() < 1e15) return r.toInt().toString();
  var s = r.toString();
  if (s.contains('.')) {
    s = s.replaceFirst(RegExp(r'0+$'), '').replaceFirst(RegExp(r'\.$'), '');
  }
  return s;
}

final _integerFormat = NumberFormat('#,##0.##########', 'es');
final _decimalFormat = NumberFormat('#,##0.00####', 'es');

// Human-readable, locale-formatted — only for display text, never fed back into an input.
String _fmtDisplay(double? n) {
  if (n == null || !n.isFinite) return '';
  final r = _round(n, 10);
  return r == r.roundToDouble() ? _integerFormat.format(r) : _decimalFormat.format(n);
}

/// Given the 2 source fields + current values, compute the other 2.
/// sign: +1 = increase, -1 = decrease.
Map<String, String> _computeDerived(
  String srcA,
  String srcB,
  Map<String, String> vals,
  int sign,
) {
  final i = _parse(vals['initial']);
  final p = _parse(vals['pct']);
  final c = _parse(vals['change']);
  final f = _parse(vals['final']);

  final pair = ([srcA, srcB]..sort()).join('+');
  final out = <String, String>{};

  switch (pair) {
    case 'initial+pct':
      if (i != null && p != null) {
        final ch = i * p / 100;
        out['change'] = _fmtValue(ch);
        out['final'] = _fmtValue(i + sign * ch);
      }
      break;

    case 'change+initial':
      if (i != null && c != null) {
        out['final'] = _fmtValue(i + sign * c);
        out['pct'] = i != 0 ? _fmtValue(c / i * 100) : '';
      }
      break;

    case 'final+initial':
      if (i != null && f != null) {
        final ch = sign * (f - i);
        out['change'] = _fmtValue(ch);
        out['pct'] = i != 0 ? _fmtValue(ch / i * 100) : '';
      }
      break;

    case 'change+pct':
      if (p != null && c != null && p != 0) {
        final ini = c / p * 100;
        out['initial'] = _fmtValue(ini);
        out['final'] = _fmtValue(ini + sign * c);
      }
      break;

    case 'final+pct':
      final denom = 1 + sign * (p ?? 0) / 100;
      if (p != null && f != null && denom != 0) {
        final ini = f / denom;
        final ch = sign > 0 ? f - ini : ini - f;
        out['initial'] = _fmtValue(ini);
        out['change'] = _fmtValue(ch);
      }
      break;

    case 'change+final':
      if (c != null && f != null) {
        final ini = sign > 0 ? f - c : f + c;
        out['initial'] = _fmtValue(ini);
        out['pct'] = ini != 0 ? _fmtValue(c / ini * 100) : '';
      }
      break;
  }

  return out;
}

class CalcPercentageScreen extends StatefulWidget {
  const CalcPercentageScreen({super.key});

  @override
  State<CalcPercentageScreen> createState() => _CalcPercentageScreenState();
}

class _CalcPercentageScreenState extends State<CalcPercentageScreen> {
  final _controllers = {for (final f in _fields) f: TextEditingController()};
  final _refController = TextEditingController();
  String _mode = 'increase';
  List<String> _sources = ['initial', 'pct'];
  SharedPreferences? _prefs;

  int get _sign => _mode == 'increase' ? 1 : -1;

  Map<String, String> get _vals => {for (final f in _fields) f: _controllers[f]!.text};

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    _prefs = prefs;
    final raw = prefs.getString(_storageKey);
    if (raw == null) return;
    final stored = jsonDecode(raw) as Map<String, dynamic>;
    setState(() {
      _mode = stored['mode'] as String? ?? 'increase';
      _sources = (stored['sources'] as List?)?.cast<String>() ?? ['initial', 'pct'];
      final vals = (stored['vals'] as Map?)?.cast<String, dynamic>() ?? {};
      for (final f in _fields) {
        _controllers[f]!.text = vals[f] as String? ?? '';
      }
      _refController.text = stored['refVal'] as String? ?? '';
    });
  }

  void _persist() {
    _prefs?.setString(
      _storageKey,
      jsonEncode({
        'mode': _mode,
        'vals': _vals,
        'sources': _sources,
        'refVal': _refController.text,
      }),
    );
  }

  void _syncControllers(Map<String, String> newVals, {String? skip}) {
    for (final f in _fields) {
      if (f == skip) continue;
      final ctrl = _controllers[f]!;
      final v = newVals[f] ?? '';
      if (ctrl.text != v) ctrl.text = v;
    }
  }

  void _handleChange(String field, String raw) {
    final nextSources = [field, ..._sources.where((f) => f != field)].take(2).toList();
    final updated = {..._vals, field: raw};
    final srcA = nextSources[0];
    final srcB = nextSources.length > 1 ? nextSources[1] : null;
    final derived = srcB != null ? _computeDerived(srcA, srcB, updated, _sign) : <String, String>{};

    final result = {...updated};
    for (final k in _fields) {
      if (k != srcA && k != srcB) result[k] = derived[k] ?? '';
    }

    setState(() {
      _sources = nextSources;
      _syncControllers(result, skip: field);
    });
    _persist();
  }

  void _handleModeChange(String newMode) {
    final newSign = newMode == 'increase' ? 1 : -1;
    final srcA = _sources[0];
    final srcB = _sources.length > 1 ? _sources[1] : null;
    final derived = srcB != null ? _computeDerived(srcA, srcB, _vals, newSign) : <String, String>{};

    final result = {..._vals};
    for (final k in _fields) {
      if (k != srcA && k != srcB) result[k] = derived[k] ?? '';
    }

    setState(() {
      _mode = newMode;
      _syncControllers(result);
    });
    _persist();
  }

  void _handleClear() {
    setState(() {
      for (final f in _fields) {
        _controllers[f]!.text = '';
      }
      _refController.text = '';
      _sources = ['initial', 'pct'];
    });
    _persist();
  }

  @override
  void dispose() {
    for (final c in _controllers.values) {
      c.dispose();
    }
    _refController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final vals = _vals;
    final refNum = _parse(_refController.text);
    final pctNum = _parse(vals['pct']);
    final refResult =
        refNum != null && pctNum != null ? refNum + _sign * (refNum * pctNum) / 100 : null;
    final refChange = refNum != null && pctNum != null ? refNum * pctNum / 100 : null;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Calc Porcentaje'),
        actions: [
          TextButton(
            onPressed: _handleClear,
            child: const Text('Limpiar', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              SegmentedButton<String>(
                segments: const [
                  ButtonSegment(value: 'increase', label: Text('▲ Incremento')),
                  ButtonSegment(value: 'decrease', label: Text('▼ Descuento')),
                ],
                selected: {_mode},
                onSelectionChanged: (s) => _handleModeChange(s.first),
              ),
              const SizedBox(height: 16),
              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 1.6,
                children: _fields.map((field) {
                  final isSource = _sources.contains(field);
                  final computed = !isSource && vals[field]!.isNotEmpty;
                  return Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: isSource ? Theme.of(context).colorScheme.primary : Colors.grey.shade300,
                        width: isSource ? 2 : 1,
                      ),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(_labels[field]!, style: Theme.of(context).textTheme.labelMedium),
                        TextField(
                          controller: _controllers[field],
                          keyboardType: const TextInputType.numberWithOptions(
                            decimal: true,
                            signed: true,
                          ),
                          decoration: InputDecoration(
                            isDense: true,
                            border: InputBorder.none,
                            hintText: '0',
                            suffixText: _suffix[field],
                          ),
                          onChanged: (v) => _handleChange(field, v),
                        ),
                        if (computed)
                          Text(
                            'calculado',
                            style: Theme.of(context)
                                .textTheme
                                .labelSmall
                                ?.copyWith(color: Colors.grey),
                          ),
                      ],
                    ),
                  );
                }).toList(),
              ),
              if (vals['initial']!.isNotEmpty && vals['pct']!.isNotEmpty) ...[
                const SizedBox(height: 16),
                Text(
                  '${_mode == 'increase' ? '▲' : '▼'} '
                  '${_fmtDisplay(_parse(vals['initial']))} '
                  '${_mode == 'increase' ? '+' : '−'} '
                  '${_fmtDisplay(_parse(vals['pct']))}% = ${_fmtDisplay(_parse(vals['final']))}',
                  style: Theme.of(context).textTheme.titleMedium,
                  textAlign: TextAlign.center,
                ),
              ],
              const SizedBox(height: 24),
              Text('Valor de referencia (opcional)', style: Theme.of(context).textTheme.labelMedium),
              TextField(
                controller: _refController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true, signed: true),
                decoration: const InputDecoration(hintText: '0', border: OutlineInputBorder()),
                onChanged: (_) {
                  setState(() {});
                  _persist();
                },
              ),
              if (refResult != null) ...[
                const SizedBox(height: 8),
                Text(
                  '${_mode == 'increase' ? '▲' : '▼'} '
                  '${_mode == 'increase' ? '+' : '−'}${_fmtDisplay(refChange)}  →  '
                  '${_fmtDisplay(refResult)}',
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
