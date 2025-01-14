// src/app/rooms/[hotelId]/[roomId]/staff/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { doc, getDoc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BedDouble,
  Check,
  Clock,
  Paintbrush,
  AlertTriangle,
  Loader2,
  History
} from 'lucide-react';

// Estados disponibles para el staff
const STAFF_STATES = {
  'available': {
    label: 'Disponible',
    icon: <Check className="h-5 w-5" />,
    color: 'bg-green-100 border-green-500 text-green-700'
  },
  'occupied': {
    label: 'Ocupada',
    icon: <BedDouble className="h-5 w-5" />,
    color: 'bg-red-100 border-red-500 text-red-700'
  },
  'cleaning': {
    label: 'En Limpieza',
    icon: <Paintbrush className="h-5 w-5" />,
    color: 'bg-blue-100 border-blue-500 text-blue-700'
  },
  'maintenance': {
    label: 'En Mantenimiento',
    icon: <AlertTriangle className="h-5 w-5" />,
    color: 'bg-yellow-100 border-yellow-500 text-yellow-700'
  },
  'inspection': {
    label: 'En Inspección',
    icon: <Clock className="h-5 w-5" />,
    color: 'bg-purple-100 border-purple-500 text-purple-700'
  }
};

export default function StaffRoomView() {
  const params = useParams();
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchRoomData = async () => {
      if (!params?.hotelId || !params?.roomId) return;

      try {
        setLoading(true);
        const hotelDoc = await getDoc(doc(db, 'hotels', params.hotelId));
        const roomDoc = await getDoc(doc(db, 'hotels', params.hotelId, 'rooms', params.roomId));

        if (!hotelDoc.exists() || !roomDoc.exists()) {
          throw new Error('Habitación no encontrada');
        }

        setHotel({ id: hotelDoc.id, ...hotelDoc.data() });
        setRoom({ id: roomDoc.id, ...roomDoc.data() });
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [params]);

  const handleStateChange = async (newState) => {
    if (!user || !notes.trim()) { 
      setError('Por favor, añade una nota sobre el cambio de estado');
      return;
    }

    try {
      const timestamp = new Date();
      const roomRef = doc(db, 'hotels', params.hotelId, 'rooms', params.roomId);

      // Actualizar estado de la habitación
      await updateDoc(roomRef, {
        status: newState,
        lastStatusChange: timestamp,
        lastUpdatedBy: {
          id: user.uid,
          name: user.name,
          role: user.role
        }
      });

      // Registrar en el historial
      const historyRef = collection(db, 'hotels', params.hotelId, 'rooms', params.roomId, 'history');
      await addDoc(historyRef, {
        previousStatus: room.status,
        newStatus: newState,
        timestamp,
        notes,
        staffMember: {
          id: user.uid,
          name: user.name,
          role: user.role
        }
      });

      setSuccessMessage('Estado actualizado correctamente');
      setNotes('');
      // Actualizar estado local
      setRoom(prev => ({ ...prev, status: newState }));

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al actualizar el estado');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>
            {hotel?.hotelName} - Habitación {room?.number}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {successMessage && (
            <Alert className="bg-green-100">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(STAFF_STATES).map(([state, info]) => (
              <Button
                key={state}
                variant="outline"
                className={`flex flex-col items-center p-6 h-auto ${
                  room?.status === state ? info.color : ''
                }`}
                onClick={() => handleStateChange(state)}
              >
                {info.icon}
                <span className="mt-2">{info.label}</span>
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="font-medium">Notas del cambio:</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Añade detalles sobre el cambio de estado..."
              className="min-h-[100px]"
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <History className="h-4 w-4" />
              <span>
                Último cambio:{' '}
                {room?.lastStatusChange
                  ? new Date(room.lastStatusChange.seconds * 1000).toLocaleString()
                  : 'No registrado'}
              </span>
            </div>
            {room?.lastUpdatedBy && (
              <div className="text-sm text-gray-600 mt-1">
                Por: {room.lastUpdatedBy.name} ({room.lastUpdatedBy.role})
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}