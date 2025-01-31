'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/firebase/config';
import { collection, query, onSnapshot } from 'firebase/firestore';
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
import { RoomCard } from '@/components/hotels/RoomCard';
import { RequestNotifications } from '@/components/dashboard/RequestNotifications';


const ESTADOS = {
  available: { label: 'Disponible', icon: <Check className="h-4 w-4" />, color: 'bg-green-500 text-white' },
  occupied: { label: 'Ocupada', icon: <BedDouble className="h-4 w-4" />, color: 'bg-red-500 text-white' },
  cleaning: { label: 'Limpieza', icon: <Paintbrush className="h-4 w-4" />, color: 'bg-blue-500 text-white' },
  maintenance: { label: 'Mantenimiento', icon: <AlertTriangle className="h-4 w-4" />, color: 'bg-yellow-500 text-white' },
  do_not_disturb: { label: 'No Molestar', icon: <Moon className="h-4 w-4" />, color: 'bg-purple-500 text-white' },
  check_out: { label: 'Check-out', icon: <Clock className="h-4 w-4" />, color: 'bg-orange-500 text-white' }
};

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

export default function HotelDashboard() {
  const { user } = useAuth();
  const [habitaciones, setHabitaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [pisoSeleccionado, setPisoSeleccionado] = useState('todos');

  useEffect(() => {
    let unsubscribe = () => {};

    if (user?.hotelId) {
      try {
        const habitacionesRef = collection(db, 'hotels', user.hotelId, 'rooms');
        const q = query(habitacionesRef);

        // Suscribirse a cambios en tiempo real
        unsubscribe = onSnapshot(q, (snapshot) => {
          const habitacionesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setHabitaciones(habitacionesData);
          setIsLoading(false);
        }, (error) => {
          console.error('Error escuchando cambios:', error);
          setError(error.message);
          setIsLoading(false);
        });
      } catch (error) {
        console.error('Error al configurar listener:', error);
        setError(error.message);
        setIsLoading(false);
      }
    }

    // Limpiar el listener cuando el componente se desmonte
    return () => unsubscribe();
  }, [user]);

  // Ya no necesitamos fetchHabitaciones porque los cambios son en tiempo real
  const handleStatusChange = () => {
    // Esta función ahora está vacía porque los cambios se actualizan automáticamente
  };
  const contadoresTotales = useMemo(() => {
    return habitaciones.reduce((acc, habitacion) => {
      const estado = habitacion.status || 'available';
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {});
  }, [habitaciones]);

  const pisosUnicos = useMemo(() => {
    return [...new Set(habitaciones.map(h => h.floor))].sort((a, b) => a - b);
  }, [habitaciones]);

  const [estadoFiltrado, setEstadoFiltrado] = useState('todos');

  // Actualiza la función de filtrado para incluir el filtro por estado
  const habitacionesFiltradas = useMemo(() => {
    return habitaciones.filter(habitacion => {
      const cumpleFiltoPiso = pisoSeleccionado === 'todos' || habitacion.floor.toString() === pisoSeleccionado;
      const cumpleBusqueda = habitacion.number?.toLowerCase().includes(busqueda.toLowerCase());
      const cumpleFiltroEstado = estadoFiltrado === 'todos' || habitacion.status === estadoFiltrado;
      return cumpleFiltoPiso && cumpleBusqueda && cumpleFiltroEstado;
    });
  }, [habitaciones, pisoSeleccionado, busqueda, estadoFiltrado]);

  // Calcular contadores por estado
  const contadores = useMemo(() => {
    return habitacionesFiltradas.reduce((acc, habitacion) => {
      const estado = habitacion.status || 'available';
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {});
  }, [habitacionesFiltradas]);

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
            <Card 
              key="todos"
              className={`p-2 cursor-pointer transition-all ${
                estadoFiltrado === 'todos' 
                  ? 'ring-2 ring-offset-2 ring-gray-500' 
                  : ''
              } bg-gray-100 hover:bg-gray-200`}
              onClick={() => setEstadoFiltrado('todos')}
            >
              <div className="text-center">
                <div className="font-bold">Todas</div>
                <div className="text-2xl font-bold">{habitaciones.length}</div>
              </div>
            </Card>
            {Object.entries(ESTADOS).map(([estado, info]) => (
              <Card 
                key={estado}
                className={`${info.color} p-2 cursor-pointer transition-all ${
                  estadoFiltrado === estado 
                    ? 'ring-2 ring-offset-2' 
                    : 'hover:opacity-90'
                }`}
                onClick={() => setEstadoFiltrado(estado)}
              >
                <div className="text-center">
                  <div className="font-bold flex items-center justify-center gap-2">
                    {info.icon}
                    {info.label}
                  </div>
                  <div className="text-2xl font-bold">
                    {contadoresTotales[estado] || 0}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Indicador de filtro activo */}
          {estadoFiltrado !== 'todos' && (
            <div className="mt-4 flex items-center gap-2">
              <div className="text-sm text-gray-500">
                Mostrando solo habitaciones en estado: <span className="font-bold">{ESTADOS[estadoFiltrado]?.label}</span>
              </div>
              <button
                variant="ghost"
                size="sm"
                onClick={() => setEstadoFiltrado('todos')}
              >
                Mostrar todas
              </button>
            </div>
          )}
        </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-4">
          {habitacionesFiltradas.map((habitacion) => (
            <RoomCard
              key={habitacion.id}
              room={habitacion}
              hotelId={user?.hotelId}
              onStatusChange={() => {}} // Ya no necesitamos esto por el tiempo real
              currentUser={user}
            />
          ))}
        </div>
      </CardContent>
      
    </Card>
  </div>

);
}