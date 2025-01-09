// src/components/hotels/RoomStatusMenu.tsx
'use client';

import { BedDouble, Check, Paintbrush, AlertTriangle, Clock, Moon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { updateDoc, doc, addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

const estados = [
  { id: 'available', label: 'Disponible', icon: <Check className="h-4 w-4" />, color: 'text-green-600' },
  { id: 'occupied', label: 'Ocupada', icon: <BedDouble className="h-4 w-4" />, color: 'text-red-600' },
  { id: 'cleaning', label: 'Limpieza', icon: <Paintbrush className="h-4 w-4" />, color: 'text-blue-600' },
  { id: 'maintenance', label: 'Mantenimiento', icon: <AlertTriangle className="h-4 w-4" />, color: 'text-yellow-600' },
  { id: 'do_not_disturb', label: 'No Molestar', icon: <Moon className="h-4 w-4" />, color: 'text-purple-600' },
  { id: 'check_out', label: 'Check-out', icon: <Clock className="h-4 w-4" />, color: 'text-orange-600' },
];

interface RoomStatusMenuProps {
  habitacionId: string;
  hotelId: string;
  estadoActual: string;
  onStatusChange: () => void;
  currentUser: any;
}

export function RoomStatusMenu({ 
  habitacionId, 
  hotelId, 
  estadoActual, 
  onStatusChange,
  currentUser 
}: RoomStatusMenuProps) {
  const handleStatusChange = async (newStatus: string) => {
    try {
      const habitacionRef = doc(db, 'hotels', hotelId, 'rooms', habitacionId);
      const timestamp = new Date();

      // Asegurar que tenemos un estado actual válido
      const currentStatus = estadoActual || 'available';

      // Actualizar estado de la habitación
      await updateDoc(habitacionRef, {
        status: newStatus,
        lastStatusChange: timestamp,
        ...(newStatus === 'cleaning' && { lastCleaning: timestamp })
      });

      // Registrar en el historial
      const historyRef = collection(db, 'hotels', hotelId, 'rooms', habitacionId, 'history');
      await addDoc(historyRef, {
        previousStatus: currentStatus,
        newStatus,
        timestamp,
        userName: currentUser.name || 'Usuario',
        userId: currentUser.uid,
        notes: ''
      });

      onStatusChange();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar el estado de la habitación');
    }
  };

  // Asegurar que tenemos un estado actual válido
  const safeEstadoActual = estadoActual || 'available';
  const currentStatus = estados.find(e => e.id === safeEstadoActual) || estados[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="w-full justify-start"
          onClick={(e) => e.stopPropagation()} // Evitar que se abra el detalle al hacer clic en el menú
        >
          <div className={`mr-2 ${currentStatus.color}`}>
            {currentStatus.icon}
          </div>
          {currentStatus.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {estados.map((estado) => (
          <DropdownMenuItem
            key={estado.id}
            onClick={(e) => {
              e.stopPropagation(); // Evitar que se abra el detalle al seleccionar un estado
              handleStatusChange(estado.id);
            }}
            className="cursor-pointer"
          >
            <div className={`mr-2 ${estado.color}`}>
              {estado.icon}
            </div>
            {estado.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}