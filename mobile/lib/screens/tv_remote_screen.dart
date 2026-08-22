import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

const _irChannel = MethodChannel('tv_ir');
const _carrierFrequency = 38000;

// Standard LG NEC IR codes (address 0x20). Adjust if your TV model doesn't respond.
const _lgVolumeUp = 0x20DF40BF;
const _lgVolumeDown = 0x20DFC03F;
const _lgMute = 0x20DF906F;
const _lgPower = 0x20DF10EF;
const _lgUp = 0x20DF02FD;
const _lgDown = 0x20DF827D;
const _lgLeft = 0x20DFE01F;
const _lgRight = 0x20DF609F;
const _lgEnter = 0x20DF22DD;

class TvRemoteScreen extends StatefulWidget {
  const TvRemoteScreen({super.key});

  @override
  State<TvRemoteScreen> createState() => _TvRemoteScreenState();
}

class _TvRemoteScreenState extends State<TvRemoteScreen> {
  String? _error;

  Future<void> _send(int code) async {
    setState(() => _error = null);
    try {
      await _irChannel.invokeMethod('transmit', {'code': code, 'frequency': _carrierFrequency});
    } on PlatformException catch (e) {
      setState(() => _error = e.message ?? 'No se pudo enviar la señal IR');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Control TV')),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (_error != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: Text(_error!, style: const TextStyle(color: Colors.red)),
              ),
            IconButton.filledTonal(
              iconSize: 40,
              onPressed: () => _send(_lgPower),
              icon: const Icon(Icons.power_settings_new),
            ),
            const SizedBox(height: 32),
            IconButton.filled(
              iconSize: 48,
              onPressed: () => _send(_lgVolumeUp),
              icon: const Icon(Icons.add),
            ),
            const SizedBox(height: 24),
            IconButton.filled(
              iconSize: 48,
              onPressed: () => _send(_lgVolumeDown),
              icon: const Icon(Icons.remove),
            ),
            const SizedBox(height: 24),
            IconButton.filledTonal(
              iconSize: 40,
              onPressed: () => _send(_lgMute),
              icon: const Icon(Icons.volume_off),
            ),
            const SizedBox(height: 32),
            IconButton.filledTonal(
              iconSize: 40,
              onPressed: () => _send(_lgUp),
              icon: const Icon(Icons.keyboard_arrow_up),
            ),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                IconButton.filledTonal(
                  iconSize: 40,
                  onPressed: () => _send(_lgLeft),
                  icon: const Icon(Icons.keyboard_arrow_left),
                ),
                const SizedBox(width: 8),
                IconButton.filled(
                  iconSize: 32,
                  onPressed: () => _send(_lgEnter),
                  icon: const Icon(Icons.check),
                ),
                const SizedBox(width: 8),
                IconButton.filledTonal(
                  iconSize: 40,
                  onPressed: () => _send(_lgRight),
                  icon: const Icon(Icons.keyboard_arrow_right),
                ),
              ],
            ),
            IconButton.filledTonal(
              iconSize: 40,
              onPressed: () => _send(_lgDown),
              icon: const Icon(Icons.keyboard_arrow_down),
            ),
          ],
        ),
      ),
    );
  }
}
