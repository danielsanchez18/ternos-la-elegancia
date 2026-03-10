# 06 — Prompts útiles para Copilot/Codex

## 1. Crear módulo
Crea el módulo `custom-orders` con arquitectura por capas (`domain`, `application`, `infrastructure`, `presentation`) usando TypeScript estricto, Zod y Prisma. No mezcles lógica de UI con reglas de negocio. Toma como base los documentos del proyecto y respeta que una orden de confección puede incluir varias piezas, medidas reutilizables y personalización flexible.

## 2. Caso de uso
Implementa el caso de uso `createMeasurementAppointment` validando horario disponible, capacidad por franja, código estructurado de reserva, política de reprogramación/cancelación y recordatorio 24h antes. Devuélveme archivos completos y explica impacto en Prisma si aplica.

## 3. Prisma query
Escribe una consulta Prisma para obtener el perfil completo de un cliente con: pedidos de venta, confección, alquiler, arreglos, reservas, medidas vigentes e historial resumido. Optimiza includes/selects y evita sobrecargar datos innecesarios.

## 4. Formulario paso a paso
Genera un formulario React paso a paso para confección personalizada de terno. Debe permitir elegir piezas, asociar medidas, seleccionar tela, elegir personalización por pieza y calcular subtotal referencial. UI en español, código en inglés.

## 5. Refactor seguro
Refactoriza este módulo sin cambiar comportamiento observable. Extrae lógica repetida a servicios, agrega validación con Zod y mejora nombres. No cambies reglas de negocio. Indica qué archivos tocaste.

## 6. Seed
Crea un `seed.ts` que registre `MeasurementField`, `CustomizationDefinition` y `CustomizationOption` iniciales para saco caballero, pantalón caballero, saco dama y pantalón dama.

## 7. Estado y transición
Implementa una función segura para transicionar estados de `CustomOrder` validando qué cambios son válidos y registrando historial. No permitas saltos de estado inconsistentes.

