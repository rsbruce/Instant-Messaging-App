FROM golang:1.20.4-alpine3.18
ADD . /
WORKDIR /backend
RUN touch .env
RUN go mod download
RUN go build -o main 
CMD ["/backend/main"]