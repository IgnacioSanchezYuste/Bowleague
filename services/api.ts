// Capa de acceso a la API REST del backend.
// Todas las peticiones pasan por la función request(), que centraliza
// la URL base, las cabeceras y el manejo de errores.
import {
  EstadisticasUsuario,
  Jugador,
  Liga,
  PartidaJugador,
  Partido,
  ProximoPartido,
  RankingEntry,
  UltimoResultado,
  Usuario,
} from '@/types';

const BASE_URL = 'https://ignaciosanchezyuste.es/API_Bowleague';

// Función genérica que ejecuta cualquier llamada HTTP a la API.
// Si el servidor devuelve un error, lanza una excepción con el mensaje recibido.
// La API envuelve los datos en un objeto con una clave dinámica (ej: { liga: {...} }),
// así que se extrae automáticamente el valor útil.
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const json = await response.json();

  if (!response.ok || json.error) {
    throw new Error(json.message || `Error ${response.status}`);
  }

  // La API envuelve las respuestas en { "recurso": ... }
  // p.ej. { "ligas": [...] }, { "liga": {...} }, { "stats": {...} }
  if (json.data !== undefined) return json.data;
  const keys = Object.keys(json).filter(k => k !== 'success' && k !== 'message');
  if (keys.length === 1) return json[keys[0]];
  return json;
}

// ── Auth ─────────────────────────────────────────────────────────────────
// Registro e inicio de sesión. El backend devuelve el objeto Usuario completo.

