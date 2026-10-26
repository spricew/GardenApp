# 🌿 GardenApp

> Gestión de servicios de jardinería y a domicilio — offline-first, sin cuenta en la nube, todo en tu dispositivo.

**GardenApp** es una aplicación móvil nativa diseñada para jardineros y prestadores de servicios a domicilio que necesitan registrar, agendar, dar seguimiento y cobrar sus servicios de forma sencilla, rápida y totalmente sin conexión.

Desde una sola pantalla ves tu agenda diaria, navegas por un calendario mensual con indicadores visuales, consultas reportes de ingresos y gastos, y recibes recordatorios locales para no olvidar ninguna cita. Todo vive en una base de datos SQLite local en tu dispositivo: no hay servidores, no hay suscripciones, no hay rastreo.

---

[![Expo](https://img.shields.io/badge/Expo-57-000?style=for-the-badge&logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.86-blue?style=for-the-badge&logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![NativeWind / Tailwind](https://img.shields.io/badge/NativeWind%2FTailwind-4.1-38bdf8?style=for-the-badge&logo=tailwindcss)](https://www.nativewind.dev)
[![SQLite](https://img.shields.io/badge/SQLite-local-07405e?style=for-the-badge&logo=sqlite)](https://www.sqlite.org)
[![iOS y Android](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-000?style=for-the-badge&logo=apple)](https://reactnative.dev)

---

## 📖 ¿Qué hace GardenApp?

### 1. 🗓️ Agendamiento de servicios
Crea servicios con cliente, dirección, descripción, fecha, hora, gasto extra y recordatorio. Cada servicio tiene un estado propio (Pendiente, En Proceso, Pospuesto, Realizado, No Realizado) y puedes posponerlo con un clic, creando automáticamente una copia en la nueva fecha.

### 2. 💰 Control de pagos y cobros
Registra fechas estimadas de pago por cliente, marca cuáles están cobradas y cuáles pendientes, y consulta montos totales en cualquier momento. Ideal para llevar al día el cobro de servicios sin depender de planillas externas.

### 3. 📊 Reportes mensuales
Visualiza estadísticas agrupadas por mes:
- **Servicios:** total, conteo por estado, clientes frecuentes y servicios más realizados.
- **Cobros:** monto total, cobrados vs. pendientes, clientes por monto.
- **Inversión / Gastos:** gasto total, promedio por servicio, margen (cobros − gastos) y gasto por tipo de servicio y cliente.

### 4. 🔔 Recordatorios locales
Expo Notifications programa alertas en el dispositivo minutos antes de cada servicio. Editar o posponer un servicio reprograma automáticamente su recordatorio.

### 5. 📱 Nativo en iOS y Android
Interfaz optimizada para ambos sistemas con componentes nativos de plataforma (selectores de fecha/hora nativos, Action Sheet en iOS, Alert en Android, áreas seguras para notch y home indicator).

---

## 🧱 Estructura del proyecto

La aplicación sigue una arquitectura por capas sobre el ruteo basado en archivos de **expo-router**:

```
gardenapp/
├── app/                          # Rutas de expo-router (sistema de archivos)
│   ├── _layout.tsx               # Layout raíz: SQLiteProvider, Stack navigation
│   ├── (tabs)/                   # Navegación por pestañas (tab bar inferior)
│   │   ├── _layout.tsx           # Configuración del TabBar y sus 4 pestañas
│   │   ├── index.tsx             # Inicio — Agenda (servicios + cobros del día)
│   │   ├── calendar.tsx          # Calendario mensual con agenda del día
│   │   ├── dashboard.tsx         # Reportes mensuales (servicios, cobros, gastos)
│   │   └── settings.tsx          # Ajustes (notificaciones, clientes, servicios, recordatorio)
│   ├── service/[id].tsx          # Detalle de un servicio (estado, notas, posponer, eliminar)
│   ├── service/new.tsx           # Crear servicio nuevo
│   ├── service/edit/[id].tsx     # Editar servicio existente
│   └── payment/new.tsx           # Crear fecha de pago / cobro
├── components/                   # Componentes UI reutilizables
│   ├── Card.tsx                  # Tarjeta base con título opcional y borde continuo
│   ├── ServiceCard.tsx           # Tarjeta de servicio en la agenda
│   ├── PaymentCard.tsx           # Tarjeta de cobro (pagado / pendiente)
│   ├── ServiceForm.tsx           # Formulario completo de servicio
│   ├── StatusBadge.tsx           # Badge de estado con ícono y color
│   ├── ReminderPicker.tsx        # Selector de recordatorio en píldoras
│   ├── CalendarWidget.tsx        # Widget de calendario mensual
│   ├── CalendarDay.tsx           # Celda individual del calendario
│   ├── FABMenu.tsx               # Botón flotante de acciones rápidas
│   └── settings/                 # Secciones de la pantalla de ajustes
│       ├── NotificationsSection.tsx
│       ├── DefaultServicesSection.tsx
│       ├── DefaultReminderSection.tsx
│       ├── ClientsSection.tsx
│       └── AboutSection.tsx
├── hooks/                        # Custom hooks (presentación ↔ datos)
│   ├── useServices.ts            # CRUD de servicios por fecha
│   ├── usePayments.ts            # CRUD de pagos / cobros
│   ├── useDashboardStats.ts      # Estadísticas mensuales agregadas
│   ├── useServiceForm.ts         # Lógica del formulario de servicio
│   ├── useServiceDetail.ts       # Lógica del detalle de servicio
│   ├── useClientAutocomplete.ts  # Autocompletado de clientes frecuentes
│   ├── useServiceFormFields.ts   # Campos, validación y submit del formulario
│   ├── useServiceMultiSelect.ts  # Selección múltiple de servicios por defecto
│   ├── useListData.ts            # Hook genérico de lista con caché
│   ├── useMonthDates.ts          # Fechas con servicios/pagos en un mes
│   ├── useCrud.ts                # CRUD genérico con invalidación automática
│   └── useNotifications.ts       # Permisos de notificación (expo-notifications)
├── database/                     # Capa de acceso a datos (SQLite)
│   ├── schema.ts                 # Definición de tablas e índices SQL
│   ├── migrations.ts             # Migraciones al iniciar + siembra de datos iniciales
│   ├── repository.ts             # Repositorio centralizado de acceso a DB
│   ├── services.ts               # Consultas de servicios (CRUD, posponer, fechas por mes)
│   ├── payments.ts               # Consultas de pagos / cobros (CRUD, toggle pagado)
│   ├── clients.ts                # Consultas de clientes (CRUD)
│   ├── default_services.ts       # Servicios por defecto (plantillas del formulario)
│   ├── recurring.ts              # Servicios recurrentes (generación automática)
│   ├── stats.ts                  # Consultas de agregación para reportes
│   └── cleanup.ts                # Limpieza de servicios recurrentes legacy
├── types/                        # Tipos y constantes de dominio
│   └── index.ts                  # Interfaces, STATUS_CONFIG, REMINDER_OPTIONS, helpers
├── utils/                        # Utilidades puras
│   ├── dates.ts                  # Formateo de fechas/horas (es-MX)
│   ├── notifications.ts          # Programar / cancelar / reprogramar recordatorios
│   ├── service.ts                # Transiciones de estado y utilidades de servicio
│   ├── settings.ts               # Ajustes en AsyncStorage (recordatorio por defecto)
│   └── dbCache.ts                # Caché simple con TTL para consultas frecuentes
├── assets/                       # Íconos, splash screen, favicon
├── constants/                    # Constantes compartidas (mapeo de íconos de estado)
│   └── status.ts
├── global.css                    # Variables CSS del sistema de diseño + Tailwind
├── tailwind.config.js            # Configuración Tailwind (colores, fuentes, utilidades)
├── metro.config.js               # Config Metro (wasm para SQLite en web, COOP/COEP)
├── babel.config.js               # Babel con preset de Expo y NativeWind
├── tsconfig.json                 # TypeScript strict + paths @/* → ./*
├── app.json                      # Configuración de Expo (nombre, ícono, plugins, EAS)
├── index.ts                      # Entry point: importa expo-router/entry
├── package.json                  # Dependencias y scripts
└── docs/
    ├── CONTEXT.md                # Contexto completo del proyecto (para agentes IA)
    └── RefactorPlan.md           # Plan de refactorización en 7 fases
```

### Patrón de capas

1. **Capa de presentación** (`app/` y `components/`): pantallas y componentes UI. Usan hooks para acceder a datos.
2. **Capa de hooks** (`hooks/`): lógica de presentación, estado local y refresco con `useFocusEffect`.
3. **Capa de datos** (`database/`): funciones SQL contra `expo-sqlite` que devuelven `DatabaseResult<T>` (éxito / datos / error estructurado).
4. **Capa de dominio** (`types/`, `utils/`): interfaces, constantes y utilidades puras.

---

## 🗄️ Modelo de datos (SQLite local)

La base de datos se llama **`gardenapp.db`** y se inicializa al lanzar la app mediante `SQLiteProvider` con `onInit`, ejecutando migraciones y siembra de datos recurrentes.

| Tabla | Descripción |
|-------|-------------|
| `services` | Servicios agendados (entidad principal): cliente, dirección, descripción, fecha, hora, estado, gasto, recordatorio. |
| `recurring_services` | Plantillas de repetición (ej. "corte de césped los sábados cada 2 semanas"). |
| `clients` | Catálogo de clientes frecuentes (nombre, dirección). |
| `default_services` | Servicios tipo para el formulario (corte de césped, poda, limpieza, fertilizante). |
| `payment_dates` | Fechas de pago / cobros por cliente con monto opcional y estado pagado/pendiente. |

**Estados de servicio:** `pending` → `in_progress` → `postponed` / `done` / `not_done`, con transiciones válidas definidas en `STATUS_TRANSITIONS`.

Todas las consultas devuelven `DatabaseResult<T>` con manejo de errores estructurado (`AppError`), sin `console.log` en producción.

---

## 🎨 Sistema de diseño

GardenApp usa un sistema de diseño basado en **NativeWind + Tailwind CSS** con variables CSS centralizadas en `global.css` y `tailwind.config.js`:

- **Colores cálidos:** canvas `#f1f1f1`, carbón `#343433`, grafito `#474645`, medianoche `#121212` (botones principales), naranja ember `#ff3e00` (acento), verde válido `#00c454` (éxito), rojo coral `#ff2b3a` (eliminar).
- **Tipografía:** `Inter` para texto de UI, `Family` como display (con fallback a Inter).
- **Formas:** bordes continuos (squircle) para aspecto iOS nativo, píldoras de 32px, tarjetas con radio 30px.
- **Sombras:** borde continuo en lugar de sombras tradicionales para una superficie táctil y plana.
- **Idioma de la UI:** español con formateo de fechas en locale `es-MX`.

---

## 🚀 Instalación y puesta en marcha

### Requisitos previos

- [Node.js](https://nodejs.org/) (v18 o superior recomendado)
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/workflow/expo-cli/) (opcional, se usa `npx expo`)
- Para iOS: Xcode y un simulador iOS (macOS)
- Para Android: Android Studio y un emulador o dispositivo físico

### 1. Clona el repositorio

```bash
git clone https://github.com/tu-usuario/gardenapp.git
cd gardenapp
```

### 2. Instala las dependencias

```bash
npm install
```

> Todas las dependencias están fijadas a versiones estables (sin carets) en `package.json`, tal como exigen las reglas del proyecto.

### 3. Ejecuta en modo desarrollo

```bash
# Servidor de desarrollo de Expo
npm start

# En Android (emulador o dispositivo)
npm run android

# En iOS (simulador o dispositivo)
npm run ios

# En web (requiere wasm y headers COOP/COEP configurados en metro.config.js)
npm run web
```


---

## 📜 Scripts disponibles

| Script | Acción |
|--------|--------|
| `npm start` | Inicia el servidor de desarrollo de Expo |
| `npm run android` | Ejecuta en Android |
| `npm run ios` | Ejecuta en iOS |
| `npm run web` | Ejecuta en web |

---

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Abre un issue para discutir el cambio propuesto.
2. Crea una rama desde `main`.
3. Sigue las convenciones de código y los conventional commits en inglés.
4. Envía un pull request describiendo los cambios y los archivos modificados.

---

## 📄 Licencia

Este proyecto es privado y está bajo licencia [MIT](LICENSE).

---

## 🙌 Créditos

Construido con [Expo](https://expo.dev), [React Native](https://reactnative.dev), [NativeWind](https://www.nativewind.dev), [expo-router](https://docs.expo.dev/router/), [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) y [Tabler Icons](https://tabler-icons.io).

Diseñado pensando en jardineros y prestadores de servicios que valoran la simplicidad, la privacidad y el control total de sus datos. 🌱