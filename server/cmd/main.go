// File: cmd/main.go
package main

import (
	"log"
	"server/internal/app"
	"server/internal/config"
	"server/internal/db"
)

func main() {
	// Load configuration
	cfg, err := config.InitializeConfig()
	if err != nil {
		log.Fatal("Failed to load configuration: ", err)
	}

	// Initialize database connection
	dbConn, err := db.NewDatabase(cfg)
	if err != nil {
		log.Fatal("Failed to initialize database: ", err)
	}

	// Get the underlying sql.DB instance for deferred closing
	sqlDB, err := dbConn.DB.DB()
	if err != nil {
		log.Fatal("Failed to get underlying database connection: ", err)
	}
	defer sqlDB.Close()

	// Initialize application with GORM DB instance
	app := app.NewApp(dbConn.DB, cfg)
	if err := app.Start(); err != nil {
		log.Fatal("Failed to start application: ", err)
	}
}