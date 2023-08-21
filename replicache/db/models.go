// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.20.0

package db

import (
	"encore.app/types"
)

type Message struct {
	Key     string
	Type    string
	Data    types.Message
	Deleted bool
	Version int32
	SpaceID string
}

type ReplicacheClient struct {
	ID             string
	LastMutationID int32
}

type Space struct {
	ID      string
	Version int32
}
