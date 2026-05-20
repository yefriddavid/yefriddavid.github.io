1. Audit Log de operaciones (crítico)
  El error monitor captura crashes, pero nadie sabe quién borró un pago, quién cambió un monto, o quién eliminó un conductor. Un audit log registra { user, action, entity, before, after,
  timestamp } en cada write. En una app financiera esto es casi obligatorio.

  2. Monitor de rendimiento de Firestore
  Cada getDocs sin índice hace un full collection scan — costoso y lento. No tienes visibilidad de cuántas lecturas/escrituras hace la app, qué queries son lentas, o si algún módulo está
  disparando lecturas innecesarias. Un middleware que mida tiempos de respuesta por servicio te avisaría antes de que la factura de Firebase explote.

  3. Estado de conectividad + datos obsoletos
  Si el usuario pierde conexión y hace cambios, no sabe si se guardaron. Firebase tiene soporte offline pero la app no expone ese estado. Un indicador de "sin conexión — los cambios se
  sincronizarán cuando vuelvas" evita confusión y pérdida de datos.

  4. Health check / status en la pantalla de login
  Si Firebase está caído o el Apps Script no responde, el usuario solo ve un spinner eterno o un error genérico. Una verificación de conectividad al iniciar sesión daría un mensaje claro:
  "Firebase no disponible" o "Servicio de pagos en mantenimiento".

  ---
  De los cuatro, el Audit Log es el que yo haría primero — en una app que maneja dinero, saber quién hizo qué es más valioso incluso que saber qué falló. ¿Quieres que lo construyamos?


