package replicache

import (
	"context"
	"encore.app/replicache/db"
	"encore.dev/rlog"
	"fmt"
)

func TxPull(ctx context.Context, pull *PullRequest) (*PullResponse, error) {
	tx, err := db.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	resp, err := ProcessPull(ctx, db.ReplicacheDb.WithTx(tx), pull)
	if err != nil {
		return nil, err
	}

	tx.Commit(ctx)
	return resp, nil
}

func ProcessPull(ctx context.Context, tx *db.Queries, pull *PullRequest) (*PullResponse, error) {
	version, err := tx.GetSpaceVersion(ctx, DEFAULT_SPACE_ID)
	if err != nil {
		return nil, err
	}

	var fromVersion int32 = 0
	isExistingClient := false
	if pull.Cookie != nil {
		fromVersion = *pull.Cookie
		isExistingClient = true
	}

	lastMutationID, err := GetLastMutationIDOrZero(ctx, tx, string(pull.ClientID), isExistingClient)
	if err != nil {
		fmt.Println("YAAAAAY")
		return nil, err
	}

	changed, err := tx.ListMessageSince(ctx, fromVersion)
	if err != nil {

		fmt.Println("XAAAAAY")
		return nil, err
	}

	patch := []PatchOperation{}
	for _, message := range changed {
		if message.Deleted {
			patch = append(patch, PatchOperation{
				Op: "del",
				//Key: "message/" + message.Key,
				Key: message.Key,
			})
		} else {
			patch = append(patch, PatchOperation{
				Op: "put",
				//Key: "message/" + message.Key,
				Key:   message.Key,
				Value: &message.Data,
			})
		}
	}

	rlog.Info("Successfully pulled", "cookie", version, "lastMutationID", lastMutationID, "patch", len(patch))
	return &PullResponse{
		LastMutationID: lastMutationID,
		Cookie:         version,
		Patch:          patch,
	}, nil
}
