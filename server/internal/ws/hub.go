package ws

import (
    "sync"
    "github.com/gofiber/websocket/v2"
)

type Client struct {
    ID   string
    Conn *websocket.Conn
}

type Hub struct {
    Clients    map[string]*Client
    mu         sync.RWMutex
}

func NewHub() *Hub {
    return &Hub{
        Clients: make(map[string]*Client),
    }
}

// Register adds a new client to the hub
func (h *Hub) Register(client *Client) {
    h.mu.Lock()
    defer h.mu.Unlock()
    h.Clients[client.ID] = client
}

// Unregister removes a client from the hub
func (h *Hub) Unregister(clientID string) {
    h.mu.Lock()
    defer h.mu.Unlock()
    if client, ok := h.Clients[clientID]; ok {
        client.Conn.Close()
        delete(h.Clients, clientID)
    }
}

// Broadcast sends a message to all connected clients
func (h *Hub) Broadcast(message []byte) {
    h.mu.RLock()
    defer h.mu.RUnlock()
    
    for _, client := range h.Clients {
        err := client.Conn.WriteMessage(websocket.TextMessage, message)
        if err != nil {
            // If we can't write to a client, remove them
            h.mu.RUnlock()
            h.Unregister(client.ID)
            h.mu.RLock()
        }
    }
}
