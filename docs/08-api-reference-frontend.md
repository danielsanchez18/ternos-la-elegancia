# 08 - API Reference para Integracion Frontend

Este documento describe todos los endpoints implementados actualmente en `app/api`, incluyendo metodos, filtros, params, body, respuestas y errores esperados.

## 1. Convenciones globales

- Base URL local: `http://localhost:3000`
- Prefijo API: `/api`
- Content-Type para requests con body: `application/json`
- Formato de error de validacion (Zod):

```json
{
  "error": "Invalid request body",
  "issues": [
    {
      "path": "fieldName",
      "message": "Validation message"
    }
  ]
}
```

Nota:
- En `users`, `issues` usa clave `field` en vez de `path`.

## 2. Enums utiles para frontend

### 2.1 MeasurementGarmentType
- `SACO_CABALLERO`
- `PANTALON_CABALLERO`
- `SACO_DAMA`
- `PANTALON_DAMA`
- `CAMISA`
- `BLUSA`
- `CHALECO`
- `FALDA`
- `SMOKING`

### 2.2 AppointmentType
- `TOMA_MEDIDAS`
- `ARREGLO`
- `ENTREGA`
- `ASESORIA`
- `OTRA`

### 2.3 AppointmentStatus
- `PENDIENTE`
- `CONFIRMADA`
- `REPROGRAMADA`
- `CANCELADA`
- `NO_ASISTIO`
- `REALIZADA`

### 2.4 InventoryMovementType
- `INGRESO`
- `AJUSTE`
- `VENTA`
- `ALQUILER`
- `DEVOLUCION`
- `MERMA`
- `REPARACION`

### 2.5 CustomOrderStatus
- `PENDIENTE_RESERVA`
- `RESERVA_CONFIRMADA`
- `MEDIDAS_TOMADAS`
- `EN_CONFECCION`
- `EN_PRUEBA`
- `LISTO`
- `ENTREGADO`
- `CANCELADO`

### 2.6 FabricPriceMode
- `A_TODO_COSTO`
- `SOLO_CONFECCION`

### 2.7 PaymentMethod
- `EFECTIVO`
- `YAPE`
- `PLIN`
- `TRANSFERENCIA`
- `TARJETA`
- `MIXTO`
- `OTRO`

### 2.8 PaymentStatus
- `PENDIENTE`
- `APROBADO`
- `OBSERVADO`
- `ANULADO`
- `DEVUELTO`

### 2.9 PaymentConcept
- `ADELANTO`
- `SALDO`
- `PAGO_TOTAL`
- `RESERVA_CITA`
- `OTRO`

### 2.10 VoucherProvider
- `YAPE`
- `PLIN`
- `BANCO`
- `OTRO`

### 2.11 ComprobanteType
- `BOLETA`
- `FACTURA`
- `NOTA_CREDITO`
- `NOTA_DEBITO`
- `TICKET`

### 2.12 ComprobanteStatus
- `BORRADOR`
- `EMITIDO`
- `ANULADO`

### 2.13 RentalOrderStatus
- `RESERVADO`
- `ENTREGADO`
- `DEVUELTO`
- `ATRASADO`
- `CERRADO`
- `CANCELADO`

### 2.14 RentalPriceTier
- `ESTRENO`
- `NORMAL`

### 2.15 AlterationOrderStatus
- `RECIBIDO`
- `EN_EVALUACION`
- `EN_PROCESO`
- `LISTO`
- `ENTREGADO`
- `CANCELADO`

## 3. Auth

### 3.1 BetterAuth handler
- Endpoint: `/api/auth/[...all]`
- Metodos: `GET`, `POST`
- Implementacion: delegada al handler de BetterAuth (`toNextJsHandler(auth)`).

Observacion de integracion:
- Las rutas concretas de sign-in/sign-up/session dependen de configuracion BetterAuth activa en `lib/auth.ts`.
- Recomendado: consumir el cliente oficial BetterAuth en frontend para evitar acoplarse a paths internos.

### 3.2 Matriz de acceso por endpoint

Niveles de acceso implementados actualmente:
- `public`: no requiere sesion.
- `authenticated`: requiere sesion valida (cliente o admin).
- `admin`: requiere sesion valida con perfil admin activo.

