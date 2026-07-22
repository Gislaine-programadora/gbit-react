package database

import (
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"gbit-backend/internal/models"
)

var DB *gorm.DB

func Connect() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL não configurada no .env")
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Erro ao conectar no banco de dados: ", err)
	}

	// Garante que a extensão de UUID exista antes de migrar
	db.Exec(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`)

	if err := db.AutoMigrate(&models.User{}); err != nil {
		log.Fatal("Erro ao rodar as migrations: ", err)
	}

	DB = db
	log.Println("Conectado ao banco de dados e migrations aplicadas.")
}
