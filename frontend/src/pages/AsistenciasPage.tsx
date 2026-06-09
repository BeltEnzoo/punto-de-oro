import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import type { Asistencia, Alumno, Horario } from '@/types';
import { formatDate, todayISO, nowTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export function AsistenciasPage() {
  const queryClient = useQueryClient();
  const [fecha, setFecha] = useState(todayISO());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alumnoId, setAlumnoId] = useState('');
  const [horarioId, setHorarioId] = useState('');
  const [horaIngreso, setHoraIngreso] = useState(nowTime());
  const [error, setError] = useState('');

  const { data: asistencias, isLoading } = useQuery({
    queryKey: ['asistencias', fecha],
    queryFn: () => api.get<Asistencia[]>(`/asistencias?fecha=${fecha}`),
  });

  const { data: alumnos } = useQuery({
    queryKey: ['alumnos'],
    queryFn: () => api.get<Alumno[]>('/alumnos?estado=ACTIVO'),
  });

  const { data: horarios } = useQuery({
    queryKey: ['horarios'],
    queryFn: () => api.get<Horario[]>('/horarios'),
  });

  const registrarMutation = useMutation({
    mutationFn: () =>
      api.post('/asistencias', { alumnoId, horarioId, fecha, horaIngreso }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asistencias'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setDialogOpen(false);
      setAlumnoId('');
      setHorarioId('');
    },
    onError: (err: Error) => setError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/asistencias/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asistencias'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Asistencias</h1>
          <p className="text-muted-foreground">Registro diario de asistencia</p>
        </div>
        <Button variant="gold" onClick={() => { setDialogOpen(true); setError(''); setHoraIngreso(nowTime()); }}>
          <Plus className="h-4 w-4" /> Registrar asistencia
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Label>Fecha:</Label>
            <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="max-w-[200px]" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alumno</TableHead>
                  <TableHead>Horario</TableHead>
                  <TableHead>Hora ingreso</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {asistencias?.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">
                      {a.alumno?.apellido}, {a.alumno?.nombre}
                    </TableCell>
                    <TableCell>{a.horario?.nombreHorario} ({a.horario?.horaInicio}-{a.horario?.horaFin})</TableCell>
                    <TableCell>{a.horaIngreso}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { if (confirm('¿Eliminar asistencia?')) deleteMutation.mutate(a.id); }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!asistencias?.length && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No hay asistencias para {formatDate(fecha)}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar asistencia</DialogTitle>
          </DialogHeader>
          {error && <div className="text-sm text-destructive">{error}</div>}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Alumno</Label>
              <Select value={alumnoId} onValueChange={setAlumnoId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar alumno" /></SelectTrigger>
                <SelectContent>
                  {alumnos?.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.apellido}, {a.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Horario</Label>
              <Select value={horarioId} onValueChange={setHorarioId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar horario" /></SelectTrigger>
                <SelectContent>
                  {horarios?.map((h) => (
                    <SelectItem key={h.id} value={h.id}>{h.nombreHorario} ({h.horaInicio}-{h.horaFin})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha</Label>
                <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Hora ingreso</Label>
                <Input type="time" value={horaIngreso} onChange={(e) => setHoraIngreso(e.target.value)} />
              </div>
            </div>
            <Button
              variant="gold"
              className="w-full"
              disabled={!alumnoId || !horarioId || registrarMutation.isPending}
              onClick={() => registrarMutation.mutate()}
            >
              Registrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
