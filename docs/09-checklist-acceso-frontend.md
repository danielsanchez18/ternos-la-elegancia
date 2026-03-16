# 09 - Checklist de Acceso para Frontend

Guia rapida para saber que puede consumir cada tipo de interfaz sin revisar toda la referencia API.

## 1. Niveles de acceso

- `public`: no requiere sesion.
- `authenticated`: requiere sesion valida (cliente o admin).
- `admin`: requiere sesion valida con perfil admin activo.

## 2. Checklist por tipo de interfaz

### 2.1 Web publica (catalogo)

Usar solo endpoints `public`.

- [ ] Cargar listado de productos: `GET /api/products`
- [ ] Cargar detalle de producto: `GET /api/products/:id`
- [ ] Cargar detalle por slug: `GET /api/products/slug/:slug`
- [ ] Cargar atributos del producto: `GET /api/products/:id/attributes`
- [ ] Cargar componentes del producto: `GET /api/products/:id/components`
- [ ] Cargar imagenes del producto: `GET /api/products/:id/images`
- [ ] Cargar variantes del producto: `GET /api/products/:id/variants`
- [ ] Cargar atributos de variante: `GET /api/products/variants/:variantId/attributes`
- [ ] Cargar bundles: `GET /api/bundles`
- [ ] Cargar bundle por id: `GET /api/bundles/:id`
- [ ] Cargar items de bundle: `GET /api/bundles/:id/items`
- [ ] Cargar items de variantes de bundle: `GET /api/bundles/:id/variant-items`

No exponer en web publica endpoints de mutacion (`POST`, `PUT`, `PATCH`, `DELETE`).

### 2.2 Portal cliente autenticado

Ademas de endpoints `public`, puede usar:

- [ ] Cupones disponibles por orden: `GET /api/orders/:orderType/:orderId/available-coupons`

Regla obligatoria de backend:
- Si la sesion es cliente, solo puede consultar ordenes propias.
- Si la sesion es admin, puede consultar cualquier orden.

### 2.3 Panel admin

Puede usar endpoints `admin` para operacion completa del negocio.

- [ ] Gestion de usuarios
- [ ] Gestion de clientes y registros (notas, archivos, perfiles de medidas)
- [ ] Gestion de productos, variantes, componentes, imagenes y atributos
- [ ] Gestion de bundles y sus items
- [ ] Gestion de telas y movimientos
- [ ] Gestion de servicios y ordenes de arreglos
- [ ] Gestion de ordenes de venta, confeccion, alquiler y arreglos
- [ ] Gestion de pagos y comprobantes por orden
- [ ] Gestion de promociones y cupones
- [ ] Gestion de citas, horarios y horarios especiales
- [ ] Gestion de notificaciones
- [ ] Consulta de reportes

## 3. Endpoints especiales

- `POST /api/internal/cron/appointments/reminder-24h`
  - Uso interno por token de cron.
  - No usar desde frontend publico ni cliente.

- `GET|POST /api/auth/[...all]`
  - Gestionado por Better Auth.
  - Consumir via cliente oficial de Better Auth en frontend.

## 4. Recomendaciones de implementacion frontend

- [ ] Centralizar control de sesion en cliente (estado autenticado/no autenticado).
- [ ] En panel admin, interceptar `401` y `403` para redireccion segura.
- [ ] En portal cliente, no permitir seleccionar `orderId` manual fuera de ordenes listadas del usuario.
- [ ] Mantener separado el consumo de API de web publica vs portal cliente vs panel admin.

## 5. Fuente de verdad

Este checklist es resumen operativo.

Para contratos completos (body, query, errores):
- Ver `docs/08-api-reference-frontend.md`.