#### Endpoints public
- `GET|POST /api/auth/[...all]`
- `POST /api/internal/cron/appointments/reminder-24h` (uso interno por token de cron)
- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/products/slug/:slug`
- `GET /api/products/:id/attributes`
- `GET /api/products/:id/components`
- `GET /api/products/:id/images`
- `GET /api/products/:id/variants`
- `GET /api/products/variants/:variantId/attributes`
- `GET /api/bundles`
- `GET /api/bundles/:id`
- `GET /api/bundles/:id/items`
- `GET /api/bundles/:id/variant-items`

#### Endpoints authenticated
- `GET /api/orders/:orderType/:orderId/available-coupons`
- `POST /api/payments/izipay/session-token`

Regla adicional para `available-coupons`:
- si la sesion es de cliente, solo puede consultar cupones de ordenes propias.
- si la sesion es admin, puede consultar cualquier orden.

Reglas adicionales para `izipay/session-token`:
- si la sesion es de cliente, solo puede solicitar token para ordenes propias.
- valida tope Yape Code: total de orden debe ser menor o igual a `S/ 2000`.
- soporta modo simulacion con `IZIPAY_MOCK_MODE=true` (respuesta incluye `tokenSource: "mock"`).

#### Endpoints admin
- `GET|POST /api/users`
- `GET|PATCH|DELETE /api/users/:id`

- `GET|POST /api/brands`
- `GET|PATCH|DELETE /api/brands/:id`

- `GET|POST /api/customers`
- `GET|PATCH|DELETE /api/customers/:id`
- `GET|POST /api/customers/:id/measurement-profiles`
- `GET|POST /api/customers/:id/notes`
- `PATCH|DELETE /api/customers/notes/:noteId`
- `GET|POST /api/customers/:id/files`
- `PATCH|DELETE /api/customers/files/:fileId`

- `GET|POST /api/fabrics`
- `GET|PATCH|DELETE /api/fabrics/:id`
- `GET|POST /api/fabrics/:id/movements`

- `GET /api/measurement-fields`
- `GET|PATCH /api/measurement-profiles/:id`
- `GET|PUT /api/measurement-profiles/:id/values`

- `GET|POST /api/appointments`
- `GET|PATCH /api/appointments/:id`
- `GET|PUT /api/appointments/business-hours`
- `GET|POST /api/appointments/special-schedules`
- `PATCH|DELETE /api/appointments/special-schedules/:id`

- `GET|POST /api/alteration-services`
- `GET|PATCH|DELETE /api/alteration-services/:id`

- `GET|POST /api/alteration-orders`
- `GET|PATCH /api/alteration-orders/:id`
- `GET|POST /api/alteration-orders/:id/payments`
- `GET|POST /api/alteration-orders/:id/comprobantes`

- `GET|POST /api/sale-orders`
- `GET|PATCH /api/sale-orders/:id`
- `GET|POST /api/sale-orders/:id/payments`
- `GET|POST /api/sale-orders/:id/comprobantes`

- `GET|POST /api/custom-orders`
- `GET|PATCH /api/custom-orders/:id`
- `GET|POST /api/custom-orders/:id/payments`
- `GET|POST /api/custom-orders/:id/comprobantes`

- `GET|POST /api/rental-orders`
- `GET|PATCH /api/rental-orders/:id`
- `GET|POST /api/rental-orders/:id/payments`
- `GET|POST /api/rental-orders/:id/comprobantes`

- `GET|POST /api/rental-units`
- `GET|PATCH|DELETE /api/rental-units/:id`
- `PATCH /api/rental-units/:id/actions`

- `GET|POST /api/promotions`
- `GET|PATCH|DELETE /api/promotions/:id`

- `GET|POST /api/coupons`
- `GET|PATCH|DELETE /api/coupons/:id`
- `POST /api/coupons/:id/apply`
- `POST /api/coupons/:id/preview`
- `GET /api/coupons/:id/uses`
- `DELETE /api/coupons/uses/:useId`

- `GET|POST /api/catalog/attribute-definitions`
- `GET|PATCH|DELETE /api/catalog/attribute-definitions/:definitionId`
- `GET|POST /api/catalog/attribute-definitions/:definitionId/options`
- `PATCH|DELETE /api/catalog/attribute-options/:optionId`

- `POST /api/products`
- `PATCH|DELETE /api/products/:id`
- `PUT /api/products/:id/attributes`
- `DELETE /api/products/:id/attributes/:definitionId`
- `POST /api/products/:id/components`
- `PATCH|DELETE /api/products/components/:componentId`
- `POST /api/products/:id/images`
- `PATCH|DELETE /api/products/images/:imageId`
- `POST /api/products/:id/variants`
- `PATCH|DELETE /api/products/variants/:variantId`
- `PUT /api/products/variants/:variantId/attributes`
- `DELETE /api/products/variants/:variantId/attributes/:definitionId`

- `POST /api/bundles`
- `PATCH|DELETE /api/bundles/:id`
- `POST /api/bundles/:id/items`
- `PATCH|DELETE /api/bundles/items/:itemId`
- `POST /api/bundles/:id/variant-items`
- `PATCH|DELETE /api/bundles/variant-items/:itemId`

- `GET /api/notifications`
- `POST /api/notifications/appointments/reminder-24h`

- `GET /api/reports/minimum`

## 4. Users

## 4.1 GET /api/users
Lista usuarios.

Query params:
- No soporta filtros actualmente.

Respuestas:
- `200`: array de usuarios.

## 4.2 POST /api/users
Crea usuario basico.

Body:
```json
{
  "email": "user@example.com",
  "name": "Nombre Usuario"
}
```

Validaciones:
- `email`: email valido
- `name`: string trim, requerido, max 120

Respuestas:
- `201`: usuario creado
- `400`: body invalido
- `409`: `{"error":"Email already exists"}`
- `500`: error no controlado

## 4.3 GET /api/users/:id
Obtiene usuario por UUID.

Route params:
- `id`: UUID

Respuestas:
- `200`: usuario
- `400`: param invalido
- `404`: no encontrado

## 4.4 PATCH /api/users/:id
Actualiza usuario.

Route params:
- `id`: UUID

Body (parcial, al menos 1 campo):
```json
{
  "email": "nuevo@example.com",
  "name": "Nuevo Nombre"
}
```

Respuestas:
- `200`: usuario actualizado
- `400`: param/body invalido
- `404`: usuario no encontrado
- `409`: email duplicado

## 4.5 DELETE /api/users/:id
Elimina usuario.

Route params:
- `id`: UUID

Respuestas:
- `200`: `{"ok":true}`
- `400`: param invalido
- `404`: usuario no encontrado

## 5. Customers

## 5.1 GET /api/customers
Lista clientes.

Query params:
- No soporta filtros actualmente.

Respuestas:
- `200`: array de clientes

## 5.2 POST /api/customers
Crea cliente.

Body:
```json
{
  "nombres": "Juan",
  "apellidos": "Perez",
  "email": "juan@example.com",
  "celular": "999888777",
  "dni": "12345678",
  "password": "SuperSecreta1"
}
```

Validaciones:
- `nombres`: requerido, max 120
- `apellidos`: requerido, max 120
- `email`: formato email
- `celular`: opcional, min 6, max 20
- `dni`: requerido, min 8, max 20
- `password`: requerido, min 8, max 72

Respuestas:
- `201`: cliente creado
- `400`: body invalido
- `409`: cliente existente (`fields` con campos en conflicto)

## 5.3 GET /api/customers/:id
Obtiene cliente por id numerico.

Route params:
- `id`: entero positivo

Respuestas:
- `200`: cliente
- `400`: param invalido
- `404`: no encontrado

## 5.4 PATCH /api/customers/:id
Actualiza cliente.

Body parcial (al menos un campo):
```json
{
  "nombres": "Juan Carlos",
  "celular": null,
  "isActive": true
}
```

Notas:
- `celular` acepta `string` o `null`.

Respuestas:
- `200`: cliente actualizado
- `400`: param/body invalido
- `404`: no encontrado
- `409`: conflicto por email/dni

## 5.5 DELETE /api/customers/:id
Desactivacion logica de cliente.

Respuestas:
- `200`: cliente actualizado (normalmente con `isActive=false`)
- `400`: param invalido
- `404`: no encontrado

## 6. Measurement Fields y Profiles

## 6.1 GET /api/measurement-fields
Lista campos por tipo de prenda.

Query params:
- `garmentType` (requerido): `MeasurementGarmentType`

Ejemplo:
- `/api/measurement-fields?garmentType=SACO_CABALLERO`

Respuestas:
- `200`: array de campos
- `400`: query invalida

## 6.2 GET /api/customers/:id/measurement-profiles
Lista perfiles de medidas del cliente.

Route params:
- `id`: customerId entero positivo

Respuestas:
- `200`: array de perfiles
- `400`: param invalido

## 6.3 POST /api/customers/:id/measurement-profiles
Crea perfil de medidas para cliente.

Route params:
- `id`: customerId entero positivo

Body:
```json
{
  "takenAt": "2026-03-09T18:00:00.000Z",
  "notes": "Primera toma",
  "garmentTypes": ["SACO_CABALLERO", "PANTALON_CABALLERO"]
}
```

Validaciones:
- `takenAt`: opcional, fecha
- `notes`: opcional, max 500
- `garmentTypes`: opcional, array enum

Respuestas:
- `201`: perfil creado
- `400`: param/body invalido
- `404`: cliente no encontrado
- `409`: tipos de prenda duplicados en el perfil

## 6.4 GET /api/measurement-profiles/:id
Obtiene perfil por id.

Route params:
- `id`: profileId entero positivo

Respuestas:
- `200`: perfil con garments y valores
- `400`: param invalido
- `404`: no encontrado

## 6.5 PATCH /api/measurement-profiles/:id
Actualiza metadata de perfil.

Body (al menos un campo):
```json
{
  "notes": "Ajuste de observaciones",
  "validUntil": "2026-06-09T18:00:00.000Z",
  "isActive": true
}
```

Notas:
- `notes` admite `null` para limpiar.

Respuestas:
- `200`: perfil actualizado
- `400`: param/body invalido
- `404`: no encontrado

## 6.6 GET /api/measurement-profiles/:id/values
Obtiene valores de una prenda del perfil.

Route params:
- `id`: profileId entero positivo

Query params:
- `garmentType` (requerido): `MeasurementGarmentType`

Ejemplo:
- `/api/measurement-profiles/10/values?garmentType=SACO_CABALLERO`

Respuestas:
- `200`: valores del garment
- `400`: param/query invalida
- `404`: perfil no existe o no hay garment para ese tipo

## 6.7 PUT /api/measurement-profiles/:id/values
Inserta/actualiza valores de medidas por garment.

Body:
```json
{
  "garmentType": "SACO_CABALLERO",
  "values": [
    { "fieldId": 1, "valueNumber": 46.5 },
    { "fieldId": 2, "valueText": "Regular" }
  ]
}
```

Validaciones:
- `values` minimo 1
- cada item requiere `fieldId` + (`valueNumber` o `valueText`)
- `fieldId` no puede repetirse en el mismo payload

Respuestas:
- `200`: valores persistidos
- `400`: param/body invalido
- `404`: perfil no encontrado
- `409`: field invalido para garmentType

## 7. Appointments

## 7.1 GET /api/appointments
Lista citas con filtros.

Query params opcionales:
- `customerId`: entero positivo
- `status`: `AppointmentStatus`
- `from`: fecha
- `to`: fecha

Ejemplos de consulta:
- `/api/appointments?customerId=1`
- `/api/appointments?status=PENDIENTE`
- `/api/appointments?from=2026-03-01T00:00:00.000Z&to=2026-03-31T23:59:59.000Z`
- `/api/appointments?customerId=1&status=CONFIRMADA&from=2026-03-01T00:00:00.000Z`

Respuestas:
- `200`: array de citas
- `400`: query invalida

## 7.2 POST /api/appointments
Crea cita.

Body:
```json
{
  "customerId": 1,
  "type": "TOMA_MEDIDAS",
  "scheduledAt": "2026-03-12T15:30:00.000Z",
  "notes": "Cliente nuevo",
  "internalNotes": "Prioridad alta"
}
```

Respuestas:
- `201`: cita creada
- `400`: body invalido
- `404`: cliente no encontrado
- `409`: fuera de horario o sin cupo

Reglas de negocio:
- Solo bloques de `:00` y `:30`.
- Debe caer dentro de horario de atencion (primero `SpecialSchedule`, luego `BusinessHour`, y finalmente horario fallback).
- No se permiten traslapes con citas activas (`PENDIENTE`, `CONFIRMADA`, `REPROGRAMADA`) en la ventana de 30 minutos.

## 7.3 GET /api/appointments/:id
Obtiene cita por id.

Respuestas:
- `200`: cita
- `400`: param invalido
- `404`: no encontrada

## 7.4 PATCH /api/appointments/:id
Ejecuta transiciones/acciones de cita.

Acciones soportadas:
- `CONFIRM`
- `COMPLETE`
- `NO_SHOW`
- `CANCEL`
- `RESCHEDULE` (requiere `scheduledAt`)

Body ejemplos:
```json
{ "action": "CONFIRM", "note": "Confirmada por telefono" }
```

```json
{ "action": "RESCHEDULE", "scheduledAt": "2026-03-13T16:00:00.000Z", "note": "Cliente solicito cambio" }
```

Respuestas:
- `200`: cita actualizada
- `400`: param/body invalido
- `404`: cita no encontrada
- `409`: transicion no permitida, deadline excedido, fuera de horario, o slot ocupado

## 7.5 GET /api/appointments/business-hours
Lista horario semanal operativo (0=domingo ... 6=sabado).

Respuestas:
- `200`: array de 7 filas con `dayOfWeek`, `openTime`, `closeTime`, `isClosed`, `note`

## 7.6 PUT /api/appointments/business-hours
Actualiza o crea configuracion de un dia de la semana.

Body:
```json
{
  "dayOfWeek": 1,
  "openTime": "09:00",
  "closeTime": "19:30",
  "isClosed": false,
  "note": "Horario regular"
}
```

Reglas:
- Si `isClosed=false`, `openTime` y `closeTime` son requeridos.
- `openTime` debe ser menor que `closeTime`.
- Si `isClosed=true`, `openTime/closeTime` se guardan en `null`.

Respuestas:
- `200`: horario actualizado
- `400`: body invalido
- `409`: reglas de horario invalidas

## 7.7 GET /api/appointments/special-schedules
Lista excepciones de calendario por fecha.

Query params opcionales:
- `from`: fecha
- `to`: fecha

Respuestas:
- `200`: array de excepciones
- `400`: query invalida

## 7.8 POST /api/appointments/special-schedules
Crea (o reemplaza por fecha) una excepcion de calendario.

Body:
```json
{
  "date": "2026-03-29",
  "openTime": "10:00",
  "closeTime": "14:00",
  "isClosed": false,
  "note": "Horario por feriado"
}
```

Respuestas:
- `201`: excepcion creada/actualizada
- `400`: body invalido
- `409`: reglas de horario invalidas

## 7.9 PATCH /api/appointments/special-schedules/:id
Actualiza una excepcion por id.

Body parcial (al menos un campo):
```json
{
  "isClosed": true,
  "note": "Dia no laborable"
}
```

Respuestas:
- `200`: excepcion actualizada
- `400`: param/body invalido
- `404`: excepcion no encontrada
- `409`: reglas de horario invalidas

## 7.10 DELETE /api/appointments/special-schedules/:id
Elimina excepcion de calendario.

Respuestas:
- `200`: `{ "ok": true }`
- `400`: param invalido
- `404`: excepcion no encontrada

## 8. Fabrics

## 8.1 GET /api/fabrics
Lista telas.

Query params:
- No soporta filtros actualmente.

Respuestas:
- `200`: array de telas

## 8.2 POST /api/fabrics
Crea tela.

Body:
```json
{
  "code": "TELA-001",
  "nombre": "Casimir Azul",
  "color": "Azul Marino",
  "supplier": "Proveedor A",
  "composition": "70% lana, 30% poliester",
  "pattern": "Liso",
  "metersInStock": 25,
  "minMeters": 5,
  "costPerMeter": 45.5,
  "pricePerMeter": 95,
  "active": true
}
```

Respuestas:
- `201`: tela creada
- `400`: body invalido
- `409`: codigo duplicado

## 8.3 GET /api/fabrics/:id
Obtiene tela por id.

Respuestas:
- `200`: tela
- `400`: param invalido
- `404`: no encontrada

## 8.4 PATCH /api/fabrics/:id
Actualiza tela.

Body (al menos un campo):
```json
{
  "nombre": "Casimir Azul Premium",
  "pricePerMeter": 120,
  "color": null
}
```

Notas:
- Campos opcionales aceptan `null` para limpiar: `color`, `supplier`, `composition`, `pattern`, `costPerMeter`, `pricePerMeter`.

Respuestas:
- `200`: tela actualizada
- `400`: param/body invalido
- `404`: no encontrada
- `409`: codigo duplicado

## 8.5 DELETE /api/fabrics/:id
Desactiva tela.

Respuestas:
- `200`: tela desactivada
- `400`: param invalido
- `404`: no encontrada

## 8.6 GET /api/fabrics/:id/movements
Lista movimientos de inventario de una tela.

Respuestas:
- `200`: array de movimientos
- `400`: param invalido
- `404`: tela no encontrada

## 8.7 POST /api/fabrics/:id/movements
Crea movimiento de inventario.

Body:
```json
{
  "type": "INGRESO",
  "quantity": 10,
  "note": "Compra semanal"
}
```

Regla de negocio:
- Si el movimiento deja stock negativo, responde conflicto.

Respuestas:
- `201`: objeto con `fabric` actualizada y `movement` creado
- `400`: param/body invalido
- `404`: tela no encontrada
- `409`: movimiento invalido

## 9. Custom Orders

## 9.1 GET /api/custom-orders
Lista ordenes de confeccion con filtros avanzados, orden y paginacion.

Query params opcionales:
- `customerId`: entero positivo
- `status`: `CustomOrderStatus`
- `code`: texto, busqueda parcial case-insensitive
- `requiresMeasurement`: `true` o `false`
- `firstPurchaseFlow`: `true` o `false`
- `createdFrom`: datetime ISO con offset (ejemplo `2026-03-01T00:00:00-05:00`)
- `createdTo`: datetime ISO con offset
- `promisedFrom`: datetime ISO con offset
- `promisedTo`: datetime ISO con offset
- `page`: entero positivo, default `1`
- `pageSize`: entero 1..100, default `20`
- `orderBy`: `createdAt` | `promisedDeliveryAt` | `total`, default `createdAt`
- `order`: `asc` | `desc`, default `desc`

Ejemplos de consulta:
- `/api/custom-orders?page=1&pageSize=20`
- `/api/custom-orders?status=EN_CONFECCION&orderBy=createdAt&order=desc`
- `/api/custom-orders?customerId=1&requiresMeasurement=true`
- `/api/custom-orders?code=CUS-20260309`
- `/api/custom-orders?createdFrom=2026-03-01T00:00:00-05:00&createdTo=2026-03-31T23:59:59-05:00`
- `/api/custom-orders?promisedFrom=2026-03-10T00:00:00-05:00&promisedTo=2026-03-20T23:59:59-05:00&orderBy=promisedDeliveryAt&order=asc`

Respuesta `200`:
```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "pageSize": 20,
  "pageCount": 1
}
```

Errores:
- `400`: query invalida

## 9.2 POST /api/custom-orders
Crea orden de confeccion con items, partes, telas y selecciones.

Body (estructura completa):
```json
{
  "customerId": 1,
  "firstPurchaseFlow": false,
  "requestedDeliveryAt": "2026-03-20T10:00:00.000Z",
  "promisedDeliveryAt": "2026-03-25T10:00:00.000Z",
  "notes": "Cliente desea corte slim",
  "internalNotes": "Prioridad media",
  "items": [
    {
      "productId": 5,
      "itemNameSnapshot": "Terno 2 piezas",
      "quantity": 1,
      "unitPrice": 650,
      "discountAmount": 20,
      "notes": "Incluye prueba intermedia",
      "parts": [
        {
          "productId": 6,
          "garmentType": "SACO_CABALLERO",
          "label": "Saco principal",
          "workMode": "A_TODO_COSTO",
          "measurementProfileId": 3,
          "measurementProfileGarmentId": 10,
          "fabricId": 2,
          "unitPrice": 350,
          "notes": "Cuello clasico",
          "selections": [
            {
              "definitionId": 1,
              "optionId": 4
            },
            {
              "definitionId": 2,
              "valueText": "Sin hombreras"
            }
          ]
        }
      ]
    }
  ]
}
```

Reglas destacadas aplicadas por backend:
- valida cliente existente
- valida perfil de medidas activo y vigente cuando se referencia
- si faltan medidas vigentes para una prenda, marca `requiresMeasurement=true`
- guarda snapshots de tela y personalizaciones en la orden
- calcula subtotal/descuento/total
- crea historial inicial de estado

Respuestas:
- `201`: orden creada con detalle completo
- `400`: body invalido
- `404`: customer o fabric no encontrado
- `409`: personalizacion invalida o medidas no validas

## 9.3 GET /api/custom-orders/:id
Obtiene orden por id.

Respuestas:
- `200`: orden completa (items, parts, selections, snapshots)
- `400`: param invalido
- `404`: orden no encontrada

## 9.4 PATCH /api/custom-orders/:id
Acciones de cambio de estado de orden.

Body:
```json
{
  "action": "START_CONFECTION",
  "note": "Inicia corte"
}
```

Acciones validas:
- `CONFIRM_RESERVATION`
- `MARK_MEASUREMENTS_TAKEN`
- `START_CONFECTION`
- `START_FITTING`
- `MARK_READY`
- `MARK_DELIVERED`
- `CANCEL`

Respuestas:
- `200`: orden actualizada
- `400`: param/body invalido
- `404`: orden no encontrada
- `409`: transicion no permitida, o adelanto aprobado insuficiente para iniciar confeccion

Regla critica de negocio:
- Para `START_CONFECTION`, el backend exige pagos aprobados acumulados >= 50% del total de la orden.
- Si no se cumple, responde:

```json
{
  "error": "A 50% approved advance payment is required before starting confección"
}
```

## 10. Payments y Comprobantes (Custom Orders)

Los endpoints de este bloque estan anidados en `custom-orders` para mantener trazabilidad por orden.

## 10.1 GET /api/custom-orders/:id/payments
Lista pagos de la orden y devuelve resumen financiero de validacion de adelanto.

Route params:
- `id`: customOrderId entero positivo

Query params opcionales:
- `status`: `PaymentStatus`
- `concept`: `PaymentConcept`
- `method`: `PaymentMethod`
- `from`: fecha
- `to`: fecha

Ejemplos:
- `/api/custom-orders/12/payments`
- `/api/custom-orders/12/payments?status=APROBADO`
- `/api/custom-orders/12/payments?concept=ADELANTO&method=YAPE`
- `/api/custom-orders/12/payments?from=2026-03-01T00:00:00.000Z&to=2026-03-31T23:59:59.000Z`

Respuesta `200`:
```json
{
  "payments": [
    {
      "id": 10,
      "customerId": 3,
      "customOrderId": 12,
      "amount": "350.00",
      "method": "YAPE",
      "concept": "ADELANTO",
      "status": "APROBADO",
      "provider": "YAPE",
      "operationCode": "OP-9981",
      "approvalCode": "APR-22",
      "voucherUrl": "https://example.com/voucher.png",
      "paidAt": "2026-03-09T23:00:00.000Z",
      "notes": "Adelanto inicial",
      "createdAt": "2026-03-09T23:01:00.000Z",
      "updatedAt": "2026-03-09T23:01:00.000Z"
    }
  ],
  "summary": {
    "customOrderId": 12,
    "orderTotal": "650.00",
    "approvedPaymentsTotal": "350.00",
    "pendingBalance": "300.00",
    "minAdvanceRequired": "325.00",
    "hasRequiredAdvance": true
  }
}
```

Errores:
- `400`: params/query invalidos
- `404`: custom order no encontrada

## 10.2 POST /api/custom-orders/:id/payments
Crea pago para la orden de confeccion.

Route params:
- `id`: customOrderId entero positivo

Body:
```json
{
  "amount": 350,
  "method": "YAPE",
  "concept": "ADELANTO",
  "status": "APROBADO",
  "provider": "YAPE",
  "operationCode": "OP-9981",
  "approvalCode": "APR-22",
  "voucherUrl": "https://example.com/voucher.png",
  "paidAt": "2026-03-09T23:00:00.000Z",
  "notes": "Adelanto inicial"
}
```

Validaciones y reglas:
- `amount` > 0
- Si no se envian:
  - `concept` default `ADELANTO`
  - `status` default `APROBADO`
- No permite sobrepago aprobado (monto aprobado acumulado > total de la orden)

Respuesta `201`:
```json
{
  "payment": {
    "id": 10,
    "customerId": 3,
    "customOrderId": 12,
    "amount": "350.00",
    "method": "YAPE",
    "concept": "ADELANTO",
    "status": "APROBADO",
    "provider": "YAPE",
    "operationCode": "OP-9981",
    "approvalCode": "APR-22",
    "voucherUrl": "https://example.com/voucher.png",
    "paidAt": "2026-03-09T23:00:00.000Z",
    "notes": "Adelanto inicial",
    "createdAt": "2026-03-09T23:01:00.000Z",
    "updatedAt": "2026-03-09T23:01:00.000Z"
  },
  "summary": {
    "customOrderId": 12,
    "orderTotal": "650.00",
    "approvedPaymentsTotal": "350.00",
    "pendingBalance": "300.00",
    "minAdvanceRequired": "325.00",
    "hasRequiredAdvance": true
  }
}
```

Errores:
- `400`: params/body invalidos
- `404`: custom order no encontrada
- `409`: sobrepago detectado

## 10.3 GET /api/custom-orders/:id/comprobantes
Lista comprobantes de la orden.

Route params:
- `id`: customOrderId entero positivo

Query params opcionales:
- `status`: `ComprobanteStatus`
- `type`: `ComprobanteType`
- `from`: fecha
- `to`: fecha

Ejemplos:
- `/api/custom-orders/12/comprobantes`
- `/api/custom-orders/12/comprobantes?status=EMITIDO`
- `/api/custom-orders/12/comprobantes?type=BOLETA&from=2026-03-01T00:00:00.000Z&to=2026-03-31T23:59:59.000Z`

Respuesta `200`:
- Array de comprobantes de la orden.

Errores:
- `400`: params/query invalidos
- `404`: custom order no encontrada

## 10.4 POST /api/custom-orders/:id/comprobantes
Crea comprobante para la orden.

Route params:
- `id`: customOrderId entero positivo

Body:
```json
{
  "type": "BOLETA",
  "status": "BORRADOR",
  "serie": "B001",
  "numero": "000123",
  "subtotal": 550,
  "impuesto": 99,
  "total": 649,
  "issuedAt": "2026-03-10T10:00:00.000Z",
  "pdfUrl": "https://example.com/comp.pdf",
  "xmlUrl": "https://example.com/comp.xml",
  "notes": "Comprobante de adelanto"
}
```

Validaciones y reglas:
- `total` requerido y >= 0
- `subtotal`/`impuesto` opcionales (default 0)
- no permite comprobante con total mayor al total de la orden

Respuestas:
- `201`: comprobante creado
- `400`: params/body invalidos
- `404`: custom order no encontrada
- `409`: total de comprobante excede total de orden

## 11. Matriz de filtros por endpoint

| Endpoint | Filtros disponibles |
|---|---|
| `GET /api/users` | Sin filtros |
| `GET /api/customers` | Sin filtros |
| `GET /api/measurement-fields` | `garmentType` |
| `GET /api/customers/:id/measurement-profiles` | Sin filtros |
| `GET /api/measurement-profiles/:id/values` | `garmentType` |
| `GET /api/appointments` | `customerId`, `status`, `from`, `to` |
| `GET /api/appointments/business-hours` | Sin filtros |
| `GET /api/appointments/special-schedules` | `from`, `to` |
| `GET /api/notifications` | `customerId`, `channel`, `status`, `from`, `to` |
| `GET /api/fabrics` | Sin filtros |
| `GET /api/alteration-services` | `active` |
| `GET /api/fabrics/:id/movements` | Sin filtros |
| `GET /api/custom-orders` | `customerId`, `status`, `code`, `requiresMeasurement`, `firstPurchaseFlow`, `createdFrom`, `createdTo`, `promisedFrom`, `promisedTo`, `page`, `pageSize`, `orderBy`, `order` |
| `GET /api/custom-orders/:id/payments` | `status`, `concept`, `method`, `from`, `to` |
| `GET /api/custom-orders/:id/comprobantes` | `status`, `type`, `from`, `to` |
| `GET /api/sale-orders` | `customerId`, `status`, `code`, `requestedFrom`, `requestedTo`, `page`, `pageSize`, `orderBy`, `order` |
| `GET /api/sale-orders/:id/payments` | `status`, `concept`, `method`, `from`, `to` |
| `GET /api/sale-orders/:id/comprobantes` | `status`, `type`, `from`, `to` |
| `GET /api/rental-orders` | `customerId`, `status`, `code`, `hasDelay`, `hasDamage`, `pickupFrom`, `pickupTo`, `dueFrom`, `dueTo`, `page`, `pageSize`, `orderBy`, `order` |
| `GET /api/rental-orders/:id/payments` | `status`, `concept`, `method`, `from`, `to` |
| `GET /api/rental-orders/:id/comprobantes` | `status`, `type`, `from`, `to` |
| `GET /api/alteration-orders` | `customerId`, `serviceId`, `status`, `code`, `receivedFrom`, `receivedTo`, `promisedFrom`, `promisedTo`, `page`, `pageSize`, `orderBy`, `order` |
| `GET /api/alteration-orders/:id/payments` | `status`, `concept`, `method`, `from`, `to` |
| `GET /api/alteration-orders/:id/comprobantes` | `status`, `type`, `from`, `to` |

## 12. Recomendaciones para consumo frontend

- Normalizar parseo de fechas a ISO UTC en cliente antes de enviar.
- Construir utilitario de query params para omitir campos vacios.
- Manejar `400` mostrando `issues` campo por campo.
- Manejar `409` con mensajes de negocio (estado no permitido, codigo duplicado, etc.).
- Para listados grandes (`custom-orders`), usar estado de paginacion con `page`, `pageSize`, `total`, `pageCount`.
- Para enums, centralizar constantes UI para evitar strings hardcodeados.
- Para agenda, consumir `GET /api/appointments/business-hours` y `GET /api/appointments/special-schedules` para construir calendario operativo real.
- Para notificaciones de citas, ejecutar `POST /api/notifications/appointments/reminder-24h` (idealmente por cron/job) y monitorear resultados por `GET /api/notifications`.
- Para ejecucion automatica segura, usar endpoint interno `POST /api/internal/cron/appointments/reminder-24h` con `Authorization: Bearer <CRON_SECRET>`.
- Para flujos de confeccion, consumir `GET /api/custom-orders/:id/payments` y habilitar `START_CONFECTION` solo cuando `summary.hasRequiredAdvance === true`.
- Para venta directa, consumir `GET /api/sale-orders/:id/payments` y habilitar `MARK_PAID` solo cuando `summary.isFullyPaid === true`.
- Para alquiler, consumir `GET /api/rental-orders/:id/payments` y usar `summary.pendingBalance` para mostrar saldo pendiente en devolucion/cierre.
- Para arreglos, consumir `GET /api/alteration-orders/:id/payments` y mostrar `summary.pendingBalance` antes de `MARK_DELIVERED`.

## 13. Sale Orders

## 13.1 GET /api/sale-orders
Lista ordenes de venta con filtros avanzados, orden y paginacion.

Query params opcionales:
- `customerId`: entero positivo
- `status`: `SaleOrderStatus`
- `code`: texto, busqueda parcial case-insensitive
- `requestedFrom`: fecha
- `requestedTo`: fecha
- `page`: entero positivo, default `1`
- `pageSize`: entero 1..100, default `20`
- `orderBy`: `createdAt` | `requestedAt` | `total`, default `createdAt`
- `order`: `asc` | `desc`, default `desc`

Ejemplos:
- `/api/sale-orders?page=1&pageSize=20`
- `/api/sale-orders?status=PENDIENTE_PAGO`
- `/api/sale-orders?customerId=1&status=PAGADO`
- `/api/sale-orders?code=SAL-20260309`
- `/api/sale-orders?requestedFrom=2026-03-01T00:00:00.000Z&requestedTo=2026-03-31T23:59:59.000Z`
- `/api/sale-orders?orderBy=total&order=asc&page=2&pageSize=10`

Respuesta `200`:
```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "pageSize": 20,
  "pageCount": 1
}
```

Errores:
- `400`: query invalida

## 13.2 POST /api/sale-orders
Crea orden de venta.

Body completo:
```json
{
  "customerId": 1,
  "notes": "Venta mostrador",
  "requestedAt": "2026-03-10T14:00:00.000Z",
  "items": [
    {
      "productId": 10,
      "itemNameSnapshot": "Camisa Blanca Slim",
      "quantity": 2,
      "unitPrice": 120,
      "discountAmount": 10,
      "notes": "Empaque regalo",
      "components": [
        {
          "variantId": 33,
          "quantity": 2
        }
      ]
    },
    {
      "bundleId": 3,
      "quantity": 1,
      "unitPrice": 450,
      "discountAmount": 0
    }
  ]
}
```

Reglas de validacion:
- cada item debe tener exactamente uno: `productId` o `bundleId`
- `quantity` default `1`
- `unitPrice >= 0`
- `discountAmount >= 0`
- subtotal de item no puede quedar negativo
- en `components`, cada componente requiere `productId` o `variantId`

Regla de negocio (medidas en primera compra de terno/saco):
- si la orden incluye un producto `TERNO` o `SACO` (o un bundle que los contenga),
- y el cliente no tiene compras previas no canceladas de `TERNO/SACO`,
- y no tiene ficha de medidas vigente,
- entonces debe existir una cita `TOMA_MEDIDAS` reservada (`PENDIENTE`, `CONFIRMADA` o `REPROGRAMADA`) en fecha futura.

Si no se cumple, responde:
```json
{
  "error": "First suit/jacket purchase without valid measurements requires a reserved measurement appointment"
}
```

Respuestas:
- `201`: orden creada
- `400`: body invalido
- `404`: cliente no encontrado
- `409`: referencias invalidas (producto/bundle), regla de item o regla de medidas/cita

## 13.3 GET /api/sale-orders/:id
Obtiene orden de venta por id.

Respuestas:
- `200`: orden completa con items y components
- `400`: param invalido
- `404`: orden no encontrada

## 13.4 PATCH /api/sale-orders/:id
Acciones de cambio de estado de venta.

Body:
```json
{
  "action": "MARK_PAID",
  "note": "Pago confirmado en caja"
}
```

Acciones validas:
- `MARK_PAID` -> `PAGADO`
- `START_PREPARATION` -> `EN_PREPARACION`
- `MARK_READY_FOR_PICKUP` -> `LISTO_PARA_RECOJO`
- `MARK_DELIVERED` -> `ENTREGADO`
- `CANCEL` -> `CANCELADO`

Regla critica de negocio:
- Para `MARK_PAID`, pagos aprobados acumulados deben cubrir 100% del total de la orden.
- Si no se cumple:

```json
{
  "error": "Approved payments must cover total before marking order as paid"
}
```

Respuestas:
- `200`: orden actualizada
- `400`: param/body invalido
- `404`: orden no encontrada
- `409`: transicion no permitida o pagos aprobados insuficientes

## 14. Payments y Comprobantes (Sale Orders)

## 14.1 GET /api/sale-orders/:id/payments
Lista pagos de la orden y devuelve resumen financiero.

Query params opcionales:
- `status`: `PaymentStatus`
- `concept`: `PaymentConcept`
- `method`: `PaymentMethod`
- `from`: fecha
- `to`: fecha

Respuesta `200`:
```json
{
  "payments": [],
  "summary": {
    "saleOrderId": 20,
    "orderTotal": "690.00",
    "approvedPaymentsTotal": "300.00",
    "pendingBalance": "390.00",
    "isFullyPaid": false
  }
}
```

Errores:
- `400`: params/query invalidos
- `404`: sale order no encontrada

## 14.2 POST /api/sale-orders/:id/payments
Registra pago de orden de venta.

Body:
```json
{
  "amount": 390,
  "method": "EFECTIVO",
  "concept": "SALDO",
  "status": "APROBADO",
  "provider": "OTRO",
  "operationCode": "CAJA-902",
  "approvalCode": "OK-902",
  "voucherUrl": "https://example.com/voucher.png",
  "paidAt": "2026-03-10T16:00:00.000Z",
  "notes": "Pago final"
}
```

Validaciones y reglas:
- `amount > 0`
- no permite sobrepago aprobado (acumulado aprobado > total de orden)

Respuestas:
- `201`: `{ payment, summary }`
- `400`: params/body invalidos
- `404`: sale order no encontrada
- `409`: sobrepago

## 14.3 GET /api/sale-orders/:id/comprobantes
Lista comprobantes de orden de venta.

Query params opcionales:
- `status`: `ComprobanteStatus`
- `type`: `ComprobanteType`
- `from`: fecha
- `to`: fecha

Respuestas:
- `200`: array de comprobantes
- `400`: params/query invalidos
- `404`: sale order no encontrada

## 14.4 POST /api/sale-orders/:id/comprobantes
Crea comprobante para orden de venta.

Body:
```json
{
  "type": "BOLETA",
  "status": "BORRADOR",
  "serie": "B001",
  "numero": "000789",
  "subtotal": 584.75,
  "impuesto": 105.25,
  "total": 690,
  "issuedAt": "2026-03-10T16:30:00.000Z",
  "pdfUrl": "https://example.com/sale-comprobante.pdf",
  "xmlUrl": "https://example.com/sale-comprobante.xml",
  "notes": "Comprobante venta directa"
}
```

Regla de negocio:
- `total` del comprobante no puede exceder total de la orden.

Respuestas:
- `201`: comprobante creado
- `400`: params/body invalidos
- `404`: sale order no encontrada
- `409`: total comprobante excede total de orden

## 15. Rental Orders

## 15.1 GET /api/rental-orders
Lista ordenes de alquiler con filtros avanzados, orden y paginacion.

Query params opcionales:
- `customerId`: entero positivo
- `status`: `RentalOrderStatus`
- `code`: texto, busqueda parcial case-insensitive
- `hasDelay`: `true` | `false`
- `hasDamage`: `true` | `false`
- `pickupFrom`: fecha
- `pickupTo`: fecha
- `dueFrom`: fecha
- `dueTo`: fecha
- `page`: entero positivo, default `1`
- `pageSize`: entero 1..100, default `20`
- `orderBy`: `createdAt` | `pickupAt` | `dueBackAt` | `total`, default `createdAt`
- `order`: `asc` | `desc`, default `desc`

Ejemplos:
- `/api/rental-orders?page=1&pageSize=20`
- `/api/rental-orders?status=ENTREGADO`
- `/api/rental-orders?customerId=1&hasDelay=true`
- `/api/rental-orders?code=REN-20260311`
- `/api/rental-orders?pickupFrom=2026-03-01T00:00:00.000Z&pickupTo=2026-03-31T23:59:59.000Z`
- `/api/rental-orders?dueFrom=2026-03-10T00:00:00.000Z&dueTo=2026-03-20T23:59:59.000Z&orderBy=dueBackAt&order=asc`

Respuesta `200`:
```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "pageSize": 20,
  "pageCount": 1
}
```

Errores:
- `400`: query invalida

## 15.2 POST /api/rental-orders
Crea orden de alquiler (flujo inmediato, no reserva futura web).

Body:
```json
{
  "customerId": 1,
  "pickupAt": "2026-03-11T10:00:00.000Z",
  "dueBackAt": "2026-03-13T18:00:00.000Z",
  "notes": "Cliente recoge en tienda",
  "items": [
    {
      "rentalUnitId": 5,
      "productId": 10,
      "itemNameSnapshot": "Terno Azul Marino",
      "tierAtRental": "ESTRENO",
      "unitPrice": 250,
      "notes": "Incluye funda"
    }
  ]
}
```

Reglas de validacion y negocio:
- `items` requiere al menos 1 elemento
- `dueBackAt` debe ser mayor a `pickupAt`
- alquiler web es inmediato: no permite `pickupAt` futuro fuera de una tolerancia corta
- cada `rentalUnitId` debe existir y estar `DISPONIBLE`
- el backend registra salida inicial y bloquea unidad en estado `ALQUILADO`

Respuestas:
- `201`: orden creada
- `400`: body invalido
- `404`: cliente o unidad no encontrada
- `409`: unidad no disponible o regla de negocio violada

## 15.3 GET /api/rental-orders/:id
Obtiene orden de alquiler por id.

Respuestas:
- `200`: orden completa con items
- `400`: param invalido
- `404`: orden no encontrada

## 15.4 PATCH /api/rental-orders/:id
Acciones de cambio de estado del alquiler.

Body:
```json
{
  "action": "MARK_RETURNED",
  "note": "Retorno en buen estado",
  "hasDamage": false,
  "returnNotes": "Sin observaciones"
}
```

Acciones validas:
- `MARK_RETURNED` -> `DEVUELTO`
- `MARK_LATE` -> `ATRASADO`
- `CLOSE` -> `CERRADO`
- `CANCEL` -> `CANCELADO`

Reglas de transicion:
- `MARK_RETURNED` permitido desde `ENTREGADO` o `ATRASADO`
- `MARK_LATE` permitido desde `ENTREGADO`
- `CLOSE` permitido desde `DEVUELTO`
- `CANCEL` permitido desde `RESERVADO`

Regla adicional al devolver:
- El backend libera unidades (`DISPONIBLE`), registra movimiento de devolucion y baja tier `ESTRENO` a `NORMAL` cuando corresponde.

Respuestas:
- `200`: orden actualizada
- `400`: param/body invalido
- `404`: orden no encontrada
- `409`: transicion no permitida

## 16. Payments y Comprobantes (Rental Orders)

## 16.1 GET /api/rental-orders/:id/payments
Lista pagos de la orden de alquiler y devuelve resumen financiero.

Query params opcionales:
- `status`: `PaymentStatus`
- `concept`: `PaymentConcept`
- `method`: `PaymentMethod`
- `from`: fecha
- `to`: fecha

Respuesta `200`:
```json
{
  "payments": [],
  "summary": {
    "rentalOrderId": 30,
    "orderTotal": "250.00",
    "approvedPaymentsTotal": "100.00",
    "pendingBalance": "150.00",
    "isFullyPaid": false
  }
}
```

Errores:
- `400`: params/query invalidos
- `404`: rental order no encontrada

## 16.2 POST /api/rental-orders/:id/payments
Registra pago de orden de alquiler.

Body:
```json
{
  "amount": 150,
  "method": "YAPE",
  "concept": "SALDO",
  "status": "APROBADO",
  "provider": "YAPE",
  "operationCode": "YAPE-00901",
  "approvalCode": "OK-REN-901",
  "voucherUrl": "https://example.com/rental-voucher.png",
  "paidAt": "2026-03-12T17:30:00.000Z",
  "notes": "Saldo al devolver"
}
```

Reglas:
- `amount > 0`
- no permite sobrepago aprobado (acumulado aprobado > total de orden)

Respuestas:
- `201`: `{ payment, summary }`
- `400`: params/body invalidos
- `404`: rental order no encontrada
- `409`: sobrepago

## 16.3 GET /api/rental-orders/:id/comprobantes
Lista comprobantes de orden de alquiler.

Query params opcionales:
- `status`: `ComprobanteStatus`
- `type`: `ComprobanteType`
- `from`: fecha
- `to`: fecha

Respuestas:
- `200`: array de comprobantes
- `400`: params/query invalidos
- `404`: rental order no encontrada

## 16.4 POST /api/rental-orders/:id/comprobantes
Crea comprobante para orden de alquiler.

Body:
```json
{
  "type": "BOLETA",
  "status": "BORRADOR",
  "serie": "B010",
  "numero": "000901",
  "subtotal": 211.86,
  "impuesto": 38.14,
  "total": 250,
  "issuedAt": "2026-03-12T18:00:00.000Z",
  "pdfUrl": "https://example.com/rental-comprobante.pdf",
  "xmlUrl": "https://example.com/rental-comprobante.xml",
  "notes": "Comprobante alquiler"
}
```

Regla de negocio:
- `total` del comprobante no puede exceder total de la orden.

Respuestas:
- `201`: comprobante creado
- `400`: params/body invalidos
- `404`: rental order no encontrada
- `409`: total comprobante excede total de orden

## 17. Alteration Orders

## 17.1 GET /api/alteration-orders
Lista ordenes de arreglo con filtros avanzados, orden y paginacion.

Query params opcionales:
- `customerId`: entero positivo
- `serviceId`: entero positivo
- `status`: `AlterationOrderStatus`
- `code`: texto, busqueda parcial case-insensitive
- `receivedFrom`: fecha
- `receivedTo`: fecha
- `promisedFrom`: fecha
- `promisedTo`: fecha
- `page`: entero positivo, default `1`
- `pageSize`: entero 1..100, default `20`
- `orderBy`: `createdAt` | `receivedAt` | `promisedAt` | `total`, default `createdAt`
- `order`: `asc` | `desc`, default `desc`

Ejemplos:
- `/api/alteration-orders?page=1&pageSize=20`
- `/api/alteration-orders?status=EN_PROCESO`
- `/api/alteration-orders?customerId=1&serviceId=3`
- `/api/alteration-orders?code=ALT-20260311`
- `/api/alteration-orders?receivedFrom=2026-03-01T00:00:00.000Z&receivedTo=2026-03-31T23:59:59.000Z`

Respuesta `200`:
```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "pageSize": 20,
  "pageCount": 1
}
```

Errores:
- `400`: query invalida

## 17.2 POST /api/alteration-orders
Crea orden de arreglo.

Body:
```json
{
  "customerId": 1,
  "serviceId": 2,
  "garmentDescription": "Pantalon de vestir azul",
  "workDescription": "Basta y ajuste de cintura",
  "initialCondition": "Buen estado",
  "receivedAt": "2026-03-11T10:00:00.000Z",
  "promisedAt": "2026-03-14T18:00:00.000Z",
  "subtotal": 70,
  "discountTotal": 10,
  "notes": "Cliente pide prueba rapida"
}
```

Reglas de validacion y negocio:
- `garmentDescription` y `workDescription` son requeridos
- si `serviceId` existe, debe apuntar a un servicio de arreglo valido
- si `promisedAt` existe, debe ser mayor o igual a `receivedAt`
- `total = subtotal - discountTotal` y no puede ser negativo

Respuestas:
- `201`: orden creada
- `400`: body invalido
- `404`: cliente o servicio no encontrado
- `409`: regla de negocio violada

## 17.3 GET /api/alteration-orders/:id
Obtiene orden de arreglo por id.

Respuestas:
- `200`: orden completa
- `400`: param invalido
- `404`: orden no encontrada

## 17.4 PATCH /api/alteration-orders/:id
Acciones de cambio de estado de arreglo.

Body:
```json
{
  "action": "MARK_READY",
  "note": "Ajuste terminado"
}
```

Acciones validas:
- `START_EVALUATION` -> `EN_EVALUACION`
- `START_WORK` -> `EN_PROCESO`
- `MARK_READY` -> `LISTO`
- `MARK_DELIVERED` -> `ENTREGADO`
- `CANCEL` -> `CANCELADO`

Reglas de transicion:
- `START_EVALUATION` solo desde `RECIBIDO`
- `START_WORK` solo desde `EN_EVALUACION`
- `MARK_READY` solo desde `EN_PROCESO`
- `MARK_DELIVERED` solo desde `LISTO`
- `CANCEL` desde `RECIBIDO`, `EN_EVALUACION`, `EN_PROCESO` o `LISTO`

Respuestas:
- `200`: orden actualizada
- `400`: param/body invalido
- `404`: orden no encontrada
- `409`: transicion no permitida

## 18. Payments y Comprobantes (Alteration Orders)

## 18.1 GET /api/alteration-orders/:id/payments
Lista pagos de la orden de arreglo y devuelve resumen financiero.

Query params opcionales:
- `status`: `PaymentStatus`
- `concept`: `PaymentConcept`
- `method`: `PaymentMethod`
- `from`: fecha
- `to`: fecha

Respuesta `200`:
```json
{
  "payments": [],
  "summary": {
    "alterationOrderId": 18,
    "orderTotal": "60.00",
    "approvedPaymentsTotal": "30.00",
    "pendingBalance": "30.00",
    "isFullyPaid": false
  }
}
```

Errores:
- `400`: params/query invalidos
- `404`: alteration order no encontrada

## 18.2 POST /api/alteration-orders/:id/payments
Registra pago de orden de arreglo.

Body:
```json
{
  "amount": 30,
  "method": "EFECTIVO",
  "concept": "SALDO",
  "status": "APROBADO",
  "provider": "OTRO",
  "operationCode": "CAJA-ALT-01",
  "approvalCode": "OK-ALT-01",
  "voucherUrl": "https://example.com/alt-voucher.png",
  "paidAt": "2026-03-11T15:30:00.000Z",
  "notes": "Pago contra entrega"
}
```

Reglas:
- `amount > 0`
- no permite sobrepago aprobado (acumulado aprobado > total de orden)

Respuestas:
- `201`: `{ payment, summary }`
- `400`: params/body invalidos
- `404`: alteration order no encontrada
- `409`: sobrepago

## 18.3 GET /api/alteration-orders/:id/comprobantes
Lista comprobantes de orden de arreglo.

Query params opcionales:
- `status`: `ComprobanteStatus`
- `type`: `ComprobanteType`
- `from`: fecha
- `to`: fecha

Respuestas:
- `200`: array de comprobantes
- `400`: params/query invalidos
- `404`: alteration order no encontrada

## 18.4 POST /api/alteration-orders/:id/comprobantes
Crea comprobante para orden de arreglo.

Body:
```json
{
  "type": "BOLETA",
  "status": "BORRADOR",
  "serie": "B015",
  "numero": "001230",
  "subtotal": 50.85,
  "impuesto": 9.15,
  "total": 60,
  "issuedAt": "2026-03-11T16:00:00.000Z",
  "pdfUrl": "https://example.com/alt-comprobante.pdf",
  "xmlUrl": "https://example.com/alt-comprobante.xml",
  "notes": "Comprobante servicio de arreglo"
}
```

Regla de negocio:
- `total` del comprobante no puede exceder total de la orden.

Respuestas:
- `201`: comprobante creado
- `400`: params/body invalidos
- `404`: alteration order no encontrada
- `409`: total comprobante excede total de orden

## 19. Alteration Services

## 19.1 GET /api/alteration-services
Lista servicios de arreglo configurables por admin.

Query params opcionales:
- `active`: `true` | `false`

Ejemplos:
- `/api/alteration-services`
- `/api/alteration-services?active=true`

Respuestas:
- `200`: array de servicios
- `400`: query invalida

## 19.2 POST /api/alteration-services
Crea servicio de arreglo.

Body:
```json
{
  "nombre": "Basta de pantalon",
  "precioBase": 35,
  "activo": true
}
```

Reglas:
- `nombre` requerido
- `precioBase` opcional, si existe debe ser >= 0

Respuestas:
- `201`: servicio creado
- `400`: body invalido
- `409`: regla de negocio violada

## 19.3 GET /api/alteration-services/:id
Obtiene servicio de arreglo por id.

Respuestas:
- `200`: servicio
- `400`: param invalido
- `404`: servicio no encontrado

## 19.4 PATCH /api/alteration-services/:id
Actualiza servicio de arreglo.

Body parcial (al menos un campo):
```json
{
  "nombre": "Basta y pinza",
  "precioBase": 45,
  "activo": true
}
```

Reglas:
- al menos un campo debe venir en body
- `precioBase` puede enviarse `null` para limpiar precio base

Respuestas:
- `200`: servicio actualizado
- `400`: param/body invalido
- `404`: servicio no encontrado
- `409`: regla de negocio violada

## 19.5 DELETE /api/alteration-services/:id
Desactiva servicio (soft delete: `activo=false`).

Respuestas:
- `200`: servicio desactivado
- `400`: param invalido
- `404`: servicio no encontrado

## 20. Notifications

## 20.1 GET /api/notifications
Lista notificaciones registradas.

Query params opcionales:
- `customerId`: entero positivo
- `channel`: `NotificationChannel`
- `status`: `NotificationStatus`
- `from`: fecha
- `to`: fecha

Ejemplos:
- `/api/notifications`
- `/api/notifications?channel=WHATSAPP&status=ENVIADA`
- `/api/notifications?customerId=1&from=2026-03-01T00:00:00.000Z&to=2026-03-31T23:59:59.000Z`

Respuestas:
- `200`: array de notificaciones
- `400`: query invalida

## 20.2 POST /api/notifications/appointments/reminder-24h
Dispara recordatorios de citas dentro de ventana 24h y marca `reminder24hSentAt`.

Body:
```json
{
  "channel": "WHATSAPP",
  "dryRun": false
}
```

Reglas:
- `channel` para este flujo: `EMAIL` o `WHATSAPP`.
- Ventana evaluada: citas entre +23h y +24h desde "ahora".
- Solo estados activos de cita: `PENDIENTE`, `CONFIRMADA`, `REPROGRAMADA`.
- Idempotente por cita: si ya se marco `reminder24hSentAt`, no vuelve a enviar.
- Si `dryRun=true`, no escribe notificaciones ni marca recordatorios.

Respuesta `200`:
```json
{
  "checked": 3,
  "eligible": 3,
  "sent": 3,
  "skippedAlreadySent": 0,
  "dryRun": false
}
```

Errores:
- `400`: body invalido
- `409`: canal no permitido para este flujo

## 21. Product Images y Variants

## 21.1 GET /api/products/:id/images
Lista imagenes del producto.

Respuestas:
- `200`: array de imagenes
- `400`: param invalido
- `404`: producto no encontrado

## 21.2 POST /api/products/:id/images
Crea imagen para producto.

Body:
```json
{
  "url": "https://example.com/product-main.jpg",
  "altText": "Terno azul frontal",
  "sortOrder": 0
}
```

Respuestas:
- `201`: imagen creada
- `400`: param/body invalido
- `404`: producto no encontrado

## 21.3 PATCH /api/products/images/:imageId
Actualiza imagen por id.

Body parcial:
```json
{
  "altText": "Vista frontal actualizada",
  "sortOrder": 1
}
```

Respuestas:
- `200`: imagen actualizada
- `400`: param/body invalido
- `404`: imagen no encontrada

## 21.4 DELETE /api/products/images/:imageId
Elimina imagen de producto.

Respuestas:
- `200`: `{ "ok": true }`
- `400`: param invalido
- `404`: imagen no encontrada

## 21.5 GET /api/products/:id/variants
Lista variantes del producto.

Respuestas:
- `200`: array de variantes
- `400`: param invalido
- `404`: producto no encontrado

## 21.6 POST /api/products/:id/variants
Crea variante de producto.

Body:
```json
{
  "sku": "TERNO-AZUL-48",
  "talla": "48",
  "color": "Azul marino",
  "stock": 3,
  "minStock": 1,
  "salePrice": 690,
  "compareAtPrice": 740,
  "active": true
}
```

Respuestas:
- `201`: variante creada
- `400`: param/body invalido
- `404`: producto no encontrado
- `409`: conflicto unico (ej. `sku`)

## 21.7 PATCH /api/products/variants/:variantId
Actualiza variante por id.

Body parcial:
```json
{
  "stock": 5,
  "salePrice": 650,
  "active": true
}
```

Respuestas:
- `200`: variante actualizada
- `400`: param/body invalido
- `404`: variante no encontrada
- `409`: conflicto unico

## 21.8 DELETE /api/products/variants/:variantId
Desactiva variante (`active=false`).

Respuestas:
- `200`: variante desactivada
- `400`: param invalido
- `404`: variante no encontrada

## 22. Catalogo Flexible (Atributos y Componentes)

### 22.1 GET /api/catalog/attribute-definitions
Lista definiciones de atributos configurables del catalogo.

Query params opcionales:
- `scope`: `PRODUCT` | `VARIANT`
- `appliesToKind`: `ProductKind`
- `active`: `true` | `false`

Respuestas:
- `200`: array de definiciones con `options`
- `400`: query invalida

### 22.2 POST /api/catalog/attribute-definitions
Crea definicion de atributo.

Body:
```json
{
  "code": "fit_type",
  "label": "Tipo de fit",
  "scope": "PRODUCT",
  "inputType": "SELECT",
  "appliesToKind": "TERNO",
  "active": true,
  "sortOrder": 10
}
```

Respuestas:
- `201`: definicion creada
- `400`: body invalido
- `409`: definicion duplicada (`fields`)

### 22.3 GET /api/catalog/attribute-definitions/:definitionId
Obtiene una definicion por id.

Respuestas:
- `200`: definicion
- `400`: param invalido
- `404`: definicion no encontrada

### 22.4 PATCH /api/catalog/attribute-definitions/:definitionId
Actualiza una definicion (parcial, al menos 1 campo).

Respuestas:
- `200`: definicion actualizada
- `400`: param/body invalido
- `404`: definicion no encontrada
- `409`: conflicto unico

### 22.5 DELETE /api/catalog/attribute-definitions/:definitionId
Desactiva definicion (`active=false`).

Respuestas:
- `200`: definicion desactivada
- `400`: param invalido
- `404`: definicion no encontrada

### 22.6 GET /api/catalog/attribute-definitions/:definitionId/options
Lista opciones de una definicion.

Respuestas:
- `200`: array de opciones
- `400`: param invalido
- `404`: definicion no encontrada

### 22.7 POST /api/catalog/attribute-definitions/:definitionId/options
Crea opcion para una definicion.

Body:
```json
{
  "code": "slim",
  "label": "Slim",
  "sortOrder": 1,
  "active": true
}
```

Respuestas:
- `201`: opcion creada
- `400`: param/body invalido
- `404`: definicion no encontrada
- `409`: opcion duplicada (`fields`)

### 22.8 PATCH /api/catalog/attribute-options/:optionId
Actualiza opcion (parcial, al menos 1 campo).

Respuestas:
- `200`: opcion actualizada
- `400`: param/body invalido
- `404`: opcion no encontrada
- `409`: conflicto unico

### 22.9 DELETE /api/catalog/attribute-options/:optionId
Desactiva opcion (`active=false`).

Respuestas:
- `200`: opcion desactivada
- `400`: param invalido
- `404`: opcion no encontrada

### 22.10 GET /api/products/:id/attributes
Lista valores de atributos a nivel producto.

Respuestas:
- `200`: array de valores con detalle de definicion/opcion
- `400`: param invalido
- `404`: producto no encontrado

### 22.11 PUT /api/products/:id/attributes
Crea o actualiza (upsert) valor de atributo en producto.

Body:
```json
{
  "definitionId": 12,
  "optionId": 55,
  "valueText": null,
  "valueNumber": null,
  "valueBoolean": null
}
```

Reglas:
- Debe enviarse al menos un campo de valor: `optionId`, `valueText`, `valueNumber` o `valueBoolean`.
- `definitionId` debe existir y tener `scope=PRODUCT`.
- Si se envia `optionId`, debe pertenecer a la definicion.

Respuestas:
- `200`: valor upsertado
- `400`: param/body invalido o regla de validacion
- `404`: producto no encontrado

### 22.12 DELETE /api/products/:id/attributes/:definitionId
Elimina valor de atributo del producto.

Respuestas:
- `200`: `{ "ok": true }`
- `400`: params invalidos
- `404`: producto no encontrado o valor no existente

### 22.13 GET /api/products/variants/:variantId/attributes
Lista valores de atributos a nivel variante.

Respuestas:
- `200`: array de valores
- `400`: param invalido
- `404`: variante no encontrada

### 22.14 PUT /api/products/variants/:variantId/attributes
Crea o actualiza (upsert) valor de atributo en variante.

Reglas:
- Debe enviarse al menos un campo de valor.
- `definitionId` debe existir y tener `scope=VARIANT`.
- Si se envia `optionId`, debe pertenecer a la definicion.

Respuestas:
- `200`: valor upsertado
- `400`: param/body invalido o regla de validacion
- `404`: variante no encontrada

### 22.15 DELETE /api/products/variants/:variantId/attributes/:definitionId
Elimina valor de atributo de la variante.

Respuestas:
- `200`: `{ "ok": true }`
- `400`: params invalidos
- `404`: variante no encontrada o valor no existente

### 22.16 GET /api/products/:id/components
Lista componentes de producto (composicion parent -> child).

Respuestas:
- `200`: array de componentes
- `400`: param invalido
- `404`: producto no encontrado

### 22.17 POST /api/products/:id/components
Crea componente para producto padre.

Body:
```json
{
  "childProductId": 21,
  "quantity": 1,
  "sortOrder": 0
}
```

Reglas:
- `childProductId` debe existir.
- No se permite auto-referencia (`parentProductId === childProductId`).

Respuestas:
- `201`: componente creado
- `400`: param/body invalido o regla de validacion
- `404`: producto no encontrado

### 22.18 PATCH /api/products/components/:componentId
Actualiza componente por id (parcial, al menos 1 campo).

Respuestas:
- `200`: componente actualizado
- `400`: param/body invalido o regla de validacion
- `404`: componente no encontrado

### 22.19 DELETE /api/products/components/:componentId
Elimina componente por id.

Respuestas:
- `200`: `{ "ok": true }`
- `400`: param invalido
- `404`: componente no encontrado

## 23. Rental Units

## 23.1 GET /api/rental-units
Lista unidades fisicas de alquiler.

Query params opcionales:
- `productId`
- `variantId`
- `status` (`DISPONIBLE`, `ALQUILADO`, `EN_MANTENIMIENTO`, `DANADO`, `RETIRADO`)
- `currentTier` (`ESTRENO`, `NORMAL`)
- `search` (busca en `internalCode`, `sizeLabel`, `color`)

Respuestas:
- `200`: array de unidades
- `400`: query invalida

## 23.2 POST /api/rental-units
Crea unidad fisica de alquiler.

Body:
```json
{
  "productId": 10,
  "variantId": 25,
  "internalCode": "RU-TERNO-001",
  "sizeLabel": "48",
  "color": "Azul",
  "currentTier": "ESTRENO",
  "normalPrice": 220,
  "premierePrice": 320,
  "status": "DISPONIBLE"
}
```

Reglas:
- `premierePrice >= normalPrice`
- si `variantId` se envia, debe pertenecer al `productId`

Respuestas:
- `201`: unidad creada
- `400`: body invalido
- `404`: producto o variante no encontrados
- `409`: conflicto de codigo interno o regla de negocio

## 23.3 GET /api/rental-units/:id
Obtiene unidad por id.

Respuestas:
- `200`: unidad
- `400`: param invalido
- `404`: unidad no encontrada

## 23.4 PATCH /api/rental-units/:id
Actualiza datos de unidad (precios, color, estado, notas, variante, etc.).

Body parcial:
```json
{
  "normalPrice": 200,
  "premierePrice": 280,
  "notes": "Revisada en taller"
}
```

Respuestas:
- `200`: unidad actualizada
- `400`: param/body invalido
- `404`: unidad o variante no encontrada
- `409`: regla de negocio invalida

## 23.5 DELETE /api/rental-units/:id
Retira unidad (`status=RETIRADO`).

Respuestas:
- `200`: unidad retirada
- `400`: param invalido
- `404`: unidad no encontrada
- `409`: no se puede retirar si esta alquilada

## 23.6 PATCH /api/rental-units/:id/actions
Ejecuta acciones de operacion sobre la unidad.

Body:
```json
{
  "action": "MARK_NORMAL_TIER",
  "note": "Ya paso su primer alquiler"
}
```

Acciones validas:
- `MARK_AVAILABLE`
- `MARK_MAINTENANCE`
- `MARK_DAMAGED`
- `MARK_RETIRED`
- `MARK_NORMAL_TIER`

Respuestas:
- `200`: unidad actualizada
- `400`: param/body invalido
- `404`: unidad no encontrada
- `409`: accion no permitida por estado

## 24. Bundles

## 24.1 GET /api/bundles
Lista bundles con filtros basicos.

Query params opcionales:
- `search`: texto sobre `nombre` o `slug`
- `active`: `true` | `false`

Respuestas:
- `200`: array de bundles
- `400`: query invalida

## 24.2 POST /api/bundles
Crea bundle.

Body:
```json
{
  "nombre": "Pack Oficina",
  "slug": "pack-oficina",
  "descripcion": "Saco + pantalon",
  "price": 799,
  "active": true
}
```

Respuestas:
- `201`: bundle creado
- `400`: body invalido
- `409`: conflicto unico (ej. slug)

## 24.3 GET /api/bundles/:id
Obtiene bundle por id.

Respuestas:
- `200`: bundle
- `400`: param invalido
- `404`: bundle no encontrado

## 24.4 PATCH /api/bundles/:id
Actualiza bundle (parcial, al menos un campo).

Respuestas:
- `200`: bundle actualizado
- `400`: param/body invalido
- `404`: bundle no encontrado
- `409`: conflicto unico

## 24.5 DELETE /api/bundles/:id
Desactiva bundle (`active=false`).

Respuestas:
- `200`: bundle desactivado
- `400`: param invalido
- `404`: bundle no encontrado

## 24.6 GET /api/bundles/:id/items
Lista items de producto de un bundle.

Respuestas:
- `200`: array de items
- `400`: param invalido
- `404`: bundle no encontrado

## 24.7 POST /api/bundles/:id/items
Agrega item de producto al bundle.

Body:
```json
{
  "productId": 21,
  "quantity": 1,
  "sortOrder": 0
}
```

Respuestas:
- `201`: item creado
- `400`: param/body invalido
- `404`: bundle o producto no encontrado
- `409`: item duplicado en el bundle

## 24.8 PATCH /api/bundles/items/:itemId
Actualiza item de producto del bundle.

Respuestas:
- `200`: item actualizado
- `400`: param/body invalido
- `404`: item o producto no encontrado
- `409`: conflicto de unicidad

## 24.9 DELETE /api/bundles/items/:itemId
Elimina item de producto del bundle.

Respuestas:
- `200`: `{ "ok": true }`
- `400`: param invalido
- `404`: item no encontrado

## 24.10 GET /api/bundles/:id/variant-items
Lista items de variantes de un bundle.

Respuestas:
- `200`: array de variant items
- `400`: param invalido
- `404`: bundle no encontrado

## 24.11 POST /api/bundles/:id/variant-items
Agrega item de variante al bundle.

Body:
```json
{
  "variantId": 44,
  "quantity": 1,
  "sortOrder": 0
}
```

Respuestas:
- `201`: variant item creado
- `400`: param/body invalido
- `404`: bundle o variante no encontrados
- `409`: variant item duplicado en el bundle

## 24.12 PATCH /api/bundles/variant-items/:itemId
Actualiza item de variante del bundle.

Respuestas:
- `200`: variant item actualizado
- `400`: param/body invalido
- `404`: item o variante no encontrados
- `409`: conflicto de unicidad

## 24.13 DELETE /api/bundles/variant-items/:itemId
Elimina item de variante del bundle.

Respuestas:
- `200`: `{ "ok": true }`
- `400`: param invalido
- `404`: item no encontrado

## 25. Promotions y Coupons

## 25.1 GET /api/promotions
Lista promociones.

Query params opcionales:
- `search`: texto en nombre
- `scope`: `ORDEN` | `PRODUCTO` | `BUNDLE`
- `active`: `true` | `false`

Respuestas:
- `200`: array de promociones
- `400`: query invalida

## 25.2 POST /api/promotions
Crea promocion.

Body:
```json
{
  "nombre": "Promo temporada",
  "scope": "ORDEN",
  "discountType": "PORCENTAJE",
  "value": 10,
  "startsAt": "2026-03-15T00:00:00.000Z",
  "endsAt": "2026-03-31T23:59:59.000Z",
  "active": true,
  "productIds": [21, 35]
}
```

Regla:
- `endsAt` debe ser mayor o igual que `startsAt`.
- `scope=PRODUCTO` requiere `productIds` con al menos un producto.
- para `scope=ORDEN` o `scope=BUNDLE`, `productIds` no debe enviarse.

Respuestas:
- `201`: promocion creada
- `400`: body invalido o regla de negocio
- `409`: conflicto unico

## 25.3 GET /api/promotions/:id
Obtiene promocion por id.

Respuestas:
- `200`: promocion
- `400`: param invalido
- `404`: promocion no encontrada

## 25.4 PATCH /api/promotions/:id
Actualiza promocion.

Body parcial (campos opcionales):
- `nombre`, `scope`, `discountType`, `value`, `startsAt`, `endsAt`, `active`, `productIds`

Reglas:
- si `scope` final es `PRODUCTO`, la promocion debe quedar con `productIds` no vacio.
- si `scope` final no es `PRODUCTO`, los targets de producto se limpian.

Respuestas:
- `200`: promocion actualizada
- `400`: param/body invalido o regla de negocio
- `404`: promocion no encontrada
- `409`: conflicto unico

## 25.5 DELETE /api/promotions/:id
Desactiva promocion (`active=false`).

Respuestas:
- `200`: promocion desactivada
- `400`: param invalido
- `404`: promocion no encontrada

## 25.6 GET /api/coupons
Lista cupones.

Query params opcionales:
- `search`: texto en code
- `active`: `true` | `false`
- `promotionId`: entero positivo
- `bundleId`: entero positivo

Respuestas:
- `200`: array de cupones
- `400`: query invalida

## 25.7 POST /api/coupons
Crea cupon.

Body:
```json
{
  "code": "TENOFF",
  "promotionId": 2,
  "discountType": "PORCENTAJE",
  "value": 10,
  "maxUses": 100,
  "startsAt": "2026-03-15T00:00:00.000Z",
  "endsAt": "2026-03-31T23:59:59.000Z",
  "active": true
}
```

Reglas:
- no puede tener `promotionId` y `bundleId` al mismo tiempo.
- valida existencia de `promotionId` o `bundleId` cuando se envien.

Respuestas:
- `201`: cupon creado
- `400`: body invalido o regla de negocio
- `409`: conflicto unico (code)

## 25.8 GET /api/coupons/:id
Obtiene cupon por id.

Respuestas:
- `200`: cupon
- `400`: param invalido
- `404`: cupon no encontrado

## 25.9 PATCH /api/coupons/:id
Actualiza cupon.

Respuestas:
- `200`: cupon actualizado
- `400`: param/body invalido o regla de negocio
- `404`: cupon no encontrado
- `409`: conflicto unico

## 25.10 DELETE /api/coupons/:id
Desactiva cupon (`active=false`).

Respuestas:
- `200`: cupon desactivado
- `400`: param invalido
- `404`: cupon no encontrado

## 25.11 GET /api/coupons/:id/uses
Lista usos del cupon.

Respuestas:
- `200`: array de usos
- `400`: param invalido
- `404`: cupon no encontrado

## 25.12 POST /api/coupons/:id/preview
Previsualiza aplicacion de cupon sobre una orden (sin persistir).

Body:
```json
{
  "orderType": "sale",
  "orderId": 10
}
```

Respuestas:
- `200`: preview con `appliedAmount`, `resultingDiscountTotal`, `resultingTotal`
- `400`: param/body invalido o regla de negocio
- `404`: cupon u orden no encontrados

## 25.13 POST /api/coupons/:id/apply
Aplica cupon a una orden y registra `OrderCouponUse`.

Body:
```json
{
  "orderType": "sale",
  "orderId": 10
}
```

Reglas:
- valida vigencia, activo, maxUses y compatibilidad de scope.
- evita aplicar dos veces el mismo cupon a la misma orden.
- `scope=PRODUCTO`: aplica descuento sobre la suma de items con `productId` (solo `sale` y `custom`).
- `scope=BUNDLE`: solo aplica a `sale` y requiere que la orden contenga el `bundle` objetivo.

Respuestas:
- `201`: resultado de aplicacion con orden actualizada
- `400`: regla de negocio no cumplida
- `404`: cupon u orden no encontrados

## 25.14 DELETE /api/coupons/uses/:useId
Revierte uso de cupon: elimina uso, recalcula totales y decrementa `usedCount`.

Regla:
- no permite revertir si la orden ya esta en estado final.

Respuestas:
- `200`: resultado de reversa con orden recalculada
- `400`: param invalido o regla de negocio
- `404`: uso de cupon no encontrado

## 26. Coupons Disponibles por Orden

## 26.1 GET /api/orders/:orderType/:orderId/available-coupons
Lista cupones aplicables para una orden especifica, con monto proyectado.

Route params:
- `orderType`: `sale` | `custom` | `rental` | `alteration`
- `orderId`: entero positivo

Reglas de filtrado:
- solo cupones activos y vigentes
- excluye cupones ya usados en esa orden
- aplica restricciones por scope y bundle
- `scope=PRODUCTO`: solo se lista para `sale/custom` y calcula sobre subtotal elegible de items con `productId`

Respuestas:
- `200`: array de cupones disponibles con `appliedAmount`, `resultingDiscountTotal`, `resultingTotal`
- `400`: params invalidos
- `404`: orden no encontrada

## 27. Reportes

## 27.1 GET /api/reports/minimum
Devuelve el paquete de reportes minimos del negocio.

Query params opcionales:
- `from`: fecha/hora ISO de inicio de ventana
- `to`: fecha/hora ISO de fin de ventana
- `topRentedLimit`: limite para top de prendas mas alquiladas (1-50, default 10)
- `recurrentMinOrders`: minimo de ordenes para cliente recurrente (2-20, default 2)
- `stockLimit`: limite de variantes para reporte de stock bajo (1-200, default 50)

Si no se envia rango, usa ultimos 30 dias.

Incluye:
- ventas por periodo (sale/custom/rental/alteration)
- alquileres activos
- prendas mas alquiladas
- clientes recurrentes
- reservas de medidas
- stock bajo
- clientes nuevos sin ficha o con ficha vencida

Respuestas:
- `200`: objeto consolidado de reportes
- `400`: query invalida o rango inconsistente (`from > to`)

## 28. Notas y Archivos de Cliente

## 28.1 GET /api/customers/:id/notes
Lista notas de un cliente (ordenadas por `createdAt` desc).

Route params:
- `id`: entero positivo

Respuestas:
- `200`: `{ "data": PublicCustomerNote[] }`
- `400`: param invalido
- `404`: cliente no encontrado

## 28.2 POST /api/customers/:id/notes
Crea una nota para un cliente.

Route params:
- `id`: entero positivo

Body:
```json
{
  "note": "Cliente solicita entalle mas ajustado en cintura.",
  "adminUserId": 1
}
```

Validaciones:
- `note`: requerido, trim, min 1, max 4000
- `adminUserId`: opcional, entero positivo o `null`

Respuestas:
- `201`: `{ "data": PublicCustomerNote }`
- `400`: body/param invalido
- `404`: cliente o admin no encontrados

## 28.3 PATCH /api/customers/notes/:noteId
Actualiza una nota por id (parcial).

Route params:
- `noteId`: entero positivo

Body (al menos 1 campo):
```json
{
  "note": "Actualizar observacion del cliente",
  "adminUserId": 1
}
```

Route params:
- `noteId`: entero positivo

Reglas:
- se requiere al menos uno de: `note`, `adminUserId`
- `adminUserId` puede ser `null` para limpiar referencia

Respuestas:
- `200`: `{ "data": PublicCustomerNote }`
- `400`: body/param invalido
- `404`: nota o admin no encontrados

## 28.4 DELETE /api/customers/notes/:noteId
Elimina una nota por id.

Route params:
- `noteId`: entero positivo

Respuestas:
- `200`: `{ "data": { "deleted": true } }`
- `400`: param invalido
- `404`: nota no encontrada

## 28.5 GET /api/customers/:id/files
Lista archivos asociados a un cliente (ordenados por `createdAt` desc).

Route params:
- `id`: entero positivo

Respuestas:
- `200`: `{ "data": PublicCustomerFile[] }`
- `400`: param invalido
- `404`: cliente no encontrado

## 28.6 POST /api/customers/:id/files
Registra archivo de cliente (metadatos + URL).

Route params:
- `id`: entero positivo

Body:
```json
{
  "fileName": "orden-2026-015-medidas.pdf",
  "fileUrl": "https://cdn.ejemplo.com/clientes/15/orden-2026-015-medidas.pdf",
  "mimeType": "application/pdf",
  "description": "Ficha de medidas inicial"
}
```

Validaciones:
- `fileName`: requerido, trim, min 1, max 255
- `fileUrl`: requerido, URL valida, max 2048
- `mimeType`: opcional, trim, min 1, max 255
- `description`: opcional, trim, min 1, max 1000

Respuestas:
- `201`: `{ "data": PublicCustomerFile }`
- `400`: body/param invalido
- `404`: cliente no encontrado

## 28.7 PATCH /api/customers/files/:fileId
Actualiza metadatos de archivo de cliente (parcial).

Route params:
- `fileId`: entero positivo

Body (al menos 1 campo):
```json
{
  "description": "Ficha de medidas actualizada",
  "mimeType": "application/pdf"
}
```

Reglas:
- se requiere al menos uno de: `fileName`, `fileUrl`, `mimeType`, `description`
- `mimeType` y `description` aceptan `null` para limpiar el valor

Respuestas:
- `200`: `{ "data": PublicCustomerFile }`
- `400`: body/param invalido
- `404`: archivo no encontrado

## 28.8 DELETE /api/customers/files/:fileId
Elimina archivo de cliente por id.

Route params:
- `fileId`: entero positivo

Respuestas:
- `200`: `{ "data": { "deleted": true } }`
- `400`: param invalido
- `404`: archivo no encontrado
