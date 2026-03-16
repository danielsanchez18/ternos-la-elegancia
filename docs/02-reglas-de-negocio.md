# 02 — Reglas de negocio

## Citas y agenda
- La tienda es única.
- Horario base:
  - lunes a sábado: 9:00 am a 7:30 pm
  - domingos: 9:00 am a 12:00 pm
  - feriados: 9:00 am a 12:00 pm
- Capacidad ejemplo: 2 clientes por media hora.
- Las reservas pueden ser creadas por cliente o por admin.
- El código de reserva debe ser estructurado, por ejemplo: `RES-20260221-1`.
- Reprogramación: hasta 24 horas antes.
- Cancelación: hasta 24 horas antes.
- Si no asiste, puede reprogramar dentro de una ventana máxima de 6 horas en un horario disponible.
- Debe haber recordatorio automático 24 horas antes.

## Medidas
- Las medidas pertenecen al cliente y deben poder reutilizarse.
- Se necesita historial completo de cambios.
- La vigencia de medidas es de 3 meses.
- El cliente puede visualizar sus medidas guardadas.
- El cliente puede repetir compra usando medidas previas.
- Debe existir soporte para observaciones del sastre y archivos/fotos del cliente.

## Venta
- Los productos sin stock se muestran como temporalmente no disponibles.
- Los bundles tienen precio propio.
- Los atributos que generan stock real deben vivir como variantes reales.
- Los atributos de estilo no deben crear SKU si solo describen personalización.

## Confección
- Puede partir de un producto base o desde cero.
- Una orden puede incluir varias piezas.
- La ficha completa es referencia, no una estructura rígida e inmutable.
- La tela se elige desde catálogo interno.
- Debe existir inventario de telas.
- Puede haber primera y segunda prueba.
- Deben registrarse ajustes posteriores a la prueba.
- La fecha de entrega se maneja preferentemente por orden completa.
- Requiere adelanto del 50%.

## Alquiler
- Se alquilan unidades físicas concretas.
- Se debe rastrear cada prenda individual.
- `estreno` y `normal` son precios distintos sobre la misma unidad.
- Una prenda puede pasar de estreno a normal después del primer alquiler.
- Se registra:
  - fecha de salida
  - fecha pactada de devolución
  - fecha real de devolución
  - daño o retraso
- La prenda queda bloqueada hasta su devolución real.
- No hay reserva futura online para alquiler.

## Arreglos
- Son flexibles.
- El admin puede crear tipos de arreglo nuevos.
- Se guarda nombre, descripción y precio aplicado.

## Pagos
- Puede haber múltiples pagos por orden.
- Puede haber mezcla de métodos de pago.
- Debe soportar adelantos y saldos.
- Se desea explorar pago online con Yape usando código de aprobación.
- Debe existir comprobante/voucher y emisión de comprobantes.

## Reportes mínimos
- ventas por periodo
- alquileres activos
- prendas más alquiladas
- clientes recurrentes
- reservas de medidas
- stock bajo
- clientes nuevos sin ficha o con ficha vencida

