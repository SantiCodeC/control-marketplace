# 🏠 Control Marketplace

Sistema para controlar qué asesores inmobiliarios publicaron propiedades en Facebook Marketplace.

---

## ✅ PASO A PASO COMPLETO — De cero a online gratis

---

## PARTE 1: CREAR LA BASE DE DATOS EN SUPABASE

### Paso 1.1 — Crear cuenta gratuita en Supabase

1. Andá a https://supabase.com
2. Hacé clic en **"Start your project"**
3. Registrate con tu cuenta de GitHub o email
4. Hacé clic en **"New Project"**
5. Completá:
   - **Organization**: elegí la que te creó automáticamente
   - **Project name**: `control-marketplace`
   - **Database password**: escribí una contraseña fuerte y GUARDALA
   - **Region**: elegí `South America (São Paulo)` (es la más cercana a Argentina)
6. Hacé clic en **"Create new project"**
7. Esperá 2-3 minutos mientras se crea el proyecto

### Paso 1.2 — Ejecutar el SQL del proyecto

1. En el panel de Supabase, buscá en el menú izquierdo: **SQL Editor**
2. Hacé clic en **"New query"**
3. Copiá TODO el contenido del archivo `supabase-schema.sql` de este proyecto
4. Pegalo en el editor
5. Hacé clic en **"Run"** (botón azul abajo a la derecha)
6. Deberías ver: `Success. No rows returned`

### Paso 1.3 — Obtener las credenciales

1. En el menú izquierdo andá a **Settings → API**
2. Copiá estos dos valores (los necesitás para el siguiente paso):
   - **Project URL** (empieza con `https://`)
   - **anon / public** key (clave larga)

---

## PARTE 2: INSTALAR EL PROYECTO EN TU PC

### Paso 2.1 — Instalar Node.js

1. Andá a https://nodejs.org
2. Descargá la versión **LTS** (la recomendada)
3. Instalala con todas las opciones por defecto
4. Para verificar que quedó bien instalado, abrí la Terminal (en Windows: PowerShell) y escribí:
   ```
   node --version
   ```
   Debería mostrar algo como `v20.x.x`

### Paso 2.2 — Descargar el proyecto

Si tenés Git instalado:
```bash
git clone https://github.com/TU-USUARIO/control-marketplace.git
cd control-marketplace
```

Si no tenés Git:
- Descargá el ZIP del proyecto y descomprimilo
- Abrí la terminal en la carpeta del proyecto

### Paso 2.3 — Crear el archivo de variables de entorno

1. En la carpeta del proyecto, buscá el archivo `.env.local.example`
2. Copialo y renombralo como `.env.local`
3. Abrilo con cualquier editor de texto (Bloc de notas, VS Code, etc.)
4. Reemplazá los valores con los que copiaste en el Paso 1.3:

```
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

5. Guardá el archivo

### Paso 2.4 — Instalar las dependencias

En la terminal, dentro de la carpeta del proyecto:
```bash
npm install
```
Esperá 1-2 minutos mientras se descargan todos los paquetes.

### Paso 2.5 — Ejecutar el proyecto localmente

```bash
npm run dev
```

Deberías ver:
```
▲ Next.js 14.2.5
- Local: http://localhost:3000
```

Abrí tu navegador en http://localhost:3000

---

## PARTE 3: PRIMER LOGIN

El sistema viene con un usuario admin creado:

- **Usuario**: `admin`
- **PIN**: `1234`

**¡IMPORTANTE!** Cambiá el PIN del admin inmediatamente después de ingresar.

---

## PARTE 4: SUBIR A GITHUB

### Paso 4.1 — Crear cuenta en GitHub

1. Andá a https://github.com y creá una cuenta gratuita si no tenés

### Paso 4.2 — Crear repositorio

1. En GitHub, hacé clic en **"New repository"**
2. Nombre: `control-marketplace`
3. Seleccioná **Private** (para que sea privado)
4. Hacé clic en **"Create repository"**

### Paso 4.3 — Subir el código

En la terminal del proyecto:
```bash
git init
git add .
git commit -m "Initial commit - Control Marketplace"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/control-marketplace.git
git push -u origin main
```

Reemplazá `TU-USUARIO` con tu nombre de usuario de GitHub.

---

## PARTE 5: DEPLOY GRATIS EN VERCEL

### Paso 5.1 — Crear cuenta en Vercel

1. Andá a https://vercel.com
2. Hacé clic en **"Sign Up"**
3. Elegí **"Continue with GitHub"** (así se conecta automáticamente)

### Paso 5.2 — Importar el proyecto

1. En Vercel, hacé clic en **"Add New → Project"**
2. Buscá y seleccioná tu repositorio `control-marketplace`
3. Hacé clic en **"Import"**

### Paso 5.3 — Configurar variables de entorno

En la pantalla de configuración de Vercel, buscá la sección **"Environment Variables"** y agregá:

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Tu URL de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Tu anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Tu service role key |

### Paso 5.4 — Deploy

1. Hacé clic en **"Deploy"**
2. Esperá 2-3 minutos
3. ¡Listo! Tu app estará en una URL como: `https://control-marketplace-TU-USUARIO.vercel.app`

