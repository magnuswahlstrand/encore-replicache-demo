package db

import (
	"database/sql"
	"encore.dev/storage/sqldb"
)

var DB = sqldb.NewDatabase("todo", sqldb.DatabaseConfig{
	Migrations: "./migrations",
})

var ReplicacheDb = New(DB.Stdlib())

func Begin() (*sql.Tx, error) {
	return DB.Stdlib().Begin()
}
