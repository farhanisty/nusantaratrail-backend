FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

RUN npx prisma migrate deploy

RUN npm run prisma seed

RUN npm run build

EXPOSE 8080

CMD ["npm", "start"]