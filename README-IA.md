# Cómo usar estos documentos con Copilot/Codex en VS Code

## Archivos incluidos
- `AGENTS.md`: guía maestra para cualquier agente.
- `.github/copilot-instructions.md`: instrucciones específicas para GitHub Copilot.
- `docs/01-contexto-producto.md`: contexto del negocio.
- `docs/02-reglas-de-negocio.md`: reglas operativas.
- `docs/03-arquitectura-y-convenciones.md`: arquitectura y estilo.
- `docs/04-base-de-datos-prisma.md`: criterios para Prisma.
- `docs/05-flujos-criticos.md`: flujos clave.
- `docs/06-prompts-utiles.md`: prompts reutilizables.

## Uso recomendado
1. Coloca estos archivos en la raíz de tu proyecto.
2. Mantén `AGENTS.md` y `.github/copilot-instructions.md` siempre actualizados.
3. Cuando pidas código a Copilot/Codex, referencia explícitamente el módulo y el archivo guía.
4. Para tareas grandes, pega también el prompt base desde `docs/06-prompts-utiles.md`.
5. Si cambias reglas del negocio, actualiza primero los docs y luego el código.

## Orden sugerido de lectura para la IA
1. `AGENTS.md`
2. `.github/copilot-instructions.md`
3. `docs/01-contexto-producto.md`
4. `docs/02-reglas-de-negocio.md`
5. `docs/04-base-de-datos-prisma.md`
6. `docs/05-flujos-criticos.md`

## Recomendación práctica
Cuando abras chat con el asistente en VS Code, empieza con algo como:

> Lee `AGENTS.md`, `.github/copilot-instructions.md` y `docs/02-reglas-de-negocio.md`. Luego ayúdame a implementar [módulo/tarea] sin romper la separación entre venta, confección, alquiler y arreglos.

