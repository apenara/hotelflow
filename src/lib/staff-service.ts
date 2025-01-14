// src/lib/services/staff-service.ts
import { 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { Staff } from '@/lib/types';

  
export const createStaffMember = async (
  hotelId: string, 
  staffData: Partial<Staff>,
  temporaryPassword: string
) => {
  try {
    // 1. Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      staffData.email,
      temporaryPassword
    );

    const userId = userCredential.user.uid;

    // 2. Enviar email de verificación
    await sendEmailVerification(userCredential.user);

    // 3. Generar PIN
    const pin = Math.floor(1000 + Math.random() * 9000).toString();

    // 4. Crear documento en Firestore - Usar collection().doc() para generar un ID único
    const staffDocRef = doc(collection(db, 'hotels', hotelId, 'staff'));
    const docId = staffDocRef.id; // Obtener el ID generado automáticamente

    await setDoc(staffDocRef, {
      docId, // Guardar el ID del documento en el documento
      name: staffData.name,
      email: staffData.email,
      role: staffData.role,
      phone: staffData.phone,
      status: 'pending',
      pin,
      pinUpdatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      authId: userId
    });

    // 5. Enviar email para restablecer contraseña
    await sendPasswordResetEmail(auth, staffData.email);

    return {
      success: true,
      staffId: docId,
      pin
    };
  } catch (error) {
    console.error('Error creating staff member:', error);
    throw error;
  }
};
  
  export const resetStaffPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  };
  
  export const updateStaffPin = async (
    hotelId: string,
    staffId: string,
    pin: string
  ) => {
    try {
      const staffRef = doc(db, 'hotels', hotelId, 'staff', staffId);
      await updateDoc(staffRef, {
        pin,
        pinUpdatedAt: new Date()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating PIN:', error);
      throw error;
    }
  };
  
  export const generateTemporaryPassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  };

  export const setupEmailVerificationListener = (hotelId: string) => {
    return onAuthStateChanged(auth, async (user) => {
      if (user?.emailVerified) {
        try {
          // Buscar el staff member por authId
          const staffQuery = query(
            collection(db, 'hotels', hotelId, 'staff'),
            where('authId', '==', user.uid)
          );
          
          const staffSnapshot = await getDocs(staffQuery);
          
          if (!staffSnapshot.empty) {
            const staffDoc = staffSnapshot.docs[0];
            // Actualizar el estado a activo
            await updateDoc(doc(db, 'hotels', hotelId, 'staff', staffDoc.id), {
              status: 'active',
              updatedAt: new Date()
            });
          }
        } catch (error) {
          console.error('Error updating staff status:', error);
        }
      }
    });
  };
  
  // Función para verificar y actualizar el estado manualmente
  export const checkAndUpdateStaffStatus = async (hotelId: string, staffId: string, authId: string) => {
    try {
      // Buscar el usuario actual
      const currentUser = auth.currentUser;
      if (!currentUser) return false;
  
      if (currentUser.emailVerified) {
        await updateDoc(doc(db, 'hotels', hotelId, 'staff', staffId), {
          status: 'active',
          updatedAt: new Date()
        });
        return true;
      }
  
      // Recargar el usuario para obtener el estado más reciente
      await currentUser.reload();
      
      if (currentUser.emailVerified) {
        await updateDoc(doc(db, 'hotels', hotelId, 'staff', staffId), {
          status: 'active',
          updatedAt: new Date()
        });
        return true;
      }
  
      return false;
    } catch (error) {
      console.error('Error checking staff status:', error);
      return false;
    }
  };