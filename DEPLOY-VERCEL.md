# Deploy en Vercel — Punto de Oro Gym

Necesitás **2 proyectos en Vercel** (backend y frontend) + **Neon** (base de datos).

---

## Paso 1: Subir cambios a GitHub

```bash
git add .
git commit -m "chore: configuración para deploy en Vercel"
git push
```

---

## Paso 2: Deploy del BACKEND

1. Entrá a [vercel.com/new](https://vercel.com/new)
2. **Import** el repo `BeltEnzoo/punto-de-oro`
3. Configuración:

| Campo | Valor |
|-------|-------|
| Project Name | `punto-de-oro-api` (o el nombre que prefieras) |
| Framework Preset | **Other** |
| Root Directory | `backend` |
| Build Command | `prisma generate` |
| Output Directory | *(dejar vacío)* |
| Install Command | `npm install` |

4. **Environment Variables** (obligatorias):

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | Tu connection string de Neon |
| `JWT_SECRET` | Secreto largo (mín. 16 caracteres) |
| `JWT_EXPIRES_IN` | `7d` |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | `http://localhost:5173` *(actualizás después con la URL del frontend)* |

5. Clic en **Deploy**
6. Copiá la URL del backend, ej: `https://punto-de-oro-api.vercel.app`
7. Verificá: `https://punto-de-oro-api.vercel.app/api/health` → debe responder `{"status":"ok",...}`

---

## Paso 3: Deploy del FRONTEND

1. En Vercel → **Add New Project** → mismo repo `BeltEnzoo/punto-de-oro`
2. Configuración:

| Campo | Valor |
|-------|-------|
| Project Name | `punto-de-oro` |
| Framework Preset | **Vite** |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

3. **Environment Variables**:

| Variable | Valor |
|----------|-------|
| `VITE_API_URL` | `https://punto-de-oro-api.vercel.app/api` *(tu URL del backend + /api)* |

4. Clic en **Deploy**
5. Copiá la URL del frontend, ej: `https://punto-de-oro.vercel.app`

---

## Paso 4: Actualizar CORS en el backend

Volvé al proyecto **backend** en Vercel → **Settings** → **Environment Variables**

Editá `CORS_ORIGIN`:

```
http://localhost:5173,https://punto-de-oro.vercel.app
```

*(Reemplazá con tu URL real del frontend)*

Guardá y hacé **Redeploy** del backend.

---

## Paso 5: Probar

1. Abrí `https://punto-de-oro.vercel.app`
2. Login: `admin@puntodeoro.com` / `admin123`

---

## Resumen de URLs

```
Frontend  →  https://punto-de-oro.vercel.app
Backend   →  https://punto-de-oro-api.vercel.app/api
Database  →  Neon (ep-xxx.neon.tech)
```

---

## Problemas comunes

| Error | Solución |
|-------|----------|
| CORS error | Agregar URL del frontend en `CORS_ORIGIN` del backend |
| 500 en login | Verificar `DATABASE_URL` y `JWT_SECRET` en Vercel |
| Prisma error | Redeploy del backend (ejecuta `prisma generate` en build) |
| Rutas 404 en frontend | `vercel.json` con rewrite a `index.html` ya está configurado |
