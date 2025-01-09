package handler

import (
	"github.com/jmoiron/sqlx"
	"server/internal/ws"
)

type Handler struct {
	db  *sqlx.DB
	hub *ws.Hub
}

func NewHandler(db *sqlx.DB, hub *ws.Hub) *Handler {
	return &Handler{
		db:  db,
		hub: hub,
	}
}