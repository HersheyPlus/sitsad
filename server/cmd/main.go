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

	conn, err := db.NewDatabase(cfg)
	if err != nil {
		log.Fatal("Failed to initialize database: ", err)
	}
	defer conn.Close()

	app := app.NewApp(conn.DB, cfg)
	if err := app.Start(); err != nil {
		log.Fatal("Failed to start application: ", err)
	}
}