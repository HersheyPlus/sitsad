// File: internal/app/app.go
package app

import (
	"fmt"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/jmoiron/sqlx"
	"server/internal/api/handler"
	"server/internal/model"
	"github.com/gofiber/websocket/v2"
	"server/internal/ws"
)

type App struct {
	db     *sqlx.DB
	app    *fiber.App
	config *model.AppConfig
	handler *handler.Handler
	hub     *ws.Hub
}

func NewApp(db *sqlx.DB, cfg *model.AppConfig) *App {
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

	hub := ws.NewHub()
	handler := handler.NewHandler(db, hub)

	return &App{
		app:     app,
		db:      db,
		config:  cfg,
		handler: handler,
		hub:     hub,
	}
}

func (a *App) setupRoutes() {
	api := a.app.Group("/api")
	buildings := api.Group("/buildings")
	parking_warning := api.Group("/carparks")
	rooms := api.Group("/rooms")
	tables := api.Group("/tables")
	toilets := api.Group("/toilets")

	// Buildings Routes
	buildings.Get("/", a.handler.HandleGetBuildings)
	buildings.Get("/:id", a.handler.HandleGetBuildingByID)
	buildings.Post("/", a.handler.HandleCreateBuilding)
	buildings.Put("/:id", a.handler.HandleUpdateBuilding)
	buildings.Delete("/:id", a.handler.HandleDeleteBuilding)

	// Rooms Routes
	rooms.Get("/", a.handler.HandleGetRooms)
	rooms.Get("/:id", a.handler.HandleGetRoomByID)
	rooms.Post("/", a.handler.HandleCreateRoom)
	rooms.Delete("/:id", a.handler.HandleDeleteRoom)
	rooms.Put("/:id", a.handler.HandleUpdateRoom)

	// Tables Routes
	tables.Get("/", a.handler.HandleGetTables)
	tables.Get("/:id", a.handler.HandleGetTableByID)
	tables.Post("/", a.handler.HandleCreateTable)
	tables.Put("/:id", a.handler.HandleUpdateIsFreeTable)
	tables.Put("/position/:id", a.handler.HandleUpdatePositionTable)
	tables.Delete("/:id", a.handler.HandleDeleteTable)

	// Toilets Routes
	a.app.Use("/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})
	a.app.Get("/ws/toilets", websocket.New(a.handler.HandleToiletWebSocket))

	toilets.Get("/", a.handler.HandleGetToilets)
	toilets.Get("/:id", a.handler.HandleGetToiletByID)
	toilets.Post("/", a.handler.HandleCreateToilet)
	toilets.Delete("/:id", a.handler.HandlerDeleteToilet)
	toilets.Put("/:id", a.handler.HandlerUpdateIsFreeToilet)

	// Parking Warning Methods
	parking_warning.Get("/:license_plate", a.handler.HandleGetParkingWarningByLicensePlate)
	parking_warning.Get("/", a.handler.HandleGetParkingWarningLicensePlates)
	parking_warning.Post("/", a.handler.HandleCreateParkingWarningLicensePlate)
	parking_warning.Put("/:license_plate", a.handler.HandleUpdateAmountOfWarnings)
	parking_warning.Delete("/:license_plate", a.handler.HandleDeleteLicensePlate)
}

func (a *App) Start() error {
    a.setupRoutes()
    addr := fmt.Sprintf("%s:%d", a.config.ServerConfig.Host, a.config.ServerConfig.Port)
    return a.app.Listen(addr)
}