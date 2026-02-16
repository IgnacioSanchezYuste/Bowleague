import { useTheme } from '@/context/ThemeContext';
import { Stack } from 'expo-router';

export default function MisLigasLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTintColor: colors.secondary,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Mis Ligas' }} />
      <Stack.Screen name="crear-liga" options={{ title: 'Crear Liga' }} />
      <Stack.Screen name="[ligaId]/index" options={{ title: 'Liga' }} />
      <Stack.Screen name="[ligaId]/ranking" options={{ title: 'Ranking' }} />
      <Stack.Screen name="[ligaId]/partidos" options={{ title: 'Partidos' }} />
      <Stack.Screen name="[ligaId]/jugadores" options={{ title: 'Jugadores' }} />
      <Stack.Screen name="[ligaId]/crear-partido" options={{ title: 'Crear Partido' }} />
      <Stack.Screen name="[ligaId]/partido/[partidoId]" options={{ title: 'Partido' }} />
    </Stack>
  );
}
