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
	buildings.Get("/search", a.handlers.FindAllBuildingByItemType) // ✅
	buildings.Get("/:id", a.handlers.FindBuildingById)             // get by id ✅
	buildings.Post("/", a.handlers.CreateBuilding)                 // create ✅
	buildings.Put("/:id", a.handlers.UpdateBuilding)               // update ✅
	buildings.Delete("/:id", a.handlers.DeleteBuilding)            // delete ✅

	// Rooms Routes
	rooms := api.Group("/rooms")
	rooms.Get("/search", a.handlers.FindRoomsBySearchParams) // get all ✅
	rooms.Get("/:id", a.handlers.FindRoomById)               // get by id ✅
	rooms.Post("/", a.handlers.CreateRoom)                   // create ✅
	rooms.Put("/:id", a.handlers.UpdateRoom)                 // update ✅
	rooms.Delete("/:id", a.handlers.DeleteRoom)              // delete ✅

	// Item Routes
	items := api.Group("/items")
	items.Put("/:id", a.handlers.UpdateItemAvailable) // update item available ✅
	items.Delete("/:id", a.handlers.DeleteItem)       // update item available ✅

	// Table Routes
	tables := api.Group("/tables")
	tables.Get("/", a.handlers.FindAllTables)
	tables.Get("/room/:roomId", a.handlers.FindTablesByRoomId)
	tables.Get("/:id", a.handlers.FindTableByID)

	tables.Post("/", a.handlers.CreateTable)   // create table
	tables.Put("/:id", a.handlers.UpdateTable) // update table

	// Toilets Routes
	toilets := api.Group("/toilets")
	toilets.Get("/", a.handlers.FindAllToilets) // get all toilets
	toilets.Get("/room/:roomId", a.handlers.FindToiletsByRoomId)
	toilets.Get("/:id", a.handlers.FindToiletByID) // get table by idkeyword
	toilets.Post("/", a.handlers.CreateToilet)     // create toilet
	toilets.Put("/:id", a.handlers.UpdateToilet)   // update toilet

	// Filter Routes
	filter := api.Group("/filter")
	filter.Get("/items", a.handlers.FindBuildingByItemType)
	filter.Get("/rooms", a.handlers.FindRoomsByBuildingID)

}

func (a *App) Start() error {
	a.setupRoutes()
	addr := fmt.Sprintf("%s:%d", a.config.ServerConfig.Host, a.config.ServerConfig.Port)
	return a.app.Listen(addr)
}
