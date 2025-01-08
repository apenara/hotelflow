// src/components/hotels/RoomCard.tsx
import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RoomStatusMenu } from './RoomStatusMenu';
import { RoomDetailDialog } from './RoomDetailDialog';

export function RoomCard({ room, hotelId, onStatusChange }) {
  const [showDetail, setShowDetail] = useState(false);

  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-green-100 border-green-500',
      occupied: 'bg-red-100 border-red-500',
      cleaning: 'bg-blue-100 border-blue-500',
      maintenance: 'bg-yellow-100 border-yellow-500 animate-pulse',
      do_not_disturb: 'bg-purple-100 border-purple-500',
      check_out: 'bg-orange-100 border-orange-500'
    };
    return colors[status] || 'bg-gray-100 border-gray-500';
  };

  const getStatusIcon = (status) => {
    const iconClass = status === 'maintenance' ? 'animate-pulse text-yellow-500' : '';
    // ... resto de la lógica de iconos
    return <div className={iconClass}>{/* icono */}</div>;
  };

  return (
    <>
      <Card 
        className={`relative hover:shadow-lg transition-shadow border-2 ${getStatusColor(room.status)} cursor-pointer`}
        onClick={() => setShowDetail(true)}
      >
        <CardContent className="p-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-base font-bold">{room.number}</span>
            {getStatusIcon(room.status)}
          </div>
          <div className="flex flex-col gap-1">
            <RoomStatusMenu 
              habitacionId={room.id}
              hotelId={hotelId}
              estadoActual={room.status}
              onStatusChange={onStatusChange}
            />
            <div className="flex justify-between items-center text-xs text-gray-600">
              <span>{room.type}</span>
              <Badge className={`${room.lastCleaning ? "bg-green-500" : "bg-red-500"} text-xs`}>
                {room.lastCleaning ? "L" : "PL"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <RoomDetailDialog 
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        room={room}
        hotelId={hotelId}
      />
    </>
  );
}