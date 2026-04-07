# ── Stage 1: Build ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --prefer-offline

COPY . .

ARG VITE_API_URL
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_BLOGS_API_KEY
ARG VITE_FIREBASE_VAPID_KEY
ARG VITE_WEB3FORMS_ACCESS_KEY
ARG VITE_GOOGLE_CLIENT_ID

ENV VITE_API_URL=$VITE_API_URL \
    VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY \
    VITE_FIREBASE_BLOGS_API_KEY=$VITE_FIREBASE_BLOGS_API_KEY \
    VITE_FIREBASE_VAPID_KEY=$VITE_FIREBASE_VAPID_KEY \
    VITE_WEB3FORMS_ACCESS_KEY=$VITE_WEB3FORMS_ACCESS_KEY \
    VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

RUN npm run build

# ── Stage 2: Serve ──────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

RUN rm /etc/nginx/conf.d/default.conf

RUN printf 'server {\n\
    listen 80;\n\
    server_name _;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
\n\
    gzip on;\n\
    gzip_vary on;\n\
    gzip_proxied any;\n\
    gzip_types text/plain text/css text/xml text/javascript\n\
               application/javascript application/json application/xml\n\
               image/svg+xml font/woff font/woff2;\n\
\n\
    location ~* \\.(js|css|woff2?|png|jpg|jpeg|gif|ico|svg|webp)$ {\n\
        expires 1y;\n\
        add_header Cache-Control "public, immutable";\n\
        access_log off;\n\
    }\n\
\n\
    location /api/ {\n\
        proxy_pass         http://backend:3001;\n\
        proxy_http_version 1.1;\n\
        proxy_set_header   Upgrade $http_upgrade;\n\
        proxy_set_header   Connection "upgrade";\n\
        proxy_set_header   Host $host;\n\
        proxy_set_header   X-Real-IP $remote_addr;\n\
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;\n\
        proxy_set_header   X-Forwarded-Proto $scheme;\n\
        proxy_read_timeout 60s;\n\
    }\n\
\n\
    location /webhooks/ {\n\
        proxy_pass       http://backend:3001;\n\
        proxy_set_header Host $host;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
    }\n\
\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
