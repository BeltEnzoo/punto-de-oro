import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import type { Horario } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface HorarioForm {
  nombreHorario: string;
  horaInicio: string;
  horaFin: string;
  cupoMaximo: number;
}

const emptyForm: HorarioForm = { nombreHorario: '', horaInicio: '08:00', horaFin: '10:00', cupoMaximo: 20 };

export function HorariosPage() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Horario | null>(null);
  const [form, setForm] = useState<HorarioForm>(emptyForm);
  const [error, setError] = useState('');

  const { data: horarios, isLoading } = useQuery({
    queryKey: ['horarios'],
    queryFn: () => api.get<Horario[]>('/horarios'),
  });

  const saveMutation = useMutation({
    mutationFn: (data: HorarioForm) =>
      editing ? api.put(`/horarios/${editing.id}`, data) : api.post('/horarios', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['horarios'] });
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
    },
    onError: (err: Error) => setError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/horarios/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['horarios'] }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setDialogOpen(true);
  };

  const openEdit = (horario: Horario) => {
    setEditing(horario);
    setForm({
      nombreHorario: horario.nombreHorario,
      horaInicio: horario.horaInicio,
      horaFin: horario.horaFin,
      cupoMaximo: horario.cupoMaximo,
    });
    setError('');
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Horarios</h1>
          <p className="text-muted-foreground">Gestión de turnos y cupos</p>
        </div>
        <Button variant="gold" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Nuevo horario
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Horario</TableHead>
                  <TableHead>Cupo</TableHead>
                  <TableHead>Inscriptos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {horarios?.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="font-medium">{h.nombreHorario}</TableCell>
                    <TableCell>{h.horaInicio} - {h.horaFin}</TableCell>
                    <TableCell>{h.cupoMaximo}</TableCell>
                    <TableCell>
                      <Badge variant={(h._count?.alumnos ?? 0) >= h.cupoMaximo ? 'destructive' : 'gold'}>
                        {h._count?.alumnos ?? 0} / {h.cupoMaximo}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(h)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { if (confirm('¿Eliminar horario?')) deleteMutation.mutate(h.id); }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!horarios?.length && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No hay horarios registrados
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
            <DialogTitle>{editing ? 'Editar horario' : 'Nuevo horario'}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }}
            className="space-y-4"
          >
            {error && <div className="text-sm text-destructive">{error}</div>}
            <div className="space-y-2">
              <Label>Nombre del horario</Label>
              <Input value={form.nombreHorario} onChange={(e) => setForm({ ...form, nombreHorario: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hora inicio</Label>
                <Input type="time" value={form.horaInicio} onChange={(e) => setForm({ ...form, horaInicio: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Hora fin</Label>
                <Input type="time" value={form.horaFin} onChange={(e) => setForm({ ...form, horaFin: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cupo máximo</Label>
              <Input
                type="number"
                min={1}
                value={form.cupoMaximo}
                onChange={(e) => setForm({ ...form, cupoMaximo: parseInt(e.target.value) || 1 })}
                required
              />
            </div>
            <Button type="submit" variant="gold" className="w-full" disabled={saveMutation.isPending}>
              Guardar
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
