// src/app/(hotel-admin)/maintenance/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MaintenancePage() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Gestión de Mantenimiento</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active">
            <TabsList>
              <TabsTrigger value="active">Activas</TabsTrigger>
              <TabsTrigger value="scheduled">Programadas</TabsTrigger>
              <TabsTrigger value="history">Historial</TabsTrigger>
              <TabsTrigger value="preventive">Preventivo</TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              {/* Incidencias activas */}
            </TabsContent>

            <TabsContent value="scheduled">
              {/* Mantenimientos programados */}
            </TabsContent>

            <TabsContent value="history">
              {/* Historial de mantenimientos */}
            </TabsContent>

            <TabsContent value="preventive">
              {/* Mantenimiento preventivo */}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}