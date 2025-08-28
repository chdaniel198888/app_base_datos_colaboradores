# 🔌 Guía Completa de MCP Servers para Foodix

## ¿Qué es MCP?

Model Context Protocol es un estándar abierto de Anthropic para conectar Claude Desktop con herramientas externas. Permite que Claude acceda directamente a tus datos y sistemas.

## 🏆 Top MCP Servers para Gestión de RRHH

### 1. **Tu Servidor Personalizado** (Ya creado) ⭐⭐⭐⭐⭐
```json
{
  "colaboradores-foodix": {
    "command": "node",
    "args": ["/Users/danielchamorrogonzalez/app_base_datos_colaboradores/mcp-server/dist/server.js"]
  }
}
```
**Funciones**: Búsqueda de colaboradores, estadísticas, organigramas
**Ventaja**: Datos específicos de tu empresa

### 2. **PostgreSQL MCP** ⭐⭐⭐⭐⭐
```bash
npx @modelcontextprotocol/server-postgres postgres://user:pass@localhost/foodix_db
```
**Para qué**: Análisis SQL directo, reportes complejos, cruces de datos
**Ideal para**: "Muéstrame tendencias de contratación", "Análisis de rotación"

### 3. **Google Sheets MCP** ⭐⭐⭐⭐⭐
```json
{
  "gdrive": {
    "command": "npx",
    "args": [
      "@modelcontextprotocol/server-gdrive",
      "--service-account-key-path",
      "/path/to/key.json",
      "--drive-id",
      "your-drive-id"
    ]
  }
}
```
**Para qué**: Acceder a reportes en Sheets, presupuestos, evaluaciones
**Ideal para**: "Revisa el sheet de evaluaciones del Q4"

### 4. **Slack MCP** ⭐⭐⭐⭐
```json
{
  "slack": {
    "command": "npx",
    "args": ["@modelcontextprotocol/server-slack"],
    "env": {
      "SLACK_BOT_TOKEN": "xoxb-your-token",
      "SLACK_TEAM_ID": "T01234567"
    }
  }
}
```
**Para qué**: Buscar conversaciones, anuncios, comunicados
**Ideal para**: "¿Qué se dijo sobre el nuevo horario?"

### 5. **GitHub MCP** ⭐⭐⭐⭐
```json
{
  "github": {
    "command": "npx",
    "args": ["@modelcontextprotocol/server-github"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token"
    }
  }
}
```
**Para qué**: Gestionar documentación de procesos, políticas
**Ideal para**: "Actualiza el manual de onboarding"

### 6. **Filesystem MCP** ⭐⭐⭐⭐
```json
{
  "filesystem": {
    "command": "npx",
    "args": [
      "@modelcontextprotocol/server-filesystem",
      "--allowed-directories",
      "/Users/danielchamorrogonzalez/Documents/RRHH"
    ]
  }
}
```
**Para qué**: Acceder a documentos locales, contratos, CVs
**Ideal para**: "Busca el contrato de Juan Pérez"

### 7. **Puppeteer MCP** ⭐⭐⭐
```json
{
  "puppeteer": {
    "command": "npx",
    "args": ["@modelcontextprotocol/server-puppeteer"]
  }
}
```
**Para qué**: Automatizar tareas web, scraping de portales de empleo
**Ideal para**: "Revisa nuevos candidatos en LinkedIn"

## 📦 Instalación Completa

