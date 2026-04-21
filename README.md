# BowLeague

Aplicación **móvil y web** construida con **Expo + React Native + TypeScript** para gestionar **ligas de bolos**: autenticación, dashboard con estadísticas, ligas del usuario, próximos partidos, últimos resultados y posición en rankings. Incluye persistencia local de sesión y tema (claro/oscuro).

---

## Índice

- [Descripción general](#descripción-general)
- [Características principales](#características-principales)
- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos previos](#requisitos-previos)
- [Instalación](#instalación)
- [Uso del proyecto](#uso-del-proyecto)
- [Configuración](#configuración)
- [Ejemplos prácticos](#ejemplos-prácticos)
- [Buenas prácticas](#buenas-prácticas)
- [Troubleshooting](#troubleshooting)
- [Contribución](#contribución)
- [Licencia](#licencia)
- [Autor / contacto](#autor--contacto)

---

## Descripción general

BowLeague centraliza la experiencia de un jugador en ligas de bolos:

- Registro / login.
- Dashboard con carga paralela de datos (stats, ligas, próximos, últimos).
- Unión a ligas por código de invitación.
- Capa de acceso a API REST con manejo uniforme de errores y normalización de datos.
- Tema claro/oscuro persistente.

---

## Características principales

### Autenticación
- Registro con validación (email, contraseña mínima, confirmación).
- Login con validación.
- Sesión persistida en almacenamiento local.

### Dashboard “Inicio”
- Estadísticas agregadas del usuario.
- Listado de ligas del usuario.
- Próximos partidos y últimos resultados.
- Cálculo de posición del usuario por liga (consulta de ranking).
- Pull-to-refresh.
- Acciones rápidas: unirse con código, crear liga, ir a mis ligas.

### Tema
- Tema claro/oscuro persistente.

### Backend / API
Cliente REST centralizado con `BASE_URL` y función `request()` que:
- añade cabeceras,
- parsea JSON,
- lanza errores consistentes,
- extrae payload aunque venga envuelto.

---

## Tecnologías utilizadas

- TypeScript
- React Native + Expo
- Expo Router
- AsyncStorage (sesión/tema)
- ESLint (Expo config)
- Vector icons (Ionicons)

---

## Estructura del proyecto (alto nivel)

```text
.
├─ app/
│  ├─ (auth)/                   # login/registro
│  ├─ (tabs)/                   # inicio, mis-ligas, estadisticas, perfil
│  ├─ index.tsx                 # redirect según sesión
│  └─ _layout.tsx               # providers globales (Auth/Theme)
├─ context/
│  ├─ AuthContext.tsx
│  └─ ThemeContext.tsx
├─ services/
│  └─ api.ts                    # endpoints + request()
├─ constants/
├─ types/
└─ ...
```

---

## Requisitos previos

- Node.js (LTS recomendado)
- npm
- Android Studio / Xcode o dispositivo

---

## Instalación

```bash
git clone https://github.com/IgnacioSanchezYuste/Bowleague.git
cd Bowleague
npm install
```

---

## Uso del proyecto

```bash
npm run start
```

Atajos:

```bash
npm run android
npm run ios
npm run web
npm run lint
```

---

## Configuración

### API

El cliente usa una URL base en `services/api.ts`:

- `https://ignaciosanchezyuste.es/API_Bowleague`

Recomendación: parametrizar por entorno.

### Persistencia
- Usuario: `@bowleague_user`
- Tema: `@bowleague_theme`

---

## Ejemplos prácticos

### Inicio de la app
- Si hay sesión → redirige a `/(tabs)/inicio`
- Si no hay sesión → `/(auth)/login`

### Unirse a liga por código
- Código mínimo 6 caracteres, se normaliza a mayúsculas antes de enviar.

---

## Buenas prácticas

- Mantener `services/api.ts` como punto único de contrato y normalización.
- Evitar lógica duplicada de validación, extraer helpers si crece.

---

## Troubleshooting

- **Error de API**: revisa conectividad y disponibilidad del backend.
- **No mantiene sesión**: revisa permisos/estado de AsyncStorage y que el usuario guardado tenga `id`.

---

## Contribución

1. Fork
2. Rama: `feat/mi-cambio`
3. `npm run lint`
4. PR con pasos de prueba

---

## Licencia

Este proyecto incluye un archivo `LICENSE`. Si tu intención es usar **MIT estándar**, asegúrate de que el texto del archivo sea el de MIT “puro” (sin cláusulas adicionales). Consulta [`LICENSE`](./LICENSE).

---

## Autor / contacto

- Ignacio Sanchez Yuste (GitHub: `@IgnacioSanchezYuste`)
