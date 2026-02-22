// Layout del grupo de autenticación.
// Deshabilita el header de la pila para que login y registro muestren su propio diseño.
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
