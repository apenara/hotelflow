'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, orderBy } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus } from 'lucide-react';
import RoomFormDialog from '@/components/hotels/room-form-dialog';

export default function RoomsPage({ params }) {
  const hotelId = params.hotelId;
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchRooms();
  }, [hotelId]);

  const fetchRooms = async () => {
    try {
      const roomsRef = collection(db, 'hotels', hotelId, 'rooms');
      const q = query(roomsRef, orderBy('number'));
      const snapshot = await getDocs(q);
      const roomsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRooms(roomsData);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      available: 'bg-green-100 text-green-800',
      occupied: 'bg-red-100 text-red-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      cleaning: 'bg-blue-100 text-blue-800'
    };
    const labels = {
      available: 'Disponible',
      occupied: 'Ocupada',
      maintenance: 'Mantenimiento',
      cleaning: 'Limpieza'
    };
    return <Badge className={styles[status]}>{labels[status]}</Badge>;
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.number.toString().includes(searchTerm);
    const matchesFilter = statusFilter === 'all' || room.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Habitaciones</h1>
        <Button onClick={() => {
          setSelectedRoom(null);
          setShowForm(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Habitación
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Habitaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número de habitación..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="border rounded-md px-3 py-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="available">Disponibles</option>
              <option value="occupied">Ocupadas</option>
              <option value="maintenance">Mantenimiento</option>
              <option value="cleaning">Limpieza</option>
            </select>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Última Limpieza</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">{room.number}</TableCell>
                    <TableCell>{room.type}</TableCell>
                    <TableCell>{getStatusBadge(room.status)}</TableCell>
                    <TableCell>
                      {room.lastCleaning?.toDate().toLocaleDateString() || 'N/A'}
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRoom(room);
                          setShowForm(true);
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateRoomStatus(room.id, 'cleaning')}
                      >
                        Marcar Limpieza
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <RoomFormDialog
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          hotelId={hotelId}
          roomToEdit={selectedRoom}
          onSuccess={() => {
            setShowForm(false);
            fetchRooms();
          }}
        />
      )}
    </div>
  );
}