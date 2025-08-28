FROM debian:11

RUN apt-get update && apt-get install -y nginx openssl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /etc/ssl/certificate/ /etc/ssl/key/ /etc/nginx/

RUN openssl req -x509 -days 365 -nodes -newkey rsa:4096 \
    -out /etc/ssl/certificate/certificate.pem \
    -keyout /etc/ssl/key/certificate.key \
    -subj "/C=MO/ST=SALE/L=SALE/O=1337/OU=1337KH/CN=localhost"

COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./proxy_params /etc/nginx/proxy_params

CMD ["nginx", "-g", "daemon off;"]
