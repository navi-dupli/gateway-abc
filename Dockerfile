FROM node:15.4 as build

WORKDIR /app
COPY package*.json .
COPY proyecto-final-xcloud-firebase-adminsdk-yni8p-48600f3b4e.json .
RUN npm install
COPY . .
RUN npm run build

FROM node:15.4
WORKDIR /app
COPY package.json .
COPY proyecto-final-xcloud-firebase-adminsdk-yni8p-48600f3b4e.json .
RUN npm install --only=production
COPY --from=build /app/dist ./dist
CMD npm run start:prod