// internal/mqtt/handler.go
package mqtt

import (
    "encoding/json"
    "fmt"
    "log"
    "os"
    "path/filepath"
    "server/internal/models"
    "strings"
    "time"
    mqtt "github.com/eclipse/paho.mqtt.golang"
)

type TableStatus struct {
    Camera        string `json:"camera"`
    TableOccupied bool   `json:"table_occupied"`
}

func (m *Client) SubscribeToTopics() error {
    // Subscribe to both topics with the same handler
    if token := m.client.Subscribe("table/#", 0, m.handleTableStatus); token.Wait() && token.Error() != nil {
        return fmt.Errorf("error subscribing to table topic: %v", token.Error())
    }

    if token := m.client.Subscribe("LeftObject/table/#", 0, m.handleTableStatus); token.Wait() && token.Error() != nil {
        return fmt.Errorf("error subscribing to left object topic: %v", token.Error())
    }

    log.Printf("✅ Successfully subscribed to MQTT topics")
    return nil
}

func (m *Client) handleTableStatus(client mqtt.Client, msg mqtt.Message) {
    log.Printf("📥 Received MQTT message:")
    log.Printf("  Topic: %s", msg.Topic())
    log.Printf("  Payload: %s", string(msg.Payload()))

    // Determine if this is a left object or table occupancy message
    isLeftObject := strings.HasPrefix(msg.Topic(), "LeftObject/table/")

    // Parse topic to get building_id, room_id, and item_id
    topicParts := strings.Split(msg.Topic(), "/")
    if len(topicParts) < 4 {
        log.Printf("❌ Invalid topic format: %s", msg.Topic())
        return
    }

    var buildingID, roomID, itemID string
    if isLeftObject {
        buildingID = topicParts[2]
        roomID = topicParts[3]
        itemID = topicParts[4]
    } else {
        buildingID = topicParts[1]
        roomID = topicParts[2]
        itemID = topicParts[3]
    }

    log.Printf("  Building ID: %s", buildingID)
    log.Printf("  Room ID: %s", roomID)
    log.Printf("  Item ID: %s", itemID)

    tx := m.db.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
        }
    }()

    // Find the item directly using item_id
    var item models.Item
    if err := tx.Where("item_id = ? AND room_id = ? AND type = ?",
        itemID, roomID, models.ItemTypeTable).
        First(&item).Error; err != nil {
        tx.Rollback()
        log.Printf("❌ Error finding table: %v", err)
        return
    }

    // Get building and room info for logs and records
    var buildingData models.Building
    if err := tx.Where("building_id = ?", buildingID).First(&buildingData).Error; err != nil {
        tx.Rollback()
        log.Printf("❌ Error finding building: %v", err)
        return
    }

    var roomData models.Room
    if err := tx.Where("room_id = ?", roomID).First(&roomData).Error; err != nil {
        tx.Rollback()
        log.Printf("❌ Error finding room: %v", err)
        return
    }

    now := time.Now()

    if isLeftObject {
        // For left object detection, create a forgot item record
        forgotItemID := fmt.Sprintf("FORGOT-%s-%s", itemID, now.Format("20060102-150405"))
        
        // Save image if it exists in payload
        filename := fmt.Sprintf("image-table/building-%s/room-%s/table-%s/image_%d.jpg",
            buildingID, roomID, itemID, now.UnixNano())
        if err := os.MkdirAll(filepath.Dir(filename), 0755); err != nil {
            log.Printf("❌ Error creating directory: %v", err)
            return
        }
        if err := os.WriteFile(filename, msg.Payload(), 0644); err != nil {
            log.Printf("❌ Error saving image: %v", err)
            return
        }

        forgotItem := &models.ForgotItem{
            ID:           forgotItemID,
            ImageURL:     filename,
            Date:         now,
            TableID:      itemID,
            BuildingName: buildingData.BuildingName,
            RoomName:     roomData.RoomName,
        }

        if err := tx.Create(forgotItem).Error; err != nil {
            tx.Rollback()
            log.Printf("❌ Error creating forgot item record: %v", err)
            return
        }
        log.Printf("✅ Created forgot item record: %s", forgotItemID)

    } else {
        // For table occupancy updates
        var status TableStatus
        if err := json.Unmarshal(msg.Payload(), &status); err != nil {
            tx.Rollback()
            log.Printf("❌ Error parsing table status: %v", err)
            return
        }

        available := !status.TableOccupied

        if available {
            // End current booking
            if err := tx.Model(&models.BookingTimePeriod{}).
                Where("item_id = ? AND ended_booking_time IS NULL", itemID).
                Update("ended_booking_time", now).Error; err != nil {
                tx.Rollback()
                log.Printf("❌ Error updating booking end time: %v", err)
                return
            }
            log.Printf("✅ Updated existing booking end time")
        } else {
            // Create new booking
            bookingID := fmt.Sprintf("KMUTT-%s-XX%s", now.Format("20060102-150405"), itemID)
            newBooking := &models.BookingTimePeriod{
                BookingTimePeriodID: bookingID,
                ItemID:             itemID,
                PhoneNumber:        "system",
                StartedBookingTime: now,
            }

            if err := tx.Create(newBooking).Error; err != nil {
                tx.Rollback()
                log.Printf("❌ Error creating new booking: %v", err)
                return
            }
            log.Printf("✅ Created new booking: %s", bookingID)
        }

        // Update item availability
        if err := tx.Model(&item).Update("available", available).Error; err != nil {
            tx.Rollback()
            log.Printf("❌ Error updating item availability: %v", err)
            return
        }
    }

    if err := tx.Commit().Error; err != nil {
        log.Printf("❌ Error committing transaction: %v", err)
        return
    }

    // Broadcast update through WebSocket
    if isLeftObject {
        m.hub.BroadcastLeftObject(buildingID, roomID, item.Name, fmt.Sprintf("%d.jpg", now.UnixNano()))
        log.Printf("✅ Successfully processed left object and broadcasted update")
    } else {
        m.hub.BroadcastTableUpdate(msg.Topic(), string(msg.Payload()))
        log.Printf("✅ Successfully updated table status and broadcasted update")
    }
    log.Printf("  Table ID: %s", itemID)
}

func (m *Client) Disconnect() {
    if m.client.IsConnected() {
        m.client.Disconnect(250)
    }
}