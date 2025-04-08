FROM cirrusci/flutter:latest

WORKDIR /app

COPY . .

RUN flutter pub get
RUN flutter build web

# Dùng nginx để serve web
FROM nginx:alpine
COPY --from=0 /app/build/web /usr/share/nginx/html
