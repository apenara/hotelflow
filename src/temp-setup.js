// src/lib/firebase/setup-user.ts
import { doc, setDoc } from 'firebase/firestore';
import { db } from './config';

const setupHotelUser = async () => {
  const userRef = doc(db, 'users', 'LxxOtvn1gY1Bc06nkGlc');
  
  await setDoc(userRef, {
    email: "dirmercadeo@hotelplayaclub.com",
    name: "Hotel Playa Club",
    role: "hotel_admin",
    hotelId: "LxxOtvn1gY1Bc06nkGlc",
    createdAt: new Date(),
    status: "active"
  });
}

setupHotelUser();