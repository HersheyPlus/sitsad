# Update to Go 1.22
FROM golang:1.22-alpine

# Install git and build dependencies
RUN apk update && \
    apk add --no-cache \
    git \
    build-base \
    && rm -rf /var/cache/apk/*

# Install air version 1.40.4
RUN go install github.com/cosmtrek/air@v1.40.4

# Set the working directory
WORKDIR /app

# Copy go.mod and go.sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the rest of the Go application
COPY . .

# Expose the port for the Go backend
EXPOSE 8080

# Run the application using air for live-reloading
CMD ["air"]