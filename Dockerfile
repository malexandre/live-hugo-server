FROM node

ADD . /code
WORKDIR /code

# RUN apk --no-cache add -t native-deps git g++ gcc libgcc libstdc++ linux-headers make python
# RUN npm install --build-from-source=bcrypt
# RUN apk del native-deps
RUN npm install
RUN npm cache clean --force

CMD npm start
