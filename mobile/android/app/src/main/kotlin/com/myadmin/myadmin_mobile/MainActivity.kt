package com.myadmin.myadmin_mobile

import android.content.Context
import android.hardware.ConsumerIrManager
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

private const val CHANNEL = "tv_ir"

class MainActivity : FlutterActivity() {
    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        val ir = getSystemService(Context.CONSUMER_IR_SERVICE) as? ConsumerIrManager

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
            when (call.method) {
                "hasIrEmitter" -> result.success(ir?.hasIrEmitter() ?: false)
                "transmit" -> {
                    val code = (call.argument<Number>("code") ?: 0).toLong()
                    val frequency = call.argument<Int>("frequency") ?: 38000
                    if (ir == null || !ir.hasIrEmitter()) {
                        result.error("NO_IR", "Este dispositivo no tiene transmisor infrarrojo", null)
                    } else {
                        ir.transmit(frequency, necPattern(code))
                        result.success(null)
                    }
                }
                else -> result.notImplemented()
            }
        }
    }

    // ponytail: assumes MSB-first NEC bit order (matches the widely-published hex
    // codes for LG remotes); if a button doesn't respond, try reversing bit order.
    private fun necPattern(code: Long): IntArray {
        val pattern = mutableListOf(9000, 4500)
        for (i in 31 downTo 0) {
            pattern.add(560)
            pattern.add(if ((code shr i) and 1L == 1L) 1690 else 560)
        }
        pattern.add(560)
        return pattern.toIntArray()
    }
}
