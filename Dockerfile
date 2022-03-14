FROM node

RUN mkdir -p /home/egg

WORKDIR /home/egg

COPY package.json /home/egg/package.json

RUN npm install --registry=https://registry.npm.taobao.org

COPY . /home/egg

EXPOSE 7001

CMD npm run start