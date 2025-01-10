// src/app/rooms/[hotelId]/[roomId]/page.tsx
'use client';

import { use } from 'react';
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { BedDouble, Moon, Paintbrush, Waves, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function PublicRoomPage({  params: rawParams }) {
  const params = use(Promise.resolve(rawParams));
  const hotelId = params.hotelId;
  const roomId = params.roomId;


  const [room, setRoom] = useState(null);
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [message, setMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        
        // Obtener datos del hotel
        
        const hotelDoc = await getDoc(doc(db, 'hotels', hotelId));
        if (!hotelDoc.exists()) {
          throw new Error('Hotel no encontrado');
        }
        setHotel({ id: hotelDoc.id, ...hotelDoc.data() });
        
        // Obtener datos de la habitación
        const roomDoc = await getDoc(doc(db, 'hotels', hotelId, 'rooms', roomId));
        if (!roomDoc.exists()) {
          throw new Error('Habitación no encontrada');
        }
        setRoom({ id: roomDoc.id, ...roomDoc.data() });


      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [hotelId, roomId]);

  const handleStatusChange = async (newStatus) => {
    try {
      const roomRef = doc(db, 'hotels', hotelId, 'rooms', roomId);
      await updateDoc(roomRef, {
        status: newStatus,
        lastStatusChange: new Date()
      });

      // Registrar en el historial
      const historyRef = collection(db, 'hotels', hotelId, 'rooms', roomId, 'history');
      await addDoc(historyRef, {
        previousStatus: room.status,
        newStatus,
        timestamp: new Date(),
        source: 'guest',
        notes: `Estado actualizado por huésped a ${newStatus}`
      });

      setSuccessMessage('Solicitud enviada correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Actualizar estado local
      setRoom(prev => ({ ...prev, status: newStatus }));
    } catch (error) {
      console.error('Error:', error);
      setError('Error al actualizar el estado');
    }
  };

  const handleMessageSubmit = async () => {
    if (!message.trim()) return;

    try {
      const requestsRef = collection(db, 'hotels', hotelId, 'requests');
      await addDoc(requestsRef, {
        roomId,
        roomNumber: room.number,
        message,
        status: 'pending',
        createdAt: new Date(),
        type: 'guest_request'
      });

      setMessage('');
      setShowMessageDialog(false);
      setSuccessMessage('Mensaje enviado correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al enviar el mensaje');
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Cargando...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!room || !hotel) return <div className="p-4">No se encontró la habitación</div>;

  return (
    <div className="p-4 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            Habitación {room.number}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {successMessage && (
            <Alert className="mb-4 bg-green-100">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Button 
              className="flex flex-col items-center p-6 h-auto"
              variant="outline"
              onClick={() => handleStatusChange('do_not_disturb')}
            >
              <Moon className="h-8 w-8 mb-2" />
              <span>No Molestar</span>
            </Button>

            <Button 
              className="flex flex-col items-center p-6 h-auto"
              variant="outline"
              onClick={() => handleStatusChange('cleaning')}
            >
              <Paintbrush className="h-8 w-8 mb-2" />
              <span>Solicitar Limpieza</span>
            </Button>

            <Button 
              className="flex flex-col items-center p-6 h-auto"
              variant="outline"
              onClick={() => handleStatusChange('need_towels')}
            >
              <Waves className="h-8 w-8 mb-2" />
              <span>Cambio de Toallas</span>
            </Button>

            <Button 
              className="flex flex-col items-center p-6 h-auto"
              variant="outline"
              onClick={() => setShowMessageDialog(true)}
            >
              <MessageSquare className="h-8 w-8 mb-2" />
              <span>Enviar Mensaje</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar mensaje a recepción</DialogTitle>
            <DialogDescription>
              Escriba su mensaje y lo atenderemos lo antes posible
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Escriba su mensaje aquí..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleMessageSubmit}>
                Enviar Mensaje
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}