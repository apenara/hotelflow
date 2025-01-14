// src/components/staff/MaintenanceHistory.tsx
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Maintenance } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, AlertTriangle, CheckCircle, Timer } from 'lucide-react';

interface MaintenanceHistoryProps {
  staffId: string;
  hotelId: string;
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800'
};

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-orange-100 text-orange-800',
  high: 'bg-red-100 text-red-800'
};

const STATUS_LABELS = {
  pending: 'Pendiente',
  in_progress: 'En Progreso',
  completed: 'Completado'
};

const PRIORITY_LABELS = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta'
};

const MaintenanceHistory = ({ staffId, hotelId }: MaintenanceHistoryProps) => {
  const [maintenanceRecords, setMaintenanceRecords] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalTasks: 0,
    completedTasks: 0,
    averageTime: 0,
    averageRating: 0
  });

  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    const fetchMaintenanceHistory = async () => {
      try {
        const maintenanceRef = collection(db, 'hotels', hotelId, 'maintenance');
        const q = query(
          maintenanceRef,
          where('staffId', '==', staffId),
          orderBy('createdAt', 'desc')
        );
        
        const snapshot = await getDocs(q);
        const records = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Maintenance[];
        
        setMaintenanceRecords(records);
        
        // Calcular métricas
        const completed = records.filter(r => r.status === 'completed');
        const totalTime = completed.reduce((acc, r) => acc + (r.timeSpent || 0), 0);
        const totalRating = completed.reduce((acc, r) => acc + (r.rating || 0), 0);
        
        setMetrics({
          totalTasks: records.length,
          completedTasks: completed.length,
          averageTime: completed.length ? Math.round(totalTime / completed.length) : 0,
          averageRating: completed.length ? +(totalRating / completed.length).toFixed(1) : 0
        });
        
      } catch (error) {
        console.error('Error al cargar historial de mantenimiento:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenanceHistory();
  }, [staffId, hotelId]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp.seconds * 1000).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  if (loading) {
    return <div className="text-center py-4">Cargando historial...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Historial de Mantenimientos</h3>
        <Button onClick={() => setShowAddDialog(true)}>
          Registrar Mantenimiento
        </Button>
      </div>

      {/* Métricas Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">Total Tareas</div>
          <div className="text-2xl font-bold">{metrics.totalTasks}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">Completadas</div>
          <div className="text-2xl font-bold">{metrics.completedTasks}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">Tiempo Promedio</div>
          <div className="text-2xl font-bold">{formatTime(metrics.averageTime)}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">Calificación</div>
          <div className="text-2xl font-bold">{metrics.averageRating}/5</div>
        </div>
      </div>

      {/* Lista de Mantenimientos */}
      <ScrollArea className="h-[400px] rounded-md border">
        <div className="space-y-4 p-4">
          {maintenanceRecords.length === 0 ? (
            <div className="text-center text-gray-500">
              No hay registros de mantenimiento
            </div>
          ) : (
            maintenanceRecords.map((record) => (
              <div key={record.id} className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{record.location}</div>
                    <div className="text-sm text-gray-500">{record.description}</div>
                    <div className="mt-2 flex gap-2">
                      <Badge className={STATUS_COLORS[record.status]}>
                        {STATUS_LABELS[record.status]}
                      </Badge>
                      <Badge className={PRIORITY_COLORS[record.priority]}>
                        {PRIORITY_LABELS[record.priority]}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {formatDate(record.createdAt)}
                  </div>
                </div>
                {record.status === 'completed' && (
                  <div className="mt-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Timer className="w-4 h-4" />
                      <span>Tiempo: {formatTime(record.timeSpent || 0)}</span>
                    </div>
                    {record.rating && (
                      <div className="flex items-center gap-1">
                        <span>Calificación: {record.rating}/5</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Diálogo para agregar mantenimiento */}
      {showAddDialog && (
        <MaintenanceFormDialog
          hotelId={hotelId}
          staffId={staffId}
          isOpen={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onSuccess={() => {
            setShowAddDialog(false);
            fetchMaintenanceHistory(); // Recargar los datos
          }}
        />
      )}
    </div>
  );
};

export default MaintenanceHistory;