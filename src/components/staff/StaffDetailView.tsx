// src/components/staff/StaffDetailView.tsx
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Staff, StaffRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import MaintenanceHistory from './MaintenanceHistory';
import { useAuth } from '@/lib/auth'; // Agregamos useAuth
import { 
  Clock, 
  Calendar,
  MapPin,
  Phone,
  Mail,
  User,
  Shield,
  ClipboardList
} from 'lucide-react';

const ROLES = {
  'housekeeping': { label: 'Housekeeping', color: 'bg-blue-100 text-blue-800' },
  'maintenance': { label: 'Mantenimiento', color: 'bg-yellow-100 text-yellow-800' },
  'reception': { label: 'Recepción', color: 'bg-green-100 text-green-800' },
  'manager': { label: 'Gerente', color: 'bg-purple-100 text-purple-800' }
};

interface StaffDetailViewProps {
  staffId: string;
  onClose?: () => void;
}

const StaffDetailView = ({ staffId, onClose }: StaffDetailViewProps) => {
  const { user } = useAuth(); // Obtenemos el hotelId del contexto de autenticación
  const [staffData, setStaffData] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaffData = async () => {
      if (!user?.hotelId) return;
      
      try {
        // Actualizamos la ruta para incluir hotelId
        const staffDoc = await getDoc(doc(db, 'hotels', user.hotelId, 'staff', staffId));
        if (staffDoc.exists()) {
          setStaffData({ id: staffDoc.id, ...staffDoc.data() } as Staff);
        }
      } catch (error) {
        console.error('Error al cargar datos del personal:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, [staffId, user?.hotelId]);

  if (loading) {
    return <div className="flex items-center justify-center p-4">Cargando datos del personal...</div>;
  }

  if (!staffData) {
    return <div className="text-red-500 p-4">No se encontró la información del personal</div>;
  }

  const getRoleBadgeColor = (role: StaffRole) => {
    return ROLES[role]?.color || 'bg-gray-100 text-gray-800';
  };

  const getShiftBadgeColor = (shift: string) => {
    const colors = {
      morning: 'bg-yellow-100 text-yellow-800',
      evening: 'bg-orange-100 text-orange-800',
      night: 'bg-indigo-100 text-indigo-800'
    };
    return colors[shift] || 'bg-gray-100 text-gray-800';
  };

  const getShiftLabel = (shift: string) => {
    const labels = {
      morning: 'Mañana',
      evening: 'Tarde',
      night: 'Noche'
    };
    return labels[shift] || shift;
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp.seconds * 1000).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full">
      <div className="border-b p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{staffData.name}</h2>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary" className={getRoleBadgeColor(staffData.role)}>
                {ROLES[staffData.role]?.label || staffData.role}
              </Badge>
              <Badge variant="secondary" className={getShiftBadgeColor(staffData.shift)}>
                {getShiftLabel(staffData.shift)}
              </Badge>
              <Badge variant="outline" className={
                staffData.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }>
                {staffData.status === 'active' ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="schedule">Horario</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <div className="space-y-4 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>{staffData.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>{staffData.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>Turno: {getShiftLabel(staffData.shift)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>Fecha de ingreso: {formatDate(staffData.createdAt)}</span>
              </div>
              {staffData.assignedAreas && (
                <div className="flex items-center gap-2 col-span-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>Áreas asignadas: {staffData.assignedAreas.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="schedule">
          <div className="p-6">
            <div className="space-y-4">
              <p className="text-gray-500">El horario detallado se implementará en la siguiente fase</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="p-6">
            <MaintenanceHistory staffId={staffId} hotelId={user?.hotelId} />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 p-6 border-t">
        <Button variant="outline" onClick={onClose}>
          Cerrar
        </Button>
        <Button>
          Editar Información
        </Button>
      </div>
    </div>
  );
};

export default StaffDetailView;