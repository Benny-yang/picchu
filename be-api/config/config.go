package config

import (
	"fmt"
	"strings"

	"azure-magnetar/pkg/logger"

	"github.com/spf13/viper"
)

// Config holds application-wide configuration values.
type Config struct {
	DataSourceName string `mapstructure:"dsn"`
	Port           string `mapstructure:"port"`
	JWTSecret      string `mapstructure:"jwt_secret"`
	FrontendURL    string `mapstructure:"frontend_url"`
	APIBaseURL     string `mapstructure:"api_base_url"`
	GCSBucketName  string `mapstructure:"gcs_bucket_name"`
}

// LoadConfig reads configuration from environment variables or config files.
func LoadConfig() *Config {
	// Set sensible defaults
	viper.SetDefault("dsn", "root:aa14725766@tcp(127.0.0.1:3306)/azure_magnetar?charset=utf8mb4&parseTime=True&loc=Local")
	viper.SetDefault("port", "8080")
	viper.SetDefault("jwt_secret", "azure-magnetar-dev-secret-key")
	viper.SetDefault("frontend_url", "http://localhost:5173")

	// Setup config file search paths
	viper.SetConfigName("config")   // name of config file (without extension)
	viper.SetConfigType("yaml")     // REQUIRED if the config file does not have the extension in the name
	viper.AddConfigPath(".")        // optionally look for config in the working directory
	viper.AddConfigPath("./config") // look for config in the config folder

	// Support reading from Environment Variables
	// Automatically map env variables to config fields without prefix
	viper.AutomaticEnv()
	// Need to map nested struct keys or keys with underscores
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))

	// Bind specific environment keys manually to ensure they override YAML
	_ = viper.BindEnv("dsn", "DSN")
	_ = viper.BindEnv("port", "PORT")
	_ = viper.BindEnv("jwt_secret", "JWT_SECRET")
	_ = viper.BindEnv("frontend_url", "FRONTEND_URL")
	_ = viper.BindEnv("api_base_url", "API_BASE_URL")
	_ = viper.BindEnv("gcs_bucket_name", "GCS_BUCKET_NAME")

	// Read config file if exists
	if err := viper.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			logger.Error("Error reading config file", "err", err)
		} else {
			logger.Info("No config file found, falling back to Environment Variables / Defaults.")
		}
	} else {
		logger.Info("Using config file", "file", viper.ConfigFileUsed())
	}

	// Unmarshal into Config struct
	var cfg Config
	if err := viper.Unmarshal(&cfg); err != nil {
		logger.Error("Unable to decode configuration into struct", "err", err)
		panic(fmt.Errorf("fatal error config loading: %w", err))
	}

	// Dynamic post-load defaults
	if cfg.APIBaseURL == "" {
		cfg.APIBaseURL = fmt.Sprintf("http://localhost:%s", cfg.Port)
	}

	return &cfg
}
