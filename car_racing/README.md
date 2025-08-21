# Brick Game Retro Car Racing (Expo / React Native)

Un mini-juego estilo "ladrillitos" (brick) de carreras. Controla el auto entre carriles,
evita los obstáculos, y rompe tu récord. Funciona con Expo (managed workflow).

## Requisitos
- Node.js LTS
- Expo (npx expo --version)
- Git (opcional)

## Instalación y ejecución
```bash
npm install
npm run start
```
Luego, escanea el QR con la app de Expo Go o ejecuta en web:

```bash
npm run web
```

## Controles
- Tocar lado izquierdo/derecho de la pantalla para mover el auto.
- Botón Pausa/Reanudar arriba a la derecha.
- En web también puedes usar las flechas ◀ ▶ del teclado.

## Notas técnicas
- Renderizado con `react-native-svg` para dibujar el "grid" monocromático.
- Lógica basada en un "tick" fijo (100ms aprox.) que acelera con el puntaje.
- Diseño inspirado en consolas retro: paleta verde/negra, píxeles grandes.
