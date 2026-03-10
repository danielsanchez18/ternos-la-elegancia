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

## 3. Auth

### 3.1 BetterAuth handler
- Endpoint: `/api/auth/[...all]`
- Metodos: `GET`, `POST`
- Implementacion: delegada al handler de BetterAuth (`toNextJsHandler(auth)`).

Observacion de integracion:
- Las rutas concretas de sign-in/sign-up/session dependen de configuracion BetterAuth activa en `lib/auth.ts`.
- Recomendado: consumir el cliente oficial BetterAuth en frontend para evitar acoplarse a paths internos.

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
| `GET /api/fabrics` | Sin filtros |
| `GET /api/fabrics/:id/movements` | Sin filtros |
| `GET /api/custom-orders` | `customerId`, `status`, `code`, `requiresMeasurement`, `firstPurchaseFlow`, `createdFrom`, `createdTo`, `promisedFrom`, `promisedTo`, `page`, `pageSize`, `orderBy`, `order` |
| `GET /api/custom-orders/:id/payments` | `status`, `concept`, `method`, `from`, `to` |
| `GET /api/custom-orders/:id/comprobantes` | `status`, `type`, `from`, `to` |

## 12. Recomendaciones para consumo frontend

- Normalizar parseo de fechas a ISO UTC en cliente antes de enviar.
- Construir utilitario de query params para omitir campos vacios.
- Manejar `400` mostrando `issues` campo por campo.
- Manejar `409` con mensajes de negocio (estado no permitido, codigo duplicado, etc.).
- Para listados grandes (`custom-orders`), usar estado de paginacion con `page`, `pageSize`, `total`, `pageCount`.
- Para enums, centralizar constantes UI para evitar strings hardcodeados.
- Para flujos de confeccion, consumir `GET /api/custom-orders/:id/payments` y habilitar `START_CONFECTION` solo cuando `summary.hasRequiredAdvance === true`.
