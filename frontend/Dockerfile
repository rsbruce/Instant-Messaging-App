FROM node:20-alpine3.17
ADD . /
WORKDIR /frontend
# Build steps
RUN npm --prefix react-project install
RUN npm --prefix react-project run build
RUN npm --prefix server install 

CMD ["node", "server/index.js"]