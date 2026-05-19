# Stage 1: Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the production application
RUN npm run build

# Stage 2: Production serve stage
FROM nginx:stable-alpine

# Copy built static files from build stage to Nginx public folder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy our custom Nginx server configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for the container
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
