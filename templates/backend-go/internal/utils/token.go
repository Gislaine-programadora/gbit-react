package utils

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type Tokens struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
}

func GenerateTokens(userId string) (Tokens, error) {
	accessToken, err := signToken(userId, os.Getenv("JWT_SECRET"), 15*time.Minute)
	if err != nil {
		return Tokens{}, err
	}

	refreshToken, err := signToken(userId, os.Getenv("JWT_REFRESH_SECRET"), 7*24*time.Hour)
	if err != nil {
		return Tokens{}, err
	}

	return Tokens{AccessToken: accessToken, RefreshToken: refreshToken}, nil
}

func signToken(userId string, secret string, duration time.Duration) (string, error) {
	claims := jwt.MapClaims{
		"userId": userId,
		"exp":    time.Now().Add(duration).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func VerifyToken(tokenString string, secret string) (string, error) {
	token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})
	if err != nil || !token.Valid {
		return "", err
	}

	claims := token.Claims.(jwt.MapClaims)
	userId, _ := claims["userId"].(string)
	return userId, nil
}
