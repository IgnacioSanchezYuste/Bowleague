import { ThemeColors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import * as api from '@/services/api';
import {
    EstadisticasUsuario,
    Liga,
    PosicionLiga,
    ProximoPartido,
    RankingEntry,
    UltimoResultado,
} from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function InicioScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [stats, setStats] = useState<EstadisticasUsuario | null>(null);
  const [ligas, setLigas] = useState<Liga[]>([]);
  const [proximosPartidos, setProximosPartidos] = useState<ProximoPartido[]>([]);
  const [ultimosResultados, setUltimosResultados] = useState<UltimoResultado[]>([]);
  const [posiciones, setPosiciones] = useState<PosicionLiga[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [codigoModalVisible, setCodigoModalVisible] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [joining, setJoining] = useState(false);

  const loadDashboard = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [statsData, ligasData, proximosData, ultimosData] = await Promise.all([
        api.getUsuarioStats(user.id).catch(() => null),
        api.getUsuarioLigas(user.id).catch(() => []),
        api.getProximosPartidos(user.id).catch(() => []),
        api.getUltimosResultados(user.id).catch(() => []),
      ]);

      setStats(statsData);
      const ligasList = Array.isArray(ligasData) ? ligasData : [];
      setLigas(ligasList);
      setProximosPartidos(Array.isArray(proximosData) ? proximosData : []);
      setUltimosResultados(Array.isArray(ultimosData) ? ultimosData : []);

      // Fetch position in each league
      const posicionesPromises = ligasList.map(async (liga) => {
        try {
          const ranking = await api.getRankingLiga(liga.id);
          const myEntry = ranking.find((r: RankingEntry) => r.usuario_id === user.id);
          if (myEntry) {
            return {
              liga_id: liga.id,
              liga_nombre: liga.nombre,
              posicion: myEntry.posicion,
              total_jugadores: ranking.length,
              puntuacion_media: myEntry.puntuacion_media,
            };
          }
          return null;
        } catch {
          return null;
        }
      });
      const posicionesData = (await Promise.all(posicionesPromises)).filter(
        (p): p is PosicionLiga => p !== null
      );
      setPosiciones(posicionesData);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard])
  );

  function onRefresh() {
    setRefreshing(true);
    loadDashboard();
  }

  async function handleUnirsePorCodigo() {
    if (!user?.id) return;
    const trimmed = codigo.trim();
    if (trimmed.length < 6) {
      Alert.alert('Error', 'El codigo debe tener 6 caracteres');
      return;
    }
    setJoining(true);
    try {
      await api.unirsePorCodigo(user.id, trimmed);
      Alert.alert('Unido', 'Te has unido a la liga correctamente');
      setCodigoModalVisible(false);
      setCodigo('');
      loadDashboard();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo unir a la liga');
    } finally {
      setJoining(false);
    }
  }

  function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos dias';
    if (hour < 20) return 'Buenas tardes';
    return 'Buenas noches';
  }

  function formatFechaCorta(fecha: string): string {
    const d = new Date(fecha);
    return d.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    });
  }

  function formatFechaRelativa(fecha: string): string {
    const d = new Date(fecha);
    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Manana';
    if (diffDays > 1 && diffDays <= 7) return `En ${diffDays} dias`;
    return formatFechaCorta(fecha);
  }

  function getPosicionColor(pos: number): string {
    if (pos === 1) return colors.gold;
    if (pos === 2) return colors.silver;
    if (pos === 3) return colors.bronze;
    return colors.textLight;
  }

  function getPosicionIcon(pos: number): string {
    if (pos <= 3) return 'medal';
    return 'flag';
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header de bienvenida ── */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeAvatar}>
            <Text style={styles.welcomeAvatarText}>
              {(user?.nombre || '?').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.welcomeTexts}>
            <Text style={styles.welcomeGreeting}>{getGreeting()},</Text>
            <Text style={styles.welcomeName}>{user?.nombre || 'Jugador'}</Text>
          </View>
        </View>

        {/* ── Resumen rapido (3 cards) ── */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.accentBgRed }]}>
            <Ionicons name="trophy" size={24} color={colors.primary} />
            <Text style={styles.statValue}>{stats?.total_ligas ?? ligas.length}</Text>
            <Text style={styles.statLabel}>Ligas</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.accentBgBlue }]}>
            <Ionicons name="game-controller" size={24} color="#3498DB" />
            <Text style={styles.statValue}>{stats?.total_partidos ?? 0}</Text>
            <Text style={styles.statLabel}>Partidos</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.accentBgWarm }]}>
            <Ionicons name="star" size={24} color={colors.accent} />
            <Text style={styles.statValue}>{stats?.mejor_puntuacion ?? 0}</Text>
            <Text style={styles.statLabel}>Record</Text>
          </View>
        </View>

        {/* ── Proximos partidos ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Proximos partidos</Text>
            <Ionicons name="calendar" size={20} color={colors.textLight} />
          </View>
          {proximosPartidos.length > 0 ? (
            proximosPartidos.slice(0, 3).map((p) => (
              <TouchableOpacity
                key={p.partido_id}
                style={styles.proximoCard}
                onPress={() =>
                  router.push(
                    `/(tabs)/mis-ligas/${p.liga_id}/partido/${p.partido_id}` as any
                  )
                }
                activeOpacity={0.7}
              >
                <View style={styles.proximoDateBadge}>
                  <Text style={styles.proximoDateText}>
                    {formatFechaRelativa(p.fecha)}
                  </Text>
                </View>
                <View style={styles.proximoInfo}>
                  <Text style={styles.proximoName} numberOfLines={1}>
                    {p.partido_nombre || `Partido`}
                  </Text>
                  <Text style={styles.proximoLiga} numberOfLines={1}>
                    {p.liga_nombre}
                  </Text>
                  {p.lugar && (
                    <View style={styles.proximoLocationRow}>
                      <Ionicons name="location-outline" size={12} color={colors.textLight} />
                      <Text style={styles.proximoLocation} numberOfLines={1}>
                        {p.lugar}
                      </Text>
                    </View>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptySection}>
              <Ionicons name="calendar-outline" size={32} color={colors.border} />
              <Text style={styles.emptySectionText}>
                No hay partidos programados
              </Text>
            </View>
          )}
        </View>

        {/* ── Ultimos resultados ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ultimos resultados</Text>
            <Ionicons name="stats-chart" size={20} color={colors.textLight} />
          </View>
          {ultimosResultados.length > 0 ? (
            ultimosResultados.slice(0, 3).map((r) => (
              <TouchableOpacity
                key={r.partido_id}
                style={styles.resultadoCard}
                onPress={() =>
                  router.push(
                    `/(tabs)/mis-ligas/${r.liga_id}/partido/${r.partido_id}` as any
                  )
                }
                activeOpacity={0.7}
              >
                <View style={styles.resultadoScoreBadge}>
                  <Text style={styles.resultadoScoreText}>{r.puntuacion}</Text>
                  <Text style={styles.resultadoScoreLabel}>pts</Text>
                </View>
                <View style={styles.resultadoInfo}>
                  <Text style={styles.resultadoName} numberOfLines={1}>
                    {r.partido_nombre || `Partido`}
                  </Text>
                  <Text style={styles.resultadoLiga} numberOfLines={1}>
                    {r.liga_nombre}
                  </Text>
                  <Text style={styles.resultadoFecha}>
                    {formatFechaCorta(r.fecha)}
                  </Text>
                </View>
                {r.posicion != null && (
                  <View style={styles.resultadoPosicion}>
                    <Text
                      style={[
                        styles.resultadoPosicionText,
                        { color: getPosicionColor(r.posicion) },
                      ]}
                    >
                      #{r.posicion}
                    </Text>
                    {r.total_jugadores && (
                      <Text style={styles.resultadoPosicionTotal}>
                        /{r.total_jugadores}
                      </Text>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptySection}>
              <Ionicons name="bowling-ball-outline" size={32} color={colors.border} />
              <Text style={styles.emptySectionText}>
                Aun no tienes resultados
              </Text>
            </View>
          )}
        </View>

        {/* ── Acciones rapidas ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones rapidas</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => setCodigoModalVisible(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.accentBgPurple }]}>
                <Ionicons name="key" size={24} color="#8E44AD" />
              </View>
              <Text style={styles.actionText}>Unirse con{'\n'}codigo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/mis-ligas/crear-liga')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.accentBgBlue }]}>
                <Ionicons name="add-circle" size={24} color="#3498DB" />
              </View>
              <Text style={styles.actionText}>Crear{'\n'}liga</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/mis-ligas')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.accentBgOrange }]}>
                <Ionicons name="list" size={24} color="#E67E22" />
              </View>
              <Text style={styles.actionText}>Mis{'\n'}ligas</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Tu posicion en cada liga ── */}
        {posiciones.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tu posicion en cada liga</Text>
              <Ionicons name="podium" size={20} color={colors.textLight} />
            </View>
            {posiciones.map((p) => (
              <TouchableOpacity
                key={p.liga_id}
                style={styles.posicionCard}
                onPress={() =>
                  router.push(`/(tabs)/mis-ligas/${p.liga_id}` as any)
                }
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.posicionBadge,
                    { backgroundColor: getPosicionColor(p.posicion) + '20' },
                  ]}
                >
                  <Ionicons
                    name={getPosicionIcon(p.posicion) as any}
                    size={18}
                    color={getPosicionColor(p.posicion)}
                  />
                  <Text
                    style={[
                      styles.posicionNumero,
                      { color: getPosicionColor(p.posicion) },
                    ]}
                  >
                    {p.posicion}
                  </Text>
                </View>
                <View style={styles.posicionInfo}>
                  <Text style={styles.posicionLiga} numberOfLines={1}>
                    {p.liga_nombre}
                  </Text>
                  <Text style={styles.posicionDetalles}>
                    Media: {p.puntuacion_media.toFixed(1)} | {p.total_jugadores} jugadores
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* ── Modal unirse con codigo ── */}
      <Modal
        visible={codigoModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCodigoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Unirse con codigo</Text>
              <TouchableOpacity onPress={() => setCodigoModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDesc}>
              Introduce el codigo de invitacion de 6 caracteres que te ha compartido el administrador de la liga.
            </Text>
            <TextInput
              style={styles.codigoInput}
              placeholder="ABC123"
              placeholderTextColor={colors.textLight}
              value={codigo}
              onChangeText={(t) => setCodigo(t.toUpperCase())}
              maxLength={6}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[styles.modalButton, joining && styles.modalButtonDisabled]}
              onPress={handleUnirsePorCodigo}
              disabled={joining}
            >
              {joining ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.modalButtonText}>Unirse</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: Platform.OS === 'ios' ? 8 : 16,
    },

    // ── Welcome ──
    welcomeSection: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
      paddingVertical: 8,
    },
    welcomeAvatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    welcomeAvatarText: {
      color: '#FFFFFF',
      fontSize: 22,
      fontWeight: '800',
    },
    welcomeTexts: {
      marginLeft: 14,
      flex: 1,
    },
    welcomeGreeting: {
      fontSize: 14,
      color: colors.textLight,
      fontWeight: '500',
    },
    welcomeName: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.text,
      marginTop: 2,
    },

    // ── Stats row ──
    statsRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 20,
    },
    statCard: {
      flex: 1,
      borderRadius: 16,
      padding: 14,
      alignItems: 'center',
      gap: 6,
    },
    statValue: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.text,
    },
    statLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textLight,
    },

    // ── Section ──
    section: {
      backgroundColor: colors.white,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },

    // ── Proximos partidos ──
    proximoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    proximoDateBadge: {
      backgroundColor: colors.accentBgBlue,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 6,
      minWidth: 60,
      alignItems: 'center',
    },
    proximoDateText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#3498DB',
    },
    proximoInfo: {
      flex: 1,
      marginLeft: 12,
    },
    proximoName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    proximoLiga: {
      fontSize: 13,
      color: colors.textLight,
      marginTop: 2,
    },
    proximoLocationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      marginTop: 3,
    },
    proximoLocation: {
      fontSize: 12,
      color: colors.textLight,
    },

    // ── Ultimos resultados ──
    resultadoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    resultadoScoreBadge: {
      backgroundColor: colors.accentBgWarm,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 8,
      minWidth: 60,
      alignItems: 'center',
    },
    resultadoScoreText: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.accent,
    },
    resultadoScoreLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.textLight,
    },
    resultadoInfo: {
      flex: 1,
      marginLeft: 12,
    },
    resultadoName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    resultadoLiga: {
      fontSize: 13,
      color: colors.textLight,
      marginTop: 2,
    },
    resultadoFecha: {
      fontSize: 12,
      color: colors.textLight,
      marginTop: 2,
    },
    resultadoPosicion: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    resultadoPosicionText: {
      fontSize: 18,
      fontWeight: '800',
    },
    resultadoPosicionTotal: {
      fontSize: 12,
      color: colors.textLight,
      fontWeight: '500',
    },

    // ── Empty section ──
    emptySection: {
      alignItems: 'center',
      paddingVertical: 20,
      gap: 8,
    },
    emptySectionText: {
      fontSize: 14,
      color: colors.textLight,
    },

    // ── Acciones rapidas ──
    actionsRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 12,
    },
    actionCard: {
      flex: 1,
      alignItems: 'center',
      gap: 8,
    },
    actionIcon: {
      width: 52,
      height: 52,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      lineHeight: 16,
    },

    // ── Posiciones ──
    posicionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    posicionBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 6,
      minWidth: 56,
      justifyContent: 'center',
    },
    posicionNumero: {
      fontSize: 16,
      fontWeight: '800',
    },
    posicionInfo: {
      flex: 1,
      marginLeft: 12,
    },
    posicionLiga: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    posicionDetalles: {
      fontSize: 12,
      color: colors.textLight,
      marginTop: 2,
    },

    // ── Modal ──
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: colors.overlay,
    },
    modalContent: {
      backgroundColor: colors.white,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      paddingBottom: 40,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    modalDesc: {
      fontSize: 14,
      color: colors.textLight,
      lineHeight: 20,
      marginBottom: 20,
    },
    codigoInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      fontSize: 24,
      color: colors.text,
      backgroundColor: colors.background,
      textAlign: 'center',
      fontWeight: '800',
      letterSpacing: 8,
    },
    modalButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 20,
    },
    modalButtonDisabled: {
      opacity: 0.7,
    },
    modalButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },
  });
}
