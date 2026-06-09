export type Rol = 'ADMIN' | 'PROFESOR';
export type EstadoAlumno = 'ACTIVO' | 'INACTIVO';
export type EstadoCuota = 'PAGADA' | 'PENDIENTE' | 'VENCIDA';

export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: Rol;
  activo: boolean;
}

export interface Alumno {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string | null;
  direccion: string | null;
  fechaNacimiento: string;
  fechaInscripcion: string;
  estado: EstadoAlumno;
  observaciones: string | null;
  horarios?: AlumnoHorario[];
  _count?: { cuotas: number; asistencias: number };
}

export interface Horario {
  id: string;
  nombreHorario: string;
  horaInicio: string;
  horaFin: string;
  cupoMaximo: number;
  _count?: { alumnos: number };
  alumnos?: { alumno: Alumno }[];
}

export interface AlumnoHorario {
  id: string;
  alumnoId: string;
  horarioId: string;
  horario?: Horario;
  alumno?: Alumno;
}

export interface Asistencia {
  id: string;
  alumnoId: string;
  horarioId: string;
  fecha: string;
  horaIngreso: string;
  alumno?: Alumno;
  horario?: Horario;
}

export interface Cuota {
  id: string;
  alumnoId: string;
  fechaVencimiento: string;
  importe: string;
  estado: EstadoCuota;
  alumno?: Alumno;
}

export interface DashboardStats {
  alumnosActivos: number;
  presentesHoy: number;
  cuotasVencidas: number;
  horariosPopulares: {
    id: string;
    nombreHorario: string;
    horaInicio: string;
    horaFin: string;
    totalAlumnos: number;
    cupoMaximo: number;
  }[];
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ApiError {
  error: string;
}
