FROM node:20-alpine

WORKDIR /app

# Se copian primero los manifiestos para que la capa de dependencias
# se reaproveche mientras package.json no cambie.
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Render inyecta PORT; 3000 es el valor por defecto en local.
ENV NODE_ENV=production
EXPOSE 3000

# Usuario sin privilegios (la imagen node ya trae el usuario "node").
USER node

CMD ["node", "src/server.js"]
