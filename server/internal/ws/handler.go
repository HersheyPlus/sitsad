package ws

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"log"
)

func HandleWebSocket(hub *Hub) fiber.Handler {
    return websocket.New(func(c *websocket.Conn) {
        log.Printf("New WebSocket connection established from %s", c.RemoteAddr().String())
        
        client := &Client{
            hub:  hub,
            conn: c,
            send: make(chan []byte, 256),
        }
        
        client.hub.register <- client

        // Start client pumps
        go client.writePump()
        client.readPump()
    })
}