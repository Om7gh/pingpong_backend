FROM node:slim

RUN apt update && apt install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install && npm rebuild better-sqlite3

COPY . .


ENTRYPOINT ["npm", "run", "dev"]