---

## PARTE 6: CREAR LOS ASESORES

Una vez que la app esté online:

1. Ingresá como admin (usuario: `admin`, PIN: `1234`)
2. Andá a la sección **Admin** (ícono de engranaje)
3. Hacé clic en **"Nuevo"**
4. Completá:
   - **Nombre completo**: nombre y apellido del asesor
   - **Usuario**: nombre sin espacios (Ej: `juan_perez`)
   - **PIN**: 4-8 números (el asesor lo va a usar para ingresar)
   - **Rol**: Asesor
5. Hacé clic en **"Crear"**
6. Repetí para cada asesor

---

## CÓMO USAR LA APP

### El asesor:
1. Entra en la URL de la app desde su celular o PC
2. Escribe su usuario y PIN
3. Ve todas las propiedades activas
4. Toca el botón **"Copiar y marcar como publicada"** cuando publica en Marketplace
5. La descripción se copia automáticamente al portapapeles
6. El sistema registra que ese asesor ya publicó esa propiedad

### El admin:
1. Puede ver todo lo anterior
2. Puede crear/editar/eliminar asesores
3. Puede cerrar propiedades cuando ya no están disponibles
4. Ve estadísticas completas en la sección Stats

---

## SOLUCIÓN DE PROBLEMAS COMUNES

### "Error al iniciar sesión"
- Verificá que el SQL se ejecutó correctamente en Supabase
- Verificá que las variables de entorno en `.env.local` son correctas
- El usuario por defecto es `admin` con PIN `1234`

### "Error cargando propiedades"
- Verificá que las políticas RLS se crearon (el SQL incluye esto)
- Revisá que la URL de Supabase en `.env.local` es correcta

### La app no carga en Vercel
- Revisá que agregaste las 2 variables de entorno en Vercel
- Ve a Vercel → tu proyecto → Settings → Environment Variables

### Actualizaciones futuras
Cuando hagas cambios en el código:
```bash
git add .
git commit -m "descripción del cambio"
git push
```
Vercel detecta el push y re-deploya automáticamente.

---

## ESTRUCTURA DEL PROYECTO

```
control-marketplace/
├── app/
│   ├── dashboard/      # Tablero principal
│   ├── pendientes/     # Propiedades pendientes del asesor
│   ├── cerradas/       # Propiedades archivadas
│   ├── estadisticas/   # Stats y rankings
│   ├── admin/          # Gestión de usuarios (solo admin)
│   └── login/          # Página de login
├── components/
│   ├── layout/         # AppLayout con navegación
│   └── ui/             # PropertyRow, PropertyForm
├── hooks/
│   └── useAuth.tsx     # Contexto de autenticación
├── lib/
│   ├── auth.ts         # Login, hash PIN, sesión
│   └── supabase/       # Clientes de Supabase
├── types/
│   └── index.ts        # TypeScript types
└── supabase-schema.sql # SQL para la base de datos
```

---

## INFORMACIÓN TÉCNICA

- **Framework**: Next.js 14 (App Router)
- **Estilos**: TailwindCSS
- **Base de datos**: Supabase (PostgreSQL)
- **Hosting**: Vercel (gratis)
- **Autenticación**: Custom (usuario + PIN, sin email)
- **Seguridad PIN**: SHA-256 con salt

---

¿Necesitás ayuda? Revisá cada paso con calma. La parte más común de error es en las variables de entorno.
