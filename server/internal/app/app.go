// File: internal/app/app.go
package app

import (
	"fmt"
	"server/internal/api/handler"
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
	handler *handler.Handler
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

	handler := handler.NewHandler(db)

	return &App{
		app:     app,
		db:      db,
		config:  cfg,
		handler: handler,
	}
}

func (a *App) setupRoutes() {
	api := a.app.Group("/api")	

	// Buildings Routes
	buildings := api.Group("/buildings")
	buildings.Get("/", a.handler.GetListBuildings)
	buildings.Get("/:id", a.handler.GetBuilding)
	buildings.Post("/", a.handler.CreateBuilding)
	buildings.Put("/:id", a.handler.UpdateBuilding)
	buildings.Delete("/:id", a.handler.DeleteBuilding)

	// Rooms Routes
	rooms := api.Group("/rooms")
	rooms.Get("/", a.handler.GetListRooms)
	rooms.Get("/:id", a.handler.GetRoom)
	rooms.Post("/", a.handler.CreateRoom)
	rooms.Put("/:id", a.handler.UpdateRoom)
	rooms.Delete("/:id", a.handler.DeleteRoom)

	// Item Routes
	items := api.Group("/items")
	items.Get("/", a.handler.GetListItems)
	items.Get("/tables/:id", a.handler.GetTable)
	items.Get("/toilets/:id", a.handler.GetToilet)
	items.Post("/table", a.handler.CreateTable)
	items.Post("/toilet", a.handler.CreateToilet)
	items.Put("/available/:id", a.handler.UpdateItemAvailable)

	// Booking Time Period Routes
	bookingTimePeriods := api.Group("/booking-time-periods")
	bookingTimePeriods.Get("/", a.handler.GetListBookingTimePeriods)
	bookingTimePeriods.Get("/items", a.handler.GetBookingTimePeriodsByItemType)

	
}

func (a *App) Start() error {
    a.setupRoutes()
    addr := fmt.Sprintf("%s:%d", a.config.ServerConfig.Host, a.config.ServerConfig.Port)
    return a.app.Listen(addr)
}