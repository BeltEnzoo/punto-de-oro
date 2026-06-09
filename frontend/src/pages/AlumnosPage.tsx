import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search, UserPlus } from 'lucide-react';
import { api } from '@/lib/api';
import type { Alumno, EstadoAlumno, Horario } from '@/types';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface AlumnoForm {
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  direccion: string;
  fechaNacimiento: string;
  fechaInscripcion: string;
  estado: EstadoAlumno;
  observaciones: string;
}

const emptyForm: AlumnoForm = {
  nombre: '',
  apellido: '',
  dni: '',
  telefono: '',
  direccion: '',
  fechaNacimiento: '',
  fechaInscripcion: new Date().toISOString().split('T')[0],
  estado: 'ACTIVO',
  observaciones: '',
};

export function AlumnosPage() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inscripcionOpen, setInscripcionOpen] = useState(false);
  const [editing, setEditing] = useState<Alumno | null>(null);
  const [selectedAlumno, setSelectedAlumno] = useState<Alumno | null>(null);
  const [form, setForm] = useState<AlumnoForm>(emptyForm);
  const [horarioId, setHorarioId] = useState('');
  const [error, setError] = useState('');

  const { data: alumnos, isLoading } = useQuery({
    queryKey: ['alumnos', search],
    queryFn: () => api.get<Alumno[]>(`/alumnos${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  });

  const { data: horarios } = useQuery({
    queryKey: ['horarios'],
    queryFn: () => api.get<Horario[]>('/horarios'),
  });

  const saveMutation = useMutation({
    mutationFn: (data: AlumnoForm) =>
      editing ? api.put(`/alumnos/${editing.id}`, data) : api.post('/alumnos', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumnos'] });
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
    },
    onError: (err: Error) => setError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/alumnos/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alumnos'] }),
  });

  const inscribirMutation = useMutation({
    mutationFn: () => api.post('/inscripciones', { alumnoId: selectedAlumno!.id, horarioId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumnos'] });
      queryClient.invalidateQueries({ queryKey: ['horarios'] });
      setInscripcionOpen(false);
      setHorarioId('');
    },
    onError: (err: Error) => setError(err.message),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setDialogOpen(true);
  };

  const openEdit = (alumno: Alumno) => {
    setEditing(alumno);
    setForm({
      nombre: alumno.nombre,
      apellido: alumno.apellido,
      dni: alumno.dni,
      telefono: alumno.telefono ?? '',
      direccion: alumno.direccion ?? '',
      fechaNacimiento: alumno.fechaNacimiento.split('T')[0],
      fechaInscripcion: alumno.fechaInscripcion.split('T')[0],
      estado: alumno.estado,
      observaciones: alumno.observaciones ?? '',
    });
    setError('');
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(form);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Alumnos</h1>
          <p className="text-muted-foreground">Gestión de alumnos del gimnasio</p>
        </div>
        <Button variant="gold" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Nuevo alumno
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, apellido o DNI..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>DNI</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Inscripción</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alumnos?.map((alumno) => (
                  <TableRow key={alumno.id}>
                    <TableCell className="font-medium">{alumno.apellido}, {alumno.nombre}</TableCell>
                    <TableCell>{alumno.dni}</TableCell>
                    <TableCell>{alumno.telefono ?? '-'}</TableCell>
                    <TableCell>{formatDate(alumno.fechaInscripcion)}</TableCell>
                    <TableCell>
                      <Badge variant={alumno.estado === 'ACTIVO' ? 'success' : 'default'}>
                        {alumno.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setSelectedAlumno(alumno); setInscripcionOpen(true); setError(''); }}
                          title="Inscribir en horario"
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(alumno)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { if (confirm('¿Eliminar alumno?')) deleteMutation.mutate(alumno.id); }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!alumnos?.length && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No hay alumnos registrados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar alumno' : 'Nuevo alumno'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-sm text-destructive">{error}</div>}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Apellido</Label>
                <Input value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>DNI</Label>
                <Input value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Dirección</Label>
              <Input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha nacimiento</Label>
                <Input type="date" value={form.fechaNacimiento} onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Fecha inscripción</Label>
                <Input type="date" value={form.fechaInscripcion} onChange={(e) => setForm({ ...form, fechaInscripcion: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={form.estado} onValueChange={(v) => setForm({ ...form, estado: v as EstadoAlumno })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVO">Activo</SelectItem>
                  <SelectItem value="INACTIVO">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Observaciones</Label>
              <Textarea value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} />
            </div>
            <Button type="submit" variant="gold" className="w-full" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={inscripcionOpen} onOpenChange={setInscripcionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inscribir en horario</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">
            Alumno: {selectedAlumno?.apellido}, {selectedAlumno?.nombre}
          </p>
          {error && <div className="text-sm text-destructive mb-4">{error}</div>}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Horario</Label>
              <Select value={horarioId} onValueChange={setHorarioId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar horario" /></SelectTrigger>
                <SelectContent>
                  {horarios?.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.nombreHorario} ({h.horaInicio}-{h.horaFin}) - {h._count?.alumnos ?? 0}/{h.cupoMaximo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="gold"
              className="w-full"
              disabled={!horarioId || inscribirMutation.isPending}
              onClick={() => inscribirMutation.mutate()}
            >
              Inscribir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
