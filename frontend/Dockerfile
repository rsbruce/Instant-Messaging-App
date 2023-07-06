FROM node:20-alpine3.17
ADD . /
WORKDIR /frontend
# Env for react project
RUN touch react-project/env.json
RUN echo '{"BACKEND": { "HOST": "localhost", "PORT" :8080 }, "IM_APP_ENV": "DEV" }' > react-project/env.json
# Build steps
RUN npm --prefix react-project install
RUN npm --prefix react-project run build
RUN npm --prefix server install 

CMD ["node", "server/index.js"]