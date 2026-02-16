export interface Usuario {
  id: number;
  nombre: string;
  apellidos?: string;
  email: string;
  avatar_url?: string;
  fecha_registro: string;
  activo?: number;
}

export interface Liga {
  id: number;
  nombre: string;
  descripcion?: string;
  temporada?: string;
  max_jugadores?: number;
  creado_por: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  estado: 'abierta' | 'en_curso' | 'finalizada';
  codigo_invitacion?: string;
  fecha_creacion: string;
  total_jugadores?: number;
  total_partidos?: number;
}

export interface UsuarioLiga {
  id: number;
  usuario_id: number;
  liga_id: number;
  rol: 'jugador' | 'admin';
  fecha_ingreso: string;
  activo: number;
}

export interface Partido {
  id: number;
  liga_id: number;
  nombre?: string;
  fecha: string;
  lugar?: string;
  max_jugadores: number;
  estado: string;
  fecha_creacion: string;
  resultados?: PartidaJugador[];
}

export interface PartidaJugador {
  id: number;
  partido_id: number;
  usuario_id: number;
  puntuacion: number;
  strikes?: number;
  spares?: number;
  posicion?: number;
  fecha_registro: string;
  nombre?: string;
  apellidos?: string;
  avatar_url?: string;
}

export interface Jugador extends Usuario {
  rol: 'jugador' | 'admin';
  fecha_ingreso?: string;
}

export interface RankingEntry {
  usuario_id: number;
  nombre: string;
  apellidos?: string;
  avatar_url?: string;
  posicion: number;
  partidos_jugados: number;
  puntos_totales: number;
  puntuacion_media: number;
  mejor_puntuacion: number;
  total_strikes: number;
  total_spares: number;
}

export interface EstadisticasUsuario {
  total_partidos: number;
  puntos_totales: number;
  puntuacion_media: number;
  mejor_puntuacion: number;
  total_strikes: number;
  total_spares: number;
  total_ligas?: number;
}

export interface ProximoPartido {
  partido_id: number;
  partido_nombre?: string;
  fecha: string;
  lugar?: string;
  liga_id: number;
  liga_nombre: string;
  max_jugadores: number;
  jugadores_inscritos: number;
}

export interface UltimoResultado {
  partido_id: number;
  partido_nombre?: string;
  fecha: string;
  liga_id: number;
  liga_nombre: string;
  puntuacion: number;
  strikes?: number;
  spares?: number;
  posicion?: number;
  total_jugadores?: number;
}

export interface PosicionLiga {
  liga_id: number;
  liga_nombre: string;
  posicion: number;
  total_jugadores: number;
  puntuacion_media: number;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}
