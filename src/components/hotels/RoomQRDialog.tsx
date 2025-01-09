// src/components/hotels/RoomQRDialog.tsx
'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from 'react';

export function RoomQRDialog({ room, hotelId, isOpen, onClose }) {
  const roomUrl = `${window.location.origin}/rooms/${hotelId}/${room.id}`;
  const [qrSize, setQrSize] = useState(256);

  const downloadQR = () => {
    const svg = document.getElementById("room-qr");
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = qrSize;
      canvas.height = qrSize;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR-Habitacion-${room.number}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Código QR - Habitación {room.number}</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-4">
          <div className="bg-white p-4 rounded-lg">
            <QRCodeSVG
              id="room-qr"
              value={roomUrl}
              size={qrSize}
              level="H"
              includeMargin={true}
            />
          </div>

          <div className="space-x-2">
            <select
              className="border rounded-md px-3 py-2"
              value={qrSize}
              onChange={(e) => setQrSize(Number(e.target.value))}
            >
              <option value="128">Pequeño (128px)</option>
              <option value="256">Mediano (256px)</option>
              <option value="512">Grande (512px)</option>
              <option value="1024">Muy Grande (1024px)</option>
            </select>

            <Button onClick={downloadQR}>
              Descargar QR
            </Button>
          </div>

          <div className="text-sm text-gray-500 text-center">
            <p>URL del QR:</p>
            <p className="font-mono break-all">{roomUrl}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}