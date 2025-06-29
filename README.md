# Xtream Mock API Server

A lightweight Docker-based mock server that simulates Xtream Codes API endpoints for IPTV application development and testing.

## Test Credentials

* Server URL: http://localhost:8080
* Username: test_user
* Password: test_pass


## Quick Start with Docker

### From Docker Hub
```bash
docker run -d -p 8080:8080 --name xtream-codes-mock-server bsogulcan/xtream-codes-mock-server:latest
```

### Build Local Image
```bash
# Clone the repository
git clone https://github.com/bsogulcan/xtream-codes-mock-server.git
cd xtream-codes-mock-server

# Build Docker image
docker build -t xtream-codes-mock-server .

# Run the container
docker run -d -p 8080:8080 --name xtream-codes-mock-server xtream-codes-mock-server
```