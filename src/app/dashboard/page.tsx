'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BedDouble, 
  Loader2, 
  Check, 
  AlertTriangle, 
  Clock,
  Paintbrush,
  Moon,
  Search,
  Building,
} from 'lucide-react';
import { RoomStatusMenu } from '@/components/hotels/RoomStatusMenu';

// Constantes para estados de habitaciones
const ROOM_STATES = {
  disponible: {
    color: 'bg-green-500',
    icon: <Check className="h-6 w-6" />,
  },
  ocupada: {
    color: 'bg-red-500',
    icon: <BedDouble className="h-6 w-6" />,
  },
  mantenimiento: {
    color: 'bg-yellow-500',
    icon: <AlertTriangle className="h-6 w-6" />,
  },
  limpieza: {
    color: 'bg-blue-500',
    icon: <Paintbrush className="h-6 w-6" />,
  },
  'no-molestar': {
    color: 'bg-purple-500',
    icon: <Moon className="h-6 w-6" />,
  },
  checkout: {
    color: 'bg-orange-500',
    icon: <Clock className="h-6 w-6" />,
  },
};

const HotelDashboard = () => {
  const { user } = useAuth();
  const [pisoSeleccionado, setPisoSeleccionado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [habitaciones, setHabitaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const mapearEstado = (status) => {
    const mapeoEstados = {
      'available': 'disponible',
      'occupied': 'ocupada',
      'cleaning': 'limpieza',
      'maintenance': 'mantenimiento',
      'do_not_disturb': 'no-molestar',
      'check_out': 'checkout'
    };
    return mapeoEstados[status] || 'disponible';
  };

  const fetchHabitaciones = async () => {
    try {
      setIsLoading(true);
      if (!user?.hotelId) {
        throw new Error('No se encontró el ID del hotel');
      }

      const habitacionesRef = collection(db, 'hotels', user.hotelId, 'rooms');
      const habitacionesSnapshot = await getDocs(habitacionesRef);
      
      const habitacionesData = habitacionesSnapshot.docs.map(doc => ({
        id: doc.id,
        numero: doc.data().number || '',
        estado: mapearEstado(doc.data().status),
        tipo: doc.data().type || 'simple',
        piso: parseInt(doc.data().floor) || 1,
        limpieza: doc.data().lastCleaning ? true : false,
      }));

      setHabitaciones(habitacionesData);
      setError(null);
    } catch (error) {
      console.error('Error al cargar habitaciones:', error);
      setError('Error al cargar las habitaciones');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.hotelId) {
      fetchHabitaciones();
    }
  }, [user]);

  const getEstadoColor = (estado) => {
    return ROOM_STATES[estado]?.color || 'bg-gray-500';
  };

  const getEstadoIcono = (estado) => {
    return ROOM_STATES[estado]?.icon || <AlertTriangle className="h-6 w-6" />;
  };

  // Obtener habitaciones filtradas
  const habitacionesFiltradas = useMemo(() => {
    return habitaciones.filter(habitacion => {
      const cumpleFiltoPiso = pisoSeleccionado === 'todos' || habitacion.piso.toString() === pisoSeleccionado;
      const cumpleBusqueda = habitacion.numero.toLowerCase().includes(busqueda.toLowerCase());
      return cumpleFiltoPiso && cumpleBusqueda;
    });
  }, [habitaciones, pisoSeleccionado, busqueda]);

  // Calcular contadores por estado
  const contadores = useMemo(() => {
    return habitacionesFiltradas.reduce((acc, habitacion) => {
      acc[habitacion.estado] = (acc[habitacion.estado] || 0) + 1;
      return acc;
    }, {});
  }, [habitacionesFiltradas]);

  // Obtener pisos únicos
  const pisosUnicos = useMemo(() => {
    return [...new Set(habitaciones.map(h => h.piso))].sort((a, b) => a - b);
  }, [habitaciones]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Dashboard HotelFlow</CardTitle>
          
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar habitación..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={pisoSeleccionado} onValueChange={setPisoSeleccionado}>
                <SelectTrigger>
                  <Building className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Seleccionar piso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los pisos</SelectItem>
                  {pisosUnicos.map(piso => (
                    <SelectItem key={piso} value={piso.toString()}>
                      Piso {piso}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contadores de estado */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {Object.keys(ROOM_STATES).map((estado) => (
              <Card key={estado} className={`${getEstadoColor(estado)} text-white p-2`}>
                <div className="text-center">
                  <div className="font-bold">{estado.charAt(0).toUpperCase() + estado.slice(1)}</div>
                  <div className="text-2xl font-bold">{contadores[estado] || 0}</div>
                </div>
              </Card>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-4">
            {habitacionesFiltradas.map((habitacion) => (
              <Card key={habitacion.id} className="relative hover:shadow-lg transition-shadow">
              <CardContent className="p-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base font-bold">{habitacion.numero}</span>
                  {getEstadoIcono(habitacion.estado)}
                </div>
                <div className="flex flex-col gap-1">
                  <RoomStatusMenu 
                    habitacionId={habitacion.id}
                    hotelId={user.hotelId}
                    estadoActual={habitacion.status}
                    onStatusChange={fetchHabitaciones}
                  />
                  <div className="flex justify-between items-center text-xs text-gray-600">
                    <span>{habitacion.tipo}</span>
                    <Badge className={`${habitacion.limpieza ? "bg-green-500" : "bg-red-500"} text-xs`}>
                      {habitacion.limpieza ? "L" : "PL"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HotelDashboard;