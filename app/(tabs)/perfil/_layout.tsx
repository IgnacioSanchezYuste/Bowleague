import { useTheme } from '@/context/ThemeContext';
import { Stack } from 'expo-router';

export default function PerfilLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTintColor: colors.secondary,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Mi Perfil' }} />
      <Stack.Screen name="editar" options={{ title: 'Editar Perfil' }} />
    </Stack>
  );
}
