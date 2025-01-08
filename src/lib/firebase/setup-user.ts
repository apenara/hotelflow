// src/lib/firebase/setup-user.ts
import { doc, setDoc } from 'firebase/firestore';
import { db } from './config';

const setupHotelUser = async () => {
  const userRef = doc(db, 'users', 'H0qLz882nTDLLsvNn4Z2');
  
  await setDoc(userRef, {
    email: "dirmercadeo@hotelplayaclub.com",
    name: "Hotel Playa Club",
    role: "hotel_admin",
    hotelId: "H0qLz882nTDLLsvNn4Z2",
    createdAt: new Date(),
    status: "active"
  });
}

setupHotelUser();