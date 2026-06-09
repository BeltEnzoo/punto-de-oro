import { useQuery } from '@tanstack/react-query';
import { Users, UserCheck, AlertTriangle, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import type { DashboardStats } from '@/types';
import { StatCard } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get<DashboardStats>('/dashboard/stats'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general del gimnasio</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Alumnos activos" value={data?.alumnosActivos ?? 0} icon={Users} variant="gold" loading={isLoading} />
        <StatCard title="Presentes hoy" value={data?.presentesHoy ?? 0} icon={UserCheck} variant="success" loading={isLoading} />
        <StatCard title="Cuotas vencidas" value={data?.cuotasVencidas ?? 0} icon={AlertTriangle} variant="warning" loading={isLoading} />
        <StatCard
          title="Horarios activos"
          value={data?.horariosPopulares?.length ?? 0}
          icon={Clock}
          loading={isLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Horarios con más alumnos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : data?.horariosPopulares?.length ? (
            <div className="space-y-3">
              {data.horariosPopulares.map((h) => (
                <div key={h.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium">{h.nombreHorario}</p>
                    <p className="text-sm text-muted-foreground">
                      {h.horaInicio} - {h.horaFin}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="gold">
                      {h.totalAlumnos} / {h.cupoMaximo}
                    </Badge>
                    <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-gold rounded-full transition-all"
                        style={{ width: `${Math.min((h.totalAlumnos / h.cupoMaximo) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No hay horarios registrados</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
