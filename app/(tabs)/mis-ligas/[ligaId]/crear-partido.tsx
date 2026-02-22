// Formulario para crear un partido dentro de una liga.
// La fecha y el máximo de jugadores (entre 1 y 6) son los únicos campos obligatorios.
import { ThemeColors } from '@/constants/Colors';
import { useTheme } from '@/context/ThemeContext';
import * as api from '@/services/api';
import { router, useLocalSearchParams } from 'expo-router';
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

export default function CrearPartidoScreen() {
  const { ligaId } = useLocalSearchParams<{ ligaId: string }>();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const [lugar, setLugar] = useState('');
  const [maxJugadores, setMaxJugadores] = useState('6');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!fecha.trim()) newErrors.fecha = 'La fecha es obligatoria';
    const max = Number(maxJugadores);
    if (!maxJugadores || isNaN(max) || max < 1 || max > 6) {
      newErrors.maxJugadores = 'Debe ser entre 1 y 6';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleCrear() {
    if (!validate()) return;
    setLoading(true);
    try {
      await api.crearPartido(Number(ligaId), {
        nombre: nombre.trim() || undefined,
        fecha: fecha.trim(),
        lugar: lugar.trim() || undefined,
        max_jugadores: Number(maxJugadores),
      });
      Alert.alert('Partido creado', 'El partido se ha creado correctamente');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo crear el partido');
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
          <Text style={styles.label}>Nombre del partido</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Jornada 1 (opcional)"
            placeholderTextColor={colors.textLight}
            value={nombre}
            onChangeText={setNombre}
          />

          <Text style={styles.label}>Fecha *</Text>
          <TextInput
            style={[styles.input, errors.fecha && styles.inputError]}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textLight}
            value={fecha}
            onChangeText={setFecha}
          />
          {errors.fecha && <Text style={styles.errorText}>{errors.fecha}</Text>}

          <Text style={styles.label}>Lugar</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Bolera Central (opcional)"
            placeholderTextColor={colors.textLight}
            value={lugar}
            onChangeText={setLugar}
          />

          <Text style={styles.label}>Máximo de jugadores (1-6) *</Text>
          <TextInput
            style={[styles.input, errors.maxJugadores && styles.inputError]}
            placeholder="6"
            placeholderTextColor={colors.textLight}
            keyboardType="number-pad"
            value={maxJugadores}
            onChangeText={setMaxJugadores}
          />
          {errors.maxJugadores && (
            <Text style={styles.errorText}>{errors.maxJugadores}</Text>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleCrear}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>Crear Partido</Text>
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
