// File: internal/model/config.go
package model

import "time"

type AppConfig struct {
    DatabaseConfig DatabaseConfig `mapstructure:"database"`
    ServerConfig   ServerConfig   `mapstructure:"server"`
}

type DatabaseConfig struct {
    Host            string `mapstructure:"host"`
    Port            int    `mapstructure:"port"`
    User            string `mapstructure:"user"`
    Password        string `mapstructure:"password"`
    Name            string `mapstructure:"name"`
    SSLMode         string `mapstructure:"sslmode"`
    MaxConnections  int    `mapstructure:"max_connections"`
}

type ServerConfig struct {
    Port         int           `mapstructure:"port"`
    Host         string        `mapstructure:"host"`
    Timeout      time.Duration `mapstructure:"timeout"`
    ReadTimeout  time.Duration `mapstructure:"read_timeout"`
    WriteTimeout time.Duration `mapstructure:"write_timeout"`
}