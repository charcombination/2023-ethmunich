FROM node:18

WORKDIR /usr/src/app

ENV PATH /usr/src/app/node_modules/.bin:$PATH

COPY package*.json ./
RUN npm install

COPY . .

CMD npm run start:live
