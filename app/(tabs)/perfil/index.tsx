// Pantalla de perfil del usuario.
// Muestra los datos personales, las estadísticas globales y un interruptor de tema.
// Incluye opciones para editar el perfil, cerrar sesión y eliminar la cuenta.
import { ThemeColors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import * as api from '@/services/api';
import { EstadisticasUsuario } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

export default function PerfilScreen() {
  const { user, logout, deleteAccount } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [stats, setStats] = useState<EstadisticasUsuario | null>(null);
  const [totalLigas, setTotalLigas] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [estadisticas, ligas] = await Promise.all([
        api.getUsuarioStats(user.id),
        api.getUsuarioLigas(user.id),
      ]);
      setStats(estadisticas);
      setTotalLigas(Array.isArray(ligas) ? ligas.length : 0);
    } catch {
      // ignore
    } finally {
      setLoadingStats(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  function onRefresh() {
    setRefreshing(true);
    loadStats();
  }

  // Cierra la sesión y redirige al login.
  async function handleLogout() {
    await logout();
    router.replace('/(auth)/login');
  }

  // Muestra un diálogo de confirmación antes de eliminar la cuenta.
  function handleDelete() {
    Alert.alert(
      'Eliminar cuenta',
      '¿Estás seguro? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              router.replace('/(auth)/login');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'No se pudo eliminar la cuenta');
            }
          },
        },
      ]
    );
  }

  // Formatea la fecha de registro en un texto legible en español.
  function formatearFecha(fecha: string) {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  if (!user) return null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          {user.avatar_url ? (
            <Text style={styles.avatarText}>
              {user.nombre.charAt(0).toUpperCase()}
            </Text>
          ) : (
            <Ionicons name="person" size={48} color="#FFFFFF" />
          )}
        </View>
        <Text style={styles.name}>
          {user.nombre} {user.apellidos || ''}
        </Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={styles.infoCard}>
        <InfoRow icon="mail-outline" label="Email" value={user.email} colors={colors} styles={styles} />
        <View style={styles.divider} />
        <InfoRow
          icon="calendar-outline"
          label="Miembro desde"
          value={user.fecha_registro ? formatearFecha(user.fecha_registro) : 'N/A'}
          colors={colors}
          styles={styles}
        />
        {loadingStats ? (
          <View style={styles.statsLoading}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : stats ? (
          <>
            <View style={styles.divider} />
            <InfoRow icon="trophy-outline" label="Ligas activas" value={totalLigas.toString()} colors={colors} styles={styles} />
            <View style={styles.divider} />
            <InfoRow icon="game-controller-outline" label="Partidos jugados" value={stats.total_partidos.toString()} colors={colors} styles={styles} />
            <View style={styles.divider} />
            <InfoRow icon="star-outline" label="Mejor puntuación" value={stats.mejor_puntuacion.toString()} colors={colors} styles={styles} />
            <View style={styles.divider} />
            <InfoRow icon="analytics-outline" label="Media" value={stats.puntuacion_media?.toFixed(1) ?? '0'} colors={colors} styles={styles} />
            <View style={styles.divider} />
            <InfoRow icon="flash-outline" label="Strikes" value={stats.total_strikes.toString()} colors={colors} styles={styles} />
            <View style={styles.divider} />
            <InfoRow icon="ribbon-outline" label="Spares" value={stats.total_spares.toString()} colors={colors} styles={styles} />
          </>
        ) : null}
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/(tabs)/perfil/editar')}
        >
          <Ionicons name="create-outline" size={22} color={colors.secondary} />
          <Text style={styles.menuText}>Editar perfil</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem} onPress={toggleTheme} activeOpacity={0.7}>
          <Ionicons
            name={isDark ? 'moon' : 'sunny'}
            size={22}
            color={isDark ? '#B8A9E8' : '#F39C12'}
          />
          <Text style={styles.menuText}>
            {isDark ? 'Modo oscuro' : 'Modo claro'}
          </Text>
          <ThemeToggle isDark={isDark} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={colors.primary} />
          <Text style={[styles.menuText, { color: colors.primary }]}>
            Cerrar sesión
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={22} color={colors.danger} />
          <Text style={[styles.menuText, { color: colors.danger }]}>
            Eliminar cuenta
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function ThemeToggle({ isDark }: { isDark: boolean }) {
  const translateX = useSharedValue(isDark ? 24 : 0);
  const progress = useSharedValue(isDark ? 1 : 0);

  useEffect(() => {
    translateX.value = withSpring(isDark ? 24 : 0, { damping: 15, stiffness: 120 });
    progress.value = withTiming(isDark ? 1 : 0, { duration: 300 });
  }, [isDark, translateX, progress]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ['#DFE6E9', '#3D3D6B']
    ),
  }));

  return (
    <Animated.View style={[toggleStyles.track, trackStyle]}>
      <Animated.View style={[toggleStyles.thumb, thumbStyle]}>
        <Ionicons
          name={isDark ? 'moon' : 'sunny'}
          size={14}
          color={isDark ? '#B8A9E8' : '#F39C12'}
        />
      </Animated.View>
    </Animated.View>
  );
}

function InfoRow({
  icon,
  label,
  value,
  colors,
  styles,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  colors: ThemeColors;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={20} color={colors.primary} style={styles.infoIcon} />
      <View style={styles.infoTexts}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const toggleStyles = StyleSheet.create({
  track: {
    width: 52,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
});

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 16,
      paddingBottom: 40,
    },
    avatarContainer: {
      alignItems: 'center',
      paddingVertical: 28,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    avatarText: {
      fontSize: 40,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    name: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    email: {
      fontSize: 15,
      color: colors.textLight,
      marginTop: 4,
    },
    infoCard: {
      backgroundColor: colors.white,
      borderRadius: 14,
      padding: 4,
      marginBottom: 16,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    infoIcon: {
      marginRight: 14,
    },
    infoTexts: {
      flex: 1,
    },
    infoLabel: {
      fontSize: 12,
      color: colors.textLight,
      fontWeight: '500',
    },
    infoValue: {
      fontSize: 15,
      color: colors.text,
      fontWeight: '600',
      marginTop: 2,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: 16,
    },
    statsLoading: {
      padding: 20,
      alignItems: 'center',
    },
    section: {
      backgroundColor: colors.white,
      borderRadius: 14,
      marginBottom: 12,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      gap: 12,
    },
    menuText: {
      flex: 1,
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
    },
  });
}
