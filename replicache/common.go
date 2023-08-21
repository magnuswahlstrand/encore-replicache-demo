package replicache

import (
	"context"
	"database/sql"
	"encore.app/replicache/db"
	"errors"
)

func GetLastMutationIDOrZero(ctx context.Context, tx *db.Queries, clientID string, required bool) (int32, error) {
	lastMutationID, err := tx.GetLastMutationID(ctx, clientID)
	switch {
	case errors.Is(err, sql.ErrNoRows) && !required:
		return 0, nil
	case err != nil:
		return 0, err
	}
	return lastMutationID, nil
}
