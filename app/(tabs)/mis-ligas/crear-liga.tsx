import { ThemeColors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import * as api from '@/services/api';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function CrearLigaScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [temporada, setTemporada] = useState('');
  const [maxJugadores, setMaxJugadores] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (maxJugadores && (isNaN(Number(maxJugadores)) || Number(maxJugadores) < 2))
      newErrors.maxJugadores = 'Mínimo 2 jugadores';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleCrear() {
    if (!validate()) return;
    if (!user?.id) {
      Alert.alert('Error', 'No se pudo identificar tu usuario. Cierra sesión e inicia de nuevo.');
      return;
    }
    setLoading(true);
    try {
      await api.crearLiga({
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        temporada: temporada.trim() || undefined,
        max_jugadores: maxJugadores ? Number(maxJugadores) : undefined,
        creado_por: user.id,
        fecha_inicio: fechaInicio.trim() || undefined,
        fecha_fin: fechaFin.trim() || undefined,
      });
      Alert.alert('Liga creada', 'Tu nueva liga se ha creado correctamente');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo crear la liga');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <Text style={styles.label}>Nombre de la liga *</Text>
          <TextInput
            style={[styles.input, errors.nombre && styles.inputError]}
            placeholder="Ej: Liga Primavera 2025"
            placeholderTextColor={colors.textLight}
            value={nombre}
            onChangeText={setNombre}
          />
          {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}

          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe la liga (opcional)"
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={3}
            value={descripcion}
            onChangeText={setDescripcion}
          />

          <Text style={styles.label}>Temporada</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 2025"
            placeholderTextColor={colors.textLight}
            value={temporada}
            onChangeText={setTemporada}
          />

          <Text style={styles.label}>Máximo de jugadores</Text>
          <TextInput
            style={[styles.input, errors.maxJugadores && styles.inputError]}
            placeholder="Sin límite si se deja vacío"
            placeholderTextColor={colors.textLight}
            keyboardType="number-pad"
            value={maxJugadores}
            onChangeText={setMaxJugadores}
          />
          {errors.maxJugadores && (
            <Text style={styles.errorText}>{errors.maxJugadores}</Text>
          )}

          <Text style={styles.label}>Fecha de inicio</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD (opcional)"
            placeholderTextColor={colors.textLight}
            value={fechaInicio}
            onChangeText={setFechaInicio}
          />

          <Text style={styles.label}>Fecha de fin</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD (opcional)"
            placeholderTextColor={colors.textLight}
            value={fechaFin}
            onChangeText={setFechaFin}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleCrear}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>Crear Liga</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      padding: 16,
    },
    form: {
      backgroundColor: colors.white,
      borderRadius: 16,
      padding: 24,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 6,
      marginTop: 16,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 14,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.background,
    },
    textArea: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    inputError: {
      borderColor: colors.danger,
    },
    errorText: {
      color: colors.danger,
      fontSize: 12,
      marginTop: 4,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 28,
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    buttonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: '700',
    },
  });
}
