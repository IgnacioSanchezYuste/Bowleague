import { useTheme } from '@/context/ThemeContext';
import { Stack } from 'expo-router';

export default function InicioLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTintColor: colors.secondary,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Inicio' }} />
    </Stack>
  );
}
