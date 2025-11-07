#!/bin/bash

echo "🌐 Configurando túnel para acceso móvil..."
echo ""
echo "⚠️  NOTA: Este ambiente está en un contenedor/nube."
echo "    La IP local (21.0.0.132) no es accesible desde tu celular."
echo ""
echo "📱 SOLUCIÓN: Usar Cloudflare Tunnel para exponer la app"
echo "=============================================="
echo ""

# Verificar si cloudflared está instalado
if ! command -v cloudflared &> /dev/null; then
    echo "📦 Instalando cloudflared..."

    # Detectar arquitectura
    ARCH=$(uname -m)
    if [[ "$ARCH" == "x86_64" ]]; then
        ARCH="amd64"
    elif [[ "$ARCH" == "aarch64" ]]; then
        ARCH="arm64"
    fi

    # Descargar cloudflared
    wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-${ARCH} -O /tmp/cloudflared
    chmod +x /tmp/cloudflared
    sudo mv /tmp/cloudflared /usr/local/bin/cloudflared 2>/dev/null || mv /tmp/cloudflared ./cloudflared

    if [ -f ./cloudflared ]; then
        echo "✅ cloudflared instalado localmente en $(pwd)/cloudflared"
        CLOUDFLARED_CMD="./cloudflared"
    else
        echo "✅ cloudflared instalado en /usr/local/bin/cloudflared"
        CLOUDFLARED_CMD="cloudflared"
    fi
else
    echo "✅ cloudflared ya está instalado"
    CLOUDFLARED_CMD="cloudflared"
fi

echo ""
echo "🚀 Iniciando túnel..."
echo "    Esto creará una URL pública temporal que puedes usar en tu celular"
echo ""
echo "⚠️  IMPORTANTE: La URL será válida mientras este script esté corriendo"
echo ""

# Iniciar túnel
$CLOUDFLARED_CMD tunnel --url http://localhost:3000
