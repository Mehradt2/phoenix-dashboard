FROM node:22-alpine AS build
WORKDIR /app
ENV KP_BASE=/
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run check && npm test && npm run build

FROM nginx:1.27-alpine
ENV API_UPSTREAM=api:8080 KP_RUNTIME_MODE=team KP_RELEASE=docker KP_MODEL_SOURCE=auto KP_MODEL_BASE=/models/ NGINX_ENVSUBST_FILTER=API_UPSTREAM
COPY docker/web/default.conf.template /etc/nginx/templates/default.conf.template
COPY docker/web/40-runtime-config.sh /docker-entrypoint.d/40-runtime-config.sh
RUN chmod +x /docker-entrypoint.d/40-runtime-config.sh
COPY --from=build /app/dist /usr/share/nginx/html
HEALTHCHECK --interval=20s --timeout=3s --retries=3 CMD wget -qO- http://127.0.0.1/healthz || exit 1
