FROM nginx:alpine
COPY kosmas-pickleball-consulting-dashboard.html /usr/share/nginx/html/index.html
COPY brand/ /usr/share/nginx/html/brand/
EXPOSE 8080
RUN sed -i 's/listen       80;/listen       8080;/' /etc/nginx/conf.d/default.conf
