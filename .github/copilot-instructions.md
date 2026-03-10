# GitHub Copilot Instructions — Ternos La Elegancia

## Propósito
Asiste en el desarrollo de un sistema web para sastrería con módulos separados de:
- venta
- confección personalizada
- alquiler
- arreglos
- agenda de citas
- pagos y comprobantes
- clientes y medidas

## Instrucciones base
- Escribe el código en inglés.
- La interfaz visible al usuario debe estar en español.
- Usa TypeScript estricto.
- Usa Prisma como ORM principal.
- Usa Zod para validar entradas.
- No escribas SQL manual salvo que se pida explícitamente.
- Mantén la lógica de negocio fuera de los componentes UI.
- Prefiere servicios o casos de uso antes que controladores enormes.

## Reglas de dominio obligatorias
- Las órdenes son separadas: `sale`, `custom`, `rental`, `alteration`.
- Las medidas tienen vigencia de 3 meses y pueden reutilizarse.
- La confección debe soportar atributos flexibles por prenda.
- El alquiler debe rastrear unidades físicas individuales.
- `premiere/estreno` y `normal` afectan el precio, no crean otro producto.
- Las telas viven en tabla propia y con inventario.
- El sistema interno tiene un solo admin.

## Prisma
- No endurezcas atributos evolutivos como columnas fijas si deben crecer.
- Prefiere estructuras como definición/opción/selección.
- Guarda snapshots históricos en órdenes.
- Respeta las relaciones ya establecidas antes de proponer nuevas tablas.

## Frontend
- Diferencia claramente los flujos:
  - compra directa
  - confección
  - alquiler
  - arreglos
  - reserva de cita
- No uses un solo formulario para todos si las reglas son distintas.
- Prioriza formularios paso a paso para procesos complejos.

## Comportamiento esperado
Cuando se te pida una implementación:
1. identifica el módulo
2. enumera archivos impactados
3. implementa solo lo necesario
4. evita cambios colaterales innecesarios
5. si tocas Prisma, menciona migración y seed afectados

## Estilo de respuesta sugerido
- breve contexto
- cambios propuestos
- código
- siguiente paso

