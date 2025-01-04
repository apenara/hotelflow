// src/lib/firebase/admin-setup.ts
import { auth, db } from './config';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { User } from '@/types';

export async function createSuperAdmin({
  email,
  password,
  name
}: {
  email: string;
  password: string;
  name: string;
}) {
  try {
    // 1. Verificar si ya existe un super admin
    const existingAdminsSnapshot = await getDoc(doc(db, 'users', 'super_admin_check'));
    if (existingAdminsSnapshot.exists()) {
      throw new Error('Ya existe un super administrador');
    }

    // 2. Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;

    // 3. Crear documento del usuario en Firestore
    const userData: Partial<User> = {
      id: user.uid,
      email: user.email!,
      name,
      role: 'super_admin',
      createdAt: serverTimestamp() as any,
      lastLogin: serverTimestamp() as any,
      status: 'active'
    };

    // 4. Guardar en Firestore
    await setDoc(doc(db, 'users', user.uid), userData);
    
    // 5. Crear documento de verificación
    await setDoc(doc(db, 'users', 'super_admin_check'), {
      exists: true,
      adminId: user.uid,
      createdAt: serverTimestamp()
    });

    return { user, userData };
  } catch (error: any) {
    console.error('Error creando super admin:', error);
    throw new Error(error.message);
  }
}

// Función para verificar si existe un super admin
export async function checkSuperAdminExists() {
  try {
    const checkDoc = await getDoc(doc(db, 'users', 'super_admin_check'));
    return checkDoc.exists();
  } catch (error) {
    console.error('Error verificando super admin:', error);
    return false;
  }
}