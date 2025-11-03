FROM ubuntu:focal

RUN apt-get update
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get upgrade -y
RUN apt-get install -y nodejs

RUN apt-get install git -y

WORKDIR /home/app

COPY ./main.sh /home/app/main.sh
COPY ./script.js /home/app/script.js
COPY ./package*.json ./

RUN npm install

RUN sed -i 's/\r$//' /home/app/main.sh && chmod +x /home/app/main.sh

ENTRYPOINT [ "/home/app/main.sh" ]