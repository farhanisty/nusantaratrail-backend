FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run prisma migrate

RUN npm run prisma seed

RUN npm run build

EXPOSE 8080

CMD ["npm", "start"]