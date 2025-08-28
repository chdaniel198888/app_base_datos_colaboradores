# 📚 Guía de Usuario - MCP en Claude Desktop

## 🎯 Flujo de Trabajo con MCP

### 1️⃣ Inicio de Sesión
Cuando abres Claude Desktop con MCP configurado:
```
Claude Desktop → Lee config → Inicia servidor MCP → Herramientas listas
```

### 2️⃣ Cómo Claude Procesa tu Pregunta

```mermaid
Tu Pregunta → Claude Analiza → ¿Necesita datos? → Sí → Llama a MCP
                                        ↓
                                       No → Responde directamente
```

### 3️⃣ Ejemplos Prácticos

#### 🔍 Búsqueda Simple
**Tú:** "Busca información sobre todos los colaboradores que se llaman Carlos"
**Claude:** 
1. Detecta: necesita buscar colaboradores
2. Llama: `buscar_colaborador({query: "Carlos"})`
3. Recibe: Lista de resultados
4. Formatea: Respuesta legible

**Respuesta esperada:**
```
Encontré 3 colaboradores llamados Carlos:
• Carlos Mata - Jefe de área en Chios Floreana
• Carlos Bravo - Polifuncional en Santo Cachón
• Carlos Mendoza - Operario en Producción
```

#### 📊 Análisis Complejo
**Tú:** "Necesito un análisis completo del equipo: total de empleados, distribución por áreas, y quién tiene más reportes directos"

**Claude ejecutará múltiples herramientas:**
1. `analizar_equipo({tipo: "resumen"})` - Total y estados
2. `analizar_equipo({tipo: "por_area"})` - Distribución
3. `analizar_equipo({tipo: "organigrama"})` - Jerarquía

#### 🏢 Consultas Específicas
**Tú:** "¿Cuántas personas trabajan en el local de Chios Portugal y cuáles son sus cargos?"

**Claude:**
1. `listar_colaboradores({local: "Chios Portugal"})`
2. Procesa y agrupa por cargo
3. Presenta resumen organizado

## 🎨 Plantillas de Prompts Efectivos

### Para Información Individual
```
"Dame toda la información disponible sobre [NOMBRE COMPLETO]"
"¿Cuál es el cargo y ubicación de [NOMBRE]?"
"¿A quién reporta [NOMBRE]?"
```

### Para Análisis de Equipo
```
"Analiza la distribución del equipo por [área/ubicación/cargo]"
"¿Cuál es la estructura jerárquica del departamento de [ÁREA]?"
"Compara el tamaño de los equipos entre [LOCAL A] y [LOCAL B]"
```

### Para Filtros y Búsquedas
```
"Lista todos los colaboradores activos en [UBICACIÓN]"
"Muestra los empleados con cargo de [CARGO ESPECÍFICO]"
"¿Quiénes están en estado [Activo/Inactivo/Vacaciones]?"
```

### Para Reportes
```
"Genera un resumen ejecutivo del estado actual del equipo"
"Dame las métricas clave de RRHH: total, activos, por área"
"Crea un reporte de la estructura organizacional"
```

## 🛠️ Solución de Problemas

### Si Claude no usa las herramientas:

1. **Sé más explícito:**
   ❌ "info de juan"
   ✅ "Usa las herramientas MCP para buscar información sobre Juan García"

2. **Menciona la herramienta específica:**
   "Por favor usa buscar_colaborador para encontrar a María"

3. **Proporciona contexto:**
   "En la base de datos de colaboradores de Foodix, busca..."

### Si obtienes errores:

**"No tengo acceso a herramientas"**
- Reinicia Claude Desktop
- Verifica que el servidor está corriendo

**"No encontré resultados"**
- Verifica la ortografía exacta
- Prueba con búsquedas parciales
- Confirma que el colaborador existe

## 📈 Casos de Uso Avanzados

### 1. Dashboard Verbal
```
"Dame un dashboard ejecutivo: total de empleados, distribución por área, 
top 5 ubicaciones, y los jefes con más reportes directos"
```

### 2. Análisis de Cambios
```
"Compara los colaboradores activos vs inactivos y dime el porcentaje 
de rotación si asumimos que los inactivos son bajas recientes"
```

### 3. Búsqueda Multi-criterio
```
"Encuentra todos los polifuncionales de cocina que trabajan en 
locales que contengan 'Chios' en el nombre"
```

### 4. Validación de Datos
```
"Verifica si hay colaboradores sin jefe asignado o con 
información incompleta (sin cargo o ubicación)"
```

## 🎯 Tips Pro

1. **Inicia con contexto:** Menciona que tienes MCP configurado
2. **Sé específico:** Nombres completos, ubicaciones exactas
3. **Combina consultas:** Pide múltiples análisis en una pregunta
4. **Usa terminología consistente:** "colaborador" no "empleado"
5. **Aprovecha el contexto:** Claude recuerda conversaciones previas

## 📋 Checklist de Verificación

- [ ] Claude Desktop está abierto
- [ ] El servidor MCP no muestra errores (check en configuración)
- [ ] Usas prompts específicos y claros
- [ ] Mencionas explícitamente "usa las herramientas" al inicio
- [ ] Los nombres y ubicaciones están bien escritos

## 🔄 Flujo de Trabajo Recomendado

1. **Saludo inicial** con contexto de MCP
2. **Consulta de prueba** simple para verificar
3. **Preguntas progresivas** de simple a complejo
4. **Aprovechar contexto** para preguntas de seguimiento
5. **Solicitar formatos** específicos (tabla, lista, resumen)

## 💬 Ejemplos de Conversación Completa

```
Tú: Hola Claude, tengo MCP configurado para colaboradores. 
    ¿Puedes buscar a Daniel Chamorro?

Claude: [Usa buscar_colaborador] 
        Encontré a Daniel Alberto Chamorro González:
        • Cargo: Director general
        • Ubicación: Gerencia
        • Estado: Activo
        • Reporta a: Gonzalez Velasquez Yehejia

Tú: ¿Quién reporta a él?

Claude: [Usa analizar_equipo con organigrama]
        Daniel Chamorro tiene 1 reporte directo:
        • Narvaez Solorzano Johanna Cecilia

Tú: Dame estadísticas del área de Gerencia

Claude: [Usa listar_colaboradores con filtro]
        En Gerencia hay 2 colaboradores:
        • 100% activos
        • Cargos: 1 Presidente, 1 Director general
```

¡Con esta guía deberías poder aprovechar al máximo MCP en Claude Desktop! 🚀