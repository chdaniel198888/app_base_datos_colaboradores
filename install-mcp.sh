#!/bin/bash

# 🚀 Script de Instalación Automática de MCP Servers para Foodix
# Este script configura todos los servidores MCP necesarios

echo "🔌 Instalador de MCP Servers para Foodix"
echo "========================================"
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Verificar Node.js
echo "1️⃣ Verificando Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js instalado: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js no encontrado. Por favor instala Node.js primero${NC}"
    echo "   Visita: https://nodejs.org/"
    exit 1
fi

# 2. Compilar servidor MCP personalizado
echo ""
echo "2️⃣ Compilando servidor MCP de colaboradores..."
cd /Users/danielchamorrogonzalez/app_base_datos_colaboradores/mcp-server

if [ ! -d "node_modules" ]; then
    echo "   Instalando dependencias..."
    npm install
fi

echo "   Compilando TypeScript..."
npm run build

if [ -f "dist/server.js" ]; then
    echo -e "${GREEN}✅ Servidor compilado correctamente${NC}"
else
    echo -e "${RED}❌ Error al compilar el servidor${NC}"
    exit 1
fi

# 3. Instalar servidores MCP oficiales
echo ""
echo "3️⃣ Instalando servidores MCP oficiales..."
echo "   Esto puede tomar unos minutos..."

SERVERS=(
    "@modelcontextprotocol/server-filesystem"
    "@modelcontextprotocol/server-fetch"
    "@modelcontextprotocol/server-git"
)

for server in "${SERVERS[@]}"; do
    echo -e "${YELLOW}   Instalando $server...${NC}"
    npm list -g $server &> /dev/null
    if [ $? -ne 0 ]; then
        npm install -g $server
        echo -e "${GREEN}   ✅ $server instalado${NC}"
    else
        echo -e "${GREEN}   ✅ $server ya estaba instalado${NC}"
    fi
done

# 4. Crear directorio de Claude si no existe
echo ""
echo "4️⃣ Configurando Claude Desktop..."
CLAUDE_DIR="$HOME/Library/Application Support/Claude"

if [ ! -d "$CLAUDE_DIR" ]; then
    echo "   Creando directorio de configuración..."
    mkdir -p "$CLAUDE_DIR"
fi

# 5. Copiar configuración
CONFIG_FILE="$CLAUDE_DIR/claude_desktop_config.json"
echo "   Instalando configuración de MCP..."

cp /Users/danielchamorrogonzalez/app_base_datos_colaboradores/claude_desktop_config.json "$CONFIG_FILE"

if [ -f "$CONFIG_FILE" ]; then
    echo -e "${GREEN}✅ Configuración instalada en: $CONFIG_FILE${NC}"
else
    echo -e "${RED}❌ Error al copiar la configuración${NC}"
fi

# 6. Verificar Claude Desktop
echo ""
echo "5️⃣ Verificando Claude Desktop..."
if [ -d "/Applications/Claude.app" ]; then
    echo -e "${GREEN}✅ Claude Desktop está instalado${NC}"
    echo ""
    echo "🎉 ¡Instalación completada!"
    echo ""
    echo "📝 Próximos pasos:"
    echo "   1. Reinicia Claude Desktop"
    echo "   2. En una nueva conversación, escribe: /list-tools"
    echo "   3. Deberías ver las herramientas de colaboradores disponibles"
else
    echo -e "${YELLOW}⚠️  Claude Desktop no está instalado${NC}"
    echo ""
    echo "📝 Para completar la instalación:"
    echo "   1. Descarga Claude Desktop desde: https://claude.ai/download"
    echo "   2. Instálalo en tu Mac"
    echo "   3. La configuración ya está lista y se aplicará automáticamente"
fi

echo ""
echo "📚 Servidores MCP configurados:"
echo "   • colaboradores-foodix: Gestión de empleados con Airtable"
echo "   • filesystem: Acceso a archivos locales"
echo "   • fetch: Obtención de contenido web"
echo "   • git: Control de versiones"
echo ""
echo "💡 Comandos útiles en Claude Desktop:"
echo "   • 'Busca información sobre [nombre]'"
echo "   • 'Muéstrame las estadísticas del equipo'"
echo "   • 'Genera el organigrama'"
echo "   • 'Lee el archivo [ruta]'"
echo ""
echo "✨ ¡Disfruta tu nuevo asistente de RRHH potenciado con MCP!"