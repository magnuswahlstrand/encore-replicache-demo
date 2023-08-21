// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.20.0
// source: query.sql

package db

import (
	"context"
	"database/sql"
	"encoding/json"
)

const createClient = `-- name: CreateClient :exec
INSERT INTO replicache_clients (id, last_mutation_id)
VALUES ($1, $2)
`

type CreateClientParams struct {
	ID             string
	LastMutationID int32
}

func (q *Queries) CreateClient(ctx context.Context, arg CreateClientParams) error {
	_, err := q.db.ExecContext(ctx, createClient, arg.ID, arg.LastMutationID)
	return err
}

const createSpace = `-- name: CreateSpace :exec
INSERT INTO spaces (id, version)
VALUES ($1, $2)
`

type CreateSpaceParams struct {
	ID      string
	Version int32
}

func (q *Queries) CreateSpace(ctx context.Context, arg CreateSpaceParams) error {
	_, err := q.db.ExecContext(ctx, createSpace, arg.ID, arg.Version)
	return err
}

const getLastMutationID = `-- name: GetLastMutationID :one
SELECT last_mutation_id
FROM replicache_clients
WHERE id = $1
`

func (q *Queries) GetLastMutationID(ctx context.Context, id string) (int32, error) {
	row := q.db.QueryRowContext(ctx, getLastMutationID, id)
	var last_mutation_id int32
	err := row.Scan(&last_mutation_id)
	return last_mutation_id, err
}

const getSpaceVersion = `-- name: GetSpaceVersion :one
SELECT version
FROM spaces
WHERE id = $1 FOR UPDATE
`

func (q *Queries) GetSpaceVersion(ctx context.Context, id string) (int32, error) {
	row := q.db.QueryRowContext(ctx, getSpaceVersion, id)
	var version int32
	err := row.Scan(&version)
	return version, err
}

const insertMessage = `-- name: InsertMessage :exec
INSERT INTO messages ("key", "type", "data", "deleted", "version", "space_id")
VALUES ($1, $2, $3, $4, $5, $6)
ON CONFLICT ("key") DO UPDATE
    SET "type"     = $2,
        "data"     = $3,
        "deleted"  = $4,
        "version"  = $5,
        "space_id" = $6
`

type InsertMessageParams struct {
	Key     string
	Type    string
	Data    json.RawMessage
	Deleted bool
	Version int32
	SpaceID string
}

func (q *Queries) InsertMessage(ctx context.Context, arg InsertMessageParams) error {
	_, err := q.db.ExecContext(ctx, insertMessage,
		arg.Key,
		arg.Type,
		arg.Data,
		arg.Deleted,
		arg.Version,
		arg.SpaceID,
	)
	return err
}

const listMessageSince = `-- name: ListMessageSince :many
SELECT key, type, data, deleted, version, space_id
FROM messages
WHERE version > $1
`

func (q *Queries) ListMessageSince(ctx context.Context, version int32) ([]Message, error) {
	rows, err := q.db.QueryContext(ctx, listMessageSince, version)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Message
	for rows.Next() {
		var i Message
		if err := rows.Scan(
			&i.Key,
			&i.Type,
			&i.Data,
			&i.Deleted,
			&i.Version,
			&i.SpaceID,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const updateLastMutationID = `-- name: UpdateLastMutationID :execresult
UPDATE replicache_clients
SET last_mutation_id = $1
WHERE id = $2
`

type UpdateLastMutationIDParams struct {
	LastMutationID int32
	ID             string
}

func (q *Queries) UpdateLastMutationID(ctx context.Context, arg UpdateLastMutationIDParams) (sql.Result, error) {
	return q.db.ExecContext(ctx, updateLastMutationID, arg.LastMutationID, arg.ID)
}

const updateSpaceVersion = `-- name: UpdateSpaceVersion :exec
UPDATE spaces
SET version = $1
WHERE id = $2
`

type UpdateSpaceVersionParams struct {
	Version int32
	ID      string
}

func (q *Queries) UpdateSpaceVersion(ctx context.Context, arg UpdateSpaceVersionParams) error {
	_, err := q.db.ExecContext(ctx, updateSpaceVersion, arg.Version, arg.ID)
	return err
}
