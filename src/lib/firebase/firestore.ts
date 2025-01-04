import { 
    doc, 
    collection,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp,
    DocumentReference
  } from 'firebase/firestore';
  import { Room, Staff, User, Hotel, Maintenance } from '../types';
  import { db } from './config';
  
  // Funciones para Hoteles
  export async function createHotel(hotelData: Partial<Hotel>, hotelId: string) {
    const hotelRef = doc(db, 'hotels', hotelId);
    
    const hotel = {
      ...hotelData,
      status: 'trial',
      trialEndsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 días
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      settings: {
        checkInTime: '15:00',
        checkOutTime: '12:00',
        timezone: 'America/Bogota'
      }
    };
  
    await setDoc(hotelRef, hotel);
    return hotel;
  }
  
  // Funciones para Habitaciones
  export async function createRoom(hotelId: string, roomData: Partial<Room>) {
    const roomRef = doc(collection(db, `hotels/${hotelId}/rooms`));
    
    const room = {
      ...roomData,
      status: 'available',
      lastCleaned: serverTimestamp(),
      lastMaintenance: serverTimestamp()
    };
  
    await setDoc(roomRef, room);
    return room;
  }
  
  // Funciones para Personal
  export async function createStaffMember(
    hotelId: string, 
    staffData: Partial<Staff>,
    userId: string
  ) {
    const staffRef = doc(db, `hotels/${hotelId}/staff`, userId);
    
    const staff = {
      ...staffData,
      status: 'active',
      createdAt: serverTimestamp()
    };
  
    await setDoc(staffRef, staff);
    return staff;
  }
  
  // Funciones para Usuarios
  export async function createUser(userData: Partial<User>, userId: string) {
    const userRef = doc(db, 'users', userId);
    
    const user = {
      ...userData,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      status: 'active'
    };
  
    await setDoc(userRef, user);
    return user;
  }
  
  // Funciones para Mantenimiento
  export async function createMaintenanceRecord(
    hotelId: string,
    maintenanceData: Partial<Maintenance>
  ) {
    const maintenanceRef = doc(collection(db, `hotels/${hotelId}/maintenance`));
    
    const maintenance = {
      ...maintenanceData,
      status: 'pending',
      createdAt: serverTimestamp()
    };
  
    await setDoc(maintenanceRef, maintenance);
    return maintenance;
  }
  
  // Función para actualizar el estado de una habitación
  export async function updateRoomStatus(
    hotelId: string,
    roomId: string,
    status: Room['status']
  ) {
    const roomRef = doc(db, `hotels/${hotelId}/rooms`, roomId);
    await updateDoc(roomRef, {
      status,
      updatedAt: serverTimestamp()
    });
  }