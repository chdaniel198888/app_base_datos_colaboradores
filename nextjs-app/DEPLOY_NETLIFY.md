# 🚀 Guía de Despliegue en Netlify

## Pasos para Desplegar

### 1. Preparación Local (✅ Completado)
- Build local exitoso
- Configuración `netlify.toml` creada
- Variables de entorno documentadas

### 2. Crear cuenta en Netlify (si no tienes)
1. Ve a [netlify.com](https://www.netlify.com)
2. Registrate con GitHub/GitLab/Bitbucket o email

### 3. Conectar tu Repositorio

#### Opción A: Desde GitHub (Recomendado)
1. En Netlify, click en "Add new site" → "Import an existing project"
2. Selecciona GitHub
3. Autoriza Netlify para acceder a tus repos
4. Busca y selecciona `app_base_datos_colaboradores`
5. Selecciona la rama `main`

#### Opción B: Deploy Manual (Sin GitHub)
1. En tu terminal local:
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login en Netlify
netlify login

# Deploy manual
cd nextjs-app
netlify deploy --prod
```

### 4. Configurar Variables de Entorno en Netlify

Ve a **Site Settings → Environment Variables** y agrega:

```env
# Airtable (OBLIGATORIO)
AIRTABLE_API_KEY=tu_clave_airtable
AIRTABLE_BASE_ID=tu_base_id
AIRTABLE_TABLE_ID=nombre_de_tabla
AIRTABLE_VIEW_ID=nombre_de_vista

# OpenAI (OPCIONAL - para chat IA)
OPENAI_API_KEY=tu_clave_openai
```

### 5. Configuración del Build

En **Site Settings → Build & deploy**:

- **Base directory**: `nextjs-app`
- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: 18 o superior

### 6. Deploy

1. Click en **Deploy site**
2. Espera 2-5 minutos para el build
3. Tu app estará en: `https://tu-nombre.netlify.app`

## 🔧 Configuración Post-Deploy

### Dominio Personalizado (Opcional)
1. Ve a **Domain settings**
2. Click en **Add custom domain**
3. Sigue las instrucciones de DNS

### HTTPS (Automático)
- Netlify provee HTTPS automáticamente
- Certificado SSL gratuito con Let's Encrypt

## 📱 PWA Configuración

La app ya está configurada como PWA:
- Funciona offline con Service Worker
- Instalable en móviles y desktop
- Sincronización automática de datos

## 🐛 Solución de Problemas

### Error: "Build failed"
- Verifica las variables de entorno
- Revisa los logs de build en Netlify

### Error: "API key invalid"
- Confirma que copiaste las API keys correctamente
- No incluyas espacios o comillas extras

### La app no muestra datos
- Verifica que Airtable esté accesible
- Confirma que las variables de entorno estén configuradas

### Chat IA no funciona
- Es normal si no configuraste OPENAI_API_KEY
- El chat mostrará un mensaje indicando que necesita configuración

## 📊 Monitoreo

### Analytics (Gratuito)
- Ve a **Analytics** en el dashboard de Netlify
- Monitorea visitas, performance, etc.

### Logs de Funciones
- Ve a **Functions** → **Logs**
- Útil para debuggear APIs

## 🔄 Actualizaciones

### Deploy Automático (con GitHub)
Cada push a `main` desplegará automáticamente

### Deploy Manual
```bash
netlify deploy --prod
```

## 💰 Costos

### Netlify (Gratis incluye)
- 100GB bandwidth/mes
- 300 minutos de build/mes
- HTTPS automático
- Deploy continuo

### Costos Adicionales
- OpenAI API: ~$0.002 por consulta de chat
- Airtable: Plan gratuito hasta 1000 registros

## 🎉 Listo!

Tu app debería estar funcionando en:
```
https://[tu-nombre-de-sitio].netlify.app
```

Características disponibles:
- ✅ Búsqueda de colaboradores
- ✅ Vista lista/tarjetas
- ✅ Sincronización offline
- ✅ PWA instalable
- ✅ Chat IA (si configuraste OpenAI)
- ✅ Responsive design

## Necesitas Ayuda?

- Documentación Netlify: https://docs.netlify.com
- Estado del build: Revisa el dashboard de Netlify
- Logs: Disponibles en el dashboard de Netlify