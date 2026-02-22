// Tipos globales de la aplicación.
// Cada interfaz refleja la estructura que devuelve la API REST del backend.

// Datos básicos de un usuario registrado en la app.
export interface Usuario {
  id: number;
  nombre: string;
  apellidos?: string;
  email: string;
  avatar_url?: string;
  fecha_registro: string;
  activo?: number;
}

// Liga de bolos. Puede estar abierta, en curso o finalizada.
// codigo_invitacion se genera en el backend y permite unirse sin buscar la liga.
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
  // Campos calculados que devuelve la API en las consultas de lista
  total_jugadores?: number;
  total_partidos?: number;
}

// Relación entre usuario y liga: guarda su rol y si sigue activo.
export interface UsuarioLiga {
  id: number;
  usuario_id: number;
  liga_id: number;
  rol: 'jugador' | 'admin';
  fecha_ingreso: string;
  activo: number;
}

// Partido dentro de una liga. Puede incluir los resultados de cada jugador.
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

// Resultado de un jugador en un partido concreto.
// nombre/apellidos/avatar_url se incluyen cuando el backend hace el JOIN con usuarios.
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

// Jugador que pertenece a una liga. Extiende Usuario con el rol dentro de esa liga.
export interface Jugador extends Usuario {
  rol: 'jugador' | 'admin';
  fecha_ingreso?: string;
}

// Fila del ranking de una liga. Contiene estadísticas acumuladas del jugador.
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

// Estadísticas globales de un usuario a lo largo de todas sus ligas.
export interface EstadisticasUsuario {
  total_partidos: number;
  puntos_totales: number;
  puntuacion_media: number;
  mejor_puntuacion: number;
  total_strikes: number;
  total_spares: number;
  total_ligas?: number;
}

// Partido próximo que se muestra en el dashboard del usuario.
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

// Último resultado registrado por el usuario, para mostrar en el dashboard.
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

// Posición actual del usuario en una liga concreta, usada en el dashboard.
export interface PosicionLiga {
  liga_id: number;
  liga_nombre: string;
  posicion: number;
  total_jugadores: number;
  puntuacion_media: number;
}

// Envoltorio genérico para las respuestas de la API cuando incluyen metadatos.
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}
