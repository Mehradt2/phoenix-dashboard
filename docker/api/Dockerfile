FROM node:22-alpine
WORKDIR /app
COPY server/package.json ./
RUN npm install --omit=dev
COPY server/src ./src
COPY server/migrations ./migrations
COPY server/test ./test
USER node
EXPOSE 8080
HEALTHCHECK --interval=20s --timeout=4s --retries=4 CMD node -e "fetch('http://127.0.0.1:8080/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node","src/index.mjs"]
