FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run prisma:generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install --production
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/uploads ./uploads
COPY --from=builder /usr/src/app/prisma ./prisma
EXPOSE 3000
CMD ["node", "dist/server.js"]
