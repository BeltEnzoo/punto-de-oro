import { PrismaClient, Rol, EstadoAlumno, EstadoCuota } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 12);
  const profesorPassword = await bcrypt.hash('profesor123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@puntodeoro.com' },
    update: {},
    create: {
      email: 'admin@puntodeoro.com',
      password: adminPassword,
      nombre: 'Administrador',
      apellido: 'Sistema',
      rol: Rol.ADMIN,
    },
  });

  const profesor = await prisma.user.upsert({
    where: { email: 'profesor@puntodeoro.com' },
    update: {},
    create: {
      email: 'profesor@puntodeoro.com',
      password: profesorPassword,
      nombre: 'María',
      apellido: 'González',
      rol: Rol.PROFESOR,
    },
  });

  const horarioManana = await prisma.horario.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      nombreHorario: 'Mañana',
      horaInicio: '08:00',
      horaFin: '10:00',
      cupoMaximo: 20,
    },
  });

  const horarioTarde = await prisma.horario.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      nombreHorario: 'Tarde',
      horaInicio: '17:00',
      horaFin: '19:00',
      cupoMaximo: 25,
    },
  });

  const alumno1 = await prisma.alumno.upsert({
    where: { dni: '30123456' },
    update: {},
    create: {
      nombre: 'Juan',
      apellido: 'Pérez',
      dni: '30123456',
      telefono: '11-5555-1234',
      direccion: 'Av. Corrientes 1234',
      fechaNacimiento: new Date('1995-03-15'),
      estado: EstadoAlumno.ACTIVO,
    },
  });

  const alumno2 = await prisma.alumno.upsert({
    where: { dni: '28987654' },
    update: {},
    create: {
      nombre: 'Ana',
      apellido: 'López',
      dni: '28987654',
      telefono: '11-5555-5678',
      fechaNacimiento: new Date('1998-07-22'),
      estado: EstadoAlumno.ACTIVO,
    },
  });

  await prisma.alumnoHorario.upsert({
    where: {
      alumnoId_horarioId: { alumnoId: alumno1.id, horarioId: horarioManana.id },
    },
    update: {},
    create: { alumnoId: alumno1.id, horarioId: horarioManana.id },
  });

  await prisma.alumnoHorario.upsert({
    where: {
      alumnoId_horarioId: { alumnoId: alumno2.id, horarioId: horarioTarde.id },
    },
    update: {},
    create: { alumnoId: alumno2.id, horarioId: horarioTarde.id },
  });

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  await prisma.asistencia.upsert({
    where: {
      alumnoId_horarioId_fecha: {
        alumnoId: alumno1.id,
        horarioId: horarioManana.id,
        fecha: hoy,
      },
    },
    update: {},
    create: {
      alumnoId: alumno1.id,
      horarioId: horarioManana.id,
      fecha: hoy,
      horaIngreso: '08:05',
    },
  });

  const vencimientoPasado = new Date();
  vencimientoPasado.setDate(vencimientoPasado.getDate() - 10);

  await prisma.cuota.create({
    data: {
      alumnoId: alumno2.id,
      fechaVencimiento: vencimientoPasado,
      importe: 15000,
      estado: EstadoCuota.VENCIDA,
    },
  });

  console.log('Seed completado:', { admin: admin.email, profesor: profesor.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
