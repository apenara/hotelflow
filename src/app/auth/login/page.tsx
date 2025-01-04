'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { auth, db } from '@/lib/firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState(''); // Estado para información de debug
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setDebugInfo('Iniciando proceso de login...');

    try {
      // 1. Iniciar sesión con Firebase Auth
      setDebugInfo('Autenticando con Firebase...');
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );

      setDebugInfo('Usuario autenticado, obteniendo datos...');
      console.log('Usuario autenticado:', userCredential.user.uid);

      // 2. Obtener datos del usuario
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error('Usuario no encontrado en la base de datos');
      }

      const userData = userDoc.data();
      setDebugInfo(`Datos de usuario obtenidos. Rol: ${userData.role}`);
      console.log('Datos del usuario:', userData);

      // 3. Verificar rol y redireccionar
      if (userData.role === 'super_admin') {
        setDebugInfo('Redirigiendo a dashboard de admin...');
        console.log('Intentando redireccionar a /admin/dashboard');
        
        // Intenta ambas formas de redirección
        try {
          window.location.replace('/admin/dashboard');
        } catch (error) {
          console.error('Error en redirección:', error);
          window.location.href = '/admin/dashboard';
        }
      } else {
        throw new Error('No tienes permisos de administrador');
      }

    } catch (error) {
      console.error('Error completo:', error);
      setDebugInfo(`Error: ${error.message}`);
      
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Credenciales inválidas';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Iniciar Sesión</CardTitle>
          <CardDescription>
            Accede a tu cuenta de HotelFlow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {/* Debug Info */}
            {debugInfo && (
              <Alert>
                <AlertDescription>{debugInfo}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="tu@email.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}