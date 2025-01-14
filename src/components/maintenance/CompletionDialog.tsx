// src/components/maintenance/CompletionDialog.tsx
import { useState, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase/config';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ImagePlus, X, Loader2, FileVideo } from 'lucide-react';
import Image from 'next/image';
import { Maintenance } from '@/lib/types';

interface CompletionDialogProps {
  maintenance: Maintenance;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (notes: string, evidence: { type: string, url: string }[]) => void;
}

const CompletionDialog = ({ maintenance, isOpen, onClose, onComplete }: CompletionDialogProps) => {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [evidence, setEvidence] = useState<{ file: File, preview: string, type: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 'video'
    }));

    setEvidence([...evidence, ...newFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setEvidence(prev => {
      const newEvidence = [...prev];
      URL.revokeObjectURL(newEvidence[index].preview);
      newEvidence.splice(index, 1);
      return newEvidence;
    });
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      setUploadingFiles(true);
      const uploadedFiles = await Promise.all(
        evidence.map(async (file) => {
          const fileRef = ref(storage, `maintenance-evidence/${maintenance.id}/${file.file.name}`);
          await uploadBytes(fileRef, file.file);
          const url = await getDownloadURL(fileRef);
          return { type: file.type, url };
        })
      );
      setUploadingFiles(false);

      await onComplete(notes, uploadedFiles);
    } catch (error) {
      console.error('Error al subir evidencias:', error);
    } finally {
      setLoading(false);
      evidence.forEach(file => URL.revokeObjectURL(file.preview));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Completar Mantenimiento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Ubicación</h4>
            <p className="text-sm text-gray-500">{maintenance.location}</p>
          </div>
          
          <div>
            <h4 className="font-medium">Descripción</h4>
            <p className="text-sm text-gray-500">{maintenance.description}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notas de Finalización</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe el trabajo realizado..."
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Evidencias</label>
            <div className="grid grid-cols-2 gap-4">
              {evidence.map((file, index) => (
                <div key={index} className="relative border rounded-lg p-2">
                  {file.type === 'image' ? (
                    <div className="relative aspect-video">
                      <Image
                        src={file.preview}
                        alt="Preview"
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center aspect-video bg-gray-100 rounded">
                      <FileVideo className="h-8 w-8 text-gray-400" />
                      <span className="ml-2 text-sm text-gray-500">
                        {file.file.name}
                      </span>
                    </div>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                className="h-32 border-dashed"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
              >
                <ImagePlus className="h-6 w-6 mr-2" />
                Agregar Evidencia
              </Button>
            </div>
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileSelect}
              multiple
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleComplete} 
            disabled={loading || uploadingFiles}
          >
            {loading || uploadingFiles ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {uploadingFiles ? 'Subiendo archivos...' : 'Completando...'}
              </>
            ) : (
              'Completar Mantenimiento'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CompletionDialog;