export async function registro(body: {
  nombre: string;
  apellidos?: string;
  email: string;
  password: string;
  avatar_url?: string;
}): Promise<Usuario> {
  return request<Usuario>('/auth/registro', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function login(body: {
  email: string;
  password: string;
}): Promise<Usuario> {
  return request<Usuario>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// ── Usuarios ─────────────────────────────────────────────────────────────
// CRUD de usuarios y endpoints de datos personalizados del usuario autenticado.

export async function getUsuarios(): Promise<Usuario[]> {
  return request<Usuario[]>('/usuarios');
}

export async function getUsuario(id: number): Promise<Usuario> {
  return request<Usuario>(`/usuarios/${id}`);
}

export async function updateUsuario(
  id: number,
  body: Partial<Pick<Usuario, 'nombre' | 'apellidos' | 'email' | 'avatar_url'>> & { password?: string }
): Promise<Usuario> {
  return request<Usuario>(`/usuarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function deleteUsuario(id: number): Promise<void> {
  return request<void>(`/usuarios/${id}`, { method: 'DELETE' });
}

export async function getUsuarioLigas(id: number): Promise<Liga[]> {
  return request<Liga[]>(`/usuarios/${id}/ligas`);
}

// El backend devuelve números como strings; se normalizan aquí para no
// tener que hacer conversiones en cada componente.
export async function getUsuarioStats(id: number): Promise<EstadisticasUsuario> {
  const raw = await request<any>(`/usuarios/${id}/stats`);
  return {
    total_partidos: Number(raw.total_partidos) || 0,
    puntos_totales: Number(raw.puntos_totales) || 0,
    puntuacion_media: Number(raw.puntuacion_media) || 0,
    mejor_puntuacion: Number(raw.mejor_puntuacion) || 0,
    total_strikes: Number(raw.total_strikes) || 0,
    total_spares: Number(raw.total_spares) || 0,
    total_ligas: Number(raw.total_ligas) || 0,
  };
}

// Partidos futuros del usuario para mostrar en el dashboard.
export async function getProximosPartidos(userId: number): Promise<ProximoPartido[]> {
  const raw = await request<any>(`/usuarios/${userId}/proximos-partidos`);
  if (!Array.isArray(raw)) return [];
  return raw.map((r: any) => ({
    partido_id: Number(r.partido_id),
    partido_nombre: r.partido_nombre || r.nombre,
    fecha: r.fecha,
    lugar: r.lugar,
    liga_id: Number(r.liga_id),
    liga_nombre: r.liga_nombre,
    max_jugadores: Number(r.max_jugadores) || 0,
    jugadores_inscritos: Number(r.jugadores_inscritos) || 0,
  }));
}

// Últimas partidas jugadas por el usuario para mostrar en el dashboard.
export async function getUltimosResultados(userId: number): Promise<UltimoResultado[]> {
  const raw = await request<any>(`/usuarios/${userId}/ultimos-resultados`);
  if (!Array.isArray(raw)) return [];
  return raw.map((r: any) => ({
    partido_id: Number(r.partido_id),
    partido_nombre: r.partido_nombre || r.nombre,
    fecha: r.fecha,
    liga_id: Number(r.liga_id),
    liga_nombre: r.liga_nombre,
    puntuacion: Number(r.puntuacion) || 0,
    strikes: r.strikes != null ? Number(r.strikes) : undefined,
    spares: r.spares != null ? Number(r.spares) : undefined,
    posicion: r.posicion != null ? Number(r.posicion) : undefined,
    total_jugadores: r.total_jugadores != null ? Number(r.total_jugadores) : undefined,
  }));
}

// ── Ligas ─────────────────────────────────────────────────────────────────
// CRUD de ligas más las acciones de membresía: unirse, salir y unirse por código.

export async function getLigas(estado?: string): Promise<Liga[]> {
  const query = estado ? `?estado=${estado}` : '';
  return request<Liga[]>(`/ligas${query}`);
}

export async function crearLiga(body: {
  nombre: string;
  descripcion?: string;
  temporada?: string;
  max_jugadores?: number;
  creado_por: number;
  fecha_inicio?: string;
  fecha_fin?: string;
}): Promise<Liga> {
  return request<Liga>('/ligas', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function getLiga(id: number): Promise<Liga> {
  return request<Liga>(`/ligas/${id}`);
}

export async function updateLiga(
  id: number,
  body: Partial<Liga>
): Promise<Liga> {
  return request<Liga>(`/ligas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function deleteLiga(id: number): Promise<void> {
  return request<void>(`/ligas/${id}`, { method: 'DELETE' });
}

export async function unirseLiga(
  ligaId: number,
  usuarioId: number
): Promise<void> {
  return request<void>(`/ligas/${ligaId}/unirse`, {
    method: 'POST',
    body: JSON.stringify({ usuario_id: usuarioId }),
  });
}

export async function salirLiga(
  ligaId: number,
  usuarioId: number
): Promise<void> {
  return request<void>(`/ligas/${ligaId}/salir`, {
    method: 'DELETE',
    body: JSON.stringify({ usuario_id: usuarioId }),
  });
}

// Se convierte el código a mayúsculas antes de enviarlo para evitar problemas
// si el usuario lo introduce en minúsculas.
export async function unirsePorCodigo(
  usuarioId: number,
  codigo: string
): Promise<Liga> {
  return request<Liga>('/ligas/unirse-por-codigo', {
    method: 'POST',
    body: JSON.stringify({ usuario_id: usuarioId, codigo: codigo.toUpperCase() }),
  });
}

export async function getJugadoresLiga(ligaId: number): Promise<Jugador[]> {
  return request<Jugador[]>(`/ligas/${ligaId}/jugadores`);
}

// El ranking también llega con valores numéricos en string; se normalizan igual.
export async function getRankingLiga(ligaId: number): Promise<RankingEntry[]> {
  const raw = await request<any[]>(`/ligas/${ligaId}/ranking`);
  if (!Array.isArray(raw)) return [];
  return raw.map((r) => ({
    usuario_id: Number(r.usuario_id),
    nombre: r.nombre,
    apellidos: r.apellidos,
    avatar_url: r.avatar_url,
    posicion: Number(r.posicion),
    partidos_jugados: Number(r.partidos_jugados) || 0,
    puntos_totales: Number(r.puntos_totales) || 0,
    puntuacion_media: Number(r.puntuacion_media) || 0,
    mejor_puntuacion: Number(r.mejor_puntuacion) || 0,
    total_strikes: Number(r.total_strikes) || 0,
    total_spares: Number(r.total_spares) || 0,
  }));
}

// ── Partidos ──────────────────────────────────────────────────────────────
// CRUD de partidos de una liga.

export async function getPartidosLiga(ligaId: number): Promise<Partido[]> {
  return request<Partido[]>(`/ligas/${ligaId}/partidos`);
}

export async function crearPartido(
  ligaId: number,
  body: { nombre?: string; fecha: string; lugar?: string; max_jugadores?: number }
): Promise<Partido> {
  return request<Partido>(`/ligas/${ligaId}/partidos`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function getPartido(id: number): Promise<Partido> {
  return request<Partido>(`/partidos/${id}`);
}

export async function updatePartido(
  id: number,
  body: Partial<Partido>
): Promise<Partido> {
  return request<Partido>(`/partidos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function deletePartido(id: number): Promise<void> {
  return request<void>(`/partidos/${id}`, { method: 'DELETE' });
}

// ── Resultados ────────────────────────────────────────────────────────────
// Registro y edición de la puntuación de un jugador en un partido.
// El endpoint usa usuario_id en lugar de resultadoId para simplificar
// (cada usuario solo puede tener un resultado por partido).

export async function crearResultado(
  partidoId: number,
  body: { usuario_id: number; puntuacion: number; strikes?: number; spares?: number }
): Promise<PartidaJugador> {
  return request<PartidaJugador>(`/partidos/${partidoId}/resultados`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateResultado(
  partidoId: number,
  userId: number,
  body: { puntuacion?: number; strikes?: number; spares?: number }
): Promise<PartidaJugador> {
  return request<PartidaJugador>(`/partidos/${partidoId}/resultados/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function deleteResultado(
  partidoId: number,
  userId: number
): Promise<void> {
  return request<void>(`/partidos/${partidoId}/resultados/${userId}`, {
    method: 'DELETE',
  });
}
