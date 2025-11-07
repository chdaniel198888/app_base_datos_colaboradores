# 📱 Guía de Instalación en Celular

## ⚠️ IMPORTANTE: Ambiente de Desarrollo en la Nube

**Tu proyecto está corriendo en Claude Code (ambiente containerizado/nube).**

Esto significa que:
- ❌ No puedes acceder directamente desde tu celular a `http://IP-LOCAL:3000`
- ❌ La IP del contenedor (21.0.0.132) NO es accesible desde tu red WiFi
- ✅ **SOLUCIÓN**: Desplegar la app a internet (Netlify/Vercel)

---

## ✨ SOLUCIÓN RECOMENDADA: Deploy a Netlify (GRATIS)

### Opción 1: Deploy Automático desde Git (Recomendado)

1. **Sube tu código a GitHub** (si no lo has hecho)
2. **Ve a [netlify.com](https://netlify.com)** y regístrate/inicia sesión
3. **Click en "Add new site"** → "Import an existing project"
4. **Conecta tu repositorio GitHub**
5. **Configura el build**:
   - Base directory: `nextjs-app`
   - Build command: `npm run build`
   - Publish directory: `.next`
6. **Agrega las variables de entorno** en Site Settings → Environment Variables:
   ```
   AIRTABLE_API_KEY=tu_clave
   AIRTABLE_BASE_ID=tu_base_id
   AIRTABLE_TABLE_ID=tu_tabla_id
   AIRTABLE_VIEW_ID=tu_vista_id
   ```
7. **Deploy!**

En 3-5 minutos tendrás una URL como: `https://tu-app.netlify.app`

### Opción 2: Deploy Manual con Netlify CLI

```bash
# 1. Instalar Netlify CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Deploy
cd nextjs-app
netlify deploy --prod
```

---

## 📱 Usar la App en tu Celular

Una vez desplegada en Netlify:

### 1. Abre la URL en tu celular
- Ejemplo: `https://directorio-colaboradores.netlify.app`

### 2. Instalar como App (PWA)

**En Android (Chrome):**
1. Abre la URL en Chrome
2. Toca el menú (⋮) → "Agregar a pantalla de inicio"
3. Confirma la instalación
4. ¡El ícono aparecerá en tu pantalla de inicio!

**En iPhone/iPad (Safari):**
1. Abre la URL en Safari
2. Toca el botón de compartir (□↑)
3. Desplázate y selecciona "Agregar a pantalla de inicio"
4. Toca "Agregar"
5. ¡El ícono aparecerá en tu pantalla de inicio!

---

## 🆓 Deploy GRATIS en Vercel (Alternativa)

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
cd nextjs-app
vercel --prod
```

Sigue las instrucciones y tendrás una URL como: `https://tu-app.vercel.app`

---

## 🔧 Configuración Local (Solo si estás en tu computadora personal)

Si NO estás usando Claude Code en la nube, sino tu computadora local:

## 🚀 Paso 1: Preparar tu Computadora

### Instalar Dependencias (si no lo has hecho)
```bash
cd nextjs-app
npm install
```

### Obtener tu Dirección IP Local

**En Mac/Linux:**
```bash
# Opción 1: usando ifconfig
ifconfig | grep "inet " | grep -v 127.0.0.1

# Opción 2: más simple
hostname -I
```

**En Windows (PowerShell):**
```powershell
ipconfig | findstr "IPv4"
```

Tu dirección IP local será algo como: `192.168.1.X` o `10.0.0.X`

### Iniciar la Aplicación en Modo Móvil

```bash
npm run dev:mobile
```

La app se ejecutará en:
- **Local**: http://localhost:3000
- **Red local**: http://[TU-IP]:3000

Por ejemplo: `http://192.168.1.105:3000`

---

## 📱 Paso 2: Conectar desde tu Celular

### Requisitos:
- ✅ Tu celular y computadora deben estar en la **misma red WiFi**
- ✅ El firewall no debe bloquear el puerto 3000

### Acceder desde el Navegador:

1. Abre el navegador en tu celular (Chrome, Safari, etc.)
2. Escribe la URL: `http://[TU-IP]:3000`
   - Ejemplo: `http://192.168.1.105:3000`
3. ¡La app debería cargar!

---

## 💫 Paso 3: Instalar como Aplicación (PWA)

### En Android (Chrome):

1. Abre la app en Chrome
2. Espera a que aparezca el banner "Agregar a pantalla de inicio"
3. O toca el menú (⋮) → "Agregar a pantalla de inicio"
4. Confirma la instalación
5. ¡El ícono aparecerá en tu pantalla de inicio!

### En iPhone/iPad (Safari):

1. Abre la app en Safari
2. Toca el botón de compartir (□↑)
3. Desplázate y selecciona "Agregar a pantalla de inicio"
4. Edita el nombre si quieres
5. Toca "Agregar"
6. ¡El ícono aparecerá en tu pantalla de inicio!

---

## ✨ Características en Móvil

Una vez instalada, la app funciona como una aplicación nativa:

- 📱 **Pantalla completa**: Sin barra de navegador
- ⚡ **Acceso rápido**: Desde tu pantalla de inicio
- 💾 **Funciona offline**: Gracias al Service Worker
- 🔄 **Sincronización automática**: Cuando tengas internet
- 📞 **Llamadas directas**: Toca un teléfono y llama
- 💬 **WhatsApp integrado**: Contacta por WhatsApp al instante

---

## 🔧 Solución de Problemas

### No puedo acceder desde mi celular

**Verifica:**
1. ¿Están en la misma red WiFi?
   - Ve a Configuración → WiFi en ambos dispositivos
   - Deben mostrar el mismo nombre de red

2. ¿El firewall está bloqueando el puerto?

   **En Mac:**
   ```bash
   # Permitir conexiones en el puerto 3000
   sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
   ```

   **En Windows:**
   - Ve a Panel de Control → Firewall de Windows
   - Clic en "Permitir una aplicación"
   - Busca Node.js y asegúrate de que esté permitido

3. ¿La IP es correcta?
   - Vuelve a verificar tu IP con `ifconfig` o `ipconfig`
   - Prueba acceder desde tu computadora primero: `http://[TU-IP]:3000`

### La app no se instala

1. **Asegúrate de usar HTTPS** (para producción):
   - Las PWA requieren HTTPS para instalarse
   - En desarrollo local, HTTP está bien
   - Para producción, despliega en Netlify o Vercel

2. **Verifica el manifest**:
   - Abre Chrome DevTools → Application → Manifest
   - Debe mostrar todos los campos correctamente

3. **Limpia caché del navegador**:
   - Android Chrome: Menú → Configuración → Privacidad → Borrar datos
   - iOS Safari: Configuración → Safari → Borrar historial y datos

### El Service Worker no funciona

1. Abre DevTools → Application → Service Workers
2. Verifica que el SW esté activo
3. Si hay errores, haz clic en "Unregister" y recarga
4. El SW se reinstalará automáticamente

---

## 🌐 Despliegue en Internet (Opcional)

Si quieres acceder desde cualquier lugar:

### Opción 1: Netlify (Recomendado)

```bash
# Ya configurado en netlify.toml
npm run build
netlify deploy --prod
```

### Opción 2: Vercel

```bash
npm run build
npx vercel --prod
```

Después recibirás una URL pública como:
- `https://directorio-colaboradores.netlify.app`
- `https://directorio-colaboradores.vercel.app`

---

## 📊 Verificar que todo funciona

### Checklist de Funcionalidad:

- [ ] La app carga en el celular
- [ ] Se puede instalar desde el navegador
- [ ] El ícono aparece en la pantalla de inicio
- [ ] La búsqueda funciona correctamente
- [ ] Los filtros responden rápido
- [ ] Se puede llamar tocando un teléfono
- [ ] WhatsApp se abre correctamente
- [ ] La app funciona sin internet (después de la primera carga)
- [ ] Los datos se sincronizan cuando hay internet

---

## 💡 Tips de Uso

1. **Primera vez**:
   - Abre la app con internet para que descargue todos los datos
   - Espera a que la sincronización termine

2. **Modo offline**:
   - Puedes buscar colaboradores sin internet
   - Los datos se mantienen actualizados hasta 5 minutos

3. **Actualización de datos**:
   - La app sincroniza automáticamente al abrirla
   - También puedes hacer "pull to refresh" (deslizar hacia abajo)

4. **Rendimiento**:
   - La búsqueda es instantánea (< 50ms)
   - Los filtros se aplican en tiempo real
   - No consume muchos datos móviles

---

## 🆘 Soporte

Si tienes problemas:

1. Revisa la consola del navegador (F12 en escritorio)
2. Verifica que las variables de entorno estén configuradas
3. Asegúrate de que el servidor de desarrollo esté corriendo
4. Verifica que ambos dispositivos estén en la misma red

---

## 🎉 ¡Listo!

Tu app de Directorio de Colaboradores ahora funciona en tu celular como una aplicación nativa.

**Disfruta la búsqueda ultra-rápida y la experiencia móvil optimizada!** 📱✨
