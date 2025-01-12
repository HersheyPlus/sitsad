FROM golang:1.22-alpine

RUN apk update && \
    apk add --no-cache \
    git \
    build-base \
    make \
    mysql-client \
    ncurses \
    && rm -rf /var/cache/apk/*

RUN go install github.com/cosmtrek/air@v1.40.4

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

# Copy wait-for script first and make it executable
COPY wait-for-mysql.sh /app/wait-for-mysql.sh
RUN chmod +x /app/wait-for-mysql.sh

# Copy the rest of the application
COPY . .

EXPOSE 8080

# Update the path to the wait script
CMD ["sh", "-c", "./wait-for-mysql.sh && make db-start && air"]