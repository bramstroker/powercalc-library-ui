# Dockerfile
FROM node:25-alpine AS build

WORKDIR /app
ENV PATH=/app/node_modules/.bin:$PATH
COPY package.json ./
COPY package-lock.json ./
RUN npm ci --silent
COPY . ./
RUN npm run build

# Renders the documents again without rebuilding the app. Run against the same build the serving
# container was made from, it rewrites HTML, `.data` and the sitemap while every hashed asset — and
# the container serving it — stays exactly where it was.
FROM node:25-alpine AS renderer

WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
COPY package-lock.json ./
RUN npm ci --omit=dev --silent
COPY --from=build /app/build/server ./build/server
COPY scripts ./scripts
# The only application sources the scripts reach into. Both are plain `.mjs` so they run unbuilt.
COPY src/utils/urlSlugs.mjs ./src/utils/urlSlugs.mjs
COPY src/config/sensorDimensions.mjs ./src/config/sensorDimensions.mjs

# The redirect map is written to a throwaway path: Nginx loads it at startup from the image, so a
# refresh cannot install a new one. The pattern redirects in `etc/nginx.conf` already cover the
# entities added since the last deploy.
ENV PRERENDER_OUT=/documents \
    SITEMAP_OUTPUT=/documents/sitemap.xml \
    NGINX_REDIRECTS_OUTPUT=/tmp/nginx-redirects.conf
CMD ["sh", "-c", "node scripts/prerender.mjs --out \"$PRERENDER_OUT\" && node scripts/generate-sitemap.mjs"]

# production environment
FROM nginx:stable-perl
COPY --from=build /app/build/client /usr/share/nginx/html
COPY --from=build /app/build/nginx-redirects.conf /etc/nginx/conf.d/00-legacy-redirects-map.conf
COPY etc/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