### 1. Instalar Claude Desktop
- Descarga desde [claude.ai/download](https://claude.ai/download)
- Requiere macOS 12+ o Windows 10+

### 2. Configurar MCP Servers

**macOS:**
```bash
# Crear archivo de configuración
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Windows:**
```powershell
# Crear archivo de configuración
notepad %APPDATA%\Claude\claude_desktop_config.json
```

### 3. Configuración Completa para Foodix

```json
{
  "mcpServers": {
    "colaboradores-foodix": {
      "command": "node",
      "args": ["/Users/danielchamorrogonzalez/app_base_datos_colaboradores/mcp-server/dist/server.js"],
      "env": {
        "AIRTABLE_API_KEY": "patY6qD6VScyjkUw7.7368384daadb59406808aa0a9e9e7e820d009ed3f86ad945fc85d732cfffa49b",
        "AIRTABLE_BASE_ID": "appzTllAjxu4TOs1a",
        "AIRTABLE_TABLE_ID": "tbldYTLfQ3DoEK0WA",
        "AIRTABLE_VIEW_ID": "viwDAiGHQowuPtG45"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/server-filesystem",
        "--allowed-directories",
        "/Users/danielchamorrogonzalez/Documents,/Users/danielchamorrogonzalez/Downloads"
      ]
    },
    "github": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
      }
    }
  }
}
```

### 4. Verificar Instalación

1. Reinicia Claude Desktop
2. En una nueva conversación, escribe: `/list-tools`
3. Deberías ver las herramientas disponibles

## 🎯 Casos de Uso Específicos

### Para Análisis de Datos
```
"Usando los datos de colaboradores, muéstrame:
- Distribución por género y edad
- Rotación por área en los últimos 6 meses
- Proyección de crecimiento del equipo"
```

### Para Documentación
```
"Revisa todos los contratos en /Documents/Contratos
y dime cuáles vencen este mes"
```

### Para Comunicación
```
"Busca en Slack todas las menciones sobre
'evaluación de desempeño' del último mes"
```

### Para Automatización
```
"Genera un reporte semanal que incluya:
- Nuevas contrataciones
- Cumpleaños de la semana
- Métricas de asistencia"
```

## ⚡ Comandos Útiles en Claude Desktop

Con MCP configurado, puedes usar estos comandos:

- `/search Daniel` - Busca un colaborador
- `/stats` - Muestra estadísticas
- `/org` - Genera organigrama
- `/read contrato.pdf` - Lee documentos
- `/analyze` - Análisis profundo

## 🚨 Solución de Problemas

### Error: "No MCP servers configured"
- Verifica que el archivo JSON esté en la ubicación correcta
- Reinicia Claude Desktop completamente

### Error: "Server failed to start"
- Verifica que Node.js esté instalado: `node --version`
- Compila el servidor: `cd mcp-server && npm run build`
- Verifica rutas absolutas en la configuración

### Error: "Permission denied"
- En macOS: `chmod +x /path/to/server.js`
- Verifica permisos de lectura en directorios

## 🔒 Seguridad

1. **Nunca compartas** tu archivo de configuración
2. **Limita directorios** en filesystem server
3. **Usa tokens con permisos mínimos** en GitHub/Slack
4. **Actualiza regularmente** los servidores MCP

## 📊 Métricas de Rendimiento

| Servidor | Velocidad | Confiabilidad | Utilidad RRHH |
|----------|-----------|---------------|---------------|
| Colaboradores (Custom) | ⚡⚡⚡⚡⚡ | ⭐⭐⭐⭐⭐ | 🎯🎯🎯🎯🎯 |
| PostgreSQL | ⚡⚡⚡⚡ | ⭐⭐⭐⭐⭐ | 🎯🎯🎯🎯🎯 |
| Google Sheets | ⚡⚡⚡ | ⭐⭐⭐⭐ | 🎯🎯🎯🎯🎯 |
| Slack | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | 🎯🎯🎯🎯 |
| GitHub | ⚡⚡⚡⚡ | ⭐⭐⭐⭐⭐ | 🎯🎯🎯 |

## 🚀 Próximos Pasos

1. **Instala Claude Desktop** si no lo tienes
2. **Copia la configuración** de arriba
3. **Personaliza** según tus necesidades
4. **Prueba** con comandos simples
5. **Expande** agregando más servidores según necesites

## 💡 Tips Pro

- Combina múltiples servidores para análisis complejos
- Usa aliases para comandos frecuentes
- Programa actualizaciones automáticas del cache
- Integra con tu flujo de trabajo existente

¡Con esta configuración, Claude Desktop se convierte en tu asistente de RRHH definitivo! 🚀