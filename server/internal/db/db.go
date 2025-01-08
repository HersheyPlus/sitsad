package db

import (
	"fmt"
	"log"
	"time"
	_ "github.com/go-sql-driver/mysql"
	"github.com/jmoiron/sqlx"
	"server/internal/model"
)

type Database struct {
	*sqlx.DB
}

func NewDatabase(cfg *model.AppConfig) (*Database, error) {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?parseTime=true&multiStatements=true",
		cfg.DatabaseConfig.User,
		cfg.DatabaseConfig.Password,
		cfg.DatabaseConfig.Host,
		cfg.DatabaseConfig.Port,
		cfg.DatabaseConfig.Name,
	)


	db, err := sqlx.Connect("mysql", dsn)
	if err != nil {
		return nil, fmt.Errorf("error connecting to database: %w. Use `make db-up` to create the database", err,)
	}

	db.SetMaxOpenConns(cfg.DatabaseConfig.MaxConnections)
	db.SetMaxIdleConns(cfg.DatabaseConfig.MaxConnections / 2)
	db.SetConnMaxLifetime(time.Hour)

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("error pinging database: %w", err)
	}

	log.Printf("Successfully connected to database: %s", cfg.DatabaseConfig.Name)

	return &Database{
		DB: db,
	}, nil
}

func (d *Database) Close() error {
	if err := d.DB.Close(); err != nil {
		return fmt.Errorf("error closing database connection: %w", err)
	}
	return nil
}