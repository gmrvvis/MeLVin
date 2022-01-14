FROM ubuntu:20.04
RUN apt-get update

RUN apt-get update && DEBIAN_FRONTEND="noninteractive" apt-get install -y \
	libcurl4-openssl-dev mongodb r-base build-essential python-dev nodejs \
    npm wget curl python3-pip libxml2 libxml2-dev libsasl2-dev openssl    \
    apache2 git

RUN npm i -g n && n stable
RUN npm i -g nodemon && pip3 install circus numpy pandas pymongo scikit-learn
RUN R -e "install.packages(c('jsonlite', 'readr', 'mongolite', 'data.table', 'Rtsne', 'stats'), dependencies=TRUE, repos='http://cran.rstudio.com/')"

WORKDIR /app

COPY package.json /app/package.json
COPY auth/package.json /app/auth/package.json
RUN npm install && cd auth && npm install

COPY . /app
RUN cd auth && npm run-script build

RUN a2enmod ssl proxy proxy_http proxy_wstunnel rewrite
COPY ssl.conf /etc/apache2/sites-available/default-ssl.conf
RUN ln -s /etc/apache2/sites-available/default-ssl.conf /etc/apache2/sites-enabled/000-default-ssl.conf && cd /etc/apache2/ && openssl req -newkey rsa:4096 -x509 -sha256 -days 3650 -nodes -out apache.crt -keyout apache.key -subj "/C=AA/L=AA/O=AA/CN=AA/"
EXPOSE 80
EXPOSE 443
CMD bash start.sh
