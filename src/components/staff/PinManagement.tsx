// src/components/staff/PinManagement.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export function PinManagement({ staffMember, hotelId, onUpdate }) {
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Generar PIN aleatorio
  const generateRandomPin = () => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setNewPin(pin);
    setConfirmPin(pin);
  };

  // Validar PIN
  const validatePin = () => {
    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      setError('El PIN debe contener 4 números');
      return false;
    }
    if (newPin !== confirmPin) {
      setError('Los PINs no coinciden');
      return false;
    }
    return true;
  };

  // Actualizar PIN
  const handleUpdatePin = async () => {
    if (!validatePin()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const staffRef = doc(db, 'hotels', hotelId, 'staff', staffMember.id);
      await updateDoc(staffRef, {
        pin: newPin,
        pinUpdatedAt: new Date(),
        lastModifiedBy: staffMember.id // o el ID del admin que hace el cambio
      });

      setSuccess('PIN actualizado exitosamente');
      onUpdate && onUpdate();
      
      // Cerrar diálogo después de 2 segundos
      setTimeout(() => {
        setShowPinDialog(false);
        setNewPin('');
        setConfirmPin('');
      }, 2000);

    } catch (error) {
      console.error('Error updating PIN:', error);
      setError('Error al actualizar el PIN');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">
              PIN de Acceso - {staffMember.name}
            </CardTitle>
            <Button 
              onClick={() => setShowPinDialog(true)}
              variant="outline"
            >
              Cambiar PIN
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-500">
                Último cambio: {staffMember.pinUpdatedAt 
                  ? new Date(staffMember.pinUpdatedAt.seconds * 1000).toLocaleString()
                  : 'No registrado'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar PIN de Acceso</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="bg-green-100">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Nuevo PIN</label>
              <div className="flex space-x-2">
                <Input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  maxLength={4}
                  placeholder="Nuevo PIN de 4 dígitos"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={generateRandomPin}
                >
                  Generar
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Confirmar PIN</label>
              <Input
                type="password"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                maxLength={4}
                placeholder="Confirmar PIN"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowPinDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpdatePin}
                disabled={isLoading}
              >
                {isLoading ? 'Actualizando...' : 'Guardar PIN'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}