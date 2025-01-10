include .env
# Makefile

# Go parameters
BINARY_NAME=server

# Database parameters
DB_USER ?= root
DB_PASS ?= $(DATABASE_PASSWORD)
DB_NAME ?= hackathon2025
DOCKER_COMPOSE ?= docker compose
MQTT_PATH ?= mqtt_server/mqtt

# Colors for output
GREEN  := $(shell tput -Txterm setaf 2)
YELLOW := $(shell tput -Txterm setaf 3)
RESET  := $(shell tput -Txterm sgr0)

.PHONY: all run clean db-up db-down db-mockup help

## Database:
db-up: ## Run up migration script
	@echo "${GREEN}Running database up script...${RESET}"
	mysql -u$(DB_USER) -p$(DB_PASS) < internal/db/scripts/init_schema_up.sql

db-down: ## Run down migration script
	@echo "${YELLOW}Running database down script...${RESET}"
	mysql -u$(DB_USER) -p$(DB_PASS) < internal/db/scripts/init_schema_down.sql

db-mockup: ## Mock up data, insert into database
	@echo "${GREEN}Running database mock up data script...${RESET}"
	mysql -u$(DB_USER) -p$(DB_PASS) < internal/db/scripts/mock_data.sql

db-start: ## Start database
	@echo "${GREEN}Starting database...${RESET}"
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