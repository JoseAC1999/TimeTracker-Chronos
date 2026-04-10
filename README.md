# TimeTracker Chronos

TimeTracker Chronos es una aplicación SaaS de time tracking construida con `Next.js 16 + TypeScript + Tailwind CSS + Prisma + PostgreSQL + Auth.js`. Está pensada para centralizar proyectos, tareas, sesiones manuales y cronómetros activos en una experiencia visual moderna y usable en el día a día.

La interfaz del producto está preparada en español.

## Stack

- `Next.js App Router`
- `TypeScript`
- `Tailwind CSS v4`
- `Prisma ORM`
- `PostgreSQL` compatible con `Supabase`
- `NextAuth.js` con credenciales y sesiones persistentes
- `Recharts` para analítica
- `Radix UI + componentes estilo shadcn/ui`

## Funcionalidades incluidas

- Registro, login, logout y protección de rutas privadas
- Dashboard con resumen diario, distribución por proyecto/actividad y sesiones recientes
- CRUD de proyectos con color, estado y edición
- CRUD de tareas con prioridad, estado y tags
- Cronómetro global con inicio, pausa, reanudación y stop
- Prevención de dos cronómetros activos simultáneos
- Resolución de conflicto al iniciar un nuevo timer: pausar o cerrar el actual
- Registro manual y edición de sesiones
- Soft delete y restauración para proyectos, tareas y sesiones
- Auditoría persistente de eventos clave (`create`, `update`, `soft_delete`, `restore`)
- Historial de sesiones con notas y timeline diario
- Reportes por día, semana y mes
- Filtros por proyecto, tarea y tag
- Modelo preparado para multi-workspace a nivel de base de datos
- Seed con datos demo para probar el producto nada más arrancar

## Estructura

```text
time-tracker/
  app/
    (auth)/
    (app)/
    actions/
    api/auth/[...nextauth]/
  components/
    dashboard/
    forms/
    layout/
    projects/
    reports/
    states/
    tasks/
    timer/
    ui/
  hooks/
  lib/
    auth/
    constants/
    db/
    utils/
    validations/
  prisma/
    schema.prisma
    seed.ts
  services/
    dashboard/
    projects/
    reports/
    tasks/
    time-entries/
  types/
  proxy.ts
  .env.example
```

## Requisitos

- Node.js `20+`
- npm `10+`
- PostgreSQL local o una base en Supabase

## Variables de entorno

Toma como base `.env.example`.

```bash
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
DEMO_USER_EMAIL="demo@chronos.app"
DEMO_USER_PASSWORD="Password123!"
RATE_LIMIT_DRIVER="memory" # memory | database
OBSERVABILITY_SINK_URL=""
OBSERVABILITY_SINK_TOKEN=""
OBSERVABILITY_SINK_TIMEOUT_MS="2000"
```

## Configuración con Supabase

1. Crea un proyecto en Supabase.
2. Ve a `Connect`.
3. Copia preferiblemente la URI de `Session pooler` o `Connection pooling`.
4. Usa esa URI como `DATABASE_URL`.
5. Usa esa misma URI también como `DIRECT_URL` si tu entorno local no resuelve bien el host directo `db.*.supabase.co`.

## Instalación

```bash
npm install
cp .env.example .env
```

Edita `.env` con tu conexión real a PostgreSQL o Supabase.

## Inicializar base de datos

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

Si prefieres migraciones versionadas:

```bash
npm run prisma:migrate
```

## Hardening recomendado para Supabase

Si usas Supabase solo como PostgreSQL para Prisma y no expones estas tablas vía cliente Supabase, aplica también:

```bash
npm run db:harden:supabase
```

Este script:

- activa RLS en todas las tablas de `public`
- revoca acceso de `anon` y `authenticated`
- evita que futuras tablas creadas por `postgres` vuelvan a heredar esos permisos

La app sigue funcionando porque Prisma conecta con el rol `postgres`, que en este proyecto tiene `BYPASSRLS`.

## Arrancar en desarrollo

```bash
npm run dev
```

La aplicación quedará disponible en `http://localhost:3000`.

## Credenciales demo

