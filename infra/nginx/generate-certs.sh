#!/bin/sh
set -e

mkdir -p /etc/nginx/ssl

if [ ! -f /etc/nginx/ssl/nginx.crt ] || [ ! -f /etc/nginx/ssl/nginx.key ]; then
    echo "Generating self-signed certificate..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/nginx.key \
        -out /etc/nginx/ssl/nginx.crt \
        -subj "/C=FR/ST=IDF/L=Paris/O=42/OU=breakprout/CN=localhost"
    echo "Certificate generated successfully."
else
    echo "Using existing certificate."
fi
