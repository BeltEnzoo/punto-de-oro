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

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Punto de Oro API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/alumnos', alumnosRoutes);
app.use('/api/horarios', horariosRoutes);
app.use('/api/inscripciones', inscripcionesRoutes);
app.use('/api/asistencias', asistenciasRoutes);
app.use('/api/cuotas', cuotasRoutes);
app.use('/api/reportes', reportesRoutes);

app.use(errorHandler);

export default app;
