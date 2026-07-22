package handlers

import (
	"os"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"

	"gbit-backend/internal/database"
	"gbit-backend/internal/models"
	"gbit-backend/internal/utils"
)

type registerInput struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type loginInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type refreshInput struct {
	RefreshToken string `json:"refreshToken"`
}

func Register(c *fiber.Ctx) error {
	var input registerInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Dados inválidos."})
	}

	if input.Name == "" || input.Email == "" || input.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Nome, email e senha são obrigatórios."})
	}

	var existing models.User
	if err := database.DB.Where("email = ?", input.Email).First(&existing).Error; err == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "Este email já está em uso."})
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Erro ao processar a senha."})
	}

	user := models.User{Name: input.Name, Email: input.Email, Password: string(hashed)}
	if err := database.DB.Create(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Erro ao criar usuário."})
	}

	tokens, err := utils.GenerateTokens(user.ID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Erro ao gerar tokens."})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"user":         fiber.Map{"id": user.ID, "name": user.Name, "email": user.Email},
		"accessToken":  tokens.AccessToken,
		"refreshToken": tokens.RefreshToken,
	})
}

func Login(c *fiber.Ctx) error {
	var input loginInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Dados inválidos."})
	}

	var user models.User
	if err := database.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Email ou senha inválidos."})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Email ou senha inválidos."})
	}

	tokens, err := utils.GenerateTokens(user.ID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Erro ao gerar tokens."})
	}

	return c.JSON(fiber.Map{
		"user":         fiber.Map{"id": user.ID, "name": user.Name, "email": user.Email},
		"accessToken":  tokens.AccessToken,
		"refreshToken": tokens.RefreshToken,
	})
}

func Refresh(c *fiber.Ctx) error {
	var input refreshInput
	if err := c.BodyParser(&input); err != nil || input.RefreshToken == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Refresh token não fornecido."})
	}

	userId, err := utils.VerifyToken(input.RefreshToken, os.Getenv("JWT_REFRESH_SECRET"))
	if err != nil || userId == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Refresh token inválido ou expirado."})
	}

	tokens, err := utils.GenerateTokens(userId)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Erro ao gerar tokens."})
	}

	return c.JSON(tokens)
}

func Me(c *fiber.Ctx) error {
	userId := c.Locals("userId").(string)

	var user models.User
	if err := database.DB.First(&user, "id = ?", userId).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Usuário não encontrado."})
	}

	return c.JSON(fiber.Map{
		"user": fiber.Map{
			"id":        user.ID,
			"name":      user.Name,
			"email":     user.Email,
			"createdAt": user.CreatedAt,
		},
	})
}
