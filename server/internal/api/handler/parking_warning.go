package handler

import (
	"server/internal/api/res"
	"server/internal/model"
	"github.com/gofiber/fiber/v2"
)


func (h *Handler) HandleGetParkingWarningLicensePlates(c *fiber.Ctx) error {
	carparks := []model.ParkingWarning{}
	err := h.db.Select(&carparks, "SELECT * FROM car_parks")
	if err != nil {
        res := res.NewResponse(false, "Failed to fetch car parks", nil)
        return c.Status(fiber.StatusInternalServerError).JSON(res)
    }
	res := res.NewResponse(true, "Car Parks fetched successfully", carparks)
	return c.Status(fiber.StatusOK).JSON(res)
}

func (h *Handler) HandleGetParkingWarningByLicensePlate(c *fiber.Ctx) error {
	c.Accepts("application/json", "json")
	license_plate := c.Params("license_plate")
	carpark := model.ParkingWarning{}
	err := h.db.Get(&carpark, "SELECT * FROM car_parks WHERE license_plate = ?", license_plate)

	if err != nil {
		res := res.NewResponse(false, "Car Park not found", nil)
		return c.Status(fiber.StatusInternalServerError).JSON(res)
	}
	res := res.NewResponse(true, "Car Park fetched successfully", carpark)
	return c.Status(fiber.StatusOK).JSON(res)
}

func (h *Handler) HandleCreateParkingWarningLicensePlate(c *fiber.Ctx) error {
    carPark := model.ParkingWarning{}
    
    if err := c.BodyParser(&carPark); err != nil {
		res := res.NewResponse(false, "Invalid input", nil)
        return c.Status(fiber.StatusBadRequest).JSON(res)
    }

    var buildingExists bool
    err := h.db.QueryRow("SELECT EXISTS(SELECT 1 FROM buildings WHERE id = ?)", carPark.BuildingID).Scan(&buildingExists)
    if err != nil || !buildingExists {
		res := res.NewResponse(false, "Building does not exist", nil)
        return c.Status(fiber.StatusBadRequest).JSON(res)
    }

    // Check if license plate already exists
    var existingCarPark model.ParkingWarning
    err = h.db.Get(&existingCarPark, "SELECT * FROM car_parks WHERE license_plate = ?", carPark.LicensePlate)
    if err == nil {
		res := res.NewResponse(false, "License plate already registered", nil)
		return c.Status(fiber.StatusConflict).JSON(res)
    }

    // Insert new car park
    insertQuery := `
        INSERT INTO car_parks (building_id, license_plate, amount_of_warnings, created_at, updated_at)
        VALUES (?, ?, 1, NOW(), NOW())
    `
    _, err = h.db.Exec(insertQuery, carPark.BuildingID, carPark.LicensePlate)

    if err != nil {
        res := res.NewResponse(false, "Failed to create license plate ", nil)
        return c.Status(fiber.StatusInternalServerError).JSON(res)
    }

	res := res.NewResponse(true, "License plate created successfully", carPark.LicensePlate)
    return c.Status(fiber.StatusCreated).JSON(res)
}

func (h *Handler) HandleUpdateAmountOfWarnings(c *fiber.Ctx) error {
    license_plate := c.Params("license_plate")
    
    var existingLicensePlate model.ParkingWarning
    err := h.db.Get(&existingLicensePlate, "SELECT * FROM car_parks WHERE license_plate = ?", license_plate)
    if err != nil {
        res := res.NewResponse(false, "License plate not found", nil)
        return c.Status(fiber.StatusNotFound).JSON(res)
    }
    updateQuery := `
        UPDATE car_parks
        SET amount_of_warnings = ?, updated_at = NOW()
        WHERE license_plate = ?
    `
    _, err = h.db.Exec(updateQuery, existingLicensePlate.AmountOfWarnings + 1 ,existingLicensePlate.LicensePlate)

    if err != nil {
        res := res.NewResponse(false, "Failed to update amount of warnings", nil)
        return c.Status(fiber.StatusInternalServerError).JSON(res)
    }

    var updatedCarPark model.ParkingWarning
    err = h.db.Get(&updatedCarPark, "SELECT * FROM car_parks WHERE license_plate = ?", existingLicensePlate.LicensePlate)
    if err != nil {
        res := res.NewResponse(false, "Failed to fetch updated car park", nil)
        return c.Status(fiber.StatusInternalServerError).JSON(res)
    }

    res := res.NewResponse(true, "Amount of warnings park updated successfully", updatedCarPark)
    return c.Status(fiber.StatusOK).JSON(res)
}

func (h *Handler) HandleDeleteLicensePlate(c *fiber.Ctx) error {
    id := c.Params("license_plate")
    _, err := h.db.Exec("DELETE FROM car_parks WHERE license_plate = ?", id)
    if err != nil {
        res := res.NewResponse(false, "Failed to delete car park", nil)
        return c.Status(fiber.StatusInternalServerError).JSON(res)
    }

    res := res.NewResponse(true, "Car park deleted successfully", nil)
    return c.Status(fiber.StatusOK).JSON(res)
}
