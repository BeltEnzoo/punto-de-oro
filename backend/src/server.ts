import 'dotenv/config';
import app from './app.js';
import { env } from './config/env.js';

app.listen(env.PORT, () => {
  console.log(`Punto de Oro API corriendo en http://localhost:${env.PORT}`);
});
