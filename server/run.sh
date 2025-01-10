echo "Starting Go server..."

# Navigate to server directory if not already there
cd "$(dirname "$0")"

# Check if go.mod exists
if [ ! -f "go.mod" ]; then
    echo "Error: go.mod not found. Please ensure you're in the correct directory."
    exit 1
fi

# Run the server
echo "Running go server on port 8080..."
go run cmd/main.go