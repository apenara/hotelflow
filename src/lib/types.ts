// src/lib/types.ts
import { Timestamp } from 'firebase/firestore';

// Tipos de usuarios
export type UserRole = 'super_admin' | 'hotel_admin' | 'staff';
export type StaffRole = 'housekeeper' | 'maintenance' | 'manager';
export type UserStatus = 'active' | 'inactive';

// Tipos de habitaciones
export type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'cleaning';
export type RoomType = 'single' | 'double' | 'suite' | 'presidential';

// Tipos para mantenimiento
export type MaintenanceType = 'preventive' | 'corrective';
export type MaintenanceStatus = 'pending' | 'in_progress' | 'completed';
export type MaintenancePriority = 'low' | 'medium' | 'high';

// Interfaces principales
export interface Hotel {
  id: string;
  hotelName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  status: 'trial' | 'active' | 'suspended';
  trialEndsAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  settings: {
    checkInTime: string;
    checkOutTime: string;
    timezone: string;
  };
}

export interface Room {
  id: string;
  number: string;
  type: RoomType;
  status: RoomStatus;
  floor: number;
  features: string[];
  lastCleaned: Timestamp;
  lastMaintenance: Timestamp;
  currentGuest?: {
    name: string;
    checkIn: Timestamp;
    checkOut: Timestamp;
  };
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  phone: string;
  status: UserStatus;
  shift: 'morning' | 'evening' | 'night';
  createdAt: Timestamp;
  assignedAreas?: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  hotelId?: string;
  createdAt: Timestamp;
  lastLogin: Timestamp;
  status: UserStatus;
}

export interface Maintenance {
  id: string;
  roomId: string;
  type: MaintenanceType;
  description: string;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  assignedTo: string;
  createdAt: Timestamp;
  scheduledFor: Timestamp;
  completedAt?: Timestamp;
  notes?: string;
}