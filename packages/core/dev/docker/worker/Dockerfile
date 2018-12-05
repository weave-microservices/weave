FROM node:latest

RUN mkdir /app
WORKDIR /app

COPY package.json .

ENV NODE_ENV=production

RUN npm install --production

COPY weave.config.js service.js ./

EXPOSE 4445
EXPOSE 9229

CMD ["npm", "start"]
