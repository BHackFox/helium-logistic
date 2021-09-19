FROM node:15
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
RUN npm install nodemon

COPY . .

EXPOSE 3000

CMD ["nodemon", "server.js"]
