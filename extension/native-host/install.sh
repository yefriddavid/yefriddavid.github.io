#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HOST_BIN="$SCRIPT_DIR/localrunner-host"
MANIFEST_DIR="$HOME/.config/google-chrome/NativeMessagingHosts"
MANIFEST_FILE="$MANIFEST_DIR/com.myadmin.localrunner.json"

EXT_ID="${1:-}"

echo "Building native host..."
cd "$SCRIPT_DIR"
go build -o "$HOST_BIN" host.go
chmod +x "$HOST_BIN"

mkdir -p "$MANIFEST_DIR"

cat > "$MANIFEST_FILE" << EOF
{
  "name": "com.myadmin.localrunner",
  "description": "MyAdmin Local Binary Runner",
  "path": "$HOST_BIN",
  "type": "stdio",
  "allowed_origins": ["chrome-extension://${EXT_ID}/"]
}
EOF

echo ""
echo "Host built:  $HOST_BIN"
echo "Manifest:    $MANIFEST_FILE"

if [ -z "$EXT_ID" ]; then
  echo ""
  echo "⚠️  No se proporcionó el ID de la extensión."
  echo "   1. Carga la extensión en chrome://extensions → 'Cargar sin empaquetar' → carpeta extension/"
  echo "   2. Copia el ID que aparece bajo el nombre de la extensión"
  echo "   3. Ejecuta de nuevo: ./install.sh <EXTENSION_ID>"
else
  echo ""
  echo "✓ Listo. Recarga la extensión en chrome://extensions si ya estaba cargada."
fi
