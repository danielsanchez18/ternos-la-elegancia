# 03 — Arquitectura y convenciones

## Principios
- Código en inglés.
- UI en español.
- Tipado estricto.
- Funciones pequeñas.
- Servicios por dominio.
- Formularios complejos por pasos.
- Evitar duplicación de reglas.

## Propuesta de organización
- `src/modules/customers`
- `src/modules/catalog`
- `src/modules/appointments`
- `src/modules/sales`
- `src/modules/custom-orders`
- `src/modules/rentals`
- `src/modules/alterations`
- `src/modules/payments`
- `src/modules/fabrics`
- `src/modules/notifications`
- `src/modules/reports`
- `src/lib`
- `src/components`
- `src/app`

## Estructura sugerida por módulo
- `domain/`
- `application/`
- `infrastructure/`
- `presentation/`

## Patrones recomendados
- Zod para DTO/input schemas.
- Prisma repositories o services finos.
- Server actions o route handlers solo como capa de entrada.
- Mappers para snapshots y respuestas complejas.

## Naming
- Modelos del dominio: PascalCase.
- Variables y funciones: camelCase.
- Constantes compartidas: UPPER_SNAKE_CASE si son globales.
- Componentes React: PascalCase.

## Qué evitar
- Componentes con lógica de negocio pesada.
- Queries Prisma gigantes incrustadas en UI.
- Reglas de estados repetidas en varias capas.
- Unificar órdenes heterogéneas en una sola tabla genérica.

