package db

import (
	"context"
	"encore.dev/storage/sqldb"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// TODO: Rename from "todo" to "replicache"
var DB = sqldb.NewDatabase("todo", sqldb.DatabaseConfig{
	Migrations: "./migrations",
})

var foo = sqldb.Driver[*pgxpool.Pool](DB)
var ReplicacheDb = New(foo)

func Begin(ctx context.Context) (pgx.Tx, error) {
	return foo.Begin(ctx)
}
