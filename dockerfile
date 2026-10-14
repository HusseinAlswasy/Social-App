FROM node:24-alpine

WORKDIR /Social_App

COPY ./package.json ./

RUN npm install --omit=dev

COPY . .

EXPOSE 3000

CMD ["node","dist/index.js"]

