# Punto de Oro Gym

Sistema de gestión web para gimnasios. Administra alumnos, horarios, asistencias y cuotas con roles de Administrador y Profesor/Recepcionista.

## Stack

| Capa | Tecnologías |
|------|-------------|
| Frontend | React, Vite, TypeScript, TailwindCSS, shadcn/ui, React Router, TanStack Query |
| Backend | Node.js, Express, Prisma ORM |
| Base de datos | PostgreSQL (Neon) |
| Auth | JWT + bcrypt |

## Estructura del proyecto

```
Punto-de-oro/
├── backend/          # API REST Express
│   ├── prisma/       # Esquema y seed
│   └── src/
│       ├── config/
│       ├── lib/
│       ├── middleware/
│       └── modules/  # auth, alumnos, horarios, etc.
├── frontend/         # SPA React
│   └── src/
│       ├── components/
│       ├── contexts/
│       ├── pages/
│       └── types/
└── sql/
    └── initial.sql   # SQL de referencia
```

## Requisitos

- Node.js 20+
- Cuenta en [Neon](https://neon.tech) (PostgreSQL)
- npm o pnpm

## Desarrollo local

### 1. Base de datos (Neon)

1. Crear proyecto en [console.neon.tech](https://console.neon.tech)
2. Copiar la connection string (formato `postgresql://...?sslmode=require`)
3. En `backend/`, copiar variables de entorno:

```bash
cd backend
cp .env.example .env
```

Editar `.env`:

```env
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/punto_de_oro?sslmode=require"
JWT_SECRET="un-secreto-largo-y-seguro-minimo-16-chars"
JWT_EXPIRES_IN="7d"
PORT=3001
CORS_ORIGIN="http://localhost:5173"
```

### 2. Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

API disponible en `http://localhost:3001`

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

App disponible en `http://localhost:5173`

### Credenciales de prueba (seed)

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@puntodeoro.com | admin123 |
| Profesor | profesor@puntodeoro.com | profesor123 |

## API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Perfil actual |
| GET | `/api/dashboard/stats` | Estadísticas dashboard |
| CRUD | `/api/alumnos` | Gestión alumnos |
| CRUD | `/api/horarios` | Gestión horarios |
| POST/DELETE | `/api/inscripciones` | Inscripción alumno-horario |
| GET/POST | `/api/asistencias` | Registro asistencias |
| CRUD | `/api/cuotas` | Gestión cuotas |
| GET | `/api/reportes/*` | Reportes |

## Despliegue en producción

### Neon (Base de datos)

1. Crear proyecto en Neon (región cercana a Render)
2. Usar la connection string en el backend de Render
3. Ejecutar migraciones desde local o CI:

```bash
cd backend
DATABASE_URL="..." npx prisma db push
DATABASE_URL="..." npm run db:seed
```

### Render (Backend)

1. Crear **Web Service** conectado al repositorio
2. Configuración:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npm start`
3. Variables de entorno:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | Connection string de Neon |
| `JWT_SECRET` | Secreto seguro (32+ caracteres) |
| `JWT_EXPIRES_IN` | `7d` |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | URL del frontend en Vercel |
| `PORT` | `3001` (Render asigna automáticamente; usar `process.env.PORT`) |

> **Nota:** Render expone `PORT` dinámicamente. Actualizar `backend/src/config/env.ts` si es necesario para usar `process.env.PORT` en producción (ya soportado vía variable PORT).

### Vercel (Frontend)

1. Importar repositorio en [vercel.com](https://vercel.com)
2. Configuración:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Variable de entorno:

| Variable | Valor |
|----------|-------|
| `VITE_API_URL` | `https://tu-backend.onrender.com/api` |

4. Redeploy tras configurar la variable.

### Checklist post-deploy

- [ ] Backend responde en `/api/health`
- [ ] CORS apunta al dominio de Vercel
- [ ] Login funciona con usuarios seed
- [ ] Prisma schema aplicado en Neon

## Roles y permisos

- **ADMIN:** Acceso total, puede eliminar alumnos y horarios
- **PROFESOR:** CRUD de alumnos (sin delete), horarios (sin delete), asistencias, cuotas y reportes

## Esquema de base de datos

Tablas: `users`, `alumnos`, `horarios`, `alumno_horario`, `asistencias`, `cuotas`

Ver `backend/prisma/schema.prisma` y `sql/initial.sql`.

## Licencia

Proyecto privado — Punto de Oro Gym.
