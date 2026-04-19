# Herramientas para evaluar usabilidad de pantallas

## Pruebas automatizadas de accesibilidad

- **axe DevTools** (extensión Chrome) — detecta problemas de contraste, etiquetas faltantes, ARIA mal usado
- **Lighthouse** (integrado en Chrome DevTools) — puntuación de accesibilidad + performance + UX en móvil

## Análisis visual / heatmaps

- **Hotjar** o **Microsoft Clarity** (gratuito) — graba sesiones reales, muestra dónde hacen clic los usuarios y dónde se frustran

## Testing con usuarios reales

- **Maze** o **UserTesting** — envías un prototipo o URL y usuarios reales completan tareas; mide tiempo y errores

## Desde el código

- **Playwright** con el skill `webapp-testing` — navega la pantalla, hace capturas y verifica flujos como lo haría un usuario

## Recomendación para este proyecto

Empezar con **Lighthouse** (Chrome F12 → Lighthouse, sin instalar nada) y con **webapp-testing** para recorrer pantallas y reportar problemas concretos.
