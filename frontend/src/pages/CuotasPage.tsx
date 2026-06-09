import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Check, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import type { Cuota, Alumno, EstadoCuota } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

const estadoBadge: Record<EstadoCuota, 'success' | 'warning' | 'destructive'> = {
  PAGADA: 'success',
  PENDIENTE: 'warning',
  VENCIDA: 'destructive',
};

export function CuotasPage() {
  const queryClient = useQueryClient();
  const [filtroEstado, setFiltroEstado] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alumnoId, setAlumnoId] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [importe, setImporte] = useState('');
  const [error, setError] = useState('');

  const queryParams = filtroEstado !== 'all' ? `?estado=${filtroEstado}` : '';

  const { data: cuotas, isLoading } = useQuery({
    queryKey: ['cuotas', filtroEstado],
    queryFn: () => api.get<Cuota[]>(`/cuotas${queryParams}`),
  });

  const { data: alumnos } = useQuery({
    queryKey: ['alumnos'],
    queryFn: () => api.get<Alumno[]>('/alumnos?estado=ACTIVO'),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      api.post('/cuotas', { alumnoId, fechaVencimiento, importe: parseFloat(importe) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cuotas'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setDialogOpen(false);
      setAlumnoId('');
      setFechaVencimiento('');
      setImporte('');
    },
    onError: (err: Error) => setError(err.message),
  });

  const pagarMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/cuotas/${id}/pagar`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cuotas'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/cuotas/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cuotas'] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Cuotas</h1>
          <p className="text-muted-foreground">Gestión de pagos y vencimientos</p>
        </div>
        <Button variant="gold" onClick={() => { setDialogOpen(true); setError(''); }}>
          <Plus className="h-4 w-4" /> Nueva cuota
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Label>Filtrar:</Label>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="max-w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="PAGADA">Pagadas</SelectItem>
                <SelectItem value="PENDIENTE">Pendientes</SelectItem>
                <SelectItem value="VENCIDA">Vencidas</SelectItem>
              </SelectContent>
            </Select>
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
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Importe</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cuotas?.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      {c.alumno?.apellido}, {c.alumno?.nombre}
                    </TableCell>
                    <TableCell>{formatDate(c.fechaVencimiento)}</TableCell>
                    <TableCell>{formatCurrency(c.importe)}</TableCell>
                    <TableCell>
                      <Badge variant={estadoBadge[c.estado]}>{c.estado}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {c.estado !== 'PAGADA' && (
                          <Button variant="ghost" size="icon" onClick={() => pagarMutation.mutate(c.id)} title="Marcar pagada">
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { if (confirm('¿Eliminar cuota?')) deleteMutation.mutate(c.id); }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!cuotas?.length && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No hay cuotas registradas
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
            <DialogTitle>Nueva cuota</DialogTitle>
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
              <Label>Fecha vencimiento</Label>
              <Input type="date" value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Importe</Label>
              <Input type="number" min={0} step={0.01} value={importe} onChange={(e) => setImporte(e.target.value)} placeholder="15000" />
            </div>
            <Button
              variant="gold"
              className="w-full"
              disabled={!alumnoId || !fechaVencimiento || !importe || createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              Crear cuota
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
