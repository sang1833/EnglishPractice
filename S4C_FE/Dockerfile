# Stage 1: Build
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Build for production
RUN npm run build -- --configuration production

# Stage 2: Serve
FROM nginx:alpine
# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy built assets (Assuming output is dist/S4C_FE/browser based on angular.json)
# If the output directory is different, this needs adjustment. 
# Based on Angular 17+ conventions with "application" builder, it's usually dist/<project>/browser.
COPY --from=build /app/dist/S4C_FE/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
