// src/components/staff/StaffDetailDialog.tsx
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  import { Eye } from "lucide-react";
  import StaffDetailView from "./StaffDetailView";
  
  interface StaffDetailDialogProps {
    staffId: string;
    trigger?: React.ReactNode;
  }
  
  const StaffDetailDialog = ({ staffId, trigger }: StaffDetailDialogProps) => {
    return (
      <Dialog>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detalles del Personal</DialogTitle>
          </DialogHeader>
          <StaffDetailView 
            staffId={staffId} 
            onClose={() => {
              const closeButton = document.querySelector('[data-radix-focus-guard]');
              if (closeButton instanceof HTMLElement) {
                closeButton.click();
              }
            }} 
          />
        </DialogContent>
      </Dialog>
    );
  };
  
  export default StaffDetailDialog;