// src/app/rooms/[hotelId]/[roomId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Moon, Paintbrush, Waves, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useParams } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { useAuth } from '@/lib/auth';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { Label } from '@/components/ui/label';
import { PinLogin } from '@/components/PinLogin';


export default function PublicRoomView() {
  const params = useParams();
  const [room, setRoom] = useState(null);
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [message, setMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { user } = useAuth();
  const [showPinLogin, setShowPinLogin] = useState(false)
  const [showStaffLogin, setShowStaffLogin] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);


  const handleStaffAccess = (staffMember) => {
    // Guardar la información del staff en localStorage o context
    localStorage.setItem('staffAccess', JSON.stringify({
      id: staffMember.id,
      name: staffMember.name,
      role: staffMember.role,
      timestamp: new Date().toISOString()
    }));
    
    // Redirigir a la vista de staff
    window.location.href = `/rooms/${params.hotelId}/${params.roomId}/staff`;
  };
  const handleStaffLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      await signInWithEmailAndPassword(
        auth,
        loginData.email,
        loginData.password
      );
      // El login fue exitoso, cerrar el diálogo
      setShowStaffLogin(false);
    } catch (error) {
      console.error('Error de login:', error);
      setLoginError('Credenciales inválidas');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const StaffLoginDialog = () => (
    <Dialog open={showStaffLogin} onOpenChange={setShowStaffLogin}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Acceso del Personal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleStaffLogin} className="space-y-4">
          {loginError && (
            <Alert variant="destructive">
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => setShowStaffLogin(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoggingIn}>
              {isLoggingIn ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );

  useEffect(() => {
    const fetchRoomData = async () => {
      if (!params?.hotelId || !params?.roomId) return;
      
      try {
        setLoading(true);
        // Obtener datos del hotel
        const hotelDoc = await getDoc(doc(db, 'hotels', params.hotelId));
        if (!hotelDoc.exists()) {
          throw new Error('Hotel no encontrado');
        }
        setHotel({ id: hotelDoc.id, ...hotelDoc.data() });

        // Obtener datos de la habitación
        const roomDoc = await getDoc(doc(db, 'hotels', params.hotelId, 'rooms', params.roomId));
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
  }, [params]);

  const handleStatusChange = async (newStatus) => {
    if (!params?.hotelId || !params?.roomId) return;
    
    try {
      const roomRef = doc(db, 'hotels', params.hotelId, 'rooms', params.roomId);
      const timestamp = new Date();
      
      await updateDoc(roomRef, {
        status: newStatus,
        lastStatusChange: timestamp
      });

      // Registrar en el historial
      const historyRef = collection(db, 'hotels', params.hotelId, 'rooms', params.roomId, 'history');
      await addDoc(historyRef, {
        previousStatus: room?.status || 'unknown',
        newStatus,
        timestamp,
        source: 'guest',
        notes: `Solicitud de huésped: ${newStatus}`
      });

      // Crear una solicitud
      const requestsRef = collection(db, 'hotels', params.hotelId, 'requests');
      await addDoc(requestsRef, {
        roomId: params.roomId,
        roomNumber: room?.number,
        type: newStatus,
        status: 'pending',
        createdAt: timestamp
      });

      setSuccessMessage('Solicitud enviada correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      setRoom(prev => ({ ...prev, status: newStatus }));
    } catch (error) {
      console.error('Error:', error);
      setError('Error al procesar la solicitud');
    }
  };

  const handleMessageSubmit = async () => {
    if (!message.trim() || !params?.hotelId || !params?.roomId) return;

    try {
      const requestsRef = collection(db, 'hotels', params.hotelId, 'requests');
      await addDoc(requestsRef, {
        roomId: params.roomId,
        roomNumber: room?.number,
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!room || !hotel) return null;

  return (
    <div className="p-4 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{hotel.hotelName} - Habitación {room.number}</CardTitle>
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
              onClick={() => handleStatusChange('need_cleaning')}
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
              <span>Solicitar Toallas</span>
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
                    {/* Separador */}
                    <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">
              Acceso del Personal
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline"
            onClick={() => setShowPinLogin(true)}
          >
            Acceso con PIN
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowStaffLogin(true)}
          >
            Acceso con Email
          </Button>
        </div>
        <PinLogin 
          isOpen={showPinLogin}
          onClose={() => setShowPinLogin(false)}
          onSuccess={handleStaffAccess}
          hotelId={params.hotelId}
        />
        <StaffLoginDialog />
      

          {/* Botón de acceso para staff */}
          {user ? (
            // Si el usuario está logueado, mostrar opciones de staff
            <Button 
              className="w-full"
              variant="outline"
              onClick={() => {
                // Redirigir a las opciones de staff
                window.location.href = `/rooms/${params.hotelId}/${params.roomId}/staff`;
              }}
            >
              Acceder a Opciones del Personal
            </Button>
          ) : (
            // Si no está logueado, mostrar botón de login
            <Button 
              className="w-full"
              variant="outline"
              onClick={() => setShowStaffLogin(true)}
            >
              Acceso Personal
            </Button>
          )}
          <StaffLoginDialog />
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