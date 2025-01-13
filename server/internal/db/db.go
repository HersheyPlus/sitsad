package db

import (
	"fmt"
	"log"
	"time"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"server/internal/models"
)

type Database struct {
	DB *gorm.DB
}

func NewDatabase(cfg *models.AppConfig) (*Database, error) {

    dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local&allowNativePasswords=true&multiStatements=true&tls=false&timeout=30s",
    cfg.DatabaseConfig.User,
    cfg.DatabaseConfig.Password,
    cfg.DatabaseConfig.Host,
    cfg.DatabaseConfig.Port,
    cfg.DatabaseConfig.Name,
)

    // Configure GORM logger
    gormLogger := logger.Default.LogMode(logger.Info)

    // GORM configuration
    gormConfig := &gorm.Config{
        Logger: gormLogger,
        NowFunc: func() time.Time {
            return time.Now().UTC()
        },
    }

    var db *gorm.DB
    var err error
    
    maxRetries := 5
    for i := 0; i < maxRetries; i++ {
        db, err = gorm.Open(mysql.New(mysql.Config{
            DSN: dsn,
            DefaultStringSize: 256,
            DisableDatetimePrecision: true,
            DontSupportRenameIndex: true,
            DontSupportRenameColumn: true,
        }), gormConfig)
        
        if err == nil {
            break
        }
        log.Printf("Failed to connect to database (attempt %d/%d): %v", i+1, maxRetries, err)
        time.Sleep(time.Second * time.Duration(i+1))
    }
    
    if err != nil {
        return nil, fmt.Errorf("error connecting to database after %d attempts: %w", maxRetries, err)
    }

    // Configure connection pool
    sqlDB, err := db.DB()
    if err != nil {
        return nil, fmt.Errorf("error getting underlying SQL DB: %w", err)
    }

    sqlDB.SetMaxOpenConns(cfg.DatabaseConfig.MaxConnections)
    sqlDB.SetMaxIdleConns(cfg.DatabaseConfig.MaxConnections / 2)
    sqlDB.SetConnMaxLifetime(time.Hour)

    // Test connection
    if err := sqlDB.Ping(); err != nil {
        return nil, fmt.Errorf("error pinging database: %w", err)
    }

    log.Printf("Successfully connected to database: %s", cfg.DatabaseConfig.Name)

    return &Database{
        DB: db,
    }, nil
}
// Close the database connection
func (d *Database) Close() error {
	sqlDB, err := d.DB.DB()
	if err != nil {
		return fmt.Errorf("error getting underlying SQL DB: %w", err)
	}
	
	if err := sqlDB.Close(); err != nil {
		return fmt.Errorf("error closing database connection: %w", err)
	}
	return nil
}

// GORM instance
func (d *Database) GetDB() *gorm.DB {
	return d.DB
}