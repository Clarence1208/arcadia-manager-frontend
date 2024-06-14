# Use an official Node runtime as a parent image
FROM node:20 as build-stage

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Bundle app source inside Docker image
COPY . .

# Construisez l'application
RUN npm run build

# Étape de production
FROM nginx:stable-alpine as production-stage

# Copiez le build du dossier dist dans le serveur nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Exposez le port 80
EXPOSE 80

# Lancez nginx
CMD ["nginx", "-g", "daemon off;"]

#
## Expose port 80 to have it mapped by Docker daemon
#EXPOSE 3000
#
## Define the command to run the app
#CMD ["npm", "start"]
