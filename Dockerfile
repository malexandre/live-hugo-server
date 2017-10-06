FROM node:alpine

ADD . /code
WORKDIR /code

RUN npm install -g nodemon

CMD nodemon src/index.js
