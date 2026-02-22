// Pantalla de detalle de una liga.
// Muestra la información general y las secciones disponibles: ranking, partidos y jugadores.
// Si el usuario es admin, también muestra el código de invitación con opción de copiarlo.
import { ThemeColors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import * as api from '@/services/api';
import { Liga } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
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

export default function DetalleLigaScreen() {
  const { ligaId } = useLocalSearchParams<{ ligaId: string }>();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [liga, setLiga] = useState<Liga | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadLiga = useCallback(async () => {
    try {
      const data = await api.getLiga(Number(ligaId));
      setLiga(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [ligaId]);

  useEffect(() => {
    loadLiga();
  }, [loadLiga]);

  function onRefresh() {
    setRefreshing(true);
    loadLiga();
  }

  async function copiarCodigo() {
    if (!liga?.codigo_invitacion) return;
    await Clipboard.setStringAsync(liga.codigo_invitacion);
    Alert.alert('Copiado', 'Código de invitación copiado al portapapeles');
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!liga) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Liga no encontrada</Text>
      </View>
    );
  }

  const estadoColor: Record<string, string> = {
    abierta: colors.success,
    en_curso: colors.accent,
    finalizada: colors.textLight,
  };

  const isAdmin = user?.id === liga.creado_por;

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
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>{liga.nombre}</Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: (estadoColor[liga.estado] || colors.textLight) + '20' },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: estadoColor[liga.estado] || colors.textLight },
              ]}
            >
              {liga.estado.replace('_', ' ')}
            </Text>
          </View>
        </View>
        {liga.descripcion && (
          <Text style={styles.description}>{liga.descripcion}</Text>
        )}
        {liga.temporada && (
          <Text style={styles.season}>Temporada: {liga.temporada}</Text>
        )}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="people" size={20} color={colors.primary} />
            <Text style={styles.statValue}>{liga.total_jugadores ?? 0}</Text>
            <Text style={styles.statLabel}>Jugadores</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="game-controller" size={20} color={colors.accent} />
            <Text style={styles.statValue}>{liga.total_partidos ?? 0}</Text>
            <Text style={styles.statLabel}>Partidos</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="people-circle" size={20} color={colors.secondary} />
            <Text style={styles.statValue}>{liga.max_jugadores ?? '∞'}</Text>
            <Text style={styles.statLabel}>Máximo</Text>
          </View>
        </View>
      </View>

      {isAdmin && liga.codigo_invitacion && (
        <TouchableOpacity style={styles.codigoCard} onPress={copiarCodigo} activeOpacity={0.7}>
          <View style={styles.codigoLeft}>
            <Text style={styles.codigoLabel}>Código de invitación</Text>
            <Text style={styles.codigoValue}>{liga.codigo_invitacion}</Text>
          </View>
          <View style={styles.codigoRight}>
            <Ionicons name="copy-outline" size={22} color={colors.primary} />
            <Text style={styles.codigoAction}>Copiar</Text>
          </View>
        </TouchableOpacity>
      )}

      <Text style={styles.sectionTitle}>Secciones</Text>

      <TouchableOpacity
        style={styles.menuCard}
        onPress={() => router.push(`/(tabs)/mis-ligas/${ligaId}/ranking`)}
      >
        <View style={[styles.menuIcon, { backgroundColor: colors.accentBgWarm }]}>
          <Ionicons name="podium" size={24} color={colors.accent} />
        </View>
        <View style={styles.menuInfo}>
          <Text style={styles.menuTitle}>Ranking</Text>
          <Text style={styles.menuDesc}>Clasificación de jugadores</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuCard}
        onPress={() => router.push(`/(tabs)/mis-ligas/${ligaId}/partidos`)}
      >
        <View style={[styles.menuIcon, { backgroundColor: colors.accentBgRed }]}>
          <Ionicons name="game-controller" size={24} color={colors.primary} />
        </View>
        <View style={styles.menuInfo}>
          <Text style={styles.menuTitle}>Partidos</Text>
          <Text style={styles.menuDesc}>Ver y crear partidos</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuCard}
        onPress={() => router.push(`/(tabs)/mis-ligas/${ligaId}/jugadores`)}
      >
        <View style={[styles.menuIcon, { backgroundColor: colors.accentBgBlue }]}>
          <Ionicons name="people" size={24} color="#3498DB" />
        </View>
        <View style={styles.menuInfo}>
          <Text style={styles.menuTitle}>Jugadores</Text>
          <Text style={styles.menuDesc}>Miembros de la liga</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
      </TouchableOpacity>
    </ScrollView>
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
  errorText: {
    fontSize: 16,
    color: colors.textLight,
  },
  header: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    flex: 1,
    marginRight: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 15,
    color: colors.textLight,
    marginTop: 10,
    lineHeight: 22,
  },
  season: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 6,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  stat: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
  },
  codigoCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.primary + '30',
    borderStyle: 'dashed',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  codigoLeft: {
    flex: 1,
  },
  codigoLabel: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '500',
    marginBottom: 4,
  },
  codigoValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 4,
  },
  codigoRight: {
    alignItems: 'center',
    marginLeft: 16,
  },
  codigoAction: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  menuCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuInfo: {
    flex: 1,
    marginLeft: 14,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  menuDesc: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 2,
  },
  });
}
