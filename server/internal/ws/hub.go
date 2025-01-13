package ws

import (
	"encoding/json"
	"log"
	"sync"
	"github.com/gofiber/websocket/v2"
)

type Client struct {
	hub  *Hub
	conn *websocket.Conn
	send chan []byte
}

type Hub struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	mu         sync.RWMutex
}

type ItemAvailabilityUpdate struct {
	ItemID    string  `json:"item_id"`
	Available bool `json:"available"`
	Type      string `json:"type"`
}


type ItemCreationUpdate struct {
    Item interface{} `json:"item"`
    Type string      `json:"type"`
    Action string    `json:"action"`
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()
			log.Printf("Client connected. Total clients: %d", len(h.clients))

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
			h.mu.Unlock()
			log.Printf("Client disconnected. Total clients: %d", len(h.clients))

		case message := <-h.broadcast:
			h.mu.RLock()
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
			h.mu.RUnlock()
		}
	}
}

// In ws/hub.go
func (h *Hub) BroadcastItemUpdate(update ItemAvailabilityUpdate) {
    message, err := json.Marshal(update)
    if err != nil {
        log.Printf("Error marshaling item update: %v", err)
        return
    }

    h.mu.RLock()
    defer h.mu.RUnlock()
    
    for client := range h.clients {
        select {
        case client.send <- message:
            log.Printf("Sent update to client %v", client.conn.RemoteAddr())
        default:
            log.Printf("Failed to send to client %v, removing", client.conn.RemoteAddr())
            h.mu.RUnlock()
            h.mu.Lock()
            delete(h.clients, client)
            close(client.send)
            h.mu.Unlock()
            h.mu.RLock()
        }
    }
}

func (h *Hub) BroadcastNewItem(item interface{}, itemType string) {
    update := ItemCreationUpdate{
        Item: item,
        Type: itemType,
        Action: "create",
    }
    
    message, err := json.Marshal(update)
    if err != nil {
        log.Printf("Error marshaling new item update: %v", err)
        return
    }

    h.broadcast <- message
}

