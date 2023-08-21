-- name: ListMessageSince :many
SELECT *
FROM messages
WHERE version > $1;


-- name: InsertMessage :exec
INSERT INTO messages ("key", "type", "data", "deleted", "version", "space_id")
VALUES ($1, $2, $3, $4, $5, $6)
ON CONFLICT ("key") DO UPDATE
    SET "type"     = $2,
        "data"     = $3,
        "deleted"  = $4,
        "version"  = $5,
        "space_id" = $6;


-- name: GetSpaceVersion :one
SELECT version
FROM spaces
WHERE id = $1 FOR UPDATE;

-- name: UpdateSpaceVersion :exec
UPDATE spaces
SET version = $1
WHERE id = $2;

-- name: CreateSpace :exec
INSERT INTO spaces (id, version)
VALUES ($1, $2);

-- name: GetLastMutationID :one
SELECT last_mutation_id
FROM replicache_clients
WHERE id = $1;

-- name: UpdateLastMutationID :execresult
UPDATE replicache_clients
SET last_mutation_id = $1
WHERE id = $2;

-- name: CreateClient :exec
INSERT INTO replicache_clients (id, last_mutation_id)
VALUES ($1, $2);