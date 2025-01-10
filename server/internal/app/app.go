// File: internal/app/app.go
package app

import (
	"fmt"
	"server/internal/api/handlers"
	"server/internal/models"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"gorm.io/gorm"
)

type App struct {
	db      *gorm.DB
	app     *fiber.App
	config  *models.AppConfig
	handlers *handlers.Handler
}

func NewApp(db *gorm.DB, cfg *models.AppConfig) *App {
	app := fiber.New(
		fiber.Config{
			ReadTimeout:  cfg.ServerConfig.ReadTimeout,
			WriteTimeout: cfg.ServerConfig.WriteTimeout,
			IdleTimeout:  cfg.ServerConfig.Timeout,
		},
	)

	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))
	app.Use(logger.New())
	app.Use(recover.New())

	handlers := handlers.NewHandler(db)

	return &App{
		app:     app,
		db:      db,
		config:  cfg,
		handlers: handlers,
	}
}

func (a *App) setupRoutes() {
	api := a.app.Group("/api")	

	// Buildings Routes
	buildings := api.Group("/buildings")
	buildings.Get("/", a.handlers.GetListBuildings)
	buildings.Get("/:id", a.handlers.GetBuilding)
	buildings.Post("/", a.handlers.CreateBuilding)
	buildings.Put("/:id", a.handlers.UpdateBuilding)
	buildings.Delete("/:id", a.handlers.DeleteBuilding)

	// Rooms Routes
	rooms := api.Group("/rooms")
	rooms.Get("/", a.handlers.GetListRooms)
	rooms.Get("/:id", a.handlers.GetRoom)
	rooms.Post("/", a.handlers.CreateRoom)
	rooms.Put("/:id", a.handlers.UpdateRoom)
	rooms.Delete("/:id", a.handlers.DeleteRoom)

	// Item Routes
	items := api.Group("/items")
	items.Get("/", a.handlers.GetListItems)
	items.Get("/tables/:id", a.handlers.GetTable)
	items.Get("/toilets/:id", a.handlers.GetToilet)
	items.Post("/table", a.handlers.CreateTable)
	items.Post("/toilet", a.handlers.CreateToilet)
	items.Put("/available/:id", a.handlers.UpdateItemAvailable)

	// Booking Time Period Routes
	bookingTimePeriods := api.Group("/booking-time-periods")
	bookingTimePeriods.Get("/", a.handlers.GetListBookingTimePeriods)
	bookingTimePeriods.Get("/items", a.handlers.GetBookingTimePeriodsByItemType)

	
}

func (a *App) Start() error {
    a.setupRoutes()
    addr := fmt.Sprintf("%s:%d", a.config.ServerConfig.Host, a.config.ServerConfig.Port)
    return a.app.Listen(addr)
}