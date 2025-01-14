// src/components/staff/PinManagementDialog.tsx
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  import { useState } from 'react';
  import { doc, updateDoc } from 'firebase/firestore';
  import { db } from '@/lib/firebase/config';
  
  interface PinManagementDialogProps {
    staffId: string;
    hotelId: string; // Agregamos hotelId
    isOpen: boolean;
    onClose: () => void;
  }
  
  const PinManagementDialog = ({ staffId, hotelId, isOpen, onClose }: PinManagementDialogProps) => {
    const [newPin, setNewPin] = useState('');
    const [loading, setLoading] = useState(false);
  
    const generatePin = () => {
      const pin = Math.floor(1000 + Math.random() * 9000).toString();
      setNewPin(pin);
    };
  
    const handleSavePin = async () => {
      if (!newPin) {
        alert('Por favor genera un PIN primero');
        return;
      }
  
      setLoading(true);
      try {
        // Actualizamos la ruta para incluir hotelId
        await updateDoc(doc(db, 'hotels', hotelId, 'staff', staffId), {
          pin: newPin,
          pinUpdatedAt: new Date()
        });
        onClose();
      } catch (error) {
        console.error('Error al guardar el PIN:', error);
        alert('Error al guardar el PIN');
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gestionar PIN de Acceso</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  className="w-full p-2 text-2xl text-center border rounded"
                  value={newPin}
                  readOnly
                  placeholder="----"
                />
              </div>
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={generatePin}
                disabled={loading}
              >
                Generar Nuevo PIN
              </Button>
              <Button 
                onClick={handleSavePin}
                disabled={!newPin || loading}
              >
                Guardar PIN
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };
  
  export default PinManagementDialog;