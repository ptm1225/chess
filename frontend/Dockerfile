FROM node:16 AS build

WORKDIR /app

COPY . .

RUN yarn install

EXPOSE 3000
CMD ["yarn", "start"]
