# Use a newer Node.js image with a stable version
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN ls -la /app
RUN pwd

COPY . .

# Run build command and check for errors
RUN npm run build

# Add this debug step to check contents of /app
RUN ls -al /app

# Change this line to use 'dist' instead of 'build'
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]