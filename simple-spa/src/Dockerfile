ARG NODE_TAG
FROM node:${NODE_TAG}

RUN mkdir /app
WORKDIR /app

# Server dependencies
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install

# Client dependencies
COPY client/package.json client/package.json
COPY client/package-lock.json client/package-lock.json
RUN cd client && npm install

# copy code
COPY api api
COPY lib lib
COPY index.js index.js
COPY client/build client/build
COPY client/js client/js
COPY client/public client/public
COPY client/scss client/scss

# client build
RUN cd client && npm run dist

# build tags
ARG APP_VERSION
ENV APP_VERSION ${APP_VERSION}
ARG BUILD_NUM
ENV BUILD_NUM ${BUILD_NUM}
ARG BUILD_TIME
ENV BUILD_TIME ${BUILD_TIME}

CMD node index.js
