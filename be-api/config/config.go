package config

import "os"

type Config struct {
	DataSourceName string
	Port           string
}

func LoadConfig() *Config {
	dsn := os.Getenv("DSN")
	dsn = "root:aa14725766@tcp(127.0.0.1:3306)/azure_magnetar?charset=utf8mb4&parseTime=True&loc=Local"

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	return &Config{
		DataSourceName: dsn,
		Port:           port,
	}
}
