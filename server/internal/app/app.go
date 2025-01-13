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
	"github.com/gofiber/websocket/v2"
	"gorm.io/gorm"
	"server/mqtt"
	"log"
)

type App struct {
	db       *gorm.DB
	app      *fiber.App
	config   *models.AppConfig
	handlers *handlers.Handler
	wsHub    *ws.Hub
	mqttClient *mqtt.Client
}

func NewApp(db *gorm.DB, cfg *models.AppConfig) *App {
	app := fiber.New(fiber.Config{
		ReadTimeout:  cfg.ServerConfig.ReadTimeout,
		WriteTimeout: cfg.ServerConfig.WriteTimeout,
		IdleTimeout:  cfg.ServerConfig.Timeout,
	})


	app.Use(cors.New(cors.Config{
		AllowOrigins:     strings.Join(cfg.ServerConfig.AllowOrigins, ","),
		AllowMethods:     "GET,POST,HEAD,PUT,DELETE,PATCH",
		AllowHeaders:     "Origin, Content-Type, Accept",
		ExposeHeaders:    "Content-Length",
		AllowCredentials: false,
		MaxAge:           300,
	}))

	app.Use(logger.New())

	wsHub := ws.NewHub()
	go wsHub.Run()

	mqttClient, err := mqtt.NewMQTTClient(cfg, wsHub, db)
    if err != nil {
        log.Printf("Failed to initialize MQTT client: %v", err)
    } else {
        log.Printf("Successfully initialized MQTT client")
        if err := mqttClient.SubscribeToTopics(); err != nil {
            log.Printf("Failed to subscribe to MQTT topics: %v", err)
        } else {
            log.Printf("Successfully subscribed to MQTT topics")
        }
    }

	handlers := handlers.NewHandler(db, wsHub)

	return &App{
		app:      app,
		db:       db,
		config:   cfg,
		handlers: handlers,
		wsHub:    wsHub,
		mqttClient: mqttClient,
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
	buildings.Get("/", a.handlers.FindAllBuildings)                // get all
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
	// rooms.Get("/", a.handlers.FindAllRooms)
	rooms.Get("/building/:buildingId", a.handlers.FindAllRoomByBuildingId)

	// Item Routes
	items := api.Group("/items")
	items.Put("/:id", a.handlers.UpdateItemAvailable) // update item available ✅
	items.Delete("/:id", a.handlers.DeleteItem)       // update item available ✅

	// Table Routes
	tables := api.Group("/tables")
	tables.Get("/", a.handlers.FindAllTables)                  // ✅
	tables.Get("/room/:roomId", a.handlers.FindTablesByRoomId) // ✅
	tables.Get("/:id", a.handlers.FindTableByID)               // ✅
	tables.Post("/", a.handlers.CreateTable)                   // create table
	tables.Put("/:id", a.handlers.UpdateTable)                 // update table

	// Toilets Routes
	toilets := api.Group("/toilets")                             // ✅
	toilets.Get("/", a.handlers.FindAllToilets)                  // get all toilets ✅
	toilets.Get("/room/:roomId", a.handlers.FindToiletsByRoomId) // ✅
	toilets.Get("/:id", a.handlers.FindToiletByID)               // get table by idkeyword ✅
	toilets.Post("/", a.handlers.CreateToilet)                   // create toilet ✅
	toilets.Put("/:id", a.handlers.UpdateToilet)                 // update toilet ✅

	// History Routes
	histories := api.Group("/histories")                             // ✅
	histories.Get("/:roomId", a.handlers.FindAllHistoryItemByRoomId) // ✅
	histories.Get("/id/:id", a.handlers.FindHistoryById)             // ✅
	histories.Get("/item/:itemId", a.handlers.FindHistoryByItemId)   // ✅
	histories.Post("/", a.handlers.CreateHistory)                    // ✅
	histories.Put("/:id", a.handlers.UpdateHistory)                  // ✅
	histories.Delete("/:id", a.handlers.DeleteHistory)               // ✅

	// Device Routes
	devices := api.Group("/devices")                           // ✅
	devices.Get("/", a.handlers.FindAllDevices)                // ✅
	devices.Get("/search", a.handlers.FindDevicesByKeyword)    // ✅
	devices.Get("/topic/:topic", a.handlers.FindDeviceByTopic) // ✅
	devices.Get("/:id", a.handlers.FindDeviceById)             // ✅
	devices.Post("/", a.handlers.CreateDevice)                 // ✅
	devices.Put("/:id", a.handlers.UpdateDevice)               // ✅
	devices.Delete("/:id", a.handlers.DeleteDevice)            // ✅

	// Forgot Items Routes
	forgotItems := api.Group("/forgot-items")                             // ✅
	forgotItems.Get("/", a.handlers.FindAllForgotItems)                   // ✅
	forgotItems.Get("/date-range", a.handlers.FindForgotItemsByDateRange) // ✅
	forgotItems.Get("/:id", a.handlers.FindForgotItemById)                // ✅
	forgotItems.Post("/", a.handlers.CreateForgotItem)                    // ✅
	forgotItems.Put("/:id", a.handlers.UpdateForgotItem)                  // ✅
	forgotItems.Delete("/:id", a.handlers.DeleteForgotItem)               // ✅


	// Camera Routes
	cameras := api.Group("/camera-info")
	cameras.Get("/", a.handlers.GetCameraInfo) // get camera info ✅

}

func (a *App) Start() error {
    a.setupRoutes()

    if a.mqttClient != nil {
        defer a.mqttClient.Disconnect()
    }
    
    addr := fmt.Sprintf("%s:%d", a.config.ServerConfig.Host, a.config.ServerConfig.Port)
    fmt.Printf("Starting server on %s\n", addr)

    return a.app.Listen(addr)
}