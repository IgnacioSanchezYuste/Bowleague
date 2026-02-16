import { ThemeColors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import * as api from '@/services/api';
import { Jugador } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function JugadoresScreen() {
  const { ligaId } = useLocalSearchParams<{ ligaId: string }>();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadJugadores = useCallback(async () => {
    try {
      const data = await api.getJugadoresLiga(Number(ligaId));
      setJugadores(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [ligaId]);

  useEffect(() => {
    loadJugadores();
  }, [loadJugadores]);

  function onRefresh() {
    setRefreshing(true);
    loadJugadores();
  }

  function handleSalir() {
    Alert.alert('Salir de la liga', '¿Estás seguro de que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          if (!user) return;
          try {
            await api.salirLiga(Number(ligaId), user.id);
            router.back();
            router.back();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'No se pudo salir de la liga');
          }
        },
      },
    ]);
  }

  function renderJugador({ item }: { item: Jugador }) {
    const isMe = user?.id === item.id;

    return (
      <View style={[styles.row, isMe && styles.rowHighlight]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.nombre.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>
            {item.nombre} {item.apellidos || ''}
            {isMe ? ' (Tú)' : ''}
          </Text>
          {item.fecha_ingreso && (
            <Text style={styles.date}>
              Desde {new Date(item.fecha_ingreso).toLocaleDateString('es-ES')}
            </Text>
          )}
        </View>
        {item.rol === 'admin' && (
          <View style={styles.adminBadge}>
            <Text style={styles.adminText}>Admin</Text>
          </View>
        )}
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={jugadores}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderJugador}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={64} color={colors.border} />
            <Text style={styles.emptyText}>No hay jugadores</Text>
          </View>
        }
        ListFooterComponent={
          <TouchableOpacity style={styles.leaveButton} onPress={handleSalir}>
            <Ionicons name="exit-outline" size={20} color={colors.danger} />
            <Text style={styles.leaveText}>Salir de la liga</Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    list: {
      paddingBottom: 24,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.white,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rowHighlight: {
      backgroundColor: colors.cardHighlight,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.secondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      color: colors.white,
      fontWeight: '700',
      fontSize: 18,
    },
    info: {
      flex: 1,
      marginLeft: 14,
    },
    name: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    date: {
      fontSize: 12,
      color: colors.textLight,
      marginTop: 2,
    },
    adminBadge: {
      backgroundColor: colors.accent + '20',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
    },
    adminText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.accent,
    },
    leaveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 24,
      marginHorizontal: 16,
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.danger,
    },
    leaveText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.danger,
    },
    empty: {
      alignItems: 'center',
      paddingTop: 80,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textLight,
      marginTop: 16,
    },
  });
}
