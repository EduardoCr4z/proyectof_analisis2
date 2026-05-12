FROM node:lts-alpine3.22
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
ENV PORT=4002
ENV MYSQL_HOST=mysql
ENV MYSQL_USER=root
ENV MYSQL_PASSWORD=123456
ENV MYSQL_DB=asignaciones
EXPOSE 4002
CMD ["npm","start"]