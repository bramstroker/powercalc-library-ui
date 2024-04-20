# Dockerfile
FROM node:18.16.0-alpine3.17
RUN mkdir -p /app
WORKDIR /app
COPY public/ src/ package.json package-lock.json ./
RUN npm install
EXPOSE 3000
CMD [ "npm", "start"]