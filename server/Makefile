include .env
# Makefile

# Go parameters
BINARY_NAME=server

# Database parameters
DB_HOST ?= localhost
DB_USER ?= root
DB_PASS ?= Rsv18221
DB_NAME ?= hackathon2025
DB_PORT ?= 3306
DOCKER_COMPOSE ?= docker compose
MQTT_PATH ?= mqtt_server/mqtt

# Colors for output
GREEN  := $(shell tput -Txterm setaf 2)
YELLOW := $(shell tput -Txterm setaf 3)
RESET  := $(shell tput -Txterm sgr0)

.PHONY: all run clean db-up db-create db-down db-mockup help

## Database:
db-create: ## Create database
	@echo "Creating database..."
	mysql -h$(DB_HOST) -P$(DB_PORT) -u$(DB_USER) -p$(DB_PASS) --ssl=0 -e "CREATE DATABASE IF NOT EXISTS $(DB_NAME);"

db-up: ## Run up migration script
	@echo "Running database up script..."
	mysql -h$(DB_HOST) -P$(DB_PORT) -u$(DB_USER) -p$(DB_PASS) --ssl=0 $(DB_NAME) < internal/db/scripts/schema_up.sql

db-down: ## Run down migration script
	@echo "Running database down script..."
	mysql -h$(DB_HOST) -P$(DB_PORT) -u$(DB_USER) -p$(DB_PASS) --ssl=0 $(DB_NAME) < internal/db/scripts/schema_down.sql

db-mockup: ## Mock up data, insert into database
	@echo "Running database mock up data script..."
	mysql -h$(DB_HOST) -P$(DB_PORT) -u$(DB_USER) -p$(DB_PASS) --ssl=0 $(DB_NAME) < internal/db/scripts/mock_data.sql

db-start: ## Start database
	@echo "Starting database..."
	make db-create
	make db-up
	make db-mockup

mqtt-up: ## Start MQTT broker docker container
	@echo "${GREEN}Starting MQTT broker...${RESET}"
	cd $(MQTT_PATH) && $(DOCKER_COMPOSE) up -d

mqtt-down: ## Stop MQTT broker docker container
	@echo "${YELLOW}Stopping MQTT broker...${RESET}"
	cd $(MQTT_PATH) && $(DOCKER_COMPOSE) down

mqtt-logs: ## Show MQTT broker logs
	@echo "${GREEN}Showing MQTT broker logs...${RESET}"
	cd $(MQTT_PATH) && $(DOCKER_COMPOSE) logs

## Development:
run: ## Run the application
	@go run ./cmd/main.go

clean: ## Clean build files
	@rm -f ${BINARY_NAME}
	@go clean

## Help:
help: ## Show this help message
	@echo ''
	@echo 'Usage:'
	@echo '  ${YELLOW}make${RESET} ${GREEN}<target>${RESET}'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  ${YELLOW}%-15s${GREEN}%s${RESET}\n", $$1, $$2}' $(MAKEFILE_LIST)