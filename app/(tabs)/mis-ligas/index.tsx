// Lista de ligas del usuario autenticado.
// Permite ver todas las ligas en las que participa, unirse a una nueva con código
// de invitación y navegar al detalle de cada liga.
import { ThemeColors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import * as api from '@/services/api';
import { Liga } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function MisLigasScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [ligas, setLigas] = useState<Liga[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // Estado del modal para unirse con código.
  const [codigoModalVisible, setCodigoModalVisible] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [joining, setJoining] = useState(false);

  const loadLigas = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await api.getUsuarioLigas(user.id);
      setLigas(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadLigas();
  }, [loadLigas]);

  function onRefresh() {
    setRefreshing(true);
    loadLigas();
  }

  async function handleUnirsePorCodigo() {
    if (!user?.id) {
      Alert.alert('Error', 'No se pudo identificar tu usuario.');
      return;
    }
    const trimmed = codigo.trim();
    if (trimmed.length < 6) {
      Alert.alert('Error', 'El código debe tener 6 caracteres');
      return;
    }
    setJoining(true);
    try {
      await api.unirsePorCodigo(user.id, trimmed);
      Alert.alert('Unido', 'Te has unido a la liga correctamente');
      setCodigoModalVisible(false);
      setCodigo('');
      loadLigas();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo unir a la liga');
    } finally {
      setJoining(false);
    }
  }

  const estadoColor: Record<string, string> = {
    abierta: colors.success,
    en_curso: colors.accent,
    finalizada: colors.textLight,
  };

  function renderLiga({ item }: { item: Liga }) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/(tabs)/mis-ligas/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{item.nombre}</Text>
            {item.temporada && (
              <Text style={styles.cardSeason}>{item.temporada}</Text>
            )}
          </View>
          <View
            style={[
              styles.badge,
              { backgroundColor: (estadoColor[item.estado] || colors.textLight) + '20' },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: estadoColor[item.estado] || colors.textLight },
              ]}
            >
              {item.estado.replace('_', ' ')}
            </Text>
          </View>
        </View>
        {item.descripcion && (
          <Text style={styles.cardDesc} numberOfLines={2}>
            {item.descripcion}
          </Text>
        )}
        <View style={styles.cardFooter}>
          <View style={styles.statRow}>
            <Ionicons name="people" size={16} color={colors.textLight} />
            <Text style={styles.statText}>
              {item.total_jugadores ?? 0} jugadores
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
        data={ligas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderLiga}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <TouchableOpacity
            style={styles.codigoButton}
            onPress={() => setCodigoModalVisible(true)}
          >
            <Ionicons name="key-outline" size={20} color={colors.primary} />
            <Text style={styles.codigoButtonText}>Unirse con código</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="trophy-outline" size={64} color={colors.border} />
            <Text style={styles.emptyText}>No estás en ninguna liga</Text>
            <Text style={styles.emptySubtext}>
              Crea una o busca ligas en Inicio
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(tabs)/mis-ligas/crear-liga')}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>

      <Modal
        visible={codigoModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCodigoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Unirse con código</Text>
              <TouchableOpacity onPress={() => setCodigoModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDesc}>
              Introduce el código de invitación de 6 caracteres que te ha compartido el administrador de la liga.
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
                <ActivityIndicator color={colors.white} />
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
  list: {
    padding: 16,
    paddingBottom: 80,
  },
  codigoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  codigoButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardInfo: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  cardSeason: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cardDesc: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 8,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '500',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
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
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  });
}
