// src/app/(hotel-admin)/housekeeping/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function HousekeepingPage() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Gestión de Limpieza</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">Pendientes</TabsTrigger>
              <TabsTrigger value="in-progress">En Proceso</TabsTrigger>
              <TabsTrigger value="completed">Completadas</TabsTrigger>
              <TabsTrigger value="reports">Reportes</TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              {/* Lista de habitaciones pendientes de limpieza */}
            </TabsContent>

            <TabsContent value="in-progress">
              {/* Habitaciones en proceso de limpieza */}
            </TabsContent>

            <TabsContent value="completed">
              {/* Historial de limpiezas completadas */}
            </TabsContent>

            <TabsContent value="reports">
              {/* Reportes y estadísticas */}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}