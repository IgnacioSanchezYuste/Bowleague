import { ThemeColors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import * as api from '@/services/api';
import { RankingEntry } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function RankingScreen() {
  const { ligaId } = useLocalSearchParams<{ ligaId: string }>();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRanking = useCallback(async () => {
    try {
      const data = await api.getRankingLiga(Number(ligaId));
      setRanking(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [ligaId]);

  useEffect(() => {
    loadRanking();
  }, [loadRanking]);

  function onRefresh() {
    setRefreshing(true);
    loadRanking();
  }

  function getMedalColor(pos: number): string | null {
    if (pos === 1) return colors.gold;
    if (pos === 2) return colors.silver;
    if (pos === 3) return colors.bronze;
    return null;
  }

  function renderItem({ item }: { item: RankingEntry }) {
    const isMe = user?.id === item.usuario_id;
    const medalColor = getMedalColor(item.posicion);

    return (
      <View style={[styles.row, isMe && styles.rowHighlight]}>
        <View style={styles.posContainer}>
          {medalColor ? (
            <View style={[styles.medal, { backgroundColor: medalColor }]}>
              <Text style={styles.medalText}>{item.posicion}</Text>
            </View>
          ) : (
            <Text style={styles.posText}>{item.posicion}</Text>
          )}
        </View>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.nombre.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.info}>
          <Text style={[styles.name, isMe && styles.nameHighlight]}>
            {item.nombre} {item.apellidos || ''}
            {isMe ? ' (Tú)' : ''}
          </Text>
          <View style={styles.subStats}>
            <Text style={styles.subStat}>
              {item.partidos_jugados} partidos
            </Text>
            <Text style={styles.subStat}>
              Media: {item.puntuacion_media?.toFixed(1) ?? 0}
            </Text>
          </View>
        </View>

        <View style={styles.points}>
          <Text style={styles.pointsValue}>{item.puntos_totales}</Text>
          <Text style={styles.pointsLabel}>pts</Text>
        </View>
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
      <View style={styles.headerRow}>
        <Text style={styles.headerPos}>#</Text>
        <Text style={styles.headerName}>Jugador</Text>
        <Text style={styles.headerPts}>Puntos</Text>
      </View>

      <FlatList
        data={ranking}
        keyExtractor={(item) => item.usuario_id.toString()}
        renderItem={renderItem}
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
            <Ionicons name="podium-outline" size={64} color={colors.border} />
            <Text style={styles.emptyText}>Aún no hay ranking</Text>
            <Text style={styles.emptySubtext}>
              Se necesitan partidos con resultados
            </Text>
          </View>
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
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.secondary,
    },
    headerPos: {
      width: 44,
      fontSize: 13,
      fontWeight: '600',
      color: colors.white,
      textAlign: 'center',
    },
    headerName: {
      flex: 1,
      fontSize: 13,
      fontWeight: '600',
      color: colors.white,
      marginLeft: 48,
    },
    headerPts: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.white,
      width: 60,
      textAlign: 'right',
    },
    list: {
      paddingBottom: 24,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: colors.white,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rowHighlight: {
      backgroundColor: colors.cardHighlight,
    },
    posContainer: {
      width: 44,
      alignItems: 'center',
    },
    medal: {
      width: 30,
      height: 30,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
    },
    medalText: {
      color: colors.white,
      fontWeight: '800',
      fontSize: 14,
    },
    posText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textLight,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.secondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      color: colors.white,
      fontWeight: '700',
      fontSize: 16,
    },
    info: {
      flex: 1,
      marginLeft: 12,
    },
    name: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    nameHighlight: {
      color: colors.primary,
    },
    subStats: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 2,
    },
    subStat: {
      fontSize: 12,
      color: colors.textLight,
    },
    points: {
      alignItems: 'flex-end',
      width: 60,
    },
    pointsValue: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
    },
    pointsLabel: {
      fontSize: 11,
      color: colors.textLight,
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
  });
}
