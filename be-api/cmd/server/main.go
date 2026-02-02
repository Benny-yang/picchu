package main

import (
	"fmt"

	"azure-magnetar/config"
	"azure-magnetar/internal/handler"
	"azure-magnetar/internal/model"
	"azure-magnetar/internal/repository"
	"azure-magnetar/internal/service"
	"azure-magnetar/pkg/database"

	"github.com/gin-gonic/gin"
	cors "github.com/rs/cors/wrapper/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	_ "azure-magnetar/docs"
)

// @title           Azure Magnetar API
// @version         1.0
// @description     Dating App Backend API
// @termsOfService  http://swagger.io/terms/

// @contact.name   API Support
// @contact.url    http://www.swagger.io/support
// @contact.email  support@swagger.io

// @license.name  Apache 2.0
// @license.url   http://www.apache.org/licenses/LICENSE-2.0.html

// @host      localhost:8080
// @BasePath  /api/v1

func main() {
	// 1. Load Configuration
	cfg := config.LoadConfig()

	// 2. Initialize Database
	database.InitDB(cfg.DataSourceName)

	// Auto Migrate the schema
	if err := database.DB.AutoMigrate(&model.User{}, &model.UserProfile{}, &model.Post{}, &model.Follow{}); err != nil {
		fmt.Println("Failed to migrate database:", err)
		return
	}

	// Drop nickname column if it exists (Manual Migration)
	if database.DB.Migrator().HasColumn(&model.UserProfile{}, "nickname") {
		if err := database.DB.Migrator().DropColumn(&model.UserProfile{}, "nickname"); err != nil {
			fmt.Println("Failed to drop nickname column:", err)
		} else {
			fmt.Println("Dropped nickname column from user_profiles")
		}
	}

	// 3. Setup Dependencies
	userRepo := repository.NewUserRepository(database.DB)
	postRepo := repository.NewPostRepository(database.DB)

	userService := service.NewUserService(userRepo)
	postService := service.NewPostService(postRepo)

	userHandler := handler.NewUserHandler(userService)
	postHandler := handler.NewPostHandler(postService)

	// 4. Setup Router
	r := gin.Default()

	// CORS Config
	r.Use(cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposedHeaders:   []string{"Content-Length"},
		AllowCredentials: true,
	}))

	api := r.Group("/api/v1")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", userHandler.Register)
			auth.POST("/login", userHandler.Login)
		}

		users := api.Group("/users")
		{
			users.POST("", userHandler.CreateUser)
			users.GET("", userHandler.ListUsers)
			users.GET("/:id", userHandler.GetUser)
			users.PUT("/:id/profile", userHandler.UpdateProfile)
		}

		api.GET("/posts/wall", postHandler.GetWall)
	}

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// 5. Start Server
	fmt.Printf("Server starting on port %s\n", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		fmt.Println("Failed to start server:", err)
	}
}
