import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { errorHandler } from './middleware/auth.js';
import authRoutes from './modules/auth/auth.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import alumnosRoutes from './modules/alumnos/alumnos.routes.js';
import horariosRoutes from './modules/horarios/horarios.routes.js';
import inscripcionesRoutes from './modules/inscripciones/inscripciones.routes.js';
import asistenciasRoutes from './modules/asistencias/asistencias.routes.js';
import cuotasRoutes from './modules/cuotas/cuotas.routes.js';
import reportesRoutes from './modules/reportes/reportes.routes.js';

const app = express();

// En Vercel Services el routePrefix /api ya lo maneja el router; localmente usamos /api
const API_PREFIX = process.env.VERCEL ? '' : '/api';

const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('No permitido por CORS'));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

app.get(`${API_PREFIX}/health`, (_req, res) => {
  res.json({ status: 'ok', service: 'Punto de Oro API' });
});

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);
app.use(`${API_PREFIX}/alumnos`, alumnosRoutes);
app.use(`${API_PREFIX}/horarios`, horariosRoutes);
app.use(`${API_PREFIX}/inscripciones`, inscripcionesRoutes);
app.use(`${API_PREFIX}/asistencias`, asistenciasRoutes);
app.use(`${API_PREFIX}/cuotas`, cuotasRoutes);
app.use(`${API_PREFIX}/reportes`, reportesRoutes);

app.use(errorHandler);

export default app;
