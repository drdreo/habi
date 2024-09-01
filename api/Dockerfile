FROM golang:1.22

# Set destination for COPY
WORKDIR /app

# Download Go modules
COPY go.mod go.sum ./
RUN go mod download

# Copy the source code. Note the slash at the end, as explained in
# https://docs.docker.com/reference/dockerfile/#copy
COPY ./ ./

# Set the working directory to where the main.go file is located
WORKDIR /app/cmd/api

# Build the Go application
RUN CGO_ENABLED=0 GOOS=linux go build -o /out

EXPOSE 8080

CMD ["/out"]