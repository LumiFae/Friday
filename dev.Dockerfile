FROM node:18

WORKDIR /app

ARG DB_URL

ENV DB_URL=${DB_URL}

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npx drizzle-kit push

EXPOSE 8000

CMD ["npm", "start"]