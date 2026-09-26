# Backend Volquetas Aguazul (Zona 11). Compatible con Railway, Render y Docker.
FROM node:20-slim

WORKDIR /app

# Dependencias (incluye dev para Prisma CLI en el arranque)
COPY package.json package-lock.json* ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src

# Uploads locales (en producción usa Cloudinary + volumen según DEPLOY.md)
RUN mkdir -p uploads/volquetas

ENV NODE_ENV=production
EXPOSE 3000

# Migraciones + seed opcional + servidor (ver package.json)
CMD ["npm", "run", "start:prod"]
