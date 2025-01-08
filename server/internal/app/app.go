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
)

type App struct {
	db     *sqlx.DB
	app    *fiber.App
	config *model.AppConfig
	handler *handler.Handler
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
	buildings := api.Group("/buildings")
	parking_warning := api.Group("/carparks")
	rooms := api.Group("/rooms")
	tables := api.Group("/tables")
	toilets := api.Group("/toilets")

	// Get All Data Methods
	buildings.Get("/", a.handler.HandleGetBuildings)
	parking_warning.Get("/", a.handler.HandleGetParkingWarningLicensePlates)
	rooms.Get("/", a.handler.HandleGetRooms)
	tables.Get("/", a.handler.HandleGetTables)
	toilets.Get("/", a.handler.HandleGetToilets)

	// Get Specific Data Methods
	buildings.Get("/:id", a.handler.HandleGetBuildingByID)
	parking_warning.Get("/:license_plate", a.handler.HandleGetParkingWarningByLicensePlate)
	rooms.Get("/:id", a.handler.HandleGetRoomByID)
	tables.Get("/:id", a.handler.HandleGetTableByID)
	toilets.Get("/:id", a.handler.HandleGetToiletByID)

	// Post Methods
	buildings.Post("/", a.handler.HandleCreateBuilding)
	rooms.Post("/", a.handler.HandleCreateRoom)
	tables.Post("/", a.handler.HandleCreateTable)
	toilets.Post("/", a.handler.HandleCreateToilet)
	parking_warning.Post("/", a.handler.HandleCreateParkingWarningLicensePlate)

	// Put Methods
	buildings.Put("/:id", a.handler.HandleUpdateBuilding)
	rooms.Put("/:id", a.handler.HandleUpdateRoom)
	tables.Put("/:id", a.handler.HandleUpdateTable)
	parking_warning.Put("/:license_plate", a.handler.HandleUpdateAmountOfWarnings)

	// Delete Methods
	buildings.Delete("/:id", a.handler.HandleDeleteBuilding)
	rooms.Delete("/:id", a.handler.HandleDeleteRoom)
	tables.Delete("/:id", a.handler.HandleDeleteTable)
	toilets.Delete("/:id", a.handler.HandlerDeleteToilet)
	parking_warning.Delete("/:license_plate", a.handler.HandleDeleteLicensePlate)
}

func (a *App) Start() error {
	a.setupRoutes()
	addr := fmt.Sprintf("%s:%d", a.config.ServerConfig.Host, a.config.ServerConfig.Port)
	return a.app.Listen(addr)
}
