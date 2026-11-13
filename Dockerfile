FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_CLIENT_DOWNLOAD_URL
ARG VITE_CLIENT_SIZE
ENV VITE_CLIENT_DOWNLOAD_URL=$VITE_CLIENT_DOWNLOAD_URL
ENV VITE_CLIENT_SIZE=$VITE_CLIENT_SIZE
RUN npm run check

FROM node:24-alpine AS runtime
ENV NODE_ENV=production PORT=8080
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1:8080/health/live || exit 1
CMD ["node", "server/index.mjs"]
