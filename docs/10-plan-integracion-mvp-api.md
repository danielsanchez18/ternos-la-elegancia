# Plan de Integracion MVP API

## Objetivo

Integrar la API construida en `feature/backend` con la experiencia actual de `main` sin romper la web publica ni bloquear la evolucion del portal cliente y el panel admin.

## Alcance del MVP

- Unificar en una sola rama la base tecnica de backend:
  - Prisma 7
  - Better Auth
  - rutas `app/api`
  - modulos de dominio en `src/modules`
- Mantener la homepage y la estructura visual actual de `main`.
- Conectar el catalogo publico del home a la API real de productos y bundles.
- Reemplazar el placeholder de admin por una base operativa con estado de integracion y modulos.

## Fases

### Fase 1. Integracion tecnica

- Importar `app/api`, `lib`, `src`, `prisma`, `docs` y configuracion de Prisma.
- Actualizar dependencias del proyecto.
- Preservar la ruta publica actual basada en `app/(tabs)`.

### Fase 2. Catalogo publico

- Crear una capa compartida de consumo para endpoints publicos.
- Integrar `GET /api/products` en la seccion de productos.
- Integrar `GET /api/bundles` en la seccion de colecciones.
- Mantener fallback visual si no hay datos o la API aun no esta disponible.

### Fase 3. Base del panel admin

- Reemplazar el placeholder por una pantalla de entrada.
- Exponer modulos y accesos principales soportados por la API.
- Señalar prerrequisitos de auth, seed y entorno.

### Fase 4. Validacion

- Validar `lint`.
- Validar `build`.
- Documentar riesgos y pendientes posteriores al MVP.

## Riesgos controlados en esta integracion

- Conflicto de rutas entre `app/page.tsx` del backend y `app/(tabs)/page.tsx` de `main`.
- Caida del home por ausencia de datos reales en base de datos.
- Dependencias nuevas de Prisma y Better Auth no instaladas.

## Pendientes despues del MVP

- Login y sesion real de cliente con Better Auth.
- Proteccion de vistas por rol.
- CRUDs completos del panel admin.
- Flujo de pedidos, cupones y pagos desde frontend.
