package replicache

import (
	"context"
	"database/sql"
	"encore.app/replicache/db"
	"encore.dev/rlog"
	"errors"
	"fmt"
)

func TxPull(ctx context.Context, pull *PullRequest) (*PullResponse, error) {
	tx, err := db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	resp, err := ProcessPull(ctx, db.ReplicacheDb.WithTx(tx), pull)
	if err != nil {
		return nil, err
	}

	tx.Commit()
	return resp, nil
}

func ProcessPull(ctx context.Context, tx *db.Queries, pull *PullRequest) (*PullResponse, error) {
	version, err := tx.GetSpaceVersion(ctx, DEFAULT_SPACE_ID)
	if err != nil {
		return nil, err
	}
	isExistingClient := pull.Cookie > 0

	rlog.Info("Pull", "version", version, "isExistingClient", isExistingClient)
	lastMutationID, err := tx.GetLastMutationID(ctx, string(pull.ClientID))
	rlog.Error("foo", "foo2", fmt.Sprintf("lastMutationID: %T %v", err, err))
	rlog.Error("Pull1", "lastMutationID", lastMutationID, "err", err)
	switch {
	case errors.Is(err, sql.ErrNoRows) && !isExistingClient:
		lastMutationID = 0
	case err != nil:
		return nil, err
	}

	rlog.Info("Pull2", "lastMutationID", lastMutationID)
	changed, err := tx.ListMessageSince(ctx, lastMutationID)
	if err != nil {
		return nil, err
	}

	patch := []PatchOperation{}
	for i, message := range changed {
		if message.Deleted {
			patch = append(patch, PatchOperation{
				Op:  "del",
				Key: "message/" + message.Key,
			})
			continue
		}
		patch = append(patch, PatchOperation{
			Op:  "put",
			Key: "message/" + message.Key,
			Value: &Message{
				From:    "Magnus",
				Content: "some content",
				Order:   int32(i),
			},
		})
	}

	return &PullResponse{
		LastMutationID: lastMutationID,
		Cookie:         version,
		Patch:          patch,
	}, nil
}
