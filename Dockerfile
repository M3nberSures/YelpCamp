FROM node:12

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080

RUN npm install pm2 -g
CMD [ "pm2-runtime", "./src/app.js" ]
