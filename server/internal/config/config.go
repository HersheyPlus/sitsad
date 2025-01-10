package config

import (
	"encoding/json"
	"fmt"
	"github.com/joho/godotenv"
	"github.com/spf13/viper"
	"log"
	"os"
	"server/internal/models"
	"strings"
)

func InitializeConfig() (*models.AppConfig, error) {

	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	v := viper.New()
	v.SetConfigName("config")
	v.SetConfigType("yaml")
	v.AddConfigPath("./internal/config")
	v.SetEnvPrefix("HACKATHON_2025")
	v.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	v.AutomaticEnv()
	setDefaults(v)

	if err := v.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			log.Println("No config file found, using defaults and environment variables")
		} else {
			return nil, fmt.Errorf("error reading config file: %w", err)
		}
	}

	var config models.AppConfig
	if err := v.Unmarshal(&config); err != nil {
		return nil, fmt.Errorf("unable to decode config into struct: %w", err)
	}

	if password := os.Getenv("DATABASE_PASSWORD"); password != "" {
		config.DatabaseConfig.Password = password
	}

	if err := validateConfig(&config); err != nil {
		return nil, fmt.Errorf("config validation failed: %w", err)
	}

	const (
		yellow = "\033[33m"
		reset  = "\033[0m"
	)

	prettyConfig, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		log.Printf("Error formatting config: %v", err)
	} else {
		log.Printf("%sLoaded Configuration:\n%s%s", yellow, prettyConfig, reset)
	}

	return &config, nil
}

func setDefaults(v *viper.Viper) {
	v.SetDefault("database.host", "localhost")
	v.SetDefault("database.port", 3306)
	v.SetDefault("database.user", "mysql")
	v.SetDefault("database.password", "password")
	v.SetDefault("database.name", "postgres")
	v.SetDefault("database.sslmode", "disable")
	v.SetDefault("database.max_connections", 100)

	v.SetDefault("server.port", 8080)
	v.SetDefault("server.host", "localhost")
	v.SetDefault("server.timeout", "30s")
	v.SetDefault("server.read_timeout", "15s")
	v.SetDefault("server.write_timeout", "15s")
	v.SetDefault("server.allow_origins", []string{
        "http://localhost:3000",
        "http://localhost:5173",
    })

	v.SetDefault("mqtt.host", "localhost")
	v.SetDefault("mqtt.port", "1883")
	v.SetDefault("mqtt.username", "test")
	v.SetDefault("mqtt.password", "1234")
	v.SetDefault("mqtt.client_id", "mqttx_0ee90f12")
}

func validateConfig(config *models.AppConfig) error {
	if config.DatabaseConfig.Port < 0 || config.DatabaseConfig.Port > 65535 {
		return fmt.Errorf("invalid database port: %d", config.DatabaseConfig.Port)
	}
	if config.ServerConfig.Port < 0 || config.ServerConfig.Port > 65535 {
		return fmt.Errorf("invalid server port: %d", config.ServerConfig.Port)
	}
	return nil
}


