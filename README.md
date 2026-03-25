This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Prisma 7 Setup

Este proyecto usa Prisma 7 con configuracion en `prisma.config.ts`.

Cambios importantes en Prisma 7:
- `schema.prisma` ya no define `url` en `datasource`.
- La conexion se define en `prisma.config.ts` (`datasource.url`).
- Para PostgreSQL, `PrismaClient` se inicializa con `@prisma/adapter-pg`.

Comandos utiles:

```bash
npx prisma validate
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

Dependencias de Prisma 7 usadas en este proyecto:
- `prisma`
- `@prisma/client`
- `@prisma/adapter-pg`
- `pg`
- `dotenv`

## Scheduler (Recordatorio 24h de Citas)

Se agrego un endpoint interno para ejecucion por scheduler externo (cron):

- `POST /api/internal/cron/appointments/reminder-24h`

Autorizacion requerida:

- Header `Authorization: Bearer <CRON_SECRET>`
- Alternativa: header `x-cron-secret: <CRON_SECRET>`

Variables de entorno:

- `CRON_SECRET`: secreto compartido para proteger endpoints internos de cron.

Payload opcional:

```json
{
	"channel": "WHATSAPP",
	"dryRun": false
}
```

Si no se envia body, usa defaults del schema (`WHATSAPP`, `dryRun=false`).

Ejemplo con curl:

```bash
curl -X POST "http://localhost:3000/api/internal/cron/appointments/reminder-24h" \
	-H "Authorization: Bearer $CRON_SECRET" \
	-H "Content-Type: application/json" \
	-d '{"channel":"WHATSAPP","dryRun":false}'
```

Recomendacion operativa:

- Ejecutar cada hora.
- Monitorear resultados y volumen via `GET /api/notifications`.

## Izipay Yape Code (Session Token Backend)

Se agrego endpoint backend para obtener token de sesion de Izipay para checkout SDK:

- `POST /api/payments/izipay/session-token` (checkout Izipay enfocado en Yape Code)

Body:

```json
{
	"orderType": "sale",
	"orderId": "<order_uuid>"
}
```

Acceso:

- Requiere sesion (`authenticated`).
- Cliente solo puede solicitar token para ordenes propias.
- Admin puede solicitar token para cualquier orden.

Regla Yape (metodo principal):

- Monto maximo permitido por backend para Yape Code: `S/ 2000`.

Variables de entorno requeridas para integracion:

- `IZIPAY_SESSION_TOKEN_URL`: URL completa del endpoint de token de sesion.

Variables opcionales:

- `IZIPAY_SESSION_TOKEN_AUTHORIZATION`: valor completo del header Authorization (`Basic ...` o `Bearer ...`).
- `IZIPAY_SESSION_TOKEN_EXTRA_HEADERS`: JSON string con headers extra.
- `IZIPAY_SESSION_TOKEN_BODY`: JSON string con body para el request de token.
- `IZIPAY_RSA_PUBLIC_KEY`: llave publica RSA para `checkout.LoadForm`.
- `IZIPAY_MERCHANT_CODE`: merchant code para config de checkout.
- `IZIPAY_MOCK_MODE`: `true` para modo simulacion sin afiliacion.

Modo simulacion (`IZIPAY_MOCK_MODE=true`):

- No llama a Izipay.
- Genera `authorization` mock y devuelve `tokenSource: "mock"`.
- Permite avanzar desarrollo frontend/backend sin credenciales reales.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

