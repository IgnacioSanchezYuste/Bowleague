import { ThemeColors } from '@/constants/Colors';
import { useTheme } from '@/context/ThemeContext';
import * as api from '@/services/api';
import { Partido } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function PartidosScreen() {
  const { ligaId } = useLocalSearchParams<{ ligaId: string }>();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPartidos = useCallback(async () => {
    try {
      const data = await api.getPartidosLiga(Number(ligaId));
      setPartidos(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [ligaId]);

  useEffect(() => {
    loadPartidos();
  }, [loadPartidos]);

  function onRefresh() {
    setRefreshing(true);
    loadPartidos();
  }

  function renderPartido({ item }: { item: Partido }) {
    const fecha = new Date(item.fecha).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push(`/(tabs)/mis-ligas/${ligaId}/partido/${item.id}`)
        }
        activeOpacity={0.7}
      >
        <View style={styles.cardLeft}>
          <View style={styles.dateBox}>
            <Ionicons name="calendar" size={16} color={colors.primary} />
            <Text style={styles.dateText}>{fecha}</Text>
          </View>
          <Text style={styles.cardTitle}>
            {item.nombre || `Partido #${item.id}`}
          </Text>
          {item.lugar && (
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color={colors.textLight} />
              <Text style={styles.locationText}>{item.lugar}</Text>
            </View>
          )}
        </View>
        <View style={styles.cardRight}>
          <View style={styles.playerCount}>
            <Ionicons name="people" size={16} color={colors.textLight} />
            <Text style={styles.playerText}>
              {item.resultados?.length ?? 0}/{item.max_jugadores}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
        </View>
      </TouchableOpacity>
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
        data={partidos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPartido}
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
            <Ionicons
              name="game-controller-outline"
              size={64}
              color={colors.border}
            />
            <Text style={styles.emptyText}>No hay partidos</Text>
            <Text style={styles.emptySubtext}>Crea el primer partido</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          router.push(`/(tabs)/mis-ligas/${ligaId}/crear-partido`)
        }
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>
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
      padding: 16,
      paddingBottom: 80,
    },
    card: {
      backgroundColor: colors.white,
      borderRadius: 14,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
    },
    cardLeft: {
      flex: 1,
    },
    dateBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 6,
    },
    dateText: {
      fontSize: 13,
      color: colors.primary,
      fontWeight: '600',
    },
    cardTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 4,
    },
    locationText: {
      fontSize: 13,
      color: colors.textLight,
    },
    cardRight: {
      alignItems: 'flex-end',
      gap: 8,
    },
    playerCount: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    playerText: {
      fontSize: 13,
      color: colors.textLight,
      fontWeight: '500',
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
    emptySubtext: {
      fontSize: 14,
      color: colors.textLight,
      marginTop: 4,
    },
    fab: {
      position: 'absolute',
      right: 20,
      bottom: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 6,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    },
  });
}