Si ejecutas el seed con las variables por defecto:

- Email: `demo@chronos.app`
- Password: `Password123!`

## Scripts útiles

- `npm run dev`: servidor de desarrollo
- `npm run build`: build de producción usando Webpack
- `npm run start`: arranque de producción
- `npm run lint`: validación estática
- `npm run test`: tests críticos de seguridad y validación
- `npm run prisma:generate`: genera Prisma Client
- `npm run prisma:push`: sincroniza esquema a la base
- `npm run prisma:migrate`: crea/aplica migraciones en desarrollo
- `npm run prisma:studio`: abre Prisma Studio
- `npm run db:seed`: carga datos demo

## Despliegue en Vercel

1. Sube el proyecto a GitHub.
2. Importa el repositorio en Vercel.
3. En `Environment Variables` configura:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `NEXT_PUBLIC_APP_URL`
   - `DEMO_USER_EMAIL`
   - `DEMO_USER_PASSWORD`
4. Usa como `NEXTAUTH_URL` y `NEXT_PUBLIC_APP_URL` la URL pública del proyecto en Vercel.
5. Ejecuta `npx prisma db push` contra la base remota antes del primer uso, o crea un job/manual step para ello.

Recomendación:
- Mantén Supabase para la base de datos y Vercel para el frontend/backend de Next.js.
- Usa la URI del pooler en producción si es la opción recomendada por tu proyecto de Supabase.

## Notas de arquitectura

- `app/(app)` contiene las vistas autenticadas del producto.
- `app/actions` agrupa server actions para auth, proyectos, tareas y sesiones.
- `services/*` concentra la lógica de negocio y acceso de dominio.
- `lib/validations` centraliza esquemas `Zod`.
- `prisma/schema.prisma` incluye `Workspace`, `User`, `Project`, `Task`, `Tag`, `TimeEntry` y tablas de Auth.js.
- El soporte multi-workspace está preparado en el modelo, aunque el MVP trabaja sobre un workspace principal por usuario.

## Validación realizada

Se verificó localmente:

- `npm run lint`
- `npx prisma validate`
- `npx prisma generate`
- `npm run build`

## Seguridad

- Las acciones del servidor validan pertenencia por `workspaceId` y `userId` antes de modificar recursos sensibles.
- `login` y `register` incluyen rate limiting para reducir fuerza bruta y abuso automatizado.
- El rate limiting soporta backend compartido por base de datos (`RATE_LIMIT_DRIVER=database`) para despliegues multi-instancia.
- Se envían cabeceras defensivas (`CSP`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`).
- `NEXTAUTH_SECRET` es obligatorio para arrancar autenticación.

## Observabilidad

- Hay logging estructurado en formato JSON para eventos críticos de autenticación y acciones sensibles.
- Se incrementan métricas básicas en memoria para login, registro, errores y acciones de cronómetro/proyectos/tareas.
- Se puede enviar cada evento a un proveedor externo mediante `OBSERVABILITY_SINK_URL` y `OBSERVABILITY_SINK_TOKEN`.
- Los errores de rutas autenticadas se registran con evento `app.route_error`.

Recomendación para producción:

- Enviar estos logs a una plataforma como Sentry, Datadog, Logtail o similar.
- Mover las métricas a una capa persistente o a tu proveedor de observabilidad.
- Configurar alertas para `auth.login.rate_limited`, `auth.register.failure`, `timer.start.failure` y `project.delete.failure`.

Recomendaciones para producción real:

- Mantener `NEXTAUTH_URL` sobre `https`.
- Rotar `NEXTAUTH_SECRET` desde un gestor de secretos y no desde `.env` compartidos.
- Añadir monitorización y alertas sobre login fallido, error rate y picos de registro.

## Próximos pasos recomendados

- Añadir recuperación de contraseña por email
- Agregar workspace switching para equipos
- Añadir tests de integración para auth, timers y conflictos de sesiones
- Desplegar en `Vercel + Supabase`

## Ubicación del proyecto

Por una restricción del nombre de la carpeta raíz del workspace, la app se creó dentro de:

`/Users/joseascanio/Desktop/Time Tracker/time-tracker`
