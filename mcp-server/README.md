# MCP Server - Asistente de Colaboradores

Servidor MCP (Model Context Protocol) para gestionar consultas de colaboradores usando Airtable.

## Instalación

```bash
npm install
npm run build
```

## Uso con Claude Desktop

1. Copia la configuración de `claude_desktop_config.json` a tu archivo de configuración de Claude Desktop:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. Reinicia Claude Desktop

## Herramientas Disponibles

- **buscar_colaborador**: Busca colaboradores por nombre, cargo o local
- **listar_colaboradores**: Lista colaboradores con filtros opcionales
- **obtener_colaborador**: Obtiene información detallada de un colaborador
- **analizar_equipo**: Análisis del equipo (resumen, por local, por cargo, organigrama)

## Scripts

- `npm run build` - Compila el TypeScript
- `npm start` - Ejecuta el servidor
- `npm run dev` - Modo desarrollo con hot reload
- `npm test` - Ejecuta prueba del cliente

## Configuración

El servidor usa variables de entorno desde `.env`:
- AIRTABLE_API_KEY
- AIRTABLE_BASE_ID
- AIRTABLE_TABLE_ID
- AIRTABLE_VIEW_ID
- MCP_SERVER_NAME