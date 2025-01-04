// src/lib/firebase/init-firestore.ts
import { db } from './config';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User, Hotel } from '@/types';

export async function initializeFirestoreCollections() {
  try {
    // Crear colección hotels con un documento dummy que luego podemos eliminar
    const hotelRef = doc(collection(db, 'hotels'), 'init');
    await setDoc(hotelRef, {
      id: 'init',
      hotelName: 'Initial Hotel',
      createdAt: serverTimestamp(),
      status: 'trial',
    }, { merge: true });

    // Crear colección users con un documento dummy
    const userRef = doc(collection(db, 'users'), 'init');
    await setDoc(userRef, {
      id: 'init',
      email: 'init@example.com',
      role: 'super_admin',
      createdAt: serverTimestamp(),
    }, { merge: true });

    console.log('Colecciones base inicializadas correctamente');
    
    return true;
  } catch (error) {
    console.error('Error inicializando colecciones:', error);
    throw error;
  }
}