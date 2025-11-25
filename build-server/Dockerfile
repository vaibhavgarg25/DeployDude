FROM ubuntu:focal

RUN apt-get update && \
    apt-get install -y curl git && \
    curl -fsSL https://deb.nodesource.com/setup_25.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean

WORKDIR /home/app

COPY main.sh main.sh
COPY script.js script.js
COPY package*.json ./

RUN npm install

RUN chmod +x main.sh script.js

ENTRYPOINT ["/home/app/main.sh"]
