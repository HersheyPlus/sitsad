// internal/mqtt/client.go
package mqtt

import (
    "fmt"
    "log"
    mqtt "github.com/eclipse/paho.mqtt.golang"
    "server/internal/models"
    "server/internal/ws"
    "gorm.io/gorm"
)

type Client struct {
    client mqtt.Client
    hub    *ws.Hub
    db     *gorm.DB
}

func NewMQTTClient(cfg *models.AppConfig, hub *ws.Hub, db *gorm.DB) (*Client, error) {
    opts := mqtt.NewClientOptions()
    broker := fmt.Sprintf("tcp://%s:%s", cfg.MQTTConfig.Host, cfg.MQTTConfig.Port)
    opts.AddBroker(broker)
    opts.SetClientID(cfg.MQTTConfig.ClientID)
    opts.SetUsername(cfg.MQTTConfig.Username)
    opts.SetPassword(cfg.MQTTConfig.Password)

    // Add connection logging callbacks
    opts.OnConnect = func(c mqtt.Client) {
        log.Printf("📡 Successfully connected to MQTT broker at %s", broker)
    }
    opts.OnConnectionLost = func(c mqtt.Client, err error) {
        log.Printf("❌ Connection lost to MQTT broker: %v", err)
    }

    client := mqtt.NewClient(opts)
    if token := client.Connect(); token.Wait() && token.Error() != nil {
        return nil, fmt.Errorf("error connecting to MQTT broker: %v", token.Error())
    }

    if !client.IsConnected() {
        return nil, fmt.Errorf("failed to establish MQTT connection")
    }

    log.Printf("✅ MQTT client initialized and connected to broker at %s", broker)

    return &Client{
        client: client,
        hub:    hub,
        db:     db,
    }, nil
}