# CUTI (employr.id) — api (NestJS :3001) + admin (Next.js :3002)
# ponytail: 1 deps stage (COPY . . biar lockfile importers selalu lengkap), 1 build, 2 slim runtime

FROM node:20-slim AS base
RUN npm install -g pnpm@9.0.0
WORKDIR /app

FROM base AS deps
COPY . .
RUN pnpm install --frozen-lockfile --filter @cuti/api... --filter @cuti/admin...

FROM deps AS build
# dummy DB url: PrismaClient constructor kadang validate env saat next build prerender
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
# regenerate Prisma client utk Linux (yang di-commit = engine Windows)
RUN pnpm --filter @cuti/db exec prisma generate
RUN pnpm --filter @cuti/api build
# overlay compiled JS balik ke packages (runtime resolve via symlink spt di dev)
RUN cp -r apps/api/dist/packages/db/src/. packages/db/src/ \
 && cp -r apps/api/dist/packages/types/src/. packages/types/src/
RUN pnpm --filter @cuti/admin build
# swap main+exports .ts→.js utk RUNTIME; AFTER admin build (Next transpile TS via exports .ts — jangan diubah jalurnya)
RUN node -e 'const fs=require("fs");for(const p of["packages/db/package.json","packages/types/package.json"]){const j=JSON.parse(fs.readFileSync(p,"utf8"));const sw=s=>typeof s==="string"?s.replace(/\.ts$/,".js"):s;j.main=sw(j.main);j.types=sw(j.types);if(j.exports)for(const k of Object.keys(j.exports)){const e=j.exports[k];for(const kk of Object.keys(e))e[kk]=sw(e[kk]);}fs.writeFileSync(p,JSON.stringify(j,null,2));}console.log("exports swapped");'

FROM node:20-slim AS api
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api ./apps/api
COPY --from=build /app/packages ./packages
WORKDIR /app/apps/api
EXPOSE 3001
CMD ["node", "dist/apps/api/src/main.js"]

FROM node:20-slim AS admin
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/admin ./apps/admin
COPY --from=build /app/packages ./packages
WORKDIR /app/apps/admin
EXPOSE 3002
CMD ["node", "node_modules/next/dist/bin/next", "start", "-H", "0.0.0.0", "-p", "3002"]
