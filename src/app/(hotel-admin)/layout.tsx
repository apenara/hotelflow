// src/app/(hotel-admin)/layout.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  BedDouble,
  Users,
  ClipboardCheck,
  Wrench,
  Settings,
  LogOut,
  Menu,
  QrCode
} from 'lucide-react';
import { RequestNotifications } from '@/components/dashboard/RequestNotifications';

const menuItems = [
  {
    title: 'Dashboard',
    icon: <LayoutDashboard className="w-4 h-4" />,
    href: '/dashboard'
  },
  {
    title: 'Habitaciones',
    icon: <BedDouble className="w-4 h-4" />,
    href: '/rooms'
  },
  {
    title: 'Limpieza',
    icon: <ClipboardCheck className="w-4 h-4" />,
    href: '/housekeeping'
  },
  {
    title: 'Mantenimiento',
    icon: <Wrench className="w-4 h-4" />,
    href: '/maintenance'
  },
  {
    title: 'Personal',
    icon: <Users className="w-4 h-4" />,
    href: '/staff'
  },
  {
    title: 'Códigos QR',
    icon: <QrCode className="w-4 h-4" />,
    href: '/qr-manager'
  },
  {
    title: 'Configuración',
    icon: <Settings className="w-4 h-4" />,
    href: '/settings'
  }
];

export default function HotelAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useAuth();

  const handleLogout = async () => {
    // Implementar logout
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } bg-white border-r w-64`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-4 border-b">
            <h1 className="text-xl font-bold text-blue-600">HotelFlow</h1>
            <p className="text-sm text-gray-500">{user?.hotelName}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {menuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                {item.icon}
                <span className="ml-3">{item.title}</span>
              </a>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full flex items-center justify-center"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </aside>

      <div className={`flex ${isSidebarOpen ? 'lg:ml-64' : ''}`}>
        {/* Área de contenido principal */}
        <main className="flex-1 min-h-screen">
          {children}
        </main>

        {/* Sidebar derecho (notificaciones) */}
        <aside className="hidden lg:block w-96 min-h-screen bg-white border-l">
          <div className="sticky top-0 h-screen overflow-y-auto">
            <RequestNotifications hotelId={user?.hotelId} />
          </div>
        </aside>

        </div>

      {/* Mobile toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Content */}
      {/* <main className={`lg:ml-64 min-h-screen ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {children}
      </main> */}
    </div>
  );
}