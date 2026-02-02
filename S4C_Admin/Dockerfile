# Stage 1: Build
FROM node:25-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Build for production with base-href set to /admin/
RUN npm run build -- --configuration production --base-href /admin/

# Stage 2: Serve
FROM nginx:alpine
# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets to /usr/share/nginx/html/admin
# This ensures that requests to /admin/styles.css find the file at the correct path
COPY --from=build /app/dist/S4C_Admin/browser /usr/share/nginx/html/admin

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]