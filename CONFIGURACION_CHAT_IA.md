# 🤖 Configuración del Chat con IA Avanzada

## Sistemas de Chat Disponibles

### Chat IA Avanzada
- 🧠 **Procesamiento de lenguaje natural real**
- 💬 Mantiene contexto de conversación
- 🎨 Respuestas creativas y personalizadas
- 🔧 Function calling automático
- 📊 Análisis complejos y sugerencias proactivas

### Servidor MCP (Para Claude Desktop)
- 🖥️ Se conecta directamente con Claude Desktop
- 🔌 Protocolo estándar de Model Context
- 📦 Herramientas disponibles como comandos nativos
- 🚀 Ideal para usuarios de Claude Desktop

## Cómo Activar el Chat IA Avanzada

### Opción 1: OpenAI (Recomendado)

1. **Obtén una API Key de OpenAI**
   - Ve a [platform.openai.com](https://platform.openai.com)
   - Crea una cuenta o inicia sesión
   - Ve a API Keys → Create new secret key
   - Copia la clave (empieza con `sk-`)

2. **Configura tu .env.local**
   ```bash
   # En el archivo /nextjs-app/.env.local agrega:
   OPENAI_API_KEY=sk-tu-clave-aqui
   ```

3. **Reinicia el servidor**
   ```bash
   # Ctrl+C para detener
   npm run dev
   ```

4. **Costos aproximados**
   - GPT-3.5-turbo: ~$0.002 por conversación típica
   - GPT-4: ~$0.02 por conversación típica
   - Primeros $5 gratis en cuenta nueva

### Opción 2: Anthropic Claude (Alternativa)

Si prefieres usar Claude API en lugar de OpenAI:

1. **Modifica el archivo** `/src/app/api/chat-ai/route.ts`
2. **Cambia el import y configuración:**
   ```typescript
   import Anthropic from '@anthropic-ai/sdk';
   
   const anthropic = new Anthropic({
     apiKey: process.env.ANTHROPIC_API_KEY,
   });
   ```

3. **Obtén API key de Anthropic**
   - Ve a [console.anthropic.com](https://console.anthropic.com)
   - Crea una clave API

4. **Actualiza .env.local**
   ```bash
   ANTHROPIC_API_KEY=sk-ant-tu-clave-aqui
   ```

## Características del Chat IA

### Capacidades Inteligentes
- **Comprensión contextual**: Entiende preguntas vagas y sugiere opciones
- **Memoria de conversación**: Recuerda lo que hablaste antes
- **Análisis complejos**: Puede hacer cálculos, comparaciones y tendencias
- **Respuestas naturales**: Usa lenguaje conversacional, no robótico

### Ejemplos de Consultas Avanzadas
```
"¿Cómo está distribuido el equipo?"
"Necesito saber quién tiene más personas a cargo"
"¿Hay algún patrón en las contrataciones recientes?"
"Compara el equipo de marketing con el de producción"
"¿Cuál es la antigüedad promedio por área?"
"Dame insights sobre la estructura organizacional"
```

### Function Calling Automático
El sistema decide automáticamente qué función usar:
- `buscar_colaboradores` - Para búsquedas flexibles
- `obtener_estadisticas` - Para análisis y métricas
- `obtener_organigrama` - Para estructura jerárquica
- `filtrar_colaboradores` - Para búsquedas complejas
- `obtener_colaborador_detalle` - Para información específica

## Solución de Problemas

### Error: "Chat AI no configurado"
- Significa que no hay API key configurada
- Solución: Sigue los pasos de configuración arriba

### Error: "Invalid API key"
- La clave API es incorrecta
- Verifica que copiaste la clave completa
- Asegúrate que no hay espacios extras

### El chat es lento
- Normal en primera consulta (cold start)
- GPT-3.5 es más rápido que GPT-4
- Considera usar la versión ultra-rápida con cache

## Comparación de Costos

| Sistema | Costo | Velocidad | Inteligencia |
|---------|-------|-----------|--------------|
| GPT-3.5 Turbo | ~$0.001/consulta | 1-2 seg | Muy Buena |
| GPT-4 | ~$0.01/consulta | 2-4 seg | Excelente |
| Claude 3 | ~$0.003/consulta | 1-3 seg | Excelente |

## Recomendaciones

1. **Para consultas rápidas**: IA Ultra-Rápida con cache
2. **Para consultas complejas**: IA Avanzada con GPT-3.5
3. **Para análisis profundos**: IA Avanzada con GPT-4
4. **Para integración con herramientas**: Servidor MCP con Claude Desktop

## ¿Necesitas Ayuda?

- El sistema de IA requiere configuración inicial (API key)
- Puedes alternar entre IA normal y ultra-rápida según necesites
- La configuración se hace una sola vez
- Los costos son mínimos para uso normal (~$1-5/mes)