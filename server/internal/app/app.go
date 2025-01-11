// File: internal/app/app.go
package app

import (
	"fmt"
	"server/internal/api/handlers"
	"server/internal/models"
	"server/internal/ws"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/websocket/v2"
	"gorm.io/gorm"
)

type App struct {
	db       *gorm.DB
	app      *fiber.App
	config   *models.AppConfig
	handlers *handlers.Handler
	wsHub    *ws.Hub
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
		AllowOrigins:     strings.Join(cfg.ServerConfig.AllowOrigins, ","),
		AllowMethods:     "GET,POST,HEAD,PUT,DELETE,PATCH",
		AllowHeaders:     "Origin, Content-Type, Accept",
		ExposeHeaders:    "Content-Length",
		AllowCredentials: false,
		MaxAge:           300,
	}))

	app.Use(logger.New())
	app.Use(recover.New())

	wsHub := ws.NewHub()
	go wsHub.Run()
	handlers := handlers.NewHandler(db, wsHub)

	return &App{
		app:      app,
		db:       db,
		config:   cfg,
		handlers: handlers,
		wsHub:    wsHub,
	}
}

func (a *App) setupRoutes() {
	api := a.app.Group("/api")

	api.Use("/ws", func(c *fiber.Ctx) error {
		origin := c.Get("Origin")
		allowed := false
		for _, allowedOrigin := range a.config.ServerConfig.AllowOrigins {
			if origin == allowedOrigin {
				allowed = true
				break
			}
		}
		if !allowed {
			return fiber.ErrForbidden
		}

		if websocket.IsWebSocketUpgrade(c) {
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})
	api.Get("/ws", ws.HandleWebSocket(a.wsHub))

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
	items.Post("/table", a.handlers.CreateTable)
	items.Post("/toilet", a.handlers.CreateToilet)
	items.Put("/available/:id", a.handlers.UpdateItemAvailable)
	items.Delete("/:id", a.handlers.DeleteItem)

	// Booking Time Period Routes
	bookingTimePeriods := api.Group("/booking-time-periods")
	bookingTimePeriods.Get("/", a.handlers.GetListBookingTimePeriods)
	bookingTimePeriods.Get("/items", a.handlers.GetBookingTimePeriodsByItemType)

	// Options Routes

}

func (a *App) Start() error {
	a.setupRoutes()
	addr := fmt.Sprintf("%s:%d", a.config.ServerConfig.Host, a.config.ServerConfig.Port)
	return a.app.Listen(addr)
}
