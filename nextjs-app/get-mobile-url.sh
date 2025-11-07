#!/bin/bash

echo "🔍 Obteniendo información de red..."
echo ""

# Obtener IP local
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    IP=$(hostname -I | awk '{print $1}')
else
    # Windows (Git Bash)
    IP=$(ipconfig | grep "IPv4" | head -n 1 | awk '{print $NF}')
fi

echo "📱 INFORMACIÓN PARA ACCEDER DESDE TU CELULAR"
echo "=============================================="
echo ""
echo "1️⃣  Tu IP local es: $IP"
echo ""
echo "2️⃣  URL para tu celular:"
echo "    👉 http://$IP:3000"
echo ""
echo "3️⃣  Asegúrate de que:"
echo "    ✅ Tu celular y computadora estén en la MISMA red WiFi"
echo "    ✅ El servidor esté corriendo (npm run dev:mobile)"
echo "    ✅ El firewall no bloquee el puerto 3000"
echo ""
echo "4️⃣  Escanea este código QR (si tienes qrencode instalado):"
echo ""

# Intentar generar QR si está disponible
if command -v qrencode &> /dev/null; then
    qrencode -t ANSI "http://$IP:3000"
else
    echo "    (instala 'qrencode' para ver un código QR aquí)"
fi

echo ""
echo "🚀 Para iniciar el servidor en modo móvil:"
echo "    npm run dev:mobile"
echo ""
