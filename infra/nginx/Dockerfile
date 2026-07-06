FROM nginx:1.31-alpine

RUN apk add --no-cache openssl

COPY generate-certs.sh /docker-entrypoint.d/40-generate-certs.sh
RUN chmod +x /docker-entrypoint.d/40-generate-certs.sh

COPY nginx.conf /etc/nginx/conf.d/default.conf
