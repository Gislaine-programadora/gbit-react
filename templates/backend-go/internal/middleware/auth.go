package middleware

import (
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"

	"gbit-backend/internal/utils"
)

func RequireAuth(c *fiber.Ctx) error {
	authHeader := c.Get("Authorization")

	if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Token não fornecido."})
	}

	token := strings.TrimPrefix(authHeader, "Bearer ")

	userId, err := utils.VerifyToken(token, os.Getenv("JWT_SECRET"))
	if err != nil || userId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Token inválido ou expirado."})
	}

	c.Locals("userId", userId)
	return c.Next()
}
