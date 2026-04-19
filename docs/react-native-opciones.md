# Opciones para Mobile — React Native vs Alternativas

Este proyecto es una React 18 SPA (Vite). React Native no puede integrarse directamente ya que son ecosistemas separados con componentes distintos (`<View>` vs `<div>`, etc.).

## Opciones

| Opción | Qué es | Esfuerzo |
|---|---|---|
| **Capacitor** | Envuelve esta web app en una shell nativa (iOS/Android) | Bajo — funciona sobre el código existente |
| **PWA mejorada** | Ya hay service worker — mejorar `manifest.json` para instalar como app | Mínimo |
| **React Native** (nuevo proyecto) | App nativa de cero, compartiendo lógica/servicios con este repo | Alto |

## Ruta recomendada: Capacitor

Funciona sobre el código React existente sin reescritura:

```bash
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add android
npx cap add ios
npm run build
npx cap sync
```

## PWA (ya disponible)

El proyecto ya tiene `useRegisterSW` (Vite PWA plugin). Para mejorar la experiencia móvil basta con refinar el `manifest.json` (iconos, `display: standalone`, colores).
