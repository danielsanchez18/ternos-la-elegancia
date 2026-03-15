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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
