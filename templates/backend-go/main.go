package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"

	"gbit-backend/internal/database"
	"gbit-backend/internal/handlers"
	"gbit-backend/internal/middleware"
)

func main() {
	_ = godotenv.Load()

	database.Connect()

	app := fiber.New()
	app.Use(cors.New())

	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "message": "GBIT backend (Go) rodando 🚀"})
	})

	auth := app.Group("/api/auth")
	auth.Post("/register", handlers.Register)
	auth.Post("/login", handlers.Login)
	auth.Post("/refresh", handlers.Refresh)
	auth.Get("/me", middleware.RequireAuth, handlers.Me)

	port := os.Getenv("PORT")
	if port == "" {
		port = "4000"
	}

	log.Printf("Server rodando em http://localhost:%s", port)
	log.Fatal(app.Listen(":" + port))
}
