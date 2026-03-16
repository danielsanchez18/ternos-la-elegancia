# 04 — Guía de base de datos y Prisma

## Objetivo del modelo
El modelo debe ser flexible para una sastrería con venta, confección, alquiler y arreglos.

## Reglas de modelado

### 1. Órdenes separadas
Usar tablas separadas para:
- venta
- confección personalizada
- alquiler
- arreglo

No volver a una tabla única de órdenes salvo decisión explícita.

### 2. Medidas reutilizables
Las medidas deben modelarse como perfiles históricos reutilizables por cliente.

Recomendación:
- `MeasurementProfile`
- `MeasurementProfileGarment`
- `MeasurementField`
- `MeasurementValue`

### 3. Personalización flexible
No modelar todos los campos de ficha técnica como columnas fijas.

Usar algo tipo:
- `CustomizationDefinition`
- `CustomizationOption`
- `CustomOrderItemPartSelection`

### 4. Variantes reales vs atributos descriptivos
Crear variantes solo cuando el atributo impacta:
- stock
- SKU
- precio base repetible

No crear variantes para atributos solo estéticos o de confección artesanal.

### 5. Alquiler por unidad física
El alquiler debe usar una entidad como `RentalUnit`.
Cada unidad física debe poder identificarse y bloquearse por disponibilidad.

### 6. Telas
Las telas requieren:
- catálogo propio
- código
- proveedor
- color
- stock en metros
- movimientos de inventario

### 7. Snapshots históricos
En órdenes guardar snapshot de:
- nombre del producto
- precio aplicado
- tela elegida
- opción elegida
- etiquetas visibles relevantes

## Reglas de migración
- No generar migraciones agresivas sin revisar impacto.
- Si se modifica Prisma, revisar también seeds y formularios.
- Si cambia un enum crítico, revisar filtros y UI.

## Prisma 7 (configuración obligatoria)

Desde Prisma 7 la URL de conexión ya no se define en `schema.prisma`.

### 1. Config central en `prisma.config.ts`
- Definir `schema`, `migrations` y `datasource.url` en `prisma.config.ts`.
- Cargar variables de entorno con `import "dotenv/config"`.

Ejemplo base:
```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
	schema: "prisma/schema.prisma",
	migrations: {
		path: "prisma/migrations",
		seed: "tsx prisma/seed.ts",
	},
	datasource: {
		url: env("DATABASE_URL"),
	},
});
```

### 2. `schema.prisma` sin `url`
- Mantener solo `provider` en `datasource db`.

### 3. Cliente Prisma con adapter de PostgreSQL
- Usar `@prisma/adapter-pg` y `pg`.
- Inicializar `PrismaClient` con `adapter` en runtime (app y seed).

### 4. Dependencias mínimas para PostgreSQL en Prisma 7
- `prisma`
- `@prisma/client`
- `@prisma/adapter-pg`
- `pg`
- `dotenv`

### 5. Comandos recomendados
- `npx prisma validate`
- `npx prisma generate`
- `npx prisma migrate dev --name <nombre>`
- `npx prisma db seed`

## Seeds mínimos esperados
- horarios base
- estados iniciales derivados del dominio
- measurement fields
- customization definitions
- customization options
- fabric samples
- catálogos base de productos

