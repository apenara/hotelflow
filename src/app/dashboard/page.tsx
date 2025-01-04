"use client"; 
import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  User,
  Calendar,
  Edit
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const HotelDashboard = () => {
  const [pisoSeleccionado, setPisoSeleccionado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  // Estados de ejemplo para las habitaciones
  const [habitaciones] = useState([
    // Piso 1
    { numero: '101', estado: 'ocupada', tipo: 'doble', piso: 1, limpieza: true },
    { numero: '102', estado: 'disponible', tipo: 'doble', piso: 1, limpieza: true },
    { numero: '103', estado: 'mantenimiento', tipo: 'simple', piso: 1, limpieza: false },
    { numero: '104', estado: 'limpieza', tipo: 'doble', piso: 1, limpieza: false },
    { numero: '105', estado: 'no-molestar', tipo: 'suite', piso: 1, limpieza: true },
    { numero: '106', estado: 'checkout', tipo: 'doble', piso: 1, limpieza: false },
    { numero: '107', estado: 'ocupada', tipo: 'simple', piso: 1, limpieza: true },
    { numero: '108', estado: 'disponible', tipo: 'suite', piso: 1, limpieza: true },
    // Piso 2
    { numero: '201', estado: 'ocupada', tipo: 'doble', piso: 2, limpieza: true },
    { numero: '202', estado: 'disponible', tipo: 'simple', piso: 2, limpieza: true },
    { numero: '203', estado: 'mantenimiento', tipo: 'suite', piso: 2, limpieza: false },
    { numero: '204', estado: 'limpieza', tipo: 'doble', piso: 2, limpieza: false },
    { numero: '205', estado: 'no-molestar', tipo: 'doble', piso: 2, limpieza: true },
    { numero: '206', estado: 'checkout', tipo: 'simple', piso: 2, limpieza: false },
    { numero: '207', estado: 'ocupada', tipo: 'suite', piso: 2, limpieza: true },
    { numero: '208', estado: 'disponible', tipo: 'doble', piso: 2, limpieza: true },
    // Piso 3
    { numero: '301', estado: 'ocupada', tipo: 'suite', piso: 3, limpieza: false },
    { numero: '302', estado: 'disponible', tipo: 'doble', piso: 3, limpieza: true },
    { numero: '303', estado: 'checkout', tipo: 'simple', piso: 3, limpieza: false },
    { numero: '304', estado: 'ocupada', tipo: 'doble', piso: 3, limpieza: true },
    { numero: '305', estado: 'limpieza', tipo: 'suite', piso: 3, limpieza: false },
    { numero: '306', estado: 'no-molestar', tipo: 'doble', piso: 3, limpieza: true },
    { numero: '307', estado: 'disponible', tipo: 'simple', piso: 3, limpieza: true },
    { numero: '308', estado: 'mantenimiento', tipo: 'suite', piso: 3, limpieza: false },
  ]);

  const getEstadoColor = (estado) => {
    const colores = {
      'ocupada': 'bg-red-500',
      'disponible': 'bg-green-500',
      'mantenimiento': 'bg-yellow-500',
      'limpieza': 'bg-blue-500',
      'no-molestar': 'bg-purple-500',
      'checkout': 'bg-orange-500'
    };
    return colores[estado];
  };

  const getEstadoIcono = (estado) => {
    const iconos = {
      'ocupada': <BedDouble className="h-6 w-6" />,
      'disponible': <Check className="h-6 w-6" />,
      'mantenimiento': <AlertTriangle className="h-6 w-6" />,
      'limpieza': <Paintbrush className="h-6 w-6" />,
      'no-molestar': <Moon className="h-6 w-6" />,
      'checkout': <Clock className="h-6 w-6" />
    };
    return iconos[estado];
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
            {['ocupada', 'disponible', 'mantenimiento', 'limpieza', 'no-molestar', 'checkout'].map((estado) => (
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
            {habitaciones.map((habitacion) => (
                              <Card key={habitacion.numero} className="relative hover:shadow-lg transition-shadow">
                <CardContent className="p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base font-bold">{habitacion.numero}</span>
                    {getEstadoIcono(habitacion.estado)}
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge className={`${getEstadoColor(habitacion.estado)} text-white text-xs w-full justify-center`}>
                      {habitacion.estado}
                    </Badge>
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