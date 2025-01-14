'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/firebase/config';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, MoreVertical, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddStaffDialog from '@/components/staff/AddStaffDialog';
import StaffDetailDialog from '@/components/staff/StaffDetailDialog';
import PinManagementDialog from '@/components/staff/PinManagementDialog';
import { checkAndUpdateStaffStatus, setupEmailVerificationListener } from '@/lib/staff-service';

const ROLES = {
  'housekeeping': { label: 'Housekeeping', color: 'bg-blue-100 text-blue-800' },
  'maintenance': { label: 'Mantenimiento', color: 'bg-yellow-100 text-yellow-800' },
  'reception': { label: 'Recepción', color: 'bg-green-100 text-green-800' },
  'manager': { label: 'Gerente', color: 'bg-purple-100 text-purple-800' }
};

export default function StaffPage() {
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [selectedStaffForPin, setSelectedStaffForPin] = useState(null);

  useEffect(() => {
    if (user?.hotelId) {
      fetchStaff();
      // Configurar listener de verificación de email
      const unsubscribe = setupEmailVerificationListener(user.hotelId);
      return () => unsubscribe();
    }
  }, [user]);

  const fetchStaff = async () => {
    try {
      const staffRef = collection(db, 'hotels', user.hotelId, 'staff');
      const snapshot = await getDocs(staffRef);
      const staffData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStaff(staffData);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStaffStatus = async (staffMember) => {
    try {
      // Verificar que tenemos el ID del documento
      if (!staffMember.id) {
        throw new Error('Staff member ID is missing');
      }

      console.log('Toggling staff status for:', staffMember); // Para debugging

      const staffRef = doc(db, 'hotels', user.hotelId, 'staff', staffMember.id);
      await updateDoc(staffRef, {
        status: staffMember.status === 'active' ? 'inactive' : 'active',
        updatedAt: new Date()
      });

      alert(staffMember.status === 'active' ? 'Personal desactivado' : 'Personal activado');
      await fetchStaff();
    } catch (error) {
      console.error('Error toggling staff status:', error);
      alert('Error al cambiar el estado del personal. Por favor, intente nuevamente.');
    }
  };

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || member.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Personal del Hotel</CardTitle>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Personal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar por nombre o email..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="border rounded-md px-3 py-2"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="all">Todos los roles</option>
              {Object.entries(ROLES).map(([value, { label }]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Lista de personal */}
          <div className="divide-y">
            {filteredStaff.map((member) => (
              <div key={member.id} className="py-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium">{member.name}</div>
                  <div className="text-sm text-gray-500">{member.email}</div>
                  <div className="flex items-center mt-1 space-x-2">
                    <Badge className={ROLES[member.role]?.color}>
                      {ROLES[member.role]?.label}
                    </Badge>
                    <Badge className={member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {member.status === 'active' ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StaffDetailDialog 
                    staffId={member.id}
                    trigger={
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                        setSelectedStaffForPin(member.id);
                        setShowPinDialog(true);
                      }}>
                        Gestionar PIN
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleStaffStatus(member)}>
                        {member.status === 'active' ? 'Desactivar' : 'Activar'}
                      </DropdownMenuItem>
                      {member.status === 'pending' && (
                        <DropdownMenuItem onClick={() => {
                          checkAndUpdateStaffStatus(user.hotelId, member.id, member.authId)
                            .then(() => fetchStaff());
                        }}>
                          Verificar Estado
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {showAddDialog && (
        <AddStaffDialog
          hotelId={user?.hotelId}
          isOpen={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onSuccess={() => {
            setShowAddDialog(false);
            fetchStaff();
          }}
        />
      )}

      {showPinDialog && selectedStaffForPin && (
        <PinManagementDialog
          staffId={selectedStaffForPin}
          hotelId={user?.hotelId}
          isOpen={showPinDialog}
          onClose={() => {
            setShowPinDialog(false);
            setSelectedStaffForPin(null);
          }}
        />
      )}
    </div>
  );
}