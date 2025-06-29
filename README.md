# Xtream Mock API Server

A lightweight Docker-based mock server that simulates Xtream Codes API endpoints for IPTV application development and testing.

## Quick Start with Docker
```bash
# Clone the repository
git clone https://github.com/bsogulcan/xtream-codes-mock-server.git
cd xtream-codes-mock-server

# Build Docker image
docker build -t xtream-codes-mock-server .

# Run the container
docker run -d -p 8080:8080 --name xtream-codes-mock-server xtream-codes-mock-server
```