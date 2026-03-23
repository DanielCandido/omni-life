FROM node:20-alpine AS base
WORKDIR /app

# Install turbo globally
RUN npm install -g turbo

# Copy root config files
COPY package.json turbo.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Install all dependencies
RUN npm install --workspaces

# Copy all source files
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Generate Prisma client
WORKDIR /app/apps/api
RUN npx prisma generate

# Build shared package
WORKDIR /app/packages/shared
RUN npm run build

# Build API
WORKDIR /app/apps/api
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/packages ./packages
COPY --from=base /app/apps/api/dist ./apps/api/dist
COPY --from=base /app/apps/api/prisma ./apps/api/prisma
COPY --from=base /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=base /app/apps/api/package.json ./apps/api/package.json

WORKDIR /app/apps/api

EXPOSE 3000

CMD ["node", "dist/main"]
