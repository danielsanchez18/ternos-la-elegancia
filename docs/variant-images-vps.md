# Arquitectura de imagenes de variantes (VPS)

## Objetivo
Guardar imagenes de variantes de forma segura y escalable, manteniendo URLs estables para frontend y admin.

## Estructura recomendada
- Storage fisico: `MEDIA_UPLOAD_DIR` (ejemplo: `/var/www/ternos-media/uploads`)
- URL publica: `MEDIA_PUBLIC_URL_PREFIX` (ejemplo: `/uploads`)
- Path final por archivo:
  - `variants/{variantId}/{yyyy}/{mm}/{timestamp}-{uuid}.{ext}`
  - ejemplo: `variants/8f.../2026/03/1711425532000-f8c...webp`

## Flujo de subida
1. Admin envia `multipart/form-data` a `POST /api/products/variants/{variantId}/images/upload`.
2. API valida:
   - autenticacion admin
   - tipo MIME (`jpg/png/webp/avif`)
   - tamano maximo (8MB)
3. API guarda archivo en `MEDIA_UPLOAD_DIR`.
4. API registra metadata en DB (`ProductVariantImage`) con `url`, `altText`, `sortOrder`.
5. Frontend consume:
   - `GET /api/products/variants/{variantId}/images`

## Recomendacion de produccion con Nginx
- Montar directorio real en VPS:
  - `/var/www/ternos-media/uploads`
- Configurar:
  - `MEDIA_UPLOAD_DIR=/var/www/ternos-media/uploads`
  - `MEDIA_PUBLIC_URL_PREFIX=/uploads`
- Servir archivos estaticos por Nginx:
  - URL `/uploads/*` -> alias a `/var/www/ternos-media/uploads/*`
- Beneficio:
  - descarga de imagenes fuera de Node
  - mejor rendimiento y cache

## Backups
- Backup diario del directorio de media.
- Retencion sugerida: 7 diarios + 4 semanales.
- Mantener backup de DB sincronizado (para no perder referencias).
