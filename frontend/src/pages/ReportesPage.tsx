import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Alumno, Asistencia, Cuota } from '@/types';
import { formatDate, formatCurrency, todayISO } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface ReporteHorario {
  horario: {
    id: string;
    nombreHorario: string;
    horaInicio: string;
    horaFin: string;
    cupoMaximo: number;
    totalInscriptos: number;
  };
  alumnos: Alumno[];
}

interface ReporteAsistencias {
  total: number;
  periodo: { desde: string; hasta: string };
  detalle: Asistencia[];
}

interface ReporteCuotasVencidas {
  total: number;
  totalImporte: number;
  cuotas: Cuota[];
}

export function ReportesPage() {
  const [tab, setTab] = useState<'horarios' | 'asistencias' | 'cuotas'>('horarios');
  const [fechaDesde, setFechaDesde] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [fechaHasta, setFechaHasta] = useState(todayISO());

  const { data: reporteHorarios, isLoading: loadingHorarios } = useQuery({
    queryKey: ['reporte-horarios'],
    queryFn: () => api.get<ReporteHorario[]>('/reportes/alumnos-por-horario'),
    enabled: tab === 'horarios',
  });

  const { data: reporteAsistencias, isLoading: loadingAsistencias, refetch: refetchAsistencias } = useQuery({
    queryKey: ['reporte-asistencias', fechaDesde, fechaHasta],
    queryFn: () =>
      api.get<ReporteAsistencias>(
        `/reportes/asistencias?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}`
      ),
    enabled: tab === 'asistencias',
  });

  const { data: reporteCuotas, isLoading: loadingCuotas } = useQuery({
    queryKey: ['reporte-cuotas'],
    queryFn: () => api.get<ReporteCuotasVencidas>('/reportes/cuotas-vencidas'),
    enabled: tab === 'cuotas',
  });

  const tabs = [
    { id: 'horarios' as const, label: 'Alumnos por horario' },
    { id: 'asistencias' as const, label: 'Asistencias por período' },
    { id: 'cuotas' as const, label: 'Cuotas vencidas' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reportes</h1>
        <p className="text-muted-foreground">Informes y estadísticas del gimnasio</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <Button
            key={t.id}
            variant={tab === t.id ? 'gold' : 'outline'}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {tab === 'horarios' && (
        <div className="space-y-4">
          {loadingHorarios ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            reporteHorarios?.map((r) => (
              <Card key={r.horario.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{r.horario.nombreHorario}</CardTitle>
                    <Badge variant="gold">
                      {r.horario.totalInscriptos} / {r.horario.cupoMaximo}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {r.horario.horaInicio} - {r.horario.horaFin}
                  </p>
                </CardHeader>
                <CardContent>
                  {r.alumnos.length ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Apellido</TableHead>
                          <TableHead>Nombre</TableHead>
                          <TableHead>DNI</TableHead>
                          <TableHead>Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {r.alumnos.map((a) => (
                          <TableRow key={a.id}>
                            <TableCell>{a.apellido}</TableCell>
                            <TableCell>{a.nombre}</TableCell>
                            <TableCell>{a.dni}</TableCell>
                            <TableCell>
                              <Badge variant={a.estado === 'ACTIVO' ? 'success' : 'default'}>{a.estado}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">Sin alumnos inscriptos</p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {tab === 'asistencias' && (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <Label>Desde</Label>
                <Input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Hasta</Label>
                <Input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
              </div>
              <Button variant="gold" onClick={() => refetchAsistencias()}>Generar</Button>
            </div>
            {reporteAsistencias && (
              <p className="text-sm text-muted-foreground mt-2">
                Total asistencias: <strong>{reporteAsistencias.total}</strong>
              </p>
            )}
          </CardHeader>
          <CardContent>
            {loadingAsistencias ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Alumno</TableHead>
                    <TableHead>Horario</TableHead>
                    <TableHead>Hora</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reporteAsistencias?.detalle.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>{formatDate(a.fecha)}</TableCell>
                      <TableCell>{a.alumno?.apellido}, {a.alumno?.nombre}</TableCell>
                      <TableCell>{a.horario?.nombreHorario}</TableCell>
                      <TableCell>{a.horaIngreso}</TableCell>
                    </TableRow>
                  ))}
                  {!reporteAsistencias?.detalle.length && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No hay asistencias en el período seleccionado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'cuotas' && (
        <Card>
          <CardHeader>
            {reporteCuotas && (
              <div className="flex gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Total cuotas vencidas</p>
                  <p className="text-2xl font-bold">{reporteCuotas.total}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Importe total adeudado</p>
                  <p className="text-2xl font-bold text-destructive">{formatCurrency(reporteCuotas.totalImporte)}</p>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {loadingCuotas ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alumno</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead>Importe</TableHead>
                    <TableHead>Teléfono</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reporteCuotas?.cuotas.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.alumno?.apellido}, {c.alumno?.nombre}</TableCell>
                      <TableCell>{formatDate(c.fechaVencimiento)}</TableCell>
                      <TableCell>{formatCurrency(c.importe)}</TableCell>
                      <TableCell>{c.alumno?.telefono ?? '-'}</TableCell>
                    </TableRow>
                  ))}
                  {!reporteCuotas?.cuotas.length && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No hay cuotas vencidas
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
