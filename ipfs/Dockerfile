FROM golang:1.19-buster as buildgo

WORKDIR /backend

COPY go.mod ./
COPY go.sum ./
RUN go mod download

COPY ./ ./

RUN go build -o /docker-gs-ping
CMD go run main.go

EXPOSE 3000