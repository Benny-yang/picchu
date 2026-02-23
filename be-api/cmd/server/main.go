package main

import (
	"azure-magnetar/config"
	"azure-magnetar/internal/handler"
	"azure-magnetar/internal/middleware"
	"azure-magnetar/internal/model"
	"azure-magnetar/internal/repository"
	"azure-magnetar/internal/service"
	"azure-magnetar/pkg/database"
	"azure-magnetar/pkg/logger"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	cors "github.com/rs/cors/wrapper/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	_ "azure-magnetar/docs"

	_ "github.com/go-sql-driver/mysql"
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

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization

func main() {
	// Load .env file (ignore error if not found, e.g. in production)
	_ = godotenv.Load()

	// 1. Load Configuration
	cfg := config.LoadConfig()

	// 2. Initialize Database
	database.InitDB(cfg.DataSourceName)
	migrateDatabase()

	// 3. Setup Dependencies (Repositories → Services → Handlers)
	repos := initRepositories()
	services := initServices(repos, cfg)
	handlers := initHandlers(services)

	// 4. Setup Router
	r := setupRouter(cfg, handlers)

	// 5. Start Server
	logger.Info("server starting", "port", cfg.Port)
	if err := r.Run("0.0.0.0:" + cfg.Port); err != nil {
		logger.Error("failed to start server", "error", err)
	}
}

// --- Dependency Containers ---

type repositories struct {
	user         repository.UserRepository
	follow       repository.FollowRepository
	activity     repository.ActivityRepository
	work         repository.WorkRepository
	comment      repository.CommentRepository
	like         repository.LikeRepository
	rating       repository.RatingRepository
	notification repository.NotificationRepository
}

type services struct {
	user         service.UserService
	follow       service.FollowService
	activity     service.ActivityService
	work         service.WorkService
	comment      service.CommentService
	like         service.LikeService
	rating       service.RatingService
	notification service.NotificationService
}

type handlers struct {
	user         *handler.UserHandler
	follow       *handler.FollowHandler
	activity     *handler.ActivityHandler
	work         *handler.WorkHandler
	comment      *handler.CommentHandler
	notification *handler.NotificationHandler
}

// --- Initialization ---

func migrateDatabase() {
	if err := database.DB.AutoMigrate(
		&model.User{},
		&model.UserProfile{},
		&model.Post{},
		&model.Follow{},
		&model.Activity{},
		&model.ActivityParticipant{},
		&model.Comment{},
		&model.Like{},
		&model.Notification{},
		&model.Rating{},
		&model.Tag{},
	); err != nil {
		logger.Error("failed to migrate database", "error", err)
		return
	}
}

func initRepositories() *repositories {
	db := database.DB
	return &repositories{
		user:         repository.NewUserRepository(db),
		follow:       repository.NewFollowRepository(db),
		activity:     repository.NewActivityRepository(db),
		work:         repository.NewWorkRepository(db),
		comment:      repository.NewCommentRepository(db),
		like:         repository.NewLikeRepository(db),
		rating:       repository.NewRatingRepository(db),
		notification: repository.NewNotificationRepository(db),
	}
}

func initServices(repos *repositories, cfg *config.Config) *services {
	return &services{
		user:         service.NewUserService(repos.user, repos.follow, repos.rating, cfg.APIBaseURL, cfg.FrontendURL, cfg.GCSBucketName),
		follow:       service.NewFollowService(repos.follow, repos.rating, service.NewNotificationService(repos.notification)),
		activity:     service.NewActivityService(repos.activity, repos.comment, repos.rating, cfg.APIBaseURL, cfg.GCSBucketName, service.NewNotificationService(repos.notification)),
		work:         service.NewWorkService(repos.work, cfg.APIBaseURL, cfg.GCSBucketName),
		comment:      service.NewCommentService(repos.comment, repos.work, repos.activity, repos.rating, service.NewNotificationService(repos.notification)),
		like:         service.NewLikeService(repos.like, repos.work, service.NewNotificationService(repos.notification)),
		rating:       service.NewRatingService(repos.rating, repos.activity),
		notification: service.NewNotificationService(repos.notification),
	}
}

func initHandlers(svc *services) *handlers {
	return &handlers{
		user:         handler.NewUserHandler(svc.user, svc.follow, svc.work, svc.activity, svc.rating),
		follow:       handler.NewFollowHandler(svc.follow),
		activity:     handler.NewActivityHandler(svc.activity, svc.comment, svc.rating),
		work:         handler.NewWorkHandler(svc.work, svc.like, svc.comment, svc.rating),
		comment:      handler.NewCommentHandler(svc.comment),
		notification: handler.NewNotificationHandler(svc.notification),
	}
}

// --- Router Setup ---

func setupRouter(cfg *config.Config, h *handlers) *gin.Engine {
	r := gin.New()
	r.Use(gin.Logger(), middleware.Recovery())

	// CORS
	r.Use(cors.New(cors.Options{
		AllowedOrigins:   []string{"*"}, // Allow all origins for dev
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposedHeaders:   []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Serve uploaded files
	r.Static("/uploads", "./uploads")

	api := r.Group("/api/v1")
	authMiddleware := middleware.AuthRequired(cfg.JWTSecret)
	authOptional := middleware.AuthOptional(cfg.JWTSecret)

	// --- Auth (Public) ---
	auth := api.Group("/auth")
	{
		auth.POST("/register", h.user.Register)
		auth.POST("/login", h.user.Login)
		auth.POST("/forgot-password", h.user.ForgotPassword)
		auth.POST("/reset-password", h.user.ResetPassword)
		auth.GET("/verify", h.user.VerifyEmail)
		auth.POST("/resend-verification", h.user.ResendVerification)
	}

	// --- Users ---
	users := api.Group("/users")
	{
		// Authenticated
		users.GET("/me", authMiddleware, h.user.GetMe)
		users.PUT("/me", authMiddleware, h.user.UpdateMe)
		users.GET("/me/applications", authMiddleware, h.user.GetMyApplications)

		// Public
		users.GET("/:id", h.user.GetUser)
		users.GET("/:id/works", h.user.GetUserWorks)
		users.GET("/:id/activities", h.user.GetUserActivities)
		users.GET("/:id/reviews", h.user.GetUserReviews)

		// Follow (Authenticated)
		users.POST("/:id/follow", authMiddleware, h.follow.Follow)
		users.DELETE("/:id/follow", authMiddleware, h.follow.Unfollow)
		users.GET("/:id/follow", authMiddleware, h.follow.CheckStatus)
		users.GET("/:id/followers", h.follow.GetFollowers)
		users.GET("/:id/following", h.follow.GetFollowing)
	}

	// --- Activities ---
	activities := api.Group("/activities")
	{
		// Public
		activities.GET("", h.activity.ListActivities)
		activities.GET("/:id", h.activity.GetActivity)
		activities.GET("/:id/comments", h.activity.GetActivityComments)
		activities.GET("/:id/participants", h.activity.ListParticipants)

		// Authenticated
		activities.POST("", authMiddleware, h.activity.CreateActivity)
		activities.PUT("/:id", authMiddleware, h.activity.UpdateActivity)
		activities.DELETE("/:id", authMiddleware, h.activity.DeleteActivity)
		activities.POST("/:id/cancel", authMiddleware, h.activity.CancelActivity)

		// Participation
		activities.POST("/:id/apply", authMiddleware, h.activity.ApplyToActivity)
		activities.DELETE("/:id/apply", authMiddleware, h.activity.CancelApplication)
		activities.GET("/:id/status", authMiddleware, h.activity.GetApplicationStatus)

		// Host Management
		activities.GET("/:id/applicants", authMiddleware, h.activity.ListApplicants)
		activities.PUT("/:id/applicants/:userId/status", authMiddleware, h.activity.UpdateApplicantStatus)
		activities.POST("/:id/invite", authMiddleware, h.activity.InviteUser)

		// Comments
		activities.POST("/:id/comments", authMiddleware, h.activity.PostActivityComment)

		// Rating
		activities.POST("/:id/rate", authMiddleware, h.activity.SubmitRating)
		activities.GET("/:id/ratings", authMiddleware, h.activity.GetActivityRatings)
	}

	// --- Works ---
	works := api.Group("/works")
	{
		// Public (with optional auth for following feed)
		works.GET("", authOptional, h.work.GetWall)
		works.GET("/:id", authOptional, h.work.GetWork)
		works.GET("/:id/comments", h.work.GetWorkComments)

		// Authenticated
		works.POST("", authMiddleware, h.work.CreateWork)
		works.PUT("/:id", authMiddleware, h.work.UpdateWork)
		works.DELETE("/:id", authMiddleware, h.work.DeleteWork)

		// Like
		works.POST("/:id/like", authMiddleware, h.work.LikeWork)
		works.DELETE("/:id/like", authMiddleware, h.work.UnlikeWork)

		// Comments
		works.POST("/:id/comments", authMiddleware, h.work.PostWorkComment)
	}

	// --- Comments ---
	comments := api.Group("/comments")
	{
		comments.DELETE("/:id", authMiddleware, h.comment.DeleteComment)
	}

	// --- Notifications ---
	notifications := api.Group("/notifications")
	notifications.Use(authMiddleware)
	{
		notifications.GET("", h.notification.ListNotifications)
		notifications.GET("/unread-count", h.notification.GetUnreadCount)
		notifications.POST("/:id/read", h.notification.MarkAsRead)
	}

	// Swagger
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	return r
}
