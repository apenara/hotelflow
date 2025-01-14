'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/firebase/config';
import { collection, query, getDocs, where, orderBy, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Filter, AlertCircle, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import MaintenanceStats from '@/components/maintenance/MaintenanceStats';
import MaintenanceReport from '@/components/maintenance/MaintenanceReport';
import MaintenanceFormDialog from '@/components/maintenance/MaintenanceFormDialog';
import { Maintenance, MaintenanceStatus, Staff } from '@/lib/types';

interface CompletionDialogProps {
  maintenance: Maintenance;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (notes: string) => void;
}

const CompletionDialog = ({ maintenance, isOpen, onClose, onComplete }: CompletionDialogProps) => {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    await onComplete(notes);
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Completar Mantenimiento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Ubicación</h4>
            <p className="text-sm text-gray-500">{maintenance.location}</p>
          </div>
          <div>
            <h4 className="font-medium">Descripción</h4>
            <p className="text-sm text-gray-500">{maintenance.description}</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Notas de Finalización</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe el trabajo realizado..."
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleComplete} disabled={loading}>
            {loading ? 'Guardando...' : 'Completar Mantenimiento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function MaintenancePage() {
  const { user } = useAuth();
  const [maintenanceList, setMaintenanceList] = useState<Maintenance[]>([]);
  const [maintenanceStaff, setMaintenanceStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null);
  const [activeTab, setActiveTab] = useState('pending');
  
  const fetchMaintenanceList = async () => {
    try {
      const maintenanceRef = collection(db, 'hotels', user.hotelId, 'maintenance');
      const snapshot = await getDocs(query(maintenanceRef, orderBy('createdAt', 'desc')));
      const maintenanceData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Maintenance[];
      
      setMaintenanceList(maintenanceData);

      // Cargar personal de mantenimiento
      const staffRef = collection(db, 'hotels', user.hotelId, 'staff');
      const staffQuery = query(staffRef, where('role', '==', 'maintenance'));
      const staffSnap = await getDocs(staffQuery);
      const staffData = staffSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Staff[];
      setMaintenanceStaff(staffData);
    } catch (error) {
      console.error('Error al cargar mantenimientos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.hotelId) {
      fetchMaintenanceList();
    }
  }, [user]);

  const handleCompleteMaintenance = async (maintenance: Maintenance, notes: string, evidence: { type: string, url: string }[]) => {
    try {
      const maintenanceRef = doc(db, 'hotels', user.hotelId, 'maintenance', maintenance.id);
      await updateDoc(maintenanceRef, {
        status: 'completed',
        completedAt: Timestamp.now(),
        notes,
        evidence,
        completedBy: user.uid
      });
      fetchMaintenanceList();
    } catch (error) {
      console.error('Error al completar mantenimiento:', error);
    }
  };

  const handleAssignStaff = async (maintenanceId: string, staffId: string) => {
    try {
      const maintenanceRef = doc(db, 'hotels', user.hotelId, 'maintenance', maintenanceId);
      await updateDoc(maintenanceRef, {
        assignedTo: staffId,
        status: 'in_progress'
      });
      fetchMaintenanceList();
    } catch (error) {
      console.error('Error al asignar personal:', error);
    }
  };

  const filterMaintenance = (maintenance: Maintenance) => {
    const searchMatch = maintenance.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       maintenance.description.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = activeTab === 'all' || maintenance.status === activeTab;
    return searchMatch && statusMatch;
  };

  const isOverdue = (maintenance: Maintenance) => {
    if (maintenance.status === 'completed') return false;
    const scheduledDate = new Date(maintenance.scheduledFor.seconds * 1000);
    return scheduledDate < new Date();
  };

  const getStatusBadge = (status: MaintenanceStatus, isOverdueTask: boolean) => {
    const statusColors = {
      pending: isOverdueTask ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800'
    };

    const statusLabels = {
      pending: isOverdueTask ? 'Vencido' : 'Pendiente',
      in_progress: 'En Progreso',
      completed: 'Completado'
    };

    return (
      <Badge className={statusColors[status]}>
        {statusLabels[status]}
      </Badge>
    );
  };

  return (
    <div className="p-6">
      {/* Panel de Estadísticas */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Estadísticas de Mantenimiento</CardTitle>
            <MaintenanceReport 
              maintenanceList={maintenanceList} 
              staffMap={maintenanceStaff.reduce((acc, staff) => ({
                ...acc,
                [staff.id]: { name: staff.name }
              }), {})}
            />
          </div>
        </CardHeader>
        <CardContent>
          <MaintenanceStats
            maintenanceList={maintenanceList}
            loading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Lista de Mantenimientos */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Mantenimientos</CardTitle>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Mantenimiento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros y Búsqueda */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar por ubicación o descripción..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Tabs para filtrar por estado */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="pending">Pendientes</TabsTrigger>
              <TabsTrigger value="in_progress">En Progreso</TabsTrigger>
              <TabsTrigger value="completed">Completados</TabsTrigger>
              <TabsTrigger value="all">Todos</TabsTrigger>
            </TabsList>

            {/* Lista de mantenimientos */}
            <TabsContent value={activeTab} className="mt-4">
              <div className="space-y-4">
                {maintenanceList.filter(filterMaintenance).map((maintenance) => {
                  const isOverdueTask = isOverdue(maintenance);
                  const assignedStaff = maintenanceStaff.find(s => s.id === maintenance.assignedTo);

                  return (
                    <div 
                      key={maintenance.id} 
                      className={`p-4 rounded-lg border ${isOverdueTask ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{maintenance.location}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            {maintenance.description}
                          </div>
                          <div className="flex items-center mt-2 space-x-2">
                            {getStatusBadge(maintenance.status, isOverdueTask)}
                            <Badge className={
                              maintenance.priority === 'high' ? 'bg-red-100 text-red-800' :
                              maintenance.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {maintenance.priority === 'high' ? 'Alta' :
                               maintenance.priority === 'medium' ? 'Media' : 'Baja'}
                            </Badge>
                            {assignedStaff && (
                              <span className="text-sm text-gray-500">
                                Asignado a: {assignedStaff.name}
                              </span>
                            )}
                          </div>
                          {isOverdueTask && (
                            <div className="flex items-center mt-2 text-red-600 text-sm">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              Vencido: {new Date(maintenance.scheduledFor.seconds * 1000).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {!maintenance.assignedTo && maintenance.status !== 'completed' && (
                            <Select
                              onValueChange={(value) => handleAssignStaff(maintenance.id, value)}
                            >
                              <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Asignar personal" />
                              </SelectTrigger>
                              <SelectContent>
                                {maintenanceStaff.map((staff) => (
                                  <SelectItem key={staff.id} value={staff.id}>
                                    {staff.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          {maintenance.status !== 'completed' && maintenance.assignedTo && (
                            <Button 
                              onClick={() => setSelectedMaintenance(maintenance)}
                              variant="outline"
                            >
                              Completar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {showAddDialog && (
        <MaintenanceFormDialog
          hotelId={user?.hotelId}
          isOpen={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onSuccess={() => {
            setShowAddDialog(false);
            fetchMaintenanceList();
          }}
        />
      )}

      {selectedMaintenance && (
        <CompletionDialog
          maintenance={selectedMaintenance}
          isOpen={true}
          onClose={() => setSelectedMaintenance(null)}
          onComplete={(notes) => handleCompleteMaintenance(selectedMaintenance, notes)}
        />
      )}
    </div>
  );
}