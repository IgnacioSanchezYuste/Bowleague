import { ThemeColors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import * as api from '@/services/api';
import { EstadisticasUsuario } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function EstadisticasScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [stats, setStats] = useState<EstadisticasUsuario | null>(null);
  const [totalLigas, setTotalLigas] = useState(0);
  const [loading, setLoading] = useState(true);
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
      setLoading(false);
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.center}>
        <Ionicons name="bar-chart-outline" size={64} color={colors.border} />
        <Text style={styles.emptyText}>No hay estadísticas disponibles</Text>
      </View>
    );
  }

  const avgPercent = Math.min((stats.puntuacion_media / 300) * 100, 100);

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
      <Text style={styles.sectionTitle}>Resumen Global</Text>

      <View style={styles.row}>
        <StatCard
          icon="trophy"
          iconColor={colors.accent}
          label="Ligas"
          value={totalLigas.toString()}
          bgColor={colors.accentBgWarm}
          styles={styles}
        />
        <StatCard
          icon="game-controller"
          iconColor={colors.primary}
          label="Partidos"
          value={stats.total_partidos.toString()}
          bgColor={colors.accentBgRed}
          styles={styles}
        />
      </View>

      <View style={styles.row}>
        <StatCard
          icon="flame"
          iconColor="#E67E22"
          label="Puntos Totales"
          value={stats.puntos_totales.toString()}
          bgColor={colors.accentBgOrange}
          styles={styles}
        />
        <StatCard
          icon="star"
          iconColor={colors.accent}
          label="Mejor Puntuación"
          value={stats.mejor_puntuacion.toString()}
          bgColor={colors.cardHighlight}
          highlight
          styles={styles}
        />
      </View>

      <View style={styles.avgCard}>
        <Text style={styles.avgLabel}>Media de Puntuación</Text>
        <Text style={styles.avgValue}>{stats.puntuacion_media.toFixed(1)}</Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${avgPercent}%` }]} />
        </View>
        <Text style={styles.avgHint}>{avgPercent.toFixed(0)}% del máximo (300)</Text>
      </View>

      <Text style={styles.sectionTitle}>Jugadas Especiales</Text>

      <View style={styles.row}>
        <View style={[styles.specialCard, { backgroundColor: colors.accentBgBlue }]}>
          <Ionicons name="flash" size={32} color="#3498DB" />
          <Text style={styles.specialValue}>{stats.total_strikes}</Text>
          <Text style={styles.specialLabel}>Strikes</Text>
        </View>
        <View style={[styles.specialCard, { backgroundColor: colors.accentBgPurple }]}>
          <Ionicons name="ribbon" size={32} color="#8E44AD" />
          <Text style={styles.specialValue}>{stats.total_spares}</Text>
          <Text style={styles.specialLabel}>Spares</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function StatCard({
  icon,
  iconColor,
  label,
  value,
  bgColor,
  highlight,
  styles,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value: string;
  bgColor: string;
  highlight?: boolean;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: bgColor }]}>
      <Ionicons name={icon} size={28} color={iconColor} />
      <Text style={[styles.statValue, highlight && styles.highlightValue]}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 16,
      paddingBottom: 32,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textLight,
      marginTop: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
      marginTop: 8,
    },
    row: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 12,
    },
    statCard: {
      flex: 1,
      borderRadius: 14,
      padding: 18,
      alignItems: 'center',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
    },
    statValue: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.text,
      marginTop: 8,
    },
    highlightValue: {
      color: colors.accent,
    },
    statLabel: {
      fontSize: 13,
      color: colors.textLight,
      fontWeight: '500',
      marginTop: 2,
    },
    avgCard: {
      backgroundColor: colors.white,
      borderRadius: 14,
      padding: 20,
      marginBottom: 20,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
    },
    avgLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    avgValue: {
      fontSize: 42,
      fontWeight: '800',
      color: colors.primary,
      marginTop: 4,
    },
    progressBarBg: {
      height: 10,
      backgroundColor: colors.border,
      borderRadius: 5,
      marginTop: 12,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 5,
    },
    avgHint: {
      fontSize: 12,
      color: colors.textLight,
      marginTop: 6,
    },
    specialCard: {
      flex: 1,
      borderRadius: 14,
      padding: 20,
      alignItems: 'center',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
    },
    specialValue: {
      fontSize: 32,
      fontWeight: '800',
      color: colors.text,
      marginTop: 8,
    },
    specialLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textLight,
      marginTop: 4,
    },
  });
}
