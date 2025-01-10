// src/app/(hotel-admin)/staff/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function StaffPage() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Gestión de Personal</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="staff">
            <TabsList>
              <TabsTrigger value="staff">Personal</TabsTrigger>
              <TabsTrigger value="shifts">Turnos</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
              <TabsTrigger value="performance">Rendimiento</TabsTrigger>
            </TabsList>

            <TabsContent value="staff">
              {/* Lista de personal */}
            </TabsContent>

            <TabsContent value="shifts">
              {/* Gestión de turnos */}
            </TabsContent>

            <TabsContent value="roles">
              {/* Gestión de roles y permisos */}
            </TabsContent>

            <TabsContent value="performance">
              {/* Métricas de rendimiento */}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}