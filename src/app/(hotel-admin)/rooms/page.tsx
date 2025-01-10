// src/app/(hotel-admin)/rooms/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth';

export default function RoomsPage() {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Gestión de Habitaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="status">
            <TabsList>
              <TabsTrigger value="status">Estado</TabsTrigger>
              <TabsTrigger value="housekeeping">Limpieza</TabsTrigger>
              <TabsTrigger value="maintenance">Mantenimiento</TabsTrigger>
              <TabsTrigger value="history">Historial</TabsTrigger>
            </TabsList>
            
            <TabsContent value="status">
              {/* Aquí va el contenido actual del dashboard */}
            </TabsContent>

            <TabsContent value="housekeeping">
              {/* Vista de limpieza */}
            </TabsContent>

            <TabsContent value="maintenance">
              {/* Vista de mantenimiento */}
            </TabsContent>

            <TabsContent value="history">
              {/* Historial de cambios */}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}