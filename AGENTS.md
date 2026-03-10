# AGENTS.md — Ternos La Elegancia

## Objetivo del proyecto
Sistema web para **Ternos La Elegancia E.I.R.L.** con foco en:
- venta directa de productos
- confección personalizada
- alquiler
- arreglos
- agenda de citas para toma de medidas y servicios
- catálogo web integrado
- panel admin único

Este archivo define cómo debe razonar y ejecutar tareas cualquier agente de IA dentro del proyecto.

---

## Regla principal
Antes de escribir código, el agente debe identificar primero **qué módulo del negocio toca**:
1. venta
2. confección personalizada
3. alquiler
4. arreglos
5. agenda/citas
6. pagos/comprobantes
7. catálogo/productos
8. clientes/medidas
9. notificaciones
10. reportes

No mezclar reglas de negocio de módulos distintos en una sola implementación a menos que el requerimiento lo exija explícitamente.

---

## Contexto funcional obligatorio
- Hay **un solo admin**.
- El cliente puede registrarse y operar desde la web.
- Las órdenes se manejan **por separado**: venta, confección, alquiler y arreglo.
- La toma de medidas debe poder reutilizarse entre pedidos del mismo cliente.
- La vigencia de medidas es de **3 meses**.
- Si un cliente quiere comprar un terno o saco por primera vez y no tiene medidas vigentes, debe reservar cita de toma de medidas.
- Los atributos de estilo y confección no deben modelarse como columnas rígidas si pueden crecer con el tiempo.
- El alquiler rastrea **prendas físicas individuales**.
- El alquiler tipo **estreno** y **normal** usan la misma prenda, pero distinto precio.
- Una prenda en estreno puede pasar a normal después del primer alquiler.
- El alquiler no se reserva a futuro desde la web: se maneja como operación inmediata.
- Las telas deben estar en una tabla propia y con inventario.

---

## Stack esperado
- Next.js
- TypeScript
- Prisma
- PostgreSQL
- React
- Tailwind
- Zod
- API route handlers o servicios bien separados

Si el proyecto ya define una variante del stack, respetarla antes que inventar otra.

---

## Principios de implementación

### 1. No improvisar dominio
Si una tarea afecta reglas de negocio, el agente debe revisar primero:
- `docs/01-contexto-producto.md`
- `docs/02-reglas-de-negocio.md`
- `docs/04-base-de-datos-prisma.md`

### 2. No simplificar destruyendo flexibilidad
Evitar soluciones rígidas para:
- fichas técnicas
- atributos de confección
- opciones de personalización
- telas
- medidas por tipo de prenda

### 3. Separación real de órdenes
Nunca volver a mezclar todo en una sola tabla genérica de pedidos si no se pide explícitamente.

### 4. Snapshots históricos
Cuando una orden capture datos sensibles al tiempo, guardar snapshot de:
- nombre del producto
- precio aplicado
- tela elegida
- código de tela
- etiquetas visibles relevantes
- opciones de personalización elegidas

### 5. Cambios seguros
Antes de modificar Prisma, validar:
- impacto en relaciones
- impacto en seeds
- impacto en formularios
- impacto en panel admin
- compatibilidad con migraciones previas

---

## Reglas para generar código

### Backend
- TypeScript estricto.
- Validación con Zod en input externo.
- No usar lógica de negocio dentro del controlador si puede vivir en servicio.
- Mantener funciones pequeñas y nombradas por intención.
- No duplicar reglas de estado en varios archivos.
- Centralizar enums de UI derivados del dominio cuando aplique.

### Prisma
- No crear columnas rígidas para atributos que claramente crecerán.
- Preferir catálogos + opciones + selecciones históricas.
- Si una migración puede romper datos, advertirlo en comentario previo.
- Si el usuario pide cambios de modelo, proponer también impacto en seeds y consultas.

### Frontend
- UI en español.
- Código en inglés.
- Formularios grandes por pasos.
- No asumir que todos los productos siguen el mismo flujo.
- Respetar diferencias entre compra directa, confección, alquiler y arreglo.

---

## Reglas por módulo

### Venta directa
- Puede incluir productos físicos, bundles y servicios que realmente se vendan.
- Mostrar productos sin stock como temporalmente no disponibles; no ocultarlos automáticamente.
- Variantes reales solo para atributos que generan SKU/stock.

### Confección personalizada
- Puede partir de un modelo base o desde cero.
- Debe soportar varias piezas en una misma orden.
- La medida es reutilizable por cliente y por tipo de prenda.
- Debe soportar pruebas intermedias y apuntes posteriores.
- Requiere adelanto del 50%.

### Alquiler
- Trabaja con unidades físicas individuales.
- Bloquea la prenda hasta devolución real.
- Registrar salida, devolución pactada, devolución real, daño y retraso.
- No alquilar accesorios.

### Arreglos
- Servicio flexible.
- El admin puede crear nuevos tipos de arreglo.
- Guardar nombre, descripción y precio aplicado.

### Citas
- Código estructurado.
- Horarios configurables.
- Reglas de reprogramación y cancelación estrictas.
- Recordatorio 24h antes.

---

## Qué debe hacer el agente antes de responder
Para tareas medianas o grandes, responder con esta secuencia mental:
1. módulo afectado
2. riesgo técnico
3. archivos impactados
4. propuesta mínima correcta
5. implementación

No hace falta imprimir esta secuencia al usuario siempre, pero sí usarla para razonar.

---

## Qué no debe hacer
- No volver a un modelo monolítico de `orders` con `type` si la tarea no lo exige.
- No convertir atributos de personalización en enums permanentes sin necesidad.
- No asumir múltiples roles internos.
- No asumir múltiples sedes.
- No mezclar alquiler con reservas futuras online.
- No modelar medidas como una sola ficha universal si el dominio requiere tipos de prenda.

---

## Formato de respuesta esperado del agente
Cuando entregue código, priorizar:
- explicación breve
- archivos modificados
- código listo para pegar
- notas de impacto
- siguiente paso inmediato

