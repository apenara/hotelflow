// src/components/hotels/RoomCard.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RoomStatusMenu } from './RoomStatusMenu';
import { RoomDetailDialog } from './RoomDetailDialog';
import { BedDouble, Check, Paintbrush, AlertTriangle, Clock, Moon } from 'lucide-react';


const getStatusIcon = (status) => {
  const icons = {
    available: <Check className="h-6 w-6 text-green-600" />,
    occupied: <BedDouble className="h-6 w-6 text-red-600" />,
    cleaning: <Paintbrush className="h-6 w-6 text-blue-600" />,
    maintenance: <AlertTriangle className="h-6 w-6 text-yellow-600" />,
    do_not_disturb: <Moon className="h-6 w-6 text-purple-600" />,
    check_out: <Clock className="h-6 w-6 text-orange-600" />
  };

  const baseIcon = icons[status] || icons.available;
  
  if (status === 'maintenance') {
    return <div className="animate-pulse">{baseIcon}</div>;
  }
  return baseIcon;
};

const getStatusColor = (status) => {
  const colors = {
    disponible: 'bg-green-50 border-green-500',
    ocupada: 'bg-red-50 border-red-500',
    cleaning: 'bg-blue-50 border-blue-500',
    maintenance: 'bg-yellow-50 border-yellow-500',
    do_not_disturb: 'bg-purple-50 border-purple-500',
    check_out: 'bg-orange-50 border-orange-500'
  };
  return colors[status] || colors.available;
};

const getStatusLabel = (status) => {
  const labels = {
    available: 'Disponible',
    occupied: 'Ocupada',
    cleaning: 'Limpieza',
    maintenance: 'Mantenimiento',
    do_not_disturb: 'No Molestar',
    check_out: 'Check-out'
  };
  return labels[status] || 'Disponible';
};

export function RoomCard({ room, hotelId, onStatusChange, currentUser }) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <>
      <Card 
        className={`relative hover:shadow-lg transition-shadow border-2 ${getStatusColor(room.status)}`}
        role="button"
        tabIndex={0}
        onClick={() => setShowDetail(true)}
      >
        <CardContent className="p-2">
          {/* Número de habitación y estado */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-bold">{room.number}</span>
            {getStatusIcon(room.status)}
          </div>

          {/* Menú de estado */}
          <div className="flex flex-col gap-2">
            <RoomStatusMenu 
              habitacionId={room.id}
              hotelId={hotelId}
              estadoActual={room.status}
              onStatusChange={onStatusChange}
              currentUser={currentUser}
            />

            {/* Tipo de habitación y estado de limpieza */}
            <div className="flex justify-between items-center text-xs text-gray-600">
              <Badge variant="outline" className="capitalize">
                {room.type || 'Standard'}
              </Badge>
              <Badge 
                className={`${room.lastCleaning ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"} text-white`}
              >
                {room.lastCleaning ? "Limpia" : "Pendiente"}
              </Badge>
            </div>

            {/* Estado actual */}
            <Badge 
              className={`w-full justify-center ${
                room.status === 'maintenance' ? 'animate-pulse' : ''
              } ${getStatusColor(room.status)} border-0`}
            >
              {getStatusLabel(room.status)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de detalles */}
      {showDetail && (
        <RoomDetailDialog 
          isOpen={showDetail}
          onClose={() => setShowDetail(false)}
          room={room}
          hotelId={hotelId}
        />
      )}
    </>
  );
}