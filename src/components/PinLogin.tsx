// src/components/PinLogin.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export function PinLogin({ isOpen, onClose, onSuccess, hotelId }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePinInput = (number) => {
    if (pin.length < 4) {
      setPin(prevPin => prevPin + number);
    }
  };

  const handleBackspace = () => {
    setPin(prevPin => prevPin.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
  };

  const verifyPin = async () => {
    if (pin.length !== 4) return;

    setLoading(true);
    setError('');

    try {
      // Verificar el PIN en la colección de staff
      const staffRef = collection(db, 'hotels', hotelId, 'staff');
      const q = query(staffRef, where('pin', '==', pin));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError('PIN inválido');
        return;
      }

      const staffMember = {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data()
      };

      onSuccess(staffMember);
      onClose();
    } catch (error) {
      console.error('Error verifying PIN:', error);
      setError('Error al verificar PIN');
    } finally {
      setLoading(false);
    }
  };

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'back'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[350px]">
        <DialogHeader>
          <DialogTitle>Ingrese su PIN</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* PIN Display */}
          <div className="flex justify-center space-x-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`w-10 h-10 border-2 rounded-lg flex items-center justify-center text-2xl font-bold ${
                  pin[i] ? 'border-blue-500' : 'border-gray-300'
                }`}
              >
                {pin[i] ? '•' : ''}
              </div>
            ))}
          </div>

          {error && (
            <div className="text-red-500 text-center text-sm">
              {error}
            </div>
          )}

          {/* Number Pad */}
          <div className="grid grid-cols-3 gap-3">
            {numbers.map((num, index) => {
              if (num === null) return <div key={index} />;
              
              if (num === 'back') {
                return (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={handleBackspace}
                    className="h-14"
                  >
                    ←
                  </Button>
                );
              }

              return (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handlePinInput(num)}
                  className="h-14 text-xl"
                  disabled={pin.length >= 4}
                >
                  {num}
                </Button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleClear}
            >
              Limpiar
            </Button>
            <Button
              className="flex-1"
              onClick={verifyPin}
              disabled={pin.length !== 4 || loading}
            >
              {loading ? 'Verificando...' : 'Entrar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}