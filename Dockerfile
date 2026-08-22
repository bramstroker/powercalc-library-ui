# Dockerfile
FROM node:25-alpine AS build

WORKDIR /app
ENV PATH=/app/node_modules/.bin:$PATH
COPY package.json ./
COPY package-lock.json ./
RUN npm ci --silent
RUN npm install react-scripts@3.4.1 -g --silent
COPY . ./
RUN npm run build:prerender-all

# production environment
FROM nginx:stable-perl
COPY --from=build /app/build/client /usr/share/nginx/html
COPY --from=build /app/build/nginx-redirects.conf /etc/nginx/conf.d/00-legacy-redirects-map.conf
COPY etc/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
