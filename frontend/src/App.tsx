import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute, PublicRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { AlumnosPage } from '@/pages/AlumnosPage';
import { HorariosPage } from '@/pages/HorariosPage';
import { AsistenciasPage } from '@/pages/AsistenciasPage';
import { CuotasPage } from '@/pages/CuotasPage';
import { ReportesPage } from '@/pages/ReportesPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/alumnos" element={<AlumnosPage />} />
                <Route path="/horarios" element={<HorariosPage />} />
                <Route path="/asistencias" element={<AsistenciasPage />} />
                <Route path="/cuotas" element={<CuotasPage />} />
                <Route path="/reportes" element={<ReportesPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
