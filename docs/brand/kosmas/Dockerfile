FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY ui-treatment-deck.html /usr/share/nginx/html/index.html
RUN chmod 644 /usr/share/nginx/html/*
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
