FROM node:22-alpine AS base

WORKDIR /build/

COPY package-lock.json \
  package.json \
  tsconfig.json \
  tsconfig.app.json \
  tsconfig.node.json \
  vite.config.ts \
  .env \
  .

RUN npm install --production=false

COPY index.html .
COPY src/ src/

RUN npm run build



FROM httpd:alpine AS prod
COPY --from=base /build/dist/ /usr/local/apache2/htdocs/


FROM base AS dev

CMD ["npm", "run", "dev-0"]
