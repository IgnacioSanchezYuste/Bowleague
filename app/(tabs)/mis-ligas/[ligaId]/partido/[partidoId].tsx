import { ThemeColors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import * as api from '@/services/api';
import { PartidaJugador, Partido } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function PartidoDetalleScreen() {
  const { partidoId } = useLocalSearchParams<{ partidoId: string }>();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [partido, setPartido] = useState<Partido | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [puntuacion, setPuntuacion] = useState('0');
  const [strikes, setStrikes] = useState('0');
  const [spares, setSpares] = useState('0');
  const [saving, setSaving] = useState(false);

  const loadPartido = useCallback(async () => {
    try {
      const data = await api.getPartido(Number(partidoId));
      setPartido(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [partidoId]);

  useEffect(() => {
    loadPartido();
  }, [loadPartido]);

  function onRefresh() {
    setRefreshing(true);
    loadPartido();
  }

  const myResult = partido?.resultados?.find(
    (r) => r.usuario_id === user?.id
  );

  function openModal(edit: boolean) {
    if (edit && myResult) {
      setPuntuacion(myResult.puntuacion.toString());
      setStrikes((myResult.strikes ?? 0).toString());
      setSpares((myResult.spares ?? 0).toString());
    } else {
      setPuntuacion('0');
      setStrikes('0');
      setSpares('0');
    }
    setEditMode(edit);
    setModalVisible(true);
  }

  async function handleSave() {
    if (!user || !partido) return;
    const punt = Number(puntuacion);
    if (isNaN(punt) || punt < 0 || punt > 300) {
      Alert.alert('Error', 'La puntuación debe estar entre 0 y 300');
      return;
    }
    setSaving(true);
    try {
      if (editMode) {
        await api.updateResultado(partido.id, user.id, {
          puntuacion: punt,
          strikes: Number(strikes) || 0,
          spares: Number(spares) || 0,
        });
      } else {
        await api.crearResultado(partido.id, {
          usuario_id: user.id,
          puntuacion: punt,
          strikes: Number(strikes) || 0,
          spares: Number(spares) || 0,
        });
      }
      setModalVisible(false);
      loadPartido();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo guardar el resultado');
    } finally {
      setSaving(false);
    }
  }

  function renderResultado({ item, index }: { item: PartidaJugador; index: number }) {
    const isMe = user?.id === item.usuario_id;
    return (
      <View style={[styles.resultRow, isMe && styles.resultRowHighlight]}>
        <Text style={styles.resultPos}>{index + 1}</Text>
        <View style={styles.resultAvatar}>
          <Text style={styles.resultAvatarText}>
            {(item.nombre || '?').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.resultInfo}>
          <Text style={[styles.resultName, isMe && styles.resultNameHighlight]}>
            {item.nombre || 'Jugador'} {item.apellidos || ''}
            {isMe ? ' (Tú)' : ''}
          </Text>
          <View style={styles.resultSubStats}>
            {item.strikes != null && (
              <Text style={styles.resultSub}>
                Strikes: {item.strikes}
              </Text>
            )}
            {item.spares != null && (
              <Text style={styles.resultSub}>
                Spares: {item.spares}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.resultScore}>
          <Text style={styles.resultScoreValue}>{item.puntuacion}</Text>
          <Text style={styles.resultScoreLabel}>pts</Text>
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

  if (!partido) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Partido no encontrado</Text>
      </View>
    );
  }

  const fecha = new Date(partido.fecha).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const sortedResults = [...(partido.resultados || [])].sort(
    (a, b) => b.puntuacion - a.puntuacion
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedResults}
        keyExtractor={(item) => `${item.usuario_id}`}
        renderItem={renderResultado}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>
              {partido.nombre || `Partido #${partido.id}`}
            </Text>
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={16} color={colors.textLight} />
              <Text style={styles.infoText}>{fecha}</Text>
            </View>
            {partido.lugar && (
              <View style={styles.infoRow}>
                <Ionicons name="location" size={16} color={colors.textLight} />
                <Text style={styles.infoText}>{partido.lugar}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Ionicons name="people" size={16} color={colors.textLight} />
              <Text style={styles.infoText}>
                {sortedResults.length}/{partido.max_jugadores} jugadores
              </Text>
            </View>

            {!myResult ? (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => openModal(false)}
              >
                <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Añadir mi resultado</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.addButton, styles.editButton]}
                onPress={() => openModal(true)}
              >
                <Ionicons name="create" size={20} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Editar mi resultado</Text>
              </TouchableOpacity>
            )}

            {sortedResults.length > 0 && (
              <Text style={styles.resultsTitle}>Resultados</Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="clipboard-outline" size={48} color={colors.border} />
            <Text style={styles.emptyText}>No hay resultados aún</Text>
          </View>
        }
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editMode ? 'Editar Resultado' : 'Añadir Resultado'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Puntuación (0-300)</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="number-pad"
              value={puntuacion}
              onChangeText={setPuntuacion}
              maxLength={3}
            />

            <Text style={styles.modalLabel}>Strikes</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="number-pad"
              value={strikes}
              onChangeText={setStrikes}
              maxLength={2}
            />

            <Text style={styles.modalLabel}>Spares</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="number-pad"
              value={spares}
              onChangeText={setSpares}
              maxLength={2}
            />

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Guardar</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
    errorText: {
      fontSize: 16,
      color: colors.textLight,
    },
    listContent: {
      paddingBottom: 24,
    },
    header: {
      backgroundColor: colors.white,
      padding: 20,
      marginBottom: 8,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
    },
    title: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 12,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 6,
    },
    infoText: {
      fontSize: 14,
      color: colors.textLight,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 14,
      marginTop: 20,
    },
    editButton: {
      backgroundColor: colors.accent,
    },
    addButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
    },
    resultsTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginTop: 24,
      marginBottom: 4,
    },
    resultRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.white,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    resultRowHighlight: {
      backgroundColor: colors.cardHighlight,
    },
    resultPos: {
      width: 28,
      fontSize: 16,
      fontWeight: '700',
      color: colors.textLight,
      textAlign: 'center',
    },
    resultAvatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 4,
    },
    resultAvatarText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 15,
    },
    resultInfo: {
      flex: 1,
      marginLeft: 12,
    },
    resultName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    resultNameHighlight: {
      color: colors.primary,
    },
    resultSubStats: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 2,
    },
    resultSub: {
      fontSize: 12,
      color: colors.textLight,
    },
    resultScore: {
      alignItems: 'flex-end',
    },
    resultScoreValue: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
    },
    resultScoreLabel: {
      fontSize: 11,
      color: colors.textLight,
    },
    empty: {
      alignItems: 'center',
      paddingTop: 40,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textLight,
      marginTop: 12,
    },
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
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    modalLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginTop: 14,
      marginBottom: 6,
    },
    modalInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 14,
      fontSize: 18,
      color: colors.text,
      backgroundColor: colors.background,
      textAlign: 'center',
      fontWeight: '700',
    },
    saveButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 24,
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },
  });
}
