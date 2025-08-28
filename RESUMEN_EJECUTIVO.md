# RESUMEN EJECUTIVO - ANÁLISIS DE TABLA AIRTABLE
## Base de Datos de Colaboradores

### INFORMACIÓN GENERAL
- **Base ID:** appzTllAjxu4TOs1a
- **Tabla ID:** tbldYTLfQ3DoEK0WA  
- **Vista ID:** viwDAiGHQowuPtG45
- **Total de Registros:** 80 colaboradores
- **Total de Campos:** 61 campos únicos identificados

### HALLAZGOS PRINCIPALES

#### 1. CAMPOS DE INFORMACIÓN PERSONAL (100% presencia)
- **Nombre** - Nombre completo del colaborador
- **Código Trabajador** - ID único (ej: SC011, SC009)
- **Sexo** - Masculino/Femenino
- **Estado Civil** - Soltero/Casado/Divorciado/Union Libre
- **Nacionalidad** - Ecuatoriano/Venezolano/Cubano
- **Dirección Domicilio** - Dirección completa
- **Sector de domicilio** - Zona/barrio
- **Celular** - Teléfono móvil personal
- **Cargas familiares** - Número (0-3)
- **Rango Edad** - Categorías de edad

#### 2. CAMPOS LABORALES (100% presencia)
- **Empresa** - FOODIX SAS o ROCIO GONZALEZ
- **Estado** - Todos activos
- **Cargo** - 18 cargos diferentes identificados
- **Tipo de trabajador** - Administrativo/Operativo/Agente de Restaurante
- **Área** - 12 áreas diferentes
- **Marca** - Santo Cachon/Chios/Simon Bolon/Oficina y Planta
- **Centro De Costo** - Referencias a otras tablas
- **Fecha Ingreso** - Fecha de contratación
- **Etapa** - Inducción/Onboarding/Tiempo de prueba superado
- **Permanencia en Días/Meses** - Calculado automáticamente

#### 3. CAMPOS FINANCIEROS (95-99% presencia)
- **Salario** - Valores entre 473.67 y otros montos
- **Forma de pago** - Transferencia/Cheque
- **Banco** - Produbanco principalmente
- **Tipo de cuenta** - Ahorros mayormente
- **# de cuenta** - Número de cuenta bancaria

#### 4. CAMPOS CON PRESENCIA PARCIAL (< 90%)
- **Fecha Ingreso IESS** (85%)
- **jefe_directo** (90%)
- **unidades_negocio** (90%)
- **Correo Coorporativo** (23.8%)
- **Celular Coorporativo** (5%)

#### 5. CAMPOS DE RELACIONES (Arrays/Enlaces)
Estos campos vinculan con otras tablas de Airtable:
- **Centro De Costo** - Enlaces a centros de costo
- **Información Tiendas** - Enlaces a tabla de tiendas
- **Control Disciplinario 5 y 6** - Referencias disciplinarias
- **Solicitud de Vacaciones** - Múltiples versiones
- **Matriz de Salidas** - Registros de salidas
- **Table 13, 19** - Referencias a otras tablas
- **EVALUACIÓN 360 PORTUGAL** - Evaluaciones de desempeño

#### 6. CAMPOS CALCULADOS/ESPECIALES
- **# Años** - Edad calculada (mixto: dict/int)
- **Cumpleaños** - Próximo cumpleaños (calculado)
- **Mes Cumpleaños** - Extraído de fecha de nacimiento
- **Permanencia en Días/Meses** - Calculado desde fecha ingreso
- **Código (from Centro De Costo 2)** - Campo lookup

### CAMPOS OCULTOS O DE USO LIMITADO
Identificados 35 campos que no aparecen en todos los registros, destacando:
- **Días de Contratación 2** (1.2%)
- **Solicitud de Vacaciones 2** (1.2%)  
- **EVALUACIÓN 360 PORTUGAL 4** (1.2%)
- **Celular Coorporativo** (5%)

### ARCHIVOS GENERADOS
1. **reporte_completo_campos.json** - Detalle técnico completo
2. **muestra_registros_completa.json** - 5 registros de ejemplo
3. **estructura_campos.csv** - Tabla resumen en formato CSV

### RECOMENDACIONES
1. Completar campos faltantes de contacto (correo, teléfono emergencia)
2. Estandarizar campos de evaluación (múltiples versiones detectadas)
3. Consolidar campos de solicitud de vacaciones (5 versiones diferentes)
4. Completar información bancaria faltante (7% sin datos)
5. Actualizar campos de jefe directo y unidad de negocio (10% faltantes)